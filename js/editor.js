/* Editor things */
const mousetrap = require('mousetrap');

const globals = require('./js/globals.js');
const data = require('./js/data.js');
const screenGrid = require('./js/screenGrid.js');
const screenDisplay = require('./js/screenDisplay.js');
const tilesetPanel = require('./js/tileset.js');
const solidsPanel = require('./js/solids.js');
const actors = require('./js/actors.js');
const filemanager = require('./js/filemanager.js');
const history = require('./js/history.js');

document.addEventListener('contextmenu', event => event.preventDefault());

data.init();
$('#map-name').val(data.getMap().name);

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
actors.init();

// Tab switching
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    let newTabLayer = getTabLayer(e.target);
    let prevTabLayer = getTabLayer(e.relatedTarget);
    
    if (newTabLayer == "fg" || newTabLayer == "bg" || newTabLayer == "solids" || newTabLayer == "actors")
        globals.setCurrentLayer(newTabLayer);
    else
        console.log("Doing nothing for " + newTabLayer);

    if (newTabLayer == "solids" || prevTabLayer == "solids")
        screenDisplay.render();
});

// Colors
document.getElementById('fgColor-bg').addEventListener('change', function(ev) {
    history.executeCommand('Change tiles BG color', function() {
        let tileset = globals.getCurrentTilesetPanel();
        screenGrid.getCurrentRoom().colors[1] = ev.target.value;
        tilesetPanel.redraw(tileset);
        screenDisplay.render();
    });
});

document.getElementById('fgColor-fg').addEventListener('change', function(ev) {
    history.executeCommand('Change tiles FG color', function() {
        let tileset = globals.getCurrentTilesetPanel();
        screenGrid.getCurrentRoom().colors[2] = ev.target.value;
        tilesetPanel.redraw(tileset);
        screenDisplay.render();
    });
});

document.getElementById('bgColor').addEventListener('change', function(ev) {
    history.executeCommand('Change background color', function() {
        screenGrid.getCurrentRoom().colors[0] = ev.target.value;
        let tsets = globals.getTilesetPanels();
        for (var tset in tsets)
            tilesetPanel.redraw(tsets[tset]);
        screenDisplay.render();
    });
});

document.getElementById('hazardsColor').addEventListener('change', function(ev) {
    history.executeCommand('Change hazards color', function() {
        screenGrid.getCurrentRoom().colors[3] = ev.target.value;
    });
    // No need to redraw (yet)
    /*let tsets = globals.getTilesetPanels();
    for (var tset in tsets)
        tilesetPanel.redraw(tsets[tset]);
    screenDisplay.render();*/
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
        if (room.colors[3] == null || room.colors[3] == undefined)
            room.colors[3] = "#ffffff";
        document.getElementById('hazardsColor').value = room.colors[3];
    }
}

$('#btn-load').on('click', function(e) {
    console.log("loading");

    var loadedData = filemanager.load("map.json");
    data.load(loadedData);
    $('#map-name').val(data.getMap().name);
    screenGrid.reload();
    screenDisplay.loadCurrentRoom();

    handleAfterRoomChange();
});

$('#btn-save').on('click', function(e) {
    console.log("saving");

    // Update map data
    data.getMap().name = $('#map-name').val();

    var map = data.getMap();
    screenGrid.recomputeGridPositionForEachRoom(map);
    // filemanager.save(map.id + ".json", map);
    filemanager.save("map.json", map);
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
        history.executeCommand('Increase room size', function() {
            screenDisplay.resize(delta, dir);
            if (dir == "left")
                screenGrid.getCurrentRoom().gridX -= 1;
            else if (dir == "top")
                screenGrid.getCurrentRoom().gridY -= 1;
            screenGrid.refreshCurrentRoomSize();
        });
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
            history.executeCommand('Decrease room size horizontally', function() {
                screenDisplay.resize(-globals.baseColumns, dir);
                if (dir == "left") {
                    currentRoom.gridX += 1;
                }
                screenGrid.refreshCurrentRoomSize();
            });
        }
    } else if (dir == "top" || dir == "bottom") {
        if (currentRoom.rows > globals.baseRows) {
            history.executeCommand('Decrease room size vertically', function() {
                screenDisplay.resize(-globals.baseRows, dir);
                if (dir == "top") {
                    currentRoom.gridY += 1;
                }
                screenGrid.refreshCurrentRoomSize();
            });
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
    
    handleAfterRoomChange();
});

mousetrap.bind('ctrl+n', function(e, combo) {
    if (!screenGrid.getCurrentRoom()) {
        history.executeCommand("Create room", function() {
            let cursor = screenGrid.getCursor();
            let room = screenGrid.addRoom(cursor.x, cursor.y);
            // Set colors to current ones
            room.colors = [$('#bgColor').val(), $('#fgColor-bg').val(), $('#fgColor-fg').val(), $('#hazardsColor').val()];
            refreshColorInputs();
            tilesetPanel.refreshColors();
            screenDisplay.loadCurrentRoom();
            screenGrid.redraw();
        });
    }
});

mousetrap.bind('ctrl+x', function(e, combo) {
    if (screenGrid.getCurrentRoom()) {
        history.executeCommand("Delete room", function() {
            screenGrid.removeCurrentRoom();
            screenDisplay.loadCurrentRoom();    
            screenGrid.redraw();
        });
    }
});

mousetrap.bind('ctrl+z', function(e, combo) {    
    if (history.undo()) {
        screenGrid.redraw();
        screenDisplay.loadCurrentRoom();
        screenGrid.refreshCurrentRoomSize();
    }
});

mousetrap.bind('ctrl+y', function (e, combo) {
    if (history.redo()) {
        screenGrid.redraw();
        screenDisplay.loadCurrentRoom();
        screenGrid.refreshCurrentRoomSize();
    }
});

$('#btnPalette').on('click', function() {
    var lines = $('#palette').val().split('\n');

    var colors = "";
    for (var line of lines) {
        if (!line || line.length == 0)
            continue;

        var ll = line.split(' ');
        colors += '#' + componentToHex(ll[0]) + componentToHex(ll[1]) + componentToHex(ll[2]) + "\n";    
    }

    $('#palette').val(colors);
});

function componentToHex(c) {
    var hex = parseInt(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};

function handleAfterRoomChange() {
    refreshColorInputs();
    tilesetPanel.refreshColors();

    screenDisplay.loadCurrentRoom();
    
    screenGrid.redraw();

    let room = screenGrid.getCurrentRoom();
    actors.rebuildActorsList(room);

    // Focus on the current screen dude
    screenDisplay.focusOnCurrentScreen();
}