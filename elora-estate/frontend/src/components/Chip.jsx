// The single most-repeated control in the product per spec's "click more,
// type less" principle — category toggles, filters, requirement capture,
// property-add forms all use this instead of text inputs/select dropdowns
// wherever the option set is small and known.
export default function Chip({ selected, onClick, children, size = 'md' }) {
  const sizes = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`${sizes} rounded-full font-medium transition-colors border ${
        selected
          ? 'bg-basalt text-chalk border-basalt'
          : 'bg-transparent text-basalt border-harbor-200 hover:border-basalt'
      }`}
    >
      {children}
    </button>
  );
}
