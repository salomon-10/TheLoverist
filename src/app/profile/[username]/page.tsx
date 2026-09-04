import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getProfileByUsername, getProfileStats } from "@/data/profiles";
import { getPostsByAuthor } from "@/data/posts";
import { isFollowing } from "@/data/social";
import UserAvatar from "@/components/ui/UserAvatar";
import InlineStat from "@/components/ui/InlineStat";
import FollowButton from "@/components/social/FollowButton";
import Feed from "@/components/layout/Feed";
import PageContainer from "@/components/layout/PageContainer";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfileByUsername(params.username);
  if (!profile) notFound();

  const currentUser = await getCurrentUser();

  const [stats, posts, following] = await Promise.all([
    getProfileStats(profile.id),
    getPostsByAuthor(profile.id, currentUser?.id ?? null),
    currentUser ? isFollowing(currentUser.id, profile.id) : Promise.resolve(false)
  ]);

  return (
    <PageContainer>
      <div className="mt-4 rounded-lg border border-line bg-paper p-6 shadow-card">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <UserAvatar src={profile.avatarUrl} name={profile.displayName} size="lg" />
            <div>
              <p className="font-display text-headline text-ink">{profile.displayName}</p>
              <p className="font-sans text-body-md text-muted">@{profile.username}</p>
            </div>
          </div>
          <FollowButton
            authorId={profile.id}
            initialFollowing={following}
            isAuthenticated={Boolean(currentUser)}
            isSelf={currentUser?.id === profile.id}
          />
        </div>

        {profile.isAuthor && profile.bio && (
          <p className="mt-5 max-w-reading font-sans text-body-lg text-ink">{profile.bio}</p>
        )}

        <div className="mt-5 flex flex-wrap gap-8 border-t border-line pt-5">
          <InlineStat label="Publications" value={stats.postsCount} />
          {profile.isAuthor && (
            <>
              <InlineStat label="Abonnés" value={stats.followersCount} />
              <InlineStat label="Suivis" value={stats.followingCount} />
              <InlineStat label="Likes reçus" value={stats.totalLikesReceived} />
            </>
          )}
        </div>
      </div>

      <div className="pt-2">
        <Feed posts={posts} isAuthenticated={Boolean(currentUser)} emptyTitle="Aucune publication pour le moment." />
      </div>
    </PageContainer>
  );
}
