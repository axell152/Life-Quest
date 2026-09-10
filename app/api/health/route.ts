import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL manquante" },
      { status: 500 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT NOW() AS now`;
    return NextResponse.json({ ok: true, database: "connected", now: result[0].now });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Connexion Neon impossible" },
      { status: 500 }
    );
  }
}