// Detailed Statistics Tracking System
class DetailedStatsTracker {
    constructor() {
        this.stats = {
            projectilesFired: 0,
            projectilesHit: 0,
            totalDistanceCovered: 0,
            mobsEscaped: 0,
            resourcesEarned: 0,
            startTime: Date.now(),
            totalDamageDealt: 0,
            totalMobsSpawned: 0,
            totalMobHealth: 0
        };
        
        this.elements = {
            projectilesFired: document.getElementById('gameProjectilesFired'),
            totalDistance: document.getElementById('gameTotalDistance'),
            mobsEscaped: document.getElementById('gameMobsEscaped'),
            accuracy: document.getElementById('gameAccuracy'),
            resourcesEarned: document.getElementById('gameResourcesEarned'),
            efficiency: document.getElementById('gameEfficiency')
        };
        
        this.init();
    }
    
    init() {
        // Start periodic updates
        this.updateInterval = setInterval(() => {
            this.updateDisplay();
        }, 1000); // Update every second
        
        // Make globally accessible
        window.DetailedStats = this;
        
        console.log('Detailed stats tracker initialized');
    }
    
    // Called when a projectile is fired
    onProjectileFired(projectile) {
        this.stats.projectilesFired++;
        
        // Log to terminal if available
        if (window.Terminal) {
            if (this.stats.projectilesFired % 50 === 0) { // Every 50th projectile
                window.Terminal.log(`Combat report: ${this.stats.projectilesFired} projectiles fired`, 'info');
            }
        }
    }
    
    // Called when a projectile hits a target
    onProjectileHit(projectile, target) {
        this.stats.projectilesHit++;
        if (target && target.health !== undefined) {
            this.stats.totalDamageDealt += (projectile.damage || 10);
        }
    }
    
    // Called when an enemy moves (track distance)
    onEnemyMoved(enemy, distance) {
        if (distance && distance > 0) {
            this.stats.totalDistanceCovered += distance;
        }
    }
    
    // Called when an enemy spawns
    onEnemySpawned(enemy) {
        this.stats.totalMobsSpawned++;
        if (enemy && enemy.health) {
            this.stats.totalMobHealth += enemy.health;
        }
        
        // Log major spawn milestones
        if (window.Terminal && this.stats.totalMobsSpawned % 25 === 0) {
            window.Terminal.log(`Enemy count milestone: ${this.stats.totalMobsSpawned} total spawned`, 'warning');
        }
    }
    
    // Called when an enemy escapes/reaches the end
    onEnemyEscaped(enemy) {
        this.stats.mobsEscaped++;
        
        // Log to terminal
        if (window.Terminal) {
            window.Terminal.log(`ALERT: ${enemy.type || 'Enemy'} breached defenses!`, 'error');
            
            if (this.stats.mobsEscaped % 5 === 0) {
                window.Terminal.log(`Defense breach report: ${this.stats.mobsEscaped} enemies escaped`, 'error');
            }
        }
    }
    
    // Called when resources are earned
    onResourceEarned(type, amount) {
        this.stats.resourcesEarned += amount || 0;
        
        // Log significant resource gains
        if (window.Terminal && amount >= 100) {
            window.Terminal.log(`Resource bonus: +${amount} ${type}`, 'success');
        }
    }
    
    // Calculate accuracy percentage
    getAccuracy() {
        if (this.stats.projectilesFired === 0) return 100;
        return Math.round((this.stats.projectilesHit / this.stats.projectilesFired) * 100);
    }
    
    // Calculate efficiency (kills per minute, damage per second, etc.)
    getEfficiency() {
        const gameTimeSeconds = (Date.now() - this.stats.startTime) / 1000;
        if (gameTimeSeconds === 0) return 0;
        
        const enemiesKilled = window.GameState?.enemiesKilled || 0;
        const efficiency = (enemiesKilled / gameTimeSeconds) * 60; // kills per minute
        return Math.round(efficiency);
    }
    
    // Format distance for display
    formatDistance(distance) {
        if (distance < 1000) {
            return `${Math.round(distance)}u`;
        } else if (distance < 1000000) {
            return `${(distance / 1000).toFixed(1)}ku`;
        } else {
            return `${(distance / 1000000).toFixed(1)}Mu`;
        }
    }
    
    // Format large numbers
    formatNumber(num) {
        if (num < 1000) {
            return num.toString();
        } else if (num < 1000000) {
            return `${(num / 1000).toFixed(1)}k`;
        } else {
            return `${(num / 1000000).toFixed(1)}M`;
        }
    }
    
    // Update all display elements
    updateDisplay() {
        if (this.elements.projectilesFired) {
            this.elements.projectilesFired.textContent = this.formatNumber(this.stats.projectilesFired);
        }
        
        if (this.elements.totalDistance) {
            this.elements.totalDistance.textContent = this.formatDistance(this.stats.totalDistanceCovered);
        }
        
        if (this.elements.mobsEscaped) {
            this.elements.mobsEscaped.textContent = this.stats.mobsEscaped;
        }
        
        if (this.elements.accuracy) {
            const accuracy = this.getAccuracy();
            this.elements.accuracy.textContent = `${accuracy}%`;
            
            // Color coding for accuracy
            if (accuracy >= 80) {
                this.elements.accuracy.style.color = '#00ff00';
            } else if (accuracy >= 60) {
                this.elements.accuracy.style.color = '#ffff00';
            } else {
                this.elements.accuracy.style.color = '#ff4444';
            }
        }
        
        if (this.elements.resourcesEarned) {
            this.elements.resourcesEarned.textContent = this.formatNumber(this.stats.resourcesEarned);
        }
        
        if (this.elements.efficiency) {
            const efficiency = this.getEfficiency();
            this.elements.efficiency.textContent = `${efficiency}%`;
            
            // Color coding for efficiency
            if (efficiency >= 30) {
                this.elements.efficiency.style.color = '#00ff00';
            } else if (efficiency >= 15) {
                this.elements.efficiency.style.color = '#ffff00';
            } else {
                this.elements.efficiency.style.color = '#ff8800';
            }
        }
    }
    
    // Get summary report for terminal
    getSummaryReport() {
        return {
            projectilesFired: this.stats.projectilesFired,
            accuracy: this.getAccuracy(),
            totalDistance: this.stats.totalDistanceCovered,
            mobsEscaped: this.stats.mobsEscaped,
            resourcesEarned: this.stats.resourcesEarned,
            efficiency: this.getEfficiency(),
            damageDealt: this.stats.totalDamageDealt
        };
    }
    
    // Reset stats (for new game)
    reset() {
        this.stats = {
            projectilesFired: 0,
            projectilesHit: 0,
            totalDistanceCovered: 0,
            mobsEscaped: 0,
            resourcesEarned: 0,
            startTime: Date.now(),
            totalDamageDealt: 0,
            totalMobsSpawned: 0,
            totalMobHealth: 0
        };
        
        this.updateDisplay();
        
        if (window.Terminal) {
            window.Terminal.log('Statistics reset for new mission', 'system');
        }
    }
    
    // Export stats for save/load
    exportStats() {
        return JSON.stringify(this.stats);
    }
    
    // Import stats from save
    importStats(statsJson) {
        try {
            this.stats = JSON.parse(statsJson);
            this.updateDisplay();
        } catch (e) {
            console.error('Failed to import stats:', e);
        }
    }
    
    // Cleanup
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize when DOM is ready
let DetailedStatsInstance;
document.addEventListener('DOMContentLoaded', function() {
    DetailedStatsInstance = new DetailedStatsTracker();
    
    // Hook into existing game events if available
    if (window.GameEvents) {
        // Hook into game events for automatic stat tracking
        window.GameEvents.on('projectileFired', DetailedStatsInstance.onProjectileFired.bind(DetailedStatsInstance));
        window.GameEvents.on('projectileHit', DetailedStatsInstance.onProjectileHit.bind(DetailedStatsInstance));
        window.GameEvents.on('enemyMoved', DetailedStatsInstance.onEnemyMoved.bind(DetailedStatsInstance));
        window.GameEvents.on('enemySpawned', DetailedStatsInstance.onEnemySpawned.bind(DetailedStatsInstance));
        window.GameEvents.on('enemyEscaped', DetailedStatsInstance.onEnemyEscaped.bind(DetailedStatsInstance));
        window.GameEvents.on('resourceEarned', DetailedStatsInstance.onResourceEarned.bind(DetailedStatsInstance));
    }
    
    console.log('Detailed stats system ready');
});

// Export for global access
window.DetailedStatsTracker = DetailedStatsTracker;