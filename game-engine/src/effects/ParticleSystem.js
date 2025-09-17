/**
 * Particle System
 * Creates and manages particle effects inspired by both analyzed games
 */

import { ParticlePool } from '../core/ObjectPool.js';
import { BatchRenderer } from '../core/BatchRenderer.js';

class Particle {
    constructor(x, y, options = {}) {
        this.position = { x, y };
        this.startPosition = { x, y };
        this.velocity = {
            x: options.velocityX || 0,
            y: options.velocityY || 0
        };
        this.acceleration = {
            x: options.accelerationX || 0,
            y: options.accelerationY || 0
        };

        this.life = options.life || 1000; // milliseconds
        this.maxLife = this.life;
        this.size = options.size || 5;
        this.startSize = this.size;
        this.endSize = options.endSize !== undefined ? options.endSize : this.size;

        this.color = options.color || '#ffffff';
        this.startColor = options.startColor || this.color;
        this.endColor = options.endColor || this.color;

        this.alpha = options.alpha !== undefined ? options.alpha : 1;
        this.startAlpha = options.startAlpha !== undefined ? options.startAlpha : this.alpha;
        this.endAlpha = options.endAlpha !== undefined ? options.endAlpha : 0;

        this.rotation = options.rotation || 0;
        this.angularVelocity = options.angularVelocity || 0;

        this.friction = options.friction !== undefined ? options.friction : 1;
        this.gravity = options.gravity || 0;

        this.shape = options.shape || 'circle'; // 'circle', 'square', 'triangle', 'star'
        this.texture = options.texture || null;

        this.alive = true;
        this.age = 0;
    }

    update(deltaTime) {
        if (!this.alive) return;

        const dt = deltaTime * 1000; // Convert to milliseconds
        this.age += dt;

        // Check if particle is dead
        if (this.age >= this.life) {
            this.alive = false;
            return;
        }

        // Calculate life progress (0 to 1)
        const progress = this.age / this.life;

        // Update physics
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        
        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;
        
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Update rotation
        this.rotation += this.angularVelocity * deltaTime;
        
        // Interpolate properties based on progress
        this.size = this.lerp(this.startSize, this.endSize, progress);
        this.alpha = this.lerp(this.startAlpha, this.endAlpha, progress);
        
        // Color interpolation (simplified)
        if (this.startColor !== this.endColor) {
            this.color = this.lerpColor(this.startColor, this.endColor, progress);
        }
    }

    render(ctx) {
        if (!this.alive || this.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        if (this.texture) {
            // Render texture
            ctx.drawImage(
                this.texture,
                -this.size / 2,
                -this.size / 2,
                this.size,
                this.size
            );
        } else {
            // Render shape
            ctx.fillStyle = this.color;
            this.renderShape(ctx);
        }

        ctx.restore();
    }

    renderShape(ctx) {
        const halfSize = this.size / 2;

        switch (this.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'square':
                ctx.fillRect(-halfSize, -halfSize, this.size, this.size);
                break;

            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -halfSize);
                ctx.lineTo(-halfSize, halfSize);
                ctx.lineTo(halfSize, halfSize);
                ctx.closePath();
                ctx.fill();
                break;

            case 'star':
                this.renderStar(ctx, 0, 0, 5, halfSize, halfSize * 0.5);
                break;

            default:
                ctx.fillRect(-halfSize, -halfSize, this.size, this.size);
        }
    }

    renderStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    lerpColor(start, end, t) {
        // Simple color interpolation (assumes hex colors)
        if (start === end) return start;

        // Parse hex colors and interpolate
        const startRGB = this.parseHexColor(start);
        const endRGB = this.parseHexColor(end);

        if (!startRGB || !endRGB) return start;

        const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * t);
        const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * t);
        const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * t);

        return `rgb(${r}, ${g}, ${b})`;
    }

    parseHexColor(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}

class ParticleSystem {
    constructor(engine) {
        this.engine = engine;
        this.particles = [];
        this.emitters = new Map();
        this.maxParticles = 1000;
        this.enabled = true;

        // Object pooling for performance
        this.particlePool = new ParticlePool();
    }

    update(deltaTime) {
        if (!this.enabled) return;

        // Update all particles and collect dead ones
        const deadParticles = [];
        this.particles.forEach(particle => {
            particle.update(deltaTime);
            if (!particle.alive) {
                deadParticles.push(particle);
            }
        });

        // Remove and release dead particles
        deadParticles.forEach(particle => {
            const index = this.particles.indexOf(particle);
            if (index > -1) {
                this.particles.splice(index, 1);
                this.particlePool.release(particle);
            }
        });

        // Update emitters
        this.emitters.forEach(emitter => {
            if (emitter.active) {
                emitter.update(deltaTime);
            }
        });

        // Limit particle count (remove oldest)
        while (this.particles.length > this.maxParticles) {
            const particle = this.particles.shift();
            this.particlePool.release(particle);
        }
    }

    render(ctx) {
        if (!this.enabled) return;

        // Use batch rendering for better performance
        const batchRenderer = new BatchRenderer(ctx);
        batchRenderer.beginBatch('particles');

        this.particles.forEach(particle => {
            if (particle.alive && particle.alpha > 0) {
                if (particle.texture) {
                    // Use batched sprite rendering
                    batchRenderer.drawSprite(particle.texture, particle.position.x, particle.position.y, {
                        width: particle.size,
                        height: particle.size,
                        alpha: particle.alpha,
                        rotation: particle.rotation
                    });
                } else {
                    // For shapes, we still need individual rendering due to complex shape logic
                    particle.render(ctx);
                }
            }
        });

        batchRenderer.endBatch();
    }

    addParticle(x, y, options = {}) {
        if (this.particles.length >= this.maxParticles) {
            return null; // Pool limit reached
        }
        const particle = this.particlePool.get(x, y, options);
        this.particles.push(particle);
        return particle;
    }

    // Preset particle effects inspired by the analyzed games
    createExplosion(x, y, options = {}) {
        const count = options.count || 20;
        const colors = options.colors || ['#ff0000', '#ff8000', '#ffff00', '#ffffff'];
        const speed = options.speed || 200;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = speed * (0.5 + Math.random() * 0.5);
            
            this.addParticle(x, y, {
                velocityX: Math.cos(angle) * velocity,
                velocityY: Math.sin(angle) * velocity,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 3 + Math.random() * 5,
                endSize: 0,
                life: 500 + Math.random() * 500,
                friction: 0.95,
                shape: 'circle'
            });
        }
    }

    createRainbowBurst(x, y, options = {}) {
        const count = options.count || 15;
        const rainbowColors = [
            '#ff0000', '#ff8000', '#ffff00', '#80ff00',
            '#00ff80', '#00ffff', '#0080ff', '#0000ff',
            '#8000ff', '#ff00ff', '#ff0080'
        ];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 200;
            
            this.addParticle(x, y, {
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                color: rainbowColors[i % rainbowColors.length],
                size: 4 + Math.random() * 6,
                endSize: 1,
                life: 1000 + Math.random() * 1000,
                friction: 0.98,
                gravity: 50,
                shape: 'star'
            });
        }
    }

    createFloatingText(x, y, text, options = {}) {
        // Create a text particle that floats upward
        const textParticle = {
            position: { x, y },
            velocity: { x: 0, y: options.velocityY || -100 },
            life: options.life || 2000,
            maxLife: options.life || 2000,
            age: 0,
            text: text,
            color: options.color || '#ffffff',
            fontSize: options.fontSize || 24,
            font: options.font || 'bold 24px monospace',
            alpha: 1,
            alive: true,

            update(deltaTime) {
                if (!this.alive) return;

                this.age += deltaTime * 1000;
                if (this.age >= this.life) {
                    this.alive = false;
                    return;
                }

                const progress = this.age / this.life;
                this.position.y += this.velocity.y * deltaTime;
                this.alpha = 1 - progress;
            },

            render(ctx) {
                if (!this.alive) return;

                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.font = this.font;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 4;
                ctx.fillText(this.text, this.position.x, this.position.y);
                ctx.restore();
            }
        };

        this.particles.push(textParticle);
        return textParticle;
    }

    createClickEffect(x, y, options = {}) {
        const count = options.count || 8;
        const colors = options.colors || ['#00f593', '#05d9e8', '#ff206e'];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 150 + Math.random() * 100;
            
            this.addParticle(x, y, {
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 2 + Math.random() * 3,
                endSize: 0,
                life: 300 + Math.random() * 200,
                friction: 0.9,
                shape: 'circle'
            });
        }
    }

    createTrail(x, y, options = {}) {
        this.addParticle(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10, {
            velocityX: (Math.random() - 0.5) * 50,
            velocityY: (Math.random() - 0.5) * 50,
            color: options.color || '#ffffff',
            size: options.size || 3,
            endSize: 0,
            life: options.life || 500,
            friction: 0.95,
            shape: options.shape || 'circle'
        });
    }

    createParticleEmitter(id, x, y, options = {}) {
        const emitter = {
            id,
            position: { x, y },
            active: true,
            rate: options.rate || 10, // particles per second
            timer: 0,
            duration: options.duration || -1, // -1 for infinite
            elapsed: 0,
            particleOptions: options.particleOptions || {},

            update(deltaTime) {
                if (!this.active) return;

                this.elapsed += deltaTime * 1000;
                this.timer += deltaTime * 1000;

                // Check if emitter should stop
                if (this.duration > 0 && this.elapsed >= this.duration) {
                    this.active = false;
                    return;
                }

                // Emit particles based on rate
                const interval = 1000 / this.rate;
                while (this.timer >= interval) {
                    this.emitParticle();
                    this.timer -= interval;
                }
            },

            emitParticle() {
                const particleOptions = { ...this.particleOptions };
                
                // Add some randomization
                if (particleOptions.randomVelocity) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = particleOptions.speed || 100;
                    particleOptions.velocityX = Math.cos(angle) * speed * (0.5 + Math.random() * 0.5);
                    particleOptions.velocityY = Math.sin(angle) * speed * (0.5 + Math.random() * 0.5);
                }

                if (particleOptions.randomSize) {
                    particleOptions.size = particleOptions.baseSize || 5 + Math.random() * 3;
                }

                engine.particleSystem.addParticle(
                    this.position.x + (Math.random() - 0.5) * (particleOptions.spread || 0),
                    this.position.y + (Math.random() - 0.5) * (particleOptions.spread || 0),
                    particleOptions
                );
            }
        };

        this.emitters.set(id, emitter);
        return emitter;
    }

    removeEmitter(id) {
        this.emitters.delete(id);
    }

    moveEmitter(id, x, y) {
        const emitter = this.emitters.get(id);
        if (emitter) {
            emitter.position.x = x;
            emitter.position.y = y;
        }
    }

    clear() {
        // Release all particles back to pool
        this.particles.forEach(particle => {
            this.particlePool.release(particle);
        });
        this.particles = [];
        this.emitters.clear();
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    getParticleCount() {
        return this.particles.length;
    }

    getEmitterCount() {
        return this.emitters.size;
    }
}

export { ParticleSystem, Particle };
