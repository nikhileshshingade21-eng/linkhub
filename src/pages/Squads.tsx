import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchSquads, useMySquads, useCreateSquad, useJoinSquad } from '@/hooks/useQueries';
import { useAuthStore } from '@/stores/authStore';

const ROLE_COLORS: Record<string, string> = { owner: '#6D28D9', admin: '#0284C7', member: '#059669' };

export default function SquadsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'discover' | 'mine'>('discover');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: searchRes, isLoading: searching } = useSearchSquads(
    search ? { q: search } : {}
  );
  const { data: mySquads, isLoading: loadingMine } = useMySquads();

  const squads = tab === 'mine' ? (mySquads || []) : (searchRes?.data || []);
  const isLoading = tab === 'mine' ? loadingMine : searching;

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
      <Header onBack={() => navigate('/')} />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '20px 18px' }}>
        {/* Hero */}
        <div className="animate-rise" style={{
          background: '#1A1040', borderRadius: 18, padding: '22px 24px 46px',
          marginBottom: -22, position: 'relative',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.09em', color: '#4ADE80', marginBottom: 8 }}>
            🎯 Squads
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#FAF8FF' }}>Find your team</div>
          <div style={{ fontSize: 12, color: '#C4B5FD', opacity: .8, marginTop: 4 }}>
            Join squads for hackathons, projects, startups, or just vibes.
          </div>
        </div>

        {/* Controls */}
        <div style={{
          background: '#fff', border: '1px solid #E8E0D5', borderRadius: 18,
          padding: '36px 20px 20px', boxShadow: '0 4px 18px rgba(0,0,0,.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            {/* Tabs */}
            {(['discover', 'mine'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, border: 'none',
                background: tab === t ? '#6D28D9' : '#FAF7F2',
                color: tab === t ? '#fff' : '#4A3F35',
              }}>
                {t === 'discover' ? '🔍 Discover' : '📁 My Squads'}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={() => setShowCreate(true)} style={{
              padding: '7px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none',
              background: 'linear-gradient(135deg, #6D28D9, #9333EA)', color: '#fff',
            }}>+ Create Squad</button>
          </div>

          {/* Search */}
          {tab === 'discover' && (
            <div style={{ marginBottom: 16 }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search squads by name, skill..."
                style={{
                  width: '100%', background: '#FAF7F2', border: '1.5px solid #E8E0D5',
                  borderRadius: 9, padding: '9px 12px', fontSize: 12, outline: 'none',
                }}
              />
            </div>
          )}

          {/* List */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8C7B6E', fontSize: 13 }}>Loading squads...</div>
          ) : squads.length === 0 ? (
            <EmptyState tab={tab} onCreate={() => setShowCreate(true)} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {squads.map((s: any) => (
                <SquadCard key={s.id} squad={s} userId={user?.id} onView={() => navigate(`/squads/${s.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateSquadModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function SquadCard({ squad: s, userId, onView }: { squad: any; userId?: string; onView: () => void }) {
  const joinMutation = useJoinSquad();
  const isMember = s.members?.some((m: any) => m.userId === userId);

  return (
    <div onClick={onView} style={{
      background: '#FAF7F2', border: '1px solid #E8E0D5', borderRadius: 14,
      padding: 16, cursor: 'pointer', transition: 'transform .15s, box-shadow .15s',
    }}
    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.07)'; }}
    onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{s.name}</div>
          <div style={{ fontSize: 11, color: '#4A3F35', lineHeight: 1.5, marginBottom: 8 }}>
            {s.description?.substring(0, 120)}{s.description?.length > 120 ? '...' : ''}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {(s.requiredSkills || []).slice(0, 5).map((sk: string) => (
              <span key={sk} style={{
                fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                background: '#6D28D914', border: '1px solid #6D28D928', color: '#6D28D9',
              }}>{sk}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, color: '#8C7B6E' }}>
            <span>👥 {s.memberCount || s.members?.length || 0}/{s.maxMembers}</span>
            <span style={{ color: s.visibility === 'private' ? '#E11D48' : '#059669' }}>
              {s.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
            </span>
          </div>
        </div>
        {!isMember && s.visibility === 'public' && (
          <button onClick={(e) => { e.stopPropagation(); joinMutation.mutate(s.id); }} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none',
            background: '#059669', color: '#fff', flexShrink: 0,
          }}>Join</button>
        )}
        {isMember && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', padding: '4px 10px', background: '#05966914', borderRadius: 6 }}>
            ✓ Joined
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ tab, onCreate }: { tab: string; onCreate: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{tab === 'mine' ? '🚀' : '🔍'}</div>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
        {tab === 'mine' ? "You're not in any squads yet" : 'No squads found'}
      </div>
      <div style={{ fontSize: 12, color: '#8C7B6E', marginBottom: 16 }}>
        {tab === 'mine'
          ? 'Create your own or discover public squads to join!'
          : 'Try a different search or create the first one.'}
      </div>
      <button onClick={onCreate} style={{
        padding: '8px 20px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none',
        background: 'linear-gradient(135deg, #6D28D9, #9333EA)', color: '#fff',
      }}>+ Create a Squad</button>
    </div>
  );
}

function CreateSquadModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [skills, setSkills] = useState('');
  const [vis, setVis] = useState<'public' | 'private'>('public');
  const createMutation = useCreateSquad();

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name, description: desc, visibility: vis,
      requiredSkills: skills.split(',').map(s => s.trim()).filter(Boolean),
    });
    onClose();
  };

  const inputStyle = {
    width: '100%', background: '#FAF7F2', border: '1.5px solid #E8E0D5',
    borderRadius: 9, padding: '9px 12px', fontSize: 12, outline: 'none',
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18,
    }}>
      <div onClick={e => e.stopPropagation()} className="animate-rise" style={{
        background: '#fff', borderRadius: 20, padding: '28px 28px', maxWidth: 440,
        width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.15)',
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Create Squad 🎯</h2>
        <p style={{ fontSize: 12, color: '#8C7B6E', marginBottom: 18 }}>Build your dream team.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 3 }}>Squad Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. AI Builders" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 3 }}>Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's this squad about?" rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 3 }}>Required Skills (comma-separated)</label>
            <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Python, UI Design" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 3 }}>Visibility</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['public', 'private'] as const).map(v => (
                <button key={v} onClick={() => setVis(v)} style={{
                  flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: `2px solid ${vis === v ? '#6D28D9' : '#E8E0D5'}`,
                  background: vis === v ? '#6D28D914' : '#fff',
                  color: vis === v ? '#6D28D9' : '#4A3F35',
                }}>
                  {v === 'public' ? '🌐 Public' : '🔒 Private'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 10, borderRadius: 10, fontSize: 12, fontWeight: 700,
            border: '1px solid #E8E0D5', background: '#fff', color: '#4A3F35',
          }}>Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || createMutation.isPending} style={{
            flex: 1, padding: 10, borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none',
            background: name.trim() ? 'linear-gradient(135deg, #6D28D9, #9333EA)' : '#E8E0D5',
            color: name.trim() ? '#fff' : '#8C7B6E',
          }}>
            {createMutation.isPending ? 'Creating...' : 'Create →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <header style={{
      background: '#fff', borderBottom: '1px solid #E8E0D5',
      position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 6px rgba(0,0,0,.07)',
    }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 18px', height: 50, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 14, color: '#4A3F35' }}>← Back</button>
        <div className="gradient-brand" style={{
          width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: '#fff',
        }}>✦</div>
        <span style={{ fontWeight: 800, fontSize: 15 }}>Squads</span>
      </div>
    </header>
  );
}
