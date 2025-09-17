/**
 * Example Game: "Neon Clicker Battle"
 * Combines elements from both analyzed games - clicker mechanics with battle system
 */

import { GameEngine } from '../src/core/GameEngine.js';
import { Scene, MenuScene } from '../src/core/Scene.js';
import { GameObject } from '../src/core/GameObject.js';
import { Button, Label, ProgressBar, Panel } from '../src/ui/UIManager.js';

// Game-specific classes
class Player extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.size = { width: 64, height: 64 };
        
        // Player stats inspired by both games
        this.stats = {
            health: 100,
            maxHealth: 100,
            energy: 50,
            maxEnergy: 50,
            clickPower: 1,
            autoAttackDamage: 0,
            experience: 0,
            level: 1,
            gold: 0
        };
        
        // Visual properties
        this.color = '#00f593';
        this.glowIntensity = 0;
        this.lastAttackTime = 0;
        
        this.addTag('player');
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Regenerate energy
        this.stats.energy = Math.min(
            this.stats.maxEnergy,
            this.stats.energy + 10 * deltaTime
        );
        
        // Update glow effect
        this.glowIntensity = Math.sin(performance.now() / 200) * 0.3 + 0.7;
        
        // Auto-attack if enabled
        if (this.stats.autoAttackDamage > 0) {
            const currentTime = performance.now();
            if (currentTime - this.lastAttackTime > 1000) { // Attack every second
                this.autoAttack();
                this.lastAttackTime = currentTime;
            }
        }
    }

    draw(ctx) {
        // Draw player with neon glow effect
        ctx.save();
        
        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20 * this.glowIntensity;
        
        // Main body
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.size.width, this.size.height);
        
        // Health indicator
        const healthPercent = this.stats.health / this.stats.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(0, -10, this.size.width * healthPercent, 5);
        
        ctx.restore();
    }

    takeDamage(amount) {
        this.stats.health = Math.max(0, this.stats.health - amount);
        
        // Screen shake on damage
        if (this.scene && this.scene.engine) {
            this.scene.engine.shake(5, 200);
        }
        
        // Particle effect
        if (this.scene && this.scene.engine.particleSystem) {
            this.scene.engine.particleSystem.createExplosion(
                this.position.x + this.size.width / 2,
                this.position.y + this.size.height / 2,
                { count: 10, colors: ['#ff0000', '#ff8000'], speed: 150 }
            );
        }
        
        return this.stats.health <= 0;
    }

    gainExperience(amount) {
        this.stats.experience += amount;
        const expNeeded = this.stats.level * 100;
        
        if (this.stats.experience >= expNeeded) {
            this.levelUp();
        }
    }

    levelUp() {
        this.stats.level++;
        this.stats.experience = 0;
        this.stats.maxHealth += 20;
        this.stats.health = this.stats.maxHealth;
        this.stats.maxEnergy += 10;
        this.stats.clickPower += 1;
        
        // Level up effects
        if (this.scene && this.scene.engine.particleSystem) {
            this.scene.engine.particleSystem.createRainbowBurst(
                this.position.x + this.size.width / 2,
                this.position.y + this.size.height / 2,
                { count: 25 }
            );
        }
        
        this.emit('levelUp', this.stats.level);
    }

    autoAttack() {
        // Find enemies and attack them
        if (this.scene) {
            const enemies = this.scene.findGameObjects(obj => obj.hasTag('enemy') && !obj.destroyed);
            if (enemies.length > 0) {
                const target = enemies[0];
                this.attackTarget(target, this.stats.autoAttackDamage);
            }
        }
    }

    attackTarget(target, damage) {
        if (target.takeDamage) {
            const actualDamage = target.takeDamage(damage);
            
            // Gain gold and experience
            if (target.destroyed) {
                this.stats.gold += target.goldReward || 10;
                this.gainExperience(target.expReward || 25);
            }
        }
    }
}

class Enemy extends GameObject {
    constructor(x, y, type = 'basic') {
        super(x, y);
        this.size = { width: 48, height: 48 };
        
        this.enemyType = type;
        this.setupStats(type);
        
        this.color = this.getTypeColor(type);
        this.lastAttackTime = 0;
        this.attackCooldown = 2000; // 2 seconds
        
        this.addTag('enemy');
    }

    setupStats(type) {
        const statTemplates = {
            basic: { health: 50, damage: 5, gold: 10, exp: 25 },
            strong: { health: 120, damage: 12, gold: 25, exp: 50 },
            boss: { health: 300, damage: 20, gold: 100, exp: 150 }
        };
        
        const template = statTemplates[type] || statTemplates.basic;
        this.health = template.health;
        this.maxHealth = template.health;
        this.damage = template.damage;
        this.goldReward = template.gold;
        this.expReward = template.exp;
    }

    getTypeColor(type) {
        const colors = {
            basic: '#ff206e',
            strong: '#ff8000',
            boss: '#8000ff'
        };
        return colors[type] || colors.basic;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Attack player if nearby
        const currentTime = performance.now();
        if (currentTime - this.lastAttackTime > this.attackCooldown) {
            this.attackPlayer();
            this.lastAttackTime = currentTime;
        }
        
        // Move towards player (simple AI)
        const player = this.scene?.findGameObject(obj => obj.hasTag('player'));
        if (player) {
            const dx = player.position.x - this.position.x;
            const dy = player.position.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 100) {
                const speed = 30;
                this.position.x += (dx / distance) * speed * deltaTime;
                this.position.y += (dy / distance) * speed * deltaTime;
            }
        }
    }

    draw(ctx) {
        // Draw enemy with health bar
        ctx.save();
        
        // Main body
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.size.width, this.size.height);
        
        // Health bar
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, -15, this.size.width, 8);
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(2, -13, (this.size.width - 4) * healthPercent, 4);
        
        // Type indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.enemyType[0].toUpperCase(), this.size.width / 2, this.size.height / 2);
        
        ctx.restore();
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        
        // Damage number effect
        if (this.scene && this.scene.engine.particleSystem) {
            this.scene.engine.particleSystem.createFloatingText(
                this.position.x + this.size.width / 2,
                this.position.y,
                `-${amount}`,
                { color: '#ffff00', fontSize: 16 }
            );
        }
        
        if (this.health <= 0) {
            this.destroy();
            
            // Death effect
            if (this.scene && this.scene.engine.particleSystem) {
                this.scene.engine.particleSystem.createExplosion(
                    this.position.x + this.size.width / 2,
                    this.position.y + this.size.height / 2,
                    { count: 15, colors: [this.color, '#ffffff'], speed: 200 }
                );
            }
        }
        
        return amount;
    }

    attackPlayer() {
        const player = this.scene?.findGameObject(obj => obj.hasTag('player'));
        if (player && this.distanceTo(player) < 150) {
            player.takeDamage(this.damage);
        }
    }
}

class GameScene extends Scene {
    constructor(engine) {
        super('game', engine);
        this.player = null;
        this.enemies = [];
        this.waveNumber = 1;
        this.enemiesSpawned = 0;
        this.enemiesPerWave = 5;
        this.waveSpawnTimer = 0;
        this.gameTime = 0;
        
        this.setupBackground();
    }

    init() {
        super.init();
        this.createPlayer();
        this.setupHUD();
        this.spawnWave();
    }

    setupBackground() {
        this.setBackground((ctx) => {
            // Animated background inspired by both games
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Animated grid
            const time = performance.now() / 1000;
            const gridSize = 50;
            
            ctx.strokeStyle = `rgba(0, 245, 147, ${0.1 + Math.sin(time) * 0.05})`;
            ctx.lineWidth = 1;
            
            for (let x = 0; x < ctx.canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, ctx.canvas.height);
                ctx.stroke();
            }
            
            for (let y = 0; y < ctx.canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(ctx.canvas.width, y);
                ctx.stroke();
            }
        });
    }

    createPlayer() {
        this.player = new Player(100, 100);
        this.player.on('levelUp', (level) => {
            this.engine.uiManager.createNotification(`Level Up! Now level ${level}`, 2000, 'success');
        });
        this.addGameObject(this.player, 1);
    }

    setupHUD() {
        const hud = this.engine.uiManager.createHUD();
        
        // Player stats display
        const statsPanel = new Panel(10, 10, 300, 120);
        hud.addElement('stats', statsPanel);
        
        const healthBar = new ProgressBar(20, 30, 200, 20);
        healthBar.setRange(0, 100);
        healthBar.style.fillColor = '#ff0000';
        statsPanel.addChild(healthBar);
        hud.addElement('healthBar', healthBar);
        
        const energyBar = new ProgressBar(20, 60, 200, 20);
        energyBar.setRange(0, 50);
        energyBar.style.fillColor = '#0080ff';
        statsPanel.addChild(energyBar);
        hud.addElement('energyBar', energyBar);
        
        const goldLabel = new Label(20, 90, 'Gold: 0', 'bold 16px monospace');
        goldLabel.style.textColor = '#ffd700';
        statsPanel.addChild(goldLabel);
        hud.addElement('goldLabel', goldLabel);
        
        // Upgrade buttons
        const upgradePanel = new Panel(this.engine.canvas.width - 320, 10, 300, 200);
        hud.addElement('upgrades', upgradePanel);
        
        const clickUpgradeBtn = new Button(20, 30, 260, 35, 'Upgrade Click (+$50)');
        clickUpgradeBtn.on('click', () => this.purchaseUpgrade('click', 50));
        upgradePanel.addChild(clickUpgradeBtn);
        hud.addElement('clickUpgrade', clickUpgradeBtn);
        
        const autoAttackBtn = new Button(20, 80, 260, 35, 'Auto Attack (+$100)');
        autoAttackBtn.on('click', () => this.purchaseUpgrade('auto', 100));
        upgradePanel.addChild(autoAttackBtn);
        hud.addElement('autoAttack', autoAttackBtn);
        
        const healthUpgradeBtn = new Button(20, 130, 260, 35, 'Max Health (+$75)');
        healthUpgradeBtn.on('click', () => this.purchaseUpgrade('health', 75));
        upgradePanel.addChild(healthUpgradeBtn);
        hud.addElement('healthUpgrade', healthUpgradeBtn);
        
        // Wave info
        const waveLabel = new Label(this.engine.canvas.width / 2 - 100, 20, 'Wave: 1', 'bold 24px monospace');
        waveLabel.style.textColor = '#ff206e';
        hud.addElement('waveLabel', waveLabel);
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        this.gameTime += deltaTime;
        this.updateHUD();
        this.handleInput();
        this.updateWaveSystem(deltaTime);
        this.checkGameOver();
    }

    updateHUD() {
        if (!this.player || !this.engine.uiManager.hud) return;
        
        const hud = this.engine.uiManager.hud;
        
        // Update health bar
        const healthBar = hud.getElement('healthBar');
        if (healthBar) {
            healthBar.setRange(0, this.player.stats.maxHealth);
            healthBar.setValue(this.player.stats.health);
        }
        
        // Update energy bar
        const energyBar = hud.getElement('energyBar');
        if (energyBar) {
            energyBar.setRange(0, this.player.stats.maxEnergy);
            energyBar.setValue(this.player.stats.energy);
        }
        
        // Update gold label
        const goldLabel = hud.getElement('goldLabel');
        if (goldLabel) {
            goldLabel.setText(`Gold: ${this.player.stats.gold} | Level: ${this.player.stats.level}`);
        }
        
        // Update wave label
        const waveLabel = hud.getElement('waveLabel');
        if (waveLabel) {
            waveLabel.setText(`Wave: ${this.waveNumber}`);
        }
    }

    handleInput() {
        const input = this.engine.inputManager;
        
        // Click to attack
        if (input.isMousePressed(0)) {
            this.performClickAttack();
        }
        
        // Keyboard shortcuts
        if (input.isKeyPressed('Space')) {
            this.performClickAttack();
        }
    }

    performClickAttack() {
        if (!this.player || this.player.stats.energy < 5) return;
        
        this.player.stats.energy -= 5;
        
        const mouse = this.engine.inputManager.getMousePosition();
        
        // Find enemies near click position
        const enemies = this.findGameObjects(obj => obj.hasTag('enemy') && !obj.destroyed);
        const clickedEnemy = enemies.find(enemy => {
            const distance = Math.sqrt(
                Math.pow(mouse.x - (enemy.position.x + enemy.size.width / 2), 2) +
                Math.pow(mouse.y - (enemy.position.y + enemy.size.height / 2), 2)
            );
            return distance < 50;
        });
        
        if (clickedEnemy) {
            this.player.attackTarget(clickedEnemy, this.player.stats.clickPower * 10);
        }
        
        // Click effect
        this.engine.particleSystem.createClickEffect(mouse.x, mouse.y);
    }

    purchaseUpgrade(type, cost) {
        if (!this.player || this.player.stats.gold < cost) {
            this.engine.uiManager.createNotification('Not enough gold!', 2000, 'error');
            return;
        }
        
        this.player.stats.gold -= cost;
        
        switch (type) {
            case 'click':
                this.player.stats.clickPower += 2;
                this.engine.uiManager.createNotification('Click power increased!', 2000, 'success');
                break;
            case 'auto':
                this.player.stats.autoAttackDamage += 3;
                this.engine.uiManager.createNotification('Auto attack improved!', 2000, 'success');
                break;
            case 'health':
                this.player.stats.maxHealth += 50;
                this.player.stats.health = this.player.stats.maxHealth;
                this.engine.uiManager.createNotification('Max health increased!', 2000, 'success');
                break;
        }
    }

    updateWaveSystem(deltaTime) {
        this.waveSpawnTimer += deltaTime;
        
        // Spawn new enemies
        if (this.enemiesSpawned < this.enemiesPerWave && this.waveSpawnTimer > 2) {
            this.spawnEnemy();
            this.waveSpawnTimer = 0;
        }
        
        // Check if wave is complete
        const aliveEnemies = this.findGameObjects(obj => obj.hasTag('enemy') && !obj.destroyed);
        if (aliveEnemies.length === 0 && this.enemiesSpawned >= this.enemiesPerWave) {
            this.nextWave();
        }
    }

    spawnWave() {
        this.enemiesSpawned = 0;
        this.enemiesPerWave = 3 + this.waveNumber * 2;
    }

    spawnEnemy() {
        const types = ['basic', 'basic', 'strong', 'boss'];
        const weights = [0.6, 0.6, 0.3, 0.1];
        
        let type = 'basic';
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < types.length; i++) {
            cumulative += weights[i];
            if (random < cumulative) {
                type = types[i];
                break;
            }
        }
        
        // Boss only on certain waves
        if (type === 'boss' && this.waveNumber % 5 !== 0) {
            type = 'strong';
        }
        
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        
        switch (edge) {
            case 0: // Top
                x = Math.random() * this.engine.canvas.width;
                y = -50;
                break;
            case 1: // Right
                x = this.engine.canvas.width + 50;
                y = Math.random() * this.engine.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.engine.canvas.width;
                y = this.engine.canvas.height + 50;
                break;
            case 3: // Left
                x = -50;
                y = Math.random() * this.engine.canvas.height;
                break;
        }
        
        const enemy = new Enemy(x, y, type);
        this.addGameObject(enemy, 1);
        this.enemiesSpawned++;
    }

    nextWave() {
        this.waveNumber++;
        this.spawnWave();
        
        // Wave bonus
        this.player.stats.gold += this.waveNumber * 10;
        
        this.engine.uiManager.createNotification(`Wave ${this.waveNumber} incoming!`, 3000, 'warning');
        
        // Screen flash
        this.engine.particleSystem.createRainbowBurst(
            this.engine.canvas.width / 2,
            this.engine.canvas.height / 2,
            { count: 30 }
        );
    }

    checkGameOver() {
        if (this.player && this.player.stats.health <= 0) {
            this.engine.switchScene('gameOver');
        }
    }
}

class GameOverScene extends MenuScene {
    constructor(engine) {
        super('gameOver', engine);
        this.title = 'GAME OVER';
        this.subtitle = 'Your neon adventure ends here...';
    }

    setupMenu() {
        this.addMenuItem('Play Again', () => {
            this.engine.switchScene('game');
        });
        
        this.addMenuItem('Main Menu', () => {
            this.engine.switchScene('menu');
        });
    }
}

class MainMenuScene extends MenuScene {
    constructor(engine) {
        super('menu', engine);
        this.title = 'NEON CLICKER BATTLE';
        this.subtitle = 'Survive waves of enemies through clicking and upgrades';
    }

    setupMenu() {
        this.addMenuItem('Start Game', () => {
            this.engine.switchScene('game');
        });
        
        this.addMenuItem('Instructions', () => {
            this.showInstructions();
        });
        
        this.addMenuItem('Settings', () => {
            this.showSettings();
        });
    }

    showInstructions() {
        const instructions = [
            'Click on enemies to attack them',
            'Earn gold to buy upgrades',
            'Survive waves of increasingly difficult enemies',
            'Level up to become stronger',
            'Use keyboard shortcuts: SPACE to attack'
        ];
        
        // Create instruction modal
        const modal = new Panel(100, 100, this.engine.canvas.width - 200, this.engine.canvas.height - 200);
        
        instructions.forEach((text, index) => {
            const label = new Label(20, 50 + index * 30, text, '16px monospace');
            modal.addChild(label);
        });
        
        const closeBtn = new Button(modal.size.width - 120, modal.size.height - 50, 100, 30, 'Close');
        closeBtn.on('click', () => {
            this.engine.uiManager.hideModal(modal);
        });
        modal.addChild(closeBtn);
        
        this.engine.uiManager.showModal(modal);
    }

    showSettings() {
        // Simple settings modal
        const modal = new Panel(200, 150, 400, 300);
        
        const title = new Label(20, 20, 'Settings', 'bold 20px monospace');
        modal.addChild(title);
        
        // Theme buttons
        let y = 60;
        ['default', 'neon', 'retro'].forEach(theme => {
            const btn = new Button(20, y, 150, 30, `${theme} Theme`);
            btn.on('click', () => {
                this.engine.uiManager.setTheme(theme);
            });
            modal.addChild(btn);
            y += 40;
        });
        
        const closeBtn = new Button(300, 250, 80, 30, 'Close');
        closeBtn.on('click', () => {
            this.engine.uiManager.hideModal(modal);
        });
        modal.addChild(closeBtn);
        
        this.engine.uiManager.showModal(modal);
    }
}

// Game initialization
async function initGame() {
    const engine = new GameEngine('gameCanvas', {
        fps: 60,
        responsive: true,
        audioEnabled: true,
        debug: false
    });

    // Create scenes
    const mainMenu = new MainMenuScene(engine);
    const gameScene = new GameScene(engine);
    const gameOverScene = new GameOverScene(engine);

    // Add scenes to engine
    engine.addScene('menu', mainMenu);
    engine.addScene('game', gameScene);
    engine.addScene('gameOver', gameOverScene);

    // Start with main menu
    engine.switchScene('menu');
    engine.start();

    console.log('Neon Clicker Battle initialized!');
}

export { initGame };
