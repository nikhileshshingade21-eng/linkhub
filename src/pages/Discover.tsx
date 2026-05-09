import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchUsers } from '@/hooks/useQueries';
import { useAuthStore } from '@/stores/authStore';

const SUGGESTED_SEARCHES = [
  { label: '🧠 AI & Tech', q: 'ai' },
  { label: '💻 Developers', q: 'coding' },
  { label: '🎨 Designers', q: 'art' },
  { label: '📈 Business', q: 'business' },
  { label: '🏆 Hackathons', q: 'hackathon' },
];

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (activeFilter) params.interest = activeFilter;

  const { data: res, isLoading } = useSearchUsers(params);
  const users = res?.data || [];

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #E8E0D5', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 6px rgba(0,0,0,.07)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 18px', height: 50, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: 14, color: '#4A3F35' }}>← Back</button>
          <div className="gradient-brand" style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>✦</div>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Discover</span>
        </div>
      </header>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '20px 18px' }}>
        {/* Hero */}
        <div className="animate-rise" style={{ background: '#1A1040', borderRadius: 18, padding: '22px 24px 46px', marginBottom: -22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.09em', color: '#F5C842', marginBottom: 8 }}>🔍 Discover</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#FAF8FF' }}>Find your people</div>
          <div style={{ fontSize: 12, color: '#C4B5FD', opacity: .8, marginTop: 4 }}>Students who share your interests, skills, and ambitions.</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E8E0D5', borderRadius: 18, padding: '36px 20px 20px', boxShadow: '0 4px 18px rgba(0,0,0,.06)' }}>
          {/* Search */}
          <input value={search} onChange={e => { setSearch(e.target.value); setActiveFilter(''); }}
            placeholder="Search by name, college, skill..."
            style={{ width: '100%', background: '#FAF7F2', border: '1.5px solid #E8E0D5', borderRadius: 9, padding: '9px 12px', fontSize: 12, outline: 'none', marginBottom: 12 }} />

          {/* Quick filters */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {SUGGESTED_SEARCHES.map(s => (
              <button key={s.q} onClick={() => { setActiveFilter(s.q); setSearch(''); }}
                style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1.5px solid ${activeFilter === s.q ? '#6D28D9' : '#E8E0D5'}`, background: activeFilter === s.q ? '#6D28D914' : '#fff', color: activeFilter === s.q ? '#6D28D9' : '#4A3F35' }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Results */}
          {!search && !activeFilter ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🌍</div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Start exploring</div>
              <div style={{ fontSize: 12, color: '#8C7B6E' }}>Search for students or tap a filter above.</div>
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8C7B6E', fontSize: 13 }}>Searching...</div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>No one found</div>
              <div style={{ fontSize: 12, color: '#8C7B6E' }}>Try a different search term.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {users.map((u: any) => (
                <div key={u.id} onClick={() => navigate(`/profile/${u.id}`)}
                  style={{ background: '#FAF7F2', border: '1px solid #E8E0D5', borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.07)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #6D28D944, #6D28D966)', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, border: '2px solid #6D28D9' }}>
                      {u.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: 10, color: '#8C7B6E' }}>{u.college || 'Student'}</div>
                    </div>
                  </div>
                  {u.bio && <div style={{ fontSize: 11, color: '#4A3F35', marginBottom: 8, lineHeight: 1.5 }}>{u.bio.substring(0, 80)}{u.bio.length > 80 ? '...' : ''}</div>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {(u.interests || []).slice(0, 3).map((i: string) => (
                      <span key={i} style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 20, background: '#6D28D914', color: '#6D28D9' }}>{i}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
