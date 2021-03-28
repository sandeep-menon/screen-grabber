const { ipcRenderer, remote, desktopCapturer } = require("electron");
const path = require("path");
const fs = require("fs");
const appStartBtn = document.getElementById("appBtnStart");
const appStopBtn = document.getElementById("appBtnStop");
const appCloseBtn = document.getElementById("appBtnClose");
const howToBtn = document.getElementById("howToBtn");
const appHintText = document.getElementById("appHintText");
const appBanner = document.getElementById("appBanner");

appBanner.addEventListener("mousedown", () => {
  appBanner.classList.add("app-banner-grabbed");
});

appBanner.addEventListener("mouseup", () => {
  appBanner.classList.remove("app-banner-grabbed");
});

const screenWidth = window.screen.width;
const screenHeight = window.screen.height;

appStartBtn.addEventListener("click", () => {
  appStartBtn.setAttribute("disabled", "");
  appStopBtn.removeAttribute("disabled");
  ipcRenderer.send("start-listen");
});

appStopBtn.addEventListener("click", () => {
  appStopBtn.setAttribute("disabled", "");
  appStartBtn.removeAttribute("disabled");
  //ipcRenderer.send("stop-listen");
  ipcRenderer.send("preview");
});

appCloseBtn.addEventListener("click", () => {
  let w = remote.getCurrentWindow();
  w.close();
});

howToBtn.addEventListener("click", () => {
  ipcRenderer.send("open-how-to");
  howToBtn.setAttribute("disabled", "");
});

ipcRenderer.on("enable-how-to-button", (event, args) => {
  howToBtn.removeAttribute("disabled");
});

ipcRenderer.on("screenshot-capture", (event, args) => {});

ipcRenderer.on("stopped-capture", () => {});

ipcRenderer.on("disable-start-capture", () => {
  appStartBtn.setAttribute("disabled", "");
  appCloseBtn.setAttribute("disabled", "");
  howToBtn.setAttribute("disabled", "");
});

ipcRenderer.on("enable-start-capture", () => {
  appStartBtn.removeAttribute("disabled");
  appCloseBtn.removeAttribute("disabled");
  howToBtn.removeAttribute("disabled");
});

ipcRenderer.on("screenshot-captured", () => {
  appHintText.innerText = "Captured!";
  setTimeout(function () {
    appHintText.innerText = "";
  }, 1000);
});

ipcRenderer.on("capture-screenshot", () => {
  getScreenshot();
});

function getScreenshot() {
  desktopCapturer
    .getSources({
      types: ["window", "screen"],
      thumbnailSize: { width: screenWidth, height: screenHeight },
      fetchWindowIcons: false,
    })
    .then(async (sources) => {
      for (var i = 0; i < sources.length; i++) {
        if (
          sources[i].name == "Entire Screen" ||
          sources[i].name == "Screen 1"
        ) {
          imageU8Array = sources[i].thumbnail.toPNG();
          base64Image = u8tob64(imageU8Array);
        }
      }

      if (base64Image != null || base64Image != "") {
        writeToLocalJSONFile(base64Image);
      }
    });
}

function u8tob64(u8array) {
  var bin = "";
  var bytes = new Uint8Array(u8array);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return window.btoa(bin);
}

function writeToLocalJSONFile(base64Image) {
  let rawData = fs.readFileSync("imageData.json");
  let jsonData = JSON.parse(rawData);
  let date = new Date();
  let timeStamp = date.toISOString();

  let newIndex = Object.keys(jsonData).length;

  jsonData[newIndex] = {
    timestamp: timeStamp,
    data: base64Image,
    comment: "",
  };

  rawData = JSON.stringify(jsonData);
  fs.writeFileSync("imageData.json", rawData);
}
