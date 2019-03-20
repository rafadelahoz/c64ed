/* Editor things */
const globals = require('./js/globals.js');
const screenDisplay = require('./js/screenDisplay.js');
const tilesetPanel = require('./js/tileset.js');

document.addEventListener('contextmenu', event => event.preventDefault());

screenDisplay.init();
tilesetPanel.init(screenDisplay.render);

