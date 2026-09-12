const state = {

  coins: 2500,
  gems: 50,

  xp: 0,
  level: 1,

  stage: 1,

  skillPoints: 5,

  buildings: {

    bank: 1,
    market: 1,
    investment: 1,
    academy: 1

  },

  skills: {

    power: 0,
    luck: 0,
    wealth: 0,
    speed: 0,
    defence: 0,
    wisdom: 0

  }

};



const heroes = [

  {
    name: "Dollar Cookie",
    rarity: "EPIC",
    icon: "💵",
    role: "Attacker",
    skill: "Cash Burst"
  },

  {
    name: "Coin Cookie",
    rarity: "RARE",
    icon: "🪙",
    role: "Defender",
    skill: "Golden Shield"
  },

  {
    name: "Budget Cookie",
    rarity: "RARE",
    icon: "🧾",
    role: "Support",
    skill: "Smart Plan"
  },

  {
    name: "Investor Cookie",
    rarity: "EPIC",
    icon: "📈",
    role: "Support",
    skill: "Compound Growth"
  },

  {
    name: "Banker Cookie",
    rarity: "EPIC",
    icon: "🏦",
    role: "Healer",
    skill: "Emergency Fund"
  },



  // LEGENDARY

  {
    name: "Lucky Cookie",
    rarity: "LEGENDARY",
    icon: "🍀",
    role: "Support",
    skill: "Fortune Favours"
  },

  {
    name: "Golden Cookie",
    rarity: "LEGENDARY",
    icon: "☀️",
    role: "All-Rounder",
    skill: "Golden Rain"
  },

  {
    name: "Chronos Cookie",
    rarity: "LEGENDARY",
    icon: "⏳",
    role: "Support",
    skill: "Time Is Wealth"
  },

  {
    name: "Compound Cookie",
    rarity: "LEGENDARY",
    icon: "📊",
    role: "Support",
    skill: "Compound Effect"
  },

  {
    name: "Diamond Cookie",
    rarity: "LEGENDARY",
    icon: "💎",
    role: "Defender",
    skill: "Diamond Fortress"
  },

  {
    name: "Opportuna Cookie",
    rarity: "LEGENDARY",
    icon: "🚪",
    role: "Support",
    skill: "Once In A Lifetime"
  },

  {
    name: "Verdantis Cookie",
    rarity: "LEGENDARY",
    icon: "🌿",
    role: "Healer",
    skill: "Endless Growth"
  },

  {
    name: "Stellara Cookie",
    rarity: "LEGENDARY",
    icon: "🌟",
    role: "Attacker",
    skill: "Dream Bigger"
  },



  // ANCIENTS

  {
    name: "Equilibra Cookie",
    rarity: "ANCIENT",
    icon: "⚖️",
    role: "Support",
    skill: "Perfect Balance"
  },

  {
    name: "Sapheon Cookie",
    rarity: "ANCIENT",
    icon: "🦉",
    role: "Support",
    skill: "Ancient Insight"
  },

  {
    name: "Florentia Cookie",
    rarity: "ANCIENT",
    icon: "🌳",
    role: "Healer",
    skill: "Tree of Abundance"
  },

  {
    name: "Liberis Cookie",
    rarity: "ANCIENT",
    icon: "🕊️",
    role: "All-Rounder",
    skill: "Break Every Chain"
  },

  {
    name: "Memoria Cookie",
    rarity: "ANCIENT",
    icon: "👑",
    role: "Summoner",
    skill: "Generations United"
  },



  // BEASTS

  {
    name: "Greed Cookie",
    rarity: "BEAST",
    icon: "👹",
    role: "Attacker",
    skill: "Never Enough"
  },

  {
    name: "Deception Cookie",
    rarity: "BEAST",
    icon: "🎭",
    role: "Debuffer",
    skill: "Too Good To Be True"
  },

  {
    name: "Ruin Cookie",
    rarity: "BEAST",
    icon: "🔥",
    role: "Attacker",
    skill: "Market Collapse"
  },

  {
    name: "Debt Cookie",
    rarity: "BEAST",
    icon: "⛓️",
    role: "Debuffer",
    skill: "Compound Debt"
  },

  {
    name: "Oblivion Cookie",
    rarity: "BEAST",
    icon: "🕳️",
    role: "Control",
    skill: "Forgotten"
  }

];



const enemies = [

  "Impulse Shopping Goblin",

  "Credit Card Slime",

  "Interest Scorpion",

  "Scam Imp",

  "Panic Bear",

  "Greed Golem",

  "Inflation Dragon"

];



function showScreen(screen) {

  document
    .querySelectorAll(".screen")
    .forEach(section => {

      section.classList.remove(
        "active-screen"
      );

    });

  document
    .getElementById(screen)
    .classList.add(
      "active-screen"
    );

}



function renderHeroes(filter = "ALL") {

  const grid =
    document.getElementById(
      "heroGrid"
    );

  grid.innerHTML = "";

  heroes
    .filter(hero =>

      filter === "ALL" ||
      hero.rarity === filter

    )
    .forEach(hero => {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        `hero-card ${hero.rarity}`;

      card.innerHTML = `

        <div class="hero-image">
          ${hero.icon}
        </div>

        <h3>
          ${hero.name}
        </h3>

        <span class="rarity">
          ${hero.rarity}
        </span>

        <p>
          ${hero.role}
        </p>

        <small>
          ✨ ${hero.skill}
        </small>

      `;

      grid.appendChild(card);

    });

}



function filterHeroes(rarity) {

  renderHeroes(rarity);

}



function incomeRate() {

  let base =

    state.buildings.bank * 5 +

    state.buildings.market * 4 +

    state.buildings.investment * 6;

  base *=
    1 +
    state.skills.wealth * 0.10;

  return Math.floor(base);

}



function collectIncome() {

  const amount =
    incomeRate();

  state.coins += amount;

  updateUI();

}



function upgradeBuilding(type) {

  const level =
    state.buildings[type];

  const price =
    level * 600;

  if (
    state.coins < price
  ) {

    alert(
      `You need ${price} coins!`
    );

    return;

  }

  state.coins -= price;

  state.buildings[type]++;

  gainXP(15);

  updateUI();

}



function upgradeSkill(skill) {

  if (
    state.skillPoints <= 0
  ) {

    alert(
      "You need more Skill Points!"
    );

    return;

  }

  state.skills[skill]++;

  state.skillPoints--;

  updateUI();

}



function fight() {

  const power =
    20 +
    state.skills.power * 10;

  const luck =
    state.skills.luck;

  const wisdom =
    state.skills.wisdom;

  const rewardCoins =
    Math.floor(
      120 +
      state.stage * 45
    );

  const bonusXP =
    Math.floor(
      20 *
      (
        1 +
        wisdom * 0.08
      )
    );



  document.getElementById(
    "battleMessage"
  ).textContent =
    `💥 ${power} damage!`;



  document.getElementById(
    "enemyHealth"
  ).style.width =
    "0%";



  setTimeout(() => {

    state.coins += rewardCoins;

    gainXP(bonusXP);

    let reward = `

      <h2>
        Victory!
      </h2>

      <p>
        💰 +${rewardCoins} Coins
      </p>

      <p>
        ⭐ +${bonusXP} XP
      </p>

    `;



    const rareChance =
      0.10 +
      luck * 0.03;



    if (
      Math.random() <
      rareChance
    ) {

      state.gems += 10;

      reward += `

        <p>
          🍀 Lucky Drop!
        </p>

        <p>
          💎 +10 Gems
        </p>

      `;

    }



    if (
      Math.random() <
      0.05 +
      luck * 0.015
    ) {

      reward += `

        <h3>
          🎁 BONUS CHEST!
        </h3>

      `;

      state.coins += 500;

    }



    showReward(reward);

    state.stage++;

    updateEnemy();

    document.getElementById(
      "enemyHealth"
    ).style.width =
      "100%";

    updateUI();

  }, 600);

}



function updateEnemy() {

  const enemy =
    enemies[
      (state.stage - 1)
      % enemies.length
    ];

  document.getElementById(
    "enemyName"
  ).textContent =
    enemy;

  document.getElementById(
    "enemyLabel"
  ).textContent =
    enemy;

}



function gainXP(amount) {

  state.xp += amount;

  const required =
    state.level * 100;

  if (
    state.xp >= required
  ) {

    state.xp -= required;

    state.level++;

    state.skillPoints += 2;

    showReward(`

      <h2>
        🎉 LEVEL UP!
      </h2>

      <p>
        Kingdom Level
        ${state.level}
      </p>

      <p>
        🌳 +2 Skill Points
      </p>

    `);

  }

}



function showReward(content) {

  document.getElementById(
    "rewardText"
  ).innerHTML =
    content;

  document.getElementById(
    "rewardPopup"
  ).classList.remove(
    "hidden"
  );

}



function closeReward() {

  document.getElementById(
    "rewardPopup"
  ).classList.add(
    "hidden"
  );

}



function updateUI() {

  document.getElementById(
    "coins"
  ).textContent =
    Math.floor(
      state.coins
    );

  document.getElementById(
    "gems"
  ).textContent =
    state.gems;

  document.getElementById(
    "xp"
  ).textContent =
    state.xp;

  document.getElementById(
    "level"
  ).textContent =
    state.level;

  document.getElementById(
    "stage"
  ).textContent =
    state.stage;



  const required =
    state.level * 100;

  document.getElementById(
    "xpText"
  ).textContent =
    `${state.xp} / ${required} XP`;

  document.getElementById(
    "xpFill"
  ).style.width =
    `${state.xp /
      required *
      100}%`;



  document.getElementById(
    "income"
  ).textContent =
    incomeRate();



  document.getElementById(
    "bankLevel"
  ).textContent =
    state.buildings.bank;

  document.getElementById(
    "marketLevel"
  ).textContent =
    state.buildings.market;

  document.getElementById(
    "investmentLevel"
  ).textContent =
    state.buildings.investment;

  document.getElementById(
    "academyLevel"
  ).textContent =
    state.buildings.academy;



  document.getElementById(
    "skillPoints"
  ).textContent =
    state.skillPoints;



  Object.keys(
    state.skills
  ).forEach(skill => {

    document.getElementById(
      skill + "Skill"
    ).textContent =
      state.skills[skill];

  });



  saveGame();

}



function saveGame() {

  localStorage.setItem(
    "moneyKingdomSave",
    JSON.stringify(state)
  );

}



function loadGame() {

  const save =
    localStorage.getItem(
      "moneyKingdomSave"
    );

  if (!save) return;

  const data =
    JSON.parse(save);

  Object.assign(
    state,
    data
  );

}



function passiveIncome() {

  const amount =
    Math.max(
      1,
      Math.floor(
        incomeRate() / 5
      )
    );

  state.coins += amount;

  updateUI();

}



/* START GAME */

loadGame();

renderHeroes();

updateEnemy();

updateUI();



setInterval(
  passiveIncome,
  5000
);
