import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Phone, User, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getClientVisits, cancelVisitRequest } from '../../api/clientApi';

export default function ClientVisitsPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    async function loadVisits() {
      try {
        setLoading(true);
        const res = await getClientVisits();
        const list = res?.data?.visits || res?.visits || res?.data || [];
        setVisits(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load visits:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVisits();
  }, []);

  const handleCancel = async (visitId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled viewing?')) return;
    try {
      setCancellingId(visitId);
      if (cancelVisitRequest) {
        await cancelVisitRequest(visitId);
      }
      setVisits((prev) =>
        prev.map((v) => (v._id === visitId || v.id === visitId ? { ...v, status: 'cancelled' } : v))
      );
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to cancel viewing');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded text-xs font-mono font-semibold">Confirmed</span>;
      case 'completed':
        return <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded text-xs font-mono font-semibold">Completed</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded text-xs font-mono font-semibold">Cancelled</span>;
      default:
        return <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded text-xs font-mono font-semibold">Pending Broker Confirmation</span>;
    }
  };

  return (
    <DashboardLayout activeTab="visits">
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Physical Viewings</h1>
          <p className="text-xs sm:text-sm font-mono text-slate-600 mt-1">
            Confirmed visits and coordinator contact details for your selected Mumbai properties
          </p>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-white rounded border border-slate-200" />
            ))}
          </div>
        ) : visits.length > 0 ? (
          <div className="space-y-4">
            {visits.map((visit) => {
              const vId = visit._id || visit.id;
              return (
                <div
                  key={vId}
                  className="bg-white p-5 rounded-md border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(visit.status)}
                      <span className="text-xs font-mono text-slate-500">
                        {visit.date || visit.scheduledDate} {visit.timeSlot ? `• ${visit.timeSlot}` : ''}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-base">
                      {visit.propertyTitle || visit.property?.title || 'Property Viewing'}
                    </h3>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{visit.propertyLocation || visit.property?.location || 'Mumbai'}</span>
                    </p>

                    {visit.brokerName && (
                      <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-600">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Broker: {visit.brokerName}
                        </span>
                        {visit.brokerPhone && (
                          <span className="flex items-center gap-1 text-amber-800 font-semibold">
                            <Phone className="w-3.5 h-3.5" />
                            {visit.brokerPhone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {visit.status !== 'cancelled' && visit.status !== 'completed' && (
                      <button
                        type="button"
                        disabled={cancellingId === vId}
                        onClick={() => handleCancel(vId)}
                        className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-mono rounded transition-colors"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-md border border-slate-200 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-semibold text-slate-900 text-sm">No scheduled visits on record</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Schedule property viewings directly from any listing detail page to coordinate with the managing broker.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}