const config = require('electron-json-config');

let servers = {};

function addServer(name, ip, port, key) {
  servers[name] = { ip: ip, port: port, key: key };
}

function initDefaults() {
  addServer('cjserver', '10.0.0.2', '22', '');
  addServer('cjserver2', '10.0.0.3', '22', '');
  addServer('cjserver3', '10.0.0.4', '22', '');
}

function saveServers() {
  config.set('servers', servers);
}

if (!config.has('firstRun')) {
  config.set('firstRun', false);
  initDefaults();
}