import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrCreatePlayer } from "@/lib/player";

const quests: Record<
  string,
  {
    name: string;
    description: string;
    xp: number;
    coins: number;
  }
> = {
  sport: {
    name: "Faire du sport",
    description: "Faire au moins 30 minutes d'activité physique.",
    xp: 50,
    coins: 25
  },

  travail: {
    name: "Avancer sur un projet",
    description: "Consacrer du temps à un projet personnel ou professionnel.",
    xp: 60,
    coins: 30
  },

  lecture: {
    name: "Lire",
    description: "Lire pendant au moins 20 minutes.",
    xp: 40,
    coins: 20
  },

  routine: {
    name: "Tenir sa routine",
    description: "Accomplir une tâche importante de ta journée.",
    xp: 30,
    coins: 15
  }
};

export async function POST(request: Request) {
  try {
    const player = await getOrCreatePlayer();

    const body = await request.json();

    const questId = String(body.questId ?? "");

    const quest = quests[questId];

    if (!quest) {
      return NextResponse.json(
        {
          error: "Quête introuvable."
        },
        {
          status: 404
        }
      );
    }

    const currentLevel = Number(player.level);
    const currentXp = Number(player.xp);

    let level = currentLevel;
    let xp = currentXp + quest.xp;
    let coins = Number(player.coins) + quest.coins;

    let leveledUp = false;
    let levelsGained = 0;

    function xpRequired(level: number) {
      return 100 + (level - 1) * 50;
    }

    while (xp >= xpRequired(level)) {
      xp -= xpRequired(level);

      level++;
      levelsGained++;
      leveledUp = true;

      // Bonus de pièces à chaque niveau
      coins += 50;
    }

    await sql`
      UPDATE players

      SET
        level = ${level},
        xp = ${xp},
        coins = ${coins},
        updated_at = NOW()

      WHERE id = ${player.id}
    `;

    return NextResponse.json({
      success: true,

      quest: quest.name,

      reward: {
        xp: quest.xp,
        coins: quest.coins
      },

      player: {
        level,
        xp,
        coins
      },

      leveledUp,
      levelsGained
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Impossible de valider la quête."
      },
      {
        status: 500
      }
    );
  }
}
