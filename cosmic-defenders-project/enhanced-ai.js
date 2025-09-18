// Enhanced AI and Game Mechanics System
class EnhancedGameMechanics {
    constructor() {
        this.difficultyScaling = 1.0;
        this.adaptiveAI = true;
        this.playerPerformance = {
            accuracy: 1.0,
            efficiency: 1.0,
            responseTime: 1000
        };
        this.enemyWaves = [];
        this.towerAI = new TowerAI();
        this.enemyAI = new EnemyAI();
    }

    // Dynamic difficulty adjustment
    adjustDifficulty() {
        const performance = this.calculatePlayerPerformance();
        
        if (performance > 0.8) {
            this.difficultyScaling = Math.min(this.difficultyScaling * 1.1, 3.0);
            Toast.warning('Difficulty Increased', 'Enemy forces are adapting to your tactics!');
        } else if (performance < 0.4) {
            this.difficultyScaling = Math.max(this.difficultyScaling * 0.95, 0.5);
        }
        
        this.enemyAI.setDifficulty(this.difficultyScaling);
        this.towerAI.setDifficulty(this.difficultyScaling);
    }

    calculatePlayerPerformance() {
        // Calculate based on various metrics
        const stats = window.GameStats?.stats || {};
        const survivalTime = (Date.now() - (stats.startTime || Date.now())) / 1000;
        
        const efficiencyScore = stats.enemiesKilled / Math.max(stats.towersBuilt, 1);
        const survivalScore = Math.min(survivalTime / 300, 1); // Cap at 5 minutes
        const scoreRate = stats.score / Math.max(survivalTime, 1);
        
        return (efficiencyScore * 0.4 + survivalScore * 0.3 + Math.min(scoreRate / 10, 1) * 0.3);
    }

    // Smart enemy spawning
    generateSmartWave(waveNumber) {
        const baseEnemyCount = Math.floor(5 + waveNumber * 2 * this.difficultyScaling);
        const enemyTypes = this.selectOptimalEnemyTypes(waveNumber);
        
        // Add some randomness but keep it challenging
        const wave = [];
        for (let i = 0; i < baseEnemyCount; i++) {
            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            wave.push({
                type: enemyType,
                spawnDelay: i * (1000 / this.difficultyScaling),
                adaptiveHealth: this.calculateAdaptiveHealth(enemyType, waveNumber)
            });
        }
        
        return wave;
    }

    selectOptimalEnemyTypes(waveNumber) {
        const availableTypes = ['basic', 'fast', 'armored', 'flying'];
        
        if (waveNumber >= 5) availableTypes.push('boss');
        if (waveNumber >= 3) availableTypes.push('shielded');
        if (waveNumber >= 7) availableTypes.push('teleporter');
        
        // Analyze player's defense setup and counter it
        const playerTowers = this.analyzePlayerDefenses();
        const counterTypes = this.selectCounterEnemies(playerTowers);
        
        return [...availableTypes, ...counterTypes];
    }

    analyzePlayerDefenses() {
        // This would analyze actual tower placements
        // For now, simulate based on stats
        const stats = window.GameStats?.stats || {};
        return {
            towerCount: stats.towersBuilt,
            averageDamage: stats.dps,
            coverage: 0.6 // Simulate coverage analysis
        };
    }

    selectCounterEnemies(defenses) {
        const counters = [];
        
        if (defenses.towerCount > 5) {
            counters.push('swarm'); // Counter many towers with numbers
        }
        
        if (defenses.averageDamage > 100) {
            counters.push('armored'); // Counter high damage with armor
        }
        
        if (defenses.coverage > 0.8) {
            counters.push('teleporter'); // Counter good coverage with teleporting
        }
        
        return counters;
    }

    calculateAdaptiveHealth(enemyType, waveNumber) {
        const baseHealth = {
            basic: 100,
            fast: 60,
            armored: 200,
            flying: 80,
            shielded: 150,
            boss: 500,
            swarm: 40,
            teleporter: 120
        };
        
        return Math.floor(baseHealth[enemyType] * (1 + waveNumber * 0.3) * this.difficultyScaling);
    }
}

// Enhanced Tower AI
class TowerAI {
    constructor() {
        this.targetingMode = 'intelligent';
        this.predictiveAiming = true;
        this.cooperativeTargeting = true;
    }

    setDifficulty(scaling) {
        // As difficulty increases, make towers slightly less efficient
        this.efficiency = Math.max(1 - (scaling - 1) * 0.1, 0.7);
    }

    selectOptimalTarget(tower, enemies) {
        if (!enemies.length) return null;
        
        const scoredTargets = enemies.map(enemy => ({
            enemy,
            score: this.calculateTargetScore(tower, enemy, enemies)
        }));
        
        scoredTargets.sort((a, b) => b.score - a.score);
        return scoredTargets[0]?.enemy;
    }

    calculateTargetScore(tower, enemy, allEnemies) {
        let score = 0;
        
        // Distance factor (closer = higher priority)
        const distance = this.getDistance(tower, enemy);
        score += (tower.range - distance) / tower.range * 100;
        
        // Health factor (prefer enemies you can kill)
        const damageRatio = tower.damage / enemy.health;
        if (damageRatio >= 1) {
            score += 50; // Can kill in one shot
        } else {
            score += damageRatio * 30;
        }
        
        // Progress factor (closer to goal = higher priority)
        score += enemy.progress * 40;
        
        // Type-specific bonuses
        if (enemy.type === 'boss') score += 60;
        if (enemy.type === 'fast' && tower.type === 'laser') score += 30;
        if (enemy.type === 'armored' && tower.type === 'plasma') score += 40;
        
        // Cooperative targeting (avoid overkill)
        const othersTargeting = this.countOthersTargeting(tower, enemy, allEnemies);
        if (othersTargeting > 0) {
            score -= othersTargeting * 15;
        }
        
        return score;
    }

    getDistance(tower, enemy) {
        const dx = tower.x - enemy.x;
        const dy = tower.y - enemy.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    countOthersTargeting(currentTower, enemy, allEnemies) {
        // This would check how many other towers are targeting the same enemy
        // Simplified for now
        return Math.random() < 0.3 ? 1 : 0;
    }

    // Predictive aiming for fast enemies
    calculateLeadTarget(tower, enemy) {
        if (!this.predictiveAiming || !enemy.velocity) return { x: enemy.x, y: enemy.y };
        
        const distance = this.getDistance(tower, enemy);
        const projectileSpeed = tower.projectileSpeed || 300;
        const timeToHit = distance / projectileSpeed;
        
        return {
            x: enemy.x + enemy.velocity.x * timeToHit,
            y: enemy.y + enemy.velocity.y * timeToHit
        };
    }
}

// Enhanced Enemy AI
class EnemyAI {
    constructor() {
        this.pathfinding = new EnhancedPathfinding();
        this.flocking = new FlockingBehavior();
        this.adaptiveMovement = true;
    }

    setDifficulty(scaling) {
        this.intelligence = Math.min(scaling, 2.0);
        this.pathfinding.setComplexity(this.intelligence);
    }

    updateEnemyBehavior(enemy, towers, otherEnemies) {
        // Basic movement along path
        this.pathfinding.moveAlongPath(enemy);
        
        // Adaptive behaviors based on towers
        if (this.adaptiveMovement) {
            this.avoidTowerFocus(enemy, towers);
            this.applyFlocking(enemy, otherEnemies);
        }
        
        // Special abilities
        this.handleSpecialAbilities(enemy, towers);
    }

    avoidTowerFocus(enemy, towers) {
        const nearbyTowers = towers.filter(tower => 
            this.getDistance(enemy, tower) < tower.range + 50
        );
        
        if (nearbyTowers.length > 2) {
            // Try to move through less defended areas
            enemy.avoidanceVector = this.calculateAvoidanceVector(enemy, nearbyTowers);
        }
    }

    calculateAvoidanceVector(enemy, towers) {
        let avoidX = 0, avoidY = 0;
        
        towers.forEach(tower => {
            const dx = enemy.x - tower.x;
            const dy = enemy.y - tower.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = Math.max(0, tower.range - distance) / tower.range;
            
            avoidX += (dx / distance) * force;
            avoidY += (dy / distance) * force;
        });
        
        return { x: avoidX, y: avoidY };
    }

    applyFlocking(enemy, otherEnemies) {
        if (enemy.type === 'swarm') {
            const nearby = otherEnemies.filter(other => 
                other !== enemy && 
                this.getDistance(enemy, other) < 60
            );
            
            if (nearby.length > 0) {
                enemy.flockingVector = this.flocking.calculate(enemy, nearby);
            }
        }
    }

    handleSpecialAbilities(enemy, towers) {
        switch (enemy.type) {
            case 'teleporter':
                if (enemy.teleportCooldown <= 0 && Math.random() < 0.1) {
                    this.teleportEnemy(enemy, towers);
                }
                break;
            case 'shielded':
                if (enemy.shield <= 0 && enemy.shieldRegenCooldown <= 0) {
                    this.regenerateShield(enemy);
                }
                break;
            case 'boss':
                this.handleBossAbilities(enemy, towers);
                break;
        }
    }

    teleportEnemy(enemy, towers) {
        // Teleport past some towers
        const progress = Math.min(enemy.progress + 0.2, 0.9);
        const newPosition = this.pathfinding.getPositionAtProgress(progress);
        
        enemy.x = newPosition.x;
        enemy.y = newPosition.y;
        enemy.progress = progress;
        enemy.teleportCooldown = 5000;
        
        Toast.warning('Enemy Teleported!', 'A teleporter bypassed your defenses!');
    }

    regenerateShield(enemy) {
        enemy.shield = enemy.maxShield;
        enemy.shieldRegenCooldown = 10000;
        Toast.info('Shield Regenerated', 'Enemy shield restored');
    }

    handleBossAbilities(enemy, towers) {
        if (enemy.specialAbilityCooldown <= 0) {
            const ability = enemy.abilities[Math.floor(Math.random() * enemy.abilities.length)];
            this.executeBossAbility(enemy, ability, towers);
            enemy.specialAbilityCooldown = 8000;
        }
    }

    executeBossAbility(enemy, ability, towers) {
        switch (ability) {
            case 'emp':
                Toast.bossWarning('EMP BLAST!', 'Towers temporarily disabled!');
                // Disable nearby towers temporarily
                break;
            case 'spawn':
                Toast.warning('Reinforcements!', 'Boss summoned minions!');
                // Spawn additional enemies
                break;
            case 'shield':
                enemy.temporaryShield = enemy.maxHealth * 0.5;
                Toast.warning('Boss Shielded!', 'Temporary shield activated!');
                break;
        }
    }

    getDistance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// Enhanced Pathfinding
class EnhancedPathfinding {
    constructor() {
        this.complexity = 1.0;
    }

    setComplexity(level) {
        this.complexity = level;
    }

    moveAlongPath(enemy) {
        // Enhanced movement with variable speed and pathfinding
        const baseSpeed = enemy.speed || 1;
        const actualSpeed = baseSpeed * (0.8 + Math.random() * 0.4); // Add variance
        
        enemy.progress += actualSpeed * 0.001;
        
        if (enemy.progress >= 1) {
            enemy.reachedEnd = true;
            Toast.warning('Enemy Breakthrough!', 'An enemy reached your base!');
        }
    }

    getPositionAtProgress(progress) {
        // This would calculate position along the actual path
        // Simplified for demo
        return {
            x: progress * 800 + 100,
            y: 300 + Math.sin(progress * Math.PI * 2) * 50
        };
    }
}

// Flocking Behavior for swarm enemies
class FlockingBehavior {
    calculate(enemy, neighbors) {
        const separation = this.separate(enemy, neighbors);
        const alignment = this.align(enemy, neighbors);
        const cohesion = this.cohere(enemy, neighbors);
        
        return {
            x: separation.x * 0.5 + alignment.x * 0.3 + cohesion.x * 0.2,
            y: separation.y * 0.5 + alignment.y * 0.3 + cohesion.y * 0.2
        };
    }

    separate(enemy, neighbors) {
        const force = { x: 0, y: 0 };
        neighbors.forEach(neighbor => {
            const distance = this.getDistance(enemy, neighbor);
            if (distance < 30 && distance > 0) {
                const dx = (enemy.x - neighbor.x) / distance;
                const dy = (enemy.y - neighbor.y) / distance;
                force.x += dx / distance;
                force.y += dy / distance;
            }
        });
        return force;
    }

    align(enemy, neighbors) {
        const force = { x: 0, y: 0 };
        if (neighbors.length === 0) return force;
        
        neighbors.forEach(neighbor => {
            force.x += neighbor.velocity?.x || 0;
            force.y += neighbor.velocity?.y || 0;
        });
        
        force.x /= neighbors.length;
        force.y /= neighbors.length;
        return force;
    }

    cohere(enemy, neighbors) {
        const center = { x: 0, y: 0 };
        if (neighbors.length === 0) return center;
        
        neighbors.forEach(neighbor => {
            center.x += neighbor.x;
            center.y += neighbor.y;
        });
        
        center.x /= neighbors.length;
        center.y /= neighbors.length;
        
        return {
            x: (center.x - enemy.x) * 0.01,
            y: (center.y - enemy.y) * 0.01
        };
    }

    getDistance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// Initialize enhanced mechanics
window.EnhancedMechanics = new EnhancedGameMechanics();

// Integrate with existing game loop
document.addEventListener('DOMContentLoaded', function() {
    // Adjust difficulty every 30 seconds
    setInterval(() => {
        if (window.EnhancedMechanics) {
            window.EnhancedMechanics.adjustDifficulty();
        }
    }, 30000);
    
    // AI systems initialized silently
});
