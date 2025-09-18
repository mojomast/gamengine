/**
 * RPGEngine - Specialized game engine for RPG games
 * Extends the base GameEngine with RPG-specific managers and systems
 */

import { GameEngine } from '../../game-engine/src/core/GameEngine.js';
import { EventBus } from '../../game-engine/src/core/EventBus.js';
import { ResourceManager } from '../../game-engine/src/core/ResourceManager.js';
import { ValidationHelpers } from '../../game-engine/src/core/ValidationHelpers.js';

class PerformanceMonitor {
    constructor() {
        this.systemMetrics = new Map();
        this.enabled = true;
        this.frameTimeHistory = [];
        this.maxHistorySize = 60;
    }

    measureSystem(systemName, operation) {
        if (!this.enabled) return operation();

        const start = performance.now();
        const result = operation();
        const duration = performance.now() - start;

        this.recordMetric(systemName, duration);
        return result;
    }

    recordMetric(systemName, duration) {
        if (!this.systemMetrics.has(systemName)) {
            this.systemMetrics.set(systemName, []);
        }

        const metrics = this.systemMetrics.get(systemName);
        metrics.push(duration);

        if (metrics.length > 100) {
            metrics.shift();
        }
    }

    getSystemPerformance() {
        const result = {
            character: this.getAverageTime('character'),
            dialog: this.getAverageTime('dialog'),
            inventory: this.getAverageTime('inventory'),
            abilities: this.getAverageTime('abilities'),
            ui: this.getAverageTime('ui'),
            animation: this.getAverageTime('animation'),
            total: this.getTotalFrameTime(),
            memory: this.getMemoryUsage(),
            pools: this.getPoolStats()
        };

        return result;
    }

    getAverageTime(systemName) {
        const metrics = this.systemMetrics.get(systemName);
        if (!metrics || metrics.length === 0) return 0;

        return metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
    }

    getTotalFrameTime() {
        const systems = ['character', 'dialog', 'inventory', 'abilities', 'ui', 'animation'];
        return systems.reduce((total, system) => total + this.getAverageTime(system), 0);
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    getPoolStats() {
        return {
            tweenPool: 0,
            particlePool: 0,
            uiElementPool: 0
        };
    }
}

class SceneManager {
    constructor(engine) {
        this.engine = engine;
        this.scenes = new Map();
        this.currentScene = null;
        this.transitionQueue = [];
        this.isTransitioning = false;
    }

    addScene(name, scene) {
        ValidationHelpers.validateType(name, 'string', 'name');
        ValidationHelpers.validateScene(scene);

        scene.engine = this.engine;
        this.scenes.set(name, scene);

        if (scene.init) {
            ValidationHelpers.validateFunction(scene.init, 'scene.init');
            scene.init();
        }
    }

    switchScene(name, transitionData = {}) {
        ValidationHelpers.validateType(name, 'string', 'name');

        if (this.isTransitioning) {
            this.transitionQueue.push({ name, transitionData });
            return;
        }

        const scene = this.scenes.get(name);
        if (!scene) {
            throw new Error(`Scene "${name}" not found`);
        }

        this.isTransitioning = true;

        // Exit current scene
        if (this.currentScene && this.currentScene.exit) {
            this.currentScene.exit();
        }

        // Enter new scene
        this.currentScene = scene;
        if (scene.enter) {
            scene.enter(transitionData);
        }

        this.isTransitioning = false;

        // Process queued transitions
        if (this.transitionQueue.length > 0) {
            const next = this.transitionQueue.shift();
            this.switchScene(next.name, next.transitionData);
        }

        console.log(`Switched to scene: ${name}`);
    }

    update(deltaTime) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(deltaTime);
        }
    }

    render(ctx) {
        if (this.currentScene && this.currentScene.render) {
            this.currentScene.render(ctx);
        }
    }
}

class RPGEngine extends GameEngine {
    constructor(canvasId, options = {}) {
        // Add RPG-specific defaults
        const rpgOptions = {
            ...options,
            debug: options.debug !== false,
            performanceMonitoring: options.performanceMonitoring !== false,
            rpgMode: true
        };

        super(canvasId, rpgOptions);

        // RPG-specific managers
        this.eventBus = new EventBus();
        this.resourceManager = new ResourceManager();
        this.sceneManager = new SceneManager(this);
        this.performanceMonitor = new PerformanceMonitor();

        // RPG game state
        this.rpgState = {
            player: null,
            party: [],
            currentMap: null,
            gameFlags: new Map(),
            questLog: [],
            saveData: {}
        };

        // Debug console
        this.debugConsole = {
            enabled: this.config.debug,
            logs: [],
            maxLogs: 100,
            commands: new Map()
        };

        this.setupRPGSystems();
        this.setupDebugConsole();
    }

    setupRPGSystems() {
        // Setup cross-system event connections
        this.setupEventConnections();

        // Initialize RPG-specific systems
        this.initializeRPGSystems();
    }

    setupEventConnections() {
        // Connect EventBus to engine events
        this.eventBus.on('scene-change', (data) => {
            this.sceneManager.switchScene(data.sceneName, data.transitionData);
        });

        this.eventBus.on('save-game', (data) => {
            this.saveGame(data.slot, this.rpgState);
        });

        this.eventBus.on('load-game', (data) => {
            const saveData = this.loadGame(data.slot);
            if (saveData) {
                this.restoreRPGState(saveData);
            }
        });

        // Performance monitoring
        if (this.config.performanceMonitoring) {
            this.eventBus.on('performance-measure', (data) => {
                this.performanceMonitor.measureSystem(data.system, data.operation);
            });
        }
    }

    initializeRPGSystems() {
        // Initialize resource manager with RPG assets
        this.initializeResources();

        // Setup debug console commands
        this.registerDebugCommands();
    }

    initializeResources() {
        // Preload common RPG assets
        const rpgManifest = {
            textures: [
                // These would be defined based on actual game assets
                // { id: 'player-sprite', url: 'assets/player.png' }
            ],
            audio: [
                // { id: 'battle-music', url: 'assets/battle.mp3' }
            ],
            json: [
                // { id: 'game-data', url: 'assets/game-data.json' }
            ]
        };

        // Preload in background
        this.resourceManager.preloadAll(rpgManifest).catch(error => {
            console.warn('Failed to preload some RPG resources:', error);
        });
    }

    setupDebugConsole() {
        if (!this.debugConsole.enabled) return;

        // Add debug key listener
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {
                this.toggleDebugConsole();
            }
        });
    }

    registerDebugCommands() {
        this.debugConsole.commands.set('help', () => {
            return 'Available commands: help, perf, save, load, clear, scenes';
        });

        this.debugConsole.commands.set('perf', () => {
            const perf = this.performanceMonitor.getSystemPerformance();
            return JSON.stringify(perf, null, 2);
        });

        this.debugConsole.commands.set('save', (slot = 'debug') => {
            this.saveGame(slot, this.rpgState);
            return `Game saved to slot: ${slot}`;
        });

        this.debugConsole.commands.set('load', (slot = 'debug') => {
            const saveData = this.loadGame(slot);
            if (saveData) {
                this.restoreRPGState(saveData);
                return `Game loaded from slot: ${slot}`;
            }
            return `No save data found in slot: ${slot}`;
        });

        this.debugConsole.commands.set('clear', () => {
            this.debugConsole.logs = [];
            return 'Debug logs cleared';
        });

        this.debugConsole.commands.set('scenes', () => {
            const sceneNames = Array.from(this.sceneManager.scenes.keys());
            return `Available scenes: ${sceneNames.join(', ')}\nCurrent scene: ${this.sceneManager.currentScene ? this.sceneManager.currentScene.constructor.name : 'None'}`;
        });
    }

    logDebug(message, level = 'info') {
        if (!this.debugConsole.enabled) return;

        const logEntry = {
            timestamp: Date.now(),
            level,
            message
        };

        this.debugConsole.logs.push(logEntry);

        if (this.debugConsole.logs.length > this.debugConsole.maxLogs) {
            this.debugConsole.logs.shift();
        }

        console.log(`[${level.toUpperCase()}] ${message}`);
    }

    executeDebugCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);

        if (this.debugConsole.commands.has(cmd)) {
            try {
                const result = this.debugConsole.commands.get(cmd)(...args);
                this.logDebug(`Command executed: ${command}`);
                return result;
            } catch (error) {
                this.logDebug(`Command error: ${error.message}`, 'error');
                return `Error: ${error.message}`;
            }
        } else {
            return `Unknown command: ${cmd}. Type 'help' for available commands.`;
        }
    }

    toggleDebugConsole() {
        this.debugConsole.enabled = !this.debugConsole.enabled;
        this.logDebug(`Debug console ${this.debugConsole.enabled ? 'enabled' : 'disabled'}`);
    }

    // Enhanced save/load with RPG state
    saveRPGGame(slot = 'default', additionalData = {}) {
        const rpgSaveData = {
            ...additionalData,
            rpgState: this.rpgState,
            sceneState: this.sceneManager.currentScene ? {
                name: this.sceneManager.currentScene.constructor.name,
                state: this.sceneManager.currentScene.getState ? this.sceneManager.currentScene.getState() : {}
            } : null
        };

        return this.saveGame(slot, rpgSaveData);
    }

    loadRPGGame(slot = 'default') {
        const saveData = this.loadGame(slot);
        if (saveData) {
            this.restoreRPGState(saveData);
            return true;
        }
        return false;
    }

    restoreRPGState(saveData) {
        if (saveData.rpgState) {
            this.rpgState = { ...this.rpgState, ...saveData.rpgState };
        }

        if (saveData.sceneState) {
            // Restore scene if needed
            const sceneName = saveData.sceneState.name;
            if (this.sceneManager.scenes.has(sceneName)) {
                this.sceneManager.switchScene(sceneName, saveData.sceneState.state);
            }
        }

        this.eventBus.emit('game-state-restored', saveData);
        this.logDebug('RPG state restored from save data');
    }

    // Enhanced update loop with RPG systems
    update(deltaTime) {
        this.performanceMonitor.measureSystem('rpg-update', () => {
            // Update base engine systems
            super.update(deltaTime);

            // Update RPG-specific systems
            this.sceneManager.update(deltaTime);

            // Update RPG state
            this.updateRPGState(deltaTime);

            // Performance monitoring
            if (this.config.performanceMonitoring) {
                this.updatePerformanceMonitoring(deltaTime);
            }
        });
    }

    updateRPGState(deltaTime) {
        // Update party members
        this.rpgState.party.forEach(member => {
            if (member.update) {
                member.update(deltaTime);
            }
        });

        // Update quests
        this.rpgState.questLog.forEach(quest => {
            if (quest.update) {
                quest.update(deltaTime);
            }
        });
    }

    updatePerformanceMonitoring(deltaTime) {
        // Additional performance monitoring specific to RPG
        this.performanceMonitor.recordMetric('rpg-systems', deltaTime * 1000);
    }

    // Enhanced render with RPG-specific elements
    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render current scene via scene manager
        this.sceneManager.render(this.ctx);

        // Render base engine systems
        super.render();

        // Render RPG-specific UI
        this.renderRPGUI();

        // Render debug info if enabled
        if (this.config.debug && this.debugConsole.enabled) {
            this.renderDebugConsole();
        }
    }

    renderRPGUI() {
        // Render party status, minimap, etc.
        if (this.rpgState.party.length > 0) {
            this.renderPartyStatus();
        }
    }

    renderPartyStatus() {
        if (!this.ctx) return;

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 10, 200, 100);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px monospace';
        this.ctx.fillText('Party Status', 20, 30);

        this.rpgState.party.forEach((member, index) => {
            const y = 50 + index * 20;
            const healthPercent = member.health / member.maxHealth;
            const healthBarWidth = 150;

            // Health bar background
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(20, y - 10, healthBarWidth, 12);

            // Health bar
            this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
            this.ctx.fillRect(20, y - 10, healthBarWidth * healthPercent, 12);

            // Name and health text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(`${member.name}: ${member.health}/${member.maxHealth}`, 20, y + 15);
        });

        this.ctx.restore();
    }

    renderDebugConsole() {
        if (!this.ctx) return;

        this.ctx.save();

        // Semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(10, this.canvas.height - 310, this.canvas.width - 20, 300);

        // Border
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(10, this.canvas.height - 310, this.canvas.width - 20, 300);

        // Title
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '16px monospace';
        this.ctx.fillText('RPG DEBUG CONSOLE', 20, this.canvas.height - 280);

        // Recent logs
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';

        const recentLogs = this.debugConsole.logs.slice(-15);
        recentLogs.forEach((log, index) => {
            const y = this.canvas.height - 260 + index * 16;
            const timestamp = new Date(log.timestamp).toLocaleTimeString();
            const level = log.level.toUpperCase();
            const color = this.getLogLevelColor(log.level);

            this.ctx.fillStyle = color;
            this.ctx.fillText(`[${timestamp}] [${level}] ${log.message}`, 20, y);
        });

        // Command prompt
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillText('> Press ~ to toggle console', 20, this.canvas.height - 20);

        this.ctx.restore();
    }

    getLogLevelColor(level) {
        switch (level) {
            case 'error': return '#ff4444';
            case 'warn': return '#ffaa00';
            case 'info': return '#ffffff';
            case 'debug': return '#888888';
            default: return '#ffffff';
        }
    }

    // RPG-specific methods
    addToParty(character) {
        ValidationHelpers.validateObject(character, ['name', 'health', 'maxHealth'], 'character');

        this.rpgState.party.push(character);
        this.eventBus.emit('party-member-added', character);
        this.logDebug(`Added ${character.name} to party`);
    }

    removeFromParty(characterName) {
        ValidationHelpers.validateType(characterName, 'string', 'characterName');

        const index = this.rpgState.party.findIndex(c => c.name === characterName);
        if (index !== -1) {
            const removed = this.rpgState.party.splice(index, 1)[0];
            this.eventBus.emit('party-member-removed', removed);
            this.logDebug(`Removed ${characterName} from party`);
            return removed;
        }
        return null;
    }

    setGameFlag(flag, value) {
        ValidationHelpers.validateType(flag, 'string', 'flag');

        this.rpgState.gameFlags.set(flag, value);
        this.eventBus.emit('game-flag-changed', { flag, value });
        this.logDebug(`Game flag ${flag} set to ${value}`);
    }

    getGameFlag(flag) {
        return this.rpgState.gameFlags.get(flag);
    }

    // Enhanced destroy with RPG cleanup
    destroy() {
        // Perform final save if needed
        if (this.config.autoSaveOnExit) {
            this.saveRPGGame('auto-exit');
        }

        // Cleanup RPG systems
        this.eventBus.clear();
        this.rpgState.party = [];
        this.rpgState.questLog = [];
        this.rpgState.gameFlags.clear();

        // Destroy base engine
        super.destroy();

        this.logDebug('RPG Engine destroyed');
    }
}

export { RPGEngine, SceneManager, PerformanceMonitor };