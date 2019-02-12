// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const robot = require("robotjs");
const electron = require("electron");
const rgbHex = require('rgb-hex');

console.log(1);

let currentCanvas = '';

// Communicate with main process to toggle main display
const toggleDisplay = () => {
  electron.ipcRenderer.send("sync");
};

electron.ipcRenderer.on("toRenderer", (event, args) => {
  try {
    fullscreenScreenshot(image => {
      // set image as frame background
      document.querySelector("body").style =
        "background-image:url(" +
        image +
        ");  background-position: center; background-repeat: no-repeat; background-size: cover;";

        document.querySelector(".circle").classList.remove("close");
        document.querySelector(".circle").classList.add("show");
        document.querySelector(".screen-cover").style = "cursor:crosshair;";

    }, "png");
  } catch (e) {}


});

document.body.addEventListener("mousemove", e => {
  // Get pixel color under the mouse.
  // Get mouse position.
  // const mouse = robot.getMousePos();

  // Get pixel color in hex format.
  
 let rgba = currentCanvas.getImageData(e.pageX, e.pageY,1,1);
 let hex = rgbHex(rgba.data[0], rgba.data[1], rgba.data[2]);
 

 

  document.querySelector(".circle").style["background-color"] = "#" + hex;

  // move circle to mouse
  const x = e.pageX;
  const y = e.pageY;

  let marginY = 7;
  let marginX = 7;

  const circleSize = 70;

  const screen = electron.screen;
  const displays = screen.getAllDisplays();
  const primaryDisplay = displays[0];
  const area = {
    width: primaryDisplay.bounds.width,
    height: primaryDisplay.bounds.height
  };

  // Support for multi Screens, still waiting for RobotJS to work on multi
  displays.forEach(display => {
    // Add X and Y to calculate additional screen deltas
    area.width += display.bounds.x;
    area.height += display.bounds.y;
  });

  // Get mid zone
  let midWidth = area.width / 2;
  let midHeight = area.height / 2;

  if (x > midWidth) {
    marginX = marginX * -1 - circleSize;
  }

  if (y > midHeight) {
    marginY = marginY * -1 - circleSize;
  }

  document.querySelector(".circle").style["top"] = y + marginY + "px";
  document.querySelector(".circle").style["left"] = x + marginX + "px";
});

document.body.addEventListener("click", (e) => {
  // Get pixel color under the mouse.
  // Get mouse position.
  // const mouse = robot.getMousePos();

  // Get pixel color in hex format.
  let rgba = currentCanvas.getImageData(e.pageX, e.pageY,1,1);
  let hex = rgbHex(rgba.data[0], rgba.data[1], rgba.data[2]);

  // copy to clipboard
  electron.clipboard.writeText("#" + hex);

  // add close animation
  document.querySelector(".circle").classList.remove("show");
  document.querySelector(".circle").classList.add("close");
  // hide cursor
  document.querySelector(".screen-cover").style = "cursor:none;";

  //close after timeout to allow animation to end
  setTimeout(() => {
    toggleDisplay();
  }, 150);
});


fullscreenScreenshot = (callback, imageFormat) => {
  var _this = this;
  this.callback = callback;
  imageFormat = imageFormat || "image/jpeg";

  this.handleStream = stream => {
    // Create hidden video tag
    var video = document.createElement("video");
    video.style.cssText = "position:absolute;top:-10000px;left:-10000px;";
    // Event connected to stream
    video.onloadedmetadata = function() {
      // Set video ORIGINAL height (screenshot)
      this.videoHeight = video.style.height + "px"; // videoHeight
      this.videoWidth = video.style.width + "px"; // videoWidth

      // Create canvas
      var canvas = document.createElement("canvas");
      canvas.width = this.videoWidth;
      canvas.height = this.videoHeight;
      var ctx = canvas.getContext("2d");
      // Draw video on canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      currentCanvas = ctx;
      if (_this.callback) {
        // Save screenshot to base64
        _this.callback(canvas.toDataURL(imageFormat));
      } else {
        console.log("Need callback!");
      }

      // Remove hidden video tag
      video.remove();
      try {
        // Destroy connect to stream
        stream.getTracks()[0].stop();
      } catch (e) {}
    };

    video.src = URL.createObjectURL(stream);
    video.autoplay = true;
    document.body.appendChild(video);
  };

  this.handleError = function(e) {
    console.log(e);
  };

  // Filter only screen type
  electron.desktopCapturer.getSources(
    { types: ["screen"] },
    (error, sources) => {
      if (error) throw error;
      // console.log(sources);
      for (let i = 0; i < sources.length; ++i) {
        // Filter: main screen
        if (sources[i].name === "Entire screen") {
          navigator.webkitGetUserMedia(
            {
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: "desktop",
                  chromeMediaSourceId: sources[i].id,
                  minWidth: 1280,
                  maxWidth: 4000,
                  minHeight: 720,
                  maxHeight: 4000
                }
              }
            },
            this.handleStream,
            this.handleError
          );

          return;
        }
      }
    }
  );
};
