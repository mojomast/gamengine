// game-engine/src/core/AbilityManager.js
// Powers & Abilities System Implementation

import { ValidationHelpers, ValidationError } from './ValidationHelpers.js';

// Constants
const RESOURCE_TYPES = {
  MANA: 'mana',
  ENERGY: 'energy',
  FOCUS: 'focus'
};

const TARGET_TYPES = {
  SINGLE: 'single',
  AREA: 'area',
  SELF: 'self'
};

const ABILITY_TYPES = {
  OFFENSIVE: 'offensive',
  DEFENSIVE: 'defensive',
  UTILITY: 'utility'
};

const ELEMENTAL_TYPES = {
  FIRE: 'fire',
  WATER: 'water',
  EARTH: 'earth',
  AIR: 'air',
  LIGHTNING: 'lightning',
  ICE: 'ice',
  NONE: 'none'
};

// Base Ability Class
class BaseAbility {
  constructor(name, description, type, targeting, cooldown, resourceCost, resourceType, level = 1) {
    // Validate parameters
    ValidationHelpers.validateType(name, 'string', 'name');
    ValidationHelpers.validateType(description, 'string', 'description');
    ValidationHelpers.validateType(type, 'string', 'type');
    ValidationHelpers.validateType(targeting, 'string', 'targeting');
    ValidationHelpers.validatePositiveNumber(cooldown, 'cooldown');
    ValidationHelpers.validatePositiveNumber(resourceCost, 'resourceCost');
    ValidationHelpers.validateType(resourceType, 'string', 'resourceType');
    ValidationHelpers.validatePositiveNumber(level, 'level');

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
  }

  // Method to use the ability
  use(character, target = null) {
    if (this.currentCooldown > 0) return false;
    if (!this.checkResource(character)) return false;

    this.consumeResource(character);
    this.applyEffect(character, target);
    this.currentCooldown = this.cooldown;

    // Trigger animation
    if (character.game && character.game.animationManager) {
      character.game.animationManager.playAbilityAnimation(this, character, target);
    }

    return true;
  }

  // Check if character has enough resource
  checkResource(character) {
    if (!character.resources || !character.resources[this.resourceType]) {
      console.warn(`Character missing resource type: ${this.resourceType}`);
      return false;
    }
    return character.resources[this.resourceType] >= this.resourceCost;
  }

  // Consume resource
  consumeResource(character) {
    if (character.resources && character.resources[this.resourceType] !== undefined) {
      character.resources[this.resourceType] -= this.resourceCost;
      // Ensure it doesn't go negative
      if (character.resources[this.resourceType] < 0) {
        character.resources[this.resourceType] = 0;
      }
    }
  }

  // Apply effect (to be overridden)
  applyEffect(character, target) {
    // Base implementation - override in subclasses
  }

  // Update cooldown
  update(deltaTime) {
    if (this.currentCooldown > 0) {
      this.currentCooldown -= deltaTime;
    }
  }

  // Level up
  levelUp() {
    this.level++;
    // Adjust stats based on level
  }

  // Evolve
  evolve() {
    // Implement evolution logic
  }
}

// Offensive Ability Subclass
class OffensiveAbility extends BaseAbility {
  constructor(name, description, damage, targeting, cooldown, resourceCost, resourceType, level = 1) {
    // Validate damage parameter
    ValidationHelpers.validatePositiveNumber(damage, 'damage');

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

// Defensive Ability Subclass
class DefensiveAbility extends BaseAbility {
  constructor(name, description, defenseBonus, duration, targeting, cooldown, resourceCost, resourceType, level = 1) {
    // Validate additional parameters
    ValidationHelpers.validatePositiveNumber(defenseBonus, 'defenseBonus');
    ValidationHelpers.validatePositiveNumber(duration, 'duration');

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

// Utility Ability Subclass
class UtilityAbility extends BaseAbility {
  constructor(name, description, effect, targeting, cooldown, resourceCost, resourceType, level = 1) {
    // Validate effect parameter
    ValidationHelpers.validateType(effect, 'string', 'effect');

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

// Resource Manager
class ResourceManager {
  constructor(character) {
    // Validate character parameter
    ValidationHelpers.validateObject(character, [], 'character');

    this.character = character;
    this.regenerationRates = {
      [RESOURCE_TYPES.MANA]: 5, // per second
      [RESOURCE_TYPES.ENERGY]: 10,
      [RESOURCE_TYPES.FOCUS]: 3
    };
  }

  update(deltaTime) {
    if (!this.character.resources || !this.character.maxResources) return;

    Object.keys(this.regenerationRates).forEach(resource => {
      if (this.character.resources[resource] !== undefined &&
          this.character.maxResources[resource] !== undefined &&
          this.character.resources[resource] < this.character.maxResources[resource]) {
        this.character.resources[resource] = Math.min(
          this.character.resources[resource] + (this.regenerationRates[resource] * deltaTime),
          this.character.maxResources[resource]
        );
      }
    });
  }
}

// Combo System
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

// Magic Schools System
class MagicSchools {
  static getElementalAffinity(ability, character) {
    // Simple affinity calculation
    if (character.elementalAffinities && character.elementalAffinities[ability.elementalType]) {
      return character.elementalAffinities[ability.elementalType] / 100;
    }
    return 1;
  }

  static calculateResistance(target, elementalType) {
    return target.resistances ? (target.resistances[elementalType] || 0) : 0;
  }
}

// Hotbar Integration
class AbilityHotbar {
  constructor() {
    this.slots = new Array(8).fill(null);
  }

  assignAbility(slotIndex, ability) {
    // Validate parameters
    ValidationHelpers.validateRange(slotIndex, 0, this.slots.length - 1, 'slotIndex');
    ValidationHelpers.validateObject(ability, ['name'], 'ability');

    this.slots[slotIndex] = ability;
  }

  useAbility(slotIndex, character, target) {
    // Validate parameters
    ValidationHelpers.validateRange(slotIndex, 0, this.slots.length - 1, 'slotIndex');
    ValidationHelpers.validateObject(character, [], 'character');

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

// Main AbilityManager Class
class AbilityManager {
  constructor(character, game) {
    // Validate parameters
    ValidationHelpers.validateObject(character, [], 'character');
    ValidationHelpers.validateObject(game, [], 'game');

    this.character = character;
    this.game = game;
    this.abilities = [];
    this.resourceManager = new ResourceManager(character);
    this.comboSystem = new ComboSystem();
    this.hotbar = new AbilityHotbar();
  }

  addAbility(ability) {
    // Validate parameter
    ValidationHelpers.validateObject(ability, ['name', 'use'], 'ability');

    this.abilities.push(ability);
  }

  update(deltaTime) {
    // Validate parameter
    ValidationHelpers.validatePositiveNumber(deltaTime, 'deltaTime');

    this.abilities.forEach(ability => ability.update(deltaTime));
    this.resourceManager.update(deltaTime);
  }

  useAbility(abilityName, target = null) {
    // Validate parameters
    ValidationHelpers.validateType(abilityName, 'string', 'abilityName');

    const ability = this.abilities.find(a => a.name === abilityName);
    if (ability && ability.use(this.character, target)) {
      this.comboSystem.addAbility(ability);
      // Notify UI
      if (this.game.uiManager) {
        this.game.uiManager.updateAbilityCooldown(ability);
      }
      return true;
    }
    return false;
  }

  getComboMultiplier() {
    return this.comboSystem.getComboMultiplier();
  }
}

// Exports
export {
  BaseAbility,
  OffensiveAbility,
  DefensiveAbility,
  UtilityAbility,
  ResourceManager,
  ComboSystem,
  MagicSchools,
  AbilityHotbar,
  AbilityManager,
  RESOURCE_TYPES,
  TARGET_TYPES,
  ABILITY_TYPES,
  ELEMENTAL_TYPES
};