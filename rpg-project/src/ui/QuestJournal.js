/**
 * Quest Journal UI Component
 * Displays quest progress, objectives, and quest management interface
 */

import { UIComponent, MenuManager } from '../../game-engine/src/ui/UIManager.js';
import { QuestState, QuestType } from '../core/QuestSystem.js';

export class QuestJournal extends UIComponent {
    constructor(x, y, width, height, questManager) {
        super(x, y, width, height);
        this.questManager = questManager;
        this.currentTab = 'active'; // 'active', 'available', 'completed'
        this.selectedQuest = null;

        this.style = {
            ...this.style,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderColor: '#ffd700',
            borderWidth: 2,
            textColor: '#ffffff',
            font: '14px monospace',
            padding: 10
        };

        // Create tab buttons
        this.tabButtons = new MenuManager(10, 10, width - 20, 40);
        this.tabButtons.setMenu({
            title: '',
            items: [
                { text: 'Active', callback: () => this.setTab('active') },
                { text: 'Available', callback: () => this.setTab('available') },
                { text: 'Completed', callback: () => this.setTab('completed') }
            ]
        });

        // Quest list
        this.questList = new MenuManager(10, 60, width - 20, height - 120);

        // Quest details area
        this.detailsArea = {
            x: 10,
            y: height - 140,
            width: width - 20,
            height: 130
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for quest events to refresh display
        if (this.questManager && this.questManager.eventBus) {
            this.questManager.eventBus.on('quest-accepted', () => this.refresh());
            this.questManager.eventBus.on('quest-completed', () => this.refresh());
            this.questManager.eventBus.on('quest-progress-updated', () => this.refresh());
            this.questManager.eventBus.on('quest-available', () => this.refresh());
        }
    }

    setTab(tab) {
        this.currentTab = tab;
        this.selectedQuest = null;
        this.refreshQuestList();
    }

    refresh() {
        this.refreshQuestList();
        this.refreshQuestDetails();
    }

    refreshQuestList() {
        if (!this.questManager) return;

        let quests = [];
        switch (this.currentTab) {
            case 'active':
                quests = this.questManager.getActiveQuests();
                break;
            case 'available':
                quests = this.questManager.getAvailableQuests();
                break;
            case 'completed':
                quests = this.questManager.getCompletedQuests();
                break;
        }

        // Sort quests by level, then alphabetically
        quests.sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.title.localeCompare(b.title);
        });

        const menuItems = quests.map(quest => ({
            text: this.formatQuestListItem(quest),
            callback: () => this.selectQuest(quest)
        }));

        this.questList.setMenu({
            title: `${this.currentTab.charAt(0).toUpperCase() + this.currentTab.slice(1)} Quests`,
            items: menuItems
        });
    }

    formatQuestListItem(quest) {
        const progress = quest.getOverallProgress();
        const progressPercent = Math.round(progress * 100);

        let prefix = '';
        switch (quest.type) {
            case QuestType.MAIN_STORY:
                prefix = '★ ';
                break;
            case QuestType.SIDE_QUEST:
                prefix = '● ';
                break;
            case QuestType.REPEATABLE:
                prefix = '⟲ ';
                break;
        }

        return `${prefix}${quest.title} (${progressPercent}%)`;
    }

    selectQuest(quest) {
        this.selectedQuest = quest;
        this.refreshQuestDetails();
    }

    refreshQuestDetails() {
        // Details are rendered directly in the render method
        this.dirty = true;
    }

    update(deltaTime) {
        this.tabButtons.update(deltaTime);
        this.questList.update(deltaTime);
        super.update(deltaTime);
    }

    renderContent(ctx) {
        // Render tab buttons area
        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(0, 0, this.size.width, 50);

        // Render quest list area
        ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
        ctx.fillRect(0, 50, this.size.width, this.size.height - 150);

        // Render details area
        ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
        ctx.fillRect(0, this.size.height - 150, this.size.width, 150);

        // Render quest details if selected
        if (this.selectedQuest) {
            this.renderQuestDetails(ctx);
        } else {
            this.renderNoSelection(ctx);
        }
    }

    renderQuestDetails(ctx) {
        const quest = this.selectedQuest;
        const detailsX = this.detailsArea.x;
        const detailsY = this.detailsArea.y;
        const detailsWidth = this.detailsArea.width;

        ctx.fillStyle = this.style.textColor;
        ctx.font = this.style.font;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        let y = detailsY + 5;

        // Quest title
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = this.getQuestTitleColor(quest);
        ctx.fillText(quest.title, detailsX, y);
        y += 25;

        // Quest type and level
        ctx.font = this.style.font;
        ctx.fillStyle = '#cccccc';
        const typeText = `${quest.type.replace('_', ' ').toUpperCase()} - Level ${quest.level}`;
        ctx.fillText(typeText, detailsX, y);
        y += 20;

        // Quest description (truncated if needed)
        ctx.fillStyle = this.style.textColor;
        const descLines = this.wrapText(ctx, quest.description, detailsWidth - 10);
        for (let i = 0; i < Math.min(descLines.length, 2); i++) {
            ctx.fillText(descLines[i], detailsX, y);
            y += 16;
        }

        if (descLines.length > 2) {
            ctx.fillText('...', detailsX, y);
            y += 16;
        }

        y += 10;

        // Objectives
        if (quest.objectives.length > 0) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('Objectives:', detailsX, y);
            y += 20;

            ctx.font = this.style.font;
            quest.objectives.forEach(objective => {
                const completed = objective.isCompleted();
                const progress = objective.getProgress();

                // Progress bar background
                ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                ctx.fillRect(detailsX, y - 2, detailsWidth - 20, 12);

                // Progress bar fill
                ctx.fillStyle = completed ? '#00ff00' : '#0066ff';
                ctx.fillRect(detailsX, y - 2, (detailsWidth - 20) * progress, 12);

                // Objective text
                ctx.fillStyle = completed ? '#00ff00' : this.style.textColor;
                const objText = `${objective.description} (${objective.current}/${objective.required})`;
                ctx.fillText(objText, detailsX + 5, y + 8);

                y += 18;
            });
        }

        // Rewards
        if (quest.rewards.length > 0 && quest.state !== 'turned_in') {
            y += 5;
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('Rewards:', detailsX, y);
            y += 20;

            ctx.font = this.style.font;
            ctx.fillStyle = '#ffaa00';
            quest.rewards.forEach(reward => {
                ctx.fillText(`• ${reward.description}`, detailsX, y);
                y += 16;
            });
        }

        // Status indicator
        const statusText = this.getQuestStatusText(quest);
        const statusColor = this.getQuestStatusColor(quest);

        ctx.fillStyle = statusColor;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(statusText, detailsX + detailsWidth - 10, detailsY + 10);
        ctx.textAlign = 'left';
    }

    renderNoSelection(ctx) {
        ctx.fillStyle = '#888888';
        ctx.font = this.style.font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerX = this.detailsArea.x + this.detailsArea.width / 2;
        const centerY = this.detailsArea.y + this.detailsArea.height / 2;

        ctx.fillText('Select a quest to view details', centerX, centerY);
    }

    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    getQuestTitleColor(quest) {
        switch (quest.type) {
            case QuestType.MAIN_STORY:
                return '#ff6b6b'; // Red for main story
            case QuestType.SIDE_QUEST:
                return '#4ecdc4'; // Teal for side quests
            case QuestType.REPEATABLE:
                return '#ffd93d'; // Yellow for repeatable
            default:
                return '#ffffff';
        }
    }

    getQuestStatusText(quest) {
        switch (quest.state) {
            case QuestState.ACTIVE:
                return 'ACTIVE';
            case QuestState.AVAILABLE:
                return 'AVAILABLE';
            case QuestState.COMPLETED:
                return 'COMPLETED';
            case QuestState.TURNED_IN:
                return 'TURNED IN';
            case QuestState.FAILED:
                return 'FAILED';
            default:
                return 'UNKNOWN';
        }
    }

    getQuestStatusColor(quest) {
        switch (quest.state) {
            case QuestState.ACTIVE:
                return '#0066ff';
            case QuestState.AVAILABLE:
                return '#00ff00';
            case QuestState.COMPLETED:
                return '#ffff00';
            case QuestState.TURNED_IN:
                return '#888888';
            case QuestState.FAILED:
                return '#ff0000';
            default:
                return '#ffffff';
        }
    }

    show() {
        super.show();
        this.refresh();
    }

    hide() {
        super.hide();
        this.selectedQuest = null;
    }
}