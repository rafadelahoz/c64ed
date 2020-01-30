const globals = require('./globals.js');
const roomGrid = require('./screenGrid');
const tint = require('./tint.js');

/* 
 * Tileset panel
 * 
 * - Loads tileset
 * - Allows picking current tile
 * 
 */

var zoom = 1.5;

function init(layer, readyCallback) {
    let callback = readyCallback;

    if (layer != "bg" && layer != "fg")
        throw "Invalid layer, expected bg or fg";

    let tilesetPanel = {
        layer : layer,
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
        that.canvas.setAttribute('width', that.image.width * zoom);
        that.canvas.setAttribute('height', that.image.height * zoom);
        that.context.imageSmoothingEnabled = false;
        that.sourceWidth = that.image.width;
        that.sourceHeight = that.image.height;
        that.widthInTiles = Math.floor((that.sourceWidth / globals.tileWidth));

        refreshColors(true);

        redraw(tilesetPanel);
        if (callback) {
            callback(tilesetPanel);
        }
    });

    return tilesetPanel;
}

function room() {
    return roomGrid.getCurrentRoom();
}

function bgColor() {
    return room().colors[0];
}

function fgColor(layer) {
    if (layer == "bg")
        return room().colors[1];
    else 
        return room().colors[2];
}

function buildTintedCanvas(tilesetPanel) {
    if (!tilesetPanel.tintedCanvas) {
        tilesetPanel.tintedCanvas = document.createElement('canvas');
        tilesetPanel.tintedCanvas.id = 'tintedcanvas' + tilesetPanel.layer;
        
        tilesetPanel.tintedCanvas.width = tilesetPanel.image.width;
        tilesetPanel.tintedCanvas.height = tilesetPanel.image.height;

        tilesetPanel.tintedCanvas.setAttribute('width', tilesetPanel.image.width);
        tilesetPanel.tintedCanvas.setAttribute('height', tilesetPanel.image.height);

        tilesetPanel.tintedContext = tilesetPanel.tintedCanvas.getContext('2d');
        tilesetPanel.tintedContext.imageSmoothingEnabled = false;
        // document.getElementById('secret').appendChild(tilesetPanel.tintedCanvas);
    } 

    tilesetPanel.tintedContext.rect(0, 0, tilesetPanel.sourceWidth, tilesetPanel.sourceHeight);
    tilesetPanel.tintedContext.fillStyle = bgColor();
    tilesetPanel.tintedContext.fill();
    tint.drawTintedImage(true, tilesetPanel.tintedContext, tilesetPanel.image, fgColor(tilesetPanel.layer), 0, 0, tilesetPanel.image.width, tilesetPanel.image.height);
}

function onMouseMove(e) {
    let that = globals.getCurrentTilesetPanel();

    let x = e.clientX - offsetX(that);
    let y = e.clientY - offsetY(that);
    let gridX, gridY;
    gridX = Math.floor(x / (globals.tileWidth*zoom)) * globals.tileWidth * zoom;
    gridY = Math.floor(y / (globals.tileHeight*zoom)) * globals.tileHeight * zoom;

    redraw(that);
    
    // Draw cursor
    that.context.beginPath();
    that.context.strokeStyle = 'blue';
    that.context.rect(gridX, gridY, globals.tileWidth*zoom, globals.tileHeight*zoom);
    that.context.stroke();
}

function onMouseDown(e) {
    mouseDown = false; // from another module

    let that = globals.getCurrentTilesetPanel();

    let x = e.clientX - offsetX(that);
    let y = e.clientY - offsetY(that);

    let tileX = Math.floor(x / (globals.tileWidth*zoom));
    let tileY = Math.floor(y / (globals.tileHeight*zoom));
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
    if (!tilesetPanel || !tilesetPanel.context)
        return;
        
    tilesetPanel.context.rect(0, 0, tilesetPanel.sourceWidth*zoom, tilesetPanel.sourceHeight*zoom);
    tilesetPanel.context.fillStyle = bgColor();
    tilesetPanel.context.fill();
    tint.drawTintedImage(true, tilesetPanel.context, tilesetPanel.image, fgColor(tilesetPanel.layer), 0, 0, tilesetPanel.sourceWidth*zoom, tilesetPanel.sourceHeight*zoom);
    buildTintedCanvas(tilesetPanel);

    // Highlight current tile
    let ct = tilesetPanel.currentTile;
    tilesetPanel.context.beginPath();
    tilesetPanel.context.strokeStyle = 'red';
    tilesetPanel.context.rect(getTileX(tilesetPanel, ct)*zoom, getTileY(tilesetPanel, ct)*zoom, globals.tileWidth*zoom, globals.tileHeight*zoom);
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

function refreshColors(avoidRedraw) {
    if (room()) {
        room().colors[2] = document.getElementById('fgColor-fg').value;
        room().colors[1] = document.getElementById('fgColor-bg').value;
        room().colors[0] = document.getElementById('bgColor').value;

        if (!avoidRedraw) {
            redraw(globals.getTilesetPanel("bg"));
            redraw(globals.getTilesetPanel("fg"));
        }
    }
}

module.exports = {
    init: init,
    redraw: redraw,
    getCurrentTile: getCurrentTile,
    setCurrentTile: setCurrentTile,
    getTileX: getTileX,
    getTileY: getTileY,
    getTintedCanvas: getTintedCanvas,
    refreshColors: refreshColors
}