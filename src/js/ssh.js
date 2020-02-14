const { dialog } = require('electron').remote;
const remote = require('electron').remote;

const downloadsFolder = require('downloads-folder');
const Client = require('ssh2').Client;
const path = require('path');
const fs = require('fs');
const ping = require('tcp-ping');
const os = require('os');
const prompt = require('electron-prompt');
const openExplorer = require('open-file-explorer');
const config = require('electron-json-config');

let pingComplete = false;
let pingAvailable = false;
let keyAvailable = false;

probeExist();
keyExist();

//TODO add zip folders for downloads
function keyExist() {
  if (fs.existsSync(path.join(__dirname, 'tys.key'))) {
    window.keyAvailable = true;
  } else {
    displayMessageModal('SSH Key Validation', 'SSH Key file not found.', 'Please upload the key file.');
    window.keyAvailable = false;
  }
}

function probeExist() {
  try {
    ping.probe('10.0.0.2', 22, function (err, available) {
      if (available) {
        window.pingAvailable = true;
        window.pingComplete = true;
      } else {
        displayMessageModal('Internal SSH Ping', 'Unable to reach server. SSH Not Attempted', 'Make sure OpenVPN is running');
        window.pingAvailable = false;
        window.pingComplete = true;
      }
    });
  } catch (e) {
    console.log(e);
  }
}

function setSSHKey() {
  let fileN = getLocalFile('Select the tys.key file.', 'PEM Key Files', ['key'])
    .then(result => {
      if (!result.canceled) {
        fs.copyFile(result.filePaths[0], path.join(__dirname, 'tys.key'), (err) => {
          if (err) throw err;
          console.log('Successfully copied key to internal directory.');
          const connSettings = {
            host: '10.0.0.2',
            port: 22,
            username: 'root',
            privateKey: fs.readFileSync(path.join(__dirname, 'tys.key'))
          };
          config.set('connSettings', connSettings);
        });
      } else {
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function testPingInternal() {
  ping.probe('10.0.0.2', 22, function (err, available) {
    if (available) {
      displayMessageModal('Internal SSH Ping', 'Ping Successful', '');
    } else {
      displayMessageModal('Internal SSH Ping', 'Ping Failed', 'Make Sure OpenVPN is running.');
    }
  });
}

function testPingExternal() {
  ping.probe('theyellowsub.us', 80, function (err, available) {
    if (available) {
      displayMessageModal('External Web Ping', 'Ping Successful', '');
    } else {
      displayMessageModal('External Web Ping', 'Ping Failed', 'The server is most likely down.');
    }
  });
}

function executeCommand() {
  if (!window.pingComplete) {
    displayMessageModal('Please Wait', 'Ping to server has not been completed.', 'This probably means that the internal server is unreachable.');
    return;
  }
  if (window.pingAvailable && window.keyAvailable) {
    showPrompt('Execute Command', 'COMMAND: ', '', doExecuteCommand);
  } else {
    displayMessageModal('Execute Command', 'Connection settings not set.', 'Make sure OpenVPN is running.' + os.EOL + 'Make sure your key has been set.');
  }
}

function doExecuteCommand(command, windowTitle) {
  const conn = new Client();
  let outputArray = [];
  const connSettings = {
    host: '10.0.0.2',
    port: 22,
    username: 'root',
    privateKey: fs.readFileSync(path.join(__dirname, 'tys.key'))
  };
  conn.on('ready', function () {
    console.log('Client :: ready');
    conn.exec(command, function (err, stream) {
      if (err) throw err;
      stream.on('close', function (code, signal) {
        console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        displayMessageArray(outputArray, windowTitle, 'Logging Information: ' + os.EOL + 'Code 0 for success.' + os.EOL + 'Value undefined is usually success.' + os.EOL + os.EOL + 'Code: ' + code.toString() + os.EOL + 'Value: ' + signal);
        conn.end();
      })
        .on('data', function (data) {
          console.log('STDOUT: ' + data);
          outputArray.push(data.toString());
        })
        .stderr
        .on('data', function (data) {
          console.log('STDERR: ' + data);
          displayMessageModal(windowTitle, data.toString(), 'Failed.');
        });
    });
  })
    .connect(connSettings);
}

function downloadFile() {
  if (!window.pingComplete) {
    displayMessageModal('Please Wait', 'Ping to server has not been completed.', 'This probably means that the internal server is unreachable.');
    return;
  }
  if (window.pingAvailable && window.keyAvailable) {
    showPrompt('Download File or Folder', 'PATH: ', '/var/www/pterodactyl/public/dist/TYS_LATEST.zip', doDownloadFile);
  } else {
    displayMessageModal('Download File or Folder', 'Connection settings not set.', 'Make sure OpenVPN is running.' + os.EOL + 'Make sure your key has been set.');
  }
}


function doDownloadFile(filePath) {
  doZipFile(filePath);
  const fileName = getFileName(filePath) + '.zip';
  const conn = new Client();
  const connSettings = {
    host: '10.0.0.2',
    port: 22,
    username: 'root',
    privateKey: fs.readFileSync(path.join(__dirname, 'tys.key'))
  };
  conn.on('ready', function () {
    conn.sftp(function (err, sftp) {
      if (err) throw err;

      let moveFrom = filePath + '.zip';
      let moveTo = downloadsFolder() + '/' + fileName;

      sftp.fastGet(moveFrom, moveTo, {}, function (downloadError) {
        if (downloadError) {
          displayMessageModal('File Download', downloadError.toString(), 'File Download Failed');
          throw downloadError;
        }

        displayMessageModal('File Download', 'File has successfully been downloaded: ' + fileName, 'Files are placed in: ' + downloadsFolder());
      });
    });
  })
    .connect(connSettings);
}

function zipFile() {
  if (!window.pingComplete) {
    displayMessageModal('Please Wait', 'Ping to server has not been completed.', 'This probably means that the internal server is unreachable.');
    return;
  }
  if (window.pingAvailable && window.keyAvailable) {
    showPrompt('Download File or Folder', 'PATH: ', '/var/www/pterodactyl/public/dist/TYS_LATEST.zip', doZipFile);
  } else {
    displayMessageModal('Download File or Folder', 'Connection settings not set.', 'Make sure OpenVPN is running.' + os.EOL + 'Make sure your key has been set.');
  }
}

function doZipFile(filePath) {
  let command = 'zip ' + filePath + '.zip ' + filePath + ' -r';
  doExecuteCommand(command, 'Zip File');
}

function uploadFile() {
  if (!window.pingComplete) {
    displayMessageModal('Please Wait', 'Ping to server has not been completed.', 'This probably means that the internal server is unreachable.');
    return;
  }
  if (window.pingAvailable && window.keyAvailable) {
    getLocalFile()
      .then(r1 => {
        getRemoteFile()
          .then((r2) => {
            if (r2 === null) {
            } else {
              doUploadFile(r1, r2);
            }
          })
          .catch(console.error);
        ;
      })
      .catch(console.error);
  } else {
    displayMessageModal('Download File or Folder', 'Connection settings not set.', 'Make sure OpenVPN is running.' + os.EOL + 'Make sure your key has been set.');
  }
}

function getFileName(filePath) {
  let filePathArray = Array.from(filePath);
  let fileNameArray = [];
  let fileName = '';
  for (let i = (filePathArray.length - 1); i > 0; i--) {
    if (filePathArray[i].toString() === '/') {
      break;
    }
    fileNameArray.unshift(filePathArray[i]);
  }
  fileName = fileNameArray.join('')
    .toString();
  return fileName;
}

function doUploadFile(from, to) {
  const fileName = getFileName();
  const conn = new Client();
  const connSettings = {
    host: '10.0.0.2',
    port: 22,
    username: 'root',
    privateKey: fs.readFileSync(path.join(__dirname, 'tys.key'))
  };

  conn.on('ready', function () {
    conn.sftp(function (err, sftp) {
      if (err) throw err;
      const readStream = fs.createReadStream(from);
      const writeStream = sftp.createWriteStream(to);
      writeStream.on('close', function () {
        console.log('- file transferred succesfully');
      });
      writeStream.on('end', function () {
        console.log('sftp connection closed');
        conn.close();
      });
      readStream.pipe(writeStream);
    });
  })
    .connect(connSettings);
}

function getLocalFile(title, fileTypeName, fileTypes) {
  let options = {
    properties: ['openFile'],
    title: title,
    icon: path.join(__dirname, 'img/app.ico'),
    filters: [
      { name: fileTypeName, extensions: fileTypes }
    ]
  };
  return dialog.showOpenDialog(remote.getCurrentWindow(), options);
}

function getRemoteFile() {
  prompt({
    title: 'Upload File',
    alwaysOnTop: true,
    resizable: true,
    label: 'REMOTE PATH:',
    value: '/var/www/pterodactyl/public/dist/',
    icon: path.join(__dirname, 'img/app.ico'),
    inputAttrs: {
      type: 'input'
    },
    type: 'input'
  }, remote.getCurrentWindow());
}

function listFiles() {
  if (!window.pingComplete) {
    displayMessageModal('Please Wait', 'Ping to server has not been completed.', 'This probably means that the internal server is unreachable.');
    return;
  }
  if (window.pingAvailable && window.keyAvailable) {
    showPrompt('List File Folders', 'PATH: ', '/var/www/pterodactyl/public/dist', doFileList);
  } else {
    displayMessageModal('List Folder Contents', 'Connection settings not set.', 'Make sure OpenVPN is running.' + os.EOL + 'Make sure your key has been set.');
  }
}

function doFileList(remotePathToList) {
  const conn = new Client();
  const connSettings = {
    host: '10.0.0.2',
    port: 22,
    username: 'root',
    privateKey: fs.readFileSync(path.join(__dirname, 'tys.key'))
  };
  conn.on('ready', function () {
    conn.sftp(function (err, sftp) {
      if (err) throw err;
      sftp.readdir(remotePathToList, function (err, list) {
        if (err) throw err;
        let fileList = [];
        fileList.length = list.length;
        for (let i = 0; i < list.length; i++) {
          fileList[i] = list[i]['filename'];
        }
        displayMessageArray(fileList, 'List Folder Contents', 'Folder: ' + remotePathToList);
        conn.end();
      });
    });
  })
    .connect(connSettings);
}

function displayMessageModal(title, message, detail) {
  let options = {
    type: 'info',
    title: title,
    icon: path.join(__dirname, 'img/app.ico'),
    buttons: ['OK'],
    message: message,
    detail: detail
  };
  dialog.showMessageBoxSync(remote.getCurrentWindow(), options);
}

function displayMessage(title, message, detail) {
  let options = {
    type: 'info',
    title: title,
    icon: path.join(__dirname, 'img/app.ico'),
    buttons: ['OK'],
    message: message,
    detail: detail
  };
  dialog.showMessageBoxSync(options);
}

function displayMessageArray(textArray, title, detail) {
  for (let i = 0; i < textArray.length; i++) {
    textArray[i] = textArray[i] + os.EOL;
  }
  displayMessageModal(title, textArray.join('')
    .toString(), detail);
}

function showPrompt(title, label, value, returnFunction) {
  prompt({
    title: title,
    alwaysOnTop: true,
    resizable: true,
    label: label,
    value: value,
    icon: path.join(__dirname, 'img/app.ico'),
    inputAttrs: {
      type: 'input'
    },
    type: 'input'
  }, remote.getCurrentWindow())
    .then((r) => {
      if (r === null) {
      } else {
        returnFunction(r);
      }
    })
    .catch(console.error);
}