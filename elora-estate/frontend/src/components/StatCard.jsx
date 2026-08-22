export default function StatCard({ label, value }) {
  return (
    <div className="border border-harbor-200 bg-chalk p-4">
      <p className="text-harbor text-xs uppercase tracking-wide">{label}</p>
      <p className="font-display text-3xl mt-1">{value}</p>
    </div>
  );
}
