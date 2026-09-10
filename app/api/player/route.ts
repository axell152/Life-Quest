import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrCreatePlayer } from "@/lib/player";

export async function GET() {
  const player = await getOrCreatePlayer();

  const stats = await sql`
    SELECT
      force,
      intelligence,
      agilite,
      discipline,
      creativite,
      social
    FROM player_stats
    WHERE player_id = ${player.id}
  `;

  const inventory = await sql`
    SELECT
      inventory.item_id,
      inventory.quantity,
      shop_items.name,
      shop_items.description,
      shop_items.price,
      shop_items.emoji,
      shop_items.category
    FROM inventory
    JOIN shop_items
      ON shop_items.id = inventory.item_id
    WHERE inventory.player_id = ${player.id}
    ORDER BY inventory.id DESC
  `;

  const response = NextResponse.json({
    player,
    stats: stats[0],
    inventory
  });

  response.cookies.set(
    "lifequest_player_id",
    String(player.id),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365
    }
  );

  return response;
}

export async function PATCH(request: Request) {
  const player = await getOrCreatePlayer();

  const body = await request.json();

  const pseudo = String(
    body.pseudo ?? ""
  )
    .trim()
    .slice(0, 30);

  if (!pseudo) {
    return NextResponse.json(
      { error: "Pseudo invalide" },
      { status: 400 }
    );
  }

  await sql`
    UPDATE players
    SET
      pseudo = ${pseudo},
      updated_at = NOW()
    WHERE id = ${player.id}
  `;

  return NextResponse.json({
    ok: true,
    pseudo
  });
}
