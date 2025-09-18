
// Vampire Survivors Engine - Built with mojomast/gamengine architecture
// A bullet hell survival game where you automatically attack enemies

import { GameEngine } from './game-engine/src/core/GameEngine.js';

// Game configuration
const CONFIG = {
    canvas: { width: 1280, height: 720 },
    game: {
        surviveDuration: 30 * 60 * 1000, // 30 minutes in milliseconds
        levelUpXp: [5, 13, 23, 35, 50, 70, 95, 125, 160, 200], // XP needed for each level
        maxLevel: 200
    },
    player: {
        speed: 100,
        maxHealth: 100,
        pickupRange: 50
    },
    enemies: {
        spawnDistance: 400,
        maxOnScreen: 500,
        spawnRate: 1000 // milliseconds
    }
};

// Weapon definitions with automatic firing patterns
const WEAPONS = {
    whip: {
        name: "Whip",
        description: "Attacks horizontally in front",
        damage: 20,
        cooldown: 1000,
        range: 120,
        pierce: 1,
        evolution: "bloodytear",
        evolutionItem: "hollowHeart"
    },
    magicWand: {
        name: "Magic Wand", 
        description: "Targets nearest enemy",
        damage: 25,
        cooldown: 800,
        range: 200,
        pierce: 1,
        evolution: "holyWand",
        evolutionItem: "emptyTome"
    },
    knife: {
        name: "Knife",
        description: "Flies in facing direction",
        damage: 15,
        cooldown: 500,
        range: 300,
        pierce: 2,
        evolution: "thousandEdge",
        evolutionItem: "bracer"
    },
    axe: {
        name: "Axe",
        description: "Spins around player",
        damage: 30,
        cooldown: 1200,
        range: 80,
        pierce: 3,
        evolution: "deathSpiral", 
        evolutionItem: "candelabrador"
    },
    cross: {
        name: "Cross",
        description: "Boomerangs to nearest enemy",
        damage: 35,
        cooldown: 1500,
        range: 250,
        pierce: 1,
        evolution: "heavenSword",
        evolutionItem: "clover"
    },
    bible: {
        name: "King Bible",
        description: "Orbits around player",
        damage: 40,
        cooldown: 100, // Fast for orbital
        range: 100,
        pierce: 5,
        evolution: "unholyVespers",
        evolutionItem: "spellbinder"
    },
    garlic: {
        name: "Garlic",
        description: "Damages nearby enemies",
        damage: 8,
        cooldown: 500,
        range: 60,
        pierce: 999,
        evolution: "soulEater",
        evolutionItem: "pummarola"
    }
};

// Evolved weapons - more powerful versions
const EVOLVED_WEAPONS = {
    bloodytear: {
        name: "Bloody Tear",
        description: "Critical hits restore health",
        damage: 50,
        cooldown: 800,
        range: 150,
        pierce: 3,
        critChance: 0.1,
        lifesteal: 0.5
    },
    holyWand: {
        name: "Holy Wand", 
        description: "Fires with no delay",
        damage: 45,
        cooldown: 200,
        range: 250,
        pierce: 2
    },
    thousandEdge: {
        name: "Thousand Edge",
        description: "Continuous stream of knives",
        damage: 25,
        cooldown: 100,
        range: 400,
        pierce: 4
    }
};

// Passive items that boost player stats
const PASSIVE_ITEMS = {
    spinach: {
        name: "Spinach",
        description: "+10% Damage",
        effect: "damage",
        value: 0.1
    },
    armor: {
        name: "Armor", 
        description: "-8% Incoming Damage",
        effect: "defense",
        value: 0.08
    },
    hollowHeart: {
        name: "Hollow Heart",
        description: "+20 Max Health",
        effect: "maxHealth",
        value: 20
    },
    pummarola: {
        name: "Pummarola",
        description: "+0.2 Health Regen/sec",
        effect: "healthRegen",
        value: 0.2
    },
    emptyTome: {
        name: "Empty Tome",
        description: "-8% Weapon Cooldown",
        effect: "cooldown",
        value: 0.08
    },
    bracer: {
        name: "Bracer",
        description: "+10% Projectile Speed",
        effect: "projectileSpeed", 
        value: 0.1
    },
    candelabrador: {
        name: "Candelabrador",
        description: "+25% Area of Effect",
        effect: "area",
        value: 0.25
    },
    clover: {
        name: "Clover",
        description: "+10% Luck",
        effect: "luck",
        value: 0.1
    },
    spellbinder: {
        name: "Spellbinder",
        description: "+15% Duration",
        effect: "duration",
        value: 0.15
    }
};

// Enemy types with different behaviors
const ENEMY_TYPES = {
    bat: {
        name: "Bat",
        health: 15,
        speed: 60,
        damage: 8,
        xp: 1,
        color: "#8B4513",
        size: 12
    },
    skeleton: {
        name: "Skeleton", 
        health: 30,
        speed: 40,
        damage: 12,
        xp: 2,
        color: "#F5F5DC",
        size: 16
    },
    ghost: {
        name: "Ghost",
        health: 25,
        speed: 70,
        damage: 10,
        xp: 2,
        color: "#E6E6FA",
        size: 14
    },
    orc: {
        name: "Orc",
        health: 60,
        speed: 30,
        damage: 20,
        xp: 5,
        color: "#228B22",
        size: 20
    },
    demon: {
        name: "Demon",
        health: 100,
        speed: 50,
        damage: 25,
        xp: 8,
        color: "#B22222",
        size: 24
    }
};

// Main game class extending the mojomast/gamengine
class VampireSurvivorsGame extends GameEngine {
    constructor() {
        super('gameCanvas', {
            fps: 60,
            responsive: true,
            debug: false
        });

        this.gameState = 'menu'; // menu, playing, paused, gameOver, levelUp
        this.startTime = 0;
        this.survivedTime = 0;

        // Player data
        this.player = {
            x: CONFIG.canvas.width / 2,
            y: CONFIG.canvas.height / 2,
            health: CONFIG.player.maxHealth,
            maxHealth: CONFIG.player.maxHealth,
            level: 1,
            xp: 0,
            xpToNext: CONFIG.game.levelUpXp[0] || 5,
            speed: CONFIG.player.speed,
            weapons: [],
            items: [],
            facingDirection: 0, // Angle in radians (0 = right, Math.PI/2 = down, Math.PI = left, -Math.PI/2 = up)
            lastMoveDirection: { x: 0, y: 0 }, // Track last movement vector
            stats: {
                damage: 1,
                defense: 0,
                healthRegen: 0,
                cooldown: 1,
                projectileSpeed: 1,
                area: 1,
                duration: 1,
                luck: 0
            }
        };

        // Game collections
        this.enemies = [];
        this.projectiles = [];
        this.xpGems = [];
        this.particles = [];

        // Spawning system
        this.lastEnemySpawn = 0;
        this.enemySpawnRate = CONFIG.enemies.spawnRate;

        // Input handling
        this.keys = {};
        this.setupInput();

        // Initialize systems
        this.init();
    }

    async init() {
        await super.init();
        console.log('Vampire Survivors initialized');
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    startGame() {
        // Reset game state
        this.resetGame();

        // Give player starting weapon
        this.player.weapons = ['whip'];

        this.gameState = 'playing';
        this.startTime = Date.now();

        // Hide menu
        document.getElementById('menuOverlay').style.display = 'none';

        this.start();
    }

    resetGame() {
        this.player = {
            x: CONFIG.canvas.width / 2,
            y: CONFIG.canvas.height / 2,
            health: CONFIG.player.maxHealth,
            maxHealth: CONFIG.player.maxHealth,
            level: 1,
            xp: 0,
            xpToNext: CONFIG.game.levelUpXp[0] || 5,
            speed: CONFIG.player.speed,
            weapons: [],
            items: [],
            facingDirection: 0,
            lastMoveDirection: { x: 0, y: 0 },
            stats: {
                damage: 1,
                defense: 0,
                healthRegen: 0,
                cooldown: 1,
                projectileSpeed: 1,
                area: 1,
                duration: 1,
                luck: 0
            }
        };

        this.enemies = [];
        this.projectiles = [];
        this.xpGems = [];
        this.particles = [];
        this.lastEnemySpawn = 0;
        this.survivedTime = 0;
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        super.update(deltaTime);

        // Update survived time
        this.survivedTime = Date.now() - this.startTime;

        // Check win condition (survive 30 minutes)
        if (this.survivedTime >= CONFIG.game.surviveDuration) {
            this.gameWon();
            return;
        }

        // Update game systems
        this.updatePlayer(deltaTime);
        this.updateWeapons(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateProjectiles(deltaTime);
        this.updateXpGems(deltaTime);
        this.updateParticles(deltaTime);

        // Spawn enemies
        this.spawnEnemies();

        // Check collisions
        this.checkCollisions();

        // Update UI
        this.updateUI();

        // Health regeneration
        if (this.player.stats.healthRegen > 0) {
            this.player.health = Math.min(
                this.player.maxHealth,
                this.player.health + this.player.stats.healthRegen * deltaTime / 1000
            );
        }
    }

    updatePlayer(deltaTime) {
        const speed = this.player.speed * deltaTime / 1000;
        let moveX = 0;
        let moveY = 0;

        // Movement input
        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= magnitude;
            moveY /= magnitude;
        }

        // Update player position
        this.player.x += moveX * speed;
        this.player.y += moveY * speed;

        // Update facing direction if player is moving
        if (moveX !== 0 || moveY !== 0) {
            this.player.facingDirection = Math.atan2(moveY, moveX);
            this.player.lastMoveDirection = { x: moveX, y: moveY };
        }

        // Keep player in bounds
        this.player.x = Math.max(20, Math.min(CONFIG.canvas.width - 20, this.player.x));
        this.player.y = Math.max(20, Math.min(CONFIG.canvas.height - 20, this.player.y));
    }

    updateWeapons(deltaTime) {
        const currentTime = Date.now();

        this.player.weapons.forEach(weaponId => {
            const weapon = WEAPONS[weaponId] || EVOLVED_WEAPONS[weaponId];
            if (!weapon) return;

            // Check if weapon is ready to fire
            const lastFired = weapon.lastFired || 0;
            const cooldown = weapon.cooldown * this.player.stats.cooldown;

            if (currentTime - lastFired >= cooldown) {
                this.fireWeapon(weaponId);
                weapon.lastFired = currentTime;
            }
        });
    }

    fireWeapon(weaponId) {
        const weapon = WEAPONS[weaponId] || EVOLVED_WEAPONS[weaponId];
        if (!weapon) return;

        switch (weaponId) {
            case 'whip':
            case 'bloodytear':
                this.fireWhip(weapon);
                break;
            case 'magicWand':
            case 'holyWand':
                this.fireMagicWand(weapon);
                break;
            case 'knife':
            case 'thousandEdge':
                this.fireKnife(weapon);
                break;
            case 'axe':
            case 'deathSpiral':
                this.fireAxe(weapon);
                break;
            case 'cross':
            case 'heavenSword':
                this.fireCross(weapon);
                break;
            case 'bible':
            case 'unholyVespers':
                this.fireBible(weapon);
                break;
            case 'garlic':
            case 'soulEater':
                this.fireGarlic(weapon);
                break;
        }
    }

    fireWhip(weapon) {
        // Attack in the direction player is facing
        const damage = weapon.damage * this.player.stats.damage;
        const range = weapon.range * this.player.stats.area;
        const angle = this.player.facingDirection;
        
        // Calculate whip position and dimensions based on facing direction
        const whipLength = range;
        const whipWidth = 40;
        const offsetDistance = whipLength / 2;
        
        // Position whip in front of player in facing direction
        const whipX = this.player.x + Math.cos(angle) * offsetDistance;
        const whipY = this.player.y + Math.sin(angle) * offsetDistance;

        this.projectiles.push({
            type: 'whip',
            x: whipX,
            y: whipY,
            width: whipLength,
            height: whipWidth,
            angle: angle, // Store the angle for rendering
            damage: damage,
            pierce: weapon.pierce,
            pierced: 0,
            lifetime: 200,
            age: 0,
            weapon: weapon
        });
    }

    fireMagicWand(weapon) {
        // Target nearest enemy
        const nearestEnemy = this.findNearestEnemy();
        if (!nearestEnemy) return;

        const damage = weapon.damage * this.player.stats.damage;
        const angle = Math.atan2(nearestEnemy.y - this.player.y, nearestEnemy.x - this.player.x);
        const speed = 200 * this.player.stats.projectileSpeed;

        this.projectiles.push({
            type: 'magic',
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: damage,
            pierce: weapon.pierce,
            pierced: 0,
            lifetime: 3000,
            age: 0,
            size: 6,
            weapon: weapon
        });
    }

    fireKnife(weapon) {
        // Fire in the direction player is facing
        const angle = this.player.facingDirection;
        const damage = weapon.damage * this.player.stats.damage;
        const speed = 300 * this.player.stats.projectileSpeed;

        this.projectiles.push({
            type: 'knife',
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            angle: angle, // Store angle for rendering
            damage: damage,
            pierce: weapon.pierce,
            pierced: 0,
            lifetime: 2000,
            age: 0,
            size: 4,
            weapon: weapon
        });
    }

    fireAxe(weapon) {
        // Spinning projectile around player
        const damage = weapon.damage * this.player.stats.damage;
        const orbitalDistance = weapon.range * this.player.stats.area;

        // Create orbital projectile
        this.projectiles.push({
            type: 'axe',
            centerX: this.player.x,
            centerY: this.player.y,
            angle: Math.random() * Math.PI * 2,
            orbitalDistance: orbitalDistance,
            orbitalSpeed: 0.05,
            damage: damage,
            pierce: weapon.pierce,
            pierced: 0,
            lifetime: 5000,
            age: 0,
            size: 12,
            weapon: weapon
        });
    }

    fireCross(weapon) {
        // Boomerang to nearest enemy
        const nearestEnemy = this.findNearestEnemy();
        if (!nearestEnemy) return;

        const damage = weapon.damage * this.player.stats.damage;
        const angle = Math.atan2(nearestEnemy.y - this.player.y, nearestEnemy.x - this.player.x);
        const speed = 150 * this.player.stats.projectileSpeed;

        this.projectiles.push({
            type: 'cross',
            x: this.player.x,
            y: this.player.y,
            startX: this.player.x,
            startY: this.player.y,
            targetX: nearestEnemy.x,
            targetY: nearestEnemy.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: damage,
            pierce: weapon.pierce,
            pierced: 0,
            lifetime: 2500,
            age: 0,
            size: 8,
            returning: false,
            weapon: weapon
        });
    }

    fireBible(weapon) {
        // Orbital protection
        const damage = weapon.damage * this.player.stats.damage;
        const orbitalDistance = weapon.range * this.player.stats.area;

        this.projectiles.push({
            type: 'bible',
            centerX: this.player.x,
            centerY: this.player.y,
            angle: Math.random() * Math.PI * 2,
            orbitalDistance: orbitalDistance,
            orbitalSpeed: 0.03,
            damage: damage,
            pierce: weapon.pierce,
            pierced: 0,
            lifetime: 1000,
            age: 0,
            size: 10,
            weapon: weapon
        });
    }

    fireGarlic(weapon) {
        // Area damage around player
        const damage = weapon.damage * this.player.stats.damage;
        const range = weapon.range * this.player.stats.area;

        this.projectiles.push({
            type: 'garlic',
            x: this.player.x,
            y: this.player.y,
            radius: range,
            damage: damage,
            pierce: weapon.pierce,
            pierced: 0,
            lifetime: 500,
            age: 0,
            weapon: weapon
        });
    }

    findNearestEnemy() {
        let nearest = null;
        let nearestDistance = Infinity;

        this.enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.player.x, 2) + 
                Math.pow(enemy.y - this.player.y, 2)
            );
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = enemy;
            }
        });

        return nearest;
    }

    updateEnemies(deltaTime) {
        this.enemies.forEach((enemy, index) => {
            // Move towards player
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const speed = enemy.speed * deltaTime / 1000;
                enemy.x += (dx / distance) * speed;
                enemy.y += (dy / distance) * speed;
            }

            // Damage player on contact
            const playerDistance = Math.sqrt(
                Math.pow(enemy.x - this.player.x, 2) + 
                Math.pow(enemy.y - this.player.y, 2)
            );

            if (playerDistance < 20) {
                const damage = enemy.damage * (1 - this.player.stats.defense);
                this.player.health -= damage;

                // Create damage text
                this.createFloatingText(this.player.x, this.player.y, `-${Math.round(damage)}`, '#ff0000');

                if (this.player.health <= 0) {
                    this.gameOver();
                    return;
                }
            }
        });
    }

    updateProjectiles(deltaTime) {
        this.projectiles.forEach((projectile, index) => {
            projectile.age += deltaTime;

            // Remove expired projectiles
            if (projectile.age >= projectile.lifetime) {
                this.projectiles.splice(index, 1);
                return;
            }

            // Update projectile based on type
            switch (projectile.type) {
                case 'magic':
                case 'knife':
                    projectile.x += projectile.vx * deltaTime / 1000;
                    projectile.y += projectile.vy * deltaTime / 1000;
                    break;

                case 'axe':
                case 'bible':
                    projectile.angle += projectile.orbitalSpeed;
                    projectile.centerX = this.player.x;
                    projectile.centerY = this.player.y;
                    projectile.x = projectile.centerX + Math.cos(projectile.angle) * projectile.orbitalDistance;
                    projectile.y = projectile.centerY + Math.sin(projectile.angle) * projectile.orbitalDistance;
                    break;

                case 'cross':
                    if (!projectile.returning) {
                        projectile.x += projectile.vx * deltaTime / 1000;
                        projectile.y += projectile.vy * deltaTime / 1000;

                        // Start returning after half lifetime
                        if (projectile.age >= projectile.lifetime / 2) {
                            projectile.returning = true;
                            const angle = Math.atan2(projectile.startY - projectile.y, projectile.startX - projectile.x);
                            const speed = 200 * this.player.stats.projectileSpeed;
                            projectile.vx = Math.cos(angle) * speed;
                            projectile.vy = Math.sin(angle) * speed;
                        }
                    } else {
                        projectile.x += projectile.vx * deltaTime / 1000;
                        projectile.y += projectile.vy * deltaTime / 1000;
                    }
                    break;
            }
        });
    }

    updateXpGems(deltaTime) {
        this.xpGems.forEach((gem, index) => {
            // Move towards player if close
            const distance = Math.sqrt(
                Math.pow(gem.x - this.player.x, 2) + 
                Math.pow(gem.y - this.player.y, 2)
            );

            if (distance < CONFIG.player.pickupRange) {
                const speed = 200 * deltaTime / 1000;
                const dx = this.player.x - gem.x;
                const dy = this.player.y - gem.y;

                gem.x += (dx / distance) * speed;
                gem.y += (dy / distance) * speed;
            }

            // Collect if touching player
            if (distance < 15) {
                this.collectXp(gem.value);
                this.xpGems.splice(index, 1);
            }
        });
    }

    updateParticles(deltaTime) {
        this.particles.forEach((particle, index) => {
            particle.age += deltaTime;
            particle.x += particle.vx * deltaTime / 1000;
            particle.y += particle.vy * deltaTime / 1000;
            particle.alpha = Math.max(0, 1 - particle.age / particle.lifetime);

            if (particle.age >= particle.lifetime) {
                this.particles.splice(index, 1);
            }
        });
    }

    spawnEnemies() {
        const currentTime = Date.now();

        if (currentTime - this.lastEnemySpawn < this.enemySpawnRate) return;
        if (this.enemies.length >= CONFIG.enemies.maxOnScreen) return;

        // Determine enemy type based on time survived
        const timeMinutes = this.survivedTime / 60000;
        let enemyType = 'bat';

        if (timeMinutes > 20) enemyType = 'demon';
        else if (timeMinutes > 15) enemyType = 'orc';
        else if (timeMinutes > 10) enemyType = 'ghost';
        else if (timeMinutes > 5) enemyType = 'skeleton';

        // Random spawn position outside screen
        const angle = Math.random() * Math.PI * 2;
        const spawnX = this.player.x + Math.cos(angle) * CONFIG.enemies.spawnDistance;
        const spawnY = this.player.y + Math.sin(angle) * CONFIG.enemies.spawnDistance;

        const enemyTemplate = ENEMY_TYPES[enemyType];
        const enemy = {
            ...enemyTemplate,
            x: spawnX,
            y: spawnY,
            maxHealth: enemyTemplate.health,
            id: Date.now() + Math.random()
        };

        this.enemies.push(enemy);
        this.lastEnemySpawn = currentTime;

        // Increase spawn rate over time
        this.enemySpawnRate = Math.max(100, CONFIG.enemies.spawnRate - (timeMinutes * 20));
    }

    checkCollisions() {
        // Projectile vs Enemy collisions
        this.projectiles.forEach((projectile, pIndex) => {
            this.enemies.forEach((enemy, eIndex) => {
                if (this.isColliding(projectile, enemy)) {
                    // Deal damage
                    enemy.health -= projectile.damage;

                    // Create hit effect
                    this.createHitParticles(enemy.x, enemy.y);
                    this.createFloatingText(enemy.x, enemy.y, `-${Math.round(projectile.damage)}`, '#ffff00');

                    // Handle piercing
                    projectile.pierced++;
                    if (projectile.pierced >= projectile.pierce) {
                        this.projectiles.splice(pIndex, 1);
                    }

                    // Kill enemy if health depleted
                    if (enemy.health <= 0) {
                        this.killEnemy(enemy, eIndex);
                    }
                }
            });
        });
    }

    isColliding(projectile, enemy) {
        let colliding = false;

        switch (projectile.type) {
            case 'whip':
                // Rotated rectangle collision - simplified to circle for now
                const whipDistance = Math.sqrt(
                    Math.pow(projectile.x - enemy.x, 2) + 
                    Math.pow(projectile.y - enemy.y, 2)
                );
                colliding = whipDistance < (projectile.width / 2) + enemy.size / 2;
                break;

            case 'garlic':
                // Circle collision
                const distance = Math.sqrt(
                    Math.pow(projectile.x - enemy.x, 2) + 
                    Math.pow(projectile.y - enemy.y, 2)
                );
                colliding = distance < projectile.radius + enemy.size / 2;
                break;

            default:
                // Point vs circle collision
                const dist = Math.sqrt(
                    Math.pow(projectile.x - enemy.x, 2) + 
                    Math.pow(projectile.y - enemy.y, 2)
                );
                colliding = dist < (projectile.size || 5) + enemy.size / 2;
                break;
        }

        return colliding;
    }

    killEnemy(enemy, index) {
        // Create XP gem
        this.xpGems.push({
            x: enemy.x,
            y: enemy.y,
            value: enemy.xp,
            color: this.getXpGemColor(enemy.xp)
        });

        // Create death particles
        this.createDeathParticles(enemy.x, enemy.y, enemy.color);

        // Remove enemy
        this.enemies.splice(index, 1);
    }

    getXpGemColor(xp) {
        if (xp >= 8) return '#ff0000'; // Red
        if (xp >= 5) return '#00ff00'; // Green
        if (xp >= 2) return '#0000ff'; // Blue
        return '#ffff00'; // Yellow
    }

    collectXp(amount) {
        this.player.xp += amount;

        // Check for level up
        if (this.player.xp >= this.player.xpToNext) {
            this.levelUp();
        }
    }

    levelUp() {
        this.player.level++;
        this.player.xp -= this.player.xpToNext;

        // Calculate next level XP requirement
        const nextLevelIndex = Math.min(this.player.level - 1, CONFIG.game.levelUpXp.length - 1);
        this.player.xpToNext = CONFIG.game.levelUpXp[nextLevelIndex] || 
                               CONFIG.game.levelUpXp[CONFIG.game.levelUpXp.length - 1] + 
                               (this.player.level - CONFIG.game.levelUpXp.length) * 50;

        // Show level up screen
        this.showLevelUpScreen();
    }

    showLevelUpScreen() {
        this.gameState = 'levelUp';

        // Generate random upgrade options
        const options = this.generateUpgradeOptions();
        const upgradeContainer = document.getElementById('upgradeOptions');
        upgradeContainer.innerHTML = '';

        options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'upgrade-option';
            optionElement.onclick = () => this.selectUpgrade(option);

            optionElement.innerHTML = `
                <div class="upgrade-name">${option.name}</div>
                <div class="upgrade-description">${option.description}</div>
            `;

            upgradeContainer.appendChild(optionElement);
        });

        document.getElementById('levelUpOverlay').style.display = 'flex';
    }

    generateUpgradeOptions() {
        const options = [];
        const availableWeapons = Object.keys(WEAPONS).filter(w => !this.player.weapons.includes(w));
        const availableItems = Object.keys(PASSIVE_ITEMS).filter(i => !this.player.items.includes(i));

        // Add weapon options if slots available
        if (this.player.weapons.length < 6 && availableWeapons.length > 0) {
            const randomWeapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
            options.push({
                type: 'weapon',
                id: randomWeapon,
                name: WEAPONS[randomWeapon].name,
                description: WEAPONS[randomWeapon].description
            });
        }

        // Add item options if slots available
        if (this.player.items.length < 6 && availableItems.length > 0) {
            const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
            options.push({
                type: 'item',
                id: randomItem,
                name: PASSIVE_ITEMS[randomItem].name,
                description: PASSIVE_ITEMS[randomItem].description
            });
        }

        // Add weapon upgrades for existing weapons
        this.player.weapons.forEach(weaponId => {
            const weapon = WEAPONS[weaponId];
            if (weapon && options.length < 3) {
                options.push({
                    type: 'upgrade',
                    id: weaponId,
                    name: `${weapon.name} +`,
                    description: "Improve damage and effects"
                });
            }
        });

        // Fill remaining slots with stat boosts
        while (options.length < 3) {
            const statBoosts = [
                { name: "Damage +10%", description: "Increase damage dealt", type: 'stat', stat: 'damage', value: 0.1 },
                { name: "Speed +15%", description: "Move faster", type: 'stat', stat: 'speed', value: 15 },
                { name: "Health +20", description: "Increase max health", type: 'stat', stat: 'maxHealth', value: 20 },
                { name: "Cooldown -10%", description: "Weapons fire faster", type: 'stat', stat: 'cooldown', value: -0.1 }
            ];

            const randomBoost = statBoosts[Math.floor(Math.random() * statBoosts.length)];
            options.push(randomBoost);
        }

        return options.slice(0, 3);
    }

    selectUpgrade(option) {
        switch (option.type) {
            case 'weapon':
                this.player.weapons.push(option.id);
                break;

            case 'item':
                this.player.items.push(option.id);
                this.applyPassiveItem(option.id);
                break;

            case 'upgrade':
                // Weapon upgrade logic
                break;

            case 'stat':
                if (option.stat === 'speed') {
                    this.player.speed += option.value;
                } else if (option.stat === 'maxHealth') {
                    this.player.maxHealth += option.value;
                    this.player.health += option.value;
                } else {
                    this.player.stats[option.stat] += option.value;
                }
                break;
        }

        // Check for weapon evolutions
        this.checkWeaponEvolutions();

        // Close level up screen
        document.getElementById('levelUpOverlay').style.display = 'none';
        this.gameState = 'playing';
    }

    applyPassiveItem(itemId) {
        const item = PASSIVE_ITEMS[itemId];
        if (!item) return;

        switch (item.effect) {
            case 'damage':
                this.player.stats.damage += item.value;
                break;
            case 'defense':
                this.player.stats.defense += item.value;
                break;
            case 'maxHealth':
                this.player.maxHealth += item.value;
                this.player.health += item.value;
                break;
            case 'healthRegen':
                this.player.stats.healthRegen += item.value;
                break;
            case 'cooldown':
                this.player.stats.cooldown -= item.value;
                break;
            case 'projectileSpeed':
                this.player.stats.projectileSpeed += item.value;
                break;
            case 'area':
                this.player.stats.area += item.value;
                break;
            case 'duration':
                this.player.stats.duration += item.value;
                break;
            case 'luck':
                this.player.stats.luck += item.value;
                break;
        }
    }

    checkWeaponEvolutions() {
        this.player.weapons.forEach((weaponId, index) => {
            const weapon = WEAPONS[weaponId];
            if (!weapon || !weapon.evolution || !weapon.evolutionItem) return;

            // Check if player has evolution item
            if (this.player.items.includes(weapon.evolutionItem)) {
                // Evolve weapon
                this.player.weapons[index] = weapon.evolution;

                // Create evolution effect
                this.createFloatingText(this.player.x, this.player.y, `${EVOLVED_WEAPONS[weapon.evolution].name}!`, '#ff00ff');

                console.log(`Weapon evolved: ${weapon.name} -> ${EVOLVED_WEAPONS[weapon.evolution].name}`);
            }
        });
    }

    createHitParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                color: '#ffff00',
                size: Math.random() * 4 + 2,
                lifetime: 500,
                age: 0,
                alpha: 1
            });
        }
    }

    createDeathParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 150,
                vy: (Math.random() - 0.5) * 150,
                color: color,
                size: Math.random() * 6 + 3,
                lifetime: 800,
                age: 0,
                alpha: 1
            });
        }
    }

    createFloatingText(x, y, text, color) {
        const textElement = document.createElement('div');
        textElement.className = 'floating-text';
        textElement.textContent = text;
        textElement.style.left = (x - 20) + 'px';
        textElement.style.top = (y - 10) + 'px';
        textElement.style.color = color;

        document.body.appendChild(textElement);

        setTimeout(() => {
            if (textElement.parentNode) {
                textElement.parentNode.removeChild(textElement);
            }
        }, 2000);
    }

    updateUI() {
        // Health bar
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        const damagePercent = 100 - healthPercent;
        document.getElementById('healthDamage').style.width = damagePercent + '%';

        // Timer
        const timeLeft = Math.max(0, CONFIG.game.surviveDuration - this.survivedTime);
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        document.getElementById('gameTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Level and XP
        document.getElementById('playerLevel').textContent = this.player.level;
        const xpPercent = (this.player.xp / this.player.xpToNext) * 100;
        document.getElementById('xpFill').style.width = xpPercent + '%';
    }

    render(ctx) {
        // Clear canvas
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        if (this.gameState !== 'playing') return;

        // Render game objects
        this.renderPlayer(ctx);
        this.renderEnemies(ctx);
        this.renderProjectiles(ctx);
        this.renderXpGems(ctx);
        this.renderParticles(ctx);
    }

    renderPlayer(ctx) {
        // Player body
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Facing direction indicator
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        ctx.rotate(this.player.facingDirection);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        // Draw arrow pointing right (will be rotated to face direction)
        ctx.moveTo(15, 0);
        ctx.lineTo(8, -5);
        ctx.lineTo(8, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Health bar above player
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.player.x - 20, this.player.y - 30, 40, 6);

        const healthWidth = (this.player.health / this.player.maxHealth) * 36;
        ctx.fillStyle = this.player.health > this.player.maxHealth * 0.3 ? '#00ff00' : '#ff0000';
        ctx.fillRect(this.player.x - 18, this.player.y - 28, healthWidth, 2);
    }

    renderEnemies(ctx) {
        this.enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
            ctx.fill();

            // Health bar for stronger enemies
            if (enemy.health < enemy.maxHealth) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(enemy.x - enemy.size / 2, enemy.y - enemy.size, enemy.size, 4);

                const healthWidth = (enemy.health / enemy.maxHealth) * (enemy.size - 2);
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(enemy.x - enemy.size / 2 + 1, enemy.y - enemy.size + 1, healthWidth, 2);
            }
        });
    }

    renderProjectiles(ctx) {
        this.projectiles.forEach(projectile => {
            ctx.fillStyle = this.getProjectileColor(projectile.type);

            switch (projectile.type) {
                case 'whip':
                    ctx.save();
                    ctx.translate(projectile.x, projectile.y);
                    ctx.rotate(projectile.angle || 0);
                    ctx.fillRect(-projectile.width / 2, -projectile.height / 2, 
                                projectile.width, projectile.height);
                    ctx.restore();
                    break;

                case 'knife':
                    ctx.save();
                    ctx.translate(projectile.x, projectile.y);
                    ctx.rotate(projectile.angle || 0);
                    ctx.beginPath();
                    // Draw knife shape pointing right (will be rotated)
                    ctx.moveTo(projectile.size, 0);
                    ctx.lineTo(-projectile.size / 2, -projectile.size / 2);
                    ctx.lineTo(-projectile.size / 2, projectile.size / 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                    break;

                case 'garlic':
                    ctx.globalAlpha = 0.3;
                    ctx.beginPath();
                    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    break;

                default:
                    ctx.beginPath();
                    ctx.arc(projectile.x, projectile.y, projectile.size || 5, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        });
    }

    getProjectileColor(type) {
        switch (type) {
            case 'whip': return '#8B4513';
            case 'magic': return '#9932CC';
            case 'knife': return '#C0C0C0';
            case 'axe': return '#B22222';
            case 'cross': return '#FFD700';
            case 'bible': return '#4169E1';
            case 'garlic': return '#ADFF2F';
            default: return '#ffffff';
        }
    }

    renderXpGems(ctx) {
        this.xpGems.forEach(gem => {
            ctx.fillStyle = gem.color;
            ctx.beginPath();
            ctx.arc(gem.x, gem.y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = gem.color;
            ctx.beginPath();
            ctx.arc(gem.x, gem.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    renderParticles(ctx) {
        this.particles.forEach(particle => {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.stop();

        // Show game over screen
        const finalStats = document.getElementById('finalStats');
        finalStats.innerHTML = `
            <div class="stat-line">Time Survived: <span class="stat-value">${this.formatTime(this.survivedTime)}</span></div>
            <div class="stat-line">Level Reached: <span class="stat-value">${this.player.level}</span></div>
            <div class="stat-line">Enemies Killed: <span class="stat-value">???</span></div>
            <div class="stat-line">Damage Dealt: <span class="stat-value">???</span></div>
        `;

        document.getElementById('gameOverOverlay').style.display = 'flex';
    }

    gameWon() {
        this.gameState = 'gameOver';
        this.stop();

        // Show victory screen
        const finalStats = document.getElementById('finalStats');
        finalStats.innerHTML = `
            <div class="menu-title" style="color: #00ff00; margin-bottom: 20px;">VICTORY!</div>
            <div class="stat-line">You survived the full 30 minutes!</div>
            <div class="stat-line">Level Reached: <span class="stat-value">${this.player.level}</span></div>
            <div class="stat-line">Final Health: <span class="stat-value">${Math.round(this.player.health)}</span></div>
        `;

        document.getElementById('gameOverOverlay').style.display = 'flex';
    }

    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

export { VampireSurvivorsGame, WEAPONS, EVOLVED_WEAPONS, PASSIVE_ITEMS, ENEMY_TYPES };
