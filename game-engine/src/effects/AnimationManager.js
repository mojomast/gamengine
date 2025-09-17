/**
 * Animation Framework
 * Provides tweening, keyframe animations, and visual effects
 */

import { ParticleSystem } from './ParticleSystem.js';
import { TweenPool } from '../core/ObjectPool.js';

class Tween {
    constructor(target, properties, duration, options = {}) {
        this.target = target;
        this.properties = properties;
        this.duration = duration;
        this.elapsed = 0;
        this.completed = false;
        this.started = false;
        
        this.easing = options.easing || Tween.Easing.linear;
        this.delay = options.delay || 0;
        this.repeat = options.repeat || 0;
        this.yoyo = options.yoyo || false;
        this.onStart = options.onStart;
        this.onUpdate = options.onUpdate;
        this.onComplete = options.onComplete;
        
        this.startValues = {};
        this.endValues = {};
        this.currentRepeat = 0;
        this.isReversed = false;
        
        this.parseProperties();
    }

    parseProperties() {
        this.propertyAccessors = {};
        for (const prop in this.properties) {
            const accessor = Tween.createPropertyAccessor(this.target, prop);
            this.startValues[prop] = accessor.get();
            this.endValues[prop] = this.properties[prop];
            this.propertyAccessors[prop] = accessor;
        }
    }

    update(deltaTime) {
        if (this.completed) return false;

        this.elapsed += deltaTime * 1000;

        // Handle delay
        if (this.elapsed < this.delay) return true;

        const adjustedElapsed = this.elapsed - this.delay;

        // Start callback
        if (!this.started) {
            this.started = true;
            if (this.onStart) this.onStart(this.target);
        }

        // Calculate progress
        let progress = Math.min(adjustedElapsed / this.duration, 1);
        
        if (this.isReversed) {
            progress = 1 - progress;
        }

        const easedProgress = this.easing(progress);

        // Update properties using cached accessors
        for (const prop in this.properties) {
            const start = this.isReversed ? this.endValues[prop] : this.startValues[prop];
            const end = this.isReversed ? this.startValues[prop] : this.endValues[prop];
            const current = start + (end - start) * easedProgress;
            this.propertyAccessors[prop].set(current);
        }

        // Update callback
        if (this.onUpdate) this.onUpdate(this.target, easedProgress);

        // Check completion
        if (adjustedElapsed >= this.duration) {
            if (this.yoyo && !this.isReversed) {
                // Start yoyo
                this.isReversed = true;
                this.elapsed = this.delay;
                return true;
            }

            if (this.repeat > 0 && this.currentRepeat < this.repeat) {
                // Repeat animation
                this.currentRepeat++;
                this.elapsed = this.delay;
                this.isReversed = false;
                this.started = false;
                return true;
            }

            // Animation completed
            this.completed = true;
            if (this.onComplete) this.onComplete(this.target);
            return false;
        }

        return true;
    }

    stop() {
        this.completed = true;
    }

    reset() {
        this.elapsed = 0;
        this.completed = false;
        this.started = false;
        this.currentRepeat = 0;
        this.isReversed = false;
    }

    // Static easing functions
    static Easing = {
        linear: (t) => t,

        easeInQuad: (t) => t * t,
        easeOutQuad: (t) => t * (2 - t),
        easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

        easeInCubic: (t) => t * t * t,
        easeOutCubic: (t) => (--t) * t * t + 1,
        easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

        easeInQuart: (t) => t * t * t * t,
        easeOutQuart: (t) => 1 - (--t) * t * t * t,
        easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

        easeInElastic: (t) => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },

        easeOutElastic: (t) => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },

        easeInBounce: (t) => 1 - Tween.Easing.easeOutBounce(1 - t),

        easeOutBounce: (t) => {
            const n1 = 7.5625;
            const d1 = 2.75;

            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        },

        easeInOutBounce: (t) => t < 0.5
            ? (1 - Tween.Easing.easeOutBounce(1 - 2 * t)) / 2
            : (1 + Tween.Easing.easeOutBounce(2 * t - 1)) / 2
    };

    // Optimized property access using cached paths
    static createPropertyAccessor(target, propertyPath) {
        const path = propertyPath.split('.');
        if (path.length === 1) {
            // Direct property access
            return {
                get: () => target[propertyPath],
                set: (value) => target[propertyPath] = value
            };
        } else {
            // Nested property access with caching
            return {
                get: () => {
                    let current = target;
                    for (const key of path) {
                        if (current == null) return undefined;
                        current = current[key];
                    }
                    return current;
                },
                set: (value) => {
                    let current = target;
                    const lastKey = path[path.length - 1];
                    for (let i = 0; i < path.length - 1; i++) {
                        if (current[path[i]] == null) {
                            current[path[i]] = {};
                        }
                        current = current[path[i]];
                    }
                    current[lastKey] = value;
                }
            };
        }
    }

    // Static factory methods
    static fromTo(target, fromProperties, toProperties, duration, options = {}) {
        if (!target || typeof target !== 'object') {
            throw new Error('Tween.fromTo: target must be a valid object');
        }
        if (!fromProperties || typeof fromProperties !== 'object') {
            throw new Error('Tween.fromTo: fromProperties must be a valid object');
        }
        if (!toProperties || typeof toProperties !== 'object') {
            throw new Error('Tween.fromTo: toProperties must be a valid object');
        }
        if (typeof duration !== 'number' || duration <= 0) {
            throw new Error('Tween.fromTo: duration must be a positive number');
        }

        // Set initial values using optimized access
        for (const prop in fromProperties) {
            const accessor = Tween.createPropertyAccessor(target, prop);
            accessor.set(fromProperties[prop]);
        }

        return new Tween(target, toProperties, duration, options);
    }
}

class AnimationManager {
    constructor(engine) {
        this.engine = engine;
        this.tweens = [];
        this.keyframeAnimations = new Map();
        this.timelines = new Map();
        this.animationGroups = new Map();
        this.spriteAnimators = new Map();
        this.animatedParticleSystem = null;
        this.globalTimeScale = 1;

        // Object pooling for performance
        this.tweenPool = new TweenPool();
    }

    update(deltaTime) {
        const scaledDelta = deltaTime * this.globalTimeScale;

        // Update tweens and collect completed ones
        const completedTweens = [];
        this.tweens.forEach(tween => {
            if (!tween.update(scaledDelta)) {
                completedTweens.push(tween);
            }
        });

        // Remove and release completed tweens
        completedTweens.forEach(tween => {
            const index = this.tweens.indexOf(tween);
            if (index > -1) {
                this.tweens.splice(index, 1);
                this.tweenPool.release(tween);
            }
        });

        // Update keyframe animations
        this.keyframeAnimations.forEach((animation, id) => {
            if (!animation.update(scaledDelta)) {
                this.keyframeAnimations.delete(id);
            }
        });

        // Update timelines
        this.timelines.forEach((timeline, id) => {
            timeline.update(scaledDelta);
        });

        // Update sprite animators
        this.spriteAnimators.forEach((animator, id) => {
            animator.update(scaledDelta);
        });

        // Update animation groups
        this.animationGroups.forEach((group, id) => {
            group.update(scaledDelta);
        });

        // Update animated particle system
        if (this.animatedParticleSystem) {
            this.animatedParticleSystem.update(scaledDelta);
        }
    }

    // Tween creation methods
    to(target, properties, duration, options = {}) {
        if (!target || typeof target !== 'object') {
            throw new Error('AnimationManager.to: target must be a valid object');
        }
        if (!properties || typeof properties !== 'object') {
            throw new Error('AnimationManager.to: properties must be a valid object');
        }
        if (typeof duration !== 'number' || duration <= 0) {
            throw new Error('AnimationManager.to: duration must be a positive number');
        }

        try {
            const tween = this.tweenPool.get(target, properties, duration, options);
            this.tweens.push(tween);
            return tween;
        } catch (error) {
            console.error('Failed to create tween:', error);
            throw error;
        }
    }

    from(target, properties, duration, options = {}) {
        // Set target to end values, tween to start values
        const endValues = {};
        for (const prop in properties) {
            endValues[prop] = this.getNestedProperty(target, prop);
            this.setNestedProperty(target, prop, properties[prop]);
        }
        
        const tween = new Tween(target, endValues, duration, options);
        this.tweens.push(tween);
        return tween;
    }

    fromTo(target, fromProperties, toProperties, duration, options = {}) {
        // Set initial values using optimized access
        for (const prop in fromProperties) {
            const accessor = Tween.createPropertyAccessor(target, prop);
            accessor.set(fromProperties[prop]);
        }

        const tween = this.tweenPool.get(target, toProperties, duration, options);
        this.tweens.push(tween);
        return tween;
    }

    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => current && current[key], obj);
        if (target) {
            target[lastKey] = value;
        }
    }

    // Common animation patterns inspired by the games
    fadeIn(target, duration = 500, options = {}) {
        const initialAlpha = target.alpha || 0;
        target.alpha = 0;
        return this.to(target, { alpha: options.targetAlpha || 1 }, duration, options);
    }

    fadeOut(target, duration = 500, options = {}) {
        return this.to(target, { alpha: 0 }, duration, options);
    }

    slideIn(target, direction = 'left', distance = 100, duration = 500, options = {}) {
        const prop = direction === 'left' || direction === 'right' ? 'position.x' : 'position.y';
        const multiplier = direction === 'left' || direction === 'up' ? -1 : 1;
        
        const startValue = this.getNestedProperty(target, prop);
        this.setNestedProperty(target, prop, startValue + distance * multiplier);
        
        return this.to(target, { [prop]: startValue }, duration, options);
    }

    slideOut(target, direction = 'right', distance = 100, duration = 500, options = {}) {
        const prop = direction === 'left' || direction === 'right' ? 'position.x' : 'position.y';
        const multiplier = direction === 'left' || direction === 'up' ? -1 : 1;
        
        const currentValue = this.getNestedProperty(target, prop);
        return this.to(target, { [prop]: currentValue + distance * multiplier }, duration, options);
    }

    scale(target, fromScale = 0, toScale = 1, duration = 500, options = {}) {
        target.scale = { x: fromScale, y: fromScale };
        return this.to(target, { 'scale.x': toScale, 'scale.y': toScale }, duration, options);
    }

    pulse(target, minScale = 0.8, maxScale = 1.2, duration = 500, options = {}) {
        const pulseOptions = {
            ...options,
            repeat: options.repeat !== undefined ? options.repeat : -1, // Infinite by default
            yoyo: true,
            easing: Tween.Easing.easeInOutQuad
        };
        
        return this.to(target, { 'scale.x': maxScale, 'scale.y': maxScale }, duration, pulseOptions);
    }

    shake(target, intensity = 5, duration = 200, options = {}) {
        const originalX = target.position.x;
        const originalY = target.position.y;
        
        const shakeSequence = [];
        const steps = 10;
        
        for (let i = 0; i < steps; i++) {
            const progress = i / (steps - 1);
            const factor = 1 - progress; // Decrease intensity over time
            
            shakeSequence.push({
                'position.x': originalX + (Math.random() - 0.5) * intensity * factor,
                'position.y': originalY + (Math.random() - 0.5) * intensity * factor,
                duration: duration / steps
            });
        }
        
        // Final position back to original
        shakeSequence.push({
            'position.x': originalX,
            'position.y': originalY,
            duration: duration / steps
        });
        
        return this.sequence(target, shakeSequence, options);
    }

    bounce(target, height = 50, duration = 800, options = {}) {
        const originalY = target.position.y;
        
        return this.to(target, { 'position.y': originalY - height }, duration / 2, {
            easing: Tween.Easing.easeOutQuad,
            onComplete: () => {
                this.to(target, { 'position.y': originalY }, duration / 2, {
                    easing: Tween.Easing.easeInQuad,
                    ...options
                });
            }
        });
    }

    // Sequence animations
    sequence(target, animations, options = {}) {
        if (!target || typeof target !== 'object') {
            throw new Error('AnimationManager.sequence: target must be a valid object');
        }
        if (!Array.isArray(animations) || animations.length === 0) {
            throw new Error('AnimationManager.sequence: animations must be a non-empty array');
        }

        let currentAnimation = 0;

        const playNext = () => {
            if (currentAnimation >= animations.length) {
                if (options.onComplete) options.onComplete(target);
                return;
            }

            const anim = animations[currentAnimation];
            currentAnimation++;

            try {
                this.to(target, anim, anim.duration || 500, {
                    easing: anim.easing,
                    onComplete: playNext
                });
            } catch (error) {
                console.error(`Failed to play sequence animation at index ${currentAnimation - 1}:`, error);
                if (options.onError) options.onError(error);
            }
        };

        playNext();
    }

    // Kill all animations for a target
    killTweensOf(target) {
        const remainingTweens = [];
        this.tweens.forEach(tween => {
            if (tween.target === target) {
                tween.stop();
                this.tweenPool.release(tween);
            } else {
                remainingTweens.push(tween);
            }
        });
        this.tweens = remainingTweens;
    }

    // Kill all animations
    killAll() {
        // Release all tweens back to pool
        this.tweens.forEach(tween => {
            tween.stop();
            this.tweenPool.release(tween);
        });
        this.tweens = [];
        this.keyframeAnimations.clear();
        this.timelines.clear();
        this.animationGroups.clear();
        this.spriteAnimators.clear();
        if (this.animatedParticleSystem) {
            this.animatedParticleSystem.clear();
        }
    }

    // Create and manage sprite animator
    createSpriteAnimator(sprite, id) {
        const animatorId = id || 'sprite_' + Math.random().toString(36).substr(2, 9);
        const animator = new SpriteAnimator(sprite);
        this.spriteAnimators.set(animatorId, animator);
        return animator;
    }

    getSpriteAnimator(id) {
        return this.spriteAnimators.get(id);
    }

    removeSpriteAnimator(id) {
        this.spriteAnimators.delete(id);
    }

    // Create and manage timelines
    createTimeline(config = {}) {
        const timeline = new Timeline(config);
        this.timelines.set(timeline.id, timeline);
        return timeline;
    }

    getTimeline(id) {
        return this.timelines.get(id);
    }

    removeTimeline(id) {
        this.timelines.delete(id);
    }

    // Create and manage animation groups
    createAnimationGroup(id, config = {}) {
        const group = new AnimationGroup(id, config);
        this.animationGroups.set(id, group);
        return group;
    }

    getAnimationGroup(id) {
        return this.animationGroups.get(id);
    }

    removeAnimationGroup(id) {
        this.animationGroups.delete(id);
    }

    // Create animated particle system
    createAnimatedParticleSystem() {
        this.animatedParticleSystem = new AnimatedParticleSystem(this.engine);
        return this.animatedParticleSystem;
    }

    // Create and manage keyframe animations
    createKeyframeAnimation(id, config = {}) {
        if (!id) {
            throw new Error('AnimationManager.createKeyframeAnimation: id is required');
        }
        if (this.keyframeAnimations.has(id)) {
            console.warn(`Keyframe animation '${id}' already exists, replacing`);
        }

        try {
            const animation = new Animation({ id, ...config });
            this.keyframeAnimations.set(id, animation);
            return animation;
        } catch (error) {
            console.error(`Failed to create keyframe animation '${id}':`, error);
            throw error;
        }
    }

    getKeyframeAnimation(id) {
        return this.keyframeAnimations.get(id);
    }

    removeKeyframeAnimation(id) {
        const animation = this.keyframeAnimations.get(id);
        if (animation && animation.stop) {
            animation.stop();
        }
        return this.keyframeAnimations.delete(id);
    }

    // Get active animation count
    getActiveCount() {
        return this.tweens.length +
                this.keyframeAnimations.size +
                this.timelines.size +
                this.animationGroups.size +
                this.spriteAnimators.size;
    }

    // Set global time scale (for slow motion, fast forward effects)
    setTimeScale(scale) {
        this.globalTimeScale = Math.max(0, scale);
    }

    getTimeScale() {
        return this.globalTimeScale;
    }

    // Performance optimization methods
    pauseAll() {
        this.tweens.forEach(tween => tween.pause && tween.pause());
        this.keyframeAnimations.forEach(anim => anim.pause && anim.pause());
        this.timelines.forEach(timeline => timeline.pause && timeline.pause());
        this.animationGroups.forEach(group => group.pause && group.pause());
        this.spriteAnimators.forEach(animator => animator.pause && animator.pause());
    }

    resumeAll() {
        this.tweens.forEach(tween => tween.resume && tween.resume());
        this.keyframeAnimations.forEach(anim => anim.resume && anim.resume());
        this.timelines.forEach(timeline => timeline.resume && timeline.resume());
        this.animationGroups.forEach(group => group.resume && group.resume());
        this.spriteAnimators.forEach(animator => animator.resume && animator.resume());
    }

    // Cull off-screen animations for performance
    cullOffScreen(bounds) {
        if (!bounds) return;

        // Remove tweens for objects outside bounds
        this.tweens = this.tweens.filter(tween => {
            if (tween.target && tween.target.position) {
                const pos = tween.target.position;
                if (pos.x < bounds.left || pos.x > bounds.right ||
                    pos.y < bounds.top || pos.y > bounds.bottom) {
                    tween.stop();
                    return false;
                }
            }
            return true;
        });

        // Similar for other animation types...
        // This could be extended for each animation type
    }

    // Batch update for performance (reduce function calls)
    batchUpdate(deltaTime, batchSize = 10) {
        const scaledDelta = deltaTime * this.globalTimeScale;

        // Update tweens in batches
        for (let i = 0; i < this.tweens.length; i += batchSize) {
            const batch = this.tweens.slice(i, i + batchSize);
            batch.forEach(tween => tween.update(scaledDelta));
        }
        this.tweens = this.tweens.filter(tween => !tween.completed);

        // Update other animations normally
        this.keyframeAnimations.forEach((animation, id) => {
            if (!animation.update(scaledDelta)) {
                this.keyframeAnimations.delete(id);
            }
        });

        this.timelines.forEach((timeline, id) => {
            timeline.update(scaledDelta);
        });

        this.spriteAnimators.forEach((animator, id) => {
            animator.update(scaledDelta);
        });

        this.animationGroups.forEach((group, id) => {
            group.update(scaledDelta);
        });

        if (this.animatedParticleSystem) {
            this.animatedParticleSystem.update(scaledDelta);
        }
    }
}

// Sprite animation system for sprite sheet animations
class SpriteAnimator {
    constructor(sprite) {
        this.sprite = sprite;
        this.animations = new Map();
        this.currentAnimation = null;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.playing = false;
        this.looping = false;
        this.speed = 1.0;

        // Animation blending
        this.blendMode = 'replace'; // 'replace', 'additive', 'multiply'
        this.blendDuration = 200; // ms
        this.previousAnimation = null;
        this.blendProgress = 0;
    }

    addAnimation(name, frames, frameRate = 12, looping = true) {
        this.animations.set(name, {
            name,
            frames,
            frameRate,
            looping,
            duration: (frames.length / frameRate) * 1000
        });
    }

    playAnimation(name, options = {}) {
        if (typeof name !== 'string' || !name) {
            throw new Error('SpriteAnimator.playAnimation: name must be a non-empty string');
        }

        const animation = this.animations.get(name);
        if (!animation) {
            console.warn(`Sprite animation '${name}' not found`);
            return;
        }

        try {
            // Handle animation blending
            if (this.currentAnimation && options.blend) {
                this.previousAnimation = { ...this.currentAnimation };
                this.blendProgress = 0;
            }

            this.currentAnimation = animation;
            this.currentFrame = options.startFrame || 0;
            this.frameTime = 0;
            this.playing = true;
            this.looping = options.looping !== undefined ? options.looping : animation.looping;
            this.speed = options.speed || 1.0;

            // Update sprite frame immediately
            this.updateSpriteFrame();
        } catch (error) {
            console.error(`Failed to play sprite animation '${name}':`, error);
            throw error;
        }
    }

    update(deltaTime) {
        if (!this.playing || !this.currentAnimation) return;

        this.frameTime += deltaTime * 1000 * this.speed;

        const frameInterval = 1000 / this.currentAnimation.frameRate;

        if (this.frameTime >= frameInterval) {
            this.frameTime -= frameInterval;
            this.currentFrame++;

            // Handle animation end
            if (this.currentFrame >= this.currentAnimation.frames.length) {
                if (this.looping) {
                    this.currentFrame = 0;
                    if (this.onLoop) this.onLoop(this.currentAnimation);
                } else {
                    this.currentFrame = this.currentAnimation.frames.length - 1;
                    this.playing = false;
                    if (this.onComplete) this.onComplete(this.currentAnimation);
                }
            }

            this.updateSpriteFrame();
        }

        // Update blending
        if (this.previousAnimation) {
            this.blendProgress += deltaTime * 1000;
            if (this.blendProgress >= this.blendDuration) {
                this.previousAnimation = null;
                this.blendProgress = 0;
            }
        }
    }

    updateSpriteFrame() {
        if (!this.currentAnimation) return;

        const frame = this.currentAnimation.frames[this.currentFrame];
        if (frame) {
            // Update sprite's source rectangle
            if (this.sprite.sourceX !== undefined) this.sprite.sourceX = frame.x || 0;
            if (this.sprite.sourceY !== undefined) this.sprite.sourceY = frame.y || 0;
            if (this.sprite.sourceWidth !== undefined) this.sprite.sourceWidth = frame.width || this.sprite.width;
            if (this.sprite.sourceHeight !== undefined) this.sprite.sourceHeight = frame.height || this.sprite.height;

            // Handle frame events
            if (frame.events) {
                frame.events.forEach(event => {
                    if (this.emit) this.emit(event.type, event.data);
                });
            }
        }
    }

    stop() {
        this.playing = false;
        this.currentFrame = 0;
        this.frameTime = 0;
    }

    pause() {
        this.playing = false;
    }

    resume() {
        this.playing = true;
    }

    // Predefined animation types
    static createWalkCycle(spriteSheet, frameWidth, frameHeight, frameCount) {
        const frames = [];
        for (let i = 0; i < frameCount; i++) {
            frames.push({
                x: i * frameWidth,
                y: 0,
                width: frameWidth,
                height: frameHeight
            });
        }
        return { frames, frameRate: 8, looping: true };
    }

    static createAttackAnimation(spriteSheet, frameWidth, frameHeight, frameCount) {
        const frames = [];
        for (let i = 0; i < frameCount; i++) {
            frames.push({
                x: i * frameWidth,
                y: frameHeight, // Second row
                width: frameWidth,
                height: frameHeight,
                events: i === Math.floor(frameCount / 2) ? [{ type: 'attack-hit' }] : []
            });
        }
        return { frames, frameRate: 12, looping: false };
    }
}

// Timeline for complex animation sequences with parallel tracks and keyframe support
class Timeline {
    constructor(config = {}) {
        this.id = config.id || this.generateId();
        this.duration = config.duration || 0; // Auto-calculated if 0
        this.timeScale = config.timeScale || 1.0;
        this.currentTime = 0;
        this.playing = false;
        this.looping = config.looping || false;
        this.paused = false;

        // Timeline entries
        this.entries = [];
        this.markers = new Map();

        // Events
        this.onComplete = null;
        this.onLoop = null;

        // Auto-calculate duration if not provided
        if (this.duration === 0) {
            this.calculateDuration();
        }
    }

    generateId() {
        return 'timeline_' + Math.random().toString(36).substr(2, 9);
    }

    // Add animation at specific time
    add(animation, startTime = 0, options = {}) {
        if (!animation) {
            throw new Error('Timeline.add: animation is required');
        }
        if (typeof startTime !== 'number' || startTime < 0) {
            throw new Error('Timeline.add: startTime must be a non-negative number');
        }

        try {
            const entry = {
                id: this.generateEntryId(),
                animation,
                startTime,
                duration: options.duration || animation.duration,
                timeScale: options.timeScale || 1.0,
                offset: options.offset || 0,
                active: false,
                completed: false
            };

            this.entries.push(entry);
            this.entries.sort((a, b) => a.startTime - b.startTime);

            // Update timeline duration
            this.calculateDuration();

            return this;
        } catch (error) {
            console.error('Failed to add animation to timeline:', error);
            throw error;
        }
    }

    generateEntryId() {
        return 'entry_' + Math.random().toString(36).substr(2, 9);
    }

    // Add marker for seeking
    addMarker(name, time) {
        this.markers.set(name, time);
        return this;
    }

    // Seek to specific time or marker
    seek(timeOrMarker) {
        let targetTime;

        if (typeof timeOrMarker === 'string') {
            targetTime = this.markers.get(timeOrMarker);
            if (targetTime === undefined) {
                console.warn(`Timeline marker '${timeOrMarker}' not found`);
                return this;
            }
        } else {
            targetTime = timeOrMarker;
        }

        this.currentTime = Math.max(0, Math.min(targetTime, this.duration));

        // Update all entries based on new time
        this.updateEntries(0);

        return this;
    }

    play() {
        this.playing = true;
        this.paused = false;
        return this;
    }

    pause() {
        this.paused = true;
        return this;
    }

    stop() {
        this.playing = false;
        this.paused = false;
        this.currentTime = 0;

        // Reset all entries
        this.entries.forEach(entry => {
            entry.active = false;
            entry.completed = false;
        });

        return this;
    }

    update(deltaTime) {
        if (!this.playing || this.paused) return;

        const scaledDelta = deltaTime * this.timeScale;
        this.currentTime += scaledDelta * 1000;

        // Check for completion
        if (this.currentTime >= this.duration) {
            if (this.looping) {
                this.currentTime = 0;
                this.resetEntries();
                if (this.onLoop) this.onLoop();
            } else {
                this.currentTime = this.duration;
                this.playing = false;
                if (this.onComplete) this.onComplete();
            }
        }

        this.updateEntries(scaledDelta);
    }

    updateEntries(deltaTime) {
        this.entries.forEach(entry => {
            const entryStart = entry.startTime;
            const entryEnd = entry.startTime + entry.duration;

            // Check if entry should be active
            if (this.currentTime >= entryStart && this.currentTime < entryEnd && !entry.completed) {
                if (!entry.active) {
                    entry.active = true;
                }

                // Update entry animation
                const entryProgress = (this.currentTime - entryStart) / entry.duration;
                this.updateEntryAnimation(entry, entryProgress, deltaTime);

            } else if (entry.active && this.currentTime >= entryEnd) {
                // Entry completed
                entry.active = false;
                entry.completed = true;
            }
        });
    }

    updateEntryAnimation(entry, progress, deltaTime) {
        if (entry.animation.update) {
            entry.animation.update(deltaTime * entry.timeScale);
        } else if (entry.animation.setValue) {
            // Handle keyframe animations
            entry.animation.setValue(progress);
        }
    }

    calculateDuration() {
        if (this.entries.length === 0) {
            this.duration = 0;
            return;
        }

        this.duration = Math.max(...this.entries.map(entry =>
            entry.startTime + entry.duration
        ));
    }

    resetEntries() {
        this.entries.forEach(entry => {
            entry.active = false;
            entry.completed = false;
        });
    }

    // Fluent API
    to(target, properties, duration, startTime = null) {
        if (startTime === null) {
            startTime = this.duration;
        }

        const tween = new Tween(target, properties, duration);
        this.add(tween, startTime);
        return this;
    }

    stagger(targets, properties, duration, staggerDelay = 100) {
        targets.forEach((target, index) => {
            const startTime = this.duration + (index * staggerDelay);
            const tween = new Tween(target, properties, duration);
            this.add(tween, startTime);
        });
        return this;
    }

    fromTo(target, fromProps, toProps, duration, startTime = null) {
        if (startTime === null) {
            startTime = this.duration;
        }

        const tween = Tween.fromTo(target, fromProps, toProps, duration);
        this.add(tween, startTime);
        return this;
    }
}

// Animation channel for handling keyframes and interpolation
class AnimationChannel {
    constructor(config) {
        this.property = config.property; // 'x', 'y', 'rotation', 'scaleX', etc.
        this.keyframes = config.keyframes || [];
        this.interpolation = config.interpolation || 'linear';
        this.target = config.target || 'transform'; // 'transform', 'color', 'sprite'

        this.sortKeyframes();
    }

    sortKeyframes() {
        this.keyframes.sort((a, b) => a.time - b.time);
    }

    getValue(time, duration) {
        if (this.keyframes.length === 0) return null;
        if (this.keyframes.length === 1) return this.keyframes[0].value;

        const normalizedTime = time / duration;

        // Find surrounding keyframes
        let startFrame = null;
        let endFrame = null;

        for (let i = 0; i < this.keyframes.length - 1; i++) {
            if (normalizedTime >= this.keyframes[i].time && normalizedTime <= this.keyframes[i + 1].time) {
                startFrame = this.keyframes[i];
                endFrame = this.keyframes[i + 1];
                break;
            }
        }

        if (!startFrame || !endFrame) {
            // Before first or after last keyframe
            if (normalizedTime <= this.keyframes[0].time) {
                return this.keyframes[0].value;
            } else {
                return this.keyframes[this.keyframes.length - 1].value;
            }
        }

        // Interpolate between keyframes
        const segmentProgress = (normalizedTime - startFrame.time) / (endFrame.time - startFrame.time);
        const easedProgress = Tween.Easing[endFrame.easing || 'linear'](segmentProgress);

        return this.interpolateValue(startFrame.value, endFrame.value, easedProgress);
    }

    interpolateValue(start, end, progress) {
        if (typeof start === 'number' && typeof end === 'number') {
            return start + (end - start) * progress;
        }

        if (Array.isArray(start) && Array.isArray(end)) {
            return start.map((startVal, index) =>
                startVal + (end[index] - startVal) * progress
            );
        }

        // Color interpolation
        if (this.isColor(start) && this.isColor(end)) {
            return this.interpolateColor(start, end, progress);
        }

        // String interpolation (for discrete values)
        return progress < 0.5 ? start : end;
    }

    isColor(value) {
        return typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'));
    }

    interpolateColor(start, end, progress) {
        const startRGB = this.parseColor(start);
        const endRGB = this.parseColor(end);

        const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * progress);
        const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * progress);
        const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * progress);
        const a = startRGB.a + (endRGB.a - startRGB.a) * progress;

        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    parseColor(color) {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return { r, g, b, a: 1 };
        } else if (color.startsWith('rgba')) {
            const matches = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
            return {
                r: parseInt(matches[1]),
                g: parseInt(matches[2]),
                b: parseInt(matches[3]),
                a: parseFloat(matches[4])
            };
        }
        return { r: 0, g: 0, b: 0, a: 1 };
    }
}

// Animation class for managing keyframes and channels
class Animation {
    constructor(config) {
        if (!config.id) {
            throw new Error('Animation: id is required');
        }

        this.id = config.id;
        this.name = config.name || config.id;
        this.duration = config.duration || 1000; // milliseconds
        this.looping = config.looping || false;
        this.channels = config.channels || []; // Array of animation channels
        this.easing = config.easing || 'linear';
        this.priority = config.priority || 0;

        // Target object to animate
        this.target = config.target;
        if (!this.target) {
            throw new Error('Animation: target is required');
        }

        // Sprite-specific
        this.frames = config.frames || [];
        this.frameRate = config.frameRate || 12; // frames per second
        this.spriteSheet = config.spriteSheet;

        // Transform animations
        this.keyframes = config.keyframes || {};

        // Events
        this.events = config.events || [];

        // Playback state
        this.currentTime = 0;
        this.playing = false;
        this.completed = false;

        this.validate();
    }

    validate() {
        if (this.frames.length > 0 && this.duration === 0) {
            this.duration = (this.frames.length / this.frameRate) * 1000;
        }

        if (this.keyframes && Object.keys(this.keyframes).length > 0) {
            this.generateChannelsFromKeyframes();
        }
    }

    generateChannelsFromKeyframes() {
        Object.keys(this.keyframes).forEach(property => {
            const keyframes = this.keyframes[property];

            const channel = new AnimationChannel({
                property,
                keyframes: keyframes.map(kf => ({
                    time: kf.time,
                    value: kf.value,
                    easing: kf.easing || this.easing
                }))
            });

            this.channels.push(channel);
        });
    }

    update(deltaTime) {
        if (!this.playing || this.completed) return false;

        this.currentTime += deltaTime * 1000;

        if (this.currentTime >= this.duration) {
            if (this.looping) {
                this.currentTime = 0;
                if (this.onLoop) this.onLoop(this);
            } else {
                this.currentTime = this.duration;
                this.playing = false;
                this.completed = true;
                if (this.onComplete) this.onComplete(this);
                return false;
            }
        }

        this.setValue(this.currentTime / this.duration);
        return true;
    }

    setValue(progress) {
        if (typeof progress !== 'number' || progress < 0 || progress > 1) {
            console.warn('Animation.setValue: progress must be a number between 0 and 1');
            return;
        }

        try {
            // Apply all channels at given progress
            this.channels.forEach(channel => {
                const value = channel.getValue(progress * this.duration, this.duration);
                if (value !== null) {
                    // Apply to target based on channel property
                    const manager = new Tween({}, {}, 0); // Use utility methods
                    manager.setNestedProperty(this.target, channel.property, value);
                }
            });
        } catch (error) {
            console.error(`Animation.setValue failed for animation '${this.id}':`, error);
        }
    }

    play() {
        this.playing = true;
        this.completed = false;
        this.currentTime = 0;
        return this;
    }

    pause() {
        this.playing = false;
        return this;
    }

    stop() {
        this.playing = false;
        this.currentTime = 0;
        this.completed = false;
        return this;
    }

    seek(time) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        if (this.playing || this.completed) {
            this.setValue(this.currentTime / this.duration);
        }
        return this;
    }

    isComplete() {
        return this.completed;
    }
}

// Animation group for managing related animations
class AnimationGroup {
    constructor(id, config = {}) {
        this.id = id;
        this.animations = new Map();
        this.playing = false;
        this.paused = false;
        this.looping = config.looping || false;
        this.timeScale = config.timeScale || 1.0;

        // Group control
        this.onComplete = null;
        this.onLoop = null;
    }

    addAnimation(name, animation, options = {}) {
        this.animations.set(name, {
            animation,
            startDelay: options.startDelay || 0,
            playCount: 0,
            completed: false,
            active: false
        });
        return this;
    }

    play(options = {}) {
        this.playing = true;
        this.paused = false;

        // Reset all animations
        this.animations.forEach((animData, name) => {
            animData.playCount = 0;
            animData.completed = false;
            animData.active = false;
        });

        // Start animations with delays
        this.animations.forEach((animData, name) => {
            if (animData.startDelay === 0) {
                this.startAnimation(name, animData);
            } else {
                // Store timeout for cleanup
                animData.timeoutId = setTimeout(() => {
                    if (this.playing) {
                        this.startAnimation(name, animData);
                        animData.timeoutId = null;
                    }
                }, animData.startDelay);
            }
        });

        return this;
    }

    startAnimation(name, animData) {
        animData.active = true;
        if (animData.animation.play) {
            animData.animation.play();
        }
    }

    pause() {
        this.paused = true;
        this.animations.forEach((animData) => {
            if (animData.animation.pause) {
                animData.animation.pause();
            }
        });
        return this;
    }

    resume() {
        this.paused = false;
        this.animations.forEach((animData) => {
            if (animData.animation.resume) {
                animData.animation.resume();
            }
        });
        return this;
    }

    stop() {
        this.playing = false;
        this.paused = false;

        this.animations.forEach((animData) => {
            // Clear any pending timeouts
            if (animData.timeoutId) {
                clearTimeout(animData.timeoutId);
                animData.timeoutId = null;
            }

            if (animData.animation.stop) {
                animData.animation.stop();
            }
            animData.active = false;
            animData.completed = false;
        });

        return this;
    }

    update(deltaTime) {
        if (!this.playing || this.paused) return;

        let allCompleted = true;
        this.animations.forEach((animData, name) => {
            if (animData.active && !animData.completed) {
                if (animData.animation.update) {
                    animData.animation.update(deltaTime * this.timeScale);
                }

                // Check if animation is complete
                if (animData.animation.isComplete && animData.animation.isComplete()) {
                    animData.completed = true;
                } else {
                    allCompleted = false;
                }
            } else if (!animData.completed) {
                allCompleted = false;
            }
        });

        if (allCompleted) {
            if (this.looping) {
                this.play();
                if (this.onLoop) this.onLoop();
            } else {
                this.playing = false;
                if (this.onComplete) this.onComplete();
            }
        }
    }

    getAnimation(name) {
        return this.animations.get(name)?.animation;
    }

    setTimeScale(scale) {
        this.timeScale = scale;
        this.animations.forEach((animData) => {
            if (animData.animation.setTimeScale) {
                animData.animation.setTimeScale(scale);
            }
        });
        return this;
    }

    // Static factory method
    static create(id, config = {}) {
        return new AnimationGroup(id, config);
    }
}

// Animated particle system that extends ParticleSystem with animation capabilities
class AnimatedParticleSystem extends ParticleSystem {
    constructor(engine) {
        super(engine);
        this.particleAnimations = new Map();
        this.animationTemplates = new Map();
    }

    createParticle(x, y, config = {}) {
        const particle = super.createParticle(x, y, config);

        // Add animation properties
        particle.animationTime = 0;
        particle.animations = new Map();
        particle.currentFrame = 0;
        particle.spriteAnimation = null;

        // Apply animation template if specified
        if (config.animationTemplate) {
            this.applyAnimationTemplate(particle, config.animationTemplate);
        }

        return particle;
    }

    registerAnimationTemplate(name, template) {
        this.animationTemplates.set(name, template);
    }

    applyAnimationTemplate(particle, templateName) {
        const template = this.animationTemplates.get(templateName);
        if (!template) return;

        // Apply size animation
        if (template.size) {
            const sizeAnim = new Tween(particle, { size: template.size.end }, template.size.duration, template.size.easing);
            particle.animations.set('size', sizeAnim);
            sizeAnim.start();
        }

        // Apply color animation
        if (template.color) {
            this.animateParticleColor(particle, template.color);
        }

        // Apply rotation animation
        if (template.rotation) {
            const rotAnim = new Tween(particle, { rotation: particle.rotation + template.rotation.amount }, template.rotation.duration, template.rotation.easing);
            particle.animations.set('rotation', rotAnim);
            rotAnim.start();
        }

        // Apply opacity animation
        if (template.opacity) {
            const opacityAnim = new Tween(particle, { opacity: template.opacity.end }, template.opacity.duration, template.opacity.easing);
            particle.animations.set('opacity', opacityAnim);
            opacityAnim.start();
        }
    }

    animateParticleColor(particle, colorConfig) {
        if (colorConfig.keyframes) {
            // Keyframe color animation
            let currentKeyframe = 0;
            let timeoutId;

            const animate = () => {
                if (currentKeyframe >= colorConfig.keyframes.length - 1) return;

                const startKf = colorConfig.keyframes[currentKeyframe];
                const endKf = colorConfig.keyframes[currentKeyframe + 1];

                const colorAnim = new Tween(
                    { color: startKf.color },
                    { color: endKf.color },
                    endKf.time - startKf.time,
                    'linear'
                );

                colorAnim.onUpdate = (target) => {
                    particle.color = target.color;
                };

                colorAnim.onComplete = () => {
                    currentKeyframe++;
                    if (currentKeyframe < colorConfig.keyframes.length - 1) {
                        timeoutId = setTimeout(animate, 0);
                    }
                };

                colorAnim.start();
            };
            animate();

            // Add cleanup function
            particle.cleanupAnimation = () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
        } else if (colorConfig.start && colorConfig.end) {
            // Simple color animation
            const colorAnim = new Tween(
                { color: colorConfig.start },
                { color: colorConfig.end },
                colorConfig.duration,
                colorConfig.easing
            );

            colorAnim.onUpdate = (target) => {
                particle.color = target.color;
            };

            colorAnim.start();
        }
    }

    updateParticle(particle, deltaTime) {
        super.updateParticle(particle, deltaTime);

        particle.animationTime += deltaTime;

        // Update particle animations
        particle.animations.forEach((animation, name) => {
            animation.update(deltaTime);

            if (animation.completed) {
                particle.animations.delete(name);
            }
        });

        // Update sprite animation
        if (particle.spriteAnimation) {
            particle.spriteAnimation.update(deltaTime);
        }
    }

    // Predefined animation templates
    static getFireParticleTemplate() {
        return {
            size: {
                end: 0,
                duration: 2000,
                easing: 'easeOutQuad'
            },
            color: {
                keyframes: [
                    { time: 0, color: '#ffff00' },
                    { time: 800, color: '#ff8800' },
                    { time: 1400, color: '#ff4400' },
                    { time: 2000, color: '#441100' }
                ]
            },
            opacity: {
                end: 0,
                duration: 2000,
                easing: 'easeOutCubic'
            }
        };
    }

    static getExplosionParticleTemplate() {
        return {
            size: {
                end: 20,
                duration: 300,
                easing: 'easeOutBounce'
            },
            opacity: {
                end: 0,
                duration: 800,
                easing: 'easeOutQuad'
            },
            rotation: {
                amount: Math.PI * 4,
                duration: 1000,
                easing: 'linear'
            }
        };
    }

    static getMagicParticleTemplate() {
        return {
            size: {
                end: 15,
                duration: 1500,
                easing: 'easeInOutQuad'
            },
            color: {
                keyframes: [
                    { time: 0, color: '#ffffff' },
                    { time: 300, color: '#00ffff' },
                    { time: 600, color: '#ff00ff' },
                    { time: 900, color: '#ffff00' },
                    { time: 1200, color: '#00ff00' },
                    { time: 1500, color: '#ffffff' }
                ]
            },
            opacity: {
                end: 0.3,
                duration: 1500,
                easing: 'easeOutQuad'
            },
            rotation: {
                amount: Math.PI * 2,
                duration: 1500,
                easing: 'linear'
            }
        };
    }
}

// Visual effects that combine animations and particles
class VisualEffects {
    constructor(engine) {
        this.engine = engine;
        this.animationManager = new AnimationManager(engine);

        // Cache for DOM elements to reduce creation overhead
        this.elementCache = new Map();
        this.activeEffects = new Set();
    }

    update(deltaTime) {
        this.animationManager.update(deltaTime);
    }

    // Screen shake effect (inspired by Poker Doom)
    screenShake(intensity = 10, duration = 300) {
        if (this.engine.canvas) {
            const canvas = this.engine.canvas;
            const originalTransform = canvas.style.transform;
            
            this.animationManager.shake(
                { position: { x: 0, y: 0 } },
                intensity,
                duration,
                {
                    onUpdate: (target) => {
                        canvas.style.transform = `translate(${target.position.x}px, ${target.position.y}px)`;
                    },
                    onComplete: () => {
                        canvas.style.transform = originalTransform;
                    }
                }
            );
        }
    }

    // Flash effect
    flash(color = '#ffffff', intensity = 0.5, duration = 100) {
        const cacheKey = `flash_${color}`;

        // Try to reuse cached element
        let overlay = this.elementCache.get(cacheKey);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: ${color};
                pointer-events: none;
                z-index: 9999;
            `;
            this.elementCache.set(cacheKey, overlay);
        }

        overlay.style.opacity = intensity;
        if (!overlay.parentNode) {
            document.body.appendChild(overlay);
        }

        this.activeEffects.add(cacheKey);

        this.animationManager.to(
            { opacity: intensity },
            { opacity: 0 },
            duration,
            {
                onUpdate: (target) => {
                    overlay.style.opacity = target.opacity;
                },
                onComplete: () => {
                    this.activeEffects.delete(cacheKey);
                    if (overlay.parentNode) {
                        document.body.removeChild(overlay);
                    }
                }
            }
        );
    }

    // Damage text effect (inspired by both games)
    showDamageText(x, y, text, options = {}) {
        const cacheKey = `damage_${options.color || '#ff0000'}_${options.fontSize || 24}`;

        // Try to reuse cached element
        let element = this.elementCache.get(cacheKey);
        if (!element) {
            element = document.createElement('div');
            element.style.cssText = `
                position: absolute;
                font-family: 'Press Start 2P', monospace;
                font-size: ${options.fontSize || 24}px;
                color: ${options.color || '#ff0000'};
                font-weight: bold;
                text-shadow: 2px 2px 0px #000000;
                pointer-events: none;
                z-index: 1000;
                transform: translate(-50%, -50%);
            `;
            this.elementCache.set(cacheKey, element);
        }

        element.textContent = text;
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.opacity = '1';
        element.style.transform = 'translate(-50%, -50%) scale(1)';

        if (!element.parentNode) {
            document.body.appendChild(element);
        }

        this.activeEffects.add(cacheKey);

        // Animate the text
        this.animationManager.to(
            { y: y, opacity: 1, scale: 1 },
            { y: y - 100, opacity: 0, scale: 1.5 },
            1500,
            {
                easing: Tween.Easing.easeOutQuad,
                onUpdate: (target) => {
                    element.style.top = target.y + 'px';
                    element.style.opacity = target.opacity;
                    element.style.transform = `translate(-50%, -50%) scale(${target.scale})`;
                },
                onComplete: () => {
                    this.activeEffects.delete(cacheKey);
                    if (element.parentNode) {
                        document.body.removeChild(element);
                    }
                }
            }
        );
    }

    // Rainbow effect (inspired by Rainbow Builder)
    createRainbowEffect(element, duration = 2000) {
        const colors = [
            '#ff0000', '#ff8000', '#ffff00', '#80ff00',
            '#00ff80', '#00ffff', '#0080ff', '#0000ff',
            '#8000ff', '#ff00ff', '#ff0080'
        ];
        
        let colorIndex = 0;
        const interval = duration / (colors.length * 2);
        let timeoutId;

        const animate = () => {
            element.style.color = colors[colorIndex % colors.length];
            colorIndex++;

            if (colorIndex < colors.length * 2) {
                timeoutId = setTimeout(animate, interval);
            }
        };

        animate();

        // Return cleanup function
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }

    // Cleanup method for memory management
    destroy() {
        // Clear all active effects
        this.activeEffects.forEach(cacheKey => {
            const element = this.elementCache.get(cacheKey);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        this.activeEffects.clear();
        this.elementCache.clear();

        console.log('VisualEffects cleaned up');
    }
}

export {
    Tween,
    AnimationManager,
    VisualEffects,
    SpriteAnimator,
    Timeline,
    AnimationChannel,
    Animation,
    AnimationGroup,
    AnimatedParticleSystem
};
