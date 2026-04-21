import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '@/api';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAppStore } from '@/store';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAppStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as { from?: string } | undefined)?.from || '/dashboard';

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await login({ email: email.trim(), password });
      setAuth(data.user, data.access_token);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Login</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Access your finance tutor dashboard.
          </p>
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input-base"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input-base"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        {error ? <ErrorState message={error} onRetry={handleSubmit} /> : null}

        <Button
          className="w-full"
          onClick={handleSubmit}
          isLoading={loading}
          disabled={!email.trim() || !password.trim()}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <p className="text-sm text-[var(--text-secondary)] text-center">
          New here?{' '}
          <Link to="/signup" className="text-brand-500 font-medium hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
