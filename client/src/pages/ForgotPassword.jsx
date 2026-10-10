import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
      <div className="w-full max-w-[380px] bg-card border border-border rounded-[12px] p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>
          <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Forgot password?</h1>
          <p className="text-[13px] text-muted mt-1">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-[13px] text-destructive bg-destructive-subtle border border-destructive/20 rounded-[6px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-[8px] space-y-2 text-center">
            <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
            <p className="text-[13px] text-foreground font-medium">Check your email</p>
            <p className="text-[12px] text-muted">
              If an account exists for <span className="text-foreground">{email}</span>, a password reset link has been sent.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-[36px] px-3 text-[14px] bg-background border border-strong rounded-[6px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[36px] bg-primary text-primary-foreground font-medium text-[13px] rounded-[6px] hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send reset link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
