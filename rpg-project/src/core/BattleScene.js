/**
 * BattleScene - Turn-based combat system for RPG games
 * Extends Scene with comprehensive battle mechanics
 */

import { Scene } from '../../game-engine/src/core/Scene.js';
import { ValidationHelpers } from '../../game-engine/src/core/ValidationHelpers.js';
import { AbilityManager, OffensiveAbility, DefensiveAbility, UtilityAbility, RESOURCE_TYPES, ABILITY_TYPES, ELEMENTAL_TYPES } from '../../game-engine/src/core/AbilityManager.js';

// Status Effects System
class StatusEffect {
    constructor(id, name, type, duration, effects = {}) {
        this.id = id;
        this.name = name;
        this.type = type; // buff, debuff, neutral
        this.duration = duration;
        this.maxDuration = duration;
        this.effects = effects; // stat modifiers, damage over time, etc.
        this.stacks = 1;
        this.maxStacks = 1;
        this.icon = null;
    }

    apply(target) {
        // Apply stat modifiers
        if (this.effects.statModifiers) {
            Object.entries(this.effects.statModifiers).forEach(([stat, modifier]) => {
                if (target.stats && target.stats[stat] !== undefined) {
                    target.stats[stat] += modifier * this.stacks;
                }
            });
        }

        // Apply other effects
        if (this.effects.onApply) {
            this.effects.onApply(target, this.stacks);
        }
    }

    remove(target) {
        // Remove stat modifiers
        if (this.effects.statModifiers) {
            Object.entries(this.effects.statModifiers).forEach(([stat, modifier]) => {
                if (target.stats && target.stats[stat] !== undefined) {
                    target.stats[stat] -= modifier * this.stacks;
                }
            });
        }

        // Apply removal effects
        if (this.effects.onRemove) {
            this.effects.onRemove(target, this.stacks);
        }
    }

    tick(target, deltaTime) {
        // Handle damage over time
        if (this.effects.damageOverTime) {
            const damage = this.effects.damageOverTime * this.stacks;
            target.takeDamage(damage);
        }

        // Handle healing over time
        if (this.effects.healingOverTime) {
            const healing = this.effects.healingOverTime * this.stacks;
            target.heal(healing);
        }

        // Custom tick effects
        if (this.effects.onTick) {
            this.effects.onTick(target, this.stacks, deltaTime);
        }
    }

    update(deltaTime) {
        if (this.duration > 0) {
            this.duration -= deltaTime;
        }
    }

    isExpired() {
        return this.duration <= 0;
    }

    getRemainingDuration() {
        return Math.max(0, this.duration);
    }

    addStack() {
        if (this.stacks < this.maxStacks) {
            this.stacks++;
        }
    }

    removeStack() {
        if (this.stacks > 0) {
            this.stacks--;
        }
    }
}

class StatusEffectManager {
    constructor() {
        this.activeEffects = new Map();
        this.immunities = new Set();
        this.resistances = new Map();
    }

    applyEffect(target, effectId, duration, stacks = 1) {
        // Check immunity
        if (this.immunities.has(effectId)) {
            return { success: false, reason: 'immune' };
        }

        const effect = this.createStatusEffect(effectId, duration);

        if (!effect) {
            return { success: false, reason: 'invalid_effect' };
        }

        effect.stacks = stacks;

        // Check if effect already exists
        if (this.activeEffects.has(effectId)) {
            const existing = this.activeEffects.get(effectId);
            existing.addStack();
            existing.duration = Math.max(existing.duration, duration);
        } else {
            this.activeEffects.set(effectId, effect);
            effect.apply(target);
        }

        return { success: true, effect };
    }

    removeEffect(target, effectId) {
        const effect = this.activeEffects.get(effectId);
        if (effect) {
            effect.remove(target);
            this.activeEffects.delete(effectId);
            return true;
        }
        return false;
    }

    update(target, deltaTime) {
        const toRemove = [];

        this.activeEffects.forEach((effect, effectId) => {
            effect.update(deltaTime);
            effect.tick(target, deltaTime);

            if (effect.isExpired()) {
                toRemove.push(effectId);
            }
        });

        // Remove expired effects
        toRemove.forEach(effectId => {
            const effect = this.activeEffects.get(effectId);
            effect.remove(target);
            this.activeEffects.delete(effectId);
        });
    }

    hasEffect(effectId) {
        return this.activeEffects.has(effectId);
    }

    getEffect(effectId) {
        return this.activeEffects.get(effectId);
    }

    getAllEffects() {
        return Array.from(this.activeEffects.values());
    }

    clearAllEffects(target) {
        this.activeEffects.forEach((effect, effectId) => {
            effect.remove(target);
        });
        this.activeEffects.clear();
    }

    createStatusEffect(effectId, duration) {
        const effects = {
            // Buffs
            'strength_boost': new StatusEffect('strength_boost', 'Strength Boost', 'buff', duration, {
                statModifiers: { attackPower: 5 },
                icon: 'strength_icon'
            }),

            'defense_boost': new StatusEffect('defense_boost', 'Defense Boost', 'buff', duration, {
                statModifiers: { defense: 10 },
                icon: 'defense_icon'
            }),

            'regeneration': new StatusEffect('regeneration', 'Regeneration', 'buff', duration, {
                healingOverTime: 2 // 2 HP per second
            }),

            // Debuffs
            'poison': new StatusEffect('poison', 'Poisoned', 'debuff', duration, {
                damageOverTime: 3, // 3 damage per second
                icon: 'poison_icon'
            }),

            'weakness': new StatusEffect('weakness', 'Weakness', 'debuff', duration, {
                statModifiers: { attackPower: -3 },
                icon: 'weakness_icon'
            }),

            'slow': new StatusEffect('slow', 'Slowed', 'debuff', duration, {
                statModifiers: { movementSpeed: -20 },
                icon: 'slow_icon'
            }),

            // Neutral
            'stun': new StatusEffect('stun', 'Stunned', 'neutral', duration, {
                effects: { cannotAct: true },
                icon: 'stun_icon'
            })
        };

        return effects[effectId] ? effects[effectId] : null;
    }
}

class TurnManager {
    constructor() {
        this.turnOrder = [];
        this.currentTurnIndex = 0;
        this.round = 1;
        this.speedBasedTurns = true;
    }

    initializeCombatants(partyMembers, enemies) {
        this.turnOrder = [];

        // Add party members
        partyMembers.forEach(member => {
            this.turnOrder.push({
                type: 'party',
                entity: member,
                speed: member.stats ? member.stats.movementSpeed : 100,
                name: member.name
            });
        });

        // Add enemies
        enemies.forEach(enemy => {
            this.turnOrder.push({
                type: 'enemy',
                entity: enemy,
                speed: enemy.stats ? enemy.stats.movementSpeed : 80,
                name: enemy.name
            });
        });

        // Sort by speed if speed-based turns are enabled
        if (this.speedBasedTurns) {
            this.turnOrder.sort((a, b) => b.speed - a.speed);
        }

        this.currentTurnIndex = 0;
        this.round = 1;
    }

    getCurrentTurn() {
        return this.turnOrder[this.currentTurnIndex];
    }

    nextTurn() {
        this.currentTurnIndex++;
        if (this.currentTurnIndex >= this.turnOrder.length) {
            this.currentTurnIndex = 0;
            this.round++;
        }
        return this.getCurrentTurn();
    }

    removeCombatant(entity) {
        const index = this.turnOrder.findIndex(turn => turn.entity === entity);
        if (index !== -1) {
            this.turnOrder.splice(index, 1);
            if (this.currentTurnIndex >= index && this.currentTurnIndex > 0) {
                this.currentTurnIndex--;
            }
        }
    }

    getTurnOrder() {
        return this.turnOrder.map(turn => ({
            name: turn.name,
            type: turn.type,
            speed: turn.speed
        }));
    }
}

class ActionMenu {
    constructor(battleScene) {
        this.battleScene = battleScene;
        this.visible = false;
        this.selectedIndex = 0;
        this.actions = [
            { id: 'attack', name: 'Attack', description: 'Physical attack' },
            { id: 'magic', name: 'Magic', description: 'Use magical abilities' },
            { id: 'item', name: 'Item', description: 'Use items' },
            { id: 'run', name: 'Run', description: 'Attempt to flee' }
        ];
    }

    show() {
        this.visible = true;
        this.selectedIndex = 0;
    }

    hide() {
        this.visible = false;
    }

    selectAction(index) {
        if (index >= 0 && index < this.actions.length) {
            this.selectedIndex = index;
            return this.actions[index];
        }
        return null;
    }

    getCurrentAction() {
        return this.actions[this.selectedIndex];
    }

    getActions() {
        return this.actions;
    }

    handleInput(input) {
        if (!this.visible) return null;

        if (input.isKeyPressed('ArrowUp') || input.isKeyPressed('KeyW')) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        } else if (input.isKeyPressed('ArrowDown') || input.isKeyPressed('KeyS')) {
            this.selectedIndex = Math.min(this.actions.length - 1, this.selectedIndex + 1);
        } else if (input.isKeyPressed('Enter') || input.isKeyPressed('Space')) {
            return this.getCurrentAction();
        }

        return null;
    }
}

class TargetSelector {
    constructor(battleScene) {
        this.battleScene = battleScene;
        this.visible = false;
        this.targets = [];
        this.selectedIndex = 0;
        this.targetType = 'single'; // single, area, self
    }

    setTargets(targets, targetType = 'single') {
        this.targets = targets.filter(target => target.health > 0);
        this.selectedIndex = 0;
        this.targetType = targetType;
        this.visible = this.targets.length > 0;
    }

    getCurrentTarget() {
        if (this.targets.length === 0) return null;
        return this.targets[this.selectedIndex];
    }

    selectNextTarget() {
        if (this.targets.length === 0) return;
        this.selectedIndex = (this.selectedIndex + 1) % this.targets.length;
    }

    selectPreviousTarget() {
        if (this.targets.length === 0) return;
        this.selectedIndex = this.selectedIndex === 0 ? this.targets.length - 1 : this.selectedIndex - 1;
    }

    handleInput(input) {
        if (!this.visible) return null;

        if (input.isKeyPressed('ArrowLeft') || input.isKeyPressed('KeyA')) {
            this.selectPreviousTarget();
        } else if (input.isKeyPressed('ArrowRight') || input.isKeyPressed('KeyD')) {
            this.selectNextTarget();
        } else if (input.isKeyPressed('Enter') || input.isKeyPressed('Space')) {
            return this.getCurrentTarget();
        }

        return null;
    }

    hide() {
        this.visible = false;
        this.targets = [];
        this.selectedIndex = 0;
    }
}

class EnemyAI {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty;
        this.aggressionLevels = {
            easy: 0.3,
            normal: 0.5,
            hard: 0.7,
            expert: 0.9
        };
        this.intelligenceLevels = {
            easy: 0.2,
            normal: 0.5,
            hard: 0.8,
            expert: 1.0
        };
    }

    decideAction(enemy, partyMembers, enemies) {
        const aggression = this.aggressionLevels[this.difficulty] || 0.5;
        const intelligence = this.intelligenceLevels[this.difficulty] || 0.5;

        // Get available actions based on enemy type
        const availableActions = this.getAvailableActions(enemy);

        // Choose action based on difficulty
        const actionRoll = Math.random();

        if (actionRoll < aggression) {
            // Aggressive action - attack
            return this.chooseAttackAction(enemy, partyMembers, availableActions);
        } else if (actionRoll < aggression + intelligence * 0.3) {
            // Defensive action
            return this.chooseDefensiveAction(enemy, availableActions);
        } else {
            // Utility action
            return this.chooseUtilityAction(enemy, availableActions);
        }
    }

    getAvailableActions(enemy) {
        // This would be based on enemy configuration
        // For now, return basic actions
        return [
            { type: 'attack', name: 'Attack', targetType: 'single' },
            { type: 'defend', name: 'Defend', targetType: 'self' },
            { type: 'ability', name: 'Special', targetType: 'single' }
        ];
    }

    chooseAttackAction(enemy, partyMembers, availableActions) {
        const attackAction = availableActions.find(a => a.type === 'attack');
        if (!attackAction) return null;

        // Choose target - prioritize weakest or random based on difficulty
        const targetRoll = Math.random();
        let target;

        if (this.difficulty === 'easy') {
            // Random target
            target = partyMembers[Math.floor(Math.random() * partyMembers.length)];
        } else if (this.difficulty === 'normal') {
            // Target weakest
            target = partyMembers.reduce((weakest, member) =>
                member.health < weakest.health ? member : weakest
            );
        } else {
            // Target healer or support first, then weakest
            const healers = partyMembers.filter(m => m.job === 'cleric');
            if (healers.length > 0) {
                target = healers[Math.floor(Math.random() * healers.length)];
            } else {
                target = partyMembers.reduce((weakest, member) =>
                    member.health < weakest.health ? member : weakest
                );
            }
        }

        return {
            action: attackAction,
            target: target
        };
    }

    chooseDefensiveAction(enemy, availableActions) {
        const defendAction = availableActions.find(a => a.type === 'defend');
        return defendAction ? { action: defendAction, target: enemy } : null;
    }

    chooseUtilityAction(enemy, availableActions) {
        const utilityActions = availableActions.filter(a => a.type === 'ability');
        if (utilityActions.length > 0) {
            return {
                action: utilityActions[Math.floor(Math.random() * utilityActions.length)],
                target: enemy // Self-target for simplicity
            };
        }
        return null;
    }
}

class DamageCalculator {
    constructor() {
        this.criticalMultiplier = 2.0;
        this.baseHitChance = 0.85;
    }

    calculatePhysicalDamage(attacker, defender, baseDamage = 10) {
        const attackerStats = attacker.stats || attacker.baseStats;
        const defenderStats = defender.stats || defender.baseStats;

        // Base damage calculation
        let damage = baseDamage + (attackerStats.attackPower || attackerStats.strength || 0);
        damage -= (defenderStats.defense || 0) * 0.5;

        // Critical hit
        const criticalChance = attackerStats.criticalChance || 0.05;
        const isCritical = Math.random() < criticalChance;
        if (isCritical) {
            damage *= this.criticalMultiplier;
        }

        // Dodge chance
        const dodgeChance = defenderStats.dodgeChance || 0.05;
        const isDodged = Math.random() < dodgeChance;
        if (isDodged) {
            return { damage: 0, dodged: true, critical: false };
        }

        // Block chance
        const blockChance = defenderStats.blockChance || 0.05;
        const isBlocked = Math.random() < blockChance;
        if (isBlocked) {
            damage *= 0.5; // Partial block
            return { damage: Math.max(1, Math.floor(damage)), dodged: false, critical: isCritical, blocked: true };
        }

        return {
            damage: Math.max(1, Math.floor(damage)),
            dodged: false,
            critical: isCritical,
            blocked: false
        };
    }

    calculateMagicalDamage(attacker, defender, baseDamage = 15, elementalType = 'none') {
        const attackerStats = attacker.stats || attacker.baseStats;
        const defenderStats = defender.stats || defender.baseStats;

        let damage = baseDamage + (attackerStats.spellPower || attackerStats.intelligence || 0);

        // Apply elemental modifiers
        if (defenderStats.resistances && defenderStats.resistances[elementalType]) {
            const resistance = defenderStats.resistances[elementalType];
            damage *= (1 - resistance / 100);
        }

        // Magic resistance
        const magicResistance = defenderStats.magicResistance || 0;
        damage *= (1 - magicResistance / 200);

        return {
            damage: Math.max(1, Math.floor(damage)),
            elementalType,
            resisted: magicResistance > 0
        };
    }

    calculateHealing(caster, target, baseHealing = 20) {
        const casterStats = caster.stats || caster.baseStats;
        const targetStats = target.stats || target.baseStats;

        let healing = baseHealing + (casterStats.wisdom || 0) * 0.5;

        // Ensure healing doesn't exceed max health
        const maxHeal = target.maxHealth - target.health;
        healing = Math.min(healing, maxHeal);

        return {
            healing: Math.max(0, Math.floor(healing)),
            overheal: healing > maxHeal
        };
    }
}

class BattleScene extends Scene {
    constructor(name, engine, options = {}) {
        super(name, engine);

        this.options = {
            backgroundImage: options.backgroundImage || null,
            battleMusic: options.battleMusic || null,
            difficulty: options.difficulty || 'normal',
            allowRun: options.allowRun !== false,
            ...options
        };

        // Core battle systems
        this.turnManager = new TurnManager();
        this.damageCalculator = new DamageCalculator();
        this.enemyAI = new EnemyAI(this.options.difficulty);

        // UI components
        this.actionMenu = new ActionMenu(this);
        this.targetSelector = new TargetSelector(this);

        // Battle state
        this.partyMembers = [];
        this.enemies = [];
        this.currentCombatant = null;
        this.battleState = 'initializing'; // initializing, active, victory, defeat
        this.battleLog = [];
        this.rewards = {
            experience: 0,
            gold: 0,
            items: []
        };

        // Status effects system
        this.statusEffectManagers = new Map(); // Maps combatants to their status managers

        // Animation and effects
        this.animationQueue = [];
        this.particleEffects = [];

        // Battle configuration
        this.maxLogEntries = 50;
        this.turnTimeLimit = 30000; // 30 seconds per turn
        this.currentTurnTime = 0;
    }

    init() {
        super.init();
        console.log('BattleScene initialized');

        // Setup battle systems
        this.setupBattleSystems();

        // Setup input handling
        this.setupInputHandling();

        // Start battle music if specified
        if (this.options.battleMusic && this.engine.audioManager) {
            this.engine.audioManager.playMusic(this.options.battleMusic);
        }
    }

    setupBattleSystems() {
        // Initialize with empty combatants - will be set when battle starts
        this.partyMembers = [];
        this.enemies = [];
    }

    setupInputHandling() {
        if (this.engine.inputManager) {
            // Input handling is done in update loop
        }
    }

    startBattle(partyMembers, enemies) {
        ValidationHelpers.validateType(partyMembers, 'array', 'partyMembers');
        ValidationHelpers.validateType(enemies, 'array', 'enemies');

        this.partyMembers = partyMembers;
        this.enemies = enemies;

        // Initialize status effect managers for all combatants
        this.initializeStatusEffects();

        // Initialize turn manager
        this.turnManager.initializeCombatants(this.partyMembers, this.enemies);

        // Set initial state
        this.battleState = 'active';
        this.currentCombatant = this.turnManager.getCurrentTurn();

        // Setup UI
        this.actionMenu.hide();
        this.targetSelector.hide();

        // Add battle log entry
        this.addBattleLog(`Battle started! ${this.partyMembers.length} vs ${this.enemies.length}`);

        console.log('Battle started with', partyMembers.length, 'party members and', enemies.length, 'enemies');
    }

    update(deltaTime) {
        if (!this.isActive || this.battleState !== 'active') return;

        super.update(deltaTime);

        // Update battle timer
        this.currentTurnTime += deltaTime;

        // Check for turn timeout (optional)
        if (this.currentTurnTime > this.turnTimeLimit) {
            this.forceNextTurn();
        }

        // Update status effects for all combatants
        this.updateStatusEffects(deltaTime);

        // Update animations
        this.updateAnimations(deltaTime);

        // Handle current turn
        this.processCurrentTurn(deltaTime);

        // Check battle end conditions
        this.checkBattleEndConditions();
    }

    processCurrentTurn(deltaTime) {
        if (!this.currentCombatant) return;

        const combatant = this.currentCombatant.entity;

        if (this.currentCombatant.type === 'party') {
            // Player turn - handle input
            this.handlePlayerTurn(combatant);
        } else {
            // Enemy turn - AI decision
            this.handleEnemyTurn(combatant);
        }
    }

    handlePlayerTurn(combatant) {
        if (this.actionMenu.visible) {
            // Action menu is open
            const selectedAction = this.actionMenu.handleInput(this.engine.inputManager);
            if (selectedAction) {
                this.executePlayerAction(combatant, selectedAction);
            }
        } else if (this.targetSelector.visible) {
            // Target selection is active
            const selectedTarget = this.targetSelector.handleInput(this.engine.inputManager);
            if (selectedTarget) {
                this.executeActionOnTarget(combatant, this.targetSelector.currentAction, selectedTarget);
            }
        } else {
            // Show action menu
            this.actionMenu.show();
        }
    }

    executePlayerAction(combatant, action) {
        this.actionMenu.hide();

        switch (action.id) {
            case 'attack':
                this.targetSelector.setTargets(this.enemies);
                this.targetSelector.currentAction = { type: 'attack', name: 'Attack' };
                break;

            case 'magic':
                // Show magic menu (simplified - would show available spells)
                if (combatant.abilities && combatant.abilities.length > 0) {
                    this.targetSelector.setTargets(this.enemies);
                    this.targetSelector.currentAction = { type: 'magic', name: 'Magic' };
                } else {
                    this.addBattleLog(`${combatant.name} has no magic abilities!`);
                    this.endTurn();
                }
                break;

            case 'item':
                // Show item menu (simplified)
                this.addBattleLog(`${combatant.name} uses an item!`);
                this.endTurn();
                break;

            case 'run':
                this.attemptRun(combatant);
                break;
        }
    }

    executeActionOnTarget(attacker, action, target) {
        this.targetSelector.hide();

        let result = null;

        switch (action.type) {
            case 'attack':
                result = this.damageCalculator.calculatePhysicalDamage(attacker, target);
                if (result.dodged) {
                    this.addBattleLog(`${target.name} dodged ${attacker.name}'s attack!`);
                } else if (result.blocked) {
                    this.addBattleLog(`${target.name} blocked ${attacker.name}'s attack!`);
                } else {
                    target.takeDamage(result.damage);
                    let message = `${attacker.name} attacks ${target.name} for ${result.damage} damage`;
                    if (result.critical) message += ' (CRITICAL!)';
                    this.addBattleLog(message);
                }
                break;

            case 'magic':
                // Simplified magic damage
                result = this.damageCalculator.calculateMagicalDamage(attacker, target);
                target.takeDamage(result.damage);
                this.addBattleLog(`${attacker.name} casts magic on ${target.name} for ${result.damage} damage`);
                break;
        }

        // Add animation
        this.addBattleAnimation('attack', attacker, target);

        // Check if target is defeated
        if (target.health <= 0) {
            this.removeCombatant(target);
            this.addBattleLog(`${target.name} is defeated!`);
        }

        this.endTurn();
    }

    handleEnemyTurn(enemy) {
        // AI makes decision
        const aiDecision = this.enemyAI.decideAction(enemy, this.partyMembers, this.enemies);

        if (aiDecision) {
            // Simulate AI thinking time
            setTimeout(() => {
                this.executeEnemyAction(enemy, aiDecision);
            }, 1000); // 1 second delay for AI "thinking"
        } else {
            // Default action
            this.executeEnemyAction(enemy, {
                action: { type: 'attack', name: 'Attack' },
                target: this.partyMembers[0]
            });
        }
    }

    executeEnemyAction(enemy, decision) {
        const { action, target } = decision;

        if (action.type === 'attack' && target) {
            const result = this.damageCalculator.calculatePhysicalDamage(enemy, target);

            if (result.dodged) {
                this.addBattleLog(`${target.name} dodged ${enemy.name}'s attack!`);
            } else if (result.blocked) {
                this.addBattleLog(`${target.name} blocked ${enemy.name}'s attack!`);
            } else {
                target.takeDamage(result.damage);
                let message = `${enemy.name} attacks ${target.name} for ${result.damage} damage`;
                if (result.critical) message += ' (CRITICAL!)';
                this.addBattleLog(message);
            }

            // Check if target is defeated
            if (target.health <= 0) {
                this.removeCombatant(target);
                this.addBattleLog(`${target.name} is defeated!`);
            }
        }

        // Add animation
        this.addBattleAnimation('attack', enemy, target);

        this.endTurn();
    }

    attemptRun(combatant) {
        // Simple run calculation - 50% chance to succeed
        const runSuccess = Math.random() < 0.5;

        if (runSuccess) {
            this.addBattleLog(`${combatant.name} successfully fled the battle!`);
            this.endBattle('fled');
        } else {
            this.addBattleLog(`${combatant.name} failed to flee!`);
            this.endTurn();
        }
    }

    endTurn() {
        // Reset turn timer
        this.currentTurnTime = 0;

        // Get next turn
        const nextTurn = this.turnManager.nextTurn();

        if (nextTurn) {
            this.currentCombatant = nextTurn;
            this.addBattleLog(`${nextTurn.name}'s turn`);
        } else {
            // No more turns possible
            this.endBattle('error');
        }
    }

    forceNextTurn() {
        this.addBattleLog(`${this.currentCombatant.name}'s turn timed out!`);
        this.endTurn();
    }

    removeCombatant(combatant) {
        // Remove from turn manager
        this.turnManager.removeCombatant(combatant);

        // Remove from party or enemies array
        if (this.partyMembers.includes(combatant)) {
            const index = this.partyMembers.indexOf(combatant);
            this.partyMembers.splice(index, 1);
        } else if (this.enemies.includes(combatant)) {
            const index = this.enemies.indexOf(combatant);
            this.enemies.splice(index, 1);
        }
    }

    checkBattleEndConditions() {
        // Check victory - all enemies defeated
        if (this.enemies.length === 0) {
            this.endBattle('victory');
            return;
        }

        // Check defeat - all party members defeated
        if (this.partyMembers.length === 0) {
            this.endBattle('defeat');
            return;
        }

        // Check if battle should continue
        if (this.turnManager.turnOrder.length === 0) {
            this.endBattle('error');
        }
    }

    endBattle(result) {
        this.battleState = result === 'victory' ? 'victory' :
                          result === 'defeat' ? 'defeat' :
                          result === 'fled' ? 'fled' : 'ended';

        if (result === 'victory') {
            this.calculateRewards();
            this.addBattleLog(`Victory! Gained ${this.rewards.experience} EXP and ${this.rewards.gold} gold`);
        } else if (result === 'defeat') {
            this.addBattleLog('Defeat! The party has fallen...');
        }

        // Stop battle music
        if (this.engine.audioManager) {
            this.engine.audioManager.stopMusic();
        }

        // Emit battle end event
        if (this.engine.eventBus) {
            this.engine.eventBus.emit('battle-ended', {
                result,
                rewards: this.rewards,
                survivors: this.partyMembers
            });
        }
    }

    calculateRewards() {
        // Calculate experience and gold based on enemies defeated
        this.enemies.forEach(enemy => {
            this.rewards.experience += enemy.level * 20;
            this.rewards.gold += enemy.level * 10;
        });

        // Award experience to party members
        const expPerMember = Math.floor(this.rewards.experience / this.partyMembers.length);
        this.partyMembers.forEach(member => {
            if (member.gainExperience) {
                member.gainExperience(expPerMember);
            }
        });
    }

    addBattleLog(message) {
        const logEntry = {
            timestamp: Date.now(),
            message: message
        };

        this.battleLog.push(logEntry);

        // Keep log size manageable
        if (this.battleLog.length > this.maxLogEntries) {
            this.battleLog.shift();
        }

        console.log('Battle Log:', message);
    }

    addBattleAnimation(type, attacker, target) {
        // Simple animation queue - would integrate with AnimationManager
        this.animationQueue.push({
            type,
            attacker,
            target,
            duration: 500,
            startTime: Date.now()
        });
    }

    updateAnimations(deltaTime) {
        // Update animation queue
        this.animationQueue = this.animationQueue.filter(animation => {
            const elapsed = Date.now() - animation.startTime;
            return elapsed < animation.duration;
        });
    }

    render(ctx) {
        if (!this.isActive) return;

        super.render(ctx);

        // Render battle background
        this.renderBattleBackground(ctx);

        // Render combatants
        this.renderCombatants(ctx);

        // Render UI
        this.renderBattleUI(ctx);

        // Render animations
        this.renderAnimations(ctx);
    }

    renderBattleBackground(ctx) {
        // Simple battle background
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Add some battle atmosphere
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * ctx.canvas.width,
                Math.random() * ctx.canvas.height,
                Math.random() * 5 + 1,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    renderCombatants(ctx) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;

        // Render party members (left side)
        this.partyMembers.forEach((member, index) => {
            const x = 100;
            const y = centerY - 100 + index * 80;
            this.renderCombatant(ctx, member, x, y, true);
        });

        // Render enemies (right side)
        this.enemies.forEach((enemy, index) => {
            const x = ctx.canvas.width - 100;
            const y = centerY - 100 + index * 80;
            this.renderCombatant(ctx, enemy, x, y, false);
        });
    }

    renderStatusEffects(ctx, combatant, x, y) {
        const effects = this.getStatusEffects(combatant);
        if (effects.length === 0) return;

        ctx.save();
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';

        effects.forEach((effect, index) => {
            const effectX = x;
            const effectY = y - 45 - (index * 15);
            const remaining = Math.ceil(effect.getRemainingDuration() / 1000);

            // Effect background
            const bgColor = effect.type === 'buff' ? '#4CAF50' :
                           effect.type === 'debuff' ? '#F44336' : '#9C27B0';
            ctx.fillStyle = bgColor;
            ctx.fillRect(effectX - 25, effectY - 8, 50, 14);

            // Effect text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${effect.name} (${remaining}s)`, effectX, effectY + 3);
        });

        ctx.restore();
    }

    renderCombatant(ctx, combatant, x, y, isPartyMember) {
        // Simple combatant representation
        ctx.save();
        ctx.translate(x, y);

        // Body
        ctx.fillStyle = isPartyMember ? '#3498db' : '#e74c3c';
        ctx.fillRect(-20, -30, 40, 60);

        // Head
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(0, -40, 15, 0, Math.PI * 2);
        ctx.fill();

        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(combatant.name, 0, 50);

        // Health bar
        const healthPercent = combatant.health / combatant.maxHealth;
        const barWidth = 60;
        const barHeight = 8;

        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(-barWidth/2, 60, barWidth, barHeight);

        // Health
        ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(-barWidth/2, 60, barWidth * healthPercent, barHeight);

        // Health text
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(`${combatant.health}/${combatant.maxHealth}`, 0, 75);

        // Render status effects
        this.renderStatusEffects(ctx, combatant, 0, -30);

        ctx.restore();
    }

    renderBattleUI(ctx) {
        // Render action menu
        if (this.actionMenu.visible) {
            this.renderActionMenu(ctx);
        }

        // Render target selector
        if (this.targetSelector.visible) {
            this.renderTargetSelector(ctx);
        }

        // Render battle log
        this.renderBattleLog(ctx);

        // Render current turn indicator
        this.renderTurnIndicator(ctx);
    }

    renderActionMenu(ctx) {
        const menuX = 50;
        const menuY = ctx.canvas.height - 200;
        const itemHeight = 40;

        ctx.save();

        // Menu background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(menuX - 10, menuY - 10, 200, this.actionMenu.actions.length * itemHeight + 20);

        // Menu border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(menuX - 10, menuY - 10, 200, this.actionMenu.actions.length * itemHeight + 20);

        // Menu items
        this.actionMenu.actions.forEach((action, index) => {
            const isSelected = index === this.actionMenu.selectedIndex;
            const itemY = menuY + index * itemHeight;

            // Highlight selected item
            if (isSelected) {
                ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';
                ctx.fillRect(menuX - 8, itemY - 8, 196, itemHeight);
            }

            // Action text
            ctx.fillStyle = isSelected ? '#ffffff' : '#cccccc';
            ctx.font = '16px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(action.name, menuX, itemY + 25);

            // Action description
            if (isSelected) {
                ctx.fillStyle = '#aaaaaa';
                ctx.font = '12px monospace';
                ctx.fillText(action.description, menuX, itemY + 38);
            }
        });

        ctx.restore();
    }

    renderTargetSelector(ctx) {
        // Highlight selected target
        if (this.targetSelector.targets.length > 0) {
            const target = this.targetSelector.getCurrentTarget();
            if (target) {
                // Simple highlight - would be more sophisticated in real implementation
                ctx.save();
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]);

                // Find target position (simplified)
                const isParty = this.partyMembers.includes(target);
                const index = isParty ?
                    this.partyMembers.indexOf(target) :
                    this.enemies.indexOf(target);
                const centerY = ctx.canvas.height / 2;
                const x = isParty ? 100 : ctx.canvas.width - 100;
                const y = centerY - 100 + index * 80;

                ctx.strokeRect(x - 25, y - 35, 50, 70);
                ctx.restore();
            }
        }
    }

    renderBattleLog(ctx) {
        const logX = ctx.canvas.width - 300;
        const logY = 50;
        const lineHeight = 20;

        ctx.save();

        // Log background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(logX - 10, logY - 10, 290, 200);

        // Log border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(logX - 10, logY - 10, 290, 200);

        // Log entries
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';

        const recentLogs = this.battleLog.slice(-8);
        recentLogs.forEach((entry, index) => {
            const y = logY + index * lineHeight;
            ctx.fillText(entry.message, logX, y + 15);
        });

        ctx.restore();
    }

    renderTurnIndicator(ctx) {
        if (!this.currentCombatant) return;

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.currentCombatant.name}'s Turn`, ctx.canvas.width / 2, 30);
        ctx.restore();
    }

    renderAnimations(ctx) {
        // Simple animation rendering - would integrate with AnimationManager
        this.animationQueue.forEach(animation => {
            const progress = (Date.now() - animation.startTime) / animation.duration;

            if (animation.type === 'attack') {
                // Simple attack line animation
                ctx.save();
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);

                // Would need to calculate actual positions
                const startX = 100; // Attacker position
                const startY = ctx.canvas.height / 2;
                const endX = ctx.canvas.width - 100; // Target position
                const endY = ctx.canvas.height / 2;

                const currentX = startX + (endX - startX) * progress;
                const currentY = startY + (endY - startY) * progress;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(currentX, currentY);
                ctx.stroke();
                ctx.restore();
            }
        });
    }

    // Status Effects System Methods
    initializeStatusEffects() {
        // Initialize status effect managers for all combatants
        this.statusEffectManagers.clear();

        // Initialize for party members
        this.partyMembers.forEach(member => {
            this.statusEffectManagers.set(member, new StatusEffectManager());
        });

        // Initialize for enemies
        this.enemies.forEach(enemy => {
            this.statusEffectManagers.set(enemy, new StatusEffectManager());
        });
    }

    updateStatusEffects(deltaTime) {
        // Update status effects for all combatants
        this.statusEffectManagers.forEach((manager, combatant) => {
            if (combatant.health > 0) { // Only update for living combatants
                manager.update(combatant, deltaTime);
            }
        });
    }

    applyStatusEffect(target, effectId, duration, stacks = 1) {
        const manager = this.statusEffectManagers.get(target);
        if (manager) {
            const result = manager.applyEffect(target, effectId, duration, stacks);
            if (result.success) {
                this.addBattleLog(`${target.name} is affected by ${result.effect.name}!`);
                this.addBattleAnimation('status_effect', null, target);
            }
            return result;
        }
        return { success: false, reason: 'no_manager' };
    }

    removeStatusEffect(target, effectId) {
        const manager = this.statusEffectManagers.get(target);
        if (manager) {
            const removed = manager.removeEffect(target, effectId);
            if (removed) {
                this.addBattleLog(`${target.name} is no longer affected by ${effectId}`);
            }
            return removed;
        }
        return false;
    }

    getStatusEffects(combatant) {
        const manager = this.statusEffectManagers.get(combatant);
        return manager ? manager.getAllEffects() : [];
    }

    hasStatusEffect(combatant, effectId) {
        const manager = this.statusEffectManagers.get(combatant);
        return manager ? manager.hasEffect(effectId) : false;
    }

    // Enhanced combat with status effects
    executeActionOnTarget(attacker, action, target) {
        this.targetSelector.hide();

        let result = null;

        // Check if attacker is stunned or cannot act
        if (this.hasStatusEffect(attacker, 'stun')) {
            this.addBattleLog(`${attacker.name} is stunned and cannot act!`);
            this.endTurn();
            return;
        }

        switch (action.type) {
            case 'attack':
                result = this.damageCalculator.calculatePhysicalDamage(attacker, target);
                if (result.dodged) {
                    this.addBattleLog(`${target.name} dodged ${attacker.name}'s attack!`);
                } else if (result.blocked) {
                    this.addBattleLog(`${target.name} blocked ${attacker.name}'s attack!`);
                } else {
                    target.takeDamage(result.damage);
                    let message = `${attacker.name} attacks ${target.name} for ${result.damage} damage`;
                    if (result.critical) message += ' (CRITICAL!)';
                    this.addBattleLog(message);

                    // Chance to apply status effects on hit
                    this.applyRandomStatusEffect(attacker, target, action.type);
                }
                break;

            case 'magic':
                // Enhanced magic with status effects
                result = this.damageCalculator.calculateMagicalDamage(attacker, target);
                target.takeDamage(result.damage);
                this.addBattleLog(`${attacker.name} casts magic on ${target.name} for ${result.damage} damage`);

                // Higher chance to apply status effects with magic
                this.applyRandomStatusEffect(attacker, target, action.type);
                break;
        }

        // Add animation
        this.addBattleAnimation('attack', attacker, target);

        // Check if target is defeated
        if (target.health <= 0) {
            this.removeCombatant(target);
            this.addBattleLog(`${target.name} is defeated!`);
        }

        this.endTurn();
    }

    applyRandomStatusEffect(attacker, target, actionType) {
        // Random chance to apply status effects based on action type
        const effectChance = actionType === 'magic' ? 0.3 : 0.1; // 30% for magic, 10% for physical

        if (Math.random() < effectChance) {
            const possibleEffects = actionType === 'magic' ?
                ['poison', 'weakness', 'slow'] :
                ['weakness', 'slow'];

            const randomEffect = possibleEffects[Math.floor(Math.random() * possibleEffects.length)];
            const duration = 5000 + Math.random() * 5000; // 5-10 seconds

            this.applyStatusEffect(target, randomEffect, duration);
        }
    }

    // Random Encounter System
    static generateRandomEncounter(difficulty = 'normal', playerLevel = 1) {
        const enemyTypes = {
            easy: ['goblin', 'slime', 'rat'],
            normal: ['goblin', 'orc', 'wolf', 'skeleton'],
            hard: ['orc_warrior', 'skeleton_archer', 'wolf_pack_leader'],
            expert: ['troll', 'lich', 'dragon_whelp']
        };

        const enemyStats = {
            goblin: { level: 1, health: 30, attack: 8, defense: 2, name: 'Goblin' },
            slime: { level: 1, health: 20, attack: 5, defense: 1, name: 'Slime' },
            rat: { level: 1, health: 15, attack: 4, defense: 1, name: 'Giant Rat' },
            orc: { level: 3, health: 60, attack: 15, defense: 5, name: 'Orc' },
            wolf: { level: 2, health: 40, attack: 12, defense: 3, name: 'Wolf' },
            skeleton: { level: 2, health: 35, attack: 10, defense: 4, name: 'Skeleton' },
            orc_warrior: { level: 5, health: 100, attack: 25, defense: 8, name: 'Orc Warrior' },
            skeleton_archer: { level: 4, health: 45, attack: 18, defense: 3, name: 'Skeleton Archer' },
            wolf_pack_leader: { level: 6, health: 80, attack: 20, defense: 6, name: 'Wolf Pack Leader' },
            troll: { level: 8, health: 150, attack: 30, defense: 12, name: 'Troll' },
            lich: { level: 10, health: 120, attack: 35, defense: 10, name: 'Lich' },
            dragon_whelp: { level: 12, health: 200, attack: 40, defense: 15, name: 'Dragon Whelp' }
        };

        const availableTypes = enemyTypes[difficulty] || enemyTypes.normal;
        const enemyCount = Math.floor(Math.random() * 3) + 1; // 1-3 enemies
        const enemies = [];

        for (let i = 0; i < enemyCount; i++) {
            const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            const baseStats = enemyStats[enemyType];

            // Scale stats based on player level
            const scaledStats = {
                ...baseStats,
                health: Math.floor(baseStats.health * (1 + (playerLevel - 1) * 0.2)),
                attack: Math.floor(baseStats.attack * (1 + (playerLevel - 1) * 0.15)),
                defense: Math.floor(baseStats.defense * (1 + (playerLevel - 1) * 0.1)),
                level: Math.max(baseStats.level, playerLevel - 2)
            };

            // Create enemy object
            const enemy = {
                name: `${scaledStats.name} ${i + 1}`,
                level: scaledStats.level,
                health: scaledStats.health,
                maxHealth: scaledStats.health,
                attack: scaledStats.attack,
                defense: scaledStats.defense,
                stats: {
                    attackPower: scaledStats.attack,
                    defense: scaledStats.defense,
                    movementSpeed: 80 + Math.random() * 40,
                    criticalChance: 0.05,
                    dodgeChance: 0.05
                },
                takeDamage: function(damage) {
                    this.health = Math.max(0, this.health - damage);
                },
                heal: function(amount) {
                    this.health = Math.min(this.maxHealth, this.health + amount);
                }
            };

            enemies.push(enemy);
        }

        return enemies;
    }

    destroy() {
        // Cleanup battle systems
        this.animationQueue = [];
        this.particleEffects = [];
        this.battleLog = [];
        this.statusEffectManagers.clear();

        // Stop battle music
        if (this.engine.audioManager) {
            this.engine.audioManager.stopMusic();
        }

        super.destroy();
        console.log('BattleScene destroyed');
    }
}

export { BattleScene, TurnManager, ActionMenu, TargetSelector, EnemyAI, DamageCalculator };