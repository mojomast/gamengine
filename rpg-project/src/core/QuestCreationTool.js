/**
 * Quest Creation Tool - UI for creating and editing quests
 * Provides interface for quest creation with validation and dialog integration
 */

import { UIComponent, MenuManager } from '../../game-engine/src/ui/UIManager.js';
import { Quest, QuestObjective, QuestReward, QuestState, QuestType, ObjectiveType } from './QuestSystem.js';
import { ValidationHelpers } from '../../game-engine/src/core/ValidationHelpers.js';

export class QuestCreationTool extends UIComponent {
    constructor(x, y, width, height, questManager, dialogManager) {
        super(x, y, width, height);
        this.questManager = questManager;
        this.dialogManager = dialogManager;
        this.currentQuest = null;
        this.isEditing = false;

        this.style = {
            ...this.style,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderColor: '#4a90e2',
            borderWidth: 2,
            textColor: '#ffffff',
            font: '14px monospace',
            padding: 10
        };

        // Create UI components
        this.createUIComponents();
        this.setupEventListeners();
    }

    createUIComponents() {
        // Main tabs
        this.tabs = new MenuManager(10, 10, this.size.width - 20, 40);
        this.tabs.setMenu({
            title: '',
            items: [
                { text: 'Basic Info', callback: () => this.showTab('basic') },
                { text: 'Objectives', callback: () => this.showTab('objectives') },
                { text: 'Rewards', callback: () => this.showTab('rewards') },
                { text: 'Conditions', callback: () => this.showTab('conditions') },
                { text: 'Save/Load', callback: () => this.showTab('save') }
            ]
        });

        // Basic info panel
        this.basicPanel = this.createBasicInfoPanel();

        // Objectives panel
        this.objectivesPanel = this.createObjectivesPanel();

        // Rewards panel
        this.rewardsPanel = this.createRewardsPanel();

        // Conditions panel
        this.conditionsPanel = this.createConditionsPanel();

        // Save/Load panel
        this.savePanel = this.createSavePanel();

        this.currentPanel = this.basicPanel;
    }

    createBasicInfoPanel() {
        const panel = {
            elements: {},
            render: (ctx, x, y) => {
                ctx.fillStyle = this.style.textColor;
                ctx.font = this.style.font;
                let currentY = y + 20;

                // Quest Title
                ctx.fillText('Quest Title:', x, currentY);
                currentY += 20;

                // Quest Type
                ctx.fillText('Quest Type:', x, currentY);
                currentY += 20;

                // Quest Description
                ctx.fillText('Description:', x, currentY);
                currentY += 50;

                // Level
                ctx.fillText('Level:', x, currentY);
                currentY += 20;

                // Giver
                ctx.fillText('NPC Giver:', x, currentY);
            }
        };
        return panel;
    }

    createObjectivesPanel() {
        const panel = {
            selectedObjective: null,
            elements: {},
            render: (ctx, x, y) => {
                ctx.fillStyle = this.style.textColor;
                ctx.font = this.style.font;
                let currentY = y + 20;

                ctx.fillText('Quest Objectives:', x, currentY);
                currentY += 30;

                if (this.currentQuest && this.currentQuest.objectives.length > 0) {
                    this.currentQuest.objectives.forEach((objective, index) => {
                        const isSelected = this.objectivesPanel.selectedObjective === objective;
                        ctx.fillStyle = isSelected ? '#4a90e2' : this.style.textColor;
                        ctx.fillText(`${index + 1}. ${objective.description}`, x, currentY);
                        currentY += 20;
                    });
                } else {
                    ctx.fillStyle = '#888888';
                    ctx.fillText('No objectives defined', x, currentY);
                }

                currentY += 30;
                ctx.fillStyle = this.style.textColor;
                ctx.fillText('Objective Details:', x, currentY);
                currentY += 20;

                if (this.objectivesPanel.selectedObjective) {
                    const obj = this.objectivesPanel.selectedObjective;
                    ctx.fillText(`Type: ${obj.type}`, x, currentY);
                    currentY += 20;
                    ctx.fillText(`Required: ${obj.required}`, x, currentY);
                    currentY += 20;
                    ctx.fillText(`Current: ${obj.current}`, x, currentY);
                    currentY += 20;
                    if (obj.condition) {
                        ctx.fillText(`Condition: ${obj.condition}`, x, currentY);
                    }
                }
            }
        };
        return panel;
    }

    createRewardsPanel() {
        const panel = {
            elements: {},
            render: (ctx, x, y) => {
                ctx.fillStyle = this.style.textColor;
                ctx.font = this.style.font;
                let currentY = y + 20;

                ctx.fillText('Quest Rewards:', x, currentY);
                currentY += 30;

                if (this.currentQuest && this.currentQuest.rewards.length > 0) {
                    this.currentQuest.rewards.forEach((reward, index) => {
                        ctx.fillText(`${index + 1}. ${reward.description}`, x, currentY);
                        currentY += 20;
                    });
                } else {
                    ctx.fillStyle = '#888888';
                    ctx.fillText('No rewards defined', x, currentY);
                }
            }
        };
        return panel;
    }

    createConditionsPanel() {
        const panel = {
            elements: {},
            render: (ctx, x, y) => {
                ctx.fillStyle = this.style.textColor;
                ctx.font = this.style.font;
                let currentY = y + 20;

                ctx.fillText('Prerequisites:', x, currentY);
                currentY += 20;

                if (this.currentQuest && this.currentQuest.prerequisites.length > 0) {
                    this.currentQuest.prerequisites.forEach((prereq, index) => {
                        ctx.fillText(`${index + 1}. ${prereq}`, x + 20, currentY);
                        currentY += 20;
                    });
                } else {
                    ctx.fillStyle = '#888888';
                    ctx.fillText('No prerequisites', x + 20, currentY);
                    currentY += 20;
                }

                currentY += 20;
                ctx.fillStyle = this.style.textColor;
                ctx.fillText('Validation:', x, currentY);
            }
        };
        return panel;
    }

    createSavePanel() {
        const panel = {
            elements: {},
            render: (ctx, x, y) => {
                ctx.fillStyle = this.style.textColor;
                ctx.font = this.style.font;
                let currentY = y + 20;

                ctx.fillText('Quest Management:', x, currentY);
                currentY += 30;

                ctx.fillText('Available Actions:', x, currentY);
                currentY += 20;
                ctx.fillText('• Save Quest', x + 20, currentY);
                currentY += 20;
                ctx.fillText('• Load Quest', x + 20, currentY);
                currentY += 20;
                ctx.fillText('• New Quest', x + 20, currentY);
                currentY += 20;
                ctx.fillText('• Delete Quest', x + 20, currentY);
                currentY += 20;
                ctx.fillText('• Test Quest', x + 20, currentY);
            }
        };
        return panel;
    }

    setupEventListeners() {
        // Listen for keyboard input (simplified)
        this.keyboardHandler = (event) => {
            if (!this.visible) return;

            switch (event.key) {
                case 'Escape':
                    this.hide();
                    break;
                case 's':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        this.saveQuest();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', this.keyboardHandler);
    }

    showTab(tabName) {
        this.currentPanel = this[`${tabName}Panel`];
        this.dirty = true;
    }

    show() {
        super.show();
        this.tabs.show();
    }

    hide() {
        super.hide();
        this.tabs.hide();
        this.currentPanel = this.basicPanel;
    }

    update(deltaTime) {
        this.tabs.update(deltaTime);
        super.update(deltaTime);
    }

    renderContent(ctx) {
        // Render tab bar background
        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(0, 0, this.size.width, 50);

        // Render current panel
        if (this.currentPanel && this.currentPanel.render) {
            this.currentPanel.render(ctx, this.style.padding, 60);
        }

        // Render instructions
        ctx.fillStyle = '#666666';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Use Tab to navigate • Enter to select • ESC to close • Ctrl+S to save', this.size.width / 2, this.size.height - 10);
        ctx.textAlign = 'left';
    }

    // Quest management methods
    newQuest() {
        this.currentQuest = new Quest({
            id: `quest_${Date.now()}`,
            title: 'New Quest',
            description: 'Quest description here',
            type: QuestType.SIDE_QUEST,
            objectives: [],
            rewards: [],
            level: 1
        });
        this.isEditing = false;
        this.dirty = true;
    }

    loadQuest(questId) {
        if (this.questManager) {
            const quest = this.questManager.getQuest(questId);
            if (quest) {
                this.currentQuest = quest;
                this.isEditing = true;
                this.dirty = true;
                return true;
            }
        }
        return false;
    }

    saveQuest() {
        if (!this.currentQuest) return false;

        try {
            // Validate quest
            this.validateQuest(this.currentQuest);

            if (this.questManager) {
                if (this.isEditing) {
                    // Update existing quest
                    this.questManager.addQuest(this.currentQuest);
                } else {
                    // Add new quest
                    this.questManager.addQuest(this.currentQuest);
                }
            }

            console.log(`Quest "${this.currentQuest.title}" saved successfully`);
            return true;
        } catch (error) {
            console.error('Failed to save quest:', error);
            return false;
        }
    }

    deleteQuest() {
        if (!this.currentQuest || !this.isEditing) return false;

        if (this.questManager) {
            this.questManager.removeQuest(this.currentQuest.id);
            this.currentQuest = null;
            this.isEditing = false;
            this.dirty = true;
            return true;
        }
        return false;
    }

    testQuest() {
        if (!this.currentQuest) return;

        try {
            this.validateQuest(this.currentQuest);
            console.log('Quest validation passed:', this.currentQuest.title);

            // Test quest acceptance
            const canAccept = this.currentQuest.canAccept(this.questManager.context);
            console.log('Can accept quest:', canAccept);

        } catch (error) {
            console.error('Quest validation failed:', error.message);
        }
    }

    validateQuest(quest) {
        ValidationHelpers.validateObject(quest, ['id', 'title', 'description'], 'quest');

        // Validate objectives
        if (quest.objectives && quest.objectives.length > 0) {
            quest.objectives.forEach((objective, index) => {
                try {
                    ValidationHelpers.validateObject(objective, ['id', 'type', 'description'], `objective[${index}]`);

                    // Validate conditions if present
                    if (objective.condition && this.dialogManager) {
                        // Test condition evaluation (this might throw if invalid)
                        this.dialogManager.evaluateCondition(objective.condition);
                    }
                } catch (error) {
                    throw new Error(`Objective ${index}: ${error.message}`);
                }
            });
        }

        // Validate rewards
        if (quest.rewards && quest.rewards.length > 0) {
            quest.rewards.forEach((reward, index) => {
                try {
                    ValidationHelpers.validateObject(reward, ['type'], `reward[${index}]`);
                } catch (error) {
                    throw new Error(`Reward ${index}: ${error.message}`);
                }
            });
        }

        // Validate prerequisites
        if (quest.prerequisites && quest.prerequisites.length > 0) {
            quest.prerequisites.forEach((prereq, index) => {
                if (typeof prereq !== 'string') {
                    throw new Error(`Prerequisite ${index}: Must be a string`);
                }
            });
        }
    }

    // Get quest data for export
    exportQuest() {
        if (!this.currentQuest) return null;
        return this.currentQuest.serialize();
    }

    // Import quest data
    importQuest(questData) {
        try {
            this.currentQuest = Quest.deserialize(questData);
            this.isEditing = false;
            this.dirty = true;
            return true;
        } catch (error) {
            console.error('Failed to import quest:', error);
            return false;
        }
    }

    destroy() {
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }
        super.destroy();
    }
}