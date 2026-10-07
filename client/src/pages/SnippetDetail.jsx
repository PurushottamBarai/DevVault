import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import api from '../api/client';
import CodeBlock from '../components/CodeBlock';
import TagBadge from '../components/TagBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { getLanguageInfo } from '../lib/constants';

export default function SnippetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    async function loadSnippet() {
      try {
        const res = await api.get(`/snippets/${id}`);
        setSnippet(res.data.snippet);
      } catch (err) {
        showToast('Snippet not found', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadSnippet();
  }, [id, navigate, showToast]);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const res = await api.post(`/snippets/${id}/regenerate`);
      setSnippet(res.data.snippet);
      showToast('Tags and summary regenerated');
    } catch {
      showToast('Could not generate tags. Try again.', 'error');
      setSnippet((prev) => (prev ? { ...prev, aiStatus: 'failed' } : null));
    } finally {
      setRegenerating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/snippets/${id}`);
      showToast('Snippet deleted');
      navigate('/dashboard');
    } catch {
      showToast('Could not delete snippet', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        <div className="h-8 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-24 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!snippet) return null;

  const langInfo = getLanguageInfo(snippet.language);
  const formattedDate = new Date(snippet.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-1.5 text-[12px] text-muted mb-4 font-mono">
        <Link to="/dashboard" className="hover:text-foreground">
          Snippets
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground truncate max-w-[280px]">
          {snippet.title}
        </span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-border mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight mb-2">
            {snippet.title}
          </h1>
          <div className="flex items-center gap-2.5 text-[13px] text-muted">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: langInfo.color }}
            />
            <span className="font-medium text-foreground">{langInfo.label}</span>
            <span>•</span>
            <span>Created {formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/snippets/${snippet._id}/edit`}
            className="h-[36px] px-3.5 border border-strong rounded-[6px] text-[13px] font-medium text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="h-[36px] px-3.5 border border-strong rounded-[6px] text-[13px] font-medium text-destructive hover:bg-destructive-subtle transition-colors inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="border border-border rounded-[8px] bg-surface p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase text-muted tracking-wider font-semibold">
              SUMMARY
            </span>
            {snippet.aiStatus === 'done' && (
              <span className="text-[11px] text-muted">
                (Auto-generated)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>

        {regenerating ? (
          <div className="space-y-2 py-1">
            <div className="flex items-center gap-2 text-[12px] text-muted mb-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Generating tags and summary...</span>
            </div>
            <div className="h-3.5 bg-muted rounded w-4/5 animate-pulse" />
            <div className="h-3.5 bg-muted rounded w-3/5 animate-pulse" />
          </div>
        ) : snippet.aiStatus === 'failed' ? (
          <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[13px]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Could not generate tags or summary.</span>
            </div>
            <button
              type="button"
              onClick={handleRegenerate}
              className="text-[12px] font-medium underline hover:opacity-80"
            >
              Try again
            </button>
          </div>
        ) : (
          <p className="text-[14px] text-foreground leading-relaxed">
            {snippet.summary || 'No summary generated yet.'}
          </p>
        )}
      </div>

      {Array.isArray(snippet.tags) && snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {snippet.tags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              onClick={() => navigate(`/dashboard?tag=${encodeURIComponent(tag)}`)}
            />
          ))}
        </div>
      )}

      <div className="space-y-6">
        <CodeBlock
          code={snippet.content}
          language={snippet.language}
          maxHeight="540px"
        />

        {snippet.notes && (
          <div className="border border-border rounded-[8px] p-5 bg-card">
            <h2 className="text-[11px] font-mono uppercase text-muted tracking-wider font-semibold mb-3">
              NOTES
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-[14px] text-foreground leading-relaxed space-y-2">
              <ReactMarkdown>{snippet.notes}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        title="Delete this snippet?"
        description="This cannot be undone. Are you sure you want to permanently delete this snippet?"
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
