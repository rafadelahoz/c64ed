const mousetrap = require('mousetrap');

const data = require('./data.js');

var grid = undefined;

var current = {
    x: 0,
    y: 0
};

mousetrap.bind('g', function(e, combo) {
    console.log(grid);
    console.log(current);
    console.log(getCurrentRoom());
});

function init() {
    grid = data.getMap().grid;
    if (empty(0, 0))
        addRoom(0, 0);
}

function reload() {
    grid = data.getMap().grid;
    setCursor(0, 0);
    redraw();
}

function addRoom(x, y) {
    var room = data.createRoom();
    
    if (x >= data.getMap().size.x) {
        grid = resizeKeepData(grid, x+1, data.getMap().size.y, data.getMap().size.x, data.getMap().size.y, 0, 0);
        data.getMap().size.x = x + 1;
    } else if (x < 0) {
        grid = resizeKeepData(grid, data.getMap().size.x+Math.abs(x), data.getMap().size.y, data.getMap().size.x, data.getMap().size.y, Math.abs(x), 0);
        data.getMap().size.x = data.getMap().size.x+Math.abs(x);
        room.gridX = 0;
        x = 0;
    }

    if (y >= data.getMap().size.y) {
        grid = resizeKeepData(grid, data.getMap().size.x, y+1, data.getMap().size.x, data.getMap().size.y, 0, 0);
        data.getMap().size.y = y + 1;
    } else if (y < 0) {
        grid = resizeKeepData(grid, data.getMap().size.x, data.getMap().size.y+Math.abs(y), data.getMap().size.x, data.getMap().size.y, 0, Math.abs(y));
        data.getMap().size.y = data.getMap().size.y+Math.abs(y);
        room.gridY = 0;
        y = 0;
    }

    room.gridX = x;
    room.gridY = y;

    set(grid, data.getMap().size.x, x, y, room.id);

    setCursor(x, y);

    data.getMap().grid = grid;

    debugPrint();

    return room;
}

function removeCurrentRoom() {
    room = getCurrentRoom();
    if (room) {
        for (var col = room.gridX; col < room.gridX + screensWidth(room.columns); col++)
            for (var row = room.gridY; row < room.gridY + screensHeight(room.rows); row++)
                set(grid, data.getMap().size.x, col, row, undefined);
        
        data.deleteRoom(room.id);
    }
}

function screensWidth(widthInTiles) {
    return Math.floor(widthInTiles / globals.baseColumns);
}

function screensHeight(heightInTiles) {
    return Math.floor(heightInTiles / globals.baseRows);
}

function debugPrint() {
    console.log(data.getMap().size.x + ", " + data.getMap().size.y);
    console.log(grid);
    console.log(current);
}

function getId(x, y) {
    return get(grid, data.getMap().size.x, x, y);
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
    if (col >= 0 && col < data.getMap().size.x && row >= 0 && row < data.getMap().size.y)
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

    // Recompute grid position for each room
    let roomId = undefined;
    let done = false;
    for (room of data.getMap().rooms) {
        roomId = room.id;
        done = false;
        for (let row = 0; row < nh; row++) {
            for (let col = 0; col < nw; col++) {
                if (get(newmap, nw, col, row) == roomId) {
                    room.gridX = col;
                    room.gridY = row;
                    done = true;
                    break;
                }
            }
            // Next room!
            if (done)
               break;
        }
    }

    return newmap;
}

function empty(x, y) {
    return getId(x, y) == undefined;
}

function canResizeCurrent(delta, dir) {
    var room = getCurrentRoom();
    let roomScreenWidth = screensWidth(room.columns) - 1;
    let roomScreenHeight = screensHeight(room.rows) - 1;
    if (dir == "left" || dir == "right")
        delta = screensWidth(delta);
    else if (dir == "top" || dir == "bottom")
        delta = screensHeight(delta);

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
    let roomScreenWidth = screensWidth(room.columns);
    let roomScreenHeight = screensHeight(room.rows);

    var originX = (room.gridX > 0 ? room.gridX : 0);
    if (room.gridX < 0) {
        var delta = -room.gridX;
        grid = resizeKeepData(grid, data.getMap().size.x + delta, data.getMap().size.y, data.getMap().size.x, data.getMap().size.y, delta, 0);
        data.getMap().size.x = data.getMap().size.x + delta;
    } else if (originX + roomScreenWidth > data.getMap().size.x) {
        var delta = (originX + roomScreenWidth) - data.getMap().size.x;
        grid = resizeKeepData(grid, data.getMap().size.x + delta, data.getMap().size.y, data.getMap().size.x, data.getMap().size.y, 0, 0);
        data.getMap().size.x = data.getMap().size.x + delta;
    }

    var originY = (room.gridY > 0 ? room.gridY : 0);
    if (room.gridY < 0) {
        var delta = -room.gridY;
        grid = resizeKeepData(grid, data.getMap().size.x, data.getMap().size.y + delta, data.getMap().size.x, data.getMap().size.y, 0, delta);
        data.getMap().size.y = data.getMap().size.y + delta;
    } else if (originY + roomScreenHeight > data.getMap().size.y) {
        var delta = (originY + roomScreenHeight) - data.getMap().size.y;
        grid = resizeKeepData(grid, data.getMap().size.x, data.getMap().size.y + delta, data.getMap().size.x, data.getMap().size.y, 0, 0);
        data.getMap().size.y = data.getMap().size.y + delta;
    }

    room.gridX = originX;
    room.gridY = originY;

    refreshAllRoomPositions();

    redraw();
}

function refreshAllRoomPositions() {
    let rooms = data.getMap().rooms;
    
    // Clear grid
    for (let col = 0; col < data.getMap().size.x; col++)
        for (let row = 0; row < data.getMap().size.y; row++)
            set(grid, data.getMap().size.x, col, row, undefined);
    
    // Refill grid
    for (roomId in rooms) {
        let room = rooms[roomId];
        if (room) {
            let roomScreenWidth = screensWidth(room.columns);
            let roomScreenHeight = screensHeight(room.rows);
            for (var col = 0; col < roomScreenWidth; col++) {
                for (var row = 0; row < roomScreenHeight; row++) {           
                    set(grid, data.getMap().size.x, room.gridX+col, room.gridY+row, room.id);
                }
            }
        }
    }

    data.getMap().grid = grid;
}

function redraw() {
    var g = $('#grid');
    g.empty();

    let str = "";

    var ox = Math.min(0, current.x);
    var oy = Math.min(0, current.y);
    var w = Math.max(data.getMap().size.x, current.x+1);
    var h = Math.max(data.getMap().size.y, current.y+1);

    for (var row = oy; row < h; row++) {
        str += "<p>";
        for (var col = ox; col < w; col++) {
            if (col == current.x && row == current.y)
                str += "[";
            else str += "&nbsp;";

            if (col < 0 || row < 0 || col >= data.getMap().size.x || row >= data.getMap().size.y) {
                str += ".";
            } else if (empty(col, row)) {
                str += "X"
            } else {
                str += getId(col, row);
            }

            if (col == current.x && row == current.y)
                str += "]";
            else str += "&nbsp;";
        }
        str += "</p>";
    }

    str += "<span>Current: " + JSON.stringify(current) + "</span>";
    g.html(str);
}

module.exports = {
    init: init,
    reload: reload,
    addRoom: addRoom,
    removeCurrentRoom: removeCurrentRoom,
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