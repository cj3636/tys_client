const remote = require('electron');

const menu = new remote.Menu();

const Config = require('electron-config');

const config = new Config();

require('jquery');


menu.append(new remote.MenuItem({
  label: 'Home',
  click: () => goHome(),
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

function goHome() {
  openPage('home');
}

function openPanel() {
  openPage('panel');
}

function openSSH() {
  openPageWithScript('ssh');
}

function openTryptor() {
  openPage('tryptor');
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
    script.textContent = contentScript.textContent;
    document.body.appendChild(script);
  };
  xhr.send();
}

remote.Menu.setApplicationMenu(menu);
