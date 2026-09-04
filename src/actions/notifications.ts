"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import * as notificationsData from "@/data/notifications";
import type { ActionResult } from "@/types";

export async function markNotificationReadAction(notificationId: string): Promise<ActionResult> {
  const user = await requireUser();
  await notificationsData.markAsRead(notificationId, user.id);
  revalidatePath("/notifications");
  return { ok: true };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const user = await requireUser();
  await notificationsData.markAllAsRead(user.id);
  revalidatePath("/notifications");
  return { ok: true };
}
