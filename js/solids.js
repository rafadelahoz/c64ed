
let currentSolid = 0;

function init() {
    $('.btn-solid').on('click', function(e) {
        let id = e.target.id;
        let type = id.split("-")[2];
        switch (type) {
            case "none": currentSolid = 0; break;
            case "solid": currentSolid = 1; break;
            case "oneway": currentSolid = 2; break;
            case "ladder": currentSolid = 3; break;
        }
        refreshButtons();
    });
}

function getCurrentSolid() {
    return currentSolid;
}

function setCurrentSolid(solid) {
    currentSolid = solid;
    refreshButtons();
}

function refreshButtons() {
    $('.btn-solid').each(function(i, el) {
        if (i != currentSolid)
            $(el).removeClass('btn-success');
        else
            $(el).addClass('btn-success');
    });
}

module.exports = {
    init: init,
    getCurrentSolid: getCurrentSolid,
    setCurrentSolid: setCurrentSolid
}