/**
 * Dialog Tree System
 * Defines branching conversation structures with conditional logic
 */
class DialogNode {
    constructor(config) {
        this.id = config.id;
        this.text = config.text || '';
        this.speaker = config.speaker || '';
        this.portrait = config.portrait || null;
        this.choices = config.choices || [];
        this.autoAdvance = config.autoAdvance || false;
        this.nextNode = config.nextNode || null;
        this.voiceLine = config.voiceLine || null;

        // Conditional logic
        this.conditions = config.conditions || [];
        this.effects = config.effects || [];

        // Metadata
        this.tags = config.tags || [];
        this.priority = config.priority || 0;
    }

    evaluateConditions(context) {
        if (this.conditions.length === 0) return true;

        return this.conditions.every(condition => {
            return this.evaluateCondition(condition, context);
        });
    }

    evaluateCondition(condition, context) {
        // Support various condition types
        if (typeof condition === 'string') {
            return this.evaluateStringCondition(condition, context);
        } else if (typeof condition === 'function') {
            return condition(context);
        } else if (typeof condition === 'object') {
            return this.evaluateObjectCondition(condition, context);
        }

        return true;
    }

    evaluateStringCondition(condition, context) {
        // Flag conditions
        if (condition.startsWith('flag.')) {
            const flag = condition.substring(5);
            return context.globalFlags && context.globalFlags.get(flag);
        }

        // Context value conditions
        if (condition.startsWith('context.')) {
            const path = condition.substring(8).split('.');
            let value = context;
            for (const key of path) {
                value = value?.[key];
                if (value === undefined) return false;
            }
            return !!value;
        }

        // Numeric comparisons
        const comparisonOps = ['>=', '<=', '!=', '==', '>', '<', '='];
        for (const op of comparisonOps) {
            if (condition.includes(op)) {
                return this.evaluateComparison(condition, op, context);
            }
        }

        // Boolean conditions
        if (condition === 'true') return true;
        if (condition === 'false') return false;

        return false;
    }

    evaluateObjectCondition(condition, context) {
        const { type, key, operator, value } = condition;

        let actualValue;
        switch (type) {
            case 'flag':
                actualValue = context.globalFlags?.get(key);
                break;
            case 'context':
                const path = key.split('.');
                actualValue = context;
                for (const pathKey of path) {
                    actualValue = actualValue?.[pathKey];
                }
                break;
            case 'quest':
                actualValue = context.quests?.[key];
                break;
            default:
                return false;
        }

        if (actualValue === undefined) return false;

        switch (operator) {
            case 'equals':
            case '==':
                return actualValue == value;
            case 'not_equals':
            case '!=':
                return actualValue != value;
            case 'greater':
            case '>':
                return actualValue > value;
            case 'less':
            case '<':
                return actualValue < value;
            case 'greater_equals':
            case '>=':
                return actualValue >= value;
            case 'less_equals':
            case '<=':
                return actualValue <= value;
            case 'has':
                return Array.isArray(actualValue) && actualValue.includes(value);
            default:
                return false;
        }
    }

    evaluateComparison(condition, operator, context) {
        const parts = condition.split(operator).map(s => s.trim());
        if (parts.length !== 2) return false;

        const leftValue = this.resolveValue(parts[0], context);
        const rightValue = this.resolveValue(parts[1], context);

        if (leftValue === undefined || rightValue === undefined) return false;

        switch (operator) {
            case '>': return leftValue > rightValue;
            case '<': return leftValue < rightValue;
            case '>=': return leftValue >= rightValue;
            case '<=': return leftValue <= rightValue;
            case '==':
            case '=': return leftValue == rightValue;
            case '!=': return leftValue != rightValue;
            default: return false;
        }
    }

    resolveValue(value, context) {
        if (value.startsWith('context.')) {
            const path = value.substring(8).split('.');
            let result = context;
            for (const key of path) {
                result = result?.[key];
            }
            return result;
        }

        if (value.startsWith('flag.')) {
            return context.globalFlags?.get(value.substring(5));
        }

        // Try to parse as number
        const num = parseFloat(value);
        return isNaN(num) ? value : num;
    }

    applyEffects(context) {
        this.effects.forEach(effect => {
            this.applyEffect(effect, context);
        });
    }

    applyEffect(effect, context) {
        if (typeof effect === 'string') {
            this.applyStringEffect(effect, context);
        } else if (typeof effect === 'function') {
            effect(context);
        } else if (typeof effect === 'object') {
            this.applyObjectEffect(effect, context);
        }
    }

    applyStringEffect(effect, context) {
        // Set flags
        if (effect.startsWith('set_flag.')) {
            const flag = effect.substring(9);
            if (context.globalFlags) {
                context.globalFlags.set(flag, true);
            }
        }

        // Unset flags
        if (effect.startsWith('unset_flag.')) {
            const flag = effect.substring(11);
            if (context.globalFlags) {
                context.globalFlags.set(flag, false);
            }
        }

        // Modify context values
        if (effect.startsWith('context.')) {
            const parts = effect.substring(8).split('=');
            if (parts.length === 2) {
                const path = parts[0].trim().split('.');
                const value = this.resolveValue(parts[1].trim(), context);

                let target = context;
                for (let i = 0; i < path.length - 1; i++) {
                    if (!target[path[i]]) target[path[i]] = {};
                    target = target[path[i]];
                }
                target[path[path.length - 1]] = value;
            }
        }
    }

    applyObjectEffect(effect, context) {
        const { type, key, action, value } = effect;

        switch (type) {
            case 'flag':
                if (!context.globalFlags) return;
                switch (action) {
                    case 'set':
                        context.globalFlags.set(key, value !== undefined ? value : true);
                        break;
                    case 'unset':
                        context.globalFlags.set(key, false);
                        break;
                    case 'toggle':
                        const current = context.globalFlags.get(key) || false;
                        context.globalFlags.set(key, !current);
                        break;
                }
                break;

            case 'context':
                const path = key.split('.');
                let target = context;
                for (let i = 0; i < path.length - 1; i++) {
                    if (!target[path[i]]) target[path[i]] = {};
                    target = target[path[i]];
                }

                const currentValue = target[path[path.length - 1]] || 0;
                const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;

                switch (action) {
                    case 'set':
                        target[path[path.length - 1]] = numValue;
                        break;
                    case 'add':
                        target[path[path.length - 1]] = currentValue + numValue;
                        break;
                    case 'subtract':
                        target[path[path.length - 1]] = currentValue - numValue;
                        break;
                }
                break;

            case 'quest':
                if (!context.quests) context.quests = {};
                switch (action) {
                    case 'start':
                        context.quests[key] = { status: 'active', started: Date.now() };
                        break;
                    case 'complete':
                        if (context.quests[key]) {
                            context.quests[key].status = 'completed';
                            context.quests[key].completed = Date.now();
                        }
                        break;
                    case 'fail':
                        if (context.quests[key]) {
                            context.quests[key].status = 'failed';
                            context.quests[key].failed = Date.now();
                        }
                        break;
                }
                break;
        }
    }

    getAvailableChoices(context) {
        return this.choices.filter(choice => {
            if (!choice.conditions || choice.conditions.length === 0) return true;
            return choice.conditions.every(condition => this.evaluateCondition(condition, context));
        });
    }
}

class DialogChoice {
    constructor(config) {
        this.text = config.text || '';
        this.goto = config.goto || null;
        this.conditions = config.conditions || [];
        this.effects = config.effects || [];
        this.priority = config.priority || 0;
        this.once = config.once || false; // Can only be chosen once
        this.requirements = config.requirements || []; // Additional requirements text
    }

    canChoose(context) {
        return this.conditions.every(condition => {
            // Simple condition evaluation (delegate to DialogNode for complex logic)
            if (typeof condition === 'string') {
                if (condition.startsWith('flag.')) {
                    const flag = condition.substring(5);
                    return context.globalFlags?.get(flag);
                }
                if (condition.startsWith('context.')) {
                    const path = condition.substring(8).split('.');
                    let value = context;
                    for (const key of path) {
                        value = value?.[key];
                        if (value === undefined) return false;
                    }
                    return !!value;
                }
            }
            return true;
        });
    }

    applyEffects(context) {
        this.effects.forEach(effect => {
            // Simple effect application (can be expanded)
            if (typeof effect === 'string') {
                if (effect.startsWith('set_flag.')) {
                    const flag = effect.substring(9);
                    context.globalFlags?.set(flag, true);
                }
            }
        });
    }
}

class DialogTree {
    constructor(config) {
        this.id = config.id;
        this.title = config.title || '';
        this.description = config.description || '';
        this.nodes = new Map();
        this.startNode = config.startNode || 'start';
        this.variables = config.variables || {};
        this.metadata = config.metadata || {};

        // Load nodes
        if (config.nodes) {
            Object.entries(config.nodes).forEach(([nodeId, nodeConfig]) => {
                const node = new DialogNode({ id: nodeId, ...nodeConfig });
                this.nodes.set(nodeId, node);
            });
        }
    }

    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }

    getStartNode() {
        return this.getNode(this.startNode);
    }

    evaluateNode(nodeId, context) {
        const node = this.getNode(nodeId);
        if (!node) return null;

        if (!node.evaluateConditions(context)) {
            return null; // Node not available
        }

        // Apply node effects
        node.applyEffects(context);

        return node;
    }

    // Convert to DialogManager format
    toDialogManagerFormat() {
        const dialogTree = {
            id: this.id,
            nodes: {}
        };

        this.nodes.forEach((node, nodeId) => {
            dialogTree.nodes[nodeId] = {
                text: node.text,
                speaker: node.speaker,
                portrait: node.portrait,
                choices: node.choices.map(choice => ({
                    text: choice.text,
                    goto: choice.goto,
                    condition: choice.conditions.length > 0 ? choice.conditions[0] : undefined
                })),
                autoAdvance: node.autoAdvance,
                nextNode: node.nextNode,
                voiceLine: node.voiceLine
            };
        });

        return dialogTree;
    }

    // Export to JSON
    toJSON() {
        const nodes = {};
        this.nodes.forEach((node, nodeId) => {
            nodes[nodeId] = {
                text: node.text,
                speaker: node.speaker,
                portrait: node.portrait,
                choices: node.choices.map(choice => ({
                    text: choice.text,
                    goto: choice.goto,
                    conditions: choice.conditions,
                    effects: choice.effects,
                    priority: choice.priority,
                    once: choice.once,
                    requirements: choice.requirements
                })),
                autoAdvance: node.autoAdvance,
                nextNode: node.nextNode,
                voiceLine: node.voiceLine,
                conditions: node.conditions,
                effects: node.effects,
                tags: node.tags,
                priority: node.priority
            };
        });

        return {
            id: this.id,
            title: this.title,
            description: this.description,
            startNode: this.startNode,
            nodes: nodes,
            variables: this.variables,
            metadata: this.metadata
        };
    }

    // Import from JSON
    static fromJSON(data) {
        // Convert choice objects back to DialogChoice instances
        if (data.nodes) {
            Object.values(data.nodes).forEach(node => {
                if (node.choices) {
                    node.choices = node.choices.map(choiceData => new DialogChoice(choiceData));
                }
            });
        }

        return new DialogTree(data);
    }
}

// Predefined dialog templates for common NPC types
const DialogTemplates = {
    merchant: {
        greeting: {
            text: "Welcome to my shop! Take a look around.",
            speaker: "Merchant",
            choices: [
                { text: "Show me your wares", goto: "shop" },
                { text: "Tell me about this town", goto: "town_info" },
                { text: "Goodbye", goto: null }
            ]
        },
        shop: {
            text: "Here's what I have available:",
            speaker: "Merchant",
            autoAdvance: true,
            nextNode: null // Would integrate with shop system
        },
        town_info: {
            text: "This town has been here for generations. We've got everything you need.",
            speaker: "Merchant",
            choices: [
                { text: "Thanks for the info", goto: "greeting" }
            ]
        }
    },

    quest_giver: {
        initial: {
            text: "You look like someone who can help me with a problem...",
            speaker: "Quest Giver",
            choices: [
                { text: "What do you need?", goto: "quest_offer" },
                { text: "I'm busy right now", goto: "dismissal" }
            ]
        },
        quest_offer: {
            text: "I need you to retrieve my lost item from the nearby cave. I'll reward you well!",
            speaker: "Quest Giver",
            choices: [
                { text: "I'll do it", goto: "quest_accept", effects: ["set_flag.quest_accepted"] },
                { text: "That sounds dangerous", goto: "quest_decline" }
            ]
        },
        quest_accept: {
            text: "Excellent! Return to me when you have the item.",
            speaker: "Quest Giver",
            autoAdvance: true,
            nextNode: null
        },
        quest_decline: {
            text: "I understand. Perhaps you'll change your mind later.",
            speaker: "Quest Giver",
            autoAdvance: true,
            nextNode: null
        }
    },

    guard: {
        greeting: {
            text: "Halt! Who goes there?",
            speaker: "Guard",
            choices: [
                { text: "Just passing through", goto: "casual" },
                { text: "I need information", goto: "information" },
                { text: "Show me your authority", goto: "authority" }
            ]
        },
        casual: {
            text: "Very well. Move along, but keep the peace.",
            speaker: "Guard",
            autoAdvance: true,
            nextNode: null
        },
        information: {
            text: "What do you need to know?",
            speaker: "Guard",
            choices: [
                { text: "Where can I find the inn?", goto: "directions_inn" },
                { text: "What's the latest news?", goto: "news" }
            ]
        }
    }
};

export { DialogNode, DialogChoice, DialogTree, DialogTemplates };