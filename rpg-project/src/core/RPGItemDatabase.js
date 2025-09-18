// RPG Item Database and Item Extensions
// Extends the base Item system from game-engine with RPG-specific categories and mechanics

import { Item, Equipment, Weapon, Armor, Consumable, InventoryManager, Recipe } from '../../../game-engine/src/core/InventoryManager.js';
import { ValidationHelpers } from '../../../game-engine/src/core/ValidationHelpers.js';

// RPG Extended Item Categories
export class RPGItem extends Item {
    constructor(id, name, description, category, rarity = 'common', value = 0, stackable = false, maxStack = 1) {
        super(id, name, description, rarity, value, stackable, maxStack);
        ValidationHelpers.validateType(category, 'string', 'category');

        this.category = category; // 'weapon', 'armor', 'consumable', 'material', 'accessory'
        this.icon = `${category}_${id}`; // Icon reference
        this.levelRequirement = 1; // Level requirement for use
        this.jobRestrictions = []; // Array of job IDs that can use this item
        this.flavorText = ''; // Additional descriptive text
    }

    // Check if character can use this item
    canUse(character) {
        if (character.level < this.levelRequirement) return false;
        if (this.jobRestrictions.length > 0 && !this.jobRestrictions.includes(character.job?.id)) return false;
        return true;
    }

    // Enhanced info with RPG-specific details
    getRPGInfo() {
        const baseInfo = this.getInfo();
        return {
            ...baseInfo,
            category: this.category,
            icon: this.icon,
            levelRequirement: this.levelRequirement,
            jobRestrictions: this.jobRestrictions,
            flavorText: this.flavorText
        };
    }
}

// RPG Weapon with stat bonuses
export class RPGWeapon extends Weapon {
    constructor(id, name, description, damage, weaponType, rarity, value, statBonuses = {}) {
        super(id, name, description, damage, weaponType, rarity, value);

        // RPG-specific properties
        this.statBonuses = statBonuses; // Additional stat bonuses (strength, dexterity, etc.)
        this.elementalType = null; // 'fire', 'ice', 'lightning', etc.
        this.elementalDamage = 0;
        this.criticalChance = 0.05; // Base 5% critical chance
        this.criticalMultiplier = 1.5; // 50% bonus damage on crit
    }

    // Calculate total damage including bonuses
    getTotalDamage(character = null) {
        let totalDamage = this.damage * this.quality;

        // Add elemental damage
        if (this.elementalDamage > 0) {
            totalDamage += this.elementalDamage;
        }

        // Add character stat bonuses
        if (character) {
            // Weapon-specific stat scaling
            switch (this.weaponType) {
                case 'sword':
                    totalDamage += character.stats.strength * 0.5;
                    break;
                case 'bow':
                    totalDamage += character.stats.dexterity * 0.4;
                    break;
                case 'staff':
                    totalDamage += character.stats.intelligence * 0.3;
                    break;
                case 'dagger':
                    totalDamage += character.stats.dexterity * 0.3;
                    break;
            }
        }

        return Math.floor(totalDamage);
    }

    // Check critical hit
    isCritical() {
        return Math.random() < this.criticalChance;
    }
}

// RPG Armor with stat bonuses and resistances
export class RPGArmor extends Armor {
    constructor(id, name, description, defense, armorType, slot, rarity, value, statBonuses = {}) {
        super(id, name, description, defense, armorType, slot, rarity, value);

        this.statBonuses = statBonuses; // Additional stat bonuses
        this.elementalResistances = {}; // { fire: 0.1, ice: 0.05 } etc.
        this.statusResistances = {}; // { poison: 0.2, sleep: 0.1 } etc.
        this.weight = this.calculateWeight();
    }

    calculateWeight() {
        const baseWeights = {
            'light': 2,
            'medium': 4,
            'heavy': 6
        };
        return baseWeights[this.armorType] || 3;
    }

    // Get total defense including bonuses
    getTotalDefense(character = null) {
        let totalDefense = this.defense * this.quality;

        // Add character stat bonuses for armor
        if (character) {
            switch (this.armorType) {
                case 'light':
                    totalDefense += character.stats.dexterity * 0.2;
                    break;
                case 'medium':
                    totalDefense += character.stats.constitution * 0.3;
                    break;
                case 'heavy':
                    totalDefense += character.stats.strength * 0.4;
                    break;
            }
        }

        return Math.floor(totalDefense);
    }

    // Get elemental resistance for specific element
    getElementalResistance(element) {
        return this.elementalResistances[element] || 0;
    }

    // Get status resistance for specific status
    getStatusResistance(status) {
        return this.statusResistances[status] || 0;
    }
}

// RPG Consumable with effects
export class RPGConsumable extends Consumable {
    constructor(id, name, description, effect, maxUses, rarity, value, effectType = 'immediate') {
        super(id, name, description, effect, maxUses, rarity, value);

        this.effectType = effectType; // 'immediate', 'over_time', 'passive'
        this.duration = 0; // For over_time effects
        this.cooldown = 0; // Cooldown between uses
        this.lastUsed = 0; // Timestamp of last use
        this.targetType = 'self'; // 'self', 'ally', 'enemy', 'area'
    }

    use(character, target = null) {
        // Check cooldown
        if (Date.now() - this.lastUsed < this.cooldown * 1000) {
            return { success: false, reason: 'cooldown' };
        }

        if (this.quantity <= 0) {
            return { success: false, reason: 'no_quantity' };
        }

        // Determine target
        let actualTarget = target;
        if (this.targetType === 'self' || !target) {
            actualTarget = character;
        }

        // Apply effect based on type
        try {
            switch (this.effectType) {
                case 'immediate':
                    this.applyImmediateEffect(actualTarget);
                    break;
                case 'over_time':
                    this.applyOverTimeEffect(actualTarget);
                    break;
                case 'passive':
                    this.applyPassiveEffect(actualTarget);
                    break;
            }

            this.quantity--;
            this.lastUsed = Date.now();

            return { success: true, target: actualTarget };
        } catch (error) {
            console.error(`Failed to use consumable ${this.id}:`, error);
            return { success: false, reason: 'error', error: error.message };
        }
    }

    applyImmediateEffect(target) {
        if (typeof this.effect === 'function') {
            this.effect(target);
        }
    }

    applyOverTimeEffect(target) {
        // This would integrate with a status effect system
        if (typeof this.effect === 'function') {
            // Apply initial effect
            this.effect(target);

            // Schedule duration effect (would need status effect system)
            if (this.duration > 0) {
                target.addStatusEffect({
                    type: this.id,
                    duration: this.duration,
                    effect: this.effect,
                    source: this
                });
            }
        }
    }

    applyPassiveEffect(target) {
        // Apply persistent effect (would need buff system)
        if (typeof this.effect === 'function') {
            target.addPassiveEffect({
                type: this.id,
                effect: this.effect,
                source: this
            });
        }
    }
}

// Material Item for crafting
export class Material extends RPGItem {
    constructor(id, name, description, rarity, value, stackable = true, maxStack = 99) {
        super(id, name, description, 'material', rarity, value, stackable, maxStack);
        this.craftingValue = value * 0.8; // Materials sell for less
    }
}

// Accessory Item
export class Accessory extends Equipment {
    constructor(id, name, description, slot, statBonuses, rarity, value) {
        super(id, name, description, slot, statBonuses, rarity, value, false, 1);
        this.accessoryType = slot; // 'ring', 'amulet', 'earring', etc.
    }
}

// Item Database Manager
export class ItemDatabase {
    constructor() {
        this.items = new Map();
        this.recipes = new Map();
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Weapons
        this.addItem(new RPGWeapon('iron_sword', 'Iron Sword', 'A sturdy iron sword.', 25, 'sword', 'common', 100, { strength: 2 }));
        this.addItem(new RPGWeapon('steel_sword', 'Steel Sword', 'A sharp steel sword.', 35, 'sword', 'rare', 300, { strength: 3 }));
        this.addItem(new RPGWeapon('fire_sword', 'Flaming Sword', 'A sword wreathed in flames.', 40, 'sword', 'epic', 600, { strength: 4 }, 'fire', 10));
        this.addItem(new RPGWeapon('wooden_bow', 'Wooden Bow', 'A simple wooden bow.', 20, 'bow', 'common', 80, { dexterity: 2 }));
        this.addItem(new RPGWeapon('elven_bow', 'Elven Bow', 'A finely crafted elven bow.', 30, 'bow', 'rare', 400, { dexterity: 4 }));

        // Armor
        this.addItem(new RPGArmor('leather_armor', 'Leather Armor', 'Basic leather protection.', 15, 'light', 'chest', 'common', 75, { dexterity: 1 }));
        this.addItem(new RPGArmor('chain_mail', 'Chain Mail', 'Heavy chain armor.', 25, 'heavy', 'chest', 'common', 150, { strength: 2 }));
        this.addItem(new RPGArmor('plate_armor', 'Plate Armor', 'Impenetrable plate armor.', 35, 'heavy', 'chest', 'rare', 400, { strength: 3, constitution: 2 }));
        this.addItem(new RPGArmor('iron_helmet', 'Iron Helmet', 'Protective iron helmet.', 10, 'heavy', 'helmet', 'common', 50));
        this.addItem(new RPGArmor('leather_boots', 'Leather Boots', 'Comfortable leather boots.', 8, 'light', 'boots', 'common', 40));

        // Consumables
        this.addItem(new RPGConsumable('health_potion', 'Health Potion', 'Restores 50 HP.', (character) => character.heal(50), 10, 'common', 25));
        this.addItem(new RPGConsumable('mana_potion', 'Mana Potion', 'Restores 30 MP.', (character) => character.restoreMana(30), 10, 'common', 30));
        this.addItem(new RPGConsumable('strength_elixir', 'Strength Elixir', 'Temporarily boosts strength.', (character) => character.addStatusEffect('strength_boost', 5, 300), 5, 'rare', 100, 'over_time', 300));
        this.addItem(new RPGConsumable('antidote', 'Antidote', 'Cures poison.', (character) => character.cureStatus('poison'), 5, 'common', 20));

        // Materials
        this.addItem(new Material('iron_ore', 'Iron Ore', 'Raw iron ore.', 'common', 10));
        this.addItem(new Material('steel_ingot', 'Steel Ingot', 'Refined steel.', 'common', 25));
        this.addItem(new Material('leather', 'Leather', 'Tanned animal hide.', 'common', 15));

        // Accessories
        this.addItem(new Accessory('strength_ring', 'Ring of Strength', 'ring', { strength: 3 }, 'rare', 200));
        this.addItem(new Accessory('health_amulet', 'Amulet of Health', 'amulet', { maxHealth: 50 }, 'rare', 250));
    }

    addItem(item) {
        this.items.set(item.id, item);
    }

    getItem(id) {
        return this.items.get(id);
    }

    getItemsByCategory(category) {
        return Array.from(this.items.values()).filter(item => item.category === category);
    }

    getItemsByRarity(rarity) {
        return Array.from(this.items.values()).filter(item => item.rarity === rarity);
    }

    // Random item generation based on rarity weights
    generateRandomItem(level = 1, category = null) {
        const rarityWeights = {
            common: 60,
            rare: 25,
            epic: 10,
            legendary: 5
        };

        // Adjust weights based on level
        if (level >= 5) rarityWeights.rare += 10;
        if (level >= 10) rarityWeights.epic += 5;
        if (level >= 15) rarityWeights.legendary += 5;

        // Generate rarity
        const random = Math.random() * 100;
        let cumulativeWeight = 0;
        let selectedRarity = 'common';

        for (const [rarity, weight] of Object.entries(rarityWeights)) {
            cumulativeWeight += weight;
            if (random <= cumulativeWeight) {
                selectedRarity = rarity;
                break;
            }
        }

        // Filter items by rarity and category
        let availableItems = Array.from(this.items.values()).filter(item => item.rarity === selectedRarity);
        if (category) {
            availableItems = availableItems.filter(item => item.category === category);
        }

        if (availableItems.length === 0) {
            // Fallback to any item of selected rarity
            availableItems = Array.from(this.items.values()).filter(item => item.rarity === selectedRarity);
        }

        if (availableItems.length === 0) return null;

        const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        return randomItem.clone();
    }
}

// Export singleton instance
export const itemDatabase = new ItemDatabase();