import { NextResponse } from "next/server";
import { getFeed } from "@/data/posts";
import { getCurrentUser } from "@/lib/session";

/**
 * Route de diagnostic TEMPORAIRE.
 * Objectif : faire apparaître le vrai message d'erreur (masqué par Next.js
 * dans les Server Components en production) pour identifier pourquoi la
 * page d'accueil plante après une publication.
 * À SUPPRIMER une fois le bug identifié — ne doit jamais rester en prod.
 */
export async function GET() {
  const report: Record<string, unknown> = {};

  try {
    const user = await getCurrentUser();
    report.auth = { ok: true, userId: user?.id ?? null };
  } catch (err) {
    report.auth = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  try {
    const posts = await getFeed(null, 5, 0);
    report.feed = { ok: true, count: posts.length, sample: posts[0] ?? null };
  } catch (err) {
    report.feed = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split("\n").slice(0, 6) : null
    };
  }

  return NextResponse.json(report, { status: 200 });
}