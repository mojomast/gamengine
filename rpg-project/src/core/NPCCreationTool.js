import { UIManager, Button, Label, Panel, InputField, MenuManager } from '../../game-engine/src/ui/UIManager.js';
import { DialogTree, DialogNode, DialogChoice } from './DialogTree.js';
import { NPC } from './NPC.js';
import { LocalizationManager } from './LocalizationManager.js';
import { ValidationHelpers } from '../../game-engine/src/core/ValidationHelpers.js';

/**
 * NPC Creation Tool
 * Comprehensive tool for creating and configuring NPCs with dialog and behavior
 */
class NPCCreationTool {
    constructor(engine, uiManager) {
        this.engine = engine;
        this.uiManager = uiManager;
        this.localization = new LocalizationManager();
        this.currentNPC = null;
        this.dialogTree = null;
        this.isVisible = false;

        this.init();
    }

    init() {
        // Load default localization
        this.localization.loadLanguage('en');

        // Create main panel
        this.mainPanel = new Panel(50, 50, 700, 500);
        this.mainPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.mainPanel.style.borderColor = '#ffd700';

        // Create tab system
        this.tabs = ['basic', 'dialog', 'behavior', 'schedule', 'preview'];
        this.currentTab = 'basic';

        this.createTabButtons();
        this.createBasicTab();
        this.createDialogTab();
        this.createBehaviorTab();
        this.createScheduleTab();
        this.createPreviewTab();

        // Add to UI manager
        this.uiManager.addComponent(this.mainPanel, 'npc_creation_tool');
        this.hide();
    }

    createTabButtons() {
        const tabY = 10;
        let tabX = 10;

        this.tabButtons = {};

        this.tabs.forEach(tab => {
            const button = new Button(tabX, tabY, 100, 30, this.localization.getText(`npc.tool.tab_${tab}`));
            button.on('click', () => this.switchTab(tab));
            this.mainPanel.addChild(button);
            this.tabButtons[tab] = button;
            tabX += 110;
        });

        // Close button
        const closeButton = new Button(650, 10, 40, 30, '×');
        closeButton.style.font = 'bold 20px monospace';
        closeButton.on('click', () => this.hide());
        this.mainPanel.addChild(closeButton);
    }

    createBasicTab() {
        const tabPanel = new Panel(10, 60, 680, 430);
        tabPanel.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        this.mainPanel.addChild(tabPanel);
        this.basicTab = tabPanel;

        // Basic info section
        let y = 20;

        const nameLabel = new Label(20, y, 'Name:');
        tabPanel.addChild(nameLabel);

        this.nameInput = new InputField(120, y, 200, 30, 'Enter NPC name');
        tabPanel.addChild(this.nameInput);
        y += 50;

        const displayNameLabel = new Label(20, y, 'Display Name:');
        tabPanel.addChild(displayNameLabel);

        this.displayNameInput = new InputField(120, y, 200, 30, 'Name shown in game');
        tabPanel.addChild(this.displayNameInput);
        y += 50;

        const descriptionLabel = new Label(20, y, 'Description:');
        tabPanel.addChild(descriptionLabel);

        this.descriptionInput = new InputField(120, y, 400, 60, 'NPC description');
        tabPanel.addChild(this.descriptionInput);
        y += 80;

        // Position section
        const positionLabel = new Label(20, y, 'Position:');
        tabPanel.addChild(positionLabel);

        const xLabel = new Label(120, y, 'X:');
        tabPanel.addChild(xLabel);

        this.posXInput = new InputField(140, y, 80, 30, '100');
        tabPanel.addChild(this.posXInput);

        const yLabel = new Label(240, y, 'Y:');
        tabPanel.addChild(yLabel);

        this.posYInput = new InputField(260, y, 80, 30, '100');
        tabPanel.addChild(this.posYInput);
        y += 50;

        // Visual section
        const spriteLabel = new Label(20, y, 'Sprite:');
        tabPanel.addChild(spriteLabel);

        this.spriteInput = new InputField(120, y, 200, 30, 'sprite_path.png');
        tabPanel.addChild(this.spriteInput);

        const portraitLabel = new Label(20, y + 40, 'Portrait:');
        tabPanel.addChild(portraitLabel);

        this.portraitInput = new InputField(120, y + 40, 200, 30, 'portrait_path.png');
        tabPanel.addChild(this.portraitInput);

        // Interaction radius
        const radiusLabel = new Label(400, y, 'Interaction Radius:');
        tabPanel.addChild(radiusLabel);

        this.radiusInput = new InputField(520, y, 80, 30, '32');
        tabPanel.addChild(this.radiusInput);

        // Create/Update button
        const createButton = new Button(500, 380, 150, 40, 'Create NPC');
        createButton.on('click', () => this.createNPC());
        tabPanel.addChild(createButton);
        this.createButton = createButton;
    }

    createDialogTab() {
        const tabPanel = new Panel(10, 60, 680, 430);
        tabPanel.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        this.mainPanel.addChild(tabPanel);
        this.dialogTab = tabPanel;

        // Dialog tree section
        let y = 20;

        const dialogLabel = new Label(20, y, 'Dialog Tree:');
        tabPanel.addChild(dialogLabel);

        this.dialogIdInput = new InputField(120, y, 200, 30, 'dialog_id');
        tabPanel.addChild(this.dialogIdInput);
        y += 50;

        // Node list
        const nodeListLabel = new Label(20, y, 'Dialog Nodes:');
        tabPanel.addChild(nodeListLabel);

        this.nodeListPanel = new Panel(20, y + 30, 300, 300);
        this.nodeListPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        tabPanel.addChild(this.nodeListPanel);

        // Node editor
        this.nodeEditorPanel = new Panel(340, y + 30, 320, 300);
        this.nodeEditorPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        tabPanel.addChild(this.nodeEditorPanel);

        this.createNodeEditor();

        // Add node button
        const addNodeButton = new Button(20, 380, 100, 30, 'Add Node');
        addNodeButton.on('click', () => this.addDialogNode());
        tabPanel.addChild(addNodeButton);

        // Delete node button
        const deleteNodeButton = new Button(140, 380, 100, 30, 'Delete Node');
        deleteNodeButton.on('click', () => this.deleteDialogNode());
        tabPanel.addChild(deleteNodeButton);

        // Save dialog button
        const saveDialogButton = new Button(520, 380, 120, 30, 'Save Dialog');
        saveDialogButton.on('click', () => this.saveDialogTree());
        tabPanel.addChild(saveDialogButton);
    }

    createNodeEditor() {
        let y = 10;

        // Node ID
        const nodeIdLabel = new Label(10, y, 'Node ID:');
        this.nodeEditorPanel.addChild(nodeIdLabel);

        this.nodeIdInput = new InputField(80, y, 120, 30, 'node_id');
        this.nodeEditorPanel.addChild(this.nodeIdInput);
        y += 50;

        // Speaker
        const speakerLabel = new Label(10, y, 'Speaker:');
        this.nodeEditorPanel.addChild(speakerLabel);

        this.nodeSpeakerInput = new InputField(80, y, 120, 30, 'NPC Name');
        this.nodeEditorPanel.addChild(this.nodeSpeakerInput);
        y += 50;

        // Text
        const textLabel = new Label(10, y, 'Text:');
        this.nodeEditorPanel.addChild(textLabel);

        this.nodeTextInput = new InputField(10, y + 30, 300, 60, 'Dialog text...');
        this.nodeEditorPanel.addChild(this.nodeTextInput);
        y += 110;

        // Auto advance
        const autoAdvanceLabel = new Label(10, y, 'Auto Advance:');
        this.nodeEditorPanel.addChild(autoAdvanceLabel);

        this.autoAdvanceCheckbox = new Button(120, y, 20, 20, '✓');
        this.autoAdvanceCheckbox.state = false;
        this.autoAdvanceCheckbox.on('click', () => {
            this.autoAdvanceCheckbox.state = !this.autoAdvanceCheckbox.state;
            this.autoAdvanceCheckbox.setText(this.autoAdvanceCheckbox.state ? '✓' : '✗');
        });
        this.nodeEditorPanel.addChild(this.autoAdvanceCheckbox);

        // Next node
        const nextNodeLabel = new Label(160, y, 'Next Node:');
        this.nodeEditorPanel.addChild(nextNodeLabel);

        this.nextNodeInput = new InputField(240, y, 70, 30, '');
        this.nodeEditorPanel.addChild(this.nextNodeInput);
        y += 40;

        // Choices section
        const choicesLabel = new Label(10, y, 'Choices:');
        this.nodeEditorPanel.addChild(choicesLabel);

        this.choicesPanel = new Panel(10, y + 30, 300, 80);
        this.choicesPanel.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
        this.nodeEditorPanel.addChild(this.choicesPanel);

        // Add choice button
        const addChoiceButton = new Button(200, y, 80, 25, '+ Choice');
        addChoiceButton.on('click', () => this.addChoice());
        this.nodeEditorPanel.addChild(addChoiceButton);
    }

    createBehaviorTab() {
        const tabPanel = new Panel(10, 60, 680, 430);
        tabPanel.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        this.mainPanel.addChild(tabPanel);
        this.behaviorTab = tabPanel;

        let y = 20;

        // Behavior type
        const behaviorLabel = new Label(20, y, 'Behavior Type:');
        tabPanel.addChild(behaviorLabel);

        this.behaviorTypeMenu = new MenuManager(150, y, 200, 150);
        this.behaviorTypeMenu.setMenu({
            title: 'Select Behavior',
            items: [
                { text: 'Static', callback: () => this.setBehaviorType('static') },
                { text: 'Idle', callback: () => this.setBehaviorType('idle') },
                { text: 'Wander', callback: () => this.setBehaviorType('wander') },
                { text: 'Patrol', callback: () => this.setBehaviorType('patrol') },
                { text: 'Follow Player', callback: () => this.setBehaviorType('follow') },
                { text: 'Waypoint', callback: () => this.setBehaviorType('waypoint') }
            ]
        });
        tabPanel.addChild(this.behaviorTypeMenu);

        // Movement parameters
        y += 180;

        const speedLabel = new Label(20, y, 'Movement Speed:');
        tabPanel.addChild(speedLabel);

        this.speedInput = new InputField(150, y, 80, 30, '50');
        tabPanel.addChild(this.speedInput);
        y += 50;

        const wanderRadiusLabel = new Label(20, y, 'Wander Radius:');
        tabPanel.addChild(wanderRadiusLabel);

        this.wanderRadiusInput = new InputField(150, y, 80, 30, '100');
        tabPanel.addChild(this.wanderRadiusInput);
        y += 50;

        const idleDurationLabel = new Label(20, y, 'Idle Duration (ms):');
        tabPanel.addChild(idleDurationLabel);

        this.idleDurationInput = new InputField(150, y, 80, 30, '3000');
        tabPanel.addChild(this.idleDurationInput);
        y += 50;

        const movementDurationLabel = new Label(20, y, 'Movement Duration (ms):');
        tabPanel.addChild(movementDurationLabel);

        this.movementDurationInput = new InputField(150, y, 80, 30, '2000');
        tabPanel.addChild(this.movementDurationInput);

        // Waypoints section
        y += 60;
        const waypointsLabel = new Label(20, y, 'Waypoints:');
        tabPanel.addChild(waypointsLabel);

        this.waypointsList = new Label(20, y + 30, 'No waypoints', '12px monospace');
        tabPanel.addChild(this.waypointsList);

        const addWaypointButton = new Button(400, y, 120, 30, 'Add Waypoint');
        addWaypointButton.on('click', () => this.addWaypoint());
        tabPanel.addChild(addWaypointButton);

        const clearWaypointsButton = new Button(530, y, 120, 30, 'Clear All');
        clearWaypointsButton.on('click', () => this.clearWaypoints());
        tabPanel.addChild(clearWaypointsButton);
    }

    createScheduleTab() {
        const tabPanel = new Panel(10, 60, 680, 430);
        tabPanel.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        this.mainPanel.addChild(tabPanel);
        this.scheduleTab = tabPanel;

        let y = 20;

        const scheduleLabel = new Label(20, y, 'NPC Schedule:');
        tabPanel.addChild(scheduleLabel);
        y += 50;

        // Schedule list
        this.scheduleListPanel = new Panel(20, y, 400, 300);
        this.scheduleListPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        tabPanel.addChild(this.scheduleListPanel);

        // Schedule editor
        const editorX = 440;
        let editorY = y;

        const timeLabel = new Label(editorX, editorY, 'Time (HH:MM):');
        tabPanel.addChild(timeLabel);

        this.scheduleTimeInput = new InputField(editorX + 100, editorY, 100, 30, '09:00');
        tabPanel.addChild(this.scheduleTimeInput);
        editorY += 50;

        const actionLabel = new Label(editorX, editorY, 'Action:');
        tabPanel.addChild(actionLabel);

        this.scheduleActionMenu = new MenuManager(editorX + 100, editorY, 150, 120);
        this.scheduleActionMenu.setMenu({
            title: 'Select Action',
            items: [
                { text: 'Move', callback: () => this.setScheduleAction('move') },
                { text: 'Change Behavior', callback: () => this.setScheduleAction('behavior') },
                { text: 'Change Dialog', callback: () => this.setScheduleAction('dialog') },
                { text: 'Show/Hide', callback: () => this.setScheduleAction('visible') }
            ]
        });
        tabPanel.addChild(this.scheduleActionMenu);
        editorY += 140;

        // Action parameters
        this.actionParamsPanel = new Panel(editorX, editorY, 200, 100);
        this.actionParamsPanel.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
        tabPanel.addChild(this.actionParamsPanel);

        // Buttons
        const addScheduleButton = new Button(20, 400, 100, 30, 'Add Entry');
        addScheduleButton.on('click', () => this.addScheduleEntry());
        tabPanel.addChild(addScheduleButton);

        const deleteScheduleButton = new Button(140, 400, 100, 30, 'Delete Entry');
        deleteScheduleButton.on('click', () => this.deleteScheduleEntry());
        tabPanel.addChild(deleteScheduleButton);

        const saveScheduleButton = new Button(520, 400, 120, 30, 'Save Schedule');
        saveScheduleButton.on('click', () => this.saveSchedule());
        tabPanel.addChild(saveScheduleButton);
    }

    createPreviewTab() {
        const tabPanel = new Panel(10, 60, 680, 430);
        tabPanel.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        this.mainPanel.addChild(tabPanel);
        this.previewTab = tabPanel;

        // Preview area
        const previewPanel = new Panel(50, 50, 400, 300);
        previewPanel.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
        tabPanel.addChild(previewPanel);

        // Preview controls
        const testDialogButton = new Button(500, 100, 150, 40, 'Test Dialog');
        testDialogButton.on('click', () => this.testDialog());
        tabPanel.addChild(testDialogButton);

        const testMovementButton = new Button(500, 160, 150, 40, 'Test Movement');
        testMovementButton.on('click', () => this.testMovement());
        tabPanel.addChild(testMovementButton);

        // Export buttons
        const exportNPCButton = new Button(500, 250, 150, 40, 'Export NPC');
        exportNPCButton.on('click', () => this.exportNPC());
        tabPanel.addChild(exportNPCButton);

        const exportDialogButton = new Button(500, 310, 150, 40, 'Export Dialog');
        exportDialogButton.on('click', () => this.exportDialog());
        tabPanel.addChild(exportDialogButton);
    }

    // Tab switching
    switchTab(tabName) {
        // Hide all tabs
        this.basicTab.visible = false;
        this.dialogTab.visible = false;
        this.behaviorTab.visible = false;
        this.scheduleTab.visible = false;
        this.previewTab.visible = false;

        // Update button states
        Object.values(this.tabButtons).forEach(button => {
            button.style.backgroundColor = '#d62828';
        });

        // Show selected tab
        this.currentTab = tabName;
        switch (tabName) {
            case 'basic':
                this.basicTab.visible = true;
                break;
            case 'dialog':
                this.dialogTab.visible = true;
                break;
            case 'behavior':
                this.behaviorTab.visible = true;
                break;
            case 'schedule':
                this.scheduleTab.visible = true;
                break;
            case 'preview':
                this.previewTab.visible = true;
                break;
        }

        this.tabButtons[tabName].style.backgroundColor = '#ffd700';
    }

    // NPC creation and management
    createNPC() {
        const config = {
            id: this.nameInput.text.toLowerCase().replace(/\s+/g, '_') || 'npc_' + Date.now(),
            name: this.nameInput.text || 'Unnamed NPC',
            displayName: this.displayNameInput.text || this.nameInput.text,
            description: this.descriptionInput.text || '',
            dialogId: this.dialogIdInput.text || null,
            sprite: this.spriteInput.text || null,
            portrait: this.portraitInput.text || null,
            position: {
                x: parseInt(this.posXInput.text) || 100,
                y: parseInt(this.posYInput.text) || 100
            },
            interactionRadius: parseInt(this.radiusInput.text) || 32,
            behaviorType: 'idle', // Default
            movementPattern: 'idle'
        };

        this.currentNPC = new NPC(config.position.x, config.position.y, config);
        this.updateCreateButton();
        console.log('NPC created:', this.currentNPC);
    }

    updateCreateButton() {
        if (this.currentNPC) {
            this.createButton.setText('Update NPC');
        } else {
            this.createButton.setText('Create NPC');
        }
    }

    // Dialog management
    addDialogNode() {
        if (!this.dialogTree) {
            this.dialogTree = new DialogTree({
                id: this.dialogIdInput.text || 'dialog_' + Date.now(),
                nodes: {}
            });
        }

        const nodeId = 'node_' + Date.now();
        const node = new DialogNode({
            id: nodeId,
            text: 'New dialog text...',
            speaker: this.currentNPC?.displayName || 'NPC'
        });

        this.dialogTree.nodes.set(nodeId, node);
        this.updateNodeList();
    }

    deleteDialogNode() {
        // Implementation would depend on selected node
        console.log('Delete dialog node');
    }

    saveDialogTree() {
        if (this.dialogTree) {
            console.log('Dialog tree saved:', this.dialogTree.toJSON());
        }
    }

    updateNodeList() {
        if (!this.dialogTree) return;

        let listText = '';
        this.dialogTree.nodes.forEach((node, id) => {
            listText += `${id}: ${node.text.substring(0, 30)}...\n`;
        });

        // Update the node list display
        console.log('Node list updated:', listText);
    }

    addChoice() {
        // Implementation for adding choices to current node
        console.log('Add choice');
    }

    // Behavior management
    setBehaviorType(type) {
        if (this.currentNPC) {
            this.currentNPC.behaviorType = type;
            this.currentNPC.movementPattern = type;
        }
    }

    addWaypoint() {
        if (this.currentNPC) {
            // In a real implementation, this would open a dialog to input coordinates
            const x = this.currentNPC.position.x + Math.random() * 200 - 100;
            const y = this.currentNPC.position.y + Math.random() * 200 - 100;
            this.currentNPC.waypoints.push({ x, y });
            this.updateWaypointsList();
        }
    }

    clearWaypoints() {
        if (this.currentNPC) {
            this.currentNPC.waypoints = [];
            this.updateWaypointsList();
        }
    }

    updateWaypointsList() {
        if (!this.currentNPC) return;

        let listText = '';
        this.currentNPC.waypoints.forEach((waypoint, index) => {
            listText += `${index + 1}: (${Math.round(waypoint.x)}, ${Math.round(waypoint.y)})\n`;
        });

        if (!listText) listText = 'No waypoints';
        this.waypointsList.setText(listText);
    }

    // Schedule management
    setScheduleAction(action) {
        this.selectedScheduleAction = action;
        this.updateActionParams();
    }

    updateActionParams() {
        // Clear existing params
        this.actionParamsPanel.children = [];

        let y = 10;
        switch (this.selectedScheduleAction) {
            case 'move':
                const xLabel = new Label(10, y, 'X:');
                this.actionParamsPanel.addChild(xLabel);

                this.actionXInput = new InputField(30, y, 60, 25, '100');
                this.actionParamsPanel.addChild(this.actionXInput);

                const yLabel = new Label(100, y, 'Y:');
                this.actionParamsPanel.addChild(yLabel);

                this.actionYInput = new InputField(120, y, 60, 25, '100');
                this.actionParamsPanel.addChild(this.actionYInput);
                break;

            case 'behavior':
                const behaviorMenu = new MenuManager(10, y, 150, 100);
                behaviorMenu.setMenu({
                    title: 'Behavior',
                    items: [
                        { text: 'Idle', callback: () => this.selectedBehavior = 'idle' },
                        { text: 'Wander', callback: () => this.selectedBehavior = 'wander' },
                        { text: 'Patrol', callback: () => this.selectedBehavior = 'patrol' }
                    ]
                });
                this.actionParamsPanel.addChild(behaviorMenu);
                break;

            case 'dialog':
                const dialogLabel = new Label(10, y, 'Dialog ID:');
                this.actionParamsPanel.addChild(dialogLabel);

                this.actionDialogInput = new InputField(80, y, 100, 25, 'dialog_id');
                this.actionParamsPanel.addChild(this.actionDialogInput);
                break;

            case 'visible':
                const visibleLabel = new Label(10, y, 'Visible:');
                this.actionParamsPanel.addChild(visibleLabel);

                this.actionVisibleCheckbox = new Button(70, y, 20, 20, '✓');
                this.actionVisibleCheckbox.state = true;
                this.actionVisibleCheckbox.on('click', () => {
                    this.actionVisibleCheckbox.state = !this.actionVisibleCheckbox.state;
                    this.actionVisibleCheckbox.setText(this.actionVisibleCheckbox.state ? '✓' : '✗');
                });
                this.actionParamsPanel.addChild(this.actionVisibleCheckbox);
                break;
        }
    }

    addScheduleEntry() {
        if (!this.currentNPC) return;

        const timeString = this.scheduleTimeInput.text;
        const time = this.parseTimeString(timeString);

        if (!time) {
            console.error('Invalid time format');
            return;
        }

        const entry = {
            time: time,
            type: this.selectedScheduleAction
        };

        // Add action-specific parameters
        switch (this.selectedScheduleAction) {
            case 'move':
                entry.x = parseInt(this.actionXInput?.text) || 100;
                entry.y = parseInt(this.actionYInput?.text) || 100;
                break;
            case 'behavior':
                entry.behavior = this.selectedBehavior || 'idle';
                break;
            case 'dialog':
                entry.dialogId = this.actionDialogInput?.text || '';
                break;
            case 'visible':
                entry.visible = this.actionVisibleCheckbox?.state !== false;
                break;
        }

        if (!this.currentNPC.schedule) {
            this.currentNPC.schedule = [];
        }

        this.currentNPC.schedule.push(entry);
        this.currentNPC.schedule.sort((a, b) => a.time - b.time);
        this.updateScheduleList();
    }

    parseTimeString(timeString) {
        const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
        if (!match) return null;

        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);

        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

        return hours * 60 * 60 * 1000 + minutes * 60 * 1000; // Convert to milliseconds from midnight
    }

    deleteScheduleEntry() {
        // Implementation would depend on selected entry
        console.log('Delete schedule entry');
    }

    saveSchedule() {
        if (this.currentNPC) {
            console.log('Schedule saved:', this.currentNPC.schedule);
        }
    }

    updateScheduleList() {
        if (!this.currentNPC || !this.currentNPC.schedule) return;

        let listText = '';
        this.currentNPC.schedule.forEach((entry, index) => {
            const timeString = this.formatTimeString(entry.time);
            listText += `${index + 1}. ${timeString}: ${entry.type}`;
            if (entry.x !== undefined) {
                listText += ` (${entry.x}, ${entry.y})`;
            }
            listText += '\n';
        });

        // Update schedule list display
        console.log('Schedule list updated:', listText);
    }

    formatTimeString(timeMs) {
        const totalMinutes = Math.floor(timeMs / (60 * 1000));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Preview and testing
    testDialog() {
        if (this.dialogTree && this.engine.scene?.dialogManager) {
            this.engine.scene.dialogManager.loadDialog(
                this.dialogTree.id,
                this.dialogTree.toDialogManagerFormat()
            );
            this.engine.scene.dialogManager.startDialog(this.dialogTree.id);
        }
    }

    testMovement() {
        if (this.currentNPC) {
            // Add NPC to scene temporarily for testing
            if (this.engine.scene) {
                this.engine.scene.addGameObject(this.currentNPC);
                setTimeout(() => {
                    this.engine.scene.removeGameObject(this.currentNPC);
                }, 10000); // Remove after 10 seconds
            }
        }
    }

    exportNPC() {
        if (this.currentNPC) {
            const npcData = this.currentNPC.toJSON();
            console.log('NPC exported:', JSON.stringify(npcData, null, 2));
            // In a real implementation, this would save to a file
        }
    }

    exportDialog() {
        if (this.dialogTree) {
            const dialogData = this.dialogTree.toJSON();
            console.log('Dialog exported:', JSON.stringify(dialogData, null, 2));
            // In a real implementation, this would save to a file
        }
    }

    // UI management
    show() {
        this.isVisible = true;
        this.mainPanel.show();
        this.switchTab(this.currentTab);
    }

    hide() {
        this.isVisible = false;
        this.mainPanel.hide();
    }

    update(deltaTime) {
        if (!this.isVisible) return;

        this.mainPanel.update(deltaTime);
    }

    render(ctx) {
        if (!this.isVisible) return;

        this.mainPanel.render(ctx);
    }
}

export { NPCCreationTool };