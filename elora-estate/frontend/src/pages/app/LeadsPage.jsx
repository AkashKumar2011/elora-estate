import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as leadsApi from '../../api/leads';
import { LEAD_STAGE_LABEL } from '../../utils/constants';

const STAGE_ORDER = Object.keys(LEAD_STAGE_LABEL);

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    leadsApi.listMyLeads().then(({ data }) => setLeads(data.leads)).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 text-harbor">Loading…</div>;

  // Fixed V1 pipeline — not configurable, so a simple grouped list (not a
  // drag-and-drop kanban nobody asked for) is the right amount of build.
  const activeLeads = leads.filter((l) => !l.outcome);
  const exitedLeads = leads.filter((l) => l.outcome);
  const byStage = STAGE_ORDER.map((stage) => ({
    stage,
    label: LEAD_STAGE_LABEL[stage],
    leads: activeLeads.filter((l) => l.stage === stage),
  })).filter((g) => g.leads.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-2xl mb-6">Leads</h1>

      {leads.length === 0 ? (
        <p className="text-harbor">No leads yet — add a client or capture a requirement to get started.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {byStage.map((group) => (
            <section key={group.stage}>
              <h2 className="font-display text-lg mb-3">
                {group.label} <span className="text-harbor text-sm font-normal">({group.leads.length})</span>
              </h2>
              <div className="border border-harbor-200 bg-chalk divide-y divide-harbor-200">
                {group.leads.map((lead) => (
                  <Link
                    key={lead._id}
                    to={`/clients/${lead.client?._id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-seafog"
                  >
                    <div>
                      <p className="font-medium">{lead.client?.name}</p>
                      <p className="text-harbor text-xs font-mono">{lead.client?.mobile}</p>
                    </div>
                    {lead.nextActionNote && <p className="text-harbor text-xs text-right max-w-[40%]">{lead.nextActionNote}</p>}
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {exitedLeads.length > 0 && (
            <section>
              <h2 className="font-display text-lg mb-3 text-harbor">
                Not moving forward <span className="text-sm font-normal">({exitedLeads.length})</span>
              </h2>
              <div className="border border-harbor-200 bg-chalk divide-y divide-harbor-200 opacity-70">
                {exitedLeads.map((lead) => (
                  <Link key={lead._id} to={`/clients/${lead.client?._id}`} className="flex items-center justify-between px-4 py-3 hover:bg-seafog">
                    <span>{lead.client?.name}</span>
                    <span className="text-xs capitalize text-harbor">{lead.outcome.replace('_', ' ')}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
