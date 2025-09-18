// Game Stats Updater System
class GameStatsManager {
    constructor() {
        this.stats = {
            score: 0,
            enemiesKilled: 0,
            towersBuilt: 0,
            dps: 0,
            wave: 1,
            startTime: Date.now()
        };
        
        this.elements = {
            score: document.getElementById('gameScore'),
            enemiesKilled: document.getElementById('gameEnemiesKilled'),
            towersBuilt: document.getElementById('gameTowersBuilt'),
            dps: document.getElementById('gameDPS'),
            wave: document.getElementById('gameWave'),
            time: document.getElementById('gameTime')
        };
        
        // Start the update loop
        this.startUpdateLoop();
    }

    updateScore(newScore) {
        const oldScore = this.stats.score;
        this.stats.score = newScore;
        
        if (this.elements.score) {
            this.animateValue(this.elements.score, oldScore, newScore);
        }
        
        // Update the main score display too
        const mainScore = document.getElementById('scoreValue');
        if (mainScore) {
            mainScore.textContent = newScore.toLocaleString();
        }
        
        // Check for score milestones
        this.checkScoreMilestones(newScore);
    }

    incrementEnemiesKilled() {
        this.stats.enemiesKilled++;
        if (this.elements.enemiesKilled) {
            this.elements.enemiesKilled.textContent = this.stats.enemiesKilled.toLocaleString();
            this.pulseElement(this.elements.enemiesKilled);
        }
        
        // Check for kill achievements
        this.checkKillAchievements();
    }

    incrementTowersBuilt() {
        this.stats.towersBuilt++;
        if (this.elements.towersBuilt) {
            this.elements.towersBuilt.textContent = this.stats.towersBuilt;
            this.pulseElement(this.elements.towersBuilt);
        }
        
        // Show toast for first few towers
        if (this.stats.towersBuilt <= 3) {
            Toast.info('Defense Established', `Tower ${this.stats.towersBuilt} constructed`);
        }
    }

    updateDPS(newDPS) {
        this.stats.dps = Math.round(newDPS);
        if (this.elements.dps) {
            this.elements.dps.textContent = this.stats.dps.toLocaleString();
        }
    }

    updateWave(newWave) {
        const oldWave = this.stats.wave;
        this.stats.wave = newWave;
        
        if (this.elements.wave) {
            this.elements.wave.textContent = newWave;
        }
        
        // Show wave completion toast
        if (newWave > oldWave) {
            const bonus = Math.floor(oldWave * 50);
            Toast.waveComplete(oldWave, bonus);
            
            // Show boss warning on every 5th wave
            if (newWave % 5 === 0) {
                const bossNames = ['Void Destroyer', 'Plasma Titan', 'Shadow Leviathan', 'Crystal Devourer', 'Cosmic Horror'];
                const bossName = bossNames[Math.floor((newWave - 5) / 5) % bossNames.length];
                setTimeout(() => {
                    Toast.bossWarning(bossName);
                }, 2000);
            }
        }
    }

    animateValue(element, start, end, duration = 1000) {
        const startTime = Date.now();
        const difference = end - start;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (difference * easeOutQuart));
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    pulseElement(element) {
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }

    checkScoreMilestones(score) {
        const milestones = [1000, 5000, 10000, 25000, 50000, 100000];
        milestones.forEach(milestone => {
            if (score >= milestone && this.stats.score < milestone) {
                Toast.achievement('Score Milestone!', `${milestone.toLocaleString()} points reached!`);
            }
        });
    }

    checkKillAchievements() {
        const killMilestones = [10, 25, 50, 100, 250, 500, 1000];
        killMilestones.forEach(milestone => {
            if (this.stats.enemiesKilled === milestone) {
                Toast.achievement('Elimination Expert!', `${milestone} enemies eliminated!`);
            }
        });
    }

    startUpdateLoop() {
        const updateTime = () => {
            const elapsed = Date.now() - this.stats.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            if (this.elements.time) {
                this.elements.time.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        };
        
        // Update time every second
        setInterval(updateTime, 1000);
        updateTime(); // Initial call
        
        // Calculate DPS every 2 seconds
        let lastDamageTotal = 0;
        setInterval(() => {
            // This would be connected to actual game damage tracking
            // For now, simulate based on towers and enemies
            const estimatedDPS = this.stats.towersBuilt * 15 + this.stats.enemiesKilled * 0.1;
            this.updateDPS(estimatedDPS);
        }, 2000);
    }

    // Integration methods for game events
    onTowerBuilt() {
        this.incrementTowersBuilt();
    }

    onEnemyKilled(scoreGain = 100) {
        this.incrementEnemiesKilled();
        this.updateScore(this.stats.score + scoreGain);
    }

    onWaveComplete(waveNumber) {
        this.updateWave(waveNumber + 1);
    }

    onCriticalHit(damage) {
        Toast.criticalHit(damage);
    }

    // Check if upgrades are affordable
    checkUpgradeAffordability() {
        // This would be connected to actual upgrade costs
        const upgrades = [
            { name: 'Damage Boost', cost: 500 },
            { name: 'Range Extension', cost: 750 },
            { name: 'Fire Rate Upgrade', cost: 1000 },
            { name: 'Multi-Target', cost: 1500 }
        ];
        
        upgrades.forEach(upgrade => {
            if (this.stats.score >= upgrade.cost && !upgrade.notified) {
                Toast.newUpgradeAvailable(upgrade.name);
                upgrade.notified = true;
            }
        });
    }

    reset() {
        this.stats = {
            score: 0,
            enemiesKilled: 0,
            towersBuilt: 0,
            dps: 0,
            wave: 1,
            startTime: Date.now()
        };
        
        // Reset all displays
        Object.values(this.elements).forEach(element => {
            if (element) element.textContent = '0';
        });
        
        if (this.elements.wave) this.elements.wave.textContent = '1';
        if (this.elements.time) this.elements.time.textContent = '0:00';
    }
}

// Create global stats manager
window.GameStats = new GameStatsManager();

// Demo functionality
document.addEventListener('DOMContentLoaded', function() {
    // Simulate some game events for demonstration
    setTimeout(() => {
        GameStats.onTowerBuilt();
    }, 3000);
    
    setTimeout(() => {
        GameStats.onEnemyKilled(150);
    }, 4000);
    
    setTimeout(() => {
        GameStats.onCriticalHit(250);
    }, 5000);
    
    // Check upgrades periodically
    setInterval(() => {
        GameStats.checkUpgradeAffordability();
    }, 10000);
});