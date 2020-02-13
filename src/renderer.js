const { Menu, app, remote } = require('electron');
// the package for the custom titlebar
const customTitleBar = require('custom-electron-titlebar');
// Electrons actual menu bar method/class
const menu = new remote.Menu();

const config = require('electron-json-config');
// Backend JQuery for switching web pages
require('jquery');
// Self explanatory... Not used. But 100% should be.
const pages = ['index', 'home', 'site', 'ssh', 'tryptor'];
// I use the config to remember what page the user was on. This persists after the app is closed.
if (config.get('currentPage') != null) {
  switch (config.get('currentPage')) {
    case 1:
      openHome();
      break;
    case 2:
      openSite();
      break;
    case 3:
      openDemo();
      break;
    case 4:
      openTryptor();
      break;
  }
}
// This is where you can edit the settings for the title bar.
//https://www.npmjs.com/package/custom-electron-titlebar
const TryptorMainTitleBar = new customTitleBar.Titlebar({
  backgroundColor: customTitleBar.Color.fromHex('#202225'),
  //The titlebar package converts the icon to a relative path for you... Super annoying.
  icon: './img/logo.png',
  overflow: 'hidden',
  shadow: false,
});
// Add buttons to the menu.
// @click: what happens when the button is pressed.
// Type is used when you want drop downs. See the docs.
menu.append(new remote.MenuItem({
  label: 'Home',
  click: () => openHome(),
  type: 'separator',
}));

menu.append(new remote.MenuItem({
  label: 'Website',
  click: () => openSite(),
  type: 'separator',
}));

menu.append(new remote.MenuItem({
  label: 'DEMO',
  click: () => openDemo(),
  type: 'separator',
}));

menu.append(new remote.MenuItem({
  label: 'Tryptor',
  click: () => openTryptor(),
  type: 'separator',
}));
//If in Dev mode, append the Debug button.
if (config.get('devMode')) {
  menu.append(new remote.MenuItem({
    label: 'Debug',
    click: () => toggleDev(),
    type: 'separator',
  }));
}
// This is super basic, just references the current browser window and opens the built in Chromium Debug Tools.
function toggleDev() {
  if (remote.getCurrentWindow()
    .webContents
    .isDevToolsOpened()) {
    remote.getCurrentWindow()
      .webContents
      .closeDevTools();
  } else {
    remote.getCurrentWindow()
      .webContents
      .openDevTools();
  }
}
// Unecessary extrapolation of the functions that open the webpages.
function openHome() {
  openPage('home');
  config.set('currentPage', 1);
}

function openSite() {
  openPage('site');
  config.set('currentPage', 2);
}

function openDemo() {
  openPage('demo');
  config.set('currentPage', 3);
}

function openTryptor() {
  openPage('tryptor');
  config.set('currentPage', 4);
}
// This hunk of fuckery is how we use xhr HTTPX requests to change what the BrowserWindow Displays.
// You CAN just use the function seen in main.js (mainWindow.loadURL(`file://${__dirname}/main.html`);) but it is super slow.
// This will all be gutted when vue.js is added.
function openPage(page) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', page + '.html', true);
  xhr.onreadystatechange = function () {
    if (this.readyState !== 4) return;
    if (this.status !== 200) return;
    document.getElementById('page').innerHTML = this.responseText;
  };
  xhr.send();
}
// Bad. Don't use it. You will re-run the script every time you reload the page. This is why all scripts are preloaded in main.html
// If you need a script to run every time a page is opened create an 'onload' method in that pages html.
// <body onload="myFunction()">
// Update the menu with our appended menu object.
TryptorMainTitleBar.updateMenu(menu);
// See titleBar.js.