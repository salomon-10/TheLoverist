"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { profileUpdateSchema } from "@/lib/validation";
import * as profilesData from "@/data/profiles";
import type { ActionResult } from "@/types";

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = profileUpdateSchema.safeParse({
    displayName: formData.get("displayName")?.toString() ?? "",
    username: formData.get("username")?.toString() ?? "",
    bio: formData.get("bio")?.toString() ?? "",
    avatarUrl: formData.get("avatarUrl")?.toString() ?? ""
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Profil invalide." };
  }

  const taken = await profilesData.isUsernameTaken(parsed.data.username, user.id);
  if (taken) {
    return { ok: false, message: "Ce nom d'utilisateur est déjà pris." };
  }

  await profilesData.updateProfile(user.id, {
    displayName: parsed.data.displayName,
    username: parsed.data.username,
    bio: parsed.data.bio,
    avatarUrl: parsed.data.avatarUrl ?? ""
  });

  revalidatePath("/settings");
  revalidatePath(`/profile/${parsed.data.username}`);
  return { ok: true };
}
