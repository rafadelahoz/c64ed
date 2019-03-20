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
    currentTileY: -1,

    init: function() {
        this.image = new Image();
        this.image.src = 'assets/tileset-export.png';

        this.canvas = document.getElementById('tileset');
        this.context = this.canvas.getContext('2d');

        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.canvas.addEventListener('mousemove', this.onMouseMove);

        // After loading image, do things
        this.image.addEventListener('load', function() {
            var that = tilesetPanel;
            that.canvas.setAttribute('width', that.image.width);
            that.canvas.setAttribute('height', that.image.height);
            that.sourceWidth = that.image.width;
            that.sourceHeight = that.image.height;
            that.widthInTiles = Math.floor((that.sourceWidth / tileWidth));
            that.refreshColors();
            that.redraw();
            that.buildTintedCanvas();
        });
    },

    refreshColors: function() {
        fgColor = document.getElementById('fgColor').value;
        bgColor = document.getElementById('bgColor').value;
    },

    buildTintedCanvas: function() {
        if (!this.tintedCanvas) {
            this.tintedCanvas = document.createElement('canvas');
            this.tintedCanvas.id = 'tintedcanvas';
            this.tintedCanvas.width = this.image.width;
            this.tintedCanvas.height = this.image.height;
            this.tintedContext = this.tintedCanvas.getContext('2d');
            // document.getElementById('secret').appendChild(this.tintedCanvas);
        }

        this.refreshColors();

        this.tintedContext.rect(0, 0, this.sourceWidth, this.sourceHeight);
        this.tintedContext.fillStyle = bgColor;
        this.tintedContext.fill();
        drawTintedImage(true, this.tintedContext, this.image, fgColor, 0, 0, this.image.width, this.image.height);
    },

    onMouseMove: function (e) {
        let that = tilesetPanel;

        let x = e.clientX - that.offsetX();
        let y = e.clientY - that.offsetY();
        let gridX, gridY;
        gridX = Math.floor(x / tileWidth) * tileWidth;
        gridY = Math.floor(y / tileHeight) * tileHeight;
    
        that.context.clearRect(0, 0, that.sourceWidth, that.sourceHeight);
        that.redraw();
        that.context.beginPath();
        that.context.strokeStyle = 'blue';
        that.context.rect(gridX, gridY, tileWidth, tileHeight);
        that.context.stroke();
        that.drawBox();
    },

    onMouseDown: function(e) {
        mouseDown = false; // from another module

        let that = tilesetPanel;

        let x = e.clientX - that.offsetX();
        let y = e.clientY - that.offsetY();
    
        let tileX = Math.floor(x / tileWidth);
        let tileY = Math.floor(y / tileHeight);
        that.setCurrentTile(tileY * (that.sourceWidth / tileWidth) + tileX);
        
        that.redraw();
        that.drawBox();
    },

    setCurrentTile: function(tileId) {
        this.currentTile = tileId;
        this.currentTileX = this.getTileX(tileId);
        this.currentTileY = this.getTileY(tileId);
        console.log(this.currentTile  + ", " + this.currentTileX + ", " + this.currentTileY);
    },

    offsetX : function() {
        return this.canvas.getClientRects()[0].x;
    },

    offsetY : function() {
        return this.canvas.getClientRects()[0].y;
    },

    redraw: function () {
        this.context.rect(0, 0, this.sourceWidth, this.sourceHeight);
        this.context.fillStyle = bgColor;
        this.context.fill();
        drawTintedImage(true, this.context, this.image, fgColor, 0, 0, this.sourceWidth, this.sourceHeight);
    },

    drawBox: function () {
        this.context.beginPath();
        this.context.strokeStyle = 'red';
        this.context.rect(this.sourceX, this.sourceY, tileWidth, tileHeight);
        this.context.stroke();
    },

    getTileX: function(tileId) {
        return (tileId % this.widthInTiles) * tileWidth;
    },

    getTileY: function(tileId) {
        return (Math.floor(tileId / this.widthInTiles)) * tileHeight;
    }
}