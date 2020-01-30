
const globals = require('./globals.js');
const data = require('./data.js');
const screenGrid = require('./screenGrid.js');
const tileset = require('./tileset.js');
const solidsPanel = require('./solids.js');
const actors = require('./actors.js');

var room;

var mapWidth = -1;
var mapHeight = -1; 
let zoom = 2;

var mapCanvas;
var mapContext;

var mouseDown;

function init() {

    mapCanvas = document.getElementById('map-canvas');
    mapContext = mapCanvas.getContext('2d');

    mapContext.imageSmoothingEnabled = false;

    loadCurrentRoom();

    // Setup events
    mapCanvas.addEventListener('mousedown', onMapMouseDown);
    mapCanvas.addEventListener('mousemove', onMapMouseMove);
    mapCanvas.addEventListener('click', onMapMouseClick);
    mapCanvas.addEventListener('mouseup', onMapMouseUp);
    mapCanvas.addEventListener('mouseleave', onMapMouseUp);

    $('.btn-zoom').on('click', function(ev) {
        let factor = ev.target.textContent.substr(0,1);
        setZoom(factor);
    });

    document.getElementById('redraw').addEventListener('click', function(ev) {
        let tilesetPanel = globals.getCurrentTilesetPanel();
        tileset.redraw(tilesetPanel);
        renderFullMap();
    });

    /* Custom re-render event */
    document.addEventListener('render-room', function(e) {
        renderFullMap();
    });
}

function loadCurrentRoom() {
    loadRoom(screenGrid.getCurrentRoom());
}

function loadRoom(thisRoom) {
    // Store current room data before switching rooms
    if (room != null) {
        room.name = $('#room-name').val();
    }

    if (thisRoom) {
        room = thisRoom;
        
        // Initialize missing things
        if (room.solids.length == 0) {
            setupEmptyRoom();
        }

        setZoom();

        $('#room-name').val(room.name);
    } else {
        room = undefined;
        mapContext.fillStyle = '#aaaaaa';
        mapContext.fillRect(0, 0, mapWidth, mapHeight);
        mapContext.fillStyle = '#111111';
        mapContext.fillText("x EMPTY x", 10, 10);
        
        $('#room-name').val('');
    }
}

function setupEmptyRoom() {
    // TODO: keep tiles and solids data appropriately
    var widthInTiles = room.columns;
    var heightInTiles = room.rows;

    // Init tiles and solids arrays
    room.tiles = {};
    room.tiles["bg"] = new Array(widthInTiles * heightInTiles);
    room.tiles["fg"] = new Array(widthInTiles * heightInTiles)

    room.solids = new Array(widthInTiles * heightInTiles);

    let ls = ["fg", "bg"];
    for (var l in ls) {
        for (var i = 0; i < room.tiles[ls[l]].length; i++) {
            room.tiles[ls[l]][i] = 0;
        }
    }

    for (var i = 0; i < room.solids.length; i++) {
        room.solids[i] = 0;
    }

    // Compute sizes in pixels
    mapWidth = widthInTiles * globals.tileWidth * zoom;
    mapHeight = heightInTiles * globals.tileHeight * zoom;
}

function onMapMouseUp(e) {
    if (!room) return;

    mouseDown = false;
    // redraw
    renderFullMap();
    switch (globals.getCurrentLayer()) {
        case "bg":
        case "fg":
            // document.getElementById('result').innerHTML = "Current " + globals.getCurrentLayer().toUpperCase() + " tile: " + globalsº.getCurrentTilesetPanel().getCurrentTile();
            break;
        default: 
            document.getElementById('result').innerHTML = "Current layer: " + globals.getCurrentLayer();
            break;
    }
}

function onMapMouseDown(e) {
    if (!room) return;

    switch (globals.getCurrentLayer()) {
        case "fg":
        case "bg":
            handleTilesMouseDown(e);
            break;
        case "solids":
            handleSolidsMouseDown(e);
            break;
        case "actors":
            break;
        default:
            console.log("Moving in " + globals.getCurrentLayer() + " layer");
    }
}

function handleTilesMouseDown(e) {
    mouseDown = false;
    if (e.button == 0) {
        mouseDown = true;
    } else if (e.button == 2) {
        pickTile(e);
    }
}

function pickTile(e) {
    // Right mouse button: pick tile
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (x > 0 && x < mapWidth && y > 0 && y < mapHeight) {
        let tileX = Math.floor(x / (globals.tileWidth*zoom));
        let tileY = Math.floor(y / (globals.tileHeight*zoom));
        let targetTile = tileY * room.columns + tileX;
        
        let tilesetPanel = globals.getCurrentTilesetPanel();
        tileset.setCurrentTile(tilesetPanel, room.tiles[globals.getCurrentLayer()][targetTile]);
    }
}

function pickSolid(e) {
    // Right mouse button: pick solid
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (x > 0 && x < mapWidth && y > 0 && y < mapHeight) {
        let solidX = Math.floor(x / (globals.tileWidth*zoom));
        let solidY = Math.floor(y / (globals.tileHeight*zoom));
        let targetSolid = solidY * room.columns + solidX;
        solidsPanel.setCurrentSolid(room.solids[targetSolid]);
    }
}

function handleSolidsMouseDown(e) {
    mouseDown = false;
    if (e.button == 0) {
        mouseDown = true;
    } else if (e.button == 2) {
        pickSolid(e);        
    }
}

function onMapMouseMove(e) {
    if (!room) return;

    // Redraw in order to draw cursor
    renderFullMap();
    // Render cursor
    renderCursor(e);

    switch (globals.getCurrentLayer()) {
        case "bg":
        case "fg":
            // Paint if painting
            if (mouseDown) setTile(e);
            break;
        case "solids":
            if (mouseDown) setSolid(e);
            break;
        default:
    }

    // Render current tile where mouse is placed
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    let mapTileX = "-";
    let mapTileY = "-";
    if (y < mapHeight && x < mapWidth) { // target
        mapTileX = Math.floor(x / (globals.tileWidth * zoom));
        mapTileY = Math.floor(y / (globals.tileHeight * zoom));
    }

    $('#current-tile-position').text(mapTileX + ", " + mapTileY);
}

function renderCursor(e) {
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (x > 0 && x < mapWidth && y > 0 && y < mapHeight) {
        let tileX = Math.floor(x / (globals.tileWidth*zoom))*globals.tileWidth*zoom;
        let tileY = Math.floor(y / (globals.tileHeight*zoom))*globals.tileWidth*zoom;
        // Outer cursor
        mapContext.beginPath();
        mapContext.lineWidth = 2;
        mapContext.strokeStyle = 'blue';
        mapContext.rect(tileX, tileY, globals.tileWidth*zoom, globals.tileHeight*zoom);
        mapContext.stroke();
        // Inner cursor
        mapContext.beginPath();
        mapContext.lineWidth = 1;
        mapContext.strokeStyle = 'white';
        mapContext.rect(tileX+1, tileY+1, globals.tileWidth*zoom-1, globals.tileHeight*zoom-1);
        mapContext.stroke();
    }
}

function onMapMouseClick(e) {
    if (!room) return;
    
    switch (globals.getCurrentLayer()) {
        case "bg":
        case "fg":
            setTile(e);
            break;
        case "solids":
            setSolid(e);
            break;
        case "actors":
            let x = e.clientX - mapX();
            let y = e.clientY - mapY();
            if (y < mapHeight && x < mapWidth) { // target
                let mapTileX = Math.floor(x / (globals.tileWidth * zoom));
                let mapTileY = Math.floor(y / (globals.tileHeight * zoom));
                actors.onClick(e, mapTileX, mapTileY, room, zoom);
                // renderFullMap();
            }

        break;
    }
}

var renderScreens = true;

function renderFullMap() {
    mapContext.beginPath();
    mapContext.rect(0, 0, mapWidth, mapHeight);
    mapContext.fillStyle = room.colors[0];
    mapContext.fill();

    var srcTile, tsetX, tsetY;
    
    // Draw tiles
    let layers = ["bg", "fg"];
    for (var layerIndex in ["bg", "fg"]) {
        let layer = layers[layerIndex];
        let tilesetPanel = globals.getTilesetPanel(layer);

        for (var tx = 0; tx < room.columns; tx++) {
            for (var ty = 0; ty < room.rows; ty++) {
                srcTile = room.tiles[layer][tx + ty*room.columns]
                if (srcTile) {
                    tsetX = tileset.getTileX(tilesetPanel, srcTile);
                    tsetY = tileset.getTileY(tilesetPanel, srcTile);

                    mapContext.drawImage(tileset.getTintedCanvas(tilesetPanel), tsetX, tsetY, globals.tileWidth, globals.tileHeight, tx*globals.tileWidth*zoom, ty*globals.tileHeight*zoom, globals.tileWidth*zoom, globals.tileHeight*zoom);
                }
            }
        }
    }

    // Draw solids
    if (globals.getRenderSolids() || globals.getCurrentLayer() == "solids") {
        for (var tx = 0; tx < room.columns; tx++) {
            for (var ty = 0; ty < room.rows; ty++) {
                solid = room.solids[tx + ty*room.columns]
                switch (solid) {
                    case 0: break; // none
                    case 1: // solid: full tile      
                        mapContext.fillStyle = 'rgba(225, 0, 10, 0.3)';
                        mapContext.fillRect(tx*globals.tileWidth*zoom, ty*globals.tileHeight*zoom, globals.tileWidth*zoom, globals.tileHeight*zoom);
                        break;
                    case 2: // oneway: small rectangle
                        mapContext.fillStyle = 'rgba(225, 0, 10, 0.3)';
                        mapContext.fillRect(tx*globals.tileWidth*zoom, ty*globals.tileHeight*zoom, globals.tileWidth*zoom, globals.tileHeight*0.25*zoom);
                        break;
                    case 3: // ladder: orange slimmer rectangle?
                        mapContext.fillStyle = 'rgba(255, 163, 0, 0.3)';
                        mapContext.fillRect((tx*globals.tileWidth+2)*zoom, ty*globals.tileHeight*zoom, (globals.tileWidth-4)*zoom, globals.tileHeight*zoom);
                        break;
                    default:
                }
            }
        }
    }

    // Draw actors
    actors.render(mapContext, room, zoom);

    mapContext.beginPath();
    mapContext.strokeStyle = 'gray';
    mapContext.lineWidth = 0.5;
    // Draw the grid
    for (let i = 0; i <= room.columns; i++) {
        mapContext.moveTo(i * globals.tileWidth * zoom, 0);
        mapContext.lineTo(i * globals.tileWidth * zoom, mapHeight);
    }
    mapContext.stroke();

    mapContext.beginPath();
    mapContext.strokeStyle = 'gray';
    mapContext.lineWidth = 0.5;
    for (let i = 0; i <= room.rows; i++) {
        mapContext.moveTo(0, i * globals.tileHeight * zoom);
        mapContext.lineTo(mapWidth, i * globals.tileHeight * zoom);
    }
    mapContext.stroke();

    // Render screen boundaries for bigger rooms
    if (renderScreens && (room.columns > globals.baseColumns || room.rows > globals.baseRows)) {
        var screensX = room.columns / globals.baseColumns;
        var screensY = room.rows / globals.baseRows;
        mapContext.lineWidth = 2.0;
        mapContext.strokeStyle = "red";

        for (var xx = 0; xx < screensX; xx++) {
            for (var yy = 0; yy < screensY; yy++) {
                mapContext.beginPath();
                mapContext.rect(xx * globals.baseColumns * globals.tileWidth * zoom, yy * globals.tileHeight * globals.baseRows * zoom,
                                globals.baseColumns * globals.tileWidth * zoom, globals.baseRows * globals.tileHeight * zoom);
                mapContext.stroke();
            }
        }
    }
}

function setTile(e) {
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (y < mapHeight && x < mapWidth) { // target
        let mapTileX = Math.floor(x / (globals.tileWidth * zoom));
        let mapTileY = Math.floor(y / (globals.tileHeight * zoom));
        let targetMapTile = mapTileY * room.columns + mapTileX;
        let tilesetPanel = globals.getCurrentTilesetPanel();        
        room.tiles[globals.getCurrentLayer()][targetMapTile] = tileset.getCurrentTile(tilesetPanel);
        renderFullMap();
    }
}

function setSolid(e) {
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (y < mapHeight && x < mapWidth) { // target
        let mapTileX = Math.floor(x / (globals.tileWidth * zoom));
        let mapTileY = Math.floor(y / (globals.tileHeight * zoom));
        let targetMapTile = mapTileY * room.columns + mapTileX;
        
        room.solids[targetMapTile] = solidsPanel.getCurrentSolid();
        renderFullMap();
    }
}

function mapX() {
    return mapCanvas.getClientRects()[0].x;
}

function mapY() {
    return mapCanvas.getClientRects()[0].y;
}

function setZoom(factor) {
    if (!factor)
        factor = zoom;

    if (factor > 0 && factor < 5)
    {
        zoom = factor;
        mapWidth = room.columns * globals.tileWidth * zoom;
        mapHeight = room.rows * globals.tileHeight * zoom;
        mapCanvas.setAttribute('width', mapWidth);
        mapCanvas.setAttribute('height', mapHeight);
        mapContext.imageSmoothingEnabled = false;

        renderFullMap();
    }
}

function serializeData() {
    return {
        "tiles-bg": room.tiles["bg"],
        "tiles-fg": room.tiles["fg"],
        "solids": room.solids
    };
}

function resize(delta, dir) {
    
    var nw = room.columns;
    var nh = room.rows;
    var w = room.columns;
    var h = room.rows;

    if (dir == "left") {
        nw += delta;
        ox = delta;
        oy = 0;
    } else if (dir == "right") {
        nw += delta;
        ox = 0;
        oy = 0;
    } else if (dir == "top") {
        nh += delta;
        ox = 0;
        oy = delta;
    } else if (dir == "bottom") {
        nh += delta;
        ox = 0;
        oy = 0;
    }
    
    room.solids = resizeKeepData(room.solids, nw, nh, w, h, ox, oy);
    room.tiles["bg"] = resizeKeepData(room.tiles["bg"], nw, nh, w, h, ox, oy);
    room.tiles["fg"] = resizeKeepData(room.tiles["fg"], nw, nh, w, h, ox, oy);

    room.columns = nw;
    room.rows = nh;

    mapWidth = nw * globals.tileWidth * zoom;
    mapHeight = nh * globals.tileHeight * zoom;

    setZoom();
}

function resizeKeepData(arr, nw, nh, w, h, ox, oy) {
    let newmap = new Array(nw * nh);
    let map = arr;
    for (var col = 0; col < nw; col++) {
        for (var row = 0; row < nh; row++) {
            // Inside source map area
            if (col >= ox && col < ox+w &&  
                row >= oy && row < oy+h) {
                set(newmap, nw, col, row, get(map, w, col-ox, row-oy));
            } 
            // Outside source map
            else {
                set(newmap, nw, col, row, 0);
            }
        }
    }

    return newmap;
}

function set(arr, cols, col, row , value) {
    arr[col + cols*row] = value;
}

function get(arr, cols, col, row) {
    return arr[col + cols*row];
}

module.exports = {
    init: init,
    setZoom: setZoom,
    render: renderFullMap,
    serialize: serializeData,
    resize: resize,
    loadCurrentRoom: loadCurrentRoom
};