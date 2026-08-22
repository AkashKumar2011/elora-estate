import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as clientsApi from '../../api/clients';
import * as leadsApi from '../../api/leads';
import * as lineupsApi from '../../api/lineups';
import * as notesApi from '../../api/notes';
import * as activityApi from '../../api/activity';
import * as propertiesApi from '../../api/properties';
import * as adminUsersApi from '../../api/adminUsers';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import StatCard from '../../components/StatCard';
import { LEAD_STAGE_LABEL, LINEUP_ITEM_STATUSES, NOTE_TAGS, DEAL_STATUSES } from '../../utils/constants';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function SectionCard({ title, children, action }) {
  return (
    <section className="border border-harbor-200 bg-chalk p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function ClientDetailPage() {
  const { clientId } = useParams();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [notes, setNotes] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    const { data } = await clientsApi.getClientCrmSummary(clientId);
    setSummary(data);
  }, [clientId]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      loadSummary(),
      notesApi.listClientNotes(clientId).then(({ data }) => setNotes(data.notes)),
      activityApi.getClientTimeline(clientId).then(({ data }) => setTimeline(data.events)),
      propertiesApi.listInternalProperties({ status: 'published', limit: 100 }).then(({ data }) => setAvailableProperties(data.properties)),
    ]).finally(() => setIsLoading(false));
    if (user.role === 'admin') {
      adminUsersApi.listInternalUsers({ role: 'broker', status: 'active' }).then(({ data }) => setBrokers(data.users));
    }
  }, [clientId, loadSummary, user.role]);

  if (isLoading || !summary) return <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 text-harbor">Loading client…</div>;

  const { client, lead, requirement, lineup, shortlist, visits, pendingFollowUps } = summary;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl">{client.name}</h1>
          <p className="text-harbor text-sm font-mono">{client.mobile}</p>
        </div>
        <div className="flex items-center gap-2">
          {lead?.stage && (
            <span className="text-xs px-3 py-1.5 rounded-full border border-harbor-200 capitalize">
              {LEAD_STAGE_LABEL[lead.stage] || lead.stage}
            </span>
          )}
          <a href={`tel:${client.mobile}`}><Button size="sm">Call</Button></a>
          <a href={`https://wa.me/91${client.mobile}`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline">WhatsApp</Button></a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Shortlisted" value={shortlist.length} />
        <StatCard label="Upcoming visits" value={visits.upcoming.length} />
        <StatCard label="Pending follow-ups" value={pendingFollowUps.length} />
      </div>

      <NextActionSection clientId={clientId} lead={lead} onSaved={loadSummary} />

      {user.role === 'admin' && (
        <SectionCard title="Reassign broker">
          <select
            value={lead?.assignedBroker?._id || lead?.assignedBroker || ''}
            onChange={async (e) => {
              if (!e.target.value) return;
              await leadsApi.reassignLead(clientId, e.target.value);
              loadSummary();
            }}
            className="border border-harbor-200 rounded-sm px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {brokers.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </SectionCard>
      )}

      {requirement && (
        <SectionCard title="Requirement">
          <div className="flex flex-wrap gap-1.5 text-sm text-harbor">
            <span>{requirement.locationAreas?.join(', ')}</span>
            <span>·</span>
            <span>₹{requirement.budgetMin || 0}–₹{requirement.budgetMax}</span>
            {requirement.propertyType && <><span>·</span><span className="capitalize">{requirement.propertyType.replace('_', ' ')}</span></>}
          </div>
        </SectionCard>
      )}

      <LineupSection
        clientId={clientId}
        lineup={lineup}
        availableProperties={availableProperties}
        onChange={loadSummary}
      />

      <SectionCard title="Upcoming visits">
        {visits.upcoming.length === 0 ? (
          <p className="text-harbor text-sm">No upcoming visits.</p>
        ) : (
          <ul className="text-sm flex flex-col gap-2">
            {visits.upcoming.map((v) => (
              <li key={v._id} className="flex justify-between">
                <span>{v.property?.title || v.property?.locationArea}</span>
                <span className="font-mono text-harbor">{formatDateTime(v.scheduledAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <OutcomeDealSection clientId={clientId} lead={lead} onSaved={loadSummary} />

      <NotesSection clientId={clientId} notes={notes} onAdded={(n) => setNotes((prev) => [n, ...prev])} />

      <SectionCard title="Activity timeline">
        {timeline.length === 0 ? (
          <p className="text-harbor text-sm">No activity recorded yet.</p>
        ) : (
          <ul className="text-sm flex flex-col gap-2 max-h-96 overflow-y-auto">
            {timeline.map((e) => (
              <li key={e._id} className="flex justify-between gap-3 border-b border-harbor-200 pb-2 last:border-b-0">
                <span>{e.action.replace(/[._]/g, ' ')}{e.actor ? ` — ${e.actor.name}` : ''}</span>
                <span className="font-mono text-harbor text-xs whitespace-nowrap">{formatDateTime(e.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function NextActionSection({ clientId, lead, onSaved }) {
  const [note, setNote] = useState(lead?.nextActionNote || '');
  const [dueAt, setDueAt] = useState(lead?.nextActionDueAt ? lead.nextActionDueAt.slice(0, 16) : '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await leadsApi.setNextAction(clientId, { note, dueAt: dueAt ? new Date(dueAt).toISOString() : undefined });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="What should I do next?">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Call about the Worli 2BHK"
          className="flex-1 border border-harbor-200 rounded-sm px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="border border-harbor-200 rounded-sm px-3 py-2 text-sm"
        />
        <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </SectionCard>
  );
}

function LineupSection({ clientId, lineup, availableProperties, onChange }) {
  const [selectedProperty, setSelectedProperty] = useState('');

  const items = lineup?.items || [];
  const inLineupIds = new Set(items.map((i) => (i.property?._id || i.property)));
  const options = availableProperties.filter((p) => !inLineupIds.has(p._id));

  const addProperty = async () => {
    if (!selectedProperty) return;
    await lineupsApi.addPropertyToLineup(clientId, selectedProperty);
    setSelectedProperty('');
    onChange();
  };

  return (
    <SectionCard
      title={`Lineup (${items.length}/10)`}
      action={
        items.length < 10 && (
          <div className="flex gap-2">
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="border border-harbor-200 rounded-sm px-2 py-1 text-xs max-w-[200px]"
            >
              <option value="">Add property…</option>
              {options.map((p) => (
                <option key={p._id} value={p._id}>{p.public?.title || p.public?.locationArea}</option>
              ))}
            </select>
            <Button size="sm" onClick={addProperty}>Add</Button>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <p className="text-harbor text-sm">No properties in the lineup yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item._id} className="border border-harbor-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{item.property?.public?.title || item.property?.public?.locationArea}</span>
                <button
                  onClick={async () => { await lineupsApi.removePropertyFromLineup(clientId, item._id); onChange(); }}
                  className="text-xs text-harbor hover:text-laterite-700 underline"
                >
                  Remove
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {LINEUP_ITEM_STATUSES.map((s) => (
                  <Chip
                    key={s}
                    size="sm"
                    selected={item.status === s}
                    onClick={async () => { await lineupsApi.updateLineupItemStatus(clientId, item._id, s); onChange(); }}
                  >
                    {s.replace('_', ' ')}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function OutcomeDealSection({ clientId, lead, onSaved }) {
  const [deal, setDeal] = useState({
    status: lead?.deal?.status || 'none',
    dealValue: lead?.deal?.dealValue || '',
    commissionType: lead?.deal?.commissionType || '',
    commissionValue: lead?.deal?.commissionValue || '',
  });
  const [saving, setSaving] = useState(false);

  const saveDeal = async () => {
    setSaving(true);
    try {
      await leadsApi.recordDeal(clientId, {
        status: deal.status,
        dealValue: deal.dealValue ? Number(deal.dealValue) : undefined,
        commissionType: deal.commissionType || undefined,
        commissionValue: deal.commissionValue ? Number(deal.commissionValue) : undefined,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Deal & outcome">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium mb-2">Outcome (if this lead exited the pipeline)</p>
          <div className="flex gap-2">
            {['not_interested', 'rejected', 'lost'].map((o) => (
              <Chip key={o} size="sm" selected={lead?.outcome === o} onClick={() => leadsApi.setOutcome(clientId, o).then(onSaved)}>
                {o.replace('_', ' ')}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-harbor block mb-1">Deal status</label>
            <select
              value={deal.status}
              onChange={(e) => setDeal((d) => ({ ...d, status: e.target.value }))}
              className="w-full border border-harbor-200 rounded-sm px-3 py-2 text-sm"
            >
              {DEAL_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-harbor block mb-1">Deal value (₹)</label>
            <input
              type="number"
              value={deal.dealValue}
              onChange={(e) => setDeal((d) => ({ ...d, dealValue: e.target.value }))}
              className="w-full border border-harbor-200 rounded-sm px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-harbor block mb-1">Commission type</label>
            <select
              value={deal.commissionType}
              onChange={(e) => setDeal((d) => ({ ...d, commissionType: e.target.value }))}
              className="w-full border border-harbor-200 rounded-sm px-3 py-2 text-sm"
            >
              <option value="">Not set</option>
              <option value="percentage">Percentage</option>
              <option value="flat">Flat amount</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-harbor block mb-1">Commission value</label>
            <input
              type="number"
              value={deal.commissionValue}
              onChange={(e) => setDeal((d) => ({ ...d, commissionValue: e.target.value }))}
              className="w-full border border-harbor-200 rounded-sm px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>
        <Button size="sm" onClick={saveDeal} disabled={saving} className="self-start">
          {saving ? 'Saving…' : 'Save deal info'}
        </Button>
      </div>
    </SectionCard>
  );
}

function NotesSection({ clientId, notes, onAdded }) {
  const [text, setText] = useState('');
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag) => setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const { data } = await notesApi.createNote({ client: clientId, text, tags });
      onAdded(data.note);
      setText('');
      setTags([]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Notes">
      <div className="flex flex-col gap-2 mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What was discussed?"
          rows={2}
          className="border border-harbor-200 rounded-sm px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-1.5">
          {NOTE_TAGS.map((t) => (
            <Chip key={t} size="sm" selected={tags.includes(t)} onClick={() => toggleTag(t)}>
              {t.replace('_', ' ')}
            </Chip>
          ))}
        </div>
        <Button size="sm" onClick={submit} disabled={saving} className="self-start">
          {saving ? 'Adding…' : 'Add note'}
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="text-harbor text-sm">No notes yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((n) => (
            <li key={n._id} className="border-t border-harbor-200 pt-3 first:border-t-0 first:pt-0">
              <p className="text-sm">{n.text}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-harbor">
                <span>{n.author?.name}</span>
                <span>·</span>
                <span>{formatDateTime(n.createdAt)}</span>
                {n.tags?.map((t) => <span key={t} className="px-1.5 py-0.5 border border-harbor-200 rounded-full">{t.replace('_', ' ')}</span>)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
