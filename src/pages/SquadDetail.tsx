import { useParams, useNavigate } from 'react-router-dom';
import { useSquad, useJoinSquad, useLeaveSquad } from '@/hooks/useQueries';
import { useAuthStore } from '@/stores/authStore';

const ROLE_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  owner: { bg: '#6D28D918', color: '#6D28D9', label: '👑 Owner' },
  admin: { bg: '#0284C718', color: '#0284C7', label: '⚡ Admin' },
  member: { bg: '#05966918', color: '#059669', label: 'Member' },
};

export default function SquadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: squad, isLoading, refetch } = useSquad(id || '');
  const joinMutation = useJoinSquad();
  const leaveMutation = useLeaveSquad();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12, animation: 'pulse-soft 1.5s infinite' }}>🎯</div>
          <div style={{ fontSize: 13, color: '#8C7B6E', fontWeight: 600 }}>Loading squad...</div>
        </div>
      </div>
    );
  }

  if (!squad) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Squad not found</div>
          <button onClick={() => navigate('/squads')} style={{ marginTop: 14, padding: '8px 20px', borderRadius: 8, background: '#6D28D9', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700 }}>
            ← Back to Squads
          </button>
        </div>
      </div>
    );
  }

  const myMembership = squad.members?.find((m: any) => m.userId === user?.id);
  const isOwner = myMembership?.role === 'owner';
  const isMember = !!myMembership;
  const spotsLeft = (squad.maxMembers || 8) - (squad.memberCount || squad.members?.length || 0);

  const handleJoin = async () => { await joinMutation.mutateAsync(squad.id); refetch(); };
  const handleLeave = async () => { await leaveMutation.mutateAsync(squad.id); refetch(); };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E8E0D5', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 6px rgba(0,0,0,.07)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 18px', height: 50, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/squads')} style={{ background: 'none', border: 'none', fontSize: 14, color: '#4A3F35' }}>← Squads</button>
          <div style={{ flex: 1 }} />
          {isMember && !isOwner && (
            <button onClick={handleLeave} disabled={leaveMutation.isPending} style={{ padding: '5px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: '1px solid #E11D48', background: '#fff', color: '#E11D48' }}>
              Leave
            </button>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '20px 18px' }}>
        {/* Hero */}
        <div className="animate-rise" style={{ background: '#1A1040', borderRadius: 18, padding: '24px 24px 50px', marginBottom: -24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: squad.visibility === 'public' ? '#4ADE8028' : '#F4388528', color: squad.visibility === 'public' ? '#4ADE80' : '#F43885' }}>
              {squad.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
            </span>
            <span style={{ fontSize: 10, color: '#C4B5FD' }}>👥 {squad.memberCount || squad.members?.length}/{squad.maxMembers} members</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#FAF8FF', margin: '0 0 6px' }}>{squad.name}</h1>
          <p style={{ fontSize: 13, color: '#C4B5FD', opacity: .85, lineHeight: 1.6 }}>{squad.description || 'No description yet.'}</p>
        </div>

        {/* Content card */}
        <div style={{ background: '#fff', border: '1px solid #E8E0D5', borderRadius: 18, padding: '40px 22px 22px', boxShadow: '0 4px 18px rgba(0,0,0,.06)' }}>
          {/* Skills needed */}
          {(squad.requiredSkills || []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8C7B6E', textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 8 }}>
                Skills Needed
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {squad.requiredSkills.map((sk: string) => (
                  <span key={sk} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#6D28D912', border: '1px solid #6D28D928', color: '#6D28D9' }}>{sk}</span>
                ))}
              </div>
            </div>
          )}

          {/* Join CTA */}
          {!isMember && squad.visibility === 'public' && (
            <div style={{ background: 'linear-gradient(135deg, #6D28D908, #EC489908)', border: '1px solid #6D28D920', borderRadius: 14, padding: 18, marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
                {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} left!` : 'Squad is full'}
              </div>
              <div style={{ fontSize: 11, color: '#8C7B6E', marginBottom: 12 }}>
                Join this squad and start collaborating.
              </div>
              <button onClick={handleJoin} disabled={joinMutation.isPending || spotsLeft <= 0} style={{
                padding: '9px 28px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none',
                background: spotsLeft > 0 ? 'linear-gradient(135deg, #6D28D9, #9333EA)' : '#E8E0D5',
                color: spotsLeft > 0 ? '#fff' : '#8C7B6E',
              }}>
                {joinMutation.isPending ? 'Joining...' : spotsLeft > 0 ? 'Join Squad →' : 'Full'}
              </button>
            </div>
          )}

          {/* Members */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8C7B6E', textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 10 }}>
              Members ({squad.members?.length || 0})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(squad.members || []).map((m: any) => {
                const badge = ROLE_BADGE[m.role] || ROLE_BADGE.member;
                return (
                  <div key={m.userId} onClick={() => navigate(`/profile/${m.userId}`)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: '#FAF7F2', borderRadius: 10, cursor: 'pointer',
                    border: '1px solid #E8E0D5', transition: 'background .15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#F5F0E8'}
                  onMouseOut={e => e.currentTarget.style.background = '#FAF7F2'}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #6D28D944, #6D28D966)',
                      color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 11, border: '2px solid #6D28D9',
                    }}>
                      {m.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: badge.bg, color: badge.color,
                    }}>{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
