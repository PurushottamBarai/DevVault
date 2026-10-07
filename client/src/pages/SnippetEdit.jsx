import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, X, Loader2 } from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { SUPPORTED_LANGUAGES, getLanguageInfo } from '../lib/constants';

export default function SnippetEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [summary, setSummary] = useState('');
  const [aiStatus, setAiStatus] = useState('done');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');

  const textareaRef = useRef(null);

  useEffect(() => {
    async function loadSnippet() {
      try {
        const res = await api.get(`/snippets/${id}`);
        const s = res.data.snippet;
        setTitle(s.title);
        setLanguage(s.language);
        setContent(s.content);
        setNotes(s.notes || '');
        setTags(s.tags || []);
        setSummary(s.summary || '');
        setAiStatus(s.aiStatus || 'done');
      } catch (err) {
        showToast('Snippet not found', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadSnippet();
  }, [id, navigate, showToast]);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleCodeKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      setContent(val.substring(0, start) + '  ' + val.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = newTagInput.replace(/^#+/, '').trim().toLowerCase();
      if (clean && !tags.includes(clean) && tags.length < 10) {
        setTags([...tags, clean]);
        setNewTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const res = await api.post(`/snippets/${id}/regenerate`);
      setTags(res.data.snippet.tags || []);
      setSummary(res.data.snippet.summary || '');
      setAiStatus('done');
      showToast('AI tags and summary regenerated');
    } catch {
      showToast('Could not regenerate AI metadata', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/snippets/${id}`, {
        title: title.trim(),
        language,
        content,
        notes: notes.trim(),
        tags,
        summary: summary.trim(),
        aiStatus
      });

      showToast('Snippet updated');
      navigate(`/snippets/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update snippet');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const lines = (content || '').split('\n');

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8" onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-2 mb-6">
        <Link
          to={`/snippets/${id}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to snippet</span>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-foreground tracking-tight">Edit snippet</h1>
        <p className="text-[13px] text-muted mt-0.5">
          Update your code or edit the auto-generated tags and summary.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 text-[13px] text-destructive bg-destructive-subtle border border-destructive/20 rounded-[6px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full h-[36px] px-3 text-[14px] bg-card border border-strong rounded-[6px] text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full sm:w-[240px] h-[36px] px-3 text-[13px] bg-card border border-strong rounded-[6px] text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {SUPPORTED_LANGUAGES.map((lang) => {
                const info = getLanguageInfo(lang);
                return (
                  <option key={lang} value={lang}>
                    {info.label}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-medium text-foreground">
                Code
              </label>
              <span className="text-[11px] font-mono text-muted">
                Tab inserts spaces • Ctrl+Enter to save
              </span>
            </div>

            <div className="border border-strong rounded-[8px] overflow-hidden bg-code flex">
              <div className="select-none py-3 px-2 text-right text-code-line border-r border-border/50 text-[12px] font-mono leading-[20px] bg-code-header/40 min-w-[36px]">
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleCodeKeyDown}
                rows={14}
                required
                className="flex-1 p-3 text-[13px] leading-[20px] font-mono bg-code text-foreground focus:outline-none resize-y min-h-[260px] overflow-x-auto whitespace-pre"
                style={{ tabSize: 2 }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">
              Notes (Markdown, optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full p-3 text-[13px] bg-card border border-strong rounded-[6px] text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Link
              to={`/snippets/${id}`}
              className="h-[36px] px-4 text-[13px] font-medium text-muted hover:text-foreground inline-flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="h-[36px] px-5 bg-primary text-primary-foreground text-[13px] font-medium rounded-[6px] hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save changes</span>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="border border-border rounded-[8px] bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-muted tracking-wider font-semibold">
                AI Metadata
              </span>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating}
                className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1.5">
                Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-[13px] bg-card border border-strong rounded-[6px] text-foreground focus:outline-none focus:border-primary resize-y"
                placeholder="One sentence plain-English summary..."
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 h-[22px] px-2 text-[12px] font-mono bg-muted text-muted rounded-[4px]"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter"
                className="w-full h-[32px] px-2.5 text-[12px] font-mono bg-card border border-strong rounded-[6px] text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
