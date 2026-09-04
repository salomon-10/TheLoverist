# The Loverist

Plateforme web de publication de contenu avec une couche sociale complète — likes, commentaires à deux niveaux, réponses, republications, abonnements, sauvegardes et notifications.

MVP construit selon le cahier des charges fourni : Next.js (App Router) + TypeScript, PostgreSQL sur Neon, authentification via Stack Auth, Tailwind CSS.

## Fonctionnalités du MVP

- **Trois niveaux d'accès** vérifiés côté serveur : visiteur, utilisateur connecté, auteur.
- **Publications** : texte, image, lien, ou combinaison — avec brouillons privés à l'auteur.
- **Feed** : auteurs suivis en priorité, puis découverte par récence.
- **Social** : like (posts + commentaires), commentaires à 2 niveaux (commentaire → réponse), abonnements, sauvegardes privées, partage (lien), republication (distincte du partage, avec notification à l'auteur d'origine).
- **Notifications in-app** : lues/non lues, compteur, marquer comme lu.
- **Profil** : vue publique + statistiques auteur (publications, likes reçus, abonnés) calculées sur données réelles.
- **Sécurité** : toute action sensible (créer/modifier/supprimer une publication, liker, suivre, sauvegarder) est vérifiée côté serveur dans `src/actions/*` — jamais seulement dans l'UI. Les doublons de like/follow/save sont bloqués par des contraintes uniques en base.

**Hors scope pour ce MVP** (volontairement, voir cahier des charges) : vidéo, recherche/catégories avancées, algorithme de recommandation, messagerie privée, stories, live, marketplace, abonnement payant, publicité.

## Stack technique

- Next.js 14 (App Router), React 18, TypeScript strict
- PostgreSQL via [Neon](https://neon.tech) (`@neondatabase/serverless`)
- Authentification via [Stack Auth](https://stack-auth.com) (`@stackframe/stack`)
- Tailwind CSS
- Validation avec Zod

## Direction artistique

The Loverist suit un système éditorial clair : serif *Playfair Display* pour les titres, *Plus Jakarta Sans* pour le texte courant, fond quasi blanc, texte quasi noir, un unique accent bleu utilisé avec parcimonie (liens, focus), et un rouge réservé au seul état "aimé" pour rester lisible dans un fil social. Navigation en barre du haut pleine largeur sur desktop, barre d'onglets en bas sur mobile — pas de sidebar. Les jetons (couleurs, typographie, espacements) vivent dans `tailwind.config.ts`.

**Note sur les polices** : `next/font/google` télécharge les fichiers de police au build/démarrage — cela nécessite un accès réseau à `fonts.googleapis.com`. Si votre environnement local est hors-ligne, remplacez temporairement les imports `Playfair_Display`/`Plus_Jakarta_Sans` dans `src/app/layout.tsx` par une pile système (voir l'historique de ce projet pour l'exemple exact), le temps de développer sans réseau ; en production sur Vercel, le réseau est toujours disponible et les polices se chargent normalement.


## Architecture du projet

```
db/
  schema.sql        # schéma PostgreSQL complet (tables, contraintes, index, triggers)
  seed.sql           # données de démonstration (à ne jamais lancer en production)
  migrate.ts          # applique schema.sql sur DATABASE_URL
  seed.ts              # applique seed.sql sur DATABASE_URL
src/
  types/              # types TypeScript partagés (Post, Comment, Profile, Notification…)
  lib/                 # db client, session/auth, validation zod, utilitaires
  data/                # accès aux données — la SEULE couche qui écrit du SQL
  actions/             # Server Actions — permissions + validation + appels à data/
  components/
    ui/                # UserAvatar, EmptyState, LoadingState
    post/               # PostCard, PostComposer, PostActions, DraftCard
    comment/            # CommentSection, CommentItem, ReplyItem, CommentForm
    social/              # LikeButton, FollowButton, SaveButton, ShareButton, RepostButton
    notifications/       # NotificationItem, NotificationsClient
    layout/               # Navigation, Feed
    settings/, dashboard/
  app/                  # routes App Router (voir ci-dessous)
```

Séparation stricte : les composants ne contiennent jamais de SQL, les Server Actions ne contiennent jamais de logique d'affichage, et `src/data/*` est le seul point d'accès à la base.

### Routes

```
/                       feed (accueil)
/post/[id]              publication + commentaires
/profile/[username]     profil (vue membre ou auteur)
/login, /register        Stack Auth
/settings                 profil de l'utilisateur connecté
/bookmarks                 sauvegardes (privé)
/notifications              notifications (privé)
/create                      éditeur en pleine page (auteur)
/drafts                       gestion des brouillons (auteur)
/dashboard                     statistiques (auteur)
/handler/[...stack]              flux Stack Auth (reset mot de passe, etc.)
```

## Installation

```bash
npm install
cp .env.example .env.local
```

Renseignez `.env.local` :

| Variable | Où la trouver |
|---|---|
| `DATABASE_URL` | Neon Console → votre projet → Connection string (mode "pooled") |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Stack Auth Dashboard → Project → API Keys |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | idem |
| `STACK_SECRET_SERVER_KEY` | idem — clé serveur, ne jamais exposer côté client |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` en local |

### Base de données

Méthode recommandée (fiable pour les blocs `plpgsql` du schéma) :

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql   # optionnel, données de démo
```

Alternative sans `psql` installé :

```bash
npm run db:migrate
npm run db:seed
```

### Devenir auteur (premier compte)

Un nouveau compte est créé avec `is_author = false`. Pour tester les fonctionnalités auteur, promouvez votre profil après votre premier login :

```sql
update profiles set is_author = true where username = 'votre_username';
```

## Lancer en local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Build & déploiement (Vercel)

```bash
npm run build
```

1. Poussez le projet sur GitHub.
2. Importez-le dans Vercel.
3. Renseignez les mêmes variables d'environnement que `.env.local` dans les réglages du projet Vercel.
4. Déployez — le build Next.js standard suffit, aucune configuration supplémentaire n'est nécessaire.

Avant de considérer le projet prêt pour la production, vérifiez : le build (`npm run build`), les erreurs TypeScript, la connexion Neon, l'authentification Stack Auth de bout en bout, et les permissions par rôle (voir la checklist de tests ci-dessous).

## Checklist de tests fonctionnels

**Visiteur** : consulte le feed et les profils, voit les commentaires, peut partager — ne peut ni liker, ni commenter, ni suivre, ni sauvegarder (chaque tentative affiche "Connectez-vous pour continuer").

**Utilisateur connecté** : like, commente, répond, suit, sauvegarde, partage, republie, reçoit des notifications, modifie son profil dans `/settings`.

**Auteur** : crée/modifie/supprime une publication, gère ses brouillons (`/drafts`), consulte ses statistiques (`/dashboard`).

**Sécurité** : un utilisateur ne peut pas modifier/supprimer la publication d'un autre auteur, ni accéder aux brouillons d'un autre auteur (vérifié par `author_id` dans chaque Server Action) ; les doublons de like/follow/save sont impossibles au niveau base (contraintes `UNIQUE`).

## Évolutions prévues (V2, hors scope de ce MVP)

Le schéma et l'architecture sont pensés pour absorber sans réécriture : recherche et catégories avancées, galeries multi-images (`post_media` est déjà une table à part), algorithme de feed plus riche, hébergement vidéo, notifications email/push.
