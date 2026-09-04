import Link from "next/link";
import { SignUp } from "@stackframe/stack";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface px-margin-mobile py-stack-xl">
      <div className="w-full max-w-sm rounded-lg border border-line bg-paper p-8 shadow-card">
        <h1 className="mb-6 text-center font-display text-headline text-ink">Créer un compte</h1>
        <SignUp />
        <p className="mt-6 text-center font-sans text-body-md text-muted">
          Déjà inscrit ?{" "}
          <Link href="/login" className="focus-ring rounded font-semibold text-accent hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
