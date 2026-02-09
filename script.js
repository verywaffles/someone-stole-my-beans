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

  // If this scene is an ending, unlock achievement
  if (ACHIEVEMENTS[sceneName]) {
    unlockAchievement(sceneName);
  }

  document.getElementById("text").innerText = scene.text;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  scene.choices.forEach(choice => {

    // Hide choices requiring items the player doesn't have
    if (choice.requires && !hasItem(choice.requires)) {
      return;
    }

    const btn = document.createElement("button");
    btn.innerText = choice.label;

    btn.onclick = () => {

      // Give item if this choice grants one
      if (choice.item) {
        addItem(choice.item);
      }

      // If next is an ending, handle ending
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
// GAME START BUTTON
// ===============================
document.getElementById("playButton").onclick = () => {
  document.getElementById("titleScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  loadScene("start");
};


// ===============================
// RESTART FUNCTION
// ===============================
function restartGame() {
  loadScene("start");
}
// COLLAPSIBLE MENU
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const menuPanel = document.getElementById("menuPanel");

  if (menuToggle && menuPanel) {
    menuToggle.addEventListener("click", () => {
      menuPanel.classList.toggle("open");
    });
  }
});



