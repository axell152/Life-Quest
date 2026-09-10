import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrCreatePlayer } from "@/lib/player";

export async function GET() {
  const items = await sql`
    SELECT
      id,
      name,
      description,
      price,
      emoji,
      category
    FROM shop_items
    WHERE active = TRUE
    ORDER BY category, price
  `;

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const player = await getOrCreatePlayer();

  const body = await request.json();

  const itemId = String(
    body.itemId ?? ""
  );

  const items = await sql`
    SELECT
      id,
      name,
      price
    FROM shop_items
    WHERE id = ${itemId}
      AND active = TRUE
    LIMIT 1
  `;

  if (!items.length) {
    return NextResponse.json(
      { error: "Objet introuvable" },
      { status: 404 }
    );
  }

  const item = items[0];

  const updated = await sql`
    UPDATE players

    SET
      coins = coins - ${item.price},
      updated_at = NOW()

    WHERE id = ${player.id}
      AND coins >= ${item.price}

    RETURNING coins
  `;

  if (!updated.length) {
    return NextResponse.json(
      { error: "Pas assez de pièces" },
      { status: 400 }
    );
  }

  await sql`
    INSERT INTO inventory
      (player_id, item_id, quantity)

    VALUES
      (${player.id}, ${item.id}, 1)

    ON CONFLICT (player_id, item_id)

    DO UPDATE SET
      quantity =
        inventory.quantity + 1
  `;

  return NextResponse.json({
    ok: true,
    coins: updated[0].coins,
    item: item.name
  });
}
