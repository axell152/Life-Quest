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
    useState<"personnage" | "maison" | "boutique">(
      "personnage"
    );

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  async function load() {
    try {
      const [playerResponse, shopResponse] =
        await Promise.all([
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
      setInventory(playerData.inventory);
      setShop(shopData);
      setPseudo(playerData.player.pseudo);
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
    await fetch("/api/player", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pseudo
      })
    });

    setMessage("Pseudo sauvegardé.");

    load();
  }

  async function buy(itemId: string) {
    const response = await fetch(
      "/api/shop",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          itemId
        })
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      setMessage(data.error);
      return;
    }

    setMessage(
      `🛍️ ${data.item} acheté !`
    );

    load();
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
    100 + (player.level - 1) * 50;

  const xpPercent = Math.min(
    100,
    (player.xp / xpNext) * 100
  );

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

          <div className="card">

            <div className="level">
              NIVEAU {player.level}
            </div>

            <div className="profile">

              <input
                value={pseudo}
                onChange={(e) =>
                  setPseudo(e.target.value)
                }
              />

              <button onClick={savePseudo}>
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

          <div className="card">

            <h2>
              📊 Statistiques
            </h2>

            <div className="stats">

              {Object.entries(
                stats
              ).map(([name, value]) => (

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

              ))}

            </div>

          </div>

        </section>
      )}

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
                    x.item_id === item.item_id
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

      {tab === "maison" && (

        <section className="card">

          <h2>
            🏠 Ma vie
          </h2>

          <p>
            Tout ce que tu achètes
            construit ton univers.
          </p>

          <div className="house">

            {inventory.length === 0 ? (

              <div className="empty">

                🏚️

                <h3>
                  Ta maison est vide.
                </h3>

                <p>
                  Va dans la boutique
                  acheter ton premier objet.
                </p>

              </div>

            ) : (

              inventory.map((item) => (

                <div
                  className="houseItem"
                  key={item.item_id}
                >

                  <div>
                    {item.emoji}
                  </div>

                  <strong>
                    {item.name}
                  </strong>

                  <small>
                    x{item.quantity}
                  </small>

                </div>

              ))

            )}

          </div>

        </section>

      )}

    </main>
  );
}
