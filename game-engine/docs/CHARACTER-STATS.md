# 📊 Character Stats & Progression System Documentation

## Overview
The Character Stats System manages all character attributes, leveling, skill progression, experience distribution, and character development with flexible stat calculations and progression paths.

## Core Character System

### Character Class
```javascript
class Character {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.race = config.race || 'human';
        this.characterClass = config.characterClass || 'adventurer';
        
        // Core Stats
        this.stats = new CharacterStats(config.baseStats);
        this.level = config.level || 1;
        this.experience = config.experience || 0;
        this.experienceToNext = this.calculateExpToNext();
        
        // Health and Resources
        this.health = new Resource('health', this.stats.getMaxHealth());
        this.mana = new Resource('mana', this.stats.getMaxMana());
        this.stamina = new Resource('stamina', this.stats.getMaxStamina());
        
        // Skills
        this.skills = new SkillManager(config.skills);
        
        // Status Effects
        this.statusEffects = new StatusEffectManager();
        this.buffs = new BuffManager();
        
        // Progression
        this.attributes = new AttributeManager(config.attributes);
        this.talents = new TalentTree(config.talents);
        
        this.eventEmitter = new EventEmitter();
    }

    // Experience and Leveling
    gainExperience(amount, source = 'unknown') {
        const oldLevel = this.level;
        this.experience += amount;
        
        this.eventEmitter.emit('experience-gained', {
            amount,
            source,
            totalExp: this.experience
        });
        
        // Check for level up
        while (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
        
        if (this.level > oldLevel) {
            this.eventEmitter.emit('level-changed', {
                oldLevel,
                newLevel: this.level,
                levelsGained: this.level - oldLevel
            });
        }
    }

    levelUp() {
        this.experience -= this.experienceToNext;
        this.level++;
        
        // Apply level benefits
        const benefits = this.calculateLevelBenefits();
        this.applyLevelBenefits(benefits);
        
        this.experienceToNext = this.calculateExpToNext();
        
        this.eventEmitter.emit('level-up', {
            newLevel: this.level,
            benefits
        });
    }
}
```

### Character Stats System
```javascript
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
            // Apply temporary modifier through buff system
            this.applyTemporaryModifier(statName, amount);
        } else {
            // Permanent stat change
            this[statName] = Math.max(1, this[statName] + amount);
            this.recalculateStats();
        }
    }
}
```

## Skill System

### Skill Manager
```javascript
class SkillManager {
    constructor(initialSkills = {}) {
        this.skills = new Map();
        this.skillCategories = new Map();
        this.skillCaps = new Map();
        this.totalSkillPoints = 0;
        
        // Initialize default skills
        this.initializeSkills(initialSkills);
    }

    initializeSkills(initialSkills) {
        const defaultSkills = {
            // Combat Skills
            'melee': { level: 0, experience: 0, category: 'combat' },
            'ranged': { level: 0, experience: 0, category: 'combat' },
            'defense': { level: 0, experience: 0, category: 'combat' },
            'magic': { level: 0, experience: 0, category: 'combat' },
            
            // Crafting Skills
            'blacksmithing': { level: 0, experience: 0, category: 'crafting' },
            'alchemy': { level: 0, experience: 0, category: 'crafting' },
            'enchanting': { level: 0, experience: 0, category: 'crafting' },
            'cooking': { level: 0, experience: 0, category: 'crafting' },
            
            // Utility Skills
            'lockpicking': { level: 0, experience: 0, category: 'utility' },
            'stealth': { level: 0, experience: 0, category: 'utility' },
            'diplomacy': { level: 0, experience: 0, category: 'social' },
            'intimidation': { level: 0, experience: 0, category: 'social' },
            'trading': { level: 0, experience: 0, category: 'social' }
        };

        Object.keys(defaultSkills).forEach(skillName => {
            const skillData = { ...defaultSkills[skillName], ...initialSkills[skillName] };
            this.skills.set(skillName, new Skill(skillName, skillData));
        });
    }

    gainSkillExperience(skillName, amount, multiplier = 1.0) {
        const skill = this.skills.get(skillName);
        if (!skill) return false;

        const actualAmount = amount * multiplier;
        const oldLevel = skill.level;
        
        skill.gainExperience(actualAmount);
        
        if (skill.level > oldLevel) {
            this.onSkillLevelUp(skillName, oldLevel, skill.level);
        }
        
        return true;
    }

    onSkillLevelUp(skillName, oldLevel, newLevel) {
        const levelsGained = newLevel - oldLevel;
        
        // Award skill points for spending
        this.totalSkillPoints += levelsGained;
        
        // Emit event for UI updates
        this.eventEmitter.emit('skill-level-up', {
            skill: skillName,
            oldLevel,
            newLevel,
            levelsGained
        });
        
        // Check for skill-specific bonuses
        this.checkSkillMilestones(skillName, newLevel);
    }

    checkSkillMilestones(skillName, level) {
        const milestones = {
            25: 'novice',
            50: 'apprentice', 
            75: 'journeyman',
            90: 'expert',
            100: 'master'
        };

        if (milestones[level]) {
            this.eventEmitter.emit('skill-milestone', {
                skill: skillName,
                level,
                rank: milestones[level]
            });
        }
    }
}

class Skill {
    constructor(name, config) {
        this.name = name;
        this.level = config.level || 0;
        this.experience = config.experience || 0;
        this.category = config.category || 'general';
        this.cap = config.cap || 100;
        this.experienceToNext = this.calculateExpToNext();
        this.bonuses = config.bonuses || [];
    }

    gainExperience(amount) {
        if (this.level >= this.cap) return false;
        
        this.experience += amount;
        
        while (this.experience >= this.experienceToNext && this.level < this.cap) {
            this.levelUp();
        }
        
        return true;
    }

    levelUp() {
        this.experience -= this.experienceToNext;
        this.level++;
        this.experienceToNext = this.calculateExpToNext();
    }

    calculateExpToNext() {
        // Exponential curve gets steeper at higher levels
        return Math.floor(100 * Math.pow(1.1, this.level));
    }

    getEffectiveLevel(bonusModifiers = []) {
        let effectiveLevel = this.level;
        
        bonusModifiers.forEach(modifier => {
            if (modifier.type === 'skill_bonus' && modifier.skill === this.name) {
                effectiveLevel += modifier.amount;
            }
        });
        
        return Math.min(this.cap, effectiveLevel);
    }
}
```

## Attribute System

### Attribute Manager
```javascript
class AttributeManager {
    constructor(config = {}) {
        this.availablePoints = config.availablePoints || 0;
        this.totalPointsSpent = config.totalPointsSpent || 0;
        this.attributeBonuses = new Map();
        
        // Track where points have been spent
        this.spentPoints = {
            strength: config.spentPoints?.strength || 0,
            dexterity: config.spentPoints?.dexterity || 0,
            intelligence: config.spentPoints?.intelligence || 0,
            wisdom: config.spentPoints?.wisdom || 0,
            constitution: config.spentPoints?.constitution || 0,
            charisma: config.spentPoints?.charisma || 0,
            luck: config.spentPoints?.luck || 0
        };
    }

    spendAttributePoint(attribute, points = 1) {
        if (this.availablePoints < points) {
            return { success: false, message: "Insufficient attribute points" };
        }

        const costPerPoint = this.getAttributeCost(attribute, this.spentPoints[attribute]);
        const totalCost = costPerPoint * points;
        
        if (this.availablePoints < totalCost) {
            return { success: false, message: `Need ${totalCost} points, have ${this.availablePoints}` };
        }

        // Apply the attribute increase
        this.availablePoints -= totalCost;
        this.spentPoints[attribute] += points;
        this.totalPointsSpent += totalCost;
        
        // Update character stats
        const character = this.getCharacter();
        character.stats[attribute] += points;
        character.stats.recalculateStats();
        
        return {
            success: true,
            message: `Increased ${attribute} by ${points}`,
            pointsSpent: totalCost,
            newValue: character.stats[attribute]
        };
    }

    getAttributeCost(attribute, currentSpent) {
        // Progressive cost increase
        if (currentSpent < 10) return 1;      // First 10 points cost 1 each
        if (currentSpent < 20) return 2;      // Next 10 points cost 2 each
        if (currentSpent < 30) return 3;      // Next 10 points cost 3 each
        return 4;                             // Beyond 30 points cost 4 each
    }

    gainAttributePoints(amount, source = 'level') {
        this.availablePoints += amount;
        
        this.eventEmitter.emit('attribute-points-gained', {
            amount,
            source,
            total: this.availablePoints
        });
    }

    respecAttributes(cost = 'gold') {
        // Reset all spent attribute points
        const refundedPoints = this.totalPointsSpent;
        
        Object.keys(this.spentPoints).forEach(attr => {
            const character = this.getCharacter();
            character.stats[attr] -= this.spentPoints[attr];
            this.spentPoints[attr] = 0;
        });
        
        this.availablePoints += refundedPoints;
        this.totalPointsSpent = 0;
        
        // Recalculate character stats
        const character = this.getCharacter();
        character.stats.recalculateStats();
        
        return {
            success: true,
            refundedPoints,
            message: `Refunded ${refundedPoints} attribute points`
        };
    }
}
```

## Talent Tree System

### Talent Tree Manager
```javascript
class TalentTree {
    constructor(config = {}) {
        this.trees = new Map();
        this.unlockedTalents = new Set(config.unlockedTalents || []);
        this.talentPoints = config.talentPoints || 0;
        this.totalPointsSpent = config.totalPointsSpent || 0;
        
        this.initializeTrees();
    }

    initializeTrees() {
        // Combat Tree
        this.trees.set('combat', new TalentTreeBranch('combat', {
            name: 'Combat Mastery',
            description: 'Enhances combat abilities and damage',
            talents: this.createCombatTalents()
        }));
        
        // Magic Tree
        this.trees.set('magic', new TalentTreeBranch('magic', {
            name: 'Arcane Arts',
            description: 'Magical abilities and spell enhancement',
            talents: this.createMagicTalents()
        }));
        
        // Utility Tree
        this.trees.set('utility', new TalentTreeBranch('utility', {
            name: 'Survival & Utility',
            description: 'Crafting, exploration, and utility skills',
            talents: this.createUtilityTalents()
        }));
    }

    createCombatTalents() {
        return {
            // Tier 1
            'weapon_mastery': new Talent({
                id: 'weapon_mastery',
                name: 'Weapon Mastery',
                description: '+5% damage with all weapons',
                tier: 1,
                maxRanks: 5,
                effect: { type: 'damage_bonus', value: 0.05 },
                requirements: []
            }),
            
            'armor_training': new Talent({
                id: 'armor_training',
                name: 'Armor Training',
                description: '+2 defense per rank',
                tier: 1,
                maxRanks: 3,
                effect: { type: 'defense_bonus', value: 2 },
                requirements: []
            }),
            
            // Tier 2
            'critical_strikes': new Talent({
                id: 'critical_strikes',
                name: 'Critical Strikes',
                description: '+2% critical hit chance',
                tier: 2,
                maxRanks: 5,
                effect: { type: 'critical_chance', value: 0.02 },
                requirements: ['weapon_mastery:3']
            }),
            
            'berserker_rage': new Talent({
                id: 'berserker_rage',
                name: 'Berserker Rage',
                description: 'Unlocks Rage ability: +50% damage, -25% defense for 10 seconds',
                tier: 2,
                maxRanks: 1,
                effect: { type: 'unlock_ability', ability: 'berserker_rage' },
                requirements: ['weapon_mastery:5', 'armor_training:2']
            })
        };
    }

    unlockTalent(talentId, points = 1) {
        const talent = this.findTalent(talentId);
        if (!talent) {
            return { success: false, message: "Talent not found" };
        }

        // Check requirements
        const reqCheck = this.checkTalentRequirements(talent);
        if (!reqCheck.success) {
            return reqCheck;
        }

        // Check talent points
        if (this.talentPoints < points) {
            return { success: false, message: "Insufficient talent points" };
        }

        // Check if talent can be upgraded further
        const currentRank = this.getTalentRank(talentId);
        if (currentRank + points > talent.maxRanks) {
            return { success: false, message: "Talent already at maximum rank" };
        }

        // Apply talent
        this.talentPoints -= points;
        this.totalPointsSpent += points;
        
        for (let i = 0; i < points; i++) {
            this.unlockedTalents.add(`${talentId}:${currentRank + i + 1}`);
        }

        // Apply talent effects
        this.applyTalentEffects(talent, points);

        return {
            success: true,
            message: `Unlocked ${talent.name} (Rank ${currentRank + points})`,
            newRank: currentRank + points
        };
    }

    checkTalentRequirements(talent) {
        for (const requirement of talent.requirements) {
            const [reqTalentId, reqRank] = requirement.split(':');
            const reqRankNum = parseInt(reqRank) || 1;
            
            if (this.getTalentRank(reqTalentId) < reqRankNum) {
                const reqTalent = this.findTalent(reqTalentId);
                return {
                    success: false,
                    message: `Requires ${reqTalent.name} (Rank ${reqRankNum})`
                };
            }
        }
        
        return { success: true };
    }

    getTalentRank(talentId) {
        let rank = 0;
        for (const unlockedId of this.unlockedTalents) {
            if (unlockedId.startsWith(talentId + ':')) {
                const rankNum = parseInt(unlockedId.split(':')[1]);
                rank = Math.max(rank, rankNum);
            }
        }
        return rank;
    }
}

class Talent {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.tier = config.tier || 1;
        this.maxRanks = config.maxRanks || 1;
        this.effect = config.effect;
        this.requirements = config.requirements || [];
        this.icon = config.icon;
        this.unlockLevel = config.unlockLevel || 1;
    }

    getDescription(rank = 1) {
        let desc = this.description;
        
        // Replace rank-dependent values
        if (this.effect.value && typeof this.effect.value === 'number') {
            const value = this.effect.value * rank;
            desc = desc.replace(/\+?\d+\.?\d*%?/, 
                this.effect.type.includes('percent') ? `+${(value * 100).toFixed(1)}%` : `+${value}`
            );
        }
        
        if (this.maxRanks > 1) {
            desc += ` (Rank ${rank}/${this.maxRanks})`;
        }
        
        return desc;
    }
}
```

## Status Effects and Buffs

### Status Effect Manager
```javascript
class StatusEffectManager {
    constructor() {
        this.activeEffects = new Map();
        this.immunities = new Set();
        this.resistances = new Map();
    }

    addStatusEffect(effectId, duration, source = null, stacks = 1) {
        // Check immunity
        if (this.immunities.has(effectId)) {
            return { success: false, message: "Immune to this effect" };
        }

        const effect = StatusEffect.getById(effectId);
        if (!effect) {
            return { success: false, message: "Unknown status effect" };
        }

        // Check resistance
        const resistance = this.resistances.get(effectId) || 0;
        duration *= (1 - resistance);
        
        if (duration <= 0) {
            return { success: false, message: "Resisted effect" };
        }

        // Handle stacking
        if (this.activeEffects.has(effectId)) {
            const existing = this.activeEffects.get(effectId);
            
            if (effect.stackType === 'refresh') {
                existing.duration = Math.max(existing.duration, duration);
            } else if (effect.stackType === 'stack') {
                existing.stacks = Math.min(existing.stacks + stacks, effect.maxStacks);
                existing.duration = duration;
            } else {
                // No stacking, ignore new application
                return { success: false, message: "Effect already active" };
            }
        } else {
            // New effect
            this.activeEffects.set(effectId, {
                effect,
                duration,
                stacks,
                source,
                startTime: Date.now()
            });
            
            // Apply initial effect
            effect.onApply(this.getCharacter(), stacks);
        }

        return { success: true, effect };
    }

    updateStatusEffects(deltaTime) {
        const toRemove = [];
        
        this.activeEffects.forEach((activeEffect, effectId) => {
            activeEffect.duration -= deltaTime;
            
            // Apply periodic effects
            if (activeEffect.effect.periodic) {
                activeEffect.effect.onTick(this.getCharacter(), activeEffect.stacks, deltaTime);
            }
            
            // Check if effect expired
            if (activeEffect.duration <= 0) {
                activeEffect.effect.onRemove(this.getCharacter(), activeEffect.stacks);
                toRemove.push(effectId);
            }
        });
        
        // Remove expired effects
        toRemove.forEach(effectId => {
            this.activeEffects.delete(effectId);
        });
    }
}

class StatusEffect {
    static effects = new Map();
    
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.type = config.type; // 'buff', 'debuff', 'neutral'
        this.stackType = config.stackType || 'none'; // 'none', 'stack', 'refresh'
        this.maxStacks = config.maxStacks || 1;
        this.periodic = config.periodic || false;
        this.tickInterval = config.tickInterval || 1000;
        this.icon = config.icon;
        this.color = config.color;
        
        // Effect callbacks
        this.onApply = config.onApply || (() => {});
        this.onRemove = config.onRemove || (() => {});
        this.onTick = config.onTick || (() => {});
        
        StatusEffect.effects.set(this.id, this);
    }
    
    static getById(id) {
        return StatusEffect.effects.get(id);
    }
    
    static registerDefaults() {
        // Poison
        new StatusEffect({
            id: 'poison',
            name: 'Poisoned',
            description: 'Takes damage over time',
            type: 'debuff',
            stackType: 'stack',
            maxStacks: 10,
            periodic: true,
            tickInterval: 1000,
            color: '#4a9',
            onTick: (character, stacks, deltaTime) => {
                const damage = stacks * 2;
                character.takeDamage(damage, 'poison');
            }
        });
        
        // Regeneration
        new StatusEffect({
            id: 'regeneration',
            name: 'Regeneration',
            description: 'Heals over time',
            type: 'buff',
            stackType: 'refresh',
            periodic: true,
            tickInterval: 1000,
            color: '#4a4',
            onTick: (character, stacks, deltaTime) => {
                const healing = stacks * 3;
                character.heal(healing);
            }
        });
        
        // Strength Boost
        new StatusEffect({
            id: 'strength_boost',
            name: 'Strength Boost',
            description: '+10 Strength per stack',
            type: 'buff',
            stackType: 'stack',
            maxStacks: 5,
            color: '#f44',
            onApply: (character, stacks) => {
                character.stats.modifyStat('strength', 10 * stacks, true);
            },
            onRemove: (character, stacks) => {
                character.stats.modifyStat('strength', -10 * stacks, true);
            }
        });
    }
}
```

## Character Progression Integration

### Progression Manager
```javascript
class ProgressionManager {
    constructor(character) {
        this.character = character;
        this.progressionEvents = new EventEmitter();
        this.milestones = new Map();
        this.achievements = new Set();
        
        this.setupProgressionTracking();
    }

    setupProgressionTracking() {
        // Level milestones
        this.milestones.set('level_10', {
            type: 'level',
            value: 10,
            rewards: { talentPoints: 2, attributePoints: 5 },
            title: 'Seasoned Adventurer'
        });
        
        this.milestones.set('level_25', {
            type: 'level',
            value: 25,
            rewards: { talentPoints: 5, attributePoints: 10, gold: 1000 },
            title: 'Veteran Explorer'
        });
        
        // Skill milestones
        this.milestones.set('master_crafter', {
            type: 'skill_total',
            skills: ['blacksmithing', 'alchemy', 'enchanting'],
            value: 200, // Combined levels
            rewards: { talentPoints: 3, title: 'Master Crafter' }
        });
    }

    checkMilestones() {
        this.milestones.forEach((milestone, id) => {
            if (this.achievements.has(id)) return;
            
            if (this.isMilestoneComplete(milestone)) {
                this.completeMilestone(id, milestone);
            }
        });
    }

    isMilestoneComplete(milestone) {
        switch (milestone.type) {
            case 'level':
                return this.character.level >= milestone.value;
            
            case 'skill':
                return this.character.skills.getSkillLevel(milestone.skill) >= milestone.value;
            
            case 'skill_total':
                const totalLevels = milestone.skills.reduce((sum, skill) => {
                    return sum + this.character.skills.getSkillLevel(skill);
                }, 0);
                return totalLevels >= milestone.value;
            
            case 'stat':
                return this.character.stats[milestone.stat] >= milestone.value;
                
            default:
                return false;
        }
    }

    completeMilestone(id, milestone) {
        this.achievements.add(id);
        
        // Apply rewards
        if (milestone.rewards.talentPoints) {
            this.character.talents.talentPoints += milestone.rewards.talentPoints;
        }
        
        if (milestone.rewards.attributePoints) {
            this.character.attributes.gainAttributePoints(milestone.rewards.attributePoints, 'milestone');
        }
        
        if (milestone.rewards.gold) {
            this.character.inventory.gold += milestone.rewards.gold;
        }
        
        // Emit achievement
        this.progressionEvents.emit('milestone-completed', {
            id,
            milestone,
            character: this.character
        });
    }
}
```

This comprehensive character stats and progression system provides:
- ✅ Flexible attribute system with progressive costs
- ✅ Multi-tiered skill progression with experience
- ✅ Complex talent trees with requirements
- ✅ Status effects and buff management
- ✅ Milestone and achievement tracking
- ✅ Integrated progression rewards
- ✅ Respec and point redistribution
- ✅ Dynamic stat calculations

The system scales from simple RPGs to complex character development games!
