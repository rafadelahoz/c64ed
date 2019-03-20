var tileWidth = 14;
var tileHeight = 14;

var mapColumns = 15;
var mapRows = 11;

var fgColor = '#00ff0a';
var bgColor = '#ff000a';

function getFgColor() {
    return fgColor;
}

function setFgColor(color) {
    fgColor = color;
    console.log(fgColor);
}

function getBgColor() {
    return bgColor;
}

function setBgColor(color) {
    bgColor = color;
    console.log(bgColor);
}

module.exports = {
    tileWidth: tileWidth,
    tileHeight: tileHeight,
    mapColumns: mapColumns,
    mapRows: mapRows,
    getBgColor: getBgColor,
    setBgColor: setBgColor,
    getFgColor: getFgColor,
    setFgColor: setFgColor
}