// RPG Inventory Manager
// Extends base InventoryManager with RPG-specific features and character integration

import { InventoryManager } from '../../../game-engine/src/core/InventoryManager.js';
import { ValidationHelpers } from '../../../game-engine/src/core/ValidationHelpers.js';
import { itemDatabase } from './RPGItemDatabase.js';

export class RPGInventoryManager extends InventoryManager {
    constructor(capacity = 50, character = null) {
        super(capacity);
        this.character = character; // Reference to owning character
        this.maxWeight = capacity * 15; // RPG-specific weight system
        this.merchantInventory = null; // For shop interactions
        this.equipmentSlots = {
            helmet: null,
            chest: null,
            weapon: null,
            boots: null,
            gloves: null,
            amulet: null,
            ring1: null,
            ring2: null
        };
    }

    // Enhanced addItem with RPG validation
    addItem(item, slot = null) {
        ValidationHelpers.validateObject(item, ['id', 'name'], 'item');

        // Check weight limit
        const itemWeight = this.calculateItemWeight(item);
        if (this.currentWeight + itemWeight > this.maxWeight) {
            return { success: false, reason: 'weight_limit_exceeded', weight: itemWeight, maxWeight: this.maxWeight };
        }

        // Check level requirements for equipment
        if (item instanceof Equipment && this.character) {
            if (!item.canUse(this.character)) {
                return { success: false, reason: 'level_requirement_not_met', requiredLevel: item.levelRequirement };
            }
        }

        return super.addItem(item, slot);
    }

    // Enhanced equipItem with RPG validation
    equipItem(slot, equipmentSlot) {
        if (!this.inventory.has(slot)) {
            return { success: false, reason: 'item_not_found' };
        }

        const item = this.inventory.get(slot);
        if (!(item instanceof Equipment)) {
            return { success: false, reason: 'not_equipment' };
        }

        // Check level and job requirements
        if (this.character && !item.canUse(this.character)) {
            return {
                success: false,
                reason: item.levelRequirement > this.character.level ? 'level_requirement_not_met' : 'job_restriction',
                requiredLevel: item.levelRequirement,
                restrictedJobs: item.jobRestrictions
            };
        }

        // Check slot compatibility
        if (!this.canEquipInSlot(item, equipmentSlot)) {
            return { success: false, reason: 'wrong_slot_type' };
        }

        try {
            // Handle existing equipment
            const existingItem = this.equipmentSlots[equipmentSlot];
            if (existingItem) {
                const freeSlot = this.findEmptySlot();
                if (freeSlot === null) {
                    return { success: false, reason: 'no_inventory_space' };
                }
                this.inventory.set(freeSlot, existingItem);
            }

            // Equip new item
            this.equipmentSlots[equipmentSlot] = item;
            this.inventory.delete(slot);
            this.updateWeight();

            // Update character stats if character reference exists
            if (this.character) {
                this.updateCharacterStats();
            }

            return { success: true, equippedItem: item, unequippedItem: existingItem };

        } catch (error) {
            console.error(`Failed to equip item '${item.name}':`, error);
            return { success: false, reason: 'error', error: error.message };
        }
    }

    // Enhanced unequipItem
    unequipItem(equipmentSlot, toSlot = null) {
        if (!this.equipmentSlots[equipmentSlot]) {
            return { success: false, reason: 'no_item_equipped' };
        }

        const item = this.equipmentSlots[equipmentSlot];
        let targetSlot = toSlot || this.findEmptySlot();

        if (targetSlot !== null) {
            this.inventory.set(targetSlot, item);
            this.equipmentSlots[equipmentSlot] = null;
            this.updateWeight();

            // Update character stats
            if (this.character) {
                this.updateCharacterStats();
            }

            return { success: true, unequippedItem: item };
        }

        return { success: false, reason: 'no_inventory_space' };
    }

    // Check if item can be equipped in slot
    canEquipInSlot(item, equipmentSlot) {
        const slotCompatibility = {
            weapon: ['weapon'],
            helmet: ['helmet', 'hat'],
            chest: ['chest', 'shirt', 'robe'],
            boots: ['boots', 'shoes'],
            gloves: ['gloves', 'gauntlets'],
            amulet: ['amulet', 'necklace'],
            ring1: ['ring'],
            ring2: ['ring']
        };

        return slotCompatibility[equipmentSlot]?.includes(item.slot) || false;
    }

    // Update character stats based on equipment
    updateCharacterStats() {
        if (!this.character) return;

        // Reset equipment bonuses
        this.character.equipmentBonuses = {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0,
            luck: 0,
            maxHealth: 0,
            maxMana: 0,
            attack: 0,
            defense: 0,
            criticalChance: 0,
            criticalMultiplier: 1.0
        };

        // Calculate bonuses from equipped items
        for (const [slot, item] of Object.entries(this.equipmentSlots)) {
            if (item && item.statBonuses) {
                for (const [stat, bonus] of Object.entries(item.statBonuses)) {
                    this.character.equipmentBonuses[stat] += bonus * item.quality;
                }
            }

            // Weapon-specific bonuses
            if (item instanceof RPGWeapon && slot === 'weapon') {
                this.character.equipmentBonuses.attack += item.getTotalDamage(this.character) - item.damage;
                this.character.equipmentBonuses.criticalChance += item.criticalChance;
                this.character.equipmentBonuses.criticalMultiplier *= item.criticalMultiplier;
            }

            // Armor-specific bonuses
            if (item instanceof RPGArmor) {
                this.character.equipmentBonuses.defense += item.getTotalDefense(this.character) - item.defense;
            }
        }

        // Recalculate character stats
        this.character.recalculateStats();
    }

    // Get equipment stats with detailed breakdown
    getEquipmentStats() {
        const stats = {
            attack: 0,
            defense: 0,
            statBonuses: {
                strength: 0,
                dexterity: 0,
                constitution: 0,
                intelligence: 0,
                wisdom: 0,
                charisma: 0,
                luck: 0
            },
            elementalResistances: {},
            statusResistances: {},
            weight: 0
        };

        for (const item of Object.values(this.equipmentSlots)) {
            if (item) {
                // Base stats
                if (item instanceof RPGWeapon) {
                    stats.attack += item.getTotalDamage(this.character);
                }
                if (item instanceof RPGArmor) {
                    stats.defense += item.getTotalDefense(this.character);
                }

                // Stat bonuses
                if (item.statBonuses) {
                    for (const [stat, bonus] of Object.entries(item.statBonuses)) {
                        stats.statBonuses[stat] += bonus * item.quality;
                    }
                }

                // Elemental and status resistances
                if (item instanceof RPGArmor) {
                    for (const [element, resistance] of Object.entries(item.elementalResistances)) {
                        stats.elementalResistances[element] = (stats.elementalResistances[element] || 0) + resistance;
                    }
                    for (const [status, resistance] of Object.entries(item.statusResistances)) {
                        stats.statusResistances[status] = (stats.statusResistances[status] || 0) + resistance;
                    }
                }

                // Weight
                stats.weight += item.weight || 1;
            }
        }

        return stats;
    }

    // Enhanced weight calculation for RPG items
    calculateItemWeight(item) {
        let baseWeight = 1;

        if (item instanceof RPGWeapon) {
            const weaponWeights = { sword: 3, bow: 2, staff: 2, dagger: 1 };
            baseWeight = weaponWeights[item.weaponType] || 2;
        } else if (item instanceof RPGArmor) {
            baseWeight = item.weight || 4;
        } else if (item instanceof RPGConsumable) {
            baseWeight = 0.5;
        } else if (item instanceof Material) {
            baseWeight = 1;
        }

        return baseWeight * item.quantity * (1 / item.quality);
    }

    // Use consumable item with character integration
    useConsumable(slot) {
        if (!this.inventory.has(slot)) {
            return { success: false, reason: 'item_not_found' };
        }

        const item = this.inventory.get(slot);
        if (!(item instanceof RPGConsumable)) {
            return { success: false, reason: 'not_consumable' };
        }

        if (!this.character) {
            return { success: false, reason: 'no_character' };
        }

        const result = item.use(this.character);

        if (result.success) {
            // Remove item if quantity is 0
            if (item.quantity <= 0) {
                this.inventory.delete(slot);
            }
            this.updateWeight();
        }

        return result;
    }

    // Enhance equipment with RPG mechanics
    enhanceEquipment(slot, enhancementLevel = 1) {
        if (!this.inventory.has(slot) && !this.equipmentSlots[slot]) {
            return { success: false, reason: 'item_not_found' };
        }

        let item;
        let isEquipped = false;

        if (this.inventory.has(slot)) {
            item = this.inventory.get(slot);
        } else {
            item = this.equipmentSlots[slot];
            isEquipped = true;
        }

        if (!(item instanceof Equipment)) {
            return { success: false, reason: 'not_equipment' };
        }

        // Check enhancement requirements
        const maxEnhancement = this.getMaxEnhancementLevel(item);
        if (item.quality >= maxEnhancement) {
            return { success: false, reason: 'max_enhancement_reached' };
        }

        // Calculate enhancement cost and success rate
        const cost = this.calculateEnhancementCost(item, enhancementLevel);
        const successRate = this.calculateEnhancementSuccessRate(item, enhancementLevel);

        if (this.character && this.character.gold < cost) {
            return { success: false, reason: 'insufficient_gold', required: cost };
        }

        // Attempt enhancement
        const success = Math.random() < successRate;

        if (success) {
            const oldQuality = item.quality;
            item.enhance(enhancementLevel);

            if (this.character) {
                this.character.gold -= cost;
                this.updateCharacterStats();
            }

            return {
                success: true,
                newQuality: item.quality,
                enhancementGained: item.quality - oldQuality,
                cost: cost
            };
        } else {
            // Enhancement failure - item might break or lose quality
            const breakChance = 0.1; // 10% chance to break
            if (Math.random() < breakChance) {
                // Item breaks
                if (isEquipped) {
                    this.equipmentSlots[slot] = null;
                } else {
                    this.inventory.delete(slot);
                }
                this.updateWeight();

                if (this.character) {
                    this.character.gold -= cost;
                    this.updateCharacterStats();
                }

                return { success: false, reason: 'item_broken', cost: cost };
            } else {
                // Item loses some quality
                item.quality = Math.max(0.5, item.quality - 0.1);

                if (this.character) {
                    this.character.gold -= cost;
                    this.updateCharacterStats();
                }

                return { success: false, reason: 'enhancement_failed', cost: cost, newQuality: item.quality };
            }
        }
    }

    getMaxEnhancementLevel(item) {
        const rarityMultipliers = { common: 5, rare: 8, epic: 10, legendary: 15 };
        return rarityMultipliers[item.rarity] || 5;
    }

    calculateEnhancementCost(item, level) {
        const baseCost = item.value * 0.5;
        const rarityMultipliers = { common: 1, rare: 2, epic: 4, legendary: 8 };
        const multiplier = rarityMultipliers[item.rarity] || 1;
        return Math.floor(baseCost * multiplier * Math.pow(1.5, item.quality - 1) * level);
    }

    calculateEnhancementSuccessRate(item, level) {
        const baseRate = 0.8; // 80% base success
        const qualityPenalty = (item.quality - 1) * 0.1; // 10% penalty per enhancement level
        const levelPenalty = (level - 1) * 0.2; // 20% penalty per enhancement level
        return Math.max(0.1, baseRate - qualityPenalty - levelPenalty);
    }

    // Shop system integration
    setMerchantInventory(merchantInventory) {
        this.merchantInventory = merchantInventory;
    }

    // Buy from merchant
    buyFromMerchant(itemId, quantity = 1) {
        if (!this.merchantInventory) {
            return { success: false, reason: 'no_merchant' };
        }

        const merchantItem = this.merchantInventory.getItemById(itemId);
        if (!merchantItem || merchantItem.quantity < quantity) {
            return { success: false, reason: 'item_not_available' };
        }

        const totalCost = merchantItem.value * quantity;
        if (this.character && this.character.gold < totalCost) {
            return { success: false, reason: 'insufficient_gold', required: totalCost };
        }

        // Create item to add
        const itemToBuy = merchantItem.clone(quantity);

        // Add to inventory
        const addResult = this.addItem(itemToBuy);
        if (!addResult.success) {
            return addResult;
        }

        // Remove from merchant
        this.merchantInventory.removeItemById(itemId, quantity);

        // Deduct gold
        if (this.character) {
            this.character.gold -= totalCost;
        }

        return {
            success: true,
            item: itemToBuy,
            cost: totalCost
        };
    }

    // Sell to merchant
    sellToMerchant(slot, quantity = 1) {
        if (!this.inventory.has(slot)) {
            return { success: false, reason: 'item_not_found' };
        }

        if (!this.merchantInventory) {
            return { success: false, reason: 'no_merchant' };
        }

        const item = this.inventory.get(slot);
        const sellQuantity = Math.min(quantity, item.quantity);
        const totalValue = Math.floor(item.getTotalValue() * 0.6); // Merchants buy for 60% of value

        // Add to merchant inventory
        const merchantAddResult = this.merchantInventory.addItem(item.clone(sellQuantity));
        if (!merchantAddResult.success) {
            return { success: false, reason: 'merchant_inventory_full' };
        }

        // Remove from player inventory
        if (item.quantity <= sellQuantity) {
            this.inventory.delete(slot);
        } else {
            item.quantity -= sellQuantity;
        }

        this.updateWeight();

        // Add gold to character
        if (this.character) {
            this.character.gold += totalValue;
        }

        return {
            success: true,
            item: item,
            quantity: sellQuantity,
            value: totalValue
        };
    }

    // Treasure chest and random item discovery
    generateTreasureChest(level = 1, quality = 'common') {
        const chest = {
            items: [],
            gold: 0,
            quality: quality
        };

        // Determine number of items based on quality
        const itemCounts = { common: 1, rare: 2, epic: 3, legendary: 4 };
        const numItems = itemCounts[quality] || 1;

        // Generate gold
        const goldRanges = {
            common: [10, 50],
            rare: [50, 200],
            epic: [200, 500],
            legendary: [500, 2000]
        };
        const [minGold, maxGold] = goldRanges[quality] || [10, 50];
        chest.gold = Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;

        // Generate items
        for (let i = 0; i < numItems; i++) {
            const item = itemDatabase.generateRandomItem(level);
            if (item) {
                // Chance to enhance items in better chests
                if (quality !== 'common' && Math.random() < 0.3) {
                    item.enhance(Math.floor(Math.random() * 3) + 1);
                }
                chest.items.push(item);
            }
        }

        return chest;
    }

    // Open treasure chest
    openTreasureChest(chest) {
        const results = {
            items: [],
            gold: chest.gold,
            success: true
        };

        // Add gold
        if (this.character) {
            this.character.gold += chest.gold;
        }

        // Add items
        for (const item of chest.items) {
            const addResult = this.addItem(item);
            if (addResult.success) {
                results.items.push(item);
            } else {
                // Couldn't add item - maybe drop it or handle differently
                console.warn(`Could not add item ${item.name} from treasure chest:`, addResult.reason);
            }
        }

        return results;
    }

    // Get inventory statistics with RPG details
    getRPGStats() {
        const baseStats = this.getStats();
        const equipmentStats = this.getEquipmentStats();

        return {
            ...baseStats,
            equipmentStats: equipmentStats,
            totalAttack: equipmentStats.attack,
            totalDefense: equipmentStats.defense,
            totalWeight: this.currentWeight,
            maxWeight: this.maxWeight,
            weightPercentage: (this.currentWeight / this.maxWeight) * 100,
            encumbranceLevel: this.getEncumbranceLevel()
        };
    }

    getEncumbranceLevel() {
        const ratio = this.currentWeight / this.maxWeight;
        if (ratio < 0.5) return 'light';
        if (ratio < 0.8) return 'moderate';
        if (ratio < 1.0) return 'heavy';
        return 'overloaded';
    }

    // Save/load integration
    toJSON() {
        return {
            capacity: this.capacity,
            inventory: Array.from(this.inventory.entries()),
            equipmentSlots: this.equipmentSlots,
            currentWeight: this.currentWeight,
            maxWeight: this.maxWeight
        };
    }

    fromJSON(data) {
        this.capacity = data.capacity;
        this.inventory = new Map(data.inventory);
        this.equipmentSlots = data.equipmentSlots;
        this.currentWeight = data.currentWeight || 0;
        this.maxWeight = data.maxWeight || this.capacity * 15;
    }
}