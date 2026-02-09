let story = {};
let currentScene = "start";
let inventory = [];

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

fetch("story.json")
  .then(res => res.json())
  .then(data => {
    story = data;
    // Do NOT start the game automatically
// loadScene(currentScene);

  });

function loadScene(sceneName) {
  const scene = story[sceneName];
  currentScene = sceneName;

  // ⭐ Unlock achievement if this scene is an ending
  if (ACHIEVEMENTS[sceneName]) {
    unlockAchievement(sceneName);
  }

  document.getElementById("text").innerText = scene.text;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.label;
    btn.onclick = () => loadScene(choice.next);
    choicesDiv.appendChild(btn);
  });
}
document.getElementById("playButton").onclick = () => {
  document.getElementById("titleScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  loadScene("start");
};
function restartGame() {
  loadScene("start");
}
function addItem(item) {
  if (!inventory.includes(item)) {
    inventory.push(item);
    alert("You obtained: " + item);
  }
}

function removeItem(item) {
  inventory = inventory.filter(i => i !== item);
}

function hasItem(item) {
  return inventory.includes(item);
}


