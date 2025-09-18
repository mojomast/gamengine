/**
 * JobAbilitySystem.js - Job-Specific Abilities and Passives
 * Handles unique abilities and passive bonuses for each job class
 */

import { BaseMagicAbility, OffensiveSpell, DefensiveSpell, HealingSpell, BuffSpell } from './MagicAbility.js';
import { MAGIC_SCHOOLS, SPELL_CATEGORIES, TARGET_TYPES } from './MagicAbility.js';

class JobAbility {
    constructor(name, description, jobClass, unlockLevel, abilityType, parameters = {}) {
        this.name = name;
        this.description = description;
        this.jobClass = jobClass;
        this.unlockLevel = unlockLevel;
        this.abilityType = abilityType; // 'active', 'passive', 'ultimate'
        this.parameters = parameters;
        this.isUnlocked = false;
        this.currentCooldown = 0;
    }

    canUnlock(character) {
        return character.level >= this.unlockLevel &&
               character.getJobInfo() &&
               character.getJobInfo().name.toLowerCase() === this.jobClass &&
               character.jobSystem.jobLevel >= this.unlockLevel;
    }

    unlock() {
        this.isUnlocked = true;
    }

    use(character, target = null) {
        if (!this.isUnlocked) return false;
        if (this.currentCooldown > 0) return false;

        // Apply cooldown
        if (this.parameters.cooldown) {
            this.currentCooldown = this.parameters.cooldown;
        }

        return true;
    }

    update(deltaTime) {
        if (this.currentCooldown > 0) {
            this.currentCooldown = Math.max(0, this.currentCooldown - deltaTime);
        }
    }

    getInfo() {
        return {
            name: this.name,
            description: this.description,
            jobClass: this.jobClass,
            unlockLevel: this.unlockLevel,
            abilityType: this.abilityType,
            isUnlocked: this.isUnlocked,
            currentCooldown: this.currentCooldown,
            parameters: this.parameters
        };
    }
}

class WarriorAbilities {
    static getAbilities() {
        return [
            new JobAbility(
                'Battle Cry',
                'Intimidate nearby enemies, reducing their attack power',
                'warrior',
                3,
                'active',
                {
                    cooldown: 15000,
                    radius: 10,
                    debuffAmount: 0.2,
                    duration: 10
                }
            ),

            new JobAbility(
                'Shield Wall',
                'Create a protective barrier that absorbs damage',
                'warrior',
                5,
                'active',
                {
                    cooldown: 30000,
                    damageAbsorption: 200,
                    duration: 15
                }
            ),

            new JobAbility(
                'Berserker Rage',
                'Enter a rage state with increased damage but reduced defense',
                'warrior',
                8,
                'ultimate',
                {
                    cooldown: 120000,
                    damageBonus: 1.5,
                    defensePenalty: 0.5,
                    duration: 30
                }
            ),

            new JobAbility(
                'Guardian Spirit',
                'Passive: Increased defense when protecting allies',
                'warrior',
                1,
                'passive',
                {
                    defenseBonus: 0.15,
                    triggerHealth: 0.5 // Activate when ally health < 50%
                }
            ),

            new JobAbility(
                'Weapon Mastery',
                'Passive: Increased weapon damage',
                'warrior',
                2,
                'passive',
                {
                    damageBonus: 0.25
                }
            )
        ];
    }
}

class MageAbilities {
    static getAbilities() {
        return [
            new JobAbility(
                'Arcane Missile',
                'Fire multiple magical projectiles',
                'mage',
                3,
                'active',
                {
                    cooldown: 8000,
                    projectileCount: 3,
                    damagePerProjectile: 25
                }
            ),

            new JobAbility(
                'Mana Shield',
                'Convert damage to mana burn',
                'mage',
                5,
                'active',
                {
                    cooldown: 20000,
                    conversionRatio: 0.5, // 50% damage converted to mana
                    duration: 20
                }
            ),

            new JobAbility(
                'Meteor Storm',
                'Summon a devastating meteor storm',
                'mage',
                8,
                'ultimate',
                {
                    cooldown: 180000,
                    meteorCount: 7,
                    damagePerMeteor: 80,
                    areaRadius: 15
                }
            ),

            new JobAbility(
                'Arcane Mastery',
                'Passive: Increased spell damage',
                'mage',
                1,
                'passive',
                {
                    spellDamageBonus: 0.2
                }
            ),

            new JobAbility(
                'Mana Efficiency',
                'Passive: Reduced mana cost for spells',
                'mage',
                2,
                'passive',
                {
                    manaCostReduction: 0.15
                }
            )
        ];
    }
}

class ClericAbilities {
    static getAbilities() {
        return [
            new JobAbility(
                'Divine Intervention',
                'Emergency resurrection and healing',
                'cleric',
                3,
                'active',
                {
                    cooldown: 300000, // 5 minutes
                    resurrection: true,
                    healAmount: 100
                }
            ),

            new JobAbility(
                'Holy Nova',
                'Explosion of holy energy that damages undead and heals allies',
                'cleric',
                5,
                'active',
                {
                    cooldown: 12000,
                    damage: 60,
                    heal: 40,
                    radius: 12
                }
            ),

            new JobAbility(
                'Divine Wrath',
                'Call down divine lightning to smite enemies',
                'cleric',
                8,
                'ultimate',
                {
                    cooldown: 90000,
                    damage: 200,
                    stunDuration: 3,
                    areaRadius: 8
                }
            ),

            new JobAbility(
                'Divine Favor',
                'Passive: Increased healing power',
                'cleric',
                1,
                'passive',
                {
                    healingBonus: 0.25
                }
            ),

            new JobAbility(
                'Holy Aura',
                'Passive: Damage reduction for nearby allies',
                'cleric',
                2,
                'passive',
                {
                    auraRadius: 8,
                    damageReduction: 0.1
                }
            )
        ];
    }
}

class RogueAbilities {
    static getAbilities() {
        return [
            new JobAbility(
                'Shadow Step',
                'Teleport behind an enemy and strike',
                'rogue',
                3,
                'active',
                {
                    cooldown: 10000,
                    damage: 70,
                    teleportRange: 15
                }
            ),

            new JobAbility(
                'Smoke Bomb',
                'Create a smoke cloud that reduces enemy accuracy',
                'rogue',
                5,
                'active',
                {
                    cooldown: 25000,
                    radius: 10,
                    accuracyReduction: 0.4,
                    duration: 12
                }
            ),

            new JobAbility(
                'Assassinate',
                'High damage attack with increased critical chance',
                'rogue',
                8,
                'ultimate',
                {
                    cooldown: 60000,
                    damage: 150,
                    critChanceBonus: 0.5,
                    executeThreshold: 0.25 // Execute if target < 25% health
                }
            ),

            new JobAbility(
                'Precision',
                'Passive: Increased critical chance',
                'rogue',
                1,
                'passive',
                {
                    critChanceBonus: 0.15
                }
            ),

            new JobAbility(
                'Swift Strikes',
                'Passive: Increased attack speed',
                'rogue',
                2,
                'passive',
                {
                    attackSpeedBonus: 0.3
                }
            )
        ];
    }
}

class JobAbilityManager {
    constructor() {
        this.jobAbilities = new Map();
        this.unlockedAbilities = new Map();
        this.initializeJobAbilities();
    }

    initializeJobAbilities() {
        this.jobAbilities.set('warrior', WarriorAbilities.getAbilities());
        this.jobAbilities.set('mage', MageAbilities.getAbilities());
        this.jobAbilities.set('cleric', ClericAbilities.getAbilities());
        this.jobAbilities.set('rogue', RogueAbilities.getAbilities());
    }

    getJobAbilities(jobName) {
        return this.jobAbilities.get(jobName.toLowerCase()) || [];
    }

    getAvailableAbilities(character) {
        const jobInfo = character.getJobInfo();
        if (!jobInfo) return [];

        const jobAbilities = this.getJobAbilities(jobInfo.name);
        return jobAbilities.filter(ability => ability.canUnlock(character));
    }

    unlockAbility(character, abilityName) {
        const availableAbilities = this.getAvailableAbilities(character);
        const ability = availableAbilities.find(a => a.name === abilityName);

        if (!ability) {
            return { success: false, message: "Ability not available" };
        }

        if (this.isAbilityUnlocked(character, abilityName)) {
            return { success: false, message: "Ability already unlocked" };
        }

        ability.unlock();

        const characterId = character.name;
        if (!this.unlockedAbilities.has(characterId)) {
            this.unlockedAbilities.set(characterId, []);
        }
        this.unlockedAbilities.get(characterId).push(ability);

        return { success: true, message: `Unlocked ${abilityName}` };
    }

    useAbility(character, abilityName, target = null) {
        const ability = this.getUnlockedAbility(character, abilityName);
        if (!ability) {
            return { success: false, message: "Ability not unlocked or not available" };
        }

        if (!ability.use(character, target)) {
            return { success: false, message: "Ability on cooldown or cannot be used" };
        }

        // Apply ability effects
        this.applyAbilityEffect(character, ability, target);

        return { success: true, ability: ability };
    }

    applyAbilityEffect(character, ability, target) {
        switch (ability.name) {
            case 'Battle Cry':
                this.applyBattleCry(character, ability);
                break;
            case 'Shield Wall':
                this.applyShieldWall(character, ability);
                break;
            case 'Berserker Rage':
                this.applyBerserkerRage(character, ability);
                break;
            case 'Arcane Missile':
                this.applyArcaneMissile(character, ability, target);
                break;
            case 'Mana Shield':
                this.applyManaShield(character, ability);
                break;
            case 'Meteor Storm':
                this.applyMeteorStorm(character, ability, target);
                break;
            case 'Divine Intervention':
                this.applyDivineIntervention(character, ability, target);
                break;
            case 'Holy Nova':
                this.applyHolyNova(character, ability);
                break;
            case 'Divine Wrath':
                this.applyDivineWrath(character, ability, target);
                break;
            case 'Shadow Step':
                this.applyShadowStep(character, ability, target);
                break;
            case 'Smoke Bomb':
                this.applySmokeBomb(character, ability);
                break;
            case 'Assassinate':
                this.applyAssassinate(character, ability, target);
                break;
        }
    }

    // Ability effect implementations
    applyBattleCry(character, ability) {
        // Would need enemy targeting system
        console.log(`${character.name} uses Battle Cry!`);
    }

    applyShieldWall(character, ability) {
        character.damageAbsorption = (character.damageAbsorption || 0) + ability.parameters.damageAbsorption;
        setTimeout(() => {
            character.damageAbsorption -= ability.parameters.damageAbsorption;
        }, ability.parameters.duration * 1000);
    }

    applyBerserkerRage(character, ability) {
        character.stats.attackPower *= ability.parameters.damageBonus;
        character.stats.defense *= ability.parameters.defensePenalty;

        setTimeout(() => {
            character.stats.attackPower /= ability.parameters.damageBonus;
            character.stats.defense /= ability.parameters.defensePenalty;
        }, ability.parameters.duration * 1000);
    }

    applyArcaneMissile(character, ability, target) {
        if (target) {
            const totalDamage = ability.parameters.damagePerProjectile * ability.parameters.projectileCount;
            target.takeDamage(totalDamage);
        }
    }

    applyManaShield(character, ability) {
        character.manaShield = ability.parameters.conversionRatio;
        setTimeout(() => {
            character.manaShield = 0;
        }, ability.parameters.duration * 1000);
    }

    applyMeteorStorm(character, ability, center) {
        // Would need area effect system
        console.log(`${character.name} summons Meteor Storm at (${center.x}, ${center.y})!`);
    }

    applyDivineIntervention(character, ability, target) {
        if (target && target.health <= 0) {
            target.health = target.maxHealth;
            target.heal(ability.parameters.healAmount);
        }
    }

    applyHolyNova(character, ability) {
        // Would need area effect system
        console.log(`${character.name} releases Holy Nova!`);
    }

    applyDivineWrath(character, ability, center) {
        // Would need area effect system
        console.log(`${character.name} calls Divine Wrath at (${center.x}, ${center.y})!`);
    }

    applyShadowStep(character, ability, target) {
        if (target) {
            // Teleport behind target
            const angle = Math.atan2(target.position.y - character.position.y, target.position.x - character.position.x);
            const distance = 2; // Close range
            character.position.x = target.position.x - Math.cos(angle) * distance;
            character.position.y = target.position.y - Math.sin(angle) * distance;

            target.takeDamage(ability.parameters.damage);
        }
    }

    applySmokeBomb(character, ability) {
        // Would need area effect system
        console.log(`${character.name} throws Smoke Bomb!`);
    }

    applyAssassinate(character, ability, target) {
        if (target) {
            let damage = ability.parameters.damage;
            const critChance = character.getCriticalChance() + ability.parameters.critChanceBonus;

            if (Math.random() < critChance) {
                damage *= 2;
            }

            // Execute if target is low health
            if (target.health / target.maxHealth <= ability.parameters.executeThreshold) {
                damage *= 3; // Triple damage for execute
            }

            target.takeDamage(damage);
        }
    }

    getUnlockedAbility(character, abilityName) {
        const characterId = character.name;
        const unlocked = this.unlockedAbilities.get(characterId) || [];
        return unlocked.find(a => a.name === abilityName);
    }

    getUnlockedAbilities(character) {
        const characterId = character.name;
        return this.unlockedAbilities.get(characterId) || [];
    }

    isAbilityUnlocked(character, abilityName) {
        return this.getUnlockedAbility(character, abilityName) !== undefined;
    }

    update(deltaTime) {
        // Update ability cooldowns
        this.unlockedAbilities.forEach(abilities => {
            abilities.forEach(ability => {
                ability.update(deltaTime);
            });
        });
    }

    // Save/Load functionality
    exportAbilityData(character) {
        const characterId = character.name;
        const unlocked = this.unlockedAbilities.get(characterId) || [];

        return {
            characterId: characterId,
            unlockedAbilities: unlocked.map(ability => ({
                name: ability.name,
                currentCooldown: ability.currentCooldown
            }))
        };
    }

    importAbilityData(data) {
        if (!data.unlockedAbilities) return;

        const abilities = data.unlockedAbilities.map(abilityData => {
            // Find the ability in the job abilities
            const jobName = data.characterId.split('_')[0]; // Simple extraction
            const jobAbilities = this.getJobAbilities(jobName);
            const ability = jobAbilities.find(a => a.name === abilityData.name);

            if (ability) {
                ability.unlock();
                ability.currentCooldown = abilityData.currentCooldown || 0;
                return ability;
            }
            return null;
        }).filter(a => a !== null);

        this.unlockedAbilities.set(data.characterId, abilities);
    }
}

export { JobAbility, WarriorAbilities, MageAbilities, ClericAbilities, RogueAbilities, JobAbilityManager };