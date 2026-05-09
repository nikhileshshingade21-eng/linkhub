import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', background: '#fff', border: '1.5px solid #E8E0D5',
    borderRadius: 9, padding: '10px 12px', fontSize: 13, color: '#1C1410', outline: 'none',
  };

  return (
    <div id="register-page" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', justifyContent: 'center', padding: '36px 18px',
      background: 'linear-gradient(160deg, #FAF7F2, #F0EBF8, #FAF7F2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 38 }}>
        <div className="gradient-brand" style={{
          width: 44, height: 44, borderRadius: 12, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 21, color: '#fff',
        }}>✦</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 22, color: '#1C1410', lineHeight: 1 }}>LinkHub</div>
          <div style={{ fontSize: 11, color: '#8C7B6E' }}>Your campus, your world</div>
        </div>
      </div>

      <div className="animate-rise" style={{
        background: '#fff', border: '1px solid #E8E0D5', borderRadius: 22,
        padding: '32px 34px', maxWidth: 440, width: '100%',
        boxShadow: '0 18px 55px rgba(0,0,0,.09)',
      }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, textAlign: 'center', marginBottom: 5 }}>Join LinkHub ✨</h1>
        <p style={{ fontSize: 13, color: '#4A3F35', textAlign: 'center', marginBottom: 24 }}>
          Create your account and find your people
        </p>

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid rgba(225,29,72,.18)',
            borderRadius: 9, padding: '10px 13px', marginBottom: 16,
            fontSize: 12, color: '#E11D48', fontWeight: 600,
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 4 }}>Full Name</label>
            <input id="register-name" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Priya Sharma" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 4 }}>College Email</label>
            <input id="register-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 4 }}>Password</label>
            <input id="register-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 4 }}>Confirm Password</label>
            <input id="register-confirm" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" style={inputStyle} />
          </div>
          <button id="register-submit" type="submit" disabled={loading} style={{
            width: '100%', padding: 12, border: 'none', borderRadius: 11,
            fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 6,
            background: loading ? '#E8E0D5' : 'linear-gradient(135deg, #6D28D9, #9333EA)',
          }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <span style={{ fontSize: 12, color: '#8C7B6E' }}>Already have an account? </span>
          <Link to="/login" style={{ fontSize: 12, fontWeight: 700, color: '#6D28D9', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
