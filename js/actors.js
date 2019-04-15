
const globals = require('./globals.js');

var database = {
};

function init() {
    // Populates the database (reading from file?)
    database["spawn"] = {
        label: "Player spawn",
        w: 1,
        h: 1
    };

    database["exit"] = {
        label: "Map exit",
        w: 1,
        h: 1,
        properties: {
            name: "exit"
        }
    }

    $('#actors-database-panel').append('<b>Actors palette</b>');
    for (type in database) {
        $('#actors-database-panel').append(buildDatabaseEntryCard(type, database[type]));
    };

    $('.actor-db-card').on('click', handleActorDatabaseEntryCardClick);
}

function buildDatabaseEntryCard(type, entry) {
    return "<div class='actor-db-card' id='card-" + type + "'>" + 
                "<span>" + entry.label +  "</span><br/><span>" + entry.w + ", " + entry.h + "</span>" + 
            "</div>";
}

var selectedActor = null;
var selectedDbEntry = "spawn";

function handleActorDatabaseEntryCardClick(e) {
    let comp = e.target;
    let $comp = $(comp);
    while ($comp && !$comp.is('div.actor-db-card')) {
        $comp = $comp.parent();
    }

    if (!$comp)
        return;

    let actorId = $comp.attr('id').substring("card-".length);
    if (database[actorId]) {
        selectedDbEntry = actorId;
        $('.actor-db-card').removeClass('card-selected');
        $comp.addClass('card-selected');
    }
}

function handleMapClick(event, mapTileX, mapTileY, room, zoom) {
    
    let overActor = getActorAt(mapTileX, mapTileY, room);
    if (overActor == null) {
        if (selectedDbEntry)
            room.actors.push(createActor(mapTileX, mapTileY, selectedDbEntry));
    } else {
        // Select actor!
        selectedActor = overActor;
    }

    rebuildActorsList(room);
}

function rebuildActorsList(room) {
    var panel = $('#room-actors-panel');
    panel.empty();
    panel.append('<b>Room actors</b>');
    
    for (actor of room.actors) {
        panel.append(buildRoomActorCard(actor));
    }
}

function buildRoomActorCard(actor) {
    return "<div id='" + actor.id + "' class='actor-room-card " + (actor == selectedActor ? "card-selected": "") + "'>" +
            "<label>type</label>&nbsp<span>" + actor.type +  "</span><br/>" + 
            "<label>id</label>&nbsp<span>" + actor.id +  "</span><br/>" + 
            "<label>pos</label>&nbsp<span>" + actor.x + ", " + actor.y + "</span>" +
        "</div>";
}

function getActorAt(mapX, mapY, room) {
    for (actor of room.actors) {
        if (actor.x == mapX && actor.y == mapY)
            return actor;
    }

    return null;
}

function createActor(mapX, mapY, type) {
    type = type;
    let data = database[type];
    var actor = {
        id: room.id + "." +  Date.now(),
        x: mapX,
        y: mapY,
        type: type,
        w: data.w,
        h: data.h,
        // other props?
        properites: data.properties
    };

    return actor;
}

function render(context, room, zoom) {

    if (!room || !room.actors)
        return;

    for (actor of room.actors) {
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = 'blue';
        context.fillStyle = '#2a70ff'
        context.rect(actor.x * globals.tileWidth * zoom, actor.y * globals.tileHeight * zoom, globals.tileWidth*zoom, globals.tileHeight*zoom);
        context.stroke();
    }

    if (selectedActor != null) {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = 'yellow';
        context.rect(selectedActor.x * globals.tileWidth * zoom - 1, selectedActor.y * globals.tileHeight * zoom - 1, globals.tileWidth*zoom + 2, globals.tileHeight*zoom + 2);
        context.stroke();
    }
}

module.exports = {
    init: init,
    render: render,
    onClick: handleMapClick
}