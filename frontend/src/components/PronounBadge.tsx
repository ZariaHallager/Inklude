export default function PronounBadge({
  label,
  isPrimary = false,
}: {
  label: string;
  isPrimary?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isPrimary
          ? 'bg-accent/15 text-accent-light border border-accent/30'
          : 'bg-surface-2 text-text-muted border border-border'
      }`}
    >
      {label}
      {isPrimary && <span className="ml-1 text-[10px] opacity-60">primary</span>}
    </span>
  );
}
