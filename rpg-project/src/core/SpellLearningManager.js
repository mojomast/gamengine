/**
 * SpellLearningManager.js - Learning Progression System for Magic
 * Manages spell learning prerequisites, job-specific spells, and progression
 */

import { MAGIC_SCHOOLS, SPELL_CATEGORIES } from './MagicAbility.js';

class SpellPrerequisite {
    constructor(type, value, description) {
        this.type = type; // 'stat', 'skill', 'level', 'job', 'spell'
        this.value = value;
        this.description = description;
    }

    check(character) {
        switch (this.type) {
            case 'stat':
                return character.baseStats[this.value.stat] >= this.value.amount;
            case 'skill':
                return character.getSkillLevel(this.value.skill) >= this.value.level;
            case 'level':
                return character.level >= this.value;
            case 'job':
                return character.getJobInfo() &&
                       character.getJobInfo().name.toLowerCase() === this.value.toLowerCase();
            case 'spell':
                return character.hasLearnedSpell(this.value);
            default:
                return false;
        }
    }
}

class SpellLearningManager {
    constructor(spellDatabase) {
        this.spellDatabase = spellDatabase;
        this.learningPrerequisites = new Map();
        this.jobSpellTrees = new Map();
        this.initializePrerequisites();
        this.initializeJobSpellTrees();
    }

    initializePrerequisites() {
        // Basic spells - low requirements
        this.setPrerequisites('Fireball', [
            new SpellPrerequisite('stat', { stat: 'intelligence', amount: 12 }, 'Intelligence 12+'),
            new SpellPrerequisite('level', 1, 'Character Level 1+')
        ]);

        this.setPrerequisites('Heal', [
            new SpellPrerequisite('stat', { stat: 'wisdom', amount: 12 }, 'Wisdom 12+'),
            new SpellPrerequisite('level', 1, 'Character Level 1+')
        ]);

        this.setPrerequisites('Power Strike', [
            new SpellPrerequisite('stat', { stat: 'strength', amount: 12 }, 'Strength 12+'),
            new SpellPrerequisite('level', 1, 'Character Level 1+')
        ]);

        // Intermediate spells
        this.setPrerequisites('Ice Lance', [
            new SpellPrerequisite('stat', { stat: 'intelligence', amount: 14 }, 'Intelligence 14+'),
            new SpellPrerequisite('skill', { skill: 'destruction', level: 2 }, 'Destruction Skill 2+'),
            new SpellPrerequisite('level', 3, 'Character Level 3+')
        ]);

        this.setPrerequisites('Greater Heal', [
            new SpellPrerequisite('stat', { stat: 'wisdom', amount: 16 }, 'Wisdom 16+'),
            new SpellPrerequisite('spell', 'Heal', 'Must know Heal'),
            new SpellPrerequisite('skill', { skill: 'restoration', level: 3 }, 'Restoration Skill 3+'),
            new SpellPrerequisite('level', 5, 'Character Level 5+')
        ]);

        this.setPrerequisites('Lightning Bolt', [
            new SpellPrerequisite('stat', { stat: 'intelligence', amount: 16 }, 'Intelligence 16+'),
            new SpellPrerequisite('skill', { skill: 'destruction', level: 3 }, 'Destruction Skill 3+'),
            new SpellPrerequisite('level', 4, 'Character Level 4+')
        ]);

        // Advanced spells
        this.setPrerequisites('Meteor Storm', [
            new SpellPrerequisite('stat', { stat: 'intelligence', amount: 18 }, 'Intelligence 18+'),
            new SpellPrerequisite('spell', 'Fireball', 'Must know Fireball'),
            new SpellPrerequisite('skill', { skill: 'destruction', level: 5 }, 'Destruction Skill 5+'),
            new SpellPrerequisite('level', 7, 'Character Level 7+')
        ]);

        this.setPrerequisites('Resurrection', [
            new SpellPrerequisite('stat', { stat: 'wisdom', amount: 20 }, 'Wisdom 20+'),
            new SpellPrerequisite('job', 'cleric', 'Must be Cleric'),
            new SpellPrerequisite('spell', 'Greater Heal', 'Must know Greater Heal'),
            new SpellPrerequisite('skill', { skill: 'restoration', level: 7 }, 'Restoration Skill 7+'),
            new SpellPrerequisite('level', 10, 'Character Level 10+')
        ]);

        this.setPrerequisites('Meteor', [
            new SpellPrerequisite('stat', { stat: 'intelligence', amount: 20 }, 'Intelligence 20+'),
            new SpellPrerequisite('spell', 'Meteor Storm', 'Must know Meteor Storm'),
            new SpellPrerequisite('skill', { skill: 'destruction', level: 8 }, 'Destruction Skill 8+'),
            new SpellPrerequisite('level', 12, 'Character Level 12+')
        ]);
    }

    initializeJobSpellTrees() {
        // Mage spell tree
        this.jobSpellTrees.set('mage', {
            name: 'Arcane Mastery',
            schools: [MAGIC_SCHOOLS.DESTRUCTION, MAGIC_SCHOOLS.ALTERATION, MAGIC_SCHOOLS.MYSTICISM],
            recommendedSpells: [
                'Fireball', 'Ice Lance', 'Lightning Bolt', 'Meteor Storm',
                'Haste', 'Magic Shield', 'Stone Skin', 'Meteor'
            ]
        });

        // Cleric spell tree
        this.jobSpellTrees.set('cleric', {
            name: 'Divine Power',
            schools: [MAGIC_SCHOOLS.RESTORATION, MAGIC_SCHOOLS.CONJURATION, MAGIC_SCHOOLS.MYSTICISM],
            recommendedSpells: [
                'Heal', 'Greater Heal', 'Mass Heal', 'Regeneration',
                'Protection', 'Stone Skin', 'Resurrection'
            ]
        });

        // Warrior spell tree (physical skills)
        this.jobSpellTrees.set('warrior', {
            name: 'Combat Mastery',
            schools: [MAGIC_SCHOOLS.PHYSICAL, MAGIC_SCHOOLS.ALTERATION],
            recommendedSpells: [
                'Power Strike', 'Whirlwind', 'Berserk', 'Strength'
            ]
        });

        // Rogue spell tree
        this.jobSpellTrees.set('rogue', {
            name: 'Shadow Arts',
            schools: [MAGIC_SCHOOLS.PHYSICAL, MAGIC_SCHOOLS.MYSTICISM],
            recommendedSpells: [
                'Power Strike', 'Haste', 'Clairvoyance', 'Mind Blast'
            ]
        });
    }

    setPrerequisites(spellName, prerequisites) {
        this.learningPrerequisites.set(spellName.toLowerCase(), prerequisites);
    }

    getPrerequisites(spellName) {
        return this.learningPrerequisites.get(spellName.toLowerCase()) || [];
    }

    canLearnSpell(character, spellName) {
        const spell = this.spellDatabase.getSpell(spellName);
        if (!spell) return { canLearn: false, reason: 'Spell not found' };

        if (spell.isLearned) return { canLearn: false, reason: 'Already learned' };

        // Check basic spell requirements
        if (!spell.canLearn(character)) {
            return { canLearn: false, reason: 'Basic requirements not met' };
        }

        // Check custom prerequisites
        const prerequisites = this.getPrerequisites(spellName);
        const unmetPrerequisites = prerequisites.filter(prereq => !prereq.check(character));

        if (unmetPrerequisites.length > 0) {
            return {
                canLearn: false,
                reason: 'Prerequisites not met',
                unmetPrerequisites: unmetPrerequisites.map(p => p.description)
            };
        }

        return { canLearn: true };
    }

    getAvailableSpellsForCharacter(character) {
        const allSpells = this.spellDatabase.getAllSpells();
        return allSpells.filter(spell => {
            const learningCheck = this.canLearnSpell(character, spell.name);
            return learningCheck.canLearn;
        });
    }

    getSpellLearningPath(character) {
        const jobInfo = character.getJobInfo();
        if (!jobInfo) return [];

        const jobSpellTree = this.jobSpellTrees.get(jobInfo.name.toLowerCase());
        if (!jobSpellTree) return [];

        // Return spells in recommended order that character can learn
        return jobSpellTree.recommendedSpells
            .map(spellName => this.spellDatabase.getSpell(spellName))
            .filter(spell => spell && !spell.isLearned)
            .map(spell => ({
                spell: spell,
                canLearn: this.canLearnSpell(character, spell.name).canLearn,
                prerequisites: this.getPrerequisites(spell.name)
            }));
    }

    getSpellProgressionStats(character) {
        const learnedSpells = character.getLearnedSpells();
        const totalSpells = this.spellDatabase.getAllSpells();

        // Count spells by school
        const spellsBySchool = {};
        Object.values(MAGIC_SCHOOLS).forEach(school => {
            spellsBySchool[school] = {
                learned: learnedSpells.filter(spell => spell.school === school).length,
                total: totalSpells.filter(spell => spell.school === school).length
            };
        });

        // Calculate mastery levels
        const masteryLevels = {};
        Object.values(MAGIC_SCHOOLS).forEach(school => {
            const skillLevel = character.getSkillLevel(school);
            masteryLevels[school] = {
                level: skillLevel,
                title: this.getMasteryTitle(skillLevel)
            };
        });

        return {
            learnedSpellsCount: learnedSpells.length,
            totalSpellsCount: totalSpells.length,
            spellsBySchool: spellsBySchool,
            masteryLevels: masteryLevels,
            overallProgress: (learnedSpells.length / totalSpells.length) * 100
        };
    }

    getMasteryTitle(skillLevel) {
        if (skillLevel >= 10) return 'Archmage';
        if (skillLevel >= 8) return 'Master';
        if (skillLevel >= 6) return 'Expert';
        if (skillLevel >= 4) return 'Adept';
        if (skillLevel >= 2) return 'Apprentice';
        return 'Novice';
    }

    getRecommendedSpellsForLevel(character) {
        const availableSpells = this.getAvailableSpellsForCharacter(character);
        const characterLevel = character.level;

        // Prioritize spells that are appropriate for character's level
        return availableSpells
            .filter(spell => spell.level <= characterLevel + 2) // Allow some advancement
            .sort((a, b) => {
                // Sort by level appropriateness, then by school affinity
                const aAffinity = character.getMagicAffinity(a.school);
                const bAffinity = character.getMagicAffinity(b.school);
                const aLevelDiff = Math.abs(a.level - characterLevel);
                const bLevelDiff = Math.abs(b.level - characterLevel);

                if (aLevelDiff !== bLevelDiff) return aLevelDiff - bLevelDiff;
                return bAffinity - aAffinity;
            });
    }

    suggestNextSpell(character) {
        const recommendedSpells = this.getRecommendedSpellsForLevel(character);
        if (recommendedSpells.length === 0) return null;

        // Return the most appropriate spell
        return recommendedSpells[0];
    }

    // Experience and progression methods
    grantSpellExperience(character, spell, experienceGained = 10) {
        if (!character.hasLearnedSpell(spell.name)) return;

        spell.gainExperience(experienceGained);

        // Also grant skill experience
        character.increaseSkillLevel(spell.school, Math.floor(experienceGained / 20));

        return spell.experience;
    }

    // Save/Load functionality
    exportProgressionData() {
        const data = {};
        this.spellDatabase.getAllSpells().forEach(spell => {
            if (spell.isLearned) {
                data[spell.name] = {
                    level: spell.level,
                    experience: spell.experience,
                    isLearned: spell.isLearned
                };
            }
        });
        return data;
    }

    importProgressionData(data) {
        Object.entries(data).forEach(([spellName, spellData]) => {
            const spell = this.spellDatabase.getSpell(spellName);
            if (spell) {
                spell.level = spellData.level || 1;
                spell.experience = spellData.experience || 0;
                spell.isLearned = spellData.isLearned || false;
            }
        });
    }
}

export { SpellLearningManager, SpellPrerequisite };