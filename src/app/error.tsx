"use client";

import { useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import Button from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <div role="alert" className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="font-display text-headline text-ink">Une erreur est survenue</p>
        <p className="max-w-sm font-sans text-body-md text-muted">
          Le chargement de cette page a échoué. Vous pouvez réessayer.
        </p>
        <Button type="button" onClick={() => reset()}>
          Réessayer
        </Button>
      </div>
    </PageContainer>
  );
}
