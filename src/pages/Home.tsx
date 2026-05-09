import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, loadProfile, logout } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !profile) {
      loadProfile();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // If not onboarded, redirect
  if (!user.isOnboarded) {
    navigate('/onboarding');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #E8E0D5',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 6px rgba(0,0,0,.07)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 18px',
          height: 54, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div className="gradient-brand" style={{
              width: 34, height: 34, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, color: '#fff',
            }}>✦</div>
            <span style={{ fontWeight: 900, fontSize: 17 }}>LinkHub</span>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#FAF7F2', border: '1px solid #E8E0D5',
            borderRadius: 8, padding: '5px 10px',
          }}>
            <span>🔍</span>
            <input placeholder="Search people, squads..." style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: 11, width: 160, color: '#1C1410',
            }} />
          </div>

          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6D28D944, #6D28D966)',
            color: '#6D28D9', border: '2px solid #6D28D9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 11,
            boxShadow: '0 0 0 3px #fff, 0 0 0 5px rgba(109,40,217,.3)',
          }}>
            {user.name?.substring(0, 2).toUpperCase()}
          </div>

          <button onClick={() => logout()} style={{
            background: '#FAF7F2', border: '1px solid #E8E0D5',
            borderRadius: 8, padding: '6px 12px', fontSize: 11,
            fontWeight: 600, color: '#4A3F35',
          }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '24px 18px',
        display: 'grid', gridTemplateColumns: '215px 1fr', gap: 20,
        flex: 1,
      }}>
        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{
            background: '#fff', border: '1px solid #E8E0D5',
            borderRadius: 15, padding: 15,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%', fontSize: 13,
                background: 'linear-gradient(135deg, #6D28D944, #6D28D966)',
                color: '#6D28D9', border: '2px solid #6D28D9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
              }}>
                {user.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{user.name}</div>
                <div style={{ fontSize: 10, color: '#8C7B6E' }}>
                  {profile?.branch || 'Student'} · {profile?.year || ''}
                </div>
                {profile?.bio && (
                  <div style={{ fontSize: 10, color: '#6D28D9', fontStyle: 'italic' }}>
                    {profile.bio}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{
            background: '#fff', border: '1px solid #E8E0D5',
            borderRadius: 15, padding: 15,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: '#8C7B6E',
              textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 10,
            }}>Your Interests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {(profile?.interests || []).map(i => (
                <span key={i} style={{
                  fontSize: 10, fontWeight: 600, borderRadius: 20,
                  padding: '2px 8px', background: '#6D28D918',
                  border: '1px solid #6D28D928', color: '#6D28D9',
                }}>{i}</span>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main>
          <div className="animate-rise" style={{
            background: '#1A1040', borderRadius: 18,
            padding: '24px 24px 50px', marginBottom: -28,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
              letterSpacing: '.09em', marginBottom: 10, color: '#F5C842',
            }}>🔗 Dashboard</div>
            <div style={{ fontSize: 23, fontWeight: 900, color: '#FAF8FF', margin: '0 0 4px' }}>
              Welcome, {user.name?.split(' ')[0]}!
            </div>
            <div style={{ fontSize: 12, color: '#C4B5FD', opacity: 0.8 }}>
              Your campus ecosystem awaits. Start exploring squads, opportunities, and more.
            </div>
          </div>

          <div style={{
            background: '#fff', borderRadius: 18,
            border: '1px solid #E8E0D5', padding: '40px 24px 24px',
            boxShadow: '0 4px 18px rgba(0,0,0,.06)',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 14,
            }}>
              {[
                { icon: '🎯', title: 'Find Squads', desc: 'Join teams for hackathons, projects, startups', color: '#059669', path: '/squads' },
                { icon: '🚀', title: 'Opportunities', desc: 'Hackathons, internships, gigs, events', color: '#0284C7', path: '/opportunities' },
                { icon: '🔍', title: 'Discover People', desc: 'Find students with shared interests', color: '#6D28D9', path: '/discover' },
                { icon: '👤', title: 'Your Profile', desc: 'Build your campus identity', color: '#EC4899', path: '/profile' },
              ].map((item) => (
                <div key={item.title} onClick={() => navigate(item.path)} style={{
                  background: '#FAF7F2', border: '1px solid #E8E0D5',
                  borderRadius: 12, padding: '16px',
                  cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 7px 20px rgba(0,0,0,.08)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#8C7B6E', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <div style={{
        height: 26, background: '#1C1410', display: 'flex',
        alignItems: 'center', padding: '0 22px',
      }}>
        <div style={{ marginLeft: 'auto', fontSize: 9, color: '#3A302A', fontFamily: 'monospace' }}>
          LinkHub v1.0 · edu-verified · privacy-first
        </div>
      </div>
    </div>
  );
}