// Terminal Console System
class TerminalConsole {
    constructor() {
        this.output = document.getElementById('terminalOutput');
        this.input = document.getElementById('terminalInput');
        this.clearBtn = document.getElementById('clearTerminal');
        this.pauseBtn = document.getElementById('pauseTerminal');
        this.isPaused = false;
        this.maxLines = 100;
        this.commands = {
            'help': this.showHelp.bind(this),
            'clear': this.clear.bind(this),
            'status': this.showStatus.bind(this),
            'stats': this.showStats.bind(this),
            'debug': this.toggleDebug.bind(this),
            'pause': this.pauseGame.bind(this),
            'wave': this.showWaveInfo.bind(this),
            'towers': this.showTowers.bind(this),
            'enemies': this.showEnemies.bind(this),
            'upgrade': this.upgradeCommand.bind(this),
            'report': this.showDetailedReport.bind(this)
        };
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.processCommand(this.input.value.trim());
                this.input.value = '';
            }
        });
        
        this.clearBtn.addEventListener('click', () => this.clear());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        
        // Initial messages
        this.log('COSMIC DEFENSE TERMINAL v2.1', 'system');
        this.log('Type "help" for available commands', 'info');
        this.log('System ready for combat operations', 'ready');
    }
    
    log(message, type = 'info', timestamp = true) {
        if (this.isPaused) return;
        
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        
        const time = timestamp ? new Date().toLocaleTimeString() : '';
        const prefix = this.getPrefix(type);
        
        line.textContent = timestamp ? `[${time}] ${prefix}${message}` : `${prefix}${message}`;
        
        this.output.appendChild(line);
        this.scrollToBottom();
        this.limitLines();
    }
    
    getPrefix(type) {
        const prefixes = {
            'system': '[SYS] ',
            'info': '[INFO] ',
            'success': '[OK] ',
            'warning': '[WARN] ',
            'error': '[ERR] ',
            'ready': '[RDY] ',
            'game': '[GAME] ',
            'debug': '[DBG] ',
            'user': '[USER] '
        };
        return prefixes[type] || '[LOG] ';
    }
    
    processCommand(command) {
        if (!command) return;
        
        this.log(`$ ${command}`, 'user', false);
        
        const parts = command.toLowerCase().split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);
        
        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.log(`Unknown command: ${cmd}. Type "help" for available commands.`, 'error');
        }
    }
    
    showHelp() {
        this.log('Available commands:', 'system');
        this.log('  help     - Show this help message', 'info');
        this.log('  clear    - Clear terminal output', 'info');
        this.log('  status   - Show game status', 'info');
        this.log('  stats    - Show detailed statistics', 'info');
        this.log('  debug    - Toggle debug mode', 'info');
        this.log('  pause    - Pause/unpause game', 'info');
        this.log('  wave     - Show current wave information', 'info');
        this.log('  towers   - List all towers', 'info');
        this.log('  enemies  - Show enemy information', 'info');
        this.log('  upgrade <tower> - Upgrade specific tower', 'info');
        this.log('  report   - Generate detailed mission report', 'info');
    }
    
    clear() {
        this.output.innerHTML = '';
        this.log('Terminal cleared', 'system');
    }
    
    showStatus() {
        this.log('=== GAME STATUS ===', 'system');
        this.log(`Health: ${window.GameState?.health || 'N/A'}`, 'info');
        this.log(`Crystals: ${window.GameState?.crystals || 'N/A'}`, 'info');
        this.log(`Wave: ${window.GameState?.currentWave || 'N/A'}`, 'info');
        this.log(`Score: ${window.GameState?.score || 'N/A'}`, 'success');
    }
    
    showStats() {
        this.log('=== DETAILED STATISTICS ===', 'system');
        this.log(`Enemies Defeated: ${window.GameState?.enemiesKilled || 0}`, 'success');
        this.log(`Towers Built: ${window.GameState?.towersBuilt || 0}`, 'info');
        this.log(`Resources Collected: ${window.GameState?.resourcesCollected || 0}`, 'info');
        this.log(`Game Time: ${this.formatTime(window.GameState?.gameTime || 0)}`, 'info');
        
        // Show detailed stats if available
        if (window.DetailedStats) {
            const stats = window.DetailedStats.getSummaryReport();
            this.log('--- COMBAT ANALYSIS ---', 'system');
            this.log(`Projectiles Fired: ${stats.projectilesFired}`, 'info');
            this.log(`Combat Accuracy: ${stats.accuracy}%`, stats.accuracy >= 70 ? 'success' : 'warning');
            this.log(`Total Distance Traveled: ${Math.round(stats.totalDistance)}u`, 'info');
            this.log(`Enemies Escaped: ${stats.mobsEscaped}`, stats.mobsEscaped > 0 ? 'error' : 'success');
            this.log(`Resources Earned: ${stats.resourcesEarned}`, 'info');
            this.log(`Mission Efficiency: ${stats.efficiency}%`, stats.efficiency >= 20 ? 'success' : 'warning');
            this.log(`Damage Dealt: ${stats.damageDealt}`, 'success');
        }
    }
    
    toggleDebug() {
        window.DEBUG_MODE = !window.DEBUG_MODE;
        this.log(`Debug mode ${window.DEBUG_MODE ? 'enabled' : 'disabled'}`, 'system');
    }
    
    pauseGame() {
        if (window.gameState?.paused) {
            this.log('Game unpaused', 'success');
        } else {
            this.log('Game paused', 'warning');
        }
        // Toggle pause functionality would go here
    }
    
    showWaveInfo() {
        this.log('=== WAVE INFORMATION ===', 'system');
        this.log(`Current Wave: ${window.GameState?.currentWave || 1}`, 'info');
        this.log(`Enemies Remaining: ${window.enemies?.length || 0}`, 'warning');
        this.log(`Wave Progress: ${Math.round((window.GameState?.waveProgress || 0) * 100)}%`, 'info');
    }
    
    showTowers() {
        this.log('=== DEPLOYED TOWERS ===', 'system');
        if (window.towers && window.towers.length > 0) {
            window.towers.forEach((tower, index) => {
                this.log(`Tower ${index + 1}: ${tower.type} (Lvl ${tower.level}) at (${Math.round(tower.x)}, ${Math.round(tower.y)})`, 'info');
            });
        } else {
            this.log('No towers deployed', 'warning');
        }
    }
    
    showEnemies() {
        this.log('=== ACTIVE ENEMIES ===', 'system');
        if (window.enemies && window.enemies.length > 0) {
            const enemyTypes = {};
            window.enemies.forEach(enemy => {
                enemyTypes[enemy.type] = (enemyTypes[enemy.type] || 0) + 1;
            });
            
            Object.entries(enemyTypes).forEach(([type, count]) => {
                this.log(`${type}: ${count}`, 'warning');
            });
        } else {
            this.log('No enemies detected', 'success');
        }
    }
    
    upgradeCommand(args) {
        if (args.length === 0) {
            this.log('Usage: upgrade <tower_number>', 'error');
            return;
        }
        
        const towerIndex = parseInt(args[0]) - 1;
        if (window.towers && window.towers[towerIndex]) {
            this.log(`Attempting to upgrade tower ${args[0]}...`, 'info');
            // Upgrade logic would go here
            this.log(`Tower ${args[0]} upgraded successfully!`, 'success');
        } else {
            this.log(`Tower ${args[0]} not found`, 'error');
        }
    }
    
    showDetailedReport() {
        this.log('=== MISSION ANALYSIS REPORT ===', 'system');
        const timestamp = new Date().toLocaleString();
        this.log(`Report generated: ${timestamp}`, 'info');
        this.log('', 'info');
        
        // Basic game stats
        this.log('--- MISSION OVERVIEW ---', 'system');
        this.log(`Current Wave: ${window.GameState?.currentWave || 1}`, 'info');
        this.log(`Mission Score: ${window.GameState?.score || 0}`, 'success');
        this.log(`Defense Health: ${window.GameState?.health || 100}`, 'info');
        this.log(`Available Crystals: ${window.GameState?.crystals || 0}`, 'info');
        this.log('', 'info');
        
        // Detailed combat stats
        if (window.DetailedStats) {
            const stats = window.DetailedStats.getSummaryReport();
            this.log('--- COMBAT PERFORMANCE ---', 'system');
            this.log(`Total Projectiles Fired: ${stats.projectilesFired}`, 'info');
            this.log(`Combat Accuracy: ${stats.accuracy}%`, stats.accuracy >= 80 ? 'success' : stats.accuracy >= 60 ? 'warning' : 'error');
            this.log(`Total Enemy Distance: ${Math.round(stats.totalDistance)}u`, 'info');
            this.log(`Enemies Neutralized: ${window.GameState?.enemiesKilled || 0}`, 'success');
            this.log(`Defense Breaches: ${stats.mobsEscaped}`, stats.mobsEscaped === 0 ? 'success' : 'error');
            this.log(`Total Damage Output: ${stats.damageDealt}`, 'success');
            this.log('', 'info');
            
            this.log('--- RESOURCE MANAGEMENT ---', 'system');
            this.log(`Resources Earned: ${stats.resourcesEarned}`, 'success');
            this.log(`Towers Constructed: ${window.GameState?.towersBuilt || 0}`, 'info');
            this.log('', 'info');
            
            this.log('--- EFFICIENCY METRICS ---', 'system');
            this.log(`Mission Efficiency: ${stats.efficiency}%`, stats.efficiency >= 30 ? 'success' : stats.efficiency >= 15 ? 'warning' : 'error');
            
            // Performance rating
            let rating = 'POOR';
            let ratingColor = 'error';
            
            const avgScore = (stats.accuracy + stats.efficiency + (stats.mobsEscaped === 0 ? 100 : 50)) / 3;
            if (avgScore >= 80) {
                rating = 'EXCELLENT';
                ratingColor = 'success';
            } else if (avgScore >= 60) {
                rating = 'GOOD';
                ratingColor = 'success';
            } else if (avgScore >= 40) {
                rating = 'ADEQUATE';
                ratingColor = 'warning';
            }
            
            this.log(`Overall Performance: ${rating}`, ratingColor);
        }
        
        this.log('=== END REPORT ===', 'system');
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? '▶️' : '⏸️';
        this.pauseBtn.title = this.isPaused ? 'Resume Output' : 'Pause Output';
        this.log(`Terminal output ${this.isPaused ? 'paused' : 'resumed'}`, 'system');
    }
    
    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    limitLines() {
        const lines = this.output.querySelectorAll('.terminal-line');
        if (lines.length > this.maxLines) {
            const excess = lines.length - this.maxLines;
            for (let i = 0; i < excess; i++) {
                lines[i].remove();
            }
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Game event handlers
    onEnemySpawned(enemy) {
        this.log(`Enemy spawned: ${enemy.type} (HP: ${enemy.health})`, 'warning');
    }
    
    onEnemyKilled(enemy, tower) {
        this.log(`${enemy.type} eliminated by ${tower?.type || 'unknown'} tower`, 'success');
    }
    
    onTowerBuilt(tower) {
        this.log(`${tower.type} tower constructed at (${Math.round(tower.x)}, ${Math.round(tower.y)})`, 'success');
    }
    
    onTowerUpgraded(tower) {
        this.log(`${tower.type} tower upgraded to level ${tower.level}`, 'success');
    }
    
    onWaveStarted(wave) {
        this.log(`=== WAVE ${wave} COMMENCED ===`, 'system');
        this.log('All units, prepare for engagement!', 'warning');
    }
    
    onWaveCompleted(wave, bonus) {
        this.log(`Wave ${wave} successfully repelled!`, 'success');
        if (bonus > 0) {
            this.log(`Bonus crystals awarded: ${bonus}`, 'success');
        }
    }
    
    onResourceCollected(type, amount) {
        this.log(`+${amount} ${type} collected`, 'success');
    }
    
    onAbilityUsed(ability) {
        this.log(`Special ability activated: ${ability}`, 'system');
    }
    
    onGameOver(reason) {
        this.log('=== GAME OVER ===', 'error');
        this.log(`Mission failed: ${reason}`, 'error');
        this.log('Defense systems offline', 'error');
    }
    
    onLevelUp(newLevel) {
        this.log(`LEVEL UP! Defense systems upgraded to level ${newLevel}`, 'success');
    }
}

// Initialize terminal console
let Terminal;
document.addEventListener('DOMContentLoaded', function() {
    Terminal = new TerminalConsole();
    window.Terminal = Terminal; // Make it globally accessible
    
    // Hook into game events if they exist
    if (window.GameEvents) {
        window.GameEvents.on('enemySpawned', Terminal.onEnemySpawned.bind(Terminal));
        window.GameEvents.on('enemyKilled', Terminal.onEnemyKilled.bind(Terminal));
        window.GameEvents.on('towerBuilt', Terminal.onTowerBuilt.bind(Terminal));
        window.GameEvents.on('towerUpgraded', Terminal.onTowerUpgraded.bind(Terminal));
        window.GameEvents.on('waveStarted', Terminal.onWaveStarted.bind(Terminal));
        window.GameEvents.on('waveCompleted', Terminal.onWaveCompleted.bind(Terminal));
        window.GameEvents.on('resourceCollected', Terminal.onResourceCollected.bind(Terminal));
        window.GameEvents.on('abilityUsed', Terminal.onAbilityUsed.bind(Terminal));
        window.GameEvents.on('gameOver', Terminal.onGameOver.bind(Terminal));
        window.GameEvents.on('levelUp', Terminal.onLevelUp.bind(Terminal));
    }
    
    Terminal.log('Terminal console initialized', 'system');
    Terminal.log('Monitoring all defense systems...', 'info');
});