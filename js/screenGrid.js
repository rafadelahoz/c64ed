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
    
    if (x >= width) {
        grid = resizeKeepData(grid, x+1, height, width, height, 0, 0);
        width = x + 1;
    } else if (x < 0) {
        grid = resizeKeepData(grid, width+1, height, width, height, 1, 0);
        width = width+1;
        room.gridX = 0;
        x = 0;
    }

    if (y >= height) {
        grid = resizeKeepData(grid, width, y+1, width, height, 0, 0);
        height = y + 1;
    } else if (y < 0) {
        grid = resizeKeepData(grid, width, height+1, width, height, 0, 1);
        height = height + 1;
        room.gridY = 1;
        y = 0;
    }

    room.gridX = x;
    room.gridY = y;

    set(grid, width, x, y, room.id);

    setCursor(x, y);

    debugPrint();

    return room;
}

function debugPrint() {
    console.log(width + ", " + height);
    console.log(grid);
    console.log(current);
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
    if (col >= 0 && col < width && row >= 0 && row < height)
        return arr[col + cols*row];
    else
        return undefined;
}

function resizeKeepData(arr, nw, nh, w, h, ox, oy) {
    let newmap = new Array(nw * nh);
    let map = arr;
    for (var col = 0; col < nw; col++) {
        for (var row = 0; row < nh; row++) {
            // Inside source map area
            if (col >= ox && col < ox+w &&  
                row >= oy && row < oy+h) {
                let roomId = get(map, w, col-ox, row-oy);
                set(newmap, nw, col, row, roomId);
                if (data.getMap().rooms[roomId]) {
                    data.getMap().rooms[roomId].gridX = col;
                    data.getMap().rooms[roomId].gridY = row;
                }
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

    var originX = (room.gridX > 0 ? room.gridX : 0);
    if (room.gridX < 0) {
        var delta = -room.gridX;
        grid = resizeKeepData(grid, width + delta, height, width, height, delta, 0);
        width = width + delta;
    } else if (originX + roomScreenWidth > width) {
        var delta = (originX + roomScreenWidth) - width;
        grid = resizeKeepData(grid, width + delta, height, width, height, 0, 0);
        width = width + delta;
    }

    var originY = (room.gridY > 0 ? room.gridY : 0);
    if (room.gridY < 0) {
        var delta = -room.gridY;
        grid = resizeKeepData(grid, width, height + delta, width, height, 0, delta);
        height = height + delta;
    } else if (originY + roomScreenHeight > height) {
        var delta = (originY + roomScreenHeight) - height;
        grid = resizeKeepData(grid, width, height + delta, width, height, 0, 0);
        height = height + delta;
    }

    for (var col = 0; col < roomScreenWidth; col++) {
        for (var row = 0; row < roomScreenHeight; row++) {
            // failsafe here?
            set(grid, width, originX+col, originY+row, room.id);
        }
    }

    room.gridX = originX;
    room.gridY = originY;    

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
    redraw: redraw,
    debugPrint: debugPrint
};