"use client";

import { useEffect, useState } from "react";

type Item = {
  item_id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  category: string;
  quantity: number;
};

type Player = {
  id: string;
  pseudo: string;
  level: number;
  xp: number;
  coins: number;
};

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
  name: string;
  description: string;
  xp: number;
  coins: number;
};

const quests: Quest[] = [
  {
    id: "sport",
    name: "Faire du sport",
    description:
      "Faire au moins 30 minutes d'activité physique.",
    xp: 50,
    coins: 25
  },
  {
    id: "travail",
    name: "Avancer sur un projet",
    description:
      "Consacrer du temps à un projet personnel ou professionnel.",
    xp: 60,
    coins: 30
  },
  {
    id: "lecture",
    name: "Lire",
    description:
      "Lire pendant au moins 20 minutes.",
    xp: 40,
    coins: 20
  },
  {
    id: "routine",
    name: "Tenir sa routine",
    description:
      "Accomplir une tâche importante de ta journée.",
    xp: 30,
    coins: 15
  }
];

export default function Home() {
  const [player, setPlayer] =
    useState<Player | null>(null);

  const [stats, setStats] =
    useState<Stats | null>(null);

  const [inventory, setInventory] =
    useState<Item[]>([]);

  const [shop, setShop] =
    useState<Item[]>([]);

  const [pseudo, setPseudo] =
    useState("");

  const [tab, setTab] =
    useState<
      "personnage" | "maison" | "boutique"
    >("personnage");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [questLoading, setQuestLoading] =
    useState<string | null>(null);

  async function load() {
    try {
      const [
        playerResponse,
        shopResponse
      ] = await Promise.all([
        fetch("/api/player", {
          cache: "no-store"
        }),

        fetch("/api/shop", {
          cache: "no-store"
        })
      ]);

      const playerData =
        await playerResponse.json();

      const shopData =
        await shopResponse.json();

      setPlayer(playerData.player);
      setStats(playerData.stats);
      setInventory(
        playerData.inventory
      );
      setShop(shopData);
      setPseudo(
        playerData.player.pseudo
      );
    } catch {
      setMessage(
        "Impossible de charger les données."
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function savePseudo() {
    const response =
      await fetch("/api/player", {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          pseudo
        })
      });

    if (!response.ok) {
      setMessage(
        "Impossible de sauvegarder le pseudo."
      );

      return;
    }

    setMessage(
      "Pseudo sauvegardé."
    );

    await load();
  }

  async function completeQuest(
    questId: string
  ) {
    setQuestLoading(questId);
    setMessage("");

    try {
      const response =
        await fetch("/api/quest", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            questId
          })
        });

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Impossible de terminer la quête."
        );

        return;
      }

      if (data.leveledUp) {
        setMessage(
          `🎉 Niveau ${data.player.level} ! +${data.reward.xp} XP et +${data.reward.coins} 🪙`
        );
      } else {
        setMessage(
          `✅ Quête terminée ! +${data.reward.xp} XP et +${data.reward.coins} 🪙`
        );
      }

      await load();
    } catch {
      setMessage(
        "Une erreur est survenue."
      );
    } finally {
      setQuestLoading(null);
    }
  }

  async function buy(itemId: string) {
    const response =
      await fetch("/api/shop", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          itemId
        })
      });

    const data =
      await response.json();

    if (!response.ok) {
      setMessage(data.error);
      return;
    }

    setMessage(
      `🛍️ ${data.item} acheté !`
    );

    await load();
  }

  if (loading) {
    return (
      <main className="loading">
        Chargement de ta vie...
      </main>
    );
  }

  if (!player || !stats) {
    return (
      <main className="loading">
        Erreur de chargement.
      </main>
    );
  }

  const xpNext =
    100 +
    (player.level - 1) * 50;

  const xpPercent = Math.min(
    100,
    (player.xp / xpNext) * 100
  );

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getRoom(item: Item) {
  const category = normalizeText(item.category ?? "");
  const name = normalizeText(item.name ?? "");

  if (
    category.includes("chambre") ||
    category.includes("bedroom") ||
    category.includes("lit") ||
    name.includes("lit") ||
    name.includes("bed")
  ) {
    return "chambre";
  }

  if (
    category.includes("cuisine") ||
    category.includes("kitchen") ||
    name.includes("cuisine") ||
    name.includes("four") ||
    name.includes("frigo") ||
    name.includes("refrigerateur")
  ) {
    return "cuisine";
  }

  if (
    category.includes("bureau") ||
    category.includes("office") ||
    category.includes("travail") ||
    name.includes("bureau") ||
    name.includes("ordinateur") ||
    name.includes("pc")
  ) {
    return "bureau";
  }

  return "salon";
}

function getHouseLevel(level: number) {
  if (level >= 11) {
    return {
      name: "Domaine",
      emoji: "🌆",
      description:
        "Tu possèdes maintenant un véritable domaine.",
      className: "houseTier5"
    };
  }

  if (level >= 8) {
    return {
      name: "Grande maison",
      emoji: "🏰",
      description:
        "Ton univers commence à devenir impressionnant.",
      className: "houseTier4"
    };
  }

  if (level >= 5) {
    return {
      name: "Maison",
      emoji: "🏡",
      description:
        "Tu as maintenant une vraie maison à construire.",
      className: "houseTier3"
    };
  }

  if (level >= 3) {
    return {
      name: "Appartement",
      emoji: "🏠",
      description:
        "Ton premier véritable appartement.",
      className: "houseTier2"
    };
  }

  return {
    name: "Petit studio",
    emoji: "🏚️",
    description:
      "Un petit logement, mais c'est le début de ton aventure.",
    className: "houseTier1"
  };
}

const houseLevel = getHouseLevel(player.level);
  
  return (
    <main className="container">

      <header className="header">

        <h1>
          LIFE<span>QUEST</span>
        </h1>

        <div className="coins">
          🪙 {player.coins}
        </div>

      </header>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      <nav className="navigation">

        <button
          onClick={() =>
            setTab("personnage")
          }
          className={
            tab === "personnage"
              ? "active"
              : ""
          }
        >
          🧙 Personnage
        </button>

        <button
          onClick={() =>
            setTab("maison")
          }
          className={
            tab === "maison"
              ? "active"
              : ""
          }
        >
          🏠 Ma vie
        </button>

        <button
          onClick={() =>
            setTab("boutique")
          }
          className={
            tab === "boutique"
              ? "active"
              : ""
          }
        >
          🛒 Boutique
        </button>

      </nav>

      {tab === "personnage" && (

        <section>

          {/* PROFIL */}

          <div className="card">

            <div className="level">
              NIVEAU {player.level}
            </div>

            <div className="profile">

              <input
                value={pseudo}
                onChange={(e) =>
                  setPseudo(
                    e.target.value
                  )
                }
              />

              <button
                onClick={savePseudo}
              >
                Sauvegarder
              </button>

            </div>

            <div className="xpText">
              {player.xp} / {xpNext} XP
            </div>

            <div className="xpBar">

              <div
                style={{
                  width:
                    `${xpPercent}%`
                }}
              />

            </div>

          </div>


          {/* QUÊTES */}

          <div className="card">

            <h2>
              🎯 Quêtes
            </h2>

            <p>
              Accomplis des actions dans
              ta vraie vie pour faire
              progresser ton personnage.
            </p>

            <div className="quests">

              {quests.map((quest) => (

                <article
                  className="quest"
                  key={quest.id}
                >

                  <div className="questInfo">

                    <h3>
                      {quest.name}
                    </h3>

                    <p>
                      {quest.description}
                    </p>

                    <div className="questReward">
                      ⭐ +{quest.xp} XP
                      <span>
                        🪙 +{quest.coins}
                      </span>
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      completeQuest(
                        quest.id
                      )
                    }
                    disabled={
                      questLoading !== null
                    }
                  >
                    {questLoading ===
                    quest.id
                      ? "..."
                      : "Terminer"}
                  </button>

                </article>

              ))}

            </div>

          </div>


          {/* STATISTIQUES */}

          <div className="card">

            <h2>
              📊 Statistiques
            </h2>

            <div className="stats">

              {Object.entries(
                stats
              ).map(
                ([name, value]) => (

                  <div
                    className="stat"
                    key={name}
                  >

                    <div>
                      {name}
                    </div>

                    <strong>
                      {value}
                    </strong>

                    <div className="statBar">

                      <div
                        style={{
                          width:
                            `${value}%`
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </section>
      )}


      {/* BOUTIQUE */}

      {tab === "boutique" && (

        <section className="card">

          <h2>
            🛒 Boutique
          </h2>

          <p>
            Dépense tes pièces pour
            construire ta vie.
          </p>

          <div className="shop">

            {shop.map((item) => {

              const owned =
                inventory.find(
                  (x) =>
                    x.item_id ===
                    item.item_id
                )?.quantity ?? 0;

              return (

                <article
                  className="shopItem"
                  key={item.item_id}
                >

                  <div className="emoji">
                    {item.emoji}
                  </div>

                  <div className="itemInfo">

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      {item.description}
                    </p>

                    {owned > 0 && (

                      <small>
                        Possédé : {owned}
                      </small>

                    )}

                  </div>

                  <button
                    onClick={() =>
                      buy(item.item_id)
                    }
                    disabled={
                      player.coins <
                      item.price
                    }
                  >
                    🪙 {item.price}
                  </button>

                </article>

              );

            })}

          </div>

        </section>
      )}


      {/* MA VIE */}

{tab === "maison" && (

  <section className="housePage">

    <div className="houseHeader">

  <div>

    <div className="level">
      TON UNIVERS
    </div>

    <h2>
      {houseLevel.emoji} {houseLevel.name}
    </h2>

    <p>
      {houseLevel.description}
    </p>

  </div>

  <div className="houseProgress">

    <strong>
      Niveau {player.level}
    </strong>

    <span>
      Prochain logement :{" "}
      {player.level < 3
        ? "🏠 Appartement"
        : player.level < 5
        ? "🏡 Maison"
        : player.level < 8
        ? "🏰 Grande maison"
        : player.level < 11
        ? "🌆 Domaine"
        : "✨ Niveau maximum"}
    </span>

  </div>

       <div className="houseCoins">
        🪙 {player.coins}
      </div>

    </div>


    <div
  className={`houseWorld ${houseLevel.className}`}
>

      {/* SALON */}

      <div className="room livingRoom">

        <div className="roomTitle">
          🛋️ Salon
        </div>

        <div className="roomFloor">

          {inventory
            .filter(
              (item) =>
                getRoom(item) === "salon"
            )
            .map((item) => (

              <div
                className="worldItem"
                key={item.item_id}
              >

                <div className="worldEmoji">
                  {item.emoji}
                </div>

                <strong>
                  {item.name}
                </strong>

                <small>
                  x{item.quantity}
                </small>

              </div>

            ))}

        </div>

      </div>


      {/* CUISINE */}

      <div className="room kitchen">

        <div className="roomTitle">
          🍳 Cuisine
        </div>

        <div className="roomFloor">

          {inventory
            .filter(
              (item) =>
                getRoom(item) === "cuisine"
            )
            .map((item) => (

              <div
                className="worldItem"
                key={item.item_id}
              >

                <div className="worldEmoji">
                  {item.emoji}
                </div>

                <strong>
                  {item.name}
                </strong>

                <small>
                  x{item.quantity}
                </small>

              </div>

            ))}

        </div>

      </div>


      {/* CHAMBRE */}

      <div className="room bedroom">

        <div className="roomTitle">
          🛏️ Chambre
        </div>

        <div className="roomFloor">

          {inventory
            .filter(
              (item) =>
                getRoom(item) === "chambre"
            )
            .map((item) => (

              <div
                className="worldItem"
                key={item.item_id}
              >

                <div className="worldEmoji">
                  {item.emoji}
                </div>

                <strong>
                  {item.name}
                </strong>

                <small>
                  x{item.quantity}
                </small>

              </div>

            ))}

        </div>

      </div>


      {/* BUREAU */}

      <div className="room office">

        <div className="roomTitle">
          💻 Bureau
        </div>

        <div className="roomFloor">

          {inventory
            .filter(
              (item) =>
                getRoom(item) === "bureau"
            )
            .map((item) => (

              <div
                className="worldItem"
                key={item.item_id}
              >

                <div className="worldEmoji">
                  {item.emoji}
                </div>

                <strong>
                  {item.name}
                </strong>

                <small>
                  x{item.quantity}
                </small>

              </div>

            ))}

        </div>

      </div>

    </div>


    {inventory.length === 0 && (

      <div className="houseEmpty">

        <div>
          🏚️
        </div>

        <h3>
          Ta vie commence ici.
        </h3>

        <p>
          Achète ton premier objet dans
          la boutique pour commencer à
          construire ton univers.
        </p>

        <button
          onClick={() =>
            setTab("boutique")
          }
        >
          🛒 Aller à la boutique
        </button>

      </div>

    )}

  </section>

)}

    </main>
  );
}
