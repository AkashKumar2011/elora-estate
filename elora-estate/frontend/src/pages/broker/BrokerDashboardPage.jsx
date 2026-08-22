import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Users, 
  Building2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Phone, 
  MapPin, 
  ArrowUpRight,
  Filter,
  Loader2
} from 'lucide-react';
import { getBrokerOverview, updateVisitStatus, getBrokerLeads } from '../../api/brokerApi';

export default function BrokerDashboardPage() {
  const [overviewData, setOverviewData] = useState({ visits: [], leads: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('visits'); // 'visits' | 'leads'

  useEffect(() => {
    async function loadBrokerData() {
      try {
        setLoading(true);
        const res = await getBrokerOverview();
        const payload = res?.data || res || {};
        setOverviewData({
          visits: payload.assignedVisits || payload.visits || [],
          leads: payload.assignedLeads || payload.leads || [],
          stats: payload.stats || {},
        });
      } catch (err) {
        console.error('Failed to load broker workspace:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBrokerData();
  }, []);

  const handleStatusChange = async (visitId, newStatus) => {
    try {
      setActionLoading(visitId);
      await updateVisitStatus(visitId, { status: newStatus });
      setOverviewData((prev) => ({
        ...prev,
        visits: prev.visits.map((v) =>
          (v._id === visitId || v.id === visitId) ? { ...v, status: newStatus } : v
        ),
      }));
    } catch (err) {
      alert(err?.response?.data?.message || 'Status transition failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-amber-700 font-semibold">
            Broker Operations Hub
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Visit Queue & Client Leads
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('visits')}
            className={`px-3.5 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'visits'
                ? 'bg-slate-950 text-amber-400 shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Scheduled Visits ({overviewData.visits.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3.5 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'leads'
                ? 'bg-slate-950 text-amber-400 shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Direct Leads ({overviewData.leads.length})
          </button>
        </div>
      </div>

      {/* KPI Ticker Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
          <span className="text-xs font-mono text-slate-500 uppercase">Pending Verification</span>
          <div className="text-2xl font-bold font-mono text-amber-800 mt-1">
            {overviewData.visits.filter((v) => v.status === 'requested' || v.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
          <span className="text-xs font-mono text-slate-500 uppercase">Confirmed Appointments</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
            {overviewData.visits.filter((v) => v.status === 'confirmed').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
          <span className="text-xs font-mono text-slate-500 uppercase">Active Inquiries</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {overviewData.leads.length}
          </div>
        </div>
      </div>

      {/* Main Workspace Queue */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-white rounded border border-slate-200" />
          ))}
        </div>
      ) : activeTab === 'visits' ? (
        <div className="space-y-3">
          {overviewData.visits.length > 0 ? (
            overviewData.visits.map((visit) => {
              const vId = visit._id || visit.id;
              const isActioning = actionLoading === vId;
              return (
                <div
                  key={vId}
                  className="bg-white p-4 rounded border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-amber-400 text-[11px] font-mono px-2 py-0.5 rounded font-semibold uppercase">
                        {visit.status || 'Pending'}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {visit.scheduledDate || visit.date} {visit.timeSlot ? `(${visit.timeSlot})` : ''}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-sm">
                      {visit.property?.title || visit.propertyTitle || 'Listing Viewing'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {visit.clientName || 'Direct Client'}
                      </span>
                      {visit.clientPhone && (
                        <a
                          href={`tel:${visit.clientPhone}`}
                          className="flex items-center gap-1 text-amber-800 font-semibold hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {visit.clientPhone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Broker Decision Actions */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {visit.status !== 'confirmed' && visit.status !== 'completed' && (
                      <button
                        type="button"
                        disabled={isActioning}
                        onClick={() => handleStatusChange(vId, 'confirmed')}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-mono font-semibold transition-colors flex items-center gap-1"
                      >
                        {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>Confirm Visit</span>
                      </button>
                    )}
                    {visit.status === 'confirmed' && (
                      <button
                        type="button"
                        disabled={isActioning}
                        onClick={() => handleStatusChange(vId, 'completed')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded text-xs font-mono font-semibold transition-colors flex items-center gap-1"
                      >
                        {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>Mark Completed</span>
                      </button>
                    )}
                    {visit.status !== 'cancelled' && (
                      <button
                        type="button"
                        disabled={isActioning}
                        onClick={() => handleStatusChange(vId, 'cancelled')}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-rose-50 text-rose-700 rounded text-xs font-mono transition-colors"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-8 text-center rounded border border-slate-200 text-xs text-slate-500 font-mono">
              No pending visit requests assigned to your broker queue.
            </div>
          )}
        </div>
      ) : (
        /* Leads Table View */
        <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
              <tr>
                <th className="p-3.5">Client Name</th>
                <th className="p-3.5">Interest / Property</th>
                <th className="p-3.5">Budget</th>
                <th className="p-3.5">Pipeline State</th>
                <th className="p-3.5 text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {overviewData.leads.map((lead) => (
                <tr key={lead._id || lead.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-semibold text-slate-900">{lead.name || 'Anonymous Lead'}</td>
                  <td className="p-3.5">{lead.propertyTitle || lead.targetLocation || 'Mumbai Rental'}</td>
                  <td className="p-3.5">{lead.budget ? `₹${Number(lead.budget).toLocaleString('en-IN')}` : 'Flexible'}</td>
                  <td className="p-3.5">
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                      {lead.status || 'Active Lead'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-amber-800 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{lead.phone || 'Call'}</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}