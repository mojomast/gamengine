// Item Creation Tool
// UI tool for creating and configuring RPG items with stat configuration and export/import

import { UIManager } from '../../../game-engine/src/ui/UIManager.js';
import { ValidationHelpers } from '../../../game-engine/src/core/ValidationHelpers.js';
import { itemDatabase, RPGItem, RPGWeapon, RPGArmor, RPGConsumable, Material, Accessory } from './RPGItemDatabase.js';

export class ItemCreationTool {
    constructor(containerId, onItemCreated = null) {
        this.container = document.getElementById(containerId);
        this.onItemCreated = onItemCreated;
        this.currentItem = null;
        this.templates = this.loadTemplates();
        this.initializeUI();
    }

    loadTemplates() {
        return {
            weapon: {
                iron_sword: { id: 'iron_sword', name: 'Iron Sword', damage: 25, weaponType: 'sword', rarity: 'common', value: 100, statBonuses: { strength: 2 } },
                flaming_sword: { id: 'flaming_sword', name: 'Flaming Sword', damage: 40, weaponType: 'sword', rarity: 'epic', value: 600, statBonuses: { strength: 4 }, elementalType: 'fire', elementalDamage: 10 }
            },
            armor: {
                leather_armor: { id: 'leather_armor', name: 'Leather Armor', defense: 15, armorType: 'light', slot: 'chest', rarity: 'common', value: 75, statBonuses: { dexterity: 1 } },
                plate_armor: { id: 'plate_armor', name: 'Plate Armor', defense: 35, armorType: 'heavy', slot: 'chest', rarity: 'rare', value: 400, statBonuses: { strength: 3, constitution: 2 } }
            },
            consumable: {
                health_potion: { id: 'health_potion', name: 'Health Potion', effect: '(character) => character.heal(50)', maxUses: 10, rarity: 'common', value: 25 },
                strength_elixir: { id: 'strength_elixir', name: 'Strength Elixir', effect: '(character) => character.addStatusEffect(\'strength_boost\', 5, 300)', maxUses: 5, rarity: 'rare', value: 100, effectType: 'over_time', duration: 300 }
            }
        };
    }

    initializeUI() {
        this.container.innerHTML = `
            <div class="item-creation-tool">
                <div class="tool-header">
                    <h2>Item Creation Tool</h2>
                    <div class="tool-actions">
                        <button id="new-item-btn">New Item</button>
                        <button id="load-template-btn">Load Template</button>
                        <button id="export-item-btn">Export Item</button>
                        <button id="import-item-btn">Import Item</button>
                        <button id="test-item-btn">Test Item</button>
                    </div>
                </div>

                <div class="item-form">
                    <div class="form-section">
                        <h3>Basic Information</h3>
                        <div class="form-group">
                            <label for="item-id">Item ID:</label>
                            <input type="text" id="item-id" placeholder="unique_item_id">
                        </div>
                        <div class="form-group">
                            <label for="item-name">Name:</label>
                            <input type="text" id="item-name" placeholder="Item Name">
                        </div>
                        <div class="form-group">
                            <label for="item-description">Description:</label>
                            <textarea id="item-description" placeholder="Item description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="item-category">Category:</label>
                            <select id="item-category">
                                <option value="weapon">Weapon</option>
                                <option value="armor">Armor</option>
                                <option value="consumable">Consumable</option>
                                <option value="material">Material</option>
                                <option value="accessory">Accessory</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="item-rarity">Rarity:</label>
                            <select id="item-rarity">
                                <option value="common">Common</option>
                                <option value="rare">Rare</option>
                                <option value="epic">Epic</option>
                                <option value="legendary">Legendary</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="item-value">Value (Gold):</label>
                            <input type="number" id="item-value" min="0" value="100">
                        </div>
                        <div class="form-group">
                            <label for="item-level">Level Requirement:</label>
                            <input type="number" id="item-level" min="1" value="1">
                        </div>
                    </div>

                    <div class="form-section category-specific" id="weapon-section" style="display: none;">
                        <h3>Weapon Configuration</h3>
                        <div class="form-group">
                            <label for="weapon-damage">Damage:</label>
                            <input type="number" id="weapon-damage" min="1" value="25">
                        </div>
                        <div class="form-group">
                            <label for="weapon-type">Weapon Type:</label>
                            <select id="weapon-type">
                                <option value="sword">Sword</option>
                                <option value="bow">Bow</option>
                                <option value="staff">Staff</option>
                                <option value="dagger">Dagger</option>
                                <option value="axe">Axe</option>
                                <option value="hammer">Hammer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="weapon-elemental">Elemental Type:</label>
                            <select id="weapon-elemental">
                                <option value="">None</option>
                                <option value="fire">Fire</option>
                                <option value="ice">Ice</option>
                                <option value="lightning">Lightning</option>
                                <option value="earth">Earth</option>
                                <option value="water">Water</option>
                            </select>
                        </div>
                        <div class="form-group" id="elemental-damage-group" style="display: none;">
                            <label for="weapon-elemental-damage">Elemental Damage:</label>
                            <input type="number" id="weapon-elemental-damage" min="0" value="0">
                        </div>
                    </div>

                    <div class="form-section category-specific" id="armor-section" style="display: none;">
                        <h3>Armor Configuration</h3>
                        <div class="form-group">
                            <label for="armor-defense">Defense:</label>
                            <input type="number" id="armor-defense" min="1" value="15">
                        </div>
                        <div class="form-group">
                            <label for="armor-type">Armor Type:</label>
                            <select id="armor-type">
                                <option value="light">Light</option>
                                <option value="medium">Medium</option>
                                <option value="heavy">Heavy</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="armor-slot">Equipment Slot:</label>
                            <select id="armor-slot">
                                <option value="helmet">Helmet</option>
                                <option value="chest">Chest</option>
                                <option value="boots">Boots</option>
                                <option value="gloves">Gloves</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-section category-specific" id="consumable-section" style="display: none;">
                        <h3>Consumable Configuration</h3>
                        <div class="form-group">
                            <label for="consumable-effect">Effect Function:</label>
                            <textarea id="consumable-effect" placeholder="(character) => character.heal(50)"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="consumable-max-uses">Max Stack Size:</label>
                            <input type="number" id="consumable-max-uses" min="1" value="10">
                        </div>
                        <div class="form-group">
                            <label for="consumable-effect-type">Effect Type:</label>
                            <select id="consumable-effect-type">
                                <option value="immediate">Immediate</option>
                                <option value="over_time">Over Time</option>
                                <option value="passive">Passive</option>
                            </select>
                        </div>
                        <div class="form-group" id="duration-group" style="display: none;">
                            <label for="consumable-duration">Duration (seconds):</label>
                            <input type="number" id="consumable-duration" min="1" value="300">
                        </div>
                    </div>

                    <div class="form-section category-specific" id="accessory-section" style="display: none;">
                        <h3>Accessory Configuration</h3>
                        <div class="form-group">
                            <label for="accessory-slot">Accessory Type:</label>
                            <select id="accessory-slot">
                                <option value="amulet">Amulet</option>
                                <option value="ring">Ring</option>
                                <option value="earring">Earring</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>Stat Bonuses</h3>
                        <div id="stat-bonuses">
                            <div class="stat-bonus-row">
                                <select class="stat-select">
                                    <option value="">Select Stat</option>
                                    <option value="strength">Strength</option>
                                    <option value="dexterity">Dexterity</option>
                                    <option value="constitution">Constitution</option>
                                    <option value="intelligence">Intelligence</option>
                                    <option value="wisdom">Wisdom</option>
                                    <option value="charisma">Charisma</option>
                                    <option value="luck">Luck</option>
                                    <option value="maxHealth">Max Health</option>
                                    <option value="maxMana">Max Mana</option>
                                </select>
                                <input type="number" class="stat-value" min="0" placeholder="Bonus">
                                <button class="remove-stat-btn">Remove</button>
                            </div>
                        </div>
                        <button id="add-stat-btn">Add Stat Bonus</button>
                    </div>

                    <div class="form-actions">
                        <button id="create-item-btn">Create Item</button>
                        <button id="preview-item-btn">Preview Item</button>
                    </div>
                </div>

                <div class="item-preview" id="item-preview" style="display: none;">
                    <h3>Item Preview</h3>
                    <div id="preview-content"></div>
                </div>

                <div class="templates-panel" id="templates-panel" style="display: none;">
                    <h3>Item Templates</h3>
                    <div id="template-list"></div>
                </div>
            </div>
        `;

        this.bindEvents();
        this.updateCategorySpecificFields();
    }

    bindEvents() {
        // Category change
        document.getElementById('item-category').addEventListener('change', () => {
            this.updateCategorySpecificFields();
        });

        // Weapon elemental type change
        document.getElementById('weapon-elemental').addEventListener('change', (e) => {
            const elementalDamageGroup = document.getElementById('elemental-damage-group');
            elementalDamageGroup.style.display = e.target.value ? 'block' : 'none';
        });

        // Consumable effect type change
        document.getElementById('consumable-effect-type').addEventListener('change', (e) => {
            const durationGroup = document.getElementById('duration-group');
            durationGroup.style.display = e.target.value === 'over_time' ? 'block' : 'none';
        });

        // Add stat bonus
        document.getElementById('add-stat-btn').addEventListener('click', () => {
            this.addStatBonusRow();
        });

        // Create item
        document.getElementById('create-item-btn').addEventListener('click', () => {
            this.createItem();
        });

        // Preview item
        document.getElementById('preview-item-btn').addEventListener('click', () => {
            this.previewItem();
        });

        // Load template
        document.getElementById('load-template-btn').addEventListener('click', () => {
            this.showTemplates();
        });

        // Export item
        document.getElementById('export-item-btn').addEventListener('click', () => {
            this.exportItem();
        });

        // Import item
        document.getElementById('import-item-btn').addEventListener('click', () => {
            this.importItem();
        });

        // Test item
        document.getElementById('test-item-btn').addEventListener('click', () => {
            this.testItem();
        });

        // New item
        document.getElementById('new-item-btn').addEventListener('click', () => {
            this.clearForm();
        });
    }

    updateCategorySpecificFields() {
        const category = document.getElementById('item-category').value;

        // Hide all category sections
        document.querySelectorAll('.category-specific').forEach(section => {
            section.style.display = 'none';
        });

        // Show relevant section
        const sectionId = `${category}-section`;
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    }

    addStatBonusRow(stat = '', value = 0) {
        const statBonusesDiv = document.getElementById('stat-bonuses');
        const row = document.createElement('div');
        row.className = 'stat-bonus-row';
        row.innerHTML = `
            <select class="stat-select">
                <option value="">Select Stat</option>
                <option value="strength" ${stat === 'strength' ? 'selected' : ''}>Strength</option>
                <option value="dexterity" ${stat === 'dexterity' ? 'selected' : ''}>Dexterity</option>
                <option value="constitution" ${stat === 'constitution' ? 'selected' : ''}>Constitution</option>
                <option value="intelligence" ${stat === 'intelligence' ? 'selected' : ''}>Intelligence</option>
                <option value="wisdom" ${stat === 'wisdom' ? 'selected' : ''}>Wisdom</option>
                <option value="charisma" ${stat === 'charisma' ? 'selected' : ''}>Charisma</option>
                <option value="luck" ${stat === 'luck' ? 'selected' : ''}>Luck</option>
                <option value="maxHealth" ${stat === 'maxHealth' ? 'selected' : ''}>Max Health</option>
                <option value="maxMana" ${stat === 'maxMana' ? 'selected' : ''}>Max Mana</option>
            </select>
            <input type="number" class="stat-value" min="0" value="${value}" placeholder="Bonus">
            <button class="remove-stat-btn">Remove</button>
        `;

        row.querySelector('.remove-stat-btn').addEventListener('click', () => {
            row.remove();
        });

        statBonusesDiv.appendChild(row);
    }

    getFormData() {
        const category = document.getElementById('item-category').value;

        const baseData = {
            id: document.getElementById('item-id').value,
            name: document.getElementById('item-name').value,
            description: document.getElementById('item-description').value,
            category: category,
            rarity: document.getElementById('item-rarity').value,
            value: parseInt(document.getElementById('item-value').value) || 0,
            levelRequirement: parseInt(document.getElementById('item-level').value) || 1,
            statBonuses: this.getStatBonuses()
        };

        // Category-specific data
        switch (category) {
            case 'weapon':
                baseData.damage = parseInt(document.getElementById('weapon-damage').value) || 25;
                baseData.weaponType = document.getElementById('weapon-type').value;
                baseData.elementalType = document.getElementById('weapon-elemental').value;
                if (baseData.elementalType) {
                    baseData.elementalDamage = parseInt(document.getElementById('weapon-elemental-damage').value) || 0;
                }
                break;

            case 'armor':
                baseData.defense = parseInt(document.getElementById('armor-defense').value) || 15;
                baseData.armorType = document.getElementById('armor-type').value;
                baseData.slot = document.getElementById('armor-slot').value;
                break;

            case 'consumable':
                baseData.effect = document.getElementById('consumable-effect').value;
                baseData.maxUses = parseInt(document.getElementById('consumable-max-uses').value) || 10;
                baseData.effectType = document.getElementById('consumable-effect-type').value;
                if (baseData.effectType === 'over_time') {
                    baseData.duration = parseInt(document.getElementById('consumable-duration').value) || 300;
                }
                break;

            case 'accessory':
                baseData.slot = document.getElementById('accessory-slot').value;
                break;

            case 'material':
                baseData.stackable = true;
                baseData.maxStack = 99;
                break;
        }

        return baseData;
    }

    getStatBonuses() {
        const bonuses = {};
        const rows = document.querySelectorAll('.stat-bonus-row');

        rows.forEach(row => {
            const statSelect = row.querySelector('.stat-select');
            const statValue = row.querySelector('.stat-value');

            const stat = statSelect.value;
            const value = parseInt(statValue.value) || 0;

            if (stat && value > 0) {
                bonuses[stat] = value;
            }
        });

        return bonuses;
    }

    setFormData(data) {
        document.getElementById('item-id').value = data.id || '';
        document.getElementById('item-name').value = data.name || '';
        document.getElementById('item-description').value = data.description || '';
        document.getElementById('item-category').value = data.category || 'weapon';
        document.getElementById('item-rarity').value = data.rarity || 'common';
        document.getElementById('item-value').value = data.value || 100;
        document.getElementById('item-level').value = data.levelRequirement || 1;

        this.updateCategorySpecificFields();

        // Category-specific fields
        switch (data.category) {
            case 'weapon':
                document.getElementById('weapon-damage').value = data.damage || 25;
                document.getElementById('weapon-type').value = data.weaponType || 'sword';
                document.getElementById('weapon-elemental').value = data.elementalType || '';
                document.getElementById('weapon-elemental-damage').value = data.elementalDamage || 0;
                break;

            case 'armor':
                document.getElementById('armor-defense').value = data.defense || 15;
                document.getElementById('armor-type').value = data.armorType || 'light';
                document.getElementById('armor-slot').value = data.slot || 'chest';
                break;

            case 'consumable':
                document.getElementById('consumable-effect').value = data.effect || '';
                document.getElementById('consumable-max-uses').value = data.maxUses || 10;
                document.getElementById('consumable-effect-type').value = data.effectType || 'immediate';
                document.getElementById('consumable-duration').value = data.duration || 300;
                break;

            case 'accessory':
                document.getElementById('accessory-slot').value = data.slot || 'amulet';
                break;
        }

        // Stat bonuses
        document.getElementById('stat-bonuses').innerHTML = '';
        if (data.statBonuses) {
            Object.entries(data.statBonuses).forEach(([stat, value]) => {
                this.addStatBonusRow(stat, value);
            });
        }
    }

    createItem() {
        try {
            const data = this.getFormData();

            // Validate required fields
            if (!data.id || !data.name) {
                alert('Item ID and Name are required!');
                return;
            }

            let item;

            // Create item based on category
            switch (data.category) {
                case 'weapon':
                    item = new RPGWeapon(
                        data.id,
                        data.name,
                        data.description,
                        data.damage,
                        data.weaponType,
                        data.rarity,
                        data.value
                    );
                    if (data.elementalType) {
                        item.elementalType = data.elementalType;
                        item.elementalDamage = data.elementalDamage;
                    }
                    break;

                case 'armor':
                    item = new RPGArmor(
                        data.id,
                        data.name,
                        data.description,
                        data.defense,
                        data.armorType,
                        data.slot,
                        data.rarity,
                        data.value
                    );
                    break;

                case 'consumable':
                    // Parse effect function safely
                    let effectFunction;
                    try {
                        effectFunction = eval(data.effect);
                    } catch (e) {
                        alert('Invalid effect function syntax!');
                        return;
                    }

                    item = new RPGConsumable(
                        data.id,
                        data.name,
                        data.description,
                        effectFunction,
                        data.maxUses,
                        data.rarity,
                        data.value
                    );
                    item.effectType = data.effectType;
                    if (data.duration) {
                        item.duration = data.duration;
                    }
                    break;

                case 'accessory':
                    item = new Accessory(
                        data.id,
                        data.name,
                        data.description,
                        data.slot,
                        data.statBonuses,
                        data.rarity,
                        data.value
                    );
                    break;

                case 'material':
                    item = new Material(
                        data.id,
                        data.name,
                        data.description,
                        data.rarity,
                        data.value
                    );
                    break;

                default:
                    item = new RPGItem(
                        data.id,
                        data.name,
                        data.description,
                        data.category,
                        data.rarity,
                        data.value
                    );
            }

            // Apply stat bonuses
            if (data.statBonuses) {
                item.statBonuses = data.statBonuses;
            }

            // Apply level requirement
            item.levelRequirement = data.levelRequirement;

            this.currentItem = item;

            // Add to database
            itemDatabase.addItem(item);

            // Callback
            if (this.onItemCreated) {
                this.onItemCreated(item);
            }

            alert(`Item "${item.name}" created successfully!`);

        } catch (error) {
            console.error('Error creating item:', error);
            alert('Error creating item: ' + error.message);
        }
    }

    previewItem() {
        const data = this.getFormData();

        const previewDiv = document.getElementById('item-preview');
        const contentDiv = document.getElementById('preview-content');

        let previewHTML = `
            <div class="item-preview-card rarity-${data.rarity}">
                <h4>${data.name || 'Unnamed Item'}</h4>
                <p class="item-description">${data.description || 'No description'}</p>
                <div class="item-details">
                    <span class="item-rarity">${data.rarity}</span>
                    <span class="item-value">${data.value} gold</span>
                    <span class="item-level">Level ${data.levelRequirement}</span>
                </div>
        `;

        // Category-specific preview
        switch (data.category) {
            case 'weapon':
                previewHTML += `
                    <div class="weapon-stats">
                        <div>Damage: ${data.damage}</div>
                        <div>Type: ${data.weaponType}</div>
                        ${data.elementalType ? `<div>Element: ${data.elementalType} (${data.elementalDamage})</div>` : ''}
                    </div>
                `;
                break;

            case 'armor':
                previewHTML += `
                    <div class="armor-stats">
                        <div>Defense: ${data.defense}</div>
                        <div>Type: ${data.armorType}</div>
                        <div>Slot: ${data.slot}</div>
                    </div>
                `;
                break;

            case 'consumable':
                previewHTML += `
                    <div class="consumable-stats">
                        <div>Max Stack: ${data.maxUses}</div>
                        <div>Effect Type: ${data.effectType}</div>
                        ${data.duration ? `<div>Duration: ${data.duration}s</div>` : ''}
                    </div>
                `;
                break;
        }

        // Stat bonuses
        if (data.statBonuses && Object.keys(data.statBonuses).length > 0) {
            previewHTML += '<div class="stat-bonuses"><h5>Stat Bonuses:</h5>';
            Object.entries(data.statBonuses).forEach(([stat, value]) => {
                previewHTML += `<div>+${value} ${stat}</div>`;
            });
            previewHTML += '</div>';
        }

        previewHTML += '</div>';

        contentDiv.innerHTML = previewHTML;
        previewDiv.style.display = 'block';
    }

    showTemplates() {
        const panel = document.getElementById('templates-panel');
        const listDiv = document.getElementById('template-list');

        let html = '';

        Object.entries(this.templates).forEach(([category, templates]) => {
            html += `<div class="template-category"><h4>${category.charAt(0).toUpperCase() + category.slice(1)} Templates</h4>`;
            Object.entries(templates).forEach(([id, template]) => {
                html += `<div class="template-item" data-category="${category}" data-id="${id}">${template.name}</div>`;
            });
            html += '</div>';
        });

        listDiv.innerHTML = html;

        // Bind template selection
        listDiv.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                const id = item.dataset.id;
                const template = this.templates[category][id];
                this.setFormData(template);
                panel.style.display = 'none';
            });
        });

        panel.style.display = 'block';
    }

    exportItem() {
        if (!this.currentItem) {
            alert('No item to export! Create an item first.');
            return;
        }

        const exportData = {
            id: this.currentItem.id,
            name: this.currentItem.name,
            description: this.currentItem.description,
            category: this.currentItem.category,
            rarity: this.currentItem.rarity,
            value: this.currentItem.value,
            levelRequirement: this.currentItem.levelRequirement,
            statBonuses: this.currentItem.statBonuses,
            // Category-specific data
            ...(this.currentItem instanceof RPGWeapon && {
                damage: this.currentItem.damage,
                weaponType: this.currentItem.weaponType,
                elementalType: this.currentItem.elementalType,
                elementalDamage: this.currentItem.elementalDamage
            }),
            ...(this.currentItem instanceof RPGArmor && {
                defense: this.currentItem.defense,
                armorType: this.currentItem.armorType,
                slot: this.currentItem.slot
            }),
            ...(this.currentItem instanceof RPGConsumable && {
                effect: this.currentItem.effect.toString(),
                maxUses: this.currentItem.maxUses,
                effectType: this.currentItem.effectType,
                duration: this.currentItem.duration
            })
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentItem.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importItem() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.setFormData(data);
                    alert('Item imported successfully!');
                } catch (error) {
                    alert('Error importing item: ' + error.message);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    testItem() {
        if (!this.currentItem) {
            alert('No item to test! Create an item first.');
            return;
        }

        // Create a mock character for testing
        const mockCharacter = {
            level: 5,
            stats: {
                strength: 10,
                dexterity: 10,
                constitution: 10,
                intelligence: 10,
                wisdom: 10,
                charisma: 10,
                luck: 10
            },
            heal: (amount) => console.log(`Healed for ${amount} HP`),
            restoreMana: (amount) => console.log(`Restored ${amount} MP`),
            addStatusEffect: (effect, value, duration) => console.log(`Added status effect: ${effect} +${value} for ${duration}s`),
            cureStatus: (status) => console.log(`Cured status: ${status}`)
        };

        console.log('Testing item:', this.currentItem.name);
        console.log('Item info:', this.currentItem.getRPGInfo());

        if (this.currentItem instanceof RPGWeapon) {
            console.log('Weapon damage:', this.currentItem.getTotalDamage(mockCharacter));
            console.log('Critical hit:', this.currentItem.isCritical());
        }

        if (this.currentItem instanceof RPGArmor) {
            console.log('Armor defense:', this.currentItem.getTotalDefense(mockCharacter));
        }

        if (this.currentItem instanceof RPGConsumable) {
            console.log('Using consumable...');
            this.currentItem.use(mockCharacter);
        }

        alert('Item test completed! Check console for results.');
    }

    clearForm() {
        document.getElementById('item-id').value = '';
        document.getElementById('item-name').value = '';
        document.getElementById('item-description').value = '';
        document.getElementById('item-category').value = 'weapon';
        document.getElementById('item-rarity').value = 'common';
        document.getElementById('item-value').value = '100';
        document.getElementById('item-level').value = '1';

        // Clear stat bonuses
        document.getElementById('stat-bonuses').innerHTML = '';

        // Hide preview
        document.getElementById('item-preview').style.display = 'none';

        this.currentItem = null;
        this.updateCategorySpecificFields();
    }
}