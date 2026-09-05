-- The Loverist — schema PostgreSQL (Neon)
-- Convention : les identités utilisateur (id, email) sont gérées par Stack Auth.
-- Cette base ne stocke jamais de mot de passe : "profiles.id" == l'id utilisateur Stack Auth.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- PROFILES — miroir applicatif d'un utilisateur Stack Auth
-- =========================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            TEXT PRIMARY KEY,               -- = Stack Auth user id
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  bio           TEXT DEFAULT '',
  is_author     BOOLEAN NOT NULL DEFAULT FALSE,  -- rôle auteur (permissions serveur)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles (username);

-- =========================================================
-- POSTS
-- =========================================================
CREATE TYPE post_status AS ENUM ('draft', 'published');
CREATE TYPE post_type   AS ENUM ('text', 'image', 'link');

CREATE TABLE IF NOT EXISTS posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            post_type NOT NULL DEFAULT 'text',
  content         TEXT NOT NULL DEFAULT '',
  link_url        TEXT,
  status          post_status NOT NULL DEFAULT 'draft',
  likes_count     INTEGER NOT NULL DEFAULT 0,
  comments_count  INTEGER NOT NULL DEFAULT 0,
  reposts_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts (status, published_at DESC);

-- =========================================================
-- Migration V2 : contenu structuré en blocs (éditeur riche)
-- =========================================================
-- posts.content passe de TEXT (texte brut) à JSONB : un document
-- ProseMirror/Tiptap de la forme { "type": "doc", "content": [...blocs] }.
-- Idempotent — ne s'exécute que si la colonne est encore TEXT — et convertit
-- chaque publication existante en un document à un seul bloc paragraphe pour
-- ne perdre aucun contenu. Comme pour les triggers plpgsql ci-dessous,
-- appliquer via `psql -f db/schema.sql` plutôt que `npm run db:migrate`
-- (voir README) : ce bloc contient des points-virgules internes que le
-- découpage naïf de `db/migrate.ts` ne gère pas correctement.
DO $$
BEGIN
  IF (
    SELECT data_type FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'content'
  ) = 'text' THEN
    ALTER TABLE posts ALTER COLUMN content DROP DEFAULT;
    ALTER TABLE posts ALTER COLUMN content TYPE JSONB USING (
      CASE
        WHEN content IS NULL OR content = '' THEN '{"type":"doc","content":[]}'::jsonb
        ELSE jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object('type', 'text', 'text', content)
              )
            )
          )
        )
      END
    );
    ALTER TABLE posts ALTER COLUMN content SET DEFAULT '{"type":"doc","content":[]}'::jsonb;
  END IF;
END $$;
git
-- Médias d'une publication (une image pour le MVP, table prévue pour galeries en V2)
CREATE TABLE IF NOT EXISTS post_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT DEFAULT '',
  position    SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_media_post ON post_media (post_id);

-- =========================================================
-- COMMENTS — deux niveaux exactement (commentaire / réponse)
-- =========================================================
CREATE TABLE IF NOT EXISTS comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id         TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- NULL = commentaire principal
  content           TEXT NOT NULL,
  likes_count       INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- une réponse ne peut pas elle-même avoir un parent qui est déjà une réponse
  CONSTRAINT chk_reply_depth CHECK (id <> parent_comment_id)
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments (parent_comment_id);

-- =========================================================
-- LIKES — polymorphe : publication OU commentaire, jamais les deux
-- =========================================================
CREATE TABLE IF NOT EXISTS likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id     UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id  UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_like_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT uq_like_user_post UNIQUE (user_id, post_id),
  CONSTRAINT uq_like_user_comment UNIQUE (user_id, comment_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_post ON likes (post_id);
CREATE INDEX IF NOT EXISTS idx_likes_comment ON likes (comment_id);

-- =========================================================
-- FOLLOWS
-- =========================================================
CREATE TABLE IF NOT EXISTS follows (
  follower_id  TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_id    TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, author_id),
  CONSTRAINT chk_no_self_follow CHECK (follower_id <> author_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_author ON follows (author_id);

-- =========================================================
-- SAVES (bookmarks) — privées
-- =========================================================
CREATE TABLE IF NOT EXISTS saves (
  user_id     TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- =========================================================
-- REPOSTS — référence à la publication d'origine, pas une copie
-- =========================================================
CREATE TABLE IF NOT EXISTS reposts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_repost_user_post UNIQUE (user_id, original_post_id)
);

CREATE INDEX IF NOT EXISTS idx_reposts_user ON reposts (user_id, created_at DESC);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'reply', 'follow', 'repost');

CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id        TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  post_id         UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id      UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (recipient_id, is_read);

-- =========================================================
-- Triggers : updated_at automatique sur profiles / posts
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
