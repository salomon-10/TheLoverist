/**
 * Applique db/schema.sql sur la base pointée par DATABASE_URL.
 * Usage : npm run db:migrate
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
  const schema = readFileSync(join(process.cwd(), "db", "schema.sql"), "utf-8");

  // neon() exécute une requête à la fois : on découpe sur les points-virgules
  // en fin de ligne, en ignorant les blocs de fonction plpgsql ($$ ... $$).
  const statements = schema
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql(statement + ";");
  }

  console.log(`Migration appliquée : ${statements.length} instructions exécutées.`);
}

main().catch((err) => {
  console.error("Échec de la migration :", err);
  process.exit(1);
});
