/**
 * Quest System - Core quest mechanics for RPG game
 * Implements quest data structures, objective tracking, and quest management
 */

import { ValidationHelpers } from '../../game-engine/src/core/ValidationHelpers.js';
import { EventBus } from '../../game-engine/src/core/EventBus.js';

/**
 * Quest states enumeration
 */
export const QuestState = {
    INACTIVE: 'inactive',     // Quest not yet available
    AVAILABLE: 'available',   // Quest can be accepted
    ACTIVE: 'active',         // Quest is currently being worked on
    COMPLETED: 'completed',   // Quest objectives fulfilled
    FAILED: 'failed',         // Quest failed (if applicable)
    TURNED_IN: 'turned_in'    // Quest completed and rewards claimed
};

/**
 * Quest types enumeration
 */
export const QuestType = {
    MAIN_STORY: 'main_story',     // Main storyline quest
    SIDE_QUEST: 'side_quest',     // Optional side quest
    REPEATABLE: 'repeatable'      // Can be completed multiple times
};

/**
 * Objective types enumeration
 */
export const ObjectiveType = {
    COLLECT: 'collect',           // Collect X items
    KILL: 'kill',                 // Kill X enemies
    TALK: 'talk',                 // Talk to NPC
    DELIVER: 'deliver',           // Deliver item to NPC
    EXPLORE: 'explore',           // Visit location
    FLAG: 'flag',                 // Set game flag
    CUSTOM: 'custom'              // Custom condition
};

/**
 * Quest Objective class
 */
export class QuestObjective {
    constructor(config) {
        ValidationHelpers.validateObject(config, ['id', 'type', 'description'], 'config');

        this.id = ValidationHelpers.validateType(config.id, 'string', 'config.id');
        this.type = ValidationHelpers.validateType(config.type, 'string', 'config.type');
        this.description = ValidationHelpers.validateType(config.description, 'string', 'config.description');

        // Validate objective type
        if (!Object.values(ObjectiveType).includes(this.type)) {
            throw new ValidationHelpers.ValidationError(
                `Invalid objective type: ${this.type}. Must be one of: ${Object.values(ObjectiveType).join(', ')}`,
                'config.type'
            );
        }

        this.required = ValidationHelpers.validateRange(config.required || 1, 1, 10000, 'config.required');
        this.current = ValidationHelpers.validateRange(config.current || 0, 0, this.required, 'config.current');
        this.completed = this.current >= this.required;

        // Type-specific data
        this.targetId = config.targetId ? ValidationHelpers.validateType(config.targetId, 'string', 'config.targetId') : null;
        this.location = config.location ? ValidationHelpers.validateType(config.location, 'string', 'config.location') : null;
        this.metadata = config.metadata || {};

        // Complex condition support
        this.condition = config.condition || null; // DialogManager condition string
        this.customValidator = config.customValidator || null; // Custom validation function

        // Event tracking
        this.eventListeners = new Map();
    }

    /**
     * Update objective progress
     * @param {number} amount - Amount to add to current progress
     * @returns {boolean} - True if objective completed
     */
    updateProgress(amount) {
        ValidationHelpers.validatePositiveNumber(amount, 'amount');

        const oldCompleted = this.completed;
        this.current = Math.min(this.current + amount, this.required);
        this.completed = this.current >= this.required;

        // Emit event if newly completed
        if (!oldCompleted && this.completed) {
            EventBus.emit('objective-completed', {
                objectiveId: this.id,
                questId: this.questId
            });
        }

        return this.completed;
    }

    /**
     * Check if objective is completed
     * @returns {boolean}
     */
    isCompleted() {
        return this.completed;
    }

    /**
     * Get progress percentage (0-1)
     * @returns {number}
     */
    getProgress() {
        return Math.min(this.current / this.required, 1);
    }

    /**
     * Check if objective can be completed (including condition validation)
     * @param {object} context - Context object with game state
     * @returns {boolean}
     */
    canComplete(context = {}) {
        // Basic progress check
        if (this.current < this.required) {
            return false;
        }

        // Condition check if present
        if (this.condition) {
            const questManager = context.questManager;
            if (questManager && questManager.evaluateCondition) {
                return questManager.evaluateCondition(this.condition);
            }
        }

        // Custom validator check
        if (this.customValidator && typeof this.customValidator === 'function') {
            return this.customValidator(this, context);
        }

        return true;
    }

    /**
     * Mark objective as completed if conditions are met
     * @param {object} context - Context object with game state
     * @returns {boolean} - True if successfully completed
     */
    tryComplete(context = {}) {
        if (!this.completed && this.canComplete(context)) {
            this.completed = true;
            EventBus.emit('objective-completed', {
                objectiveId: this.id,
                questId: this.questId
            });
            return true;
        }
        return false;
    }

    /**
     * Reset objective progress
     */
    reset() {
        this.current = 0;
        this.completed = false;
    }

    /**
     * Serialize objective data
     * @returns {object}
     */
    serialize() {
        return {
            id: this.id,
            type: this.type,
            description: this.description,
            required: this.required,
            current: this.current,
            completed: this.completed,
            targetId: this.targetId,
            location: this.location,
            metadata: this.metadata,
            condition: this.condition,
            customValidator: this.customValidator ? this.customValidator.toString() : null
        };
    }

    /**
     * Deserialize objective data
     * @param {object} data
     */
    static deserialize(data) {
        ValidationHelpers.validateObject(data, ['id', 'type', 'description'], 'data');
        return new QuestObjective(data);
    }
}

/**
 * Quest Reward class
 */
export class QuestReward {
    constructor(config) {
        ValidationHelpers.validateObject(config, ['type'], 'config');

        this.type = ValidationHelpers.validateType(config.type, 'string', 'config.type');
        this.amount = ValidationHelpers.validatePositiveNumber(config.amount || 1, 'config.amount');
        this.itemId = config.itemId ? ValidationHelpers.validateType(config.itemId, 'string', 'config.itemId') : null;
        this.description = config.description || this.generateDescription();
        this.metadata = config.metadata || {};
    }

    /**
     * Generate default description
     * @returns {string}
     */
    generateDescription() {
        switch (this.type) {
            case 'gold':
                return `${this.amount} gold`;
            case 'experience':
                return `${this.amount} experience`;
            case 'item':
                return `Item: ${this.itemId}`;
            default:
                return `${this.type}: ${this.amount}`;
        }
    }

    /**
     * Apply reward to character/party
     * @param {object} context - Context object with character, inventory, etc.
     * @returns {object} - Result of reward application
     */
    apply(context) {
        ValidationHelpers.validateObject(context, [], 'context');
        let success = false;
        let message = '';

        try {
            switch (this.type) {
                case 'gold':
                    if (context.party && context.party.length > 0) {
                        // Add gold to party leader
                        if (context.party[0] && typeof context.party[0].gold !== 'undefined') {
                            context.party[0].gold += this.amount;
                            success = true;
                            message = `Received ${this.amount} gold`;
                        }
                    }
                    break;
                case 'experience':
                    if (context.party && context.party.length > 0) {
                        context.party.forEach(member => {
                            if (member && member.gainExperience) {
                                member.gainExperience(this.amount);
                            }
                        });
                        success = true;
                        message = `Party gained ${this.amount} experience each`;
                    }
                    break;
                case 'item':
                    if (context.inventory && context.inventory.addItem && this.itemId) {
                        // Need to create the item from item database
                        if (context.itemDatabase && context.itemDatabase.getItem) {
                            const itemTemplate = context.itemDatabase.getItem(this.itemId);
                            if (itemTemplate) {
                                const item = itemTemplate.clone ? itemTemplate.clone(this.amount) : Object.assign({}, itemTemplate);
                                item.quantity = this.amount;
                                const addResult = context.inventory.addItem(item);
                                if (addResult.success) {
                                    success = true;
                                    message = `Received ${this.amount}x ${item.name}`;
                                } else {
                                    message = `Could not add item: ${addResult.reason}`;
                                }
                            } else {
                                message = `Item ${this.itemId} not found in database`;
                            }
                        }
                    }
                    break;
            }

            if (success) {
                EventBus.emit('reward-granted', {
                    type: this.type,
                    amount: this.amount,
                    itemId: this.itemId,
                    description: this.description
                });
            }
        } catch (error) {
            console.warn(`Failed to apply reward ${this.type}:`, error);
            message = `Failed to apply reward: ${error.message}`;
        }

        return { success, message };
    }

    /**
     * Serialize reward data
     * @returns {object}
     */
    serialize() {
        return {
            type: this.type,
            amount: this.amount,
            itemId: this.itemId,
            description: this.description,
            metadata: this.metadata
        };
    }

    /**
     * Deserialize reward data
     * @param {object} data
     */
    static deserialize(data) {
        ValidationHelpers.validateObject(data, ['type'], 'data');
        return new QuestReward(data);
    }
}

/**
 * Main Quest class
 */
export class Quest {
    constructor(config) {
        ValidationHelpers.validateObject(config, ['id', 'title', 'description'], 'config');

        this.id = ValidationHelpers.validateType(config.id, 'string', 'config.id');
        this.title = ValidationHelpers.validateType(config.title, 'string', 'config.title');
        this.description = ValidationHelpers.validateType(config.description, 'string', 'config.description');

        this.type = ValidationHelpers.validateType(config.type || QuestType.SIDE_QUEST, 'string', 'config.type');
        if (!Object.values(QuestType).includes(this.type)) {
            throw new ValidationHelpers.ValidationError(
                `Invalid quest type: ${this.type}. Must be one of: ${Object.values(QuestType).join(', ')}`,
                'config.type'
            );
        }

        this.state = ValidationHelpers.validateType(config.state || QuestState.INACTIVE, 'string', 'config.state');
        if (!Object.values(QuestState).includes(this.state)) {
            throw new ValidationHelpers.ValidationError(
                `Invalid quest state: ${this.state}. Must be one of: ${Object.values(QuestState).join(', ')}`,
                'config.state'
            );
        }

        // Prerequisites
        this.prerequisites = config.prerequisites || [];
        ValidationHelpers.validateArray(this.prerequisites, 0, 100, 'config.prerequisites');

        // Objectives
        this.objectives = [];
        if (config.objectives) {
            ValidationHelpers.validateArray(config.objectives, 1, 50, 'config.objectives');
            this.objectives = config.objectives.map(obj => {
                const objective = new QuestObjective(obj);
                objective.questId = this.id; // Link back to quest
                return objective;
            });
        }

        // Rewards
        this.rewards = [];
        if (config.rewards) {
            ValidationHelpers.validateArray(config.rewards, 0, 20, 'config.rewards');
            this.rewards = config.rewards.map(reward => new QuestReward(reward));
        }

        // Metadata
        this.level = config.level || 1;
        this.giver = config.giver || null; // NPC who gives the quest
        this.metadata = config.metadata || {};

        // Tracking
        this.acceptedAt = config.acceptedAt || null;
        this.completedAt = config.completedAt || null;
        this.failedAt = config.failedAt || null;

        // Event listeners
        this.eventListeners = new Map();
    }

    /**
     * Check if quest can be accepted
     * @param {object} context - Game context with flags, completed quests, etc.
     * @returns {boolean}
     */
    canAccept(context = {}) {
        if (this.state !== QuestState.AVAILABLE && this.state !== QuestState.INACTIVE) {
            return false;
        }

        // Check prerequisites
        for (const prereq of this.prerequisites) {
            if (!this.checkPrerequisite(prereq, context)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check individual prerequisite
     * @param {string} prereq - Prerequisite condition
     * @param {object} context - Game context
     * @returns {boolean}
     */
    checkPrerequisite(prereq, context) {
        // Simple prerequisite checking - can be extended
        if (prereq.startsWith('quest.')) {
            const questId = prereq.substring(6);
            return context.completedQuests && context.completedQuests.has(questId);
        }
        if (prereq.startsWith('flag.')) {
            const flag = prereq.substring(5);
            return context.gameFlags && context.gameFlags.get(flag);
        }
        if (prereq.startsWith('level.')) {
            const minLevel = parseInt(prereq.substring(6));
            return context.partyLevel && context.partyLevel >= minLevel;
        }
        return true;
    }

    /**
     * Accept the quest
     * @param {object} context - Game context
     */
    accept(context = {}) {
        if (!this.canAccept(context)) {
            throw new Error(`Quest ${this.id} cannot be accepted`);
        }

        this.state = QuestState.ACTIVE;
        this.acceptedAt = Date.now();

        // Set up objective tracking
        this.setupObjectiveTracking();

        EventBus.emit('quest-accepted', {
            questId: this.id,
            quest: this
        });
    }

    /**
     * Setup objective event tracking
     */
    setupObjectiveTracking() {
        this.objectives.forEach(objective => {
            switch (objective.type) {
                case ObjectiveType.KILL:
                    // Listen for enemy killed events
                    objective.eventListeners.set('enemy-killed',
                        EventBus.on('enemy-killed', (data) => {
                            if (data.enemyId === objective.targetId) {
                                objective.updateProgress(data.amount || 1);
                                this.checkCompletion();
                            }
                        })
                    );
                    break;
                case ObjectiveType.COLLECT:
                    // Listen for item collected events
                    objective.eventListeners.set('item-collected',
                        EventBus.on('item-collected', (data) => {
                            if (data.itemId === objective.targetId) {
                                objective.updateProgress(data.amount || 1);
                                this.checkCompletion();
                            }
                        })
                    );
                    break;
                case ObjectiveType.EXPLORE:
                    // Listen for location visited events
                    objective.eventListeners.set('location-visited',
                        EventBus.on('location-visited', (data) => {
                            if (data.locationId === objective.location) {
                                objective.updateProgress(1);
                                this.checkCompletion();
                            }
                        })
                    );
                    break;
                case ObjectiveType.TALK:
                    // Listen for NPC talked events
                    objective.eventListeners.set('npc-talked',
                        EventBus.on('npc-talked', (data) => {
                            if (data.npcId === objective.targetId) {
                                objective.updateProgress(1);
                                this.checkCompletion();
                            }
                        })
                    );
                    break;
                case ObjectiveType.DELIVER:
                    // Listen for item delivered events
                    objective.eventListeners.set('item-delivered',
                        EventBus.on('item-delivered', (data) => {
                            if (data.itemId === objective.targetId && data.npcId === objective.location) {
                                objective.updateProgress(data.amount || 1);
                                this.checkCompletion();
                            }
                        })
                    );
                    break;
                case ObjectiveType.FLAG:
                    // Listen for flag set events
                    objective.eventListeners.set('flag-set',
                        EventBus.on('game-flag-changed', (data) => {
                            if (data.flag === objective.targetId && data.value) {
                                objective.updateProgress(1);
                                this.checkCompletion();
                            }
                        })
                    );
                    break;
            }
        });
    }

    /**
     * Check if quest is completed
     * @returns {boolean}
     */
    checkCompletion() {
        const allObjectivesComplete = this.objectives.every(obj => obj.isCompleted());

        if (allObjectivesComplete && this.state === QuestState.ACTIVE) {
            this.state = QuestState.COMPLETED;
            this.completedAt = Date.now();

            // Clean up event listeners
            this.cleanupEventListeners();

            EventBus.emit('quest-completed', {
                questId: this.id,
                quest: this
            });

            return true;
        }

        return false;
    }

    /**
     * Turn in quest and claim rewards
     * @param {object} context - Game context with character, inventory, etc.
     */
    turnIn(context = {}) {
        if (this.state !== QuestState.COMPLETED) {
            throw new Error(`Quest ${this.id} is not completed`);
        }

        // Apply rewards
        this.rewards.forEach(reward => {
            reward.apply(context);
        });

        this.state = QuestState.TURNED_IN;

        EventBus.emit('quest-turned-in', {
            questId: this.id,
            quest: this,
            rewards: this.rewards
        });
    }

    /**
     * Fail the quest
     * @param {string} reason - Reason for failure
     */
    fail(reason = 'Unknown') {
        this.state = QuestState.FAILED;
        this.failedAt = Date.now();

        // Clean up event listeners
        this.cleanupEventListeners();

        EventBus.emit('quest-failed', {
            questId: this.id,
            quest: this,
            reason: reason
        });
    }

    /**
     * Get quest progress summary
     * @returns {object}
     */
    getProgress() {
        return {
            id: this.id,
            title: this.title,
            state: this.state,
            objectives: this.objectives.map(obj => ({
                id: obj.id,
                description: obj.description,
                current: obj.current,
                required: obj.required,
                progress: obj.getProgress(),
                completed: obj.completed
            })),
            overallProgress: this.getOverallProgress()
        };
    }

    /**
     * Get overall quest progress (0-1)
     * @returns {number}
     */
    getOverallProgress() {
        if (this.objectives.length === 0) return 1;
        const totalProgress = this.objectives.reduce((sum, obj) => sum + obj.getProgress(), 0);
        return totalProgress / this.objectives.length;
    }

    /**
     * Clean up event listeners
     */
    cleanupEventListeners() {
        this.objectives.forEach(objective => {
            objective.eventListeners.forEach(off => off());
            objective.eventListeners.clear();
        });
    }

    /**
     * Serialize quest data
     * @returns {object}
     */
    serialize() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            type: this.type,
            state: this.state,
            prerequisites: this.prerequisites,
            objectives: this.objectives.map(obj => obj.serialize()),
            rewards: this.rewards.map(reward => reward.serialize()),
            level: this.level,
            giver: this.giver,
            metadata: this.metadata,
            acceptedAt: this.acceptedAt,
            completedAt: this.completedAt,
            failedAt: this.failedAt
        };
    }

    /**
     * Deserialize quest data
     * @param {object} data
     */
    static deserialize(data) {
        ValidationHelpers.validateObject(data, ['id', 'title', 'description'], 'data');
        return new Quest(data);
    }

    /**
     * Destroy quest and clean up resources
     */
    destroy() {
        this.cleanupEventListeners();
        this.eventListeners.clear();
    }
}
/**
 * Quest Manager - Manages quest state, objective tracking, and quest progression
 */
export class QuestManager {
    constructor(eventBus, dialogManager) {
        this.eventBus = eventBus || EventBus;
        this.dialogManager = dialogManager;

        this.quests = new Map(); // questId -> Quest
        this.activeQuests = new Set(); // Set of active quest IDs
        this.completedQuests = new Set(); // Set of completed quest IDs
        this.availableQuests = new Set(); // Set of available quest IDs

        // Context for prerequisite checking
        this.context = {
            completedQuests: this.completedQuests,
            gameFlags: new Map(),
            partyLevel: 1
        };

        this.setupEventListeners();
    }

    /**
     * Setup event listeners for objective tracking
     */
    setupEventListeners() {
        // Listen for quest-related events
        this.eventBus.on('quest-accepted', (data) => {
            this.activeQuests.add(data.questId);
            this.availableQuests.delete(data.questId);
        });

        this.eventBus.on('quest-completed', (data) => {
            this.activeQuests.delete(data.questId);
        });

        this.eventBus.on('quest-turned-in', (data) => {
            this.completedQuests.add(data.questId);
            this.updateAvailableQuests();
        });

        // Listen for objective progress events
        this.eventBus.on('enemy-killed', (data) => {
            this.updateObjectiveProgress('kill', data.enemyId, data.amount || 1);
        });

        this.eventBus.on('item-collected', (data) => {
            this.updateObjectiveProgress('collect', data.itemId, data.amount || 1);
        });

        this.eventBus.on('location-visited', (data) => {
            this.updateObjectiveProgress('explore', data.locationId, 1);
        });

        this.eventBus.on('npc-talked', (data) => {
            this.updateObjectiveProgress('talk', data.npcId, 1);
        });

        this.eventBus.on('item-delivered', (data) => {
            this.updateObjectiveProgress('deliver', data.itemId, data.amount || 1, data.npcId);
        });

        this.eventBus.on('game-flag-changed', (data) => {
            this.context.gameFlags.set(data.flag, data.value);
            this.updateObjectiveProgress('flag', data.flag, 1);
            this.updateAvailableQuests();
        });
    }

    /**
     * Update objective progress for all active quests
     * @param {string} type - Objective type
     * @param {string} targetId - Target ID
     * @param {number} amount - Amount to progress
     * @param {string} extraData - Extra data for specific objective types
     */
    updateObjectiveProgress(type, targetId, amount = 1, extraData = null) {
        let progressMade = false;

        for (const questId of this.activeQuests) {
            const quest = this.quests.get(questId);
            if (!quest) continue;

            quest.objectives.forEach(objective => {
                if (objective.type === type) {
                    let matches = false;

                    switch (type) {
                        case 'kill':
                        case 'collect':
                        case 'talk':
                        case 'explore':
                            matches = objective.targetId === targetId;
                            break;
                        case 'deliver':
                            matches = objective.targetId === targetId && objective.location === extraData;
                            break;
                        case 'flag':
                            matches = objective.targetId === targetId;
                            break;
                    }

                    if (matches) {
                        const wasCompleted = objective.completed;
                        objective.updateProgress(amount);
                        if (!wasCompleted && objective.completed) {
                            progressMade = true;
                            this.eventBus.emit('quest-objective-completed', {
                                questId: questId,
                                objectiveId: objective.id,
                                objective: objective
                            });
                        }
                    }
                }
            });
        }

        if (progressMade) {
            this.eventBus.emit('quest-progress-updated');
        }
    }

    /**
     * Add a quest to the system
     * @param {Quest} quest - Quest to add
     */
    addQuest(quest) {
        ValidationHelpers.validateObject(quest, ['id'], 'quest');

        if (this.quests.has(quest.id)) {
            throw new Error(`Quest ${quest.id} already exists`);
        }

        this.quests.set(quest.id, quest);

        // Determine initial state
        if (quest.canAccept(this.context)) {
            quest.state = QuestState.AVAILABLE;
            this.availableQuests.add(quest.id);
        } else {
            quest.state = QuestState.INACTIVE;
        }

        this.eventBus.emit('quest-added', { questId: quest.id, quest: quest });
    }

    /**
     * Remove a quest from the system
     * @param {string} questId - Quest ID to remove
     */
    removeQuest(questId) {
        ValidationHelpers.validateType(questId, 'string', 'questId');

        const quest = this.quests.get(questId);
        if (quest) {
            quest.destroy();
            this.quests.delete(questId);
            this.activeQuests.delete(questId);
            this.completedQuests.delete(questId);
            this.availableQuests.delete(questId);

            this.eventBus.emit('quest-removed', { questId: questId });
        }
    }

    /**
     * Get quest by ID
     * @param {string} questId - Quest ID
     * @returns {Quest|null}
     */
    getQuest(questId) {
        return this.quests.get(questId) || null;
    }

    /**
     * Accept a quest
     * @param {string} questId - Quest ID to accept
     */
    acceptQuest(questId) {
        const quest = this.getQuest(questId);
        if (!quest) {
            throw new Error(`Quest ${questId} not found`);
        }

        quest.accept(this.context);
    }

    /**
     * Turn in a completed quest
     * @param {string} questId - Quest ID to turn in
     * @param {object} rewardContext - Context for applying rewards
     */
    turnInQuest(questId, rewardContext = {}) {
        const quest = this.getQuest(questId);
        if (!quest) {
            throw new Error(`Quest ${questId} not found`);
        }

        quest.turnIn(rewardContext);
    }

    /**
     * Fail a quest
     * @param {string} questId - Quest ID to fail
     * @param {string} reason - Reason for failure
     */
    failQuest(questId, reason = 'Unknown') {
        const quest = this.getQuest(questId);
        if (!quest) {
            throw new Error(`Quest ${questId} not found`);
        }

        quest.fail(reason);
    }

    /**
     * Update available quests based on current context
     */
    updateAvailableQuests() {
        for (const [questId, quest] of this.quests) {
            if (quest.state === QuestState.INACTIVE && quest.canAccept(this.context)) {
                quest.state = QuestState.AVAILABLE;
                this.availableQuests.add(questId);
                this.eventBus.emit('quest-available', { questId: questId, quest: quest });
            }
        }
    }

    /**
     * Get all available quests
     * @returns {Array<Quest>}
     */
    getAvailableQuests() {
        return Array.from(this.availableQuests)
            .map(id => this.quests.get(id))
            .filter(quest => quest);
    }

    /**
     * Get all active quests
     * @returns {Array<Quest>}
     */
    getActiveQuests() {
        return Array.from(this.activeQuests)
            .map(id => this.quests.get(id))
            .filter(quest => quest);
    }

    /**
     * Get all completed quests
     * @returns {Array<Quest>}
     */
    getCompletedQuests() {
        return Array.from(this.completedQuests)
            .map(id => this.quests.get(id))
            .filter(quest => quest);
    }

    /**
     * Get quest progress summary
     * @returns {Array<object>}
     */
    getQuestProgress() {
        const progress = [];

        for (const questId of this.activeQuests) {
            const quest = this.quests.get(questId);
            if (quest) {
                progress.push(quest.getProgress());
            }
        }

        return progress;
    }

    /**
     * Update context for prerequisite checking
     * @param {object} newContext - New context data
     */
    updateContext(newContext) {
        if (newContext.gameFlags) {
            // Merge game flags
            for (const [flag, value] of Object.entries(newContext.gameFlags)) {
                this.context.gameFlags.set(flag, value);
            }
        }

        if (newContext.partyLevel) {
            this.context.partyLevel = newContext.partyLevel;
        }

        // Update available quests based on new context
        this.updateAvailableQuests();
    }

    /**
     * Check complex quest completion conditions using DialogManager
     * @param {string} condition - Condition string
     * @returns {boolean}
     */
    evaluateCondition(condition) {
        if (!this.dialogManager) {
            // Fallback to basic evaluation
            return this.evaluateBasicCondition(condition);
        }

        try {
            return this.dialogManager.evaluateCondition(condition);
        } catch (error) {
            console.warn(`Failed to evaluate condition "${condition}":`, error);
            return false;
        }
    }

    /**
     * Basic condition evaluation fallback
     * @param {string} condition - Condition string
     * @returns {boolean}
     */
    evaluateBasicCondition(condition) {
        // Basic flag checks
        if (condition.startsWith('flag.')) {
            const flag = condition.substring(5);
            return this.context.gameFlags.get(flag) || false;
        }

        // Quest completion checks
        if (condition.startsWith('quest.')) {
            const questId = condition.substring(6);
            return this.completedQuests.has(questId);
        }

        // Level checks
        if (condition.startsWith('level.')) {
            const minLevel = parseInt(condition.substring(6));
            return this.context.partyLevel >= minLevel;
        }

        return true; // Default to true for unknown conditions
    }

    /**
     * Serialize quest manager state
     * @returns {object}
     */
    serialize() {
        const questData = {};
        for (const [id, quest] of this.quests) {
            questData[id] = quest.serialize();
        }

        return {
            quests: questData,
            activeQuests: Array.from(this.activeQuests),
            completedQuests: Array.from(this.completedQuests),
            availableQuests: Array.from(this.availableQuests),
            context: {
                gameFlags: Object.fromEntries(this.context.gameFlags),
                partyLevel: this.context.partyLevel
            }
        };
    }

    /**
     * Deserialize quest manager state
     * @param {object} data - Serialized data
     */
    deserialize(data) {
        ValidationHelpers.validateObject(data, ['quests'], 'data');

        // Clear existing state
        this.quests.clear();
        this.activeQuests.clear();
        this.completedQuests.clear();
        this.availableQuests.clear();

        // Deserialize quests
        for (const [id, questData] of Object.entries(data.quests)) {
            const quest = Quest.deserialize(questData);
            this.quests.set(id, quest);
        }

        // Restore state sets
        if (data.activeQuests) {
            data.activeQuests.forEach(id => this.activeQuests.add(id));
        }
        if (data.completedQuests) {
            data.completedQuests.forEach(id => this.completedQuests.add(id));
        }
        if (data.availableQuests) {
            data.availableQuests.forEach(id => this.availableQuests.add(id));
        }

        // Restore context
        if (data.context) {
            this.context.partyLevel = data.context.partyLevel || 1;
            if (data.context.gameFlags) {
                this.context.gameFlags = new Map(Object.entries(data.context.gameFlags));
            }
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Destroy all quests
        for (const quest of this.quests.values()) {
            quest.destroy();
        }

        this.quests.clear();
        this.activeQuests.clear();
        this.completedQuests.clear();
        this.availableQuests.clear();
    }
}