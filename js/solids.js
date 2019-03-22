const globals = require('./globals.js');
const screenDisplay = require('./screenDisplay.js');

let currentSolid = 0;

function init() {
    $('.btn-solid').on('click', function(e) {
        let id = e.target.id;
        let type = id.split("-")[2];
        switch (type) {
            case "none": currentSolid = 0; break;
            case "solid": currentSolid = 1; break;
            case "oneway": currentSolid = 2; break;
        }
    });
}

function getCurrentSolid() {
    return currentSolid;
}

function setCurrentSolid(solid) {
    currentSolid = solid;
}

module.exports = {
    init: init,
    getCurrentSolid: getCurrentSolid,
    setCurrentSolid: setCurrentSolid
}