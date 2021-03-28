const { remote, ipcRenderer } = require("electron");
const howToCloseBtn = document.getElementById("howToCloseBtn");

howToCloseBtn.addEventListener("click", () => {
  let mainWindow = remote.getGlobal("mainWindow");
  if (mainWindow) {
    mainWindow.webContents.send("enable-how-to-button");
  }
  let w = remote.getCurrentWindow();
  w.close();
});
