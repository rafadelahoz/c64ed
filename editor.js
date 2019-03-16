let image = new Image();
image.src = 'tiles.png';

const tileWidth = 32,
    tileHeight = 32;

const mapRows = 8,
    mapColumns = 18;

const sourceWidth = 256,
    sourceHeight = 256;

let tiles = new Array(mapColumns * mapRows);
let mapHeight = mapRows * tileHeight;
let mapWidth = mapColumns * tileWidth;
let sourceX, sourceY, sourceTile;

let mapCanvas = document.getElementById('myCanvas');
mapCanvas.setAttribute('width', mapWidth);
mapCanvas.setAttribute('height', mapHeight);

let tilesetCanvas = document.getElementById('tileset');

let mapContext = mapCanvas.getContext('2d');
let tilesetContext = tilesetCanvas.getContext('2d');

let mouseDown;

document.addEventListener('contextmenu', event => event.preventDefault());

mapCanvas.addEventListener('mousedown', onMapMouseDown);
mapCanvas.addEventListener('mousemove', onMapMouseMove);
mapCanvas.addEventListener('click', onMapMouseClick);
mapCanvas.addEventListener('mouseup', onMapMouseUp);

tilesetCanvas.addEventListener('mousedown', onTilesetMouseDown);
tilesetCanvas.addEventListener('mousemove', onTilesetMouseMove);

// After loading image, do things
image.addEventListener('load', function() {
    tilesetCanvas.setAttribute('width', image.width);
    tilesetCanvas.setAttribute('height', image.height);
    redrawSource();
});

var mapX = mapCanvas.getClientRects()[0].x;
var mapY = mapCanvas.getClientRects()[0].y;

function getTilesetX() {
    return tilesetCanvas.getClientRects()[0].x;
}

function getTilesetY() {
    return tilesetCanvas.getClientRects()[0].y;
}

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

function redrawSource() {
    tilesetContext.drawImage(image, 0, 0, sourceWidth, sourceHeight);
}

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
            sourceTile = tiles[targetTile];
            var wint = Math.floor((sourceWidth / tileWidth));
            sourceX = sourceTile % wint * tileWidth;
            sourceY = Math.floor(sourceTile / wint) * tileHeight;
            console.log(sourceTile  + ", " + sourceX + ", " + sourceY);
            redrawSource();
            drawBox();
        }
    }
}

function onTilesetMouseDown(e) {
    mouseDown = false;

    let x = e.clientX - getTilesetX();
    let y = e.clientY - getTilesetY();
    let gridX = Math.floor(x / tileWidth) * tileWidth;
    let gridY = Math.floor(y / tileHeight) * tileHeight;

    // if (y > mapHeight && y < (mapHeight + sourceHeight) && x < sourceWidth) { // source
        let tileX = Math.floor(x / tileWidth);
        let tileY = Math.floor(y / tileHeight);
        sourceTile = tileY * (sourceWidth / tileWidth) + tileX;
        sourceX = gridX;
        sourceY = gridY;
        console.log(sourceTile  + ", " + sourceX + ", " + sourceY);
        redrawSource();
        drawBox();
    // }
}

function onMapMouseMove(e) {
    if (mouseDown == true) drawTile(e);
}

function onTilesetMouseMove(e) {
    let x = e.clientX - getTilesetX();
    let y = e.clientY - getTilesetY();
    let gridX, gridY;
    gridX = Math.floor(x / tileWidth) * tileWidth;
    gridY = Math.floor(y / tileHeight) * tileHeight;

    tilesetContext.clearRect(0, 0, sourceWidth, sourceHeight);
    redrawSource();
    tilesetContext.beginPath();
    tilesetContext.strokeStyle = 'blue';
    tilesetContext.rect(gridX, gridY, tileWidth, tileHeight);
    tilesetContext.stroke();
    drawBox();
}

function drawBox() {
    tilesetContext.beginPath();
    tilesetContext.strokeStyle = 'red';
    tilesetContext.rect(sourceX, sourceY, tileWidth, tileHeight);
    tilesetContext.stroke();
}

function onMapMouseClick(e) {
    drawTile(e);
}

function drawTile(e) {
    let x = e.clientX - mapX;
    let y = e.clientY - mapY;
    let gridX, gridY;
    gridX = Math.floor(x / tileWidth) * tileWidth;
    gridY = Math.floor(y / tileHeight) * tileHeight;
    if (y < mapHeight && x < mapWidth) { // target
        mapContext.clearRect(gridX, gridY, tileWidth, tileHeight);
        mapContext.drawImage(image, sourceX, sourceY, tileWidth, tileHeight, gridX, gridY, tileWidth, tileHeight);
        let tileX = Math.floor(x / tileWidth);
        let tileY = Math.floor(y / tileHeight);
        let targetTile = tileY * mapColumns + tileX;
        tiles[targetTile] = sourceTile;
        if (e.button == 2) {
            mapContext.clearRect(gridX, gridY, tileWidth, tileHeight);
            mapContext.beginPath();
            mapContext.strokeStyle = 'black';
            mapContext.rect(gridX, gridY, tileWidth, tileHeight);
            mapContext.stroke();
            tiles[targetTile] = null
        };
    }
}