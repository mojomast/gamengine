/**
 * Tutorial System for New Players
 * Provides guided tutorials using DialogManager integration
 */

import { ValidationHelpers } from '../../../game-engine/src/core/ValidationHelpers.js';

export class TutorialManager {
    constructor(dialogManager, uiManager) {
        this.dialogManager = dialogManager;
        this.uiManager = uiManager;
        this.tutorials = new Map();
        this.activeTutorial = null;
        this.completedTutorials = new Set();
        this.tutorialProgress = new Map();
        this.isActive = false;

        this.registerDefaultTutorials();
        this.setupEventListeners();
    }

    registerDefaultTutorials() {
        // Basic Movement Tutorial
        this.tutorials.set('movement', {
            id: 'movement',
            title: 'Basic Movement',
            description: 'Learn how to move your character',
            steps: [
                {
                    id: 'welcome',
                    dialog: {
                        text: "Welcome to Final Fantasy 3 Style RPG! Let's start with the basics of movement.",
                        speaker: 'Tutorial Guide'
                    },
                    highlight: null,
                    waitFor: null,
                    nextStep: 'move_explanation'
                },
                {
                    id: 'move_explanation',
                    dialog: {
                        text: "Use the ARROW KEYS or WASD to move your character around the world map.",
                        speaker: 'Tutorial Guide'
                    },
                    highlight: 'movement',
                    waitFor: 'player_moved',
                    nextStep: 'interaction'
                },
                {
                    id: 'interaction',
                    dialog: {
                        text: "Great! You can also interact with NPCs and objects by walking up to them. Try approaching that person over there.",
                        speaker: 'Tutorial Guide'
                    },
                    highlight: 'npc',
                    waitFor: 'npc_interaction',
                    nextStep: 'complete'
                },
                {
                    id: 'complete',
                    dialog: {
                        text: "Excellent! You've completed the basic movement tutorial. You can access help anytime with the H key.",
                        speaker: 'Tutorial Guide'
                    },
                    highlight: null,
                    waitFor: null,
                    nextStep: null
                }
            ],
            prerequisites: [],
            reward: { experience: 100 }
        });

        // Combat Tutorial
        this.tutorials.set('combat', {
            id: 'combat',
            title: 'Combat Basics',
            description: 'Learn the fundamentals of turn-based combat',
            steps: [
                {
                    id: 'combat_intro',
                    dialog: {
                        text: "Now let's learn about combat! When you encounter enemies, a battle will begin.",
                        speaker: 'Battle Master'
                    },
                    highlight: null,
                    waitFor: null,
                    nextStep: 'turn_system'
                },
                {
                    id: 'turn_system',
                    dialog: {
                        text: "Combat is turn-based. You'll take turns with enemies. Choose your actions wisely!",
                        speaker: 'Battle Master'
                    },
                    highlight: 'battle_menu',
                    waitFor: null,
                    nextStep: 'attack_demo'
                },
                {
                    id: 'attack_demo',
                    dialog: {
                        text: "Try selecting 'Attack' from the menu and choosing a target. Physical attacks deal damage based on your strength.",
                        speaker: 'Battle Master'
                    },
                    highlight: 'attack_option',
                    waitFor: 'attack_used',
                    nextStep: 'magic_intro'
                },
                {
                    id: 'magic_intro',
                    dialog: {
                        text: "Magic is powerful but consumes MP. Different spells have different effects and costs.",
                        speaker: 'Battle Master'
                    },
                    highlight: 'magic_option',
                    waitFor: null,
                    nextStep: 'item_usage'
                },
                {
                    id: 'item_usage',
                    dialog: {
                        text: "Items can heal, buff, or debuff. Use them strategically during battle!",
                        speaker: 'Battle Master'
                    },
                    highlight: 'item_option',
                    waitFor: null,
                    nextStep: 'victory'
                },
                {
                    id: 'victory',
                    dialog: {
                        text: "Win battles to gain experience and items. Experience helps you level up and become stronger!",
                        speaker: 'Battle Master'
                    },
                    highlight: null,
                    waitFor: 'battle_won',
                    nextStep: 'complete'
                },
                {
                    id: 'complete',
                    dialog: {
                        text: "You've mastered the basics of combat! Keep fighting to grow stronger.",
                        speaker: 'Battle Master'
                    },
                    highlight: null,
                    waitFor: null,
                    nextStep: null
                }
            ],
            prerequisites: ['movement'],
            reward: { experience: 200, item: 'potion' }
        });

        // Magic Tutorial
        this.tutorials.set('magic', {
            id: 'magic',
            title: 'Magic System',
            description: 'Master the arcane arts',
            steps: [
                {
                    id: 'magic_welcome',
                    dialog: {
                        text: "Magic is a powerful force in this world. Let me teach you about the different schools of magic.",
                        speaker: 'Archmage'
                    },
                    highlight: null,
                    waitFor: null,
                    nextStep: 'elements'
                },
                {
                    id: 'elements',
                    dialog: {
                        text: "There are six elemental types: Fire, Water, Earth, Air, Lightning, and Ice. Each has strengths and weaknesses.",
                        speaker: 'Archmage'
                    },
                    highlight: 'magic_menu',
                    waitFor: null,
                    nextStep: 'spell_types'
                },
                {
                    id: 'spell_types',
                    dialog: {
                        text: "Spells can be offensive, healing, buffs, or debuffs. Offensive spells deal elemental damage.",
                        speaker: 'Archmage'
                    },
                    highlight: 'spell_list',
                    waitFor: 'spell_cast',
                    nextStep: 'mp_management'
                },
                {
                    id: 'mp_management',
                    dialog: {
                        text: "Watch your MP carefully! Running out of mana in battle can be dangerous. Rest to recover MP.",
                        speaker: 'Archmage'
                    },
                    highlight: 'mp_display',
                    waitFor: null,
                    nextStep: 'complete'
                },
                {
                    id: 'complete',
                    dialog: {
                        text: "You now understand the fundamentals of magic. Practice and you'll become a powerful spellcaster!",
                        speaker: 'Archmage'
                    },
                    highlight: null,
                    waitFor: null,
                    nextStep: null
                }
            ],
            prerequisites: ['combat'],
            reward: { experience: 150, spell: 'fireball' }
        });

        // Equipment Tutorial
        this.tutorials.set('equipment', {
            id: 'equipment',
            title: 'Equipment & Inventory',
            description: 'Learn about gear and inventory management',
            steps: [
                {
                    id: 'equipment_intro',
                    dialog: {
                        text: "Equipment can greatly enhance your abilities. Let's learn about managing your gear.",
                        speaker: 'Blacksmith'
                    },
                    highlight: null,
                    waitFor: null,
                    nextStep: 'inventory_access'
                },
                {
                    id: 'inventory_access',
                    dialog: {
                        text: "Press 'I' to open your inventory. Here you can see all your items and equipment.",
                        speaker: 'Blacksmith'
                    },
                    highlight: 'inventory_button',
                    waitFor: 'inventory_opened',
                    nextStep: 'equipping_items'
                },
                {
                    id: 'equipping_items',
                    dialog: {
                        text: "Click on equipment in your inventory to equip it. Different items provide different stat bonuses.",
                        speaker: 'Blacksmith'
                    },
                    highlight: 'equipment_slots',
                    waitFor: 'item_equipped',
                    nextStep: 'stat_bonuses'
                },
                {
                    id: 'stat_bonuses',
                    dialog: {
                        text: "Equipped items give bonuses to your stats. Check your status screen to see your total stats.",
                        speaker: 'Blacksmith'
                    },
                    highlight: 'character_stats',
                    waitFor: null,
                    nextStep: 'complete'
                },
                {
                    id: 'complete',
                    dialog: {
                        text: "You now know how to manage your equipment! Keep upgrading your gear as you progress.",
                        speaker: 'Blacksmith'
                    },
                    highlight: null,
                    waitFor: null,
                    nextStep: null
                }
            ],
            prerequisites: ['movement'],
            reward: { item: 'leather_armor' }
        });
    }

    setupEventListeners() {
        // Listen for tutorial trigger events
        this.dialogManager.on('tutorial-trigger', (data) => {
            this.startTutorial(data.tutorialId);
        });

        // Listen for player actions that might advance tutorials
        this.setupActionListeners();
    }

    setupActionListeners() {
        // These would be connected to the actual game systems
        // For now, they're placeholder implementations

        // Movement detection
        if (window.addEventListener) {
            window.addEventListener('keydown', (event) => {
                if (this.activeTutorial && this.activeTutorial.id === 'movement') {
                    this.checkTutorialProgress('player_moved', event);
                }
            });
        }
    }

    startTutorial(tutorialId) {
        const tutorial = this.tutorials.get(tutorialId);
        if (!tutorial) {
            console.warn(`Tutorial ${tutorialId} not found`);
            return false;
        }

        // Check prerequisites
        if (!this.checkPrerequisites(tutorial)) {
            console.warn(`Prerequisites not met for tutorial ${tutorialId}`);
            return false;
        }

        // Check if already completed
        if (this.completedTutorials.has(tutorialId)) {
            console.log(`Tutorial ${tutorialId} already completed`);
            return false;
        }

        this.activeTutorial = tutorial;
        this.isActive = true;
        this.tutorialProgress.set(tutorialId, 0);

        console.log(`Starting tutorial: ${tutorial.title}`);

        // Start first step
        this.showTutorialStep(0);

        return true;
    }

    checkPrerequisites(tutorial) {
        return tutorial.prerequisites.every(prereqId =>
            this.completedTutorials.has(prereqId)
        );
    }

    showTutorialStep(stepIndex) {
        if (!this.activeTutorial || stepIndex >= this.activeTutorial.steps.length) {
            this.completeTutorial();
            return;
        }

        const step = this.activeTutorial.steps[stepIndex];
        ValidationHelpers.validateObject(step, ['id', 'dialog'], 'tutorialStep');

        // Show dialog
        this.dialogManager.startDialog(`tutorial_${this.activeTutorial.id}_${step.id}`, {
            text: step.dialog.text,
            speaker: step.dialog.speaker,
            tutorialStep: step,
            tutorialId: this.activeTutorial.id
        });

        // Highlight UI elements if specified
        if (step.highlight) {
            this.highlightUIElement(step.highlight);
        }

        // Store current step
        this.tutorialProgress.set(this.activeTutorial.id, stepIndex);
    }

    highlightUIElement(elementId) {
        // This would integrate with UI highlighting system
        // For now, just log the highlight
        console.log(`Highlighting UI element: ${elementId}`);

        // Could add visual highlights, tooltips, etc.
        if (this.uiManager) {
            this.uiManager.createNotification(
                `Look for: ${elementId}`,
                3000,
                'info'
            );
        }
    }

    advanceTutorial(triggerEvent = null) {
        if (!this.activeTutorial) return;

        const currentStepIndex = this.tutorialProgress.get(this.activeTutorial.id) || 0;
        const currentStep = this.activeTutorial.steps[currentStepIndex];

        // Check if current step's wait condition is met
        if (currentStep.waitFor) {
            if (triggerEvent === currentStep.waitFor) {
                this.showTutorialStep(currentStepIndex + 1);
            }
        } else {
            // No wait condition, advance immediately
            this.showTutorialStep(currentStepIndex + 1);
        }
    }

    checkTutorialProgress(eventType, eventData) {
        // This method would be called by game systems to report player actions
        if (this.activeTutorial) {
            this.advanceTutorial(eventType);
        }
    }

    completeTutorial() {
        if (!this.activeTutorial) return;

        const tutorialId = this.activeTutorial.id;

        // Mark as completed
        this.completedTutorials.add(tutorialId);
        this.tutorialProgress.delete(tutorialId);

        // Grant rewards
        this.grantTutorialReward(this.activeTutorial.reward);

        console.log(`Tutorial completed: ${this.activeTutorial.title}`);

        // Show completion message
        this.uiManager.createNotification(
            `Tutorial Complete: ${this.activeTutorial.title}`,
            5000,
            'success'
        );

        this.activeTutorial = null;
        this.isActive = false;

        // Check if other tutorials are now available
        this.checkAvailableTutorials();
    }

    grantTutorialReward(reward) {
        if (!reward) return;

        if (reward.experience) {
            // Grant experience to party leader
            console.log(`Granted ${reward.experience} experience`);
        }

        if (reward.item) {
            // Add item to inventory
            console.log(`Granted item: ${reward.item}`);
        }

        if (reward.spell) {
            // Teach spell to character
            console.log(`Granted spell: ${reward.spell}`);
        }
    }

    checkAvailableTutorials() {
        const availableTutorials = [];

        for (const [tutorialId, tutorial] of this.tutorials) {
            if (!this.completedTutorials.has(tutorialId) &&
                !this.tutorialProgress.has(tutorialId) &&
                this.checkPrerequisites(tutorial)) {
                availableTutorials.push(tutorial);
            }
        }

        if (availableTutorials.length > 0) {
            // Show tutorial selection dialog
            this.showTutorialSelection(availableTutorials);
        }
    }

    showTutorialSelection(availableTutorials) {
        const tutorialOptions = availableTutorials.map(tutorial => ({
            text: `${tutorial.title}: ${tutorial.description}`,
            action: () => this.startTutorial(tutorial.id)
        }));

        // This would show a dialog with tutorial options
        console.log('Available tutorials:', tutorialOptions);
    }

    skipTutorial() {
        if (this.activeTutorial) {
            this.completeTutorial();
        }
    }

    restartTutorial(tutorialId) {
        // Reset tutorial progress
        this.tutorialProgress.delete(tutorialId);
        this.completedTutorials.delete(tutorialId);

        // Start tutorial again
        this.startTutorial(tutorialId);
    }

    getTutorialProgress() {
        const progress = {};

        for (const [tutorialId, tutorial] of this.tutorials) {
            progress[tutorialId] = {
                completed: this.completedTutorials.has(tutorialId),
                inProgress: this.tutorialProgress.has(tutorialId),
                currentStep: this.tutorialProgress.get(tutorialId) || 0,
                totalSteps: tutorial.steps.length
            };
        }

        return progress;
    }

    getAvailableTutorials() {
        const available = [];

        for (const [tutorialId, tutorial] of this.tutorials) {
            if (!this.completedTutorials.has(tutorialId) &&
                this.checkPrerequisites(tutorial)) {
                available.push({
                    id: tutorialId,
                    title: tutorial.title,
                    description: tutorial.description,
                    progress: this.tutorialProgress.get(tutorialId) || 0,
                    totalSteps: tutorial.steps.length
                });
            }
        }

        return available;
    }

    createCustomTutorial(tutorialData) {
        ValidationHelpers.validateObject(tutorialData, ['id', 'title', 'steps'], 'tutorialData');

        this.tutorials.set(tutorialData.id, tutorialData);
        return tutorialData.id;
    }

    saveTutorialProgress() {
        const progress = {
            completedTutorials: Array.from(this.completedTutorials),
            tutorialProgress: Object.fromEntries(this.tutorialProgress),
            timestamp: Date.now()
        };

        try {
            localStorage.setItem('tutorial_progress', JSON.stringify(progress));
            return true;
        } catch (error) {
            console.error('Failed to save tutorial progress:', error);
            return false;
        }
    }

    loadTutorialProgress() {
        try {
            const saved = localStorage.getItem('tutorial_progress');
            if (saved) {
                const progress = JSON.parse(saved);

                this.completedTutorials = new Set(progress.completedTutorials || []);
                this.tutorialProgress = new Map(Object.entries(progress.tutorialProgress || {}));

                return true;
            }
        } catch (error) {
            console.error('Failed to load tutorial progress:', error);
        }

        return false;
    }

    resetAllTutorials() {
        this.completedTutorials.clear();
        this.tutorialProgress.clear();
        this.activeTutorial = null;
        this.isActive = false;

        // Clear saved progress
        localStorage.removeItem('tutorial_progress');
    }
}