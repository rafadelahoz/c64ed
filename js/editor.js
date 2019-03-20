/* Editor things */
const tilesetPanel = require('./js/tileset.js');

const tileWidth = 14,
    tileHeight = 14;

const mapColumns = 15;
const mapRows = 11;

var fgColor = '#00ff0a';
var bgColor = '#ff000a';

let tiles = new Array(mapColumns * mapRows);
let mapHeight = mapRows * tileHeight;
let mapWidth = mapColumns * tileWidth;

let mapCanvas = document.getElementById('myCanvas');
mapCanvas.setAttribute('width', mapWidth);
mapCanvas.setAttribute('height', mapHeight);

let mapContext = mapCanvas.getContext('2d');

let mouseDown;

document.addEventListener('contextmenu', event => event.preventDefault());

mapCanvas.addEventListener('mousedown', onMapMouseDown);
mapCanvas.addEventListener('mousemove', onMapMouseMove);
mapCanvas.addEventListener('click', onMapMouseClick);
mapCanvas.addEventListener('mouseup', onMapMouseUp);

document.getElementById('redraw').addEventListener('click', function(ev) {
    tilesetPanel.redraw();
    renderFullMap();
});

document.getElementById('fgColor').addEventListener('change', function(ev) {
    fgColor = ev.target.value;
    tilesetPanel.redraw();
    tilesetPanel.buildTintedCanvas();
    renderFullMap();
});


document.getElementById('bgColor').addEventListener('change', function(ev) {
    bgColor = ev.target.value;
    tilesetPanel.redraw();
    tilesetPanel.buildTintedCanvas();
    renderFullMap();
});

tilesetPanel.init(renderFullMap);

function onMapMouseUp(e) {
    mouseDown = false;
    // update the string    
    let string = '[';
    for (let i = 0; i < mapColumns * mapRows; i++) {
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
            let tileX = Math.floor(x / tileWidth);
            let tileY = Math.floor(y / tileHeight);
            let targetTile = tileY * mapColumns + tileX;
            tilesetPanel.setCurrentTile(tiles[targetTile]);
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
    mapContext.fillStyle = bgColor;
    mapContext.fill();

    var srcTile, tsetX, tsetY;

    // Render each tile
    for (var tx = 0; tx < mapColumns; tx++) {
        for (var ty = 0; ty < mapRows; ty++) {
            srcTile = tiles[tx + ty*mapColumns]
            tsetX = tilesetPanel.getTileX(srcTile);
            tsetY = tilesetPanel.getTileY(srcTile);

            mapContext.drawImage(tilesetPanel.getTintedCanvas(), tsetX, tsetY, tileWidth, tileHeight, tx*tileWidth, ty*tileHeight, tileWidth, tileHeight);
        }
    }

    // Draw the grid
    for (let i = 0; i <= mapColumns; i++) {
        mapContext.moveTo(i * tileWidth, 0);
        mapContext.lineTo(i * tileWidth, mapHeight);
    }
    mapContext.lineWidth = 0.5;
    mapContext.stroke();
    for (let i = 0; i <= mapRows; i++) {
        mapContext.moveTo(0, i * tileHeight);
        mapContext.lineTo(mapWidth, i * tileHeight);
    }
    mapContext.lineWidth = 0.5;
    mapContext.stroke();
}

function setTile(e) {
    let x = e.clientX - mapX();
    let y = e.clientY - mapY();
    if (y < mapHeight && x < mapWidth) { // target
        let mapTileX = Math.floor(x / tileWidth);
        let mapTileY = Math.floor(y / tileHeight);
        let targetMapTile = mapTileY * mapColumns + mapTileX;
        tiles[targetMapTile] = tilesetPanel.getCurrentTile();
        renderFullMap();
    }
}

function mapX() {
    return mapCanvas.getClientRects()[0].x;
}

function mapY() {
    return mapCanvas.getClientRects()[0].y;
}