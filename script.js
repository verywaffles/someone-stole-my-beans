// ===============================
// CORE GAME STATE
// ===============================
let story = {};
let currentScene = "start";
let inventory = [];
let unlockedLore = [];
let unlockedLocations = [];
let chaosFlags = {};
let skillPoints = 3;
let unlockedSkills = {};


// ===============================
// LOAD STORY JSON
// ===============================
fetch("story.json")
  .then(res => res.json())
  .then(data => {
    story = data;
  });


// ===============================
// INVENTORY SYSTEM
// ===============================
function addItem(item) {
  if (!inventory.includes(item)) {
    inventory.push(item);
    updateInventoryUI();
    alert("You obtained: " + item);
  }
}

function hasItem(item) {
  return inventory.includes(item);
}

function updateInventoryUI() {
  const list = document.getElementById("inventoryList");
  list.innerHTML = "";
  inventory.forEach(i => {
    const li = document.createElement("li");
    li.innerText = i;
    list.appendChild(li);
  });
}


// ===============================
// ACHIEVEMENTS
// ===============================
const ACHIEVEMENTS = {
  endingVictory: "Bean Hero",
  endingHalfBeans: "Halfway There",
  endingSyndicate: "Bean King",
  endingCoward: "Coward",
  endingCry: "Crybaby",
  endingGiveUp: "Gave Up",
  endingCompensation: "Compensated",
  endingQuest: "Granola Quest",
  powPow: "Messed with the wrong neighbor",
  endingChessMaster: "Grandmaster Bean",
  endingChessFail: "Checkmated",
  endingPawnEater: "Pawnivore",
  waitLong: "That was NOT 6-8 months",
  endingAscension: "Ascended Bean",
  endingTranscend: "Transcendent",
  endingShattered: "Reality Breaker",
  endingOverlords: "Raccoon Overlord",
  endingDelete: "Self-Deleted",
  endingCursorAngry: "Cursor’s Wrath",
  endingFifthWall: "Fifth Wall Breaker",
  endingEscape: "Escaped the Game",
  endingWizard: "Bean Wizard",
  endingExplosion: "Spell Gone Wrong",
  endingFamiliar: "Bean Tamer",
  endingEatFamiliar: "Familiar Feast"
};

function unlockAchievement(id) {
  let unlocked = JSON.parse(localStorage.getItem("achievements")) || {};
  if (!unlocked[id]) {
    unlocked[id] = true;
    localStorage.setItem("achievements", JSON.stringify(unlocked));
    showAchievementPopup(ACHIEVEMENTS[id]);
  }
}

function showAchievementPopup(name) {
  const popup = document.createElement("div");
  popup.className = "achievement-popup";
  popup.innerText = "Achievement Unlocked: " + name;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}

function openAchievements() {
  let unlocked = JSON.parse(localStorage.getItem("achievements")) || {};
  let msg = "Achievements:\n\n";
  for (let id in ACHIEVEMENTS) {
    msg += (unlocked[id] ? "✔️ " : "❌ ") + ACHIEVEMENTS[id] + "\n";
  }
  alert(msg);
}


// ===============================
// SKILL TREE
// ===============================
function updateSkillTreeUI() {
  const display = document.getElementById("skillPointsDisplay");
  display.innerText = "Skill Points: " + skillPoints;

  document.querySelectorAll(".skill").forEach(skill => {
    const id = skill.dataset.skill;
    if (unlockedSkills[id]) {
      skill.classList.add("unlocked");
      const btn = skill.querySelector("button");
      if (btn) {
        btn.innerText = "Unlocked";
        btn.disabled = true;
      }
    }
  });
}


// ===============================
// MINI-GAME (12-card memory)
// ===============================
let miniGameActive = false;

function startMemoryMiniGame(returnScene) {
  miniGameActive = true;

  const text = document.getElementById("text");
  const choices = document.getElementById("choices");

  text.innerText = "Memory Mini‑Game: Match all pairs to restore balance!";
  choices.innerHTML = "";

  const symbols = ["▲", "●", "■", "◆", "⬟", "⬢"];
  let cards = [...symbols, ...symbols];

  // shuffle
  cards.sort(() => Math.random() - 0.5);

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(4, 60px)";
  grid.style.gap = "10px";
  grid.style.marginTop = "20px";

  let first = null;
  let lock = false;
  let matches = 0;

  cards.forEach((symbol, index) => {
    const card = document.createElement("div");
    card.className = "memory-card";
    card.dataset.symbol = symbol;
    card.innerText = "";
    card.style.width = "60px";
    card.style.height = "60px";
    card.style.border = "2px solid white";
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.justifyContent = "center";
    card.style.fontSize = "30px";
    card.style.cursor = "pointer";
    card.style.background = "#222";

    card.onclick = () => {
      if (lock || card.innerText !== "") return;

      card.innerText = symbol;

      if (!first) {
        first = card;
      } else {
        lock = true;
        setTimeout(() => {
          if (first.dataset.symbol === card.dataset.symbol) {
            matches++;
            first.style.background = "#0a0";
            card.style.background = "#0a0";
          } else {
            first.innerText = "";
            card.innerText = "";
          }
          first = null;
          lock = false;

          if (matches === 6) {
            miniGameActive = false;
            loadScene(returnScene);
          }
        }, 600);
      }
    };

    grid.appendChild(card);
  });

  choices.appendChild(grid);
}


// ===============================
// MAIN SCENE LOADER
// ===============================
function loadScene(sceneName) {
  if (miniGameActive) return;

  updateInventoryUI();
  currentScene = sceneName;

  const scene = story[sceneName];
  document.getElementById("text").innerText = scene.text;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  if (ACHIEVEMENTS[sceneName]) unlockAchievement(sceneName);

  scene.choices.forEach(choice => {
    if (choice.requires && !hasItem(choice.requires)) return;

    const btn = document.createElement("button");
    btn.innerText = choice.label;

    btn.onclick = () => {
      if (choice.item) addItem(choice.item);
      if (choice.lore) unlockedLore.push(choice.lore);
      if (choice.location) unlockedLocations.push(choice.location);
      if (choice.chaos) chaosFlags[sceneName] = true;

      if (choice.minigame === "memory") {
        startMemoryMiniGame(choice.next);
      } else {
        loadScene(choice.next);
      }
    };

    choicesDiv.appendChild(btn);
  });
}


// ===============================
// ENDINGS
// ===============================
function goToEnding(id) {
  const ending = story[id];
  document.getElementById("text").innerText = ending.text;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  const restart = document.createElement("button");
  restart.innerText = "Restart";
  restart.onclick = () => loadScene("start");
  choicesDiv.appendChild(restart);
}


// ===============================
// RESTART BUTTON
// ===============================
function restartGame() {
  loadScene("start");
}


// ===============================
// DOMContentLoaded — UI SETUP
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // PLAY BUTTON
  document.getElementById("playButton").onclick = () => {
    document.getElementById("titleScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    loadScene("start");
  };

  // MENU TOGGLE
  const menuToggle = document.getElementById("menuToggle");
  const menuPanel = document.getElementById("menuPanel");
  menuToggle.onclick = () => menuPanel.classList.toggle("open");

  // INVENTORY TOGGLE
  const inventoryToggle = document.getElementById("inventoryToggle");
  const inventoryPanel = document.getElementById("inventoryPanel");
  inventoryToggle.onclick = () => inventoryPanel.classList.toggle("open");

  // PANEL TOGGLER
  function togglePanel(id) {
    const panel = document.getElementById(id);
    if (panel.classList.contains("open")) {
      panel.classList.remove("open");
      return;
    }
    document.querySelectorAll(".menuWindow").forEach(p => p.classList.remove("open"));
    panel.classList.add("open");
  }

  document.getElementById("skillTreeButton").onclick = () => togglePanel("skillTreePanel");
  document.getElementById("loreButton").onclick = () => togglePanel("lorePanel");
  document.getElementById("mapButton").onclick = () => togglePanel("mapPanel");
  document.getElementById("chaosButton").onclick = () => togglePanel("chaosPanel");
  document.getElementById("customizeButton").onclick = () => togglePanel("customizePanel");
  document.getElementById("saveButton").onclick = () => togglePanel("savePanel");
  document.getElementById("loadButton").onclick = () => togglePanel("loadPanel");
  document.getElementById("settingsButton").onclick = () => togglePanel("settingsPanel");

  updateSkillTreeUI();
});

