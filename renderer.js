// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const robot = require("robotjs");

document.body.addEventListener("mousemove", e => {
  // Get pixel color under the mouse.
  // Get mouse position.
  var mouse = robot.getMousePos();

  // Get pixel color in hex format.
  var hex = robot.getPixelColor(mouse.x, mouse.y);
  // document.querySelector(".color-hex").innerHTML = "#" + hex;
  document.querySelector(".circle").style["background-color"] = "#" + hex;

  // move circle to mouse
  var x = e.pageX,
    y = e.pageY;

  document.querySelector(".circle").style["top"] = y + 7 + "px";
  document.querySelector(".circle").style["left"] = x + 7 + "px";
});

document.body.addEventListener("click", () => {
  // Get pixel color under the mouse.
  // Get mouse position.
  var mouse = robot.getMousePos();

  // Get pixel color in hex format.
  var hex = robot.getPixelColor(mouse.x, mouse.y);
  // copy to clipboard
  const { clipboard } = require("electron");
  clipboard.writeText("#" + hex);

  document.querySelector(".circle").classList.add("close");

  // close app
  const remote = require("electron").remote;
  let w = remote.getCurrentWindow();

  //close after timeout to allow animation to end
  setTimeout(() => {
    w.close();
  }, 150);
});
