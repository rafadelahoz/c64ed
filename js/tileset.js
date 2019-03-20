const globals = require('./globals.js');
const tint = require('./tint.js')

/* 
 * Tileset panel
 * 
 * - Loads tileset
 * - Allows picking current tile
 * 
 */
const tilesetPanel = {
    canvas: undefined,
    context: undefined,
    image: undefined,
    tintedCanvas: undefined,
    tintedContext: undefined,

    sourceWidth: -1,
    sourceHeight: -1,

    widthInTiles: -1,

    currentTile: -1,
    currentTileX: -1,
    currentTileY: -1
}

function init(readyCallback) {
    let callback = readyCallback;

    tilesetPanel.image = new Image();
    tilesetPanel.image.src = 'assets/tileset-export.png';

    tilesetPanel.canvas = document.getElementById('tileset-bg');
    tilesetPanel.context = tilesetPanel.canvas.getContext('2d');

    tilesetPanel.canvas.addEventListener('mousedown', onMouseDown);
    tilesetPanel.canvas.addEventListener('mousemove', onMouseMove);

    // After loading image, do things
    tilesetPanel.image.addEventListener('load', function() {
        var that = tilesetPanel;
        that.canvas.setAttribute('width', that.image.width);
        that.canvas.setAttribute('height', that.image.height);
        that.sourceWidth = that.image.width;
        that.sourceHeight = that.image.height;
        that.widthInTiles = Math.floor((that.sourceWidth / globals.tileWidth));
        refreshColors();
        redraw();
        buildTintedCanvas();
        if (callback) {
            callback();
        }
    });
}

function refreshColors() {
    globals.setFgColor(document.getElementById('fgColor').value);
    globals.setBgColor(document.getElementById('bgColor').value);
}

function buildTintedCanvas() {
    if (!tilesetPanel.tintedCanvas) {
        tilesetPanel.tintedCanvas = document.createElement('canvas');
        tilesetPanel.tintedCanvas.id = 'tintedcanvas';
        tilesetPanel.tintedCanvas.width = tilesetPanel.image.width;
        tilesetPanel.tintedCanvas.height = tilesetPanel.image.height;
        tilesetPanel.tintedContext = tilesetPanel.tintedCanvas.getContext('2d');
        // document.getElementById('secret').appendChild(tilesetPanel.tintedCanvas);
    } 

    refreshColors();

    tilesetPanel.tintedContext.rect(0, 0, tilesetPanel.sourceWidth, tilesetPanel.sourceHeight);
    tilesetPanel.tintedContext.fillStyle = globals.getBgColor();
    tilesetPanel.tintedContext.fill();
    tint.drawTintedImage(true, tilesetPanel.tintedContext, tilesetPanel.image, globals.getFgColor(), 0, 0, tilesetPanel.image.width, tilesetPanel.image.height);
}

function onMouseMove(e) {
    let that = tilesetPanel;

    let x = e.clientX - offsetX();
    let y = e.clientY - offsetY();
    let gridX, gridY;
    gridX = Math.floor(x / globals.tileWidth) * globals.tileWidth;
    gridY = Math.floor(y / globals.tileHeight) * globals.tileHeight;

    that.context.clearRect(0, 0, that.sourceWidth, that.sourceHeight);
    redraw();
    that.context.beginPath();
    that.context.strokeStyle = 'blue';
    that.context.rect(gridX, gridY, globals.tileWidth, globals.tileHeight);
    that.context.stroke();
    drawBox();
}

function onMouseDown(e) {
    mouseDown = false; // from another module

    let that = tilesetPanel;

    let x = e.clientX - offsetX();
    let y = e.clientY - offsetY();

    let tileX = Math.floor(x / globals.tileWidth);
    let tileY = Math.floor(y / globals.tileHeight);
    setCurrentTile(tileY * (that.sourceWidth / globals.tileWidth) + tileX);
    
    redraw();
    drawBox();
}

function setCurrentTile(tileId) {
    tilesetPanel.currentTile = tileId;
    tilesetPanel.currentTileX = getTileX(tileId);
    tilesetPanel.currentTileY = getTileY(tileId);
    console.log(tilesetPanel.currentTile  + ", " + tilesetPanel.currentTileX + ", " + tilesetPanel.currentTileY);
}

function getCurrentTile() {
    return tilesetPanel.currentTile;
}

function offsetX() {
    return tilesetPanel.canvas.getClientRects()[0].x;
}

function offsetY() {
    return tilesetPanel.canvas.getClientRects()[0].y;
}

function redraw() {
    tilesetPanel.context.rect(0, 0, tilesetPanel.sourceWidth, tilesetPanel.sourceHeight);
    tilesetPanel.context.fillStyle = globals.getBgColor();
    tilesetPanel.context.fill();
    tint.drawTintedImage(true, tilesetPanel.context, tilesetPanel.image, globals.getFgColor(), 0, 0, tilesetPanel.sourceWidth, tilesetPanel.sourceHeight);
}

function drawBox() {
    tilesetPanel.context.beginPath();
    tilesetPanel.context.strokeStyle = 'red';
    tilesetPanel.context.rect(tilesetPanel.sourceX, tilesetPanel.sourceY, globals.tileWidth, globals.tileHeight);
    tilesetPanel.context.stroke();
}

function getTileX(tileId) {
    return (tileId % tilesetPanel.widthInTiles) * globals.tileWidth;
}

function getTileY(tileId) {
    return (Math.floor(tileId / tilesetPanel.widthInTiles)) * globals.tileHeight;
}

function getTintedCanvas() {
    return tilesetPanel.tintedCanvas;
}

module.exports = {
    init: init,
    redraw: redraw,
    buildTintedCanvas: buildTintedCanvas,
    getCurrentTile: getCurrentTile,
    setCurrentTile: setCurrentTile,
    getTileX: getTileX,
    getTileY: getTileY,
    getTintedCanvas: getTintedCanvas
}