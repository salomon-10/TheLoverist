/**
 * Charge db/seed.sql sur la base pointée par DATABASE_URL.
 * Usage : npm run db:seed
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL n'est pas défini (voir .env.local).");
    process.exit(1);
  }

  const sql = neon(url);
  const seed = readFileSync(join(process.cwd(), "db", "seed.sql"), "utf-8");
  const statements = seed
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql(statement + ";");
  }

  console.log("Données de démonstration insérées.");
}

main().catch((err) => {
  console.error("Échec du seed :", err);
  process.exit(1);
});
