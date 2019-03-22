const globals = require('./globals.js');
const tint = require('./tint.js')

/* 
 * Tileset panel
 * 
 * - Loads tileset
 * - Allows picking current tile
 * 
 */

function init(layer, readyCallback) {
    let callback = readyCallback;

    if (layer != "bg" && layer != "fg")
        throw "Invalid layer, expected bg or fg";

    let tilesetPanel = {
        canvas: undefined,
        context: undefined,
        image: undefined,
        tintedCanvas: undefined,
        tintedContext: undefined,
    
        sourceWidth: -1,
        sourceHeight: -1,
    
        widthInTiles: -1,
    
        currentTile: -1
    }

    tilesetPanel.image = new Image();
    tilesetPanel.image.src = 'assets/tileset-export.png';

    tilesetPanel.canvas = document.getElementById('tileset-' + layer);
    tilesetPanel.context = tilesetPanel.canvas.getContext('2d');
    tilesetPanel.context.imageSmoothingEnabled = false;

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
        redraw(tilesetPanel);
        if (callback) {
            callback(tilesetPanel);
        }
    });

    return tilesetPanel;
}

function refreshColors() {
    if (globals.getCurrentLayer() == "bg" || globals.getCurrentLayer() == "fg") {
        globals.setFgColor(globals.getCurrentLayer(), document.getElementById('fgColor-' + globals.getCurrentLayer()).value);
    }
    globals.setBgColor(document.getElementById('bgColor').value);
}

function buildTintedCanvas(tilesetPanel) {
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
    tint.drawTintedImage(true, tilesetPanel.tintedContext, tilesetPanel.image, globals.getFgColor(globals.getCurrentLayer()), 0, 0, tilesetPanel.image.width, tilesetPanel.image.height);
}

function onMouseMove(e) {
    let that = globals.getCurrentTilesetPanel();

    let x = e.clientX - offsetX(that);
    let y = e.clientY - offsetY(that);
    let gridX, gridY;
    gridX = Math.floor(x / globals.tileWidth) * globals.tileWidth;
    gridY = Math.floor(y / globals.tileHeight) * globals.tileHeight;

    redraw(that);
    
    // Draw cursor
    that.context.beginPath();
    that.context.strokeStyle = 'blue';
    that.context.rect(gridX, gridY, globals.tileWidth, globals.tileHeight);
    that.context.stroke();
}

function onMouseDown(e) {
    mouseDown = false; // from another module

    let that = globals.getCurrentTilesetPanel();

    let x = e.clientX - offsetX(that);
    let y = e.clientY - offsetY(that);

    let tileX = Math.floor(x / globals.tileWidth);
    let tileY = Math.floor(y / globals.tileHeight);
    setCurrentTile(that, tileY * (that.sourceWidth / globals.tileWidth) + tileX);
    
    redraw(that);
}

function setCurrentTile(tilesetPanel, tileId) {
    tilesetPanel.currentTile = tileId;
    redraw(tilesetPanel);
}

function getCurrentTile(tilesetPanel) {
    return tilesetPanel.currentTile;
}

function offsetX(tilesetPanel) {
    return tilesetPanel.canvas.getClientRects()[0].x;
}

function offsetY(tilesetPanel) {
    return tilesetPanel.canvas.getClientRects()[0].y;
}

function redraw(tilesetPanel) {
    tilesetPanel.context.rect(0, 0, tilesetPanel.sourceWidth, tilesetPanel.sourceHeight);
    tilesetPanel.context.fillStyle = globals.getBgColor();
    tilesetPanel.context.fill();
    tint.drawTintedImage(true, tilesetPanel.context, tilesetPanel.image, globals.getFgColor(globals.getCurrentLayer()), 0, 0, tilesetPanel.sourceWidth, tilesetPanel.sourceHeight);
    buildTintedCanvas(tilesetPanel);

    // Highlight current tile
    let ct = tilesetPanel.currentTile;
    tilesetPanel.context.beginPath();
    tilesetPanel.context.strokeStyle = 'red';
    tilesetPanel.context.rect(getTileX(tilesetPanel, ct), getTileY(tilesetPanel, ct), globals.tileWidth, globals.tileHeight);
    tilesetPanel.context.stroke();
}

function getTileX(tilesetPanel, tileId) {
    return (tileId % tilesetPanel.widthInTiles) * globals.tileWidth;
}

function getTileY(tilesetPanel, tileId) {
    return (Math.floor(tileId / tilesetPanel.widthInTiles)) * globals.tileHeight;
}

function getTintedCanvas(tilesetPanel) {
    return tilesetPanel.tintedCanvas;
}

module.exports = {
    init: init,
    redraw: redraw,
    getCurrentTile: getCurrentTile,
    setCurrentTile: setCurrentTile,
    getTileX: getTileX,
    getTileY: getTileY,
    getTintedCanvas: getTintedCanvas
}