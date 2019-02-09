// Modules to control application life and create native browser window
const electron = require('electron');
const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  Menu,
  Tray,
} = electron;

const path = require('path');
const iconPath = path.join(__dirname, 'icon.png');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let hidden = true;

ipcMain.on('sync', (event, arg) => {
  toggleWindowDisplay();
});

const toggleWindowDisplay = () => {
  if (hidden) {
    mainWindow.show();
  } else {
    mainWindow.hide();
  }
  hidden = !hidden;
};

const createKeyboardShortcuts = () => {
  // Ctrl+Shift+Q toggles display
  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    toggleWindowDisplay();
  });
};

function createWindow() {
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

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: area.width,
    height: area.height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    fullscreen: false,
    skipTaskbar: true,
    useContentSize: true,
  });

  mainWindow.setSize(area.width, area.height);

  // Set tray Icon
  const tray = new Tray(iconPath);

  //Set tray menu
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Show ColorPick', type: 'normal', click() {toggleWindowDisplay();}},
    {label: 'Exit', type: 'normal', click() {mainWindow.close();}},
  ]);

  // Set tray properties
  tray.setTitle('ColorPick');
  tray.setToolTip('ColorPick');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    toggleWindowDisplay();
  });

  tray.on('right-click', () => {
    toggleWindowDisplay();
  });

  // and load the index.html of the app.
  mainWindow.loadFile('./index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Register Keyboard toggle
  createKeyboardShortcuts();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.hide();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
