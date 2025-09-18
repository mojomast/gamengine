# Quest System Documentation

## Overview

The Quest System provides a comprehensive framework for managing quests, objectives, rewards, and story progression in the RPG engine. It integrates with the EventBus for objective tracking, ValidationHelpers for data validation, and DialogManager for conditional logic and state management.

## Architecture

### Core Classes

#### Quest
The main quest container that holds all quest data and manages quest lifecycle.

```javascript
const quest = new Quest({
    id: 'main_quest_01',
    title: 'The Journey Begins',
    description: 'Start your adventure by leaving the village',
    type: QuestType.MAIN_STORY,
    level: 1,
    giver: 'village_elder',
    objectives: [...],
    rewards: [...],
    prerequisites: ['flag.tutorial_completed']
});
```

#### QuestObjective
Represents individual objectives within a quest with progress tracking and validation.

```javascript
const objective = new QuestObjective({
    id: 'collect_sword',
    type: ObjectiveType.COLLECT,
    description: 'Find the lost sword',
    required: 1,
    targetId: 'iron_sword',
    condition: 'flag.has_map'  // DialogManager condition
});
```

#### QuestReward
Handles different types of quest rewards and their application.

```javascript
const reward = new QuestReward({
    type: 'item',
    amount: 1,
    itemId: 'magic_sword'
});
```

#### QuestManager
Central manager that handles quest state, objective tracking, and event coordination.

```javascript
const questManager = new QuestManager(eventBus, dialogManager);
questManager.addQuest(quest);
questManager.acceptQuest('main_quest_01');
```

## Quest States

- **INACTIVE**: Quest not yet available
- **AVAILABLE**: Quest can be accepted
- **ACTIVE**: Quest is currently being worked on
- **COMPLETED**: Quest objectives fulfilled
- **FAILED**: Quest failed (if applicable)
- **TURNED_IN**: Quest completed and rewards claimed

## Quest Types

- **MAIN_STORY**: Critical storyline quests
- **SIDE_QUEST**: Optional quests for extra content
- **REPEATABLE**: Quests that can be completed multiple times

## Objective Types

### Standard Objectives

- **COLLECT**: Gather X items
- **KILL**: Defeat X enemies
- **TALK**: Speak to NPC
- **DELIVER**: Deliver item to NPC
- **EXPLORE**: Visit location
- **FLAG**: Set game flag

### Custom Objectives

- **CUSTOM**: Use custom validation logic

## Objective Tracking

Objectives are automatically tracked through the EventBus system. When game events occur (enemy killed, item collected, etc.), the QuestManager updates relevant objectives.

```javascript
// Example: Killing an enemy
EventBus.emit('enemy-killed', {
    enemyId: 'goblin',
    amount: 1
});

// QuestManager automatically updates objectives listening for 'kill' type
```

## Conditional Logic

### Prerequisites

Quests can have prerequisites that must be met before they become available:

```javascript
quest.prerequisites = [
    'quest.tutorial_complete',  // Completed quest
    'flag.has_map',             // Game flag set
    'level.5'                   // Party level requirement
];
```

### Objective Conditions

Objectives can have additional completion conditions:

```javascript
objective.condition = 'flag.has_key && !flag.door_locked';
```

Conditions are evaluated using DialogManager.evaluateCondition() which supports:
- Flag checks: `flag.has_key`
- Context variables: `context.player_level > 10`
- Complex expressions: `flag.has_key && context.gold >= 100`

## Reward System

### Reward Types

- **gold**: Currency reward
- **experience**: XP for party members
- **item**: Specific item from database

### Reward Application

```javascript
const context = {
    party: [playerCharacter],
    inventory: playerInventory,
    itemDatabase: gameItemDatabase
};

reward.apply(context);
```

## Quest Chains and Dependencies

Quests can form chains where completion unlocks subsequent quests:

```javascript
// Quest A prerequisites
questA.prerequisites = [];

// Quest B requires Quest A completion
questB.prerequisites = ['quest.quest_a_complete'];

// Quest C requires both A and B, plus a flag
questC.prerequisites = [
    'quest.quest_a_complete',
    'quest.quest_b_complete',
    'flag.special_event_occurred'
];
```

## Dialog Integration

Quests integrate with the DialogManager for:
- Quest acceptance dialogs
- Quest completion dialogs
- Conditional NPC responses based on quest state
- Story progression triggers

```javascript
// Dialog condition based on quest state
dialogTree.nodes.start.choices[0].condition = 'quest.main_quest_01.active';

// Dialog that sets quest completion
dialogTree.nodes.end.effects = ['quest.complete.main_quest_01'];
```

## Quest Creation Tool

### Interface Overview

The QuestCreationTool provides a tabbed interface for quest creation:

1. **Basic Info**: Title, description, type, level, giver
2. **Objectives**: Add/edit objectives with validation
3. **Rewards**: Configure rewards (gold, XP, items)
4. **Conditions**: Set prerequisites and validation rules
5. **Save/Load**: Export/import quest data

### Creating a Quest

```javascript
const tool = new QuestCreationTool(x, y, width, height, questManager, dialogManager);
tool.newQuest();

// Configure basic info
tool.currentQuest.title = 'Lost Treasure';
tool.currentQuest.description = 'Find the hidden treasure in the cave';

// Add objectives
tool.currentQuest.objectives.push(new QuestObjective({
    id: 'find_cave',
    type: ObjectiveType.EXPLORE,
    description: 'Locate the hidden cave',
    required: 1,
    location: 'hidden_cave_entrance'
}));

// Add rewards
tool.currentQuest.rewards.push(new QuestReward({
    type: 'gold',
    amount: 500
}));

// Save quest
tool.saveQuest();
```

### Validation

The creation tool validates:
- Required fields presence
- Objective type validity
- Condition syntax
- Reward configuration
- Prerequisite format

## Quest Journal Interface

### Features

- **Tabbed View**: Active, Available, Completed quests
- **Progress Indicators**: Visual progress bars for objectives
- **Detailed Information**: Full quest descriptions and requirements
- **Real-time Updates**: Automatic refresh on quest progress

### Usage

```javascript
const journal = new QuestJournal(x, y, width, height, questManager);
journal.show();

// Journal automatically updates when:
// - Quests are accepted/completed
// - Objectives progress
// - New quests become available
```

## Event System Integration

The quest system integrates with the EventBus for:

### Emitted Events
- `quest-added`: New quest added to system
- `quest-accepted`: Quest accepted by player
- `quest-completed`: Quest objectives fulfilled
- `quest-turned-in`: Quest rewards claimed
- `quest-failed`: Quest failed
- `objective-completed`: Individual objective completed
- `quest-progress-updated`: Quest progress changed
- `reward-granted`: Reward applied to player

### Listened Events
- `enemy-killed`: Updates kill objectives
- `item-collected`: Updates collect objectives
- `location-visited`: Updates explore objectives
- `npc-talked`: Updates talk objectives
- `item-delivered`: Updates deliver objectives
- `game-flag-changed`: Updates flag objectives and availability

## Save/Load System

Quest data is fully serializable for save games:

```javascript
// Serialize quest manager state
const saveData = questManager.serialize();

// Restore from save
questManager.deserialize(saveData);
```

## Best Practices

### Quest Design
1. **Clear Objectives**: Make objective requirements obvious to players
2. **Balanced Rewards**: Scale rewards appropriately to difficulty
3. **Logical Prerequisites**: Ensure quest chains make narrative sense
4. **Fallback Conditions**: Provide alternative completion paths

### Technical Guidelines
1. **Unique IDs**: Use descriptive, unique quest and objective IDs
2. **Error Handling**: Validate all quest data before saving
3. **Performance**: Limit objectives per quest (max 10 recommended)
4. **Testing**: Test quest completion under various conditions

### Integration Tips
1. **Event Naming**: Use consistent event naming conventions
2. **Context Updates**: Keep quest manager context synchronized
3. **Condition Testing**: Test conditions in different game states
4. **Reward Validation**: Verify reward application works correctly

## Troubleshooting

### Common Issues

1. **Objectives not progressing**: Check EventBus event emission
2. **Quests not available**: Verify prerequisite conditions
3. **Rewards not applied**: Check reward context and inventory integration
4. **Conditions failing**: Validate DialogManager condition syntax

### Debug Commands

```javascript
// Check quest manager state
console.log(questManager.getQuestProgress());

// Test condition evaluation
console.log(questManager.evaluateCondition('flag.test_flag'));

// Force quest completion (debug only)
questManager.acceptQuest('debug_quest');
```

## Future Enhancements

- **Branching Quests**: Multiple completion paths
- **Timed Quests**: Time-limited objectives
- **Dynamic Rewards**: Rewards based on performance
- **Quest Sharing**: Party-wide quest progress
- **Quest Templates**: Reusable quest structures