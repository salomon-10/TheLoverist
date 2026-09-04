"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsReadAction } from "@/actions/notifications";
import NotificationItem from "@/components/notifications/NotificationItem";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";
import type { Notification } from "@/types";

export default function NotificationsClient({ notifications }: { notifications: Notification[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const hasUnread = notifications.some((n) => !n.isRead);

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        action={
          hasUnread ? (
            <Button type="button" variant="ghost" size="sm" onClick={handleMarkAll} disabled={isPending}>
              Tout marquer comme lu
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState title="Vous êtes à jour." />
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-paper shadow-card">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
