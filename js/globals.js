var tileWidth = 14;
var tileHeight = 14;

const baseColumns = 15;
const baseRows = 11;

var mapColumns = 15;
var mapRows = 11;

var fgColor = {
};
var bgColor = '#ff000a';

function getFgColor(layer) {
    return fgColor[layer];
}

function setFgColor(layer, color) {
    fgColor[layer] = color;
}

function getBgColor() {
    return bgColor;
}

function setBgColor(color) {
    bgColor = color;
}

function refreshColors() {
    setFgColor('bg', document.getElementById('fgColor-bg').value);
    setFgColor('fg', document.getElementById('fgColor-fg').value);
    setBgColor(document.getElementById('bgColor').value);
}

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

function getMapSize() {
    return {
        columns: mapColumns,
        rows: mapRows
    };
}

module.exports = {
    tileWidth: tileWidth,
    tileHeight: tileHeight,
    baseColumns: baseColumns,
    baseRows: baseRows,

    getBgColor: getBgColor,
    setBgColor: setBgColor,
    getFgColor: getFgColor,
    setFgColor: setFgColor,
    refreshColors: refreshColors,
    refreshColorInputs: refreshColorInputs,

    getTilesetPanels: getTilesetPanels,
    getCurrentTilesetPanel: getCurrentTilesetPanel,

    getTilesetPanel: getTilesetPanel,
    setTilesetPanel: setTilesetPanel,
    getCurrentLayer: getCurrentLayer,
    setCurrentLayer: setCurrentLayer,

    getRenderSolids: getRenderSolids,
    switchRenderSolids: switchRenderSolids
}