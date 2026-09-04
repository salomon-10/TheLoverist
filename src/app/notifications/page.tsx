import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getNotifications } from "@/data/notifications";
import NotificationsClient from "@/components/notifications/NotificationsClient";
import PageContainer from "@/components/layout/PageContainer";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await getNotifications(user.id);

  return (
    <PageContainer>
      <NotificationsClient notifications={notifications} />
    </PageContainer>
  );
}
