import { useEffect, useState } from 'react';
import * as reportsApi from '../../api/reports';
import StatCard from '../../components/StatCard';
import { LEAD_STAGE_LABEL } from '../../utils/constants';

function formatCurrency(n) {
  return `₹${new Intl.NumberFormat('en-IN').format(Math.round(n || 0))}`;
}

export default function AdminReportsPage() {
  const [summary, setSummary] = useState(null);
  const [brokerReport, setBrokerReport] = useState(null);

  useEffect(() => {
    reportsApi.getBusinessSummaryReport().then(({ data }) => setSummary(data));
    reportsApi.getBrokerPerformanceReport().then(({ data }) => setBrokerReport(data));
  }, []);

  if (!summary || !brokerReport) return <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 text-harbor">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-10">
      <div>
        <h1 className="font-display text-2xl mb-6">Reports</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Clients" value={summary.totals.clients} />
          <StatCard label="Brokers" value={summary.totals.brokers} />
          <StatCard label="Owners/Caretakers" value={summary.totals.ownersCaretakers} />
          <StatCard label="Published properties" value={summary.totals.publishedProperties} />
          <StatCard label="Total properties" value={summary.totals.properties} />
          <StatCard label="Deals closed" value={summary.dealsClosed} />
        </div>
      </div>

      <section>
        <h2 className="font-display text-lg mb-3">Pipeline distribution</h2>
        <div className="border border-harbor-200 bg-chalk divide-y divide-harbor-200">
          {Object.entries(summary.leadsByStage)
            .filter(([, count]) => count > 0)
            .map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between px-4 py-2 text-sm">
                <span>{LEAD_STAGE_LABEL[stage] || stage}</span>
                <span className="font-mono text-harbor">{count}</span>
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg mb-3">Broker performance</h2>
        <div className="border border-harbor-200 bg-chalk overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-harbor border-b border-harbor-200">
                <th className="px-4 py-2 font-medium">Broker</th>
                <th className="px-4 py-2 font-medium">Active leads</th>
                <th className="px-4 py-2 font-medium">Visits completed</th>
                <th className="px-4 py-2 font-medium">Deals closed</th>
                <th className="px-4 py-2 font-medium">Commission</th>
              </tr>
            </thead>
            <tbody>
              {brokerReport.brokers.map((row) => (
                <tr key={row.broker.id} className="border-b border-harbor-200 last:border-b-0">
                  <td className="px-4 py-2">{row.broker.name}</td>
                  <td className="px-4 py-2 font-mono">{row.totalLeads}</td>
                  <td className="px-4 py-2 font-mono">{row.visitsCompleted}</td>
                  <td className="px-4 py-2 font-mono">{row.dealsClosed}</td>
                  <td className="px-4 py-2 font-mono">{formatCurrency(row.totalCommission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
