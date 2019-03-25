/* Editor things */
const globals = require('./js/globals.js');
const screenDisplay = require('./js/screenDisplay.js');
const tilesetPanel = require('./js/tileset.js');
const solidsPanel = require('./js/solids.js');
const filemanager = require('./js/filemanager.js');

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
    let newTabLayer = getTabLayer(e.target);
    let prevTabLayer = getTabLayer(e.relatedTarget);
    
    if (newTabLayer == "fg" || newTabLayer == "bg" || newTabLayer == "solids")
        globals.setCurrentLayer(newTabLayer);
    else
        console.log("Doing nothing for " + newTabLayer);

    if (newTabLayer == "solids" || prevTabLayer == "solids")
        screenDisplay.render();
});

// Colors
document.getElementById('fgColor-bg').addEventListener('change', function(ev) {
    let tileset = globals.getCurrentTilesetPanel();
    globals.setFgColor("bg", ev.target.value);
    tilesetPanel.redraw(tileset);
    screenDisplay.render();
});

document.getElementById('fgColor-fg').addEventListener('change', function(ev) {
    let tileset = globals.getCurrentTilesetPanel();
    globals.setFgColor("fg", ev.target.value);
    tilesetPanel.redraw(tileset);
    screenDisplay.render();
});

document.getElementById('bgColor').addEventListener('change', function(ev) {
    globals.setBgColor(ev.target.value);
    let tsets = globals.getTilesetPanels();
    for (var tset in tsets)
        tilesetPanel.redraw(tsets[tset]);
    screenDisplay.render();
});

function refreshColorInputs() {
    document.getElementById('bgColor').value = globals.getBgColor();
    document.getElementById('fgColor-bg').value = globals.getFgColor("bg");
    document.getElementById('fgColor-fg').value = globals.getFgColor("fg");
}

// Solids
$('#btn-toggle-solids').on('click', function(e) {
    globals.switchRenderSolids();
    screenDisplay.render();
    e.target.textContent = (globals.getRenderSolids() ? "" : "!") + "Solids";
});

$('#btn-load').on('click', function(e) {
    var data = filemanager.load("whatever-000.json");
    console.log(data);

    globals.setBgColor(data.colors[0]);

    globals.setFgColor("bg", data.colors[1]);
    globals.setFgColor("fg", data.colors[2]);

    refreshColorInputs();

    screenDisplay.load(data);
});

$('#btn-save').on('click', function(e) {
    console.log("saving");

    var screen = {
        id: "whatever-000",
        colors: [globals.getBgColor(), globals.getFgColor("bg"), globals.getFgColor("fg")]
    };

    var screenData = screenDisplay.serialize();
    for (id in screenData) {
        screen[id] = screenData[id];
    }

    console.log(screen);

    filemanager.save(screen.id + ".json", screen);
});

function getTabLayer(tab) {
    let sections = tab.id.split("-");
    let layer = sections[0];
    if (sections.length > 2)
        layer = sections[1];

    return layer;
}