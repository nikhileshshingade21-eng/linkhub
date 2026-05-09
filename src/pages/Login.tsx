import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="login-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 18px',
        background: 'linear-gradient(160deg, #FAF7F2, #F0EBF8, #FAF7F2)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 38 }}>
        <div
          className="gradient-brand"
          style={{
            width: 44, height: 44, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 21, color: '#fff',
          }}
        >✦</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 22, color: '#1C1410', lineHeight: 1 }}>LinkHub</div>
          <div style={{ fontSize: 11, color: '#8C7B6E' }}>Your campus, your world</div>
        </div>
      </div>

      {/* Card */}
      <div
        className="animate-rise"
        style={{
          background: '#fff',
          border: '1px solid #E8E0D5',
          borderRadius: 22,
          padding: '32px 34px',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 18px 55px rgba(0,0,0,.09)',
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1C1410', textAlign: 'center', marginBottom: 5 }}>
          Welcome back 👋
        </h1>
        <p style={{ fontSize: 13, color: '#4A3F35', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
          Sign in to your LinkHub account
        </p>

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid rgba(225,29,72,.18)',
            borderRadius: 9, padding: '10px 13px', marginBottom: 16,
            fontSize: 12, color: '#E11D48', fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 4 }}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              style={{
                width: '100%', background: '#fff', border: '1.5px solid #E8E0D5',
                borderRadius: 9, padding: '10px 12px', fontSize: 13, color: '#1C1410',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6D28D9'}
              onBlur={(e) => e.target.style.borderColor = '#E8E0D5'}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 4 }}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', background: '#fff', border: '1.5px solid #E8E0D5',
                borderRadius: 9, padding: '10px 12px', fontSize: 13, color: '#1C1410',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6D28D9'}
              onBlur={(e) => e.target.style.borderColor = '#E8E0D5'}
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: 12, border: 'none', borderRadius: 11,
              fontSize: 13, fontWeight: 700, color: '#fff',
              background: loading ? '#E8E0D5' : 'linear-gradient(135deg, #6D28D9, #9333EA)',
              marginTop: 6,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <span style={{ fontSize: 12, color: '#8C7B6E' }}>Don't have an account? </span>
          <Link
            to="/register"
            style={{ fontSize: 12, fontWeight: 700, color: '#6D28D9', textDecoration: 'none' }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
