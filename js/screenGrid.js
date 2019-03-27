const mousetrap = require('mousetrap');

const data = require('./data.js');

var grid = [];
var width = 1;
var height = 1;

var current = {
    x: 0,
    y: 0
};

mousetrap.bind('g', function(e, combo) {
    console.log(grid);
    console.log(current);
});

function init() {
    addRoom(0, 0);
}

function addRoom(x, y) {
    var room = data.createRoom();
    room.gridX = x;
    room.gridY = y;
    if (x >= width) {
        grid = resizeKeepData(grid, x+1, height, width, height, 0, 0);
        width = x + 1;
    }
    if (y >= height) {
        grid = resizeKeepData(grid, width, y+1, width, height, 0, 0);
        height = y + 1;
    }

    set(grid, width, x, y, room.id);
    return room;
}

function getId(x, y) {
    return get(grid, width, x, y);
}

function getRoom(x, y) {
    return data.getMap().rooms[getId(x, y)];
}

function getCurrentRoom() {
    return getRoom(current.x, current.y);
}

function getCursor() {
    return current;
}

function setCursor(x, y) {
    current.x = x;
    current.y = y;
    redraw();
}

function set(arr, cols, col, row , value) {
    arr[col + cols*row] = value;
}

function get(arr, cols, col, row) {
    return arr[col + cols*row];
}

function resizeKeepData(arr, nw, nh, w, h, ox, oy) {
    let newmap = new Array(nw * nh);
    let map = arr;
    for (var col = 0; col < nw; col++) {
        for (var row = 0; row < nh; row++) {
            // Inside source map area
            if (col >= ox && col < ox+w &&  
                row >= oy && row < oy+h) {
                set(newmap, nw, col, row, get(map, w, col-ox, row-oy));
            } 
            // Outside source map
            else {
                set(newmap, nw, col, row, undefined);
            }
        }
    }

    return newmap;
}

function empty(x, y) {
    return getId(x, y) == undefined;
}

function canResizeCurrent(delta, dir) {
    var room = getCurrentRoom();
    let roomScreenWidth = Math.floor(room.columns / globals.baseColumns) - 1;
    let roomScreenHeight = Math.floor(room.rows / globals.baseRows) - 1;
    if (dir == "left" || dir == "right")
        delta = Math.floor(delta/globals.baseColumns);
    else if (dir == "top" || dir == "bottom")
        delta = Math.floor(delta/globals.baseRows);

    var nx = room.gridX;
    var ny = room.gridY;
    switch (dir) {
        case "left": nx -= delta; break;
        case "right": nx += roomScreenWidth + delta; break;
        case "top": ny -= delta; break;
        case "bottom": ny += roomScreenHeight + delta; break;
        default:
    }

    return (empty(nx, ny));
}

function refreshCurrentRoomSize() {
    var room = getCurrentRoom();
    let roomScreenWidth = Math.floor(room.columns / globals.baseColumns);
    let roomScreenHeight = Math.floor(room.rows / globals.baseRows);

    if (room.gridX + roomScreenWidth > width) {
        // TODO: resize from left?
        grid = resizeKeepData(grid, room.gridX + roomScreenWidth, height, width, height, 0, 0);
        width = room.gridX + roomScreenWidth;
    }

    if (room.gridY + roomScreenHeight > height) {
        grid = resizeKeepData(grid, width, room.gridY + roomScreenHeight, width, height, 0, 0);
        height = room.gridY + roomScreenHeight;
    }

    for (var col = 0; col < roomScreenWidth; col++) {
        for (var row = 0; row < roomScreenHeight; row++) {
            // failsafe here?
            set(grid, width, room.gridX+col, room.gridY+row, room.id);
        }
    }

    redraw();
}

function redraw() {
    var g = $('#grid');
    g.empty();

    let str = "";
    for (var row = 0; row < height; row++) {
        str += "<p>";
        for (var col = 0; col < width; col++) {
            if (col == current.x && row == current.y)
                str += "[";
            if (empty(col, row)) {
                str += "X"
            } else {
                str += getId(col, row);
            }
            if (col == current.x && row == current.y)
                str += "]";
            if (col < width-1)
                str += ", ";
        }
        str += "</p><br>";
    }

    str += "<span>Current: " + JSON.stringify(current) + "</span>";
    g.html(str);
}

module.exports = {
    init: init,
    addRoom: addRoom,
    getId: getId,
    getRoom: getRoom,
    getCurrentRoom: getCurrentRoom,
    getCursor: getCursor,
    setCursor: setCursor,
    canResizeCurrent: canResizeCurrent,
    refreshCurrentRoomSize: refreshCurrentRoomSize,
    empty: empty,
    redraw: redraw
};