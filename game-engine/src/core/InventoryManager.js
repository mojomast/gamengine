// Standalone Inventory Management Module
// Exports: Item, Equipment, Weapon, Armor, Consumable, InventoryManager, Recipe

import { ValidationHelpers, ValidationError } from './ValidationHelpers.js';

// Base Item class
class Item {
  constructor(id, name, description, rarity = 'common', value = 0, stackable = false, maxStack = 1) {
    // Validate parameters
    ValidationHelpers.validateType(id, 'string', 'id');
    ValidationHelpers.validateType(name, 'string', 'name');
    ValidationHelpers.validateType(description, 'string', 'description');
    ValidationHelpers.validateType(rarity, 'string', 'rarity');
    ValidationHelpers.validateRange(value, 0, Infinity, 'value');
    ValidationHelpers.validateBoolean(stackable, 'stackable');
    ValidationHelpers.validatePositiveNumber(maxStack, 'maxStack');

    this.id = id;
    this.name = name;
    this.description = description;
    this.rarity = rarity; // common, rare, epic, legendary
    this.value = value;
    this.stackable = stackable;
    this.maxStack = maxStack;
    this.quantity = 1;
    this.quality = 1.0; // Enhancement multiplier
  }

  // Enhancement method
  enhance(level) {
    this.quality += level * 0.1;
    this.value = Math.floor(this.value * (1 + level * 0.2));
  }

  // Clone for stacking
  clone(quantity = 1) {
    const item = new Item(this.id, this.name, this.description, this.rarity, this.value, this.stackable, this.maxStack);
    item.quantity = quantity;
    item.quality = this.quality;
    return item;
  }
}

// Equipment subclass
class Equipment extends Item {
  constructor(id, name, description, slot, stats = {}, rarity, value, stackable = false, maxStack = 1) {
    // Validate additional parameters
    ValidationHelpers.validateType(slot, 'string', 'slot');
    ValidationHelpers.validateObject(stats, [], 'stats');

    super(id, name, description, rarity, value, stackable, maxStack);
    this.slot = slot; // 'helmet', 'chest', 'weapon', etc.
    this.stats = stats; // Object like { attack: 5, defense: 10 }
  }
}

// Weapon subclass
class Weapon extends Equipment {
  constructor(id, name, description, damage, weaponType, rarity, value) {
    // Validate additional parameters
    ValidationHelpers.validatePositiveNumber(damage, 'damage');
    ValidationHelpers.validateType(weaponType, 'string', 'weaponType');

    super(id, name, description, 'weapon', { attack: damage }, rarity, value, false, 1);
    this.damage = damage;
    this.weaponType = weaponType; // 'sword', 'bow', etc.
  }
}

// Armor subclass
class Armor extends Equipment {
  constructor(id, name, description, defense, armorType, slot, rarity, value) {
    // Validate additional parameters
    ValidationHelpers.validatePositiveNumber(defense, 'defense');
    ValidationHelpers.validateType(armorType, 'string', 'armorType');

    super(id, name, description, slot, { defense: defense }, rarity, value, false, 1);
    this.defense = defense;
    this.armorType = armorType; // 'light', 'heavy', etc.
  }
}

// Consumable subclass
class Consumable extends Item {
  constructor(id, name, description, effect, maxUses, rarity, value) {
    // Validate additional parameters
    if (typeof effect === 'function') {
      ValidationHelpers.validateFunction(effect, 'effect');
    } else {
      ValidationHelpers.validateObject(effect, [], 'effect');
    }
    ValidationHelpers.validatePositiveNumber(maxUses, 'maxUses');

    super(id, name, description, rarity, value, true, maxUses);
    this.effect = effect; // Function or object describing the effect
    this.maxUses = maxUses;
  }

  use(character) {
    if (this.quantity > 0) {
      // Apply effect to character
      if (typeof this.effect === 'function') {
        this.effect(character);
      }
      this.quantity--;
      return true;
    }
    return false;
  }
}

// Recipe class for crafting
class Recipe {
  constructor(id, name, ingredients, result, requirements = {}) {
    // Validate parameters
    ValidationHelpers.validateType(id, 'string', 'id');
    ValidationHelpers.validateType(name, 'string', 'name');
    ValidationHelpers.validateArray(ingredients, 1, Infinity, 'ingredients');
    ValidationHelpers.validateObject(result, ['id'], 'result');
    ValidationHelpers.validateObject(requirements, [], 'requirements');

    this.id = id;
    this.name = name;
    this.ingredients = ingredients; // Array of { itemId, quantity }
    this.result = result; // Item to create
    this.requirements = requirements; // e.g., { level: 5, skill: 'smithing' }
  }
}

// InventoryManager class
class InventoryManager {
  constructor(capacity = 50) {
    // Validate parameter
    ValidationHelpers.validatePositiveNumber(capacity, 'capacity');

    this.capacity = capacity;
    this.inventory = new Map(); // slot -> item
    this.equipmentSlots = {
      helmet: null,
      chest: null,
      weapon: null,
      boots: null,
      gloves: null,
      amulet: null
    };
    this.recipes = new Map(); // id -> Recipe
  }

  // Add item to inventory
  addItem(item, slot = null) {
    // Validate parameters
    ValidationHelpers.validateObject(item, ['id', 'name'], 'item');
    if (slot !== null) {
      ValidationHelpers.validateRange(slot, 0, this.capacity - 1, 'slot');
    }

    if (this.inventory.size >= this.capacity && !slot) return false;

    if (item.stackable) {
      // Find existing stack
      for (const [s, i] of this.inventory) {
        if (i.id === item.id && i.quantity < i.maxStack) {
          const canAdd = Math.min(item.quantity, i.maxStack - i.quantity);
          i.quantity += canAdd;
          item.quantity -= canAdd;
          if (item.quantity <= 0) return true;
        }
      }
    }

    // Add to new slot
    let targetSlot = slot || this.findEmptySlot();
    if (targetSlot !== null) {
      this.inventory.set(targetSlot, item);
      return true;
    }
    return false;
  }

  // Remove item from inventory
  removeItem(slot, quantity = 1) {
    if (!this.inventory.has(slot)) return null;
    const item = this.inventory.get(slot);
    if (item.quantity <= quantity) {
      this.inventory.delete(slot);
    } else {
      item.quantity -= quantity;
      return item.clone(quantity);
    }
    return item;
  }

  // Move item between slots
  moveItem(fromSlot, toSlot) {
    if (!this.inventory.has(fromSlot)) return false;
    if (this.inventory.has(toSlot)) return false; // Slot occupied
    const item = this.inventory.get(fromSlot);
    this.inventory.delete(fromSlot);
    this.inventory.set(toSlot, item);
    return true;
  }

  // Find empty slot
  findEmptySlot() {
    for (let i = 0; i < this.capacity; i++) {
      if (!this.inventory.has(i)) return i;
    }
    return null;
  }

  // Equip item
  equipItem(slot, equipmentSlot) {
    if (!this.inventory.has(slot) || !(this.inventory.get(slot) instanceof Equipment)) return false;
    const item = this.inventory.get(slot);
    if (this.equipmentSlots[equipmentSlot]) {
      // Swap
      const oldItem = this.equipmentSlots[equipmentSlot];
      this.equipmentSlots[equipmentSlot] = item;
      this.inventory.set(slot, oldItem);
    } else {
      this.equipmentSlots[equipmentSlot] = item;
      this.inventory.delete(slot);
    }
    return true;
  }

  // Unequip item
  unequipItem(equipmentSlot, toSlot = null) {
    if (!this.equipmentSlots[equipmentSlot]) return false;
    const item = this.equipmentSlots[equipmentSlot];
    let targetSlot = toSlot || this.findEmptySlot();
    if (targetSlot !== null) {
      this.inventory.set(targetSlot, item);
      this.equipmentSlots[equipmentSlot] = null;
      return true;
    }
    return false;
  }

  // Calculate total stats from equipment
  getEquipmentStats() {
    let totalStats = { attack: 0, defense: 0 };
    for (const slot in this.equipmentSlots) {
      const item = this.equipmentSlots[slot];
      if (item) {
        for (const stat in item.stats) {
          totalStats[stat] = (totalStats[stat] || 0) + item.stats[stat] * item.quality;
        }
      }
    }
    return totalStats;
  }

  // Crafting
  addRecipe(recipe) {
    this.recipes.set(recipe.id, recipe);
  }

  craft(recipeId, character) {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return null;

    // Check requirements
    if (recipe.requirements.level && character.level < recipe.requirements.level) return null;

    // Check ingredients
    for (const ing of recipe.ingredients) {
      const totalQty = this.getItemQuantity(ing.itemId);
      if (totalQty < ing.quantity) return null;
    }

    // Remove ingredients
    for (const ing of recipe.ingredients) {
      this.removeItemQuantity(ing.itemId, ing.quantity);
    }

    // Add result
    this.addItem(recipe.result.clone());
    return recipe.result;
  }

  // Helper to get total quantity of item
  getItemQuantity(itemId) {
    let total = 0;
    for (const item of this.inventory.values()) {
      if (item.id === itemId) total += item.quantity;
    }
    return total;
  }

  // Remove specific quantity
  removeItemQuantity(itemId, quantity) {
    for (const [slot, item] of this.inventory) {
      if (item.id === itemId) {
        if (item.quantity >= quantity) {
          item.quantity -= quantity;
          if (item.quantity <= 0) this.inventory.delete(slot);
          return;
        } else {
          quantity -= item.quantity;
          this.inventory.delete(slot);
        }
      }
    }
  }

  // Merchant trading
  buy(item, merchantInventory, character) {
    if (item.value > character.gold) return false;
    if (merchantInventory.removeItem(item.id, 1)) {
      this.addItem(item.clone());
      character.gold -= item.value;
      return true;
    }
    return false;
  }

  sell(itemSlot, merchantInventory, character) {
    const item = this.inventory.get(itemSlot);
    if (!item) return false;
    merchantInventory.addItem(item.clone());
    this.removeItem(itemSlot);
    character.gold += item.value;
    return true;
  }

  // UI integration: Get item at slot
  getItemAtSlot(slot) {
    return this.inventory.get(slot) || null;
  }

  // UI integration: Get equipment at slot
  getEquipmentAtSlot(slot) {
    return this.equipmentSlots[slot] || null;
  }

  // For drag-and-drop: Swap items between inventory slots
  swapItems(slot1, slot2) {
    const item1 = this.inventory.get(slot1);
    const item2 = this.inventory.get(slot2);
    if (item1) this.inventory.set(slot2, item1);
    else this.inventory.delete(slot2);
    if (item2) this.inventory.set(slot1, item2);
    else this.inventory.delete(slot1);
  }
}

// Export all classes
export { Item, Equipment, Weapon, Armor, Consumable, InventoryManager, Recipe };