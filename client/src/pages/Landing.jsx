import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Terminal, Sparkles, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CodeBlock from '../components/CodeBlock';
import TagBadge from '../components/TagBadge';

const SAMPLE_CODE = `export async function retryWithBackoff(fn, retries = 3, delay = 500) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((r) => setTimeout(r, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}`;

export default function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col justify-between max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4 lg:pt-12">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] border border-border bg-surface text-[12px] font-mono text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Developer Snippet Vault v1.0
          </div>

          <h1 className="text-[32px] sm:text-[40px] font-bold text-foreground tracking-tight leading-[1.15]">
            Your code snippets, tagged and searchable.
          </h1>

          <p className="text-[16px] text-muted max-w-[540px] leading-relaxed">
            Save reusable snippets, shell commands, and architectural notes. Google Gemini automatically extracts concise tags and plain-English summaries.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 h-[40px] px-5 bg-primary text-primary-foreground font-medium text-[14px] rounded-[6px] hover:opacity-90 transition-opacity"
            >
              Start saving snippets
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center h-[40px] px-5 border border-strong bg-card text-foreground font-medium text-[14px] rounded-[6px] hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
            <div>
              <p className="text-[12px] text-muted font-mono uppercase tracking-wider">Fast Search</p>
              <p className="text-[14px] font-medium text-foreground mt-0.5">Ctrl+K index</p>
            </div>
            <div>
              <p className="text-[12px] text-muted font-mono uppercase tracking-wider">Tagging</p>
              <p className="text-[14px] font-medium text-foreground mt-0.5">Automated AI</p>
            </div>
            <div>
              <p className="text-[12px] text-muted font-mono uppercase tracking-wider">Privacy</p>
              <p className="text-[14px] font-medium text-foreground mt-0.5">User-isolated</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="rounded-[10px] border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">
                  Retry with exponential backoff
                </h3>
                <p className="text-[12px] text-muted mt-0.5">TypeScript • Oct 7, 2026</p>
              </div>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20">
                Auto-tagged
              </span>
            </div>

            <div className="bg-surface border border-border rounded-[6px] p-3 text-[13px] text-muted leading-relaxed">
              <span className="text-[11px] font-mono text-muted uppercase block font-semibold mb-1">
                AI Summary
              </span>
              Executes an asynchronous task with exponential backoff retry logic.
            </div>

            <CodeBlock
              code={SAMPLE_CODE}
              language="typescript"
              filename="retryBackoff.ts"
              maxHeight="220px"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              <TagBadge tag="typescript" />
              <TagBadge tag="async" />
              <TagBadge tag="retry" />
              <TagBadge tag="utility" />
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-border mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-muted">
        <div>Developer Snippet Vault &copy; 2026. Built with React, Express and Google Gemini.</div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hover:text-foreground">Log in</Link>
          <Link to="/register" className="hover:text-foreground">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
