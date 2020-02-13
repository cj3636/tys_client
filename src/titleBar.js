// This is (almost) a copy of render.js
// See below for differences.
const remote = require('electron');

const menu = new remote.Menu();

const config = require('electron-json-config');

require('jquery');
// There is no custom TitleBar object in this file.
// electron-custom-titlebar is not imported.
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

if (config.get('devMode')) {
  menu.append(new remote.MenuItem({
    label: 'Debug',
    click: () => toggleDev(),
    type: 'separator',
  }));
}

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

// This overrides the default electron Menu class/method.
// Instead of using our custom package, we have to use electrons menu
remote.Menu.setApplicationMenu(menu);
