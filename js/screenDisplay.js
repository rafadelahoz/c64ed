
const globals = require('./globals.js');
const data = require('./data.js');
const screenGrid = require('./screenGrid.js');
const tileset = require('./tileset.js');
const solidsPanel = require('./solids.js');
const actors = require('./actors.js');
const history = require('./history.js');
const mousetrap = require('mousetrap');

var room;

var mapWidth = -1;
var mapHeight = -1; 
let zoom = 2;

var mapCanvas;
var mapContext;

var mouseDown;

var pressed = false;
var dragging = false;

var cursorArea = {
    x: 0, y: 0, w: 0, h: 0,
    stamped : false
};

var currentTool = "draw"; // fill

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

    $('#btn-tool-draw').on('click', function (e) {
        currentTool = "draw";
        $('.btn-tool').removeClass('btn-success');
        $('.btn-tool').addClass('btn-secondary');
        $('#btn-tool-draw').addClass('btn-success');
    });
    
    $('#btn-tool-fill').on('click', function (e) {
        currentTool = "fill";
        $('.btn-tool').removeClass('btn-success');
        $('.btn-tool').addClass('btn-secondary');
        $('#btn-tool-fill').addClass('btn-success');
    });

    mousetrap.bind('a', function(e) {
        $('#btn-tool-draw').trigger('click');
    });

    mousetrap.bind('s', function(e) {
        $('#btn-tool-fill').trigger('click');
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

            pressed = false;
            if (e.button == 2 && dragging) {
                dragging = false;
                // onDragEnd
                refreshTileCursorData();
            } else if (e.button == 2) {
                let x = e.clientX - mapX();
                let y = e.clientY - mapY();
                if (x > 0 && x < mapWidth && y > 0 && y < mapHeight) {
                    let tileX = Math.floor(x / (globals.tileWidth*zoom));
                    let tileY = Math.floor(y / (globals.tileHeight*zoom));
                    
                    tileset.getTileCursor().x = tileX;
                    tileset.getTileCursor().y = tileY;
                    tileset.getTileCursor().w = 1;
                    tileset.getTileCursor().h = 1;
                    tileset.getTileCursor().fromTileset = false;

                    refreshTileCursorData();
                }
            }

            break;
        default: 
            document.getElementById('result').innerHTML = "Current layer: " + globals.getCurrentLayer();
            break;
    }
}

function refreshTileCursorData()
{
    tileset.getTileCursor().tiles = [];

    let tc = tileset.getTileCursor();
    for (let yy = tc.y; yy < (tc.y+tc.h); yy++)
        for (let xx = tc.x; xx < (tc.x+tc.w); xx++)
        {
            let targetTile = yy * room.columns + xx;
            tileset.getTileCursor().tiles.push(room.tiles[globals.getCurrentLayer()][targetTile]);
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

    if (e.button == 0 || e.button == 2) {
        pressed = true;

        let x = e.clientX - mapX();
        let y = e.clientY - mapY();
        if (x > 0 && x < mapWidth && y > 0 && y < mapHeight) {
            let tileX = Math.floor(x / (globals.tileWidth*zoom));
            let tileY = Math.floor(y / (globals.tileHeight*zoom));

            if (e.button == 0) {
                // Left mouse button: place tiles
                mouseDown = true;
                // Setup cursor stamp area so we dont draw over it again
                cursorArea.x = tileX;
                cursorArea.y = tileY;
                cursorArea.w = tileset.getTileCursor().w;
                cursorArea.h = tileset.getTileCursor().h;
                cursorArea.stamped = false;

                setTile(e);
            } else if (e.button == 2) {
                // Right mouse button: pick tiles
                tileset.getTileCursor().x = tileX;
                tileset.getTileCursor().y = tileY;
                tileset.getTileCursor().w = 1;
                tileset.getTileCursor().h = 1;
                tileset.getTileCursor().fromTileset = false;
                
                refreshTileCursorData();
            }
        }
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

    heldButton = e.which - 1;

    switch (globals.getCurrentLayer()) {
        case "bg":
        case "fg":
            if (heldButton == 0) {
                if (currentTool == "draw")
                    // Paint if painting
                    if (mouseDown) setTile(e);
                else if (currentTool == "fill") {
                    // Nop!
                }
            } else  if (heldButton == 2) {
                let x = e.clientX - mapX();
                let y = e.clientY - mapY();

                if (pressed && !dragging) {
                    // onDragStart
                    dragging = true;

                    
                    if (x > 0 && x < mapWidth && y > 0 && y < mapHeight) {
                        let tileX = Math.floor(x / (globals.tileWidth*zoom));
                        let tileY = Math.floor(y / (globals.tileHeight*zoom));
                        // let targetTile = tileY * room.columns + tileX;
                        
                        tileset.getTileCursor().x = tileX;
                        tileset.getTileCursor().y = tileY;
                        tileset.getTileCursor().w = 1;
                        tileset.getTileCursor().h = 1;
                        tileset.getTileCursor().fromTileset = false;
                        // TODO: ?? refresh tile data
                    }
                }

                if (pressed && dragging) {
                    let endTileX = Math.floor(x / (globals.tileWidth*zoom));
                    let endTileY = Math.floor(y / (globals.tileHeight*zoom));

                    let tmpW = endTileX - tileset.getTileCursor().x + 1;
                    let tmpH = endTileY - tileset.getTileCursor().y + 1;

                    if (tmpW == 0)
                        tmpW = 1;

                    if (tmpH == 0)
                        tmpH = 1;

                    if (tmpW < 0)
                    {
                        tileset.getTileCursor().x = endTileX;
                        tileset.getTileCursor().w = 1;
                    }
                    else
                        tileset.getTileCursor().w = tmpW;

                    if (tmpH < 0)
                    {
                        tileset.getTileCursor().y = endTileY;
                        tileset.getTileCursor().h = 1;
                    }
                    else
                        tileset.getTileCursor().h = tmpH;
                    
                    tileset.getTileCursor().fromTileset = false;
                    // TODO: refresh tile data?
                }
            }

            break;
        case "solids":
            if (mouseDown) setSolid(e);
            break;
        default:
    }

    // Render current tile where mouse is placed
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    let coordinatesText = "-";

    if (y < mapHeight && x < mapWidth) { // target
        let mapTileX = Math.floor(x / (globals.tileWidth * zoom));
        let mapTileY = Math.floor(y / (globals.tileHeight * zoom));

        coordinatesText = mapTileX + ", " + mapTileY;
        if (mapTileX >= globals.baseColumns || mapTileY >= globals.baseRows) {
            let screenX = Math.floor(mapTileX / globals.baseColumns);
            let screenY = Math.floor(mapTileY / globals.baseRows);
            let screenTileX = (mapTileX - (globals.baseColumns * screenX));
            let screenTileY = (mapTileY - (globals.baseRows * screenY));
            
            coordinatesText += " - " + screenTileX + ", " + screenTileY + "@[" + screenX + ", " + screenY + "]"
        }
    }

    $('#current-tile-position').text(coordinatesText);
}

function renderCursor(e) {
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (x > 0 && x < mapWidth && y > 0 && y < mapHeight) {
        let tileX = Math.floor(x / (globals.tileWidth*zoom))*globals.tileWidth*zoom;
        let tileY = Math.floor(y / (globals.tileHeight*zoom))*globals.tileWidth*zoom;

        // Fetch the current tile cursor
        let tileCursor = { x: -1, y: -1, w: 1, h: 1};
        let layer = globals.getCurrentLayer();
        if (layer == "bg" || layer == "fg")
            tileCursor = tileset.getTileCursor();

        // Outer cursor
        mapContext.beginPath();
        mapContext.lineWidth = 2;
        mapContext.strokeStyle = 'blue';
        if (dragging)
            mapContext.rect(tileCursor.x*globals.tileWidth*zoom, tileCursor.y*globals.tileHeight*zoom, tileCursor.w*globals.tileWidth*zoom, tileCursor.h*globals.tileHeight*zoom);
        else
            mapContext.rect(tileX, tileY, tileCursor.w*globals.tileWidth*zoom, tileCursor.h*globals.tileHeight*zoom);

        mapContext.stroke();
        // Inner cursor
        mapContext.beginPath();
        mapContext.lineWidth = 1;
        mapContext.strokeStyle = 'white';
        if (dragging)
            mapContext.rect(tileCursor.x*globals.tileWidth*zoom+1, tileCursor.y*globals.tileHeight*zoom+1, tileCursor.w*globals.tileWidth*zoom-1, tileCursor.h*globals.tileHeight*zoom-1);
        else
            mapContext.rect(tileX+1, tileY+1, tileCursor.w*globals.tileWidth*zoom-1, tileCursor.h*globals.tileHeight*zoom-1);

        mapContext.stroke();
    }
}

function onMapMouseClick(e) {
    if (!room) return;
    
    switch (globals.getCurrentLayer()) {
        case "bg":
        case "fg":
            if (currentTool == "draw")
                history.executeCommand("Paint tile", function() {
                    setTile(e);
                });
            else if (currentTool == "fill") {
                history.executeCommand("Flood fill", function() {
                    fillTile(e);
                });
            }
            break;
        case "solids":
            if (currentTool == "draw")
                history.executeCommand("Put solid", function() {
                    setSolid(e);
                });
            else if (currentTool = "fill") {
                history.executeCommand("Flood fill solids", function () {
                    fillSolid(e);
                });
            }
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
        
        let tileCursor = tileset.getTileCursor();

        // Check if we are outside the cursor area
        stampingOutside = 
            (mapTileX >= (cursorArea.x + cursorArea.w) ||
             mapTileX + tileCursor.w <= cursorArea.x) ||
            (mapTileY >= (cursorArea.y + cursorArea.h) ||
             mapTileY + tileCursor.h <= cursorArea.y);

        if (!cursorArea.stamped || stampingOutside)
        {
            if (stampingOutside) {
                cursorArea.x = mapTileX;
                cursorArea.y = mapTileY;
            }
            
            cursorArea.stamped = true;
            let targetMapTile = 0;
            for (let ty = 0; ty < tileCursor.h; ty++)
                for (let tx = 0; tx < tileCursor.w; tx++) {
                    // Avoid flowing tiles to the next row
                    if (mapTileX + tx >= room.columns)
                        continue;
                    targetMapTile = (mapTileY + ty) * room.columns + mapTileX + tx;
                    room.tiles[globals.getCurrentLayer()][targetMapTile] = tileCursor.tiles[ty * tileCursor.w + tx];
                }
        }
        
        renderFullMap();
    }
}

function fillTile(e) {
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (y < mapHeight && x < mapWidth) { // target
        let mapTileX = Math.floor(x / (globals.tileWidth * zoom));
        let mapTileY = Math.floor(y / (globals.tileHeight * zoom));
        // let tilesetPanel = globals.getTilesetPanel(globals.getCurrentLayer());
        // flood fill!
        let fillOverTile = get(room.tiles[globals.getCurrentLayer()], room.columns, mapTileX, mapTileY);
        // For now use just the first tile whatever
        let fillWithTile = tileset.getTileCursor().tiles[0];
        floodFill(room.tiles[globals.getCurrentLayer()], room.columns, mapTileX, mapTileY, fillOverTile, fillWithTile);
        renderFullMap();
    }
}

function fillSolid(e) {
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (y < mapHeight && x < mapWidth) { // target
        let mapTileX = Math.floor(x / (globals.tileWidth * zoom));
        let mapTileY = Math.floor(y / (globals.tileHeight * zoom));
        // flood fill!
        let fillOverTile = get(room.solids, room.columns, mapTileX, mapTileY);
        floodFill(room.solids, room.columns, mapTileX, mapTileY, fillOverTile, solidsPanel.getCurrentSolid())
        renderFullMap();
    }
}

function floodFill(array, columns, col, row, srcTile, newTile) {
    if (col >= 0 && col < room.columns && row >= 0 && row < room.rows && newTile != srcTile) {
        if (get(array, columns, col, row) == srcTile) {
            set(array, columns, col, row, newTile);
            let neighbours = [{x: col-1, y: row}, {x: col+1, y: row}, {x: col, y: row-1}, {x: col, y: row+1}];
            for (neighbour of neighbours) {
                floodFill(array, columns, neighbour.x, neighbour.y, srcTile, newTile);
            }
        }
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

function focusOnCurrentScreen() {
    let cursor = screenGrid.getCursor();
    let room = screenGrid.getCurrentRoom();
    
    if (cursor && room) {
     $('#map-canvas-panel')[0].scrollTo(
         (cursor.x - room.gridX) * globals.baseColumns * globals.tileWidth * zoom, 
         (cursor.y - room.gridY) * globals.baseRows * globals.tileHeight * zoom);
     }
}

module.exports = {
    init: init,
    setZoom: setZoom,
    render: renderFullMap,
    serialize: serializeData,
    resize: resize,
    loadCurrentRoom: loadCurrentRoom,
    focusOnCurrentScreen: focusOnCurrentScreen
};