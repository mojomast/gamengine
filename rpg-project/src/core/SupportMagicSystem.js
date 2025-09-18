/**
 * SupportMagicSystem.js - Healing and Support Magic with Effect Callbacks
 * Handles healing spells, buffs, debuffs, and callback-based effect system
 */

import { BaseMagicAbility, SPELL_CATEGORIES, TARGET_TYPES } from './MagicAbility.js';
import { MAGIC_SCHOOLS } from './MagicAbility.js';

class HealingSpell extends BaseMagicAbility {
    constructor(name, description, school, healAmount, targeting, cooldown, manaCost, level = 1) {
        super(name, description, school, SPELL_CATEGORIES.HEALING, targeting, cooldown, manaCost, level);
        this.baseHealAmount = healAmount;
        this.criticalHealMultiplier = 1.5;
        this.overhealCap = 1.25; // Allow 25% overheal
    }

    applyEffect(character, target) {
        target = target || character;

        let healAmount = this.baseHealAmount + Math.floor(character.getSpellPower() * 0.5);

        // Apply critical healing
        if (this.isCriticalHeal(character)) {
            healAmount *= this.criticalHealMultiplier;
        }

        // Check for overheal cap
        const maxHeal = Math.floor(target.maxHealth * this.overhealCap);
        const currentHealth = target.health;
        const actualHeal = Math.min(healAmount, maxHeal - currentHealth);

        target.heal(actualHeal);

        this.gainExperience();

        // Trigger healing callbacks
        this.triggerHealingCallbacks(character, target, {
            healAmount: actualHeal,
            overheal: healAmount - actualHeal,
            isCritical: healAmount > this.baseHealAmount + Math.floor(character.getSpellPower() * 0.5)
        });
    }

    isCriticalHeal(character) {
        // Critical healing based on wisdom and luck
        const critChance = Math.min(0.3, (character.baseStats.wisdom + character.baseStats.luck) / 400);
        return Math.random() < critChance;
    }

    triggerHealingCallbacks(character, target, data) {
        // This will be handled by the callback system
        if (this.onHeal) {
            this.onHeal(character, target, data);
        }
    }
}

class RegenerationSpell extends HealingSpell {
    constructor(name, description, school, healPerSecond, duration, targeting, cooldown, manaCost, level = 1) {
        super(name, description, school, 0, targeting, cooldown, manaCost, level);
        this.healPerSecond = healPerSecond;
        this.duration = duration;
        this.totalHealing = healPerSecond * duration;
        this.ticksRemaining = duration;
        this.tickInterval = 1000; // 1 second ticks
        this.lastTick = 0;
    }

    applyEffect(character, target) {
        target = target || character;
        this.ticksRemaining = this.duration;
        this.lastTick = 0;

        // Calculate total potential healing
        const totalHealAmount = Math.floor(this.totalHealing * (1 + character.getSpellPower() * 0.1));

        // Trigger regeneration start callback
        this.triggerRegenerationCallbacks(character, target, {
            totalHealing: totalHealAmount,
            duration: this.duration,
            healPerSecond: Math.floor(this.healPerSecond * (1 + character.getSpellPower() * 0.1))
        });
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.ticksRemaining > 0) {
            this.lastTick += deltaTime;

            if (this.lastTick >= this.tickInterval) {
                this.lastTick -= this.tickInterval;
                this.ticksRemaining--;

                // Apply healing tick to target (would need target reference)
                // This would be handled by the active effect system
            }
        }
    }
}

class BuffSpell extends BaseMagicAbility {
    constructor(name, description, school, statBonus, statName, duration, targeting, cooldown, manaCost, level = 1) {
        super(name, description, school, SPELL_CATEGORIES.BUFF, targeting, cooldown, manaCost, level);
        this.statBonus = statBonus;
        this.statName = statName;
        this.duration = duration;
        this.currentDuration = 0;
        this.appliedBonus = 0;
    }

    applyEffect(character, target) {
        target = target || character;

        // Calculate actual bonus with spell power scaling
        this.appliedBonus = this.statBonus + Math.floor(character.getSpellPower() * 0.1);
        target.stats[this.statName] += this.appliedBonus;

        this.currentDuration = this.duration;

        // Trigger buff callbacks
        this.triggerBuffCallbacks(character, target, {
            statName: this.statName,
            bonusAmount: this.appliedBonus,
            duration: this.duration
        });

        this.scheduleRemoval(target, this.statName, this.appliedBonus);
        this.gainExperience();
    }

    scheduleRemoval(target, statName, amount) {
        setTimeout(() => {
            target.stats[statName] -= amount;
            // Trigger buff expiration callback
            this.triggerBuffExpiredCallbacks(target, {
                statName: statName,
                bonusAmount: amount
            });
        }, this.duration * 1000);
    }

    triggerBuffCallbacks(character, target, data) {
        if (this.onBuffApplied) {
            this.onBuffApplied(character, target, data);
        }
    }

    triggerBuffExpiredCallbacks(target, data) {
        if (this.onBuffExpired) {
            this.onBuffExpired(target, data);
        }
    }
}

class DebuffSpell extends BaseMagicAbility {
    constructor(name, description, school, statPenalty, statName, duration, targeting, cooldown, manaCost, level = 1) {
        super(name, description, school, 'debuff', targeting, cooldown, manaCost, level);
        this.statPenalty = statPenalty;
        this.statName = statName;
        this.duration = duration;
        this.currentDuration = 0;
        this.appliedPenalty = 0;
    }

    applyEffect(character, target) {
        if (!target || target === character) return; // Can't debuff self usually

        // Calculate actual penalty with spell power scaling
        this.appliedPenalty = this.statPenalty + Math.floor(character.getSpellPower() * 0.15);

        // Apply resistance check
        const resistance = target.getResistance ? target.getResistance(this.school) : 0;
        this.appliedPenalty *= (1 - resistance / 100);

        target.stats[this.statName] -= this.appliedPenalty;
        this.currentDuration = this.duration;

        // Trigger debuff callbacks
        this.triggerDebuffCallbacks(character, target, {
            statName: this.statName,
            penaltyAmount: this.appliedPenalty,
            duration: this.duration
        });

        this.scheduleRemoval(target, this.statName, this.appliedPenalty);
        this.gainExperience();
    }

    scheduleRemoval(target, statName, amount) {
        setTimeout(() => {
            target.stats[statName] += amount;
            // Trigger debuff expiration callback
            this.triggerDebuffExpiredCallbacks(target, {
                statName: statName,
                penaltyAmount: amount
            });
        }, this.duration * 1000);
    }

    triggerDebuffCallbacks(character, target, data) {
        if (this.onDebuffApplied) {
            this.onDebuffApplied(character, target, data);
        }
    }

    triggerDebuffExpiredCallbacks(target, data) {
        if (this.onDebuffExpired) {
            this.onDebuffExpired(target, data);
        }
    }
}

class EffectCallbackManager {
    constructor() {
        this.callbacks = new Map();
        this.activeEffects = new Map();
    }

    // Register callbacks for specific spells or effects
    registerCallback(spellName, eventType, callback) {
        const key = `${spellName}_${eventType}`;
        if (!this.callbacks.has(key)) {
            this.callbacks.set(key, []);
        }
        this.callbacks.get(key).push(callback);
    }

    // Trigger callbacks
    triggerCallbacks(spellName, eventType, ...args) {
        const key = `${spellName}_${eventType}`;
        const spellCallbacks = this.callbacks.get(key);

        if (spellCallbacks) {
            spellCallbacks.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in callback for ${key}:`, error);
                }
            });
        }
    }

    // Convenience methods for common events
    onSpellCast(spellName, callback) {
        this.registerCallback(spellName, 'cast', callback);
    }

    onSpellHit(spellName, callback) {
        this.registerCallback(spellName, 'hit', callback);
    }

    onSpellCrit(spellName, callback) {
        this.registerCallback(spellName, 'critical', callback);
    }

    onBuffApplied(buffName, callback) {
        this.registerCallback(buffName, 'buff_applied', callback);
    }

    onBuffExpired(buffName, callback) {
        this.registerCallback(buffName, 'buff_expired', callback);
    }

    onDebuffApplied(debuffName, callback) {
        this.registerCallback(debuffName, 'debuff_applied', callback);
    }

    onDebuffExpired(debuffName, callback) {
        this.registerCallback(debuffName, 'debuff_expired', callback);
    }

    onHeal(spellName, callback) {
        this.registerCallback(spellName, 'heal', callback);
    }

    onDamage(spellName, callback) {
        this.registerCallback(spellName, 'damage', callback);
    }

    // Remove callbacks
    removeCallback(spellName, eventType, callback) {
        const key = `${spellName}_${eventType}`;
        const spellCallbacks = this.callbacks.get(key);

        if (spellCallbacks) {
            const index = spellCallbacks.indexOf(callback);
            if (index > -1) {
                spellCallbacks.splice(index, 1);
            }
        }
    }

    // Clear all callbacks for a spell
    clearSpellCallbacks(spellName) {
        const keysToDelete = [];
        this.callbacks.forEach((callbacks, key) => {
            if (key.startsWith(`${spellName}_`)) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => this.callbacks.delete(key));
    }

    // Get registered events for a spell
    getSpellEvents(spellName) {
        const events = [];
        this.callbacks.forEach((callbacks, key) => {
            if (key.startsWith(`${spellName}_`)) {
                events.push(key.replace(`${spellName}_`, ''));
            }
        });
        return events;
    }
}

class ActiveEffectManager {
    constructor() {
        this.activeEffects = new Map(); // target -> effects[]
        this.callbackManager = new EffectCallbackManager();
    }

    applyEffect(target, effect, duration) {
        const activeEffect = {
            effect: effect,
            duration: duration,
            elapsed: 0,
            applied: false
        };

        if (!this.activeEffects.has(target)) {
            this.activeEffects.set(target, []);
        }

        // Check if effect is already active
        const existingEffect = this.activeEffects.get(target).find(e =>
            e.effect.name === effect.name && e.effect.school === effect.school
        );

        if (existingEffect) {
            // Refresh duration
            existingEffect.duration = Math.max(existingEffect.duration, duration);
            existingEffect.elapsed = 0;
        } else {
            this.activeEffects.get(target).push(activeEffect);
        }
    }

    update(deltaTime) {
        this.activeEffects.forEach((effects, target) => {
            effects.forEach((activeEffect, index) => {
                activeEffect.elapsed += deltaTime;

                // Apply effect if not yet applied
                if (!activeEffect.applied) {
                    activeEffect.effect.applyEffect(activeEffect.effect.character || target, target);
                    activeEffect.applied = true;
                }

                // Check if effect should expire
                if (activeEffect.elapsed >= activeEffect.duration) {
                    // Remove effect
                    activeEffect.effect.scheduleRemoval(target);
                    effects.splice(index, 1);
                }
            });

            if (effects.length === 0) {
                this.activeEffects.delete(target);
            }
        });
    }

    removeEffect(target, effectName) {
        if (!this.activeEffects.has(target)) return;

        const effects = this.activeEffects.get(target);
        const index = effects.findIndex(e => e.effect.name === effectName);

        if (index > -1) {
            const activeEffect = effects[index];
            activeEffect.effect.scheduleRemoval(target);
            effects.splice(index, 1);
        }
    }

    getActiveEffects(target) {
        return this.activeEffects.get(target) || [];
    }

    clearAllEffects() {
        this.activeEffects.forEach((effects, target) => {
            effects.forEach(activeEffect => {
                activeEffect.effect.scheduleRemoval(target);
            });
        });
        this.activeEffects.clear();
    }
}

class SupportMagicSystem {
    constructor() {
        this.callbackManager = new EffectCallbackManager();
        this.activeEffectManager = new ActiveEffectManager();
        this.healingBonuses = new Map();
        this.supportEffects = new Map();
    }

    // Healing management
    applyHealing(target, amount, source = null) {
        const finalAmount = this.calculateHealingWithBonuses(target, amount);
        target.heal(finalAmount);

        // Trigger callbacks
        this.callbackManager.triggerCallbacks(source?.name || 'unknown', 'heal', source, target, {
            healAmount: finalAmount,
            originalAmount: amount
        });

        return finalAmount;
    }

    calculateHealingWithBonuses(target, baseAmount) {
        let multiplier = 1.0;

        // Apply healing bonuses
        this.healingBonuses.forEach((bonus, source) => {
            multiplier += bonus / 100;
        });

        // Apply target-specific bonuses
        if (target.healingMultiplier) {
            multiplier *= target.healingMultiplier;
        }

        return Math.floor(baseAmount * multiplier);
    }

    addHealingBonus(source, bonusPercent) {
        this.healingBonuses.set(source, bonusPercent);
    }

    removeHealingBonus(source) {
        this.healingBonuses.delete(source);
    }

    // Buff/Debuff management
    applyBuff(target, statName, bonusAmount, duration, source = null) {
        const originalValue = target.stats[statName];
        target.stats[statName] += bonusAmount;

        const buffData = {
            statName: statName,
            bonusAmount: bonusAmount,
            originalValue: originalValue,
            duration: duration,
            appliedAt: Date.now()
        };

        this.supportEffects.set(`${target.id}_${statName}_buff`, buffData);

        // Schedule removal
        setTimeout(() => {
            target.stats[statName] -= bonusAmount;
            this.supportEffects.delete(`${target.id}_${statName}_buff`);

            // Trigger expiration callback
            this.callbackManager.triggerCallbacks(source?.name || 'unknown', 'buff_expired', target, buffData);
        }, duration * 1000);

        // Trigger application callback
        this.callbackManager.triggerCallbacks(source?.name || 'unknown', 'buff_applied', target, buffData);
    }

    applyDebuff(target, statName, penaltyAmount, duration, source = null) {
        const originalValue = target.stats[statName];
        target.stats[statName] -= penaltyAmount;

        const debuffData = {
            statName: statName,
            penaltyAmount: penaltyAmount,
            originalValue: originalValue,
            duration: duration,
            appliedAt: Date.now()
        };

        this.supportEffects.set(`${target.id}_${statName}_debuff`, debuffData);

        // Schedule removal
        setTimeout(() => {
            target.stats[statName] += penaltyAmount;
            this.supportEffects.delete(`${target.id}_${statName}_debuff`);

            // Trigger expiration callback
            this.callbackManager.triggerCallbacks(source?.name || 'unknown', 'debuff_expired', target, debuffData);
        }, duration * 1000);

        // Trigger application callback
        this.callbackManager.triggerCallbacks(source?.name || 'unknown', 'debuff_applied', target, debuffData);
    }

    // Effect chaining and combos
    createHealingChain(targets, baseHealAmount, chainMultiplier = 0.7) {
        let totalHealing = 0;

        targets.forEach((target, index) => {
            const healAmount = index === 0 ?
                baseHealAmount :
                Math.floor(baseHealAmount * Math.pow(chainMultiplier, index));

            totalHealing += this.applyHealing(target, healAmount);
        });

        return totalHealing;
    }

    // Aura effects
    applyAuraEffect(center, radius, effectFunction, duration) {
        // This would need to be integrated with the area effect system
        // For now, it's a placeholder
        const auraEffect = {
            center: center,
            radius: radius,
            effectFunction: effectFunction,
            duration: duration,
            startTime: Date.now()
        };

        // Schedule aura expiration
        setTimeout(() => {
            // Cleanup aura
        }, duration * 1000);

        return auraEffect;
    }

    // Update system
    update(deltaTime) {
        this.activeEffectManager.update(deltaTime);

        // Update aura effects (would need aura system implementation)
        // Update regeneration effects
    }

    // Callback management
    registerCallback(spellName, eventType, callback) {
        this.callbackManager.registerCallback(spellName, eventType, callback);
    }

    unregisterCallback(spellName, eventType, callback) {
        this.callbackManager.removeCallback(spellName, eventType, callback);
    }

    // Get active effects
    getActiveEffects(target) {
        return this.activeEffectManager.getActiveEffects(target);
    }

    getSupportEffects(target) {
        const effects = [];
        this.supportEffects.forEach((effect, key) => {
            if (key.startsWith(`${target.id}_`)) {
                effects.push(effect);
            }
        });
        return effects;
    }

    // Cleanup
    clearAllEffects() {
        this.activeEffectManager.clearAllEffects();
        this.supportEffects.clear();
        this.healingBonuses.clear();
    }
}

export {
    HealingSpell,
    RegenerationSpell,
    BuffSpell,
    DebuffSpell,
    EffectCallbackManager,
    ActiveEffectManager,
    SupportMagicSystem
};