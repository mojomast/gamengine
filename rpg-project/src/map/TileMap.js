/**
 * TileMap - Tile-based map system for RPG games
 * Supports multi-layer rendering with optimized batch rendering
 */

import { GameObject } from '../../game-engine/src/core/GameObject.js';
import { BatchRenderer } from '../../game-engine/src/core/BatchRenderer.js';

class TileMap extends GameObject {
    constructor(x = 0, y = 0, tileWidth = 32, tileHeight = 32) {
        super(x, y);

        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        // Map dimensions in tiles
        this.width = 0;
        this.height = 0;

        // Layer data: background, collision, foreground
        this.layers = {
            background: [],
            collision: [],
            foreground: []
        };

        // Tileset data
        this.tilesets = new Map();
        this.tileData = new Map(); // tileId -> {texture, sx, sy, sw, sh}

        // Rendering
        this.batchRenderer = null;
        this.camera = { x: 0, y: 0, width: 800, height: 600 };

        // Collision
        this.collisionEnabled = true;
        this.collisionLayer = 'collision';

        // Resource manager reference
        this.resourceManager = null;

        // Map properties
        this.properties = {
            name: 'Untitled Map',
            music: null,
            encounters: []
        };
    }

    /**
     * Initialize the tilemap with data
     */
    async loadMap(mapData, resourceManager) {
        this.resourceManager = resourceManager;

        // Load map dimensions
        this.width = mapData.width || 20;
        this.height = mapData.height || 15;

        // Load tilesets
        if (mapData.tilesets) {
            await this.loadTilesets(mapData.tilesets);
        }

        // Load layers
        if (mapData.layers) {
            this.loadLayers(mapData.layers);
        }

        // Load properties
        if (mapData.properties) {
            this.properties = { ...this.properties, ...mapData.properties };
        }

        // Initialize batch renderer if canvas context available
        if (this.scene && this.scene.game && this.scene.game.ctx) {
            this.batchRenderer = new BatchRenderer(this.scene.game.ctx);
        }

        console.log(`Loaded map: ${this.properties.name} (${this.width}x${this.height})`);
    }

    /**
     * Load tilesets from map data
     */
    async loadTilesets(tilesets) {
        for (const tileset of tilesets) {
            const texture = await this.resourceManager.loadTexture(
                `tileset_${tileset.name}`,
                tileset.image
            );

            this.tilesets.set(tileset.name, {
                texture,
                firstGid: tileset.firstgid,
                tileWidth: tileset.tilewidth,
                tileHeight: tileset.tileheight,
                columns: tileset.columns,
                tileCount: tileset.tilecount,
                imageWidth: tileset.imagewidth,
                imageHeight: tileset.imageheight
            });

            // Pre-calculate tile source positions
            this.calculateTileData(tileset);
        }
    }

    /**
     * Pre-calculate source positions for each tile
     */
    calculateTileData(tileset) {
        const { columns, tileWidth, tileHeight, firstGid } = this.tilesets.get(tileset.name);

        for (let tileId = 0; tileId < tileset.tilecount; tileId++) {
            const globalTileId = firstGid + tileId;
            const localTileX = tileId % columns;
            const localTileY = Math.floor(tileId / columns);

            this.tileData.set(globalTileId, {
                texture: this.tilesets.get(tileset.name).texture,
                sx: localTileX * tileWidth,
                sy: localTileY * tileHeight,
                sw: tileWidth,
                sh: tileHeight
            });
        }
    }

    /**
     * Load layer data
     */
    loadLayers(layers) {
        for (const layer of layers) {
            const layerName = layer.name.toLowerCase();

            if (this.layers.hasOwnProperty(layerName)) {
                // Initialize layer data (2D array)
                const layerData = [];
                for (let y = 0; y < this.height; y++) {
                    layerData[y] = [];
                    for (let x = 0; x < this.width; x++) {
                        const index = y * this.width + x;
                        layerData[y][x] = layer.data ? layer.data[index] : 0;
                    }
                }
                this.layers[layerName] = layerData;
            }
        }
    }

    /**
     * Set camera bounds for rendering
     */
    setCamera(x, y, width, height) {
        this.camera.x = x;
        this.camera.y = y;
        this.camera.width = width;
        this.camera.height = height;
    }

    /**
     * Update method
     */
    update(deltaTime) {
        super.update(deltaTime);

        // Update camera to follow player if needed
        // This would be handled by the scene/camera system
    }

    /**
     * Render the tilemap
     */
    render(ctx) {
        if (!this.visible) return;

        ctx.save();

        // Apply camera transform
        ctx.translate(-this.camera.x, -this.camera.y);

        // Initialize batch renderer if needed
        if (!this.batchRenderer) {
            this.batchRenderer = new BatchRenderer(ctx);
        }

        // Render layers in order: background, collision (invisible), foreground
        this.batchRenderer.beginBatch('map');

        // Calculate visible tile bounds
        const startTileX = Math.max(0, Math.floor(this.camera.x / this.tileWidth));
        const startTileY = Math.max(0, Math.floor(this.camera.y / this.tileHeight));
        const endTileX = Math.min(this.width, startTileX + Math.ceil(this.camera.width / this.tileWidth) + 1);
        const endTileY = Math.min(this.height, startTileY + Math.ceil(this.camera.height / this.tileHeight) + 1);

        // Render background layer
        this.renderLayer(this.layers.background, startTileX, startTileY, endTileX, endTileY);

        // Render foreground layer (collision layer is invisible)
        this.renderLayer(this.layers.foreground, startTileX, startTileY, endTileX, endTileY);

        this.batchRenderer.endBatch();

        ctx.restore();
    }

    /**
     * Render a single layer
     */
    renderLayer(layerData, startX, startY, endX, endY) {
        for (let tileY = startY; tileY < endTileY; tileY++) {
            for (let tileX = startX; tileX < endTileX; tileX++) {
                const tileId = layerData[tileY][tileX];

                if (tileId > 0) {
                    const tileInfo = this.tileData.get(tileId);
                    if (tileInfo) {
                        const worldX = tileX * this.tileWidth;
                        const worldY = tileY * this.tileHeight;

                        this.batchRenderer.drawSprite(
                            tileInfo.texture,
                            worldX, worldY,
                            {
                                width: this.tileWidth,
                                height: this.tileHeight,
                                sx: tileInfo.sx,
                                sy: tileInfo.sy,
                                sw: tileInfo.sw,
                                sh: tileInfo.sh
                            }
                        );
                    }
                }
            }
        }
    }

    /**
     * Get collision tile at world position
     */
    getCollisionTile(worldX, worldY) {
        const tileX = Math.floor(worldX / this.tileWidth);
        const tileY = Math.floor(worldY / this.tileHeight);

        if (tileX >= 0 && tileX < this.width && tileY >= 0 && tileY < this.height) {
            return this.layers.collision[tileY][tileX];
        }

        return 0; // No collision
    }

    /**
     * Check collision at world position
     */
    isCollision(worldX, worldY) {
        return this.getCollisionTile(worldX, worldY) > 0;
    }

    /**
     * Get tile bounds for collision detection
     */
    getTileBounds(tileX, tileY) {
        return {
            x: tileX * this.tileWidth,
            y: tileY * this.tileHeight,
            width: this.tileWidth,
            height: this.tileHeight
        };
    }

    /**
     * Convert world position to tile coordinates
     */
    worldToTile(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.tileWidth),
            y: Math.floor(worldY / this.tileHeight)
        };
    }

    /**
     * Convert tile coordinates to world position
     */
    tileToWorld(tileX, tileY) {
        return {
            x: tileX * this.tileWidth,
            y: tileY * this.tileHeight
        };
    }

    /**
     * Set tile in specific layer
     */
    setTile(layerName, tileX, tileY, tileId) {
        if (this.layers[layerName] &&
            tileX >= 0 && tileX < this.width &&
            tileY >= 0 && tileY < this.height) {
            this.layers[layerName][tileY][tileX] = tileId;
        }
    }

    /**
     * Get tile from specific layer
     */
    getTile(layerName, tileX, tileY) {
        if (this.layers[layerName] &&
            tileX >= 0 && tileX < this.width &&
            tileY >= 0 && tileY < this.height) {
            return this.layers[layerName][tileY][tileX];
        }
        return 0;
    }

    /**
     * Get map bounds
     */
    getBounds() {
        return {
            x: 0,
            y: 0,
            width: this.width * this.tileWidth,
            height: this.height * this.tileHeight
        };
    }

    /**
     * Export map data
     */
    exportMap() {
        const layers = [];

        for (const [layerName, layerData] of Object.entries(this.layers)) {
            const data = [];
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    data.push(layerData[y][x]);
                }
            }

            layers.push({
                name: layerName,
                data: data,
                width: this.width,
                height: this.height,
                visible: layerName !== 'collision',
                opacity: 1
            });
        }

        return {
            width: this.width,
            height: this.height,
            tilewidth: this.tileWidth,
            tileheight: this.tileHeight,
            layers: layers,
            tilesets: Array.from(this.tilesets.values()).map(tileset => ({
                name: tileset.name,
                firstgid: tileset.firstGid,
                tilewidth: tileset.tileWidth,
                tileheight: tileset.tileHeight,
                columns: tileset.columns,
                tilecount: tileset.tileCount,
                image: tileset.texture.src,
                imagewidth: tileset.imageWidth,
                imageheight: tileset.imageHeight
            })),
            properties: this.properties
        };
    }
}

export { TileMap };