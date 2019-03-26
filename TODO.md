# TODO list

## Backlog 

- Panels
    - Design layout
    - Improve layout
- WHAT IS A MAP/LEVEL/SCENE
    - Set of screens (connected, unconnected)
    - Map browser (reads directory and loads all maps)
    - Maps are saved all together, as a set of screens with ids connected by the layout
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
- Select multiple tiles
    - On tileset
    - On map
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