// Cosmic Crystal Defenders - Epic Tower Defense Game
// Full engine integration with SVG graphics, animations, and advanced features

(function() {
    'use strict';

    // Game Configuration
    const CONFIG = {
        CANVAS_WIDTH: 1280,
        CANVAS_HEIGHT: 720,
        GRID_SIZE: 40,
        FPS_TARGET: 60,
        WAVE_DELAY: 30000,
        START_CRYSTALS: 1000,
        START_ENERGY: 500,
        START_POWER: 100
    };

    // Game State
    const GameState = {
        crystals: CONFIG.START_CRYSTALS,
        energy: CONFIG.START_ENERGY,
        power: CONFIG.START_POWER,
        // New resources
        techPoints: 0,
        essences: 0,
        fragments: 0,
        cores: 0,
        score: 0,
        multiplier: 1,
        wave: 1,
        enemiesDefeated: 0,
        towersBuilt: 0,
        crystalsHarvested: 0,
        isPaused: false,
        isGameOver: false,
        selectedTower: null,
        placementMode: false,
        gameTime: 0,
        waveTimer: 0,
        soundEnabled: true,
        globalSkillPoints: 0
    };

    // Canvas Layers
    let backgroundCanvas, gameCanvas, effectsCanvas, uiCanvas;
    let bgCtx, gameCtx, effectsCtx, uiCtx;
    let svgOverlay;

    // Game Collections
    const towers = [];
    const enemies = [];
    const projectiles = [];
    const particles = [];
    const crystals = [];
    const effects = [];
    const resourceDrops = [];

    // Performance Monitoring
    const perfMonitor = {
        fps: 60,
        frameTime: 0,
        lastTime: 0,
        frames: 0,
        entityCount: 0,
        particleCount: 0
    };

    // Tower Types - Extended
    const TowerTypes = {
        laser: {
            name: 'Laser Tower',
            cost: 100,
            damage: 20,
            range: 150,
            fireRate: 0.5,
            color: '#00ffff',
            projectileSpeed: 800,
            description: 'Fast firing laser tower',
            unlocked: true
        },
        missile: {
            name: 'Missile Tower',
            cost: 200,
            damage: 50,
            range: 200,
            fireRate: 1.5,
            color: '#ff6600',
            projectileSpeed: 400,
            splash: true,
            splashRadius: 50,
            description: 'Explosive area damage',
            unlocked: true
        },
        plasma: {
            name: 'Plasma Tower',
            cost: 350,
            damage: 35,
            range: 180,
            fireRate: 0.8,
            color: '#ff00ff',
            projectileSpeed: 600,
            piercing: true,
            description: 'Piercing plasma bolts',
            unlocked: true
        },
        tesla: {
            name: 'Tesla Tower',
            cost: 500,
            damage: 15,
            range: 120,
            fireRate: 0.1,
            color: '#ffff00',
            chain: true,
            chainCount: 3,
            description: 'Chain lightning damage',
            unlocked: true
        },
        // New tower types
        sniper: {
            name: 'Sniper Tower',
            cost: 450,
            damage: 150,
            range: 300,
            fireRate: 3.0,
            color: '#ff00ff',
            projectileSpeed: 1200,
            description: 'Long range, high damage',
            unlocked: false,
            unlockCost: { techPoints: 10 }
        },
        frost: {
            name: 'Frost Tower',
            cost: 300,
            damage: 10,
            range: 140,
            fireRate: 0.7,
            color: '#66ccff',
            projectileSpeed: 500,
            slowEffect: 0.5,
            slowDuration: 2,
            description: 'Slows enemies',
            unlocked: false,
            unlockCost: { techPoints: 8, essences: 5 }
        },
        poison: {
            name: 'Poison Tower',
            cost: 280,
            damage: 15,
            range: 160,
            fireRate: 1.0,
            color: '#00ff00',
            projectileSpeed: 450,
            dot: true,
            dotDamage: 5,
            dotDuration: 3,
            description: 'Damage over time',
            unlocked: false,
            unlockCost: { techPoints: 12, fragments: 10 }
        },
        multishot: {
            name: 'Multishot Tower',
            cost: 600,
            damage: 25,
            range: 170,
            fireRate: 1.2,
            color: '#ff9900',
            projectileSpeed: 600,
            multishot: 3,
            description: 'Fires multiple projectiles',
            unlocked: false,
            unlockCost: { techPoints: 15, cores: 2 }
        },
        beam: {
            name: 'Beam Tower',
            cost: 750,
            damage: 40,
            range: 200,
            fireRate: 0.0,  // Continuous beam
            color: '#ff0066',
            beam: true,
            description: 'Continuous energy beam',
            unlocked: false,
            unlockCost: { techPoints: 20, cores: 5, essences: 10 }
        },
        orbital: {
            name: 'Orbital Strike',
            cost: 1000,
            damage: 200,
            range: 250,
            fireRate: 5.0,
            color: '#ffffff',
            projectileSpeed: 0,  // Instant
            orbital: true,
            description: 'Calls down orbital strikes',
            unlocked: false,
            unlockCost: { techPoints: 30, cores: 10, fragments: 20 }
        }
    };

    // Enemy Types
    const EnemyTypes = {
        scout: {
            name: 'Scout',
            health: 50,
            speed: 100,
            value: 10,
            color: '#00ff00',
            size: 15
        },
        fighter: {
            name: 'Fighter',
            health: 100,
            speed: 80,
            value: 20,
            color: '#ff8800',
            size: 20
        },
        tank: {
            name: 'Tank',
            health: 300,
            speed: 40,
            value: 50,
            color: '#ff0000',
            size: 30
        },
        speedster: {
            name: 'Speedster',
            health: 75,
            speed: 200,
            value: 30,
            color: '#00ffff',
            size: 12
        },
        boss: {
            name: 'Boss',
            health: 1000,
            speed: 30,
            value: 200,
            color: '#ff00ff',
            size: 40
        }
    };

    // Base Classes
    class GameObject {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.active = true;
            this.id = Math.random().toString(36).substr(2, 9);
        }

        distanceTo(other) {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        angleTo(other) {
            return Math.atan2(other.y - this.y, other.x - this.x);
        }
    }

    class Tower extends GameObject {
        constructor(x, y, type) {
            super(x, y);
            this.type = type;
            const config = TowerTypes[type];
            Object.assign(this, config);
            this.level = 1;
            this.lastFire = 0;
            this.target = null;
            this.rotation = 0;
            this.kills = 0;
            this.svgElement = null;
            // New tower properties
            this.customName = null;
            this.xp = 0;
            this.xpToNextLevel = 100;
            this.towerLevel = 1;
            this.skillPoints = 0;
            this.skills = this.initializeSkills();
            this.damageDealt = 0;
            this.beamTarget = null;
            this.beamActive = false;
            this.createSVG();
        }

        initializeSkills() {
            // Each tower has its own skill tree
            return {
                damage: { level: 0, maxLevel: 10, cost: 1, multiplier: 1.1 },
                range: { level: 0, maxLevel: 10, cost: 1, multiplier: 1.05 },
                fireRate: { level: 0, maxLevel: 10, cost: 1, multiplier: 0.95 },
                special: { level: 0, maxLevel: 5, cost: 2, multiplier: 1.2 }
            };
        }

        gainXP(amount) {
            this.xp += amount;
            while (this.xp >= this.xpToNextLevel) {
                this.xp -= this.xpToNextLevel;
                this.levelUp();
            }
        }

        levelUp() {
            this.towerLevel++;
            this.skillPoints++;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
            
            // Visual feedback for level up
            createFloatingText(this.x, this.y - 30, 'LEVEL UP!', '#ffff00');
            createUpgradeEffect(this.x, this.y);
            
            console.log(`Tower ${this.customName || this.name} reached level ${this.towerLevel}!`);
        }

        upgradeSkill(skillName) {
            const skill = this.skills[skillName];
            if (skill && this.skillPoints > 0 && skill.level < skill.maxLevel) {
                skill.level++;
                this.skillPoints--;
                
                // Apply skill effects
                switch(skillName) {
                    case 'damage':
                        this.damage *= skill.multiplier;
                        break;
                    case 'range':
                        this.range *= skill.multiplier;
                        break;
                    case 'fireRate':
                        this.fireRate *= skill.multiplier;
                        break;
                    case 'special':
                        this.enhanceSpecialAbility();
                        break;
                }
                return true;
            }
            return false;
        }

        enhanceSpecialAbility() {
            // Enhance based on tower type
            if (this.splash) this.splashRadius *= 1.2;
            if (this.chain) this.chainCount++;
            if (this.piercing) this.damage *= 1.15;
            if (this.slowEffect) this.slowDuration *= 1.2;
            if (this.dotDamage) this.dotDamage *= 1.3;
            if (this.multishot) this.multishot++;
        }

        createSVG() {
            const svg = document.getElementById('svgTowers');
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${this.x}, ${this.y})`);
            
            // Tower base
            const base = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            base.setAttribute('x', '-15');
            base.setAttribute('y', '-15');
            base.setAttribute('width', '30');
            base.setAttribute('height', '30');
            base.setAttribute('fill', '#444');
            base.setAttribute('stroke', this.color);
            base.setAttribute('stroke-width', '2');
            
            // Tower turret
            const turret = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            turret.setAttribute('cx', '0');
            turret.setAttribute('cy', '0');
            turret.setAttribute('r', '10');
            turret.setAttribute('fill', this.color);
            turret.setAttribute('opacity', '0.8');
            
            // Range indicator (initially hidden)
            const range = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            range.setAttribute('cx', '0');
            range.setAttribute('cy', '0');
            range.setAttribute('r', this.range);
            range.setAttribute('fill', 'none');
            range.setAttribute('stroke', this.color);
            range.setAttribute('stroke-width', '1');
            range.setAttribute('opacity', '0');
            range.classList.add('tower-range');
            
            g.appendChild(range);
            g.appendChild(base);
            g.appendChild(turret);
            svg.appendChild(g);
            
            this.svgElement = g;
            this.turretElement = turret;
        }

        update(deltaTime) {
            // Find target
            if (!this.target || !this.target.active || this.distanceTo(this.target) > this.range) {
                this.target = this.findTarget();
            }

            // Rotate towards target
            if (this.target) {
                const targetAngle = this.angleTo(this.target);
                this.rotation = targetAngle;
                
                // Update turret rotation
                if (this.turretElement) {
                    this.turretElement.setAttribute('transform', `rotate(${targetAngle * 180 / Math.PI})`);
                }

                // Fire at target
                const now = Date.now();
                if (now - this.lastFire > this.fireRate * 1000) {
                    this.fire();
                    this.lastFire = now;
                }
            }
        }

        findTarget() {
            let closest = null;
            let minDist = this.range;

            for (const enemy of enemies) {
                if (!enemy.active) continue;
                const dist = this.distanceTo(enemy);
                if (dist < minDist) {
                    minDist = dist;
                    closest = enemy;
                }
            }

            return closest;
        }

        fire() {
            if (!this.target) return;

            const projectile = new Projectile(
                this.x, this.y,
                this.target,
                this.damage * this.level,
                this.projectileSpeed,
                this.color,
                this
            );
            projectiles.push(projectile);
            
            // Track damage dealt statistic
            this.damageDealt = (this.damageDealt || 0) + this.damage;

            // Fire effect
            createParticleEffect(this.x, this.y, this.color, 5);
            
            // Sound effect
            playSound('laser');
        }

        upgrade() {
            if (GameState.crystals >= this.cost * this.level) {
                GameState.crystals -= this.cost * this.level;
                this.level++;
                this.damage *= 1.2;
                this.range *= 1.1;
                this.fireRate *= 0.9;
                
                // Visual feedback
                createUpgradeEffect(this.x, this.y);
                return true;
            }
            return false;
        }

        sell() {
            const sellValue = Math.floor(this.cost * 0.7 * this.level);
            GameState.crystals += sellValue;
            this.active = false;
            
            if (this.svgElement) {
                this.svgElement.remove();
            }
            
            // Sell effect
            createParticleEffect(this.x, this.y, '#ffff00', 10);
        }
    }

    class Enemy extends GameObject {
        constructor(x, y, type) {
            super(x, y);
            this.type = type;
            const config = EnemyTypes[type];
            Object.assign(this, config);
            this.maxHealth = this.health;
            this.path = generatePath();
            this.pathIndex = 0;
            this.slowed = false;
            this.slowTimer = 0;
            this.svgElement = null;
            this.createSVG();
        }

        createSVG() {
            const svg = document.getElementById('svgEnemies');
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            // Enemy body
            const body = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const points = this.generatePolygonPoints(this.size);
            body.setAttribute('points', points);
            body.setAttribute('fill', this.color);
            body.setAttribute('stroke', '#000');
            body.setAttribute('stroke-width', '2');
            
            // Health bar background
            const healthBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            healthBg.setAttribute('x', -this.size);
            healthBg.setAttribute('y', -this.size - 10);
            healthBg.setAttribute('width', this.size * 2);
            healthBg.setAttribute('height', '4');
            healthBg.setAttribute('fill', '#333');
            
            // Health bar
            const healthBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            healthBar.setAttribute('x', -this.size);
            healthBar.setAttribute('y', -this.size - 10);
            healthBar.setAttribute('width', this.size * 2);
            healthBar.setAttribute('height', '4');
            healthBar.setAttribute('fill', '#00ff00');
            healthBar.classList.add('enemy-health');
            
            g.appendChild(body);
            g.appendChild(healthBg);
            g.appendChild(healthBar);
            svg.appendChild(g);
            
            this.svgElement = g;
            this.healthBar = healthBar;
            this.updateSVGPosition();
        }

        generatePolygonPoints(size) {
            const sides = 6;
            const points = [];
            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const x = Math.cos(angle) * size;
                const y = Math.sin(angle) * size;
                points.push(`${x},${y}`);
            }
            return points.join(' ');
        }

        update(deltaTime) {
            if (!this.active) return;

            // Movement
            const speed = this.slowed ? this.speed * 0.5 : this.speed;
            
            if (this.pathIndex < this.path.length - 1) {
                const target = this.path[this.pathIndex + 1];
                const dx = target.x - this.x;
                const dy = target.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 5) {
                    this.pathIndex++;
                } else {
                    const moveX = (dx / dist) * speed * deltaTime;
                    const moveY = (dy / dist) * speed * deltaTime;
                    this.x += moveX;
                    this.y += moveY;
                }
            } else {
                // Reached the end
                this.reachEnd();
            }

            // Update slow effect
            if (this.slowed) {
                this.slowTimer -= deltaTime;
                if (this.slowTimer <= 0) {
                    this.slowed = false;
                }
            }

            this.updateSVGPosition();
        }

        updateSVGPosition() {
            if (this.svgElement) {
                this.svgElement.setAttribute('transform', `translate(${this.x}, ${this.y})`);
                
                // Update health bar
                const healthPercent = this.health / this.maxHealth;
                this.healthBar.setAttribute('width', this.size * 2 * healthPercent);
                
                // Change color based on health
                if (healthPercent > 0.6) {
                    this.healthBar.setAttribute('fill', '#00ff00');
                } else if (healthPercent > 0.3) {
                    this.healthBar.setAttribute('fill', '#ffff00');
                } else {
                    this.healthBar.setAttribute('fill', '#ff0000');
                }
            }
        }

        takeDamage(damage, source) {
            this.health -= damage;
            this.lastHitBy = source;
            
            // Damage effect
            createDamageNumber(this.x, this.y - 20, damage);
            createParticleEffect(this.x, this.y, '#ff0000', 3);
            
            if (this.health <= 0) {
                this.die();
            }
        }

        die() {
            this.active = false;
            GameState.crystals += this.value;
            GameState.score += this.value * GameState.multiplier;
            GameState.enemiesDefeated++;
            
            // Death effect
            createExplosion(this.x, this.y, this.size);
            
            // Drop loot based on enemy type
            this.dropLoot();
            
            // Give XP to the tower that killed this enemy
            if (this.lastHitBy) {
                this.lastHitBy.gainXP(Math.floor(this.value / 2));
                this.lastHitBy.kills++;
            }
            
            if (this.svgElement) {
                this.svgElement.remove();
            }
            
            playSound('explosion');
        }

        dropLoot() {
            const rand = Math.random();
            
            // Crystal drop (30% chance)
            if (rand < 0.3) {
                crystals.push(new Crystal(this.x, this.y));
            }
            
            // Resource drops based on enemy type
            if (this.type === 'boss') {
                // Boss always drops cores
                createResourceDrop(this.x, this.y, 'core');
                if (Math.random() < 0.5) {
                    createResourceDrop(this.x + 20, this.y, 'essence');
                }
            } else if (this.type === 'tank') {
                if (Math.random() < 0.2) {
                    createResourceDrop(this.x, this.y, 'fragment');
                }
            } else if (this.type === 'speedster') {
                if (Math.random() < 0.15) {
                    createResourceDrop(this.x, this.y, 'essence');
                }
            }
            
            // Tech points chance (5% from any enemy)
            if (Math.random() < 0.05) {
                GameState.techPoints++;
                createFloatingText(this.x, this.y + 20, '+1 Tech', '#00ffff');
            }
        }

        reachEnd() {
            this.active = false;
            // Damage to base
            damageBase(10);
            
            if (this.svgElement) {
                this.svgElement.remove();
            }
        }

        slow(duration) {
            this.slowed = true;
            this.slowTimer = duration;
        }
    }

    class Projectile extends GameObject {
        constructor(x, y, target, damage, speed, color, owner) {
            super(x, y);
            this.target = target;
            this.damage = damage;
            this.speed = speed;
            this.color = color;
            this.owner = owner;
            this.trail = [];
        }

        update(deltaTime) {
            if (!this.active) return;

            // Track trail
            this.trail.push({ x: this.x, y: this.y, life: 1.0 });
            if (this.trail.length > 10) {
                this.trail.shift();
            }

            if (this.target && this.target.active) {
                const dx = this.target.x - this.x;
                const dy = this.target.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 10) {
                    // Hit target
                    this.hit();
                } else {
                    // Move towards target
                    const moveX = (dx / dist) * this.speed * deltaTime;
                    const moveY = (dy / dist) * this.speed * deltaTime;
                    this.x += moveX;
                    this.y += moveY;
                }
            } else {
                this.active = false;
            }
        }

        hit() {
            if (this.target) {
                this.target.takeDamage(this.damage, this.owner);
                
                // Special effects based on tower type
                if (this.owner.splash) {
                    this.splashDamage();
                }
                if (this.owner.chain) {
                    this.chainLightning();
                }
                if (this.owner.piercing) {
                    // Continue through enemy
                    this.findNewTarget();
                    return;
                }
                if (this.owner.slowEffect) {
                    this.target.slow(this.owner.slowDuration);
                }
                if (this.owner.dot) {
                    this.applyPoison();
                }
            }
            
            this.active = false;
        }

        applyPoison() {
            if (this.target && this.target.active) {
                const poisonEffect = {
                    target: this.target,
                    damage: this.owner.dotDamage,
                    duration: this.owner.dotDuration,
                    ticks: 0,
                    source: this.owner
                };
                // Add to effects list (we'll process these in update loop)
                effects.push(poisonEffect);
            }
        }

        splashDamage() {
            const radius = this.owner.splashRadius;
            for (const enemy of enemies) {
                if (enemy !== this.target && enemy.active) {
                    const dist = this.distanceTo(enemy);
                    if (dist < radius) {
                        const splashDamage = this.damage * (1 - dist / radius) * 0.5;
                        enemy.takeDamage(splashDamage);
                    }
                }
            }
            createExplosion(this.x, this.y, radius);
        }

        chainLightning() {
            let chainTargets = [];
            let lastTarget = this.target;
            
            for (let i = 0; i < this.owner.chainCount; i++) {
                let nextTarget = null;
                let minDist = 100;
                
                for (const enemy of enemies) {
                    if (enemy.active && !chainTargets.includes(enemy) && enemy !== lastTarget) {
                        const dist = lastTarget.distanceTo(enemy);
                        if (dist < minDist) {
                            minDist = dist;
                            nextTarget = enemy;
                        }
                    }
                }
                
                if (nextTarget) {
                    chainTargets.push(nextTarget);
                    nextTarget.takeDamage(this.damage * 0.7);
                    createLightningEffect(lastTarget.x, lastTarget.y, nextTarget.x, nextTarget.y);
                    lastTarget = nextTarget;
                } else {
                    break;
                }
            }
        }

        findNewTarget() {
            // Find next enemy in path
            let closest = null;
            let minDist = 100;
            
            for (const enemy of enemies) {
                if (enemy.active && enemy !== this.target) {
                    const dist = this.distanceTo(enemy);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = enemy;
                    }
                }
            }
            
            if (closest) {
                this.target = closest;
            } else {
                this.active = false;
            }
        }

        render(ctx) {
            if (!this.active) return;

            // Render trail
            ctx.save();
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                ctx.globalAlpha = (i / this.trail.length) * 0.5;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3 - (i * 0.2), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            // Render projectile
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class Crystal extends GameObject {
        constructor(x, y) {
            super(x, y);
            this.value = Math.floor(Math.random() * 20) + 10;
            this.lifetime = 10;
            this.bobOffset = Math.random() * Math.PI * 2;
            this.collected = false;
            this.createSVG();
        }

        createSVG() {
            const svg = document.getElementById('svgCrystals');
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            const crystal = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            crystal.setAttribute('points', '0,-15 10,-5 10,5 0,15 -10,5 -10,-5');
            crystal.setAttribute('fill', 'url(#crystalGradient)');
            crystal.setAttribute('stroke', '#ffffff');
            crystal.setAttribute('stroke-width', '1');
            
            // Glow effect
            const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            glow.setAttribute('cx', '0');
            glow.setAttribute('cy', '0');
            glow.setAttribute('r', '20');
            glow.setAttribute('fill', '#00ffff');
            glow.setAttribute('opacity', '0.3');
            
            g.appendChild(glow);
            g.appendChild(crystal);
            svg.appendChild(g);
            
            this.svgElement = g;
            
            // Rotation animation
            const rotate = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
            rotate.setAttribute('attributeName', 'transform');
            rotate.setAttribute('type', 'rotate');
            rotate.setAttribute('from', '0 0 0');
            rotate.setAttribute('to', '360 0 0');
            rotate.setAttribute('dur', '3s');
            rotate.setAttribute('repeatCount', 'indefinite');
            crystal.appendChild(rotate);
        }

        update(deltaTime) {
            if (!this.active || this.collected) return;

            this.lifetime -= deltaTime;
            if (this.lifetime <= 0) {
                this.active = false;
                if (this.svgElement) {
                    this.svgElement.remove();
                }
                return;
            }

            // Bobbing animation
            const bobY = Math.sin(Date.now() / 1000 + this.bobOffset) * 5;
            
            if (this.svgElement) {
                this.svgElement.setAttribute('transform', `translate(${this.x}, ${this.y + bobY})`);
                
                // Fade out when about to expire
                if (this.lifetime < 2) {
                    this.svgElement.setAttribute('opacity', this.lifetime / 2);
                }
            }

            // Check for mouse proximity for collection
            const mouseDistance = Math.sqrt(
                Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)
            );
            
            if (mouseDistance < 30) {
                this.collect();
            }
        }

        collect() {
            if (this.collected) return;
            
            this.collected = true;
            this.active = false;
            GameState.crystals += this.value;
            GameState.crystalsHarvested += this.value;
            
            // Collection effect
            createParticleEffect(this.x, this.y, '#00ffff', 10);
            createFloatingText(this.x, this.y, `+${this.value}`, '#00ffff');
            
            if (this.svgElement) {
                this.svgElement.remove();
            }
            
            playSound('collect');
        }
    }

    // Particle System
    class Particle {
        constructor(x, y, vx, vy, color, size, lifetime) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.size = size;
            this.lifetime = lifetime;
            this.maxLifetime = lifetime;
            this.active = true;
        }

        update(deltaTime) {
            if (!this.active) return;
            
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
            this.lifetime -= deltaTime;
            
            // Apply gravity
            this.vy += 200 * deltaTime;
            
            // Fade out
            if (this.lifetime <= 0) {
                this.active = false;
            }
        }

        render(ctx) {
            if (!this.active) return;
            
            const alpha = this.lifetime / this.maxLifetime;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Effects
    function createParticleEffect(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 200 + 100;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = Math.random() * 3 + 2;
            const lifetime = Math.random() * 0.5 + 0.5;
            
            particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
        }
    }

    function createExplosion(x, y, radius) {
        const svg = document.getElementById('svgEffects');
        const explosion = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        explosion.setAttribute('cx', x);
        explosion.setAttribute('cy', y);
        explosion.setAttribute('r', '0');
        explosion.setAttribute('fill', 'none');
        explosion.setAttribute('stroke', '#ff6600');
        explosion.setAttribute('stroke-width', '3');
        explosion.setAttribute('opacity', '1');
        
        svg.appendChild(explosion);
        
        // Animate explosion
        const startTime = Date.now();
        const duration = 500;
        
        function animateExplosion() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                explosion.setAttribute('r', radius * progress);
                explosion.setAttribute('opacity', 1 - progress);
                requestAnimationFrame(animateExplosion);
            } else {
                explosion.remove();
            }
        }
        
        animateExplosion();
        
        // Add particles
        createParticleEffect(x, y, '#ff6600', 20);
    }

    function createLightningEffect(x1, y1, x2, y2) {
        const svg = document.getElementById('svgEffects');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#ffff00');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('opacity', '1');
        
        svg.appendChild(line);
        
        // Animate and remove
        setTimeout(() => {
            line.setAttribute('opacity', '0.5');
            setTimeout(() => {
                line.remove();
            }, 100);
        }, 100);
    }

    function createDamageNumber(x, y, damage) {
        const svg = document.getElementById('svgEffects');
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('font-family', 'Orbitron');
        text.setAttribute('font-size', '20');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#ff0000');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = `-${damage}`;
        
        svg.appendChild(text);
        
        // Animate floating up and fading
        const startTime = Date.now();
        const duration = 1000;
        const startY = y;
        
        function animateDamage() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                text.setAttribute('y', startY - 30 * progress);
                text.setAttribute('opacity', 1 - progress);
                requestAnimationFrame(animateDamage);
            } else {
                text.remove();
            }
        }
        
        animateDamage();
    }

    function createFloatingText(x, y, message, color) {
        const svg = document.getElementById('svgEffects');
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('font-family', 'Orbitron');
        text.setAttribute('font-size', '16');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', color);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = message;
        
        svg.appendChild(text);
        
        // Animate
        const startTime = Date.now();
        const duration = 1500;
        const startY = y;
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                text.setAttribute('y', startY - 50 * progress);
                text.setAttribute('opacity', 1 - progress * 0.5);
                requestAnimationFrame(animate);
            } else {
                text.remove();
            }
        }
        
        animate();
    }

    function createUpgradeEffect(x, y) {
        const svg = document.getElementById('svgEffects');
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Create multiple rings
        for (let i = 0; i < 3; i++) {
            const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            ring.setAttribute('cx', x);
            ring.setAttribute('cy', y);
            ring.setAttribute('r', '0');
            ring.setAttribute('fill', 'none');
            ring.setAttribute('stroke', '#00ff00');
            ring.setAttribute('stroke-width', '2');
            ring.setAttribute('opacity', '1');
            
            g.appendChild(ring);
            
            // Animate with delay
            setTimeout(() => {
                const startTime = Date.now();
                const duration = 1000;
                
                function animateRing() {
                    const elapsed = Date.now() - startTime;
                    const progress = elapsed / duration;
                    
                    if (progress < 1) {
                        ring.setAttribute('r', 50 * progress);
                        ring.setAttribute('opacity', 1 - progress);
                        requestAnimationFrame(animateRing);
                    } else {
                        ring.remove();
                    }
                }
                
                animateRing();
            }, i * 200);
        }
        
        svg.appendChild(g);
        
        // Cleanup
        setTimeout(() => {
            g.remove();
        }, 2000);
    }

    // Path Generation
    function generatePath() {
        const path = [];
        const points = [
            { x: 0, y: 360 },
            { x: 200, y: 360 },
            { x: 200, y: 200 },
            { x: 400, y: 200 },
            { x: 400, y: 500 },
            { x: 600, y: 500 },
            { x: 600, y: 300 },
            { x: 800, y: 300 },
            { x: 800, y: 100 },
            { x: 1000, y: 100 },
            { x: 1000, y: 400 },
            { x: 1200, y: 400 },
            { x: 1200, y: 360 },
            { x: 1280, y: 360 }
        ];
        
        // Smooth path with interpolation
        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];
            const steps = 20;
            
            for (let j = 0; j <= steps; j++) {
                const t = j / steps;
                path.push({
                    x: start.x + (end.x - start.x) * t,
                    y: start.y + (end.y - start.y) * t
                });
            }
        }
        
        return path;
    }

    // Wave System
    class WaveManager {
        constructor() {
            this.waveNumber = 1;
            this.enemiesPerWave = 5;
            this.spawnDelay = 1000;
            this.lastSpawn = 0;
            this.enemiesSpawned = 0;
            this.waveActive = false;
            this.waveComplete = false;
        }

        startWave() {
            this.waveActive = true;
            this.waveComplete = false;
            this.enemiesSpawned = 0;
            this.enemiesPerWave = 5 + this.waveNumber * 2;
            
            // Update UI
            document.getElementById('waveNumber').textContent = this.waveNumber;
            
            // Show wave announcement
            createFloatingText(640, 200, `WAVE ${this.waveNumber}`, '#ff00ff');
        }

        update(deltaTime) {
            if (!this.waveActive) return;
            
            const now = Date.now();
            
            if (this.enemiesSpawned < this.enemiesPerWave) {
                if (now - this.lastSpawn > this.spawnDelay) {
                    this.spawnEnemy();
                    this.lastSpawn = now;
                    this.enemiesSpawned++;
                }
            } else {
                // Check if wave is complete
                if (enemies.filter(e => e.active).length === 0) {
                    this.waveComplete = true;
                    this.waveActive = false;
                    this.onWaveComplete();
                }
            }
        }

        spawnEnemy() {
            let type = 'scout';
            
            // Determine enemy type based on wave
            const rand = Math.random();
            if (this.waveNumber > 10 && rand < 0.1) {
                type = 'boss';
            } else if (this.waveNumber > 7 && rand < 0.2) {
                type = 'tank';
            } else if (this.waveNumber > 5 && rand < 0.3) {
                type = 'speedster';
            } else if (this.waveNumber > 3 && rand < 0.5) {
                type = 'fighter';
            }
            
            const enemy = new Enemy(0, 360, type);
            enemies.push(enemy);
        }

        onWaveComplete() {
            // Bonus rewards
            const bonus = this.waveNumber * 50;
            GameState.crystals += bonus;
            GameState.score += bonus * 10;
            
            createFloatingText(640, 300, `Wave Complete! +${bonus} Crystals`, '#00ff00');
            
            // Prepare next wave
            this.waveNumber++;
            GameState.wave = this.waveNumber;
            
            // Start next wave after delay
            setTimeout(() => {
                this.startWave();
            }, 5000);
        }
    }

    // Input Handling
    let mouseX = 0;
    let mouseY = 0;
    let selectedTowerType = null;

    function handleMouseMove(e) {
        const rect = gameCanvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) * (CONFIG.CANVAS_WIDTH / rect.width);
        mouseY = (e.clientY - rect.top) * (CONFIG.CANVAS_HEIGHT / rect.height);
        
        // Clear UI canvas for placement ghost update
        if (selectedTowerType) {
            uiCtx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            renderPlacementGhost();
        }
        
        // Check for tower hover
        const hoveredTower = getTowerAt(mouseX, mouseY);
        if (hoveredTower) {
            showTowerTooltip(hoveredTower, e.clientX, e.clientY);
        } else {
            hideTowerTooltip();
        }
    }
    
    function showTowerTooltip(tower, clientX, clientY) {
        const tooltip = document.getElementById('towerTooltip');
        
        // Update tooltip content
        document.getElementById('tooltipTitle').textContent = tower.customName || tower.name;
        document.getElementById('tooltipLevel').textContent = tower.towerLevel;
        document.getElementById('tooltipKills').textContent = tower.kills;
        document.getElementById('tooltipDamage').textContent = Math.round(tower.damage);
        document.getElementById('tooltipRange').textContent = Math.round(tower.range);
        document.getElementById('tooltipFireRate').textContent = (tower.fireRate).toFixed(2) + 's';
        document.getElementById('tooltipTotalDamage').textContent = Math.round(tower.damageDealt || 0);
        document.getElementById('tooltipXP').textContent = `${tower.xp}/${tower.xpToNextLevel}`;
        document.getElementById('tooltipSkillPoints').textContent = tower.skillPoints;
        
        // Update XP bar
        const xpPercent = (tower.xp / tower.xpToNextLevel) * 100;
        document.getElementById('tooltipXPBar').style.width = xpPercent + '%';
        
        // Position tooltip
        tooltip.style.left = (clientX + 15) + 'px';
        tooltip.style.top = (clientY - 100) + 'px';
        tooltip.classList.add('active');
    }
    
    function hideTowerTooltip() {
        const tooltip = document.getElementById('towerTooltip');
        tooltip.classList.remove('active');
    }

    function handleMouseClick(e) {
        if (GameState.isPaused || GameState.isGameOver) return;
        
        const rect = gameCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (CONFIG.CANVAS_WIDTH / rect.width);
        const y = (e.clientY - rect.top) * (CONFIG.CANVAS_HEIGHT / rect.height);
        
        if (selectedTowerType) {
            // Try to place tower
            placeTower(x, y, selectedTowerType);
        } else {
            // Check for tower selection
            const tower = getTowerAt(x, y);
            if (tower) {
                // Show tower menu
                showTowerMenu(tower);
            }
        }
    }

    function handleRightClick(e) {
        e.preventDefault();
        selectedTowerType = null;
        updateCursor();
    }

    function handleKeyPress(e) {
        switch(e.key) {
            case ' ':
                togglePause();
                break;
            case '1':
                selectTowerType('laser');
                break;
            case '2':
                selectTowerType('missile');
                break;
            case '3':
                selectTowerType('plasma');
                break;
            case '4':
                selectTowerType('tesla');
                break;
            case 'q':
            case 'Q':
                activateAbility('freeze');
                break;
            case 'w':
            case 'W':
                activateAbility('bomb');
                break;
            case 'e':
            case 'E':
                activateAbility('boost');
                break;
            case 'Shift':
                GameState.fastForward = !GameState.fastForward;
                break;
            // Cheat codes for testing (remove in production)
            case '=':
            case '+':
                // Add resources for testing
                GameState.crystals += 1000;
                GameState.techPoints += 10;
                GameState.essences += 10;
                GameState.fragments += 10;
                GameState.cores += 5;
                createFloatingText(640, 360, 'Resources Added!', '#00ff00');
                break;
        }
    }

    function selectTowerType(type) {
        if (GameState.crystals >= TowerTypes[type].cost) {
            selectedTowerType = type;
            updateCursor();
            console.log('Selected tower type:', type);
            // Clear and redraw UI canvas
            uiCtx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        } else {
            createFloatingText(640, 360, 'Not enough crystals!', '#ff0000');
        }
    }

    function placeTower(x, y, type) {
        console.log('Placing tower at:', x, y, 'Type:', type);
        
        // Snap to grid
        const gridX = Math.floor(x / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
        const gridY = Math.floor(y / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
        
        console.log('Grid position:', gridX, gridY);
        
        // Check if position is valid
        if (!isValidTowerPosition(gridX, gridY)) {
            createFloatingText(x, y, 'Invalid position!', '#ff0000');
            return;
        }
        
        // Check cost
        const cost = TowerTypes[type].cost;
        if (GameState.crystals < cost) {
            createFloatingText(x, y, 'Not enough crystals!', '#ff0000');
            return;
        }
        
        // Create tower
        const tower = new Tower(gridX, gridY, type);
        towers.push(tower);
        
        // Deduct cost
        GameState.crystals -= cost;
        GameState.towersBuilt++;
        
        // Effects
        createParticleEffect(gridX, gridY, '#00ff00', 10);
        playSound('build');
        
        // Clear selection and UI
        selectedTowerType = null;
        uiCtx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        updateCursor();
    }

    function isValidTowerPosition(x, y) {
        // Check if position is on path
        const path = generatePath();
        for (const point of path) {
            const dist = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
            if (dist < CONFIG.GRID_SIZE) {
                return false;
            }
        }
        
        // Check if position overlaps with existing tower
        for (const tower of towers) {
            if (tower.active) {
                const dist = Math.sqrt(Math.pow(tower.x - x, 2) + Math.pow(tower.y - y, 2));
                if (dist < CONFIG.GRID_SIZE) {
                    return false;
                }
            }
        }
        
        return true;
    }

    function getTowerAt(x, y) {
        for (const tower of towers) {
            if (tower.active) {
                const dist = Math.sqrt(Math.pow(tower.x - x, 2) + Math.pow(tower.y - y, 2));
                if (dist < CONFIG.GRID_SIZE / 2) {
                    return tower;
                }
            }
        }
        return null;
    }

    let selectedTower = null;
    
    function showTowerMenu(tower) {
        selectedTower = tower;
        const panel = document.getElementById('towerInfoPanel');
        panel.style.display = 'block';
        
        // Update tower info
        document.getElementById('towerTitle').textContent = tower.customName || tower.name;
        document.getElementById('towerNameInput').value = tower.customName || '';
        document.getElementById('towerLevel').textContent = tower.towerLevel;
        document.getElementById('towerXP').textContent = `${tower.xp}/${tower.xpToNextLevel}`;
        document.getElementById('towerKills').textContent = tower.kills;
        document.getElementById('towerDamage').textContent = Math.round(tower.damage);
        document.getElementById('towerSkillPoints').textContent = tower.skillPoints;
        
        // Update skill levels
        document.getElementById('skill-damage').textContent = `${tower.skills.damage.level}/10`;
        document.getElementById('skill-range').textContent = `${tower.skills.range.level}/10`;
        document.getElementById('skill-fireRate').textContent = `${tower.skills.fireRate.level}/10`;
        document.getElementById('skill-special').textContent = `${tower.skills.special.level}/5`;
        
        // Add name change listener
        document.getElementById('towerNameInput').onchange = function(e) {
            tower.customName = e.target.value;
        };
    }
    
    window.closeTowerInfo = function() {
        document.getElementById('towerInfoPanel').style.display = 'none';
        selectedTower = null;
    };
    
    window.upgradeTowerSkill = function(skillName) {
        if (selectedTower && selectedTower.upgradeSkill(skillName)) {
            showTowerMenu(selectedTower); // Refresh UI
            playSound('levelup');
        }
    };
    
    window.sellSelectedTower = function() {
        if (selectedTower) {
            selectedTower.sell();
            closeTowerInfo();
        }
    };
    
    window.closeGlobalSkillTree = function() {
        document.getElementById('globalSkillTree').style.display = 'none';
    };

    function updateCursor() {
        if (selectedTowerType) {
            gameCanvas.style.cursor = 'crosshair';
            uiCanvas.style.cursor = 'crosshair';
        } else {
            gameCanvas.style.cursor = 'default';
            uiCanvas.style.cursor = 'default';
        }
    }

    // Abilities
    const abilities = {
        freeze: {
            cooldown: 10,
            lastUsed: 0,
            effect: () => {
                for (const enemy of enemies) {
                    if (enemy.active) {
                        enemy.slow(3);
                    }
                }
                createFloatingText(640, 360, 'FREEZE!', '#00ffff');
                // Visual effect
                effectsCtx.save();
                effectsCtx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                effectsCtx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
                effectsCtx.restore();
                setTimeout(() => {
                    effectsCtx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
                }, 200);
            }
        },
        bomb: {
            cooldown: 15,
            lastUsed: 0,
            effect: () => {
                const damage = 100;
                for (const enemy of enemies) {
                    if (enemy.active) {
                        enemy.takeDamage(damage);
                    }
                }
                createFloatingText(640, 360, 'BOMB!', '#ff6600');
                createExplosion(640, 360, 300);
            }
        },
        boost: {
            cooldown: 20,
            lastUsed: 0,
            effect: () => {
                for (const tower of towers) {
                    if (tower.active) {
                        tower.fireRate *= 0.5;
                        setTimeout(() => {
                            tower.fireRate *= 2;
                        }, 5000);
                    }
                }
                createFloatingText(640, 360, 'BOOST!', '#00ff00');
            }
        }
    };

    function activateAbility(name) {
        const ability = abilities[name];
        const now = Date.now();
        
        if (now - ability.lastUsed < ability.cooldown * 1000) {
            const remaining = Math.ceil((ability.cooldown * 1000 - (now - ability.lastUsed)) / 1000);
            createFloatingText(640, 400, `Cooldown: ${remaining}s`, '#ff0000');
            return;
        }
        
        ability.effect();
        ability.lastUsed = now;
        
        // Update UI
        const btn = document.getElementById(`ability-${name}`);
        if (btn) {
            const overlay = btn.querySelector('.cooldown-overlay');
            overlay.style.height = '100%';
            
            const interval = setInterval(() => {
                const elapsed = Date.now() - ability.lastUsed;
                const percent = 1 - (elapsed / (ability.cooldown * 1000));
                
                if (percent <= 0) {
                    overlay.style.height = '0%';
                    clearInterval(interval);
                } else {
                    overlay.style.height = `${percent * 100}%`;
                }
            }, 100);
        }
    }

    // Game State Management
    function togglePause() {
        GameState.isPaused = !GameState.isPaused;
        
        const pauseMenu = document.getElementById('pauseMenu');
        if (GameState.isPaused) {
            pauseMenu.style.display = 'flex';
        } else {
            pauseMenu.style.display = 'none';
        }
    }

    function damageBase(amount) {
        // Base health system
        // If base is destroyed, game over
        createFloatingText(1200, 360, `-${amount} HP`, '#ff0000');
        
        // Check game over
        // For now, just reduce score
        GameState.score = Math.max(0, GameState.score - amount * 100);
    }

    // Multi-Track Music System
    class MusicTrack {
        constructor(name, style, tempo, scale, chordProgressions, patterns) {
            this.name = name;
            this.style = style;
            this.tempo = tempo;
            this.scale = scale;
            this.chordProgressions = chordProgressions;
            this.patterns = patterns;
        }
    }
    
    class MusicPlayer {
        constructor(audioContext) {
            this.ctx = audioContext;
            this.isPlaying = false;
            this.nextNoteTime = 0;
            this.noteLength = 0.5;
            this.currentStep = 0;
            this.currentTrackIndex = 0;
            this.currentChord = 0;
            this.gain = this.ctx.createGain();
            this.gain.gain.value = 0.3; // Music volume
            this.gain.connect(this.ctx.destination);
            
            // Initialize tracks
            this.tracks = this.createTracks();
            this.currentTrack = this.tracks[0];
            
            // Effects
            this.reverb = this.createReverb();
            this.delay = this.createDelay();
            this.filter = this.ctx.createBiquadFilter();
            this.filter.type = 'lowpass';
            this.filter.frequency.value = 800;
            this.filter.Q.value = 10;
            this.filter.connect(this.reverb);
            this.reverb.connect(this.delay);
            this.delay.connect(this.gain);
        }
        
        createTracks() {
            return [
                new MusicTrack(
                    "Cosmic Drift",
                    "ambient",
                    70,
                    [130.81, 146.83, 155.56, 174.61, 196.00, 207.65, 233.08],
                    [[0, 2, 4], [3, 5, 0], [4, 6, 1], [2, 4, 6]],
                    {
                        bass: [1, 0, 0, 1, 0, 1, 0, 0],
                        hihat: [1, 1, 0, 1, 1, 0, 1, 0],
                        kick: [1, 0, 0, 0, 1, 0, 0, 0]
                    }
                ),
                new MusicTrack(
                    "Nebula Dreams",
                    "ethereal",
                    60,
                    [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88],
                    [[0, 2, 4], [5, 0, 2], [3, 5, 0], [1, 3, 5]],
                    {
                        bass: [1, 0, 0, 0, 1, 0, 0, 0],
                        hihat: [0, 0, 1, 0, 0, 0, 1, 0],
                        kick: [1, 0, 0, 0, 0, 0, 0, 0]
                    }
                ),
                new MusicTrack(
                    "Asteroid Belt",
                    "techno",
                    128,
                    [164.81, 185.00, 196.00, 220.00, 246.94, 261.63, 293.66],
                    [[0, 3, 5], [2, 4, 6], [1, 4, 6], [0, 2, 5]],
                    {
                        bass: [1, 0, 1, 0, 1, 0, 1, 0],
                        hihat: [1, 1, 1, 1, 1, 1, 1, 1],
                        kick: [1, 0, 0, 1, 1, 0, 0, 1]
                    }
                ),
                new MusicTrack(
                    "Solar Winds",
                    "chillwave",
                    85,
                    [220.00, 246.94, 277.18, 293.66, 329.63, 369.99, 415.30],
                    [[0, 2, 4, 6], [1, 3, 5], [2, 4, 6], [3, 5, 0]],
                    {
                        bass: [1, 0, 0, 1, 0, 0, 1, 0],
                        hihat: [0, 1, 0, 1, 0, 1, 0, 1],
                        kick: [1, 0, 0, 0, 0, 0, 1, 0]
                    }
                ),
                new MusicTrack(
                    "Dark Matter",
                    "darkwave",
                    90,
                    [110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00],
                    [[0, 2, 3], [4, 6, 0], [1, 3, 5], [2, 4, 6]],
                    {
                        bass: [1, 1, 0, 1, 1, 0, 0, 0],
                        hihat: [1, 0, 1, 0, 1, 0, 1, 1],
                        kick: [1, 0, 0, 1, 0, 0, 1, 0]
                    }
                ),
                new MusicTrack(
                    "Plasma Storm",
                    "dnb",
                    160,
                    [174.61, 196.00, 220.00, 233.08, 261.63, 293.66, 329.63],
                    [[0, 2, 5], [3, 5, 0], [1, 3, 6], [4, 6, 1]],
                    {
                        bass: [1, 0, 1, 1, 0, 1, 1, 0],
                        hihat: [1, 1, 0, 1, 1, 1, 0, 1],
                        kick: [1, 0, 0, 0, 0, 1, 0, 0]
                    }
                ),
                new MusicTrack(
                    "Quantum Echo",
                    "glitch",
                    110,
                    [196.00, 207.65, 233.08, 261.63, 277.18, 311.13, 349.23],
                    [[0, 3, 4], [2, 5, 6], [1, 4, 5], [3, 6, 0]],
                    {
                        bass: [1, 0, 1, 0, 0, 1, 0, 1],
                        hihat: [1, 0, 0, 1, 1, 0, 1, 0],
                        kick: [1, 1, 0, 0, 1, 0, 0, 0]
                    }
                ),
                new MusicTrack(
                    "Gravity Well",
                    "dubstep",
                    70,
                    [87.31, 98.00, 110.00, 116.54, 130.81, 146.83, 164.81],
                    [[0, 2, 4], [1, 3, 5], [2, 4, 6], [0, 3, 6]],
                    {
                        bass: [1, 0, 0, 0, 0, 0, 1, 0],
                        hihat: [0, 0, 1, 0, 0, 1, 0, 1],
                        kick: [1, 0, 0, 0, 0, 0, 0, 1]
                    }
                ),
                new MusicTrack(
                    "Stellar Voyage",
                    "synthwave",
                    105,
                    [261.63, 293.66, 311.13, 349.23, 392.00, 440.00, 493.88],
                    [[0, 2, 4], [4, 6, 1], [2, 4, 6], [5, 0, 2]],
                    {
                        bass: [1, 0, 0, 1, 1, 0, 0, 1],
                        hihat: [1, 0, 1, 0, 1, 0, 1, 0],
                        kick: [1, 0, 0, 0, 1, 0, 0, 0]
                    }
                ),
                new MusicTrack(
                    "Ion Drive",
                    "industrial",
                    120,
                    [146.83, 164.81, 174.61, 196.00, 220.00, 233.08, 261.63],
                    [[0, 3, 5], [1, 4, 6], [2, 5, 0], [3, 6, 1]],
                    {
                        bass: [1, 1, 0, 1, 1, 1, 0, 1],
                        hihat: [1, 1, 1, 0, 1, 1, 1, 0],
                        kick: [1, 0, 1, 0, 1, 0, 1, 0]
                    }
                ),
                new MusicTrack(
                    "Warp Field",
                    "psytrance",
                    145,
                    [138.59, 155.56, 164.81, 185.00, 207.65, 220.00, 246.94],
                    [[0, 2, 4], [1, 3, 5], [3, 5, 0], [2, 4, 6]],
                    {
                        bass: [1, 1, 1, 1, 1, 1, 1, 1],
                        hihat: [0, 1, 0, 1, 0, 1, 0, 1],
                        kick: [1, 0, 0, 1, 1, 0, 0, 1]
                    }
                ),
                new MusicTrack(
                    "Zero Gravity",
                    "lofi",
                    75,
                    [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 349.23],
                    [[0, 2, 4, 6], [3, 5, 0, 2], [1, 3, 5], [4, 6, 1, 3]],
                    {
                        bass: [1, 0, 0, 0, 1, 0, 0, 0],
                        hihat: [0, 1, 0, 0, 0, 1, 0, 0],
                        kick: [1, 0, 0, 0, 0, 0, 0, 0]
                    }
                )
            ];
        }
        
        createReverb() {
            const convolver = this.ctx.createConvolver();
            const length = this.ctx.sampleRate * 3;
            const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
                }
            }
            
            convolver.buffer = impulse;
            return convolver;
        }
        
        createDelay() {
            const delay = this.ctx.createDelay(1);
            const feedback = this.ctx.createGain();
            const wetGain = this.ctx.createGain();
            
            delay.delayTime.value = 0.375; // Dotted eighth
            feedback.gain.value = 0.4;
            wetGain.gain.value = 0.3;
            
            delay.connect(feedback);
            feedback.connect(delay);
            delay.connect(wetGain);
            
            return wetGain;
        }
        
        playNote(frequency, time, duration = 0.1, type = 'sine', gain = 0.3) {
            const osc = this.ctx.createOscillator();
            const env = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, time);
            
            env.gain.setValueAtTime(0, time);
            env.gain.exponentialRampToValueAtTime(gain, time + 0.01);
            env.gain.exponentialRampToValueAtTime(0.001, time + duration);
            
            osc.connect(env);
            env.connect(this.filter);
            
            osc.start(time);
            osc.stop(time + duration + 0.1);
        }
        
        playBass(time) {
            const pattern = this.currentTrack.patterns.bass;
            if (pattern[this.currentStep % 8] === 1) {
                const bassScale = this.currentTrack.scale.map(f => f / 4);
                const note = bassScale[Math.floor(Math.random() * bassScale.length)];
                
                // Style-specific bass sounds
                let type = 'sawtooth';
                let gain = 0.4;
                
                if (this.currentTrack.style === 'dubstep') {
                    type = 'square';
                    gain = 0.5;
                } else if (this.currentTrack.style === 'dnb') {
                    type = 'sawtooth';
                    gain = 0.3;
                    // Reese bass
                    this.playNote(note * 1.01, time, 0.5, type, gain);
                }
                
                this.playNote(note, time, 0.5, type, gain);
                // Sub bass
                this.playNote(note / 2, time, 0.5, 'sine', 0.3);
            }
        }
        
        playChord(time) {
            if (this.currentStep % 4 === 0) {
                const chord = this.currentTrack.chordProgressions[this.currentChord];
                const waveform = this.currentTrack.style === 'synthwave' ? 'sawtooth' : 
                                this.currentTrack.style === 'ethereal' ? 'sine' : 'triangle';
                
                chord.forEach((noteIndex, i) => {
                    const freq = this.currentTrack.scale[noteIndex] * 2;
                    this.playNote(freq, time + i * 0.01, 2, waveform, 0.1);
                });
                
                if (this.currentStep % 16 === 0) {
                    this.currentChord = (this.currentChord + 1) % this.currentTrack.chordProgressions.length;
                }
            }
        }
        
        playArpeggio(time) {
            const skipArp = ['dubstep', 'industrial', 'psytrance'].includes(this.currentTrack.style);
            if (!skipArp && this.currentStep % 2 === 0 && Math.random() > 0.3) {
                const noteIndex = Math.floor(Math.random() * this.currentTrack.scale.length);
                const freq = this.currentTrack.scale[noteIndex] * 4;
                this.playNote(freq, time, 0.1, 'sine', 0.05);
                
                // Echo for certain styles
                if (['ambient', 'ethereal', 'chillwave'].includes(this.currentTrack.style)) {
                    setTimeout(() => {
                        this.playNote(freq * 1.5, time, 0.05, 'sine', 0.02);
                    }, 100);
                }
            }
        }
        
        playDrums(time) {
            const kickPattern = this.currentTrack.patterns.kick;
            const hihatPattern = this.currentTrack.patterns.hihat;
            
            // Kick
            if (kickPattern[this.currentStep % 8] === 1) {
                const kick = this.ctx.createOscillator();
                const kickEnv = this.ctx.createGain();
                
                kick.frequency.setValueAtTime(60, time);
                kick.frequency.exponentialRampToValueAtTime(0.1, time + 0.5);
                
                kickEnv.gain.setValueAtTime(0.7, time);
                kickEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
                
                kick.connect(kickEnv);
                kickEnv.connect(this.gain);
                
                kick.start(time);
                kick.stop(time + 0.5);
            }
            
            // Hi-hat
            if (hihatPattern[this.currentStep % 8] === 1) {
                const noise = this.ctx.createBufferSource();
                const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
                const data = noiseBuffer.getChannelData(0);
                
                for (let i = 0; i < data.length; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                
                noise.buffer = noiseBuffer;
                
                const hihatFilter = this.ctx.createBiquadFilter();
                hihatFilter.type = 'highpass';
                hihatFilter.frequency.value = 8000;
                
                const hihatEnv = this.ctx.createGain();
                hihatEnv.gain.setValueAtTime(0.1, time);
                hihatEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
                
                noise.connect(hihatFilter);
                hihatFilter.connect(hihatEnv);
                hihatEnv.connect(this.gain);
                
                noise.start(time);
            }
        }
        
        playAmbientSweep(time) {
            if (Math.random() > 0.9) {
                const sweep = this.ctx.createOscillator();
                const sweepEnv = this.ctx.createGain();
                const sweepFilter = this.ctx.createBiquadFilter();
                
                sweep.type = 'sawtooth';
                sweep.frequency.setValueAtTime(100, time);
                sweep.frequency.exponentialRampToValueAtTime(2000, time + 4);
                
                sweepFilter.type = 'bandpass';
                sweepFilter.frequency.setValueAtTime(200, time);
                sweepFilter.frequency.exponentialRampToValueAtTime(1000, time + 4);
                sweepFilter.Q.value = 5;
                
                sweepEnv.gain.setValueAtTime(0, time);
                sweepEnv.gain.linearRampToValueAtTime(0.02, time + 2);
                sweepEnv.gain.linearRampToValueAtTime(0, time + 4);
                
                sweep.connect(sweepFilter);
                sweepFilter.connect(sweepEnv);
                sweepEnv.connect(this.reverb);
                
                sweep.start(time);
                sweep.stop(time + 4);
            }
        }
        
        scheduler() {
            if (!this.isPlaying) return;
            
            const currentTime = this.ctx.currentTime;
            
            while (this.nextNoteTime < currentTime + 0.1) {
                const time = this.nextNoteTime;
                
                this.playBass(time);
                this.playChord(time);
                this.playArpeggio(time);
                this.playDrums(time);
                this.playAmbientSweep(time);
                
                // Advance to next step
                this.nextNoteTime += 60 / this.currentTrack.tempo / 4; // 16th notes
                this.currentStep++;
                
                // Add some randomness to filter for movement
                if (this.currentStep % 8 === 0) {
                    this.filter.frequency.exponentialRampToValueAtTime(
                        400 + Math.random() * 600,
                        currentTime + 0.5
                    );
                }
            }
            
            setTimeout(() => this.scheduler(), 25);
        }
        
        start() {
            if (this.isPlaying) return;
            this.isPlaying = true;
            this.nextNoteTime = this.ctx.currentTime;
            this.currentStep = 0;
            
            // Fade in
            this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 2);
            
            this.scheduler();
        }
        
        stop() {
            this.isPlaying = false;
            // Fade out
            this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
        }
        
        setVolume(value) {
            this.gain.gain.value = value * 0.5; // Max 0.5 for background music
        }
        
        nextTrack() {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
            this.currentTrack = this.tracks[this.currentTrackIndex];
            this.currentStep = 0;
            this.currentChord = 0;
            return this.currentTrack;
        }
        
        prevTrack() {
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
            this.currentTrack = this.tracks[this.currentTrackIndex];
            this.currentStep = 0;
            this.currentChord = 0;
            return this.currentTrack;
        }
        
        setTrack(index) {
            if (index >= 0 && index < this.tracks.length) {
                this.currentTrackIndex = index;
                this.currentTrack = this.tracks[index];
                this.currentStep = 0;
                this.currentChord = 0;
                return this.currentTrack;
            }
            return null;
        }
        
        getCurrentTrackName() {
            return this.currentTrack.name;
        }
    }
    
    // Sound System
    const SoundManager = {
        sounds: {},
        audioContext: null,
        sfxEnabled: true,
        musicEnabled: true,
        sfxVolume: 0.5,
        musicVolume: 0.3,
        musicPlayer: null,
        
        init() {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.createSounds();
                
                // Initialize music player
                this.musicPlayer = new MusicPlayer(this.audioContext);
                if (this.musicEnabled) {
                    // Start music after a short delay
                    setTimeout(() => {
                        if (this.musicEnabled && this.audioContext.state === 'running') {
                            this.musicPlayer.start();
                        }
                    }, 1000);
                }
            } catch (e) {
                console.log('Web Audio API not supported');
            }
        },
        
        createSounds() {
            // Create oscillator-based sound effects
            this.sounds = {
                laser: () => this.createLaserSound(),
                explosion: () => this.createExplosionSound(),
                collect: () => this.createCollectSound(),
                build: () => this.createBuildSound(),
                levelup: () => this.createLevelUpSound(),
                freeze: () => this.createFreezeSound()
            };
        },
        
        createLaserSound() {
            if (!this.audioContext || !this.sfxEnabled) return;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
            gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.1);
        },
        
        createExplosionSound() {
            if (!this.audioContext || !this.sfxEnabled) return;
            const noise = this.audioContext.createBufferSource();
            const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < buffer.length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            noise.buffer = buffer;
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(500, this.audioContext.currentTime);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            gain.gain.setValueAtTime(this.sfxVolume * 0.5, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            noise.start(this.audioContext.currentTime);
        },
        
        createCollectSound() {
            if (!this.audioContext || !this.sfxEnabled) return;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.15);
            gain.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.15);
        },
        
        createBuildSound() {
            if (!this.audioContext || !this.sfxEnabled) return;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
            osc.frequency.linearRampToValueAtTime(400, this.audioContext.currentTime + 0.2);
            gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.2);
        },
        
        createLevelUpSound() {
            if (!this.audioContext || !this.sfxEnabled) return;
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    osc.frequency.setValueAtTime(400 + i * 200, this.audioContext.currentTime);
                    gain.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    osc.start(this.audioContext.currentTime);
                    osc.stop(this.audioContext.currentTime + 0.1);
                }, i * 100);
            }
        },
        
        createFreezeSound() {
            if (!this.audioContext || !this.sfxEnabled) return;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            osc.frequency.linearRampToValueAtTime(500, this.audioContext.currentTime + 0.5);
            gain.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.5);
        },
        
        play(soundName) {
            if (this.sfxEnabled && this.sounds[soundName]) {
                try {
                    this.sounds[soundName]();
                } catch (e) {
                    console.log('Error playing sound:', soundName);
                }
            }
        },
        
        toggleSFX() {
            this.sfxEnabled = !this.sfxEnabled;
            return this.sfxEnabled;
        },
        
        toggleMusic() {
            this.musicEnabled = !this.musicEnabled;
            
            if (this.musicPlayer) {
                if (this.musicEnabled) {
                    this.musicPlayer.start();
                } else {
                    this.musicPlayer.stop();
                }
            }
            
            return this.musicEnabled;
        },
        
        setSFXVolume(value) {
            this.sfxVolume = Math.max(0, Math.min(1, value));
        },
        
        setMusicVolume(value) {
            this.musicVolume = Math.max(0, Math.min(1, value));
            if (this.musicPlayer) {
                this.musicPlayer.setVolume(this.musicVolume);
            }
        },
        
        nextTrack() {
            if (this.musicPlayer) {
                return this.musicPlayer.nextTrack();
            }
        },
        
        prevTrack() {
            if (this.musicPlayer) {
                return this.musicPlayer.prevTrack();
            }
        }
    };
    
    // Make SoundManager globally available
    window.SoundManager = SoundManager;

    function playSound(name) {
        SoundManager.play(name);
    }

    // Rendering
    function render() {
        // Clear all canvases
        gameCtx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        effectsCtx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Render game entities
        renderPath();
        renderTowerRanges();
        renderProjectiles();
        renderParticles();
        renderResourceDrops();
        
        // Clear UI canvas before rendering placement ghost
        uiCtx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        renderPlacementGhost();
    }

    function renderPath() {
        const path = generatePath();
        
        bgCtx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        bgCtx.lineWidth = CONFIG.GRID_SIZE;
        bgCtx.lineCap = 'round';
        bgCtx.lineJoin = 'round';
        
        bgCtx.beginPath();
        bgCtx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            bgCtx.lineTo(path[i].x, path[i].y);
        }
        
        bgCtx.stroke();
        
        // Add path markers
        bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        bgCtx.lineWidth = 2;
        bgCtx.setLineDash([10, 5]);
        bgCtx.stroke();
        bgCtx.setLineDash([]);
    }

    function renderTowerRanges() {
        // Show range when hovering over tower
        const tower = getTowerAt(mouseX, mouseY);
        if (tower) {
            gameCtx.save();
            gameCtx.strokeStyle = tower.color;
            gameCtx.lineWidth = 1;
            gameCtx.globalAlpha = 0.3;
            gameCtx.beginPath();
            gameCtx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
            gameCtx.stroke();
            gameCtx.restore();
        }
    }

    function renderProjectiles() {
        for (const projectile of projectiles) {
            if (projectile.active) {
                projectile.render(effectsCtx);
            }
        }
    }

    function renderParticles() {
        for (const particle of particles) {
            if (particle.active) {
                particle.render(effectsCtx);
            }
        }
    }

    function renderPlacementGhost() {
        if (selectedTowerType && mouseX && mouseY) {
            const gridX = Math.floor(mouseX / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
            const gridY = Math.floor(mouseY / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
            
            const valid = isValidTowerPosition(gridX, gridY);
            const config = TowerTypes[selectedTowerType];
            
            uiCtx.save();
            uiCtx.globalAlpha = 0.5;
            
            // Draw tower ghost
            uiCtx.fillStyle = valid ? config.color : '#ff0000';
            uiCtx.fillRect(gridX - 15, gridY - 15, 30, 30);
            
            // Draw range circle
            uiCtx.strokeStyle = valid ? config.color : '#ff0000';
            uiCtx.lineWidth = 2;
            uiCtx.setLineDash([5, 5]);
            uiCtx.beginPath();
            uiCtx.arc(gridX, gridY, config.range, 0, Math.PI * 2);
            uiCtx.stroke();
            uiCtx.setLineDash([]);
            
            // Draw grid indicator
            uiCtx.strokeStyle = valid ? '#00ff00' : '#ff0000';
            uiCtx.lineWidth = 2;
            uiCtx.strokeRect(gridX - CONFIG.GRID_SIZE / 2, gridY - CONFIG.GRID_SIZE / 2, CONFIG.GRID_SIZE, CONFIG.GRID_SIZE);
            
            uiCtx.restore();
        }
    }

    // Update Loop
    function update(deltaTime) {
        if (GameState.isPaused || GameState.isGameOver) return;
        
        // Update game time
        GameState.gameTime += deltaTime;
        
        // Update wave manager
        waveManager.update(deltaTime);
        
        // Update towers
        for (let i = towers.length - 1; i >= 0; i--) {
            const tower = towers[i];
            if (tower.active) {
                tower.update(deltaTime);
            } else {
                towers.splice(i, 1);
            }
        }
        
        // Update enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.active) {
                enemy.update(deltaTime);
            } else {
                enemies.splice(i, 1);
            }
        }
        
        // Update projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            if (projectile.active) {
                projectile.update(deltaTime);
            } else {
                projectiles.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            if (particle.active) {
                particle.update(deltaTime);
            } else {
                particles.splice(i, 1);
            }
        }
        
        // Update crystals
        for (let i = crystals.length - 1; i >= 0; i--) {
            const crystal = crystals[i];
            if (crystal.active) {
                crystal.update(deltaTime);
            } else {
                crystals.splice(i, 1);
            }
        }
        
        // Update resource drops
        for (let i = resourceDrops.length - 1; i >= 0; i--) {
            const drop = resourceDrops[i];
            if (drop.active) {
                drop.update(deltaTime);
            } else {
                resourceDrops.splice(i, 1);
            }
        }
        
        // Process effects (poison, etc)
        for (let i = effects.length - 1; i >= 0; i--) {
            const effect = effects[i];
            if (effect.target && effect.target.active) {
                effect.duration -= deltaTime;
                if (effect.duration > 0) {
                    // Apply poison tick every second
                    if (Math.floor(effect.duration) !== effect.ticks) {
                        effect.ticks = Math.floor(effect.duration);
                        effect.target.takeDamage(effect.damage, effect.source);
                        createDamageNumber(effect.target.x, effect.target.y - 20, effect.damage);
                    }
                } else {
                    effects.splice(i, 1);
                }
            } else {
                effects.splice(i, 1);
            }
        }
        
        // Update UI
        updateUI();
        
        // Update performance monitor
        updatePerformance();
    }

    function updateUI() {
        document.getElementById('crystalCount').textContent = GameState.crystals;
        document.getElementById('techCount').textContent = GameState.techPoints;
        document.getElementById('essenceCount').textContent = GameState.essences;
        document.getElementById('fragmentCount').textContent = GameState.fragments;
        document.getElementById('coreCount').textContent = GameState.cores;
        document.getElementById('scoreValue').textContent = GameState.score.toLocaleString();
        document.getElementById('multiplier').textContent = GameState.multiplier;
        document.getElementById('enemiesDefeated').textContent = GameState.enemiesDefeated;
        document.getElementById('towersBuilt').textContent = GameState.towersBuilt;
        document.getElementById('crystalsHarvested').textContent = GameState.crystalsHarvested;
        
        // Update wave progress
        const waveProgress = document.getElementById('waveProgress');
        if (waveManager.waveActive) {
            const progress = (waveManager.enemiesSpawned / waveManager.enemiesPerWave) * 180;
            waveProgress.setAttribute('width', progress);
        }
    }

    function updatePerformance() {
        perfMonitor.entityCount = towers.length + enemies.length + projectiles.length + crystals.length;
        perfMonitor.particleCount = particles.length;
        
        document.getElementById('entityCount').textContent = perfMonitor.entityCount;
        document.getElementById('particleCount').textContent = perfMonitor.particleCount;
    }

    // Main Game Loop
    let lastTime = 0;
    let waveManager;

    function gameLoop(timestamp) {
        const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;
        
        // Calculate FPS
        perfMonitor.frames++;
        if (timestamp - perfMonitor.frameTime > 1000) {
            perfMonitor.fps = perfMonitor.frames;
            perfMonitor.frames = 0;
            perfMonitor.frameTime = timestamp;
            document.getElementById('fps').textContent = perfMonitor.fps;
        }
        
        // Apply fast forward
        const gameSpeed = GameState.fastForward ? 2 : 1;
        
        update(deltaTime * gameSpeed);
        render();
        
        requestAnimationFrame(gameLoop);
    }

    // Resource Drop Class
    class ResourceDrop extends GameObject {
        constructor(x, y, type) {
            super(x, y);
            this.type = type;
            this.lifetime = 15;
            this.collected = false;
            this.bobOffset = Math.random() * Math.PI * 2;
            this.setupResource();
        }
        
        setupResource() {
            switch(this.type) {
                case 'essence':
                    this.color = '#ff00ff';
                    this.value = 1;
                    this.icon = '✦';
                    break;
                case 'fragment':
                    this.color = '#00ff00';
                    this.value = 1;
                    this.icon = '◆';
                    break;
                case 'core':
                    this.color = '#ff6600';
                    this.value = 1;
                    this.icon = '⬢';
                    break;
            }
        }
        
        update(deltaTime) {
            if (!this.active || this.collected) return;
            
            this.lifetime -= deltaTime;
            if (this.lifetime <= 0) {
                this.active = false;
                return;
            }
            
            // Check for mouse proximity
            const mouseDistance = Math.sqrt(
                Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)
            );
            
            if (mouseDistance < 30) {
                this.collect();
            }
        }
        
        collect() {
            if (this.collected) return;
            
            this.collected = true;
            this.active = false;
            
            switch(this.type) {
                case 'essence':
                    GameState.essences++;
                    break;
                case 'fragment':
                    GameState.fragments++;
                    break;
                case 'core':
                    GameState.cores++;
                    break;
            }
            
            createFloatingText(this.x, this.y, `+1 ${this.type}`, this.color);
            playSound('collect');
        }
        
        render(ctx) {
            if (!this.active) return;
            
            const bobY = Math.sin(Date.now() / 1000 + this.bobOffset) * 5;
            
            ctx.save();
            
            // Glow effect
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            
            // Resource icon
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = this.color;
            ctx.textAlign = 'center';
            ctx.fillText(this.icon, this.x, this.y + bobY);
            
            // Fade out when expiring
            if (this.lifetime < 3) {
                ctx.globalAlpha = this.lifetime / 3;
            }
            
            ctx.restore();
        }
    }
    
    function createResourceDrop(x, y, type) {
        const drop = new ResourceDrop(x, y, type);
        resourceDrops.push(drop);
    }

    // Initialization
    function init() {
        // Get canvas elements
        backgroundCanvas = document.getElementById('backgroundCanvas');
        gameCanvas = document.getElementById('gameCanvas');
        effectsCanvas = document.getElementById('effectsCanvas');
        uiCanvas = document.getElementById('uiCanvas');
        svgOverlay = document.getElementById('svgOverlay');
        
        // Get contexts
        bgCtx = backgroundCanvas.getContext('2d');
        gameCtx = gameCanvas.getContext('2d');
        effectsCtx = effectsCanvas.getContext('2d');
        uiCtx = uiCanvas.getContext('2d');
        
        // Set canvas sizes
        [backgroundCanvas, gameCanvas, effectsCanvas, uiCanvas].forEach(canvas => {
            canvas.width = CONFIG.CANVAS_WIDTH;
            canvas.height = CONFIG.CANVAS_HEIGHT;
        });
        
        // Set SVG viewBox
        svgOverlay.setAttribute('viewBox', `0 0 ${CONFIG.CANVAS_WIDTH} ${CONFIG.CANVAS_HEIGHT}`);
        
        // Initialize systems
        waveManager = new WaveManager();
        SoundManager.init();
        
        // Event listeners
        gameCanvas.addEventListener('mousemove', handleMouseMove);
        gameCanvas.addEventListener('click', handleMouseClick);
        gameCanvas.addEventListener('contextmenu', handleRightClick);
        document.addEventListener('keydown', handleKeyPress);
        
        // Also add mouse events to UI canvas for better interaction
        uiCanvas.addEventListener('mousemove', handleMouseMove);
        uiCanvas.addEventListener('click', handleMouseClick);
        uiCanvas.addEventListener('contextmenu', handleRightClick);
        
        // Generate tower cards dynamically for unlocked towers
        updateTowerCards();
        
        // Tower card click handlers for new compact layout
        function updateTowerCards() {
            const towerGrid = document.querySelector('.tower-grid-single');
            if (!towerGrid) {
                console.warn('Tower grid not found');
                return;
            }
            
            // Add click handlers to existing tower cards
            const towerCards = towerGrid.querySelectorAll('.tower-card-compact');
            towerCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const towerType = card.dataset.tower;
                    console.log('Tower card clicked:', towerType);
                    selectTowerType(towerType);
                });
            });
        }
        
        window.updateTowerCards = updateTowerCards;
        
        // Ability button handlers
        document.getElementById('ability-freeze').addEventListener('click', () => {
            activateAbility('freeze');
        });
        document.getElementById('ability-bomb').addEventListener('click', () => {
            activateAbility('bomb');
        });
        document.getElementById('ability-boost').addEventListener('click', () => {
            activateAbility('boost');
        });
        
        // Menu button handlers
        document.getElementById('startGameBtn').addEventListener('click', () => {
            document.getElementById('tutorialOverlay').style.display = 'none';
            waveManager.startWave();
            // Initialize sound on first user interaction
            if (SoundManager.audioContext) {
                if (SoundManager.audioContext.state === 'suspended') {
                    SoundManager.audioContext.resume();
                }
                // Start music if not already playing
                if (SoundManager.musicEnabled && SoundManager.musicPlayer && !SoundManager.musicPlayer.isPlaying) {
                    SoundManager.musicPlayer.start();
                }
            }
        });
        
        // Sound toggle removed from UI
        
        // Skill tree toggle
        document.getElementById('skillTreeToggle').addEventListener('click', () => {
            const panel = document.getElementById('globalSkillTree');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            if (panel.style.display === 'block') {
                updateResearchPanel();
            }
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            location.reload();
        });
        
        // Generate starfield background
        generateStarfield();
        
        // Draw initial path
        renderPath();
        
        // Start game loop
        requestAnimationFrame(gameLoop);
    }

    function generateStarfield() {
        const svg = document.querySelector('.star-field');
        
        for (let i = 0; i < 200; i++) {
            const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            star.setAttribute('cx', Math.random() * 1920);
            star.setAttribute('cy', Math.random() * 1080);
            star.setAttribute('r', Math.random() * 2 + 0.5);
            star.setAttribute('fill', 'url(#starGradient)');
            star.setAttribute('opacity', Math.random() * 0.8 + 0.2);
            
            // Twinkle animation
            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'opacity');
            animate.setAttribute('values', '0.2;1;0.2');
            animate.setAttribute('dur', `${Math.random() * 3 + 2}s`);
            animate.setAttribute('repeatCount', 'indefinite');
            
            star.appendChild(animate);
            svg.appendChild(star);
        }
    }

    function renderResourceDrops() {
        for (const drop of resourceDrops) {
            if (drop.active) {
                drop.render(effectsCtx);
            }
        }
    }
    
    function updateResearchPanel() {
        const grid = document.querySelector('.research-grid');
        grid.innerHTML = '';
        
        for (const [key, tower] of Object.entries(TowerTypes)) {
            if (!tower.unlocked && tower.unlockCost) {
                const card = document.createElement('div');
                card.className = 'tower-card research-card';
                card.innerHTML = `
                    <h4>${tower.name}</h4>
                    <p style="font-size: 10px;">${tower.description}</p>
                    <div style="font-size: 12px; margin-top: 10px;">
                        ${Object.entries(tower.unlockCost).map(([res, cost]) => 
                            `<div>${res}: ${cost}</div>`
                        ).join('')}
                    </div>
                    <button onclick="unlockTower('${key}')" style="margin-top: 10px; padding: 5px 10px;">Unlock</button>
                `;
                grid.appendChild(card);
            }
        }
    }
    
    window.unlockTower = function(towerType) {
        const tower = TowerTypes[towerType];
        if (!tower || tower.unlocked) return;
        
        // Check resources
        let canAfford = true;
        for (const [resource, cost] of Object.entries(tower.unlockCost)) {
            if (resource === 'techPoints' && GameState.techPoints < cost) canAfford = false;
            if (resource === 'essences' && GameState.essences < cost) canAfford = false;
            if (resource === 'fragments' && GameState.fragments < cost) canAfford = false;
            if (resource === 'cores' && GameState.cores < cost) canAfford = false;
        }
        
        if (canAfford) {
            // Deduct resources
            for (const [resource, cost] of Object.entries(tower.unlockCost)) {
                if (resource === 'techPoints') GameState.techPoints -= cost;
                if (resource === 'essences') GameState.essences -= cost;
                if (resource === 'fragments') GameState.fragments -= cost;
                if (resource === 'cores') GameState.cores -= cost;
            }
            
            tower.unlocked = true;
            createFloatingText(640, 360, `${tower.name} Unlocked!`, '#00ff00');
            playSound('levelup');
            updateResearchPanel();
            updateTowerCards(); // Refresh tower selection
        } else {
            createFloatingText(640, 360, 'Not enough resources!', '#ff0000');
        }
    };

    // Start the game when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

console.log('🚀 Cosmic Crystal Defenders - Loaded!');
console.log('📖 Use number keys 1-4 to select towers');
console.log('⚡ Use Q/W/E for abilities');
console.log('🎮 Press SPACE to pause');