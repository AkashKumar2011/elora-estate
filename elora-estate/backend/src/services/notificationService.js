// Single choke point for outbound visit notifications to Client / Broker /
// Owner-Caretaker / Admin. Spec: WhatsApp delivery is REQUIRED for V1 visit
// notifications, but "WhatsApp must not be the only source of truth" — so
// every notification is first recorded as an in-app Notification-equivalent
// via ActivityLog (queryable, persists regardless of delivery success),
// and WhatsApp delivery is attempted on top of that, not instead of it.
//
// Provider: Meta's WhatsApp Cloud API (https://developers.facebook.com/docs/whatsapp/cloud-api).
// Chosen over Twilio/Gupshup because it's the direct, portable option — no
// reseller markup, works with any number provisioned in Meta Business
// Manager, and Twilio/Gupshup are themselves thin wrappers around the same
// underlying WhatsApp Business Platform. Swapping providers later only
// means rewriting sendWhatsAppMessage(); nothing else in the codebase
// calls WhatsApp directly.
//
// REQUIRES, before this can send real messages:
//   1. A Meta Business Manager account with WhatsApp Business Platform set up
//   2. A phone number registered there (WHATSAPP_PHONE_NUMBER_ID)
//   3. A permanent access token (WHATSAPP_API_KEY) — System User token,
//      not a 24h temporary token
//   4. Message templates PRE-APPROVED in Meta Business Manager for each
//      event below (Cloud API requires an approved template for any
//      business-initiated message outside a 24h customer-service window,
//      which every visit notification is). TEMPLATE_MAP's `name` values
//      MUST exactly match your approved template names, and each
//      template's body placeholders ({{1}}, {{2}}...) must be created in
//      the same order as `params` builds them below.
// Until WHATSAPP_PROVIDER=meta_cloud_api is set, this logs to the console
// so the visit workflow is fully testable without a paid WhatsApp account.

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v20.0';
const TEMPLATE_LANGUAGE = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en';

// event key -> { name: <approved template name>, params: (data) => [ordered string params] }
// Edit `name` to match whatever you actually get approved — these are
// reasonable defaults, not fixed requirements.
const TEMPLATE_MAP = {
  visit_scheduled_client: {
    name: 'elora_visit_scheduled_client',
    params: (d) => [d.propertyTitle || d.locationArea, formatWhen(d.scheduledAt), d.brokerName, d.brokerMobile],
  },
  visit_rescheduled_client: {
    name: 'elora_visit_rescheduled_client',
    params: (d) => [d.propertyTitle || d.locationArea, formatWhen(d.scheduledAt)],
  },
  visit_cancelled_client: {
    name: 'elora_visit_cancelled_client',
    params: (d) => [d.propertyTitle || d.locationArea, formatWhen(d.scheduledAt)],
  },
  visit_scheduled_broker: {
    name: 'elora_visit_scheduled_broker',
    params: (d) => [d.clientName, d.clientMobile, d.propertyTitle, formatWhen(d.scheduledAt)],
  },
  visit_rescheduled_broker: {
    name: 'elora_visit_rescheduled_broker',
    params: (d) => [d.clientName, d.propertyTitle, formatWhen(d.scheduledAt)],
  },
  visit_cancelled_broker: {
    name: 'elora_visit_cancelled_broker',
    params: (d) => [d.clientName, d.propertyTitle, formatWhen(d.scheduledAt)],
  },
  visit_scheduled_owner: {
    name: 'elora_visit_scheduled_owner',
    params: (d) => [d.propertyTitle || d.buildingName, formatWhen(d.scheduledAt), d.brokerName, d.brokerMobile],
  },
  visit_rescheduled_owner: {
    name: 'elora_visit_rescheduled_owner',
    params: (d) => [d.propertyTitle || d.buildingName, formatWhen(d.scheduledAt)],
  },
  visit_cancelled_owner: {
    name: 'elora_visit_cancelled_owner',
    params: (d) => [d.propertyTitle || d.buildingName, formatWhen(d.scheduledAt)],
  },
};

function formatWhen(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
}

function toE164India(mobile) {
  // Stored mobile numbers are plain 10-digit India numbers throughout the
  // app (see MOBILE_RE in authController) — the Cloud API needs the full
  // country-code-prefixed number with no leading '+'.
  const digits = String(mobile).replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}

async function sendWhatsAppMessage(mobile, templateKey, data) {
  const provider = process.env.WHATSAPP_PROVIDER;

  if (!provider) {
    // eslint-disable-next-line no-console
    console.log(`[whatsapp:dev-bypass] to=${mobile} template=${templateKey}`, data);
    return { delivered: false, mode: 'dev_console' };
  }

  if (provider !== 'meta_cloud_api') {
    throw new Error(`WHATSAPP_PROVIDER=${provider} is not implemented. Only "meta_cloud_api" is wired up — see notificationService.js.`);
  }

  const template = TEMPLATE_MAP[templateKey];
  if (!template) {
    // eslint-disable-next-line no-console
    console.error(`[whatsapp] no template mapped for "${templateKey}" — message not sent`);
    return { delivered: false, mode: 'not_configured' };
  }

  const apiKey = process.env.WHATSAPP_API_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!apiKey || !phoneNumberId) {
    throw new Error('WHATSAPP_API_KEY and WHATSAPP_PHONE_NUMBER_ID must be set when WHATSAPP_PROVIDER=meta_cloud_api');
  }

  const params = template.params(data).map((p) => String(p ?? ''));

  const body = {
    messaging_product: 'whatsapp',
    to: toE164India(mobile),
    type: 'template',
    template: {
      name: template.name,
      language: { code: TEMPLATE_LANGUAGE },
      components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }],
    },
  };

  try {
    const response = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(`[whatsapp] send failed for ${templateKey} to ${mobile}:`, result?.error?.message || result);
      return { delivered: false, mode: 'provider_error' };
    }

    return { delivered: true, mode: 'provider', messageId: result?.messages?.[0]?.id };
  } catch (err) {
    // Network/provider failure must never break the underlying business
    // action (visit is still scheduled) — the caller already records the
    // in-app notification independent of this outcome.
    // eslint-disable-next-line no-console
    console.error(`[whatsapp] request error for ${templateKey} to ${mobile}:`, err.message);
    return { delivered: false, mode: 'request_error' };
  }
}

// Notifies all four parties for a visit event (scheduled / rescheduled /
// cancelled / reminder). Each recipient gets only the fields relevant to
// them, per spec section 26. Failures for one recipient never block the
// others — a visit is still valid even if one WhatsApp send fails.
async function notifyVisitEvent(eventType, { visit, property, client, broker, ownerCaretaker }) {
  const jobs = [];

  if (client?.mobile) {
    jobs.push(
      sendWhatsAppMessage(client.mobile, `visit_${eventType}_client`, {
        propertyTitle: property?.public?.title,
        locationArea: property?.public?.locationArea,
        scheduledAt: visit.scheduledAt,
        brokerName: broker?.name,
        brokerMobile: broker?.mobile,
      })
    );
  }
  if (broker?.mobile) {
    jobs.push(
      sendWhatsAppMessage(broker.mobile, `visit_${eventType}_broker`, {
        clientName: client?.name,
        clientMobile: client?.mobile,
        propertyTitle: property?.public?.title,
        scheduledAt: visit.scheduledAt,
      })
    );
  }
  if (ownerCaretaker?.mobile) {
    jobs.push(
      sendWhatsAppMessage(ownerCaretaker.mobile, `visit_${eventType}_owner`, {
        propertyTitle: property?.public?.title,
        buildingName: property?.public?.buildingName,
        scheduledAt: visit.scheduledAt,
        brokerName: broker?.name,
        brokerMobile: broker?.mobile,
      })
    );
  }
  // Admin: in-app visibility only (ActivityLog), no WhatsApp per spec —
  // Admin just needs system-wide visibility of the visit, not a message.

  const results = await Promise.allSettled(jobs);
  return results;
}

module.exports = { notifyVisitEvent };
