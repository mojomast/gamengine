/**
 * Core Game Engine - Inspired by Poker Doom and Rainbow Builder
 * Features: Scene management, game loops, state management, and modular systems
 */

import { AnimationManager } from '../effects/AnimationManager.js';
import { ValidationHelpers, ValidationError } from './ValidationHelpers.js';

class GameEngine {
    constructor(canvasId, options = {}) {
        // Validate canvasId
        ValidationHelpers.validateType(canvasId, 'string', 'canvasId');
        ValidationHelpers.validateDOMElement(canvasId);

        // Validate options
        ValidationHelpers.validateType(options, 'object', 'options');

        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas?.getContext('2d');
        
        // Engine configuration
        this.config = {
            fps: options.fps || 60,
            pixelArt: options.pixelArt || false,
            responsive: options.responsive !== false,
            audioEnabled: options.audioEnabled !== false,
            touchEnabled: options.touchEnabled !== false,
            adaptiveFrameRate: options.adaptiveFrameRate !== false, // New: adaptive FPS
            targetFrameTime: 1000 / (options.fps || 60),
            ...options
        };

        // Core systems
        this.scenes = new Map();
        this.currentScene = null;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        
        // Game state management
        this.gameState = {
            score: 0,
            level: 1,
            health: 100,
            maxHealth: 100,
            resources: {},
            flags: {},
            persistent: {}
        };

        // System managers
        this.inputManager = null;
        this.audioManager = null;
        this.particleSystem = null;
        this.uiManager = null;
        this.animationManager = null;

        // Performance tracking
        this.performance = {
            fps: 0,
            frameTime: 0,
            lastSecond: 0,
            frameCount: 0,
            averageFrameTime: 0,
            frameTimeHistory: [],
            maxFrameTimeHistory: 60, // Keep 60 samples for rolling average
            memoryUsage: 0,
            lastMemoryCheck: 0
        };

        this.init();
    }

    async init() {
        try {
            // Setup canvas
            this.setupCanvas();
            
            // Initialize core systems
            await this.initializeSystems();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Game Engine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Game Engine:', error);
        }
    }

    setupCanvas() {
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }

        // Set canvas size
        this.resizeCanvas();
        
        // Configure rendering
        if (this.config.pixelArt) {
            this.ctx.imageSmoothingEnabled = false;
            this.canvas.style.imageRendering = 'pixelated';
        }

        // Set canvas styles
        this.canvas.style.display = 'block';
        this.canvas.style.touchAction = 'none';
    }

    resizeCanvas() {
        if (!this.canvas) return;

        if (this.config.responsive) {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }
    }

    async initializeSystems() {
        // Import and initialize systems dynamically
        try {
            const { InputManager } = await import('./InputManager.js');
            this.inputManager = new InputManager(this);

            if (this.config.audioEnabled) {
                const { AudioManager } = await import('./AudioManager.js');
                this.audioManager = new AudioManager(this);
            }

            const { ParticleSystem } = await import('../effects/ParticleSystem.js');
            this.particleSystem = new ParticleSystem(this);

            const { UIManager } = await import('../ui/UIManager.js');
            this.uiManager = new UIManager(this);

            this.animationManager = new AnimationManager(this);

        } catch (error) {
            console.warn('Some systems failed to initialize:', error);
        }
    }

    setupEventListeners() {
        // Window resize
        if (this.config.responsive) {
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        // Visibility change handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    // Scene Management
    addScene(name, scene) {
        // Validate parameters
        ValidationHelpers.validateType(name, 'string', 'name');
        ValidationHelpers.validateScene(scene);

        scene.engine = this;
        this.scenes.set(name, scene);

        if (scene.init) {
            ValidationHelpers.validateFunction(scene.init, 'scene.init');
            scene.init();
        }
    }

    switchScene(name) {
        // Validate parameter
        ValidationHelpers.validateType(name, 'string', 'name');

        const scene = this.scenes.get(name);
        if (!scene) {
            throw new ValidationError(`Scene "${name}" not found`, 'name');
        }

        // Exit current scene
        if (this.currentScene && this.currentScene.exit) {
            this.currentScene.exit();
        }

        // Enter new scene
        this.currentScene = scene;
        if (scene.enter) {
            scene.enter();
        }

        console.log(`Switched to scene: ${name}`);
    }

    // Game State Management
    setState(key, value) {
        // Validate parameters
        ValidationHelpers.validateType(key, 'string', 'key');

        this.gameState[key] = value;
        this.triggerStateChange(key, value);
    }

    getState(key) {
        return this.gameState[key];
    }

    updateState(updates) {
        // Validate parameter
        ValidationHelpers.validateType(updates, 'object', 'updates');

        Object.keys(updates).forEach(key => {
            this.setState(key, updates[key]);
        });
    }

    triggerStateChange(key, value) {
        // Emit state change events
        const event = new CustomEvent('statechange', {
            detail: { key, value, state: this.gameState }
        });
        window.dispatchEvent(event);
    }

    // Game Loop
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop();
        
        console.log('Game engine started');
    }

    stop() {
        this.isRunning = false;
        console.log('Game engine stopped');
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        console.log('Game engine paused');
    }

    resume() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop();
        console.log('Game engine resumed');
    }

    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        this.frameCount++;

        // Update performance metrics
        this.updatePerformanceMetrics(currentTime);

        // Update systems
        this.update(this.deltaTime);

        // Render
        this.render();

        // Adaptive frame rate scheduling
        if (this.config.adaptiveFrameRate) {
            const nextFrameTime = currentTime + this.config.targetFrameTime;
            const timeToNextFrame = Math.max(0, nextFrameTime - performance.now());

            if (timeToNextFrame > 1) { // Only use timeout if we have significant time to spare
                setTimeout(() => requestAnimationFrame(() => this.gameLoop()), timeToNextFrame - 1);
            } else {
                requestAnimationFrame(() => this.gameLoop());
            }
        } else {
            // Schedule next frame
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    update(deltaTime) {
        // Update input manager
        if (this.inputManager) {
            this.inputManager.update(deltaTime);
        }

        // Update current scene
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }

        // Update animation manager
        if (this.animationManager) {
            this.animationManager.update(deltaTime);
        }

        // Update particle system
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime);
        }

        // Update UI manager
        if (this.uiManager) {
            this.uiManager.update(deltaTime);
        }
    }

    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render current scene
        if (this.currentScene) {
            this.currentScene.render(this.ctx);
        }

        // Render particle system
        if (this.particleSystem) {
            this.particleSystem.render(this.ctx);
        }

        // Render UI
        if (this.uiManager) {
            this.uiManager.render(this.ctx);
        }

        // Render debug info if enabled
        if (this.config.debug) {
            this.renderDebugInfo();
        }
    }

    updatePerformanceMetrics(currentTime) {
        this.performance.frameCount++;
        const frameTime = this.deltaTime * 1000;

        // Update frame time history for rolling average
        this.performance.frameTimeHistory.push(frameTime);
        if (this.performance.frameTimeHistory.length > this.performance.maxFrameTimeHistory) {
            this.performance.frameTimeHistory.shift();
        }

        // Calculate rolling average frame time
        const sum = this.performance.frameTimeHistory.reduce((a, b) => a + b, 0);
        this.performance.averageFrameTime = sum / this.performance.frameTimeHistory.length;

        // Update FPS every second
        if (currentTime - this.performance.lastSecond >= 1000) {
            this.performance.fps = this.performance.frameCount;
            this.performance.frameCount = 0;
            this.performance.lastSecond = currentTime;

            // Check memory usage (throttled to once per second)
            if (performance.memory) {
                this.performance.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
            }
        }

        this.performance.frameTime = frameTime;
    }

    renderDebugInfo() {
        if (!this.ctx) return;

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 100);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`FPS: ${this.performance.fps}`, 15, 30);
        this.ctx.fillText(`Frame Time: ${this.performance.frameTime.toFixed(2)}ms`, 15, 45);
        this.ctx.fillText(`Scene: ${this.currentScene ? this.currentScene.constructor.name : 'None'}`, 15, 60);
        this.ctx.fillText(`Objects: ${this.currentScene ? this.currentScene.gameObjects?.length || 0 : 0}`, 15, 75);
        this.ctx.restore();
    }

    // Utility methods
    createVector2(x, y) {
        // Validate parameters
        ValidationHelpers.validateType(x, 'number', 'x', 0);
        ValidationHelpers.validateType(y, 'number', 'y', 0);
        return { x, y };
    }

    distance(a, b) {
        // Validate parameters
        ValidationHelpers.validateObject(a, ['x', 'y'], 'a');
        ValidationHelpers.validateObject(b, ['x', 'y'], 'b');
        ValidationHelpers.validateType(a.x, 'number', 'a.x');
        ValidationHelpers.validateType(a.y, 'number', 'a.y');
        ValidationHelpers.validateType(b.x, 'number', 'b.x');
        ValidationHelpers.validateType(b.y, 'number', 'b.y');

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    lerp(start, end, factor) {
        // Validate parameters
        ValidationHelpers.validateType(start, 'number', 'start');
        ValidationHelpers.validateType(end, 'number', 'end');
        ValidationHelpers.validateType(factor, 'number', 'factor');
        ValidationHelpers.validateRange(factor, 0, 1, 'factor');

        return start + (end - start) * factor;
    }

    clamp(value, min, max) {
        // Validate parameters
        ValidationHelpers.validateType(value, 'number', 'value');
        ValidationHelpers.validateType(min, 'number', 'min');
        ValidationHelpers.validateType(max, 'number', 'max');

        if (min > max) {
            throw new ValidationError('Parameter \'min\' must be less than or equal to \'max\'', 'min');
        }

        return Math.min(Math.max(value, min), max);
    }

    randomRange(min, max) {
        // Validate parameters
        ValidationHelpers.validateType(min, 'number', 'min');
        ValidationHelpers.validateType(max, 'number', 'max');

        if (min > max) {
            throw new ValidationError('Parameter \'min\' must be less than or equal to \'max\'', 'min');
        }

        return Math.random() * (max - min) + min;
    }

    // Animation helpers inspired by both games
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    shake(intensity = 5, duration = 200) {
        // Validate parameters
        ValidationHelpers.validateType(intensity, 'number', 'intensity');
        ValidationHelpers.validateRange(intensity, 0, 100, 'intensity');
        ValidationHelpers.validateType(duration, 'number', 'duration');
        ValidationHelpers.validatePositiveNumber(duration, 'duration');

        if (this.canvas) {
            const startTime = performance.now();
            const animate = () => {
                const elapsed = performance.now() - startTime;
                if (elapsed < duration) {
                    const factor = 1 - (elapsed / duration);
                    const offsetX = (Math.random() - 0.5) * intensity * factor;
                    const offsetY = (Math.random() - 0.5) * intensity * factor;
                    
                    this.canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                    requestAnimationFrame(animate);
                } else {
                    this.canvas.style.transform = '';
                }
            };
            animate();
        }
    }

    // Enhanced Save/Load system with comprehensive game state
    saveGame(slot = 'default', additionalData = {}) {
        try {
            // Validate parameters
            ValidationHelpers.validateType(slot, 'string', 'slot');
            ValidationHelpers.validateType(additionalData, 'object', 'additionalData');
            const saveData = {
                gameState: this.gameState,
                timestamp: Date.now(),
                version: '1.0.1',
                // Player data
                player: additionalData.player ? {
                    x: additionalData.player.x,
                    y: additionalData.player.y,
                    health: additionalData.player.health,
                    maxHealth: additionalData.player.maxHealth,
                    energy: additionalData.player.energy,
                    maxEnergy: additionalData.player.maxEnergy,
                    facing: additionalData.player.facing,
                    isMoving: additionalData.player.isMoving,
                    animTime: additionalData.player.animTime,
                    trail: additionalData.player.trail
                } : null,
                // Character stats
                character: additionalData.character ? {
                    health: additionalData.character.health,
                    maxHealth: additionalData.character.maxHealth,
                    mana: additionalData.character.mana,
                    maxMana: additionalData.character.maxMana,
                    level: additionalData.character.level,
                    experience: additionalData.character.experience,
                    strength: additionalData.character.strength,
                    agility: additionalData.character.agility,
                    intelligence: additionalData.character.intelligence,
                    statusEffects: Array.from(additionalData.character.statusEffects.entries())
                } : null,
                // Inventory
                inventory: additionalData.inventory ? {
                    capacity: additionalData.inventory.capacity,
                    inventory: Array.from(additionalData.inventory.inventory.entries()),
                    equipmentSlots: additionalData.inventory.equipmentSlots
                } : null,
                // Abilities
                abilities: additionalData.abilities ? {
                    abilities: additionalData.abilities.abilities.map(ability => ({
                        name: ability.name,
                        level: ability.level,
                        currentCooldown: ability.currentCooldown,
                        elementalType: ability.elementalType
                    })),
                    hotbar: additionalData.abilities.hotbar.slots.map(slot => slot ? slot.name : null)
                } : null,
                // Additional data
                ...additionalData
            };
            try {
                localStorage.setItem(`game_save_${slot}`, JSON.stringify(saveData));
                console.log(`Game saved to slot: ${slot}`);
                this.emit('gameSaved', { slot, saveData });
                return true;
            } catch (error) {
                if (error.name === 'QuotaExceededError' || error.code === 22) {
                    console.error('Storage quota exceeded. Unable to save game.');
                    // Could implement compression or alternative storage here
                } else {
                    console.error('Failed to save game:', error);
                }
                return false;
            }
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    loadGame(slot = 'default') {
        try {
            // Validate parameter
            ValidationHelpers.validateType(slot, 'string', 'slot');
            const saveData = localStorage.getItem(`game_save_${slot}`);
            if (saveData) {
                const data = JSON.parse(saveData);
                this.gameState = { ...this.gameState, ...data.gameState };
                console.log(`Game loaded from slot: ${slot}`);
                this.emit('gameLoaded', { slot, saveData: data });
                return data; // Return the full save data for restoration
            }
            return null;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }

    // Export save data as JSON string
    exportSave(slot = 'default') {
        try {
            // Validate parameter
            ValidationHelpers.validateType(slot, 'string', 'slot');
            const saveData = localStorage.getItem(`game_save_${slot}`);
            if (saveData) {
                const blob = new Blob([saveData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `game_save_${slot}.json`;
                a.click();
                URL.revokeObjectURL(url);
                console.log(`Save exported: ${slot}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to export save:', error);
            return false;
        }
    }

    // Import save data from JSON string
    importSave(saveDataString) {
        try {
            // Validate parameter
            ValidationHelpers.validateType(saveDataString, 'string', 'saveDataString');
            const saveData = JSON.parse(saveDataString);
            // Validate save data structure
            if (!saveData.gameState || !saveData.timestamp) {
                throw new Error('Invalid save data format');
            }
            // Generate a unique slot name
            const slot = `imported_${Date.now()}`;
            localStorage.setItem(`game_save_${slot}`, JSON.stringify(saveData));
            console.log(`Save imported to slot: ${slot}`);
            return slot;
        } catch (error) {
            console.error('Failed to import save:', error);
            return null;
        }
    }

    // Get save info for all slots
    getSaveSlots() {
        // No parameters to validate
        const slots = [];
        for (let i = 0; i < 3; i++) {
            const slot = `slot_${i}`;
            const saveData = localStorage.getItem(`game_save_${slot}`);
            if (saveData) {
                try {
                    const data = JSON.parse(saveData);
                    slots.push({
                        slot,
                        name: slot,
                        timestamp: data.timestamp,
                        level: data.character?.level || data.gameState?.level || 1,
                        hasData: true
                    });
                } catch (error) {
                    slots.push({
                        slot,
                        name: slot,
                        timestamp: null,
                        level: 1,
                        hasData: false
                    });
                }
            } else {
                slots.push({
                    slot,
                    name: slot,
                    timestamp: null,
                    level: 1,
                    hasData: false
                });
            }
        }
        return slots;
    }

    // Event system
    on(event, callback) {
        window.addEventListener(event, callback);
    }

    off(event, callback) {
        window.removeEventListener(event, callback);
    }

    emit(event, data) {
        const customEvent = new CustomEvent(event, { detail: data });
        window.dispatchEvent(customEvent);
    }

    // Cleanup and memory leak prevention
    destroy() {
        // Stop game loop
        this.stop();

        // Remove event listeners
        if (this.config.responsive) {
            window.removeEventListener('resize', () => this.resizeCanvas());
        }
        document.removeEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Clear scenes
        this.scenes.forEach(scene => {
            if (scene.destroy) {
                scene.destroy();
            }
        });
        this.scenes.clear();
        this.currentScene = null;

        // Clear systems
        if (this.inputManager && this.inputManager.destroy) {
            this.inputManager.destroy();
        }
        if (this.audioManager && this.audioManager.destroy) {
            this.audioManager.destroy();
        }
        if (this.particleSystem && this.particleSystem.clear) {
            this.particleSystem.clear();
        }
        if (this.uiManager && this.uiManager.destroy) {
            this.uiManager.destroy();
        }
        if (this.animationManager && this.animationManager.killAll) {
            this.animationManager.killAll();
        }

        // Clear game state
        this.gameState = {};

        console.log('Game Engine destroyed and cleaned up');
    }
}

export { GameEngine };
