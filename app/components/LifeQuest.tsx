"use client";

import { useEffect, useMemo, useState } from "react";

type Stats = {
  force: number;
  intelligence: number;
  agilite: number;
  discipline: number;
  creativite: number;
  social: number;
};

type Quest = {
  id: string;
  title: string;
  description: string;
  xp: number;
  stat: keyof Stats;
  completed: boolean;
};

type Player = {
  id: string;
  pseudo: string;
  level: number;
  xp: number;
  coins: number;
  stats: Stats;
  quests: Quest[];
};

const emptyStats: Stats = {
  force: 1,
  intelligence: 1,
  agilite: 1,
  discipline: 1,
  creativite: 1,
  social: 1
};

const starterQuests: Quest[] = [
  {
    id: "q1",
    title: "Bouger 20 minutes",
    description: "Marche, sport ou activité physique.",
    xp: 30,
    stat: "force",
    completed: false
  },
  {
    id: "q2",
    title: "Lire 10 pages",
    description: "Apprends quelque chose de nouveau.",
    xp: 25,
    stat: "intelligence",
    completed: false
  },
  {
    id: "q3",
    title: "Faire une tâche importante",
    description: "Une tâche que tu repousses depuis trop longtemps.",
    xp: 40,
    stat: "discipline",
    completed: false
  }
];

const statLabels: Record<keyof Stats, string> = {
  force: "💪 Force",
  intelligence: "🧠 Intelligence",
  agilite: "⚡ Agilité",
  discipline: "❤️ Discipline",
  creativite: "🎨 Créativité",
  social: "🤝 Social"
};

function xpForNextLevel(level: number) {
  return 100 + (level - 1) * 50;
}

function createLocalPlayer(): Player {
  return {
    id: crypto.randomUUID(),
    pseudo: "Aventurier",
    level: 1,
    xp: 0,
    coins: 0,
    stats: { ...emptyStats },
    quests: starterQuests.map(q => ({ ...q }))
  };
}

export default function LifeQuest() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [pseudo, setPseudo] = useState("");
  const [newQuest, setNewQuest] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("lifequest-player");
    if (raw) {
      try {
        setPlayer(JSON.parse(raw));
      } catch {
        localStorage.removeItem("lifequest-player");
      }
    }
  }, []);

  useEffect(() => {
    if (player) {
      localStorage.setItem("lifequest-player", JSON.stringify(player));
    }
  }, [player]);

  const currentLevelXp = useMemo(
    () => (player ? xpForNextLevel(player.level) : 100),
    [player]
  );

  function startGame() {
    const p = createLocalPlayer();
    p.pseudo = pseudo.trim() || "Aventurier";
    setPlayer(p);
    setNotice("Personnage créé. Ta première aventure commence !");
  }

  function addXp(amount: number, stat: keyof Stats) {
    if (!player) return;

    let xp = player.xp + amount;
    let level = player.level;
    let coins = player.coins + Math.max(1, Math.round(amount / 10));
    const stats = { ...player.stats, [stat]: Math.min(100, player.stats[stat] + 1) };

    while (xp >= xpForNextLevel(level)) {
      xp -= xpForNextLevel(level);
      level += 1;
      coins += 25;
    }

    setPlayer({ ...player, xp, level, coins, stats });
  }

  function completeQuest(id: string) {
    if (!player) return;

    const quest = player.quests.find(q => q.id === id);
    if (!quest || quest.completed) return;

    setPlayer({
      ...player,
      quests: player.quests.map(q =>
        q.id === id ? { ...q, completed: true } : q
      )
    });

    addXp(quest.xp, quest.stat);
    setNotice(`Quête terminée : +${quest.xp} XP`);
  }

  function createQuest() {
    if (!player || !newQuest.trim()) return;

    const quest: Quest = {
      id: crypto.randomUUID(),
      title: newQuest.trim(),
      description: "Quête personnelle",
      xp: 20,
      stat: "discipline",
      completed: false
    };

    setPlayer({ ...player, quests: [quest, ...player.quests] });
    setNewQuest("");
  }

  function reset() {
    localStorage.removeItem("lifequest-player");
    setPlayer(null);
    setNotice("");
  }

  if (!player) {
    return (
      <main className="shell">
        <div className="card" style={{ maxWidth: 620, margin: "12vh auto" }}>
          <div className="level">LIFEQUEST</div>
          <h1>Transforme ta vie en RPG.</h1>
          <p className="muted">
            Chaque objectif devient une quête. Chaque action te donne de l'XP.
            Ton personnage progresse avec toi.
          </p>

          <div className="form">
            <input
              className="input"
              value={pseudo}
              onChange={e => setPseudo(e.target.value)}
              placeholder="Ton pseudo"
              maxLength={30}
            />
            <button className="btn" onClick={startGame}>
              Créer mon personnage
            </button>
          </div>

          <p className="muted" style={{ marginTop: 18, fontSize: 13 }}>
            V1 : sauvegarde locale dans ton navigateur. La base Neon sera
            branchée ensuite pour la sauvegarde cloud.
          </p>
        </div>
      </main>
    );
  }

  const percent = Math.min(100, (player.xp / currentLevelXp) * 100);

  return (
    <main className="shell">
      <div className="topbar">
        <div className="brand">LIFE<span>QUEST</span></div>
        <button className="btn secondary" onClick={reset}>Réinitialiser</button>
      </div>

      {notice && <div className="notice">{notice}</div>}

      <section className="hero">
        <div className="card">
          <div className="level">Niveau {player.level}</div>
          <h1>{player.pseudo}</h1>
          <div className="muted">
            {player.xp} / {currentLevelXp} XP avant le niveau suivant
          </div>
          <div className="xpbar">
            <div className="xpfill" style={{ width: `${percent}%` }} />
          </div>
          <div className="muted">
            🪙 {player.coins} pièces
          </div>
        </div>

        <div className="card coins">
          <div>
            <div className="level">Progression</div>
            <div style={{ fontSize: 52, marginTop: 8 }}>⬆️</div>
            <div className="muted" style={{ fontSize: 14, marginTop: 8 }}>
              Continue à accomplir tes quêtes.
            </div>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <div className="sectionTitle">
            <h2>📊 Statistiques</h2>
          </div>

          <div className="stats">
            {(Object.keys(player.stats) as Array<keyof Stats>).map(stat => (
              <div className="stat" key={stat}>
                <div className="statTop">
                  <span className="statName">{statLabels[stat]}</span>
                  <span className="statValue">{player.stats[stat]}</span>
                </div>
                <div className="statBar">
                  <div
                    className="statFill"
                    style={{ width: `${player.stats[stat]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="sectionTitle">
            <h2>⚔️ Quêtes</h2>
          </div>

          <div className="form">
            <input
              className="input"
              value={newQuest}
              onChange={e => setNewQuest(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createQuest()}
              placeholder="Ex : Ranger mon bureau"
              maxLength={80}
            />
            <button className="btn" onClick={createQuest}>
              + Ajouter une quête
            </button>
          </div>

          {player.quests.length === 0 && (
            <div className="empty">Aucune quête pour le moment.</div>
          )}

          {player.quests.map(q => (
            <div className="quest" key={q.id}>
              <div>
                <h3>{q.completed ? "✅ " : ""}{q.title}</h3>
                <div className="muted">{q.description}</div>
                <div className="reward">
                  +{q.xp} XP · {statLabels[q.stat]}
                </div>
              </div>

              <button
                className={`btn ${q.completed ? "secondary" : ""}`}
                disabled={q.completed}
                onClick={() => completeQuest(q.id)}
              >
                {q.completed ? "Terminé" : "Valider"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}