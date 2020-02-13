// Remember this file is imported from the main.html webpage. So it was already loaded when the actual demo.html page was loaded.
const { dialog } = require('electron').remote;
const { remote } = require('electron');

const path = require('path');
const os = require('os');
// This is a fancy electron prompt package. https://www.npmjs.com/package/electron-prompt
const prompt = require('electron-prompt');
// If you need it...
//const config = require('electron-json-config');

// Our test functions.

// Displays a regular old message to the user.
function demoDisplayMessage() {
  displayMessage('Hello!', 'I am a message you can ignore.', 'Bite my shiny metal ***');
}

function demoDisplayMessageModal() {
  displayMessageModal('Hello 2!', 'I am a message you can not ignore.', 'You can\'t use the app until you click X on me');
}

function demoUploadFile() {
  getLocalFile('Upload a file', 'Image file', ['png', 'bmp', 'gif', 'jpg', 'jpeg'], fakeReturnFunctionFile);
}

function demoPromptInfo() {
  showPrompt('I would like you to acknowledge this announcement.', 'Some details and such.', 'Type Things Here', fakeReturnFunctionPrompt);
}

function demoPromptFancy() {
  showFancyPrompt('Ah check ye box mate', 'They a box.', 'vox', fakeReturnFunctionPromptFancy);
}

function fakeReturnFunctionPromptFancy(returnResult) {
  if (returnResult === 'box1') {
    displayMessageModal('THA box', 'You checked the default box!', returnResult);
  } else {
    displayMessageModal('THA box', 'YOU CHECKED LE BOX: ', returnResult);
  }
}

function fakeReturnFunctionFile(returnResult) {
  // returnResult is  an array of arrays and other data. conole.log(returnResult) to see all of it.
  if (!returnResult['canceled']) {
    //Have to use array, because the user could select more than one file (but we disabled that)
    displayMessageArrayModal(returnResult['filePaths'], 'The file you selected: ', 'Pretty neet ah?');
  } else {
    displayMessageModal('This is a CANCEL. YOU ARE CANCELED. lemons', 'Uh, come on man you gotta have at least ONE picture...', 'Anti-art NOOB');
  }
}

function fakeReturnFunctionPrompt(returnResult) {
  // returnResult is  an array of arrays and other data. conole.log(returnResult) to see all of it.
  if (returnResult != null) {
    if (returnResult === 'Type Things Here') {
      displayMessageModal('Your Text Input', 'Uh, you said what I said?', 'lame0');
    } else {
      if (returnResult === '') {
        displayMessageModal('Your Text Input', 'The thing you said... was empty.. ', 'Not even a space!');
      } else {
        displayMessageModal('Your Text Input', 'The thing you said: ', returnResult);
      }
    }
  } else {
    displayMessageModal('undefined', 'Uh, you didnt say nuttin', 'lame');
  }
  //Have to use array, because the user could select more than one file (but we disabled that)
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
  displayMessage(title, textArray.join('')
    .toString(), detail);
}

function displayMessageArrayModal(textArray, title, detail) {
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
        displayMessageModal('A generic cancel message', 'A generic cancel message', 'A generic cancel message');
      } else {
        returnFunction(r);
      }
    })
    .catch(console.error);
}

function showFancyPrompt(title, label, value, returnFunction) {
  prompt({
    title: title,
    alwaysOnTop: true,
    resizable: true,
    label: label,
    buttonLabels: ['YES', 'GO AWAY'],
    icon: path.join(__dirname, 'img/app.ico'),
    selectOptions: {
      box1: 'THE FIRST BOX',
      box2: 'THE SECOND BOX',
      box3: 'THE THIRD BOX',
      box4: 'THE FOURTH BOX'
    },
    type: 'select'
  }, remote.getCurrentWindow())
    .then((r) => {
      if (r === null) {
        displayMessageModal('A fancy cancel message', 'A fancy cancel message', 'A fancy cancel message');
      } else {
        returnFunction(r);
      }
    })
    .catch(console.error);
}

function getLocalFile(title, fileTypeName, fileTypes, returnFunction) {
  let options = {
    properties: ['openFile'],
    title: title,
    icon: path.join(__dirname, 'img/app.ico'),
    filters: [
      { name: fileTypeName, extensions: fileTypes }
    ]
  };
  dialog.showOpenDialog(remote.getCurrentWindow(), options)
    .then((r) => {
      if (r === null) {
      } else {
        returnFunction(r);
      }
    })
    .catch(console.error);
}