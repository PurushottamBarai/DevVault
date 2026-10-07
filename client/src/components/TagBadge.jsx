export default function TagBadge({ tag, onClick, active }) {
  const cleanTag = tag.replace(/^#+/, '');
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center h-[22px] px-2 text-[12px] font-mono rounded-[4px] transition-colors ${
        active
          ? 'bg-primary/10 text-primary border border-primary/30'
          : 'bg-muted text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800'
      }`}
    >
      #{cleanTag}
    </button>
  );
}
