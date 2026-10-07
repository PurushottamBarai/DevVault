import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit2, Copy, Trash2, Check } from 'lucide-react';
import { getLanguageInfo } from '../lib/constants';
import TagBadge from './TagBadge';

export default function SnippetCard({ snippet, onDelete, onTagClick }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const langInfo = getLanguageInfo(snippet.language);
  const codeLines = (snippet.content || '').split('\n').slice(0, 5).join('\n');

  const formattedDate = new Date(snippet.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const handleCopyCode = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(snippet.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setMenuOpen(false);
    } catch {}
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/snippets/${snippet._id}/edit`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(snippet);
  };

  return (
    <div
      onClick={() => navigate(`/snippets/${snippet._id}`)}
      className="group relative border border-border hover:border-strong rounded-[8px] p-4 bg-card transition-colors cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-[16px] font-semibold text-foreground truncate flex-1">
            {snippet.title}
          </h3>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Snippet actions"
              className="p-1 rounded-[4px] text-muted hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-muted"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-6 z-30 w-36 py-1 bg-card border border-border rounded-[6px] shadow-lg text-[13px]">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="w-full px-3 py-1.5 text-left text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="w-full px-3 py-1.5 text-left text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? 'Copied' : 'Copy code'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full px-3 py-1.5 text-left text-destructive hover:bg-destructive-subtle flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-muted mb-3">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: langInfo.color }}
          />
          <span className="font-medium text-foreground">{langInfo.label}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>

        {snippet.summary && (
          <p className="text-[13px] text-muted line-clamp-2 mb-3 leading-relaxed">
            {snippet.summary}
          </p>
        )}

        <div className="relative rounded-[6px] bg-code border border-border/50 p-2.5 mb-3 font-mono text-[12px] leading-relaxed overflow-hidden select-none">
          <pre className="text-foreground/80 m-0 whitespace-pre overflow-hidden">
            {codeLines}
          </pre>
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-code to-transparent pointer-events-none" />
        </div>
      </div>

      {Array.isArray(snippet.tags) && snippet.tags.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5 pt-1"
          onClick={(e) => e.stopPropagation()}
        >
          {snippet.tags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              onClick={() => onTagClick && onTagClick(tag)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
