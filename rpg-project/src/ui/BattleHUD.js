/**
 * Battle HUD - Heads-up display for battle interface
 * Provides real-time data display, health/mana bars, action menus, and battle information
 */

import { UIComponent, Button, Label, ProgressBar, Panel } from '../../../game-engine/src/ui/UIManager.js';
import { AnimationManager } from '../../../game-engine/src/effects/AnimationManager.js';

class HealthBar extends UIComponent {
    constructor(x, y, width, height, combatant, isEnemy = false) {
        super(x, y, width, height);
        this.combatant = combatant;
        this.isEnemy = isEnemy;
        this.lastHealth = combatant.health;
        this.damageAnimation = null;

        this.style = {
            ...this.style,
            backgroundColor: 'rgba(60, 60, 60, 0.8)',
            borderColor: isEnemy ? '#e74c3c' : '#27ae60',
            borderWidth: 2,
            borderRadius: 4
        };

        // Create health text label
        this.healthText = new Label(width / 2, height / 2, '', '12px monospace');
        this.healthText.style.textColor = '#ffffff';
        this.healthText.style.textAlign = 'center';
        this.healthText.style.textBaseline = 'middle';
        this.addChild(this.healthText);

        this.updateDisplay();
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Check for health changes and animate
        if (this.combatant.health !== this.lastHealth) {
            this.animateHealthChange();
            this.lastHealth = this.combatant.health;
        }

        this.updateDisplay();
    }

    updateDisplay() {
        const healthPercent = Math.max(0, this.combatant.health / this.combatant.maxHealth);
        const healthText = `${this.combatant.health}/${this.combatant.maxHealth}`;

        this.healthText.setText(healthText);

        // Update background color based on health
        let bgColor;
        if (healthPercent > 0.6) {
            bgColor = '#27ae60'; // Green
        } else if (healthPercent > 0.3) {
            bgColor = '#f39c12'; // Orange
        } else {
            bgColor = '#e74c3c'; // Red
        }
        this.style.backgroundColor = bgColor;
    }

    animateHealthChange() {
        // Simple flash animation for damage/healing
        const originalColor = this.style.backgroundColor;
        this.style.backgroundColor = '#ffffff';

        setTimeout(() => {
            this.style.backgroundColor = originalColor;
        }, 100);
    }

    renderContent(ctx) {
        const healthPercent = Math.max(0, this.combatant.health / this.combatant.maxHealth);
        const fillWidth = (this.size.width - 4) * healthPercent;

        // Render health bar background
        ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
        ctx.fillRect(2, 2, this.size.width - 4, this.size.height - 4);

        // Render health bar fill
        if (fillWidth > 0) {
            let fillColor;
            if (healthPercent > 0.6) {
                fillColor = '#27ae60'; // Green
            } else if (healthPercent > 0.3) {
                fillColor = '#f39c12'; // Orange
            } else {
                fillColor = '#e74c3c'; // Red
            }

            ctx.fillStyle = fillColor;
            ctx.fillRect(2, 2, fillWidth, this.size.height - 4);
        }
    }
}

class ManaBar extends UIComponent {
    constructor(x, y, width, height, combatant) {
        super(x, y, width, height);
        this.combatant = combatant;
        this.lastMana = combatant.mana;

        this.style = {
            ...this.style,
            backgroundColor: '#2980b9',
            borderColor: '#3498db',
            borderWidth: 2,
            borderRadius: 4
        };

        // Create mana text label
        this.manaText = new Label(width / 2, height / 2, '', '10px monospace');
        this.manaText.style.textColor = '#ffffff';
        this.manaText.style.textAlign = 'center';
        this.manaText.style.textBaseline = 'middle';
        this.addChild(this.manaText);

        this.updateDisplay();
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Check for mana changes
        if (this.combatant.mana !== this.lastMana) {
            this.lastMana = this.combatant.mana;
        }

        this.updateDisplay();
    }

    updateDisplay() {
        const manaPercent = Math.max(0, this.combatant.mana / this.combatant.maxMana);
        const manaText = `${this.combatant.mana}/${this.combatant.maxMana}`;
        this.manaText.setText(manaText);
    }

    renderContent(ctx) {
        const manaPercent = Math.max(0, this.combatant.mana / this.combatant.maxMana);
        const fillWidth = (this.size.width - 4) * manaPercent;

        // Render mana bar background
        ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
        ctx.fillRect(2, 2, this.size.width - 4, this.size.height - 4);

        // Render mana bar fill
        if (fillWidth > 0) {
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(2, 2, fillWidth, this.size.height - 4);
        }
    }
}

class ActionButton extends Button {
    constructor(x, y, width, height, text, action, cooldown = 0) {
        super(x, y, width, height, text);
        this.action = action;
        this.cooldown = cooldown;
        this.cooldownRemaining = 0;
        this.isOnCooldown = false;

        // Style for action buttons
        this.style.backgroundColor = '#34495e';
        this.style.hoverBackgroundColor = '#2c3e50';
        this.style.clickBackgroundColor = '#1a252f';
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Update cooldown
        if (this.cooldownRemaining > 0) {
            this.cooldownRemaining -= deltaTime;
            if (this.cooldownRemaining <= 0) {
                this.isOnCooldown = false;
                this.cooldownRemaining = 0;
                this.style.backgroundColor = '#34495e';
            }
        }
    }

    startCooldown() {
        this.isOnCooldown = true;
        this.cooldownRemaining = this.cooldown;
        this.style.backgroundColor = '#7f8c8d';
        this.disable();
    }

    endCooldown() {
        this.isOnCooldown = false;
        this.cooldownRemaining = 0;
        this.style.backgroundColor = '#34495e';
        this.enable();
    }

    renderContent(ctx) {
        super.renderContent(ctx);

        // Render cooldown overlay
        if (this.isOnCooldown) {
            const cooldownPercent = this.cooldownRemaining / this.cooldown;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, (1 - cooldownPercent) * this.size.height, this.size.width, cooldownPercent * this.size.height);

            // Cooldown text
            const seconds = Math.ceil(this.cooldownRemaining / 1000);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(seconds.toString(), this.size.width / 2, this.size.height / 2);
        }
    }
}

class StatusEffectIndicator extends UIComponent {
    constructor(x, y, width, height, effect) {
        super(x, y, width, height);
        this.effect = effect;

        this.style = {
            ...this.style,
            backgroundColor: this.getEffectColor(),
            borderColor: '#ffffff',
            borderWidth: 1,
            borderRadius: 4
        };

        // Effect icon/label
        this.effectLabel = new Label(width / 2, height / 2, effect.name.substring(0, 3), '10px monospace');
        this.effectLabel.style.textColor = '#ffffff';
        this.effectLabel.style.textAlign = 'center';
        this.effectLabel.style.textBaseline = 'middle';
        this.addChild(this.effectLabel);
    }

    getEffectColor() {
        switch (this.effect.type) {
            case 'buff': return '#27ae60';
            case 'debuff': return '#e74c3c';
            default: return '#95a5a6';
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Update remaining duration display
        const remaining = Math.ceil(this.effect.getRemainingDuration() / 1000);
        this.effectLabel.setText(`${this.effect.name.substring(0, 3)}\n${remaining}s`);
    }
}

export class BattleHUD extends UIComponent {
    constructor(engine, battleScene) {
        super(0, 0, engine.canvas.width, engine.canvas.height);
        this.engine = engine;
        this.battleScene = battleScene;
        this.uiManager = engine.uiManager;
        this.animationManager = new AnimationManager(engine);

        // HUD components
        this.partyHealthBars = [];
        this.enemyHealthBars = [];
        this.actionButtons = [];
        this.statusIndicators = new Map();
        this.battleLogPanel = null;
        this.turnIndicator = null;
        this.damageNumbers = [];

        // Battle state
        this.selectedAction = null;
        this.selectedTarget = null;

        this.initializeHUD();
        this.setupEventListeners();
    }

    initializeHUD() {
        this.createPartyHealthBars();
        this.createEnemyHealthBars();
        this.createActionMenu();
        this.createBattleLog();
        this.createTurnIndicator();
    }

    createPartyHealthBars() {
        const startY = 20;
        const barWidth = 200;
        const barHeight = 25;
        const spacing = 35;

        this.battleScene.partyMembers.forEach((member, index) => {
            const x = 20;
            const y = startY + index * spacing;

            const healthBar = new HealthBar(x, y, barWidth, barHeight, member, false);
            this.addChild(healthBar);
            this.partyHealthBars.push(healthBar);

            // Add name label
            const nameLabel = new Label(x, y - 15, member.name, '12px monospace');
            nameLabel.style.textColor = '#ffffff';
            this.addChild(nameLabel);

            // Add mana bar below health
            const manaBar = new ManaBar(x, y + barHeight + 2, barWidth, 15, member);
            this.addChild(manaBar);
        });
    }

    createEnemyHealthBars() {
        const startY = 20;
        const barWidth = 200;
        const barHeight = 25;
        const spacing = 35;

        this.battleScene.enemies.forEach((enemy, index) => {
            const x = this.size.width - barWidth - 20;
            const y = startY + index * spacing;

            const healthBar = new HealthBar(x, y, barWidth, barHeight, enemy, true);
            this.addChild(healthBar);
            this.enemyHealthBars.push(healthBar);

            // Add name label
            const nameLabel = new Label(x, y - 15, enemy.name, '12px monospace');
            nameLabel.style.textColor = '#ffffff';
            this.addChild(nameLabel);
        });
    }

    createActionMenu() {
        const actions = [
            { text: 'Attack', action: 'attack' },
            { text: 'Magic', action: 'magic' },
            { text: 'Item', action: 'item' },
            { text: 'Run', action: 'run' }
        ];

        const buttonWidth = 120;
        const buttonHeight = 40;
        const startX = this.size.width / 2 - (buttonWidth * 2) - 10;
        const startY = this.size.height - buttonHeight - 20;

        this.actionButtons = actions.map((action, index) => {
            const x = startX + (index % 2) * (buttonWidth + 20);
            const y = startY + Math.floor(index / 2) * (buttonHeight + 10);

            const button = new ActionButton(x, y, buttonWidth, buttonHeight, action.text, action.action);
            button.on('click', () => this.handleActionSelect(action.action));

            this.addChild(button);
            return button;
        });
    }

    createBattleLog() {
        const logWidth = 350;
        const logHeight = 150;

        this.battleLogPanel = new Panel(
            this.size.width - logWidth - 20,
            this.size.height - logHeight - 80,
            logWidth,
            logHeight
        );

        this.battleLogPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.battleLogPanel.style.borderColor = '#ffd700';
        this.addChild(this.battleLogPanel);

        // Add log title
        const logTitle = new Label(10, 15, 'Battle Log', '14px monospace');
        logTitle.style.textColor = '#ffd700';
        this.battleLogPanel.addChild(logTitle);
    }

    createTurnIndicator() {
        this.turnIndicator = new Label(
            this.size.width / 2,
            30,
            '',
            'bold 18px monospace'
        );
        this.turnIndicator.style.textColor = '#ffd700';
        this.turnIndicator.style.textAlign = 'center';
        this.addChild(this.turnIndicator);
    }

    setupEventListeners() {
        // Listen for battle events
        if (this.battleScene.engine.eventBus) {
            this.battleScene.engine.eventBus.on('battle-turn-change', (data) => {
                this.updateTurnIndicator(data.combatant);
            });

            this.battleScene.engine.eventBus.on('battle-damage', (data) => {
                this.showDamageNumber(data.target, data.damage, data.isCritical);
            });

            this.battleScene.engine.eventBus.on('battle-heal', (data) => {
                this.showHealNumber(data.target, data.healing);
            });
        }
    }

    handleActionSelect(action) {
        this.selectedAction = action;

        // Update action buttons appearance
        this.actionButtons.forEach(button => {
            if (button.action === action) {
                button.style.backgroundColor = '#d62828';
            } else {
                button.style.backgroundColor = '#34495e';
            }
        });

        // Notify battle scene
        if (this.battleScene.onActionSelected) {
            this.battleScene.onActionSelected(action);
        }
    }

    updateTurnIndicator(combatant) {
        if (combatant) {
            this.turnIndicator.setText(`${combatant.name}'s Turn`);
            this.animateTurnIndicator();
        }
    }

    animateTurnIndicator() {
        // Simple animation for turn change
        this.animationManager.to(
            this.turnIndicator,
            { 'position.y': 35 },
            200,
            {
                onComplete: () => {
                    this.animationManager.to(
                        this.turnIndicator,
                        { 'position.y': 30 },
                        200
                    );
                }
            }
        );
    }

    showDamageNumber(target, damage, isCritical = false) {
        const damageNumber = {
            text: damage.toString(),
            x: Math.random() * 100 + 50, // Random position near target
            y: Math.random() * 50 + 100,
            color: isCritical ? '#ff0000' : '#ffffff',
            font: isCritical ? 'bold 20px monospace' : '16px monospace',
            velocityY: -50,
            life: 2000,
            created: Date.now()
        };

        if (isCritical) {
            damageNumber.text = 'CRIT! ' + damageNumber.text;
        }

        this.damageNumbers.push(damageNumber);

        // Animate damage number
        setTimeout(() => {
            const index = this.damageNumbers.indexOf(damageNumber);
            if (index > -1) {
                this.damageNumbers.splice(index, 1);
            }
        }, damageNumber.life);
    }

    showHealNumber(target, healing) {
        const healNumber = {
            text: '+' + healing.toString(),
            x: Math.random() * 100 + 50,
            y: Math.random() * 50 + 100,
            color: '#00ff00',
            font: '16px monospace',
            velocityY: -30,
            life: 1500,
            created: Date.now()
        };

        this.damageNumbers.push(healNumber);

        setTimeout(() => {
            const index = this.damageNumbers.indexOf(healNumber);
            if (index > -1) {
                this.damageNumbers.splice(index, 1);
            }
        }, healNumber.life);
    }

    updateStatusEffects() {
        // Clear existing status indicators
        this.statusIndicators.forEach(indicator => {
            this.removeChild(indicator);
        });
        this.statusIndicators.clear();

        // Add new status effect indicators
        let indicatorY = 100;

        this.battleScene.partyMembers.forEach(member => {
            const effects = this.battleScene.getStatusEffects(member);
            effects.forEach((effect, index) => {
                const indicator = new StatusEffectIndicator(250, indicatorY + index * 25, 60, 20, effect);
                this.addChild(indicator);
                this.statusIndicators.set(`${member.name}_${effect.id}`, indicator);
            });
        });
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.animationManager.update(deltaTime);

        // Update battle log
        this.updateBattleLog();

        // Update status effects
        this.updateStatusEffects();

        // Update damage numbers
        this.updateDamageNumbers(deltaTime);
    }

    updateBattleLog() {
        // Clear existing log entries
        this.battleLogPanel.children.forEach(child => {
            if (child !== this.battleLogPanel.children[0]) { // Keep title
                this.battleLogPanel.removeChild(child);
            }
        });

        // Add recent battle log entries
        const recentLogs = this.battleScene.battleLog.slice(-6);
        recentLogs.forEach((entry, index) => {
            const logEntry = new Label(10, 35 + index * 18, entry.message, '11px monospace');
            logEntry.style.textColor = '#cccccc';
            this.battleLogPanel.addChild(logEntry);
        });
    }

    updateDamageNumbers(deltaTime) {
        this.damageNumbers.forEach(number => {
            number.y += number.velocityY * deltaTime / 1000;
            number.velocityY += 20; // Gravity effect
        });
    }

    render(ctx) {
        if (!this.visible) return;

        super.render(ctx);

        // Render damage numbers
        this.renderDamageNumbers(ctx);
    }

    renderDamageNumbers(ctx) {
        ctx.save();

        this.damageNumbers.forEach(number => {
            const alpha = Math.max(0, 1 - (Date.now() - number.created) / number.life);

            ctx.globalAlpha = alpha;
            ctx.fillStyle = number.color;
            ctx.font = number.font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Add shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            ctx.fillText(number.text, number.x, number.y);

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        });

        ctx.restore();
    }

    // Public methods for battle scene integration
    setActionCooldown(action, cooldown) {
        const button = this.actionButtons.find(btn => btn.action === action);
        if (button) {
            button.cooldown = cooldown;
            button.startCooldown();
        }
    }

    highlightTarget(target) {
        // Highlight target in HUD (could add glow effect)
        this.selectedTarget = target;
    }

    clearTargetHighlight() {
        this.selectedTarget = null;
    }

    showVictoryScreen(rewards) {
        const victoryPanel = new Panel(
            this.size.width / 2 - 200,
            this.size.height / 2 - 150,
            400,
            300
        );

        victoryPanel.style.backgroundColor = 'rgba(39, 174, 96, 0.9)';
        victoryPanel.style.borderColor = '#27ae60';

        const victoryLabel = new Label(200, 50, 'VICTORY!', 'bold 36px monospace');
        victoryLabel.style.textColor = '#ffffff';
        victoryLabel.style.textAlign = 'center';
        victoryPanel.addChild(victoryLabel);

        // Show rewards
        const expLabel = new Label(200, 120, `Experience: ${rewards.experience}`, '18px monospace');
        expLabel.style.textColor = '#ffffff';
        expLabel.style.textAlign = 'center';
        victoryPanel.addChild(expLabel);

        const goldLabel = new Label(200, 150, `Gold: ${rewards.gold}`, '18px monospace');
        goldLabel.style.textColor = '#ffffff';
        goldLabel.style.textAlign = 'center';
        victoryPanel.addChild(goldLabel);

        const continueButton = new Button(150, 220, 100, 40, 'Continue');
        continueButton.on('click', () => {
            this.removeChild(victoryPanel);
            if (this.engine.sceneManager) {
                this.engine.sceneManager.switchScene('world_map');
            }
        });
        victoryPanel.addChild(continueButton);

        this.addChild(victoryPanel);
    }

    showDefeatScreen() {
        const defeatPanel = new Panel(
            this.size.width / 2 - 200,
            this.size.height / 2 - 150,
            400,
            300
        );

        defeatPanel.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
        defeatPanel.style.borderColor = '#e74c3c';

        const defeatLabel = new Label(200, 50, 'DEFEAT', 'bold 36px monospace');
        defeatLabel.style.textColor = '#ffffff';
        defeatLabel.style.textAlign = 'center';
        defeatPanel.addChild(defeatLabel);

        const messageLabel = new Label(200, 120, 'The party has fallen...', '18px monospace');
        messageLabel.style.textColor = '#ffffff';
        messageLabel.style.textAlign = 'center';
        defeatPanel.addChild(messageLabel);

        const retryButton = new Button(125, 200, 70, 40, 'Retry');
        retryButton.on('click', () => {
            this.removeChild(defeatPanel);
            // Restart battle or return to menu
        });
        defeatPanel.addChild(retryButton);

        const quitButton = new Button(205, 200, 70, 40, 'Quit');
        quitButton.on('click', () => {
            this.removeChild(defeatPanel);
            if (this.engine.sceneManager) {
                this.engine.sceneManager.switchScene('main_menu');
            }
        });
        defeatPanel.addChild(quitButton);

        this.addChild(defeatPanel);
    }

    // Get state for saving
    getState() {
        return {
            selectedAction: this.selectedAction,
            selectedTarget: this.selectedTarget
        };
    }

    // Restore state from save
    setState(state) {
        if (state.selectedAction) {
            this.selectedAction = state.selectedAction;
        }
        if (state.selectedTarget) {
            this.selectedTarget = state.selectedTarget;
        }
    }
}