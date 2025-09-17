/**
 * Character Stats System
 * Basic character class with core stats, leveling, and status effects
 */

import { ValidationHelpers, ValidationError } from './ValidationHelpers.js';

class Character {
    constructor(options = {}) {
        // Validate options parameter
        ValidationHelpers.validateType(options, 'object', 'options');

        // Validate and set core stats with defaults
        this.health = ValidationHelpers.validateRange(options.health, 0, options.maxHealth || 100, 'options.health') || 100;
        this.maxHealth = ValidationHelpers.validatePositiveNumber(options.maxHealth, 'options.maxHealth') || 100;
        this.mana = ValidationHelpers.validateRange(options.mana, 0, options.maxMana || 50, 'options.mana') || 50;
        this.maxMana = ValidationHelpers.validatePositiveNumber(options.maxMana, 'options.maxMana') || 50;
        this.level = ValidationHelpers.validatePositiveNumber(options.level, 'options.level') || 1;
        this.experience = ValidationHelpers.validateRange(options.experience, 0, Infinity, 'options.experience') || 0;

        // Experience to next level
        this.experienceToNext = this.calculateExpToNext();

        // Basic attributes
        this.strength = ValidationHelpers.validatePositiveNumber(options.strength, 'options.strength') || 10;
        this.agility = ValidationHelpers.validatePositiveNumber(options.agility, 'options.agility') || 10;
        this.intelligence = ValidationHelpers.validatePositiveNumber(options.intelligence, 'options.intelligence') || 10;

        // Status effects storage
        this.statusEffects = new Map();
    }

    update(deltaTime) {
        // Update status effects
        this.updateStatusEffects(deltaTime);
    }

    // Experience and leveling mechanics
    gainExperience(amount) {
        // Validate parameter
        ValidationHelpers.validatePositiveNumber(amount, 'amount');

        this.experience += amount;

        // Check for level up
        while (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
    }

    levelUp() {
        this.experience -= this.experienceToNext;
        this.level++;

        // Apply level benefits: increase max health and mana
        this.maxHealth += 10;
        this.health = this.maxHealth; // Full heal on level up
        this.maxMana += 5;
        this.mana = this.maxMana; // Full mana restore

        this.experienceToNext = this.calculateExpToNext();
    }

    calculateExpToNext() {
        // Simple exponential curve
        return this.level * 100;
    }

    // Status effects framework
    addStatusEffect(id, duration, effect = {}) {
        // Validate parameters
        ValidationHelpers.validateType(id, 'string', 'id');
        ValidationHelpers.validatePositiveNumber(duration, 'duration');
        ValidationHelpers.validateType(effect, 'object', 'effect');

        this.statusEffects.set(id, {
            id,
            duration,
            effect,
            startTime: Date.now()
        });

        // Apply initial effect if provided
        if (effect.onApply) {
            ValidationHelpers.validateFunction(effect.onApply, 'effect.onApply');
            effect.onApply(this);
        }
    }

    removeStatusEffect(id) {
        // Validate parameter
        ValidationHelpers.validateType(id, 'string', 'id');

        const status = this.statusEffects.get(id);
        if (status) {
            if (status.effect.onRemove) {
                ValidationHelpers.validateFunction(status.effect.onRemove, 'status.effect.onRemove');
                status.effect.onRemove(this);
            }
            this.statusEffects.delete(id);
        }
    }

    updateStatusEffects(deltaTime) {
        // Validate parameter
        ValidationHelpers.validatePositiveNumber(deltaTime, 'deltaTime');

        for (const [id, status] of this.statusEffects) {
            status.duration -= deltaTime;

            // Apply tick effect if provided
            if (status.effect.onTick) {
                ValidationHelpers.validateFunction(status.effect.onTick, 'status.effect.onTick');
                status.effect.onTick(this, deltaTime);
            }

            // Remove expired effects
            if (status.duration <= 0) {
                if (status.effect.onRemove) {
                    ValidationHelpers.validateFunction(status.effect.onRemove, 'status.effect.onRemove');
                    status.effect.onRemove(this);
                }
                this.statusEffects.delete(id);
            }
        }
    }

    // Basic attribute system with stat calculations
    getAttackPower() {
        return this.strength * 2 + this.level;
    }

    getDefense() {
        return this.agility + this.level;
    }

    getMagicPower() {
        return this.intelligence * 1.5 + this.level;
    }

    getDodgeChance() {
        return Math.min(0.5, this.agility * 0.01);
    }

    // Utility methods
    takeDamage(damage) {
        // Validate parameter
        ValidationHelpers.validateRange(damage, 0, Infinity, 'damage');

        this.health -= damage;
        this.health = Math.max(0, this.health); // Ensure health doesn't go below 0
        if (this.health <= 0) {
            // Handle death logic here if needed
        }
    }

    heal(amount) {
        // Validate parameter
        ValidationHelpers.validateRange(amount, 0, Infinity, 'amount');

        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    useMana(amount) {
        // Validate parameter
        ValidationHelpers.validateRange(amount, 0, Infinity, 'amount');

        if (this.mana >= amount) {
            this.mana -= amount;
            return true;
        }
        return false;
    }

    restoreMana(amount) {
        // Validate parameter
        ValidationHelpers.validateRange(amount, 0, Infinity, 'amount');

        this.mana = Math.min(this.maxMana, this.mana + amount);
    }

    isAlive() {
        return this.health > 0;
    }
}

export { Character };