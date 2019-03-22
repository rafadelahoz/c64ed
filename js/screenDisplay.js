
const globals = require('./globals.js');
const tileset = require('./tileset.js');
const solidsPanel = require('./solids.js');

let tiles = {
    bg: new Array(globals.mapColumns * globals.mapRows),
    fg: new Array(globals.mapColumns * globals.mapRows)
};

let solids = new Array(globals.mapColumns * globals.mapRows);

let zoom = 2;
let mapHeight = globals.mapRows * globals.tileHeight * zoom;
let mapWidth = globals.mapColumns * globals.tileWidth * zoom;

let mapCanvas = document.getElementById('myCanvas');

let mapContext = mapCanvas.getContext('2d');

let mouseDown;

function init() {
    
    $('.btn-zoom').on('click', function(ev) {
        let factor = ev.target.textContent.substr(0,1);
        setZoom(factor);
    });

    mapContext.imageSmoothingEnabled = false;
    setZoom(2);

    mapCanvas.addEventListener('mousedown', onMapMouseDown);
    mapCanvas.addEventListener('mousemove', onMapMouseMove);
    mapCanvas.addEventListener('click', onMapMouseClick);
    mapCanvas.addEventListener('mouseup', onMapMouseUp);
    mapCanvas.addEventListener('mouseleave', onMapMouseUp);

    document.getElementById('redraw').addEventListener('click', function(ev) {
        let tilesetPanel = globals.getCurrentTilesetPanel();
        tileset.redraw(tilesetPanel);
        renderFullMap();
    });

    document.getElementById('fgColor-bg').addEventListener('change', function(ev) {
        let tilesetPanel = globals.getCurrentTilesetPanel();
        globals.setFgColor("bg", ev.target.value);
        tileset.redraw(tilesetPanel);
        renderFullMap();
    });

    document.getElementById('fgColor-fg').addEventListener('change', function(ev) {
        let tilesetPanel = globals.getCurrentTilesetPanel();
        globals.setFgColor("fg", ev.target.value);
        tileset.redraw(tilesetPanel);
        renderFullMap();
    });

    document.getElementById('bgColor').addEventListener('change', function(ev) {
        let tilesetPanel = globals.getCurrentTilesetPanel();
        globals.setBgColor(ev.target.value);
        tileset.redraw(tilesetPanel);
        renderFullMap();
    });
}

function onMapMouseUp(e) {
    mouseDown = false;
    // redraw
    renderFullMap();
    // update the string
    switch (globals.getCurrentLayer()) {
        case "bg":
        case "fg":
            let string = '[';
            for (let i = 0; i < globals.mapColumns * globals.mapRows; i++) {
                if (tiles[globals.getCurrentLayer()][i] != undefined) string = string + tiles[globals.getCurrentLayer()][i];
                string += ',';
                if (i % globals.mapColumns == 0)
                    string += " ";
            }
            string += ']';
            document.getElementById('result').innerHTML = string;
            break;
        default: 
            document.getElementById('result').innerHTML = "Current layer: " + globals.getCurrentLayer();
    }
}

function onMapMouseDown(e) {
    switch (globals.getCurrentLayer()) {
        case "fg":
        case "bg":
            handleTilesMouseDown(e);
            break;
        case "solids":
            handleSolidsMouseDown(e);
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
        let targetTile = tileY * globals.mapColumns + tileX;
        
        let tilesetPanel = globals.getCurrentTilesetPanel();
        tileset.setCurrentTile(tilesetPanel, tiles[globals.getCurrentLayer()][targetTile]);
    }
}

function pickSolid(e) {
    // Right mouse button: pick solid
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (x > 0 && x < mapWidth && y > 0 && y < mapHeight) {
        let solidX = Math.floor(x / (globals.tileWidth*zoom));
        let solidY = Math.floor(y / (globals.tileHeight*zoom));
        let targetSolid = solidY * globals.mapColumns + solidX;
        solidsPanel.setCurrentSolid(solids[targetSolid]);
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
    switch (globals.getCurrentLayer()) {
        case "bg":
        case "fg":
            setTile(e);
            break;
        case "solids":
            setSolid(e);
            break;
    }
}

function renderFullMap() {
    mapContext.beginPath();
    mapContext.rect(0, 0, mapWidth, mapHeight);
    mapContext.fillStyle = globals.getBgColor();
    mapContext.fill();

    var srcTile, tsetX, tsetY;
    
    // Draw tiles
    let layers = ["bg", "fg"];
    for (var layerIndex in ["bg", "fg"]) {
        let layer = layers[layerIndex];
        let tilesetPanel = globals.getTilesetPanel(layer);

        for (var tx = 0; tx < globals.mapColumns; tx++) {
            for (var ty = 0; ty < globals.mapRows; ty++) {
                srcTile = tiles[layer][tx + ty*globals.mapColumns]
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
        for (var tx = 0; tx < globals.mapColumns; tx++) {
            for (var ty = 0; ty < globals.mapRows; ty++) {
                solid = solids[tx + ty*globals.mapColumns]
                switch (solid) {
                    case 0: break; // none
                    case 1: // solid: full tile      
                        mapContext.fillStyle = 'rgba(225,0,10,0.5)';
                        mapContext.fillRect(tx*globals.tileWidth*zoom, ty*globals.tileHeight*zoom, globals.tileWidth*zoom, globals.tileHeight*zoom);
                        break;
                    case 2: // oneway: small rectangle
                        mapContext.fillStyle = 'rgba(225,0,10,0.5)';
                        mapContext.fillRect(tx*globals.tileWidth*zoom, ty*globals.tileHeight*zoom, globals.tileWidth*zoom, globals.tileHeight*0.25*zoom);

                }
            }
        }
    }

    // Draw the grid
    for (let i = 0; i <= globals.mapColumns; i++) {
        mapContext.moveTo(i * globals.tileWidth * zoom, 0);
        mapContext.lineTo(i * globals.tileWidth * zoom, mapHeight);
    }
    mapContext.strokeStyle = 'gray';
    mapContext.lineWidth = 0.5;
    mapContext.stroke();
    for (let i = 0; i <= globals.mapRows; i++) {
        mapContext.moveTo(0, i * globals.tileHeight * zoom);
        mapContext.lineTo(mapWidth, i * globals.tileHeight * zoom);
    }
    // mapContext.strokeStyle = '#00ff00';
    mapContext.lineWidth = 0.5;
    mapContext.stroke();
}

function setTile(e) {
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (y < mapHeight && x < mapWidth) { // target
        let mapTileX = Math.floor(x / (globals.tileWidth * zoom));
        let mapTileY = Math.floor(y / (globals.tileHeight * zoom));
        let targetMapTile = mapTileY * globals.mapColumns + mapTileX;
        let tilesetPanel = globals.getCurrentTilesetPanel();        
        tiles[globals.getCurrentLayer()][targetMapTile] = tileset.getCurrentTile(tilesetPanel);
        renderFullMap();
    }
}

function setSolid(e) {
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (y < mapHeight && x < mapWidth) { // target
        let mapTileX = Math.floor(x / (globals.tileWidth * zoom));
        let mapTileY = Math.floor(y / (globals.tileHeight * zoom));
        let targetMapTile = mapTileY * globals.mapColumns + mapTileX;
        
        solids[targetMapTile] = solidsPanel.getCurrentSolid();
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
    if (factor > 0 && factor < 5)
    {
        zoom = factor;
        mapHeight = globals.mapRows * globals.tileHeight * zoom;
        mapWidth = globals.mapColumns * globals.tileWidth * zoom;
        mapCanvas.setAttribute('width', mapWidth);
        mapCanvas.setAttribute('height', mapHeight);
        mapContext.imageSmoothingEnabled = false;

        renderFullMap();
    }
}

module.exports = {
    init: init,
    setZoom: setZoom,
    render: renderFullMap
}