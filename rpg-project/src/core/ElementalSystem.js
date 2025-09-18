/**
 * ElementalSystem.js - Elemental Magic System with Damage Modifiers
 * Handles elemental types, resistances, weaknesses, and damage calculations
 */

import { ELEMENTAL_TYPES } from '../../game-engine/src/core/AbilityManager.js';

// Elemental damage multipliers (attacker_element -> defender_element)
const ELEMENTAL_DAMAGE_MATRIX = {
    [ELEMENTAL_TYPES.FIRE]: {
        [ELEMENTAL_TYPES.FIRE]: 0.5,      // Fire vs Fire
        [ELEMENTAL_TYPES.WATER]: 0.5,     // Fire vs Water
        [ELEMENTAL_TYPES.EARTH]: 1.5,     // Fire vs Earth
        [ELEMENTAL_TYPES.AIR]: 1.0,       // Fire vs Air
        [ELEMENTAL_TYPES.LIGHTNING]: 1.0, // Fire vs Lightning
        [ELEMENTAL_TYPES.ICE]: 2.0,       // Fire vs Ice
        [ELEMENTAL_TYPES.NONE]: 1.0       // Fire vs None
    },
    [ELEMENTAL_TYPES.WATER]: {
        [ELEMENTAL_TYPES.FIRE]: 2.0,      // Water vs Fire
        [ELEMENTAL_TYPES.WATER]: 0.5,     // Water vs Water
        [ELEMENTAL_TYPES.EARTH]: 1.0,     // Water vs Earth
        [ELEMENTAL_TYPES.AIR]: 0.5,       // Water vs Air
        [ELEMENTAL_TYPES.LIGHTNING]: 1.0, // Water vs Lightning
        [ELEMENTAL_TYPES.ICE]: 0.5,       // Water vs Ice
        [ELEMENTAL_TYPES.NONE]: 1.0       // Water vs None
    },
    [ELEMENTAL_TYPES.EARTH]: {
        [ELEMENTAL_TYPES.FIRE]: 0.5,      // Earth vs Fire
        [ELEMENTAL_TYPES.WATER]: 1.5,     // Earth vs Water
        [ELEMENTAL_TYPES.EARTH]: 0.5,     // Earth vs Earth
        [ELEMENTAL_TYPES.AIR]: 2.0,       // Earth vs Air
        [ELEMENTAL_TYPES.LIGHTNING]: 1.0, // Earth vs Lightning
        [ELEMENTAL_TYPES.ICE]: 1.0,       // Earth vs Ice
        [ELEMENTAL_TYPES.NONE]: 1.0       // Earth vs None
    },
    [ELEMENTAL_TYPES.AIR]: {
        [ELEMENTAL_TYPES.FIRE]: 1.0,      // Air vs Fire
        [ELEMENTAL_TYPES.WATER]: 1.0,     // Air vs Water
        [ELEMENTAL_TYPES.EARTH]: 0.5,     // Air vs Earth
        [ELEMENTAL_TYPES.AIR]: 0.5,       // Air vs Air
        [ELEMENTAL_TYPES.LIGHTNING]: 1.5, // Air vs Lightning
        [ELEMENTAL_TYPES.ICE]: 1.0,       // Air vs Ice
        [ELEMENTAL_TYPES.NONE]: 1.0       // Air vs None
    },
    [ELEMENTAL_TYPES.LIGHTNING]: {
        [ELEMENTAL_TYPES.FIRE]: 1.0,      // Lightning vs Fire
        [ELEMENTAL_TYPES.WATER]: 1.5,     // Lightning vs Water
        [ELEMENTAL_TYPES.EARTH]: 0.5,     // Lightning vs Earth
        [ELEMENTAL_TYPES.AIR]: 1.0,       // Lightning vs Air
        [ELEMENTAL_TYPES.LIGHTNING]: 0.5, // Lightning vs Lightning
        [ELEMENTAL_TYPES.ICE]: 2.0,       // Lightning vs Ice
        [ELEMENTAL_TYPES.NONE]: 1.0       // Lightning vs None
    },
    [ELEMENTAL_TYPES.ICE]: {
        [ELEMENTAL_TYPES.FIRE]: 0.5,      // Ice vs Fire
        [ELEMENTAL_TYPES.WATER]: 1.0,     // Ice vs Water
        [ELEMENTAL_TYPES.EARTH]: 1.5,     // Ice vs Earth
        [ELEMENTAL_TYPES.AIR]: 1.0,       // Ice vs Air
        [ELEMENTAL_TYPES.LIGHTNING]: 0.5, // Ice vs Lightning
        [ELEMENTAL_TYPES.ICE]: 0.5,       // Ice vs Ice
        [ELEMENTAL_TYPES.NONE]: 1.0       // Ice vs None
    },
    [ELEMENTAL_TYPES.NONE]: {
        [ELEMENTAL_TYPES.FIRE]: 1.0,
        [ELEMENTAL_TYPES.WATER]: 1.0,
        [ELEMENTAL_TYPES.EARTH]: 1.0,
        [ELEMENTAL_TYPES.AIR]: 1.0,
        [ELEMENTAL_TYPES.LIGHTNING]: 1.0,
        [ELEMENTAL_TYPES.ICE]: 1.0,
        [ELEMENTAL_TYPES.NONE]: 1.0
    }
};

// Elemental properties and effects
const ELEMENTAL_PROPERTIES = {
    [ELEMENTAL_TYPES.FIRE]: {
        name: 'Fire',
        color: '#FF4500',
        particleEffect: 'flames',
        statusEffect: 'burning',
        damageType: 'magical',
        description: 'Burns targets over time and deals bonus damage to cold creatures'
    },
    [ELEMENTAL_TYPES.WATER]: {
        name: 'Water',
        color: '#00BFFF',
        particleEffect: 'bubbles',
        statusEffect: 'wet',
        damageType: 'magical',
        description: 'Extinguishes fire effects and deals bonus damage to burning targets'
    },
    [ELEMENTAL_TYPES.EARTH]: {
        name: 'Earth',
        color: '#8B4513',
        particleEffect: 'rocks',
        statusEffect: 'slowed',
        damageType: 'physical',
        description: 'Reduces movement speed and provides defensive bonuses'
    },
    [ELEMENTAL_TYPES.AIR]: {
        name: 'Air',
        color: '#87CEEB',
        particleEffect: 'wind',
        statusEffect: 'displaced',
        damageType: 'magical',
        description: 'Knocks back targets and increases projectile speed'
    },
    [ELEMENTAL_TYPES.LIGHTNING]: {
        name: 'Lightning',
        color: '#FFD700',
        particleEffect: 'sparks',
        statusEffect: 'stunned',
        damageType: 'magical',
        description: 'Chains between targets and can stun enemies'
    },
    [ELEMENTAL_TYPES.ICE]: {
        name: 'Ice',
        color: '#00FFFF',
        particleEffect: 'snow',
        statusEffect: 'frozen',
        damageType: 'magical',
        description: 'Freezes targets and deals bonus damage to warm creatures'
    },
    [ELEMENTAL_TYPES.NONE]: {
        name: 'Neutral',
        color: '#FFFFFF',
        particleEffect: 'none',
        statusEffect: 'none',
        damageType: 'neutral',
        description: 'No elemental properties'
    }
};

class ElementalResistance {
    constructor() {
        this.resistances = {};
        this.initializeDefaultResistances();
    }

    initializeDefaultResistances() {
        Object.values(ELEMENTAL_TYPES).forEach(element => {
            this.resistances[element] = 0; // 0 = neutral, positive = resistance, negative = weakness
        });
    }

    setResistance(elementalType, value) {
        if (this.resistances.hasOwnProperty(elementalType)) {
            this.resistances[elementalType] = Math.max(-100, Math.min(100, value)); // Clamp between -100 and 100
        }
    }

    getResistance(elementalType) {
        return this.resistances[elementalType] || 0;
    }

    getEffectiveResistance(attackerElement, defenderElement) {
        const baseMultiplier = ELEMENTAL_DAMAGE_MATRIX[attackerElement]?.[defenderElement] || 1.0;
        const resistance = this.getResistance(attackerElement);
        const resistanceMultiplier = 1 - (resistance / 100); // Convert percentage to multiplier

        return baseMultiplier * resistanceMultiplier;
    }

    addResistanceBonus(elementalType, bonus) {
        this.setResistance(elementalType, this.getResistance(elementalType) + bonus);
    }

    removeResistanceBonus(elementalType, bonus) {
        this.setResistance(elementalType, this.getResistance(elementalType) - bonus);
    }
}

class ElementalDamageCalculator {
    static calculateDamage(attacker, defender, baseDamage, elementalType, spellPower = 1) {
        let damage = baseDamage;

        // Apply spell power scaling
        damage *= spellPower;

        // Apply elemental modifiers
        const elementalMultiplier = this.getElementalMultiplier(attacker, defender, elementalType);
        damage *= elementalMultiplier;

        // Apply critical hits
        if (this.isCriticalHit(attacker)) {
            damage *= attacker.getCriticalMultiplier ? attacker.getCriticalMultiplier() : 2.0;
        }

        // Apply armor/defense reduction
        damage = Math.max(1, damage - (defender.defense || 0));

        return Math.floor(damage);
    }

    static getElementalMultiplier(attacker, defender, elementalType) {
        // Get base elemental multiplier
        const baseMultiplier = ELEMENTAL_DAMAGE_MATRIX[elementalType]?.[defender.elementalType || ELEMENTAL_TYPES.NONE] || 1.0;

        // Apply defender's resistances
        let multiplier = baseMultiplier;
        if (defender.resistances) {
            const resistance = defender.resistances.getResistance(elementalType);
            multiplier *= (1 - resistance / 100);
        }

        // Apply attacker's elemental affinity bonus
        if (attacker.elementalAffinities && attacker.elementalAffinities[elementalType]) {
            const affinityBonus = attacker.elementalAffinities[elementalType] / 100;
            multiplier *= (1 + affinityBonus);
        }

        return Math.max(0.1, multiplier); // Minimum 10% damage
    }

    static isCriticalHit(attacker) {
        const critChance = attacker.getCriticalChance ? attacker.getCriticalChance() : 0.05;
        return Math.random() < critChance;
    }

    static calculateAreaDamage(baseDamage, elementalType, targets, centerPoint) {
        const damages = new Map();

        targets.forEach(target => {
            const distance = this.getDistance(centerPoint, target.position);
            const falloffMultiplier = this.getFalloffMultiplier(distance);

            const damage = baseDamage * falloffMultiplier;
            const finalDamage = this.calculateDamage(
                { elementalType }, // Simplified attacker
                target,
                damage,
                elementalType,
                1.0
            );

            damages.set(target, finalDamage);
        });

        return damages;
    }

    static getFalloffMultiplier(distance, maxRange = 50, minMultiplier = 0.3) {
        if (distance <= maxRange * 0.5) return 1.0; // Full damage within half range
        if (distance >= maxRange) return minMultiplier; // Minimum damage at max range

        // Linear falloff between 50% and 100% of max range
        const falloffRange = maxRange * 0.5;
        const falloffAmount = 1.0 - minMultiplier;
        const distanceFromCenter = distance - (maxRange * 0.5);

        return 1.0 - (distanceFromCenter / falloffRange) * falloffAmount;
    }

    static getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class ElementalStatusEffect {
    constructor(elementalType, duration, damagePerSecond = 0, effects = {}) {
        this.elementalType = elementalType;
        this.duration = duration;
        this.damagePerSecond = damagePerSecond;
        this.effects = effects;
        this.elapsed = 0;
        this.active = true;
    }

    update(target, deltaTime) {
        if (!this.active) return;

        this.elapsed += deltaTime;

        // Apply damage over time
        if (this.damagePerSecond > 0) {
            const damage = this.damagePerSecond * deltaTime;
            target.takeDamage(damage);
        }

        // Apply other effects
        this.applyEffects(target);

        // Check if effect should end
        if (this.elapsed >= this.duration) {
            this.end(target);
        }
    }

    applyEffects(target) {
        // Apply elemental-specific effects
        switch (this.elementalType) {
            case ELEMENTAL_TYPES.FIRE:
                if (this.effects.burnStack) {
                    // Burning effect - increases damage over time
                }
                break;
            case ELEMENTAL_TYPES.ICE:
                if (this.effects.frozen) {
                    target.movementSpeed *= 0.5; // Slow movement
                }
                break;
            case ELEMENTAL_TYPES.LIGHTNING:
                if (this.effects.stunned && Math.random() < 0.1) {
                    // Chance to stun
                    target.stunned = true;
                    setTimeout(() => target.stunned = false, 1000);
                }
                break;
        }
    }

    end(target) {
        this.active = false;
        // Cleanup effects
        if (this.elementalType === ELEMENTAL_TYPES.ICE && this.effects.frozen) {
            target.movementSpeed /= 0.5; // Restore movement speed
        }
    }

    getRemainingTime() {
        return Math.max(0, this.duration - this.elapsed);
    }
}

class ElementalSystem {
    constructor() {
        this.statusEffects = new Map(); // entity -> effects[]
    }

    // Damage calculation
    calculateElementalDamage(attacker, defender, baseDamage, elementalType, spellPower = 1) {
        return ElementalDamageCalculator.calculateDamage(
            attacker, defender, baseDamage, elementalType, spellPower
        );
    }

    // Area damage calculation
    calculateAreaElementalDamage(baseDamage, elementalType, targets, centerPoint) {
        return ElementalDamageCalculator.calculateAreaDamage(
            baseDamage, elementalType, targets, centerPoint
        );
    }

    // Status effect management
    applyStatusEffect(target, elementalType, duration, damagePerSecond = 0, effects = {}) {
        const effect = new ElementalStatusEffect(
            elementalType, duration, damagePerSecond, effects
        );

        if (!this.statusEffects.has(target)) {
            this.statusEffects.set(target, []);
        }

        // Check for existing effect of same type
        const existingEffect = this.statusEffects.get(target).find(e => e.elementalType === elementalType);
        if (existingEffect) {
            // Refresh duration and increase damage
            existingEffect.elapsed = 0;
            existingEffect.damagePerSecond = Math.min(
                existingEffect.damagePerSecond + damagePerSecond,
                damagePerSecond * 3 // Cap at 3x base damage
            );
        } else {
            this.statusEffects.get(target).push(effect);
        }
    }

    updateStatusEffects(deltaTime) {
        this.statusEffects.forEach((effects, target) => {
            effects.forEach((effect, index) => {
                effect.update(target, deltaTime);

                if (!effect.active) {
                    effects.splice(index, 1);
                }
            });

            if (effects.length === 0) {
                this.statusEffects.delete(target);
            }
        });
    }

    getStatusEffects(target) {
        return this.statusEffects.get(target) || [];
    }

    removeStatusEffects(target, elementalType = null) {
        if (!this.statusEffects.has(target)) return;

        if (elementalType) {
            const effects = this.statusEffects.get(target);
            const filteredEffects = effects.filter(e => e.elementalType !== elementalType);
            if (filteredEffects.length === 0) {
                this.statusEffects.delete(target);
            } else {
                this.statusEffects.set(target, filteredEffects);
            }
        } else {
            this.statusEffects.delete(target);
        }
    }

    // Elemental affinity management
    getElementalAffinityBonus(character, elementalType) {
        if (!character.elementalAffinities) return 0;
        return character.elementalAffinities[elementalType] || 0;
    }

    increaseElementalAffinity(character, elementalType, amount) {
        if (!character.elementalAffinities) {
            character.elementalAffinities = {};
        }

        if (!character.elementalAffinities[elementalType]) {
            character.elementalAffinities[elementalType] = 0;
        }

        character.elementalAffinities[elementalType] = Math.min(100,
            character.elementalAffinities[elementalType] + amount
        );
    }

    // Utility methods
    getElementalInfo(elementalType) {
        return ELEMENTAL_PROPERTIES[elementalType] || ELEMENTAL_PROPERTIES[ELEMENTAL_TYPES.NONE];
    }

    getDamageMultiplier(attackerElement, defenderElement) {
        return ELEMENTAL_DAMAGE_MATRIX[attackerElement]?.[defenderElement] || 1.0;
    }

    isStrongAgainst(attackerElement, defenderElement) {
        const multiplier = this.getDamageMultiplier(attackerElement, defenderElement);
        return multiplier > 1.2; // Consider 20%+ bonus as "strong against"
    }

    isWeakAgainst(attackerElement, defenderElement) {
        const multiplier = this.getDamageMultiplier(attackerElement, defenderElement);
        return multiplier < 0.8; // Consider 20%+ reduction as "weak against"
    }

    // Chain lightning and similar effects
    calculateChainTargets(initialTarget, allTargets, elementalType, maxChains = 3, maxDistance = 50) {
        const chain = [initialTarget];
        let currentTarget = initialTarget;

        for (let i = 1; i < maxChains; i++) {
            const nextTarget = this.findNextChainTarget(currentTarget, allTargets, chain, maxDistance);
            if (!nextTarget) break;

            chain.push(nextTarget);
            currentTarget = nextTarget;

            // Reduce damage for subsequent targets
            if (elementalType === ELEMENTAL_TYPES.LIGHTNING) {
                // Lightning chains with reduced effectiveness
            }
        }

        return chain;
    }

    findNextChainTarget(currentTarget, allTargets, excludeTargets, maxDistance) {
        let closestTarget = null;
        let closestDistance = Infinity;

        allTargets.forEach(target => {
            if (excludeTargets.includes(target)) return;

            const distance = ElementalDamageCalculator.getDistance(
                currentTarget.position, target.position
            );

            if (distance <= maxDistance && distance < closestDistance) {
                closestDistance = distance;
                closestTarget = target;
            }
        });

        return closestTarget;
    }
}

export {
    ElementalResistance,
    ElementalDamageCalculator,
    ElementalStatusEffect,
    ElementalSystem,
    ELEMENTAL_TYPES,
    ELEMENTAL_PROPERTIES,
    ELEMENTAL_DAMAGE_MATRIX
};