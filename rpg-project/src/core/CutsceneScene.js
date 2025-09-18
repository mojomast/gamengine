/**
 * Cutscene Scene System
 * Extends Scene for cinematic sequences with timeline-based scripting
 */

import { Scene } from '../../game-engine/src/core/Scene.js';
import { Timeline, AnimationManager } from '../../game-engine/src/effects/AnimationManager.js';
import { DialogManager } from '../../game-engine/src/ui/DialogManager.js';
import { AudioManager } from '../../game-engine/src/core/AudioManager.js';

class CutsceneAction {
    constructor(type, config = {}) {
        this.type = type; // 'camera', 'character', 'dialog', 'effect', 'sound', 'wait', 'conditional'
        this.config = config;
        this.startTime = config.startTime || 0;
        this.duration = config.duration || 0;
        this.completed = false;
        this.started = false;
    }

    execute(cutscene) {
        this.started = true;
        switch (this.type) {
            case 'camera':
                return this.executeCameraAction(cutscene);
            case 'character':
                return this.executeCharacterAction(cutscene);
            case 'dialog':
                return this.executeDialogAction(cutscene);
            case 'effect':
                return this.executeEffectAction(cutscene);
            case 'sound':
                return this.executeSoundAction(cutscene);
            case 'wait':
                return this.executeWaitAction(cutscene);
            case 'conditional':
                return this.executeConditionalAction(cutscene);
            default:
                console.warn(`Unknown cutscene action type: ${this.type}`);
                return true;
        }
    }

    executeCameraAction(cutscene) {
        const { position, zoom, smooth = true } = this.config;
        if (position) {
            cutscene.moveCamera(position.x, position.y, smooth);
        }
        if (zoom !== undefined) {
            cutscene.setZoom(zoom, smooth);
        }
        return true;
    }

    executeCharacterAction(cutscene) {
        const { characterId, action, position, animation } = this.config;
        const character = cutscene.findCharacter(characterId);

        if (!character) {
            console.warn(`Character ${characterId} not found in cutscene`);
            return true;
        }

        switch (action) {
            case 'move':
                if (position) {
                    cutscene.moveCharacter(character, position);
                }
                break;
            case 'animate':
                if (animation && cutscene.animationManager) {
                    cutscene.animationManager.to(character, animation.properties, animation.duration, animation.options);
                }
                break;
            case 'show':
                character.visible = true;
                break;
            case 'hide':
                character.visible = false;
                break;
        }
        return true;
    }

    executeDialogAction(cutscene) {
        const { dialogId, context = {} } = this.config;
        if (cutscene.dialogManager) {
            cutscene.dialogManager.startDialog(dialogId, context);
            // Wait for dialog to complete
            return false; // Will be completed when dialog ends
        }
        return true;
    }

    executeEffectAction(cutscene) {
        const { effectType, config } = this.config;
        switch (effectType) {
            case 'particle':
                if (cutscene.particleSystem) {
                    cutscene.createParticleEffect(config);
                }
                break;
            case 'screenShake':
                if (cutscene.visualEffects) {
                    cutscene.visualEffects.screenShake(
                        config.intensity || 10,
                        config.duration || 300
                    );
                }
                break;
            case 'fade':
                cutscene.fade(config.direction || 'in', config.duration || 1000);
                break;
        }
        return true;
    }

    executeSoundAction(cutscene) {
        const { soundId, action = 'play', options = {} } = this.config;
        if (!cutscene.audioManager) return true;

        switch (action) {
            case 'play':
                cutscene.audioManager.playSound(soundId, options);
                break;
            case 'stop':
                cutscene.audioManager.stopSound(soundId);
                break;
            case 'music':
                if (options.fadeOut) {
                    cutscene.audioManager.stopMusic(options.fadeOut);
                }
                if (options.musicId) {
                    cutscene.audioManager.playMusic(options.musicId, options);
                }
                break;
        }
        return true;
    }

    executeWaitAction(cutscene) {
        // Wait action completes after duration
        return this.startTime + this.duration <= cutscene.timeline.currentTime;
    }

    executeConditionalAction(cutscene) {
        const { condition, trueActions, falseActions } = this.config;
        const result = cutscene.evaluateCondition(condition);

        const actions = result ? trueActions : falseActions;
        if (actions) {
            // Add conditional actions to timeline
            actions.forEach(actionConfig => {
                const action = new CutsceneAction(actionConfig.type, {
                    ...actionConfig,
                    startTime: cutscene.timeline.currentTime
                });
                cutscene.timeline.add(action, action.startTime);
            });
        }
        return true;
    }

    update(cutscene, deltaTime) {
        // Called every frame for ongoing actions
    }

    isComplete() {
        return this.completed;
    }
}

class CutsceneScene extends Scene {
    constructor(name, engine) {
        super(name, engine);

        // Cutscene-specific properties
        this.script = null;
        this.timeline = new Timeline();
        this.characters = new Map();
        this.cutsceneId = null;
        this.isPlaying = false;
        this.canSkip = true;
        this.isSkipped = false;

        // Integration with engine systems
        this.animationManager = engine.animationManager;
        this.particleSystem = engine.particleSystem;
        this.audioManager = engine.audioManager;
        this.dialogManager = engine.dialogManager;
        this.visualEffects = engine.visualEffects;

        // UI for cutscene controls
        this.skipButton = null;
        this.loadingIndicator = null;

        // Save/load state
        this.saveState = null;

        // Event callbacks
        this.onComplete = null;
        this.onSkipped = null;
    }

    init() {
        super.init();
        this.setupCutsceneUI();
        console.log(`Cutscene Scene ${this.name} initialized`);
    }

    setupCutsceneUI() {
        // Create skip button (simple implementation)
        this.skipButton = {
            visible: false,
            text: 'Skip Cutscene',
            x: this.engine.canvas.width - 150,
            y: this.engine.canvas.height - 50,
            width: 140,
            height: 40,
            clicked: false,
            render: (ctx) => {
                if (!this.skipButton.visible) return;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(this.skipButton.x, this.skipButton.y, this.skipButton.width, this.skipButton.height);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.skipButton.x, this.skipButton.y, this.skipButton.width, this.skipButton.height);

                ctx.fillStyle = '#ffffff';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    this.skipButton.text,
                    this.skipButton.x + this.skipButton.width / 2,
                    this.skipButton.y + this.skipButton.height / 2
                );
            },
            isClicked: (x, y) => {
                return x >= this.skipButton.x && x <= this.skipButton.x + this.skipButton.width &&
                       y >= this.skipButton.y && y <= this.skipButton.y + this.skipButton.height;
            }
        };
    }

    loadCutscene(cutsceneId) {
        this.cutsceneId = cutsceneId;
        // Load cutscene data (would typically come from a database or file)
        this.script = this.getCutsceneScript(cutsceneId);

        if (!this.script) {
            console.error(`Cutscene ${cutsceneId} not found`);
            return false;
        }

        // Initialize timeline with actions
        this.initializeTimeline();

        // Load characters
        this.loadCharacters();

        return true;
    }

    getCutsceneScript(cutsceneId) {
        // Placeholder - would load from data file
        // Example script structure
        return {
            id: cutsceneId,
            duration: 10000, // 10 seconds
            actions: [
                {
                    type: 'camera',
                    startTime: 0,
                    config: { position: { x: 400, y: 300 }, smooth: true }
                },
                {
                    type: 'character',
                    startTime: 1000,
                    config: {
                        characterId: 'hero',
                        action: 'move',
                        position: { x: 300, y: 200 }
                    }
                },
                {
                    type: 'dialog',
                    startTime: 2000,
                    config: { dialogId: 'intro_dialog' }
                },
                {
                    type: 'sound',
                    startTime: 3000,
                    config: {
                        action: 'music',
                        options: { musicId: 'dramatic_theme', fadeIn: 2000 }
                    }
                },
                {
                    type: 'effect',
                    startTime: 5000,
                    config: {
                        effectType: 'screenShake',
                        config: { intensity: 15, duration: 500 }
                    }
                }
            ]
        };
    }

    initializeTimeline() {
        this.timeline = new Timeline({ duration: this.script.duration });

        // Add actions to timeline
        this.script.actions.forEach(actionConfig => {
            const action = new CutsceneAction(actionConfig.type, actionConfig);
            this.timeline.add(action, actionConfig.startTime);
        });

        // Setup timeline events
        this.timeline.onComplete = () => this.onCutsceneComplete();
    }

    loadCharacters() {
        // Load characters referenced in the cutscene
        // This would typically get characters from the party or NPC system
        this.script.actions.forEach(action => {
            if (action.type === 'character' && action.config.characterId) {
                const characterId = action.config.characterId;
                if (!this.characters.has(characterId)) {
                    // Create or load character object
                    const character = this.createCutsceneCharacter(characterId);
                    this.characters.set(characterId, character);
                    this.addGameObject(character);
                }
            }
        });
    }

    createCutsceneCharacter(characterId) {
        // Create a simple character object for cutscenes
        return {
            id: characterId,
            position: { x: 0, y: 0 },
            visible: false,
            sprite: null, // Would load actual sprite
            render: function(ctx) {
                if (!this.visible) return;
                ctx.fillStyle = '#ff0000'; // Placeholder
                ctx.fillRect(this.position.x - 16, this.position.y - 16, 32, 32);
            },
            update: function(deltaTime) {
                // Character update logic
            }
        };
    }

    play() {
        if (!this.script) {
            console.error('No cutscene script loaded');
            return;
        }

        this.isPlaying = true;
        this.isSkipped = false;
        this.skipButton.visible = this.canSkip;
        this.saveState = this.captureSaveState();

        this.timeline.play();
        console.log(`Playing cutscene: ${this.cutsceneId}`);
    }

    pause() {
        this.timeline.pause();
        this.isPlaying = false;
    }

    resume() {
        this.timeline.play();
        this.isPlaying = true;
    }

    skip() {
        if (!this.canSkip) return;

        this.isSkipped = true;
        this.onCutsceneSkipped();
    }

    stop() {
        this.timeline.stop();
        this.isPlaying = false;
        this.skipButton.visible = false;
    }

    update(deltaTime) {
        if (!this.isActive) return;

        super.update(deltaTime);

        if (this.isPlaying) {
            this.timeline.update(deltaTime * 1000); // Timeline expects milliseconds

            // Update characters
            this.characters.forEach(character => {
                if (character.update) {
                    character.update(deltaTime);
                }
            });
        }

        // Handle input
        if (this.engine.inputManager) {
            const input = this.engine.inputManager;

            // Skip button click
            if (input.isMousePressed()) {
                const mousePos = input.getMousePosition();
                if (this.skipButton.isClicked(mousePos.x, mousePos.y)) {
                    this.skip();
                }
            }

            // Skip with Escape key
            if (input.isKeyPressed('Escape') && this.canSkip) {
                this.skip();
            }
        }
    }

    render(ctx) {
        if (!this.isActive) return;

        super.render(ctx);

        // Render cutscene-specific UI
        if (this.skipButton) {
            this.skipButton.render(ctx);
        }

        // Render loading indicator if needed
        // (implementation omitted for brevity)
    }

    // Character management
    findCharacter(characterId) {
        return this.characters.get(characterId);
    }

    moveCharacter(character, targetPosition) {
        if (!character || !targetPosition) return;

        // Simple movement animation
        const startPos = { ...character.position };
        const distance = Math.sqrt(
            Math.pow(targetPos.x - startPos.x, 2) +
            Math.pow(targetPos.y - startPos.y, 2)
        );
        const duration = distance / 100; // Speed-based duration

        if (this.animationManager) {
            this.animationManager.to(
                character.position,
                { x: targetPosition.x, y: targetPosition.y },
                duration * 1000,
                {
                    onUpdate: () => {
                        character.position.x = character.position.x;
                        character.position.y = character.position.y;
                    }
                }
            );
        } else {
            // Fallback: instant movement
            character.position.x = targetPosition.x;
            character.position.y = targetPosition.y;
        }
    }

    // Effect creation
    createParticleEffect(config) {
        if (!this.particleSystem) return;

        const { type, x, y, options = {} } = config;
        switch (type) {
            case 'explosion':
                this.particleSystem.createExplosion(x, y, options);
                break;
            case 'rainbow':
                this.particleSystem.createRainbowBurst(x, y, options);
                break;
            case 'floatingText':
                this.particleSystem.createFloatingText(x, y, options.text, options);
                break;
            default:
                this.particleSystem.addParticle(x, y, options);
        }
    }

    // Visual effects
    fade(direction, duration = 1000) {
        if (!this.visualEffects) return;

        if (direction === 'in') {
            this.visualEffects.fadeIn({ alpha: 1 }, duration);
        } else if (direction === 'out') {
            this.visualEffects.fadeOut({ alpha: 0 }, duration);
        }
    }

    // Condition evaluation
    evaluateCondition(condition) {
        // Simple condition evaluation (can be expanded)
        if (typeof condition === 'function') {
            return condition(this);
        }

        if (typeof condition === 'string') {
            // Check for simple flag conditions
            if (condition.startsWith('flag.')) {
                const flag = condition.substring(5);
                return this.engine.getGlobalFlag ? this.engine.getGlobalFlag(flag) : false;
            }
        }

        return Boolean(condition);
    }

    // Save/Load functionality
    captureSaveState() {
        return {
            cutsceneId: this.cutsceneId,
            timelineTime: this.timeline.currentTime,
            cameraPosition: { ...this.camera },
            characterStates: Array.from(this.characters.entries()).map(([id, char]) => ({
                id,
                position: { ...char.position },
                visible: char.visible
            }))
        };
    }

    restoreSaveState(saveState) {
        if (!saveState) return;

        this.timeline.seek(saveState.timelineTime);
        this.camera = { ...saveState.cameraPosition };

        saveState.characterStates.forEach(charState => {
            const character = this.characters.get(charState.id);
            if (character) {
                character.position = { ...charState.position };
                character.visible = charState.visible;
            }
        });
    }

    // Event handlers
    onCutsceneComplete() {
        this.isPlaying = false;
        this.skipButton.visible = false;

        if (this.onComplete) {
            this.onComplete();
        }

        // Transition to next scene or return to previous
        this.engine.sceneManager.popScene();
    }

    onCutsceneSkipped() {
        this.isPlaying = false;
        this.skipButton.visible = false;

        // Fast-forward to end
        this.timeline.seek(this.script.duration);
        this.onCutsceneComplete();

        if (this.onSkipped) {
            this.onSkipped();
        }
    }

    // Triggering system
    static triggerCutscene(engine, cutsceneId, options = {}) {
        const cutsceneScene = new CutsceneScene(`cutscene_${cutsceneId}`, engine);

        if (!cutsceneScene.loadCutscene(cutsceneId)) {
            return false;
        }

        // Apply options
        if (options.canSkip !== undefined) {
            cutsceneScene.canSkip = options.canSkip;
        }
        if (options.onComplete) {
            cutsceneScene.onComplete = options.onComplete;
        }
        if (options.onSkipped) {
            cutsceneScene.onSkipped = options.onSkipped;
        }

        // Push cutscene scene onto scene stack
        engine.sceneManager.pushScene(cutsceneScene);
        cutsceneScene.play();

        return true;
    }

    destroy() {
        this.stop();
        this.characters.clear();
        super.destroy();
    }
}

export { CutsceneScene, CutsceneAction };