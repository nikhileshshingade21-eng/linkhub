-- ============================================
-- LinkHub Phase 1 MVP Database Schema
-- Tables: users, sessions, user_profiles,
--         squads, squad_members, opportunities
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS (auth core)
-- ============================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 2. SESSIONS (refresh tokens)
-- ============================================
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  user_agent    TEXT,
  ip_address    VARCHAR(45),
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);

-- ============================================
-- 3. USER PROFILES (identity layer)
-- ============================================
CREATE TABLE user_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  college       VARCHAR(200),
  branch        VARCHAR(200),
  year          VARCHAR(20),
  bio           TEXT DEFAULT '',
  skills        TEXT[] DEFAULT '{}',
  interests     TEXT[] DEFAULT '{}',
  socials       JSONB DEFAULT '{}',
  avatar_url    TEXT,
  is_onboarded  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_name ON user_profiles USING gin(to_tsvector('english', name));
CREATE INDEX idx_profiles_college ON user_profiles(college);
CREATE INDEX idx_profiles_skills ON user_profiles USING gin(skills);
CREATE INDEX idx_profiles_interests ON user_profiles USING gin(interests);

-- ============================================
-- 4. SQUADS (the killer feature)
-- ============================================
CREATE TABLE squads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  description   TEXT DEFAULT '',
  required_skills TEXT[] DEFAULT '{}',
  visibility    VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  max_members   INT DEFAULT 8,
  created_by    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_squads_created_by ON squads(created_by);
CREATE INDEX idx_squads_visibility ON squads(visibility);
CREATE INDEX idx_squads_name ON squads USING gin(to_tsvector('english', name));

-- ============================================
-- 5. SQUAD MEMBERS
-- ============================================
CREATE TABLE squad_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id      UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

CREATE INDEX idx_squad_members_squad ON squad_members(squad_id);
CREATE INDEX idx_squad_members_user ON squad_members(user_id);

-- ============================================
-- 6. OPPORTUNITIES (simple board)
-- ============================================
CREATE TABLE opportunities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(200) NOT NULL,
  description   TEXT NOT NULL,
  type          VARCHAR(30) NOT NULL CHECK (type IN ('hackathon', 'internship', 'event', 'gig')),
  tags          TEXT[] DEFAULT '{}',
  link          TEXT,
  deadline      TIMESTAMPTZ,
  posted_by     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_posted_by ON opportunities(posted_by);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_opportunities_tags ON opportunities USING gin(tags);

-- ============================================
-- Updated_at trigger (auto-update)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_squads_updated_at
  BEFORE UPDATE ON squads FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_opportunities_updated_at
  BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
