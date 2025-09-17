/**
 * Scene Management System
 * Handles game scenes, transitions, and scene-specific logic
 */

import { ValidationHelpers, ValidationError } from './ValidationHelpers.js';

class Scene {
    constructor(name, engine) {
        // Validate parameters
        ValidationHelpers.validateType(name, 'string', 'name');
        ValidationHelpers.validateObject(engine, [], 'engine');

        this.name = name;
        this.engine = engine;
        this.gameObjects = [];
        this.layers = new Map();
        this.isActive = false;
        this.background = null;
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.transitions = new Map();

        // Optimization: Separate active and destroy lists to avoid filtering every frame
        this.activeObjects = [];
        this.destroyQueue = [];
    }

    init() {
        // Override in subclasses
        console.log(`Scene ${this.name} initialized`);
    }

    enter() {
        this.isActive = true;
        console.log(`Entered scene: ${this.name}`);
    }

    exit() {
        this.isActive = false;
        console.log(`Exited scene: ${this.name}`);
    }

    update(deltaTime) {
        if (!this.isActive) return;

        // Process destroy queue
        while (this.destroyQueue.length > 0) {
            const obj = this.destroyQueue.pop();
            this.removeGameObject(obj);
        }

        // Update active objects only
        for (let i = this.activeObjects.length - 1; i >= 0; i--) {
            const obj = this.activeObjects[i];
            if (obj.active && obj.update) {
                obj.update(deltaTime);
            }
            // Remove destroyed objects from active list
            if (obj.destroyed) {
                this.activeObjects.splice(i, 1);
            }
        }
    }

    render(ctx) {
        if (!this.isActive) return;

        ctx.save();

        // Apply camera transform
        ctx.translate(-this.camera.x, -this.camera.y);
        ctx.scale(this.camera.zoom, this.camera.zoom);

        // Render background
        if (this.background) {
            this.renderBackground(ctx);
        }

        // Batch render objects by layers for better performance
        const layers = Array.from(this.layers.keys()).sort((a, b) => a - b);

        layers.forEach(layerIndex => {
            const layerObjects = this.layers.get(layerIndex);
            // Only iterate through active objects in this layer
            const activeLayerObjects = layerObjects.filter(obj => obj.visible && obj.active);
            activeLayerObjects.forEach(obj => {
                if (obj.render) {
                    obj.render(ctx);
                }
            });
        });

        // Render objects not assigned to layers (active only)
        for (let i = 0; i < this.activeObjects.length; i++) {
            const obj = this.activeObjects[i];
            if (obj.visible && obj.render && obj.layer === undefined) {
                obj.render(ctx);
            }
        }

        ctx.restore();
    }

    renderBackground(ctx) {
        if (typeof this.background === 'string') {
            // Color background
            ctx.fillStyle = this.background;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        } else if (this.background instanceof Image) {
            // Image background
            ctx.drawImage(this.background, 0, 0, ctx.canvas.width, ctx.canvas.height);
        } else if (typeof this.background === 'function') {
            // Custom background renderer
            this.background(ctx);
        }
    }

    addGameObject(obj, layer = 0) {
        if (!this.gameObjects.includes(obj)) {
            this.gameObjects.push(obj);
            this.activeObjects.push(obj);
            obj.scene = this;
        }

        // Add to layer
        if (!this.layers.has(layer)) {
            this.layers.set(layer, []);
        }

        if (!this.layers.get(layer).includes(obj)) {
            this.layers.get(layer).push(obj);
            obj.layer = layer;
        }

        return obj;
    }

    removeGameObject(obj) {
        const index = this.gameObjects.indexOf(obj);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }

        // Remove from layer
        if (obj.layer !== undefined && this.layers.has(obj.layer)) {
            const layerObjects = this.layers.get(obj.layer);
            const layerIndex = layerObjects.indexOf(obj);
            if (layerIndex > -1) {
                layerObjects.splice(layerIndex, 1);
            }
        }

        obj.scene = null;
        obj.layer = undefined;
    }

    findGameObject(predicate) {
        return this.gameObjects.find(predicate);
    }

    findGameObjects(predicate) {
        return this.gameObjects.filter(predicate);
    }

    // Camera controls
    moveCamera(x, y, smooth = false) {
        if (smooth) {
            // Smooth camera movement
            this.addTransition('camera', {
                from: { x: this.camera.x, y: this.camera.y },
                to: { x, y },
                duration: 500,
                easing: this.engine.easeInOut,
                update: (value) => {
                    this.camera.x = value.x;
                    this.camera.y = value.y;
                }
            });
        } else {
            this.camera.x = x;
            this.camera.y = y;
        }
    }

    setZoom(zoom, smooth = false) {
        if (smooth) {
            this.addTransition('zoom', {
                from: this.camera.zoom,
                to: zoom,
                duration: 300,
                easing: this.engine.easeInOut,
                update: (value) => {
                    this.camera.zoom = value;
                }
            });
        } else {
            this.camera.zoom = zoom;
        }
    }

    // Transition system
    addTransition(name, options) {
        const transition = {
            name,
            startTime: performance.now(),
            duration: options.duration || 1000,
            from: options.from,
            to: options.to,
            easing: options.easing || (t => t),
            update: options.update,
            complete: options.complete
        };

        this.transitions.set(name, transition);
    }

    updateTransitions() {
        const currentTime = performance.now();
        
        this.transitions.forEach((transition, name) => {
            const elapsed = currentTime - transition.startTime;
            const progress = Math.min(elapsed / transition.duration, 1);
            const easedProgress = transition.easing(progress);

            // Calculate current value
            let currentValue;
            if (typeof transition.from === 'object') {
                currentValue = {};
                Object.keys(transition.from).forEach(key => {
                    currentValue[key] = this.engine.lerp(
                        transition.from[key],
                        transition.to[key],
                        easedProgress
                    );
                });
            } else {
                currentValue = this.engine.lerp(
                    transition.from,
                    transition.to,
                    easedProgress
                );
            }

            // Update
            if (transition.update) {
                transition.update(currentValue);
            }

            // Check if complete
            if (progress >= 1) {
                if (transition.complete) {
                    transition.complete();
                }
                this.transitions.delete(name);
            }
        });
    }

    setBackground(background) {
        if (typeof background === 'string') {
            this.background = background;
        } else if (background instanceof HTMLImageElement) {
            this.background = background;
        } else if (typeof background === 'function') {
            this.background = background;
        }
    }

    destroy() {
        // Clean up all game objects
        this.gameObjects.forEach(obj => {
            if (obj.destroy) {
                obj.destroy();
            }
        });
        
        this.gameObjects = [];
        this.layers.clear();
        this.transitions.clear();
        
        console.log(`Scene ${this.name} destroyed`);
    }
}

// Menu Scene Template (inspired by both games)
class MenuScene extends Scene {
    constructor(name, engine) {
        super(name, engine);
        this.menuItems = [];
        this.selectedIndex = 0;
        this.title = '';
        this.subtitle = '';
        this.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
    }

    init() {
        super.init();
        this.setupMenu();
    }

    setupMenu() {
        // Override in subclasses
    }

    addMenuItem(text, callback, enabled = true) {
        this.menuItems.push({
            text,
            callback,
            enabled,
            hovered: false
        });
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.updateTransitions();

        // Handle input
        if (this.engine.inputManager) {
            const input = this.engine.inputManager;
            
            if (input.isKeyPressed('ArrowUp') || input.isKeyPressed('KeyW')) {
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            }
            
            if (input.isKeyPressed('ArrowDown') || input.isKeyPressed('KeyS')) {
                this.selectedIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
            }
            
            if (input.isKeyPressed('Enter') || input.isKeyPressed('Space')) {
                this.selectMenuItem();
            }
        }
    }

    selectMenuItem() {
        const item = this.menuItems[this.selectedIndex];
        if (item && item.enabled && item.callback) {
            item.callback();
        }
    }

    render(ctx) {
        // Render background
        this.renderMenuBackground(ctx);
        
        // Render title
        if (this.title) {
            this.renderTitle(ctx);
        }
        
        // Render subtitle
        if (this.subtitle) {
            this.renderSubtitle(ctx);
        }
        
        // Render menu items
        this.renderMenuItems(ctx);
        
        super.render(ctx);
    }

    renderMenuBackground(ctx) {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Add some visual flair
        ctx.save();
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * ctx.canvas.width,
                Math.random() * ctx.canvas.height,
                Math.random() * 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        ctx.restore();
    }

    renderTitle(ctx) {
        ctx.save();
        ctx.fillStyle = '#ff206e';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#05d9e8';
        ctx.shadowBlur = 10;
        ctx.fillText(this.title, ctx.canvas.width / 2, ctx.canvas.height / 4);
        ctx.restore();
    }

    renderSubtitle(ctx) {
        ctx.save();
        ctx.fillStyle = '#ffd700';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.subtitle, ctx.canvas.width / 2, ctx.canvas.height / 4 + 60);
        ctx.restore();
    }

    renderMenuItems(ctx) {
        ctx.save();
        ctx.font = '32px monospace';
        ctx.textAlign = 'center';
        
        const startY = ctx.canvas.height / 2;
        const itemHeight = 60;
        
        this.menuItems.forEach((item, index) => {
            const y = startY + index * itemHeight;
            const isSelected = index === this.selectedIndex;
            
            // Highlight selected item
            if (isSelected) {
                ctx.fillStyle = 'rgba(255, 32, 110, 0.3)';
                ctx.fillRect(
                    ctx.canvas.width / 2 - 200,
                    y - 25,
                    400,
                    50
                );
            }
            
            // Set text style
            if (item.enabled) {
                ctx.fillStyle = isSelected ? '#00f593' : '#ffffff';
            } else {
                ctx.fillStyle = '#666666';
            }
            
            if (isSelected) {
                ctx.shadowColor = '#00f593';
                ctx.shadowBlur = 5;
            } else {
                ctx.shadowBlur = 0;
            }
            
            ctx.fillText(item.text, ctx.canvas.width / 2, y);
        });
        
        ctx.restore();
    }
}

export { Scene, MenuScene };
