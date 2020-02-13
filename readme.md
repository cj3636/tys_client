## Bare Bones Electron-Forge Application

* Currently only supports Windows: 
    * Icon URL
    * System Tray
    * Application Control Bar/Menu
* The TitleBar/Menu/Control Bar is not to Electron Specifications. It is secure however.
* All relevant config features are in `package.json`.
    * For additional Squirrel Maker File support see [Here]

### Getting Started
1. Clone the Repo
    git clone --single-branch --branch bare https://github.com/cj3636/tys_client
2. In the repo using either your IDE built-in terminal or similiar (CMD) run
    * It is best you edit package.json to suite your needs first
    `npm install`
        * This will install all dependencies in package.json
        * devDependencies are only compiled in the dev environment. They are not used during runtime.
        * To install new runtime dependencies (permanently to this APP)
            `npm install --save PACKAGENAME@VERSION`
        * To install new development dependencies (permanently to this APP)
            `npm install --saveDev PACKAGENAME@VERSION`
3. To start development see main.js. This is defined via the `"main": "src/main.js"` line in your package.json.
### Additional Notes          
* TitleBar.js and Render.js are duplicates. They must remain this way when you edit the title bar.
    * TitleBar.js controls the titlebar when the app is compiled.
    * Renderer.js controls the titlebar at runtime.
    * This is a hack way to make a TitleBar. We will be implementing [VueJS] in the future.

[Here]: https://js.electronforge.io/maker/squirrel/interfaces/makersquirrelconfig

[VueJS]: https://vuejs.org/v2/guide/