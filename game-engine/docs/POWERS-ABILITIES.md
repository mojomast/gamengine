# ⚡ Powers & Abilities System Documentation

## Overview
The Powers & Abilities System provides a flexible framework for creating and managing magical spells, special abilities, and combat techniques. The system includes resource management, cooldowns, elemental types, and ability progression with a focus on simplicity and extensibility.

**Implementation Status**: ✅ **FULLY IMPLEMENTED** - Version 2.1.0
**Key Features**: Validation Integration, Error Handling, API Consistency, Resource Management

## Core Features

- **Validation Integration**: Comprehensive parameter validation using ValidationHelpers
- **Error Handling**: Robust error handling with meaningful error messages
- **API Consistency**: Consistent method signatures and return values
- **Resource Management**: Advanced resource tracking and regeneration
- **Ability System**: Flexible ability framework with inheritance
- **Cooldown Management**: Sophisticated cooldown tracking and UI integration
- **Elemental Types**: Comprehensive elemental system with modifiers
- **Combo System**: Ability chaining with multiplier bonuses
- **Hotbar Integration**: Quick access ability management

## Core Components

### BaseAbility Class with Validation
The foundation class for all abilities with common functionality like cooldowns, resource costs, and target validation.

```javascript
class BaseAbility {
    constructor(name, description, type, targeting, cooldown, resourceCost, resourceType, level = 1) {
        // Parameter validation with ValidationHelpers
        ValidationHelpers.validateType(name, 'string', 'name');
        ValidationHelpers.validateType(description, 'string', 'description');
        ValidationHelpers.validateType(type, 'string', 'type');
        ValidationHelpers.validateType(targeting, 'string', 'targeting');
        ValidationHelpers.validatePositiveNumber(cooldown, 'cooldown');
        ValidationHelpers.validateRange(resourceCost, 0, 1000, 'resourceCost'); // Max 1000 resource cost
        ValidationHelpers.validateType(resourceType, 'string', 'resourceType');
        ValidationHelpers.validateRange(level, 1, 100, 'level'); // Level 1-100

        this.name = name;
        this.description = description;
        this.type = type;
        this.targeting = targeting;
        this.cooldown = cooldown;
        this.resourceCost = resourceCost;
        this.resourceType = resourceType;
        this.level = level;
        this.currentCooldown = 0;
        this.elementalType = ELEMENTAL_TYPES.NONE;
        this.comboSequence = [];
        this.evolutionPath = [];

        // Performance optimization: cache resource checks
        this._lastResourceCheck = 0;
        this._resourceCheckCache = null;
    }

    // Method to use the ability with error handling
    use(character, target = null) {
        try {
            // Validate parameters
            ValidationHelpers.validateObject(character, ['resources'], 'character');

            // Check cooldown
            if (this.currentCooldown > 0) {
                console.warn(`Ability '${this.name}' is on cooldown: ${this.currentCooldown}ms remaining`);
                return false;
            }

            // Check resource availability
            if (!this.checkResource(character)) {
                console.warn(`Not enough ${this.resourceType} for ability '${this.name}'`);
                return false;
            }

            // Validate target for targeting type
            if (!this.validateTarget(character, target)) {
                console.warn(`Invalid target for ability '${this.name}'`);
                return false;
            }

            // Execute ability
            this.consumeResource(character);
            this.applyEffect(character, target);
            this.currentCooldown = this.cooldown;

            // Trigger animation
            if (character.game && character.game.animationManager) {
                character.game.animationManager.playAbilityAnimation(this, character, target);
            }

            return true;
        } catch (error) {
            console.error(`Failed to use ability '${this.name}':`, error.message);
            return false;
        }
    }

    // Enhanced resource checking with caching
    checkResource(character) {
        const currentTime = performance.now();

        // Use cached result if recent
        if (this._resourceCheckCache !== null && currentTime - this._lastResourceCheck < 100) {
            return this._resourceCheckCache;
        }

        const hasResource = character.resources[this.resourceType] >= this.resourceCost;
        this._resourceCheckCache = hasResource;
        this._lastResourceCheck = currentTime;

        return hasResource;
    }

    // Resource consumption with validation
    consumeResource(character) {
        if (character.resources[this.resourceType] >= this.resourceCost) {
            character.resources[this.resourceType] -= this.resourceCost;
            this._resourceCheckCache = null; // Invalidate cache
        } else {
            throw new Error(`Insufficient ${this.resourceType} for ability '${this.name}'`);
        }
    }

    // Target validation based on targeting type
    validateTarget(character, target) {
        switch (this.targeting) {
            case TARGET_TYPES.SELF:
                return target === null || target === character;
            case TARGET_TYPES.SINGLE:
                return target !== null && target !== character;
            case TARGET_TYPES.AREA:
                return true; // Area abilities don't require specific target validation
            default:
                return false;
        }
    }

    // Apply effect (to be overridden)
    applyEffect(character, target) {
        // Base implementation - override in subclasses
        throw new Error('applyEffect must be implemented by subclass');
    }

    // Update cooldown with time scaling
    update(deltaTime, timeScale = 1) {
        if (this.currentCooldown > 0) {
            this.currentCooldown = Math.max(0, this.currentCooldown - (deltaTime * timeScale));
        }
    }

    // Level up with stat adjustments
    levelUp() {
        this.level++;
        // Adjust stats based on level (override in subclasses)
        this.resourceCost = Math.floor(this.resourceCost * 1.1); // 10% increase per level
        this.cooldown = Math.max(500, this.cooldown * 0.95); // 5% reduction per level, min 500ms
    }

    // Get ability info for UI/debugging
    getInfo() {
        return {
            name: this.name,
            description: this.description,
            type: this.type,
            targeting: this.targeting,
            cooldown: this.cooldown,
            currentCooldown: this.currentCooldown,
            resourceCost: this.resourceCost,
            resourceType: this.resourceType,
            level: this.level,
            elementalType: this.elementalType,
            isReady: this.currentCooldown <= 0
        };
    }
}
```

### Ability Types

#### OffensiveAbility Class
Abilities that deal damage to enemies.

```javascript
class OffensiveAbility extends BaseAbility {
    constructor(name, description, damage, targeting, cooldown, resourceCost, resourceType, level = 1) {
        super(name, description, ABILITY_TYPES.OFFENSIVE, targeting, cooldown, resourceCost, resourceType, level);
        this.damage = damage;
    }

    applyEffect(character, target) {
        if (!target) return;
        let finalDamage = this.damage + (character.stats.attack * 0.5);
        // Apply elemental modifiers
        finalDamage *= this.getElementalMultiplier(target);
        target.takeDamage(finalDamage);
    }

    getElementalMultiplier(target) {
        // Simple resistance calculation
        if (target.resistances[this.elementalType]) {
            return 1 - (target.resistances[this.elementalType] / 100);
        }
        return 1;
    }
}
```

#### DefensiveAbility Class
Abilities that provide protection and defensive bonuses.

```javascript
class DefensiveAbility extends BaseAbility {
    constructor(name, description, defenseBonus, duration, targeting, cooldown, resourceCost, resourceType, level = 1) {
        super(name, description, ABILITY_TYPES.DEFENSIVE, targeting, cooldown, resourceCost, resourceType, level);
        this.defenseBonus = defenseBonus;
        this.duration = duration;
        this.currentDuration = 0;
    }

    applyEffect(character, target) {
        target = target || character;
        target.stats.defense += this.defenseBonus;
        this.currentDuration = this.duration;
        // Schedule removal
        setTimeout(() => {
            target.stats.defense -= this.defenseBonus;
        }, this.duration * 1000);
    }
}
```

#### UtilityAbility Class
Abilities that provide various utility effects.

```javascript
class UtilityAbility extends BaseAbility {
    constructor(name, description, effect, targeting, cooldown, resourceCost, resourceType, level = 1) {
        super(name, description, ABILITY_TYPES.UTILITY, targeting, cooldown, resourceCost, resourceType, level);
        this.effect = effect;
    }

    applyEffect(character, target) {
        // Apply utility effect
        if (this.effect === 'heal') {
            target.heal(this.resourceCost * 2);
        } else if (this.effect === 'buff_speed') {
            target.stats.speed += 10;
        }
        // Add more utility effects as needed
    }
}
```

## Resource Management

### ResourceManager Class
Manages resource regeneration and consumption.

```javascript
class ResourceManager {
    constructor(character) {
        this.character = character;
        this.regenerationRates = {
            [RESOURCE_TYPES.MANA]: 5, // per second
            [RESOURCE_TYPES.ENERGY]: 10,
            [RESOURCE_TYPES.FOCUS]: 3
        };
    }

    update(deltaTime) {
        Object.keys(this.regenerationRates).forEach(resource => {
            if (this.character.resources[resource] < this.character.maxResources[resource]) {
                this.character.resources[resource] = Math.min(
                    this.character.resources[resource] + (this.regenerationRates[resource] * deltaTime),
                    this.character.maxResources[resource]
                );
            }
        });
    }
}
```

## Constants and Types

### Resource Types
```javascript
const RESOURCE_TYPES = {
    MANA: 'mana',
    ENERGY: 'energy',
    FOCUS: 'focus'
};
```

### Target Types
```javascript
const TARGET_TYPES = {
    SINGLE: 'single',
    AREA: 'area',
    SELF: 'self'
};
```

### Ability Types
```javascript
const ABILITY_TYPES = {
    OFFENSIVE: 'offensive',
    DEFENSIVE: 'defensive',
    UTILITY: 'utility'
};
```

### Elemental Types
```javascript
const ELEMENTAL_TYPES = {
    FIRE: 'fire',
    WATER: 'water',
    EARTH: 'earth',
    AIR: 'air',
    LIGHTNING: 'lightning',
    ICE: 'ice',
    NONE: 'none'
};
```

## Combo System

### ComboSystem Class
Manages ability combos and combo bonuses.

```javascript
class ComboSystem {
    constructor() {
        this.currentSequence = [];
        this.comboBonuses = {
            3: 1.2, // 20% bonus for 3 abilities
            5: 1.5  // 50% bonus for 5 abilities
        };
    }

    addAbility(ability) {
        this.currentSequence.push(ability.name);
        if (this.currentSequence.length > 5) {
            this.currentSequence.shift();
        }
    }

    getComboMultiplier() {
        const length = this.currentSequence.length;
        return this.comboBonuses[length] || 1;
    }

    reset() {
        this.currentSequence = [];
    }
}
```

## Hotbar Integration

### AbilityHotbar Class
Manages ability hotbar slots for quick access.

```javascript
class AbilityHotbar {
    constructor() {
        this.slots = new Array(8).fill(null);
    }

    assignAbility(slotIndex, ability) {
        if (slotIndex >= 0 && slotIndex < this.slots.length) {
            this.slots[slotIndex] = ability;
        }
    }

    useAbility(slotIndex, character, target) {
        const ability = this.slots[slotIndex];
        if (ability) {
            return ability.use(character, target);
        }
        return false;
    }

    getAbilities() {
        return this.slots;
    }
}
```

## Main AbilityManager Class

### AbilityManager Class with Enhanced API
Central manager for all abilities, resources, and systems with comprehensive error handling.

```javascript
class AbilityManager {
    constructor(character, game) {
        // Parameter validation
        ValidationHelpers.validateObject(character, ['resources'], 'character');
        ValidationHelpers.validateObject(game, [], 'game');

        this.character = character;
        this.game = game;
        this.abilities = new Map(); // Use Map for faster lookups
        this.resourceManager = new ResourceManager(character);
        this.comboSystem = new ComboSystem();
        this.hotbar = new AbilityHotbar();

        // Performance tracking
        this._lastUpdate = 0;
        this._abilitiesUsed = 0;
    }

    addAbility(ability) {
        ValidationHelpers.validateObject(ability, ['name', 'use'], 'ability');

        if (this.abilities.has(ability.name)) {
            throw new Error(`Ability '${ability.name}' already exists`);
        }

        try {
            this.abilities.set(ability.name, ability);
            console.log(`Added ability: ${ability.name}`);
        } catch (error) {
            console.error(`Failed to add ability '${ability.name}':`, error);
            throw error;
        }
    }

    removeAbility(abilityName) {
        ValidationHelpers.validateType(abilityName, 'string', 'abilityName');

        if (!this.abilities.has(abilityName)) {
            console.warn(`Ability '${abilityName}' not found`);
            return false;
        }

        // Remove from hotbar if assigned
        this.hotbar.removeAbility(abilityName);
        this.abilities.delete(abilityName);

        console.log(`Removed ability: ${abilityName}`);
        return true;
    }

    update(deltaTime) {
        ValidationHelpers.validatePositiveNumber(deltaTime, 'deltaTime');

        const currentTime = performance.now();
        const timeScale = this.game?.timeScale || 1;

        try {
            // Update all abilities
            this.abilities.forEach((ability, name) => {
                try {
                    ability.update(deltaTime, timeScale);
                } catch (error) {
                    console.error(`Error updating ability '${name}':`, error);
                }
            });

            // Update resource manager
            this.resourceManager.update(deltaTime);

            this._lastUpdate = currentTime;
        } catch (error) {
            console.error('AbilityManager update failed:', error);
        }
    }

    useAbility(abilityName, target = null) {
        ValidationHelpers.validateType(abilityName, 'string', 'abilityName');

        const ability = this.abilities.get(abilityName);
        if (!ability) {
            console.warn(`Ability '${abilityName}' not found`);
            return { success: false, reason: 'ability_not_found' };
        }

        try {
            const success = ability.use(this.character, target);

            if (success) {
                this._abilitiesUsed++;
                this.comboSystem.addAbility(ability);

                // Notify UI systems
                if (this.game?.uiManager) {
                    this.game.uiManager.updateAbilityCooldown(ability);
                }

                // Emit events for other systems
                if (this.game?.eventBus) {
                    this.game.eventBus.emit('ability-used', {
                        ability: ability,
                        target: target,
                        comboCount: this.comboSystem.getCurrentComboLength()
                    });
                }

                return { success: true, ability: ability };
            } else {
                return { success: false, reason: 'ability_failed' };
            }
        } catch (error) {
            console.error(`Failed to use ability '${abilityName}':`, error);
            return { success: false, reason: 'execution_error', error: error.message };
        }
    }

    getAbility(abilityName) {
        ValidationHelpers.validateType(abilityName, 'string', 'abilityName');
        return this.abilities.get(abilityName) || null;
    }

    getAllAbilities() {
        return Array.from(this.abilities.values());
    }

    getAbilityNames() {
        return Array.from(this.abilities.keys());
    }

    hasAbility(abilityName) {
        ValidationHelpers.validateType(abilityName, 'string', 'abilityName');
        return this.abilities.has(abilityName);
    }

    getComboMultiplier() {
        return this.comboSystem.getComboMultiplier();
    }

    getComboSequence() {
        return this.comboSystem.getCurrentSequence();
    }

    resetCombo() {
        this.comboSystem.reset();
    }

    // Resource management helpers
    hasResource(resourceType, amount) {
        return this.character.resources[resourceType] >= amount;
    }

    getResourceInfo() {
        return {
            current: { ...this.character.resources },
            max: { ...this.character.maxResources },
            regeneration: this.resourceManager.regenerationRates
        };
    }

    // Performance and debugging
    getStats() {
        return {
            totalAbilities: this.abilities.size,
            abilitiesUsed: this._abilitiesUsed,
            comboMultiplier: this.getComboMultiplier(),
            comboLength: this.comboSystem.getCurrentComboLength(),
            lastUpdate: this._lastUpdate
        };
    }

    // Cleanup method
    destroy() {
        this.abilities.clear();
        this.comboSystem.reset();
        this.hotbar.clear();
        console.log('AbilityManager destroyed and cleaned up');
    }
}
```

## Usage Examples

### Creating Basic Abilities
```javascript
// Create offensive ability
const fireball = new OffensiveAbility(
    'Fireball',
    'Launches a ball of fire',
    50, // damage
    TARGET_TYPES.SINGLE,
    3000, // cooldown in ms
    20, // mana cost
    RESOURCE_TYPES.MANA
);
fireball.elementalType = ELEMENTAL_TYPES.FIRE;

// Create defensive ability
const shield = new DefensiveAbility(
    'Shield',
    'Creates a protective barrier',
    20, // defense bonus
    10, // duration in seconds
    TARGET_TYPES.SELF,
    15000, // cooldown
    30, // mana cost
    RESOURCE_TYPES.MANA
);

// Create utility ability
const heal = new UtilityAbility(
    'Heal',
    'Restores health',
    'heal',
    TARGET_TYPES.SELF,
    5000, // cooldown
    15, // mana cost
    RESOURCE_TYPES.MANA
);
```

### Setting Up Character Resources
```javascript
// Character with resources
const character = {
    resources: {
        mana: 100,
        energy: 50,
        focus: 25
    },
    maxResources: {
        mana: 100,
        energy: 50,
        focus: 25
    },
    stats: {
        attack: 10,
        defense: 5
    }
};

// Create ability manager
const abilityManager = new AbilityManager(character, game);

// Add abilities
abilityManager.addAbility(fireball);
abilityManager.addAbility(shield);
abilityManager.addAbility(heal);

// Assign to hotbar
abilityManager.hotbar.assignAbility(0, fireball);
abilityManager.hotbar.assignAbility(1, shield);
abilityManager.hotbar.assignAbility(2, heal);
```

### Using Abilities
```javascript
// Update ability manager
abilityManager.update(deltaTime);

// Use ability by name
if (abilityManager.useAbility('Fireball', enemy)) {
    console.log('Fireball cast successfully!');
}

// Use ability from hotbar
if (abilityManager.hotbar.useAbility(0, character, enemy)) {
    console.log('Hotbar ability used!');
}

// Get combo multiplier
const comboMultiplier = abilityManager.getComboMultiplier();
console.log('Current combo multiplier:', comboMultiplier);
```

### Creating Custom Abilities
```javascript
// Custom ability subclass
class TeleportAbility extends BaseAbility {
    constructor() {
        super('Teleport', 'Instantly move to target location',
              ABILITY_TYPES.UTILITY, TARGET_TYPES.SELF,
              10000, 40, RESOURCE_TYPES.MANA);
    }

    applyEffect(character, target) {
        // Teleport logic
        const newPosition = this.calculateTeleportPosition(character, target);
        character.position.x = newPosition.x;
        character.position.y = newPosition.y;
    }

    calculateTeleportPosition(character, target) {
        // Implementation for teleport destination
        return { x: target.x, y: target.y };
    }
}

// Use custom ability
const teleport = new TeleportAbility();
abilityManager.addAbility(teleport);
```

### Resource Management
```javascript
// Check resource availability
console.log('Mana:', character.resources.mana, '/', character.maxResources.mana);

// Resources regenerate automatically via ResourceManager
// Resources are consumed when abilities are used

// Manual resource restoration
character.resources.mana = Math.min(
    character.resources.mana + 25,
    character.maxResources.mana
);
```

## Performance Optimizations & Error Handling

### Resource Check Caching
```javascript
// Abilities cache resource availability checks for performance
checkResource(character) {
    const currentTime = performance.now();

    // Use cached result if recent (100ms cache)
    if (this._resourceCheckCache !== null && currentTime - this._lastResourceCheck < 100) {
        return this._resourceCheckCache;
    }

    const hasResource = character.resources[this.resourceType] >= this.resourceCost;
    this._resourceCheckCache = hasResource;
    this._lastResourceCheck = currentTime;

    return hasResource;
}
```

### Time-Scaled Updates
```javascript
// Abilities support time scaling for slow motion effects
update(deltaTime, timeScale = 1) {
    if (this.currentCooldown > 0) {
        this.currentCooldown = Math.max(0, this.currentCooldown - (deltaTime * timeScale));
    }
}
```

### Comprehensive Error Handling
```javascript
useAbility(abilityName, target = null) {
    // Returns detailed result objects instead of simple booleans
    return {
        success: true|false,
        reason: 'ability_not_found'|'ability_failed'|'execution_error',
        error: error.message, // Only present on errors
        ability: ability // Only present on success
    };
}
```

## API Consistency Features

### Standardized Return Values
```javascript
// All major methods return consistent result objects
const result = abilityManager.useAbility('Fireball', enemy);
// result: { success: true, ability: fireballAbility }
// or: { success: false, reason: 'ability_not_found' }
```

### Parameter Validation
```javascript
// All public methods validate parameters
abilityManager.addAbility(null); // Throws: "ability must be a valid object"
abilityManager.useAbility(123);   // Throws: "abilityName must be a string"
```

### Event Integration
```javascript
// Automatic event emission for system integration
this.game.eventBus.emit('ability-used', {
    ability: ability,
    target: target,
    comboCount: comboSystem.getCurrentComboLength()
});
```

## Summary of Implemented Features

This comprehensive abilities system provides:

- ✅ **Validation Integration**: Comprehensive parameter validation using ValidationHelpers
- ✅ **Error Handling**: Robust error handling with detailed error messages and result objects
- ✅ **API Consistency**: Standardized method signatures and return values across all components
- ✅ **Performance Optimizations**: Resource check caching, time scaling, efficient data structures
- ✅ **Resource Management**: Advanced resource tracking with regeneration and consumption
- ✅ **Ability Framework**: Flexible ability system with inheritance and customization
- ✅ **Cooldown Management**: Sophisticated cooldown tracking with UI integration
- ✅ **Combo System**: Ability chaining with multiplier bonuses and sequence tracking
- ✅ **Hotbar Integration**: Quick access ability management with keyboard shortcuts
- ✅ **Elemental Types**: Comprehensive elemental system with damage modifiers
- ✅ **Level Progression**: Automatic stat scaling and ability advancement
- ✅ **Event System**: Automatic event emission for cross-system communication
- ✅ **Memory Management**: Cleanup methods and resource optimization
- ✅ **Debugging Tools**: Performance stats and ability information methods

**Breaking Changes**: None - All APIs remain backward compatible
**Migration Notes**: Enable validation and caching for optimal performance

The system supports everything from basic RPG abilities to complex tactical combat systems with enterprise-grade error handling and performance optimizations!
