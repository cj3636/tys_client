//Static Constant reference to the 'app'. Used to remote, this is the remote (or RENDER) thread.
// Because Electron uses CHROMIUM, we must have a separate thread for the Browser API.
// DOCS: https://www.electronjs.org/docs/tutorial/application-architecture
const BrowserWindow = require('electron').BrowserWindow;
// Static Constant reference to the Browser Window.
// This variable is the window you see when the app opens.
// You can create new ones or modal ones, but they must be done from the MAIN thread (require('electron'))
// The only time this will become an issue is when you need to share data between two different windows that are not parent's/child's of each other.
const app = require('electron').app;
// path variable to create relative references to the files in the app on any filesystem
const path = require('path');
// stands for File System. It is unused here, but it can control external files (i.e copy/paste/read/write).
const fs = require('fs');
//External package that creates a json config file. This will be located in %appdata%/APPNAME/config.json
const config = require('electron-json-config');
// when you run npm make this will prevent the app from starting up.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

// Create the main Browser Window instance for the app
// the = () =>  points the variable createWindow to the json array below
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    //This is self explanatory...
    width: 800,
    height: 700,
    minWidth: 800,
    minHeight: 700,
    //This is to disable electron's default window/menu/title/control bar
    frame: false,
    //The color while the renderer is loading
    backgroundColor: '#2e2c29',
    //sets the path to the icon. __dirname is created on install and references the installs /src/ directory (this folder)
    icon: path.join(__dirname, 'img/app.ico'),
    // These are security settings...that we are disabling. nodeIntegration allows us to use our packages in the browserwindow.
    // It is safe as long as you don't have crap code or access external websites without SSL
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      //Allows a website to be displayed inside the app. See <webview> tag.
      webviewTag: true,
    },
    // Don't show the app until it's ready (See below method)
    show: false,
  });

  // Once the window is fully loaded, actually show it to the user
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    // Below will help you debug. It opens the dev tools automagically
    // mainWindow.webContents.openDevTools();
  });

  // Load the index.html of the app.
  // This is the main page. Everything you do goes in this file.
  mainWindow.loadURL(`file://${__dirname}/main.html`);

  // Some crappy workaround to make the window controls work
  // without having to show the window before its ready
  //Will be fixed with vue.js
  mainWindow.unmaximize();
  if (config.get('devMode')) {
    mainWindow.webContents.openDevTools();
  }
  // Event that is emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
// Config Settings
// https://www.npmjs.com/package/electron-json-config
// config.set('name', valueStuff);
// config.get('name');
// valueStuff can be anything, just make sure you use it correctly.
// These will only appear in Config.json once set. It may be smart to create a firstTimeSetup variable to make sure the config.json and the variables are generated only once.

// This is how we can control whether or not the debug button is visible. (see renderer.js)
config.set('devMode', true);

// Initialize the MAIN process titlebar.
require('./titleBar.js');
// See main.html