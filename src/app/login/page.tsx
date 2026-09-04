import Link from "next/link";
import { SignIn } from "@stackframe/stack";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface px-margin-mobile py-stack-xl">
      <div className="w-full max-w-sm rounded-lg border border-line bg-paper p-8 shadow-card">
        <h1 className="mb-6 text-center font-display text-headline text-ink">Content de vous revoir</h1>
        <SignIn />
        <p className="mt-6 text-center font-sans text-body-md text-muted">
          Pas encore de compte ?{" "}
          <Link href="/register" className="focus-ring rounded font-semibold text-accent hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
