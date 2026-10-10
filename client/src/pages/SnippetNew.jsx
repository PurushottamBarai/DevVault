import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Loader2, RefreshCw, X, Plus } from "lucide-react";
import api from "../api/client";
import { useToast } from "../context/ToastContext";
import { SUPPORTED_LANGUAGES, getLanguageInfo } from "../lib/constants";
import { normalizeTag } from "../lib/tag";

export default function SnippetNew() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("java");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [previewTags, setPreviewTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [previewSummary, setPreviewSummary] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const textareaRef = useRef(null);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (title.trim() || content.trim()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [title, content]);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCodeKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      setContent(val.substring(0, start) + "  " + val.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleGeneratePreview = async () => {
    if (!title.trim() && !content.trim()) {
      showToast("Add a title or code to generate AI preview", "info");
      return;
    }

    try {
      setPreviewLoading(true);
      const res = await api.post("/snippets/preview-ai", {
        title,
        language,
        content,
      });

      if (res.data?.meta) {
        setPreviewTags(res.data.meta.tags || []);
        setPreviewSummary(res.data.meta.summary || "");
        showToast("AI preview generated");
      }
    } catch {
      showToast("Could not generate preview", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const clean = normalizeTag(newTagInput);
      if (clean && !previewTags.includes(clean) && previewTags.length < 10) {
        setPreviewTags([...previewTags, clean]);
        setNewTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPreviewTags(previewTags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please provide a snippet title");
      return;
    }
    if (!content.trim()) {
      setError("Code content cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const res = await api.post("/snippets", {
        title: title.trim(),
        language,
        content,
        notes: notes.trim(),
        tags: previewTags,
        summary: previewSummary.trim(),
      });

      showToast("Snippet saved");
      navigate(`/snippets/${res.data.snippet._id}`);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not save snippet. Check your connection and try again.",
      );
      setSaving(false);
    }
  };

  const lines = (content || "").split("\n");

  return (
    <div
      className="max-w-300 mx-auto px-4 sm:px-6 py-8"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="h-9 px-4 text-[13px] font-medium text-muted hover:text-foreground inline-flex items-center"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="h-9 px-5 bg-primary text-primary-foreground text-[13px] font-medium rounded-md hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer hover:cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save snippet</span>
            )}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-foreground tracking-tight">
          New snippet
        </h1>
        <p className="text-[13px] text-muted mt-0.5">
          Paste your code. Tags and a summary are added automatically.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 text-[13px] text-destructive bg-destructive-subtle border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Retry fetch with backoff"
              required
              className="w-full h-9 px-3 text-[14px] bg-card border border-strong rounded-md text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full sm:w-60 h-9 px-3 text-[13px] bg-card border border-strong rounded-md text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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

            <div className="border border-strong rounded-lg overflow-hidden bg-code flex">
              <div className="select-none py-3 px-2 text-right text-code-line border-r border-border/50 text-[12px] font-mono leading-5 bg-code-header/40 min-w-9">
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleCodeKeyDown}
                placeholder="// Paste or write snippet code here"
                rows={12}
                required
                className="flex-1 p-3 text-[13px] leading-5 font-mono bg-code text-foreground placeholder:text-muted focus:outline-none resize-y min-h-60 overflow-x-auto whitespace-pre"
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
              placeholder="Context, dependencies, usage caveats or docs in markdown..."
              rows={4}
              className="w-full p-3 text-[13px] bg-card border border-strong rounded-md text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Link
              to="/dashboard"
              className="h-9 px-4 text-[13px] font-medium text-muted hover:text-foreground inline-flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-5 bg-primary text-primary-foreground text-[13px] font-medium rounded-md hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer hover:cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save snippet</span>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="border border-border rounded-lg bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-muted tracking-wider font-semibold">
                AI Preview
              </span>
              <button
                type="button"
                onClick={handleGeneratePreview}
                disabled={previewLoading}
                className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline font-medium cursor-pointer hover:cursor-pointer disabled:opacity-50"
              >
                {previewLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Generate preview</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-6.5">
                  {previewTags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 h-6 px-2 text-[12px] font-mono bg-muted text-muted hover:text-foreground rounded-sm border border-border"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-destructive cursor-pointer"
                        aria-label={`Remove tag ${t}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag and press Enter"
                    className="flex-1 h-7.5 px-2.5 text-[12px] font-mono bg-card border border-strong rounded-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const clean = newTagInput
                        .replace(/^#+/, "")
                        .trim()
                        .toLowerCase();
                      if (
                        clean &&
                        !previewTags.includes(clean) &&
                        previewTags.length < 10
                      ) {
                        setPreviewTags([...previewTags, clean]);
                        setNewTagInput("");
                      }
                    }}
                    className="h-7.5 px-2 text-[12px] bg-muted hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground rounded-sm border border-border cursor-pointer flex items-center justify-center"
                    aria-label="Add tag"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">
                  Summary
                </label>
                <textarea
                  value={previewSummary}
                  onChange={(e) => setPreviewSummary(e.target.value)}
                  placeholder="Summary sentence in 10 to 20 words..."
                  rows={3}
                  className="w-full text-[13px] leading-relaxed text-foreground bg-card p-2.5 rounded-md border border-strong placeholder:text-muted focus:outline-none focus:border-primary resize-y"
                />
              </div>
            </div>

            <p className="text-[12px] text-muted pt-3 border-t border-border">
              Tags and summary can be customized before saving, or generated
              automatically with Gemini AI.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
