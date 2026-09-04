import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getAuthorStats, getPostsByAuthor } from "@/data/posts";
import StatCard from "@/components/dashboard/StatCard";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { formatCount } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile?.isAuthor) redirect("/");

  const [stats, publishedPosts] = await Promise.all([
    getAuthorStats(user.id),
    getPostsByAuthor(user.id, user.id, "published")
  ]);

  const topPosts = [...publishedPosts].sort((a, b) => b.likesCount - a.likesCount).slice(0, 5);

  return (
    <PageContainer width="column">
      <PageHeader title="Statistiques" />

      <div className="grid grid-cols-3 gap-3 py-stack-sm">
        <StatCard label="Publications" value={stats.postsCount} />
        <StatCard label="Likes reçus" value={stats.totalLikes} />
        <StatCard label="Abonnés" value={stats.followersCount} />
      </div>

      <div className="pb-stack-md">
        <h2 className="mb-3 font-display text-headline-sm text-ink">Publications les plus aimées</h2>
        {topPosts.length === 0 ? (
          <p className="font-sans text-body-md text-muted">
            Publiez du contenu pour voir apparaître vos statistiques ici.
          </p>
        ) : (
          <ol className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-paper shadow-card">
            {topPosts.map((post, index) => (
              <li
                key={post.id}
                className="transition-platform flex items-center gap-4 px-4 py-3.5 hover:bg-surface"
              >
                <span className="w-4 shrink-0 font-display text-body-md font-bold text-muted">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate font-sans text-body-md text-ink">
                  {post.content || "(publication sans texte)"}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 font-sans text-body-sm font-medium text-muted">
                  <Heart size={13} strokeWidth={1.75} className="fill-signal text-signal" />
                  {formatCount(post.likesCount)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </PageContainer>
  );
}
