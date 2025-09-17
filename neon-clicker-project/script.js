// Game Engine Demo - Player Character Integration
async function createSimpleDemo() {
    // Create a simple canvas demo
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let time = 0;
    // Use global variables for save/load functionality
    let particles = globalParticles;
    let score = globalScore;
    let clicks = globalClicks;

    // Player character class - Core component for character-based games
    class Player {
        constructor(x, y) {
            // Position and Movement Properties
            this.x = x;
            this.y = y;
            this.width = 24;
            this.height = 32;
            this.speed = 250;
            this.vx = 0;
            this.vy = 0;

            // Health and Energy System
            this.health = 100;
            this.maxHealth = 100;
            this.energy = 100;
            this.maxEnergy = 100;

            // Visual and Animation Properties
            this.facing = 'right';
            this.isMoving = false;
            this.animTime = 0;
            this.trail = [];
        }

        update(dt, keys) {
            this.vx = 0;
            this.vy = 0;
            this.isMoving = false;

            // Movement input
            if (keys['KeyW'] || keys['ArrowUp']) {
                this.vy = -this.speed;
                this.isMoving = true;
            }
            if (keys['KeyS'] || keys['ArrowDown']) {
                this.vy = this.speed;
                this.isMoving = true;
            }
            if (keys['KeyA'] || keys['ArrowLeft']) {
                this.vx = -this.speed;
                this.facing = 'left';
                this.isMoving = true;
            }
            if (keys['KeyD'] || keys['ArrowRight']) {
                this.vx = this.speed;
                this.facing = 'right';
                this.isMoving = true;
            }

            // Diagonal movement normalization
            if (this.vx !== 0 && this.vy !== 0) {
                this.vx *= 0.707;
                this.vy *= 0.707;
            }

            // Update position
            this.x += this.vx * dt;
            this.y += this.vy * dt;

            // Keep player in bounds
            this.x = Math.max(this.width/2, Math.min(canvas.width - this.width/2, this.x));
            this.y = Math.max(this.height/2, Math.min(canvas.height - this.height/2, this.y));

            // Update animation time
            if (this.isMoving) {
                this.animTime += dt * 8;
            }

            // Update trail effect
            this.trail.push({
                x: this.x,
                y: this.y,
                life: 1,
                time: Date.now()
            });

            // Remove old trail points
            this.trail = this.trail.filter(point => {
                point.life -= dt * 3;
                return point.life > 0;
            });

            // Regenerate energy slowly
            this.energy = Math.min(this.maxEnergy, this.energy + dt * 20);
        }

        render(ctx) {
            // Render trail effect
            this.trail.forEach((point, index) => {
                ctx.save();
                ctx.globalAlpha = point.life * 0.3;
                ctx.fillStyle = '#05d9e8';
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3 * point.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            ctx.save();

            // Player body (animated if moving)
            const bobOffset = this.isMoving ? Math.sin(this.animTime) * 2 : 0;
            const playerY = this.y + bobOffset;

            // Player shadow
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x - this.width/2, this.y + this.height/2 - 2, this.width, 4);
            ctx.restore();

            // Player body (main)
            ctx.fillStyle = '#ff206e';
            ctx.fillRect(this.x - this.width/2, playerY - this.height/2, this.width, this.height);

            // Player glow effect
            ctx.save();
            ctx.shadowColor = '#ff206e';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ff206e';
            ctx.fillRect(this.x - this.width/2 + 2, playerY - this.height/2 + 2, this.width - 4, this.height - 4);
            ctx.restore();

            // Player details
            ctx.fillStyle = '#00f593';
            const eyeOffset = this.facing === 'right' ? 4 : -4;
            ctx.fillRect(this.x - 6 + eyeOffset, playerY - 8, 3, 3);
            ctx.fillRect(this.x + 3 + eyeOffset, playerY - 8, 3, 3);

            // Chest emblem
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(this.x - 4, playerY - 2, 8, 6);

            // Movement indicator
            if (this.isMoving) {
                ctx.fillStyle = '#00ff00';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('→', this.x, playerY - this.height/2 - 8);
            }

            ctx.restore();

            // Health bar
            this.renderHealthBar(ctx);
            // Energy bar
            this.renderEnergyBar(ctx);
        }

        renderHealthBar(ctx) {
            const barWidth = 40;
            const barHeight = 6;
            const barX = this.x - barWidth/2;
            const barY = this.y - this.height/2 - 15;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

            // Health bar
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#00f593' : healthPercent > 0.25 ? '#ffd700' : '#ff206e';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }

        renderEnergyBar(ctx) {
            const barWidth = 40;
            const barHeight = 4;
            const barX = this.x - barWidth/2;
            const barY = this.y - this.height/2 - 8;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

            // Energy bar
            const energyPercent = this.energy / this.maxEnergy;
            ctx.fillStyle = '#05d9e8';
            ctx.fillRect(barX, barY, barWidth * energyPercent, barHeight);
        }

        dash(direction) {
            if (this.energy >= 25) {
                const dashDistance = 100;
                this.x += Math.cos(direction) * dashDistance;
                this.y += Math.sin(direction) * dashDistance;
                this.energy -= 25;

                // Keep in bounds after dash
                this.x = Math.max(this.width/2, Math.min(canvas.width - this.width/2, this.x));
                this.y = Math.max(this.height/2, Math.min(canvas.height - this.height/2, this.y));

                return true;
            }
            return false;
        }

        attack() {
            if (this.energy >= 15) {
                this.energy -= 15;
                return {
                    x: this.x + (this.facing === 'right' ? 30 : -30),
                    y: this.y,
                    damage: 25
                };
            }
            return null;
        }
    }

    // Simple particle class
    class DemoParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 200;
            this.vy = (Math.random() - 0.5) * 200;
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.01;
            this.size = Math.random() * 5 + 2;
            this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        }

        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.life -= this.decay;
            this.vx *= 0.98;
            this.vy *= 0.98;
        }

        render(ctx) {
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Create player character at center of screen
    const player = new Player(canvas.width / 2, canvas.height / 2);
    globalPlayer = player; // Assign to global variable for save/load

    // Game loop
    function gameLoop() {
        time += 0.016;

        // Update player
        player.update(0.016, keys);

        // Clear canvas
        ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Background grid effect
        ctx.strokeStyle = 'rgba(0, 245, 147, ' + (0.1 + Math.sin(time) * 0.05) + ')';
        ctx.lineWidth = 1;

        const gridSize = 50;
        for (let x = (Math.sin(time * 0.5) * 10) % gridSize; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = (Math.cos(time * 0.3) * 10) % gridSize; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Render player
        player.render(ctx);

        // Update and render particles
        particles = particles.filter(particle => {
            particle.update(0.016);
            particle.render(ctx);
            return particle.life > 0;
        });

        // Render UI
        ctx.fillStyle = '#ff206e';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 GAME ENGINE DEMO - WITH PLAYER 🎮', canvas.width / 2, 50);

        ctx.fillStyle = '#00f593';
        ctx.font = '18px monospace';
        ctx.fillText('Click anywhere to create particle effects!', canvas.width / 2, 80);

        ctx.fillStyle = '#ffd700';
        ctx.font = '16px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + score, 20, 120);
        ctx.fillText('Clicks: ' + clicks, 20, 140);
        ctx.fillText('Particles: ' + particles.length, 20, 160);

        // Player stats
        ctx.fillStyle = '#ff206e';
        ctx.fillText('Player Position: (' + Math.round(player.x) + ', ' + Math.round(player.y) + ')', 20, 220);
        ctx.fillText('Health: ' + Math.round(player.health) + '/' + player.maxHealth, 20, 240);
        ctx.fillText('Energy: ' + Math.round(player.energy) + '/' + player.maxEnergy, 20, 260);

        // Controls status indicator
        ctx.fillStyle = player.isMoving ? '#00ff00' : '#666666';
        ctx.fillText('WASD/Arrows: Move Player', 20, 300);

        ctx.fillStyle = '#ffffff';
        ctx.fillText('SPACE: Player Attack', 20, 320);
        ctx.fillText('Q/E: Dash Left/Right', 20, 340);
        ctx.fillText('ESC: Pause Menu', 20, 360);

        // Player trail effect indicator
        if (player.trail.length > 0) {
            ctx.fillStyle = '#05d9e8';
            ctx.fillText('Trail Active (' + player.trail.length + ' points)', 20, 380);
        }

        requestAnimationFrame(gameLoop);
    }

    // Enhanced click handler
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        console.log(`Click at: ${x}, ${y}`);

        // Create click ripple effect
        createClickRipple(x, y);

        // Create particles at exact click location
        for (let i = 0; i < 20; i++) {
            particles.push(new DemoParticle(x, y));
        }

        clicks++;
        globalClicks = clicks; // Sync with global
        score += 10;
        globalScore = score; // Sync with global
    });

    // Keyboard handler
    let keys = {};

    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;

        // Handle specific key actions
        if (e.code === 'Space') {
            e.preventDefault();
            // Player attack
            const attack = player.attack();
            if (attack) {
                createClickRipple(attack.x, attack.y);
                for (let i = 0; i < 15; i++) {
                    particles.push(new DemoParticle(attack.x, attack.y));
                }
                score += 25;
                globalScore = score; // Sync with global
            }
        }

        if (e.code === 'KeyQ') {
            e.preventDefault();
            // Dash left
            if (player.dash(Math.PI)) {
                createClickRipple(player.x, player.y);
                for (let i = 0; i < 10; i++) {
                    particles.push(new DemoParticle(player.x, player.y));
                }
            }
        }

        if (e.code === 'KeyE') {
            e.preventDefault();
            // Dash right
            if (player.dash(0)) {
                createClickRipple(player.x, player.y);
                for (let i = 0; i < 10; i++) {
                    particles.push(new DemoParticle(player.x, player.y));
                }
            }
        }

        if (e.code === 'Escape') {
            e.preventDefault();
            alert('🎮 Pause Menu\n\nGame Engine Demo\nPress OK to continue');
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Click ripple effect
    let ripples = [];

    function createClickRipple(x, y) {
        ripples.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 50,
            life: 1,
            decay: 0.02
        });
    }

    // Update and render click ripples
    setInterval(() => {
        ripples = ripples.filter(ripple => {
            ripple.radius += 2;
            ripple.life -= ripple.decay;

            if (ripple.life > 0) {
                ctx.save();
                ctx.globalAlpha = ripple.life * 0.5;
                ctx.strokeStyle = '#00f593';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                ctx.stroke();

                // Inner ripple
                ctx.strokeStyle = '#ff206e';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            return ripple.life > 0 && ripple.radius < ripple.maxRadius;
        });
    }, 16);

    gameLoop();
}

const initGame = createSimpleDemo;

// Initialize everything
function initializeWithStyle() {
    const loadingScreen = document.getElementById('loadingScreen');

    setTimeout(async () => {
        try {
            await initGame();

            loadingScreen.style.transition = 'opacity 0.5s ease-out';
            loadingScreen.style.opacity = '0';

            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);

            // Initialize SaveManager after everything is loaded
            saveManager = new SaveManager();

            console.log('🎮 Game Engine Demo Ready!');
            console.log('📊 Features Demonstrated:');
            console.log('  • Real-time rendering');
            console.log('  • Particle systems');
            console.log('  • Input handling');
            console.log('  • Animation loops');
            console.log('  • Visual effects');
            console.log('  • Player character system');
            console.log('  • Save/Load system');
            console.log('💾 Use the Save/Load panel to save your game!');

        } catch (error) {
            console.error('Failed to initialize game:', error);
            loadingScreen.innerHTML = '<h2>❌ INITIALIZATION FAILED</h2><p>Check console for details</p>';
        }
    }, 1000);
}

// Responsive canvas handling
function resizeCanvas() {
    const canvas = document.querySelector('#gameCanvas');
    const container = document.querySelector('.game-container');

    if (canvas && container) {
        const containerRect = container.getBoundingClientRect();
        const maxWidth = containerRect.width - 40;
        const maxHeight = containerRect.height - 40;

        const aspectRatio = 1024 / 768;
        let newWidth = maxWidth;
        let newHeight = newWidth / aspectRatio;

        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        }

        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';
    }
}

window.addEventListener('resize', resizeCanvas);

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        resizeCanvas();
        initializeWithStyle();
    });
} else {
    resizeCanvas();
    initializeWithStyle();
}

console.log('🎮 Game Engine Demo Loading...');
console.log('💡 Tip: Open browser console to see engine logs');
console.log('🔧 Type gameEngineDebug.getEngineStats() for engine info');

// Global game state variables
let globalPlayer = null;
let globalScore = 0;
let globalClicks = 0;
let globalParticles = [];
let saveManager = null;

// Save/Load Management System
class SaveManager {
    constructor() {
        this.autoSaveInterval = null;
        this.lastSaveTime = Date.now();
        this.autoSaveDelay = 30000; // Auto-save every 30 seconds

        this.init();
        this.setupAutoSave();
    }

    init() {
        // Setup event listeners for save/load buttons
        this.setupSaveLoadButtons();
    }

    setupSaveLoadButtons() {
        // Save buttons
        document.getElementById('saveSlot1').addEventListener('click', () => this.saveGame('slot_0'));
        document.getElementById('saveSlot2').addEventListener('click', () => this.saveGame('slot_1'));
        document.getElementById('saveSlot3').addEventListener('click', () => this.saveGame('slot_2'));

        // Load buttons
        document.getElementById('loadSlot1').addEventListener('click', () => this.loadGame('slot_0'));
        document.getElementById('loadSlot2').addEventListener('click', () => this.loadGame('slot_1'));
        document.getElementById('loadSlot3').addEventListener('click', () => this.loadGame('slot_2'));

        // Export/Import buttons
        document.getElementById('exportSave').addEventListener('click', () => this.exportSave());
        document.getElementById('importSave').addEventListener('click', () => this.importSave());
        document.getElementById('importFileInput').addEventListener('change', (e) => this.handleImportFile(e));
    }

    saveGame(slot) {
        if (!globalPlayer) {
            this.showNotification('Player not initialized!', '#ff206e');
            return false;
        }

        try {
            const saveData = {
                player: {
                    x: globalPlayer.x,
                    y: globalPlayer.y,
                    health: globalPlayer.health,
                    maxHealth: globalPlayer.maxHealth,
                    energy: globalPlayer.energy,
                    maxEnergy: globalPlayer.maxEnergy,
                    facing: globalPlayer.facing,
                    isMoving: globalPlayer.isMoving,
                    animTime: globalPlayer.animTime,
                    trail: globalPlayer.trail
                },
                gameState: {
                    score: globalScore,
                    level: 1,
                    health: globalPlayer.health,
                    maxHealth: globalPlayer.maxHealth,
                    resources: {
                        energy: globalPlayer.energy,
                        mana: globalPlayer.energy * 0.5 // Convert energy to mana for ability system
                    },
                    persistent: {
                        particleCount: globalParticles.length,
                        clickCount: globalClicks
                    }
                },
                timestamp: Date.now(),
                version: '1.0.0'
            };

            localStorage.setItem(`game_save_${slot}`, JSON.stringify(saveData));
            this.showNotification(`Game saved to ${slot.replace('_', ' ')}!`, '#00f593');
            console.log(`Game saved to slot: ${slot}`);
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            this.showNotification('Failed to save game!', '#ff206e');
            return false;
        }
    }

    loadGame(slot) {
        if (!globalPlayer) {
            this.showNotification('Player not initialized!', '#ff206e');
            return false;
        }

        try {
            const saveDataString = localStorage.getItem(`game_save_${slot}`);
            if (!saveDataString) {
                this.showNotification(`No save data found in ${slot.replace('_', ' ')}`, '#ffd700');
                return false;
            }

            const saveData = JSON.parse(saveDataString);

            // Restore player state
            if (saveData.player) {
                globalPlayer.x = saveData.player.x;
                globalPlayer.y = saveData.player.y;
                globalPlayer.health = saveData.player.health;
                globalPlayer.maxHealth = saveData.player.maxHealth;
                globalPlayer.energy = saveData.player.energy;
                globalPlayer.maxEnergy = saveData.player.maxEnergy;
                globalPlayer.facing = saveData.player.facing;
                globalPlayer.isMoving = saveData.player.isMoving;
                globalPlayer.animTime = saveData.player.animTime;
                globalPlayer.trail = saveData.player.trail || [];
            }

            // Restore game state
            if (saveData.gameState) {
                globalScore = saveData.gameState.score || 0;
                if (saveData.gameState.persistent) {
                    globalParticles = []; // Reset particles
                    globalClicks = saveData.gameState.persistent.clickCount || 0;
                }
            }

            this.showNotification(`Game loaded from ${slot.replace('_', ' ')}!`, '#00f593');
            console.log(`Game loaded from slot: ${slot}`);
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            this.showNotification('Failed to load game!', '#ff206e');
            return false;
        }
    }

    exportSave() {
        try {
            const saveData = localStorage.getItem('game_save_slot_0'); // Export from slot 0
            if (!saveData) {
                this.showNotification('No save data to export!', '#ffd700');
                return false;
            }

            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `game_save_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification('Save exported successfully!', '#00f593');
            return true;
        } catch (error) {
            console.error('Failed to export save:', error);
            this.showNotification('Failed to export save!', '#ff206e');
            return false;
        }
    }

    importSave() {
        document.getElementById('importFileInput').click();
    }

    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const saveDataString = e.target.result;
                const saveData = JSON.parse(saveDataString);

                // Validate save data
                if (!saveData.gameState || !saveData.timestamp) {
                    throw new Error('Invalid save data format');
                }

                // Import to slot 0
                localStorage.setItem('game_save_slot_0', JSON.stringify(saveData));
                this.showNotification('Save imported successfully!', '#00f593');
                console.log('Save imported successfully');
            } catch (error) {
                console.error('Failed to import save:', error);
                this.showNotification('Invalid save file!', '#ff206e');
            }
        };
        reader.readAsText(file);
    }

    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveGame('auto_save');
            this.lastSaveTime = Date.now();
        }, this.autoSaveDelay);
    }

    showNotification(message, color = '#00f593') {
        const notification = document.getElementById('saveNotification');
        const notificationText = document.getElementById('notificationText');

        notificationText.textContent = message;
        notificationText.style.color = color;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}