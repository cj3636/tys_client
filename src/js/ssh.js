const downloadsFolder = require('downloads-folder');

const Client = require('ssh2').Client;
const path = require('path');
const fs = require('fs');
const ping = require('tcp-ping');
const connSettings = null;
const prompt = require('electron-prompt');
const openExplorer = require('open-file-explorer');

const privateKey = null;

const downloadPath = '/var/www/pterodactyl/public/tys/modpack/TYS_LATEST.zip';
const downloadPathArray = Array.from(downloadPath);

/**
 * @return {string}
 */
function getSSHKeyFile() {
  let file = document.getElementById('SSHkey').files[0];
  let reader = new FileReader();
  reader.onload = function (e) {
    window.privateKey = fs.readFileSync(path.join(file.path[0]));

  };
}

//TODO MAKE FUNCTION TO GRAB FILE NAME FROM PATH FOR OUTPUT FILE
let charAt = '';
let finalString = '';
for (let i = (downloadPath.length - 1); i !== 0; i--) {
  if (downloadPathArray[i] !== '/') {
    finalString += downloadPathArray[i];
  } else {
    console.log(reverseString(finalString));
    break;
  }
}

/**
 * @return {string}
 */
function reverseString(str) {
  if (!str || str.length < 2 ||
    typeof str !== 'string') {
    return 'Not valid';
  }
  const revArray = [];
  const length = str.length - 1;
  for (let i = length; i >= 0; i--) {
    revArray.push(str[i]);
  }
  return revArray.join('');
}

function createConnection() {
  ping.probe('10.0.0.2', 22, function (err, available) {
    if (available) {
      window.connSettings = {
        host: '10.0.0.2',
        port: 22,
        username: 'root',
        privateKey: privateKey
      };
      console.log('Connection Successful.');
    } else {
      console.log('Ping to TYS Internal Server Failed. SSH not attempted.');

    }
  });
}

function uploadSSHFile() {
  if (window.connSettings != null) {
    let file = document.getElementById('uploadSSH').files[0];
    let reader = new FileReader();
    reader.onload = function (e) {

    };
  } else {
    alert('Connection not established. Unable to reach server. Is OpenVPN running?');
  }
}

function downloadFile() {
  createConnection();
  if (window.connSettings != null) {
    let conn = new Client();
    conn.on('ready', function () {
      conn.sftp(function (err, sftp) {
        if (err) throw err;
        let moveFrom = prompt({
          title: 'Download File From Server',
          label: 'Server File Path:',
          value: downloadPath.toString(),
          type: 'input',
          icon: '../img/app.ico',
          inputAttrs: { type: 'text', required: true },
        })
          .then((r) => {
            if (r === null) {
              console.log('User Cancelled');
            } else {
              sftp.fastGet(r, downloadsFolder() + '/download.zip', {}, function (downloadError) {
                if (downloadError) throw downloadError;
                console.log('Succesfully Downloaded');
                openExplorer(downloadsFolder(), err => {
                  if (err) {
                    console.log(err);
                  } else {
                  }
                });
              });
            }
          })
          .catch(console.error);
      });
    }).connect(window.connSettings);
  } else {
    alert('Connection not established. Unable to reach server. Is OpenVPN running?');
  }
}