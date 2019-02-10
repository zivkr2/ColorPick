// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const robot = require('robotjs');
const electron = require('electron');

// Communicate with main process to toggle main display
const toggleDisplay = () => {
  electron.ipcRenderer.send('sync');
};

electron.ipcRenderer.on('toRenderer', (event, args) => {
  document.querySelector('.circle').classList.remove('close');
});

document.body.addEventListener('mousemove', e => {
  // Get pixel color under the mouse.
  // Get mouse position.
  const mouse = robot.getMousePos();

  // Get pixel color in hex format.
  const hex = robot.getPixelColor(mouse.x, mouse.y);
  // document.querySelector(".color-hex").innerHTML = "#" + hex;
  document.querySelector('.circle').style['background-color'] = '#' + hex;

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
    height: primaryDisplay.bounds.height,
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
    marginX = (marginX * -1) - circleSize;
  }

  if (y > midHeight) {
    marginY = (marginY * -1) - circleSize;
  }

  document.querySelector('.circle').style['top'] = y + marginY + 'px';
  document.querySelector('.circle').style['left'] = x + marginX + 'px';
});

document.body.addEventListener('click', () => {
  // Get pixel color under the mouse.
  // Get mouse position.
  const mouse = robot.getMousePos();

  // Get pixel color in hex format.
  const hex = robot.getPixelColor(mouse.x, mouse.y);

  // copy to clipboard
  electron.clipboard.writeText('#' + hex);

  //close after timeout to allow animation to end
  setTimeout(() => {
    toggleDisplay();
  }, 150);
});
