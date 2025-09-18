/**
 * MagicCreationTool.js - UI Tool for Creating and Balancing Magic/Spells
 * Provides a comprehensive interface for spell creation and testing
 */

import { UIManager } from '../../game-engine/src/ui/UIManager.js';
import { SpellDatabase, createCustomSpell } from '../core/SpellDatabase.js';
import { MAGIC_SCHOOLS, SPELL_CATEGORIES, TARGET_TYPES } from '../core/MagicAbility.js';
import { ELEMENTAL_TYPES } from '../core/MagicAbility.js';

class MagicCreationTool {
    constructor(game, spellDatabase) {
        this.game = game;
        this.spellDatabase = spellDatabase;
        this.uiManager = game.uiManager;
        this.currentSpell = null;
        this.isVisible = false;
        this.testCharacter = null;
        this.testTarget = null;
        this.initializeUI();
    }

    initializeUI() {
        this.createMainPanel();
        this.createSpellEditor();
        this.createBalanceTester();
        this.createPreviewPanel();
    }

    createMainPanel() {
        this.mainPanel = this.uiManager.createPanel('magicCreationTool', {
            title: 'Magic Creation Tool',
            width: 800,
            height: 600,
            x: 50,
            y: 50,
            visible: false
        });

        // Main tabs
        this.tabs = this.uiManager.createTabs('creationTabs', {
            tabs: ['Spell Editor', 'Balance Tester', 'Spell Library'],
            defaultTab: 'Spell Editor'
        });

        this.mainPanel.addChild(this.tabs);

        // Tab content containers
        this.editorContainer = this.uiManager.createContainer('editorContainer');
        this.testerContainer = this.uiManager.createContainer('testerContainer');
        this.libraryContainer = this.uiManager.createContainer('libraryContainer');

        this.tabs.addTabContent('Spell Editor', this.editorContainer);
        this.tabs.addTabContent('Balance Tester', this.testerContainer);
        this.tabs.addTabContent('Spell Library', this.libraryContainer);
    }

    createSpellEditor() {
        // Spell properties form
        this.spellForm = this.createSpellPropertiesForm();
        this.editorContainer.addChild(this.spellForm);

        // Effect configuration
        this.effectConfig = this.createEffectConfiguration();
        this.editorContainer.addChild(this.effectConfig);

        // Action buttons
        this.actionButtons = this.createActionButtons();
        this.editorContainer.addChild(this.actionButtons);
    }

    createSpellPropertiesForm() {
        const form = this.uiManager.createForm('spellPropertiesForm', {
            title: 'Spell Properties',
            fields: [
                {
                    type: 'text',
                    name: 'name',
                    label: 'Spell Name',
                    placeholder: 'Enter spell name...'
                },
                {
                    type: 'textarea',
                    name: 'description',
                    label: 'Description',
                    placeholder: 'Describe the spell...'
                },
                {
                    type: 'select',
                    name: 'school',
                    label: 'Magic School',
                    options: Object.values(MAGIC_SCHOOLS).map(school => ({
                        value: school,
                        label: this.capitalizeFirst(school)
                    }))
                },
                {
                    type: 'select',
                    name: 'category',
                    label: 'Category',
                    options: Object.values(SPELL_CATEGORIES).map(category => ({
                        value: category,
                        label: this.capitalizeFirst(category)
                    }))
                },
                {
                    type: 'select',
                    name: 'targeting',
                    label: 'Targeting',
                    options: Object.values(TARGET_TYPES).map(target => ({
                        value: target,
                        label: this.capitalizeFirst(target)
                    }))
                },
                {
                    type: 'number',
                    name: 'level',
                    label: 'Spell Level',
                    min: 1,
                    max: 10,
                    value: 1
                },
                {
                    type: 'number',
                    name: 'cooldown',
                    label: 'Cooldown (ms)',
                    min: 500,
                    max: 300000,
                    value: 3000
                },
                {
                    type: 'number',
                    name: 'manaCost',
                    label: 'Mana Cost',
                    min: 1,
                    max: 1000,
                    value: 20
                }
            ]
        });

        return form;
    }

    createEffectConfiguration() {
        const config = this.uiManager.createContainer('effectConfig', {
            title: 'Effect Configuration'
        });

        // Dynamic effect fields based on spell type
        this.effectFields = this.uiManager.createDynamicFields('effectFields', {
            fields: []
        });

        config.addChild(this.effectFields);

        // Elemental type selector
        this.elementalSelector = this.uiManager.createSelect('elementalType', {
            label: 'Elemental Type',
            options: Object.values(ELEMENTAL_TYPES).map(element => ({
                value: element,
                label: this.capitalizeFirst(element)
            }))
        });

        config.addChild(this.elementalSelector);

        return config;
    }

    createActionButtons() {
        const buttons = this.uiManager.createContainer('actionButtons');

        this.saveButton = this.uiManager.createButton('saveSpell', {
            text: 'Save Spell',
            onClick: () => this.saveSpell()
        });

        this.testButton = this.uiManager.createButton('testSpell', {
            text: 'Test Spell',
            onClick: () => this.testSpell()
        });

        this.resetButton = this.uiManager.createButton('resetForm', {
            text: 'Reset',
            onClick: () => this.resetForm()
        });

        buttons.addChild(this.saveButton);
        buttons.addChild(this.testButton);
        buttons.addChild(this.resetButton);

        return buttons;
    }

    createBalanceTester() {
        // Character stats display
        this.characterStats = this.uiManager.createStatsDisplay('characterStats', {
            title: 'Test Character',
            stats: {}
        });

        this.testerContainer.addChild(this.characterStats);

        // Target stats display
        this.targetStats = this.uiManager.createStatsDisplay('targetStats', {
            title: 'Test Target',
            stats: {}
        });

        this.testerContainer.addChild(this.targetStats);

        // Test controls
        this.testControls = this.createTestControls();
        this.testerContainer.addChild(this.testControls);

        // Results display
        this.testResults = this.uiManager.createContainer('testResults', {
            title: 'Test Results'
        });

        this.testerContainer.addChild(this.testResults);
    }

    createTestControls() {
        const controls = this.uiManager.createContainer('testControls');

        // Character level slider
        this.charLevelSlider = this.uiManager.createSlider('charLevel', {
            label: 'Character Level',
            min: 1,
            max: 20,
            value: 5,
            onChange: (value) => this.updateTestCharacter('level', value)
        });

        // Intelligence slider
        this.charIntSlider = this.uiManager.createSlider('charInt', {
            label: 'Intelligence',
            min: 1,
            max: 30,
            value: 10,
            onChange: (value) => this.updateTestCharacter('intelligence', value)
        });

        // Test button
        this.runTestButton = this.uiManager.createButton('runTest', {
            text: 'Run Balance Test',
            onClick: () => this.runBalanceTest()
        });

        controls.addChild(this.charLevelSlider);
        controls.addChild(this.charIntSlider);
        controls.addChild(this.runTestButton);

        return controls;
    }

    createPreviewPanel() {
        this.previewPanel = this.uiManager.createPanel('spellPreview', {
            title: 'Spell Preview',
            width: 300,
            height: 400,
            x: 870,
            y: 50,
            visible: false
        });

        this.spellInfoDisplay = this.uiManager.createTextDisplay('spellInfo', {
            text: ''
        });

        this.previewPanel.addChild(this.spellInfoDisplay);
    }

    // Spell creation methods
    updateEffectFields() {
        const category = this.spellForm.getValue('category');
        const targeting = this.spellForm.getValue('targeting');

        let fields = [];

        switch (category) {
            case SPELL_CATEGORIES.OFFENSIVE:
                fields = [
                    { type: 'number', name: 'damage', label: 'Base Damage', min: 1, max: 500, value: 30 },
                    { type: 'number', name: 'critMultiplier', label: 'Critical Multiplier', min: 1, max: 5, value: 1.5, step: 0.1 }
                ];
                break;

            case SPELL_CATEGORIES.HEALING:
                fields = [
                    { type: 'number', name: 'healAmount', label: 'Heal Amount', min: 1, max: 500, value: 50 },
                    { type: 'checkbox', name: 'canOverheal', label: 'Allow Overheal' }
                ];
                break;

            case 'buff':
            case 'debuff':
                fields = [
                    { type: 'select', name: 'statName', label: 'Affected Stat',
                      options: ['strength', 'dexterity', 'intelligence', 'wisdom', 'constitution', 'charisma'].map(stat => ({
                          value: stat,
                          label: this.capitalizeFirst(stat)
                      })) },
                    { type: 'number', name: 'statBonus', label: 'Stat Bonus/Penalty', min: -20, max: 20, value: 5 },
                    { type: 'number', name: 'duration', label: 'Duration (seconds)', min: 1, max: 300, value: 30 }
                ];
                break;
        }

        // Add targeting-specific fields
        if (targeting === TARGET_TYPES.AREA) {
            fields.push(
                { type: 'number', name: 'radius', label: 'Area Radius', min: 1, max: 50, value: 10 }
            );
        }

        this.effectFields.updateFields(fields);
    }

    saveSpell() {
        const spellData = this.collectSpellData();

        if (!spellData.name || !spellData.description) {
            this.showError('Spell name and description are required');
            return;
        }

        try {
            const spell = createCustomSpell(spellData);
            this.spellDatabase.addSpell(spell);
            this.showSuccess(`Spell "${spell.name}" created successfully!`);
            this.updateSpellPreview(spell);
        } catch (error) {
            this.showError(`Failed to create spell: ${error.message}`);
        }
    }

    collectSpellData() {
        const formData = this.spellForm.getValues();
        const effectData = this.effectFields.getValues();
        const elementalType = this.elementalSelector.getValue();

        return {
            ...formData,
            ...effectData,
            elementalType: elementalType || ELEMENTAL_TYPES.NONE,
            type: this.mapCategoryToType(formData.category)
        };
    }

    mapCategoryToType(category) {
        switch (category) {
            case SPELL_CATEGORIES.OFFENSIVE:
                return 'offensive';
            case SPELL_CATEGORIES.HEALING:
                return 'healing';
            case 'buff':
                return 'buff';
            case 'debuff':
                return 'debuff';
            default:
                return 'offensive';
        }
    }

    testSpell() {
        const spellData = this.collectSpellData();

        if (!this.testCharacter) {
            this.createTestEntities();
        }

        try {
            const spell = createCustomSpell(spellData);
            this.runSpellTest(spell, this.testCharacter, this.testTarget);
        } catch (error) {
            this.showError(`Test failed: ${error.message}`);
        }
    }

    createTestEntities() {
        // Create test character
        this.testCharacter = {
            name: 'Test Mage',
            level: 5,
            baseStats: {
                intelligence: 15,
                wisdom: 12,
                strength: 8,
                dexterity: 10,
                constitution: 10,
                charisma: 8,
                luck: 5
            },
            mana: 100,
            maxMana: 100,
            health: 100,
            maxHealth: 100,
            getSpellPower: () => 15,
            getCriticalChance: () => 0.05,
            stats: {
                attackPower: 10,
                defense: 5
            }
        };

        // Create test target
        this.testTarget = {
            name: 'Test Dummy',
            health: 200,
            maxHealth: 200,
            stats: {
                defense: 10
            },
            resistances: {},
            takeDamage: (damage) => {
                this.testTarget.health = Math.max(0, this.testTarget.health - damage);
                console.log(`Test target took ${damage} damage, health: ${this.testTarget.health}`);
            },
            heal: (amount) => {
                this.testTarget.health = Math.min(this.testTarget.maxHealth, this.testTarget.health + amount);
                console.log(`Test target healed ${amount}, health: ${this.testTarget.health}`);
            }
        };

        this.updateCharacterDisplays();
    }

    runSpellTest(spell, character, target) {
        const initialHealth = target.health;
        const initialMana = character.mana;

        console.log(`Testing spell: ${spell.name}`);
        console.log(`Target health before: ${initialHealth}`);
        console.log(`Caster mana before: ${initialMana}`);

        // Simulate spell use
        if (spell.use(character, target)) {
            console.log(`Spell cast successfully!`);
            console.log(`Target health after: ${target.health}`);
            console.log(`Caster mana after: ${character.mana}`);
            console.log(`Damage dealt: ${initialHealth - target.health}`);
            console.log(`Mana spent: ${initialMana - character.mana}`);

            this.displayTestResults({
                success: true,
                damage: initialHealth - target.health,
                manaCost: initialMana - character.mana,
                targetHealth: target.health,
                casterMana: character.mana
            });
        } else {
            console.log(`Spell failed to cast`);
            this.displayTestResults({ success: false, reason: 'Spell failed' });
        }
    }

    runBalanceTest() {
        if (!this.currentSpell) {
            this.showError('No spell loaded for balance testing');
            return;
        }

        // Test spell at different levels
        const results = [];
        for (let level = 1; level <= 10; level++) {
            const testChar = { ...this.testCharacter, level: level };
            const testTarget = { ...this.testTarget };

            // Calculate expected damage/mana scaling
            const scalingResults = this.calculateSpellScaling(this.currentSpell, level);
            results.push({
                level: level,
                ...scalingResults
            });
        }

        this.displayBalanceResults(results);
    }

    calculateSpellScaling(spell, level) {
        // Simplified scaling calculation
        const baseDamage = spell.baseDamage || spell.baseHealAmount || 0;
        const baseManaCost = spell.resourceCost;

        const scaledDamage = baseDamage * (1 + (level - 1) * 0.2); // 20% increase per level
        const scaledManaCost = baseManaCost * (1 + (level - 1) * 0.1); // 10% increase per level

        const dps = scaledDamage / (spell.cooldown / 1000); // Damage per second
        const manaEfficiency = scaledDamage / scaledManaCost;

        return {
            damage: Math.round(scaledDamage),
            manaCost: Math.round(scaledManaCost),
            dps: Math.round(dps * 100) / 100,
            efficiency: Math.round(manaEfficiency * 100) / 100
        };
    }

    // UI update methods
    updateCharacterDisplays() {
        if (this.testCharacter) {
            this.characterStats.updateStats({
                level: this.testCharacter.level,
                intelligence: this.testCharacter.baseStats.intelligence,
                mana: `${this.testCharacter.mana}/${this.testCharacter.maxMana}`,
                spellPower: this.testCharacter.getSpellPower()
            });
        }

        if (this.testTarget) {
            this.targetStats.updateStats({
                health: `${this.testTarget.health}/${this.testTarget.maxHealth}`,
                defense: this.testTarget.stats.defense
            });
        }
    }

    updateTestCharacter(stat, value) {
        if (!this.testCharacter) return;

        if (stat === 'level') {
            this.testCharacter.level = value;
        } else {
            this.testCharacter.baseStats[stat] = value;
        }

        // Recalculate derived stats
        this.testCharacter.getSpellPower = () => this.testCharacter.baseStats.intelligence;
        this.updateCharacterDisplays();
    }

    updateSpellPreview(spell) {
        const info = `
            <h3>${spell.name}</h3>
            <p><strong>School:</strong> ${this.capitalizeFirst(spell.school)}</p>
            <p><strong>Category:</strong> ${this.capitalizeFirst(spell.category)}</p>
            <p><strong>Level:</strong> ${spell.level}</p>
            <p><strong>Mana Cost:</strong> ${spell.resourceCost}</p>
            <p><strong>Cooldown:</strong> ${spell.cooldown}ms</p>
            <p><strong>Description:</strong> ${spell.description}</p>
        `;

        this.spellInfoDisplay.setText(info);
        this.previewPanel.show();
    }

    displayTestResults(results) {
        let html = '<h4>Test Results</h4>';

        if (results.success) {
            html += `
                <p><strong>Success!</strong></p>
                <p>Damage: ${results.damage}</p>
                <p>Mana Cost: ${results.manaCost}</p>
                <p>Target Health: ${results.targetHealth}</p>
                <p>Caster Mana: ${results.casterMana}</p>
            `;
        } else {
            html += `<p><strong>Failed:</strong> ${results.reason}</p>`;
        }

        this.testResults.setContent(html);
    }

    displayBalanceResults(results) {
        let html = '<h4>Balance Analysis</h4>';
        html += '<table><tr><th>Level</th><th>Damage</th><th>Mana</th><th>DPS</th><th>Efficiency</th></tr>';

        results.forEach(result => {
            html += `<tr>
                <td>${result.level}</td>
                <td>${result.damage}</td>
                <td>${result.manaCost}</td>
                <td>${result.dps}</td>
                <td>${result.efficiency}</td>
            </tr>`;
        });

        html += '</table>';
        this.testResults.setContent(html);
    }

    resetForm() {
        this.spellForm.reset();
        this.effectFields.clear();
        this.elementalSelector.setValue(ELEMENTAL_TYPES.NONE);
        this.currentSpell = null;
    }

    showError(message) {
        this.uiManager.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.uiManager.showNotification(message, 'success');
    }

    // Utility methods
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    show() {
        this.mainPanel.show();
        this.isVisible = true;
    }

    hide() {
        this.mainPanel.hide();
        this.previewPanel.hide();
        this.isVisible = false;
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

export { MagicCreationTool };