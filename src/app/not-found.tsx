import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageContainer>
      <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="font-display text-display-md text-ink">404</p>
        <p className="max-w-xs font-sans text-body-md text-muted">
          Cette page n'existe pas ou a été supprimée.
        </p>
        <Link href="/">
          <Button type="button">Retour à l'accueil</Button>
        </Link>
      </div>
    </PageContainer>
  );
}
