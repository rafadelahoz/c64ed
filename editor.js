/* Editor things */

const tileWidth = 14,
    tileHeight = 14;

const mapColumns = 15;
const mapRows = 11;

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
    renderFullMap();
});

document.getElementById('bgColor').addEventListener('change', function(ev) {
    bgColor = ev.target.value;
    renderFullMap();
});

tilesetPanel.init();

var mapX = mapCanvas.getClientRects()[0].x;
var mapY = mapCanvas.getClientRects()[0].y;

// draw the grid

for (let i = 0; i <= mapColumns; i++) {
    mapContext.moveTo(i * tileWidth, 0);
    mapContext.lineTo(i * tileWidth, mapHeight);
}
mapContext.stroke();
for (let i = 0; i <= mapRows; i++) {
    mapContext.moveTo(0, i * tileHeight);
    mapContext.lineTo(mapWidth, i * tileHeight);
}
mapContext.stroke();

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
        let x = e.clientX - mapX;
        let y = e.clientY - mapY;
        if (x > 0 && x < mapWidth && y > 0 && y < mapHeight) {
            let tileX = Math.floor(x / tileWidth);
            let tileY = Math.floor(y / tileHeight);
            let targetTile = tileY * mapColumns + tileX;
            tilesetPanel.setCurrentTile(tiles[targetTile]);
        }
    }
}

function onMapMouseMove(e) {
    if (mouseDown == true) drawTile(e);
}

function onMapMouseClick(e) {
    drawTile(e);
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

            mapContext.drawImage(tilesetPanel.image, tsetX, tsetY, tileWidth, tileHeight, tx*tileWidth, ty*tileHeight, tileWidth, tileHeight);
        }
    }
}

function drawTile(e) {
    let x = e.clientX - mapX;
    let y = e.clientY - mapY;
    let gridX, gridY;
    gridX = Math.floor(x / tileWidth) * tileWidth;
    gridY = Math.floor(y / tileHeight) * tileHeight;
    if (y < mapHeight && x < mapWidth) { // target
        mapContext.beginPath();
        mapContext.rect(gridX, gridY, tileWidth, tileHeight);
        mapContext.fillStyle = bgColor;
        mapContext.fill();
        mapContext.drawImage(tilesetPanel.image, tilesetPanel.currentTileX, tilesetPanel.currentTileY, tileWidth, tileHeight, gridX, gridY, tileWidth, tileHeight);
        let tileX = Math.floor(x / tileWidth);
        let tileY = Math.floor(y / tileHeight);
        let targetTile = tileY * mapColumns + tileX;
        tiles[targetTile] = tilesetPanel.currentTile;
    }
}