import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as followUpsApi from '../../api/followUps';
import Button from '../../components/Button';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function FollowUpRow({ f, onComplete, onSnooze }) {
  const [snoozing, setSnoozing] = useState(false);
  const [newDate, setNewDate] = useState('');

  return (
    <div className="border border-harbor-200 bg-chalk p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/clients/${f.client?._id}`} className="font-medium hover:underline">
            {f.client?.name}
          </Link>
          <p className="text-harbor text-sm mt-0.5">{f.note}</p>
          <p className="text-harbor text-xs font-mono mt-1">Due {formatDateTime(f.dueAt)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={`tel:${f.client?.mobile}`}><Button size="sm" variant="ghost">Call</Button></a>
          <Button size="sm" onClick={() => onComplete(f._id)}>Done</Button>
          <Button size="sm" variant="outline" onClick={() => setSnoozing((s) => !s)}>Snooze</Button>
        </div>
      </div>
      {snoozing && (
        <div className="flex items-center gap-2 pt-2 border-t border-harbor-200">
          <input
            type="datetime-local"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="border border-harbor-200 rounded-sm px-2 py-1 text-sm"
          />
          <Button
            size="sm"
            onClick={() => {
              if (!newDate) return;
              onSnooze(f._id, new Date(newDate).toISOString());
              setSnoozing(false);
            }}
          >
            Confirm new date
          </Button>
        </div>
      )}
    </div>
  );
}

function Bucket({ title, items, onComplete, onSnooze, emptyText }) {
  return (
    <section>
      <h2 className="font-display text-lg mb-3">{title} <span className="text-harbor text-sm font-normal">({items.length})</span></h2>
      {items.length === 0 ? (
        <p className="text-harbor text-sm">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((f) => (
            <FollowUpRow key={f._id} f={f} onComplete={onComplete} onSnooze={onSnooze} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function FollowUpsPage() {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const { data } = await followUpsApi.getFollowUpBuckets();
    setData(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = async (id) => {
    await followUpsApi.completeFollowUp(id);
    load();
  };
  const handleSnooze = async (id, dueAt) => {
    await followUpsApi.snoozeFollowUp(id, dueAt);
    load();
  };

  if (!data) return <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 text-harbor">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
      <h1 className="font-display text-2xl">Follow-ups</h1>

      {data.overdue?.length > 0 && (
        <div className="border-l-2 border-laterite pl-4">
          <Bucket title="Overdue" items={data.overdue} onComplete={handleComplete} onSnooze={handleSnooze} emptyText="Nothing overdue." />
        </div>
      )}
      <Bucket title="Today" items={data.today || []} onComplete={handleComplete} onSnooze={handleSnooze} emptyText="Nothing due today." />
      <Bucket title="Upcoming" items={data.upcoming || []} onComplete={handleComplete} onSnooze={handleSnooze} emptyText="Nothing upcoming yet." />

      {data.priority?.length > 0 && (
        <section>
          <h2 className="font-display text-lg mb-3">Priority clients</h2>
          <div className="flex flex-wrap gap-2">
            {data.priority.map((f) => (
              <Link
                key={f._id}
                to={`/clients/${f.client?._id}`}
                className="px-4 py-1.5 text-sm rounded-full font-medium border border-laterite text-laterite-700 hover:bg-laterite hover:text-chalk transition-colors"
              >
                {f.client?.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
