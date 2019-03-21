
const globals = require('./globals.js');
const tileset = require('./tileset.js');

let tiles = new Array(globals.mapColumns * globals.mapRows);

let mapHeight = globals.mapRows * globals.tileHeight;
let mapWidth = globals.mapColumns * globals.tileWidth;

let mapCanvas = document.getElementById('myCanvas');

let mapContext = mapCanvas.getContext('2d');

let mouseDown;

function init() {
    mapCanvas.setAttribute('width', mapWidth);
    mapCanvas.setAttribute('height', mapHeight);

    mapCanvas.addEventListener('mousedown', onMapMouseDown);
    mapCanvas.addEventListener('mousemove', onMapMouseMove);
    mapCanvas.addEventListener('click', onMapMouseClick);
    mapCanvas.addEventListener('mouseup', onMapMouseUp);

    document.getElementById('redraw').addEventListener('click', function(ev) {
        let tilesetPanel = globals.getCurrentTilesetPanel();
        tileset.redraw(tilesetPanel);
        renderFullMap();
    });

    document.getElementById('fgColor').addEventListener('change', function(ev) {
        let tilesetPanel = globals.getCurrentTilesetPanel();
        globals.setFgColor(ev.target.value);
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
    // update the string    
    let string = '[';
    for (let i = 0; i < globals.mapColumns * globals.mapRows; i++) {
        if (tiles[i] != undefined) string = string + tiles[i];
        string = string + ',';
    }
    string = string + ']';
    document.getElementById('result').innerHTML = string;
}

function onMapMouseDown(e) {
    mouseDown = false;
    if (e.button == 0) {
        mouseDown = true;
    } else if (e.button == 2) {
        // Right mouse button: pick tile
        let x = e.clientX - mapX();
        let y = e.clientY - mapY();
        if (x > 0 && x < mapWidth && y > 0 && y < mapHeight) {
            let tileX = Math.floor(x / globals.tileWidth);
            let tileY = Math.floor(y / globals.tileHeight);
            let targetTile = tileY * globals.mapColumns + tileX;
            
            let tilesetPanel = globals.getCurrentTilesetPanel();
            tileset.setCurrentTile(tilesetPanel, tiles[targetTile]);
        }
    }
}

function onMapMouseMove(e) {
    if (mouseDown == true) setTile(e);
}

function onMapMouseClick(e) {
    setTile(e);
}

function renderFullMap() {
    mapContext.beginPath();
    mapContext.rect(0, 0, mapWidth, mapHeight);
    mapContext.fillStyle = globals.getBgColor();
    mapContext.fill();

    var srcTile, tsetX, tsetY;
    let tilesetPanel = globals.getCurrentTilesetPanel();

    // Render each tile
    for (var tx = 0; tx < globals.mapColumns; tx++) {
        for (var ty = 0; ty < globals.mapRows; ty++) {
            

            srcTile = tiles[tx + ty*globals.mapColumns]
            tsetX = tileset.getTileX(tilesetPanel, srcTile);
            tsetY = tileset.getTileY(tilesetPanel, srcTile);

            mapContext.drawImage(tileset.getTintedCanvas(tilesetPanel), tsetX, tsetY, globals.tileWidth, globals.tileHeight, tx*globals.tileWidth, ty*globals.tileHeight, globals.tileWidth, globals.tileHeight);
        }
    }

    // Draw the grid
    for (let i = 0; i <= globals.mapColumns; i++) {
        mapContext.moveTo(i * globals.tileWidth, 0);
        mapContext.lineTo(i * globals.tileWidth, mapHeight);
    }
    // mapContext.lineStyle = 'yellow';
    mapContext.lineWidth = 0.5;
    mapContext.stroke();
    for (let i = 0; i <= globals.mapRows; i++) {
        mapContext.moveTo(0, i * globals.tileHeight);
        mapContext.lineTo(mapWidth, i * globals.tileHeight);
    }
    // mapContext.lineStyle = '#00ff00';
    mapContext.lineWidth = 0.5;
    mapContext.stroke();
}

function setTile(e) {
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (y < mapHeight && x < mapWidth) { // target
        let mapTileX = Math.floor(x / globals.tileWidth);
        let mapTileY = Math.floor(y / globals.tileHeight);
        let targetMapTile = mapTileY * globals.mapColumns + mapTileX;
        let tilesetPanel = globals.getCurrentTilesetPanel();        
        tiles[targetMapTile] = tileset.getCurrentTile(tilesetPanel);
        renderFullMap();
    }
}

function mapX() {
    return mapCanvas.getClientRects()[0].x;
}

function mapY() {
    return mapCanvas.getClientRects()[0].y;
}

module.exports = {
    init: init,
    render: renderFullMap
}