# TODO list

## Backlog 

- Panels
    - Design layout
    - Improve layout
- WHAT IS A MAP/LEVEL/SCENE
    - A map is:
        - Set of rooms, composed of screens
        - Organized in a grid of rooms
        - All rooms in a map are connected (but they may not be accessible)
        - Rooms can span multiple screens or just 1 (multiple configs possible: 2x1, 2x2, 4x1...)
        - A single json stores a map, with its rooms and screens
    - Maps are accessible through the world map (ingame)
    - Map browser (reads directory and loads all maps) (in-editor)

- Copy room, paste room (or copy screen, paste screen?)
    - Copy screen, paste screen
    - What about entities?

- Map management:
 - Specify a folder to act as the editor base
 - Maps are located in that location and user can select one to edit at a time from a list
 - Saving and loading is done automatically in the folder
 - Backup folder before starting

- Entities placement
    - List of available entities
        - Start with player spawn, exit
    - Select from list, place on map
    - When on map, click to select current
    - Drag to move it (!)
    - Double click or whatever for properties
        - A panel appears with the properties
            - Id (set up automatically)
            - Color: set by default?
            - Extra properties given type?
        - Non-overwritten properties are read from entities db
        
- Entities database
    - List of all available entities
    - Can add, or change defaults for all?

- Don't allow extending over other rooms (fails for bigger ones)
- After removing a room or resizing it, the grid may have extra empty space, tidy that up after removing a room

- Map properties
- Actors, entites, objects
    - DB
    - Placement
        - Properties?
    - Graphics?
    - Types:
        - Player spawn
        - Exit
        - Teleports
            - Doors and such, move through the level
            - Require input for activating (up, down?)
            - Target coordinates (in map)
        - Enemies
        - NPCS/Events?
        - Items
- Moving the mouse in the map editor configures the current screen in the room?
- Moving the screen cursor configures the scroll on big rooms?
- Select multiple tiles
    - Drag on tileset to select a bigger box
    - Drag RMB on map to select the underlying tiles
    - Click on map places the selected tiles
        - While dragging, until the mouse does not leave the current placed area, no more is going to be placed

- Undo?

## Doing


## Done

- Second layer of tiles with color
- Tileset tint (or map tint)
- Scrolling makes editor fail
- Draw grid over map properly
- Zoom levels for map
- Moving mouse outside the edition area should stop painting
- Solids
    - Put like tiles
- Generalize a bit the multilayer code
- Bigger maps
- Saving, loading (first draft)
- Edit multiple scenes
    - [DONE] Grid of rooms
    - [DONE] Cursor in the grid, pointing to the current screen and owner room
    - [DONE] Change the current screen by:
        - Adding screen space left, right, top, or bottom of current screen
        - Moving the screen cursor left, right, top, or bottom of current screen
        - So moving the screen would take you the appropriate screen considering the current one
    - [DONE] Automatic management of the grid includes:
        - Increasing grid size when new rooms are added
            - Moving the whole grid when rooms are added left or top
        - Decreasing grid size when rooms are deleted/redimensioned
- Move room grid cursor independently of grid size
    - [DONE] Display empty rooms as empty
    - [DONE] Press button to create a new room on empty spaces
        - [DONE] Fails when adding floaty rooms to the left (they get stuck to the leftmost room instead of floaty)
- Save maps
    - [DONE] Save to file
- Load maps
    - [DONE] Read from file

## Not to be done

- Edit multiple screens
    - Setup connections
        + Can use string based node rendering:
                    #
                    |
                ###-##-#
                  |
                 ###-##
    - Functional (other):
        - List of screens + placement
        - Floating rooms, each room (room is a square of a screen) clickable
        - Click on one room side?, click on another -> linked
            - If sizes require it, setup more connections
    - Functional:
        - Layer/Tool to set connections
        - When activated, buttons appear on borders of screen
        - Links are two-way
        - Coherence must be preserved
        - Clicking on them moves to the connected screen in that way
            - If no screen is present, a 1x1 one is created and linked
        - Increasing a screen size checks connections for coherence
- Ladders as solids? (remember to add a oneway on top on instantiation)