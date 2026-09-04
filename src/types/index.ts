// Types métier — The Loverist
// Ces types reflètent exactement le schéma défini dans db/schema.sql.

export type PostStatus = "draft" | "published";
export type PostType = "text" | "image" | "link";
export type NotificationType = "like" | "comment" | "reply" | "follow" | "repost";

/** Rôle applicatif dérivé de la session + du profil. Jamais fait confiance côté client. */
export type ViewerRole = "visitor" | "member" | "author";

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  isAuthor: boolean;
  createdAt: string;
}

export interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  totalLikesReceived: number;
  savedCount: number;
}

export interface PostMedia {
  id: string;
  url: string;
  altText: string;
  position: number;
}

export interface Post {
  id: string;
  authorId: string;
  author: Profile;
  type: PostType;
  content: string;
  linkUrl: string | null;
  media: PostMedia[];
  status: PostStatus;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  /** Rempli côté serveur pour le viewer courant — jamais dérivé côté client. */
  viewerHasLiked: boolean;
  viewerHasSaved: boolean;
  viewerHasReposted: boolean;
  /** Présent quand cette entrée de feed est une republication. */
  repostedBy?: Profile;
  repostedAt?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: Profile;
  parentCommentId: string | null;
  content: string;
  likesCount: number;
  createdAt: string;
  viewerHasLiked: boolean;
  replies: Comment[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  actor: Profile;
  postId: string | null;
  commentId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile | null;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  message?: string;
  data?: T;
}
