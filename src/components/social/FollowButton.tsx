"use client";

import { useState, useTransition } from "react";
import { toggleFollowAction } from "@/actions/social";
import Button from "@/components/ui/Button";

export default function FollowButton({
  authorId,
  initialFollowing,
  isAuthenticated,
  isSelf
}: {
  authorId: string;
  initialFollowing: boolean;
  isAuthenticated: boolean;
  isSelf: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  if (isSelf) return null;

  function handleClick() {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      const result = await toggleFollowAction(authorId, next);
      if (!result.ok) setFollowing(!next);
    });
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      variant={following ? "secondary" : "primary"}
      aria-pressed={following}
    >
      {following ? "Abonné" : "Suivre"}
    </Button>
  );
}
