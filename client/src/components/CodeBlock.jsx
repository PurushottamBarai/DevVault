import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { getLanguageInfo } from '../lib/constants';

export default function CodeBlock({ code, language, maxHeight = '480px', filename }) {
  const [copied, setCopied] = useState(false);
  const langInfo = getLanguageInfo(language);
  const lines = (code || '').split('\n');

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="border border-border rounded-[8px] overflow-hidden bg-code">
      <div className="h-[36px] bg-code-header px-3.5 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: langInfo.color }}
          />
          <span className="text-[12px] font-medium text-foreground">
            {filename || langInfo.label}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground transition-colors px-2 py-1 rounded-[4px] hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium" aria-live="polite">
                Copied
              </span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div
        className="p-4 overflow-x-auto text-[13px] leading-[20px] font-mono select-text"
        style={{ maxHeight }}
      >
        <div className="flex min-w-full">
          <div className="select-none text-code-line text-right pr-4 border-r border-border/50 text-[12px]">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre className="pl-4 flex-1 m-0 text-foreground whitespace-pre overflow-x-auto">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
}
