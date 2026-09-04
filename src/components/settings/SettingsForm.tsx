"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/actions/profile";
import Button from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import type { Profile } from "@/types";

export default function SettingsForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData();
    formData.set("displayName", displayName);
    formData.set("username", username);
    formData.set("bio", bio);
    formData.set("avatarUrl", avatarUrl);

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      setMessage(
        result.ok
          ? { type: "success", text: "Profil mis à jour." }
          : { type: "error", text: result.message ?? "Une erreur est survenue." }
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-6 rounded-lg border border-line bg-paper p-6 shadow-card">
      <Field label="Nom affiché">
        <TextInput value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
      </Field>

      <Field label="Nom d'utilisateur">
        <div className="flex items-center gap-1">
          <span className="font-sans text-body-md text-muted">@</span>
          <TextInput
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            maxLength={24}
          />
        </div>
      </Field>

      <Field label="Photo de profil (URL)">
        <TextInput
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://…"
        />
      </Field>

      {profile.isAuthor && (
        <Field label="Bio" hint={`${bio.length}/280`}>
          <TextArea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={3} />
        </Field>
      )}

      {message && (
        <p role="status" className={`font-sans text-body-md ${message.type === "success" ? "text-accent" : "text-signal"}`}>
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={isPending} size="md" className="px-6">
        Enregistrer
      </Button>
    </form>
  );
}
