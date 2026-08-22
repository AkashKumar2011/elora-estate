import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Heart, 
  Clock, 
  MapPin, 
  ArrowRight, 
  IndianRupee, 
  Building2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getClientDashboardData } from '../../api/clientApi';
import PropertyCard from '../../components/PropertyCard';

export default function ClientOverviewPage() {
  const [data, setData] = useState({ visits: [], shortlist: [], metrics: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getClientDashboardData();
        const payload = res?.data || res || {};
        setData({
          visits: payload.upcomingVisits || payload.visits || [],
          shortlist: payload.shortlistedProperties || payload.shortlist || [],
          metrics: payload.metrics || {},
        });
      } catch (err) {
        console.error('Failed to load client overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const upcomingVisits = data.visits.slice(0, 2);
  const recentShortlist = data.shortlist.slice(0, 3);

  return (
    <DashboardLayout activeTab="overview">
      <div className="space-y-8">
        {/* Top Metric Bar */}
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Tenant Hub
          </h1>
          <p className="text-xs sm:text-sm font-mono text-slate-600 mt-1">
            Track scheduled physical viewings and manage shortlisted Mumbai residences
          </p>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-md border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Scheduled Visits</span>
              <div className="text-2xl font-bold font-mono text-slate-950 mt-1">
                {data.visits.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-md border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Saved Properties</span>
              <div className="text-2xl font-bold font-mono text-slate-950 mt-1">
                {data.shortlist.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-md border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Broker Channel</span>
              <div className="text-xs font-semibold text-emerald-700 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Direct Access Active</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Section: Next Upcoming Physical Visits */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Upcoming Scheduled Visits</span>
            </h2>
            <Link
              to="/dashboard/visits"
              className="text-xs font-mono font-semibold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1"
            >
              <span>View all visits</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {upcomingVisits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingVisits.map((visit, idx) => (
                <div
                  key={visit._id || visit.id || idx}
                  className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-amber-100 text-amber-900 font-mono text-[11px] font-semibold px-2 py-0.5 rounded uppercase">
                        {visit.status || 'Confirmed'}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {visit.scheduledDate || 'Date confirmed'}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-sm">
                      {visit.property?.title || 'Property Viewing'}
                    </h3>

                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{visit.property?.location || 'Mumbai Region'}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>Broker: {visit.brokerName || 'Assigned Coordinator'}</span>
                    <Link
                      to={`/properties/${visit.property?._id || visit.propertyId}`}
                      className="text-amber-800 font-semibold hover:underline"
                    >
                      View Property
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-md border border-slate-200 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600">No upcoming property viewings scheduled currently.</p>
              <Link
                to="/properties"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-amber-400 text-xs font-semibold rounded hover:bg-slate-800 transition-colors"
              >
                <span>Browse & Schedule a Visit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Section: Shortlisted Properties Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Saved Shortlist</span>
            </h2>
            <Link
              to="/dashboard/shortlist"
              className="text-xs font-mono font-semibold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1"
            >
              <span>View full shortlist</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentShortlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentShortlist.map((prop) => (
                <PropertyCard
                  key={prop._id || prop.id}
                  property={prop}
                  isShortlisted={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-md border border-slate-200 text-center space-y-3">
              <Heart className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600">You have not saved any properties to your shortlist yet.</p>
              <Link
                to="/properties"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-amber-400 text-xs font-semibold rounded hover:bg-slate-800 transition-colors"
              >
                <span>Explore Properties</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}