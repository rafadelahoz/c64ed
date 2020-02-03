
const data = require('./data.js');

let mapDataHistory = [];
let redoBranch = [];

function createHistoryStep(operation, stepMapData) {
    let step = {label: operation, mapData: stepMapData};
    mapDataHistory.push(step);
}

/**
 * Resets the map data history to an empty state
 */
function reset() {
    mapDataHistory = [];
    redoBranch = [];
}

/**
 * Executes the provided executor function, storing the map data afterwards
 * and tagging the step with the given name
 * @param {string} name Command name
 * @param {function} executor Executor function
 */
function executeCommand(name, executor) {
    if (!executor)
        return;

    if (!name || name.length <= 0)
        name = executor.name;
    
    // If there's no base status, create it?
    if (mapDataHistory.length <= 0)
        createHistoryStep("Initial", data.getMapStamp());

    // Execute function
    executor();

    // Store status
    createHistoryStep(name, data.getMapStamp());

    // Invalidate redo branch
    redoBranch = [];

    console.log(mapDataHistory);
}

function undo() {
    if (mapDataHistory.length > 1) {
        let undid = mapDataHistory.pop();
        
        console.log("Undo " + undid.label);
        redoBranch.push(undid);

        // Load the step
        data.load(clone(mapDataHistory[mapDataHistory.length-1].mapData));
        return true;
    }

    return false;
}

function redo() {
    if (redoBranch.length > 0) {
        let redid = redoBranch.pop();
        console.log("Redo " + redid.label);

        mapDataHistory.push(redid);
        data.load(clone(redid.mapData));
        return true;
    }

    return false;
}

function clone(thing) {
    return JSON.parse(JSON.stringify(thing));
}

module.exports = {
    reset: reset,
    executeCommand: executeCommand,
    undo: undo,
    redo: redo
}