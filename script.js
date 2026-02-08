let story = {};
let currentScene = "start";

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
