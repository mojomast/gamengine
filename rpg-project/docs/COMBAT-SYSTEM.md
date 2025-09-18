# ⚔️ Turn-Based Combat System Documentation

## Overview

The Turn-Based Combat System provides a complete RPG battle framework with turn management, action selection, damage calculation, enemy AI, status effects, and battle animations. The system is designed to be flexible and extensible while maintaining simplicity for core RPG mechanics.

## Core Components

### BattleScene Class
The main battle controller that extends the base `Scene` class from the game engine.

```javascript
import { BattleScene } from './src/core/BattleScene.js';

const battleScene = new BattleScene('battle', engine, {
    backgroundImage: 'battle-bg.png',
    battleMusic: 'battle-theme.mp3',
    difficulty: 'normal',
    allowRun: true
});
```

### Turn Management
Handles the turn-based flow with speed-based turn order.

**Features:**
- Speed-based initiative system
- Configurable turn timeouts
- Automatic turn progression
- Round tracking

### Action Selection Menu
Player interface for choosing battle actions.

**Available Actions:**
- **Attack**: Physical attack with damage calculation
- **Magic**: Magical abilities with resource consumption
- **Item**: Use consumable items
- **Run**: Attempt to flee the battle (success chance based on various factors)

### Target Selection
System for selecting targets with keyboard/mouse support.

**Features:**
- Single target selection
- Area of effect targeting
- Visual target highlighting
- Keyboard navigation (arrow keys + Enter)

### Damage Calculation
Comprehensive damage system with RPG stat integration.

**Physical Damage Formula:**
```javascript
damage = baseDamage + attacker.attackPower - (defender.defense * 0.5)
damage *= elementalMultiplier (if applicable)
```

**Magical Damage Formula:**
```javascript
damage = baseDamage + attacker.spellPower
damage *= (1 - magicResistance / 200)
damage *= elementalMultiplier
```

**Modifiers:**
- Critical hits (2x damage, configurable chance)
- Dodge chance (prevents damage)
- Block chance (50% damage reduction)
- Elemental resistances

### Enemy AI System
Configurable AI with different difficulty levels.

**Difficulty Levels:**
- **Easy**: Random targeting, basic actions
- **Normal**: Targets weakest enemy, balanced actions
- **Hard**: Targets healers/support, advanced tactics
- **Expert**: Optimized targeting, combo usage

**AI Decision Process:**
1. Evaluate aggression level (based on difficulty)
2. Choose action type (attack/defensive/utility)
3. Select optimal target
4. Execute action with timing delays

### Status Effects System
Comprehensive debuff/buff system with visual feedback.

**Built-in Effects:**

**Buffs:**
- **Strength Boost**: +5 Attack Power per stack
- **Defense Boost**: +10 Defense per stack
- **Regeneration**: Heal over time (2 HP/second)

**Debuffs:**
- **Poison**: Damage over time (3 damage/second)
- **Weakness**: -3 Attack Power per stack
- **Slow**: -20% Movement Speed
- **Stun**: Prevents actions

**Features:**
- Stackable effects
- Duration-based expiration
- Visual status indicators
- Automatic stat modification
- Effect-specific behaviors

### Battle Animations
Integration with AnimationManager and ParticleSystem.

**Animation Types:**
- Attack animations (melee/ranged)
- Magic cast effects
- Damage numbers
- Status effect applications
- Victory/defeat sequences

### Victory/Defeat Conditions
Automatic battle end detection with rewards.

**Victory Conditions:**
- All enemies defeated (health <= 0)
- Special victory conditions (optional)

**Defeat Conditions:**
- All party members defeated
- Party leader defeated (optional)
- Time limit exceeded (optional)

**Rewards System:**
- Experience points (scaled by enemy levels)
- Gold (scaled by enemy levels)
- Items (random drops based on enemy type)
- Achievement progress

### Random Encounter System
Procedural enemy generation for dynamic battles.

**Features:**
- Difficulty-based enemy scaling
- Player level-appropriate encounters
- Multiple enemy types per encounter
- Configurable encounter rates

**Enemy Scaling:**
```javascript
scaledHealth = baseHealth * (1 + (playerLevel - 1) * 0.2)
scaledAttack = baseAttack * (1 + (playerLevel - 1) * 0.15)
scaledDefense = baseDefense * (1 + (playerLevel - 1) * 0.1)
```

## Usage Examples

### Starting a Battle

```javascript
// Setup party
const party = [
    new RPGCharacter({ name: 'Hero', level: 5 }),
    new RPGCharacter({ name: 'Mage', level: 4 })
];

// Generate random encounter
const enemies = BattleScene.generateRandomEncounter('normal', 5);

// Start battle
const battleScene = new BattleScene('battle', engine);
battleScene.startBattle(party, enemies);

// Add to scene manager
engine.sceneManager.addScene('battle', battleScene);
engine.sceneManager.switchScene('battle');
```

### Applying Status Effects

```javascript
// Apply poison to enemy
battleScene.applyStatusEffect(enemy, 'poison', 10000); // 10 seconds

// Apply strength boost to party member
battleScene.applyStatusEffect(partyMember, 'strength_boost', 15000, 2); // 2 stacks

// Check for status effects
if (battleScene.hasStatusEffect(character, 'stun')) {
    // Character cannot act
}
```

### Custom Enemy AI

```javascript
class CustomEnemyAI extends EnemyAI {
    decideAction(enemy, partyMembers, enemies) {
        // Custom AI logic
        if (enemy.health < enemy.maxHealth * 0.3) {
            // Low health - use defensive action
            return { action: { type: 'defend' }, target: enemy };
        }

        // Find healer in party
        const healer = partyMembers.find(m => m.job === 'cleric');
        if (healer) {
            return {
                action: { type: 'attack', name: 'Attack' },
                target: healer
            };
        }

        // Default attack
        return super.decideAction(enemy, partyMembers, enemies);
    }
}
```

### Battle Event Handling

```javascript
// Listen for battle events
engine.eventBus.on('battle-ended', (data) => {
    if (data.result === 'victory') {
        console.log(`Victory! Gained ${data.rewards.experience} EXP`);
        // Award rewards to party
        data.rewards.experience /= data.survivors.length;
        data.survivors.forEach(member => {
            member.gainExperience(data.rewards.experience);
        });
    } else if (data.result === 'defeat') {
        console.log('Defeat! Game Over');
        // Handle defeat
    }
});
```

## Configuration Options

### BattleScene Options

```javascript
const battleOptions = {
    backgroundImage: 'path/to/background.png',    // Battle background
    battleMusic: 'path/to/music.mp3',             // Background music
    difficulty: 'normal',                         // AI difficulty: easy, normal, hard, expert
    allowRun: true,                              // Allow fleeing
    turnTimeLimit: 30000,                        // Turn time limit in ms
    maxLogEntries: 50                            // Battle log size
};
```

### Status Effect Configuration

```javascript
// Custom status effect
const customEffect = new StatusEffect('custom_buff', 'Custom Buff', 'buff', 10000, {
    statModifiers: { attackPower: 10, defense: 5 },
    healingOverTime: 5,
    onApply: (target, stacks) => {
        console.log(`${target.name} gains custom buff!`);
    },
    onRemove: (target, stacks) => {
        console.log(`${target.name} loses custom buff!`);
    }
});
```

## Performance Considerations

### Optimization Features

- **Resource Check Caching**: Reduces redundant calculations
- **Efficient Data Structures**: Map-based lookups for O(1) access
- **Animation Pooling**: Reusable animation objects
- **Status Effect Batching**: Grouped effect updates
- **Memory Management**: Automatic cleanup of expired effects

### Performance Monitoring

```javascript
// Get battle system performance metrics
const perf = engine.performanceMonitor.getSystemPerformance();
console.log('Battle Update Time:', perf.battle || 0, 'ms');
console.log('Status Effects Time:', perf.statusEffects || 0, 'ms');
console.log('Animation Time:', perf.animation || 0, 'ms');
```

## Integration with Game Engine

### AnimationManager Integration

```javascript
// Play attack animation
if (engine.animationManager) {
    engine.animationManager.playAbilityAnimation(ability, attacker, target);
}

// Play battle transition
engine.animationManager.playBattleTransition('start');
```

### ParticleSystem Integration

```javascript
// Create damage particles
if (engine.particleSystem) {
    engine.particleSystem.createExplosion(target.x, target.y, 'damage');
}

// Status effect particles
engine.particleSystem.createAura(character.x, character.y, effect.color);
```

### AudioManager Integration

```javascript
// Play battle music
if (engine.audioManager) {
    engine.audioManager.playMusic('battle-theme');
    engine.audioManager.playSound('attack-hit');
}
```

## Extensibility

### Custom Abilities

```javascript
class CustomAbility extends BaseAbility {
    constructor() {
        super('Custom Attack', 'A custom ability', ABILITY_TYPES.OFFENSIVE,
              TARGET_TYPES.SINGLE, 5000, 25, RESOURCE_TYPES.MANA);

        this.customProperty = 'value';
    }

    applyEffect(character, target) {
        // Custom damage calculation
        const damage = this.calculateCustomDamage(character, target);
        target.takeDamage(damage);

        // Apply custom status effect
        battleScene.applyStatusEffect(target, 'custom_debuff', 8000);
    }

    calculateCustomDamage(attacker, defender) {
        // Custom formula
        return attacker.stats.strength * 2 + this.customProperty;
    }
}
```

### Custom Status Effects

```javascript
// Register custom status effect
StatusEffectManager.registerEffect(new StatusEffect({
    id: 'custom_effect',
    name: 'Custom Effect',
    type: 'buff',
    duration: 15000,
    effects: {
        statModifiers: { intelligence: 10 },
        damageOverTime: -2, // Healing over time
        onApply: (target) => {
            target.addVisualEffect('glowing_aura');
        }
    }
}));
```

### Battle Event Hooks

```javascript
// Battle lifecycle events
battleScene.on('turn-start', (combatant) => {
    console.log(`${combatant.name}'s turn begins`);
});

battleScene.on('action-executed', (action, result) => {
    console.log(`Action ${action.name} executed with result:`, result);
});

battleScene.on('combatant-defeated', (combatant) => {
    console.log(`${combatant.name} was defeated`);
});
```

## Troubleshooting

### Common Issues

**Battle Not Starting:**
- Check that party members have required properties (name, health, maxHealth)
- Verify enemy objects have takeDamage method
- Ensure BattleScene is properly added to scene manager

**Status Effects Not Applying:**
- Verify combatant has status effect manager initialized
- Check effect ID matches registered effects
- Ensure duration is in milliseconds

**AI Not Responding:**
- Check difficulty setting is valid
- Verify enemy has required stats properties
- Ensure AI decision method is not throwing errors

**Performance Issues:**
- Reduce animation complexity
- Limit concurrent status effects per combatant
- Use object pooling for frequently created objects

## Future Enhancements

### Planned Features
- Formation-based combat positioning
- Combo attack system
- Environmental battle effects
- Multi-party support
- Advanced AI scripting
- Network multiplayer battles
- Battle replay system

### API Compatibility
- Maintains backward compatibility with existing abilities
- Extensible effect system for custom implementations
- Modular design for easy feature addition

---

*This combat system provides a solid foundation for turn-based RPG battles while remaining flexible enough for various game types and difficulty levels.*