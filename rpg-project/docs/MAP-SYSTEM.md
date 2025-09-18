# Tile-Based Map System Documentation

## Overview

The RPG tile-based map system provides a complete solution for creating, rendering, and managing 2D tilemaps for RPG games. Built on the game-engine architecture, it supports multi-layer rendering, collision detection, and seamless map transitions.

## Architecture

### Core Components

- **TileMap**: Main map class extending GameObject
- **MapEditor**: Basic editor interface for map creation
- **BatchRenderer**: Optimized rendering for tile sprites
- **ResourceManager**: Asset loading and caching

### Layer System

The map system uses a three-layer architecture:

1. **Background Layer**: Terrain, floors, base tiles
2. **Collision Layer**: Invisible collision data (0 = walkable, >0 = blocked)
3. **Foreground Layer**: Decorations, walls, overlays that appear above entities

## TileMap Class

### Constructor
```javascript
const tileMap = new TileMap(x, y, tileWidth, tileHeight);
```

### Loading Maps
```javascript
await tileMap.loadMap(mapData, resourceManager);
```

Map data format:
```javascript
{
    width: 20,           // Map width in tiles
    height: 15,          // Map height in tiles
    tilewidth: 32,       // Tile width in pixels
    tileheight: 32,      // Tile height in pixels
    properties: {        // Custom properties
        name: "Town",
        music: "town_theme.mp3"
    },
    tilesets: [{         // Tileset definitions
        name: "town_tiles",
        firstgid: 1,
        tilewidth: 32,
        tileheight: 32,
        columns: 16,
        tilecount: 256,
        image: "assets/maps/town_tiles.png",
        imagewidth: 512,
        imageheight: 512
    }],
    layers: [{           // Layer data
        name: "background",
        data: [1, 1, 2, 2, ...]  // Tile IDs
    }]
}
```

### Collision Detection

```javascript
// Check collision at world position
if (tileMap.isCollision(worldX, worldY)) {
    // Handle collision
}

// Get collision tile value
const collisionValue = tileMap.getCollisionTile(worldX, worldY);
```

### Tile Manipulation

```javascript
// Set tile in specific layer
tileMap.setTile('background', tileX, tileY, tileId);

// Get tile from specific layer
const tileId = tileMap.getTile('collision', tileX, tileY);

// Convert between coordinate systems
const tilePos = tileMap.worldToTile(worldX, worldY);
const worldPos = tileMap.tileToWorld(tileX, tileY);
```

## Map Editor

### Basic Usage

The MapEditor provides a simple interface for creating and editing maps:

1. **Layer Selection**: Click layer buttons (1-3 keys) to switch layers
2. **Tile Painting**: Click and drag on the canvas to paint tiles
3. **Brush Size**: Use +/- buttons or [ ] keys to change brush size
4. **Sample Maps**: Load predefined sample maps for testing
5. **Export**: Save maps as JSON files

### Keyboard Shortcuts

- **1, 2, 3**: Switch to background/collision/foreground layers
- **[ ]**: Decrease/increase brush size
- **Ctrl+S**: Export map

### Loading Sample Maps

```javascript
import { MapEditor } from './src/map/MapEditor.js';

// Create editor
const editor = new MapEditor(engine, canvas);

// Load sample map
await editor.loadSampleMap('town'); // 'town', 'dungeon', or 'world'
```

## Rendering Optimization

### Batch Rendering

The system uses BatchRenderer to minimize draw calls:

```javascript
// Tiles are automatically batched by texture and properties
batchRenderer.beginBatch('map');
// ... render operations ...
batchRenderer.endBatch();
```

### Camera System

```javascript
// Set camera bounds for rendering
tileMap.setCamera(x, y, width, height);
```

Only visible tiles within the camera bounds are rendered for optimal performance.

## Sample Maps

Three sample maps are provided:

- **Town**: Starting village with buildings and walkable areas
- **Dungeon**: Underground area with walls and corridors
- **World**: Overworld map with terrain features

Each sample includes proper collision layers and can be used as templates for custom maps.

## Integration with RPG Engine

### Scene Integration

```javascript
class WorldScene extends Scene {
    async init() {
        // Create tilemap
        this.tileMap = new TileMap(0, 0, 32, 32);
        await this.tileMap.loadMap(mapData, this.engine.resourceManager);

        // Add to scene
        this.addGameObject(this.tileMap);
    }

    update(deltaTime) {
        // Update player movement with collision
        if (this.player) {
            const newX = this.player.position.x + this.player.velocity.x;
            const newY = this.player.position.y + this.player.velocity.y;

            if (!this.tileMap.isCollision(newX, newY)) {
                this.player.position.x = newX;
                this.player.position.y = newY;
            }
        }
    }
}
```

### Map Transitions

```javascript
// Seamless map transitions
this.sceneManager.switchScene('newMap', {
    playerX: transitionX,
    playerY: transitionY,
    fromMap: currentMap
});
```

## Performance Considerations

- Maps are rendered using batched sprite operations
- Only visible tiles are processed
- Collision detection uses efficient 2D array lookups
- ResourceManager caches loaded tilesets

## Future Enhancements

- Advanced editor features (tile palette, undo/redo)
- Event system integration
- NPC placement tools
- Map validation and optimization tools

## API Reference

### TileMap Methods

- `loadMap(mapData, resourceManager)`: Load map from data
- `setTile(layer, x, y, tileId)`: Set tile at coordinates
- `getTile(layer, x, y)`: Get tile at coordinates
- `isCollision(worldX, worldY)`: Check collision at world position
- `worldToTile(worldX, worldY)`: Convert world to tile coordinates
- `tileToWorld(tileX, tileY)`: Convert tile to world coordinates
- `exportMap()`: Export map data as JSON

### MapEditor Methods

- `selectLayer(layerName)`: Switch active layer
- `changeBrushSize(delta)`: Adjust brush size
- `loadSampleMap(name)`: Load sample map
- `exportMap()`: Download map as JSON file

This system provides a solid foundation for RPG map management with room for expansion as the game development progresses.