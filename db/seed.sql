-- Données de démonstration — clairement distinctes des données de production.
-- Ne pas exécuter en production. Usage : psql $DATABASE_URL -f db/seed.sql

INSERT INTO profiles (id, username, display_name, avatar_url, bio, is_author) VALUES
  ('seed_salomon', 'salomon', 'Salomon', 'https://i.pravatar.cc/150?u=salomon', 'Développeur full-stack. Je construis des choses.', TRUE),
  ('seed_amina', 'amina_k', 'Amina Koffi', 'https://i.pravatar.cc/150?u=amina', 'Design & produit.', TRUE),
  ('seed_marie', 'marie_d', 'Marie Dossou', 'https://i.pravatar.cc/150?u=marie', '', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO posts (id, author_id, type, content, status, published_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'seed_salomon', 'text', 'Premier post sur Threadline. On construit une vraie plateforme, pas une démo.', 'published', now() - interval '2 hours'),
  ('00000000-0000-0000-0000-000000000002', 'seed_amina', 'link', 'Un bon exemple d''architecture propre en Next.js App Router.', 'published', now() - interval '5 hours')
ON CONFLICT (id) DO NOTHING;

UPDATE posts SET link_url = 'https://nextjs.org/docs/app' WHERE id = '00000000-0000-0000-0000-000000000002';

INSERT INTO follows (follower_id, author_id) VALUES
  ('seed_marie', 'seed_salomon'),
  ('seed_marie', 'seed_amina')
ON CONFLICT DO NOTHING;
