 // ===============================
// CORE GAME STATE
// ===============================
let story = {};
let currentScene = "start";
let inventory = [];


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


// ===============================
// ACHIEVEMENT FUNCTIONS
// ===============================
function unlockAchievement(endingId) {
  let unlocked = JSON.parse(localStorage.getItem("achievements")) || {};

  if (!unlocked[endingId]) {
    unlocked[endingId] = true;
    localStorage.setItem("achievements", JSON.stringify(unlocked));

    showAchievementPopup(ACHIEVEMENTS[endingId]);
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
  let message = "Achievements:\n\n";

  for (let id in ACHIEVEMENTS) {
    let name = ACHIEVEMENTS[id];
    let hasIt = unlocked[id] ? "✔️" : "❌";
    message += `${hasIt} ${name}\n`;
  }

  alert(message);
}


// ===============================
// INVENTORY SYSTEM
// ===============================
function addItem(item) {
  if (!inventory.includes(item)) {
    inventory.push(item);
    alert("You obtained: " + item);
    updateInventoryUI();
  }
}

function removeItem(item) {
  inventory = inventory.filter(i => i !== item);
  updateInventoryUI();
}

function hasItem(item) {
  return inventory.includes(item);
}

function updateInventoryUI() {
  const list = document.getElementById("inventoryList");
  if (!list) return;

  list.innerHTML = "";

  inventory.forEach(item => {
    const li = document.createElement("li");
    li.innerText = item;
    list.appendChild(li);
  });
}


// ===============================
// LOAD STORY JSON
// ===============================
fetch("story.json")
  .then(res => res.json())
  .then(data => {
    story = data;
  });


// ===============================
// MAIN SCENE LOADER
// ===============================
function loadScene(sceneName) {
  updateInventoryUI();

  const scene = story[sceneName];
  currentScene = sceneName;

  if (ACHIEVEMENTS[sceneName]) {
    unlockAchievement(sceneName);
  }

  document.getElementById("text").innerText = scene.text;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  scene.choices.forEach(choice => {
    if (choice.requires && !hasItem(choice.requires)) return;

    const btn = document.createElement("button");
    btn.innerText = choice.label;

    btn.onclick = () => {
      if (choice.item) addItem(choice.item);

      if (ACHIEVEMENTS[choice.next]) {
        goToEnding(choice.next);
      } else {
        loadScene(choice.next);
      }
    };

    choicesDiv.appendChild(btn);
  });
}


// ===============================
// ENDING HANDLER
// ===============================
function goToEnding(id) {
  const ending = story[id];

  document.getElementById("text").innerText = ending.text;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  const restartBtn = document.createElement("button");
  restartBtn.innerText = "Restart";
  restartBtn.onclick = () => loadScene("start");

  choicesDiv.appendChild(restartBtn);
}


// ===============================
// SKILL TREE SYSTEM
// ===============================
let skillPoints = 3;
let unlockedSkills = JSON.parse(localStorage.getItem("skills")) || {};

function updateSkillTreeUI() {
  const display = document.getElementById("skillPointsDisplay");
  if (display) display.innerText = "Skill Points: " + skillPoints;

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
// DOMContentLoaded — ALL UI LOGIC
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // PLAY BUTTON
  document.getElementById("playButton").onclick = () => {
    document.getElementById("titleScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    loadScene("start");
  };

  // MENU PANEL
  const menuToggle = document.getElementById("menuToggle");
  const menuPanel = document.getElementById("menuPanel");
  menuToggle.addEventListener("click", () => {
    menuPanel.classList.toggle("open");
  });

  // INVENTORY PANEL
  const inventoryToggle = document.getElementById("inventoryToggle");
  const inventoryPanel = document.getElementById("inventoryPanel");
  inventoryToggle.addEventListener("click", () => {
    inventoryPanel.classList.toggle("open");
  });

  // GENERIC PANEL TOGGLER
  function togglePanel(id) {
    document.querySelectorAll(".menuWindow").forEach(p => p.classList.remove("open"));
    document.getElementById(id).classList.toggle("open");
  }

  // MENU BUTTONS
  document.getElementById("skillTreeButton").onclick = () => togglePanel("skillTreePanel");
  document.getElementById("loreButton").onclick = () => togglePanel("lorePanel");
  document.getElementById("mapButton").onclick = () => togglePanel("mapPanel");
  document.getElementById("chaosButton").onclick = () => togglePanel("chaosPanel");
  document.getElementById("customizeButton").onclick = () => togglePanel("customizePanel");
  document.getElementById("saveButton").onclick = () => togglePanel("savePanel");
  document.getElementById("loadButton").onclick = () => togglePanel("loadPanel");
  document.getElementById("settingsButton").onclick = () => togglePanel("settingsPanel");

  // SKILL TREE BUTTONS
  document.querySelectorAll(".unlockSkill").forEach(btn => {
    btn.addEventListener("click", () => {
      const skillDiv = btn.closest(".skill");
      const skillId = skillDiv.dataset.skill;

      let cost = 1;
      if (skillId === "bureauTraining") cost = 2;
      if (skillId === "raccoonAffinity") cost = 3;

      if (skillPoints < cost) {
        alert("Not enough skill points!");
        return;
      }

      skillPoints -= cost;
      unlockedSkills[skillId] = true;

      localStorage.setItem("skills", JSON.stringify(unlockedSkills));

      updateSkillTreeUI();
    });
  });

  updateSkillTreeUI();
});


