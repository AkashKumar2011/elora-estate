// Single choke point for "send this OTP to this mobile number." Swapping in
// a real SMS/WhatsApp OTP vendor later means changing only this file — no
// controller changes required.
//
// SMS_PROVIDER / SMS_API_KEY are read here (not in the controller) so the
// vendor integration stays isolated. Until a vendor is configured,
// OTP_DEV_BYPASS logs the code to the server console so development and
// testing aren't blocked on a paid SMS account.

async function sendOtp(mobile, code) {
  const devBypass = process.env.OTP_DEV_BYPASS === 'true';
  const provider = process.env.SMS_PROVIDER;

  if (!provider || devBypass) {
    // eslint-disable-next-line no-console
    console.log(`[otp:dev-bypass] OTP for ${mobile} is ${code} (expires in ${process.env.OTP_EXPIRES_MINUTES || 5}m)`);
    return { delivered: false, mode: 'dev_console' };
  }

  // NOTE: real provider integration (MSG91 / Twilio Verify / WhatsApp OTP)
  // is a technical-implementation decision explicitly deferred by the spec.
  // Wire it up here once a vendor + credentials are chosen:
  //
  //   if (provider === 'msg91') { ... }
  //
  throw new Error(
    `SMS_PROVIDER=${provider} is set but not yet implemented in otpDeliveryService. ` +
      `Set OTP_DEV_BYPASS=true for development, or implement the ${provider} integration.`
  );
}

module.exports = { sendOtp };
