import { cookies } from "next/headers";
import { sql } from "./db";

export async function getOrCreatePlayer() {
  const cookieStore = await cookies();

  const existingId =
    cookieStore.get("lifequest_player_id")?.value;

  if (existingId) {
    const players = await sql`
      SELECT id, pseudo, level, xp, coins
      FROM players
      WHERE id = ${existingId}
      LIMIT 1
    `;

    if (players.length > 0) {
      return players[0];
    }
  }

  const players = await sql`
    INSERT INTO players (pseudo)
    VALUES ('Aventurier')
    RETURNING id, pseudo, level, xp, coins
  `;

  const player = players[0];

  await sql`
    INSERT INTO player_stats (player_id)
    VALUES (${player.id})
    ON CONFLICT (player_id) DO NOTHING
  `;

  return player;
}
