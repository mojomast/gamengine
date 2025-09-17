/**
 * GameObject Base Class
 * Provides core functionality for all game objects
 */

class GameObject {
    constructor(x = 0, y = 0) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.size = { width: 32, height: 32 };
        this.origin = { x: 0.5, y: 0.5 }; // Anchor point (0,0 = top-left, 0.5,0.5 = center)
        
        this.rotation = 0;
        this.scale = { x: 1, y: 1 };
        this.alpha = 1;
        
        this.active = true;
        this.visible = true;
        this.destroyed = false;
        
        this.scene = null;
        this.layer = undefined;
        
        // Physics
        this.physics = {
            enabled: false,
            mass: 1,
            friction: 0.9,
            bounce: 0,
            gravity: 0
        };
        
        // Collision
        this.collision = {
            enabled: false,
            type: 'rectangle', // 'rectangle', 'circle'
            offset: { x: 0, y: 0 },
            size: { width: 32, height: 32 },
            radius: 16
        };
        
        // Components
        this.components = new Map();
        
        // Events
        this.events = new Map();
        
        // Animation
        this.animations = new Map();
        this.currentAnimation = null;
        
        // Timers
        this.timers = new Map();
        
        // Tags for identification
        this.tags = new Set();
    }

    update(deltaTime) {
        if (!this.active) return;

        // Update physics
        if (this.physics.enabled) {
            this.updatePhysics(deltaTime);
        }

        // Update animations
        this.updateAnimations(deltaTime);
        
        // Update timers
        this.updateTimers(deltaTime);
        
        // Update components
        this.components.forEach(component => {
            if (component.update) {
                component.update(deltaTime);
            }
        });
    }

    render(ctx) {
        if (!this.visible) return;

        ctx.save();
        
        // Apply transformations
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale.x, this.scale.y);
        ctx.globalAlpha = this.alpha;
        
        // Render with origin offset
        const offsetX = -this.size.width * this.origin.x;
        const offsetY = -this.size.height * this.origin.y;
        ctx.translate(offsetX, offsetY);
        
        // Perform actual rendering (override in subclasses)
        this.draw(ctx);
        
        // Render components
        this.components.forEach(component => {
            if (component.render) {
                component.render(ctx);
            }
        });
        
        ctx.restore();
    }

    draw(ctx) {
        // Default rendering - just a rectangle
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, this.size.width, this.size.height);
    }

    updatePhysics(deltaTime) {
        // Apply gravity
        if (this.physics.gravity !== 0) {
            this.acceleration.y += this.physics.gravity;
        }
        
        // Apply acceleration to velocity
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        
        // Apply friction
        this.velocity.x *= this.physics.friction;
        this.velocity.y *= this.physics.friction;
        
        // Apply velocity to position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Reset acceleration
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }

    // Movement methods
    moveTo(x, y) {
        this.position.x = x;
        this.position.y = y;
    }

    moveBy(dx, dy) {
        this.position.x += dx;
        this.position.y += dy;
    }

    setVelocity(vx, vy) {
        this.velocity.x = vx;
        this.velocity.y = vy;
    }

    addForce(fx, fy) {
        this.acceleration.x += fx / this.physics.mass;
        this.acceleration.y += fy / this.physics.mass;
    }

    // Collision detection
    getBounds() {
        return {
            x: this.position.x + this.collision.offset.x - this.collision.size.width * this.origin.x,
            y: this.position.y + this.collision.offset.y - this.collision.size.height * this.origin.y,
            width: this.collision.size.width,
            height: this.collision.size.height
        };
    }

    overlaps(other) {
        if (!this.collision.enabled || !other.collision.enabled) {
            return false;
        }

        if (this.collision.type === 'rectangle' && other.collision.type === 'rectangle') {
            return this.overlapsRectangle(other);
        } else if (this.collision.type === 'circle' && other.collision.type === 'circle') {
            return this.overlapsCircle(other);
        } else {
            // Mixed collision types - use simpler bounds check
            return this.overlapsRectangle(other);
        }
    }

    overlapsRectangle(other) {
        const a = this.getBounds();
        const b = other.getBounds();
        
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    overlapsCircle(other) {
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (this.collision.radius + other.collision.radius);
    }

    // Component system
    addComponent(name, component) {
        component.gameObject = this;
        this.components.set(name, component);
        
        if (component.init) {
            component.init();
        }
    }

    getComponent(name) {
        return this.components.get(name);
    }

    removeComponent(name) {
        const component = this.components.get(name);
        if (component && component.destroy) {
            component.destroy();
        }
        this.components.delete(name);
    }

    hasComponent(name) {
        return this.components.has(name);
    }

    // Animation system
    addAnimation(name, frames, duration = 1000, loop = true) {
        this.animations.set(name, {
            frames,
            duration,
            loop,
            currentFrame: 0,
            elapsed: 0,
            frameTime: duration / frames.length
        });
    }

    playAnimation(name, restart = false) {
        const animation = this.animations.get(name);
        if (animation) {
            if (restart || this.currentAnimation !== name) {
                animation.currentFrame = 0;
                animation.elapsed = 0;
            }
            this.currentAnimation = name;
        }
    }

    stopAnimation() {
        this.currentAnimation = null;
    }

    updateAnimations(deltaTime) {
        if (!this.currentAnimation) return;
        
        const animation = this.animations.get(this.currentAnimation);
        if (!animation) return;
        
        animation.elapsed += deltaTime * 1000;
        
        if (animation.elapsed >= animation.frameTime) {
            animation.currentFrame++;
            animation.elapsed = 0;
            
            if (animation.currentFrame >= animation.frames.length) {
                if (animation.loop) {
                    animation.currentFrame = 0;
                } else {
                    this.currentAnimation = null;
                    animation.currentFrame = animation.frames.length - 1;
                    this.emit('animationComplete', this.currentAnimation);
                }
            }
        }
    }

    getCurrentFrame() {
        if (!this.currentAnimation) return null;
        
        const animation = this.animations.get(this.currentAnimation);
        if (!animation) return null;
        
        return animation.frames[animation.currentFrame];
    }

    // Timer system
    addTimer(name, duration, callback, repeat = false) {
        this.timers.set(name, {
            duration,
            callback,
            repeat,
            elapsed: 0,
            active: true
        });
    }

    removeTimer(name) {
        this.timers.delete(name);
    }

    updateTimers(deltaTime) {
        this.timers.forEach((timer, name) => {
            if (!timer.active) return;
            
            timer.elapsed += deltaTime * 1000;
            
            if (timer.elapsed >= timer.duration) {
                timer.callback();
                
                if (timer.repeat) {
                    timer.elapsed = 0;
                } else {
                    this.timers.delete(name);
                }
            }
        });
    }

    // Event system
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                callback(data, this);
            });
        }
    }

    // Tag system
    addTag(tag) {
        this.tags.add(tag);
    }

    removeTag(tag) {
        this.tags.delete(tag);
    }

    hasTag(tag) {
        return this.tags.has(tag);
    }

    // Lifecycle
    destroy() {
        if (this.destroyed) return; // Prevent double destruction

        this.destroyed = true;
        this.active = false;
        this.visible = false;

        // Queue for destruction in scene
        if (this.scene) {
            this.scene.destroyQueue.push(this);
        }

        // Destroy components
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });

        // Clear collections
        this.components.clear();
        this.animations.clear();
        this.timers.clear();
        this.events.clear();
        this.tags.clear();

        this.emit('destroyed', this);
    }

    // Utility methods
    distanceTo(other) {
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    angleTo(other) {
        const dx = other.position.x - this.position.x;
        const dy = other.position.y - this.position.y;
        return Math.atan2(dy, dx);
    }

    lookAt(target) {
        this.rotation = this.angleTo(target);
    }

    clone() {
        const clone = new this.constructor(this.position.x, this.position.y);
        
        // Copy basic properties
        Object.assign(clone.velocity, this.velocity);
        Object.assign(clone.size, this.size);
        Object.assign(clone.origin, this.origin);
        Object.assign(clone.scale, this.scale);
        
        clone.rotation = this.rotation;
        clone.alpha = this.alpha;
        clone.active = this.active;
        clone.visible = this.visible;
        
        // Copy physics settings
        Object.assign(clone.physics, this.physics);
        Object.assign(clone.collision, this.collision);
        
        // Copy tags
        this.tags.forEach(tag => clone.addTag(tag));
        
        return clone;
    }
}

export { GameObject };
