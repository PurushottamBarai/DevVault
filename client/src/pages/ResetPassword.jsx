import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import api from '../api/client';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
      <div className="w-full max-w-[380px] bg-card border border-border rounded-[12px] p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Set new password</h1>
          <p className="text-[13px] text-muted mt-1">
            Choose a new password for your account (minimum 8 characters).
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-[13px] text-destructive bg-destructive-subtle border border-destructive/20 rounded-[6px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-[8px] space-y-2 text-center">
            <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
            <p className="text-[13px] text-foreground font-medium">Password updated!</p>
            <p className="text-[12px] text-muted">Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[36px] px-3 pr-10 text-[14px] bg-background border border-strong rounded-[6px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2.5 top-2 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1.5">
                Confirm new password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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
                'Save new password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
