const globals = require('./globals.js');

var map = {
    id: undefined,
    name: undefined,
    rooms: {}, // map of id-rooms
    grid: [],
    size: {x: 0, y: 0}
};

function init() {
    // Load or whatever, for now just init empty
    map = {
        id: 'id-' + Math.round(Math.random()*120),
        name: "Wisconsin",
        rooms: [],
        grid: [],
        size: {x: 0, y: 0}
    }
}

function load(mapData) {
    map = mapData;
}

function getMap() {
    return map;
}

function createRoom() {
    // Initialize a new room
    var room = {
        id: map.rooms.length,
        name: "Room " + map.rooms.length + " name",
        colors: ['#000000', '#666666', '#ffffff'],
        columns: globals.baseColumns,
        rows: globals.baseRows,
        tiles: {},
        solids: [],
        actors: []
    };

    // Add it to the map
    map.rooms[room.id] = room;

    return room;
}

function deleteRoom(id) {
    delete map.rooms[id];
}

module.exports = {
    init: init,
    load: load,
    getMap: getMap,
    createRoom: createRoom,
    deleteRoom: deleteRoom
};