import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import SettingsForm from "@/components/settings/SettingsForm";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user || !user.profile) redirect("/login");

  return (
    <PageContainer>
      <PageHeader title="Paramètres du profil" />
      <SettingsForm profile={user.profile} />
    </PageContainer>
  );
}
