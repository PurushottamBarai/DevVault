import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Sun, Moon, LogOut, Code2, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from './ConfirmDialog';

export default function Navbar({ searchQuery = '', onSearchChange }) {
  const { user, logout, deleteAccount, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      showToast('Account and all snippets permanently deleted');
      navigate('/');
    } catch {
      showToast('Could not delete account. Please try again.', 'error');
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key.toLowerCase() === 'n' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA' && isAuthenticated) {
        e.preventDefault();
        navigate('/snippets/new');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, navigate]);

  return (
    <header className="sticky top-0 z-40 h-[56px] w-full border-b border-border/70 navbar-blur px-4 sm:px-6 transition-colors">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-primary text-primary-foreground font-semibold text-sm">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">
            Snippet Vault
          </span>
        </Link>

        {isAuthenticated && (
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-muted pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search snippets..."
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full h-[36px] pl-9 pr-14 text-[13px] bg-surface border border-strong rounded-[6px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange && onSearchChange('')}
                    className="p-1 text-muted hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border px-1.5 text-[10px] font-mono text-muted bg-muted">
                    Ctrl K
                  </kbd>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-muted hover:text-foreground rounded-[6px] hover:bg-muted transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/snippets/new"
                className="inline-flex items-center gap-1.5 h-[36px] px-3 rounded-[6px] bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New snippet</span>
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border text-[12px] font-medium text-foreground hover:border-strong transition-colors"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-10 z-30 w-48 py-1 bg-card border border-border rounded-[8px] shadow-lg text-[13px]">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="font-medium text-foreground truncate">{user?.name}</p>
                        <p className="text-[12px] text-muted truncate">{user?.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full px-3 py-2 text-left text-muted hover:text-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log out
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setConfirmDeleteOpen(true);
                        }}
                        className="w-full px-3 py-2 text-left text-destructive hover:bg-destructive-subtle flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete account
                      </button>
                    </div>
                  </>
                )}
              </div>
              <ConfirmDialog
                isOpen={confirmDeleteOpen}
                title="Delete Account"
                description="Are you sure you want to delete your account? All your snippets and data will be permanently removed. This action cannot be undone."
                confirmText="Delete my account"
                onConfirm={handleDeleteAccount}
                onCancel={() => setConfirmDeleteOpen(false)}
                isDanger={true}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="h-[36px] px-3.5 inline-flex items-center text-[13px] font-medium text-foreground hover:bg-muted rounded-[6px] transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="h-[36px] px-3.5 inline-flex items-center text-[13px] font-medium bg-primary text-primary-foreground rounded-[6px] hover:opacity-90 transition-opacity"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
