import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchOpportunities, useCreateOpportunity } from '@/hooks/useQueries';

const TYPE_META: Record<string, { icon: string; color: string }> = {
  hackathon: { icon: '🏆', color: '#8B5CF6' },
  internship: { icon: '💼', color: '#0284C7' },
  event: { icon: '🎉', color: '#F97316' },
  gig: { icon: '💰', color: '#059669' },
};

export default function OpportunitiesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const params: Record<string, string> = {};
  if (search) params.q = search;
  if (typeFilter) params.type = typeFilter;

  const { data: res, isLoading } = useSearchOpportunities(params);
  const opps = res?.data || [];

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #E8E0D5', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 6px rgba(0,0,0,.07)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 18px', height: 50, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: 14, color: '#4A3F35' }}>← Back</button>
          <div className="gradient-brand" style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>✦</div>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Opportunities</span>
        </div>
      </header>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '20px 18px' }}>
        <div className="animate-rise" style={{ background: '#1A1040', borderRadius: 18, padding: '22px 24px 46px', marginBottom: -22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.09em', color: '#38BDF8', marginBottom: 8 }}>🚀 Opportunities</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#FAF8FF' }}>Don't miss out</div>
          <div style={{ fontSize: 12, color: '#C4B5FD', opacity: .8, marginTop: 4 }}>Hackathons, internships, gigs, and events — all in one place.</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E8E0D5', borderRadius: 18, padding: '36px 20px 20px', boxShadow: '0 4px 18px rgba(0,0,0,.06)' }}>
          {/* Controls */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search opportunities..."
              style={{ flex: 1, minWidth: 180, background: '#FAF7F2', border: '1.5px solid #E8E0D5', borderRadius: 9, padding: '8px 12px', fontSize: 12, outline: 'none' }} />
            <button onClick={() => setShowCreate(true)} style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', background: 'linear-gradient(135deg, #6D28D9, #9333EA)', color: '#fff' }}>
              + Post
            </button>
          </div>

          {/* Type filters */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={() => setTypeFilter('')} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1.5px solid ${!typeFilter ? '#6D28D9' : '#E8E0D5'}`, background: !typeFilter ? '#6D28D914' : '#fff', color: !typeFilter ? '#6D28D9' : '#4A3F35' }}>All</button>
            {Object.entries(TYPE_META).map(([type, meta]) => (
              <button key={type} onClick={() => setTypeFilter(type)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1.5px solid ${typeFilter === type ? meta.color : '#E8E0D5'}`, background: typeFilter === type ? meta.color + '14' : '#fff', color: typeFilter === type ? meta.color : '#4A3F35' }}>
                {meta.icon} {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8C7B6E', fontSize: 13 }}>Loading...</div>
          ) : opps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>No opportunities yet</div>
              <div style={{ fontSize: 12, color: '#8C7B6E', marginBottom: 16 }}>Be the first to post one!</div>
              <button onClick={() => setShowCreate(true)} style={{ padding: '8px 20px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', background: 'linear-gradient(135deg, #6D28D9, #9333EA)', color: '#fff' }}>+ Post Opportunity</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {opps.map((o: any) => {
                const meta = TYPE_META[o.type] || TYPE_META.event;
                return (
                  <div key={o.id} style={{ background: '#FAF7F2', border: '1px solid #E8E0D5', borderRadius: 14, padding: 16, transition: 'transform .15s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseOut={e => e.currentTarget.style.transform = ''}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: meta.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{meta.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{o.title}</div>
                        <div style={{ fontSize: 11, color: '#4A3F35', lineHeight: 1.5, marginBottom: 8 }}>{o.description?.substring(0, 150)}{o.description?.length > 150 ? '...' : ''}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                          {(o.tags || []).slice(0, 4).map((t: string) => (
                            <span key={t} style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: meta.color + '14', color: meta.color }}>{t}</span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#8C7B6E' }}>
                          <span>by {o.postedBy?.name || 'Unknown'}</span>
                          {o.deadline && <span>⏰ {new Date(o.deadline).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      {o.link && (
                        <a href={o.link} target="_blank" rel="noopener" onClick={e => e.stopPropagation()} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: meta.color, color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
                          Apply →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateOppModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateOppModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<string>('hackathon');
  const [tags, setTags] = useState('');
  const [link, setLink] = useState('');
  const createMutation = useCreateOpportunity();

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      title, description: desc, type,
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
      link: link || null,
    });
    onClose();
  };

  const inputStyle = { width: '100%', background: '#FAF7F2', border: '1.5px solid #E8E0D5', borderRadius: 9, padding: '9px 12px', fontSize: 12, outline: 'none' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
      <div onClick={e => e.stopPropagation()} className="animate-rise" style={{ background: '#fff', borderRadius: 20, padding: '28px', maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Post Opportunity 🚀</h2>
        <p style={{ fontSize: 12, color: '#8C7B6E', marginBottom: 18 }}>Share with the community.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 3 }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. AI Hackathon 2026" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 3 }}>Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's this about?" rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 3 }}>Type</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(TYPE_META).map(([t, meta]) => (
                <button key={t} onClick={() => setType(t)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: `2px solid ${type === t ? meta.color : '#E8E0D5'}`, background: type === t ? meta.color + '14' : '#fff', color: type === t ? meta.color : '#4A3F35' }}>
                  {meta.icon} {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 3 }}>Tags (comma-separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. AI, ML, Cash Prize" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 3 }}>Link (optional)</label>
            <input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 12, fontWeight: 700, border: '1px solid #E8E0D5', background: '#fff', color: '#4A3F35' }}>Cancel</button>
          <button onClick={handleCreate} disabled={!title.trim() || !desc.trim() || createMutation.isPending} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', background: title.trim() && desc.trim() ? 'linear-gradient(135deg, #6D28D9, #9333EA)' : '#E8E0D5', color: title.trim() && desc.trim() ? '#fff' : '#8C7B6E' }}>
            {createMutation.isPending ? 'Posting...' : 'Post →'}
          </button>
        </div>
      </div>
    </div>
  );
}
