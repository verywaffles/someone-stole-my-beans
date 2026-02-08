let story = {};
let currentScene = "start";
const ACHIEVEMENTS = {
  endingVictory: "Bean Hero",
  endingHalfBeans: "Halfway There",
  endingSyndicate: "Bean King",
  endingCoward: "Coward",
  endingCry: "Crybaby",
  endingGiveUp: "Gave Up",
  endingCompensation: "Compensated",
  endingQuest: "Granola Quest"
};
function unlockAchievement(endingId) {
  let unlocked = JSON.parse(localStorage.getItem("achievements")) || {};

  if (!unlocked[endingId]) {
    unlocked[endingId] = true;
    localStorage.setItem("achievements", JSON.stringify(unlocked));

    showAchievementPopup(ACHIEVEMENTS[endingId]);
  }
}

fetch("story.json")
  .then(res => res.json())
  .then(data => {
    story = data;
    loadScene(currentScene);
  });

function loadScene(sceneName) {
  const scene = story[sceneName];
  currentScene = sceneName;

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
