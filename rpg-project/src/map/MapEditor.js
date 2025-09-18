/**
 * Basic Map Editor for RPG tilemaps
 * Uses UIManager for tile placement and layer management
 */

import { UIManager, Button, Panel, Label } from '../../game-engine/src/ui/UIManager.js';
import { TileMap } from './TileMap.js';
import { SAMPLE_MAPS } from './sample-maps.js';

class MapEditor {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.uiManager = this.engine.uiManager || new UIManager(this.engine);

        // Editor state
        this.tileMap = null;
        this.currentLayer = 'background';
        this.selectedTileId = 1;
        this.brushSize = 1;
        this.isPainting = false;

        // UI elements
        this.panel = null;
        this.layerButtons = new Map();
        this.tilePalette = null;

        // Editor properties
        this.tileSize = 32;
        this.paletteCols = 8;
        this.paletteRows = 8;

        this.initializeEditor();
    }

    initializeEditor() {
        this.createEditorUI();
        this.setupEventHandlers();
    }

    createEditorUI() {
        // Main editor panel
        this.panel = new Panel(10, 10, 400, this.canvas.height - 20);
        this.panel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.panel.style.borderColor = '#ffd700';

        // Title
        const title = new Label(10, 10, 'Map Editor', 'bold 18px monospace');
        title.style.textColor = '#ffd700';
        this.panel.addChild(title);

        // Layer selection buttons
        const layers = ['background', 'collision', 'foreground'];
        let y = 50;

        layers.forEach(layer => {
            const layerBtn = new Button(10, y, 120, 30, layer.charAt(0).toUpperCase() + layer.slice(1));
            layerBtn.on('click', () => this.selectLayer(layer));
            this.layerButtons.set(layer, layerBtn);
            this.panel.addChild(layerBtn);
            y += 40;
        });

        // Brush controls
        const brushLabel = new Label(10, y + 10, 'Brush Size:', '14px monospace');
        this.panel.addChild(brushLabel);

        const brushMinus = new Button(10, y + 30, 30, 30, '-');
        brushMinus.on('click', () => this.changeBrushSize(-1));
        this.panel.addChild(brushMinus);

        this.brushSizeLabel = new Label(50, y + 35, '1', '14px monospace');
        this.panel.addChild(this.brushSizeLabel);

        const brushPlus = new Button(80, y + 30, 30, 30, '+');
        brushPlus.on('click', () => this.changeBrushSize(1));
        this.panel.addChild(brushPlus);

        // Load sample map buttons
        y += 80;
        const sampleLabel = new Label(10, y, 'Load Sample:', '14px monospace');
        this.panel.addChild(sampleLabel);

        y += 20;
        const samples = ['town', 'dungeon', 'world'];
        samples.forEach((sample, index) => {
            const sampleBtn = new Button(10, y + index * 35, 100, 30, sample.charAt(0).toUpperCase() + sample.slice(1));
            sampleBtn.on('click', () => this.loadSampleMap(sample));
            this.panel.addChild(sampleBtn);
        });

        // Save/Export button
        const saveBtn = new Button(10, this.panel.size.height - 50, 100, 30, 'Export Map');
        saveBtn.on('click', () => this.exportMap());
        this.panel.addChild(saveBtn);

        // Add panel to UI manager
        this.uiManager.addComponent(this.panel);

        // Initialize with default layer selected
        this.selectLayer('background');
    }

    setupEventHandlers() {
        // Canvas mouse events for painting
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    selectLayer(layer) {
        this.currentLayer = layer;

        // Update button styles
        this.layerButtons.forEach((btn, layerName) => {
            if (layerName === layer) {
                btn.style.backgroundColor = '#ffd700';
                btn.style.textColor = '#000000';
            } else {
                btn.style.backgroundColor = '#d62828';
                btn.style.textColor = '#ffffff';
            }
        });

        console.log(`Selected layer: ${layer}`);
    }

    changeBrushSize(delta) {
        this.brushSize = Math.max(1, Math.min(5, this.brushSize + delta));
        this.brushSizeLabel.setText(this.brushSize.toString());
    }

    async loadSampleMap(mapName) {
        if (!SAMPLE_MAPS[mapName]) {
            console.error(`Sample map '${mapName}' not found`);
            return;
        }

        // Create new tilemap
        this.tileMap = new TileMap(0, 0, 32, 32);

        // Load the sample map data
        await this.tileMap.loadMap(SAMPLE_MAPS[mapName], this.engine.resourceManager);

        // Center camera on map
        const bounds = this.tileMap.getBounds();
        this.tileMap.setCamera(
            bounds.x,
            bounds.y,
            Math.min(bounds.width, this.canvas.width),
            Math.min(bounds.height, this.canvas.height)
        );

        console.log(`Loaded sample map: ${mapName}`);
    }

    handleMouseDown(e) {
        if (!this.tileMap) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.tileMap.camera.x;
        const mouseY = e.clientY - rect.top + this.tileMap.camera.y;

        // Check if clicking on UI first
        if (this.uiManager.handleInput(this.engine.inputManager || { getMousePosition: () => ({ x: e.clientX - rect.left, y: e.clientY - rect.top }) })) {
            return; // UI handled the input
        }

        this.isPainting = true;
        this.paintTile(mouseX, mouseY);
    }

    handleMouseMove(e) {
        if (!this.isPainting || !this.tileMap) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.tileMap.camera.x;
        const mouseY = e.clientY - rect.top + this.tileMap.camera.y;

        this.paintTile(mouseX, mouseY);
    }

    handleMouseUp() {
        this.isPainting = false;
    }

    paintTile(worldX, worldY) {
        const tilePos = this.tileMap.worldToTile(worldX, worldY);

        // Paint brush area
        for (let dy = 0; dy < this.brushSize; dy++) {
            for (let dx = 0; dx < this.brushSize; dx++) {
                const paintX = tilePos.x + dx - Math.floor(this.brushSize / 2);
                const paintY = tilePos.y + dy - Math.floor(this.brushSize / 2);

                if (this.currentLayer === 'collision') {
                    // For collision layer, toggle between 0 and 1
                    const currentTile = this.tileMap.getTile('collision', paintX, paintY);
                    this.tileMap.setTile('collision', paintX, paintY, currentTile > 0 ? 0 : 1);
                } else {
                    // For other layers, set to selected tile
                    this.tileMap.setTile(this.currentLayer, paintX, paintY, this.selectedTileId);
                }
            }
        }
    }

    handleKeyDown(e) {
        // Layer shortcuts
        switch (e.key.toLowerCase()) {
            case '1':
                this.selectLayer('background');
                break;
            case '2':
                this.selectLayer('collision');
                break;
            case '3':
                this.selectLayer('foreground');
                break;
            case 's':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.exportMap();
                }
                break;
            case '[':
                this.changeBrushSize(-1);
                break;
            case ']':
                this.changeBrushSize(1);
                break;
        }
    }

    exportMap() {
        if (!this.tileMap) {
            console.warn('No map loaded to export');
            return;
        }

        const mapData = this.tileMap.exportMap();
        const dataStr = JSON.stringify(mapData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.tileMap.properties.name || 'map'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('Map exported successfully');
    }

    update(deltaTime) {
        if (this.tileMap) {
            this.tileMap.update(deltaTime);
        }
        this.uiManager.update(deltaTime);
    }

    render(ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render tilemap
        if (this.tileMap) {
            this.tileMap.render(ctx);
        }

        // Render UI
        this.uiManager.render(ctx);

        // Render grid overlay if map is loaded
        if (this.tileMap) {
            this.renderGrid(ctx);
        }
    }

    renderGrid(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;

        const startX = -this.tileMap.camera.x % this.tileSize;
        const startY = -this.tileMap.camera.y % this.tileSize;

        // Vertical lines
        for (let x = startX; x < this.canvas.width; x += this.tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = startY; y < this.canvas.height; y += this.tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    destroy() {
        // Remove event listeners
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('keydown', this.handleKeyDown);

        // Clean up UI
        if (this.uiManager) {
            this.uiManager.removeComponent(this.panel);
        }
    }
}

export { MapEditor };