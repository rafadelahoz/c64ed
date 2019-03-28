var tileWidth = 14;
var tileHeight = 14;

const baseColumns = 15;
const baseRows = 11;

var currentLayer = "bg";
var tilesetPanels = {};

function getCurrentLayer() {
    return currentLayer;
}

function setCurrentLayer(layer) {
    currentLayer = layer;
}

function getTilesetPanels() {
    return tilesetPanels;
}

function setTilesetPanel(layer, panel) {
    tilesetPanels[layer] = panel;
}

function getTilesetPanel(layer) {
    return tilesetPanels[layer];
}

function getCurrentTilesetPanel() {
    return tilesetPanels[currentLayer];
}

var renderSolids = true;
function getRenderSolids() {
    return renderSolids;
}

function switchRenderSolids() {
    renderSolids = !renderSolids;
}

module.exports = {
    tileWidth: tileWidth,
    tileHeight: tileHeight,
    baseColumns: baseColumns,
    baseRows: baseRows,

    getTilesetPanels: getTilesetPanels,
    getCurrentTilesetPanel: getCurrentTilesetPanel,

    getTilesetPanel: getTilesetPanel,
    setTilesetPanel: setTilesetPanel,
    getCurrentLayer: getCurrentLayer,
    setCurrentLayer: setCurrentLayer,

    getRenderSolids: getRenderSolids,
    switchRenderSolids: switchRenderSolids
}