/**
 * SpellDatabase.js - Comprehensive Spell Database for RPG
 * Contains predefined spells organized by magic schools and categories
 */

import {
    OffensiveSpell,
    DefensiveSpell,
    HealingSpell,
    BuffSpell,
    MAGIC_SCHOOLS,
    SPELL_CATEGORIES,
    TARGET_TYPES,
    ELEMENTAL_TYPES
} from './MagicAbility.js';

class SpellDatabase {
    constructor() {
        this.spells = new Map();
        this.spellCategories = new Map();
        this.spellSchools = new Map();
        this.initializeSpells();
    }

    initializeSpells() {
        // Destruction School Spells
        this.addSpell(new OffensiveSpell(
            'Fireball',
            'Launches a flaming projectile that explodes on impact',
            MAGIC_SCHOOLS.DESTRUCTION,
            45,
            TARGET_TYPES.SINGLE,
            2500,
            25,
            1
        ).setElementalType(ELEMENTAL_TYPES.FIRE));

        this.addSpell(new OffensiveSpell(
            'Ice Lance',
            'Fires a piercing lance of ice',
            MAGIC_SCHOOLS.DESTRUCTION,
            40,
            TARGET_TYPES.SINGLE,
            2000,
            22,
            1
        ).setElementalType(ELEMENTAL_TYPES.ICE));

        this.addSpell(new OffensiveSpell(
            'Lightning Bolt',
            'Strikes target with powerful electric energy',
            MAGIC_SCHOOLS.DESTRUCTION,
            50,
            TARGET_TYPES.SINGLE,
            3000,
            30,
            2
        ).setElementalType(ELEMENTAL_TYPES.LIGHTNING));

        this.addSpell(new OffensiveSpell(
            'Meteor Storm',
            'Summons multiple meteors to bombard an area',
            MAGIC_SCHOOLS.DESTRUCTION,
            80,
            TARGET_TYPES.AREA,
            8000,
            60,
            5
        ).setElementalType(ELEMENTAL_TYPES.FIRE));

        // Restoration School Spells
        this.addSpell(new HealingSpell(
            'Heal',
            'Restores health to target',
            MAGIC_SCHOOLS.RESTORATION,
            60,
            TARGET_TYPES.SINGLE,
            3000,
            20,
            1
        ));

        this.addSpell(new HealingSpell(
            'Greater Heal',
            'Restores significant health to target',
            MAGIC_SCHOOLS.RESTORATION,
            120,
            TARGET_TYPES.SINGLE,
            5000,
            40,
            3
        ));

        this.addSpell(new HealingSpell(
            'Mass Heal',
            'Restores health to all allies in area',
            MAGIC_SCHOOLS.RESTORATION,
            80,
            TARGET_TYPES.AREA,
            8000,
            50,
            4
        ));

        this.addSpell(new BuffSpell(
            'Regeneration',
            'Grants target health regeneration over time',
            MAGIC_SCHOOLS.RESTORATION,
            5,
            'health',
            30,
            TARGET_TYPES.SELF,
            15000,
            35,
            2
        ));

        // Alteration School Spells
        this.addSpell(new DefensiveSpell(
            'Stone Skin',
            'Increases target\'s defense significantly',
            MAGIC_SCHOOLS.ALTERATION,
            15,
            20,
            TARGET_TYPES.SELF,
            10000,
            30,
            2
        ));

        this.addSpell(new BuffSpell(
            'Haste',
            'Increases target\'s movement speed',
            MAGIC_SCHOOLS.ALTERATION,
            20,
            'movementSpeed',
            25,
            TARGET_TYPES.SELF,
            12000,
            25,
            2
        ));

        this.addSpell(new BuffSpell(
            'Strength',
            'Increases target\'s strength',
            MAGIC_SCHOOLS.ALTERATION,
            10,
            'strength',
            30,
            TARGET_TYPES.SELF,
            8000,
            20,
            1
        ));

        this.addSpell(new BuffSpell(
            'Intelligence',
            'Increases target\'s intelligence',
            MAGIC_SCHOOLS.ALTERATION,
            10,
            'intelligence',
            30,
            TARGET_TYPES.SELF,
            8000,
            20,
            1
        ));

        // Conjuration School Spells
        this.addSpell(new OffensiveSpell(
            'Summon Imp',
            'Summons an imp to attack your enemies',
            MAGIC_SCHOOLS.CONJURATION,
            35,
            TARGET_TYPES.SINGLE,
            15000,
            40,
            3
        ));

        this.addSpell(new DefensiveSpell(
            'Shield',
            'Creates a magical barrier around target',
            MAGIC_SCHOOLS.CONJURATION,
            12,
            15,
            TARGET_TYPES.SELF,
            5000,
            15,
            1
        ));

        this.addSpell(new BuffSpell(
            'Protection',
            'Increases target\'s resistance to all damage',
            MAGIC_SCHOOLS.CONJURATION,
            8,
            'resistance',
            20,
            TARGET_TYPES.SELF,
            6000,
            18,
            1
        ));

        // Mysticism School Spells
        this.addSpell(new BuffSpell(
            'Magic Shield',
            'Increases target\'s magic resistance',
            MAGIC_SCHOOLS.MYSTICISM,
            12,
            'magicResistance',
            25,
            TARGET_TYPES.SELF,
            7000,
            22,
            2
        ));

        this.addSpell(new OffensiveSpell(
            'Mind Blast',
            'Damages target using psychic energy',
            MAGIC_SCHOOLS.MYSTICISM,
            55,
            TARGET_TYPES.SINGLE,
            4000,
            35,
            3
        ));

        this.addSpell(new BuffSpell(
            'Clairvoyance',
            'Increases target\'s perception and accuracy',
            MAGIC_SCHOOLS.MYSTICISM,
            15,
            'perception',
            20,
            TARGET_TYPES.SELF,
            10000,
            28,
            2
        ));

        // Physical School Spells (for non-magic users)
        this.addSpell(new OffensiveSpell(
            'Power Strike',
            'A powerful physical attack',
            MAGIC_SCHOOLS.PHYSICAL,
            50,
            TARGET_TYPES.SINGLE,
            2000,
            15,
            1
        ));

        this.addSpell(new OffensiveSpell(
            'Whirlwind',
            'Spins rapidly, damaging all nearby enemies',
            MAGIC_SCHOOLS.PHYSICAL,
            35,
            TARGET_TYPES.AREA,
            6000,
            25,
            2
        ));

        this.addSpell(new BuffSpell(
            'Berserk',
            'Increases attack power but reduces defense',
            MAGIC_SCHOOLS.PHYSICAL,
            20,
            'attackPower',
            15,
            TARGET_TYPES.SELF,
            8000,
            30,
            3
        ));

        // High-level spells
        this.addSpell(new OffensiveSpell(
            'Meteor',
            'Summons a massive meteor to crush enemies',
            MAGIC_SCHOOLS.DESTRUCTION,
            150,
            TARGET_TYPES.AREA,
            15000,
            100,
            8
        ).setElementalType(ELEMENTAL_TYPES.FIRE));

        this.addSpell(new HealingSpell(
            'Resurrection',
            'Brings a fallen ally back to life',
            MAGIC_SCHOOLS.RESTORATION,
            1, // Full heal on resurrection
            TARGET_TYPES.SINGLE,
            30000,
            150,
            10
        ));

        // Organize spells by category and school
        this.organizeSpells();
    }

    addSpell(spell) {
        this.spells.set(spell.name.toLowerCase(), spell);
    }

    getSpell(spellName) {
        return this.spells.get(spellName.toLowerCase());
    }

    getAllSpells() {
        return Array.from(this.spells.values());
    }

    getSpellsBySchool(school) {
        return this.spellSchools.get(school) || [];
    }

    getSpellsByCategory(category) {
        return this.spellCategories.get(category) || [];
    }

    getSpellsByLevelRange(minLevel, maxLevel) {
        return this.getAllSpells().filter(spell =>
            spell.level >= minLevel && spell.level <= maxLevel
        );
    }

    getAvailableSpellsForCharacter(character) {
        return this.getAllSpells().filter(spell => spell.canLearn(character));
    }

    getLearnedSpellsForCharacter(character) {
        return this.getAllSpells().filter(spell => spell.isLearned);
    }

    organizeSpells() {
        // Clear existing organization
        this.spellCategories.clear();
        this.spellSchools.clear();

        // Initialize categories and schools
        Object.values(SPELL_CATEGORIES).forEach(category => {
            this.spellCategories.set(category, []);
        });

        Object.values(MAGIC_SCHOOLS).forEach(school => {
            this.spellSchools.set(school, []);
        });

        // Organize spells
        this.spells.forEach(spell => {
            // By category
            if (this.spellCategories.has(spell.category)) {
                this.spellCategories.get(spell.category).push(spell);
            }

            // By school
            if (this.spellSchools.has(spell.school)) {
                this.spellSchools.get(spell.school).push(spell);
            }
        });
    }

    // Search functionality
    searchSpells(query, filters = {}) {
        let results = this.getAllSpells();

        // Text search
        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(spell =>
                spell.name.toLowerCase().includes(lowerQuery) ||
                spell.description.toLowerCase().includes(lowerQuery)
            );
        }

        // Apply filters
        if (filters.school) {
            results = results.filter(spell => spell.school === filters.school);
        }

        if (filters.category) {
            results = results.filter(spell => spell.category === filters.category);
        }

        if (filters.elementalType) {
            results = results.filter(spell => spell.elementalType === filters.elementalType);
        }

        if (filters.minLevel) {
            results = results.filter(spell => spell.level >= filters.minLevel);
        }

        if (filters.maxLevel) {
            results = results.filter(spell => spell.level <= filters.maxLevel);
        }

        if (filters.targeting) {
            results = results.filter(spell => spell.targeting === filters.targeting);
        }

        if (filters.maxManaCost) {
            results = results.filter(spell => spell.resourceCost <= filters.maxManaCost);
        }

        return results;
    }

    // Get spell recommendations for character job/class
    getRecommendedSpellsForJob(jobName) {
        const recommendations = {
            warrior: ['Power Strike', 'Whirlwind', 'Berserk', 'Strength'],
            mage: ['Fireball', 'Ice Lance', 'Lightning Bolt', 'Meteor Storm', 'Heal', 'Magic Shield'],
            cleric: ['Heal', 'Greater Heal', 'Mass Heal', 'Regeneration', 'Protection', 'Stone Skin'],
            rogue: ['Haste', 'Clairvoyance', 'Mind Blast', 'Protection']
        };

        const recommendedNames = recommendations[jobName.toLowerCase()] || [];
        return recommendedNames.map(name => this.getSpell(name)).filter(Boolean);
    }

    // Get spell info for UI
    getSpellInfo(spellName) {
        const spell = this.getSpell(spellName);
        if (!spell) return null;

        return {
            name: spell.name,
            description: spell.description,
            school: spell.school,
            category: spell.category,
            targeting: spell.targeting,
            cooldown: spell.cooldown,
            manaCost: spell.resourceCost,
            level: spell.level,
            elementalType: spell.elementalType,
            damage: spell.baseDamage || null,
            healing: spell.baseHealAmount || null,
            duration: spell.duration || null,
            isLearned: spell.isLearned,
            canLearn: spell.canLearn ? (character) => spell.canLearn(character) : null
        };
    }

    // Export spell data for saving/loading
    exportSpellData() {
        const data = {};
        this.spells.forEach((spell, name) => {
            data[name] = {
                name: spell.name,
                isLearned: spell.isLearned,
                level: spell.level,
                experience: spell.experience
            };
        });
        return data;
    }

    // Import spell data from save
    importSpellData(data) {
        Object.entries(data).forEach(([name, spellData]) => {
            const spell = this.getSpell(name);
            if (spell) {
                spell.isLearned = spellData.isLearned || false;
                spell.level = spellData.level || 1;
                spell.experience = spellData.experience || 0;
            }
        });
    }
}

// Utility function to create custom spells
function createCustomSpell(config) {
    const {
        name,
        description,
        school,
        category,
        type, // 'offensive', 'defensive', 'healing', 'buff'
        targeting = TARGET_TYPES.SINGLE,
        cooldown = 3000,
        manaCost = 20,
        level = 1,
        ...typeSpecific
    } = config;

    let spell;

    switch (type) {
        case 'offensive':
            spell = new OffensiveSpell(
                name,
                description,
                school,
                typeSpecific.damage || 30,
                targeting,
                cooldown,
                manaCost,
                level
            );
            if (typeSpecific.elementalType) {
                spell.elementalType = typeSpecific.elementalType;
            }
            break;

        case 'defensive':
            spell = new DefensiveSpell(
                name,
                description,
                school,
                typeSpecific.defenseBonus || 10,
                typeSpecific.duration || 10,
                targeting,
                cooldown,
                manaCost,
                level
            );
            break;

        case 'healing':
            spell = new HealingSpell(
                name,
                description,
                school,
                typeSpecific.healAmount || 50,
                targeting,
                cooldown,
                manaCost,
                level
            );
            break;

        case 'buff':
            spell = new BuffSpell(
                name,
                description,
                school,
                typeSpecific.statBonus || 5,
                typeSpecific.statName || 'strength',
                typeSpecific.duration || 20,
                targeting,
                cooldown,
                manaCost,
                level
            );
            break;

        default:
            throw new Error(`Unknown spell type: ${type}`);
    }

    return spell;
}

export { SpellDatabase, createCustomSpell };