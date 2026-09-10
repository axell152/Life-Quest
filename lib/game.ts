export function xpRequired(level: number) {
  return 100 + (level - 1) * 50;
}

export function applyQuestReward(
  level: number,
  xp: number,
  coins: number,
  rewardXp: number
) {
  let newLevel = level;
  let newXp = xp + rewardXp;
  let newCoins = coins + Math.max(5, Math.round(rewardXp / 2));

  while (newXp >= xpRequired(newLevel)) {
    newXp -= xpRequired(newLevel);
    newLevel += 1;
    newCoins += 50;
  }

  return {
    level: newLevel,
    xp: newXp,
    coins: newCoins
  };
}
