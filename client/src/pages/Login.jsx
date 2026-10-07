import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Code2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    location.search.includes('expired=true') ? 'Your session expired. Log in again.' : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      const errData = err.response?.data?.error;
      const msg = typeof errData === 'string' ? errData : errData?.message || 'Email or password is incorrect.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#09090b] text-[#fafafa] p-12 border-r border-[#27272a]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <span className="font-semibold text-[16px] tracking-tight">Snippet Vault</span>
        </div>

        <div className="space-y-4 max-w-md">
          <h2 className="text-[28px] font-semibold tracking-tight text-white leading-tight">
            Your code, <br />organised for you.
          </h2>
          <p className="text-[14px] text-zinc-400 leading-relaxed">
            Save snippets and notes. Get tags and a summary for each one automatically.
          </p>

          <div className="rounded-[8px] bg-[#111113] border border-[#27272a] p-4 font-mono text-[12px] text-zinc-400 space-y-1 mt-6">
            <div className="text-teal-400">// Automatically tagged & indexed</div>
            <div className="text-zinc-200">const snippet = await vault.find('#jwt');</div>
            <div className="text-zinc-500">// Returns verified auth middleware snippet</div>
          </div>
        </div>

        <div className="text-[12px] text-zinc-500 font-mono">
          AES-256 encrypted cookies • Owner-isolated data
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[360px] space-y-6">
          <div>
            <h1 className="text-[24px] font-semibold text-foreground tracking-tight">Log in</h1>
            <p className="text-[13px] text-muted mt-1">Welcome back. Enter your details.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-[13px] text-destructive bg-destructive-subtle border border-destructive/20 rounded-[6px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-[36px] sm:h-[36px] px-3 text-[14px] bg-background border border-strong rounded-[6px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-medium text-foreground">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-[36px] px-3 pr-10 text-[14px] bg-background border border-strong rounded-[6px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-2 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[36px] bg-primary text-primary-foreground font-medium text-[13px] rounded-[6px] hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                'Log in'
              )}
            </button>
          </form>

          <p className="text-[13px] text-center text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
