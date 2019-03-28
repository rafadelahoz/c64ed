/* Editor things */
const mousetrap = require('mousetrap');

const globals = require('./js/globals.js');
const data = require('./js/data.js');
const screenGrid = require('./js/screenGrid.js');
const screenDisplay = require('./js/screenDisplay.js');
const tilesetPanel = require('./js/tileset.js');
const solidsPanel = require('./js/solids.js');
const filemanager = require('./js/filemanager.js');

document.addEventListener('contextmenu', event => event.preventDefault());

data.init();
screenGrid.init();
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
    screenGrid.getCurrentRoom().colors[1] = ev.target.value;
    tilesetPanel.redraw(tileset);
    screenDisplay.render();
});

document.getElementById('fgColor-fg').addEventListener('change', function(ev) {
    let tileset = globals.getCurrentTilesetPanel();
    screenGrid.getCurrentRoom().colors[2] = ev.target.value;
    tilesetPanel.redraw(tileset);
    screenDisplay.render();
});

document.getElementById('bgColor').addEventListener('change', function(ev) {
    screenGrid.getCurrentRoom().colors[0] = ev.target.value;
    let tsets = globals.getTilesetPanels();
    for (var tset in tsets)
        tilesetPanel.redraw(tsets[tset]);
    screenDisplay.render();
});

// Solids
$('#btn-toggle-solids').on('click', function(e) {
    globals.switchRenderSolids();
    screenDisplay.render();
    e.target.textContent = (globals.getRenderSolids() ? "" : "!") + "Solids";
});

function refreshColorInputs() {
    let room = screenGrid.getCurrentRoom();
    if (room != null) {
        document.getElementById('bgColor').value = room.colors[0];
        document.getElementById('fgColor-bg').value = room.colors[1];
        document.getElementById('fgColor-fg').value = room.colors[2];
    }
}

$('#btn-load').on('click', function(e) {
    /*var data = filemanager.load("whatever-000.json");
    
    console.log(data);

    globals.setMapSize(data.width, data.height);
    screenDisplay.init();

    globals.setBgColor(data.colors[0]);

    globals.setFgColor("bg", data.colors[1]);
    globals.setFgColor("fg", data.colors[2]);

    refreshColorInputs();

    screenDisplay.load(data);*/
});

$('#btn-save').on('click', function(e) {
    console.log("saving");

    /*var mapSize = globals.getMapSize();
    var screen = {
        id: "whatever-000",
        width: mapSize.columns,
        height: mapSize.rows,
        colors: [globals.getBgColor(), globals.getFgColor("bg"), globals.getFgColor("fg")]
    };

    var screenData = screenDisplay.serialize();
    for (id in screenData) {
        screen[id] = screenData[id];
    }

    console.log(screen);

    filemanager.save(screen.id + ".json", screen);*/
});

$('.btn-size-add').on('click', function(e) {
    let id = e.target.id;
    let dir = id.split("-")[3];
    let delta = 0;
    if (dir == "left" || dir == "right")
        delta = globals.baseColumns;
    else if (dir == "top" ||dir == "bottom")
        delta = globals.baseRows;
    
    if (screenGrid.canResizeCurrent(delta, dir)) {
        screenDisplay.resize(delta, dir);
        if (dir == "left")
            screenGrid.getCurrentRoom().gridX -= 1;
        else if (dir == "top")
            screenGrid.getCurrentRoom().gridY -= 1;
        screenGrid.refreshCurrentRoomSize();
    } else {
        alert("There's already a room there! Size increase forbidden!");
    }

    screenGrid.redraw();
});

$('.btn-size-remove').on('click', function(e) {
    let id = e.target.id;
    let dir = id.split("-")[3];
    
    let currentRoom = screenGrid.getCurrentRoom();

    if (dir == "right" || dir == "left") {
        if (currentRoom.columns > globals.baseColumns) {
            screenDisplay.resize(-globals.baseColumns, dir);
            if (dir == "left") {
                currentRoom.gridX += 1;
            }
            screenGrid.refreshCurrentRoomSize();
        }
    } else if (dir == "top" || dir == "bottom") {
        if (currentRoom.rows > globals.baseRows) {
            screenDisplay.resize(-globals.baseRows, dir);
            if (dir == "top") {
                currentRoom.gridY += 1;
            }
            screenGrid.refreshCurrentRoomSize();
        }
    }
});

function getTabLayer(tab) {
    let sections = tab.id.split("-");
    let layer = sections[0];
    if (sections.length > 2)
        layer = sections[1];

    return layer;
}

mousetrap.bind(['ctrl+left', 'ctrl+right', 'ctrl+up', 'ctrl+down'], function (e, combo) {
    // Moves the cursor and changes creen if needed
    let cursor = screenGrid.getCursor();

    if (combo == "ctrl+right") {
        cursor.x += 1;
    } else if (combo == "ctrl+left") {
        cursor.x -= 1;
    } else if (combo == "ctrl+down") {
        cursor.y += 1;
    } else if (combo == "ctrl+up") {
        cursor.y -= 1;
    }

    screenGrid.setCursor(cursor.x, cursor.y);

    screenDisplay.loadCurrentRoom();

    refreshColorInputs();
    tilesetPanel.refreshColors();
    
    screenGrid.redraw();
});

mousetrap.bind('ctrl+n', function(e, combo) {
    if (!screenGrid.getCurrentRoom()) {
        let cursor = screenGrid.getCursor();
        screenGrid.addRoom(cursor.x, cursor.y);
        screenDisplay.loadCurrentRoom();    
        screenGrid.redraw();
    }
});

mousetrap.bind('ctrl+x', function(e, combo) {
    if (screenGrid.getCurrentRoom()) {
        screenGrid.removeCurrentRoom();
        screenDisplay.loadCurrentRoom();    
        screenGrid.redraw();
    }
});