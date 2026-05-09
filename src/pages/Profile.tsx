import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePublicProfile } from '@/hooks/useQueries';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, loadProfile, updateProfile } = useAuthStore();

  const isOwnProfile = !id || id === user?.id;
  const { data: publicProfile, isLoading: loadingPublic } = usePublicProfile(isOwnProfile ? '' : (id || ''));

  const displayProfile = isOwnProfile ? profile : publicProfile;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', skills: '', socials: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOwnProfile && !profile) loadProfile();
  }, [isOwnProfile]);

  useEffect(() => {
    if (displayProfile && isOwnProfile) {
      setForm({
        bio: displayProfile.bio || '',
        skills: (displayProfile.skills || []).join(', '),
        socials: displayProfile.socials?.github || '',
      });
    }
  }, [displayProfile, isOwnProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        bio: form.bio,
        skills: form.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        socials: form.socials ? { github: form.socials } : {},
      });
      setEditing(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (!isOwnProfile && loadingPublic) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: '#8C7B6E', fontWeight: 600 }}>Loading profile...</div>
      </div>
    );
  }

  const p = displayProfile;

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #E8E0D5', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 6px rgba(0,0,0,.07)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 18px', height: 50, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 14, color: '#4A3F35' }}>← Back</button>
          <div className="gradient-brand" style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>✦</div>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Profile</span>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 18px' }}>
        {/* Profile card */}
        <div className="animate-rise" style={{ background: '#fff', border: '1px solid #E8E0D5', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,.06)' }}>
          {/* Banner */}
          <div style={{ height: 100, background: 'linear-gradient(135deg, #1A1040, #6D28D9, #EC4899)', position: 'relative' }}>
            <div style={{
              position: 'absolute', bottom: -28, left: 24,
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6D28D9, #9333EA)',
              border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 20,
              boxShadow: '0 4px 14px rgba(0,0,0,.15)',
            }}>
              {(p?.name || user?.name || '??').substring(0, 2).toUpperCase()}
            </div>
          </div>

          <div style={{ padding: '38px 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 2 }}>{p?.name || user?.name}</h1>
                <div style={{ fontSize: 12, color: '#8C7B6E' }}>
                  {p?.branch || 'Student'}{p?.college ? ` · ${p.college}` : ''}{p?.year ? ` · ${p.year}` : ''}
                </div>
              </div>
              {isOwnProfile && !editing && (
                <button onClick={() => setEditing(true)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: '1px solid #E8E0D5', background: '#FAF7F2', color: '#4A3F35' }}>
                  ✏️ Edit
                </button>
              )}
            </div>

            {/* Bio */}
            {editing ? (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4A3F35', display: 'block', marginBottom: 3 }}>Bio</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2}
                  style={{ width: '100%', background: '#FAF7F2', border: '1.5px solid #E8E0D5', borderRadius: 9, padding: '9px 12px', fontSize: 12, outline: 'none', resize: 'vertical' as const }} />
              </div>
            ) : p?.bio ? (
              <p style={{ fontSize: 13, color: '#4A3F35', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>"{p.bio}"</p>
            ) : null}

            {/* Skills */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8C7B6E', textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 6 }}>Skills</div>
              {editing ? (
                <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Python, Design..." 
                  style={{ width: '100%', background: '#FAF7F2', border: '1.5px solid #E8E0D5', borderRadius: 9, padding: '9px 12px', fontSize: 12, outline: 'none' }} />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {(p?.skills || []).length > 0 ? p.skills.map((s: string) => (
                    <span key={s} style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#0284C714', border: '1px solid #0284C728', color: '#0284C7' }}>{s}</span>
                  )) : <span style={{ fontSize: 11, color: '#8C7B6E' }}>No skills added yet</span>}
                </div>
              )}
            </div>

            {/* Interests */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8C7B6E', textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 6 }}>Interests</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {(p?.interests || []).length > 0 ? p.interests.map((i: string) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#6D28D914', border: '1px solid #6D28D928', color: '#6D28D9' }}>{i}</span>
                )) : <span style={{ fontSize: 11, color: '#8C7B6E' }}>No interests yet</span>}
              </div>
            </div>

            {/* Edit actions */}
            {editing && (
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setEditing(false)} style={{ flex: 1, padding: 9, borderRadius: 9, fontSize: 12, fontWeight: 700, border: '1px solid #E8E0D5', background: '#fff', color: '#4A3F35' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 9, borderRadius: 9, fontSize: 12, fontWeight: 700, border: 'none', background: 'linear-gradient(135deg, #6D28D9, #9333EA)', color: '#fff' }}>
                  {saving ? 'Saving...' : 'Save →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
