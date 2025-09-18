# 🧑‍🤝‍🧑 NPC and Dialog System Documentation

## Overview

The NPC and Dialog System provides a comprehensive framework for creating interactive non-player characters with complex dialog trees, conditional logic, and dynamic behaviors. The system integrates seamlessly with the existing game engine and provides extensive customization options through the NPC Creation Tool.

**Implementation Status**: ✅ **FULLY IMPLEMENTED** - Version 1.0.0
**Key Features**: Conditional Dialog Logic, Movement Patterns, Localization Support, Creation Tool

## Core Architecture

### NPC Class Architecture

The NPC system is built around the `NPC` class that extends `GameObject` from the game engine:

```javascript
class NPC extends GameObject {
    constructor(x, y, config = {})
    // Comprehensive NPC implementation with dialog, movement, and interaction
}
```

#### Key Components:
- **Dialog Integration**: Connects with DialogManager for conversation handling
- **Movement System**: Multiple movement patterns (idle, wander, patrol, follow, waypoint)
- **Schedule System**: Time-based behavior changes and event triggers
- **Interaction System**: Proximity-based player interaction detection
- **Animation System**: Sprite-based visual representation
- **Localization**: Multi-language text support

### Dialog Tree System

The dialog system uses a tree-based structure with nodes and choices:

```javascript
class DialogTree {
    constructor(config)
    // Tree-based dialog management with branching conversations
}

class DialogNode {
    constructor(config)
    // Individual dialog nodes with text, choices, and conditions
}

class DialogChoice {
    constructor(config)
    // Dialog choices with conditions and effects
}
```

## NPC Behavior Types

### Movement Patterns

1. **Static**: NPC remains in place, only moves when explicitly told
2. **Idle**: Occasional small movements, mostly stationary
3. **Wander**: Random movement within a defined radius
4. **Patrol**: Follows predefined waypoints in sequence
5. **Follow**: Moves towards and follows the player
6. **Waypoint**: Moves between specific predefined points

### Configuration Options

```javascript
const npcConfig = {
    id: 'tavern_keeper',
    name: 'Barnaby',
    displayName: 'Tavern Keeper',
    description: 'A gruff but friendly tavern owner',
    dialogId: 'tavern_dialog',
    sprite: 'sprites/npc_tavern_keeper.png',
    portrait: 'portraits/tavern_keeper.png',
    position: { x: 200, y: 150 },
    interactionRadius: 32,
    behaviorType: 'idle',
    movementPattern: 'wander',
    movementSpeed: 50,
    wanderRadius: 100,
    waypoints: [
        { x: 200, y: 150 },
        { x: 250, y: 150 },
        { x: 250, y: 200 }
    ],
    schedule: [
        {
            time: 32400000, // 9:00 AM in milliseconds from midnight
            type: 'visible',
            visible: true
        },
        {
            time: 72000000, // 8:00 PM
            type: 'visible',
            visible: false
        }
    ]
};
```

## Dialog Tree Mechanics

### Basic Dialog Structure

```javascript
const tavernDialog = {
    id: 'tavern_keeper',
    nodes: {
        start: {
            text: 'Welcome to the Rusty Mug! What can I get you?',
            speaker: 'Tavern Keeper',
            choices: [
                { text: 'I\'d like a room', goto: 'room_request' },
                { text: 'Tell me about the town', goto: 'town_info' },
                { text: 'Goodbye', goto: null }
            ]
        },
        room_request: {
            text: 'A room costs 10 gold. Stay as long as you like!',
            speaker: 'Tavern Keeper',
            choices: [
                {
                    text: 'Here\'s the gold',
                    goto: 'room_paid',
                    conditions: ['context.playerGold >= 10'],
                    effects: ['context.playerGold -= 10', 'set_flag.room_paid']
                },
                { text: 'Too expensive', goto: 'start' }
            ]
        }
    }
};
```

### Conditional Logic

#### Condition Types

1. **Flag Conditions**: Check global game flags
```javascript
condition: 'flag.quest_started'  // Check if quest_started flag is true
condition: 'flag.merchant_trust' // Check merchant trust level
```

2. **Context Conditions**: Check player or NPC state
```javascript
condition: 'context.playerLevel >= 5'  // Player level check
condition: 'context.playerGold >= 100' // Gold requirement
condition: 'context.hasQuestItem'       // Item possession check
```

3. **Complex Conditions**: Multiple requirements
```javascript
conditions: [
    'flag.quest_started',
    'context.playerLevel >= 5',
    'context.playerGold >= 50'
]
```

4. **Comparison Conditions**: Numeric comparisons
```javascript
condition: 'context.playerLevel > 10'      // Greater than
condition: 'context.playerGold >= 100'    // Greater than or equal
condition: 'context.playerStrength < 20'  // Less than
```

#### Effect Types

1. **Flag Effects**: Set or unset game flags
```javascript
effects: ['set_flag.quest_accepted']    // Set flag to true
effects: ['unset_flag.enemy_alive']     // Set flag to false
effects: ['set_flag.relationship += 5'] // Modify numeric flag
```

2. **Context Effects**: Modify player/NPC state
```javascript
effects: ['context.playerGold += 50']       // Add gold
effects: ['context.playerGold -= 10']       // Remove gold
effects: ['context.playerExperience += 100'] // Add experience
```

3. **Quest Effects**: Manage quest progression
```javascript
effects: ['quest.tavern_quest.start']       // Start quest
effects: ['quest.tavern_quest.complete']    // Complete quest
effects: ['quest.side_quest.fail']          // Fail quest
```

## Text Rendering System

### Typewriter Effects

The system includes advanced text rendering with typewriter effects:

```javascript
class TypewriterEffect {
    constructor()
    // Manages text display with typing animation
}

class TextBubble extends FormattedTextRenderer {
    constructor(x, y, width, height)
    // UI component for displaying dialog with typewriter effects
}
```

#### Features:
- **Customizable Speed**: Characters per second control
- **Sound Integration**: Optional typing sound effects
- **Skip Functionality**: Allow players to skip animation
- **Formatted Text**: Support for colors, sizes, and styles

### Text Formatting

Support for rich text formatting in dialog:

```javascript
// Color formatting
"<color=red>This text is red</color>"

// Size formatting
"<size=24>Large text</size> <size=12>Small text</size>"

// Style formatting
"<b>Bold text</b> <i>Italic text</i> <u>Underlined text</u>"

// Combined formatting
"<b><color=blue>Large blue bold text</color></b>"
```

## Localization Support

### Resource File Structure

```javascript
// en.json - English resources
{
    "npc": {
        "tavern_keeper": {
            "greeting": "Welcome to the tavern!",
            "farewell": "Come back soon!",
            "no_gold": "You don't have enough gold."
        }
    },
    "dialog": {
        "quest_offer": "I have a job for you...",
        "quest_accept": "Excellent! Here's your reward.",
        "quest_decline": "Maybe another time."
    }
}

// es.json - Spanish resources
{
    "npc": {
        "tavern_keeper": {
            "greeting": "¡Bienvenido a la taberna!",
            "farewell": "¡Vuelve pronto!",
            "no_gold": "No tienes suficiente oro."
        }
    }
}
```

### Usage in Dialog

```javascript
const localizedDialog = {
    nodes: {
        greeting: {
            text: 'npc.tavern_keeper.greeting',
            speaker: 'npc.tavern_keeper.name',
            choices: [
                {
                    text: 'dialog.accept_quest',
                    goto: 'quest_details'
                }
            ]
        }
    }
};
```

## NPC Creation Tool

### Overview

The NPC Creation Tool provides a comprehensive interface for creating and configuring NPCs:

```javascript
class NPCCreationTool {
    constructor(engine, uiManager)
    // Complete NPC creation and configuration interface
}
```

### Tool Features

#### 1. Basic Configuration Tab
- **NPC Properties**: Name, display name, description
- **Visual Settings**: Sprite and portrait selection
- **Position Settings**: X/Y coordinates and interaction radius
- **Basic Validation**: Input validation and error checking

#### 2. Dialog Editor Tab
- **Node Management**: Create, edit, and delete dialog nodes
- **Choice Configuration**: Set up branching conversations
- **Condition Builder**: Visual condition and effect editor
- **Preview System**: Test dialog flow before saving

#### 3. Behavior Configuration Tab
- **Movement Patterns**: Select and configure NPC movement
- **Waypoint Editor**: Visual waypoint placement
- **Parameter Tuning**: Speed, radius, duration settings
- **Real-time Preview**: Test movement patterns

#### 4. Schedule System Tab
- **Time-based Events**: Schedule behavior changes
- **Event Types**: Movement, behavior, dialog, visibility changes
- **Time Format**: HH:MM time specification
- **Schedule Validation**: Conflict detection and resolution

#### 5. Preview and Export Tab
- **Live Preview**: Test NPC in game environment
- **Dialog Testing**: Interactive dialog preview
- **Movement Testing**: Behavior pattern validation
- **Export Options**: JSON export for NPC and dialog data

### Tool Integration

The creation tool integrates with:
- **UIManager**: For UI components and theming
- **DialogManager**: For dialog tree management
- **ResourceManager**: For asset loading and management
- **ValidationHelpers**: For input validation and error checking

## Usage Examples

### Creating a Simple NPC

```javascript
import { NPC } from './src/core/NPC.js';
import { DialogTree } from './src/core/DialogTree.js';

// Create dialog tree
const guardDialog = new DialogTree({
    id: 'town_guard',
    nodes: {
        greeting: {
            text: 'Halt! What business do you have here?',
            speaker: 'Town Guard',
            choices: [
                { text: 'Just passing through', goto: 'casual' },
                { text: 'I need directions', goto: 'directions' },
                { text: 'Nothing, goodbye', goto: null }
            ]
        },
        casual: {
            text: 'Very well. Keep the peace.',
            speaker: 'Town Guard',
            autoAdvance: true,
            nextNode: null
        },
        directions: {
            text: 'The inn is to the east, market to the north.',
            speaker: 'Town Guard',
            autoAdvance: true,
            nextNode: null
        }
    }
});

// Create NPC
const guard = new NPC(300, 200, {
    id: 'town_guard',
    name: 'Town Guard',
    displayName: 'Town Guard',
    dialogId: 'town_guard',
    behaviorType: 'static',
    movementPattern: 'idle'
});

// Add to scene
scene.addGameObject(guard);
scene.dialogManager.loadDialog('town_guard', guardDialog.toDialogManagerFormat());
```

### Advanced NPC with Schedule

```javascript
const shopkeeper = new NPC(400, 300, {
    id: 'shopkeeper',
    name: 'Elena',
    displayName: 'Shopkeeper Elena',
    dialogId: 'shop_dialog',
    behaviorType: 'idle',
    movementPattern: 'wander',
    wanderRadius: 50,
    schedule: [
        {
            time: 28800000, // 8:00 AM
            type: 'visible',
            visible: true
        },
        {
            time: 61200000, // 5:00 PM
            type: 'behavior',
            behavior: 'idle'
        },
        {
            time: 72000000, // 8:00 PM
            type: 'visible',
            visible: false
        }
    ]
});
```

### Conditional Dialog Example

```javascript
const questDialog = new DialogTree({
    id: 'quest_giver',
    nodes: {
        greeting: {
            text: 'Have you completed my quest?',
            speaker: 'Quest Giver',
            choices: [
                {
                    text: 'Yes, here\'s the item',
                    goto: 'quest_complete',
                    conditions: ['context.hasQuestItem', 'flag.quest_accepted'],
                    effects: ['quest.main_quest.complete', 'context.playerGold += 100']
                },
                {
                    text: 'Not yet',
                    goto: 'quest_reminder',
                    conditions: ['flag.quest_accepted']
                },
                {
                    text: 'What quest?',
                    goto: 'quest_offer',
                    conditions: ['!flag.quest_accepted']
                }
            ]
        },
        quest_complete: {
            text: 'Excellent! Here\'s your reward.',
            speaker: 'Quest Giver',
            autoAdvance: true,
            nextNode: null
        }
    }
});
```

## Integration with Game Systems

### Player Interaction

```javascript
// Handle player interaction with NPCs
scene.on('player-interact-npc', (npc) => {
    const distance = player.distanceTo(npc);
    if (distance <= npc.interactionRadius) {
        npc.handleInteraction(player);
    }
});
```

### Quest Integration

```javascript
// Update quest flags through dialog
dialogManager.on('choice-selected', (choice) => {
    if (choice.effects) {
        choice.effects.forEach(effect => {
            if (effect.startsWith('quest.')) {
                // Update quest system
                questManager.handleDialogEffect(effect);
            }
        });
    }
});
```

### Save/Load Integration

```javascript
// Save NPC state
const npcState = npc.toJSON();

// Load NPC state
const loadedNPC = NPC.fromJSON(savedState);
scene.addGameObject(loadedNPC);
```

## Performance Considerations

### Optimization Techniques

1. **Object Pooling**: Reuse NPC instances for better memory management
2. **Distance Culling**: Only update NPCs within certain distance of player
3. **Dialog Caching**: Cache parsed dialog trees to reduce loading time
4. **Schedule Optimization**: Pre-process schedules for efficient time checking

### Memory Management

```javascript
// Clean up unused resources
npc.destroy();
// Remove from scene
scene.removeGameObject(npc);
// Clear dialog cache if needed
dialogManager.clearCache();
```

## Best Practices

### Dialog Design
- Keep dialog nodes focused and concise
- Use clear, branching choices for player agency
- Test all dialog paths for consistency
- Use conditions to create dynamic conversations

### NPC Behavior
- Choose appropriate movement patterns for NPC personality
- Use schedules to create realistic daily routines
- Balance static and dynamic elements
- Consider player interaction radius for accessibility

### Performance
- Limit active NPCs in dense areas
- Use appropriate update frequencies
- Cache frequently used resources
- Profile and optimize dialog evaluation

## Troubleshooting

### Common Issues

1. **Dialog not showing**: Check dialog ID matches and DialogManager integration
2. **NPC not moving**: Verify movement pattern configuration and waypoints
3. **Conditions not working**: Check condition syntax and context variables
4. **Localization errors**: Verify resource file paths and key existence

### Debug Tools

```javascript
// Enable NPC debug mode
npc.debug = true;

// Log dialog evaluation
dialogManager.debug = true;

// Check active schedules
console.log(npc.schedule);
```

## Future Enhancements

- **Voice Acting Integration**: Automatic voice line triggering
- **Advanced AI**: Pathfinding and complex behavior trees
- **Dynamic Dialog Generation**: Procedural conversation creation
- **Multi-language Voice Support**: Synchronized voice and text
- **Performance Analytics**: Detailed NPC interaction metrics

---

## Summary

The NPC and Dialog System provides:

- ✅ **Complete NPC Framework**: Full-featured NPC class with movement and interaction
- ✅ **Advanced Dialog Trees**: Branching conversations with conditional logic
- ✅ **Movement Patterns**: Multiple AI behaviors for realistic NPC movement
- ✅ **Schedule System**: Time-based behavior changes and events
- ✅ **Text Rendering**: Typewriter effects and rich text formatting
- ✅ **Localization Support**: Multi-language text and resource management
- ✅ **Creation Tool**: Comprehensive NPC and dialog editor
- ✅ **Game Integration**: Seamless integration with existing systems
- ✅ **Performance Optimized**: Efficient memory management and rendering
- ✅ **Extensible Architecture**: Easy to add new features and behaviors

The system enables creation of rich, interactive game worlds with complex NPC interactions, dynamic conversations, and immersive player experiences.