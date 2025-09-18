/**
 * RPGCharacter - Enhanced character class for RPG games
 * Extends the base Character class with RPG-specific features
 */

import { Character } from '../../game-engine/src/core/Character.js';
import { ValidationHelpers } from '../../game-engine/src/core/ValidationHelpers.js';

class CharacterStats {
    constructor(baseStats = {}) {
        // Primary Stats
        this.strength = baseStats.strength || 10;     // Physical power, melee damage
        this.dexterity = baseStats.dexterity || 10;   // Agility, ranged damage, dodge
        this.intelligence = baseStats.intelligence || 10; // Magical power, mana
        this.wisdom = baseStats.wisdom || 10;         // Magical resistance, mana regen
        this.constitution = baseStats.constitution || 10; // Health, stamina
        this.charisma = baseStats.charisma || 10;     // Social interactions, leadership
        this.luck = baseStats.luck || 10;             // Critical hits, rare finds

        // Secondary Stats (calculated)
        this.health = 0;
        this.mana = 0;
        this.stamina = 0;
        this.defense = 0;
        this.magicResistance = 0;
        this.attackPower = 0;
        this.spellPower = 0;
        this.criticalChance = 0;
        this.criticalMultiplier = 2.0;
        this.dodgeChance = 0;
        this.blockChance = 0;
        this.movementSpeed = 100;

        this.recalculateStats();
    }

    recalculateStats() {
        // Health calculation
        this.health = (this.constitution * 10) + (this.level * 5);

        // Mana calculation
        this.mana = (this.intelligence * 8) + (this.wisdom * 4) + (this.level * 3);

        // Stamina calculation
        this.stamina = (this.constitution * 5) + (this.dexterity * 3) + (this.level * 2);

        // Combat stats
        this.attackPower = this.strength + Math.floor(this.level / 2);
        this.spellPower = this.intelligence + this.wisdom + Math.floor(this.level / 3);
        this.defense = Math.floor(this.constitution / 2) + Math.floor(this.level / 4);
        this.magicResistance = Math.floor(this.wisdom / 2) + Math.floor(this.level / 5);

        // Percentage-based stats
        this.criticalChance = Math.min(0.5, (this.luck / 100) + (this.level * 0.001));
        this.dodgeChance = Math.min(0.3, this.dexterity / 200);
        this.blockChance = Math.min(0.25, this.strength / 400);

        // Movement
        this.movementSpeed = 100 + (this.dexterity / 10);
    }

    getStatBonus(statName) {
        const statValue = this[statName];
        if (!statValue) return 0;

        // Standard D&D-style modifier
        return Math.floor((statValue - 10) / 2);
    }

    modifyStat(statName, amount, temporary = false) {
        if (temporary) {
            // Apply temporary modifier
            this.applyTemporaryModifier(statName, amount);
        } else {
            // Permanent stat change
            this[statName] = Math.max(1, this[statName] + amount);
            this.recalculateStats();
        }
    }

    applyTemporaryModifier(statName, amount) {
        // For now, just apply permanently - could be extended with buffs/debuffs
        this.modifyStat(statName, amount, false);
    }
}

class JobSystem {
    constructor() {
        this.availableJobs = new Map();
        this.currentJob = null;
        this.jobLevel = 1;
        this.initializeJobs();
    }

    initializeJobs() {
        this.availableJobs.set('warrior', {
            name: 'Warrior',
            description: 'Masters of combat with high strength and constitution',
            statBonuses: {
                strength: 3,
                constitution: 2,
                dexterity: 1
            },
            skillUnlocks: ['melee', 'defense', 'intimidation'],
            description: 'Warriors are frontline fighters specializing in melee combat and tanking damage.'
        });

        this.availableJobs.set('mage', {
            name: 'Mage',
            description: 'Harness magical energies with intelligence and wisdom',
            statBonuses: {
                intelligence: 3,
                wisdom: 2,
                dexterity: 1
            },
            skillUnlocks: ['magic', 'alchemy', 'enchanting'],
            description: 'Mages wield powerful magic, mastering spells and arcane knowledge.'
        });

        this.availableJobs.set('rogue', {
            name: 'Rogue',
            description: 'Stealthy and agile experts in precision strikes',
            statBonuses: {
                dexterity: 3,
                luck: 2,
                intelligence: 1
            },
            skillUnlocks: ['stealth', 'lockpicking', 'trading'],
            description: 'Rogues excel at stealth, traps, and opportunistic attacks.'
        });

        this.availableJobs.set('cleric', {
            name: 'Cleric',
            description: 'Divine warriors with healing and protective abilities',
            statBonuses: {
                wisdom: 3,
                constitution: 2,
                charisma: 1
            },
            skillUnlocks: ['magic', 'defense', 'diplomacy'],
            description: 'Clerics serve divine powers, providing healing and protection.'
        });
    }

    setJob(jobId) {
        const job = this.availableJobs.get(jobId);
        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }
        this.currentJob = job;
        this.jobLevel = 1;
        return job;
    }

    getJobStatBonuses() {
        if (!this.currentJob) return {};
        return this.currentJob.statBonuses;
    }

    getSkillUnlocks() {
        if (!this.currentJob) return [];
        return this.currentJob.skillUnlocks;
    }

    levelUpJob() {
        if (!this.currentJob) return false;
        this.jobLevel++;
        // Could add job-specific level bonuses here
        return true;
    }

    getAvailableJobs() {
        return Array.from(this.availableJobs.keys());
    }

    getCurrentJobInfo() {
        return this.currentJob ? {
            ...this.currentJob,
            level: this.jobLevel
        } : null;
    }
}

class EquipmentSystem {
    constructor() {
        this.equipment = new Map();
        this.equipmentSlots = [
            'head', 'chest', 'legs', 'feet', 'hands',
            'weapon', 'offhand', 'necklace', 'ring1', 'ring2'
        ];

        // Initialize empty slots
        this.equipmentSlots.forEach(slot => {
            this.equipment.set(slot, null);
        });
    }

    equipItem(slot, item) {
        ValidationHelpers.validateType(slot, 'string', 'slot');
        ValidationHelpers.validateObject(item, ['name', 'type'], 'item');

        if (!this.equipmentSlots.includes(slot)) {
            throw new Error(`Invalid equipment slot: ${slot}`);
        }

        // Unequip current item if any
        const currentItem = this.equipment.get(slot);
        if (currentItem) {
            this.unequipItem(slot);
        }

        // Equip new item
        this.equipment.set(slot, item);
        return item;
    }

    unequipItem(slot) {
        ValidationHelpers.validateType(slot, 'string', 'slot');

        const item = this.equipment.get(slot);
        if (item) {
            this.equipment.set(slot, null);
        }
        return item;
    }

    getEquippedItem(slot) {
        return this.equipment.get(slot);
    }

    getAllEquippedItems() {
        const equipped = {};
        this.equipmentSlots.forEach(slot => {
            const item = this.equipment.get(slot);
            if (item) {
                equipped[slot] = item;
            }
        });
        return equipped;
    }

    getEquipmentStatBonuses() {
        const bonuses = {
            strength: 0,
            dexterity: 0,
            intelligence: 0,
            wisdom: 0,
            constitution: 0,
            charisma: 0,
            luck: 0
        };

        this.equipment.forEach(item => {
            if (item && item.statBonuses) {
                Object.keys(item.statBonuses).forEach(stat => {
                    bonuses[stat] += item.statBonuses[stat];
                });
            }
        });

        return bonuses;
    }

    getEquipmentDefense() {
        let totalDefense = 0;
        this.equipment.forEach(item => {
            if (item && item.defense) {
                totalDefense += item.defense;
            }
        });
        return totalDefense;
    }
}

class RPGCharacter extends Character {
    constructor(options = {}) {
        // Override base stats with RPG-specific defaults
        const rpgOptions = {
            ...options,
            strength: options.strength || 10,
            agility: options.dexterity || 10, // Map dexterity to agility for base class
            intelligence: options.intelligence || 10,
            health: options.health || 100,
            maxHealth: options.maxHealth || 100,
            mana: options.mana || 50,
            maxMana: options.maxMana || 50
        };

        // Initialize base character
        super(rpgOptions);

        // RPG-specific properties
        this.name = options.name || 'Adventurer';
        this.characterClass = options.characterClass || 'adventurer';

        // Enhanced stat system
        this.baseStats = new CharacterStats({
            strength: options.strength || 10,
            dexterity: options.dexterity || 10,
            intelligence: options.intelligence || 10,
            wisdom: options.wisdom || 10,
            constitution: options.constitution || 10,
            charisma: options.charisma || 10,
            luck: options.luck || 10
        });

        // RPG systems
        this.jobSystem = new JobSystem();
        this.equipment = new EquipmentSystem();

        // Attribute points for allocation
        this.attributePoints = options.attributePoints || 0;
        this.spentAttributePoints = options.spentAttributePoints || 0;

        // Skills (simplified version)
        this.skills = new Map();

        // Magic system enhancements
        this.magicAffinities = this.initializeMagicAffinities();
        this.learnedSpells = new Map();
        this.manaRegenerationRate = 1.0; // Base rate, can be modified by equipment/buffs
        this.lastManaRegeneration = 0;

        // Set initial job if provided
        if (options.job) {
            this.jobSystem.setJob(options.job);
        }

        // Recalculate all stats
            this.recalculateAllStats();
        }
    
        // Initialize magic affinities based on job
        initializeMagicAffinities() {
            const affinities = {
                destruction: 0,
                restoration: 0,
                alteration: 0,
                conjuration: 0,
                mysticism: 0,
                divination: 0,
                physical: 0
            };
    
            // Set base affinities based on job
            if (this.jobSystem.currentJob) {
                const jobName = this.jobSystem.currentJob.name.toLowerCase();
                switch (jobName) {
                    case 'mage':
                        affinities.destruction = 20;
                        affinities.alteration = 15;
                        affinities.mysticism = 15;
                        break;
                    case 'cleric':
                        affinities.restoration = 25;
                        affinities.conjuration = 15;
                        affinities.mysticism = 10;
                        break;
                    case 'warrior':
                        affinities.physical = 30;
                        affinities.alteration = 10;
                        break;
                    case 'rogue':
                        affinities.physical = 20;
                        affinities.mysticism = 15;
                        break;
                }
            }
    
            return affinities;
        }

    // Enhanced stat calculation including equipment and job bonuses
    recalculateAllStats() {
        // Get base stats
        const baseStats = { ...this.baseStats };

        // Add job bonuses
        const jobBonuses = this.jobSystem.getJobStatBonuses();
        Object.keys(jobBonuses).forEach(stat => {
            baseStats[stat] += jobBonuses[stat];
        });

        // Add equipment bonuses
        const equipmentBonuses = this.equipment.getEquipmentStatBonuses();
        Object.keys(equipmentBonuses).forEach(stat => {
            baseStats[stat] += equipmentBonuses[stat];
        });

        // Update derived stats
        this.updateDerivedStats(baseStats);
    }

    updateDerivedStats(stats) {
        // Update health based on constitution
        this.maxHealth = (stats.constitution * 10) + (this.level * 5);
        this.health = Math.min(this.health, this.maxHealth);

        // Update mana based on intelligence and wisdom
        this.maxMana = (stats.intelligence * 8) + (stats.wisdom * 4) + (this.level * 3);
        this.mana = Math.min(this.mana, this.maxMana);
    }

    // Enhanced leveling with stat point allocation
    levelUp() {
        super.levelUp();

        // Award attribute points on level up
        this.attributePoints += 5; // 5 points per level

        // Recalculate stats
        this.recalculateAllStats();

        console.log(`${this.name} leveled up to ${this.level}! +5 attribute points available.`);
    }

    // Attribute point allocation
    spendAttributePoint(stat, points = 1) {
        if (this.attributePoints < points) {
            return { success: false, message: "Insufficient attribute points" };
        }

        if (!['strength', 'dexterity', 'intelligence', 'wisdom', 'constitution', 'charisma', 'luck'].includes(stat)) {
            return { success: false, message: "Invalid stat" };
        }

        // Increase base stat
        this.baseStats.modifyStat(stat, points);

        // Deduct points
        this.attributePoints -= points;
        this.spentAttributePoints += points;

        // Recalculate all stats
        this.recalculateAllStats();

        return {
            success: true,
            message: `Increased ${stat} by ${points}`,
            newValue: this.baseStats[stat]
        };
    }

    // Job system methods
    setJob(jobId) {
        const job = this.jobSystem.setJob(jobId);
        this.recalculateAllStats();
        return job;
    }

    getJobInfo() {
        return this.jobSystem.getCurrentJobInfo();
    }

    // Equipment methods
    equipItem(slot, item) {
        const equippedItem = this.equipment.equipItem(slot, item);
        this.recalculateAllStats();
        return equippedItem;
    }

    unequipItem(slot) {
        const unequippedItem = this.equipment.unequipItem(slot);
        this.recalculateAllStats();
        return unequippedItem;
    }

    getEquippedItem(slot) {
        return this.equipment.getEquippedItem(slot);
    }

    getEquipmentStatBonuses() {
        return this.equipment.getEquipmentStatBonuses();
    }

    getTotalDefense() {
        return this.baseStats.defense + this.equipment.getEquipmentDefense();
    }

    // Enhanced combat calculations
    getAttackPower() {
        return this.baseStats.attackPower + this.equipment.getEquipmentStatBonuses().strength;
    }

    getSpellPower() {
        return this.baseStats.spellPower + this.equipment.getEquipmentStatBonuses().intelligence;
    }

    getCriticalChance() {
        return this.baseStats.criticalChance;
    }

    getDodgeChance() {
        return this.baseStats.dodgeChance;
    }

    // Skill system (basic implementation)
    addSkill(skillName, level = 1) {
        this.skills.set(skillName, level);
    }

    getSkillLevel(skillName) {
        return this.skills.get(skillName) || 0;
    }

    // Enhanced skill system for magic
    increaseSkillLevel(skillName, amount = 1) {
        const currentLevel = this.getSkillLevel(skillName);
        this.skills.set(skillName, currentLevel + amount);

        // Update magic affinities when skills increase
        if (this.magicAffinities.hasOwnProperty(skillName)) {
            this.magicAffinities[skillName] = Math.min(100, this.magicAffinities[skillName] + (amount * 5));
        }
    }

    // Magic system methods
    learnSpell(spell) {
        if (!spell.canLearn(this)) {
            return { success: false, message: "Requirements not met" };
        }

        if (this.learnedSpells.has(spell.name)) {
            return { success: false, message: "Spell already learned" };
        }

        spell.learn();
        this.learnedSpells.set(spell.name, spell);

        // Increase relevant skill when learning spell
        this.increaseSkillLevel(spell.school, 1);

        return { success: true, message: `Learned ${spell.name}` };
    }

    unlearnSpell(spellName) {
        const spell = this.learnedSpells.get(spellName);
        if (!spell) {
            return { success: false, message: "Spell not learned" };
        }

        spell.isLearned = false;
        this.learnedSpells.delete(spellName);

        return { success: true, message: `Unlearned ${spellName}` };
    }

    getLearnedSpells() {
        return Array.from(this.learnedSpells.values());
    }

    hasLearnedSpell(spellName) {
        return this.learnedSpells.has(spellName);
    }

    // Mana management
    regenerateMana(deltaTime) {
        if (this.mana >= this.maxMana) return;

        const regenAmount = this.calculateManaRegeneration(deltaTime);
        this.mana = Math.min(this.maxMana, this.mana + regenAmount);
        this.lastManaRegeneration = performance.now();
    }

    calculateManaRegeneration(deltaTime) {
        // Base regeneration: 5% of max mana per minute
        const baseRegen = (this.maxMana * 0.05) / 60; // per second

        // Wisdom modifier: higher wisdom = faster regen
        const wisdomModifier = 1 + (this.baseStats.wisdom / 100);

        // Equipment modifier (could be enhanced with mana regen items)
        const equipmentModifier = 1.0;

        return baseRegen * wisdomModifier * equipmentModifier * this.manaRegenerationRate * deltaTime;
    }

    spendMana(amount) {
        if (this.mana < amount) {
            return { success: false, message: "Insufficient mana" };
        }

        this.mana -= amount;
        return { success: true };
    }

    restoreMana(amount) {
        this.mana = Math.min(this.maxMana, this.mana + amount);
        return { success: true, restored: Math.min(amount, this.maxMana - (this.mana - amount)) };
    }

    // Magic affinity methods
    getMagicAffinity(school) {
        return this.magicAffinities[school] || 0;
    }

    increaseMagicAffinity(school, amount) {
        if (this.magicAffinities.hasOwnProperty(school)) {
            this.magicAffinities[school] = Math.min(100, this.magicAffinities[school] + amount);
        }
    }

    // Update method for continuous systems
    update(deltaTime) {
        // Regenerate mana
        this.regenerateMana(deltaTime);

        // Could add other continuous effects here
    }

    // Character info
    getCharacterInfo() {
        return {
            name: this.name,
            level: this.level,
            job: this.getJobInfo(),
            stats: {
                strength: this.baseStats.strength,
                dexterity: this.baseStats.dexterity,
                intelligence: this.baseStats.intelligence,
                wisdom: this.baseStats.wisdom,
                constitution: this.baseStats.constitution,
                charisma: this.baseStats.charisma,
                luck: this.baseStats.luck
            },
            health: this.health,
            maxHealth: this.maxHealth,
            mana: this.mana,
            maxMana: this.maxMana,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            attributePoints: this.attributePoints,
            equipment: this.equipment.getAllEquippedItems(),
            magicAffinities: { ...this.magicAffinities },
            learnedSpells: this.getLearnedSpells().map(spell => spell.name),
            skills: Object.fromEntries(this.skills)
        };
    }

    // Save/Load functionality
    getSaveData() {
        return {
            name: this.name,
            characterClass: this.characterClass,
            level: this.level,
            experience: this.experience,
            health: this.health,
            maxHealth: this.maxHealth,
            mana: this.mana,
            maxMana: this.maxMana,
            baseStats: {
                strength: this.baseStats.strength,
                dexterity: this.baseStats.dexterity,
                intelligence: this.baseStats.intelligence,
                wisdom: this.baseStats.wisdom,
                constitution: this.baseStats.constitution,
                charisma: this.baseStats.charisma,
                luck: this.baseStats.luck
            },
            job: this.jobSystem.currentJob ? this.jobSystem.currentJob.name.toLowerCase() : null,
            attributePoints: this.attributePoints,
            spentAttributePoints: this.spentAttributePoints,
            equipment: this.equipment.getAllEquippedItems(),
            skills: Object.fromEntries(this.skills),
            magicAffinities: { ...this.magicAffinities },
            learnedSpells: Array.from(this.learnedSpells.keys()),
            manaRegenerationRate: this.manaRegenerationRate
        };
    }

    loadSaveData(data) {
        this.name = data.name || this.name;
        this.characterClass = data.characterClass || this.characterClass;
        this.level = data.level || this.level;
        this.experience = data.experience || this.experience;
        this.health = data.health || this.health;
        this.maxHealth = data.maxHealth || this.maxHealth;
        this.mana = data.mana || this.mana;
        this.maxMana = data.maxMana || this.maxMana;

        if (data.baseStats) {
            Object.assign(this.baseStats, data.baseStats);
        }

        if (data.job) {
            this.jobSystem.setJob(data.job);
        }

        this.attributePoints = data.attributePoints || this.attributePoints;
        this.spentAttributePoints = data.spentAttributePoints || this.spentAttributePoints;

        if (data.equipment) {
            Object.entries(data.equipment).forEach(([slot, item]) => {
                if (item) {
                    this.equipment.equipItem(slot, item);
                }
            });
        }

        if (data.skills) {
            this.skills = new Map(Object.entries(data.skills));
        }

        // Load magic-related data
        if (data.magicAffinities) {
            Object.assign(this.magicAffinities, data.magicAffinities);
        } else {
            // Re-initialize affinities if not in save data
            this.magicAffinities = this.initializeMagicAffinities();
        }

        if (data.learnedSpells) {
            // Note: This would need spell database integration to properly restore spells
            // For now, just store the names - spells would be relearned from database
            this._learnedSpellNames = data.learnedSpells;
        }

        this.manaRegenerationRate = data.manaRegenerationRate || 1.0;

        this.recalculateAllStats();
    }
}

export { RPGCharacter, CharacterStats, JobSystem, EquipmentSystem };