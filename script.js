/* =========================================================
   MONEY KINGDOM - EXPANDED GAME SCRIPT
   Structured for readability and easy future upgrades.
========================================================= */

/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector, root = document) => {
  return root.querySelector(selector);
};

const $$ = (selector, root = document) => {
  return [...root.querySelectorAll(selector)];
};

const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomFrom = (array) => {
  if (!array || !array.length) {
    return null;
  }

  return array[Math.floor(Math.random() * array.length)];
};

const wait = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString();
};

/* =========================================================
   SAVE / GAME STATE
========================================================= */

const SAVE_KEY = "moneyKingdomUltraV20";

const DEFAULT_STATE = {
  selectedCookie: "Lucky Cookie",
  currentStage: 1,
  playerLevel: 38,
  castleLevel: 3,
  coins: 1248350,
  gems: 12460,
  wood: 3420,
  stone: 1080,
  tickets: 25,
  residentCapacity: 16,
  expCandy: 42,
  stars: 0,
  buildCategory: "buildings",

  placedBuildings: [
    {
      id: "starter-house-1",
      type: "cookie-house",
      x: 25,
      y: 67,
      rotation: 0
    },
    {
      id: "starter-house-2",
      type: "cookie-house",
      x: 76,
      y: 68,
      rotation: 0
    }
  ],

  autoBattle: true,
  battleSpeed: 1,
  completedStages: {},

  ownedCookies: [
    "Lucky Cookie",
    "Coin Cookie",
    "Dollar Cookie",
    "Property Cookie",
    "Violin Cookie",
    "Banker Cookie",
    "Builder Cookie"
  ],

  team: [
    "Coin Cookie",
    "Dollar Cookie",
    "Banker Cookie",
    "Violin Cookie",
    "Builder Cookie"
  ],

  settings: {
    music: true,
    effects: true,
    reducedEffects: false
  }
};

function cloneDefaultState() {
  return JSON.parse(
    JSON.stringify(DEFAULT_STATE)
  );
}

function loadState() {
  try {
    const raw =
      localStorage.getItem(
        SAVE_KEY
      );

    if (!raw) {
      return cloneDefaultState();
    }

    const parsed =
      JSON.parse(raw);

    return {
      ...cloneDefaultState(),
      ...parsed,

      settings: {
        ...cloneDefaultState().settings,
        ...(parsed.settings || {})
      },

      completedStages:
        parsed.completedStages || {},

      ownedCookies:
        Array.isArray(
          parsed.ownedCookies
        )
          ? parsed.ownedCookies
          : [
              ...DEFAULT_STATE.ownedCookies
            ],

      team:
        Array.isArray(
          parsed.team
        )
          ? parsed.team
          : [
              ...DEFAULT_STATE.team
            ]
    };
  } catch (error) {
    console.warn(
      "Money Kingdom save could not be loaded.",
      error
    );

    return cloneDefaultState();
  }
}

const state = loadState();

/* =========================================================
   SPECIAL MODE SAVE DATA
   Arena, Sealed Dominion, Cookie Trials and Wonderlands are
   fully playable and saved in localStorage.
========================================================= */

function ensureSpecialModeState() {
  const existing =
    state.specialModes || {};

  state.specialModes = {
    arena: {
      trophies: 120,
      wins: 0,
      losses: 0,
      streak: 0,
      tickets: 5,
      ticketDate: "",
      ...(existing.arena || {})
    },

    dominion: {
      ...(existing.dominion || {}),

      selectedPrison:
        existing.dominion?.selectedPrison ||
        "greed",

      clears:
        Number(
          existing.dominion?.clears ||
          0
        ),

      floors: {
        greed: 1,
        deception: 1,
        ruin: 1,
        debt: 1,
        oblivion: 1,

        ...(
          (
            existing.dominion &&
            existing.dominion.floors
          ) ||
          {}
        )
      }
    },

    trials: {
      ...(existing.trials || {}),

      totalClears:
        Number(
          existing.trials?.totalClears ||
          0
        ),

      clears: {
        ...(
          (
            existing.trials &&
            existing.trials.clears
          ) ||
          {}
        )
      }
    },

    wonderlands: {
      ...(existing.wonderlands || {}),

      stars:
        Number(
          existing.wonderlands?.stars ||
          0
        ),

      islands: {
        festival: 0,
        melody: 0,
        dreamland: 0,
        storybook: 0,

        ...(
          (
            existing.wonderlands &&
            existing.wonderlands.islands
          ) ||
          {}
        )
      }
    }
  };

  resetArenaTicketsIfNeeded();
}

function localDateKey() {
  const now =
    new Date();

  return (
    `${now.getFullYear()}-` +
    `${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-` +
    `${String(
      now.getDate()
    ).padStart(2, "0")}`
  );
}

function resetArenaTicketsIfNeeded() {
  if (
    !state.specialModes?.arena
  ) {
    return;
  }

  const today =
    localDateKey();

  const arena =
    state.specialModes.arena;

  if (
    arena.ticketDate !==
    today
  ) {
    arena.ticketDate =
      today;

    arena.tickets =
      5;
  }
}

ensureSpecialModeState();

function saveGame() {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn(
      "Money Kingdom save could not be written.",
      error
    );
  }
}

/* =========================================================
   COOKIE DATA
========================================================= */

const COOKIE_DATA = {
  "Lucky Cookie": {
    rarity: "LEGENDARY",
    level: 60,
    role: "Support",
    position: "Rear",
    element: "Wind + Light",
    power: 8100,

    dough: "#d59a66",
    hair: "#f1cf67",
    coat: "#2f6f55",
    coat2: "#173d34",

    skillName:
      "Fortune Bloom",

    skillType:
      "buff",

    skillPower:
      26,

    cooldown:
      7.5,

    line:
      "Fortune favors the Cookie who still takes the first step."
  },

  "Coin Cookie": {
    rarity: "RARE",
    level: 50,
    role: "Defender",
    position: "Front",
    element: "Earth",
    power: 6500,

    dough: "#cd8d5b",
    hair: "#76c9b5",
    coat: "#366d77",
    coat2: "#1c4850",

    skillName:
      "Coin Shield",

    skillType:
      "shield",

    skillPower:
      18,

    cooldown:
      6.5,

    line:
      "Small beginnings can guard the greatest dreams."
  },

  "Dollar Cookie": {
    rarity: "EPIC",
    level: 50,
    role: "Attacker",
    position: "Middle",
    element: "Light",
    power: 7200,

    dough: "#d89b68",
    hair: "#e47a9e",
    coat: "#7c4563",
    coat2: "#4a2a43",

    skillName:
      "Money Shot",

    skillType:
      "burst",

    skillPower:
      38,

    cooldown:
      6,

    line:
      "Come on. We have a kingdom to build!"
  },

  "Budget Cookie": {
    rarity: "RARE",
    level: 38,
    role: "Support",
    position: "Rear",
    element: "Neutral",
    power: 5100,

    dough: "#c7895b",
    hair: "#6fa9e0",
    coat: "#355f8e",
    coat2: "#1f3d62",

    skillName:
      "Balanced Ledger",

    skillType:
      "buff",

    skillPower:
      18,

    cooldown:
      6.8,

    line:
      "A plan gives every coin a purpose."
  },

  "Investor Cookie": {
    rarity: "EPIC",
    level: 47,
    role: "Support",
    position: "Rear",
    element: "Nature",
    power: 6800,

    dough: "#d39968",
    hair: "#a28be0",
    coat: "#5a4f8a",
    coat2: "#302c58",

    skillName:
      "Growth Seed",

    skillType:
      "aoe",

    skillPower:
      24,

    cooldown:
      7.2,

    line:
      "Give it time. Even tiny seeds remember how to grow."
  },

  "Banker Cookie": {
    rarity: "EPIC",
    level: 30,
    role: "Healer",
    position: "Rear",
    element: "Water",
    power: 5200,

    dough: "#ce8d5e",
    hair: "#e7b75d",
    coat: "#8a5a31",
    coat2: "#5b3b24",

    skillName:
      "Safe Reserve",

    skillType:
      "heal",

    skillPower:
      24,

    cooldown:
      7.8,

    line:
      "A little reserve can make all the difference."
  },

  "Credit Cookie": {
    rarity: "EPIC",
    level: 36,
    role: "Support",
    position: "Middle",
    element: "Arcane",
    power: 5600,

    dough: "#d29260",
    hair: "#79b867",
    coat: "#3d734a",
    coat2: "#244d35",

    skillName:
      "Credit Line",

    skillType:
      "buff",

    skillPower:
      20,

    cooldown:
      7.1,

    line:
      "Borrow wisely, and always know the cost."
  },

  "Business Cookie": {
    rarity: "EPIC",
    level: 44,
    role: "Attacker",
    position: "Middle",
    element: "Fire",
    power: 6450,

    dough: "#d59a66",
    hair: "#f1cf67",
    coat: "#2f6f55",
    coat2: "#173d34",

    skillName:
      "Enterprise Rush",

    skillType:
      "burst",

    skillPower:
      32,

    cooldown:
      6.4,

    line:
      "Build value before chasing applause."
  },

  "Tax Cookie": {
    rarity: "EPIC",
    level: 41,
    role: "Support",
    position: "Rear",
    element: "Neutral",
    power: 6100,

    dough: "#cd8d5b",
    hair: "#76c9b5",
    coat: "#366d77",
    coat2: "#1c4850",

    skillName:
      "Fair Share",

    skillType:
      "aoe",

    skillPower:
      21,

    cooldown:
      7.5,

    line:
      "Every kingdom needs rules that keep it standing."
  },

  "Insurance Cookie": {
    rarity: "EPIC",
    level: 42,
    role: "Defender",
    position: "Front",
    element: "Water",
    power: 6250,

    dough: "#d89b68",
    hair: "#e47a9e",
    coat: "#7c4563",
    coat2: "#4a2a43",

    skillName:
      "Safety Net",

    skillType:
      "shield",

    skillPower:
      22,

    cooldown:
      7.2,

    line:
      "Protection matters most before the storm arrives."
  },

  "Health Cookie": {
    rarity: "RARE",
    level: 34,
    role: "Healer",
    position: "Rear",
    element: "Nature",
    power: 5000,

    dough: "#c7895b",
    hair: "#6fa9e0",
    coat: "#355f8e",
    coat2: "#1f3d62",

    skillName:
      "Healthy Reserve",

    skillType:
      "heal",

    skillPower:
      21,

    cooldown:
      7.4,

    line:
      "Strong habits protect more than gold ever could."
  },

  "Education Cookie": {
    rarity: "RARE",
    level: 35,
    role: "Support",
    position: "Rear",
    element: "Light",
    power: 5050,

    dough: "#d39968",
    hair: "#a28be0",
    coat: "#5a4f8a",
    coat2: "#302c58",

    skillName:
      "Bright Lesson",

    skillType:
      "buff",

    skillPower:
      20,

    cooldown:
      6.9,

    line:
      "Knowledge compounds too."
  },

  "Property Cookie": {
    rarity: "EPIC",
    level: 40,
    role: "Defender",
    position: "Front",
    element: "Earth",
    power: 5900,

    dough: "#ce8d5e",
    hair: "#e7b75d",
    coat: "#8a5a31",
    coat2: "#5b3b24",

    skillName:
      "Foundation Wall",

    skillType:
      "shield",

    skillPower:
      16,

    cooldown:
      7,

    line:
      "Strong homes begin with strong foundations."
  },

  "Retirement Cookie": {
    rarity: "EPIC",
    level: 46,
    role: "Support",
    position: "Rear",
    element: "Light",
    power: 6650,

    dough: "#d29260",
    hair: "#79b867",
    coat: "#3d734a",
    coat2: "#244d35",

    skillName:
      "Long Horizon",

    skillType:
      "buff",

    skillPower:
      25,

    cooldown:
      8,

    line:
      "Tomorrow becomes easier when today has a plan."
  },

  "Side Hustle Cookie": {
    rarity: "EPIC",
    level: 39,
    role: "Attacker",
    position: "Middle",
    element: "Lightning",
    power: 5900,

    dough: "#d59a66",
    hair: "#f1cf67",
    coat: "#2f6f55",
    coat2: "#173d34",

    skillName:
      "Second Shift",

    skillType:
      "burst",

    skillPower:
      30,

    cooldown:
      6.2,

    line:
      "One more skill can open one more door."
  },

  "Spendthrift Cookie": {
    rarity: "RARE",
    level: 30,
    role: "Attacker",
    position: "Middle",
    element: "Fire",
    power: 4700,

    dough: "#cd8d5b",
    hair: "#76c9b5",
    coat: "#366d77",
    coat2: "#1c4850",

    skillName:
      "Impulse Splash",

    skillType:
      "burst",

    skillPower:
      26,

    cooldown:
      5.7,

    line:
      "Wait... was that really on the list?"
  },

  "Charity Cookie": {
    rarity: "EPIC",
    level: 40,
    role: "Healer",
    position: "Rear",
    element: "Light",
    power: 6020,

    dough: "#d89b68",
    hair: "#e47a9e",
    coat: "#7c4563",
    coat2: "#4a2a43",

    skillName:
      "Giving Heart",

    skillType:
      "heal",

    skillPower:
      25,

    cooldown:
      7.3,

    line:
      "A kingdom grows warmer when we share."
  },

  "Sustainability Cookie": {
    rarity: "EPIC",
    level: 43,
    role: "Support",
    position: "Rear",
    element: "Nature",
    power: 6300,

    dough: "#c7895b",
    hair: "#6fa9e0",
    coat: "#355f8e",
    coat2: "#1f3d62",

    skillName:
      "Green Future",

    skillType:
      "buff",

    skillPower:
      23,

    cooldown:
      7.6,

    line:
      "Prosperity should leave something good behind."
  },

  "Family Cookie": {
    rarity: "EPIC",
    level: 41,
    role: "Defender",
    position: "Front",
    element: "Light",
    power: 6150,

    dough: "#d39968",
    hair: "#a28be0",
    coat: "#5a4f8a",
    coat2: "#302c58",

    skillName:
      "Together Shield",

    skillType:
      "shield",

    skillPower:
      23,

    cooldown:
      7.5,

    line:
      "We build so the people we love can thrive."
  },

  "Explorer Cookie": {
    rarity: "EPIC",
    level: 38,
    role: "Attacker",
    position: "Front",
    element: "Wind",
    power: 5750,

    dough: "#ce8d5e",
    hair: "#e7b75d",
    coat: "#8a5a31",
    coat2: "#5b3b24",

    skillName:
      "New Horizon",

    skillType:
      "burst",

    skillPower:
      29,

    cooldown:
      6.5,

    line:
      "There is always another path worth discovering."
  },

  "Time Cookie": {
    rarity: "SUPER EPIC",
    level: 52,
    role: "Support",
    position: "Rear",
    element: "Arcane",
    power: 7550,

    dough: "#d29260",
    hair: "#79b867",
    coat: "#3d734a",
    coat2: "#244d35",

    skillName:
      "Borrowed Seconds",

    skillType:
      "buff",

    skillPower:
      31,

    cooldown:
      8.4,

    line:
      "Spend your time like the treasure it is."
  },

  "Savings Cookie": {
    rarity: "EPIC",
    level: 42,
    role: "Support",
    position: "Middle",
    element: "Water",
    power: 6200,

    dough: "#d59a66",
    hair: "#f1cf67",
    coat: "#2f6f55",
    coat2: "#173d34",

    skillName:
      "Rainy Day Jar",

    skillType:
      "shield",

    skillPower:
      21,

    cooldown:
      7.1,

    line:
      "A little saved today can calm tomorrow."
  },

  "Security Cookie": {
    rarity: "EPIC",
    level: 45,
    role: "Defender",
    position: "Front",
    element: "Earth",
    power: 6540,

    dough: "#cd8d5b",
    hair: "#76c9b5",
    coat: "#366d77",
    coat2: "#1c4850",

    skillName:
      "Vault Guard",

    skillType:
      "shield",

    skillPower:
      26,

    cooldown:
      7.9,

    line:
      "Good walls protect what matters."
  },

  "Merchant Cookie": {
    rarity: "EPIC",
    level: 40,
    role: "Attacker",
    position: "Middle",
    element: "Wind",
    power: 5960,

    dough: "#d89b68",
    hair: "#e47a9e",
    coat: "#7c4563",
    coat2: "#4a2a43",

    skillName:
      "Market Rush",

    skillType:
      "aoe",

    skillPower:
      25,

    cooldown:
      6.8,

    line:
      "Value travels wherever people need it."
  },

  "Builder Cookie": {
    rarity: "RARE",
    level: 20,
    role: "Defender",
    position: "Front",
    element: "Earth",
    power: 4100,

    dough: "#c7895b",
    hair: "#6fa9e0",
    coat: "#355f8e",
    coat2: "#1f3d62",

    skillName:
      "Hammer Drop",

    skillType:
      "stun",

    skillPower:
      31,

    cooldown:
      6.8,

    line:
      "If we can imagine it, we can build it."
  },

  "Harvest Cookie": {
    rarity: "RARE",
    level: 33,
    role: "Support",
    position: "Rear",
    element: "Nature",
    power: 4920,

    dough: "#d39968",
    hair: "#a28be0",
    coat: "#5a4f8a",
    coat2: "#302c58",

    skillName:
      "Golden Harvest",

    skillType:
      "heal",

    skillPower:
      18,

    cooldown:
      6.9,

    line:
      "Care for the field and it will care for the kingdom."
  },

  "Trader Cookie": {
    rarity: "EPIC",
    level: 43,
    role: "Attacker",
    position: "Middle",
    element: "Wind",
    power: 6330,

    dough: "#ce8d5e",
    hair: "#e7b75d",
    coat: "#8a5a31",
    coat2: "#5b3b24",

    skillName:
      "Fair Exchange",
        skillType: "burst",
    skillPower: 30,
    cooldown: 6.6,
    line: "The best trade leaves both sides stronger."
  },

  "Analyst Cookie": {
    rarity: "EPIC",
    level: 44,
    role: "Support",
    position: "Rear",
    element: "Arcane",
    power: 6410,
    dough: "#d29260",
    hair: "#79b867",
    coat: "#3d734a",
    coat2: "#244d35",
    skillName: "Clear Numbers",
    skillType: "buff",
    skillPower: 24,
    cooldown: 7.1,
    line: "Patterns become useful when we know what they mean."
  },

  "Scamwatch Cookie": {
    rarity: "SUPER EPIC",
    level: 50,
    role: "Support",
    position: "Middle",
    element: "Light",
    power: 7380,
    dough: "#d59a66",
    hair: "#f1cf67",
    coat: "#2f6f55",
    coat2: "#173d34",
    skillName: "Red Flag Alert",
    skillType: "stun",
    skillPower: 26,
    cooldown: 7.4,
    line: "If it sounds too good to be true, look twice."
  },

  "Piano Cookie": {
    rarity: "EPIC",
    level: 39,
    role: "Support",
    position: "Rear",
    element: "Light",
    power: 5840,
    dough: "#cd8d5b",
    hair: "#76c9b5",
    coat: "#366d77",
    coat2: "#1c4850",
    skillName: "Golden Arpeggio",
    skillType: "aoe",
    skillPower: 22,
    cooldown: 7,
    line: "Every note can lift a tired heart."
  },

  "Violin Cookie": {
    rarity: "EPIC",
    level: 40,
    role: "Support",
    position: "Rear",
    element: "Light",
    power: 5750,
    dough: "#d89b68",
    hair: "#e47a9e",
    coat: "#7c4563",
    coat2: "#4a2a43",
    skillName: "Radiant Concerto",
    skillType: "aoe",
    skillPower: 24,
    cooldown: 7.2,
    line: "Every kingdom deserves a melody worth remembering."
  },

  "Drummer Cookie": {
    rarity: "EPIC",
    level: 41,
    role: "Attacker",
    position: "Middle",
    element: "Fire",
    power: 6100,
    dough: "#c7895b",
    hair: "#6fa9e0",
    coat: "#355f8e",
    coat2: "#1f3d62",
    skillName: "Marching Beat",
    skillType: "aoe",
    skillPower: 27,
    cooldown: 6.6,
    line: "Keep the rhythm. Keep moving."
  },

  "Flute Cookie": {
    rarity: "RARE",
    level: 34,
    role: "Support",
    position: "Rear",
    element: "Wind",
    power: 4980,
    dough: "#d39968",
    hair: "#a28be0",
    coat: "#5a4f8a",
    coat2: "#302c58",
    skillName: "Breeze Melody",
    skillType: "heal",
    skillPower: 19,
    cooldown: 6.8,
    line: "Soft music can carry courage a long way."
  },

  "DJ Cookie": {
    rarity: "SUPER EPIC",
    level: 51,
    role: "Attacker",
    position: "Middle",
    element: "Lightning",
    power: 7460,
    dough: "#ce8d5e",
    hair: "#e7b75d",
    coat: "#8a5a31",
    coat2: "#5b3b24",
    skillName: "Bass Drop",
    skillType: "aoe",
    skillPower: 34,
    cooldown: 7.1,
    line: "Turn it up. Prospera needs a beat."
  },

  "Music Box Cookie": {
    rarity: "EPIC",
    level: 37,
    role: "Support",
    position: "Rear",
    element: "Arcane",
    power: 5620,
    dough: "#d29260",
    hair: "#79b867",
    coat: "#3d734a",
    coat2: "#244d35",
    skillName: "Clockwork Lullaby",
    skillType: "stun",
    skillPower: 19,
    cooldown: 7.7,
    line: "Some melodies remember us before we remember them."
  },

  "Conductor Cookie": {
    rarity: "SUPER EPIC",
    level: 53,
    role: "Support",
    position: "Rear",
    element: "Light",
    power: 7720,
    dough: "#d59a66",
    hair: "#f1cf67",
    coat: "#2f6f55",
    coat2: "#173d34",
    skillName: "Grand Crescendo",
    skillType: "buff",
    skillPower: 34,
    cooldown: 8.2,
    line: "Every voice matters when the whole kingdom plays together."
  },

  "Rockstar Cookie": {
    rarity: "SUPER EPIC",
    level: 52,
    role: "Attacker",
    position: "Middle",
    element: "Fire",
    power: 7680,
    dough: "#cd8d5b",
    hair: "#76c9b5",
    coat: "#366d77",
    coat2: "#1c4850",
    skillName: "Encore Blaze",
    skillType: "burst",
    skillPower: 36,
    cooldown: 6.9,
    line: "One more song. One more spark."
  },

  "Saxophone Cookie": {
    rarity: "EPIC",
    level: 39,
    role: "Support",
    position: "Rear",
    element: "Wind",
    power: 5860,
    dough: "#d89b68",
    hair: "#e47a9e",
    coat: "#7c4563",
    coat2: "#4a2a43",
    skillName: "Midnight Swing",
    skillType: "aoe",
    skillPower: 23,
    cooldown: 7.1,
    line: "A little swing makes even hard roads easier."
  },

  "Bell Cookie": {
    rarity: "RARE",
    level: 32,
    role: "Support",
    position: "Rear",
    element: "Light",
    power: 4860,
    dough: "#c7895b",
    hair: "#6fa9e0",
    coat: "#355f8e",
    coat2: "#1f3d62",
    skillName: "Morning Chime",
    skillType: "heal",
    skillPower: 18,
    cooldown: 6.7,
    line: "A new day deserves a hopeful sound."
  },

  "Golden Cookie": {
    rarity: "LEGENDARY",
    level: 58,
    role: "Attacker",
    position: "Middle",
    element: "Light",
    power: 8450,
    dough: "#d39968",
    hair: "#a28be0",
    coat: "#5a4f8a",
    coat2: "#302c58",
    skillName: "Radiant Treasury",
    skillType: "burst",
    skillPower: 43,
    cooldown: 8.2,
    line: "Shine brightly enough to guide others too."
  },

  "Chronos Cookie": {
    rarity: "LEGENDARY",
    level: 60,
    role: "Support",
    position: "Rear",
    element: "Arcane + Light",
    power: 8700,
    dough: "#ce8d5e",
    hair: "#e7b75d",
    coat: "#8a5a31",
    coat2: "#5b3b24",
    skillName: "Timekeeper's Hour",
    skillType: "buff",
    skillPower: 38,
    cooldown: 9,
    line: "A moment well used can change a lifetime."
  },

  "Compound Cookie": {
    rarity: "LEGENDARY",
    level: 59,
    role: "Support",
    position: "Rear",
    element: "Nature",
    power: 8520,
    dough: "#d29260",
    hair: "#79b867",
    coat: "#3d734a",
    coat2: "#244d35",
    skillName: "Endless Growth",
    skillType: "buff",
    skillPower: 37,
    cooldown: 8.8,
    line: "Growth loves patience more than noise."
  },

  "Diamond Cookie": {
    rarity: "LEGENDARY",
    level: 60,
    role: "Defender",
    position: "Front",
    element: "Earth",
    power: 9000,
    dough: "#d59a66",
    hair: "#f1cf67",
    coat: "#2f6f55",
    coat2: "#173d34",
    skillName: "Crystal Resolve",
    skillType: "shield",
    skillPower: 42,
    cooldown: 9.2,
    line: "Pressure can shape strength without taking away kindness."
  },

  "Opportuna Cookie": {
    rarity: "LEGENDARY",
    level: 57,
    role: "Attacker",
    position: "Middle",
    element: "Wind",
    power: 8360,
    dough: "#cd8d5b",
    hair: "#76c9b5",
    coat: "#366d77",
    coat2: "#1c4850",
    skillName: "Open Door",
    skillType: "burst",
    skillPower: 41,
    cooldown: 8.1,
    line: "Opportunity knocks softly. Be ready to hear it."
  },

  "Verdantis Cookie": {
    rarity: "LEGENDARY",
    level: 60,
    role: "Defender",
    position: "Front",
    element: "Nature + Earth",
    power: 8920,
    dough: "#d89b68",
    hair: "#e47a9e",
    coat: "#7c4563",
    coat2: "#4a2a43",
    skillName: "Evergreen Sanctuary",
    skillType: "shield",
    skillPower: 40,
    cooldown: 9.1,
    line: "Protect the roots and the future will find its way."
  },

  "Stellara Cookie": {
    rarity: "LEGENDARY",
    level: 60,
    role: "Support",
    position: "Rear",
    element: "Light + Arcane",
    power: 8880,
    dough: "#c7895b",
    hair: "#6fa9e0",
    coat: "#355f8e",
    coat2: "#1f3d62",
    skillName: "Dreamweaver",
    skillType: "heal",
    skillPower: 39,
    cooldown: 9,
    line: "Dreams become maps when we give them direction."
  },

  "Equilibra Cookie": {
    rarity: "ANCIENT",
    level: 70,
    role: "Support",
    position: "Middle",
    element: "Neutral",
    power: 10600,
    dough: "#d39968",
    hair: "#a28be0",
    coat: "#5a4f8a",
    coat2: "#302c58",
    skillName: "Perfect Balance",
    skillType: "buff",
    skillPower: 48,
    cooldown: 10,
    line: "Prosperity without balance is only another kind of hunger."
  },

  "Sapheon Cookie": {
    rarity: "ANCIENT",
    level: 70,
    role: "Support",
    position: "Rear",
    element: "Light",
    power: 10550,
    dough: "#ce8d5e",
    hair: "#e7b75d",
    coat: "#8a5a31",
    coat2: "#5b3b24",
    skillName: "Eternal Truth",
    skillType: "stun",
    skillPower: 45,
    cooldown: 9.8,
    line: "Truth does not need to shout. It only needs to endure."
  },

  "Florentia Cookie": {
    rarity: "ANCIENT",
    level: 70,
    role: "Healer",
    position: "Rear",
    element: "Nature + Light",
    power: 10800,
    dough: "#d29260",
    hair: "#79b867",
    coat: "#3d734a",
    coat2: "#244d35",
    skillName: "Everlasting Bloom",
    skillType: "heal",
    skillPower: 50,
    cooldown: 10.4,
    line: "What we nurture today becomes shelter tomorrow."
  },

  "Liberis Cookie": {
    rarity: "ANCIENT",
    level: 70,
    role: "Attacker",
    position: "Middle",
    element: "Wind + Light",
    power: 10750,
    dough: "#d59a66",
    hair: "#f1cf67",
    coat: "#2f6f55",
    coat2: "#173d34",
    skillName: "Wings of Freedom",
    skillType: "burst",
    skillPower: 49,
    cooldown: 9.7,
    line: "No chain is stronger than a Cookie who remembers freedom."
  },

  "Memoria Cookie": {
    rarity: "ANCIENT",
    level: 70,
    role: "Defender",
    position: "Rear",
    element: "Light + Arcane",
    power: 10900,
    dough: "#cd8d5b",
    hair: "#76c9b5",
    coat: "#366d77",
    coat2: "#1c4850",
    skillName: "Eternal Legacy",
    skillType: "shield",
    skillPower: 51,
    cooldown: 10.5,
    line: "A kingdom survives as long as someone remembers why it mattered."
  },

  "Greed Cookie": {
    rarity: "BEAST",
    level: 80,
    role: "Attacker",
    position: "Front",
    element: "Dark + Fire",
    power: 12500,
    dough: "#d89b68",
    hair: "#e47a9e",
    coat: "#7c4563",
    coat2: "#4a2a43",
    skillName: "Endless Hunger",
    skillType: "burst",
    skillPower: 62,
    cooldown: 10.2,
    line: "Enough? What a tiny, frightened word."
  },

  "Deception Cookie": {
    rarity: "BEAST",
    level: 80,
    role: "Support",
    position: "Rear",
    element: "Dark + Arcane",
    power: 12400,
    dough: "#c7895b",
    hair: "#6fa9e0",
    coat: "#355f8e",
    coat2: "#1f3d62",
    skillName: "Thousand Lies",
    skillType: "stun",
    skillPower: 58,
    cooldown: 10.6,
    line: "Truth is predictable. Shall we try something more interesting?"
  },

  "Ruin Cookie": {
    rarity: "BEAST",
    level: 80,
    role: "Attacker",
    position: "Front",
    element: "Fire + Dark",
    power: 12800,
    dough: "#d39968",
    hair: "#a28be0",
    coat: "#5a4f8a",
    coat2: "#302c58",
    skillName: "End of Prosperity",
    skillType: "aoe",
    skillPower: 64,
    cooldown: 10.1,
    line: "If it can be built, it can be broken beautifully."
  },

  "Debt Cookie": {
    rarity: "BEAST",
    level: 80,
    role: "Defender",
    position: "Front",
    element: "Dark + Earth",
    power: 12900,
    dough: "#ce8d5e",
    hair: "#e7b75d",
    coat: "#8a5a31",
    coat2: "#5b3b24",
    skillName: "Eternal Chains",
    skillType: "shield",
    skillPower: 60,
    cooldown: 10.8,
    line: "Every promise has a weight. I simply make sure you feel it."
  },

  "Oblivion Cookie": {
    rarity: "BEAST",
    level: 80,
    role: "Support",
    position: "Rear",
    element: "Dark + Arcane",
    power: 12650,
    dough: "#d29260",
    hair: "#79b867",
    coat: "#3d734a",
    coat2: "#244d35",
    skillName: "Forgotten End",
    skillType: "aoe",
    skillPower: 61,
    cooldown: 10.7,
    line: "Close your eyes. Soon there will be nothing left to remember."
  },

  "Phoenix Sugar Cookie": {
    rarity: "SUPER EPIC",
    level: 55,
    role: "Attacker",
    position: "Middle",
    element: "Fire + Light",
    power: 7900,
    dough: "#d59a66",
    hair: "#f1cf67",
    coat: "#2f6f55",
    coat2: "#173d34",
    skillName: "Last Flame",
    skillType: "burst",
    skillPower: 39,
    cooldown: 8.2,
    line: "Even ash remembers how to rise."
  },

  "Nightmare Cookie": {
    rarity: "SUPER EPIC",
    level: 54,
    role: "Attacker",
    position: "Middle",
    element: "Dark + Arcane",
    power: 7840,
    dough: "#cd8d5b",
    hair: "#76c9b5",
    coat: "#366d77",
    coat2: "#1c4850",
    skillName: "Shadow Return",
    skillType: "burst",
    skillPower: 38,
    cooldown: 8.3,
    line: "Fear fades when you keep moving through it."
  },

  "Paradise Cookie": {
    rarity: "LEGENDARY",
    level: 58,
    role: "Healer",
    position: "Rear",
    element: "Nature + Light",
    power: 8480,
    dough: "#d89b68",
    hair: "#e47a9e",
    coat: "#7c4563",
    coat2: "#4a2a43",
    skillName: "Paradise Bloom",
    skillType: "heal",
    skillPower: 41,
    cooldown: 8.8,
    line: "Rest is part of every long journey."
  }
};

const SUMMON_POOL = [
  "Lucky Cookie",
  "Coin Cookie",
  "Dollar Cookie",
  "Budget Cookie",
  "Investor Cookie",
  "Banker Cookie",
  "Credit Cookie",
  "Business Cookie",
  "Tax Cookie",
  "Insurance Cookie",
  "Health Cookie",
  "Education Cookie",
  "Property Cookie",
  "Retirement Cookie",
  "Side Hustle Cookie",
  "Spendthrift Cookie",
  "Charity Cookie",
  "Sustainability Cookie",
  "Family Cookie",
  "Explorer Cookie",
  "Time Cookie",
  "Savings Cookie",
  "Security Cookie",
  "Merchant Cookie",
  "Builder Cookie",
  "Harvest Cookie",
  "Trader Cookie",
  "Analyst Cookie",
  "Scamwatch Cookie",
  "Piano Cookie",
  "Violin Cookie",
  "Drummer Cookie",
  "Flute Cookie",
  "DJ Cookie",
  "Music Box Cookie",
  "Conductor Cookie",
  "Rockstar Cookie",
  "Saxophone Cookie",
  "Bell Cookie",
  "Golden Cookie",
  "Chronos Cookie",
  "Compound Cookie",
  "Diamond Cookie",
  "Opportuna Cookie",
  "Verdantis Cookie",
  "Stellara Cookie",
  "Equilibra Cookie",
  "Sapheon Cookie",
  "Florentia Cookie",
  "Liberis Cookie",
  "Memoria Cookie",
  "Phoenix Sugar Cookie",
  "Nightmare Cookie",
  "Paradise Cookie"
];

const RARITY_WEIGHTS = {
  RARE: 45,
  EPIC: 34,
  "SUPER EPIC": 10,
  LEGENDARY: 6,
  ANCIENT: 4,
  BEAST: 1
};

/* =========================================================
   FROSTPEAK STAGE DATA
========================================================= */

const FROSTPEAK_STAGES = {
  1: {
    title: "Footprints in the Snow",
    subtitle: "Protect the Caravan",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 1 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 4420,
    boss: false
  },

  2: {
    title: "Lanterns on the Ridge",
    subtitle: "Find the Missing Supplies",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 2 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 4640,
    boss: false
  },

  3: {
    title: "The Narrow Pass",
    subtitle: "Clear the Mountain Trail",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 3 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 4860,
    boss: false
  },

  4: {
    title: "Whispers in the Ice",
    subtitle: "Rescue the Scouts",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 4 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 5080,
    boss: false
  },

  5: {
    title: "Supplies at Risk",
    subtitle: "Reach the Next Shelter",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 5 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 5300,
    boss: false
  },

  6: {
    title: "Avalanche Warning",
    subtitle: "Protect the Caravan",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 6 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 5520,
    boss: false
  },

  7: {
    title: "Frozen Crossroads",
    subtitle: "Find the Missing Supplies",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 7 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 5740,
    boss: false
  },
  8: {
    title: "A Bridge of Snow",
    subtitle: "Clear the Mountain Trail",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 8 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 5960,
    boss: false
  },

  9: {
    title: "The Last Campfire",
    subtitle: "Rescue the Scouts",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 9 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 6180,
    boss: false
  },

  10: {
    title: "The Frozen Tollgate",
    subtitle: "Mini-Boss: Icehorn Brute",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 10 tests preparation, teamwork and the courage to keep moving.",
    waves: 6,
    recommendedPower: 6400,
    boss: true
  },

  11: {
    title: "Lanterns on the Ridge",
    subtitle: "Protect the Caravan",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 11 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 6620,
    boss: false
  },

  12: {
    title: "The Narrow Pass",
    subtitle: "Find the Missing Supplies",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 12 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 6840,
    boss: false
  },

  13: {
    title: "Whispers in the Ice",
    subtitle: "Clear the Mountain Trail",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 13 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 7060,
    boss: false
  },

  14: {
    title: "Supplies at Risk",
    subtitle: "Rescue the Scouts",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 14 tests preparation, teamwork and the courage to keep moving.",
    waves: 3,
    recommendedPower: 7280,
    boss: false
  },

  15: {
    title: "Avalanche Warning",
    subtitle: "Reach the Next Shelter",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 15 tests preparation, teamwork and the courage to keep moving.",
    waves: 4,
    recommendedPower: 7500,
    boss: false
  },

  16: {
    title: "Frozen Crossroads",
    subtitle: "Protect the Caravan",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 16 tests preparation, teamwork and the courage to keep moving.",
    waves: 4,
    recommendedPower: 7720,
    boss: false
  },

  17: {
    title: "A Bridge of Snow",
    subtitle: "Find the Missing Supplies",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 17 tests preparation, teamwork and the courage to keep moving.",
    waves: 4,
    recommendedPower: 7940,
    boss: false
  },

  18: {
    title: "The Last Campfire",
    subtitle: "Clear the Mountain Trail",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 18 tests preparation, teamwork and the courage to keep moving.",
    waves: 4,
    recommendedPower: 8160,
    boss: false
  },

  19: {
    title: "Footprints in the Snow",
    subtitle: "Rescue the Scouts",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 19 tests preparation, teamwork and the courage to keep moving.",
    waves: 4,
    recommendedPower: 8380,
    boss: false
  },

  20: {
    title: "Truth Beneath the Glacier",
    subtitle: "The Mountain Reveals Its Secret",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 20 tests preparation, teamwork and the courage to keep moving.",
    waves: 7,
    recommendedPower: 8600,
    boss: true
  },

  21: {
    title: "The Narrow Pass",
    subtitle: "Protect the Caravan",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 21 tests preparation, teamwork and the courage to keep moving.",
    waves: 4,
    recommendedPower: 8820,
    boss: false
  },

  22: {
    title: "Whispers in the Ice",
    subtitle: "Find the Missing Supplies",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 22 tests preparation, teamwork and the courage to keep moving.",
    waves: 4,
    recommendedPower: 9040,
    boss: false
  },

  23: {
    title: "Supplies at Risk",
    subtitle: "Clear the Mountain Trail",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 23 tests preparation, teamwork and the courage to keep moving.",
    waves: 4,
    recommendedPower: 9260,
    boss: false
  },

  24: {
    title: "Avalanche Warning",
    subtitle: "Rescue the Scouts",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 24 tests preparation, teamwork and the courage to keep moving.",
    waves: 4,
    recommendedPower: 9480,
    boss: false
  },

  25: {
    title: "Frozen Crossroads",
    subtitle: "Reach the Next Shelter",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 25 tests preparation, teamwork and the courage to keep moving.",
    waves: 5,
    recommendedPower: 9700,
    boss: false
  },

  26: {
    title: "A Bridge of Snow",
    subtitle: "Protect the Caravan",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 26 tests preparation, teamwork and the courage to keep moving.",
    waves: 5,
    recommendedPower: 9920,
    boss: false
  },

  27: {
    title: "The Last Campfire",
    subtitle: "Find the Missing Supplies",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 27 tests preparation, teamwork and the courage to keep moving.",
    waves: 5,
    recommendedPower: 10140,
    boss: false
  },

  28: {
    title: "Footprints in the Snow",
    subtitle: "Clear the Mountain Trail",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 28 tests preparation, teamwork and the courage to keep moving.",
    waves: 5,
    recommendedPower: 10360,
    boss: false
  },

  29: {
    title: "Lanterns on the Ridge",
    subtitle: "Rescue the Scouts",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 29 tests preparation, teamwork and the courage to keep moving.",
    waves: 5,
    recommendedPower: 10580,
    boss: false
  },

  30: {
    title: "Heart of Frostpeak",
    subtitle: "World Boss: Frost Guardian",
    description: "Prospera's expedition pushes deeper into Frostpeak. Stage 30 tests preparation, teamwork and the courage to keep moving.",
    waves: 8,
    recommendedPower: 10800,
    boss: true
  }
};


/* =========================================================
   BATTLE RUNTIME STATE
========================================================= */

const battle = {
  running: false,
  paused: false,
  currentWave: 0,
  totalWaves: 0,
  stage: 1,
  auto: state.autoBattle,
  speed: state.battleSpeed,
  token: 0,
  snowTimer: null,
  enemyTurnCounter: 0,
  mode: "story",
  specialContext: null,
  cooldownTimers: new Map()
};

/* =========================================================
   IMAGE CHECKS
========================================================= */

function setupImageCheck(imageSelector, errorSelector) {
  const image = $(imageSelector);
  const error = $(errorSelector);

  if (!image || !error) {
    return;
  }

  image.addEventListener("load", () => {
    error.hidden = true;
  });

  image.addEventListener("error", () => {
    error.hidden = false;
  });

  if (image.complete && image.naturalWidth === 0) {
    error.hidden = false;
  }
}

/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function toast(message) {
  const element = $("#toast");

  if (!element) {
    return;
  }

  element.textContent = message;
  element.hidden = false;

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.hidden = true;
  }, 2100);
}

/* =========================================================
   SCREEN ROUTER
========================================================= */

function showScreen(id) {
  $$(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const next = $(`#${id}`);

  if (next) {
    next.classList.add("active");
  }

  closePanel();

  if (id === "cookiesScreen") {
    refreshCookieInfo();
  }

  if (id === "adventureScreen") {
    refreshAdventureProgress();
  }

  if (id === "worldScreen") {
    renderStageRoute();
  }

  if (id === "summonScreen") {
    refreshSummonScreen();
  }
}

function setupScreenNavigation() {
  $$('[data-screen]').forEach((button) => {
    button.addEventListener("click", () => {
      showScreen(button.dataset.screen);
    });
  });
}

/* =========================================================
   KINGDOM AMBIENT EFFECTS
========================================================= */

function createSparkles() {
  const layer = $("#sparkLayer");

  if (!layer) {
    return;
  }

  layer.innerHTML = "";

  for (let index = 0; index < 28; index += 1) {
    const sparkle = document.createElement("i");

    sparkle.className = "spark";
    sparkle.style.left = `${5 + Math.random() * 90}%`;
    sparkle.style.top = `${28 + Math.random() * 60}%`;
    sparkle.style.animationDuration = `${4 + Math.random() * 5}s`;
    sparkle.style.animationDelay = `${-Math.random() * 7}s`;

    layer.appendChild(sparkle);
  }
}

function createAmbientClouds() {
  const layer = $("#ambientCloudLayer");

  if (!layer) {
    return;
  }

  layer.innerHTML = "";

  for (let index = 0; index < 4; index += 1) {
    const cloud = document.createElement("div");

    cloud.className = "ambient-cloud";
    cloud.style.left = `${-10 + index * 28}%`;
    cloud.style.top = `${13 + index * 10}%`;
    cloud.style.animationDuration = `${18 + index * 6}s`;
    cloud.style.animationDelay = `${-index * 4}s`;

    layer.appendChild(cloud);
  }
}

const KINGDOM_PHASES = [
  "morning",
  "day",
  "evening",
  "night"
];

let kingdomPhaseIndex = 0;

function applyKingdomPhase() {
  const phase = KINGDOM_PHASES[kingdomPhaseIndex];
  const tint = $("#kingdomTimeTint");
  const label = $("#phaseText");

  if (tint) {
    tint.className = `kingdom-time-tint ${phase}`;
  }

  if (label) {
    label.textContent = phase[0].toUpperCase() + phase.slice(1);
  }
}

function startKingdomClock() {
  applyKingdomPhase();

  setInterval(() => {
    kingdomPhaseIndex = (kingdomPhaseIndex + 1) % KINGDOM_PHASES.length;
    applyKingdomPhase();
  }, 30000);
}

/* =========================================================
   KINGDOM STATUS
========================================================= */

function refreshKingdomStatus() {
  const residentText = $("#residentText");
  const castleLevelText = $("#castleLevelText");

  if (residentText) {
    residentText.textContent = `${state.ownedCookies.length} / ${state.residentCapacity}`;
  }

  if (castleLevelText) {
    castleLevelText.textContent = `Lv. ${state.castleLevel}`;
  }
}

/* =========================================================
   SIDE PANEL
========================================================= */

function openPanel(title, kicker, html) {
  $("#panelTitle").textContent = title;
  $("#panelKicker").textContent = kicker;
  $("#panelBody").innerHTML = html;
  $("#panelShade").hidden = false;
  $("#sidePanel").hidden = false;
}

function closePanel() {
  const shade = $("#panelShade");
  const panel = $("#sidePanel");

  if (shade) {
    shade.hidden = true;
  }

  if (panel) {
    panel.hidden = true;
  }
}

function setupPanelShell() {
  $("#closePanelButton")?.addEventListener("click", closePanel);
  $("#panelShade")?.addEventListener("click", closePanel);
}

/* =========================================================
   KINGDOM MENU CONTENT
========================================================= */

function renderEventsPanel() {
  openPanel(
    "Festival Events",
    "GRAND FORTUNE FESTIVAL",
    `
      <div class="panel-card">
        <strong>Grand Fortune Festival</strong>
        Complete kindness missions and earn Fortune Stars.
      </div>

      <div class="panel-card">
        <strong>Festival Login</strong>
        Return each day for coins, tickets and decorations.
      </div>

      <div class="panel-card">
        <strong>Prospera Parade</strong>
        Clear three Frostpeak stages to unlock the parade reward.
      </div>

      <div class="panel-actions">
        <button id="claimFestivalButton" class="panel-button-gold" type="button">
          Claim Daily Gift
        </button>
      </div>
    `
  );

  $("#claimFestivalButton")?.addEventListener("click", () => {
    state.coins += 1000;
    state.tickets += 1;
    saveGame();
    refreshAllUI();
    toast("Daily Festival Gift: +1,000 Coins and +1 Ticket");
  });
}

function renderQuestsPanel() {
  const cleared = completedStageCount();

  openPanel(
    "Kingdom Quests",
    "PROSPERA GOALS",
    `
      <div class="panel-card">
        <strong>A Richer Tomorrow</strong>
        Upgrade the Castle to Level 4.<br>
        Progress: ${state.castleLevel} / 4
      </div>

      <div class="panel-card">
        <strong>Growing Community</strong>
        Own 10 Cookies.<br>
        Progress: ${state.ownedCookies.length} / 10
      </div>

      <div class="panel-card">
        <strong>Into Frostpeak</strong>
        Clear 5 Frostpeak stages.<br>
        Progress: ${Math.min(cleared, 5)} / 5
      </div>
    `
  );
}

function renderShopPanel() {
  openPanel(
    "Prospera Shop",
    "MARKETPLACE",
    `
      <div class="panel-card">
        <strong>Building Wood</strong>
        Buy 100 Wood for 5,000 Coins.
      </div>

      <div class="panel-card">
        <strong>Stone Bundle</strong>
        Buy 50 Stone for 4,000 Coins.
      </div>

      <div class="panel-card">
        <strong>Fortune Ticket</strong>
        Buy one Ticket for 500 Gems.
      </div>

      <div class="panel-actions">
        <button id="buyWoodButton" class="panel-button-blue" type="button">Buy Wood</button>
        <button id="buyStoneButton" class="panel-button-blue" type="button">Buy Stone</button>
        <button id="buyTicketButton" class="panel-button-gold" type="button">Buy Ticket</button>
      </div>
    `
  );

  $("#buyWoodButton")?.addEventListener("click", () => {
    if (state.coins < 5000) {
      toast("Not enough Coins.");
      return;
    }

    state.coins -= 5000;
    state.wood += 100;
    saveGame();
    refreshAllUI();
    toast("Purchased 100 Wood.");
  });

  $("#buyStoneButton")?.addEventListener("click", () => {
    if (state.coins < 4000) {
      toast("Not enough Coins.");
      return;
    }

    state.coins -= 4000;
    state.stone += 50;
    saveGame();
    refreshAllUI();
    toast("Purchased 50 Stone.");
  });

  $("#buyTicketButton")?.addEventListener("click", () => {
    if (state.gems < 500) {
      toast("Not enough Gems.");
      return;
    }

    state.gems -= 500;
    state.tickets += 1;
    saveGame();
    refreshAllUI();
    toast("Purchased 1 Fortune Ticket.");
  });
}

function renderBuildPanel() {
  openPanel(
    "Build Prospera",
    "BUILD MODE",
    `
      <div class="panel-card">
        <strong>Cookie House</strong>
        Cost: 2,500 Coins<br>
        Benefit: +4 Resident Capacity
      </div>

      <div class="panel-card">
        <strong>Fortune Farm</strong>
        Cost: 1,000 Coins + 20 Wood<br>
        Unlocks production missions.
      </div>

      <div class="panel-card">
        <strong>Golden Bakery</strong>
        Requires Castle Lv. 4.
      </div>

      <div class="panel-actions">
        <button id="buildHouseButton" class="panel-button-gold" type="button">Build Cookie House</button>
        <button id="buildFarmButton" class="panel-button-blue" type="button">Build Fortune Farm</button>
      </div>
    `
  );

  $("#buildHouseButton")?.addEventListener("click", () => {
    if (state.coins < 2500) {
      toast("You need 2,500 Coins.");
      return;
    }

    state.coins -= 2500;
    state.residentCapacity += 4;
    saveGame();
    refreshAllUI();
    closePanel();
    toast("Cookie House built! Resident capacity +4.");
  });

  $("#buildFarmButton")?.addEventListener("click", () => {
    if (state.coins < 1000 || state.wood < 20) {
      toast("You need 1,000 Coins and 20 Wood.");
      return;
    }

    state.coins -= 1000;
    state.wood -= 20;
    saveGame();
    refreshAllUI();
    closePanel();
    toast("Fortune Farm built!");
  });
}

function renderInventoryPanel() {
  openPanel(
    "Inventory",
    "KINGDOM STORAGE",
    `
      <div class="panel-card"><strong>Coins</strong>${formatNumber(state.coins)}</div>
      <div class="panel-card"><strong>Gems</strong>${formatNumber(state.gems)}</div>
      <div class="panel-card"><strong>Wood</strong>${formatNumber(state.wood)}</div>
      <div class="panel-card"><strong>Stone</strong>${formatNumber(state.stone)}</div>
      <div class="panel-card"><strong>Fortune Tickets</strong>${formatNumber(state.tickets)}</div>
      <div class="panel-card"><strong>Owned Cookies</strong>${state.ownedCookies.length}</div>
    `
  );
}

function renderMailPanel() {
  openPanel(
    "Kingdom Mail",
    "KINGDOM POST",
    `
      <div class="panel-card">
        <strong>Welcome Gift</strong>
        Festival rewards are ready for collection.
      </div>

      <div class="panel-card">
        <strong>Frostpeak Scout Report</strong>
        More creatures have appeared along the mountain route.
      </div>

      <div class="panel-actions">
        <button id="claimMailButton" class="panel-button-gold" type="button">Claim Gift</button>
      </div>
    `
  );

  $("#claimMailButton")?.addEventListener("click", () => {
    state.coins += 500;
    state.wood += 20;
    saveGame();
    refreshAllUI();
    toast("Mail reward claimed: +500 Coins, +20 Wood");
  });
}

function renderSettingsPanel() {
  openPanel(
    "Settings",
    "OPTIONS",
    `
      <div class="panel-card">
        <strong>Music</strong>
        ${state.settings.music ? "On" : "Off"}
      </div>

      <div class="panel-card">
        <strong>Effects</strong>
        ${state.settings.effects ? "On" : "Off"}
      </div>

      <div class="panel-card">
        <strong>Battle Speed</strong>
        ×${state.battleSpeed}
      </div>

      <div class="panel-actions">
        <button id="toggleMusicButton" class="panel-button-blue" type="button">Toggle Music</button>
        <button id="toggleEffectsButton" class="panel-button-blue" type="button">Toggle Effects</button>
        <button id="resetSaveButton" class="panel-button-red" type="button">Reset Save</button>
      </div>
    `
  );

  $("#toggleMusicButton")?.addEventListener("click", () => {
    state.settings.music = !state.settings.music;
    saveGame();
    renderSettingsPanel();
  });

  $("#toggleEffectsButton")?.addEventListener("click", () => {
    state.settings.effects = !state.settings.effects;
    saveGame();
    renderSettingsPanel();
  });

  $("#resetSaveButton")?.addEventListener("click", () => {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  });
}

function setupKingdomActions() {
  $$('[data-action]').forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      switch (action) {
        case "events":
          renderEventsPanel();
          break;

        case "quests":
          renderQuestsPanel();
          break;

        case "shop":
          renderShopPanel();
          break;

        case "build":
          showScreen("buildScreen");
          renderBuildCatalog();
          renderPlacedBuildings();
          refreshBuildResources();
          break;

        case "inventory":
          renderInventoryPanel();
          break;

        case "mail":
          renderMailPanel();
          break;

        case "settings":
          renderSettingsPanel();
          break;

        case "arena":
          renderArenaPanel();
          break;

        case "dominion":
          renderDominionPanel();
          break;

        case "trials":
          renderTrialsPanel();
          break;

        case "wonderlands":
          renderWonderlandsPanel();
          break;

        default:
          break;
      }
    });
  });
}

/* =========================================================
   PLAYABLE SPECIAL MODES
   Fortune Arena · Sealed Dominion · Cookie Trials · Wonderlands
========================================================= */

const ARENA_RANKS = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 100 },
  { name: "Gold", min: 250 },
  { name: "Crystal", min: 450 },
  { name: "Diamond", min: 700 },
  { name: "Master", min: 1000 },
  { name: "Grandmaster", min: 1400 },
  { name: "Elite", min: 1900 },
  { name: "Champion", min: 2500 }
];

const DOMINION_PRISONS = {
  greed: {
    name: "Greed Prison",
    beast: "Greed Cookie",
    boss: "Greed's Golden Warden",
    element: "Dark + Fire"
  },

  deception: {
    name: "Deception Prison",
    beast: "Deception Cookie",
    boss: "Mirror Warden",
    element: "Dark + Arcane"
  },

  ruin: {
    name: "Ruin Prison",
    beast: "Ruin Cookie",
    boss: "Ruin Colossus",
    element: "Fire + Dark"
  },

  debt: {
    name: "Debt Prison",
    beast: "Debt Cookie",
    boss: "Chain Warden",
    element: "Dark + Earth"
  },

  oblivion: {
    name: "Oblivion Prison",
    beast: "Oblivion Cookie",
    boss: "Memory Eater",
    element: "Dark + Arcane"
  }
};

const WONDERLAND_ISLANDS = {
  festival: {
    name: "Festival Island",
    icon: "Festival",
    reward: "Coins & Gems"
  },

  melody: {
    name: "Melody Isle",
    icon: "Melody",
    reward: "EXP Candy"
  },

  dreamland: {
    name: "Dreamland",
    icon: "Dream",
    reward: "Fortune Tickets"
  },

  storybook: {
    name: "Storybook Isle",
    icon: "Story",
    reward: "Wonder Stars"
  }
};
function arenaRankName(trophies = state.specialModes.arena.trophies) {
  let rank = ARENA_RANKS[0].name;

  for (const entry of ARENA_RANKS) {
    if (trophies >= entry.min) {
      rank = entry.name;
    }
  }

  return rank;
}

function arenaOpponents() {
  const power =
    Math.max(
      1000,
      teamPower()
    );

  const trophies =
    state.specialModes.arena.trophies;

  const seedBonus =
    Math.floor(
      trophies / 80
    ) * 70;

  return [
    {
      id: "steady",
      name: "Maple Guild",
      power: Math.round(
        power * 0.86 +
        seedBonus
      ),
      trophies: 18,
      gems: 15,
      coins: 900
    },

    {
      id: "rival",
      name: "Silver Crown",
      power: Math.round(
        power * 1.02 +
        seedBonus
      ),
      trophies: 28,
      gems: 25,
      coins: 1400
    },

    {
      id: "elite",
      name: "Golden Vanguard",
      power: Math.round(
        power * 1.18 +
        seedBonus
      ),
      trophies: 42,
      gems: 40,
      coins: 2200
    }
  ];
}

function renderArenaPanel() {
  resetArenaTicketsIfNeeded();

  const arena =
    state.specialModes.arena;

  const opponents =
    arenaOpponents();

  openPanel(
    "Fortune Arena",
    `${arenaRankName().toUpperCase()} · ${arena.trophies} TROPHIES`,
    `
      <div class="panel-card">
        <strong>Your Arena Record</strong><br>
        Wins: ${arena.wins} · Losses: ${arena.losses} · Win Streak: ${arena.streak}<br>
        Arena Tickets: ${arena.tickets} / 5<br>
        Team Power: ${formatNumber(teamPower())}
      </div>

      ${opponents.map((opponent) => `
        <div class="panel-card">
          <strong>${opponent.name}</strong><br>
          Rival Power: ${formatNumber(opponent.power)}<br>
          Victory: +${opponent.trophies} Trophies · +${opponent.gems} Gems · +${formatNumber(opponent.coins)} Coins

          <div class="panel-actions">
            <button
              class="panel-button-gold arena-fight-button"
              data-opponent="${opponent.id}"
              type="button"
            >
              Battle
            </button>
          </div>
        </div>
      `).join("")}

      <div class="panel-actions">
        <button
          id="arenaRefillButton"
          class="panel-button-blue"
          type="button"
        >
          Refill 5 Tickets · 250 Gems
        </button>
      </div>
    `
  );

  $$(".arena-fight-button").forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const opponent =
          opponents.find(
            (entry) =>
              entry.id ===
              button.dataset.opponent
          );

        if (!opponent) {
          return;
        }

        if (arena.tickets <= 0) {
          toast(
            "No Arena Tickets left. Refill them or return tomorrow."
          );

          return;
        }

        arena.tickets -= 1;

        saveGame();

        closePanel();

        const difficultyStage =
          clamp(
            Math.round(
              opponent.power /
              1500
            ),
            4,
            30
          );

        startBattle(
          difficultyStage,
          {
            mode: "arena",

            waves: 5,

            label:
              `FORTUNE ARENA · ${opponent.name.toUpperCase()}`,

            context: {
              opponentId:
                opponent.id,

              opponentName:
                opponent.name,

              rewardTrophies:
                opponent.trophies,

              rewardGems:
                opponent.gems,

              rewardCoins:
                opponent.coins,

              bossName:
                `${opponent.name} Captain`,

              enemyNames: [
                "Rival Defender",
                "Rival Attacker",
                "Rival Support",
                "Rival Healer",
                "Rival Vanguard"
              ]
            }
          }
        );
      }
    );
  });

  $("#arenaRefillButton")
    ?.addEventListener(
      "click",
      () => {
        if (state.gems < 250) {
          toast(
            "You need 250 Gems to refill Arena Tickets."
          );

          return;
        }

        state.gems -= 250;

        arena.tickets =
          5;

        saveGame();

        refreshAllUI();

        renderArenaPanel();

        toast(
          "Arena Tickets refilled."
        );
      }
    );
}

function renderDominionPanel() {
  const dominion =
    state.specialModes.dominion;

  openPanel(
    "Sealed Dominion",
    `BEAST PRISONS · ${dominion.clears} CLEARS`,
    `
      <div class="panel-card">
        <strong>Five Beast Prisons</strong><br>
        Each prison has 100 increasingly difficult floors.
        Every 10th floor is a checkpoint boss.
        Floor 100 confronts the Beast itself.
      </div>

      ${Object.entries(DOMINION_PRISONS).map(([id, prison]) => {
        const floor =
          clamp(
            Number(
              dominion.floors[id] ||
              1
            ),
            1,
            100
          );

        return `
          <div class="panel-card">
            <strong>${prison.name}</strong><br>
            ${prison.beast} · ${prison.element}<br>
            Current Floor: ${floor} / 100

            <div class="panel-actions">
              <button
                class="panel-button-gold dominion-fight-button"
                data-prison="${id}"
                type="button"
              >
                Enter Floor ${floor}
              </button>
            </div>
          </div>
        `;
      }).join("")}
    `
  );

  $$(".dominion-fight-button").forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const prisonId =
          button.dataset.prison;

        const prison =
          DOMINION_PRISONS[
            prisonId
          ];

        if (!prison) {
          return;
        }

        const floor =
          clamp(
            Number(
              dominion.floors[
                prisonId
              ] || 1
            ),
            1,
            100
          );

        const checkpoint =
          floor % 10 === 0;

        const beastFloor =
          floor === 100;

        const waves =
          beastFloor
            ? 8
            : checkpoint
              ? 7
              : floor >= 60
                ? 6
                : 5;

        const difficultyStage =
          clamp(
            10 +
            Math.floor(
              floor / 4
            ),
            10,
            35
          );

        dominion.selectedPrison =
          prisonId;

        saveGame();

        closePanel();

        startBattle(
          difficultyStage,
          {
            mode:
              "dominion",

            waves,

            label:
              `${prison.name.toUpperCase()} · FLOOR ${floor}`,

            context: {
              prisonId,

              floor,

              bossName:
                beastFloor
                  ? prison.beast
                  : checkpoint
                    ? `${prison.name} Keeper`
                    : prison.boss,

              rewardCoins:
                900 +
                floor * 55,

              rewardGems:
                checkpoint
                  ? 25 +
                    Math.floor(
                      floor / 2
                    )
                  : 5 +
                    Math.floor(
                      floor / 10
                    ),

              rewardCandy:
                checkpoint
                  ? 2 +
                    Math.floor(
                      floor / 20
                    )
                  : 1,

              enemyNames: [
                "Dominion Guard",
                "Sealed Shade",
                "Prison Sentinel",
                "Dark Warden",
                "Beast Herald"
              ]
            }
          }
        );
      }
    );
  });
}

function trialTier(cookieName) {
  return Number(
    state.specialModes
      .trials
      .clears[
        cookieName
      ] || 0
  );
}

function renderTrialsPanel() {
  const trials =
    state.specialModes.trials;

  const roster =
    (
      state.ownedCookies ||
      []
    ).slice(
      0,
      12
    );

  openPanel(
    "Cookie Trials",
    `${trials.totalClears} TOTAL CLEARS`,
    `
      <div class="panel-card">
        <strong>Master Your Cookies</strong><br>
        Each Cookie has five Trial tiers.
        Higher tiers give stronger rewards
        and much tougher enemies.
      </div>

      ${roster.map((name) => {
        const data =
          cookieData(name);

        const tier =
          trialTier(name);

        const nextTier =
          Math.min(
            5,
            tier + 1
          );

        const complete =
          tier >= 5;

        return `
          <div class="panel-card">
            <strong>${name}</strong><br>
            ${data.rarity} · ${data.role} ·
            Power ${formatNumber(data.power)}<br>
            Trial Progress: ${tier} / 5

            <div class="panel-actions">
              <button
                class="panel-button-blue trial-fight-button"
                data-cookie="${name}"
                type="button"
                ${complete ? "disabled" : ""}
              >
                ${
                  complete
                    ? "MASTERED"
                    : `Start Tier ${nextTier}`
                }
              </button>
            </div>
          </div>
        `;
      }).join("")}
    `
  );

  $$(".trial-fight-button").forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const name =
          button.dataset.cookie;

        const data =
          cookieData(name);

        const tier =
          Math.min(
            5,
            trialTier(name) +
            1
          );

        if (
          !state.team.includes(
            name
          )
        ) {
          if (
            state.team.length >=
            5
          ) {
            state.team[4] =
              name;
          } else {
            state.team.push(
              name
            );
          }

          saveGame();
        }

        closePanel();

        startBattle(
          clamp(
            4 +
            tier * 5 +
            Math.floor(
              data.power /
              2800
            ),
            6,
            30
          ),
          {
            mode:
              "trials",

            waves:
              3 +
              tier,

            label:
              `${name.toUpperCase()} · TRIAL ${tier}`,

            context: {
              cookieName:
                name,

              tier,

              bossName:
                `${name.replace(" Cookie", "")} Trial Guardian`,

              rewardCoins:
                650 *
                tier,

              rewardGems:
                10 *
                tier,

              rewardCandy:
                2 *
                tier,

              enemyNames: [
                "Trial Scout",
                "Trial Guard",
                "Trial Mage",
                "Trial Brute",
                "Trial Champion"
              ]
            }
          }
        );
      }
    );
  });
}

function renderWonderlandsPanel() {
  const wonder =
    state.specialModes.wonderlands;

  openPanel(
    "Wonderlands",
    `${wonder.stars} WONDER STARS`,
    `
      <div class="panel-card">
        <strong>The Wonder Gate is open!</strong><br>
        Explore magical islands, make choices and earn Wonder Stars.
        Every island has five exploration chapters.
      </div>

      ${Object.entries(WONDERLAND_ISLANDS).map(([id, island]) => {
        const progress =
          clamp(
            Number(
              wonder.islands[
                id
              ] || 0
            ),
            0,
            5
          );

        return `
          <div class="panel-card">
            <strong>${island.name}</strong><br>
            Reward focus: ${island.reward}<br>
            Exploration: ${progress} / 5

            <div class="panel-actions">
              <button
                class="panel-button-gold wonder-explore-button"
                data-island="${id}"
                type="button"
                ${progress >= 5 ? "disabled" : ""}
              >
                ${
                  progress >= 5
                    ? "COMPLETED"
                    : "Explore"
                }
              </button>
            </div>
          </div>
        `;
      }).join("")}
    `
  );

  $$(".wonder-explore-button").forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        startWonderlandEvent(
          button.dataset.island
        );
      }
    );
  });
}

function startWonderlandEvent(islandId) {
  const island =
    WONDERLAND_ISLANDS[
      islandId
    ];

  if (!island) {
    return;
  }

  const events = [
    "treasure",
    "kindness",
    "portal"
  ];

  const eventType =
    randomFrom(
      events
    );

  if (
    eventType ===
    "treasure"
  ) {
    openPanel(
      island.name,
      "MYSTERIOUS TREASURE GROVE",
      `
        <div class="panel-card">
          A glowing chest rests beneath the trees.
          Do you take the safe reward,
          or search deeper for something greater?
        </div>

        <div class="panel-actions">
          <button
            id="wonderSafeButton"
            class="panel-button-blue"
            type="button"
          >
            Take 700 Coins
          </button>

          <button
            id="wonderRiskButton"
            class="panel-button-gold"
            type="button"
          >
            Search Deeper
          </button>
        </div>
      `
    );

    $("#wonderSafeButton")
      ?.addEventListener(
        "click",
        () => {
          state.coins +=
            700;

          completeWonderlandStep(
            islandId,
            0,
            "You brought 700 Coins safely back to Prospera."
          );
        }
      );

    $("#wonderRiskButton")
      ?.addEventListener(
        "click",
        () => {
          if (
            Math.random() <
            0.62
          ) {
            state.coins +=
              1800;

            state.specialModes
              .wonderlands
              .stars +=
                1;

            completeWonderlandStep(
              islandId,
              0,
              "Jackpot! +1,800 Coins and +1 Wonder Star."
            );
          } else {
            completeWonderlandStep(
              islandId,
              0,
              "The deeper path was empty, but the island map is now clearer."
            );
          }
        }
      );

    return;
  }

  if (
    eventType ===
    "kindness"
  ) {
    openPanel(
      island.name,
      "A COOKIE NEEDS HELP",
      `
        <div class="panel-card">
          A travelling Cookie has lost their supplies.
          Helping costs 500 Coins but strengthens
          the Wonderlands community.
        </div>

        <div class="panel-actions">
          <button
            id="wonderHelpButton"
            class="panel-button-gold"
            type="button"
          >
            Help · 500 Coins
          </button>

          <button
            id="wonderGuideButton"
            class="panel-button-blue"
            type="button"
          >
            Guide Them Home
          </button>
        </div>
      `
    );

    $("#wonderHelpButton")
      ?.addEventListener(
        "click",
        () => {
          if (
            state.coins <
            500
          ) {
            toast(
              "You need 500 Coins."
            );

            return;
          }

          state.coins -=
            500;

          state.gems +=
            25;

          state.specialModes
            .wonderlands
            .stars +=
              2;

          completeWonderlandStep(
            islandId,
            0,
            "Kindness returned to you: +25 Gems and +2 Wonder Stars."
          );
        }
      );

    $("#wonderGuideButton")
      ?.addEventListener(
        "click",
        () => {
          state.expCandy +=
            2;

          state.specialModes
            .wonderlands
            .stars +=
              1;

          completeWonderlandStep(
            islandId,
            0,
            "+2 EXP Candy and +1 Wonder Star."
          );
        }
      );

    return;
  }

  const progress =
    clamp(
      Number(
        state.specialModes
          .wonderlands
          .islands[
            islandId
          ] || 0
      ),
      0,
      5
    );

  closePanel();

  startBattle(
    clamp(
      7 +
      progress * 4,
      7,
      27
    ),
    {
      mode:
        "wonderlands",

      waves:
        4 +
        Math.min(
          progress,
          2
        ),

      label:
        `${island.name.toUpperCase()} · WONDER GATE`,

      context: {
        islandId,

        rewardCoins:
          1000 +
          progress *
          400,

        rewardGems:
          20 +
          progress *
          8,

        rewardStars:
          2,

        bossName:
          `${island.name} Gatekeeper`,

        enemyNames: [
          "Wonder Sprite",
          "Dream Guard",
          "Story Shade",
          "Festival Knight",
          "Wonder Keeper"
        ]
      }
    }
  );
}

function completeWonderlandStep(
  islandId,
  extraStars = 0,
  message = "Wonderland progress increased."
) {
  const wonder =
    state.specialModes
      .wonderlands;

  wonder.islands[
    islandId
  ] =
    clamp(
      Number(
        wonder.islands[
          islandId
        ] || 0
      ) + 1,
      0,
      5
    );

  wonder.stars +=
    Number(
      extraStars ||
      0
    );

  saveGame();

  refreshAllUI();

  renderWonderlandsPanel();

  toast(message);
}

function handleSpecialModeVictory(
  mode,
  context
) {
  if (
    mode ===
    "arena"
  ) {
    const arena =
      state.specialModes
        .arena;

    arena.wins +=
      1;

    arena.streak +=
      1;

    arena.trophies +=
      Number(
        context.rewardTrophies ||
        20
      );

    state.gems +=
      Number(
        context.rewardGems ||
        15
      );

    state.coins +=
      Number(
        context.rewardCoins ||
        900
      );

    saveGame();

    refreshAllUI();

    showScreen(
      "adventureScreen"
    );

    renderArenaPanel();

    toast(
      `Arena victory! +${context.rewardTrophies || 20} Trophies.`
    );

    return;
  }

  if (
    mode ===
    "dominion"
  ) {
    const dominion =
      state.specialModes
        .dominion;

    const prisonId =
      context.prisonId;

    const floor =
      Number(
        context.floor ||
        1
      );

    dominion.clears +=
      1;

    dominion.floors[
      prisonId
    ] =
      floor >= 100
        ? 100
        : floor + 1;

    state.coins +=
      Number(
        context.rewardCoins ||
        1000
      );

    state.gems +=
      Number(
        context.rewardGems ||
        5
      );

    state.expCandy +=
      Number(
        context.rewardCandy ||
        1
      );

    saveGame();

    refreshAllUI();

    showScreen(
      "adventureScreen"
    );

    renderDominionPanel();

    toast(
      `Dominion Floor ${floor} cleared!`
    );

    return;
  }

  if (
    mode ===
    "trials"
  ) {
    const trials =
      state.specialModes
        .trials;

    const name =
      context.cookieName;

    const tier =
      Number(
        context.tier ||
        1
      );

    trials.clears[
      name
    ] =
      Math.max(
        Number(
          trials.clears[
            name
          ] || 0
        ),
        tier
      );

    trials.totalClears +=
      1;

    state.coins +=
      Number(
        context.rewardCoins ||
        650
      );

    state.gems +=
      Number(
        context.rewardGems ||
        10
      );

    state.expCandy +=
      Number(
        context.rewardCandy ||
        2
      );

    saveGame();

    refreshAllUI();

    showScreen(
      "adventureScreen"
    );

    renderTrialsPanel();

    toast(
      `${name} Trial ${tier} cleared!`
    );

    return;
  }

  if (
    mode ===
    "wonderlands"
  ) {
    const wonder =
      state.specialModes
        .wonderlands;

    const islandId =
      context.islandId;

    wonder.islands[
      islandId
    ] =
      clamp(
        Number(
          wonder.islands[
            islandId
          ] || 0
        ) + 1,
        0,
        5
      );

    wonder.stars +=
      Number(
        context.rewardStars ||
        2
      );

    state.coins +=
      Number(
        context.rewardCoins ||
        1000
      );

    state.gems +=
      Number(
        context.rewardGems ||
        20
      );

    saveGame();

    refreshAllUI();

    showScreen(
      "adventureScreen"
    );

    renderWonderlandsPanel();

    toast(
      `Wonder Gate cleared! +${context.rewardStars || 2} Wonder Stars.`
    );
  }
}

function handleSpecialModeDefeat(
  mode,
  context
) {
  if (
    mode ===
    "arena"
  ) {
    const arena =
      state.specialModes
        .arena;

    arena.losses +=
      1;

    arena.streak =
      0;

    arena.trophies =
      Math.max(
        0,
        arena.trophies -
        10
      );

    saveGame();

    showScreen(
      "adventureScreen"
    );

    renderArenaPanel();

    toast(
      "Arena defeat. -10 Trophies."
    );

    return;
  }

  if (
    mode ===
    "dominion"
  ) {
    showScreen(
      "adventureScreen"
    );

    renderDominionPanel();

    toast(
      `Dominion Floor ${context.floor || 1} was too strong. Upgrade and try again.`
    );

    return;
  }

  if (
    mode ===
    "trials"
  ) {
    showScreen(
      "adventureScreen"
    );

    renderTrialsPanel();

    toast(
      "Trial failed. Strengthen your Cookie and try again."
    );

    return;
  }

  if (
    mode ===
    "wonderlands"
  ) {
    showScreen(
      "adventureScreen"
    );

    renderWonderlandsPanel();

    toast(
      "The Wonder Gate pushed your team back."
    );
  }
}

/* =========================================================
   COOKIE COLLECTION
========================================================= */

function cookieData(name) {
  return (
    COOKIE_DATA[name] ||
    COOKIE_DATA[
      "Coin Cookie"
    ]
  );
}

function rarityColor(rarity) {
  const colors = {
    RARE: "#4f9dd6",
    EPIC: "#a85ec8",
    "SUPER EPIC": "#df75b4",
    LEGENDARY: "#d2a53f",
    ANCIENT: "#e4d293",
    BEAST: "#ca4454"
  };

  return (
    colors[
      rarity
    ] ||
    "#637d9c"
  );
}

function refreshCookieInfo() {
  const data =
    cookieData(
      state.selectedCookie
    );

  $("#cookieNameLabel")
    .textContent =
      state.selectedCookie;

  $("#cookieRarityLabel")
    .textContent =
      data.rarity;

  $("#cookieRarityLabel")
    .style.background =
      rarityColor(
        data.rarity
      );

  $("#cookieRarityLabel")
    .style.color =
      data.rarity ===
      "LEGENDARY"
        ? "#3e2d0c"
        : "white";

  $("#cookieLevelLabel")
    .textContent =
      data.level;

  $("#cookieRoleLabel")
    .textContent =
      data.role;

  $("#cookiePositionLabel")
    .textContent =
      data.position;

  $("#cookiePowerLabel")
    .textContent =
      formatNumber(
        data.power
      );

  $$(".cookie-hotspot").forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.cookie ===
        state.selectedCookie
    );
  });
}

function setupCookieCollection() {
  $$(".cookie-hotspot").forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        state.selectedCookie =
          button.dataset.cookie;

        saveGame();

        refreshCookieInfo();

        toast(
          `${state.selectedCookie} selected.`
        );
      }
    );
  });

  $("#cookieLevelButton")
    ?.addEventListener(
      "click",
      () => {
        toast(
          "EXP Candy leveling will be connected next."
        );
      }
    );

  $("#cookieTeamButton")
    ?.addEventListener(
      "click",
      () => {
        addSelectedCookieToTeam();
      }
    );
}

function addSelectedCookieToTeam() {
  if (
    state.team.includes(
      state.selectedCookie
    )
  ) {
    toast(
      `${state.selectedCookie} is already on the team.`
    );

    return;
  }

  if (
    state.team.length <
    5
  ) {
    state.team.push(
      state.selectedCookie
    );
  } else {
    state.team[4] =
      state.selectedCookie;
  }

  saveGame();

  toast(
    `${state.selectedCookie} added to the team.`
  );
}
/* =========================================================
   ADVENTURE / WORLD PROGRESS
========================================================= */

function completedStageCount() {
  return Object.keys(state.completedStages).filter(
    (key) => state.completedStages[key]
  ).length;
}

function refreshAdventureProgress() {
  const completed = completedStageCount();
  const percent = clamp(
    (completed / 30) * 100,
    0,
    100
  );

  $("#frostpeakProgress").style.width =
    `${percent}%`;

  $("#frostpeakProgressText").textContent =
    `${completed} / 30`;

  $("#adventureCoinText").textContent =
    formatNumber(state.coins);
}

function setupAdventureCards() {
  $("[data-world='frostpeak']")
    ?.addEventListener(
      "click",
      () => {
        showScreen(
          "worldScreen"
        );
      }
    );
}

function stagePosition(stage) {
  const column =
    (stage - 1) % 10;

  const row =
    Math.floor(
      (stage - 1) / 10
    );

  const x =
    6 +
    column * 9.1 +
    (row % 2 ? 3.5 : 0);

  const curve =
    Math.sin(
      (column / 9) *
      Math.PI
    ) * 12;

  const y =
    80 -
    row * 30 -
    curve;

  return {
    x,
    y
  };
}

function renderStageRoute() {
  const route =
    $("#stageRoute");

  if (!route) {
    return;
  }

  route.innerHTML = "";

  let stars = 0;

  for (
    let stage = 1;
    stage <= 30;
    stage += 1
  ) {
    const position =
      stagePosition(stage);

    const button =
      document.createElement(
        "button"
      );

    const boss =
      stage % 10 === 0;

    const cleared =
      Boolean(
        state.completedStages[
          stage
        ]
      );

    button.type =
      "button";

    button.className =
      `stage-node` +
      `${boss ? " boss" : ""}` +
      `${cleared ? " cleared" : ""}`;

    button.style.left =
      `${position.x}%`;

    button.style.top =
      `${position.y}%`;

    button.dataset.label =
      boss
        ? `Boss 1-${stage}`
        : `Stage 1-${stage}`;

    button.textContent =
      stage;

    button.addEventListener(
      "click",
      () => {
        openStage(stage);
      }
    );

    route.appendChild(
      button
    );

    if (cleared) {
      stars += 3;
    }
  }

  $("#worldStarText").textContent =
    `${stars} / 90`;
}

function getWaveCount(stage) {
  return (
    FROSTPEAK_STAGES[
      stage
    ]?.waves || 3
  );
}

function stageSubtitle(stage) {
  const data =
    FROSTPEAK_STAGES[
      stage
    ];

  return data
    ? `${data.title} · ${data.subtitle}`
    : "Footprints in the Snow";
}

function stageDescription(stage) {
  return (
    FROSTPEAK_STAGES[
      stage
    ]?.description ||
    "Protect Prospera's supplies and clear the frozen mountain trail."
  );
}

function openStage(stage) {
  state.currentStage =
    stage;

  saveGame();

  $("#stageTitle").textContent =
    `Stage 1-${stage}`;

  $("#stageSubtitle").textContent =
    stageSubtitle(stage);

  $("#stageDescription").textContent =
    stageDescription(stage);

  $("#stagePower").textContent =
    formatNumber(
      FROSTPEAK_STAGES[
        stage
      ]?.recommendedPower ||
      (
        4200 +
        stage * 220
      )
    );

  $("#stageWaveCount").textContent =
    getWaveCount(stage);

  renderStageTeamPreview();

  showScreen(
    "stageScreen"
  );
}

function miniCookieMarkup(name) {
  const data =
    cookieData(name);

  return `
    <div
      class="mini-cookie"
      style="
        --dough:${data.dough};
        --hair:${data.hair};
        --coat:${data.coat};
        --coat2:${data.coat2};
      "
    >
      <div class="mini-cookie-shadow"></div>

      <span class="mini-cookie-arm left"></span>
      <span class="mini-cookie-arm right"></span>

      <span class="mini-cookie-leg left"></span>
      <span class="mini-cookie-leg right"></span>

      <span class="mini-cookie-body"></span>

      <span class="mini-cookie-head">
        <i class="mini-cookie-mouth"></i>
      </span>

      <span class="mini-cookie-hair"></span>
    </div>
  `;
}

function renderStageTeamPreview() {
  const preview =
    $("#stageTeamPreview");

  preview.innerHTML = "";

  state.team
    .slice(
      0,
      5
    )
    .forEach(
      (name) => {
        const card =
          document.createElement(
            "div"
          );

        card.className =
          "team-preview-card";

        card.innerHTML = `
          ${miniCookieMarkup(name)}

          <b>
            ${name.replace(
              " Cookie",
              ""
            )}
          </b>
        `;

        preview.appendChild(
          card
        );
      }
    );
}

function setupStageScreen() {
  $("#editTeamButton")
    ?.addEventListener(
      "click",
      () => {
        showScreen(
          "teamScreen"
        );

        renderTeamEditor();
      }
    );

  $("#startBattleButton")
    ?.addEventListener(
      "click",
      () => {
        startBattle(
          state.currentStage
        );
      }
    );
}

/* =========================================================
   SUMMON SYSTEM
========================================================= */

function refreshSummonScreen() {
  $("#ticketText").textContent =
    formatNumber(
      state.tickets
    );
}

function weightedSummon() {
  const weighted = [];

  SUMMON_POOL.forEach(
    (name) => {
      const rarity =
        cookieData(
          name
        ).rarity;

      const weight =
        RARITY_WEIGHTS[
          rarity
        ] || 1;

      for (
        let count = 0;
        count < weight;
        count += 1
      ) {
        weighted.push(
          name
        );
      }
    }
  );

  return randomFrom(
    weighted
  );
}

function summon(count) {
  if (
    state.tickets <
    count
  ) {
    toast(
      "Not enough Fortune Tickets."
    );

    return;
  }

  state.tickets -=
    count;

  let finalResult =
    null;

  let newCookies =
    0;

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const name =
      weightedSummon();

    finalResult =
      name;

    if (
      !state.ownedCookies.includes(
        name
      )
    ) {
      state.ownedCookies.push(
        name
      );

      newCookies +=
        1;
    }
  }

  saveGame();

  refreshAllUI();

  renderSummonResult(
    finalResult,
    count,
    newCookies
  );
}

function renderSummonResult(
  name,
  count,
  newCookies
) {
  const data =
    cookieData(name);

  const result =
    $("#summonResult");

  result.innerHTML = `
    <div class="summon-result-content">
      <span
        class="summon-rarity-chip"
        style="
          background:
          ${rarityColor(
            data.rarity
          )}
        "
      >
        ${data.rarity}
      </span>

      <div class="summon-cookie-stage">
        ${miniCookieMarkup(name)}
      </div>

      <h2>
        ${name}
      </h2>

      <p>
        ${data.line}
      </p>

      <p>
        ${
          count === 10
            ? `${newCookies} new Cookies joined Prospera.`
            : "A wish has answered."
        }
      </p>
    </div>
  `;
}

function setupSummonScreen() {
  $("#summonOneButton")
    ?.addEventListener(
      "click",
      () => {
        summon(1);
      }
    );

  $("#summonTenButton")
    ?.addEventListener(
      "click",
      () => {
        summon(10);
      }
    );
}

/* =========================================================
   BATTLE CHARACTER MARKUP
========================================================= */

function fighterMarkup(
  name,
  enemy = false,
  boss = false
) {
  const data =
    enemy
      ? {
          dough:
            boss
              ? "#7f99b8"
              : "#8cc0d4",

          hair:
            boss
              ? "#f1f7ff"
              : "#d9f3ff",

          coat:
            boss
              ? "#563d70"
              : "#4b5d83",

          coat2:
            boss
              ? "#2b1e43"
              : "#293754"
        }
      : cookieData(name);

  return `
    <div class="hp-bar">
      <i></i>
    </div>

    <div class="fighter-shadow"></div>

    <span
      class="fighter-arm left"
      style="--body:${data.dough}"
    ></span>

    <span
      class="fighter-arm right"
      style="--body:${data.dough}"
    ></span>

    <span
      class="fighter-leg left"
      style="--body:${data.dough}"
    ></span>

    <span
      class="fighter-leg right"
      style="--body:${data.dough}"
    ></span>

    <span
      class="fighter-coat"
      style="
        --coat:${data.coat};
        --coat2:${data.coat2}
      "
    ></span>

    <span
      class="fighter-head"
      style="
        --body:${data.dough}
      "
    >
      <i class="fighter-mouth"></i>
    </span>

    <span
      class="fighter-hair"
      style="
        --hair:${data.hair}
      "
    ></span>

    <span class="fighter-name">
      ${name}${boss ? " · BOSS" : ""}
    </span>
  `;
}

/* =========================================================
   BATTLE SETUP
========================================================= */

function resetBattleFields() {
  $("#allyField").innerHTML =
    "";

  $("#enemyField").innerHTML =
    "";

  $("#projectileLayer").innerHTML =
    "";

  $("#effectLayer").innerHTML =
    "";

  $("#floatLayer").innerHTML =
    "";

  $("#skillBar").innerHTML =
    "";

  $("#battleMessage").textContent =
    "";

  $("#bossHealthPanel").hidden =
    true;
}

function buildAllies() {
  const field =
    $("#allyField");

  const team =
    state.team.slice(
      0,
      5
    );

  field.innerHTML =
    "";

  team.forEach(
    (name, index) => {
      const data =
        cookieData(name);

      const fighter =
        document.createElement(
          "div"
        );

      const maxHP =
        data.role ===
        "Defender"
          ? 150
          : data.role ===
            "Healer"
            ? 110
            : 120;

      fighter.className =
        "fighter ally";

      fighter.dataset.name =
        name;

      fighter.dataset.role =
        data.role;

      fighter.dataset.position =
        data.position;

      fighter.dataset.hp =
        String(maxHP);

      fighter.dataset.maxHp =
        String(maxHP);

      fighter.dataset.shield =
        "0";

      fighter.style.left =
        `${7 + index * 7.4}%`;

      fighter.style.top =
        `${
          36 +
          (index % 2) *
          14
        }%`;

      fighter.innerHTML =
        fighterMarkup(
          name,
          false,
          false
        );

      field.appendChild(
        fighter
      );
    }
  );

  buildSkillBar();
}

function buildSkillBar() {
  const bar =
    $("#skillBar");

  bar.innerHTML =
    "";

  state.team
    .slice(
      0,
      5
    )
    .forEach(
      (name) => {
        const data =
          cookieData(name);

        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "skill-button ready";

        button.dataset.name =
          name;

        button.innerHTML = `
          <div class="skill-cooldown-overlay"></div>

          <span>
            ${name.replace(
              " Cookie",
              ""
            )}
          </span>

          <b>
            READY
          </b>

          <small>
            ${data.skillName}
          </small>
        `;

        button.addEventListener(
          "click",
          () => {
            castSkill(
              name,
              button
            );
          }
        );

        bar.appendChild(
          button
        );
      }
    );
}

/* =========================================================
   CHALLENGE DIFFICULTY
   Enemies scale by stage + wave, use smarter targeting,
   and bosses gain special attacks as their HP falls.
========================================================= */

const CHALLENGE_DIFFICULTY = {
  baseHpMultiplier: 1.35,
  stageHpGrowth: 0.045,
  waveHpGrowth: 0.08,

  baseDamageMultiplier: 1.20,
  stageDamageGrowth: 0.026,
  waveDamageGrowth: 0.055,

  bossHpMultiplier: 2.15,
  bossDamageMultiplier: 1.45,

  enemyCritChance: 0.10,
  bossCritChance: 0.18,

  maxEnemies: 5
};

function getChallengeScaling(
  stage = battle.stage,
  wave = battle.currentWave
) {
  const safeStage =
    Math.max(
      1,
      Number(stage) ||
      1
    );

  const safeWave =
    Math.max(
      1,
      Number(wave) ||
      1
    );

  return {
    hpMultiplier:
      CHALLENGE_DIFFICULTY
        .baseHpMultiplier *
      (
        1 +
        (
          safeStage -
          1
        ) *
        CHALLENGE_DIFFICULTY
          .stageHpGrowth
      ) *
      (
        1 +
        (
          safeWave -
          1
        ) *
        CHALLENGE_DIFFICULTY
          .waveHpGrowth
      ),

    damageMultiplier:
      CHALLENGE_DIFFICULTY
        .baseDamageMultiplier *
      (
        1 +
        (
          safeStage -
          1
        ) *
        CHALLENGE_DIFFICULTY
          .stageDamageGrowth
      ) *
      (
        1 +
        (
          safeWave -
          1
        ) *
        CHALLENGE_DIFFICULTY
          .waveDamageGrowth
      )
  };
}

function enemyTargetPriority(
  allies,
  attacker
) {
  if (!allies.length) {
    return null;
  }

  const isBoss =
    attacker?.classList
      ?.contains(
        "boss"
      );

  const healersAndSupports =
    allies.filter(
      (fighter) => {
        return (
          fighter.dataset.role ===
            "Healer" ||
          fighter.dataset.role ===
            "Support"
        );
      }
    );

  const lowestHp =
    [...allies].sort(
      (a, b) => {
        const aRatio =
          Number(
            a.dataset.hp ||
            0
          ) /
          Math.max(
            1,
            Number(
              a.dataset.maxHp ||
              1
            )
          );

        const bRatio =
          Number(
            b.dataset.hp ||
            0
          ) /
          Math.max(
            1,
            Number(
              b.dataset.maxHp ||
              1
            )
          );

        return (
          aRatio -
          bRatio
        );
      }
    )[0];

  if (
    isBoss &&
    lowestHp &&
    Math.random() <
      0.48
  ) {
    return lowestHp;
  }

  if (
    healersAndSupports.length &&
    Math.random() <
      0.34
  ) {
    return randomFrom(
      healersAndSupports
    );
  }

  return randomFrom(
    allies
  );
}

function spawnEnemies(
  wave,
  totalWaves
) {
  const field =
    $("#enemyField");

  const bossWave =
    wave ===
      totalWaves &&
    totalWaves >=
      5;

  const scaling =
    getChallengeScaling(
      battle.stage,
      wave
    );

  const stageEnemyBonus =
    battle.stage >=
    18
      ? 1
      : 0;

  const count =
    bossWave
      ? (
          battle.stage >=
          20
            ? 2
            : 1
        )
      : Math.min(
          CHALLENGE_DIFFICULTY
            .maxEnemies,

          3 +
            Math.floor(
              (
                wave -
                1
              ) /
              2
            ) +
            stageEnemyBonus
        );

  field.innerHTML =
    "";

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const boss =
      bossWave &&
      index === 0;

    const fighter =
      document.createElement(
        "div"
      );

    const baseHP =
      boss
        ? 360 +
          battle.stage *
            14 +
          wave *
            26
        : 82 +
          battle.stage *
            5 +
          wave *
            17 +
          index *
            9;

    const hpMultiplier =
      boss
        ? scaling.hpMultiplier *
          CHALLENGE_DIFFICULTY
            .bossHpMultiplier
        : scaling.hpMultiplier;

    const maxHP =
      Math.round(
        baseHP *
        hpMultiplier
      );

    const baseDamageMin =
      boss
        ? 10 +
          Math.floor(
            battle.stage *
            0.32
          ) +
          wave
        : 6 +
          Math.floor(
            battle.stage *
            0.20
          ) +
          Math.floor(
            wave *
            0.7
          );

    const baseDamageMax =
      boss
        ? 18 +
          Math.floor(
            battle.stage *
            0.45
          ) +
          wave *
            2
        : 12 +
          Math.floor(
            battle.stage *
            0.30
          ) +
          wave;

    const damageMultiplier =
      boss
        ? scaling.damageMultiplier *
          CHALLENGE_DIFFICULTY
            .bossDamageMultiplier
        : scaling.damageMultiplier;

    fighter.className =
      `fighter enemy${boss ? " boss" : ""}`;

    const specialEnemyNames =
      battle.specialContext
        ?.enemyNames ||
      [];

    const bossName =
      battle.specialContext
        ?.bossName ||
      "Frost Guardian";

    fighter.dataset.name =
      boss
        ? bossName
        : (
            specialEnemyNames[
              index
            ] ||
            `Frost Raider ${index + 1}`
          );

    fighter.dataset.hp =
      String(maxHP);

    fighter.dataset.maxHp =
      String(maxHP);

    fighter.dataset.stunned =
      "0";

    fighter.dataset.damageMin =
      String(
        Math.round(
          baseDamageMin *
          damageMultiplier
        )
      );

    fighter.dataset.damageMax =
      String(
        Math.round(
          baseDamageMax *
          damageMultiplier
        )
      );

    fighter.dataset.critChance =
      String(
        boss
          ? CHALLENGE_DIFFICULTY
              .bossCritChance
          : CHALLENGE_DIFFICULTY
              .enemyCritChance
      );

    if (boss) {
      fighter.style.left =
        "77%";

      fighter.style.top =
        "36%";
    } else {
      const positions = [
        68,
        74,
        80,
        71,
        83
      ];

      const rows = [
        30,
        49,
        35,
        58,
        54
      ];

      fighter.style.left =
        `${
          positions[
            index
          ] ?? 82
        }%`;

      fighter.style.top =
        `${
          rows[
            index
          ] ?? 45
        }%`;
    }

    fighter.innerHTML =
      fighterMarkup(
        fighter.dataset.name,
        true,
        boss
      );

    field.appendChild(
      fighter
    );
  }

  $("#bossHealthPanel").hidden =
    !bossWave;

  if (bossWave) {
    const displayBossName =
      battle.specialContext
        ?.bossName ||
      "Frost Guardian";

    $("#bossTitle").textContent =
      battle.stage >=
      20
        ? `${displayBossName} · ENRAGED`
        : displayBossName;

    $("#bossHealthFill")
      .style.width =
        "100%";
  }
}

/* =========================================================
   BATTLE START / STOP
========================================================= */

function startBattle(
  stage,
  options = {}
) {
  stopBattle(false);

  battle.running =
    true;

  battle.paused =
    false;

  battle.stage =
    stage;

  battle.currentWave =
    0;

  battle.totalWaves =
    Number(
      options.waves ||
      getWaveCount(stage)
    );

  battle.auto =
    state.autoBattle;

  battle.speed =
    state.battleSpeed;

  battle.enemyTurnCounter =
    0;

  battle.mode =
    options.mode ||
    "story";

  battle.specialContext =
    options.context ||
    null;

  battle.token +=
    1;

  resetBattleFields();

  buildAllies();

  startBattleSnow();

  $("#battleScreen").hidden =
    false;

  $("#battleStageText")
    .textContent =
      options.label ||
      `STAGE 1-${stage}`;

  $("#autoBattleButton")
    .classList.toggle(
      "active",
      battle.auto
    );

  $("#battleSpeedButton")
    .textContent =
      `×${battle.speed}`;

  $("#pauseBattleButton")
    .textContent =
      "PAUSE";

  runBattleLoop(
    battle.token
  );
}

function stopBattle(
  hide = true
) {
  battle.running =
    false;

  battle.paused =
    false;

  battle.token +=
    1;

  stopBattleSnow();

  clearAllCooldowns();

  if (hide) {
    $("#battleScreen").hidden =
      true;
  }
}

async function waitForBattle(
  milliseconds,
  token
) {
  const step =
    30;

  let remaining =
    milliseconds;

  while (
    remaining >
    0
  ) {
    if (
      !battle.running ||
      token !==
        battle.token
    ) {
      return false;
    }

    if (
      !battle.paused
    ) {
      remaining -=
        step *
        battle.speed;
    }

    await wait(
      step
    );
  }

  return (
    battle.running &&
    token ===
      battle.token
  );
}

/* =========================================================
   BATTLE LOOP
========================================================= */

async function runBattleLoop(
  token
) {
  for (
    let wave = 1;
    wave <=
    battle.totalWaves;
    wave += 1
  ) {
    if (
      !battle.running ||
      token !==
        battle.token
    ) {
      return;
    }

    battle.currentWave =
      wave;

    $("#battleWaveText")
      .textContent =
        `WAVE ${wave} / ${battle.totalWaves}`;

    const bossWave =
      wave ===
        battle.totalWaves &&
      battle.totalWaves >=
        5;

    announceWave(
      bossWave
        ? "FINAL WAVE · BOSS"
        : `WAVE ${wave}`
    );

    spawnEnemies(
      wave,
      battle.totalWaves
    );

    if (
      !(
        await waitForBattle(
          820,
          token
        )
      )
    ) {
      return;
    }

    await fightCurrentWave(
      token
    );

    if (
      !battle.running ||
      token !==
        battle.token
    ) {
      return;
    }

    if (
      !livingAllies()
        .length
    ) {
      await finishDefeat(
        token
      );

      return;
    }

    if (
      wave <
      battle.totalWaves
    ) {
      announceWave(
        "WAVE CLEARED"
      );

      if (
        !(
          await waitForBattle(
            520,
            token
          )
        )
      ) {
        return;
      }

      if (
        battle.stage <=
        8
      ) {
        livingAllies()
          .forEach(
            (fighter) =>
              healFighter(
                fighter,
                4
              )
          );
      }

      await runForward(
        token
      );
    }
  }

  if (
    battle.running &&
    token ===
      battle.token
  ) {
    await finishVictory(
      token
    );
  }
}

async function fightCurrentWave(
  token
) {
  while (
    battle.running &&
    token ===
      battle.token &&
    livingEnemies()
      .length
  ) {
    if (
      battle.paused
    ) {
      await wait(
        60
      );

      continue;
    }

    const allies =
      livingAllies();

    const enemies =
      livingEnemies();

    if (
      !allies.length
    ) {
      return;
    }

    const attacker =
      randomFrom(
        allies
      );

    const target =
      randomFrom(
        enemies
      );

    if (
      attacker &&
      target
    ) {
      await performBasicAttack(
        attacker,
        target,
        token
      );
    }

    if (
      !battle.running ||
      token !==
        battle.token
    ) {
      return;
    }

    if (
      battle.auto &&
      Math.random() <
        0.3
    ) {
      autoCastRandomSkill();
    }

    if (
      !(
        await waitForBattle(
          240,
          token
        )
      )
    ) {
      return;
    }

    const updatedEnemies =
      livingEnemies();

    const updatedAllies =
      livingAllies();

    if (
      updatedEnemies.length &&
      updatedAllies.length
    ) {
      const enemy =
        randomFrom(
          updatedEnemies.filter(
            (fighter) =>
              fighter.dataset.stunned !==
              "1"
          )
        );

      const ally =
        enemyTargetPriority(
          updatedAllies,
          enemy
        );

      if (
        enemy &&
        ally
      ) {
        await performEnemyAttack(
          enemy,
          ally,
          token
        );
      }
    }

    if (
      !(
        await waitForBattle(
          330,
          token
        )
      )
    ) {
      return;
    }
  }
}

/* =========================================================
   BASIC ATTACKS
========================================================= */

function isRangedCookie(name) {
  return [
    "Dollar Cookie",
    "Violin Cookie",
    "Banker Cookie",
    "Lucky Cookie"
  ].includes(name);
}

async function performBasicAttack(
  attacker,
  target,
  token
) {
  const name =
    attacker.dataset.name;

  if (
    isRangedCookie(
      name
    )
  ) {
    await launchProjectile(
      attacker,
      target,
      name,
      token
    );

    return;
  }

  attacker.classList.add(
    "attack"
  );

  if (
    !(
      await waitForBattle(
        120,
        token
      )
    )
  ) {
    return;
  }

  dealDamage(
    target,
    randomInt(
      12,
      22
    ),
    Math.random() <
      0.15,
    attacker
  );

  await waitForBattle(
    120,
    token
  );

  attacker.classList.remove(
    "attack"
  );
}

async function performEnemyAttack(
  attacker,
  target,
  token
) {
  attacker.classList.add(
    "attack"
  );

  battle.enemyTurnCounter +=
    1;

  if (
    !(
      await waitForBattle(
        120,
        token
      )
    )
  ) {
    return;
  }

  const damageMin =
    Number(
      attacker.dataset.damageMin ||
      7
    );

  const damageMax =
    Number(
      attacker.dataset.damageMax ||
      14
    );

  const critChance =
    Number(
      attacker.dataset.critChance ||
      0.08
    );

  const isBoss =
    attacker.classList.contains(
      "boss"
    );

  if (isBoss) {
    const hp =
      Number(
        attacker.dataset.hp ||
        0
      );

    const maxHp =
      Math.max(
        1,
        Number(
          attacker.dataset.maxHp ||
          1
        )
      );

    const hpRatio =
      hp /
      maxHp;

    const specialEvery =
      hpRatio <= 0.30
        ? 2
        : hpRatio <= 0.60
          ? 3
          : 4;

    if (
      battle.enemyTurnCounter %
        specialEvery ===
      0
    ) {
      const allies =
        livingAllies();

      const victims =
        [...allies]
          .sort(
            (a, b) =>
              Number(
                a.dataset.hp ||
                0
              ) -
              Number(
                b.dataset.hp ||
                0
              )
          )
          .slice(
            0,
            hpRatio <=
            0.30
              ? 3
              : 2
          );

      $("#battleMessage")
        .textContent =
          hpRatio <=
          0.30
            ? "Frost Guardian: ABSOLUTE ZERO!"
            : "Frost Guardian: Glacier Crush!";

      announceWave(
        hpRatio <=
        0.30
          ? "BOSS ENRAGED"
          : "BOSS SKILL"
      );

      victims.forEach(
        (
          victim,
          index
        ) => {
          setTimeout(
            () => {
              if (
                !victim.isConnected
              ) {
                return;
              }

              dealDamage(
                victim,
                Math.round(
                  randomInt(
                    damageMin,
                    damageMax
                  ) *
                  (
                    hpRatio <=
                    0.30
                      ? 1.22
                      : 0.82
                  )
                ),
                Math.random() <
                  critChance,
                attacker
              );

              spawnEffectRing(
                victim,
                "magic"
              );
            },
            index *
              90 /
              battle.speed
          );
        }
      );

      await waitForBattle(
        260,
        token
      );

      attacker.classList.remove(
        "attack"
      );

      return;
    }
  }

  dealDamage(
    target,
    randomInt(
      damageMin,
      damageMax
    ),
    Math.random() <
      critChance,
    attacker
  );

  await waitForBattle(
    120,
    token
  );

  attacker.classList.remove(
    "attack"
  );
}

async function launchProjectile(
  attacker,
  target,
  name,
  token
) {
  const projectileLayer =
    $("#projectileLayer");

  const battleRect =
    $("#battleScreen")
      .getBoundingClientRect();

  const attackerRect =
    attacker
      .getBoundingClientRect();

  const targetRect =
    target
      .getBoundingClientRect();

  const projectile =
    document.createElement(
      "div"
    );

  const startX =
    attackerRect.left -
    battleRect.left +
    attackerRect.width *
      0.68;

  const startY =
    attackerRect.top -
    battleRect.top +
    attackerRect.height *
      0.42;

  const endX =
    targetRect.left -
    battleRect.left +
    targetRect.width *
      0.5;

  const endY =
    targetRect.top -
    battleRect.top +
    targetRect.height *
      0.42;

  projectile.className =
    "projectile";

  if (
    name ===
    "Violin Cookie"
  ) {
    projectile.classList.add(
      "magic"
    );
  }

  if (
    name ===
    "Lucky Cookie"
  ) {
    projectile.classList.add(
      "nature"
    );
  }

  projectile.style.left =
    `${startX}px`;

  projectile.style.top =
    `${startY}px`;

  projectile.style.setProperty(
    "--dx",
    `${endX - startX}px`
  );

  projectile.style.setProperty(
    "--dy",
    `${endY - startY}px`
  );

  projectileLayer.appendChild(
    projectile
  );

  attacker.classList.add(
    "attack"
  );

  if (
    !(
      await waitForBattle(
        280,
        token
      )
    )
  ) {
    projectile.remove();

    return;
  }

  projectile.remove();

  attacker.classList.remove(
    "attack"
  );

  dealDamage(
    target,
    randomInt(
      13,
      21
    ),
    Math.random() <
      0.18,
    attacker
  );
}
/* =========================================================
   ADVENTURE / WORLD PROGRESS
========================================================= */

function completedStageCount() {
  return Object.keys(state.completedStages).filter((key) => state.completedStages[key]).length;
}

function refreshAdventureProgress() {
  const completed = completedStageCount();
  const percent = clamp((completed / 30) * 100, 0, 100);

  $("#frostpeakProgress").style.width = `${percent}%`;
  $("#frostpeakProgressText").textContent = `${completed} / 30`;
  $("#adventureCoinText").textContent = formatNumber(state.coins);
}

function setupAdventureCards() {
  $("[data-world='frostpeak']")?.addEventListener("click", () => {
    showScreen("worldScreen");
  });
}

function stagePosition(stage) {
  const column = (stage - 1) % 10;
  const row = Math.floor((stage - 1) / 10);

  const x = 6 + column * 9.1 + (row % 2 ? 3.5 : 0);
  const curve = Math.sin((column / 9) * Math.PI) * 12;
  const y = 80 - row * 30 - curve;

  return {
    x,
    y
  };
}

function renderStageRoute() {
  const route = $("#stageRoute");

  if (!route) {
    return;
  }

  route.innerHTML = "";

  let stars = 0;

  for (let stage = 1; stage <= 30; stage += 1) {
    const position = stagePosition(stage);
    const button = document.createElement("button");
    const boss = stage % 10 === 0;
    const cleared = Boolean(state.completedStages[stage]);

    button.type = "button";
    button.className = `stage-node${boss ? " boss" : ""}${cleared ? " cleared" : ""}`;
    button.style.left = `${position.x}%`;
    button.style.top = `${position.y}%`;
    button.dataset.label = boss ? `Boss 1-${stage}` : `Stage 1-${stage}`;
    button.textContent = stage;

    button.addEventListener("click", () => {
      openStage(stage);
    });

    route.appendChild(button);

    if (cleared) {
      stars += 3;
    }
  }

  $("#worldStarText").textContent = `${stars} / 90`;
}

function getWaveCount(stage) {
  return FROSTPEAK_STAGES[stage]?.waves || 3;
}

function stageSubtitle(stage) {
  const data = FROSTPEAK_STAGES[stage];
  return data ? `${data.title} · ${data.subtitle}` : "Footprints in the Snow";
}

function stageDescription(stage) {
  return FROSTPEAK_STAGES[stage]?.description || "Protect Prospera's supplies and clear the frozen mountain trail.";
}

function openStage(stage) {
  state.currentStage = stage;
  saveGame();

  $("#stageTitle").textContent = `Stage 1-${stage}`;
  $("#stageSubtitle").textContent = stageSubtitle(stage);
  $("#stageDescription").textContent = stageDescription(stage);
  $("#stagePower").textContent = formatNumber(FROSTPEAK_STAGES[stage]?.recommendedPower || (4200 + stage * 220));
  $("#stageWaveCount").textContent = getWaveCount(stage);

  renderStageTeamPreview();
  showScreen("stageScreen");
}

function miniCookieMarkup(name) {
  const data = cookieData(name);

  return `
    <div
      class="mini-cookie"
      style="
        --dough:${data.dough};
        --hair:${data.hair};
        --coat:${data.coat};
        --coat2:${data.coat2};
      "
    >
      <div class="mini-cookie-shadow"></div>
      <span class="mini-cookie-arm left"></span>
      <span class="mini-cookie-arm right"></span>
      <span class="mini-cookie-leg left"></span>
      <span class="mini-cookie-leg right"></span>
      <span class="mini-cookie-body"></span>
      <span class="mini-cookie-head"><i class="mini-cookie-mouth"></i></span>
      <span class="mini-cookie-hair"></span>
    </div>
  `;
}

function renderStageTeamPreview() {
  const preview = $("#stageTeamPreview");

  preview.innerHTML = "";

  state.team.slice(0, 5).forEach((name) => {
    const card = document.createElement("div");

    card.className = "team-preview-card";
    card.innerHTML = `
      ${miniCookieMarkup(name)}
      <b>${name.replace(" Cookie", "")}</b>
    `;

    preview.appendChild(card);
  });
}

function setupStageScreen() {
  $("#editTeamButton")?.addEventListener("click", () => {
    showScreen("teamScreen");
    renderTeamEditor();
  });

  $("#startBattleButton")?.addEventListener("click", () => {
    startBattle(state.currentStage);
  });
}

/* =========================================================
   SUMMON SYSTEM
========================================================= */

function refreshSummonScreen() {
  $("#ticketText").textContent = formatNumber(state.tickets);
}

function weightedSummon() {
  const weighted = [];

  SUMMON_POOL.forEach((name) => {
    const rarity = cookieData(name).rarity;
    const weight = RARITY_WEIGHTS[rarity] || 1;

    for (let count = 0; count < weight; count += 1) {
      weighted.push(name);
    }
  });

  return randomFrom(weighted);
}

function summon(count) {
  if (state.tickets < count) {
    toast("Not enough Fortune Tickets.");
    return;
  }

  state.tickets -= count;

  let finalResult = null;
  let newCookies = 0;

  for (let index = 0; index < count; index += 1) {
    const name = weightedSummon();
    finalResult = name;

    if (!state.ownedCookies.includes(name)) {
      state.ownedCookies.push(name);
      newCookies += 1;
    }
  }

  saveGame();
  refreshAllUI();
  renderSummonResult(finalResult, count, newCookies);
}

function renderSummonResult(name, count, newCookies) {
  const data = cookieData(name);
  const result = $("#summonResult");

  result.innerHTML = `
    <div class="summon-result-content">
      <span
        class="summon-rarity-chip"
        style="background:${rarityColor(data.rarity)}"
      >
        ${data.rarity}
      </span>

      <div class="summon-cookie-stage">
        ${miniCookieMarkup(name)}
      </div>

      <h2>${name}</h2>
      <p>${data.line}</p>
      <p>${count === 10 ? `${newCookies} new Cookies joined Prospera.` : "A wish has answered."}</p>
    </div>
  `;
}

function setupSummonScreen() {
  $("#summonOneButton")?.addEventListener("click", () => {
    summon(1);
  });

  $("#summonTenButton")?.addEventListener("click", () => {
    summon(10);
  });
}

/* =========================================================
   BATTLE CHARACTER MARKUP
========================================================= */

function fighterMarkup(name, enemy = false, boss = false) {
  const data = enemy
    ? {
        dough: boss ? "#7f99b8" : "#8cc0d4",
        hair: boss ? "#f1f7ff" : "#d9f3ff",
        coat: boss ? "#563d70" : "#4b5d83",
        coat2: boss ? "#2b1e43" : "#293754"
      }
    : cookieData(name);

  return `
    <div class="hp-bar"><i></i></div>
    <div class="fighter-shadow"></div>

    <span class="fighter-arm left" style="--body:${data.dough}"></span>
    <span class="fighter-arm right" style="--body:${data.dough}"></span>
    <span class="fighter-leg left" style="--body:${data.dough}"></span>
    <span class="fighter-leg right" style="--body:${data.dough}"></span>

    <span
      class="fighter-coat"
      style="--coat:${data.coat};--coat2:${data.coat2}"
    ></span>

    <span class="fighter-head" style="--body:${data.dough}">
      <i class="fighter-mouth"></i>
    </span>

    <span class="fighter-hair" style="--hair:${data.hair}"></span>

    <span class="fighter-name">
      ${name}${boss ? " · BOSS" : ""}
    </span>
  `;
}

/* =========================================================
   BATTLE SETUP
========================================================= */

function resetBattleFields() {
  $("#allyField").innerHTML = "";
  $("#enemyField").innerHTML = "";
  $("#projectileLayer").innerHTML = "";
  $("#effectLayer").innerHTML = "";
  $("#floatLayer").innerHTML = "";
  $("#skillBar").innerHTML = "";
  $("#battleMessage").textContent = "";
  $("#bossHealthPanel").hidden = true;
}

function buildAllies() {
  const field = $("#allyField");
  const team = state.team.slice(0, 5);

  field.innerHTML = "";

  team.forEach((name, index) => {
    const data = cookieData(name);
    const fighter = document.createElement("div");
    const maxHP = data.role === "Defender" ? 150 : data.role === "Healer" ? 110 : 120;

    fighter.className = "fighter ally";
    fighter.dataset.name = name;
    fighter.dataset.role = data.role;
    fighter.dataset.position = data.position;
    fighter.dataset.hp = String(maxHP);
    fighter.dataset.maxHp = String(maxHP);
    fighter.dataset.shield = "0";
    fighter.style.left = `${7 + index * 7.4}%`;
    fighter.style.top = `${36 + (index % 2) * 14}%`;
    fighter.innerHTML = fighterMarkup(name, false, false);

    field.appendChild(fighter);
  });

  buildSkillBar();
}

function buildSkillBar() {
  const bar = $("#skillBar");

  bar.innerHTML = "";

  state.team.slice(0, 5).forEach((name) => {
    const data = cookieData(name);
    const button = document.createElement("button");

    button.type = "button";
    button.className = "skill-button ready";
    button.dataset.name = name;
    button.innerHTML = `
      <div class="skill-cooldown-overlay"></div>
      <span>${name.replace(" Cookie", "")}</span>
      <b>READY</b>
      <small>${data.skillName}</small>
    `;

    button.addEventListener("click", () => {
      castSkill(name, button);
    });

    bar.appendChild(button);
  });
}

/* =========================================================
   CHALLENGE DIFFICULTY
========================================================= */

const CHALLENGE_DIFFICULTY = {
  baseHpMultiplier: 1.35,
  stageHpGrowth: 0.045,
  waveHpGrowth: 0.08,
  baseDamageMultiplier: 1.20,
  stageDamageGrowth: 0.026,
  waveDamageGrowth: 0.055,
  bossHpMultiplier: 2.15,
  bossDamageMultiplier: 1.45,
  enemyCritChance: 0.10,
  bossCritChance: 0.18,
  maxEnemies: 5
};

function getChallengeScaling(stage = battle.stage, wave = battle.currentWave) {
  const safeStage = Math.max(1, Number(stage) || 1);
  const safeWave = Math.max(1, Number(wave) || 1);

  return {
    hpMultiplier:
      CHALLENGE_DIFFICULTY.baseHpMultiplier *
      (1 + (safeStage - 1) * CHALLENGE_DIFFICULTY.stageHpGrowth) *
      (1 + (safeWave - 1) * CHALLENGE_DIFFICULTY.waveHpGrowth),

    damageMultiplier:
      CHALLENGE_DIFFICULTY.baseDamageMultiplier *
      (1 + (safeStage - 1) * CHALLENGE_DIFFICULTY.stageDamageGrowth) *
      (1 + (safeWave - 1) * CHALLENGE_DIFFICULTY.waveDamageGrowth)
  };
}

function enemyTargetPriority(allies, attacker) {
  if (!allies.length) return null;

  const isBoss = attacker?.classList?.contains("boss");

  const healersAndSupports = allies.filter((fighter) => {
    return fighter.dataset.role === "Healer" || fighter.dataset.role === "Support";
  });

  const lowestHp = [...allies].sort((a, b) => {
    const aRatio =
      Number(a.dataset.hp || 0) /
      Math.max(1, Number(a.dataset.maxHp || 1));

    const bRatio =
      Number(b.dataset.hp || 0) /
      Math.max(1, Number(b.dataset.maxHp || 1));

    return aRatio - bRatio;
  })[0];

  if (isBoss && lowestHp && Math.random() < 0.48) {
    return lowestHp;
  }

  if (healersAndSupports.length && Math.random() < 0.34) {
    return randomFrom(healersAndSupports);
  }

  return randomFrom(allies);
}

function spawnEnemies(wave, totalWaves) {
  const field = $("#enemyField");
  const bossWave = wave === totalWaves && totalWaves >= 5;
  const scaling = getChallengeScaling(battle.stage, wave);
  const stageEnemyBonus = battle.stage >= 18 ? 1 : 0;

  const count = bossWave
    ? (battle.stage >= 20 ? 2 : 1)
    : Math.min(
        CHALLENGE_DIFFICULTY.maxEnemies,
        3 + Math.floor((wave - 1) / 2) + stageEnemyBonus
      );

  field.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const boss = bossWave && index === 0;
    const fighter = document.createElement("div");

    const baseHP = boss
      ? 360 + battle.stage * 14 + wave * 26
      : 82 + battle.stage * 5 + wave * 17 + index * 9;

    const hpMultiplier = boss
      ? scaling.hpMultiplier * CHALLENGE_DIFFICULTY.bossHpMultiplier
      : scaling.hpMultiplier;

    const maxHP = Math.round(baseHP * hpMultiplier);

    const baseDamageMin = boss
      ? 10 + Math.floor(battle.stage * 0.32) + wave
      : 6 + Math.floor(battle.stage * 0.20) + Math.floor(wave * 0.7);

    const baseDamageMax = boss
      ? 18 + Math.floor(battle.stage * 0.45) + wave * 2
      : 12 + Math.floor(battle.stage * 0.30) + wave;

    const damageMultiplier = boss
      ? scaling.damageMultiplier * CHALLENGE_DIFFICULTY.bossDamageMultiplier
      : scaling.damageMultiplier;

    fighter.className = `fighter enemy${boss ? " boss" : ""}`;

    const specialEnemyNames = battle.specialContext?.enemyNames || [];
    const bossName = battle.specialContext?.bossName || "Frost Guardian";

    fighter.dataset.name = boss
      ? bossName
      : (specialEnemyNames[index] || `Frost Raider ${index + 1}`);

    fighter.dataset.hp = String(maxHP);
    fighter.dataset.maxHp = String(maxHP);
    fighter.dataset.stunned = "0";
    fighter.dataset.damageMin = String(Math.round(baseDamageMin * damageMultiplier));
    fighter.dataset.damageMax = String(Math.round(baseDamageMax * damageMultiplier));

    fighter.dataset.critChance = String(
      boss
        ? CHALLENGE_DIFFICULTY.bossCritChance
        : CHALLENGE_DIFFICULTY.enemyCritChance
    );

    if (boss) {
      fighter.style.left = "77%";
      fighter.style.top = "36%";
    } else {
      const positions = [68, 74, 80, 71, 83];
      const rows = [30, 49, 35, 58, 54];

      fighter.style.left = `${positions[index] ?? 82}%`;
      fighter.style.top = `${rows[index] ?? 45}%`;
    }

    fighter.innerHTML = fighterMarkup(
      fighter.dataset.name,
      true,
      boss
    );

    field.appendChild(fighter);
  }

  $("#bossHealthPanel").hidden = !bossWave;

  if (bossWave) {
    const displayBossName =
      battle.specialContext?.bossName ||
      "Frost Guardian";

    $("#bossTitle").textContent =
      battle.stage >= 20
        ? `${displayBossName} · ENRAGED`
        : displayBossName;

    $("#bossHealthFill").style.width = "100%";
  }
}

/* =========================================================
   BATTLE START / STOP
========================================================= */

function startBattle(stage, options = {}) {
  stopBattle(false);

  battle.running = true;
  battle.paused = false;
  battle.stage = stage;
  battle.currentWave = 0;
  battle.totalWaves = Number(options.waves || getWaveCount(stage));
  battle.auto = state.autoBattle;
  battle.speed = state.battleSpeed;
  battle.enemyTurnCounter = 0;
  battle.mode = options.mode || "story";
  battle.specialContext = options.context || null;
  battle.token += 1;

  resetBattleFields();
  buildAllies();
  startBattleSnow();

  $("#battleScreen").hidden = false;
  $("#battleStageText").textContent =
    options.label ||
    `STAGE 1-${stage}`;

  $("#autoBattleButton").classList.toggle(
    "active",
    battle.auto
  );

  $("#battleSpeedButton").textContent =
    `×${battle.speed}`;

  $("#pauseBattleButton").textContent =
    "PAUSE";

  runBattleLoop(battle.token);
}

function stopBattle(hide = true) {
  battle.running = false;
  battle.paused = false;
  battle.token += 1;

  stopBattleSnow();
  clearAllCooldowns();

  if (hide) {
    $("#battleScreen").hidden = true;
  }
}

async function waitForBattle(milliseconds, token) {
  const step = 30;
  let remaining = milliseconds;

  while (remaining > 0) {
    if (!battle.running || token !== battle.token) {
      return false;
    }

    if (!battle.paused) {
      remaining -= step * battle.speed;
    }

    await wait(step);
  }

  return battle.running && token === battle.token;
}

/* =========================================================
   BATTLE LOOP
========================================================= */

async function runBattleLoop(token) {
  for (let wave = 1; wave <= battle.totalWaves; wave += 1) {
    if (!battle.running || token !== battle.token) {
      return;
    }

    battle.currentWave = wave;

    $("#battleWaveText").textContent =
      `WAVE ${wave} / ${battle.totalWaves}`;

    const bossWave =
      wave === battle.totalWaves &&
      battle.totalWaves >= 5;

    announceWave(
      bossWave
        ? "FINAL WAVE · BOSS"
        : `WAVE ${wave}`
    );

    spawnEnemies(
      wave,
      battle.totalWaves
    );

    if (!(await waitForBattle(820, token))) {
      return;
    }

    await fightCurrentWave(token);

    if (!battle.running || token !== battle.token) {
      return;
    }

    if (!livingAllies().length) {
      await finishDefeat(token);
      return;
    }

    if (wave < battle.totalWaves) {
      announceWave("WAVE CLEARED");

      if (!(await waitForBattle(520, token))) {
        return;
      }

      if (battle.stage <= 8) {
        livingAllies().forEach((fighter) => {
          healFighter(fighter, 4);
        });
      }

      await runForward(token);
    }
  }

  if (battle.running && token === battle.token) {
    await finishVictory(token);
  }
}

async function fightCurrentWave(token) {
  while (
    battle.running &&
    token === battle.token &&
    livingEnemies().length
  ) {
    if (battle.paused) {
      await wait(60);
      continue;
    }

    const allies = livingAllies();
    const enemies = livingEnemies();

    if (!allies.length) {
      return;
    }

    const attacker = randomFrom(allies);
    const target = randomFrom(enemies);

    if (attacker && target) {
      await performBasicAttack(
        attacker,
        target,
        token
      );
    }

    if (!battle.running || token !== battle.token) {
      return;
    }

    if (battle.auto && Math.random() < 0.3) {
      autoCastRandomSkill();
    }

    if (!(await waitForBattle(240, token))) {
      return;
    }

    const updatedEnemies = livingEnemies();
    const updatedAllies = livingAllies();

    if (updatedEnemies.length && updatedAllies.length) {
      const enemy = randomFrom(
        updatedEnemies.filter(
          (fighter) =>
            fighter.dataset.stunned !== "1"
        )
      );

      const ally = enemyTargetPriority(
        updatedAllies,
        enemy
      );

      if (enemy && ally) {
        await performEnemyAttack(
          enemy,
          ally,
          token
        );
      }
    }

    if (!(await waitForBattle(330, token))) {
      return;
    }
  }
}

/* =========================================================
   BASIC ATTACKS
========================================================= */

function isRangedCookie(name) {
  return [
    "Dollar Cookie",
    "Violin Cookie",
    "Banker Cookie",
    "Lucky Cookie"
  ].includes(name);
}

async function performBasicAttack(attacker, target, token) {
  const name = attacker.dataset.name;

  if (isRangedCookie(name)) {
    await launchProjectile(
      attacker,
      target,
      name,
      token
    );

    return;
  }

  attacker.classList.add("attack");

  if (!(await waitForBattle(120, token))) {
    return;
  }

  dealDamage(
    target,
    randomInt(12, 22),
    Math.random() < 0.15,
    attacker
  );

  await waitForBattle(120, token);

  attacker.classList.remove("attack");
}

async function performEnemyAttack(attacker, target, token) {
  attacker.classList.add("attack");

  battle.enemyTurnCounter += 1;

  if (!(await waitForBattle(120, token))) {
    return;
  }

  const damageMin =
    Number(attacker.dataset.damageMin || 7);

  const damageMax =
    Number(attacker.dataset.damageMax || 14);

  const critChance =
    Number(attacker.dataset.critChance || 0.08);

  const isBoss =
    attacker.classList.contains("boss");

  if (isBoss) {
    const hp =
      Number(attacker.dataset.hp || 0);

    const maxHp =
      Math.max(
        1,
        Number(attacker.dataset.maxHp || 1)
      );

    const hpRatio =
      hp / maxHp;

    const specialEvery =
      hpRatio <= 0.30
        ? 2
        : hpRatio <= 0.60
          ? 3
          : 4;

    if (
      battle.enemyTurnCounter %
        specialEvery ===
      0
    ) {
      const allies =
        livingAllies();

      const victims =
        [...allies]
          .sort(
            (a, b) =>
              Number(a.dataset.hp || 0) -
              Number(b.dataset.hp || 0)
          )
          .slice(
            0,
            hpRatio <= 0.30
              ? 3
              : 2
          );

      $("#battleMessage").textContent =
        hpRatio <= 0.30
          ? "Frost Guardian: ABSOLUTE ZERO!"
          : "Frost Guardian: Glacier Crush!";

      announceWave(
        hpRatio <= 0.30
          ? "BOSS ENRAGED"
          : "BOSS SKILL"
      );

      victims.forEach((victim, index) => {
        setTimeout(() => {
          if (!victim.isConnected) {
            return;
          }

          dealDamage(
            victim,
            Math.round(
              randomInt(
                damageMin,
                damageMax
              ) *
              (
                hpRatio <= 0.30
                  ? 1.22
                  : 0.82
              )
            ),
            Math.random() < critChance,
            attacker
          );

          spawnEffectRing(
            victim,
            "magic"
          );
        }, index * 90 / battle.speed);
      });

      await waitForBattle(
        260,
        token
      );

      attacker.classList.remove("attack");

      return;
    }
  }

  dealDamage(
    target,
    randomInt(
      damageMin,
      damageMax
    ),
    Math.random() < critChance,
    attacker
  );

  await waitForBattle(
    120,
    token
  );

  attacker.classList.remove("attack");
}

async function launchProjectile(
  attacker,
  target,
  name,
  token
) {
  const projectileLayer =
    $("#projectileLayer");

  const battleRect =
    $("#battleScreen").getBoundingClientRect();

  const attackerRect =
    attacker.getBoundingClientRect();

  const targetRect =
    target.getBoundingClientRect();

  const projectile =
    document.createElement("div");

  const startX =
    attackerRect.left -
    battleRect.left +
    attackerRect.width * 0.68;

  const startY =
    attackerRect.top -
    battleRect.top +
    attackerRect.height * 0.42;

  const endX =
    targetRect.left -
    battleRect.left +
    targetRect.width * 0.5;

  const endY =
    targetRect.top -
    battleRect.top +
    targetRect.height * 0.42;

  projectile.className =
    "projectile";

  if (name === "Violin Cookie") {
    projectile.classList.add("magic");
  }

  if (name === "Lucky Cookie") {
    projectile.classList.add("nature");
  }

  projectile.style.left =
    `${startX}px`;

  projectile.style.top =
    `${startY}px`;

  projectile.style.setProperty(
    "--dx",
    `${endX - startX}px`
  );

  projectile.style.setProperty(
    "--dy",
    `${endY - startY}px`
  );

  projectileLayer.appendChild(
    projectile
  );

  attacker.classList.add(
    "attack"
  );

  if (!(await waitForBattle(280, token))) {
    projectile.remove();
    return;
  }

  projectile.remove();

  attacker.classList.remove(
    "attack"
  );

  dealDamage(
    target,
    randomInt(13, 21),
    Math.random() < 0.18,
    attacker
  );
}

/* =========================================================
   DAMAGE / HEAL / SHIELD
========================================================= */

function dealDamage(target, rawAmount, critical = false, source = null) {
  if (!target || target.classList.contains("ko")) {
    return;
  }

  let amount = rawAmount;
  const shield = Number(target.dataset.shield || 0);

  if (shield > 0) {
    const blocked = Math.min(shield, amount);

    amount -= blocked;

    target.dataset.shield =
      String(shield - blocked);

    showFloatText(
      target,
      `BLOCK ${blocked}`,
      "status"
    );
  }

  if (critical) {
    amount =
      Math.round(
        amount * 1.35
      );
  }

  const currentHP =
    Number(target.dataset.hp || 0);

  const maxHP =
    Number(target.dataset.maxHp || 100);

  const nextHP =
    Math.max(
      0,
      currentHP - amount
    );

  target.dataset.hp =
    String(nextHP);

  updateFighterHP(target);

  target.classList.add("hit");

  spawnBattleImpact(
    target,
    critical ? "flash" : "slash"
  );

  setTimeout(() => {
    target.classList.remove("hit");
  }, 250 / battle.speed);

  if (amount > 0) {
    showFloatText(
      target,
      critical
        ? `CRIT! -${amount}`
        : `-${amount}`,
      critical
        ? "crit"
        : ""
    );
  }

  if (target.classList.contains("boss")) {
    const percent =
      clamp(
        (nextHP / maxHP) * 100,
        0,
        100
      );

    $("#bossHealthFill").style.width =
      `${percent}%`;
  }

  if (nextHP <= 0) {
    knockOutFighter(
      target,
      source
    );
  }
}

function healFighter(target, amount) {
  if (!target || target.classList.contains("ko")) {
    return;
  }

  const currentHP =
    Number(target.dataset.hp || 0);

  const maxHP =
    Number(target.dataset.maxHp || 100);

  const nextHP =
    Math.min(
      maxHP,
      currentHP + amount
    );

  const healed =
    nextHP - currentHP;

  target.dataset.hp =
    String(nextHP);

  updateFighterHP(target);

  target.classList.add(
    "healing"
  );

  setTimeout(() => {
    target.classList.remove(
      "healing"
    );
  }, 650 / battle.speed);

  if (healed > 0) {
    showFloatText(
      target,
      `+${healed}`,
      "heal"
    );

    spawnEffectRing(
      target,
      "heal"
    );
  }
}

function addShield(target, amount) {
  if (!target || target.classList.contains("ko")) {
    return;
  }

  const current =
    Number(target.dataset.shield || 0);

  target.dataset.shield =
    String(current + amount);

  showFloatText(
    target,
    `SHIELD +${amount}`,
    "status"
  );

  spawnEffectRing(
    target,
    "magic"
  );
}

function updateFighterHP(fighter) {
  const currentHP =
    Number(fighter.dataset.hp || 0);

  const maxHP =
    Number(fighter.dataset.maxHp || 100);

  const percent =
    clamp(
      (currentHP / maxHP) * 100,
      0,
      100
    );

  const fill =
    fighter.querySelector(".hp-bar i");

  if (fill) {
    fill.style.width =
      `${percent}%`;
  }
}

function knockOutFighter(fighter) {
  if (fighter.classList.contains("ko")) {
    return;
  }

  fighter.classList.add("ko");

  setTimeout(() => {
    fighter.remove();
  }, 470 / battle.speed);
}

/* =========================================================
   BATTLE EFFECTS
========================================================= */

function showFloatText(target, text, type = "") {
  const targetRect =
    target.getBoundingClientRect();

  const battleRect =
    $("#battleScreen").getBoundingClientRect();

  const element =
    document.createElement("div");

  element.className =
    `float-number ${type}`;

  element.textContent =
    text;

  element.style.left =
    `${targetRect.left - battleRect.left + targetRect.width / 2}px`;

  element.style.top =
    `${targetRect.top - battleRect.top}px`;

  $("#floatLayer").appendChild(
    element
  );

  setTimeout(() => {
    element.remove();
  }, 900);
}

function spawnEffectRing(target, type = "") {
  const targetRect =
    target.getBoundingClientRect();

  const battleRect =
    $("#battleScreen").getBoundingClientRect();

  const ring =
    document.createElement("div");

  ring.className =
    `effect-ring ${type}`;

  ring.style.left =
    `${targetRect.left - battleRect.left + targetRect.width / 2}px`;

  ring.style.top =
    `${targetRect.top - battleRect.top + targetRect.height * 0.72}px`;

  $("#effectLayer").appendChild(
    ring
  );

  setTimeout(() => {
    ring.remove();
  }, 650);
}

function announceWave(text) {
  const element =
    $("#waveAnnouncement");

  element.textContent =
    text;

  element.classList.remove(
    "show"
  );

  void element.offsetWidth;

  element.classList.add(
    "show"
  );
}

/* =========================================================
   SKILLS
========================================================= */

function autoCastRandomSkill() {
  const readyButtons =
    $$(".skill-button.ready:not(:disabled)");

  const button =
    randomFrom(readyButtons);

  if (button) {
    button.click();
  }
}

function castSkill(name, button) {
  if (!battle.running || battle.paused) {
    return;
  }

  if (!button.classList.contains("ready")) {
    return;
  }

  const data =
    cookieData(name);

  const caster =
    livingAllies().find(
      (fighter) =>
        fighter.dataset.name === name
    );

  if (!caster) {
    return;
  }

  button.classList.remove(
    "ready"
  );

  button.querySelector("b").textContent =
    "COOLDOWN";

  switch (data.skillType) {
    case "heal":
      castHealSkill(caster, data);
      break;

    case "shield":
      castShieldSkill(caster, data);
      break;

    case "aoe":
      castAOESkill(caster, data);
      break;

    case "burst":
      castBurstSkill(caster, data);
      break;

    case "stun":
      castStunSkill(caster, data);
      break;

    case "buff":
      castFortuneSkill(caster, data);
      break;

    default:
      break;
  }

  startSkillCooldown(
    button,
    data.cooldown
  );
}

function castHealSkill(caster, data) {
  $("#battleMessage").textContent =
    `${caster.dataset.name}: ${data.skillName}!`;

  livingAllies().forEach((fighter) => {
    healFighter(
      fighter,
      data.skillPower
    );
  });
}

function castShieldSkill(caster, data) {
  $("#battleMessage").textContent =
    `${caster.dataset.name}: ${data.skillName}!`;

  livingAllies().forEach((fighter) => {
    addShield(
      fighter,
      data.skillPower
    );
  });
}

function castAOESkill(caster, data) {
  $("#battleMessage").textContent =
    `${caster.dataset.name}: ${data.skillName}!`;

  livingEnemies().forEach(
    (enemy, index) => {
      setTimeout(() => {
        if (enemy.isConnected) {
          dealDamage(
            enemy,
            data.skillPower,
            Math.random() < 0.25,
            caster
          );

          spawnEffectRing(
            enemy,
            "magic"
          );
        }
      }, index * 80 / battle.speed);
    }
  );
}

function castBurstSkill(caster, data) {
  $("#battleMessage").textContent =
    `${caster.dataset.name}: ${data.skillName}!`;

  const target =
    randomFrom(livingEnemies());

  if (target) {
    dealDamage(
      target,
      data.skillPower,
      true,
      caster
    );

    spawnEffectRing(
      target,
      "magic"
    );
  }
}

function castStunSkill(caster, data) {
  $("#battleMessage").textContent =
    `${caster.dataset.name}: ${data.skillName}!`;

  const target =
    randomFrom(livingEnemies());

  if (!target) {
    return;
  }

  dealDamage(
    target,
    data.skillPower,
    false,
    caster
  );

  target.dataset.stunned =
    "1";

  showFloatText(
    target,
    "STUN",
    "status"
  );

  const stunDuration =
    target.classList.contains("boss")
      ? 520
      : 1300;

  setTimeout(() => {
    if (target.isConnected) {
      target.dataset.stunned =
        "0";
    }
  }, stunDuration / battle.speed);
}

function castFortuneSkill(caster, data) {
  $("#battleMessage").textContent =
    `${caster.dataset.name}: ${data.skillName}!`;

  livingAllies().forEach((fighter) => {
    healFighter(
      fighter,
      10
    );

    addShield(
      fighter,
      8
    );
  });

  livingEnemies().forEach((enemy) => {
    dealDamage(
      enemy,
      data.skillPower,
      Math.random() < 0.2,
      caster
    );
  });
}

function startSkillCooldown(button, seconds) {
  const id =
    `${button.dataset.name}-${Date.now()}`;

  const total =
    seconds * 1000;

  let remaining =
    total;

  button.style.setProperty(
    "--cooldown",
    "1"
  );

  const timer =
    setInterval(() => {
      if (!battle.running) {
        clearInterval(timer);

        battle.cooldownTimers.delete(
          id
        );

        return;
      }

      if (!battle.paused) {
        remaining -=
          100 * battle.speed;
      }

      const fraction =
        clamp(
          remaining / total,
          0,
          1
        );

      button.style.setProperty(
        "--cooldown",
        String(fraction)
      );

      if (remaining <= 0) {
        clearInterval(timer);

        battle.cooldownTimers.delete(
          id
        );

        button.classList.add(
          "ready"
        );

        button.querySelector("b").textContent =
          "READY";

        button.style.setProperty(
          "--cooldown",
          "0"
        );
      }
    }, 100);

  battle.cooldownTimers.set(
    id,
    timer
  );
}

function clearAllCooldowns() {
  battle.cooldownTimers.forEach((timer) => {
    clearInterval(timer);
  });

  battle.cooldownTimers.clear();
}

/* =========================================================
   WAVE TRANSITION
========================================================= */

async function runForward(token) {
  const allies =
    livingAllies();

  allies.forEach((fighter) => {
    fighter.classList.add(
      "run"
    );
  });

  $("#battleMessage").textContent =
    "The team moves deeper into Frostpeak...";

  const nearMountains =
    $(".battle-mountains-near");

  const path =
    $(".battle-path");

  nearMountains?.animate(
    [
      {
        transform:
          "translateX(0)"
      },
      {
        transform:
          "translateX(-5%)"
      }
    ],
    {
      duration:
        900 / battle.speed,

      easing:
        "linear"
    }
  );

  path?.animate(
    [
      {
        backgroundPositionX:
          "0px"
      },
      {
        backgroundPositionX:
          "-130px"
      }
    ],
    {
      duration:
        900 / battle.speed,

      easing:
        "linear"
    }
  );

  await waitForBattle(
    900,
    token
  );

  allies.forEach((fighter) => {
    fighter.classList.remove(
      "run"
    );
  });

  $("#battleMessage").textContent =
    "";
}

/* =========================================================
   VICTORY / DEFEAT
========================================================= */

async function finishVictory(token) {
  announceWave("VICTORY");

  $("#battleMessage").textContent =
    battle.mode === "story"
      ? "Prospera's path grows brighter."
      : "Challenge cleared!";

  await waitForBattle(
    1100,
    token
  );

  if (
    !battle.running ||
    token !== battle.token
  ) {
    return;
  }

  if (battle.mode !== "story") {
    const mode =
      battle.mode;

    const context = {
      ...(battle.specialContext || {})
    };

    stopBattle(true);

    handleSpecialModeVictory(
      mode,
      context
    );

    return;
  }

  state.completedStages[
    battle.stage
  ] = true;

  state.coins += 500;
  state.wood += 8;

  state.currentStage =
    Math.min(
      30,
      battle.stage + 1
    );

  saveGame();
  refreshAllUI();

  const clearedStage =
    battle.stage;

  stopBattle(true);

  renderVictoryScreen(
    clearedStage
  );

  showScreen(
    "victoryScreen"
  );

  toast(
    `Stage 1-${clearedStage} cleared! +500 Coins +8 Wood`
  );
}

async function finishDefeat(token) {
  announceWave("DEFEAT");

  $("#battleMessage").textContent =
    "Strengthen your Cookies and try again.";

  await waitForBattle(
    1000,
    token
  );

  if (token !== battle.token) {
    return;
  }

  if (battle.mode !== "story") {
    const mode =
      battle.mode;

    const context = {
      ...(battle.specialContext || {})
    };

    stopBattle(true);

    handleSpecialModeDefeat(
      mode,
      context
    );

    return;
  }

  stopBattle(true);

  showScreen(
    "stageScreen"
  );

  toast(
    "Your team was defeated."
  );
}

/* =========================================================
   BATTLE WEATHER
========================================================= */

function startBattleSnow() {
  stopBattleSnow();

  const layer =
    $("#battleWeatherLayer");

  battle.snowTimer =
    setInterval(() => {
      if (!battle.running || battle.paused) {
        return;
      }

      const particle =
        document.createElement("i");

      particle.className =
        "snow-particle";

      particle.style.left =
        `${Math.random() * 100}%`;

      particle.style.animationDuration =
        `${3 + Math.random() * 3}s`;

      particle.style.opacity =
        String(
          0.35 +
          Math.random() * 0.55
        );

      layer.appendChild(
        particle
      );

      setTimeout(() => {
        particle.remove();
      }, 6500);
    }, 130);
}

function stopBattleSnow() {
  if (battle.snowTimer) {
    clearInterval(
      battle.snowTimer
    );

    battle.snowTimer =
      null;
  }

  $("#battleWeatherLayer")
    ?.replaceChildren();
}

/* =========================================================
   BATTLE CONTROLS
========================================================= */

function setupBattleControls() {
  $("#exitBattleButton")?.addEventListener("click", () => {
    const mode =
      battle.mode;

    stopBattle(true);

    if (mode === "arena") {
      showScreen(
        "adventureScreen"
      );

      renderArenaPanel();
      return;
    }

    if (mode === "dominion") {
      showScreen(
        "adventureScreen"
      );

      renderDominionPanel();
      return;
    }

    if (mode === "trials") {
      showScreen(
        "adventureScreen"
      );

      renderTrialsPanel();
      return;
    }

    if (mode === "wonderlands") {
      showScreen(
        "adventureScreen"
      );

      renderWonderlandsPanel();
      return;
    }

    showScreen(
      "stageScreen"
    );
  });

  $("#autoBattleButton")?.addEventListener("click", () => {
    battle.auto =
      !battle.auto;

    state.autoBattle =
      battle.auto;

    saveGame();

    $("#autoBattleButton").classList.toggle(
      "active",
      battle.auto
    );
  });

  $("#battleSpeedButton")?.addEventListener("click", () => {
    const speeds =
      [1, 1.5, 2];

    const currentIndex =
      speeds.indexOf(
        battle.speed
      );

    battle.speed =
      speeds[
        (currentIndex + 1) %
        speeds.length
      ];

    state.battleSpeed =
      battle.speed;

    saveGame();

    $("#battleSpeedButton").textContent =
      `×${battle.speed}`;
  });

  $("#pauseBattleButton")?.addEventListener("click", () => {
    if (!battle.running) {
      return;
    }

    battle.paused =
      !battle.paused;

    $("#pauseBattleButton").textContent =
      battle.paused
        ? "RESUME"
        : "PAUSE";

    $("#battleMessage").textContent =
      battle.paused
        ? "Battle paused"
        : "";
  });
}

/* =========================================================
   BATTLE UTILITY SELECTORS
========================================================= */

function livingAllies() {
  return $$("#allyField .fighter:not(.ko)");
}

function livingEnemies() {
  return $$("#enemyField .fighter:not(.ko)");
}

/* =========================================================
   ULTRA EXPANSION: TEAM EDITOR
========================================================= */

function teamPower() {
  return state.team.reduce(
    (total, name) =>
      total +
      (cookieData(name).power || 0),
    0
  );
}

function renderTeamEditor() {
  const slots =
    $("#teamSlots");

  const roster =
    $("#teamRoster");

  if (!slots || !roster) {
    return;
  }

  slots.innerHTML =
    "";

  roster.innerHTML =
    "";

  state.team
    .slice(0, 5)
    .forEach((name) => {
      const data =
        cookieData(name);

      const slot =
        document.createElement("article");

      slot.className =
        "team-slot";

      slot.innerHTML = `
        <button
          type="button"
          aria-label="Remove ${name}"
        >
          ×
        </button>

        ${miniCookieMarkup(name)}

        <strong>
          ${name}
        </strong>

        <small>
          ${data.position} · ${data.role}
        </small>
      `;

      slot
        .querySelector("button")
        .addEventListener(
          "click",
          () => {
            state.team =
              state.team.filter(
                (cookieName) =>
                  cookieName !== name
              );

            saveGame();

            renderTeamEditor();
          }
        );

      slots.appendChild(
        slot
      );
    });

  const query =
    (
      $("#teamSearchInput")?.value ||
      ""
    )
      .trim()
      .toLowerCase();

  state.ownedCookies
    .filter(
      (name) =>
        !query ||
        name.toLowerCase().includes(query)
    )
    .forEach((name) => {
      const data =
        cookieData(name);

      const card =
        document.createElement("button");

      card.type =
        "button";

      card.className =
        `team-roster-card ${
          state.team.includes(name)
            ? "in-team"
            : ""
        }`;

      card.style.setProperty(
        "--rarity-color",
        rarityColor(data.rarity)
      );

      card.innerHTML = `
        ${miniCookieMarkup(name)}

        <div class="team-roster-card-copy">
          <strong>
            ${name}
          </strong>

          <span>
            ${data.rarity} · ${data.position}
          </span>
        </div>
      `;

      card.addEventListener("click", () => {
        if (state.team.includes(name)) {
          state.team =
            state.team.filter(
              (cookieName) =>
                cookieName !== name
            );
        } else if (state.team.length < 5) {
          state.team.push(name);
        } else {
          toast(
            "Your team already has five Cookies."
          );

          return;
        }

        saveGame();

        renderTeamEditor();
      });

      roster.appendChild(
        card
      );
    });

  $("#teamPowerText").textContent =
    formatNumber(
      teamPower()
    );

  $("#teamCountText").textContent =
    `${state.team.length} / 5`;
}

function setupTeamEditor() {
  $("#teamSearchInput")
    ?.addEventListener(
      "input",
      renderTeamEditor
    );

  $("#autoTeamButton")
    ?.addEventListener(
      "click",
      () => {
        state.team =
          [...state.ownedCookies]
            .sort(
              (a, b) =>
                cookieData(b).power -
                cookieData(a).power
            )
            .slice(0, 5);

        saveGame();

        renderTeamEditor();

        toast(
          "Strongest available team selected."
        );
      }
    );

  $("#clearTeamButton")
    ?.addEventListener(
      "click",
      () => {
        state.team = [];

        saveGame();

        renderTeamEditor();
      }
    );

  $("#confirmTeamButton")
    ?.addEventListener(
      "click",
      () => {
        if (state.team.length < 1) {
          toast(
            "Choose at least one Cookie."
          );

          return;
        }

        renderStageTeamPreview();

        saveGame();

        showScreen(
          "stageScreen"
        );

        toast(
          "Team saved."
        );
      }
    );
}

/* =========================================================
   ULTRA EXPANSION: BUILD DATA
========================================================= */

const BUILD_CATALOG = [
  {
    id: "cookie-house",
    category: "buildings",
    name: "Cookie House",
    costCoins: 2500,
    costWood: 0,
    costStone: 0,
    castle: 1,
    capacity: 4,
    roof: "#c65a50",
    body: "#e6c996"
  },

  {
    id: "fortune-farm",
    category: "buildings",
    name: "Fortune Farm",
    costCoins: 1000,
    costWood: 20,
    costStone: 0,
    castle: 1,
    capacity: 0,
    roof: "#d99743",
    body: "#e4c987"
  },

  {
    id: "lumber-mill",
    category: "buildings",
    name: "Lumber Mill",
    costCoins: 1200,
    costWood: 0,
    costStone: 20,
    castle: 1,
    capacity: 0,
    roof: "#8e5940",
    body: "#bc8c5c"
  },

  {
    id: "stone-quarry",
    category: "buildings",
    name: "Stone Quarry",
    costCoins: 2500,
    costWood: 75,
    costStone: 0,
    castle: 2,
    capacity: 0,
    roof: "#77758a",
    body: "#b4b0c1"
  },

  {
    id: "golden-bakery",
    category: "buildings",
    name: "Golden Bakery",
    costCoins: 5000,
    costWood: 100,
    costStone: 75,
    castle: 3,
    capacity: 0,
    roof: "#d86762",
    body: "#f0d39d"
  },

  {
    id: "golden-bank",
    category: "buildings",
    name: "Golden Bank",
    costCoins: 12000,
    costWood: 200,
    costStone: 150,
    castle: 5,
    capacity: 0,
    roof: "#e6bd4a",
    body: "#efe5bd"
  },

  {
    id: "academy",
    category: "buildings",
    name: "Money Academy",
    costCoins: 7500,
    costWood: 160,
    costStone: 120,
    castle: 4,
    capacity: 0,
    roof: "#5b84b7",
    body: "#e8dcc1"
  },

  {
    id: "concert-hall",
    category: "buildings",
    name: "Concert Hall",
    costCoins: 8200,
    costWood: 180,
    costStone: 130,
    castle: 4,
    capacity: 0,
    roof: "#8d63a8",
    body: "#ead8c5"
  },

  {
    id: "maple-tree",
    category: "nature",
    name: "Maple Tree",
    costCoins: 300,
    costWood: 0,
    costStone: 0,
    castle: 1,
    capacity: 0,
    roof: "#b9614f",
    body: "#70503a"
  },

  {
    id: "flower-garden",
    category: "nature",
    name: "Flower Garden",
    costCoins: 450,
    costWood: 0,
    costStone: 0,
    castle: 1,
    capacity: 0,
    roof: "#ec8fae",
    body: "#76a868"
  },

  {
    id: "fortune-lamp",
    category: "decor",
    name: "Fortune Lamp",
    costCoins: 650,
    costWood: 10,
    costStone: 5,
    castle: 2,
    capacity: 0,
    roof: "#e8bd55",
    body: "#44536a"
  },

  {
    id: "prospera-bench",
    category: "decor",
    name: "Prospera Bench",
    costCoins: 350,
    costWood: 12,
    costStone: 0,
    castle: 1,
    capacity: 0,
    roof: "#8b5c3d",
    body: "#66442f"
  },

  {
    id: "stone-path",
    category: "paths",
    name: "Stone Path",
    costCoins: 100,
    costWood: 0,
    costStone: 2,
    castle: 1,
    capacity: 0,
    roof: "#8c8892",
    body: "#aaa7b0"
  },

  {
    id: "gold-path",
    category: "paths",
    name: "Golden Path",
    costCoins: 700,
    costWood: 0,
    costStone: 5,
    castle: 3,
    capacity: 0,
    roof: "#d2a63e",
    body: "#f0cd69"
  },

  {
    id: "pond",
    category: "water",
    name: "Garden Pond",
    costCoins: 900,
    costWood: 0,
    costStone: 20,
    castle: 2,
    capacity: 0,
    roof: "#62bad6",
    body: "#348cae"
  },

  {
    id: "fountain",
    category: "water",
    name: "Prospera Fountain",
    costCoins: 2500,
    costWood: 0,
    costStone: 80,
    castle: 3,
    capacity: 0,
    roof: "#8cd5ec",
    body: "#c7d4d7"
  }
];

const buildRuntime = {
  category: state.buildCategory || "buildings",
  selectedItem: null,
  rotation: 0,
  x: 70,
  y: 70,
  valid: true
};

function buildItemById(id) {
  return (
    BUILD_CATALOG.find(
      (item) =>
        item.id === id
    ) ||
    BUILD_CATALOG[0]
  );
}

function renderBuildCatalog() {
  const catalog =
    $("#buildCatalog");

  if (!catalog) {
    return;
  }

  catalog.innerHTML =
    "";

  BUILD_CATALOG
    .filter(
      (item) =>
        item.category ===
        buildRuntime.category
    )
    .forEach((item) => {
      const locked =
        state.castleLevel <
        item.castle;

      const card =
        document.createElement(
          "button"
        );

      card.type =
        "button";

      card.className =
        `build-catalog-card ` +
        `${locked ? "locked" : ""} ` +
        `${
          buildRuntime.selectedItem === item.id
            ? "selected"
            : ""
        }`;

      card.innerHTML = `
        <div class="build-catalog-art">
          <div
            class="catalog-building-shape"
            style="
              --building-roof:${item.roof};
              --building-body:${item.body}
            "
          ></div>
        </div>

        <div class="build-catalog-copy">
          <strong>
            ${item.name}
          </strong>

          <span>
            ${item.costCoins.toLocaleString()} Coins ·
            ${item.costWood} Wood ·
            ${item.costStone} Stone
          </span>

          <small>
            ${
              locked
                ? `Requires Castle Lv. ${item.castle}`
                : item.capacity
                  ? `+${item.capacity} Residents`
                  : "Available"
            }
          </small>
        </div>
      `;

      card.addEventListener("click", () => {
        if (locked) {
          toast(
            `Upgrade Fortune Castle to Lv. ${item.castle}.`
          );

          return;
        }

        buildRuntime.selectedItem =
          item.id;

        buildRuntime.rotation =
          0;

        $("#buildPreviewTitle").textContent =
          item.name;

        $("#placementGhost").hidden =
          false;

        updatePlacementGhost();

        renderBuildCatalog();
      });

      catalog.appendChild(
        card
      );
    });
}

function renderPlacedBuildings() {
  const layer =
    $("#placedObjects");

  if (!layer) {
    return;
  }

  layer.innerHTML =
    "";

  (state.placedBuildings || []).forEach((building) => {
    const item =
      buildItemById(
        building.type
      );

    const el =
      document.createElement(
        "div"
      );

    el.className =
      "placed-object";

    el.style.left =
      `${building.x}%`;

    el.style.top =
      `${building.y}%`;

    el.style.transform =
      `translate(-50%, -50%) rotate(${building.rotation || 0}deg)`;

    el.innerHTML = `
      <div
        class="catalog-building-shape"
        style="
          --building-roof:${item.roof};
          --building-body:${item.body}
        "
      ></div>
    `;

    layer.appendChild(
      el
    );
  });
}

function updatePlacementGhost() {
  const ghost =
    $("#placementGhost");

  if (
    !ghost ||
    ghost.hidden ||
    !buildRuntime.selectedItem
  ) {
    return;
  }

  const item =
    buildItemById(
      buildRuntime.selectedItem
    );

  ghost.style.left =
    `${buildRuntime.x}%`;

  ghost.style.top =
    `${buildRuntime.y}%`;

  ghost.style.transform =
    `translate(-50%, -50%) rotate(${buildRuntime.rotation}deg)`;

  ghost.querySelector(
    ".placement-object-art"
  ).innerHTML = `
    <div
      class="catalog-building-shape"
      style="
        --building-roof:${item.roof};
        --building-body:${item.body}
      "
    ></div>
  `;

  buildRuntime.valid =
    buildRuntime.x > 7 &&
    buildRuntime.x < 94 &&
    buildRuntime.y > 15 &&
    buildRuntime.y < 92 &&
    !(
      buildRuntime.x > 39 &&
      buildRuntime.x < 62 &&
      buildRuntime.y < 42
    );

  ghost.classList.toggle(
    "invalid",
    !buildRuntime.valid
  );

  ghost.querySelector(
    ".placement-validity"
  ).textContent =
    buildRuntime.valid
      ? "Valid placement"
      : "Blocked area";

  $("#buildPreviewStatus").textContent =
    buildRuntime.valid
      ? "Ready"
      : "Blocked";
}

function canAffordBuild(item) {
  return (
    state.coins >= item.costCoins &&
    state.wood >= item.costWood &&
    state.stone >= item.costStone
  );
}

function confirmPlacement() {
  if (
    !buildRuntime.selectedItem ||
    !buildRuntime.valid
  ) {
    toast(
      "Choose a valid place first."
    );

    return;
  }

  const item =
    buildItemById(
      buildRuntime.selectedItem
    );

  if (!canAffordBuild(item)) {
    toast(
      "Not enough building materials."
    );

    return;
  }

  state.coins -=
    item.costCoins;

  state.wood -=
    item.costWood;

  state.stone -=
    item.costStone;

  state.placedBuildings =
    state.placedBuildings || [];

  state.placedBuildings.push({
    id:
      `${item.id}-${Date.now()}`,

    type:
      item.id,

    x:
      Math.round(
        buildRuntime.x * 10
      ) / 10,

    y:
      Math.round(
        buildRuntime.y * 10
      ) / 10,

    rotation:
      buildRuntime.rotation
  });

  if (item.capacity) {
    state.residentCapacity +=
      item.capacity;
  }

  saveGame();

  renderPlacedBuildings();

  refreshBuildResources();

  refreshKingdomStatus();

  toast(
    `${item.name} placed in Prospera.`
  );
}

function refreshBuildResources() {
  $("#buildCoinsText") &&
    ($("#buildCoinsText").textContent =
      formatNumber(state.coins));

  $("#buildWoodText") &&
    ($("#buildWoodText").textContent =
      formatNumber(state.wood));

  $("#buildStoneText") &&
    ($("#buildStoneText").textContent =
      formatNumber(state.stone));
}

function setupBuildStudio() {
  $("#buildCategoryTabs")?.addEventListener("click", (event) => {
    const button =
      event.target.closest(
        "button[data-category]"
      );

    if (!button) {
      return;
    }

    buildRuntime.category =
      button.dataset.category;

    state.buildCategory =
      buildRuntime.category;

    saveGame();

    $$("#buildCategoryTabs button").forEach((tab) => {
      tab.classList.toggle(
        "active",
        tab === button
      );
    });

    renderBuildCatalog();
  });

  $("#buildPlacementField")?.addEventListener("pointermove", (event) => {
    if (
      !buildRuntime.selectedItem ||
      $("#placementGhost")?.hidden
    ) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    buildRuntime.x =
      clamp(
        (
          (
            event.clientX -
            rect.left
          ) /
          rect.width
        ) *
        100,
        0,
        100
      );

    buildRuntime.y =
      clamp(
        (
          (
            event.clientY -
            rect.top
          ) /
          rect.height
        ) *
        100,
        0,
        100
      );

    updatePlacementGhost();
   });

  $("#buildPlacementField")?.addEventListener("click", (event) => {
    if (!buildRuntime.selectedItem || event.target.closest(".placed-object")) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    buildRuntime.x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    buildRuntime.y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    updatePlacementGhost();
  });

  $("#rotatePlacementButton")?.addEventListener("click", () => {
    buildRuntime.rotation = (buildRuntime.rotation + 90) % 360;
    updatePlacementGhost();
  });

  $("#cancelPlacementButton")?.addEventListener("click", () => {
    buildRuntime.selectedItem = null;
    $("#placementGhost").hidden = true;
    $("#buildPreviewTitle").textContent = "Choose an item";
    $("#buildPreviewStatus").textContent = "Ready";
    renderBuildCatalog();
  });

  $("#confirmPlacementButton")?.addEventListener("click", confirmPlacement);

  renderBuildCatalog();
  renderPlacedBuildings();
  refreshBuildResources();
}

/* =========================================================
   ULTRA EXPANSION: VICTORY SCREEN
========================================================= */

function createVictoryConfetti() {
  const layer = $("#victoryConfetti");

  if (!layer) {
    return;
  }

  layer.innerHTML = "";

  const colors = [
    "#ffd45c",
    "#7bd77c",
    "#72c3ec",
    "#e18ac6",
    "#f08b63"
  ];

  for (let index = 0; index < 56; index += 1) {
    const piece = document.createElement("i");

    piece.className = "victory-confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--confetti", randomFrom(colors));
    piece.style.setProperty("--duration", `${3.4 + Math.random() * 2.8}s`);
    piece.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
    piece.style.animationDelay = `${Math.random() * 1.2}s`;

    layer.appendChild(piece);
  }
}

function renderVictoryScreen(stage) {
  $("#victoryStageText").textContent =
    `Frostpeak Mountains · Stage 1-${stage}`;

  const team = $("#victoryTeam");

  team.innerHTML = "";

  state.team.slice(0, 5).forEach((name) => {
    const card = document.createElement("div");

    card.className = "victory-cookie";

    card.innerHTML = `
      ${miniCookieMarkup(name)}
      <strong>${name}</strong>
    `;

    team.appendChild(card);
  });

  createVictoryConfetti();
}

function setupVictoryScreen() {
  $("#victoryKingdomButton")?.addEventListener("click", () => {
    showScreen("kingdomScreen");
  });

  $("#victoryMapButton")?.addEventListener("click", () => {
    showScreen("worldScreen");
    renderStageRoute();
  });

  $("#victoryReplayButton")?.addEventListener("click", () => {
    startBattle(
      Math.max(
        1,
        state.currentStage - 1
      )
    );
  });

  $("#victoryNextButton")?.addEventListener("click", () => {
    openStage(state.currentStage);
  });
}

/* =========================================================
   ULTRA EXPANSION: EXTRA BATTLE IMPACTS
========================================================= */

function spawnBattleImpact(target, type = "slash") {
  const layer = $("#effectLayer");

  if (!layer || !target) {
    return;
  }

  const targetRect = target.getBoundingClientRect();
  const battleRect = $("#battleScreen").getBoundingClientRect();
  const effect = document.createElement("div");

  effect.className =
    type === "flash"
      ? "battle-impact-flash"
      : "battle-slash";

  effect.style.left =
    `${targetRect.left - battleRect.left + targetRect.width / 2}px`;

  effect.style.top =
    `${targetRect.top - battleRect.top + targetRect.height / 2}px`;

  layer.appendChild(effect);

  setTimeout(
    () => effect.remove(),
    400
  );
}

/* =========================================================
   VERSION 15K EXPANSION: CONTENT REGISTRY
========================================================= */

const EXPANDED_WORLD_LIBRARY = [
  {
    id: "world-01",
    name: "Empty Village",
    lesson: "Saving and earning",
    boss: "Shopping Beast",
    stages: 30,
    starTarget: 90,
    recommendedCastleLevel: 1,
    rewardMultiplier: 1.15,
    unlockedByDefault: true
  },

  {
    id: "world-02",
    name: "Debt Desert",
    lesson: "Debt and borrowing",
    boss: "Credit Card Dragon",
    stages: 30,
    starTarget: 90,
    recommendedCastleLevel: 2,
    rewardMultiplier: 1.30,
    unlockedByDefault: false
  },

  {
    id: "world-03",
    name: "Budget Forest",
    lesson: "Budgeting and needs versus wants",
    boss: "Impulse Stag",
    stages: 30,
    starTarget: 90,
    recommendedCastleLevel: 3,
    rewardMultiplier: 1.45,
    unlockedByDefault: false
  },

  {
    id: "world-04",
    name: "Risky Seas",
    lesson: "Scams, risk and protection",
    boss: "Scam Pirate Captain",
    stages: 30,
    starTarget: 90,
    recommendedCastleLevel: 4,
    rewardMultiplier: 1.60,
    unlockedByDefault: false
  },

  {
    id: "world-05",
    name: "Investment City",
    lesson: "Diversification and compounding",
    boss: "Panic Bear",
    stages: 30,
    starTarget: 90,
    recommendedCastleLevel: 5,
    rewardMultiplier: 1.75,
    unlockedByDefault: false
  },

  {
    id: "world-06",
    name: "Inflation Mountain",
    lesson: "Inflation and purchasing power",
    boss: "Lord Inflation",
    stages: 30,
    starTarget: 90,
    recommendedCastleLevel: 6,
    rewardMultiplier: 1.90,
    unlockedByDefault: false
  },

  {
    id: "world-07",
    name: "Forgotten Kingdom",
    lesson: "Lessons, mistakes and recovery",
    boss: "Shadow Treasurer",
    stages: 30,
    starTarget: 90,
    recommendedCastleLevel: 7,
    rewardMultiplier: 2.05,
    unlockedByDefault: false
  },

  {
    id: "world-08",
    name: "Republic of Cookies",
    lesson: "Community and cooperation",
    boss: "Harbor Leviathan",
    stages: 30,
    starTarget: 90,
    recommendedCastleLevel: 8,
    rewardMultiplier: 2.20,
    unlockedByDefault: false
  },

  {
    id: "world-09",
    name: "Sealed Dominion",
    lesson: "Ancient and Beast conflict",
    boss: "Fivefold Prison",
    stages: 30,
    starTarget: 90,
    recommendedCastleLevel: 9,
    rewardMultiplier: 2.35,
    unlockedByDefault: false
  },

  {
    id: "world-10",
    name: "Wonderlands",
    lesson: "Special and Guest stories",
    boss: "Dream Gate Keeper",
    stages: 30,
    starTarget: 90,
    recommendedCastleLevel: 10,
    rewardMultiplier: 2.50,
    unlockedByDefault: false
  }
];

const EXPANDED_BUILDING_LIBRARY = [
  {
    id: "cookie-house",
    name: "Cookie House",
    category: "housing",
    castleLevel: 1,
    cost: {
      coins: 2500,
      wood: 40,
      stone: 20
    },
    footprint: {
      width: 3,
      height: 4
    },
    buildTimeSeconds: 42,
    prosperity: 6,
    beauty: 1
  },

  {
    id: "fortune-farm",
    name: "Fortune Farm",
    category: "production",
    castleLevel: 1,
    cost: {
      coins: 1000,
      wood: 20,
      stone: 0
    },
    footprint: {
      width: 4,
      height: 2
    },
    buildTimeSeconds: 54,
    prosperity: 8,
    beauty: 2
  },

  {
    id: "lumber-mill",
    name: "Lumber Mill",
    category: "production",
    castleLevel: 1,
    cost: {
      coins: 1200,
      wood: 0,
      stone: 20
    },
    footprint: {
      width: 2,
      height: 3
    },
    buildTimeSeconds: 66,
    prosperity: 10,
    beauty: 3
  },

  {
    id: "stone-quarry",
    name: "Stone Quarry",
    category: "production",
    castleLevel: 2,
    cost: {
      coins: 2500,
      wood: 75,
      stone: 0
    },
    footprint: {
      width: 3,
      height: 4
    },
    buildTimeSeconds: 78,
    prosperity: 12,
    beauty: 4
  },

  {
    id: "golden-bakery",
    name: "Golden Bakery",
    category: "production",
    castleLevel: 2,
    cost: {
      coins: 5000,
      wood: 100,
      stone: 75
    },
    footprint: {
      width: 4,
      height: 2
    },
    buildTimeSeconds: 90,
    prosperity: 14,
    beauty: 0
  },

  {
    id: "golden-bank",
    name: "Golden Bank",
    category: "finance",
    castleLevel: 2,
    cost: {
      coins: 12000,
      wood: 200,
      stone: 150
    },
    footprint: {
      width: 2,
      height: 3
    },
    buildTimeSeconds: 102,
    prosperity: 16,
    beauty: 1
  },

  {
    id: "wisdom-academy",
    name: "Wisdom Academy",
    category: "research",
    castleLevel: 3,
    cost: {
      coins: 9000,
      wood: 140,
      stone: 120
    },
    footprint: {
      width: 3,
      height: 4
    },
    buildTimeSeconds: 114,
    prosperity: 18,
    beauty: 2
  },

  {
    id: "market-hall",
    name: "Market Hall",
    category: "trade",
    castleLevel: 3,
    cost: {
      coins: 7500,
      wood: 90,
      stone: 80
    },
    footprint: {
      width: 4,
      height: 2
    },
    buildTimeSeconds: 126,
    prosperity: 20,
    beauty: 3
  },

  {
    id: "concert-hall",
    name: "Concert Hall",
    category: "culture",
    castleLevel: 3,
    cost: {
      coins: 8500,
      wood: 110,
      stone: 95
    },
    footprint: {
      width: 2,
      height: 3
    },
    buildTimeSeconds: 138,
    prosperity: 22,
    beauty: 4
  },

  {
    id: "security-bureau",
    name: "Security Bureau",
    category: "protection",
    castleLevel: 4,
    cost: {
      coins: 10000,
      wood: 120,
      stone: 160
    },
    footprint: {
      width: 3,
      height: 4
    },
    buildTimeSeconds: 150,
    prosperity: 24,
    beauty: 0
  },

  {
    id: "community-hall",
    name: "Community Hall",
    category: "community",
    castleLevel: 4,
    cost: {
      coins: 6800,
      wood: 85,
      stone: 70
    },
    footprint: {
      width: 4,
      height: 2
    },
    buildTimeSeconds: 162,
    prosperity: 26,
    beauty: 1
  },

  {
    id: "investment-hall",
    name: "Investment Hall",
    category: "finance",
    castleLevel: 4,
    cost: {
      coins: 14500,
      wood: 180,
      stone: 180
    },
    footprint: {
      width: 2,
      height: 3
    },
    buildTimeSeconds: 174,
    prosperity: 28,
    beauty: 2
  },

  {
    id: "harbor-dock",
    name: "Harbor Dock",
    category: "trade",
    castleLevel: 5,
    cost: {
      coins: 12500,
      wood: 150,
      stone: 160
    },
    footprint: {
      width: 3,
      height: 4
    },
    buildTimeSeconds: 186,
    prosperity: 30,
    beauty: 3
  },

  {
    id: "windmill-workshop",
    name: "Windmill Workshop",
    category: "production",
    castleLevel: 5,
    cost: {
      coins: 7200,
      wood: 120,
      stone: 55
    },
    footprint: {
      width: 4,
      height: 2
    },
    buildTimeSeconds: 198,
    prosperity: 32,
    beauty: 4
  },

  {
    id: "garden-pavilion",
    name: "Garden Pavilion",
    category: "beauty",
    castleLevel: 5,
    cost: {
      coins: 4200,
      wood: 55,
      stone: 40
    },
    footprint: {
      width: 2,
      height: 3
    },
    buildTimeSeconds: 210,
    prosperity: 34,
    beauty: 0
  },

  {
    id: "crystal-fountain",
    name: "Crystal Fountain",
    category: "beauty",
    castleLevel: 6,
    cost: {
      coins: 6200,
      wood: 40,
      stone: 100
    },
    footprint: {
      width: 3,
      height: 4
    },
    buildTimeSeconds: 222,
    prosperity: 36,
    beauty: 1
  },

  {
    id: "festival-stage",
    name: "Festival Stage",
    category: "culture",
    castleLevel: 6,
    cost: {
      coins: 7800,
      wood: 100,
      stone: 70
    },
    footprint: {
      width: 4,
      height: 2
    },
    buildTimeSeconds: 234,
    prosperity: 38,
    beauty: 2
  },

  {
    id: "research-observatory",
    name: "Research Observatory",
    category: "research",
    castleLevel: 6,
    cost: {
      coins: 15500,
      wood: 190,
      stone: 210
    },
    footprint: {
      width: 2,
      height: 3
    },
    buildTimeSeconds: 246,
    prosperity: 40,
    beauty: 3
  },

  {
    id: "cookie-clinic",
    name: "Cookie Clinic",
    category: "care",
    castleLevel: 7,
    cost: {
      coins: 11000,
      wood: 120,
      stone: 150
    },
    footprint: {
      width: 3,
      height: 4
    },
    buildTimeSeconds: 258,
    prosperity: 42,
    beauty: 4
  },

  {
    id: "legacy-archive",
    name: "Legacy Archive",
    category: "story",
    castleLevel: 7,
    cost: {
      coins: 18000,
      wood: 220,
      stone: 240
    },
    footprint: {
      width: 4,
      height: 2
    },
    buildTimeSeconds: 270,
    prosperity: 44,
    beauty: 0
  }
];

/* =========================================================
   EXPANDED ENEMY LIBRARY
========================================================= */

const EXPANDED_ENEMY_LIBRARY = [
  {
    id: "enemy-01",
    name: "Frost Imp",
    maxHp: 88,
    attack: 11,
    defense: 2,
    speed: 0.88,
    element: "Earth",
    elite: false,
    rewardCoins: 37
  },

  {
    id: "enemy-02",
    name: "Snow Archer",
    maxHp: 106,
    attack: 14,
    defense: 3,
    speed: 0.96,
    element: "Wind",
    elite: false,
    rewardCoins: 49
  },

  {
    id: "enemy-03",
    name: "Ice Wolf",
    maxHp: 124,
    attack: 17,
    defense: 3,
    speed: 1.04,
    element: "Dark",
    elite: false,
    rewardCoins: 61
  },

  {
    id: "enemy-04",
    name: "Glacier Golem",
    maxHp: 142,
    attack: 20,
    defense: 4,
    speed: 1.12,
    element: "Fire",
    elite: false,
    rewardCoins: 73
  },

  {
    id: "enemy-05",
    name: "Mountain Bandit",
    maxHp: 160,
    attack: 23,
    defense: 4,
    speed: 1.20,
    element: "Arcane",
    elite: true,
    rewardCoins: 85
  },

  {
    id: "enemy-06",
    name: "Crystal Bat",
    maxHp: 178,
    attack: 26,
    defense: 5,
    speed: 0.80,
    element: "Ice",
    elite: false,
    rewardCoins: 97
  },

  {
    id: "enemy-07",
    name: "Snowdrift Slime",
    maxHp: 196,
    attack: 29,
    defense: 5,
    speed: 0.88,
    element: "Earth",
    elite: false,
    rewardCoins: 109
  },

  {
    id: "enemy-08",
    name: "Frost Mage",
    maxHp: 214,
    attack: 32,
    defense: 6,
    speed: 0.96,
    element: "Wind",
    elite: false,
    rewardCoins: 121
  },

  {
    id: "enemy-09",
    name: "Avalanche Brute",
    maxHp: 232,
    attack: 35,
    defense: 6,
    speed: 1.04,
    element: "Dark",
    elite: false,
    rewardCoins: 133
  },

  {
    id: "enemy-10",
    name: "Frozen Knight",
    maxHp: 250,
    attack: 38,
    defense: 7,
    speed: 1.12,
    element: "Fire",
    elite: true,
    rewardCoins: 145
  },

  {
    id: "enemy-11",
    name: "Debt Scorpion",
    maxHp: 268,
    attack: 41,
    defense: 7,
    speed: 1.20,
    element: "Arcane",
    elite: false,
    rewardCoins: 157
  },

  {
    id: "enemy-12",
    name: "Interest Wraith",
    maxHp: 286,
    attack: 44,
    defense: 8,
    speed: 0.80,
    element: "Ice",
    elite: false,
    rewardCoins: 169
  },

  {
    id: "enemy-13",
    name: "Impulse Imp",
    maxHp: 304,
    attack: 47,
    defense: 8,
    speed: 0.88,
    element: "Earth",
    elite: false,
    rewardCoins: 181
  },

  {
    id: "enemy-14",
    name: "Scam Gull",
    maxHp: 322,
    attack: 50,
    defense: 9,
    speed: 0.96,
    element: "Wind",
    elite: false,
    rewardCoins: 193
  },

  {
    id: "enemy-15",
    name: "Panic Bear",
    maxHp: 340,
    attack: 53,
    defense: 9,
    speed: 1.04,
    element: "Dark",
    elite: true,
    rewardCoins: 205
  },

  {
    id: "enemy-16",
    name: "Greedy Bull",
    maxHp: 358,
    attack: 56,
    defense: 10,
    speed: 1.12,
    element: "Fire",
    elite: false,
    rewardCoins: 217
  },

  {
    id: "enemy-17",
    name: "Inflation Ember",
    maxHp: 376,
    attack: 59,
    defense: 10,
    speed: 1.20,
    element: "Arcane",
    elite: false,
    rewardCoins: 229
  },

  {
    id: "enemy-18",
    name: "Shadow Collector",
    maxHp: 394,
    attack: 62,
    defense: 11,
    speed: 0.80,
    element: "Ice",
    elite: false,
    rewardCoins: 241
  },

  {
    id: "enemy-19",
    name: "Mirror Trickster",
    maxHp: 412,
    attack: 65,
    defense: 11,
    speed: 0.88,
    element: "Earth",
    elite: false,
    rewardCoins: 253
  },

  {
    id: "enemy-20",
    name: "Chain Guard",
    maxHp: 430,
    attack: 68,
    defense: 12,
    speed: 0.96,
    element: "Wind",
    elite: true,
    rewardCoins: 265
  },

  {
    id: "enemy-21",
    name: "Memory Moth",
    maxHp: 448,
    attack: 71,
    defense: 12,
    speed: 1.04,
    element: "Dark",
    elite: false,
    rewardCoins: 277
  },

  {
    id: "enemy-22",
    name: "Ruin Thorn",
    maxHp: 466,
    attack: 74,
    defense: 13,
    speed: 1.12,
    element: "Fire",
    elite: false,
    rewardCoins: 289
  },

  {
    id: "enemy-23",
    name: "Greedling",
    maxHp: 484,
    attack: 77,
    defense: 13,
    speed: 1.20,
    element: "Arcane",
    elite: false,
    rewardCoins: 301
  },

  {
    id: "enemy-24",
    name: "Oblivion Shade",
    maxHp: 502,
    attack: 80,
    defense: 14,
    speed: 0.80,
    element: "Ice",
    elite: false,
    rewardCoins: 313
  }
];

/* =========================================================
   EXPANDED QUEST LIBRARY
========================================================= */

const EXPANDED_QUEST_LIBRARY = [
  {
    id: "quest-001",
    title: "Prospera Quest 01",
    type: "battle",
    target: 2,
    reward: {
      coins: 390,
      gems: 6,
      expCandy: 2
    },
    description:
      "Complete objective 01 to help Prospera grow stronger."
  },

  {
    id: "quest-002",
    title: "Prospera Quest 02",
    type: "collect",
    target: 3,
    reward: {
      coins: 480,
      gems: 7,
      expCandy: 3
    },
    description:
      "Complete objective 02 to help Prospera grow stronger."
  },

  {
    id: "quest-003",
    title: "Prospera Quest 03",
    type: "upgrade",
    target: 4,
    reward: {
      coins: 570,
      gems: 8,
      expCandy: 4
    },
    description:
      "Complete objective 03 to help Prospera grow stronger."
  },

  {
    id: "quest-004",
    title: "Prospera Quest 04",
    type: "summon",
    target: 5,
    reward: {
      coins: 660,
      gems: 9,
      expCandy: 1
    },
    description:
      "Complete objective 04 to help Prospera grow stronger."
  },

  {
    id: "quest-005",
    title: "Prospera Quest 05",
    type: "produce",
    target: 6,
    reward: {
      coins: 750,
      gems: 10,
      expCandy: 2
    },
    description:
      "Complete objective 05 to help Prospera grow stronger."
  },

  {
    id: "quest-006",
    title: "Prospera Quest 06",
    type: "explore",
    target: 7,
    reward: {
      coins: 840,
      gems: 11,
      expCandy: 3
    },
    description:
      "Complete objective 06 to help Prospera grow stronger."
  },

  {
    id: "quest-007",
    title: "Prospera Quest 07",
    type: "friendship",
    target: 8,
    reward: {
      coins: 930,
      gems: 5,
      expCandy: 4
    },
    description:
      "Complete objective 07 to help Prospera grow stronger."
  },

  {
    id: "quest-008",
    title: "Prospera Quest 08",
    type: "build",
    target: 9,
    reward: {
      coins: 1020,
      gems: 6,
      expCandy: 1
    },
    description:
      "Complete objective 08 to help Prospera grow stronger."
  },

  {
    id: "quest-009",
    title: "Prospera Quest 09",
    type: "battle",
    target: 10,
    reward: {
      coins: 1110,
      gems: 7,
      expCandy: 2
    },
    description:
      "Complete objective 09 to help Prospera grow stronger."
  },

  {
    id: "quest-010",
    title: "Prospera Quest 10",
    type: "collect",
    target: 1,
    reward: {
      coins: 1200,
      gems: 8,
      expCandy: 3
    },
    description:
      "Complete objective 10 to help Prospera grow stronger."
  },

  {
    id: "quest-011",
    title: "Prospera Quest 11",
    type: "upgrade",
    target: 2,
    reward: {
      coins: 1290,
      gems: 9,
      expCandy: 4
    },
    description:
      "Complete objective 11 to help Prospera grow stronger."
  },

  {
    id: "quest-012",
    title: "Prospera Quest 12",
    type: "summon",
    target: 3,
    reward: {
      coins: 1380,
      gems: 10,
      expCandy: 1
    },
    description:
      "Complete objective 12 to help Prospera grow stronger."
  },

  {
    id: "quest-013",
    title: "Prospera Quest 13",
    type: "produce",
    target: 4,
    reward: {
      coins: 1470,
      gems: 11,
      expCandy: 2
    },
    description:
      "Complete objective 13 to help Prospera grow stronger."
  },

  {
    id: "quest-014",
    title: "Prospera Quest 14",
    type: "explore",
    target: 5,
    reward: {
      coins: 1560,
      gems: 5,
      expCandy: 3
    },
    description:
      "Complete objective 14 to help Prospera grow stronger."
  },

  {
    id: "quest-015",
    title: "Prospera Quest 15",
    type: "friendship",
    target: 6,
    reward: {
      coins: 1650,
      gems: 6,
      expCandy: 4
    },
    description:
      "Complete objective 15 to help Prospera grow stronger."
  },

  {
    id: "quest-016",
    title: "Prospera Quest 16",
    type: "build",
    target: 7,
    reward: {
      coins: 1740,
      gems: 7,
      expCandy: 1
    },
    description:
      "Complete objective 16 to help Prospera grow stronger."
  },

  {
    id: "quest-017",
    title: "Prospera Quest 17",
    type: "battle",
    target: 8,
    reward: {
      coins: 1830,
      gems: 8,
      expCandy: 2
    },
    description:
      "Complete objective 17 to help Prospera grow stronger."
  },

  {
    id: "quest-018",
    title: "Prospera Quest 18",
    type: "collect",
    target: 9,
    reward: {
      coins: 1920,
      gems: 9,
      expCandy: 3
    },
    description:
      "Complete objective 18 to help Prospera grow stronger."
  },

  {
    id: "quest-019",
    title: "Prospera Quest 19",
    type: "upgrade",
    target: 10,
    reward: {
      coins: 2010,
      gems: 10,
      expCandy: 4
    },
    description:
      "Complete objective 19 to help Prospera grow stronger."
  },

  {
    id: "quest-020",
    title: "Prospera Quest 20",
    type: "summon",
    target: 1,
    reward: {
      coins: 2100,
      gems: 11,
      expCandy: 1
    },
    description:
      "Complete objective 20 to help Prospera grow stronger."
  },

  {
    id: "quest-021",
    title: "Prospera Quest 21",
    type: "produce",
    target: 2,
    reward: {
      coins: 2190,
      gems: 5,
      expCandy: 2
    },
    description:
      "Complete objective 21 to help Prospera grow stronger."
  },

  {
    id: "quest-022",
    title: "Prospera Quest 22",
    type: "explore",
    target: 3,
    reward: {
      coins: 2280,
      gems: 6,
      expCandy: 3
    },
    description:
      "Complete objective 22 to help Prospera grow stronger."
  },

  {
    id: "quest-023",
    title: "Prospera Quest 23",
    type: "friendship",
    target: 4,
    reward: {
      coins: 2370,
      gems: 7,
      expCandy: 4
    },
    description:
      "Complete objective 23 to help Prospera grow stronger."
  },

  {
    id: "quest-024",
    title: "Prospera Quest 24",
    type: "build",
    target: 5,
    reward: {
      coins: 2460,
      gems: 8,
      expCandy: 1
    },
    description:
      "Complete objective 24 to help Prospera grow stronger."
  },

  {
    id: "quest-025",
    title: "Prospera Quest 25",
    type: "battle",
    target: 6,
    reward: {
      coins: 2550,
      gems: 9,
      expCandy: 2
    },
    description:
      "Complete objective 25 to help Prospera grow stronger."
  },

  {
    id: "quest-026",
    title: "Prospera Quest 26",
    type: "collect",
    target: 7,
    reward: {
      coins: 2640,
      gems: 10,
      expCandy: 3
    },
    description:
      "Complete objective 26 to help Prospera grow stronger."
  },

  {
    id: "quest-027",
    title: "Prospera Quest 27",
    type: "upgrade",
    target: 8,
    reward: {
      coins: 2730,
      gems: 11,
      expCandy: 4
    },
    description:
      "Complete objective 27 to help Prospera grow stronger."
  },

  {
    id: "quest-028",
    title: "Prospera Quest 28",
    type: "summon",
    target: 9,
    reward: {
      coins: 2820,
      gems: 5,
      expCandy: 1
    },
    description:
      "Complete objective 28 to help Prospera grow stronger."
  },

  {
    id: "quest-029",
    title: "Prospera Quest 29",
    type: "produce",
    target: 10,
    reward: {
      coins: 2910,
      gems: 6,
      expCandy: 2
    },
    description:
      "Complete objective 29 to help Prospera grow stronger."
  },

  {
    id: "quest-030",
    title: "Prospera Quest 30",
    type: "explore",
    target: 1,
    reward: {
      coins: 3000,
      gems: 7,
      expCandy: 3
    },
    description:
      "Complete objective 30 to help Prospera grow stronger."
  },

  {
    id: "quest-031",
    title: "Prospera Quest 31",
    type: "friendship",
    target: 2,
    reward: {
      coins: 3090,
      gems: 8,
      expCandy: 4
    },
    description:
      "Complete objective 31 to help Prospera grow stronger."
  },

  {
    id: "quest-032",
    title: "Prospera Quest 32",
    type: "build",
    target: 3,
    reward: {
      coins: 3180,
      gems: 9,
      expCandy: 1
    },
    description:
      "Complete objective 32 to help Prospera grow stronger."
  },

  {
    id: "quest-033",
    title: "Prospera Quest 33",
    type: "battle",
    target: 4,
    reward: {
      coins: 3270,
      gems: 10,
      expCandy: 2
    },
    description:
      "Complete objective 33 to help Prospera grow stronger."
  },

  {
    id: "quest-034",
    title: "Prospera Quest 34",
    type: "collect",
    target: 5,
    reward: {
      coins: 3360,
      gems: 11,
      expCandy: 3
    },
    description:
      "Complete objective 34 to help Prospera grow stronger."
  },

  {
    id: "quest-035",
    title: "Prospera Quest 35",
    type: "upgrade",
    target: 6,
    reward: {
      coins: 3450,
      gems: 5,
      expCandy: 4
    },
    description:
      "Complete objective 35 to help Prospera grow stronger."
  },

  {
    id: "quest-036",
    title: "Prospera Quest 36",
    type: "summon",
    target: 7,
    reward: {
      coins: 3540,
      gems: 6,
      expCandy: 1
    },
    description:
      "Complete objective 36 to help Prospera grow stronger."
  },

  {
    id: "quest-037",
    title: "Prospera Quest 37",
    type: "produce",
    target: 8,
    reward: {
      coins: 3630,
      gems: 7,
      expCandy: 2
    },
    description:
      "Complete objective 37 to help Prospera grow stronger."
  },

  {
    id: "quest-038",
    title: "Prospera Quest 38",
    type: "explore",
    target: 9,
    reward: {
      coins: 3720,
      gems: 8,
      expCandy: 3
    },
    description:
      "Complete objective 38 to help Prospera grow stronger."
  },

  {
    id: "quest-039",
    title: "Prospera Quest 39",
    type: "friendship",
    target: 10,
    reward: {
      coins: 3810,
      gems: 9,
      expCandy: 4
    },
    description:
      "Complete objective 39 to help Prospera grow stronger."
  },

  {
    id: "quest-040",
    title: "Prospera Quest 40",
    type: "build",
    target: 1,
    reward: {
      coins: 3900,
      gems: 10,
      expCandy: 1
    },
    description:
      "Complete objective 40 to help Prospera grow stronger."
  }
];

/* =========================================================
   ACHIEVEMENTS
========================================================= */

const EXPANDED_ACHIEVEMENT_LIBRARY = [
  {
    id: "achievement-001",
    name: "Kingdom Milestone 01",
    category: "cookies",
    threshold: 5,
    rewardGems: 23,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-002",
    name: "Kingdom Milestone 02",
    category: "adventure",
    threshold: 10,
    rewardGems: 26,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-003",
    name: "Kingdom Milestone 03",
    category: "wealth",
    threshold: 15,
    rewardGems: 29,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-004",
    name: "Kingdom Milestone 04",
    category: "community",
    threshold: 20,
    rewardGems: 32,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-005",
    name: "Kingdom Milestone 05",
    category: "kingdom",
    threshold: 25,
    rewardGems: 35,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-006",
    name: "Kingdom Milestone 06",
    category: "cookies",
    threshold: 30,
    rewardGems: 38,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-007",
    name: "Kingdom Milestone 07",
    category: "adventure",
    threshold: 35,
    rewardGems: 41,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-008",
    name: "Kingdom Milestone 08",
    category: "wealth",
    threshold: 40,
    rewardGems: 44,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-009",
    name: "Kingdom Milestone 09",
    category: "community",
    threshold: 45,
    rewardGems: 47,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-010",
    name: "Kingdom Milestone 10",
    category: "kingdom",
    threshold: 50,
    rewardGems: 50,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-011",
    name: "Kingdom Milestone 11",
    category: "cookies",
    threshold: 55,
    rewardGems: 53,
    secret: true,
    claimed: false
  },

  {
    id: "achievement-012",
    name: "Kingdom Milestone 12",
    category: "adventure",
    threshold: 60,
    rewardGems: 56,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-013",
    name: "Kingdom Milestone 13",
    category: "wealth",
    threshold: 65,
    rewardGems: 59,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-014",
    name: "Kingdom Milestone 14",
    category: "community",
    threshold: 70,
    rewardGems: 62,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-015",
    name: "Kingdom Milestone 15",
    category: "kingdom",
    threshold: 75,
    rewardGems: 65,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-016",
    name: "Kingdom Milestone 16",
    category: "cookies",
    threshold: 80,
    rewardGems: 68,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-017",
    name: "Kingdom Milestone 17",
    category: "adventure",
    threshold: 85,
    rewardGems: 71,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-018",
    name: "Kingdom Milestone 18",
    category: "wealth",
    threshold: 90,
    rewardGems: 74,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-019",
    name: "Kingdom Milestone 19",
    category: "community",
    threshold: 95,
    rewardGems: 77,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-020",
    name: "Kingdom Milestone 20",
    category: "kingdom",
    threshold: 100,
    rewardGems: 80,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-021",
    name: "Kingdom Milestone 21",
    category: "cookies",
    threshold: 105,
    rewardGems: 83,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-022",
    name: "Kingdom Milestone 22",
    category: "adventure",
    threshold: 110,
    rewardGems: 86,
    secret: true,
    claimed: false
  },

  {
    id: "achievement-023",
    name: "Kingdom Milestone 23",
    category: "wealth",
    threshold: 115,
    rewardGems: 89,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-024",
    name: "Kingdom Milestone 24",
    category: "community",
    threshold: 120,
    rewardGems: 92,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-025",
    name: "Kingdom Milestone 25",
    category: "kingdom",
    threshold: 125,
    rewardGems: 95,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-026",
    name: "Kingdom Milestone 26",
    category: "cookies",
    threshold: 130,
    rewardGems: 98,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-027",
    name: "Kingdom Milestone 27",
    category: "adventure",
    threshold: 135,
    rewardGems: 101,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-028",
    name: "Kingdom Milestone 28",
    category: "wealth",
    threshold: 140,
    rewardGems: 104,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-029",
    name: "Kingdom Milestone 29",
    category: "community",
    threshold: 145,
    rewardGems: 107,
    secret: false,
    claimed: false
  },

  {
    id: "achievement-030",
    name: "Kingdom Milestone 30",
    category: "kingdom",
    threshold: 150,
    rewardGems: 110,
    secret: false,
    claimed: false
  }
];

/* =========================================================
   EXPANDED STAGE LIBRARY
========================================================= */

const EXPANDED_STAGE_LIBRARY = {
  1: {
    id: "frostpeak-01",
    number: 1,
    title: "Frostpeak Stage 01",
    subtitle: "Across the Frozen Pass",
    type: "story",
    waves: 3,
    recommendedPower: 3740,
    energyCost: 4,
    weather: "snow",
    lesson:
      "Small habits compound over time.",
    firstClear: {
      coins: 435,
      wood: 6,
      stone: 3,
      expCandy: 1
    },
    enemyIds: [
      "enemy-02",
      "enemy-05"
    ],
    bossId: null,
    dialogueKey:
      "frostpeak-dialogue-01"
  },

  2: {
    id: "frostpeak-02",
    number: 2,
    title: "Frostpeak Stage 02",
    subtitle: "Echoes Beneath the Ice",
    type: "story",
    waves: 3,
    recommendedPower: 3980,
    energyCost: 4,
    weather: "wind",
    lesson:
      "Risk should be understood before it is accepted.",
    firstClear: {
      coins: 470,
      wood: 7,
      stone: 4,
      expCandy: 1
    },
    enemyIds: [
      "enemy-03",
      "enemy-06"
    ],
    bossId: null,
    dialogueKey:
      "frostpeak-dialogue-02"
  },

  3: {
    id: "frostpeak-03",
    number: 3,
    title: "Frostpeak Stage 03",
    subtitle: "The Summit Draws Near",
    type: "story",
    waves: 3,
    recommendedPower: 4220,
    energyCost: 4,
    weather: "mist",
    lesson:
      "A clear goal makes choices easier.",
    firstClear: {
      coins: 505,
      wood: 8,
      stone: 5,
      expCandy: 1
    },
    enemyIds: [
      "enemy-04",
      "enemy-07"
    ],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-03",
  },

  4: {
    id: "frostpeak-04",
    number: 4,
    title: "Frostpeak Stage 04",
    subtitle: "Footprints in the Snow",
    type: "story",
    waves: 3,
    recommendedPower: 4460,
    energyCost: 4,
    weather: "clear",
    lesson: "Preparation protects progress.",
    firstClear: {
      coins: 540,
      wood: 9,
      stone: 6,
      expCandy: 1,
    },
    enemyIds: ["enemy-05", "enemy-08"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-04",
  },

  5: {
    id: "frostpeak-05",
    number: 5,
    title: "Frostpeak Stage 05",
    subtitle: "Across the Frozen Pass",
    type: "story",
    waves: 3,
    recommendedPower: 4700,
    energyCost: 4,
    weather: "snow",
    lesson: "Small habits compound over time.",
    firstClear: {
      coins: 575,
      wood: 10,
      stone: 7,
      expCandy: 1,
    },
    enemyIds: ["enemy-06", "enemy-09"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-05",
  },

  6: {
    id: "frostpeak-06",
    number: 6,
    title: "Frostpeak Stage 06",
    subtitle: "Echoes Beneath the Ice",
    type: "story",
    waves: 3,
    recommendedPower: 4940,
    energyCost: 4,
    weather: "wind",
    lesson: "Risk should be understood before it is accepted.",
    firstClear: {
      coins: 610,
      wood: 11,
      stone: 2,
      expCandy: 1,
    },
    enemyIds: ["enemy-07", "enemy-10"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-06",
  },

  7: {
    id: "frostpeak-07",
    number: 7,
    title: "Frostpeak Stage 07",
    subtitle: "The Summit Draws Near",
    type: "story",
    waves: 3,
    recommendedPower: 5180,
    energyCost: 4,
    weather: "mist",
    lesson: "A clear goal makes choices easier.",
    firstClear: {
      coins: 645,
      wood: 12,
      stone: 3,
      expCandy: 1,
    },
    enemyIds: ["enemy-08", "enemy-11"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-07",
  },

  8: {
    id: "frostpeak-08",
    number: 8,
    title: "Frostpeak Stage 08",
    subtitle: "Footprints in the Snow",
    type: "story",
    waves: 3,
    recommendedPower: 5420,
    energyCost: 5,
    weather: "clear",
    lesson: "Preparation protects progress.",
    firstClear: {
      coins: 680,
      wood: 13,
      stone: 4,
      expCandy: 1,
    },
    enemyIds: ["enemy-01", "enemy-12"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-08",
  },

  9: {
    id: "frostpeak-09",
    number: 9,
    title: "Frostpeak Stage 09",
    subtitle: "Across the Frozen Pass",
    type: "story",
    waves: 3,
    recommendedPower: 5660,
    energyCost: 5,
    weather: "snow",
    lesson: "Small habits compound over time.",
    firstClear: {
      coins: 715,
      wood: 5,
      stone: 5,
      expCandy: 1,
    },
    enemyIds: ["enemy-02", "enemy-01"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-09",
  },

  10: {
    id: "frostpeak-10",
    number: 10,
    title: "Frostpeak Stage 10",
    subtitle: "Echoes Beneath the Ice",
    type: "mini-boss",
    waves: 6,
    recommendedPower: 5900,
    energyCost: 5,
    weather: "wind",
    lesson: "Risk should be understood before it is accepted.",
    firstClear: {
      coins: 750,
      wood: 6,
      stone: 6,
      expCandy: 2,
    },
    enemyIds: ["enemy-03", "enemy-02"],
    bossId: "enemy-20",
    dialogueKey: "frostpeak-dialogue-10",
  },

  11: {
    id: "frostpeak-11",
    number: 11,
    title: "Frostpeak Stage 11",
    subtitle: "The Summit Draws Near",
    type: "story",
    waves: 3,
    recommendedPower: 6140,
    energyCost: 5,
    weather: "mist",
    lesson: "A clear goal makes choices easier.",
    firstClear: {
      coins: 785,
      wood: 7,
      stone: 7,
      expCandy: 2,
    },
    enemyIds: ["enemy-04", "enemy-03"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-11",
  },

  12: {
    id: "frostpeak-12",
    number: 12,
    title: "Frostpeak Stage 12",
    subtitle: "Footprints in the Snow",
    type: "story",
    waves: 3,
    recommendedPower: 6380,
    energyCost: 5,
    weather: "clear",
    lesson: "Preparation protects progress.",
    firstClear: {
      coins: 820,
      wood: 8,
      stone: 2,
      expCandy: 2,
    },
    enemyIds: ["enemy-05", "enemy-04"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-12",
  },

  13: {
    id: "frostpeak-13",
    number: 13,
    title: "Frostpeak Stage 13",
    subtitle: "Across the Frozen Pass",
    type: "story",
    waves: 3,
    recommendedPower: 6620,
    energyCost: 5,
    weather: "snow",
    lesson: "Small habits compound over time.",
    firstClear: {
      coins: 855,
      wood: 9,
      stone: 3,
      expCandy: 2,
    },
    enemyIds: ["enemy-06", "enemy-05"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-13",
  },

  14: {
    id: "frostpeak-14",
    number: 14,
    title: "Frostpeak Stage 14",
    subtitle: "Echoes Beneath the Ice",
    type: "story",
    waves: 3,
    recommendedPower: 6860,
    energyCost: 5,
    weather: "wind",
    lesson: "Risk should be understood before it is accepted.",
    firstClear: {
      coins: 890,
      wood: 10,
      stone: 4,
      expCandy: 2,
    },
    enemyIds: ["enemy-07", "enemy-06"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-14",
  },

  15: {
    id: "frostpeak-15",
    number: 15,
    title: "Frostpeak Stage 15",
    subtitle: "The Summit Draws Near",
    type: "story",
    waves: 4,
    recommendedPower: 7100,
    energyCost: 5,
    weather: "mist",
    lesson: "A clear goal makes choices easier.",
    firstClear: {
      coins: 925,
      wood: 11,
      stone: 5,
      expCandy: 2,
    },
    enemyIds: ["enemy-08", "enemy-07"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-15",
  },

  16: {
    id: "frostpeak-16",
    number: 16,
    title: "Frostpeak Stage 16",
    subtitle: "Footprints in the Snow",
    type: "story",
    waves: 4,
    recommendedPower: 7340,
    energyCost: 6,
    weather: "clear",
    lesson: "Preparation protects progress.",
    firstClear: {
      coins: 960,
      wood: 12,
      stone: 6,
      expCandy: 2,
    },
    enemyIds: ["enemy-01", "enemy-08"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-16",
  },

  17: {
    id: "frostpeak-17",
    number: 17,
    title: "Frostpeak Stage 17",
    subtitle: "Across the Frozen Pass",
    type: "story",
    waves: 4,
    recommendedPower: 7580,
    energyCost: 6,
    weather: "snow",
    lesson: "Small habits compound over time.",
    firstClear: {
      coins: 995,
      wood: 13,
      stone: 7,
      expCandy: 2,
    },
    enemyIds: ["enemy-02", "enemy-09"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-17",
  },

  18: {
    id: "frostpeak-18",
    number: 18,
    title: "Frostpeak Stage 18",
    subtitle: "Echoes Beneath the Ice",
    type: "story",
    waves: 4,
    recommendedPower: 7820,
    energyCost: 6,
    weather: "wind",
    lesson: "Risk should be understood before it is accepted.",
    firstClear: {
      coins: 1030,
      wood: 5,
      stone: 2,
      expCandy: 2,
    },
    enemyIds: ["enemy-03", "enemy-10"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-18",
  },

  19: {
    id: "frostpeak-19",
    number: 19,
    title: "Frostpeak Stage 19",
    subtitle: "The Summit Draws Near",
    type: "story",
    waves: 4,
    recommendedPower: 8060,
    energyCost: 6,
    weather: "mist",
    lesson: "A clear goal makes choices easier.",
    firstClear: {
      coins: 1065,
      wood: 6,
      stone: 3,
      expCandy: 2,
    },
    enemyIds: ["enemy-04", "enemy-11"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-19",
  },

  20: {
    id: "frostpeak-20",
    number: 20,
    title: "Frostpeak Stage 20",
    subtitle: "Footprints in the Snow",
    type: "story-boss",
    waves: 7,
    recommendedPower: 8300,
    energyCost: 6,
    weather: "clear",
    lesson: "Preparation protects progress.",
    firstClear: {
      coins: 1100,
      wood: 7,
      stone: 4,
      expCandy: 3,
    },
    enemyIds: ["enemy-05", "enemy-12"],
    bossId: "enemy-16",
    dialogueKey: "frostpeak-dialogue-20",
  },

  21: {
    id: "frostpeak-21",
    number: 21,
    title: "Frostpeak Stage 21",
    subtitle: "Across the Frozen Pass",
    type: "story",
    waves: 4,
    recommendedPower: 8540,
    energyCost: 6,
    weather: "snow",
    lesson: "Small habits compound over time.",
    firstClear: {
      coins: 1135,
      wood: 8,
      stone: 5,
      expCandy: 3,
    },
    enemyIds: ["enemy-06", "enemy-01"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-21",
  },

  22: {
    id: "frostpeak-22",
    number: 22,
    title: "Frostpeak Stage 22",
    subtitle: "Echoes Beneath the Ice",
    type: "story",
    waves: 4,
    recommendedPower: 8780,
    energyCost: 6,
    weather: "wind",
    lesson: "Risk should be understood before it is accepted.",
    firstClear: {
      coins: 1170,
      wood: 9,
      stone: 6,
      expCandy: 3,
    },
    enemyIds: ["enemy-07", "enemy-02"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-22",
  },

  23: {
    id: "frostpeak-23",
    number: 23,
    title: "Frostpeak Stage 23",
    subtitle: "The Summit Draws Near",
    type: "story",
    waves: 4,
    recommendedPower: 9020,
    energyCost: 6,
    weather: "mist",
    lesson: "A clear goal makes choices easier.",
    firstClear: {
      coins: 1205,
      wood: 10,
      stone: 7,
      expCandy: 3,
    },
    enemyIds: ["enemy-08", "enemy-03"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-23",
  },

  24: {
    id: "frostpeak-24",
    number: 24,
    title: "Frostpeak Stage 24",
    subtitle: "Footprints in the Snow",
    type: "story",
    waves: 4,
    recommendedPower: 9260,
    energyCost: 7,
    weather: "clear",
    lesson: "Preparation protects progress.",
    firstClear: {
      coins: 1240,
      wood: 11,
      stone: 2,
      expCandy: 3,
    },
    enemyIds: ["enemy-01", "enemy-04"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-24",
  },

  25: {
    id: "frostpeak-25",
    number: 25,
    title: "Frostpeak Stage 25",
    subtitle: "Across the Frozen Pass",
    type: "story",
    waves: 5,
    recommendedPower: 9500,
    energyCost: 7,
    weather: "snow",
    lesson: "Small habits compound over time.",
    firstClear: {
      coins: 1275,
      wood: 12,
      stone: 3,
      expCandy: 3,
    },
    enemyIds: ["enemy-02", "enemy-05"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-25",
  },

  26: {
    id: "frostpeak-26",
    number: 26,
    title: "Frostpeak Stage 26",
    subtitle: "Echoes Beneath the Ice",
    type: "story",
    waves: 5,
    recommendedPower: 9740,
    energyCost: 7,
    weather: "wind",
    lesson: "Risk should be understood before it is accepted.",
    firstClear: {
      coins: 1310,
      wood: 13,
      stone: 4,
      expCandy: 3,
    },
    enemyIds: ["enemy-03", "enemy-06"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-26",
  },

  27: {
    id: "frostpeak-27",
    number: 27,
    title: "Frostpeak Stage 27",
    subtitle: "The Summit Draws Near",
    type: "story",
    waves: 5,
    recommendedPower: 9980,
    energyCost: 7,
    weather: "mist",
    lesson: "A clear goal makes choices easier.",
    firstClear: {
      coins: 1345,
      wood: 5,
      stone: 5,
      expCandy: 3,
    },
    enemyIds: ["enemy-04", "enemy-07"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-27",
  },

  28: {
    id: "frostpeak-28",
    number: 28,
    title: "Frostpeak Stage 28",
    subtitle: "Footprints in the Snow",
    type: "story",
    waves: 5,
    recommendedPower: 10220,
    energyCost: 7,
    weather: "clear",
    lesson: "Preparation protects progress.",
    firstClear: {
      coins: 1380,
      wood: 6,
      stone: 6,
      expCandy: 3,
    },
    enemyIds: ["enemy-05", "enemy-08"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-28",
  },

  29: {
    id: "frostpeak-29",
    number: 29,
    title: "Frostpeak Stage 29",
    subtitle: "Across the Frozen Pass",
    type: "story",
    waves: 5,
    recommendedPower: 10460,
    energyCost: 7,
    weather: "snow",
    lesson: "Small habits compound over time.",
    firstClear: {
      coins: 1415,
      wood: 7,
      stone: 7,
      expCandy: 3,
    },
    enemyIds: ["enemy-06", "enemy-09"],
    bossId: null,
    dialogueKey: "frostpeak-dialogue-29",
  },

  30: {
    id: "frostpeak-30",
    number: 30,
    title: "Frostpeak Stage 30",
    subtitle: "Echoes Beneath the Ice",
    type: "world-boss",
    waves: 8,
    recommendedPower: 10700,
    energyCost: 7,
    weather: "wind",
    lesson: "Risk should be understood before it is accepted.",
    firstClear: {
      coins: 1450,
      wood: 8,
      stone: 2,
      expCandy: 4,
    },
    enemyIds: ["enemy-07", "enemy-10"],
    bossId: "enemy-12",
    dialogueKey: "frostpeak-dialogue-30",
  },
};

const EXPANDED_DIALOGUE_LIBRARY = {
  "frostpeak-dialogue-01": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 01. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-02": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 02. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-03": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 03. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-04": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 04. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-05": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 05. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-06": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 06. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-07": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 07. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-08": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 08. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-09": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 09. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-10": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 10. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-11": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 11. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-12": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 12. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-13": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 13. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-14": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 14. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-15": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 15. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-16": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 16. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-17": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 17. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-18": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 18. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-19": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 19. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-20": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 20. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-21": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 21. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-22": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 22. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-23": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 23. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-24": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 24. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-25": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 25. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-26": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 26. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-27": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 27. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-28": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 28. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-29": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 29. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],

  "frostpeak-dialogue-30": [
    { speaker: "Coin Cookie", emotion: "focused", text: "Stage 30. Keep close and watch the trail." },
    { speaker: "Dollar Cookie", emotion: "bright", text: "We made it this far. Prospera is counting on us!" },
    { speaker: "Banker Cookie", emotion: "calm", text: "Resources first, risks second. We move carefully." },
  ],
};

/* =========================================================
   VERSION 15K EXPANSION: CONTENT ACCESSORS
========================================================= */

function getExpandedWorld(worldId) {
  return EXPANDED_WORLD_LIBRARY.find((world) => world.id === worldId) || null;
}

function getExpandedBuilding(buildingId) {
  return EXPANDED_BUILDING_LIBRARY.find((building) => building.id === buildingId) || null;
}

function getExpandedEnemy(enemyId) {
  return EXPANDED_ENEMY_LIBRARY.find((enemy) => enemy.id === enemyId) || null;
}

function getExpandedQuest(questId) {
  return EXPANDED_QUEST_LIBRARY.find((quest) => quest.id === questId) || null;
}

function getExpandedAchievement(achievementId) {
  return EXPANDED_ACHIEVEMENT_LIBRARY.find((achievement) => achievement.id === achievementId) || null;
}

function getExpandedStage(stageNumber) {
  return EXPANDED_STAGE_LIBRARY[Number(stageNumber)] || null;
}

function getExpandedDialogue(dialogueKey) {
  return EXPANDED_DIALOGUE_LIBRARY[dialogueKey] || [];
}

function calculateExpandedBuildingCost(buildingId, level = 1) {
  const building = getExpandedBuilding(buildingId);

  if (!building) {
    return null;
  }

  const multiplier =
    1 +
    Math.max(
      0,
      Number(level) - 1
    ) *
    0.42;

  return {
    coins:
      Math.round(
        building.cost.coins *
        multiplier
      ),

    wood:
      Math.round(
        building.cost.wood *
        multiplier
      ),

    stone:
      Math.round(
        building.cost.stone *
        multiplier
      ),
  };
}

function calculateExpandedEnemyStats(
  enemyId,
  stageNumber = 1,
  wave = 1
) {
  const enemy =
    getExpandedEnemy(enemyId);

  if (!enemy) {
    return null;
  }

  const stageScale =
    1 +
    Math.max(
      0,
      stageNumber - 1
    ) *
    0.055;

  const waveScale =
    1 +
    Math.max(
      0,
      wave - 1
    ) *
    0.09;

  return {
    maxHp:
      Math.round(
        enemy.maxHp *
        stageScale *
        waveScale
      ),

    attack:
      Math.round(
        enemy.attack *
        stageScale *
        waveScale
      ),

    defense:
      Math.round(
        enemy.defense *
        (
          1 +
          (
            stageNumber -
            1
          ) *
          0.025
        )
      ),

    speed:
      enemy.speed,
  };
}

function calculateExpandedQuestProgress(
  quest,
  metrics = {}
) {
  if (!quest) {
    return {
      current: 0,
      target: 1,
      ratio: 0
    };
  }

  const current =
    Number(
      metrics[
        quest.type
      ] ||
      0
    );

  const target =
    Math.max(
      1,
      Number(
        quest.target ||
        1
      )
    );

  return {
    current:
      Math.min(
        current,
        target
      ),

    target,

    ratio:
      clamp(
        current /
        target,
        0,
        1
      ),
  };
}

function calculateExpandedStarTotal() {
  return Object.values(
    state.completedStages ||
    {}
  ).reduce(
    (
      sum,
      clearData
    ) => {
      if (
        clearData ===
        true
      ) {
        return sum + 3;
      }

      if (
        clearData &&
        typeof clearData ===
          "object"
      ) {
        return (
          sum +
          Number(
            clearData.stars ||
            3
          )
        );
      }

      return sum;
    },
    0
  );
}

function getExpandedUnlockedWorlds() {
  const stars =
    calculateExpandedStarTotal();

  return EXPANDED_WORLD_LIBRARY.filter(
    (
      world,
      index
    ) => {
      if (
        index ===
        0
      ) {
        return true;
      }

      return (
        stars >=
          index * 45 ||
        state.castleLevel >=
          world.recommendedCastleLevel
      );
    }
  );
}

function getExpandedAvailableBuildings() {
  return EXPANDED_BUILDING_LIBRARY.filter(
    (building) => {
      return (
        state.castleLevel >=
        building.castleLevel
      );
    }
  );
}

function getExpandedLockedBuildings() {
  return EXPANDED_BUILDING_LIBRARY.filter(
    (building) => {
      return (
        state.castleLevel <
        building.castleLevel
      );
    }
  );
}

function getExpandedStageReward(
  stageNumber,
  repeatClear = false
) {
  const stage =
    getExpandedStage(
      stageNumber
    );

  if (!stage) {
    return {
      coins: 0,
      wood: 0,
      stone: 0,
      expCandy: 0
    };
  }

  const scale =
    repeatClear
      ? 0.45
      : 1;

  return {
    coins:
      Math.round(
        stage.firstClear.coins *
        scale
      ),

    wood:
      Math.round(
        stage.firstClear.wood *
        scale
      ),

    stone:
      Math.round(
        stage.firstClear.stone *
        scale
      ),

    expCandy:
      repeatClear
        ? 0
        : stage.firstClear.expCandy,
  };
}

function expandedCanAffordBuilding(
  buildingId,
  level = 1
) {
  const cost =
    calculateExpandedBuildingCost(
      buildingId,
      level
    );

  if (!cost) {
    return false;
  }

  return (
    state.coins >=
      cost.coins &&
    state.wood >=
      cost.wood &&
    state.stone >=
      cost.stone
  );
}

function expandedSpendBuildingCost(
  buildingId,
  level = 1
) {
  const cost =
    calculateExpandedBuildingCost(
      buildingId,
      level
    );

  if (
    !cost ||
    !expandedCanAffordBuilding(
      buildingId,
      level
    )
  ) {
    return false;
  }

  state.coins -=
    cost.coins;

  state.wood -=
    cost.wood;

  state.stone -=
    cost.stone;

  saveGame();

  return true;
}

function expandedGrantReward(
  reward = {}
) {
  state.coins +=
    Number(
      reward.coins ||
      0
    );

  state.gems +=
    Number(
      reward.gems ||
      0
    );

  state.wood +=
    Number(
      reward.wood ||
      0
    );

  state.stone +=
    Number(
      reward.stone ||
      0
    );

  state.expCandy +=
    Number(
      reward.expCandy ||
      0
    );

  saveGame();
}

function expandedNormalizeTeam(
  team = state.team
) {
  const owned =
    new Set(
      state.ownedCookies ||
      []
    );

  const unique =
    [];

  for (
    const name of team
  ) {
    if (
      owned.has(name) &&
      !unique.includes(name)
    ) {
      unique.push(name);
    }

    if (
      unique.length >=
      5
    ) {
      break;
    }
  }

  for (
    const name of
    state.ownedCookies ||
    []
  ) {
    if (
      !unique.includes(name)
    ) {
      unique.push(name);
    }

    if (
      unique.length >=
      5
    ) {
      break;
    }
  }

  return unique;
}

function expandedSaveTeam(team) {
  state.team =
    expandedNormalizeTeam(
      team
    );

  saveGame();

  renderStageTeamPreview();
  renderTeamEditor();

  return [
    ...state.team
  ];
}

function expandedGetRosterSummary() {
  const summary = {};

  for (
    const name of
    state.ownedCookies ||
    []
  ) {
    const cookie =
      COOKIE_DATA[name];

    const rarity =
      cookie?.rarity ||
      "UNKNOWN";

    summary[rarity] =
      (
        summary[rarity] ||
        0
      ) +
      1;
  }

  return summary;
}

function expandedGetKingdomValue() {
  const buildingValue =
    (
      state.placedBuildings ||
      []
    ).reduce(
      (
        sum,
        placed
      ) => {
        const definition =
          getExpandedBuilding(
            placed.type
          );

        return (
          sum +
          Number(
            definition?.cost?.coins ||
            0
          )
        );
      },
      0
    );

  const cookieValue =
    (
      state.ownedCookies ||
      []
    ).reduce(
      (
        sum,
        name
      ) => {
        return (
          sum +
          Number(
            COOKIE_DATA[
              name
            ]?.power ||
            0
          ) *
          12
        );
      },
      0
    );

  return (
    state.coins +
    buildingValue +
    cookieValue
  );
}

function expandedGetDailyGoalSeed() {
  const now =
    new Date();

  return Number(
    `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    )}${String(
      now.getDate()
    ).padStart(
      2,
      "0"
    )}`
  );
}

function expandedDailyQuestSelection(
  count = 5
) {
  const seed =
    expandedGetDailyGoalSeed();

  return [
    ...EXPANDED_QUEST_LIBRARY
  ]
    .sort(
      (
        a,
        b
      ) =>
        (
          (
            a.id.length *
            seed
          ) %
          97
        ) -
          (
            (
              b.id.length *
              seed
            ) %
            97
          ) ||
        a.id.localeCompare(
          b.id
        )
    )
    .slice(
      0,
      clamp(
        count,
        1,
        8
      )
    );
}

function expandedWorldCompletion(
  worldId
) {
  const world =
    getExpandedWorld(
      worldId
    );

  if (!world) {
    return {
      cleared: 0,
      stages: 0,
      ratio: 0
    };
  }

  const cleared =
    Object.keys(
      state.completedStages ||
      {}
    ).filter(
      (key) =>
        Boolean(
          state.completedStages[
            key
          ]
        )
    ).length;

  return {
    cleared:
      Math.min(
        cleared,
        world.stages
      ),

    stages:
      world.stages,

    ratio:
      clamp(
        cleared /
        world.stages,
        0,
        1
      ),
  };
}

function expandedStageWavePlan(
  stageNumber
) {
  const stage =
    getExpandedStage(
      stageNumber
    );

  if (!stage) {
    return [];
  }

  return Array.from(
    {
      length:
        stage.waves
    },
    (
      _,
      index
    ) => {
      const wave =
        index + 1;

      const isFinal =
        wave ===
        stage.waves;

      return {
        wave,

        type:
          isFinal &&
          stage.bossId
            ? "boss"
            : wave %
                3 ===
              0
              ? "elite"
              : "normal",

        enemyCount:
          isFinal &&
          stage.bossId
            ? 1
            : clamp(
                2 +
                  Math.floor(
                    wave /
                    2
                  ),
                2,
                5
              ),

        enemyIds: [
          ...stage.enemyIds
        ],

        bossId:
          isFinal
            ? stage.bossId
            : null,
      };
    }
  );
}

function expandedResolveDialogue(
  stageNumber
) {
  const stage =
    getExpandedStage(
      stageNumber
    );

  return stage
    ? getExpandedDialogue(
        stage.dialogueKey
      )
    : [];
}

function expandedEstimateStageDuration(
  stageNumber
) {
  const plan =
    expandedStageWavePlan(
      stageNumber
    );

  return plan.reduce(
    (
      seconds,
      wave
    ) => {
      return (
        seconds +
        7 +
        wave.enemyCount *
          2.8 +
        (
          wave.type ===
          "boss"
            ? 18
            : 0
        )
      );
    },
    0
  );
}

function expandedDescribeStage(
  stageNumber
) {
  const stage =
    getExpandedStage(
      stageNumber
    );

  if (!stage) {
    return "Unknown stage";
  }

  return (
    `${stage.title} · ` +
    `${stage.waves} waves · ` +
    `Recommended Power ${formatNumber(
      stage.recommendedPower
    )}`
  );
}

function expandedDescribeBuilding(
  buildingId
) {
  const building =
    getExpandedBuilding(
      buildingId
    );

  if (!building) {
    return "Unknown building";
  }

  const cost =
    calculateExpandedBuildingCost(
      buildingId,
      1
    );

  return (
    `${building.name} · ` +
    `Castle Lv. ${building.castleLevel} · ` +
    `${formatNumber(
      cost.coins
    )} coins`
  );
}

function expandedContentDiagnostics() {
  return {
    worlds:
      EXPANDED_WORLD_LIBRARY.length,

    buildings:
      EXPANDED_BUILDING_LIBRARY.length,

    enemies:
      EXPANDED_ENEMY_LIBRARY.length,

    quests:
      EXPANDED_QUEST_LIBRARY.length,

    achievements:
      EXPANDED_ACHIEVEMENT_LIBRARY.length,

    stages:
      Object.keys(
        EXPANDED_STAGE_LIBRARY
      ).length,

    dialogues:
      Object.keys(
        EXPANDED_DIALOGUE_LIBRARY
      ).length,
  };
}

/* =========================================================
   HIDDEN EASTER EGG SYSTEM
========================================================= */

const EASTER_EGG_LIBRARY = {
  "konami-fortune": {
    title: "Ancient Fortune",
    message: "An old sequence wakes the Fortune Tree.",
    reward: {
      gems: 88,
      tickets: 3
    }
  },

  "word-prospera": {
    title: "Prospera Remembers",
    message: "The kingdom answers its own name.",
    reward: {
      coins: 888
    }
  },

  "word-fortune": {
    title: "Fortune Whisper",
    message: "A golden leaf drifts from somewhere unseen.",
    reward: {
      tickets: 1
    }
  },

  "word-compound": {
    title: "The Eighth Wonder",
    message: "Tiny gains begin stacking on top of tiny gains.",
    reward: {
      coins: 1888,
      expCandy: 2
    }
  },

  "word-balance": {
    title: "Perfect Balance",
    message: "For one moment, every scale in Prospera becomes still.",
    reward: {
      gems: 18
    }
  },

  "word-legacy": {
    title: "What We Leave Behind",
    message: "A forgotten page returns to the Legacy Archive.",
    reward: {
      coins: 700
    }
  },

  "word-freedom": {
    title: "Open Sky",
    message: "The flags above Prospera suddenly catch a warm wind.",
    reward: {
      gems: 12
    }
  },

  "word-truth": {
    title: "Clear Numbers",
    message: "Every ledger line seems unusually easy to read.",
    reward: {
      coins: 500
    }
  },

  "word-bloom": {
    title: "Golden Bloom",
    message: "A flower opens where no flower was planted.",
    reward: {
      wood: 25
    }
  },

  "word-lucky": {
    title: "Lucky Was Listening",
    message: "Lucky Cookie definitely heard that.",
    reward: {
      tickets: 1
    }
  },

  "word-kindness": {
    title: "Quiet Wealth",
    message: "The richest thing in the kingdom was never stored in the vault.",
    reward: {
      gems: 25
    }
  },

  "word-moneykingdom": {
    title: "Developer's Door",
    message: "For a second, you can almost see the game behind the game.",
    reward: {
      coins: 1000
    }
  },

  "word-growwithbecca": {
    title: "Golden Mentor",
    message: "A tiny golden signature appears, then fades into the castle wall.",
    reward: {
      coins: 8888,
      gems: 38
    }
  },

  "castle-seven": {
    title: "Seven Bells",
    message: "The castle bell rings seven times, even though nobody pulled the rope.",
    reward: {
      stone: 17
    }
  },

  "residents-five": {
    title: "Everybody's Home",
    message: "Five taps, five windows, five tiny lights turn on.",
    reward: {
      coins: 555
    }
  },

  "phase-six": {
    title: "Time Keeper",
    message: "Morning, day, evening and night briefly overlap.",
    reward: {
      expCandy: 2
    }
  },

  "kingdom-double": {
    title: "The Kingdom Blinked",
    message: "Did the castle just blink back at you? Probably not.",
    reward: {
      gems: 5
    }
  },

  "map-crown": {
    title: "Crown Above Prospera",
    message: "Something golden was tucked high above the castle.",
    reward: {
      coins: 250
    }
  },

  "map-waterfall": {
    title: "Behind the Water",
    message: "A waterproof coin pouch was hidden behind the falls.",
    reward: {
      coins: 333
    }
  },

  "map-left-market": {
    title: "Merchant's Spare Change",
    message: "A merchant left a few coins beneath a market crate.",
    reward: {
      coins: 175
    }
  },

  "map-right-market": {
    title: "The Honest Till",
    message: "A shopkeeper returned a coin nobody remembered losing.",
    reward: {
      coins: 175
    }
  },

  "map-river": {
    title: "Golden Koi",
    message: "A flash of gold disappears beneath the river.",
    reward: {
      gems: 7
    }
  },

  "map-cloud-left": {
    title: "Cloud Nine",
    message: "There was definitely something sitting on that cloud.",
    reward: {
      gems: 9
    }
  },

  "map-cloud-right": {
    title: "Silver Lining",
    message: "Every cloud has one. This one had a tiny reward too.",
    reward: {
      stone: 9
    }
  },

  "map-garden": {
    title: "Secret Garden",
    message: "A flower bed spells a message only from the right angle.",
    reward: {
      wood: 15
    }
  },

  "map-bridge": {
    title: "Bridge Toll Refunded",
    message: "A very old toll box finally gives something back.",
    reward: {
      coins: 222
    }
  },

  "map-corner": {
    title: "Edge of the Map",
    message: "You found the place the mapmaker thought nobody would click.",
    reward: {
      gems: 11
    }
  },

  "bond-dollar-coin": {
    title: "Every Dollar Starts With A Coin",
    message: "Coin Cookie and Dollar Cookie remember an old promise.",
    reward: {
      coins: 1001
    }
  },

  "bond-safety": {
    title: "Safety Net",
    message: "Banker, Savings and Insurance Cookie quietly compare notes.",
    reward: {
      gems: 15
    }
  },

  "bond-concert": {
    title: "Midnight Concert",
    message: "Three musicians play a chord the kingdom has not heard in years.",
    reward: {
      coins: 777
    }
  },

  "bond-fortune": {
    title: "Fortune Trio",
    message: "Luck, gold and patience briefly align.",
    reward: {
      tickets: 2
    }
  },

  "original-seven": {
    title: "The Original Seven",
    message: "The first familiar faces of Prospera stand together again.",
    reward: {
      gems: 21
    }
  },

  "cookie-whisper": {
    title: "Cookie Whisperer",
    message: "You kept asking. Eventually, someone answered.",
    reward: {
      expCandy: 1
    }
  },

  "founders-team": {
    title: "Founders' March",
    message: "The original battle crew has assembled.",
    reward: {
      coins: 1250
    }
  },

  "support-squad": {
    title: "No One Fights Alone",
    message: "A team built almost entirely around helping each other enters battle.",
    reward: {
      gems: 12
    }
  },

  "risk-team": {
    title: "No Safety Net",
    message: "You entered a dangerous stage without a healer. Bold choice.",
    reward: {
      coins: 500
    }
  },

  "three-houses": {
    title: "Little Neighborhood",
    message: "Three Cookie Houses now make a proper little street.",
    reward: {
      wood: 30
    }
  },

  "prospera-park": {
    title: "A Place to Rest",
    message: "A fountain, flowers and a bench turn into a tiny park.",
    reward: {
      gems: 14
    }
  },

  "summon-lucky": {
    title: "Fortune Smiles Twice",
    message: "Lucky Cookie arrives with a golden spark stuck to their sleeve.",
    reward: {
      tickets: 1
    }
  },

  "summon-coin-dollar": {
    title: "Mint Condition",
    message: "Coin and Dollar appear back-to-back. The treasury approves.",
    reward: {
      coins: 600
    }
  },

  "summon-beast": {
    title: "The Dark Seed",
    message: "The Fortune Tree shivers. Something ancient noticed your summon.",
    reward: {
      gems: 30
    }
  },

  "stage-seven": {
    title: "Lucky Seven",
    message: "Stage 7 leaves a tiny seven-pointed star in the snow.",
    reward: {
      gems: 7
    }
  },

  "stage-thirteen": {
    title: "Unlucky?",
    message: "Stage 13 clears without catastrophe. Superstition loses this round.",
    reward: {
      coins: 1313
    }
  },

  "stage-twentyone": {
    title: "Three Sevens",
    message: "Twenty-one steps into Frostpeak, fortune repeats itself.",
    reward: {
      gems: 21
    }
  },

  "stage-thirty": {
    title: "Beyond the Summit",
    message: "At the end of Frostpeak, a path continues where the map says it should not.",
    reward: {
      tickets: 3
    }
  },

  "ambient-seed": {
    title: "Wandering Golden Seed",
    message: "One fragment of the old Fortune Tree still wanders Prospera.",
    reward: {
      tickets: 1
    }
  },

  "ambient-moth": {
    title: "Silver Moth",
    message: "A tiny silver visitor lands for only a second.",
    reward: {
      gems: 8
    }
  },

  "ambient-light": {
    title: "Little Guiding Light",
    message: "Some lights appear only when nobody is looking for them.",
    reward: {
      expCandy: 2
    }
  },
};

function ensureEasterEggState() {
  state.easterEggs =
    state.easterEggs ||
    {};

  state.easterEggs.found =
    state.easterEggs.found ||
    {};

  state.easterEggs.cookieTapCounts =
    state.easterEggs.cookieTapCounts ||
    {};

  state.easterEggs.cookieSequence =
    state.easterEggs.cookieSequence ||
    [];

  state.easterEggs.summonHistory =
    state.easterEggs.summonHistory ||
    [];

  return state.easterEggs;
}

function easterEggFoundCount() {
  const eggs =
    ensureEasterEggState();

  return Object.keys(
    eggs.found
  ).filter(
    (id) =>
      eggs.found[id]
  ).length;
}

function applyEasterEggReward(
  reward = {}
) {
  state.coins +=
    Number(
      reward.coins ||
      0
    );

  state.gems +=
    Number(
      reward.gems ||
      0
    );

  state.wood +=
    Number(
      reward.wood ||
      0
    );

  state.stone +=
    Number(
      reward.stone ||
      0
    );

  state.tickets +=
    Number(
      reward.tickets ||
      0
    );

  state.expCandy +=
    Number(
      reward.expCandy ||
      0
    );
}

function easterEggRewardText(
  reward = {}
) {
  const parts =
    [];

  if (
    reward.coins
  ) {
    parts.push(
      `+${formatNumber(
        reward.coins
      )} Coins`
    );
  }

  if (
    reward.gems
  ) {
    parts.push(
      `+${formatNumber(
        reward.gems
      )} Gems`
    );
  }

  if (
    reward.wood
  ) {
    parts.push(
      `+${formatNumber(
        reward.wood
      )} Wood`
    );
  }

  if (
    reward.stone
  ) {
    parts.push(
      `+${formatNumber(
        reward.stone
      )} Stone`
    );
  }

  if (
    reward.tickets
  ) {
    parts.push(
      `+${formatNumber(
        reward.tickets
      )} Ticket${
        reward.tickets === 1
          ? ""
          : "s"
      }`
    );
  }

  if (
    reward.expCandy
  ) {
    parts.push(
      `+${formatNumber(
        reward.expCandy
      )} EXP Candy`
    );
  }

  return parts.join(
    " · "
  );
}

function injectEasterEggStyles() {
  if (
    document.querySelector(
      "#easterEggStyles"
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "easterEggStyles";

  style.textContent = `
    .easter-egg-reveal {
      position: absolute;
      inset: 0;
      z-index: 9999;
      display: grid;
      place-items: center;
      pointer-events: none;
      background:
        radial-gradient(
          circle at center,
          rgba(255,220,112,.15),
          rgba(5,17,38,.08) 42%,
          rgba(5,17,38,.62)
        );
      animation:
        easterFade 2.7s ease both;
    }

    .easter-egg-card {
      width: min(520px,82%);
      padding: 22px 24px;
      border-radius: 22px;
      text-align: center;
      color: #fff5ce;
      background:
        linear-gradient(
          180deg,
          rgba(26,62,105,.97),
          rgba(5,22,50,.98)
        );
      border:
        3px solid #e0b34a;
      box-shadow:
        inset 0 0 0 2px rgba(255,239,166,.55),
        0 18px 55px rgba(0,0,0,.52),
        0 0 34px rgba(255,207,72,.35);
      animation:
        easterPop .48s cubic-bezier(.2,1.25,.3,1) both;
    }

    .easter-egg-card::before {
      content:
        "SECRET DISCOVERED";
      display:
        block;
      font-size:
        11px;
      letter-spacing:
        .24em;
      color:
        #ffd76e;
      margin-bottom:
        7px;
      font-weight:
        900;
    }

    .easter-egg-card strong {
      display:
        block;
      font-size:
        clamp(
          23px,
          3vw,
          36px
        );
      font-weight:
        950;
      text-shadow:
        0 3px 0 rgba(0,0,0,.28);
    }

    .easter-egg-card p {
      margin:
        9px auto 0;
      max-width:
        430px;
      line-height:
        1.45;
      color:
        #e7eefc;
      font-weight:
        700;
    }

    .easter-egg-card small {
      display:
        block;
      margin-top:
        12px;
      color:
        #ffe28a;
      font-weight:
        900;
    }

    .easter-spark {
      position:
        absolute;
      width:
        7px;
      height:
        7px;
      border-radius:
        50%;
      background:
        #ffd75f;
      box-shadow:
        0 0 14px #fff2a1;
      animation:
        easterSpark 1.7s ease-out forwards;
    }

    .secret-wisp {
      position:
        absolute;
      z-index:
        250;
      width:
        22px;
      height:
        22px;
      border:
        0;
      background:
        transparent;
      cursor:
        pointer;
      filter:
        drop-shadow(
          0 0 7px
          rgba(255,224,105,.9)
        );
      opacity:
        .62;
      animation:
        secretWispFloat
        2.7s
        ease-in-out
        infinite
        alternate;
    }

    .secret-wisp::before,
    .secret-wisp::after {
      content:
        "";
      position:
        absolute;
      inset:
        6px;
      background:
        #ffe06d;
      transform:
        rotate(45deg);
      border-radius:
        4px;
      box-shadow:
        0 0 12px
        #fff2a1;
    }

    .secret-wisp::after {
      inset:
        9px;
      background:
        #fff8d6;
      box-shadow:
        none;
    }

    @keyframes easterPop {
      from {
        transform:
          scale(.58)
          rotate(-2deg);
        opacity:
          0;
      }

      to {
        transform:
          scale(1);
        opacity:
          1;
      }
    }

    @keyframes easterFade {
      0% {
        opacity:
          0;
      }

      12%,
      80% {
        opacity:
          1;
      }

      100% {
        opacity:
          0;
      }
    }

    @keyframes easterSpark {
      from {
        transform:
          translate(0,0)
          scale(1);
        opacity:
          1;
      }

      to {
        transform:
          translate(
            var(--sx),
            var(--sy)
          )
          scale(0);
        opacity:
          0;
      }
    }

    @keyframes secretWispFloat {
      from {
        transform:
          translateY(0)
          rotate(-8deg);
      }

      to {
        transform:
          translateY(-9px)
          rotate(9deg);
      }
    }
  `;

  document.head.appendChild(
    style
  );
}

function showEasterEggReveal(
  definition,
  reward = {}
) {
  const frame =
    $("#gameFrame") ||
    document.body;

  const overlay =
    document.createElement(
      "div"
    );

  overlay.className =
    "easter-egg-reveal";

  const rewardText =
    easterEggRewardText(
      reward
    );

  overlay.innerHTML = `
    <div class="easter-egg-card">
      <strong>
        ${definition.title}
      </strong>

      <p>
        ${definition.message}
      </p>

      ${
        rewardText
          ? `<small>${rewardText}</small>`
          : ""
      }
    </div>
  `;

  frame.appendChild(
    overlay
  );

  for (
    let index = 0;
    index < 28;
    index += 1
  ) {
    const spark =
      document.createElement(
        "i"
      );

    spark.className =
      "easter-spark";

    spark.style.left =
      `${
        45 +
        Math.random() *
        10
      }%`;

    spark.style.top =
      `${
        45 +
        Math.random() *
        10
      }%`;

    spark.style.setProperty(
      "--sx",
      `${
        -190 +
        Math.random() *
        380
      }px`
    );

    spark.style.setProperty(
      "--sy",
      `${
        -140 +
        Math.random() *
        280
      }px`
    );

    overlay.appendChild(
      spark
    );
  }

  setTimeout(
    () =>
      overlay.remove(),
    2850
  );
}

function discoverEasterEgg(id) {
  const definition =
    EASTER_EGG_LIBRARY[
      id
    ];

  if (!definition) {
    return false;
  }

  const eggs =
    ensureEasterEggState();

  if (
    eggs.found[id]
  ) {
    toast(
      `Secret already found: ${definition.title}`
    );

    return false;
  }

  eggs.found[id] =
    true;

  applyEasterEggReward(
    definition.reward ||
    {}
  );

  saveGame();

  refreshAllUI();

  showEasterEggReveal(
    definition,
    definition.reward ||
    {}
  );

  return true;
}

function renderSecretJournal() {
  const eggs =
    ensureEasterEggState();

  const ids =
    Object.keys(
      EASTER_EGG_LIBRARY
    );

  const found =
    ids.filter(
      (id) =>
        eggs.found[id]
    );

  const discoveredCards =
    found.length
      ? found
          .map(
            (id) => `
              <div class="panel-card">
                <strong>
                  ${EASTER_EGG_LIBRARY[id].title}
                </strong>

                ${EASTER_EGG_LIBRARY[id].message}
              </div>
            `
          )
          .join("")
      : `
          <div class="panel-card">
            <strong>
              No secrets discovered yet.
            </strong>

            Prospera is full of strange little details.
            Click, explore, experiment and pay attention.
          </div>
        `;

  openPanel(
    "Secret Journal",
    `${found.length} / ${ids.length} DISCOVERED`,
    `
      ${discoveredCards}

      <div class="panel-card">
        <strong>
          ${ids.length - found.length} mysteries remain
        </strong>

        Undiscovered secrets stay hidden.
        The journal will not reveal their triggers.
      </div>
    `
  );
}

function setupKeyboardEasterEggs() {
  const codeMap = {
    prospera:
      "word-prospera",

    fortune:
      "word-fortune",

    compound:
      "word-compound",

    balance:
      "word-balance",

    legacy:
      "word-legacy",

    freedom:
      "word-freedom",

    truth:
      "word-truth",

    bloom:
      "word-bloom",

    lucky:
      "word-lucky",

    kindness:
      "word-kindness",

    moneykingdom:
      "word-moneykingdom",

    growwithbecca:
      "word-growwithbecca",
  };

  let buffer =
    "";

  const konami = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a"
  ];

  let konamiIndex =
    0;

  document.addEventListener(
    "keydown",
    (event) => {
      const target =
        event.target;

      if (
        target &&
        /INPUT|TEXTAREA|SELECT/.test(
          target.tagName
        )
      ) {
        return;
      }

      const key =
        event.key.length ===
        1
          ? event.key.toLowerCase()
          : event.key;

      if (
        key ===
        konami[
          konamiIndex
        ]
      ) {
        konamiIndex +=
          1;

        if (
          konamiIndex ===
          konami.length
        ) {
          discoverEasterEgg(
            "konami-fortune"
          );

          konamiIndex =
            0;
        }
      } else {
        konamiIndex =
          key ===
          konami[0]
            ? 1
            : 0;
      }

      if (
        /^[a-z0-9]$/i.test(
          event.key
        )
      ) {
        buffer =
          (
            buffer +
            event.key.toLowerCase()
          ).slice(
            -24
          );

        for (
          const [
            code,
            id
          ] of Object.entries(
            codeMap
          )
        ) {
          if (
            buffer.endsWith(
              code
            )
          ) {
            discoverEasterEgg(
              id
            );

            buffer =
              "";

            break;
          }
        }
      }
    }
  );
}

function setupStatusTapEasterEggs() {
  const taps =
    new Map();

  const bindTap = (
    selector,
    count,
    id
  ) => {
    const element =
      $(selector);

    if (!element) {
      return;
    }

    element.style.cursor =
      "pointer";

    element.addEventListener(
      "click",
      () => {
        const next =
          (
            taps.get(id) ||
            0
          ) +
          1;

        taps.set(
          id,
          next
        );

        if (
          next >=
          count
        ) {
          taps.set(
            id,
            0
          );

          discoverEasterEgg(
            id
          );
        }
      }
    );
  };

  bindTap(
    "#castleLevelText",
    7,
    "castle-seven"
  );

  bindTap(
    "#residentText",
    5,
    "residents-five"
  );

  bindTap(
    "#phaseText",
    6,
    "phase-six"
  );

  $("#kingdomImage")
    ?.addEventListener(
      "dblclick",
      () =>
        discoverEasterEgg(
          "kingdom-double"
        )
    );
}

const KINGDOM_SECRET_SPOTS = [
  {
    id: "map-crown",
    x: 50,
    y: 25,
    r: 4.2
  },

  {
    id: "map-waterfall",
    x: 50,
    y: 49,
    r: 4.0
  },

  {
    id: "map-left-market",
    x: 26,
    y: 55,
    r: 4.5
  },

  {
    id: "map-right-market",
    x: 74,
    y: 55,
    r: 4.5
  },

  {
    id: "map-river",
    x: 51,
    y: 76,
    r: 4.5
  },

  {
    id: "map-cloud-left",
    x: 14,
    y: 17,
    r: 4.8
  },

  {
    id: "map-cloud-right",
    x: 86,
    y: 17,
    r: 4.8
  },

  {
    id: "map-garden",
    x: 34,
    y: 70,
    r: 4.0
  },

  {
    id: "map-bridge",
    x: 59,
    y: 67,
    r: 4.0
  },

  {
    id: "map-corner",
    x: 90,
    y: 83,
    r: 4.6
  },
];

function setupKingdomMapEasterEggs() {
  const screen =
    $("#kingdomScreen");

  if (!screen) {
    return;
  }

  screen.addEventListener(
    "click",
    (event) => {
      if (
        event.target.closest(
          "button, .kingdom-status-strip, .side-panel"
        )
      ) {
        return;
      }

      const rect =
        screen.getBoundingClientRect();

      if (
        !rect.width ||
        !rect.height
      ) {
        return;
      }

      const x =
        (
          (
            event.clientX -
            rect.left
          ) /
          rect.width
        ) *
        100;

      const y =
        (
          (
            event.clientY -
            rect.top
          ) /
          rect.height
        ) *
        100;

      for (
        const spot of
        KINGDOM_SECRET_SPOTS
      ) {
        const dx =
          x -
          spot.x;

        const dy =
          y -
          spot.y;

        if (
          Math.hypot(
            dx,
            dy
          ) <=
          spot.r
        ) {
          discoverEasterEgg(
            spot.id
          );

          break;
        }
      }
    }
  );
}

function sequenceEndsWith(
  sequence,
  target
) {
  if (
    sequence.length <
    target.length
  ) {
    return false;
  }

  const tail =
    sequence.slice(
      -target.length
    );

  return target.every(
    (
      value,
      index
    ) =>
      tail[index] ===
      value
  );
}

function setupCookieEasterEggs() {
  const eggs =
    ensureEasterEggState();

  document.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          ".cookie-hotspot"
        );

      if (!button) {
        return;
      }

      const name =
        button.dataset.cookie;

      eggs.cookieTapCounts[
        name
      ] =
        Number(
          eggs.cookieTapCounts[
            name
          ] ||
          0
        ) +
        1;

      eggs.cookieSequence.push(
        name
      );

      eggs.cookieSequence =
        eggs.cookieSequence.slice(
          -10
        );

      if (
        eggs.cookieTapCounts[
          name
        ] ===
        7
      ) {
        discoverEasterEgg(
          "cookie-whisper"
        );
      }

      if (
        sequenceEndsWith(
          eggs.cookieSequence,
          [
            "Coin Cookie",
            "Dollar Cookie",
            "Coin Cookie",
            "Dollar Cookie"
          ]
        )
      ) {
        discoverEasterEgg(
          "bond-dollar-coin"
        );
      }

      if (
        sequenceEndsWith(
          eggs.cookieSequence,
          [
            "Banker Cookie",
            "Savings Cookie",
            "Insurance Cookie"
          ]
        )
      ) {
        discoverEasterEgg(
          "bond-safety"
        );
      }

      if (
        sequenceEndsWith(
          eggs.cookieSequence,
          [
            "Violin Cookie",
            "Piano Cookie",
            "Conductor Cookie"
          ]
        )
      ) {
        discoverEasterEgg(
          "bond-concert"
        );
      }

      if (
        sequenceEndsWith(
          eggs.cookieSequence,
          [
            "Lucky Cookie",
            "Golden Cookie",
            "Compound Cookie"
          ]
        )
      ) {
        discoverEasterEgg(
          "bond-fortune"
        );
      }

      if (
        sequenceEndsWith(
          eggs.cookieSequence,
          [
            "Lucky Cookie",
            "Coin Cookie",
            "Dollar Cookie",
            "Property Cookie",
            "Violin Cookie",
            "Banker Cookie",
            "Builder Cookie"
          ]
        )
      ) {
        discoverEasterEgg(
          "original-seven"
        );
      }

      saveGame();
    }
  );
}

function checkTeamEasterEggs(stage) {
  const team =
    state.team ||
    [];

  const founders = [
    "Coin Cookie",
    "Dollar Cookie",
    "Banker Cookie",
    "Violin Cookie",
    "Builder Cookie"
  ];

  if (
    founders.every(
      (name) =>
        team.includes(name)
    ) &&
    team.length ===
      5
  ) {
    discoverEasterEgg(
      "founders-team"
    );
  }

  const supportCount =
    team.filter(
      (name) =>
        [
          "Support",
          "Healer"
        ].includes(
          cookieData(
            name
          ).role
        )
    ).length;

  if (
    team.length >=
      4 &&
    supportCount >=
      4
  ) {
    discoverEasterEgg(
      "support-squad"
    );
  }

  const healerCount =
    team.filter(
      (name) =>
        cookieData(
          name
        ).role ===
        "Healer"
    ).length;

  if (
    Number(stage) >=
      20 &&
    healerCount ===
      0
  ) {
    discoverEasterEgg(
      "risk-team"
    );
  }
}

function checkBuildEasterEggs() {
  const types =
    (
      state.placedBuildings ||
      []
    ).map(
      (building) =>
        building.type
    );

  if (
    types.filter(
      (type) =>
        type ===
        "cookie-house"
    ).length >=
    3
  ) {
    discoverEasterEgg(
      "three-houses"
    );
  }

  if (
    types.includes(
      "fountain"
    ) &&
    types.includes(
      "flower-garden"
    ) &&
    types.includes(
      "prospera-bench"
    )
  ) {
    discoverEasterEgg(
      "prospera-park"
    );
  }
}

function checkVictoryEasterEggs(stage) {
  const map = {
    7:
      "stage-seven",

    13:
      "stage-thirteen",

    21:
      "stage-twentyone",

    30:
      "stage-thirty"
  };

  if (
    map[
      Number(stage)
    ]
  ) {
    discoverEasterEgg(
      map[
        Number(stage)
      ]
    );
  }
}

function setupFunctionEasterEggHooks() {
  const originalStartBattle =
    startBattle;

  startBattle =
    function(stage) {
      checkTeamEasterEggs(
        stage
      );

      return originalStartBattle.apply(
        this,
        arguments
      );
    };

  const originalConfirmPlacement =
    confirmPlacement;

  confirmPlacement =
    function() {
      const before =
        (
          state.placedBuildings ||
          []
        ).length;

      const result =
        originalConfirmPlacement.apply(
          this,
          arguments
        );

      const after =
        (
          state.placedBuildings ||
          []
        ).length;

      if (
        after >
        before
      ) {
        checkBuildEasterEggs();
      }

      return result;
    };

  const originalRenderVictoryScreen =
    renderVictoryScreen;

  renderVictoryScreen =
    function(stage) {
      const result =
        originalRenderVictoryScreen.apply(
          this,
          arguments
        );

      checkVictoryEasterEggs(
        stage
      );

      return result;
    };

  const originalRenderSummonResult =
    renderSummonResult;

  renderSummonResult =
    function(
      name,
      count,
      newCookies
    ) {
      const result =
        originalRenderSummonResult.apply(
          this,
          arguments
        );

      const eggs =
        ensureEasterEggState();

      eggs.summonHistory.push(
        name
      );

      eggs.summonHistory =
        eggs.summonHistory.slice(
          -5
        );

      if (
        name ===
        "Lucky Cookie"
      ) {
        discoverEasterEgg(
          "summon-lucky"
        );
      }

      if (
        sequenceEndsWith(
          eggs.summonHistory,
          [
            "Coin Cookie",
            "Dollar Cookie"
          ]
        ) ||
        sequenceEndsWith(
          eggs.summonHistory,
          [
            "Dollar Cookie",
            "Coin Cookie"
          ]
        )
      ) {
        discoverEasterEgg(
          "summon-coin-dollar"
        );
      }

      if (
        cookieData(
          name
        ).rarity ===
        "BEAST"
      ) {
        discoverEasterEgg(
          "summon-beast"
        );
      }

      saveGame();

      return result;
    };

  const originalRenderSettingsPanel =
    renderSettingsPanel;

  renderSettingsPanel =
    function() {
      const result =
        originalRenderSettingsPanel.apply(
          this,
          arguments
        );

      const body =
        $("#panelBody");

      if (
        body &&
        !$("#secretJournalButton")
      ) {
        body.insertAdjacentHTML(
          "beforeend",
          `
            <div class="panel-card">
              <strong>
                ???
              </strong>

              Secrets discovered:
              ${easterEggFoundCount()}
              /
              ${Object.keys(EASTER_EGG_LIBRARY).length}
            </div>

            <div class="panel-actions">
              <button
                id="secretJournalButton"
                class="panel-button-gold"
                type="button"
              >
                Secret Journal
              </button>
            </div>
          `
        );

        $("#secretJournalButton")
          ?.addEventListener(
            "click",
            renderSecretJournal
          );
      }

      return result;
    };
}

function spawnAmbientSecret() {
  const screen =
    $("#kingdomScreen");

  if (
    !screen ||
    !screen.classList.contains(
      "active"
    ) ||
    screen.querySelector(
      ".secret-wisp"
    )
  ) {
    return;
  }

  const eggs =
    ensureEasterEggState();

  const ambientIds = [
    "ambient-seed",
    "ambient-moth",
    "ambient-light"
  ].filter(
    (id) =>
      !eggs.found[id]
  );

  if (
    !ambientIds.length
  ) {
    return;
  }

  const id =
    randomFrom(
      ambientIds
    );

  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    "secret-wisp";

  button.setAttribute(
    "aria-label",
    "A tiny mysterious light"
  );

  button.style.left =
    `${
      12 +
      Math.random() *
      76
    }%`;

  button.style.top =
    `${
      18 +
      Math.random() *
      64
    }%`;

  button.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();

      button.remove();

      discoverEasterEgg(
        id
      );
    }
  );

  screen.appendChild(
    button
  );

  setTimeout(
    () =>
      button.remove(),
    9000
  );
}

function scheduleAmbientSecrets() {
  const loop =
    () => {
      const delay =
        38000 +
        Math.random() *
        42000;

      setTimeout(
        () => {
          if (
            Math.random() <
            0.72
          ) {
            spawnAmbientSecret();
          }

          loop();
        },
        delay
      );
    };

  loop();
}

function setupEasterEggSystem() {
  ensureEasterEggState();
  injectEasterEggStyles();
  setupKeyboardEasterEggs();
  setupStatusTapEasterEggs();
  setupKingdomMapEasterEggs();
  setupCookieEasterEggs();
  setupFunctionEasterEggHooks();
  scheduleAmbientSecrets();
}

/* =========================================================
   GLOBAL UI REFRESH
========================================================= */

function refreshAllUI() {
  refreshKingdomStatus();
  refreshCookieInfo();
  refreshAdventureProgress();
  refreshSummonScreen();

  if (
    $("#worldScreen")
      ?.classList.contains(
        "active"
      )
  ) {
    renderStageRoute();
  }
}

/* =========================================================
   SECRET EASTER EGG SYSTEM
========================================================= */

const EASTER_EGGS = {
  "konami-fortune": {
    title: "Fortune Code",
    reward: {
      gems: 88
    },
    text: "The old arcade spirits smile upon Prospera."
  },

  "castle-tapper": {
    title: "Knock Knock, Castle",
    reward: {
      coins: 7777
    },
    text: "Someone inside the castle knocked back."
  },

  "coin-collector": {
    title: "Coin Coin Coin!",
    reward: {
      coins: 2222
    },
    text: "Coin Cookie approves of your persistence."
  },

  "midnight-bell": {
    title: "Midnight Bell",
    reward: {
      expCandy: 3
    },
    text: "A bell rings where no bell should be."
  },

  "lucky-seven": {
    title: "Lucky Seven",
    reward: {
      tickets: 1
    },
    text: "Seven taps. One fortunate answer."
  },

  "prospera-secret": {
    title: "The Name Remembers",
    reward: {
      gems: 50
    },
    text: "Prospera remembers those who call its name."
  },

  "tree-whisper": {
    title: "Whispering Tree",
    reward: {
      tickets: 2
    },
    text: "The Tree of Fortune whispered: save some for tomorrow."
  },

  "builder-spin": {
    title: "Master Builder",
    reward: {
      wood: 77,
      stone: 33
    },
    text: "Four rotations later, Builder Cookie is impressed."
  },

  "speed-runner": {
    title: "Too Fast!",
    reward: {
      expCandy: 2
    },
    text: "Even Chronos Cookie had to check the clock."
  },

  "pause-master": {
    title: "Patience Pays",
    reward: {
      coins: 1500
    },
    text: "Sometimes the strongest move is waiting."
  },

  "five-friends": {
    title: "Perfect Party",
    reward: {
      gems: 25
    },
    text: "Five Cookies, one purpose."
  },

  "empty-team": {
    title: "Where Did Everyone Go?",
    reward: {
      coins: 500
    },
    text: "The battle team has mysteriously vanished."
  },

  "rich-kingdom": {
    title: "A Million Coins",
    reward: {
      gems: 100
    },
    text: "Wealth is a tool. Spend it wisely."
  },

  "tiny-saver": {
    title: "Every Coin Counts",
    reward: {
      coins: 101
    },
    text: "A tiny reserve is still a reserve."
  },

  "frostpeak-13": {
    title: "Unlucky?",
    reward: {
      expCandy: 4
    },
    text: "Stage 13 was not unlucky after all."
  },

  "frostpeak-30": {
    title: "Top of the World",
    reward: {
      tickets: 3
    },
    text: "The mountain keeps one last secret for its conquerors."
  },

  "beast-hunter": {
    title: "Beast Watcher",
    reward: {
      gems: 66
    },
    text: "Something ancient noticed you looking back."
  },

  "night-owl": {
    title: "Night Owl",
    reward: {
      coins: 888
    },
    text: "Prospera is different after dark."
  },

  "inventory-hoarder": {
    title: "Prepared for Everything",
    reward: {
      wood: 25,
      stone: 25
    },
    text: "You checked the inventory... again."
  },

  "settings-secret": {
    title: "Behind the Curtain",
    reward: {
      gems: 20
    },
    text: "You found a switch behind the switches."
  },

  "summon-ten": {
    title: "Ten Wishes",
    reward: {
      tickets: 1
    },
    text: "The Tree remembers bold wishers."
  },

  "golden-cookie": {
    title: "Golden Encounter",
    reward: {
      coins: 5000
    },
    text: "Not everything that glitters is meant to be spent."
  },

  "lucky-cookie": {
    title: "Lucky Found You",
    reward: {
      tickets: 1
    },
    text: "Luck likes people who keep exploring."
  },

  "banker-cookie": {
    title: "Emergency Fund",
    reward: {
      coins: 3000
    },
    text: "Banker Cookie quietly set something aside."
  },

  "violin-cookie": {
    title: "Hidden Melody",
    reward: {
      gems: 30
    },
    text: "A melody from the old kingdom returns."
  },

  "builder-cookie": {
    title: "Blueprint X",
    reward: {
      wood: 40
    },
    text: "A strange blueprint was tucked under the hammer."
  },

  "click-100": {
    title: "Curious Hands",
    reward: {
      gems: 35
    },
    text: "You have clicked one hundred times. Prospera noticed."
  },

  "secret-word": {
    title: "The Great Spend",
    reward: {
      gems: 75
    },
    text: "A forgotten phrase opens an old memory."
  },

  "fortune-word": {
    title: "Fortune Favors the Curious",
    reward: {
      tickets: 2
    },
    text: "Curiosity has its own kind of compound interest."
  },

  "no-money": {
    title: "Starting From Zero",
    reward: {
      coins: 1000
    },
    text: "Prospera has rebuilt before. It can rebuild again."
  },
};

function ensureEasterState() {
  state.easterEggs =
    state.easterEggs ||
    {};

  state.easterStats =
    state.easterStats ||
    {
      totalClicks: 0,
      castleClicks: 0,
      inventoryOpens: 0,
      settingsOpens: 0,
      rotateClicks: 0,
      pauseClicks: 0,
      speedClicks: 0,
      typed: "",
    };
}

function easterRewardText(
  reward = {}
) {
  const parts =
    [];

  if (
    reward.coins
  ) {
    parts.push(
      `+${formatNumber(
        reward.coins
      )} Coins`
    );
  }

  if (
    reward.gems
  ) {
    parts.push(
      `+${formatNumber(
        reward.gems
      )} Gems`
    );
  }

  if (
    reward.wood
  ) {
    parts.push(
      `+${formatNumber(
        reward.wood
      )} Wood`
    );
  }

  if (
    reward.stone
  ) {
    parts.push(
      `+${formatNumber(
        reward.stone
      )} Stone`
    );
  }

  if (
    reward.tickets
  ) {
    parts.push(
      `+${formatNumber(
        reward.tickets
      )} Ticket${
        reward.tickets ===
        1
          ? ""
          : "s"
      }`
    );
  }

  if (
    reward.expCandy
  ) {
    parts.push(
      `+${formatNumber(
        reward.expCandy
      )} EXP Candy`
    );
  }

  return parts.join(
    " · "
  );
}

function spawnSecretBurst() {
  const layer =
    document.createElement(
      "div"
    );

  layer.className =
    "secret-burst-layer";

  document.body.appendChild(
    layer
  );

  for (
    let i = 0;
    i < 24;
    i += 1
  ) {
    const spark =
      document.createElement(
        "i"
      );

    spark.style.setProperty(
      "--x",
      `${
        -180 +
        Math.random() *
        360
      }px`
    );

    spark.style.setProperty(
      "--y",
      `${
        -80 -
        Math.random() *
        260
      }px`
    );

    spark.style.setProperty(
      "--delay",
      `${
        Math.random() *
        0.15
      }s`
    );

    layer.appendChild(
      spark
    );
  }

  setTimeout(
    () =>
      layer.remove(),
    1500
  );
}

function unlockEasterEgg(
  id,
  silent = false
) {
  ensureEasterState();

  const egg =
    EASTER_EGGS[id];

  if (
    !egg ||
    state.easterEggs[
      id
    ]
  ) {
    return false;
  }

  state.easterEggs[
    id
  ] =
    Date.now();

  const reward =
    egg.reward ||
    {};

  state.coins +=
    Number(
      reward.coins ||
      0
    );

  state.gems +=
    Number(
      reward.gems ||
      0
    );

  state.wood +=
    Number(
      reward.wood ||
      0
    );

  state.stone +=
    Number(
      reward.stone ||
      0
    );

  state.tickets +=
    Number(
      reward.tickets ||
      0
    );

  state.expCandy +=
    Number(
      reward.expCandy ||
      0
    );

  saveGame();

  refreshAllUI();

  if (!silent) {
    spawnSecretBurst();

    const rewardLine =
      easterRewardText(
        reward
      );

    openPanel(
      `Secret Found: ${egg.title}`,
      `EASTER EGG ${Object.keys(state.easterEggs).length} / ${Object.keys(EASTER_EGGS).length}`,
      `
        <div class="panel-card secret-egg-card">
          <strong>
            ${egg.title}
          </strong>

          <p>
            ${egg.text}
          </p>

          ${
            rewardLine
              ? `<div class="secret-reward">${rewardLine}</div>`
              : ""
          }
        </div>
      `
    );
  }

  return true;
}

function checkPassiveEasterEggs() {
  ensureEasterState();

  if (
    state.coins >=
    1000000
  ) {
    unlockEasterEgg(
      "rich-kingdom",
      true
    );
  }

  if (
    state.coins <=
      100 &&
    state.coins >
      0
  ) {
    unlockEasterEgg(
      "tiny-saver",
      true
    );
  }

  if (
    state.coins ===
    0
  ) {
    unlockEasterEgg(
      "no-money",
      true
    );
  }

  if (
    (
      state.team ||
      []
    ).length ===
    5
  ) {
    unlockEasterEgg(
      "five-friends",
      true
    );
  }

  if (
    (
      state.team ||
      []
    ).length ===
    0
  ) {
    unlockEasterEgg(
      "empty-team",
      true
    );
  }

  if (
    state.completedStages?.[
      13
    ]
  ) {
    unlockEasterEgg(
      "frostpeak-13",
      true
    );
  }

  if (
    state.completedStages?.[
      30
    ]
  ) {
    unlockEasterEgg(
      "frostpeak-30",
      true
    );
  }
}

function showSecretBook() {
  ensureEasterState();

  const found =
    Object.keys(
      EASTER_EGGS
    ).filter(
      (id) =>
        state.easterEggs[
          id
        ]
    );

  const rows =
    found.length
      ? found
          .map(
            (id) => `
              <div class="secret-book-row">
                <b>
                  ${EASTER_EGGS[id].title}
                </b>

                <span>
                  ${EASTER_EGGS[id].text}
                </span>
              </div>
            `
          )
          .join("")
      : `
          <div class="panel-card">
            No secrets found yet.
            Prospera rewards curiosity.
          </div>
        `;

  openPanel(
    "Prospera's Secret Book",
    `${found.length} / ${Object.keys(EASTER_EGGS).length} DISCOVERED`,
    `
      <div class="secret-book">
        ${rows}
      </div>

      <div class="panel-card">
        <small>
          Hint: click strange things, revisit familiar places,
          try old game codes, and pay attention to numbers.
        </small>
      </div>
    `
  );
}

function setupEasterEggs() {
  ensureEasterState();

  document.addEventListener(
    "click",
    (event) => {
      state.easterStats.totalClicks +=
        1;

      if (
        state.easterStats.totalClicks >=
        100
      ) {
        unlockEasterEgg(
          "click-100"
        );
      }

      const action =
        event.target.closest?.(
          "[data-action]"
        )?.dataset?.action;

      if (
        action ===
        "inventory"
      ) {
        state.easterStats.inventoryOpens +=
          1;

        if (
          state.easterStats.inventoryOpens >=
          7
        ) {
          unlockEasterEgg(
            "inventory-hoarder"
          );
        }
      }

      if (
        action ===
        "settings"
      ) {
        state.easterStats.settingsOpens +=
          1;

        if (
          state.easterStats.settingsOpens >=
          5
        ) {
          unlockEasterEgg(
            "settings-secret"
          );
        }
      }

      if (
        action ===
        "dominion"
      ) {
        unlockEasterEgg(
          "beast-hunter",
          true
        );
      }

      const kingdomHotspot =
        event.target.closest?.(
          ".hs-kingdom"
        );

      if (
        kingdomHotspot
      ) {
        state.easterStats.castleClicks +=
          1;

        if (
          state.easterStats.castleClicks ===
          7
        ) {
          unlockEasterEgg(
            "lucky-seven"
          );
        }

        if (
          state.easterStats.castleClicks >=
          12
        ) {
          unlockEasterEgg(
            "castle-tapper"
          );
        }
      }

      saveGame();
    },
    true
  );

  const rotate =
    $("#rotatePlacementButton");

  rotate?.addEventListener(
    "click",
    () => {
      state.easterStats.rotateClicks +=
        1;

      if (
        state.easterStats.rotateClicks >=
        4
      ) {
        unlockEasterEgg(
          "builder-spin"
        );
      }

      saveGame();
    }
  );

  const pause =
    $("#pauseBattleButton");

  pause?.addEventListener(
    "click",
    () => {
      state.easterStats.pauseClicks +=
        1;

      if (
        state.easterStats.pauseClicks >=
        10
      ) {
        unlockEasterEgg(
          "pause-master"
        );
      }

      saveGame();
    }
  );

  const speed =
    $("#battleSpeedButton");

  speed?.addEventListener(
    "click",
    () => {
      state.easterStats.speedClicks +=
        1;

      if (
        state.easterStats.speedClicks >=
        12
      ) {
        unlockEasterEgg(
          "speed-runner"
        );
      }

      saveGame();
    }
  );

  $("#summonTenButton")
    ?.addEventListener(
      "click",
      () =>
        unlockEasterEgg(
          "summon-ten"
        )
    );

  document.addEventListener(
    "keydown",
    (event) => {
      const key =
        String(
          event.key ||
          ""
        ).toLowerCase();

      const ignored = [
        "shift",
        "control",
        "alt",
        "meta",
        "capslock",
        "tab"
      ];

      if (
        !ignored.includes(
          key
        ) &&
        key.length ===
          1
      ) {
        state.easterStats.typed =
          (
            state.easterStats.typed +
            key
          ).slice(
            -40
          );

        const typed =
          state.easterStats.typed;

        if (
          typed.includes(
            "prospera"
          )
        ) {
          unlockEasterEgg(
            "prospera-secret"
          );
        }

        if (
          typed.includes(
            "thegreatspend"
          ) ||
          typed.includes(
            "greatspend"
          )
        ) {
          unlockEasterEgg(
            "secret-word"
          );
        }

        if (
          typed.includes(
            "fortune"
          )
        ) {
          unlockEasterEgg(
            "fortune-word"
          );
        }

        if (
          typed.includes(
            "secretbook"
          )
        ) {
          showSecretBook();
        }
      }
    }
  );

  const konami = [
    "arrowup",
    "arrowup",
    "arrowdown",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "arrowleft",
    "arrowright",
    "b",
    "a"
  ];

  let konamiIndex =
    0;

  document.addEventListener(
    "keydown",
    (event) => {
      const key =
        String(
          event.key ||
          ""
        ).toLowerCase();

      if (
        key ===
        konami[
          konamiIndex
        ]
      ) {
        konamiIndex +=
          1;

        if (
          konamiIndex ===
          konami.length
        ) {
          unlockEasterEgg(
            "konami-fortune"
          );

          konamiIndex =
            0;
        }
      } else {
        konamiIndex =
          key ===
          konami[0]
            ? 1
            : 0;
      }
    }
  );

  $$(".cookie-hotspot")
    .forEach(
      (button) => {
        button.addEventListener(
          "dblclick",
          () => {
            const name =
              button.dataset.cookie;

            const mapping = {
              "Lucky Cookie":
                "lucky-cookie",

              "Banker Cookie":
                "banker-cookie",

              "Violin Cookie":
                "violin-cookie",

              "Builder Cookie":
                "builder-cookie",

              "Golden Cookie":
                "golden-cookie",

              "Coin Cookie":
                "coin-collector",
            };

            if (
              mapping[
                name
              ]
            ) {
              unlockEasterEgg(
                mapping[
                  name
                ]
              );
            }
          }
        );
      }
    );

  setInterval(
    () => {
      const phase =
        KINGDOM_PHASES[
          kingdomPhaseIndex
        ];

      if (
        phase ===
        "night"
      ) {
        unlockEasterEgg(
          "night-owl",
          true
        );
      }

      checkPassiveEasterEggs();
    },
    5000
  );

  checkPassiveEasterEggs();
}

/* =========================================================
   INITIALISE
========================================================= */

function initialiseGame() {
  setupEasterEggSystem();

  setupImageCheck(
    "#kingdomImage",
    "#kingdomImageError"
  );

  setupImageCheck(
    "#cookiesImage",
    "#cookiesImageError"
  );

  setupScreenNavigation();
  setupPanelShell();
  setupKingdomActions();
  setupCookieCollection();
  setupAdventureCards();
  setupStageScreen();
  setupTeamEditor();
  setupBuildStudio();
  setupVictoryScreen();
  setupSummonScreen();
  setupBattleControls();
  setupEasterEggs();

  createSparkles();
  createAmbientClouds();
  startKingdomClock();

  refreshAllUI();
  renderStageRoute();
  renderStageTeamPreview();
  renderTeamEditor();
  renderBuildCatalog();
  renderPlacedBuildings();
  refreshBuildResources();
}

initialiseGame();    
