# 🎒 RPG Item and Equipment System Documentation

## Overview

The RPG Item and Equipment System extends the base Inventory Management System with RPG-specific mechanics including stat bonuses, equipment enhancement, rarity systems, and comprehensive item management. The system integrates seamlessly with the character system and provides tools for content creation.

**Implementation Status**: ✅ **FULLY IMPLEMENTED** - Version 1.0.0
**Key Features**: RPG Item Classes, Equipment System, Enhancement Mechanics, Shop System, Item Creation Tools

## Core Architecture

### Item Categories and Classes

The system extends the base `Item` class with RPG-specific categories:

#### `RPGItem` - Base RPG Item Class
```javascript
class RPGItem extends Item {
    constructor(id, name, description, category, rarity = 'common', value = 0, stackable = false, maxStack = 1) {
        // Extends base Item with RPG properties
        this.category = category; // 'weapon', 'armor', 'consumable', 'material', 'accessory'
        this.levelRequirement = 1;
        this.jobRestrictions = [];
        this.flavorText = '';
    }

    canUse(character) {
        // Level and job requirement validation
    }
}
```

#### `RPGWeapon` - Enhanced Weapon Class
```javascript
class RPGWeapon extends Weapon {
    constructor(id, name, description, damage, weaponType, rarity, value) {
        this.damage = damage;
        this.weaponType = weaponType; // 'sword', 'bow', 'staff', 'dagger', etc.
        this.elementalType = null; // 'fire', 'ice', 'lightning', etc.
        this.elementalDamage = 0;
        this.criticalChance = 0.05;
        this.criticalMultiplier = 1.5;
        this.statBonuses = {}; // Additional stat bonuses
    }

    getTotalDamage(character) {
        // Calculates damage including stat bonuses and elemental effects
    }
}
```

#### `RPGArmor` - Enhanced Armor Class
```javascript
class RPGArmor extends Armor {
    constructor(id, name, description, defense, armorType, slot, rarity, value) {
        this.defense = defense;
        this.armorType = armorType; // 'light', 'medium', 'heavy'
        this.slot = slot; // Equipment slot
        this.statBonuses = {};
        this.elementalResistances = {}; // { fire: 0.1, ice: 0.05 }
        this.statusResistances = {}; // { poison: 0.2, sleep: 0.1 }
        this.weight = this.calculateWeight();
    }

    getTotalDefense(character) {
        // Defense calculation with character stat bonuses
    }
}
```

#### `RPGConsumable` - Enhanced Consumable Class
```javascript
class RPGConsumable extends Consumable {
    constructor(id, name, description, effect, maxUses, rarity, value) {
        this.effect = effect; // Function or object
        this.effectType = 'immediate'; // 'immediate', 'over_time', 'passive'
        this.duration = 0;
        this.cooldown = 0;
        this.targetType = 'self'; // 'self', 'ally', 'enemy', 'area'
    }

    use(character, target) {
        // Enhanced usage with targeting and effect types
    }
}
```

### Equipment System

#### Equipment Slots
The system supports 8 equipment slots:
- `helmet` - Head protection
- `chest` - Body armor
- `weapon` - Main weapon
- `boots` - Footwear
- `gloves` - Hand protection
- `amulet` - Neck accessory
- `ring1`, `ring2` - Finger accessories

#### Equipment Stats Integration
```javascript
class RPGInventoryManager extends InventoryManager {
    updateCharacterStats() {
        // Calculates total equipment bonuses and updates character
        this.character.equipmentBonuses = {
            strength: 0, dexterity: 0, constitution: 0,
            intelligence: 0, wisdom: 0, charisma: 0, luck: 0,
            maxHealth: 0, maxMana: 0, attack: 0, defense: 0,
            criticalChance: 0, criticalMultiplier: 1.0
        };

        // Aggregate bonuses from all equipped items
        for (const item of Object.values(this.equipmentSlots)) {
            if (item && item.statBonuses) {
                // Apply stat bonuses with quality multipliers
            }
        }

        this.character.recalculateStats();
    }
}
```

## Rarity and Quality System

### Rarity Tiers
- **Common** - Basic items, no special properties
- **Rare** - Enhanced stats, minor bonuses
- **Epic** - Significant bonuses, special effects
- **Legendary** - Maximum bonuses, unique abilities

### Quality Enhancement System
```javascript
// Enhancement mechanics
enhanceEquipment(slot, enhancementLevel) {
    const maxEnhancement = this.getMaxEnhancementLevel(item);
    const cost = this.calculateEnhancementCost(item, enhancementLevel);
    const successRate = this.calculateEnhancementSuccessRate(item, enhancementLevel);

    if (Math.random() < successRate) {
        item.enhance(enhancementLevel);
        // Success: quality increases, value increases
    } else {
        // Failure: possible item break or quality reduction
    }
}
```

### Enhancement Rules
- **Max Enhancement**: Based on rarity (Common: 5, Rare: 8, Epic: 10, Legendary: 15)
- **Success Rate**: Decreases with higher enhancement levels
- **Cost**: Exponential scaling with current enhancement
- **Risk**: High-level enhancements risk item destruction

## Shop and Trading System

### Merchant Integration
```javascript
// Shop system
setMerchantInventory(merchantInventory) {
    this.merchantInventory = merchantInventory;
}

buyFromMerchant(itemId, quantity) {
    // Purchase validation and gold deduction
}

sellToMerchant(slot, quantity) {
    // Sale with 60% value recovery
}
```

### Treasure System
```javascript
// Random treasure generation
generateTreasureChest(level, quality) {
    const chest = {
        items: [],
        gold: calculatedGold,
        quality: quality
    };

    // Generate items based on rarity weights
    for (let i = 0; i < numItems; i++) {
        const item = itemDatabase.generateRandomItem(level);
        // Chance to enhance items in better chests
    }

    return chest;
}
```

## Item Creation Tool

### Tool Features
The Item Creation Tool provides a comprehensive interface for creating and configuring items:

#### Basic Configuration
- Item ID, name, description
- Category selection (weapon, armor, consumable, material, accessory)
- Rarity and value settings
- Level requirements and job restrictions

#### Category-Specific Configuration

**Weapons:**
- Damage, weapon type, elemental properties
- Critical hit chance and multiplier
- Stat bonuses

**Armor:**
- Defense, armor type, equipment slot
- Elemental and status resistances
- Weight calculations

**Consumables:**
- Effect function definition
- Usage limits and cooldowns
- Effect types (immediate, over time, passive)
- Targeting options

**Accessories:**
- Accessory type and slot
- Stat bonuses
- Special effects

#### Stat Configuration System
Dynamic stat bonus assignment with validation:
- Primary stats (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma, Luck)
- Derived stats (Max Health, Max Mana)
- Combat stats (Attack, Defense)

#### Template System
Pre-built templates for common items:
```javascript
const templates = {
    weapon: {
        iron_sword: { /* template data */ },
        flaming_sword: { /* template data */ }
    },
    armor: {
        leather_armor: { /* template data */ },
        plate_armor: { /* template data */ }
    }
};
```

#### Export/Import Functionality
- JSON export with complete item configuration
- Import validation and error handling
- Template sharing and backup

#### Testing and Validation
- Real-time item preview
- Balance testing with mock characters
- Effect validation and syntax checking

### Tool Usage
```javascript
// Initialize the tool
const itemTool = new ItemCreationTool('tool-container', (item) => {
    console.log('Item created:', item.name);
    itemDatabase.addItem(item);
});

// The tool provides full UI for item creation
```

## Usage Examples

### Creating Items Programmatically
```javascript
// Create a weapon
const sword = new RPGWeapon(
    'excalibur',
    'Excalibur',
    'Legendary sword of kings',
    50, // damage
    'sword',
    'legendary',
    5000 // value
);
sword.elementalType = 'holy';
sword.elementalDamage = 25;
sword.statBonuses = { strength: 10, luck: 5 };

// Create armor
const armor = new RPGArmor(
    'dragon_scale',
    'Dragon Scale Armor',
    'Impenetrable dragon scale protection',
    40, // defense
    'heavy',
    'chest',
    'legendary',
    8000
);
armor.elementalResistances = { fire: 0.5, ice: 0.3 };
armor.statBonuses = { constitution: 15, strength: 8 };

// Create consumable
const potion = new RPGConsumable(
    'super_health_potion',
    'Super Health Potion',
    'Restores 200 HP',
    (character) => character.heal(200),
    5, // max stack
    'rare',
    500
);
```

### Equipment Management
```javascript
// Equip items
inventory.equipItem(inventorySlot, 'weapon'); // Equip sword
inventory.equipItem(armorSlot, 'chest'); // Equip armor

// Get equipment stats
const equipmentStats = inventory.getEquipmentStats();
console.log('Total Attack:', equipmentStats.attack);
console.log('Total Defense:', equipmentStats.defense);

// Enhance equipment
const result = inventory.enhanceEquipment('weapon', 2);
if (result.success) {
    console.log('Enhancement successful! New quality:', result.newQuality);
} else {
    console.log('Enhancement failed:', result.reason);
}
```

### Shop Interactions
```javascript
// Set up merchant
inventory.setMerchantInventory(merchantInventory);

// Buy items
const buyResult = inventory.buyFromMerchant('iron_sword', 1);
if (buyResult.success) {
    console.log('Purchased:', buyResult.item.name, 'for', buyResult.cost, 'gold');
}

// Sell items
const sellResult = inventory.sellToMerchant(0, 1);
if (sellResult.success) {
    console.log('Sold for', sellResult.value, 'gold');
}
```

### Treasure Discovery
```javascript
// Generate treasure
const chest = inventory.generateTreasureChest(10, 'epic');

// Open chest
const results = inventory.openTreasureChest(chest);
console.log('Found', results.gold, 'gold and', results.items.length, 'items');
```

## Integration with Character System

### Automatic Stat Recalculation
Equipment changes automatically trigger character stat updates:
```javascript
// When equipment changes, stats are recalculated
character.getTotalStats = function() {
    const baseStats = { ...this.stats };
    const equipmentBonuses = this.inventory.getEquipmentStats();

    return {
        strength: baseStats.strength + equipmentBonuses.strength,
        attack: baseStats.attack + equipmentBonuses.attack,
        defense: baseStats.defense + equipmentBonuses.defense,
        // ... other stats
    };
};
```

### Combat Integration
Equipment affects combat calculations:
```javascript
// In combat system
getAttackPower() {
    const weapon = this.equipmentSlots.weapon;
    if (weapon) {
        return weapon.getTotalDamage(this);
    }
    return this.stats.strength; // Unarmed
}

getDefensePower() {
    let totalDefense = this.stats.constitution;
    for (const slot in this.equipmentSlots) {
        const item = this.equipmentSlots[slot];
        if (item instanceof RPGArmor) {
            totalDefense += item.getTotalDefense(this);
        }
    }
    return totalDefense;
}
```

## Advanced Features

### Item Scaling
Items scale with character level and provide appropriate power progression.

### Elemental System Integration
Items can have elemental properties that interact with the magic system.

### Procedural Generation
Treasure chests and random encounters generate appropriate items based on character level and location.

### Economy Balance
Item values, enhancement costs, and shop prices maintain game economy balance.

### Modding Support
Item database and creation tools support extensive modding and content creation.

## Performance Considerations

- **Caching**: Item stats and calculations are cached for performance
- **Lazy Loading**: Item database loads on demand
- **Memory Management**: Automatic cleanup of unused item instances
- **Batch Operations**: Equipment updates are batched for efficiency

## Future Enhancements

- **Item Sets**: Bonus effects for wearing complete item sets
- **Enchantments**: Temporary magical effects on equipment
- **Crafting System**: Recipe-based item creation
- **Item Durability**: Wear and tear mechanics
- **Socket System**: Gem and rune integration
- **Cosmetic Items**: Appearance customization without stat effects

This comprehensive item system provides the foundation for rich RPG gameplay with deep character customization and progression mechanics.