# 📊 RPG Character System Documentation

## Overview

The RPG Character System provides a comprehensive framework for creating, managing, and developing characters in RPG games. It extends the base Character class with RPG-specific features including primary stats, job classes, experience-based leveling, equipment systems, and party management.

## Core Architecture

### RPGCharacter Class

The `RPGCharacter` class extends the base `Character` class from the game engine, adding RPG-specific functionality:

```javascript
import { RPGCharacter } from './src/core/RPGCharacter.js';

const character = new RPGCharacter({
    name: 'Aldric',
    strength: 12,
    dexterity: 10,
    intelligence: 8,
    wisdom: 10,
    constitution: 14,
    charisma: 9,
    luck: 11,
    job: 'warrior'
});
```

#### Key Features:
- **Primary Stats**: Strength, Dexterity, Intelligence, Wisdom, Constitution, Charisma, Luck
- **Job System**: Class-based progression with stat bonuses and skill unlocks
- **Experience & Leveling**: Automatic leveling with stat point allocation
- **Equipment System**: Stat bonuses from equipped items
- **Save/Load**: Full serialization support

### Character Stats System

#### Primary Stats

| Stat | Description | Combat Effect | Other Effects |
|------|-------------|---------------|---------------|
| **Strength** | Physical power | Melee damage, carrying capacity | Intimidation checks |
| **Dexterity** | Agility and reflexes | Ranged damage, dodge chance | Stealth, lockpicking |
| **Intelligence** | Mental acuity | Spell power, mana pool | Crafting, knowledge |
| **Wisdom** | Spiritual awareness | Magic resistance, mana regen | Perception, diplomacy |
| **Constitution** | Physical toughness | Health pool, stamina | Endurance, resistance |
| **Charisma** | Force of personality | Leadership, social influence | Trading, persuasion |
| **Luck** | Fortune and chance | Critical hits, rare finds | Gambling, fortune |

#### Secondary Stats (Calculated)

- **Health**: `(Constitution × 10) + (Level × 5)`
- **Mana**: `(Intelligence × 8) + (Wisdom × 4) + (Level × 3)`
- **Stamina**: `(Constitution × 5) + (Dexterity × 3) + (Level × 2)`
- **Attack Power**: `Strength + floor(Level/2)`
- **Spell Power**: `Intelligence + Wisdom + floor(Level/3)`
- **Defense**: `floor(Constitution/2) + floor(Level/4)`
- **Magic Resistance**: `floor(Wisdom/2) + floor(Level/5)`
- **Critical Chance**: `min(0.5, (Luck/100) + (Level×0.001))`
- **Dodge Chance**: `min(0.3, Dexterity/200)`
- **Block Chance**: `min(0.25, Strength/400)`

## Job System

### Available Job Classes

#### Warrior
- **Description**: Masters of combat with high strength and constitution
- **Stat Bonuses**: +3 Strength, +2 Constitution, +1 Dexterity
- **Skill Unlocks**: Melee, Defense, Intimidation
- **Playstyle**: Frontline fighter specializing in tanking and melee damage

#### Mage
- **Description**: Harness magical energies with intelligence and wisdom
- **Stat Bonuses**: +3 Intelligence, +2 Wisdom, +1 Dexterity
- **Skill Unlocks**: Magic, Alchemy, Enchanting
- **Playstyle**: Ranged spellcaster with powerful magic attacks

#### Rogue
- **Description**: Stealthy and agile experts in precision strikes
- **Stat Bonuses**: +3 Dexterity, +2 Luck, +1 Intelligence
- **Skill Unlocks**: Stealth, Lockpicking, Trading
- **Playstyle**: High mobility with opportunistic attacks and utility skills

#### Cleric
- **Description**: Divine warriors with healing and protective abilities
- **Stat Bonuses**: +3 Wisdom, +2 Constitution, +1 Charisma
- **Skill Unlocks**: Magic, Defense, Diplomacy
- **Playstyle**: Support class focusing on healing and protection

### Job Implementation

```javascript
// Set or change job
character.setJob('warrior');

// Get current job information
const jobInfo = character.getJobInfo();
console.log(`Current job: ${jobInfo.name} (Level ${jobInfo.level})`);

// Get job stat bonuses
const bonuses = character.getJobStatBonuses();
```

## Leveling Mechanics

### Experience System

- **Experience to Next Level**: `Level × 100`
- **Level Up Benefits**:
  - +10 Max Health
  - +5 Max Mana
  - +5 Attribute Points for allocation

### Stat Point Allocation

```javascript
// Spend attribute points
const result = character.spendAttributePoint('strength', 2);
if (result.success) {
    console.log(`Increased strength to ${result.newValue}`);
} else {
    console.log(result.message); // "Insufficient attribute points"
}

// Check available points
console.log(`Available points: ${character.attributePoints}`);
```

#### Allocation Rules:
- 5 attribute points awarded per level
- Points spent on stats are permanent
- Cannot reduce stats below base values
- Progressive cost increase for higher stat values

## Equipment System

### Equipment Slots

- **Head**: Helmets, hats, crowns
- **Chest**: Armor, robes, shirts
- **Legs**: Pants, skirts, greaves
- **Feet**: Boots, shoes, sandals
- **Hands**: Gloves, gauntlets, bracers
- **Weapon**: Swords, staffs, bows, etc.
- **Offhand**: Shields, secondary weapons, spellbooks
- **Necklace**: Amulets, pendants, talismans
- **Ring1/Ring2**: Rings, signets, bands

### Equipment Implementation

```javascript
// Equip an item
const sword = {
    name: 'Iron Sword',
    type: 'weapon',
    statBonuses: { strength: 2, attackPower: 5 }
};

character.equipItem('weapon', sword);

// Check equipment bonuses
const bonuses = character.getEquipmentStatBonuses();
console.log(`Equipment strength bonus: ${bonuses.strength}`);

// Unequip item
const removedItem = character.unequipItem('weapon');
```

### Equipment Effects

Equipment can provide:
- **Stat Bonuses**: Direct increases to primary/secondary stats
- **Special Effects**: Unique abilities, resistances, etc.
- **Visual Changes**: Appearance modifications
- **Restrictions**: Level requirements, class restrictions

## Party Management System

### Party Formation

The party system supports multiple formations:

- **Square**: Balanced, defensive formation
- **Line**: Extended line formation
- **Diamond**: Spearhead formation with leader at front
- **V-Shape**: Wedge formation for breakthrough

### Party Implementation

```javascript
import { PartyManager } from './src/core/PartyManager.js';

const party = new PartyManager();

// Add characters to party
party.addMember(character1);
party.addMember(character2);
party.addMember(character3);

// Set formation
party.setFormation('diamond');

// Move party
party.moveParty(100, 200);

// Update party (call in game loop)
party.update(deltaTime);
```

#### Party Features:
- Up to 4 characters
- Automatic formation positioning
- Collision detection during movement
- Leader-based movement
- Formation switching
- Save/load support

## Character Creation Tool

### UI Components

The character creation tool provides a step-by-step interface:

1. **Name Selection**: Enter character name or generate randomly
2. **Stat Allocation**: Distribute 20 available points across 7 primary stats
3. **Job Selection**: Choose from 4 available job classes
4. **Equipment Selection**: Choose starting equipment
5. **Review & Create**: Final review before character creation

### Usage Example

```javascript
import { CharacterCreationTool } from './src/core/CharacterCreationTool.js';

// Create the tool in your UI
const creationTool = new CharacterCreationTool(100, 100, 600, 500, uiManager);

// Listen for character creation
creationTool.on('character-created', (character) => {
    console.log(`Created character: ${character.name}`);
    // Add to party or save to game state
});

// Show the creation tool
creationTool.show();
```

### Stat Allocation Rules

- **Starting Points**: 20 points to distribute
- **Base Values**: All stats start at 10
- **Minimum**: 8 (cannot go below)
- **Maximum**: 18 (cannot go above)
- **Point Cost**: 1 point per stat increase

## Integration with Game Engine

### RPGEngine Integration

The character system integrates seamlessly with the RPGEngine:

```javascript
// In your game initialization
const engine = new RPGEngine('game-canvas');
const party = new PartyManager();

// Create characters
const hero = new RPGCharacter({ name: 'Hero', job: 'warrior' });
const mage = new RPGCharacter({ name: 'Mage', job: 'mage' });

// Add to party
party.addMember(hero);
party.addMember(mage);

// Add party to engine
engine.rpgState.party = party.getAllMembers();
```

### Save/Load System

Full serialization support for all character data:

```javascript
// Save character
const saveData = character.getSaveData();

// Load character
const loadedCharacter = new RPGCharacter(saveData);
```

## API Reference

### RPGCharacter Methods

#### Core Methods
- `getCharacterInfo()`: Returns complete character information
- `levelUp()`: Manually trigger level up
- `gainExperience(amount)`: Add experience points
- `takeDamage(amount)`: Apply damage
- `heal(amount)`: Restore health

#### Job System
- `setJob(jobId)`: Change character job
- `getJobInfo()`: Get current job details
- `getJobStatBonuses()`: Get job stat bonuses

#### Equipment System
- `equipItem(slot, item)`: Equip item in slot
- `unequipItem(slot)`: Remove item from slot
- `getEquipmentStatBonuses()`: Get total equipment bonuses

#### Stat Management
- `spendAttributePoint(stat, points)`: Allocate stat points
- `getTotalDefense()`: Get combined defense value
- `getAttackPower()`: Get current attack power
- `getSpellPower()`: Get current spell power

### PartyManager Methods

#### Party Management
- `addMember(character)`: Add character to party
- `removeMember(name)`: Remove character from party
- `setLeader(name)`: Set party leader
- `setFormation(type)`: Change party formation

#### Movement
- `moveParty(x, y)`: Move entire party to position
- `update(deltaTime)`: Update party movement
- `isMoving()`: Check if party is moving

#### Information
- `getPartyInfo()`: Get complete party information
- `getMemberByName(name)`: Get specific party member
- `getAllMembers()`: Get all party members

## Best Practices

### Character Creation
1. Start with clear concept (melee/ranged/magic/support)
2. Balance primary stats with job choice
3. Consider party composition
4. Choose equipment that complements build

### Party Management
1. Use appropriate formations for different situations
2. Keep party size optimal (2-4 characters)
3. Balance different roles (tank/healer/DPS)
4. Manage positioning for tactical advantage

### Performance Optimization
1. Cache frequently accessed stat calculations
2. Update party positions efficiently
3. Use object pooling for temporary effects
4. Batch UI updates during character creation

## Troubleshooting

### Common Issues

**Stat allocation not working**:
- Check available attribute points
- Verify stat minimum/maximum values
- Ensure point costs are correct

**Equipment bonuses not applying**:
- Verify item format and stat bonuses
- Check equipment slot compatibility
- Ensure character stats are recalculated after equipping

**Party movement stuttering**:
- Check collision detection settings
- Verify formation spacing
- Ensure smooth deltaTime values

**Job changes not taking effect**:
- Confirm job exists in job system
- Check for level requirements
- Verify stat recalculation

This character system provides a solid foundation for RPG gameplay while remaining flexible for customization and extension.