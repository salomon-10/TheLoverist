import { neon, neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

/**
 * Client SQL taggé, branché sur Neon.
 * Toute la couche `src/data/*` passe par ce point unique — aucune requête
 * SQL ne doit être écrite ailleurs (composants, actions).
 *
 * Usage : await sql`select * from posts where id = ${id}`
 */
function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL n'est pas défini. Copiez .env.example vers .env.local et renseignez votre URL Neon."
    );
  }
  return url;
}

export const sql = neon(getConnectionString());
