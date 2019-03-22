/* Editor things */
const globals = require('./js/globals.js');
const screenDisplay = require('./js/screenDisplay.js');
const tilesetPanel = require('./js/tileset.js');
const solidsPanel = require('./js/solids.js');

document.addEventListener('contextmenu', event => event.preventDefault());

screenDisplay.init();
tilesetPanel.init("bg", function(tilesetPanel) {
    globals.setTilesetPanel("bg", tilesetPanel);
    globals.setCurrentLayer("bg");
    screenDisplay.render()
});

tilesetPanel.init("fg", function(tilesetPanel) {
    globals.setTilesetPanel("fg", tilesetPanel);
    screenDisplay.render()
});

solidsPanel.init();

// Tab switching
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    let sections = e.target.id.split("-");
    let newTabLayer = sections[0];
    if (sections.length > 2)
        newTabLayer = sections[1];
    
    if (newTabLayer == "fg" || newTabLayer == "bg" || newTabLayer == "solids")
        globals.setCurrentLayer(newTabLayer);
    else
        console.log("Doing nothing for " + newTabLayer);
});