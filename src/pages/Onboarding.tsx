import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const INTERESTS = [
  { id: 'music', lb: '🎵 Music', c: '#A855F7' },
  { id: 'ai', lb: '🧠 AI & Tech', c: '#3B82F6' },
  { id: 'art', lb: '🎨 Visual Art', c: '#F97316' },
  { id: 'sus', lb: '🌿 Sustainability', c: '#22C55E' },
  { id: 'film', lb: '🎬 Film', c: '#EC4899' },
  { id: 'code', lb: '💻 Coding', c: '#14B8A6' },
  { id: 'cafe', lb: '☕ Café Culture', c: '#A16207' },
  { id: 'glob', lb: '🌍 Global Issues', c: '#6366F1' },
  { id: 'write', lb: '✍️ Writing', c: '#0EA5E9' },
  { id: 'photo', lb: '📸 Photography', c: '#F43F5E' },
  { id: 'biz', lb: '📈 Business', c: '#10B981' },
  { id: 'hack', lb: '🏆 Hackathons', c: '#8B5CF6' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { completeOnboarding, user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleInterest = (id: string) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        name: user?.name || 'Student',
        college, branch, year, interests, bio,
      });
      navigate('/');
    } catch (err: any) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', background: '#fff', border: '1.5px solid #E8E0D5',
    borderRadius: 9, padding: '10px 12px', fontSize: 13, color: '#1C1410', outline: 'none',
  };

  return (
    <div id="onboarding-page" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', justifyContent: 'center', padding: '36px 18px',
      background: 'linear-gradient(160deg, #FAF7F2, #F0EBF8, #FAF7F2)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 38 }}>
        <div className="gradient-brand" style={{
          width: 44, height: 44, borderRadius: 12, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 21, color: '#fff',
        }}>✦</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 22, lineHeight: 1 }}>LinkHub</div>
          <div style={{ fontSize: 11, color: '#8C7B6E' }}>Your campus, your world</div>
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 28 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            height: 8, borderRadius: 4, width: i === step ? 28 : 8,
            background: i <= step ? '#6D28D9' : '#E8E0D5',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Card */}
      <div className="animate-rise" key={step} style={{
        background: '#fff', border: '1px solid #E8E0D5', borderRadius: 22,
        padding: '32px 34px', maxWidth: 540, width: '100%',
        boxShadow: '0 18px 55px rgba(0,0,0,.09)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
      }}>
        {step === 0 && (
          <>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, textAlign: 'center', marginBottom: 5 }}>
                What lights you up? ✨
              </h1>
              <p style={{ fontSize: 13, color: '#4A3F35', textAlign: 'center' }}>
                Pick up to 5 interests — what you actually care about.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 470 }}>
              {INTERESTS.map(({ id, lb, c }) => {
                const on = interests.includes(id);
                return (
                  <button key={id} onClick={() => toggleInterest(id)} style={{
                    padding: '8px 15px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    border: `2px solid ${on ? c : '#E8E0D5'}`,
                    background: on ? c + '18' : '#fff',
                    color: on ? c : '#4A3F35',
                    transition: 'all 0.17s',
                  }}>
                    {lb}{on ? ' ✓' : ''}
                  </button>
                );
              })}
            </div>
            <button disabled={interests.length < 3} onClick={() => setStep(1)} style={{
              width: '100%', padding: 12, border: 'none', borderRadius: 11,
              fontSize: 13, fontWeight: 700,
              background: interests.length >= 3 ? 'linear-gradient(135deg, #6D28D9, #9333EA)' : '#E8E0D5',
              color: interests.length >= 3 ? '#fff' : '#8C7B6E',
            }}>
              Continue with {interests.length} interests →
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, textAlign: 'center', marginBottom: 5 }}>
                Tell us about you 🎓
              </h1>
              <p style={{ fontSize: 13, color: '#4A3F35', textAlign: 'center' }}>
                This helps us connect you with the right people.
              </p>
            </div>
            <div style={{ width: '100%', maxWidth: 430, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 4 }}>College</label>
                <input id="onboard-college" value={college} onChange={e => setCollege(e.target.value)} placeholder="e.g. IIT Bombay, BITS Pilani..." style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 4 }}>Branch / Major</label>
                <input id="onboard-branch" value={branch} onChange={e => setBranch(e.target.value)} placeholder="e.g. Computer Science, Design..." style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 4 }}>Year</label>
                <select id="onboard-year" value={year} onChange={e => setYear(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                  <option value="Masters">Masters</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 4 }}>Bio (optional)</label>
                <textarea id="onboard-bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="figuring life out 🌱" rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
              </div>
            </div>
            <button id="onboard-launch" disabled={loading || !college.trim() || !branch.trim() || !year} onClick={handleComplete} style={{
              width: '100%', padding: 12, border: 'none', borderRadius: 11,
              fontSize: 13, fontWeight: 700,
              background: (!college.trim() || !branch.trim() || !year) ? '#E8E0D5' : 'linear-gradient(135deg, #6D28D9, #9333EA)',
              color: (!college.trim() || !branch.trim() || !year) ? '#8C7B6E' : '#fff',
            }}>
              {loading ? 'Setting up...' : 'Launch my LinkHub 🚀'}
            </button>
            <button onClick={() => setStep(0)} style={{
              background: 'none', border: 'none', color: '#8C7B6E', fontSize: 12, marginTop: -8,
            }}>← Back</button>
          </>
        )}
      </div>
    </div>
  );
}
