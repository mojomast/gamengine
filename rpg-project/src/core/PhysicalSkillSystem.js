/**
 * PhysicalSkillSystem.js - Physical Skills and Abilities System
 * Handles non-magical combat and utility skills with XP tracking
 */

import { BaseMagicAbility, SPELL_CATEGORIES, TARGET_TYPES } from './MagicAbility.js';
import { MAGIC_SCHOOLS } from './MagicAbility.js';

class PhysicalSkill extends BaseMagicAbility {
    constructor(name, description, skillType, damage, targeting, cooldown, staminaCost, level = 1) {
        super(name, description, MAGIC_SCHOOLS.PHYSICAL, SPELL_CATEGORIES.OFFENSIVE, targeting, cooldown, staminaCost, level);
        this.skillType = skillType; // 'melee', 'ranged', 'defense', 'utility'
        this.baseDamage = damage;
        this.staminaCost = staminaCost; // Override resource cost for stamina
        this.resourceType = 'stamina';
    }

    checkResource(character) {
        return character.stamina >= this.staminaCost;
    }

    consumeResource(character) {
        character.stamina -= this.staminaCost;
    }

    applyEffect(character, target) {
        if (!target) return;

        let damage = this.baseDamage;

        // Apply skill-specific bonuses
        switch (this.skillType) {
            case 'melee':
                damage += Math.floor(character.getAttackPower() * 0.8);
                break;
            case 'ranged':
                damage += Math.floor(character.getAttackPower() * 0.6);
                break;
            case 'defense':
                // Defense skills might not deal damage
                break;
        }

        // Apply critical hits
        if (this.isCriticalHit(character)) {
            damage *= 2;
        }

        if (damage > 0) {
            target.takeDamage(damage);
        }

        // Apply skill-specific effects
        this.applySkillEffects(character, target);

        this.gainExperience();
        this.triggerSkillCallbacks(character, target, { damage, skillType: this.skillType });
    }

    applySkillEffects(character, target) {
        // Skill-specific effects
        switch (this.name.toLowerCase()) {
            case 'power strike':
                // Bonus damage and knockback
                break;
            case 'whirlwind':
                // Damage multiple targets
                break;
            case 'berserk':
                // Increase damage but reduce defense
                character.stats.defense *= 0.8;
                setTimeout(() => {
                    character.stats.defense /= 0.8;
                }, 10000);
                break;
        }
    }

    isCriticalHit(character) {
        const critChance = character.getCriticalChance ? character.getCriticalChance() : 0.05;
        return Math.random() < critChance;
    }

    triggerSkillCallbacks(character, target, data) {
        if (this.onSkillUsed) {
            this.onSkillUsed(character, target, data);
        }
    }
}

class MeleeSkill extends PhysicalSkill {
    constructor(name, description, damage, targeting, cooldown, staminaCost, level = 1) {
        super(name, description, 'melee', damage, targeting, cooldown, staminaCost, level);
    }

    applyEffect(character, target) {
        // Check if target is in melee range
        const distance = this.getDistance(character.position, target.position);
        if (distance > 2) {
            console.warn('Target is too far for melee skill');
            return;
        }

        super.applyEffect(character, target);
    }

    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class RangedSkill extends PhysicalSkill {
    constructor(name, description, damage, range, targeting, cooldown, staminaCost, level = 1) {
        super(name, description, 'ranged', damage, targeting, cooldown, staminaCost, level);
        this.range = range;
    }

    applyEffect(character, target) {
        const distance = this.getDistance(character.position, target.position);
        if (distance > this.range) {
            console.warn('Target is out of range for ranged skill');
            return;
        }

        super.applyEffect(character, target);
    }

    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class DefensiveSkill extends PhysicalSkill {
    constructor(name, description, defenseBonus, duration, targeting, cooldown, staminaCost, level = 1) {
        super(name, description, 'defense', 0, targeting, cooldown, staminaCost, level);
        this.defenseBonus = defenseBonus;
        this.duration = duration;
    }

    applyEffect(character, target) {
        target = target || character;

        const actualBonus = this.defenseBonus + Math.floor(character.baseStats.constitution * 0.5);
        target.stats.defense += actualBonus;

        this.scheduleRemoval(target, 'defense', actualBonus);
        this.gainExperience();

        this.triggerSkillCallbacks(character, target, {
            defenseBonus: actualBonus,
            skillType: 'defense'
        });
    }
}

class UtilitySkill extends PhysicalSkill {
    constructor(name, description, effect, targeting, cooldown, staminaCost, level = 1) {
        super(name, description, 'utility', 0, targeting, cooldown, staminaCost, level);
        this.effect = effect;
    }

    applyEffect(character, target) {
        target = target || character;

        switch (this.effect) {
            case 'dodge':
                // Temporary dodge chance increase
                target.stats.dodgeChance += 0.3;
                this.scheduleRemoval(target, 'dodgeChance', 0.3);
                break;
            case 'taunt':
                // Force enemies to target this character
                if (target !== character) {
                    // Implementation would depend on battle system
                }
                break;
            case 'intimidate':
                // Reduce enemy attack power
                if (target !== character) {
                    target.stats.attackPower *= 0.8;
                    this.scheduleRemoval(target, 'attackPower', target.stats.attackPower * 0.25);
                }
                break;
        }

        this.gainExperience();
        this.triggerSkillCallbacks(character, target, {
            effect: this.effect,
            skillType: 'utility'
        });
    }
}

class SkillExperienceTracker {
    constructor() {
        this.skillXP = new Map();
        this.skillLevels = new Map();
    }

    gainExperience(skillName, amount) {
        if (!this.skillXP.has(skillName)) {
            this.skillXP.set(skillName, 0);
            this.skillLevels.set(skillName, 1);
        }

        const currentXP = this.skillXP.get(skillName);
        const currentLevel = this.skillLevels.get(skillName);

        this.skillXP.set(skillName, currentXP + amount);

        // Check for level up
        const xpForNextLevel = this.getXPForLevel(currentLevel + 1);
        if (currentXP + amount >= xpForNextLevel) {
            this.skillLevels.set(skillName, currentLevel + 1);
            return true; // Leveled up
        }

        return false;
    }

    getXPForLevel(level) {
        return 100 * level * level; // Quadratic scaling
    }

    getSkillLevel(skillName) {
        return this.skillLevels.get(skillName) || 1;
    }

    getSkillXP(skillName) {
        return this.skillXP.get(skillName) || 0;
    }

    getXPToNextLevel(skillName) {
        const currentLevel = this.getSkillLevel(skillName);
        const currentXP = this.getSkillXP(skillName);
        const xpForNextLevel = this.getXPForLevel(currentLevel + 1);

        return Math.max(0, xpForNextLevel - currentXP);
    }

    getSkillInfo(skillName) {
        return {
            name: skillName,
            level: this.getSkillLevel(skillName),
            xp: this.getSkillXP(skillName),
            xpToNext: this.getXPToNextLevel(skillName)
        };
    }
}

class JobSkillManager {
    constructor() {
        this.jobSkills = new Map();
        this.initializeJobSkills();
    }

    initializeJobSkills() {
        // Warrior skills
        this.jobSkills.set('warrior', [
            new MeleeSkill('Power Strike', 'A powerful melee attack', 50, TARGET_TYPES.SINGLE, 2000, 20, 1),
            new MeleeSkill('Whirlwind', 'Spin attack hitting multiple enemies', 35, TARGET_TYPES.AREA, 6000, 30, 2),
            new DefensiveSkill('Shield Bash', 'Bash with shield for defense bonus', 20, 10, TARGET_TYPES.SELF, 4000, 15, 1),
            new UtilitySkill('Taunt', 'Force enemies to attack you', 'taunt', TARGET_TYPES.SELF, 8000, 25, 3),
            new UtilitySkill('Berserk', 'Increase damage but reduce defense', 'berserk', TARGET_TYPES.SELF, 15000, 40, 5)
        ]);

        // Rogue skills
        this.jobSkills.set('rogue', [
            new MeleeSkill('Backstab', 'High damage from behind', 75, TARGET_TYPES.SINGLE, 3000, 25, 1),
            new UtilitySkill('Dodge', 'Temporarily increase dodge chance', 'dodge', TARGET_TYPES.SELF, 5000, 18, 1),
            new RangedSkill('Throwing Knife', 'Throw a knife at range', 40, 15, TARGET_TYPES.SINGLE, 2500, 15, 2),
            new UtilitySkill('Intimidate', 'Reduce enemy attack power', 'intimidate', TARGET_TYPES.SINGLE, 6000, 20, 3),
            new MeleeSkill('Eviscerate', 'Multiple quick strikes', 25, TARGET_TYPES.SINGLE, 1500, 12, 4)
        ]);

        // Cleric skills (physical variant)
        this.jobSkills.set('cleric', [
            new DefensiveSkill('Holy Shield', 'Divine protection', 25, 15, TARGET_TYPES.SELF, 8000, 20, 1),
            new UtilitySkill('Divine Intervention', 'Emergency healing', 'heal', TARGET_TYPES.SELF, 20000, 50, 3),
            new MeleeSkill('Smite', 'Holy melee attack', 45, TARGET_TYPES.SINGLE, 2500, 18, 1),
            new DefensiveSkill('Sanctuary', 'Protect nearby allies', 15, 20, TARGET_TYPES.AREA, 12000, 35, 4)
        ]);
    }

    getJobSkills(jobName) {
        return this.jobSkills.get(jobName.toLowerCase()) || [];
    }

    getSkillForJob(jobName, skillName) {
        const jobSkills = this.getJobSkills(jobName);
        return jobSkills.find(skill => skill.name.toLowerCase() === skillName.toLowerCase());
    }

    getAvailableSkillsForCharacter(character) {
        const jobInfo = character.getJobInfo();
        if (!jobInfo) return [];

        const jobSkills = this.getJobSkills(jobInfo.name);

        // Filter skills based on character level and skill prerequisites
        return jobSkills.filter(skill => {
            // Level requirement
            if (character.level < skill.level) return false;

            // Job level requirement
            if (character.jobSystem.jobLevel < skill.level) return false;

            return true;
        });
    }
}

class PhysicalSkillSystem {
    constructor() {
        this.skillTracker = new SkillExperienceTracker();
        this.jobSkillManager = new JobSkillManager();
        this.learnedSkills = new Map();
        this.activeSkills = new Map();
    }

    learnSkill(character, skillName) {
        const jobSkills = this.jobSkillManager.getAvailableSkillsForCharacter(character);
        const skill = jobSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());

        if (!skill) {
            return { success: false, message: "Skill not available for this character" };
        }

        if (this.learnedSkills.has(skill.name)) {
            return { success: false, message: "Skill already learned" };
        }

        this.learnedSkills.set(skill.name, skill);
        return { success: true, message: `Learned ${skill.name}` };
    }

    useSkill(character, skillName, target = null) {
        const skill = this.learnedSkills.get(skillName);
        if (!skill) {
            return { success: false, message: "Skill not learned" };
        }

        if (!skill.use(character, target)) {
            return { success: false, message: "Failed to use skill" };
        }

        // Grant experience
        this.skillTracker.gainExperience(skill.skillType, 10);
        this.skillTracker.gainExperience(skill.name, 5);

        return { success: true, skill: skill };
    }

    getLearnedSkills() {
        return Array.from(this.learnedSkills.values());
    }

    getAvailableSkills(character) {
        return this.jobSkillManager.getAvailableSkillsForCharacter(character);
    }

    getSkillProgress(skillName) {
        return this.skillTracker.getSkillInfo(skillName);
    }

    getSkillTypeProgress(skillType) {
        return this.skillTracker.getSkillInfo(skillType);
    }

    // Combat system integration
    getCombatSkills(character) {
        const learnedSkills = this.getLearnedSkills();
        return learnedSkills.filter(skill =>
            skill.category === SPELL_CATEGORIES.OFFENSIVE ||
            skill.skillType === 'melee' ||
            skill.skillType === 'ranged'
        );
    }

    getDefensiveSkills(character) {
        const learnedSkills = this.getLearnedSkills();
        return learnedSkills.filter(skill =>
            skill.category === 'defensive' ||
            skill.skillType === 'defense'
        );
    }

    // Update method for continuous effects
    update(deltaTime) {
        // Update active skill effects
        this.activeSkills.forEach((skill, character) => {
            skill.update(deltaTime);
        });
    }

    // Save/Load functionality
    exportSkillData() {
        const data = {
            learnedSkills: Array.from(this.learnedSkills.keys()),
            skillXP: Object.fromEntries(this.skillTracker.skillXP),
            skillLevels: Object.fromEntries(this.skillTracker.skillLevels)
        };
        return data;
    }

    importSkillData(data) {
        // Restore learned skills
        if (data.learnedSkills) {
            data.learnedSkills.forEach(skillName => {
                // Skills would need to be recreated from jobSkillManager
                // This is a simplified version
                const skill = this.jobSkillManager.getSkillForJob('warrior', skillName) ||
                             this.jobSkillManager.getSkillForJob('rogue', skillName) ||
                             this.jobSkillManager.getSkillForJob('cleric', skillName);
                if (skill) {
                    this.learnedSkills.set(skill.name, skill);
                }
            });
        }

        // Restore XP and levels
        if (data.skillXP) {
            Object.entries(data.skillXP).forEach(([skill, xp]) => {
                this.skillTracker.skillXP.set(skill, xp);
            });
        }

        if (data.skillLevels) {
            Object.entries(data.skillLevels).forEach(([skill, level]) => {
                this.skillTracker.skillLevels.set(skill, level);
            });
        }
    }
}

export {
    PhysicalSkill,
    MeleeSkill,
    RangedSkill,
    DefensiveSkill,
    UtilitySkill,
    SkillExperienceTracker,
    JobSkillManager,
    PhysicalSkillSystem
};