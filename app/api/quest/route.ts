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
    stats: Record<string, number>;
  }
> = {
  sport: {
    name: "Faire du sport",
    description:
      "Faire au moins 30 minutes d'activité physique.",
    xp: 50,
    coins: 25,
    stats: {
      force: 2,
      agilite: 1
    }
  },

  travail: {
    name: "Avancer sur un projet",
    description:
      "Consacrer du temps à un projet personnel ou professionnel.",
    xp: 60,
    coins: 30,
    stats: {
      intelligence: 2
    }
  },

  lecture: {
    name: "Lire",
    description:
      "Lire pendant au moins 20 minutes.",
    xp: 40,
    coins: 20,
    stats: {
      intelligence: 2,
      creativite: 1
    }
  },

  routine: {
    name: "Tenir sa routine",
    description:
      "Accomplir une tâche importante de ta journée.",
    xp: 30,
    coins: 15,
    stats: {
      discipline: 2
    }
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
    let coins =
      Number(player.coins) + quest.coins;

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

    // Mise à jour du joueur
    await sql`
      UPDATE players
      SET
        level = ${level},
        xp = ${xp},
        coins = ${coins},
        updated_at = NOW()
      WHERE id = ${player.id}
    `;

    // Récupération des statistiques actuelles
    const currentStats = await sql`
      SELECT
        force,
        intelligence,
        agilite,
        discipline,
        creativite,
        social
      FROM player_stats
      WHERE player_id = ${player.id}
      LIMIT 1
    `;

    if (!currentStats.length) {
      return NextResponse.json(
        {
          error:
            "Statistiques du joueur introuvables."
        },
        {
          status: 500
        }
      );
    }

    const stats = currentStats[0];

    const newForce = Math.min(
      100,
      Number(stats.force) +
        Number(quest.stats.force ?? 0)
    );

    const newIntelligence = Math.min(
      100,
      Number(stats.intelligence) +
        Number(quest.stats.intelligence ?? 0)
    );

    const newAgilite = Math.min(
      100,
      Number(stats.agilite) +
        Number(quest.stats.agilite ?? 0)
    );

    const newDiscipline = Math.min(
      100,
      Number(stats.discipline) +
        Number(quest.stats.discipline ?? 0)
    );

    const newCreativite = Math.min(
      100,
      Number(stats.creativite) +
        Number(quest.stats.creativite ?? 0)
    );

    const newSocial = Math.min(
      100,
      Number(stats.social) +
        Number(quest.stats.social ?? 0)
    );

    // Mise à jour des statistiques
    await sql`
      UPDATE player_stats
      SET
        force = ${newForce},
        intelligence = ${newIntelligence},
        agilite = ${newAgilite},
        discipline = ${newDiscipline},
        creativite = ${newCreativite},
        social = ${newSocial}
      WHERE player_id = ${player.id}
    `;

    return NextResponse.json({
      success: true,

      quest: quest.name,

      reward: {
        xp: quest.xp,
        coins: quest.coins
      },

      stats: {
        force: newForce,
        intelligence: newIntelligence,
        agilite: newAgilite,
        discipline: newDiscipline,
        creativite: newCreativite,
        social: newSocial
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
    console.error("Erreur quête:", error);

    return NextResponse.json(
      {
        error:
          "Impossible de valider la quête."
      },
      {
        status: 500
      }
    );
  }
}
