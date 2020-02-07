const globals = require('./globals.js');
const data = require('./data.js');
const history = require('./history.js');
const roomGrid = require('./screenGrid.js');
const mousetrap = require('mousetrap');

const database = require('./actors.json');

function init() {

    $('#actors-database-panel').append('<b>Actors palette</b><br/>');
    for (type in database) {
        $('#actors-database-panel').append(buildDatabaseEntryCard(type, database[type]));
    };

    $('.actor-db-card').on('click', handleActorDatabaseEntryCardClick);
    $('.actor-room-card').on('click', handleActorRoomEntryCardClick);

    mousetrap.bind('del', function(e, combo) {
        deleteCurrentActor();
    });

    mousetrap.bind('p', function(e, combo) {
        editCurrentActorProperties();
    });
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

function clearActorDatabaseEntrySelection() {
    selectedDbEntry = null;
    $('.actor-db-card').removeClass('card-selected');
}

function handleActorRoomEntryCardClick(event) {
    let $comp = $(event.target);
    while ($comp && !$comp.is('div.actor-room-card')) {
        $comp = $comp.parent();
    }

    if (!$comp)
        return;

    let room = roomGrid.getCurrentRoom();

    let actorId = $comp.attr("id");
    let actor = findActorById(actorId, room);
    selectedActor = actor;
    rebuildActorsList(room);
    triggerRoomRender();

    clearActorDatabaseEntrySelection();
}

function handleActorRoomEntryCardPropertiesClick(event) {
    // Set selected actor
    handleActorRoomEntryCardClick(event);
    // And edit it!
    editCurrentActorProperties();
}

function handleActorRoomEntryCardDeleteClick(event) {
    // Set selected actor
    handleActorRoomEntryCardClick(event);
    // And delete it!
    deleteCurrentActor();
}

function handleMapClick(event, mapTileX, mapTileY, room, zoom) {
    
    let overActor = getActorAt(mapTileX, mapTileY, room);
    if (overActor == null) {
        if (selectedDbEntry && canCreateEntry(selectedDbEntry, mapTileX, mapTileY)) {
            history.executeCommand("Put actor", function() {
                room.actors.push(createActor(mapTileX, mapTileY, selectedDbEntry));
            });
        }
    } else {
        // Select actor!
        selectedActor = overActor;
        clearActorDatabaseEntrySelection();
    }

    rebuildActorsList(room);
    triggerRoomRender();
}

function rebuildActorsList(room) {
    var panel = $('#room-actors-panel');
    panel.empty();
    panel.append('<b>Room actors</b>');
    
    if (room && room.actors) {
        for (actor of room.actors) {
            panel.append(buildRoomActorCard(actor));
        }

        if (selectedActor != null && room.actors.includes(selectedActor))
            document.getElementById(selectedActor.id).scrollIntoView();
    }

    $('.actor-room-card').on('click', handleActorRoomEntryCardClick);
    $('.btn-actor-properties').on('click', handleActorRoomEntryCardPropertiesClick);
    $('.btn-actor-delete').on('click', handleActorRoomEntryCardDeleteClick);
}

function buildRoomActorCard(actor) {
    return "<div id='" + actor.id + "' class='actor-room-card " + (actor == selectedActor ? "card-selected": "") + "'>" +
            "<label><b>type</b></label>&nbsp<span>" + actor.type +  "</span><br/>" + 
            "<label><b>id</b></label>&nbsp<span>" + actor.id +  "</span><br/>" + 
            "<label><b>pos</b></label>&nbsp<span>" + actor.x + ", " + actor.y + "</span>" +
            "<div>" + 
                "<button type='button' class='btn btn-primary btn-actor-properties' id='btn-properties-" + actor.id + "'>properties</button>" + 
                "<button type='button' class='btn btn-actor-delete' id='btn-delete-" + actor.id + "'>delete</button>" + 
            "</div>" + 
        "</div>";
}

function getActorAt(mapX, mapY, room) {
    for (actor of room.actors) {
        if (actor.x == mapX && actor.y == mapY)
            return actor;
    }

    return null;
}

function findActorById(id, room) {
    for (actor of room.actors) {
        if (actor.id == id)
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
        h: data.h
    };

    if (data.properties) {
        actor.properties = {};
        for (prop in data.properties) {
            // Set the first element of arrays as the value of properties
            if (Array.isArray(data.properties[prop]))
                actor.properties[prop] = data.properties[prop][0];
            else
                actor.properties[prop] = data.properties[prop];
        }
    }

    return actor;
}

function deleteCurrentActor() {
    if (selectedActor != null) {
        history.executeCommand('Delete actor', function() {
            let room = roomGrid.getCurrentRoom();
            room.actors.splice(room.actors.indexOf(selectedActor), 1);
            selectedActor = null;
            rebuildActorsList(room);
            triggerRoomRender();
        });
    }
}

var currentModal = null;

function editCurrentActorProperties() {
    if (selectedActor && !currentModal) {
        
        let title = selectedActor.type + " - " + selectedActor.id;
        
        // Build the form body considering actor properties
        let body = $("<div/>");
        // Standard properties
        let editableProperties = [];

        for (let sprop in actor) {
            if (sprop == "properties")
                continue;

            if (sprop == "id" || sprop == "type")
                body.append(buildPropertyField(sprop, selectedActor[sprop], true));
            else {
                body.append(buildPropertyField(sprop, selectedActor[sprop]));
                editableProperties.push(sprop);
            }
        }

        body.append('<hr/>');

        // Custom properties
        for (let property in selectedActor.properties) {
            if (Array.isArray(database[selectedActor.type].properties[property])) {
                body.append(buildPropertyCombobox(property, selectedActor.properties[property], database[selectedActor.type].properties[property]))
            } else {
                body.append(buildPropertyField(property, selectedActor.properties[property]));
            }

            editableProperties.push("properties." + property);
        }

        function savePropertiesEdition() {
            let elem = null;
            let customProperty = false;
            for (prop of editableProperties) {
                customProperty = false;
                if (prop.indexOf("properties.") > -1) {
                    customProperty = true;
                    prop = prop.substring("properties.".length);
                }

                elem = body.find("#field-" + prop);
                if (customProperty)
                    selectedActor.properties[prop] = elem.val();
                else
                    selectedActor[prop] = elem.val();
            }

            rebuildActorsList(roomGrid.getCurrentRoom())
            triggerRoomRender();
        }
        
        currentModal = buildModal(title, body, savePropertiesEdition);
    }
}

function buildPropertyField(property, value, readonly) {
    let fieldId = 'field-' + property;
    let element = '<label for="' + fieldId + '">' + property +': </label>';
    if (!readonly) {
        element += '<input id="' + fieldId + '" type="text" value="' + value + '" >';
    } else {
        element += '<span>' + value + '</span>';
    }

    element += '<br/>';

    return element;
}

function buildPropertyCombobox(property, value, options) {
    let fieldId = 'field-' + property;
    let element = '<label for="' + fieldId + '">' + property +': </label>';

    element += '<select id="' + fieldId + '">';
    for (option of options) {
        element += '<option value="' + option + '" ' + 
            (value == option ? 'selected' : '') + '>' + option + '</option>';
    }
    element += "</select>";

    element += '<br/>';

    return element;
}

function buildModal(title, body, saveCallback, cancelCallback) {
    if (!body)
        return;
    
    var modalDiv = 
        '<div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">' + 
            '<div class="modal-dialog modal-dialog-centered" role="document">' + 
                '<div class="modal-content">' + 
                    '<div class="modal-header">' + 
                        '<h5 class="modal-title" id="exampleModalLongTitle">Modal title</h5>' + 
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' + 
                        '    <span aria-hidden="true">&times;</span>' + 
                        '</button>' + 
                    '</div>' + 
                    '<div class="modal-body">' + 
                    // Content will be here
                    '</div>' + 
                    '<div class="modal-footer">' + 
                        '<button type="button" class="btn btn-secondary" id="btn-modal-close">Close</button>' + 
                        '<button type="button" class="btn btn-primary" id="btn-modal-save">Save changes</button>' + 
                    '</div>' + 
                '</div>' + 
            '</div>' + 
        '</div>';
    
    // Prepare the DOM element
    let $modal = $(modalDiv);
    // Title
    $modal.find('.modal-title').text(title);
    // Include the body
    $modal.find('.modal-body').append(body);

    // Show the dialogue
    $modal.modal();

    if (saveCallback) {
        // Save callback
        $modal.find('#btn-modal-save').on('click', function (event) {
            if (saveCallback)
                saveCallback();

            $modal.modal('hide');
        });
    } else {
        // Avoid showing the save button if there's no save forseen
        $modal.find('#btn-modal-save').hide();
    }

    // Cancel callback (this would be called also on success :()
    $modal.find('#btn-modal-close').on('click', function (event) {
        if (cancelCallback)
            cancelCallback();

        $modal.modal('hide');
    });

    // Destroy on close
    $modal.on('hidden.bs.modal', function (event) {
        $modal.modal('dispose');
        $modal.parent()[0].removeChild($modal[0]);
        currentModal = null;
    });

    return $modal;
}

function render(context, room, zoom) {

    if (!room || !room.actors)
        return;

    for (actor of room.actors) {
        context.beginPath();
        context.lineWidth = 4;
        context.strokeStyle = 'blue';
        context.fillStyle = '#2a70ff';
        // context.globalAlpha = 0.5;
        context.rect(actor.x * globals.tileWidth * zoom, actor.y * globals.tileHeight * zoom, actor.w*globals.tileWidth*zoom, actor.h*globals.tileHeight*zoom);
        // context.globalAlpha = 1;
        context.stroke();
    }

    if (selectedActor != null && room.actors.includes(selectedActor)) {
        context.beginPath();
        context.lineWidth = 4;
        context.strokeStyle = 'red';
        context.setLineDash([2]);
        context.rect(selectedActor.x * globals.tileWidth * zoom - 1, selectedActor.y * globals.tileHeight * zoom - 1, selectedActor.w * globals.tileWidth * zoom + 2, selectedActor.h * globals.tileHeight * zoom + 2);
        context.stroke();
        context.setLineDash([]);
    }
}

function triggerRoomRender() {
    let event = new CustomEvent("render-room", {"this": "can be used for something?"});
    document.dispatchEvent(event);
}

/**
 * Checks if the given actor type can be created
 * @param {String} type Type to instantiate
 * @param {int} x Map tile X
 * @param {int} y Map tile Y
 * @returns {boolean} True if the instance of the actor can be created
 */
function canCreateEntry(type, x, y) {
    if (type == "spawn") {
        // Only 1 spawn allowed
        for (room of data.getMap().rooms) {
            for (actor of room.actors) {
                if (actor.type == "spawn")
                    return false;
            }
        }
    }

    return true;
}

module.exports = {
    init: init,
    render: render,
    rebuildActorsList: rebuildActorsList,
    onClick: handleMapClick
}