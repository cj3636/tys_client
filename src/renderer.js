const { Menu, app, remote } = require('electron');

const customTitleBar = require('custom-electron-titlebar');

const menu = new remote.Menu();

const config = require('electron-json-config');

require('jquery');

const pages = ['index', 'home', 'panel', 'ssh', 'tryptor'];

if (config.get('currentPage') != null) {
  switch (config.get('currentPage')) {
    case 1:
      openHome();
      break;
    case 2:
      openPanel();
      break;
    case 3:
      openSSH();
      break;
    case 4:
      openTryptor();
      break;
  }
}

const TryptorMainTitleBar = new customTitleBar.Titlebar({
  backgroundColor: customTitleBar.Color.fromHex('#202225'),
  icon: './img/logo.png',
  overflow: 'hidden',
  shadow: false,
});

menu.append(new remote.MenuItem({
  label: 'Home',
  click: () => openHome(),
  type: 'separator',
}));

menu.append(new remote.MenuItem({
  label: 'Panel',
  click: () => openPanel(),
  type: 'separator',
}));

menu.append(new remote.MenuItem({
  label: 'SSH',
  click: () => openSSH(),
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

function openPanel() {
  openPage('panel');
  config.set('currentPage', 2);
}

function openSSH() {
  openPage('ssh');
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

function openPageWithScript(page) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', page + '.html', true);
  xhr.onreadystatechange = function () {
    if (this.readyState !== 4) return;
    if (this.status !== 200) return; // or whatever error handling you want
    document.getElementById('page').innerHTML = this.responseText;
    let contentScript = document.getElementById('sshScript');
    let script = document.createElement('script');
    //script.textContent = contentScript.textContent;
    document.body.appendChild(script);
  };
  xhr.send();
}

TryptorMainTitleBar.updateMenu(menu);
