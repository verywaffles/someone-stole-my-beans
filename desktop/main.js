const { app, BrowserWindow } = require("electron");
const path = require("path");

const win = new BrowserWindow({
  width: 1200,
  height: 800,
  title: "Someone Stole My Beans",
  icon: path.join(__dirname, "game", "favicon.png"),
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true
  }
});


  win.loadFile(path.join(__dirname, "game", "index.html"));


app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
