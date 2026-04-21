import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '@/api';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAppStore } from '@/store';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAppStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setAuth(data.user, data.access_token);
      navigate('/dashboard', { replace: true });
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
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Sign Up</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Create your account to track learning in MongoDB.
          </p>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="input-base"
        />
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
          placeholder="Password (min 6 chars)"
          className="input-base"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        {error ? <ErrorState message={error} onRetry={handleSubmit} /> : null}

        <Button
          className="w-full"
          onClick={handleSubmit}
          isLoading={loading}
          disabled={!name.trim() || !email.trim() || password.trim().length < 6}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>

        <p className="text-sm text-[var(--text-secondary)] text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
