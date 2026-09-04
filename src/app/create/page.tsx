import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import PostComposer from "@/components/post/PostComposer";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

export default async function CreatePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile?.isAuthor) redirect("/");

  return (
    <PageContainer>
      <PageHeader title="Nouvelle publication" />
      <PostComposer author={user.profile} />
    </PageContainer>
  );
}
