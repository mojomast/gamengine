/**
 * CharacterCreationTool - UI tool for creating RPG characters
 * Provides stat allocation, job assignment, and equipment setup
 */

import { Panel, Button, Label, ProgressBar, InputField } from '../../game-engine/src/ui/UIManager.js';
import { RPGCharacter } from './RPGCharacter.js';

class StatAllocator extends Panel {
    constructor(x, y, width, height, initialStats = {}) {
        super(x, y, width, height);

        this.stats = {
            strength: initialStats.strength || 10,
            dexterity: initialStats.dexterity || 10,
            intelligence: initialStats.intelligence || 10,
            wisdom: initialStats.wisdom || 10,
            constitution: initialStats.constitution || 10,
            charisma: initialStats.charisma || 10,
            luck: initialStats.luck || 10
        };

        this.availablePoints = initialStats.availablePoints || 20;
        this.minStatValue = 8;
        this.maxStatValue = 18;

        this.statElements = new Map();
        this.initializeUI();
    }

    initializeUI() {
        // Title
        const title = new Label(10, 10, 'Stat Allocation', 'bold 18px monospace');
        title.style.textColor = '#ffd700';
        this.addChild(title);

        // Available points display
        this.pointsLabel = new Label(10, 35, `Available Points: ${this.availablePoints}`, '14px monospace');
        this.pointsLabel.style.textColor = '#ffffff';
        this.addChild(this.pointsLabel);

        // Stat controls
        const statNames = ['strength', 'dexterity', 'intelligence', 'wisdom', 'constitution', 'charisma', 'luck'];
        const statLabels = ['Strength', 'Dexterity', 'Intelligence', 'Wisdom', 'Constitution', 'Charisma', 'Luck'];

        statNames.forEach((statName, index) => {
            const y = 70 + index * 35;

            // Stat label
            const label = new Label(10, y, statLabels[index], '14px monospace');
            label.style.textColor = '#ffffff';
            this.addChild(label);

            // Current value
            const valueLabel = new Label(120, y, this.stats[statName].toString(), '14px monospace');
            valueLabel.style.textColor = '#00ff00';
            this.addChild(valueLabel);

            // Decrease button
            const decreaseBtn = new Button(150, y - 2, 25, 25, '-');
            decreaseBtn.on('click', () => this.adjustStat(statName, -1, valueLabel));
            this.addChild(decreaseBtn);

            // Increase button
            const increaseBtn = new Button(180, y - 2, 25, 25, '+');
            increaseBtn.on('click', () => this.adjustStat(statName, 1, valueLabel));
            this.addChild(increaseBtn);

            this.statElements.set(statName, { valueLabel, decreaseBtn, increaseBtn });
        });

        this.updateButtonStates();
    }

    adjustStat(statName, amount, valueLabel) {
        const newValue = this.stats[statName] + amount;

        if (newValue < this.minStatValue || newValue > this.maxStatValue) return;
        if (amount > 0 && this.availablePoints <= 0) return;
        if (amount < 0 && this.stats[statName] <= this.minStatValue) return;

        this.stats[statName] = newValue;
        this.availablePoints -= amount;

        valueLabel.setText(this.stats[statName].toString());
        this.pointsLabel.setText(`Available Points: ${this.availablePoints}`);

        this.updateButtonStates();
        this.emit('stats-changed', this.stats);
    }

    updateButtonStates() {
        this.statElements.forEach((elements, statName) => {
            const { decreaseBtn, increaseBtn } = elements;

            // Disable decrease if at minimum
            decreaseBtn.enabled = this.stats[statName] > this.minStatValue;

            // Disable increase if no points available or at maximum
            increaseBtn.enabled = this.availablePoints > 0 && this.stats[statName] < this.maxStatValue;
        });
    }

    getStats() {
        return { ...this.stats, availablePoints: this.availablePoints };
    }

    reset() {
        Object.keys(this.stats).forEach(stat => {
            this.stats[stat] = 10;
        });
        this.availablePoints = 20;

        this.pointsLabel.setText(`Available Points: ${this.availablePoints}`);

        this.statElements.forEach((elements, statName) => {
            elements.valueLabel.setText(this.stats[statName].toString());
        });

        this.updateButtonStates();
        this.emit('stats-changed', this.stats);
    }
}

class JobSelector extends Panel {
    constructor(x, y, width, height, character) {
        super(x, y, width, height);
        this.character = character;
        this.selectedJob = null;
        this.jobButtons = new Map();

        this.initializeUI();
    }

    initializeUI() {
        // Title
        const title = new Label(10, 10, 'Choose Job Class', 'bold 18px monospace');
        title.style.textColor = '#ffd700';
        this.addChild(title);

        // Job options
        const jobs = ['warrior', 'mage', 'rogue', 'cleric'];
        const jobLabels = ['Warrior', 'Mage', 'Rogue', 'Cleric'];

        jobs.forEach((jobId, index) => {
            const x = 10 + (index % 2) * 180;
            const y = 50 + Math.floor(index / 2) * 120;

            const jobButton = new Button(x, y, 160, 100, jobLabels[index]);
            jobButton.style.font = 'bold 16px monospace';
            jobButton.jobId = jobId;

            jobButton.on('click', () => this.selectJob(jobId, jobButton));

            this.addChild(jobButton);
            this.jobButtons.set(jobId, jobButton);
        });

        // Job description area
        this.descriptionLabel = new Label(10, 260, 'Select a job class to see details', '12px monospace');
        this.descriptionLabel.style.textColor = '#cccccc';
        this.addChild(this.descriptionLabel);
    }

    selectJob(jobId, button) {
        // Reset previous selection
        if (this.selectedJob) {
            const prevButton = this.jobButtons.get(this.selectedJob);
            if (prevButton) {
                prevButton.style.backgroundColor = '#d62828';
            }
        }

        // Set new selection
        this.selectedJob = jobId;
        button.style.backgroundColor = '#00ff00';

        // Update description
        const jobInfo = this.character.jobSystem.availableJobs.get(jobId);
        if (jobInfo) {
            this.descriptionLabel.setText(`${jobInfo.name}: ${jobInfo.description}`);
        }

        this.emit('job-selected', jobId);
    }

    getSelectedJob() {
        return this.selectedJob;
    }
}

class EquipmentSelector extends Panel {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.equipment = {
            weapon: null,
            armor: null,
            accessory1: null,
            accessory2: null
        };

        this.initializeUI();
    }

    initializeUI() {
        // Title
        const title = new Label(10, 10, 'Starting Equipment', 'bold 18px monospace');
        title.style.textColor = '#ffd700';
        this.addChild(title);

        // Equipment slots
        const slots = [
            { id: 'weapon', label: 'Weapon', y: 50 },
            { id: 'armor', label: 'Armor', y: 100 },
            { id: 'accessory1', label: 'Accessory 1', y: 150 },
            { id: 'accessory2', label: 'Accessory 2', y: 200 }
        ];

        slots.forEach(slot => {
            // Slot label
            const label = new Label(10, slot.y, slot.label, '14px monospace');
            label.style.textColor = '#ffffff';
            this.addChild(label);

            // Equipment button
            const equipBtn = new Button(120, slot.y - 5, 200, 30, 'Select Equipment');
            equipBtn.slotId = slot.id;
            equipBtn.on('click', () => this.selectEquipment(slot.id, equipBtn));
            this.addChild(equipBtn);

            this.equipment[slot.id] = { button: equipBtn, item: null };
        });
    }

    selectEquipment(slotId, button) {
        // Simple equipment selection - in a real game, this would open an equipment picker
        const equipmentOptions = {
            weapon: [
                { name: 'Rusty Sword', type: 'weapon', statBonuses: { strength: 2 } },
                { name: 'Wooden Staff', type: 'weapon', statBonuses: { intelligence: 2 } },
                { name: 'Dagger', type: 'weapon', statBonuses: { dexterity: 2 } }
            ],
            armor: [
                { name: 'Leather Armor', type: 'armor', statBonuses: { constitution: 1 } },
                { name: 'Cloth Robes', type: 'armor', statBonuses: { intelligence: 1 } },
                { name: 'Chain Mail', type: 'armor', statBonuses: { constitution: 2, dexterity: -1 } }
            ],
            accessory1: [
                { name: 'Health Amulet', type: 'accessory', statBonuses: { constitution: 1 } },
                { name: 'Magic Ring', type: 'accessory', statBonuses: { intelligence: 1 } },
                { name: 'Lucky Charm', type: 'accessory', statBonuses: { luck: 1 } }
            ],
            accessory2: [
                { name: 'Strength Bracelet', type: 'accessory', statBonuses: { strength: 1 } },
                { name: 'Wisdom Pendant', type: 'accessory', statBonuses: { wisdom: 1 } },
                { name: 'Agility Boots', type: 'accessory', statBonuses: { dexterity: 1 } }
            ]
        };

        const options = equipmentOptions[slotId] || [];
        if (options.length > 0) {
            // For simplicity, select the first option
            const selectedItem = options[0];
            this.equipment[slotId].item = selectedItem;
            button.setText(selectedItem.name);

            this.emit('equipment-selected', { slotId, item: selectedItem });
        }
    }

    getEquipment() {
        return this.equipment;
    }

    reset() {
        Object.values(this.equipment).forEach(slot => {
            if (slot.button) {
                slot.button.setText('Select Equipment');
            }
            slot.item = null;
        });
    }
}

class CharacterCreationTool extends Panel {
    constructor(x, y, width, height, uiManager) {
        super(x, y, width, height);
        this.uiManager = uiManager;
        this.character = null;
        this.creationStep = 0; // 0: name, 1: stats, 2: job, 3: equipment, 4: review

        this.initializeUI();
        this.showStep();
    }

    initializeUI() {
        // Main title
        const title = new Label(10, 10, 'Character Creation', 'bold 24px monospace');
        title.style.textColor = '#ffd700';
        this.addChild(title);

        // Step indicator
        this.stepLabel = new Label(10, 45, 'Step 1: Name Your Character', '16px monospace');
        this.stepLabel.style.textColor = '#ffffff';
        this.addChild(this.stepLabel);

        // Navigation buttons
        this.backBtn = new Button(10, this.size.height - 60, 100, 40, 'Back');
        this.backBtn.on('click', () => this.previousStep());
        this.backBtn.enabled = false;
        this.addChild(this.backBtn);

        this.nextBtn = new Button(this.size.width - 110, this.size.height - 60, 100, 40, 'Next');
        this.nextBtn.on('click', () => this.nextStep());
        this.addChild(this.nextBtn);

        // Create step panels
        this.createNameStep();
        this.createStatsStep();
        this.createJobStep();
        this.createEquipmentStep();
        this.createReviewStep();
    }

    createNameStep() {
        this.namePanel = new Panel(10, 80, this.size.width - 20, 200);

        const nameLabel = new Label(10, 10, 'Enter Character Name:', '16px monospace');
        nameLabel.style.textColor = '#ffffff';
        this.namePanel.addChild(nameLabel);

        this.nameInput = new InputField(10, 40, this.size.width - 40, 40, 'Enter name...');
        this.nameInput.maxLength = 20;
        this.namePanel.addChild(this.nameInput);

        const randomBtn = new Button(10, 100, 150, 40, 'Random Name');
        randomBtn.on('click', () => this.generateRandomName());
        this.namePanel.addChild(randomBtn);

        this.addChild(this.namePanel);
    }

    createStatsStep() {
        this.statsPanel = new StatAllocator(10, 80, this.size.width - 20, 350);
        this.statsPanel.on('stats-changed', (stats) => {
            this.statsData = stats;
        });
        this.addChild(this.statsPanel);

        // Initialize stats data
        this.statsData = this.statsPanel.getStats();
    }

    createJobStep() {
        this.jobPanel = new JobSelector(10, 80, this.size.width - 20, 320, this.character);
        this.jobPanel.on('job-selected', (jobId) => {
            this.selectedJob = jobId;
        });
        this.addChild(this.jobPanel);
    }

    createEquipmentStep() {
        this.equipmentPanel = new EquipmentSelector(10, 80, this.size.width - 20, 250);
        this.equipmentPanel.on('equipment-selected', (data) => {
            this.equipmentData = this.equipmentData || {};
            this.equipmentData[data.slotId] = data.item;
        });
        this.addChild(this.equipmentPanel);
    }

    createReviewStep() {
        this.reviewPanel = new Panel(10, 80, this.size.width - 20, 300);

        const reviewTitle = new Label(10, 10, 'Character Review', 'bold 18px monospace');
        reviewTitle.style.textColor = '#ffd700';
        this.reviewPanel.addChild(reviewTitle);

        // Character info labels
        this.reviewNameLabel = new Label(10, 40, 'Name: ', '14px monospace');
        this.reviewPanel.addChild(this.reviewNameLabel);

        this.reviewJobLabel = new Label(10, 65, 'Job: ', '14px monospace');
        this.reviewPanel.addChild(this.reviewJobLabel);

        // Stat summary
        this.reviewStatsLabel = new Label(10, 100, 'Stats:', '16px monospace');
        this.reviewStatsLabel.style.textColor = '#ffffff';
        this.reviewPanel.addChild(this.reviewStatsLabel);

        this.reviewStatsDetail = new Label(10, 125, '', '12px monospace');
        this.reviewStatsDetail.style.textColor = '#cccccc';
        this.reviewPanel.addChild(this.reviewStatsDetail);

        // Equipment summary
        this.reviewEquipmentLabel = new Label(10, 200, 'Equipment:', '16px monospace');
        this.reviewEquipmentLabel.style.textColor = '#ffffff';
        this.reviewPanel.addChild(this.reviewEquipmentLabel);

        this.reviewEquipmentDetail = new Label(10, 225, '', '12px monospace');
        this.reviewEquipmentDetail.style.textColor = '#cccccc';
        this.reviewPanel.addChild(this.reviewEquipmentDetail);

        // Create button
        const createBtn = new Button(10, 270, 150, 40, 'Create Character');
        createBtn.style.backgroundColor = '#00ff00';
        createBtn.on('click', () => this.createCharacter());
        this.reviewPanel.addChild(createBtn);

        this.addChild(this.reviewPanel);
    }

    showStep() {
        // Hide all step panels
        [this.namePanel, this.statsPanel, this.jobPanel, this.equipmentPanel, this.reviewPanel].forEach(panel => {
            if (panel) panel.hide();
        });

        // Show current step panel
        const panels = [this.namePanel, this.statsPanel, this.jobPanel, this.equipmentPanel, this.reviewPanel];
        const steps = ['Name Your Character', 'Allocate Stats', 'Choose Job Class', 'Select Equipment', 'Review & Create'];

        if (panels[this.creationStep]) {
            panels[this.creationStep].show();
        }

        this.stepLabel.setText(`Step ${this.creationStep + 1}: ${steps[this.creationStep]}`);

        // Update navigation buttons
        this.backBtn.enabled = this.creationStep > 0;
        this.nextBtn.enabled = this.canProceedToNextStep();

        if (this.creationStep === 4) {
            this.nextBtn.hide();
        } else {
            this.nextBtn.show();
        }

        if (this.creationStep === 4) {
            this.updateReview();
        }
    }

    canProceedToNextStep() {
        switch (this.creationStep) {
            case 0: return this.nameInput.text.trim().length > 0;
            case 1: return this.statsData.availablePoints === 0;
            case 2: return this.selectedJob !== null;
            case 3: return true; // Equipment is optional
            case 4: return true;
            default: return false;
        }
    }

    nextStep() {
        if (this.canProceedToNextStep() && this.creationStep < 4) {
            this.creationStep++;
            this.showStep();
        }
    }

    previousStep() {
        if (this.creationStep > 0) {
            this.creationStep--;
            this.showStep();
        }
    }

    generateRandomName() {
        const names = ['Aldric', 'Branwen', 'Cedric', 'Dara', 'Eamon', 'Fiona', 'Gareth', 'Helena', 'Ian', 'Jasmine'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        this.nameInput.setText(randomName);
    }

    updateReview() {
        const name = this.nameInput.text.trim() || 'Unnamed';
        const jobName = this.selectedJob ? this.jobPanel.character?.jobSystem.availableJobs.get(this.selectedJob)?.name : 'None';

        this.reviewNameLabel.setText(`Name: ${name}`);
        this.reviewJobLabel.setText(`Job: ${jobName}`);

        // Stats summary
        const stats = this.statsData;
        const statsText = `STR:${stats.strength} DEX:${stats.dexterity} INT:${stats.intelligence} WIS:${stats.wisdom} CON:${stats.constitution} CHA:${stats.charisma} LUC:${stats.luck}`;
        this.reviewStatsDetail.setText(statsText);

        // Equipment summary
        const equipment = this.equipmentData || {};
        let equipmentText = '';
        if (equipment.weapon) equipmentText += `Weapon: ${equipment.weapon.name}\n`;
        if (equipment.armor) equipmentText += `Armor: ${equipment.armor.name}\n`;
        if (equipment.accessory1) equipmentText += `Accessory 1: ${equipment.accessory1.name}\n`;
        if (equipment.accessory2) equipmentText += `Accessory 2: ${equipment.accessory2.name}`;
        this.reviewEquipmentDetail.setText(equipmentText || 'No equipment selected');
    }

    createCharacter() {
        const name = this.nameInput.text.trim();
        if (!name) return;

        // Create character with collected data
        this.character = new RPGCharacter({
            name: name,
            strength: this.statsData.strength,
            dexterity: this.statsData.dexterity,
            intelligence: this.statsData.intelligence,
            wisdom: this.statsData.wisdom,
            constitution: this.statsData.constitution,
            charisma: this.statsData.charisma,
            luck: this.statsData.luck,
            job: this.selectedJob
        });

        // Equip items
        if (this.equipmentData) {
            Object.entries(this.equipmentData).forEach(([slot, item]) => {
                if (item) {
                    // Convert equipment slots to character equipment slots
                    const equipSlotMap = {
                        weapon: 'weapon',
                        armor: 'chest',
                        accessory1: 'ring1',
                        accessory2: 'ring2'
                    };
                    const characterSlot = equipSlotMap[slot];
                    if (characterSlot) {
                        this.character.equipItem(characterSlot, item);
                    }
                }
            });
        }

        // Emit character created event
        this.emit('character-created', this.character);

        // Show success notification
        if (this.uiManager) {
            this.uiManager.createNotification(
                `Character "${name}" created successfully!`,
                3000,
                'success'
            );
        }

        // Close the creation tool
        this.hide();
    }

    reset() {
        this.creationStep = 0;
        this.character = null;
        this.selectedJob = null;
        this.statsData = null;
        this.equipmentData = null;

        this.nameInput.setText('');
        this.statsPanel.reset();
        this.equipmentPanel.reset();

        // Reset job selection
        this.jobPanel.selectedJob = null;
        this.jobPanel.jobButtons.forEach(button => {
            button.style.backgroundColor = '#d62828';
        });

        this.showStep();
    }

    getCharacter() {
        return this.character;
    }
}

export { CharacterCreationTool, StatAllocator, JobSelector, EquipmentSelector };