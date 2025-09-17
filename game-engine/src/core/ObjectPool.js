/**
 * Generic Object Pool for performance optimization
 * Reduces garbage collection pressure by reusing objects
 */

class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = new Set();
        this.maxSize = 1000; // Prevent memory bloat

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    get(...args) {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
            this.resetFn(obj, ...args);
        } else {
            obj = this.createFn(...args);
        }
        this.active.add(obj);
        return obj;
    }

    release(obj) {
        if (this.active.has(obj)) {
            this.active.delete(obj);
            if (this.pool.length < this.maxSize) {
                this.pool.push(obj);
            }
        }
    }

    releaseAll() {
        for (const obj of this.active) {
            if (this.pool.length < this.maxSize) {
                this.pool.push(obj);
            }
        }
        this.active.clear();
    }

    getActiveCount() {
        return this.active.size;
    }

    getPoolCount() {
        return this.pool.length;
    }

    clear() {
        this.pool = [];
        this.active.clear();
    }
}

// Specialized pools for common objects
class ParticlePool extends ObjectPool {
    constructor() {
        super(
            () => ({
                position: { x: 0, y: 0 },
                velocity: { x: 0, y: 0 },
                acceleration: { x: 0, y: 0 },
                life: 1000,
                maxLife: 1000,
                size: 5,
                startSize: 5,
                endSize: 5,
                color: '#ffffff',
                startColor: '#ffffff',
                endColor: '#ffffff',
                alpha: 1,
                startAlpha: 1,
                endAlpha: 0,
                rotation: 0,
                angularVelocity: 0,
                friction: 1,
                gravity: 0,
                shape: 'circle',
                texture: null,
                alive: true,
                age: 0,
                animationTime: 0,
                animations: new Map(),
                currentFrame: 0,
                spriteAnimation: null
            }),
            (particle, x, y, options = {}) => {
                particle.position.x = x;
                particle.position.y = y;
                particle.startPosition.x = x;
                particle.startPosition.y = y;
                particle.velocity.x = options.velocityX || 0;
                particle.velocity.y = options.velocityY || 0;
                particle.acceleration.x = options.accelerationX || 0;
                particle.acceleration.y = options.accelerationY || 0;
                particle.life = options.life || 1000;
                particle.maxLife = particle.life;
                particle.size = options.size || 5;
                particle.startSize = particle.size;
                particle.endSize = options.endSize !== undefined ? options.endSize : particle.size;
                particle.color = options.color || '#ffffff';
                particle.startColor = options.startColor || particle.color;
                particle.endColor = options.endColor || particle.color;
                particle.alpha = options.alpha !== undefined ? options.alpha : 1;
                particle.startAlpha = options.startAlpha !== undefined ? options.startAlpha : particle.alpha;
                particle.endAlpha = options.endAlpha !== undefined ? options.endAlpha : 0;
                particle.rotation = options.rotation || 0;
                particle.angularVelocity = options.angularVelocity || 0;
                particle.friction = options.friction !== undefined ? options.friction : 1;
                particle.gravity = options.gravity || 0;
                particle.shape = options.shape || 'circle';
                particle.texture = options.texture || null;
                particle.alive = true;
                particle.age = 0;
                particle.animationTime = 0;
                particle.animations.clear();
                particle.currentFrame = 0;
                particle.spriteAnimation = null;
            }
        );
    }
}

class TweenPool extends ObjectPool {
    constructor() {
        super(
            () => ({
                target: null,
                properties: {},
                duration: 1000,
                elapsed: 0,
                completed: false,
                started: false,
                startValues: {},
                endValues: {},
                currentRepeat: 0,
                isReversed: false,
                onStart: null,
                onUpdate: null,
                onComplete: null
            }),
            (tween, target, properties, duration, options = {}) => {
                tween.target = target;
                tween.properties = properties;
                tween.duration = duration;
                tween.elapsed = 0;
                tween.completed = false;
                tween.started = false;
                tween.startValues = {};
                tween.endValues = {};
                tween.currentRepeat = 0;
                tween.isReversed = false;
                tween.onStart = options.onStart || null;
                tween.onUpdate = options.onUpdate || null;
                tween.onComplete = options.onComplete || null;

                // Parse properties
                for (const prop in properties) {
                    tween.startValues[prop] = tween.getNestedProperty(target, prop);
                    tween.endValues[prop] = properties[prop];
                }
            }
        );
    }
}

// Add utility methods to pooled tween
Object.assign(TweenPool.prototype.pool[0] || {}, {
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    },

    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => current && current[key], obj);
        if (target) {
            target[lastKey] = value;
        }
    },

    update(deltaTime) {
        if (this.completed) return false;

        this.elapsed += deltaTime * 1000;

        if (this.elapsed < 0) return true; // Handle delay if needed

        if (!this.started) {
            this.started = true;
            if (this.onStart) this.onStart(this.target);
        }

        const progress = Math.min(this.elapsed / this.duration, 1);
        const easedProgress = progress; // Linear for now, can be extended

        for (const prop in this.properties) {
            const start = this.isReversed ? this.endValues[prop] : this.startValues[prop];
            const end = this.isReversed ? this.startValues[prop] : this.endValues[prop];
            const current = start + (end - start) * easedProgress;
            this.setNestedProperty(this.target, prop, current);
        }

        if (this.onUpdate) this.onUpdate(this.target, easedProgress);

        if (this.elapsed >= this.duration) {
            this.completed = true;
            if (this.onComplete) this.onComplete(this.target);
            return false;
        }

        return true;
    },

    stop() {
        this.completed = true;
    },

    reset() {
        this.elapsed = 0;
        this.completed = false;
        this.started = false;
        this.currentRepeat = 0;
        this.isReversed = false;
    }
});

// Add the same methods to all pooled tweens
TweenPool.prototype.pool.forEach(tween => {
    Object.assign(tween, TweenPool.prototype.pool[0]);
});

export { ObjectPool, ParticlePool, TweenPool };