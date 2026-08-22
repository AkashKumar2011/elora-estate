// Buttons are the most-used control in a "click more, type less" product —
// worth giving them a real identity rather than a default rounded rect.
// The filled variant carries the stepped-arch corner cut; other variants
// stay plain so the signature isn't diluted by overuse.
export default function Button({ variant = 'filled', size = 'md', className = '', as: As = 'button', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-sans font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    filled: 'bg-laterite text-chalk hover:bg-laterite-600 clip-deco-step',
    outline: 'border border-basalt text-basalt hover:bg-basalt hover:text-chalk rounded-sm',
    ghost: 'text-basalt hover:bg-harbor-200/50 rounded-sm',
    dark: 'bg-basalt text-chalk hover:bg-basalt-700 rounded-sm',
  };
  return <As className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}
