import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as clientsApi from '../../api/clients';
import { LEAD_STAGE_LABEL } from '../../utils/constants';
import Button from '../../components/Button';
import Chip from '../../components/Chip';

const LEAD_SOURCES = [
  { value: 'referral', label: 'Referral' },
  { value: 'call', label: 'Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'portal', label: 'Portal' },
  { value: 'other', label: 'Other' },
];

function AddClientForm({ onCreated }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [source, setSource] = useState('call');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await clientsApi.createClient({ name, mobile, source });
      onCreated();
      navigate(`/clients/${data.client._id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not add client');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <Button size="sm" onClick={() => setIsOpen(true)}>
        + Add client
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="border border-harbor-200 bg-chalk p-4 mb-5 flex flex-col gap-3 max-w-sm">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Client name"
        className="border border-harbor-200 rounded-sm px-3 py-2 text-sm"
      />
      <input
        required
        value={mobile}
        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
        inputMode="numeric"
        placeholder="10-digit mobile number"
        className="border border-harbor-200 rounded-sm px-3 py-2 text-sm font-mono"
      />
      <div>
        <p className="text-xs text-harbor mb-1.5">How did this lead come in?</p>
        <div className="flex flex-wrap gap-1.5">
          {LEAD_SOURCES.map((s) => (
            <Chip key={s.value} size="sm" selected={source === s.value} onClick={() => setSource(s.value)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-laterite-700">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" type="submit" disabled={saving || mobile.length !== 10}>
          {saving ? 'Adding…' : 'Add client'}
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await clientsApi.listClients(search ? { search } : {});
      setClients(data.clients);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250); // light debounce on search typing
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl">Clients</h1>
        <AddClientForm onCreated={load} />
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or mobile…"
        className="w-full max-w-sm border border-harbor-200 rounded-sm px-3 py-2 mb-5"
      />

      {isLoading ? (
        <p className="text-harbor">Loading…</p>
      ) : clients.length === 0 ? (
        <p className="text-harbor">No clients yet — they'll appear here once someone logs in or a broker adds a requirement for them.</p>
      ) : (
        <div className="border border-harbor-200 bg-chalk divide-y divide-harbor-200">
          {clients.map((c) => (
            <Link key={c._id} to={`/clients/${c._id}`} className="flex items-center justify-between px-4 py-3 hover:bg-seafog">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-harbor text-xs font-mono">{c.mobile}</p>
              </div>
              {c.leadStage && (
                <span className="text-xs px-2 py-1 rounded-full border border-harbor-200">
                  {LEAD_STAGE_LABEL[c.leadStage] || c.leadStage}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
