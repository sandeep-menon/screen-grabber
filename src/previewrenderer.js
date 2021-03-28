const { ipcRenderer, remote } = require("electron");
const path = require("path");
const fs = require("fs");
const appExportHTMLBtn = document.getElementById("exportHTML");
const appExportPDFBtn = document.getElementById("exportPDF");

ipcRenderer.send("displaying-preview");
let mainWindow = remote.getGlobal("mainWindow");
if (mainWindow) {
  mainWindow.webContents.send("disable-start-capture");
}

let rawData = fs.readFileSync("imageData.json");
let jsonData = JSON.parse(rawData);
let jsonDataLength = Object.keys(jsonData).length;

for (var i = 0; i < jsonDataLength; i++) {
  let timestamp = jsonData[i].timestamp;
  let data = jsonData[i].data;
  let comment = jsonData[i].comment;

  var elemParent = document.createElement("div");
  elemParent.classList.add("text-image-container");
  var elemTimestamp = document.createElement("div");
  elemTimestamp.classList.add("text");
  elemTimestamp.innerText = timestamp;
  elemParent.appendChild(elemTimestamp);

  if (comment == "") {
    var elemComment = document.createElement("div");
    elemComment.classList.add("text");
    elemComment.innerText = comment;
    var elemAddCommentButton = document.createElement("button");
    elemAddCommentButton.setAttribute("class", "btn btn-outline-info btn-sm");
    elemAddCommentButton.setAttribute("id", "addComment_" + i);
    elemAddCommentButton.setAttribute("data-toggle", "modal");
    elemAddCommentButton.setAttribute("data-target", "#exampleModal");
    elemAddCommentButton.setAttribute("data-buttonid", i);
    elemAddCommentButton.setAttribute("data-comment", comment);
    elemAddCommentButton.innerText = "Add comment";
    elemComment.appendChild(elemAddCommentButton);
    elemParent.appendChild(elemComment);
  } else {
    var elemComment = document.createElement("div");
    elemComment.classList.add("text");
    elemComment.innerText = comment;
    var elemAddCommentButton = document.createElement("button");
    elemAddCommentButton.setAttribute(
      "class",
      "btn btn-outline-info btn-sm float-right"
    );
    elemAddCommentButton.setAttribute("id", "addComment_" + i);
    elemAddCommentButton.setAttribute("data-toggle", "modal");
    elemAddCommentButton.setAttribute("data-target", "#exampleModal");
    elemAddCommentButton.setAttribute("data-buttonid", i);
    elemAddCommentButton.setAttribute("data-comment", comment);
    elemAddCommentButton.innerText = "Edit comment";
    elemComment.appendChild(elemAddCommentButton);
    elemParent.appendChild(elemComment);
  }

  var elemData = document.createElement("div");
  elemData.classList.add("image");
  var elemImage = document.createElement("img");
  var imageDataAttributeValue = "data:image/png;base64, " + data + "";
  elemImage.setAttribute("src", imageDataAttributeValue);
  elemData.appendChild(elemImage);
  elemParent.appendChild(elemData);

  var elemLine = document.createElement("hr");
  elemParent.appendChild(elemLine);

  var placeHolder = document.getElementById("previewPlaceholder");
  placeHolder.append(elemParent);
}

const addCommentBtn = document.getElementById("exampleModal");

$("#exampleModal").on("show.bs.modal", function (event) {
  var button = $(event.relatedTarget);
  var buttonid = button.data("buttonid");
  var currentData = button.data("comment");
  var modal = $(this);
  modal.find(".modal-body textarea").val(currentData);
  modal
    .find("button.btn-success")
    .attr("onclick", "updateComment(" + buttonid + ")");
  setTimeout(function () {
    document.getElementById("message-text").focus();
  }, 1000);
});

function updateComment(id) {
  //   console.log("update comment for id = " + id);
  let newComment = $("#exampleModal").find("#message-text").val();
  newComment = newComment.replace(/\n/gi, "<br>");
  let rawData = fs.readFileSync("imageData.json");
  let jsonData = JSON.parse(rawData);

  jsonData[id].comment = newComment;

  rawData = JSON.stringify(jsonData);
  fs.writeFileSync("imageData.json", rawData);
  $("#exampleModal").find("button.btn-secondary").click();
  location.reload();
}

appExportHTMLBtn.addEventListener("click", () => {
  ipcRenderer.send("stop-listen");
});

appExportPDFBtn.addEventListener("click", () => {
  ipcRenderer.send("stop-listen-pdf");
});
