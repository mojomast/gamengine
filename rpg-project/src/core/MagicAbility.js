/**
 * MagicAbility.js - Magic and Spell System for RPG
 * Extends the base ability system with RPG-specific magic mechanics
 */

import {
    BaseAbility,
    OffensiveAbility,
    DefensiveAbility,
    UtilityAbility,
    RESOURCE_TYPES,
    TARGET_TYPES,
    ABILITY_TYPES,
    ELEMENTAL_TYPES
} from '../../game-engine/src/core/AbilityManager.js';
import { ValidationHelpers } from '../../game-engine/src/core/ValidationHelpers.js';

// Magic-specific constants
const MAGIC_SCHOOLS = {
    DESTRUCTION: 'destruction',
    RESTORATION: 'restoration',
    ALTERATION: 'alteration',
    CONJURATION: 'conjuration',
    MYSTICISM: 'mysticism',
    DIVINATION: 'divination',
    PHYSICAL: 'physical'
};

const SPELL_CATEGORIES = {
    OFFENSIVE: 'offensive',
    DEFENSIVE: 'defensive',
    HEALING: 'healing',
    BUFF: 'buff',
    DEBUFF: 'debuff',
    UTILITY: 'utility'
};

class BaseMagicAbility extends BaseAbility {
    constructor(name, description, school, category, targeting, cooldown, manaCost, level = 1) {
        super(name, description, ABILITY_TYPES.UTILITY, targeting, cooldown, manaCost, RESOURCE_TYPES.MANA, level);

        // Magic-specific properties
        this.school = school;
        this.category = category;
        this.elementalType = ELEMENTAL_TYPES.NONE;
        this.magicLevel = level;

        // Learning requirements
        this.learningRequirements = {
            intelligence: Math.max(1, level * 2),
            wisdom: Math.max(1, level),
            skillLevel: Math.max(1, level)
        };

        // Progression
        this.isLearned = false;
        this.experience = 0;
        this.experienceToNext = 100 * level;
    }

    // Enhanced use method with magic-specific checks
    use(character, target = null) {
        if (!this.isLearned) {
            console.warn(`Cannot use unlearned ability: ${this.name}`);
            return false;
        }

        return super.use(character, target);
    }

    // Magic-specific resource check
    checkResource(character) {
        const hasMana = super.checkResource(character);
        if (!hasMana) return false;

        // Additional magic school affinity bonus
        const affinityBonus = this.getMagicAffinityBonus(character);
        return character.mana >= (this.resourceCost * (1 - affinityBonus));
    }

    // Consume resource with affinity reduction
    consumeResource(character) {
        const affinityBonus = this.getMagicAffinityBonus(character);
        const actualCost = Math.max(1, Math.floor(this.resourceCost * (1 - affinityBonus)));
        character.mana -= actualCost;
    }

    // Calculate magic affinity bonus
    getMagicAffinityBonus(character) {
        if (!character.magicAffinities || !character.magicAffinities[this.school]) {
            return 0;
        }
        return Math.min(0.5, character.magicAffinities[this.school] / 200); // Max 50% reduction
    }

    // Experience gain from using ability
    gainExperience(amount = 10) {
        this.experience += amount;
        if (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
    }

    // Enhanced level up with magic progression
    levelUp() {
        super.levelUp();
        this.magicLevel = this.level;
        this.experience = this.experience % this.experienceToNext;
        this.experienceToNext = 100 * this.level;

        // Scale resource cost and cooldown
        this.resourceCost = Math.floor(this.resourceCost * 1.1);
        this.cooldown = Math.max(500, this.cooldown * 0.95);

        return true;
    }

    // Check if character can learn this ability
    canLearn(character) {
        if (this.isLearned) return false;

        const req = this.learningRequirements;
        return (
            character.baseStats.intelligence >= req.intelligence &&
            character.baseStats.wisdom >= req.wisdom &&
            character.getSkillLevel(this.school) >= req.skillLevel
        );
    }

    // Learn the ability
    learn() {
        this.isLearned = true;
        return true;
    }

    // Get enhanced info for UI
    getMagicInfo() {
        return {
            ...this.getInfo(),
            school: this.school,
            category: this.category,
            magicLevel: this.magicLevel,
            isLearned: this.isLearned,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            learningRequirements: this.learningRequirements
        };
    }

    // Helper method to set elemental type (for chaining in database)
    setElementalType(elementalType) {
        this.elementalType = elementalType;
        return this;
    }
}

class OffensiveSpell extends BaseMagicAbility {
    constructor(name, description, school, damage, targeting, cooldown, manaCost, level = 1) {
        super(name, description, school, SPELL_CATEGORIES.OFFENSIVE, targeting, cooldown, manaCost, level);
        this.baseDamage = damage;
    }

    applyEffect(character, target) {
        if (!target) return;

        let damage = this.baseDamage + (character.getSpellPower() * 0.3);

        // Apply elemental modifiers
        damage *= this.getElementalMultiplier(target);

        // Magic school bonuses
        damage *= this.getSchoolDamageMultiplier(character);

        target.takeDamage(damage);
        this.gainExperience();

        // Trigger effects
        this.triggerEffectCallbacks(character, target, { damage });
    }

    getSchoolDamageMultiplier(character) {
        const skillLevel = character.getSkillLevel(this.school) || 1;
        return 1 + (skillLevel * 0.05); // 5% per skill level
    }
}

class DefensiveSpell extends BaseMagicAbility {
    constructor(name, description, school, defenseBonus, duration, targeting, cooldown, manaCost, level = 1) {
        super(name, description, school, SPELL_CATEGORIES.DEFENSIVE, targeting, cooldown, manaCost, level);
        this.defenseBonus = defenseBonus;
        this.duration = duration;
        this.currentDuration = 0;
    }

    applyEffect(character, target) {
        target = target || character;

        const actualBonus = this.defenseBonus + (character.getSpellPower() * 0.2);
        target.stats.defense += actualBonus;

        this.currentDuration = this.duration;
        this.scheduleRemoval(target, 'defense', actualBonus);

        this.gainExperience();
        this.triggerEffectCallbacks(character, target, { defenseBonus: actualBonus });
    }

    scheduleRemoval(target, stat, amount) {
        setTimeout(() => {
            target.stats[stat] -= amount;
        }, this.duration * 1000);
    }
}

class HealingSpell extends BaseMagicAbility {
    constructor(name, description, school, healAmount, targeting, cooldown, manaCost, level = 1) {
        super(name, description, school, SPELL_CATEGORIES.HEALING, targeting, cooldown, manaCost, level);
        this.baseHealAmount = healAmount;
    }

    applyEffect(character, target) {
        target = target || character;

        const healAmount = this.baseHealAmount + (character.getSpellPower() * 0.4);
        target.heal(healAmount);

        this.gainExperience();
        this.triggerEffectCallbacks(character, target, { healAmount });
    }
}

class BuffSpell extends BaseMagicAbility {
    constructor(name, description, school, statBonus, statName, duration, targeting, cooldown, manaCost, level = 1) {
        super(name, description, school, SPELL_CATEGORIES.BUFF, targeting, cooldown, manaCost, level);
        this.statBonus = statBonus;
        this.statName = statName;
        this.duration = duration;
        this.currentDuration = 0;
    }

    applyEffect(character, target) {
        target = target || character;

        const actualBonus = this.statBonus + Math.floor(character.getSpellPower() * 0.1);
        target.stats[this.statName] += actualBonus;

        this.currentDuration = this.duration;
        this.scheduleRemoval(target, this.statName, actualBonus);

        this.gainExperience();
        this.triggerEffectCallbacks(character, target, { statBonus: actualBonus, statName: this.statName });
    }

    scheduleRemoval(target, statName, amount) {
        setTimeout(() => {
            target.stats[statName] -= amount;
        }, this.duration * 1000);
    }
}

// Effect callback system
class EffectCallbackSystem {
    constructor() {
        this.callbacks = new Map();
    }

    registerCallback(spellName, callback) {
        if (!this.callbacks.has(spellName)) {
            this.callbacks.set(spellName, []);
        }
        this.callbacks.get(spellName).push(callback);
    }

    triggerCallbacks(spellName, character, target, data) {
        const spellCallbacks = this.callbacks.get(spellName);
        if (spellCallbacks) {
            spellCallbacks.forEach(callback => {
                try {
                    callback(character, target, data);
                } catch (error) {
                    console.error(`Error in effect callback for ${spellName}:`, error);
                }
            });
        }
    }

    removeCallback(spellName, callback) {
        const spellCallbacks = this.callbacks.get(spellName);
        if (spellCallbacks) {
            const index = spellCallbacks.indexOf(callback);
            if (index > -1) {
                spellCallbacks.splice(index, 1);
            }
        }
    }
}

// Area effect system
class AreaEffect {
    constructor(center, radius, effectFunction, duration = 0) {
        this.center = center;
        this.radius = radius;
        this.effectFunction = effectFunction;
        this.duration = duration;
        this.elapsed = 0;
        this.active = true;
    }

    update(deltaTime) {
        if (!this.active) return;

        this.elapsed += deltaTime;

        // Apply effect to all targets in area
        const targets = this.getTargetsInArea();
        targets.forEach(target => {
            this.effectFunction(target, this.elapsed);
        });

        // Check if effect should end
        if (this.duration > 0 && this.elapsed >= this.duration) {
            this.end();
        }
    }

    getTargetsInArea() {
        // This would need to be implemented based on the game world
        // For now, return empty array - will be extended in integration
        return [];
    }

    end() {
        this.active = false;
        // Cleanup logic here
    }
}

export {
    BaseMagicAbility,
    OffensiveSpell,
    DefensiveSpell,
    HealingSpell,
    BuffSpell,
    EffectCallbackSystem,
    AreaEffect,
    MAGIC_SCHOOLS,
    SPELL_CATEGORIES
};