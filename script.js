// ======================================================
// Someone Stole My Beans – script.js
// Matches your current index.html + style.css
// ======================================================

// -----------------------------
// CORE GAME STATE
// -----------------------------
let story = {};
let currentScene = "start";

let player = {
  name: "",
  class: ""
};

let inventory = [];
let unlockedLore = [];
let unlockedLocations = [];
let chaosFlags = {}; // { sceneName: true }
let skillPoints = 3;
let unlockedSkills = {}; // { skillId: true }

let miniGameActive = false;


// -----------------------------
// SAFE localStorage HELPERS
// -----------------------------
function safeGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("localStorage read/parse failed:", e);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn("localStorage write failed:", e);
    return false;
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("localStorage remove failed:", e);
  }
}


// -----------------------------
// LOAD STORY JSON
// -----------------------------
fetch("story.json")
  .then(res => res.json())
  .then(data => {
    story = data || {};
  })
  .catch(err => {
    console.error("Failed to load story.json:", err);
    story = {};
  });


// -----------------------------
// UTILS
// -----------------------------
function ensureArrayUnique(arr) {
  return Array.from(new Set(arr));
}

function showToast(text, ms = 1800) {
  const t = document.createElement("div");
  t.className = "game-toast";
  t.innerText = text;
  t.style.position = "fixed";
  t.style.left = "50%";
  t.style.transform = "translateX(-50%)";
  t.style.bottom = "80px";
  t.style.background = "rgba(0,0,0,0.8)";
  t.style.color = "white";
  t.style.padding = "8px 12px";
  t.style.borderRadius = "6px";
  t.style.zIndex = 9999;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}


// -----------------------------
// INVENTORY SYSTEM
// -----------------------------
function addItem(item) {
  if (!item) return;
  if (!inventory.includes(item)) {
    inventory.push(item);
    updateInventoryUI();
    showToast("You obtained: " + item);
  }
}

function hasItem(item) {
  return inventory.includes(item);
}

function updateInventoryUI() {
  const list = document.getElementById("inventoryList");
  if (!list) return;
  list.innerHTML = "";
  if (inventory.length === 0) {
    const p = document.createElement("p");
    p.innerText = "Inventory is empty.";
    list.appendChild(p);
    return;
  }
  inventory.forEach(i => {
    const li = document.createElement("li");
    li.innerText = i;
    list.appendChild(li);
  });
}


// -----------------------------
// ACHIEVEMENTS
// -----------------------------
const ACHIEVEMENTS = {
  start: "Bean Beginner – Begin your journey.",
  endingVictory: "Legend of the Beans – Reclaim your beans.",
  endingHalfBeans: "Half Full, Half Empty – Recover half your beans.",
  endingSyndicate: "Bean King – Rule the raccoon syndicate.",
  endingCoward: "Coward – Run away.",
  endingCry: "Tears of the Beanless – Cry in defeat.",
  endingGiveUp: "Total Surrender – Give up entirely.",
  endingCompensation: "Three Dollar Redemption – Accept $3.",
  endingQuest: "Granola Quest – Begin a granola adventure.",
  powPow: "Karate Neighbor – Get punched by your neighbor.",
  endingChessMaster: "Bean Grandmaster – Win flawlessly.",
  endingChessFail: "Four‑Move Failure – Lose instantly.",
  endingPawnEater: "Pawn Devourer – Eat a chess piece.",
  waitLong: "50‑Year Wait – Wait for the Bureau.",
  endingAscension: "Ascended Bean – Become Bean Itself.",
  endingTranscend: "Perfect Harmony – Transcend reality.",
  endingShattered: "Beanstorm Drifter – Reality collapses.",
  endingOverlords: "Raccoon Overlords – Serve the raccoon empire.",
  endingDelete: "Self‑Destruct – Delete the game.",
  endingCursorAngry: "Cursor’s Wrath – Anger the cursor.",
  endingFifthWall: "Fifth Wall Breaker – Break a wall nobody understands.",
  endingEscape: "Desktop Escapee – Escape the game.",
  endingWizard: "Bean Wizard – Master legumancy.",
  endingExplosion: "Toasted – Explode from magic.",
  endingFamiliar: "Bean Parent – Adopt a bean familiar.",
  endingEatFamiliar: "Familiar Feast – Eat your familiar.",
  endingEatDirt: "Dirt Gourmet – Eat dirt.",
  endingLongStory: "Bored to Death – Listen to a 9‑hour story.",
  endingPatience: "47‑Year Wait – Wait for a broken bridge.",
  endingWrongRiddle: "Riddle Failure – Fail the monk’s riddle.",
  endingRaccoonOffended: "Raccoon Lawyered – Offend the monk.",
  endingParadox: "Time Paradox – Break the timeline.",
  endingSelfTheft: "Self‑Sabotage – Steal your own beans.",
  endingFootPain: "Door Kicker – Break your foot.",
  endingEnlightenment: "Pure Legume Energy – Achieve enlightenment.",
  endingUnworthy: "Unworthy – Get bean‑blasted.",
  endingHesitate: "Too Slow – Lose the True Beans."
};

function unlockAchievement(id) {
  if (!ACHIEVEMENTS[id]) return;
  const unlocked = safeGet("achievements", {});
  if (!unlocked[id]) {
    unlocked[id] = true;
    safeSet("achievements", unlocked);
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
  const unlocked = safeGet("achievements", {});
  const list = document.getElementById("achievementsList");
  if (!list) return;

  list.innerHTML = "";

  for (let id in ACHIEVEMENTS) {
    const entry = document.createElement("p");
    entry.innerText = (unlocked[id] ? "✔️ " : "❌ ") + ACHIEVEMENTS[id];
    list.appendChild(entry);
  }

  const panel = document.getElementById("achievementsPanel");
  if (panel) panel.classList.add("open");
}


// -----------------------------
// SKILL TREE UI
// -----------------------------
function updateSkillTreeUI() {
  const display = document.getElementById("skillPointsDisplay");
  if (display) display.innerText = "Skill Points: " + skillPoints;

  document.querySelectorAll(".skill").forEach(skillEl => {
    const id = skillEl.dataset.skill;
    if (unlockedSkills[id]) {
      skillEl.classList.add("unlocked");
      const btn = skillEl.querySelector("button");
      if (btn) {
        btn.innerText = "Unlocked";
        btn.disabled = true;
      }
    } else {
      skillEl.classList.remove("unlocked");
      const btn = skillEl.querySelector("button");
      if (btn) {
        btn.innerText = "Unlock";
        btn.disabled = false;
      }
    }
  });
}

function unlockSkill(id) {
  if (!id || unlockedSkills[id]) return;
  if (skillPoints <= 0) {
    showToast("Not enough skill points.");
    return;
  }
  unlockedSkills[id] = true;
  skillPoints--;
  updateSkillTreeUI();
  showToast("Skill unlocked: " + id);
}


// -----------------------------
// MEMORY MINI-GAME
// -----------------------------
function startMemoryMiniGame(returnScene) {
  miniGameActive = true;

  const text = document.getElementById("text");
  const choices = document.getElementById("choices");
  if (!text || !choices) return;

  text.innerText = "Memory Mini‑Game: Match all pairs to restore balance!";
  choices.innerHTML = "";

  const symbols = ["▲", "●", "■", "◆", "⬟", "⬢"];
  let cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(4, 60px)";
  grid.style.gap = "10px";
  grid.style.marginTop = "20px";

  let first = null;
  let lock = false;
  let matches = 0;

  cards.forEach(symbol => {
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

          if (matches === symbols.length) {
            miniGameActive = false;
            showToast("Mini-game complete!");
            loadScene(returnScene);
          }
        }, 600);
      }
    };

    grid.appendChild(card);
  });

  choices.appendChild(grid);
}


// -----------------------------
// BEANPEDIA (LORE) UI
// -----------------------------
function updateLoreUI() {
  const container = document.getElementById("loreContent");
  if (!container) return;
  container.innerHTML = "";

  if (!unlockedLore || unlockedLore.length === 0) {
    container.innerHTML = "<p>No lore discovered yet.</p>";
    return;
  }

  const ul = document.createElement("ul");
  unlockedLore.forEach(entry => {
    const li = document.createElement("li");
    li.innerText = entry;
    ul.appendChild(li);
  });
  container.appendChild(ul);
}


// -----------------------------
// MAP UI
// -----------------------------
function updateMapUI() {
  const container = document.getElementById("mapContent");
  if (!container) return;
  container.innerHTML = "";

  if (!unlockedLocations || unlockedLocations.length === 0) {
    container.innerHTML = "<p>No locations discovered yet.</p>";
    return;
  }

  const ul = document.createElement("ul");
  unlockedLocations.forEach(loc => {
    const li = document.createElement("li");
    li.innerText = loc;
    ul.appendChild(li);
  });
  container.appendChild(ul);
}


// -----------------------------
// CHAOS PANEL UI
// -----------------------------
function updateChaosUI() {
  const container = document.getElementById("chaosPanel");
  if (!container) return;

  let log = container.querySelector(".chaosLog");
  if (!log) {
    log = document.createElement("div");
    log.className = "chaosLog";
    log.style.marginTop = "10px";
    container.appendChild(log);
  }

  const keys = Object.keys(chaosFlags || {});
  if (keys.length === 0) {
    log.innerHTML = "<p>No chaos triggered yet.</p>";
    return;
  }

  log.innerHTML = "";
  keys.forEach(scene => {
    const p = document.createElement("p");
    p.innerText = "Chaos triggered in: " + scene;
    log.appendChild(p);
  });
}


// -----------------------------
// SAVE / LOAD
// -----------------------------
function getSaveState() {
  return {
    player,
    currentScene,
    inventory,
    unlockedLore,
    unlockedLocations,
    chaosFlags,
    skillPoints,
    unlockedSkills
  };
}

function applySaveState(state) {
  if (!state) return;
  player = state.player || player;
  currentScene = state.currentScene || "start";
  inventory = state.inventory || [];
  unlockedLore = state.unlockedLore || [];
  unlockedLocations = state.unlockedLocations || [];
  chaosFlags = state.chaosFlags || {};
  skillPoints = typeof state.skillPoints === "number" ? state.skillPoints : skillPoints;
  unlockedSkills = state.unlockedSkills || {};

  updateInventoryUI();
  updateLoreUI();
  updateMapUI();
  updateChaosUI();
  updateSkillTreeUI();

  if (story[currentScene]) {
    loadScene(currentScene);
  } else {
    loadScene("start");
  }
}

function saveGame(slot = "autosave") {
  const state = getSaveState();
  const ok = safeSet("save_" + slot, state);
  if (ok) showToast("Game saved (" + slot + ")");
  else showToast("Save failed (storage unavailable)");
}

function loadGame(slot = "autosave") {
  const state = safeGet("save_" + slot, null);
  if (!state) {
    alert("No save found in slot: " + slot);
    return;
  }
  applySaveState(state);
  showToast("Game loaded (" + slot + ")");
}

function clearSave(slot = "autosave") {
  safeRemove("save_" + slot);
  showToast("Save cleared (" + slot + ")");
}


// -----------------------------
// MAIN SCENE LOADER
// -----------------------------
function loadScene(sceneName) {
  if (miniGameActive) return;

  if (!story || Object.keys(story).length === 0) {
    console.warn("Story not loaded yet. Retrying:", sceneName);
    setTimeout(() => loadScene(sceneName), 200);
    return;
  }

  const scene = story[sceneName];
  if (!scene) {
    console.error("Scene not found:", sceneName);
    const textEl = document.getElementById("text");
    if (textEl) textEl.innerText = "Scene not found: " + sceneName;
    return;
  }

  currentScene = sceneName;

  const textEl = document.getElementById("text");
  if (textEl) textEl.innerText = scene.text || "";

  const choicesDiv = document.getElementById("choices");
  if (!choicesDiv) return;
  choicesDiv.innerHTML = "";

  if (ACHIEVEMENTS[sceneName]) unlockAchievement(sceneName);

  (scene.choices || []).forEach(choice => {
    if (choice.requires && !hasItem(choice.requires)) return;

    const btn = document.createElement("button");
    btn.innerText = choice.label || "…";

    btn.onclick = () => {
      if (choice.item) {
        addItem(choice.item);
      }

      if (choice.lore) {
        unlockedLore.push(choice.lore);
        unlockedLore = ensureArrayUnique(unlockedLore);
        updateLoreUI();
      }

      if (choice.location) {
        unlockedLocations.push(choice.location);
        unlockedLocations = ensureArrayUnique(unlockedLocations);
        updateMapUI();
      }

      if (choice.chaos) {
        chaosFlags[sceneName] = true;
        updateChaosUI();
      }

      if (choice.skill) {
        unlockSkill(choice.skill);
      }

      if (choice.minigame === "memory") {
        startMemoryMiniGame(choice.next);
        return;
      }

      if (choice.next) {
        setTimeout(() => loadScene(choice.next), 80);
      }
    };

    choicesDiv.appendChild(btn);
  });

  updateInventoryUI();
}


// -----------------------------
// ENDINGS
// -----------------------------
function goToEnding(id) {
  const ending = story[id];
  if (!ending) {
    console.error("Ending not found:", id);
    return;
  }

  const textEl = document.getElementById("text");
  if (textEl) textEl.innerText = ending.text || "";

  const choicesDiv = document.getElementById("choices");
  if (!choicesDiv) return;
  choicesDiv.innerHTML = "";

  if (ACHIEVEMENTS[id]) unlockAchievement(id);

  const restart = document.createElement("button");
  restart.innerText = "Restart";
  restart.onclick = () => restartGame();
  choicesDiv.appendChild(restart);
}


// -----------------------------
// RESTART
// -----------------------------
function restartGame() {
  inventory = [];
  unlockedLore = [];
  unlockedLocations = [];
  chaosFlags = {};
  skillPoints = 3;
  unlockedSkills = {};
  miniGameActive = false;
  currentScene = "start";

  updateInventoryUI();
  updateLoreUI();
  updateMapUI();
  updateChaosUI();
  updateSkillTreeUI();

  loadScene("start");
}


// -----------------------------
// PANEL TOGGLER
// -----------------------------
function togglePanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  if (panel.classList.contains("open")) {
    panel.classList.remove("open");
    return;
  }
  document.querySelectorAll(".menuWindow").forEach(p => p.classList.remove("open"));
  panel.classList.add("open");

  if (id === "lorePanel") updateLoreUI();
  if (id === "mapPanel") updateMapUI();
  if (id === "chaosPanel") updateChaosUI();
  if (id === "skillTreePanel") updateSkillTreeUI();
}


// -----------------------------
// CUSTOMIZE & SETTINGS
// -----------------------------
function applyCustomizeToPlayer() {
  const name = document.getElementById("customName")?.value || "";
  const cls = document.getElementById("customClass")?.value || "";
  if (name) player.name = name;
  if (cls) player.class = cls;

  const pInput = document.getElementById("playerNameInput");
  const pClass = document.getElementById("playerClassSelect");
  if (pInput) pInput.value = player.name;
  if (pClass) pClass.value = player.class;

  showToast("Customization applied");
}

function applySettings() {
  const dark = document.getElementById("settingDarkMode")?.checked;
  const bigText = document.getElementById("settingBigText")?.checked;

  if (dark) document.body.style.backgroundColor = "#222";
  else document.body.style.backgroundColor = "#f7f2e8";

  if (bigText) document.body.style.fontSize = "18px";
  else document.body.style.fontSize = "";

  showToast("Settings applied");
}


// -----------------------------
// DOMContentLoaded — wire UI
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("SCRIPT LOADED, DOM ready");

  const playBtn = document.getElementById("playButton");
  if (playBtn) {
    playBtn.onclick = () => {
      const nameInput = document.getElementById("playerNameInput");
      const classSelect = document.getElementById("playerClassSelect");
      player.name = (nameInput && nameInput.value) || "Bean Seeker";
      player.class = (classSelect && classSelect.value) || "detective";

      const customName = document.getElementById("customName");
      const customClass = document.getElementById("customClass");
      if (customName) customName.value = player.name;
      if (customClass) customClass.value = player.class;

      const titleScreen = document.getElementById("titleScreen");
      const gameScreen = document.getElementById("gameScreen");
      if (titleScreen) titleScreen.style.display = "none";
      if (gameScreen) gameScreen.style.display = "block";

      unlockAchievement("start");
      loadScene("start");
    };
  }

  const restartButton = document.getElementById("restartButton");
  if (restartButton) {
    restartButton.onclick = () => restartGame();
  }

  const menuToggle = document.getElementById("menuToggle");
  const menuPanel = document.getElementById("menuPanel");
  if (menuToggle && menuPanel) {
    menuToggle.onclick = () => menuPanel.classList.toggle("open");
  }

  const inventoryToggle = document.getElementById("inventoryToggle");
  const inventoryPanel = document.getElementById("inventoryPanel");
  if (inventoryToggle && inventoryPanel) {
    inventoryToggle.onclick = () => inventoryPanel.classList.toggle("open");
  }

  const skillTreeButton = document.getElementById("skillTreeButton");
  if (skillTreeButton) skillTreeButton.onclick = () => togglePanel("skillTreePanel");

  const loreButton = document.getElementById("loreButton");
  if (loreButton) loreButton.onclick = () => togglePanel("lorePanel");

  const mapButton = document.getElementById("mapButton");
  if (mapButton) mapButton.onclick = () => togglePanel("mapPanel");

  const chaosButton = document.getElementById("chaosButton");
  if (chaosButton) chaosButton.onclick = () => togglePanel("chaosPanel");

  const customizeButton = document.getElementById("customizeButton");
  if (customizeButton) customizeButton.onclick = () => togglePanel("customizePanel");

  const saveButton = document.getElementById("saveButton");
  if (saveButton) saveButton.onclick = () => togglePanel("savePanel");

  const loadButton = document.getElementById("loadButton");
  if (loadButton) loadButton.onclick = () => togglePanel("loadPanel");

  const settingsButton = document.getElementById("settingsButton");
  if (settingsButton) settingsButton.onclick = () => togglePanel("settingsPanel");

  const achievementsButton = document.getElementById("achievementsButton");
  if (achievementsButton) {
    achievementsButton.onclick = () => openAchievements();
  }

  const closeAchievements = document.getElementById("closeAchievements");
  if (closeAchievements) {
    closeAchievements.onclick = () => {
      const panel = document.getElementById("achievementsPanel");
      if (panel) panel.classList.remove("open");
    };
  }

  const savePanel = document.getElementById("savePanel");
  if (savePanel) {
    const content = document.getElementById("saveContent");
    if (content) {
      content.innerHTML = "";
      const saveBtn = document.createElement("button");
      saveBtn.innerText = "Save (Autoslot)";
      saveBtn.onclick = () => saveGame("autosave");

      const saveNamedBtn = document.createElement("button");
      saveNamedBtn.innerText = "Save (Named Slot)";
      saveNamedBtn.onclick = () => {
        const name = prompt("Enter save slot name:", "slot1");
        if (name) saveGame(name);
      };

      const clearBtn = document.createElement("button");
      clearBtn.innerText = "Clear Autosave";
      clearBtn.onclick = () => {
        if (confirm("Clear autosave?")) clearSave("autosave");
      };

      content.appendChild(saveBtn);
      content.appendChild(document.createTextNode(" "));
      content.appendChild(saveNamedBtn);
      content.appendChild(document.createElement("br"));
      content.appendChild(clearBtn);
    }
  }

  const loadPanel = document.getElementById("loadPanel");
  if (loadPanel) {
    const content = document.getElementById("loadContent");
    if (content) {
      content.innerHTML = "";
      const loadBtn = document.createElement("button");
      loadBtn.innerText = "Load Autosave";
      loadBtn.onclick = () => loadGame("autosave");

      const loadNamedBtn = document.createElement("button");
      loadNamedBtn.innerText = "Load Named Slot";
      loadNamedBtn.onclick = () => {
        const name = prompt("Enter save slot name to load:", "slot1");
        if (name) loadGame(name);
      };

      content.appendChild(loadBtn);
      content.appendChild(document.createTextNode(" "));
      content.appendChild(loadNamedBtn);
    }
  }

  const customizePanel = document.getElementById("customizePanel");
  if (customizePanel) {
    const applyBtn = document.createElement("button");
    applyBtn.innerText = "Apply";
    applyBtn.onclick = () => applyCustomizeToPlayer();
    customizePanel.appendChild(document.createElement("br"));
    customizePanel.appendChild(applyBtn);
  }

  const settingsPanel = document.getElementById("settingsPanel");
  if (settingsPanel) {
    const applyBtn = document.createElement("button");
    applyBtn.innerText = "Apply Settings";
    applyBtn.onclick = () => applySettings();
    settingsPanel.appendChild(document.createElement("br"));
    settingsPanel.appendChild(applyBtn);
  }
function updateRPC(state, details) {
  fetch("http://localhost:6969/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state, details })
  }).catch(() => {
    // Helper app might not be running; ignore errors
  });
}

  updateInventoryUI();
  updateLoreUI();
  updateMapUI();
  updateChaosUI();
  updateSkillTreeUI();
});


