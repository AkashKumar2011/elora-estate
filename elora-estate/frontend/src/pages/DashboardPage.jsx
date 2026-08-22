import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as dashboardApi from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Button from '../components/Button';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function VisitRow({ visit }) {
  return (
    <div className="flex items-center justify-between border-b border-harbor-200 py-2 text-sm last:border-b-0">
      <div>
        <p className="font-medium">{visit.property?.title || visit.property?.locationArea || 'Property'}</p>
        <p className="text-harbor text-xs">{visit.client?.name || visit.broker?.name}</p>
      </div>
      <p className="font-mono text-xs text-harbor">{formatDateTime(visit.scheduledAt)}</p>
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    dashboardApi.getAdminDashboard().then(({ data }) => setData(data));
  }, []);
  if (!data) return <p className="text-harbor">Loading dashboard…</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Clients" value={data.totals.clients} />
        <StatCard label="Brokers" value={data.totals.brokers} />
        <StatCard label="Properties" value={data.totals.properties} />
        <StatCard label="Active leads" value={data.activeLeads} />
        <StatCard label="Follow-ups today" value={data.pendingFollowUps} />
        <StatCard label="Overdue follow-ups" value={data.overdueFollowUps} />
        <StatCard label="Visits today" value={data.todaysVisits.length} />
        <StatCard label="Upcoming visits" value={data.upcomingVisits.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="font-display text-lg mb-3">Today's visits</h2>
          <div className="border border-harbor-200 bg-chalk p-4">
            {data.todaysVisits.length === 0 ? (
              <p className="text-harbor text-sm">No visits scheduled today.</p>
            ) : (
              data.todaysVisits.map((v) => <VisitRow key={v._id} visit={v} />)
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg mb-3">Broker activity</h2>
          <div className="border border-harbor-200 bg-chalk p-4">
            {data.brokerActivity.length === 0 ? (
              <p className="text-harbor text-sm">No active leads assigned yet.</p>
            ) : (
              data.brokerActivity.map((b) => (
                <div key={b.brokerId} className="flex items-center justify-between border-b border-harbor-200 py-2 text-sm last:border-b-0">
                  <span>{b.name}</span>
                  <span className="font-mono text-harbor">{b.activeLeads} active leads</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function BrokerDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    dashboardApi.getBrokerDashboard().then(({ data }) => setData(data));
  }, []);
  if (!data) return <p className="text-harbor">Loading dashboard…</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Follow-ups today" value={data.todaysFollowUps.length} />
        <StatCard label="Overdue follow-ups" value={data.overdueFollowUps.length} />
        <StatCard label="Visits today" value={data.todaysVisits.length} />
        <StatCard label="My lineups" value={data.myLineupsCount} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="font-display text-lg mb-3">Today's follow-ups</h2>
          <div className="border border-harbor-200 bg-chalk p-4">
            {data.todaysFollowUps.length === 0 ? (
              <p className="text-harbor text-sm">Nothing due today — nice.</p>
            ) : (
              data.todaysFollowUps.map((f) => (
                <div key={f._id} className="flex items-center justify-between border-b border-harbor-200 py-2 text-sm last:border-b-0">
                  <span>{f.client?.name}</span>
                  <span className="text-harbor text-xs">{f.note}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg mb-3">Next actions</h2>
          <div className="border border-harbor-200 bg-chalk p-4">
            {data.nextActions.length === 0 ? (
              <p className="text-harbor text-sm">No next actions set.</p>
            ) : (
              data.nextActions.map((lead) => (
                <div key={lead._id} className="flex items-center justify-between border-b border-harbor-200 py-2 text-sm last:border-b-0">
                  <span>{lead.client?.name}</span>
                  <span className="text-harbor text-xs">{lead.nextActionNote}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section>
        <h2 className="font-display text-lg mb-3">Today's visits</h2>
        <div className="border border-harbor-200 bg-chalk p-4">
          {data.todaysVisits.length === 0 ? (
            <p className="text-harbor text-sm">No visits today.</p>
          ) : (
            data.todaysVisits.map((v) => <VisitRow key={v._id} visit={v} />)
          )}
        </div>
      </section>
    </div>
  );
}

function ClientDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    dashboardApi.getClientDashboard().then(({ data }) => setData(data));
  }, []);
  if (!data) return <p className="text-harbor">Loading dashboard…</p>;

  return (
    <div className="flex flex-col gap-8">
      {data.assignedBroker && (
        <div className="border border-harbor-200 bg-chalk p-4 flex items-center justify-between">
          <div>
            <p className="text-harbor text-xs uppercase tracking-wide">Your broker</p>
            <p className="font-display text-lg">{data.assignedBroker.name}</p>
          </div>
          <a href={`tel:${data.assignedBroker.mobile}`}>
            <Button size="sm">Call</Button>
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Shortlisted" value={data.shortlist.length} />
        <StatCard label="Upcoming visits" value={data.visits.upcoming.length} />
        <StatCard label="Recommended for you" value={data.recommended.length} />
      </div>

      <section>
        <h2 className="font-display text-lg mb-3">Upcoming visits</h2>
        <div className="border border-harbor-200 bg-chalk p-4">
          {data.visits.upcoming.length === 0 ? (
            <p className="text-harbor text-sm">No visits scheduled — browse properties to book one.</p>
          ) : (
            data.visits.upcoming.map((v) => <VisitRow key={v._id} visit={v} />)
          )}
        </div>
      </section>

      {data.recommended.length > 0 && (
        <section>
          <h2 className="font-display text-lg mb-3">Recommended for you</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.recommended.slice(0, 4).map((p) => (
              <Link key={p.id} to={`/properties/${p.id}`} className="border border-harbor-200 bg-chalk p-4 hover:border-laterite transition-colors">
                <p className="font-medium">{p.title || p.locationArea}</p>
                <p className="text-harbor text-sm">{p.locationArea}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Button as={Link} to="/properties" variant="outline" className="self-start">
        Browse more properties
      </Button>
    </div>
  );
}

function OwnerDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    dashboardApi.getOwnerDashboard().then(({ data }) => setData(data));
  }, []);
  if (!data) return <p className="text-harbor">Loading dashboard…</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="My properties" value={data.properties.length} />
        <StatCard label="Upcoming visits" value={data.upcomingVisits.length} />
      </div>

      <section>
        <h2 className="font-display text-lg mb-3">Upcoming visits</h2>
        <div className="border border-harbor-200 bg-chalk p-4">
          {data.upcomingVisits.length === 0 ? (
            <p className="text-harbor text-sm">No upcoming visits.</p>
          ) : (
            data.upcomingVisits.map((v) => <VisitRow key={v._id} visit={v} />)
          )}
        </div>
      </section>
    </div>
  );
}

const DASHBOARD_BY_ROLE = {
  admin: AdminDashboard,
  broker: BrokerDashboard,
  client: ClientDashboard,
  owner_caretaker: OwnerDashboard,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const Dashboard = DASHBOARD_BY_ROLE[user.role];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl mb-6">Welcome back, {user.name?.split(' ')[0]}</h1>
      {Dashboard ? <Dashboard /> : <p className="text-harbor">No dashboard available for this role.</p>}
    </div>
  );
}
