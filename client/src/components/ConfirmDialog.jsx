import { useEffect } from 'react';

export default function ConfirmDialog({ isOpen, title, description, confirmText = 'Delete', onConfirm, onCancel, isDanger = true }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/50"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[400px] bg-card border border-border rounded-[12px] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-[16px] font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-[14px] text-muted mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-[36px] px-3.5 text-[13px] font-medium rounded-[6px] border border-strong bg-card text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-[36px] px-3.5 text-[13px] font-medium rounded-[6px] transition-colors ${
              isDanger
                ? 'bg-destructive text-white hover:bg-red-700'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
