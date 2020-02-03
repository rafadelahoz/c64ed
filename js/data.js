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
        name: "MAP NAME",
        rooms: [],
        grid: [],
        size: {x: 0, y: 0}
    }
}

/**
 * Loads the provided data as the current map data
 * @param {map} mapData Data to use
 */
function load(mapData) {
    map = mapData;
    // TODO: checks over loaded map (for compatibility)
    for (room of map.rooms) {
        if (room && !room.actors)
            room.actors = [];
    }
}

/**
 * Returns a reference to the current map data
 */
function getMap() {
    return map;
}

/**
 * Returns a deep copy of the current map data (hopefully)
 */
function getMapStamp() {
    return JSON.parse(JSON.stringify(map));
}

/**
 * Creates a new empty room in the map, and returns a reference to it
 */
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

/**
 * Deletes the room with the provided id from the map
 * @param {int} id Id of the room to remove
 */
function deleteRoom(id) {
    delete map.rooms[id];
}

module.exports = {
    init: init,
    load: load,
    getMap: getMap,
    getMapStamp: getMapStamp,
    createRoom: createRoom,
    deleteRoom: deleteRoom
};