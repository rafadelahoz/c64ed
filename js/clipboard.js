
const globals = require('./globals.js');
const screenGrid = require('./screenGrid.js');

/**
 * Copies data of room currently highlighted by cursor
 * Pastes it over room currently highlighted by cursor
 * For bigger rooms, how to copy only 1 screen?
 * Or, allow copy/pasting only full rooms? 
 * (the target room must be properly dimensioned)
 * Copy:
 *  - tiles (fg, bg)
 *  - solids
 *  - actors?
 *    - some may not be copied, like map start position and so on
 *  - colors (bg, tbg, tfg)
 */

let roomClipboard = {
    hasData: false,
    colors: [],
    tiles: {},
    solids: [],
    actors: []
}

/**
 * Copies current room data into the clipboard
 * @param {Room data} sourceRoom 
 */
function copyRoom() {

    let room = screenGrid.getCurrentRoom();
    let cursor = screenGrid.getCursor();

    if (!room || !cursor)
        return;

    roomClipboard.hasData = true;

    // Copy colors
    // TODO: Only if required
    roomClipboard.colors = [];
    for (color of room.colors) {
        roomClipboard.colors.push(color);
    }

    // Copy tiles, only for the cursor!
    let screenX = (cursor.x - room.gridX);
    let screenY = (cursor.y - room.gridY);
    let startTileX = screenX * globals.baseColumns;
    let startTileY = screenY * globals.baseRows;
    let columns = globals.baseColumns;
    let rows = globals.baseRows;

    // Background tiles
    roomClipboard.tiles["bg"] = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            roomClipboard.tiles["bg"].push(get(room.tiles["bg"], room.columns, startTileX + col, startTileY + row));
        }
    }

    // Foreground tiles
    roomClipboard.tiles["fg"] = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            roomClipboard.tiles["fg"].push(get(room.tiles["fg"], room.columns, startTileX + col, startTileY + row));
        }
    }

    // Solids
    roomClipboard.solids = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            roomClipboard.solids.push(get(room.solids, room.columns, startTileX + col, startTileY + row));
        }
    }

    // TODO: Actors
}

/**
 * Pastes copied room data into current room
 */
function pasteRoom() {
    let room = screenGrid.getCurrentRoom();
    let cursor = screenGrid.getCursor();

    if (!room || !cursor || !roomClipboard.hasData)
        return;

    // Copy colors
    // TODO: Only if required
    room.colors = [];
    for (color of roomClipboard.colors) {
        room.colors.push(color);
    }

    // Copy tiles, only for the cursor!
    let screenX = (cursor.x - room.gridX);
    let screenY = (cursor.y - room.gridY);
    let startTileX = screenX * globals.baseColumns;
    let startTileY = screenY * globals.baseRows;
    let columns = globals.baseColumns;
    let rows = globals.baseRows;

    // Background tiles
    for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows; row++) {
            set(room.tiles["bg"], room.columns, startTileX + col, startTileY + row, 
                get(roomClipboard.tiles["bg"], columns, col, row));
        }
    }

    // Foreground tiles
    for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows; row++) {
            set(room.tiles["fg"], room.columns, startTileX + col, startTileY + row, 
                get(roomClipboard.tiles["fg"], columns, col, row));
        }
    }

    // Solids
    for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows; row++) {
            set(room.solids, room.columns, startTileX + col, startTileY + row, 
                get(roomClipboard.solids, columns, col, row));            
        }
    }

    // TODO: Actors
}

function get(array, columns, column, row) {
    return array[column + columns * row];
}

function set(array, columns, column, row, value) {
    array[column + columns * row] = value;
}

module.exports = {
    copyRoom: copyRoom,
    pasteRoom: pasteRoom
}