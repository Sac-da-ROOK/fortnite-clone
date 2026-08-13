const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const miniMap = document.querySelector("#miniMap");
const mini = miniMap.getContext("2d");
const STORAGE_KEY = "dropzone-blitz-profile-v2";

const ui = {
  startPanel: document.querySelector("#startPanel"),
  endPanel: document.querySelector("#endPanel"),
  startButton: document.querySelector("#startButton"),
  restartButton: document.querySelector("#restartButton"),
  shopButton: document.querySelector("#shopButton"),
  closeShopButton: document.querySelector("#closeShopButton"),
  shopPanel: document.querySelector("#shopPanel"),
  shopGrid: document.querySelector("#shopGrid"),
  currencyText: document.querySelector("#currencyText"),
  skinText: document.querySelector("#skinText"),
  shopCurrency: document.querySelector("#shopCurrency"),
  shopEquipped: document.querySelector("#shopEquipped"),
  modeButtons: document.querySelectorAll("[data-mode]"),
  outfitSelect: document.querySelector("#outfitSelect"),
  dropSelect: document.querySelector("#dropSelect"),
  difficultySelect: document.querySelector("#difficultySelect"),
  aliveCount: document.querySelector("#aliveCount"),
  stormStatus: document.querySelector("#stormStatus"),
  weaponStatus: document.querySelector("#weaponStatus"),
  healthText: document.querySelector("#healthText"),
  shieldText: document.querySelector("#shieldText"),
  healthBar: document.querySelector("#healthBar"),
  shieldBar: document.querySelector("#shieldBar"),
  ammoText: document.querySelector("#ammoText"),
  matsText: document.querySelector("#matsText"),
  elimText: document.querySelector("#elimText"),
  endKicker: document.querySelector("#endKicker"),
  endTitle: document.querySelector("#endTitle"),
  endStats: document.querySelector("#endStats"),
  rewardLine: document.querySelector("#rewardLine"),
  touchShoot: document.querySelector("#touchShoot"),
  touchBuild: document.querySelector("#touchBuild"),
  touchPickup: document.querySelector("#touchPickup")
};

const world = { width: 2700, height: 1900 };
const camera = { x: 0, y: 0 };
const keys = new Set();
const pressed = new Set();
const mouse = { x: canvas.width / 2, y: canvas.height / 2, worldX: 0, worldY: 0, down: false };
const touchMove = { up: false, down: false, left: false, right: false, fire: false };

const weapons = {
  pistol: { name: "Pulse Pistol", damage: 12, speed: 820, fireRate: 0.24, range: 620, spread: 0.05, color: "#ffd166" },
  rifle: { name: "Rift Rifle", damage: 16, speed: 980, fireRate: 0.14, range: 760, spread: 0.035, color: "#22d3ee" },
  shotgun: { name: "Scatter Blaster", damage: 9, speed: 760, fireRate: 0.55, range: 360, spread: 0.24, color: "#ff477e", pellets: 5 },
  rpg: { name: "Rocket Launcher", damage: 28, splash: 54, speed: 580, fireRate: 1.1, range: 640, spread: 0.01, color: "#f97316", explosive: true }
};

const colors = ["#ff477e", "#22d3ee", "#ffd166", "#9be15d", "#a78bfa", "#fb7185", "#f97316"];
const spawnKinds = {
  weapon: ["pistol", "rifle", "shotgun", "rpg"],
  heal: ["bandage", "medkit", "shield-splash", "shield-keg"],
  utility: ["ammo", "mats"]
};
const skinCatalog = [
  { id: "shadow-ace", name: "Shadow Ace", cost: 0, accent: "#111827", rarity: "starter", tagline: "Default operator" },
  { id: "neon-rush", name: "Neon Rush", cost: 120, accent: "#ff477e", rarity: "rare", tagline: "Hot pink sprint" },
  { id: "rift-runner", name: "Rift Runner", cost: 120, accent: "#22d3ee", rarity: "rare", tagline: "Fast, bright, loud" },
  { id: "solar-scout", name: "Solar Scout", cost: 120, accent: "#ffd166", rarity: "rare", tagline: "Sunline striker" },
  { id: "violet-vista", name: "Violet Vista", cost: 180, accent: "#a78bfa", rarity: "epic", tagline: "Purple horizon" },
  { id: "ember-loop", name: "Ember Loop", cost: 180, accent: "#f97316", rarity: "epic", tagline: "Burning circuit" },
  { id: "glacier-glow", name: "Glacier Glow", cost: 180, accent: "#7dd3fc", rarity: "epic", tagline: "Frozen beam" },
  { id: "mint-meteor", name: "Mint Meteor", cost: 220, accent: "#2dd4bf", rarity: "epic", tagline: "Cool impact" },
  { id: "candy-core", name: "Candy Core", cost: 220, accent: "#fb7185", rarity: "epic", tagline: "Sugar rush" },
  { id: "midnight-mesh", name: "Midnight Mesh", cost: 260, accent: "#0f172a", rarity: "legendary", tagline: "Deep black weave" },
  { id: "sunset-spark", name: "Sunset Spark", cost: 260, accent: "#f59e0b", rarity: "legendary", tagline: "Orange dusk" },
  { id: "storm-signal", name: "Storm Signal", cost: 260, accent: "#38bdf8", rarity: "legendary", tagline: "Alert blue" },
  { id: "pixel-punch", name: "Pixel Punch", cost: 300, accent: "#ec4899", rarity: "legendary", tagline: "Arcade hit" },
  { id: "gold-glide", name: "Gold Glide", cost: 300, accent: "#facc15", rarity: "legendary", tagline: "Brass shine" },
  { id: "hyper-harbor", name: "Hyper Harbor", cost: 300, accent: "#06b6d4", rarity: "legendary", tagline: "Harbor light" },
  { id: "coral-comet", name: "Coral Comet", cost: 340, accent: "#fb923c", rarity: "mythic", tagline: "Warm streak" },
  { id: "nova-knight", name: "Nova Knight", cost: 340, accent: "#c084fc", rarity: "mythic", tagline: "Star armor" },
  { id: "reef-rider", name: "Reef Rider", cost: 340, accent: "#14b8a6", rarity: "mythic", tagline: "Ocean run" },
  { id: "arc-angel", name: "Arc Angel", cost: 420, accent: "#f472b6", rarity: "mythic", tagline: "Electric halo" },
  { id: "rift-royal", name: "Rift Royal", cost: 500, accent: "#7c3aed", rarity: "mythic", tagline: "Top-tier flex" }
];
const trailCatalog = [
  { id: "trail-ember", name: "Ember Trail", cost: 90, accent: "#f97316", rarity: "rare" },
  { id: "trail-glow", name: "Glow Trail", cost: 90, accent: "#22d3ee", rarity: "rare" },
  { id: "trail-leaf", name: "Leaf Trail", cost: 90, accent: "#9be15d", rarity: "rare" },
  { id: "trail-storm", name: "Storm Trail", cost: 130, accent: "#a78bfa", rarity: "epic" }
];
const emoteCatalog = [
  { id: "emote-wave", name: "Wave Pop", cost: 100, accent: "#ffd166", rarity: "rare" },
  { id: "emote-dance", name: "Loop Dance", cost: 150, accent: "#ff477e", rarity: "epic" },
  { id: "emote-glow", name: "Glow Up", cost: 150, accent: "#22d3ee", rarity: "epic" }
];
const bannerCatalog = [
  { id: "banner-dz", name: "DZ Banner", cost: 70, accent: "#111827", rarity: "starter" },
  { id: "banner-rift", name: "Rift Banner", cost: 90, accent: "#a78bfa", rarity: "rare" },
  { id: "banner-sun", name: "Sun Banner", cost: 90, accent: "#facc15", rarity: "rare" }
];
const pickaxeCatalog = [
  { id: "pickaxe-bright", name: "Bright Pickaxe", cost: 140, accent: "#7dd3fc", rarity: "rare" },
  { id: "pickaxe-ember", name: "Ember Pickaxe", cost: 140, accent: "#fb7185", rarity: "rare" },
  { id: "pickaxe-arc", name: "Arc Pickaxe", cost: 180, accent: "#c084fc", rarity: "epic" }
];
const partySizes = { solo: 1, duo: 2, trio: 3, squad: 4 };
const dropZones = {
  center: { x: 1350, y: 940 },
  west: { x: 760, y: 1190 },
  north: { x: 1850, y: 570 },
  east: { x: 2120, y: 1190 }
};
const matchPaces = {
  chill: { bots: 16, botSpeed: 0.88, stormDuration: 220, botShield: 12 },
  normal: { bots: 20, botSpeed: 1, stormDuration: 185, botShield: 20 },
  sweaty: { bots: 28, botSpeed: 1.16, stormDuration: 150, botShield: 34 }
};
let settings = {
  mode: "solo",
  outfit: "#111827",
  drop: "center",
  difficulty: "normal"
};
let profile = loadProfile();
settings.outfit = skinById(profile.equipped.skin)?.accent || settings.outfit;
let state;
let lastTime = 0;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function defaultProfile() {
  return {
    currency: 0,
    unlocked: {
      skin: ["shadow-ace"],
      trail: [],
      emote: [],
      banner: [],
      pickaxe: []
    },
    equipped: {
      skin: "shadow-ace",
      trail: "",
      emote: "",
      banner: "",
      pickaxe: ""
    },
    stats: { wins: 0, matches: 0, elims: 0, highestStreak: 0 },
    lastReward: 0
  };
}

function randomItemType(kind) {
  const pool = spawnKinds[kind] || spawnKinds.utility;
  return pool[Math.floor(rand(0, pool.length))];
}

function makeGroundItem(kind = "utility") {
  const point = randomLandPoint(72);
  const itemType = randomItemType(kind);
  return {
    x: point.x,
    y: point.y,
    r: kind === "weapon" ? 18 : 15,
    kind,
    type: itemType,
    bob: rand(0, Math.PI * 2),
    life: kind === "weapon" ? 90 : 75,
    value: kind === "weapon" ? 1 : kind === "heal" ? 0 : 1
  };
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw);
    const fallback = defaultProfile();
    return {
      ...fallback,
      ...parsed,
      unlocked: { ...fallback.unlocked, ...(parsed.unlocked || {}) },
      equipped: { ...fallback.equipped, ...(parsed.equipped || {}) },
      stats: { ...fallback.stats, ...(parsed.stats || {}) }
    };
  } catch {
    return defaultProfile();
  }
}

function itemName(item) {
  const names = {
    pistol: "Pulse Pistol",
    rifle: "Rift Rifle",
    shotgun: "Scatter Blaster",
    rpg: "Rocket Launcher",
    bandage: "Bandage Roll",
    medkit: "Medkit",
    "shield-splash": "Shield Splash",
    "shield-keg": "Shield Keg",
    ammo: "Ammo Cache",
    mats: "Supply Crate"
  };
  return names[item.type] || item.type;
}

function itemColor(item) {
  const colorsByType = {
    pistol: "#ffd166",
    rifle: "#22d3ee",
    shotgun: "#ff477e",
    rpg: "#f97316",
    bandage: "#9be15d",
    medkit: "#f59e0b",
    "shield-splash": "#38bdf8",
    "shield-keg": "#60a5fa",
    ammo: "#facc15",
    mats: "#c084fc"
  };
  return colorsByType[item.type] || "#ffffff";
}

function addGroundItem(item) {
  state.groundItems.push(item);
}

function spawnLootWave() {
  const current = state.groundItems.length;
  const target = clamp(28 + Math.floor(state.time / 45), 28, 42);
  const need = target - current;
  if (need <= 0) return;
  const kinds = ["weapon", "heal", "utility", "utility", "heal", "weapon", "utility"];
  for (let i = 0; i < need; i += 1) {
    addGroundItem(makeGroundItem(kinds[Math.floor(rand(0, kinds.length))]));
  }
}

function saveProfile() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function skinById(id) {
  return skinCatalog.find((item) => item.id === id);
}

function catalogByType(type) {
  return {
    skin: skinCatalog,
    trail: trailCatalog,
    emote: emoteCatalog,
    banner: bannerCatalog,
    pickaxe: pickaxeCatalog
  }[type] || [];
}

function isUnlocked(type, id) {
  return profile.unlocked[type]?.includes(id);
}

function unlock(type, id) {
  if (!profile.unlocked[type]) profile.unlocked[type] = [];
  if (!profile.unlocked[type].includes(id)) profile.unlocked[type].push(id);
}

function equipItem(type, id) {
  profile.equipped[type] = id;
  if (type === "skin") {
    const skin = skinById(id);
    if (skin) settings.outfit = skin.accent;
  }
  saveProfile();
  syncWallet();
}

function earnCurrency(amount) {
  profile.currency += Math.max(0, Math.floor(amount));
  saveProfile();
  syncWallet();
}

function syncWallet() {
  const currentSkin = skinById(profile.equipped.skin)?.name || "Shadow Ace";
  ui.currencyText.textContent = `${profile.currency} coins`;
  ui.skinText.textContent = currentSkin;
  ui.shopCurrency.textContent = `${profile.currency} coins`;
  ui.shopEquipped.textContent = `Equipped: ${currentSkin}`;
}

function equippedItem(type) {
  const catalogs = {
    skin: skinCatalog,
    trail: trailCatalog,
    emote: emoteCatalog,
    banner: bannerCatalog,
    pickaxe: pickaxeCatalog
  };
  return catalogs[type].find((item) => item.id === profile.equipped[type]) || catalogs[type][0];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isLand(x, y) {
  const blobs = [
    { x: 1325, y: 930, rx: 1040, ry: 650 },
    { x: 740, y: 1240, rx: 410, ry: 280 },
    { x: 1920, y: 560, rx: 420, ry: 280 },
    { x: 2160, y: 1240, rx: 360, ry: 240 }
  ];
  return blobs.some((blob) => {
    const dx = (x - blob.x) / blob.rx;
    const dy = (y - blob.y) / blob.ry;
    return dx * dx + dy * dy < 1;
  });
}

function randomLandPoint(margin = 80) {
  for (let i = 0; i < 4000; i += 1) {
    const point = { x: rand(margin, world.width - margin), y: rand(margin, world.height - margin) };
    if (isLand(point.x, point.y)) return point;
  }
  return { x: world.width / 2, y: world.height / 2 };
}

function circleRectHit(circle, rect) {
  const closestX = clamp(circle.x, rect.x - rect.w / 2, rect.x + rect.w / 2);
  const closestY = clamp(circle.y, rect.y - rect.h / 2, rect.y + rect.h / 2);
  return Math.hypot(circle.x - closestX, circle.y - closestY) < circle.r;
}

function makePlayer() {
  const drop = dropZones[settings.drop] || dropZones.center;
  const equippedSkin = skinById(profile.equipped.skin) || skinCatalog[0];
  return {
    x: drop.x,
    y: drop.y,
    r: 18,
    speed: 285,
    hp: 140,
    shield: 75,
    ammo: 48,
    mats: 80,
    weapon: "pistol",
    cooldown: 0,
    elims: 0,
    angle: 0,
    color: equippedSkin.accent,
    skinName: equippedSkin.name
  };
}

function makeAlly(index, player) {
  const angle = (index / 4) * Math.PI * 2;
  return {
    x: player.x + Math.cos(angle) * (46 + index * 10),
    y: player.y + Math.sin(angle) * (46 + index * 10),
    r: 17,
    speed: 248,
    hp: 85,
    shield: 30,
    weapon: index % 2 === 0 ? "pistol" : "rifle",
    cooldown: rand(0.2, 1.2),
    angle: 0,
    color: colors[(index + 2) % colors.length],
    alive: true,
    name: `Mate ${index + 1}`
  };
}

function makeBot(index) {
  const pace = matchPaces[settings.difficulty] || matchPaces.normal;
  let point = randomLandPoint(120);
  const drop = dropZones[settings.drop] || dropZones.center;
  for (let i = 0; i < 200 && Math.hypot(point.x - drop.x, point.y - drop.y) < 720; i += 1) {
    point = randomLandPoint(120);
  }
  return {
    x: point.x,
    y: point.y,
    r: 17,
    speed: rand(150, 215) * pace.botSpeed,
    hp: 60,
    shield: Math.max(10, pace.botShield - 4),
    weapon: Math.random() > 0.78 ? "rifle" : "pistol",
    cooldown: rand(1.2, 3.2),
    wander: rand(0, Math.PI * 2),
    wanderTime: rand(0.4, 2.2),
    color: colors[index % colors.length],
    alive: true,
    name: `Rival ${index + 1}`
  };
}

function makeLoot() {
  const choices = ["ammo", "mats", "shield", "rifle", "shotgun", "med"];
  const type = choices[Math.floor(rand(0, choices.length))];
  const point = randomLandPoint(80);
  return { x: point.x, y: point.y, r: 15, type, bob: rand(0, Math.PI * 2) };
}

function createObstacles() {
  return [
    { x: 640, y: 830, w: 210, h: 120, type: "building" },
    { x: 905, y: 760, w: 170, h: 150, type: "building" },
    { x: 1280, y: 520, w: 220, h: 130, type: "building" },
    { x: 1480, y: 710, w: 160, h: 200, type: "building" },
    { x: 1780, y: 910, w: 250, h: 140, type: "building" },
    { x: 2020, y: 1220, w: 190, h: 155, type: "building" },
    { x: 1060, y: 1260, w: 210, h: 150, type: "building" },
    { x: 1510, y: 1370, w: 230, h: 120, type: "building" }
  ];
}

function createTrees() {
  const trees = [];
  for (let i = 0; i < 90; i += 1) {
    const point = randomLandPoint(70);
    if (Math.abs(point.x - 1350) > 150 || Math.abs(point.y - 940) > 150) {
      trees.push({ x: point.x, y: point.y, r: rand(13, 24) });
    }
  }
  return trees;
}

function resetGame() {
  const pace = matchPaces[settings.difficulty] || matchPaces.normal;
  const player = makePlayer();
  const allyCount = partySizes[settings.mode] - 1;
  state = {
    running: false,
    ended: false,
    time: 0,
    player,
    allies: Array.from({ length: allyCount }, (_, index) => makeAlly(index, player)),
    bots: Array.from({ length: pace.bots }, (_, index) => makeBot(index)),
    bullets: [],
    trails: [],
    groundItems: Array.from({ length: 18 }, () => makeGroundItem("utility")).concat(
      Array.from({ length: 8 }, () => makeGroundItem("heal")),
      Array.from({ length: 8 }, () => makeGroundItem("weapon"))
    ),
    walls: [],
    obstacles: createObstacles(),
    trees: createTrees(),
    storm: {
      x: world.width / 2,
      y: world.height / 2,
      radius: 1750,
      finalRadius: 245,
      duration: pace.stormDuration
    },
    itemTimer: 0,
    message: "Find loot before the storm closes."
  };
  updateHud();
  syncWallet();
  ui.rewardLine.textContent = "+0 coins";
  draw();
}

function startGame() {
  readSettings();
  resetGame();
  state.running = true;
  ui.startPanel.classList.add("hidden");
  ui.endPanel.classList.add("hidden");
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function readSettings() {
  settings = {
    mode: document.querySelector("[data-mode].active")?.dataset.mode || "solo",
    outfit: ui.outfitSelect.value,
    drop: ui.dropSelect.value,
    difficulty: ui.difficultySelect.value
  };
}

function endGame(won) {
  state.running = false;
  state.ended = true;
  profile.stats.matches += 1;
  if (won) {
    profile.stats.wins += 1;
    const reward = 120 + state.player.elims * 15 + (settings.difficulty === "sweaty" ? 60 : settings.difficulty === "chill" ? 20 : 40);
    profile.lastReward = reward;
    earnCurrency(reward);
    const emote = equippedItem("emote").name;
    ui.rewardLine.textContent = `+${reward} coins added. Victory emote: ${emote}`;
  } else {
    profile.lastReward = 0;
    ui.rewardLine.textContent = `No win reward this time`;
  }
  profile.stats.elims += state.player.elims;
  saveProfile();
  ui.endPanel.classList.remove("hidden");
  ui.endKicker.textContent = won ? "Victory Royale" : "Match Over";
  ui.endTitle.textContent = won ? "Island Cleared" : "You Got Eliminated";
  ui.endStats.textContent = `Mode: ${settings.mode.toUpperCase()} | Eliminations: ${state.player.elims} | Team left: ${livingTeam().length}`;
  syncWallet();
}

function livingBots() {
  return state.bots.filter((bot) => bot.alive && bot.hp > 0);
}

function livingAllies() {
  return state.allies.filter((ally) => ally.alive && ally.hp > 0);
}

function livingTeam() {
  return [state.player, ...livingAllies()].filter((member) => member.hp > 0);
}

function getAimAngle() {
  return Math.atan2(mouse.worldY - state.player.y, mouse.worldX - state.player.x);
}

function applyDamage(target, amount) {
  const shieldHit = Math.min(target.shield || 0, amount);
  target.shield = Math.max(0, (target.shield || 0) - shieldHit);
  target.hp -= amount - shieldHit;
}

function explodeAt(x, y, owner, splash, damage) {
  const radius = splash;
  const direct = damage;
  for (const bot of livingBots()) {
    const dist = Math.hypot(bot.x - x, bot.y - y);
    if (dist <= radius) {
      const hit = Math.max(8, Math.round(direct * (1 - dist / radius)));
      applyDamage(bot, hit);
      if (bot.hp <= 0 && bot.alive) {
        bot.alive = false;
        if (owner === "player") state.player.elims += 1;
        if (Math.random() > 0.25) state.groundItems.push({
          x: bot.x,
          y: bot.y,
          r: 15,
          kind: "utility",
          type: Math.random() > 0.5 ? "ammo" : "mats",
          bob: 0,
          life: 45
        });
      }
    }
  }
  for (const ally of livingAllies()) {
    const dist = Math.hypot(ally.x - x, ally.y - y);
    if (dist <= radius && owner === "bot") {
      applyDamage(ally, Math.max(6, Math.round(direct * (1 - dist / radius))));
      if (ally.hp <= 0) ally.alive = false;
    }
  }
  if (Math.hypot(state.player.x - x, state.player.y - y) <= radius && owner !== "player") {
    applyDamage(state.player, Math.max(6, Math.round(direct * 0.8)));
  }
}

function shoot(entity, targetX, targetY, owner) {
  const weapon = weapons[entity.weapon];
  if (entity.cooldown > 0) return;
  if (owner === "player" && state.player.ammo <= 0) return;

  const angle = Math.atan2(targetY - entity.y, targetX - entity.x);
  const pellets = weapon.pellets || 1;
  entity.cooldown = weapon.fireRate;
  if (owner === "player") state.player.ammo -= 1;

  for (let i = 0; i < pellets; i += 1) {
    const spread = rand(-weapon.spread, weapon.spread);
    state.bullets.push({
      x: entity.x + Math.cos(angle) * 24,
      y: entity.y + Math.sin(angle) * 24,
      vx: Math.cos(angle + spread) * weapon.speed,
      vy: Math.sin(angle + spread) * weapon.speed,
      life: weapon.range / weapon.speed,
      damage: weapon.damage,
      splash: weapon.splash || 0,
      owner,
      color: weapon.color,
      r: owner === "player" ? 5 : 4,
      explosive: !!weapon.explosive
    });
  }
}

function buildWall() {
  const player = state.player;
  if (player.mats < 10) return;
  const angle = getAimAngle();
  const wall = {
    x: player.x + Math.cos(angle) * 64,
    y: player.y + Math.sin(angle) * 64,
    w: 84,
    h: 22,
    r: 46,
    hp: 85,
    angle: angle + Math.PI / 2
  };
  if (!isLand(wall.x, wall.y)) return;
  player.mats -= 10;
  state.walls.push(wall);
}

function pickupLoot() {
  const player = state.player;
  let picked = false;
  state.groundItems = state.groundItems.filter((loot) => {
    if (distance(player, loot) > (loot.kind === "weapon" ? 52 : 44)) return true;
    picked = true;
    if (loot.kind === "weapon") {
      player.weapon = loot.type;
      player.ammo += loot.type === "shotgun" ? 10 : loot.type === "rifle" ? 24 : loot.type === "rpg" ? 4 : 18;
      ui.weaponStatus.textContent = weapons[player.weapon].name;
    } else if (loot.type === "ammo") {
      player.ammo += 24;
    } else if (loot.type === "mats") {
      player.mats += 45;
    } else if (loot.type === "bandage") {
      player.hp = Math.min(140, player.hp + 18);
    } else if (loot.type === "medkit") {
      player.hp = Math.min(140, player.hp + 55);
    } else if (loot.type === "shield-splash") {
      player.shield = Math.min(100, player.shield + 30);
    } else if (loot.type === "shield-keg") {
      player.shield = Math.min(100, player.shield + 50);
    }
    return false;
  });
  if (picked) updateHud();
}

function moveEntity(entity, dx, dy, dt) {
  if (!dx && !dy) return;
  const len = Math.hypot(dx, dy) || 1;
  const step = { x: (dx / len) * entity.speed * dt, y: (dy / len) * entity.speed * dt };
  const next = { x: entity.x + step.x, y: entity.y + step.y, r: entity.r };
  const blocked = [...state.obstacles, ...state.walls].some((rect) => circleRectHit(next, rect));
  if (!blocked && isLand(next.x, next.y)) {
    entity.x = clamp(next.x, entity.r, world.width - entity.r);
    entity.y = clamp(next.y, entity.r, world.height - entity.r);
    if (entity === state.player || livingAllies().includes(entity)) {
      const trail = equippedItem("trail");
      if (trail) {
        state.trails.push({ x: entity.x, y: entity.y, life: 0.6, color: trail.accent, r: entity === state.player ? 10 : 8 });
      }
    }
  }
}

function updatePlayer(dt) {
  const player = state.player;
  let dx = 0;
  let dy = 0;
  if (keys.has("w") || keys.has("arrowup") || touchMove.up) dy -= 1;
  if (keys.has("s") || keys.has("arrowdown") || touchMove.down) dy += 1;
  if (keys.has("a") || keys.has("arrowleft") || touchMove.left) dx -= 1;
  if (keys.has("d") || keys.has("arrowright") || touchMove.right) dx += 1;
  moveEntity(player, dx, dy, dt);
  player.angle = getAimAngle();
  player.cooldown = Math.max(0, player.cooldown - dt);
  if (mouse.down || touchMove.fire) shoot(player, mouse.worldX, mouse.worldY, "player");
  if (pressed.has("q")) buildWall();
  if (pressed.has("e")) pickupLoot();
  pressed.clear();
}

function nearestLivingBot(entity, maxDistance = Infinity) {
  let best = null;
  let bestDistance = maxDistance;
  for (const bot of livingBots()) {
    const dist = distance(entity, bot);
    if (dist < bestDistance) {
      best = bot;
      bestDistance = dist;
    }
  }
  return best;
}

function nearestLivingTeamMember(entity) {
  let best = state.player.hp > 0 ? state.player : null;
  let bestDistance = best ? distance(entity, best) : Infinity;
  for (const ally of livingAllies()) {
    const dist = distance(entity, ally);
    if (dist < bestDistance) {
      best = ally;
      bestDistance = dist;
    }
  }
  return best;
}

function updateAllies(dt) {
  const player = state.player;
  livingAllies().forEach((ally, index) => {
    ally.cooldown = Math.max(0, ally.cooldown - dt);
    const followAngle = player.angle + Math.PI + (index - 0.75) * 0.55;
    const targetSlot = {
      x: player.x + Math.cos(followAngle) * (70 + index * 18),
      y: player.y + Math.sin(followAngle) * (70 + index * 18)
    };
    const bot = nearestLivingBot(ally, 560);
    if (bot) {
      ally.angle = Math.atan2(bot.y - ally.y, bot.x - ally.x);
      if (distance(ally, bot) > 260) moveEntity(ally, bot.x - ally.x, bot.y - ally.y, dt);
      shoot(ally, bot.x + rand(-24, 24), bot.y + rand(-24, 24), "team");
    } else {
      ally.angle = Math.atan2(player.y - ally.y, player.x - ally.x);
      if (distance(ally, targetSlot) > 36) moveEntity(ally, targetSlot.x - ally.x, targetSlot.y - ally.y, dt);
    }
  });
}

function updateBots(dt) {
  for (const bot of livingBots()) {
    const target = nearestLivingTeamMember(bot);
    if (!target) continue;
    bot.cooldown = Math.max(0, bot.cooldown - dt);
    bot.wanderTime -= dt;
    if (bot.wanderTime <= 0) {
      bot.wander = rand(0, Math.PI * 2);
      bot.wanderTime = rand(0.8, 2.4);
    }

    const toTarget = distance(bot, target);
    if (toTarget < 520) {
      const angle = Math.atan2(target.y - bot.y, target.x - bot.x);
      const keepAway = toTarget < 180 ? -1 : 1;
      moveEntity(bot, Math.cos(angle) * keepAway, Math.sin(angle) * keepAway, dt);
      if (toTarget < 460) shoot(bot, target.x + rand(-42, 42), target.y + rand(-42, 42), "bot");
    } else {
      moveEntity(bot, Math.cos(bot.wander), Math.sin(bot.wander), dt);
    }
  }
}

function updateBullets(dt) {
  state.bullets = state.bullets.filter((bullet) => {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    if (bullet.life <= 0 || !isLand(bullet.x, bullet.y)) return false;

    for (const wall of state.walls) {
      if (circleRectHit(bullet, wall)) {
        wall.hp -= bullet.damage;
        return false;
      }
    }

    for (const obstacle of state.obstacles) {
      if (circleRectHit(bullet, obstacle)) return false;
    }

    if (bullet.owner === "player" || bullet.owner === "team") {
      for (const bot of livingBots()) {
        if (distance(bullet, bot) < bot.r + bullet.r) {
          applyDamage(bot, bullet.damage);
          if (bullet.explosive) explodeAt(bullet.x, bullet.y, bullet.owner, bullet.splash, bullet.damage);
          if (bot.hp <= 0 && bot.alive) {
            bot.alive = false;
            if (bullet.owner === "player") state.player.elims += 1;
            if (Math.random() > 0.25) state.groundItems.push({
              x: bot.x,
              y: bot.y,
              r: 15,
              kind: "utility",
              type: Math.random() > 0.5 ? "ammo" : "mats",
              bob: 0,
              life: 45
            });
          }
          return false;
        }
      }
    } else {
      if (distance(bullet, state.player) < state.player.r + bullet.r) {
        applyDamage(state.player, bullet.damage);
        if (bullet.explosive) explodeAt(bullet.x, bullet.y, bullet.owner, bullet.splash, bullet.damage);
        return false;
      }
      for (const ally of livingAllies()) {
        if (distance(bullet, ally) < ally.r + bullet.r) {
          applyDamage(ally, bullet.damage);
          if (bullet.explosive) explodeAt(bullet.x, bullet.y, bullet.owner, bullet.splash, bullet.damage);
          if (ally.hp <= 0) ally.alive = false;
          return false;
        }
      }
    }
    return true;
  });
  state.walls = state.walls.filter((wall) => wall.hp > 0);
}

function updateStorm(dt) {
  state.time += dt;
  const storm = state.storm;
  const progress = clamp(state.time / storm.duration, 0, 1);
  storm.radius = 1750 - (1750 - storm.finalRadius) * progress;

  const stormDamage = progress > 0.18 ? (3.5 + progress * 5.5) * dt : 0;
  if (Math.hypot(state.player.x - storm.x, state.player.y - storm.y) > storm.radius) {
    state.player.hp -= stormDamage;
  }

  for (const bot of livingBots()) {
    if (Math.hypot(bot.x - storm.x, bot.y - storm.y) > storm.radius) {
      bot.hp -= stormDamage * 1.3;
      if (bot.hp <= 0) bot.alive = false;
    }
  }

  for (const ally of livingAllies()) {
    if (Math.hypot(ally.x - storm.x, ally.y - storm.y) > storm.radius) {
      ally.hp -= stormDamage;
      if (ally.hp <= 0) ally.alive = false;
    }
  }
}

function update(dt) {
  updateMouseWorld();
  updatePlayer(dt);
  updateAllies(dt);
  updateBots(dt);
  updateBullets(dt);
  updateStorm(dt);
  state.trails = state.trails.filter((trail) => (trail.life -= dt) > 0);
  state.groundItems.forEach((item) => {
    item.life -= dt;
  });
  state.groundItems = state.groundItems.filter((item) => item.life > 0);
  state.itemTimer += dt;
  if (state.itemTimer >= 7) {
    state.itemTimer = 0;
    spawnLootWave();
  }
  pickupNearbySmallSupplies();
  updateCamera();
  updateHud();

  if (state.player.hp <= 0) endGame(false);
  if (livingBots().length === 0 && state.player.hp > 0) endGame(true);
}

function pickupNearbySmallSupplies() {
  for (const loot of state.groundItems) {
    if (loot.kind === "utility" && (loot.type === "ammo" || loot.type === "mats") && distance(state.player, loot) < 34) {
      pickupLoot();
      break;
    }
  }
}

function updateMouseWorld() {
  mouse.worldX = camera.x + mouse.x;
  mouse.worldY = camera.y + mouse.y;
}

function updateCamera() {
  camera.x = clamp(state.player.x - canvas.width / 2, 0, world.width - canvas.width);
  camera.y = clamp(state.player.y - canvas.height / 2, 0, world.height - canvas.height);
}

function updateHud() {
  const player = state.player;
  ui.aliveCount.textContent = `Alive ${livingBots().length + livingTeam().length}`;
  ui.stormStatus.textContent = `Storm ${Math.max(0, Math.ceil(state.storm.duration - state.time))}s`;
  ui.weaponStatus.textContent = weapons[player.weapon].name;
  ui.healthText.textContent = Math.max(0, Math.ceil(player.hp));
  ui.shieldText.textContent = Math.max(0, Math.ceil(player.shield));
  ui.healthBar.style.width = `${clamp(player.hp, 0, 100)}%`;
  ui.shieldBar.style.width = `${clamp(player.shield, 0, 100)}%`;
  ui.ammoText.textContent = `Ammo ${player.ammo}`;
  ui.matsText.textContent = `Build ${player.mats}`;
  ui.elimText.textContent = `Elims ${player.elims}`;
  ui.skinText.textContent = player.skinName || skinById(profile.equipped.skin)?.name || "Shadow Ace";
}

function updateMenuPreview() {
  readSettings();
  const party = partySizes[settings.mode];
  const pace = matchPaces[settings.difficulty] || matchPaces.normal;
  ui.aliveCount.textContent = `${settings.mode.toUpperCase()} Ready`;
  ui.stormStatus.textContent = `Storm ${pace.stormDuration}s`;
  ui.weaponStatus.textContent = party === 1 ? "Solo Drop" : `${party} Player Team`;
  if (state && !state.running) {
    state.player.color = settings.outfit;
    draw();
  }
  syncWallet();
}

function makeIcon(color, label) {
  const initial = label.trim().slice(0, 1).toUpperCase();
  return `linear-gradient(135deg, ${color}, rgba(255,255,255,0.2)), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), transparent 30%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.18), transparent 32%), ${color}`;
}

function renderShop() {
  const sections = [
    { title: "Skins", type: "skin" },
    { title: "Trails", type: "trail" },
    { title: "Emotes", type: "emote" },
    { title: "Banners", type: "banner" },
    { title: "Pickaxes", type: "pickaxe" }
  ];
  ui.shopGrid.innerHTML = sections.map(({ title, type }) => {
    const items = catalogByType(type).map((item) => {
      const unlocked = isUnlocked(type, item.id);
      const equipped = profile.equipped[type] === item.id;
      const actionLabel = equipped ? "Equipped" : unlocked ? "Equip" : `Buy ${item.cost}`;
      const secondary = unlocked && !equipped;
      const buttonClass = secondary ? "secondary" : "";
      return `
        <article class="shop-card ${unlocked ? "" : "locked"}" data-type="${type}" data-id="${item.id}">
          <div class="skin-preview">
            <div class="skin-icon" style="background:${makeIcon(item.accent, item.name)}"></div>
            <div>
              <h3>${item.name}</h3>
              <p>${item.rarity} | ${item.tagline || type}</p>
              <p>${unlocked ? "Unlocked" : `${item.cost} coins`}</p>
            </div>
          </div>
          <button class="${buttonClass}" data-action="${equipped ? "equipped" : unlocked ? "equip" : "buy"}" type="button">${actionLabel}</button>
        </article>
      `;
    }).join("");
    return `<section class="shop-section"><h3>${title}</h3><div class="shop-grid-section">${items}</div></section>`;
  }).join("");

  ui.shopGrid.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".shop-card");
      const type = card.dataset.type;
      const id = card.dataset.id;
      const item = catalogByType(type).find((entry) => entry.id === id);
      if (!item) return;
      if (button.dataset.action === "buy") {
        if (profile.currency < item.cost) {
          alert("Not enough coins yet. Win a match to earn more.");
          return;
        }
        const ok = confirm(`Buy ${item.name} for ${item.cost} coins?`);
        if (!ok) return;
        profile.currency -= item.cost;
        unlock(type, id);
        equipItem(type, id);
        saveProfile();
      } else if (button.dataset.action === "equip") {
        equipItem(type, id);
      }
      renderShop();
      syncWallet();
      if (type === "skin") {
        ui.outfitSelect.value = skinById(id)?.accent || ui.outfitSelect.value;
        settings.outfit = ui.outfitSelect.value;
      }
    });
  });
  syncWallet();
}

function screenX(x) {
  return x - camera.x;
}

function screenY(y) {
  return y - camera.y;
}

function drawIsland() {
  ctx.fillStyle = "#1f7db1";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const blobs = [
    { x: 1325, y: 930, rx: 1040, ry: 650, color: "#77d567" },
    { x: 740, y: 1240, rx: 410, ry: 280, color: "#d9c166" },
    { x: 1920, y: 560, rx: 420, ry: 280, color: "#69cd74" },
    { x: 2160, y: 1240, rx: 360, ry: 240, color: "#dbbd6a" }
  ];
  for (const blob of blobs) {
    ctx.beginPath();
    ctx.ellipse(screenX(blob.x), screenY(blob.y), blob.rx, blob.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = blob.color;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#f8e7a5";
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.34)";
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  drawRoad([[520, 1120], [890, 920], [1240, 900], [1590, 1040], [2090, 1180]]);
  drawRoad([[1180, 520], [1350, 790], [1410, 1130], [1510, 1450]]);
}

function drawRoad(points) {
  ctx.beginPath();
  points.forEach((point, index) => {
    const [x, y] = point;
    if (index === 0) ctx.moveTo(screenX(x), screenY(y));
    else ctx.lineTo(screenX(x), screenY(y));
  });
  ctx.stroke();
}

function drawRectObject(rect, fill, stroke = "#121826") {
  const x = screenX(rect.x);
  const y = screenY(rect.y);
  ctx.save();
  ctx.translate(x, y);
  if (rect.angle) ctx.rotate(rect.angle);
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 4;
  ctx.fillRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
  ctx.strokeRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
  ctx.restore();
}

function drawLoot() {
  for (const loot of state.groundItems) {
    const y = screenY(loot.y) + Math.sin(state.time * 4 + loot.bob) * 4;
    ctx.save();
    ctx.translate(screenX(loot.x), y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = itemColor(loot);
    ctx.strokeStyle = "#121826";
    ctx.lineWidth = 3;
    const size = loot.kind === "weapon" ? 24 : 20;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.fillStyle = "#121826";
    ctx.font = "900 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(itemName(loot).split(" ")[0], 0, 4);
    ctx.restore();
  }
}

function drawTrails() {
  for (const trail of state.trails) {
    ctx.beginPath();
    ctx.arc(screenX(trail.x), screenY(trail.y), trail.r * clamp(trail.life / 0.6, 0.2, 1), 0, Math.PI * 2);
    ctx.fillStyle = trail.color;
    ctx.globalAlpha = clamp(trail.life / 0.6, 0, 1) * 0.65;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawPlayerLike(entity, label, isPlayer = false) {
  const x = screenX(entity.x);
  const y = screenY(entity.y);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(entity.angle || 0);
  ctx.fillStyle = entity.color;
  ctx.strokeStyle = "#121826";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, entity.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = isPlayer ? "#ffd166" : "#ffffff";
  ctx.fillRect(8, -5, 24, 10);
  ctx.strokeRect(8, -5, 24, 10);
  ctx.restore();

  if (!isPlayer) {
    ctx.fillStyle = "#121826";
    ctx.font = "700 11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y - 27);
  }
}

function drawStorm() {
  const storm = state.storm;
  ctx.save();
  ctx.fillStyle = "rgba(85, 37, 130, 0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(screenX(storm.x), screenY(storm.y), storm.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "#a78bfa";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(screenX(storm.x), screenY(storm.y), storm.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBullets() {
  for (const bullet of state.bullets) {
    ctx.beginPath();
    ctx.arc(screenX(bullet.x), screenY(bullet.y), bullet.r, 0, Math.PI * 2);
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.strokeStyle = "#121826";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawMiniMap() {
  mini.clearRect(0, 0, miniMap.width, miniMap.height);
  mini.fillStyle = "#1f7db1";
  mini.fillRect(0, 0, miniMap.width, miniMap.height);
  const sx = miniMap.width / world.width;
  const sy = miniMap.height / world.height;
  mini.fillStyle = "#77d567";
  mini.beginPath();
  mini.ellipse(1325 * sx, 930 * sy, 1040 * sx, 650 * sy, 0, 0, Math.PI * 2);
  mini.fill();
  mini.strokeStyle = "#a78bfa";
  mini.lineWidth = 2;
  mini.beginPath();
  mini.arc(state.storm.x * sx, state.storm.y * sy, state.storm.radius * sx, 0, Math.PI * 2);
  mini.stroke();
  mini.fillStyle = "#ff477e";
  for (const bot of livingBots()) mini.fillRect(bot.x * sx - 1.5, bot.y * sy - 1.5, 3, 3);
  mini.fillStyle = "#22d3ee";
  for (const ally of livingAllies()) mini.fillRect(ally.x * sx - 2, ally.y * sy - 2, 4, 4);
  mini.fillStyle = "#111827";
  mini.beginPath();
  mini.arc(state.player.x * sx, state.player.y * sy, 3.5, 0, Math.PI * 2);
  mini.fill();
}

function draw() {
  if (!state) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawIsland();

  for (const tree of state.trees) {
    ctx.beginPath();
    ctx.arc(screenX(tree.x), screenY(tree.y), tree.r, 0, Math.PI * 2);
    ctx.fillStyle = "#2f9e44";
    ctx.fill();
    ctx.strokeStyle = "#121826";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  for (const obstacle of state.obstacles) drawRectObject(obstacle, "#8b5e34");
  for (const wall of state.walls) drawRectObject(wall, equippedItem("pickaxe").accent || "#f2d0a4");
  drawTrails();
  drawLoot();
  drawBullets();
  for (const bot of livingBots()) drawPlayerLike(bot, bot.name);
  for (const ally of livingAllies()) drawPlayerLike(ally, ally.name);
  drawPlayerLike(state.player, "You", true);
  drawStorm();
  drawMiniMap();
}

function loop(now) {
  if (!state.running) return;
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  if (state.running) requestAnimationFrame(loop);
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = rect.width / rect.height;
  canvas.width = 1280;
  canvas.height = Math.round(1280 / ratio);
  updateCamera();
  draw();
}

function pointerToCanvas(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  mouse.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  updateMouseWorld();
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  pressed.add(key);
  if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "q", "e", " "].includes(key)) {
    event.preventDefault();
  }
  if (key === " " && state?.running) shoot(state.player, mouse.worldX, mouse.worldY, "player");
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener("pointermove", pointerToCanvas);
canvas.addEventListener("pointerdown", (event) => {
  pointerToCanvas(event);
  mouse.down = true;
  if (state?.running) shoot(state.player, mouse.worldX, mouse.worldY, "player");
});
window.addEventListener("pointerup", () => {
  mouse.down = false;
});

document.querySelectorAll("[data-move]").forEach((button) => {
  const dir = button.dataset.move;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    touchMove[dir] = true;
  });
  button.addEventListener("pointerup", () => {
    touchMove[dir] = false;
  });
  button.addEventListener("pointerleave", () => {
    touchMove[dir] = false;
  });
});

ui.touchShoot.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  touchMove.fire = true;
  if (state?.running) shoot(state.player, mouse.worldX, mouse.worldY, "player");
});
ui.touchShoot.addEventListener("pointerup", () => {
  touchMove.fire = false;
});
ui.touchBuild.addEventListener("click", buildWall);
ui.touchPickup.addEventListener("click", pickupLoot);
ui.shopButton.addEventListener("click", () => {
  ui.shopPanel.classList.remove("hidden");
  renderShop();
});
ui.closeShopButton.addEventListener("click", () => {
  ui.shopPanel.classList.add("hidden");
});
ui.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ui.modeButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    updateMenuPreview();
  });
});
ui.outfitSelect.addEventListener("change", updateMenuPreview);
ui.dropSelect.addEventListener("change", updateMenuPreview);
ui.difficultySelect.addEventListener("change", updateMenuPreview);
ui.startButton.addEventListener("click", startGame);
ui.restartButton.addEventListener("click", startGame);
window.addEventListener("resize", resizeCanvas);

resetGame();
resizeCanvas();
updateMenuPreview();
renderShop();
