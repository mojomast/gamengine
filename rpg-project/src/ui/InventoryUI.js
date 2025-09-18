/**
 * Inventory UI with Drag-and-Drop Management
 * Full inventory interface with drag-and-drop, item tooltips, and equipment integration
 */

import { UIComponent, Button, Label, Panel, ProgressBar } from '../../../game-engine/src/ui/UIManager.js';
import { AnimationManager } from '../../../game-engine/src/effects/AnimationManager.js';
import { InputManager } from '../../../game-engine/src/core/InputManager.js';

class InventorySlot extends UIComponent {
    constructor(x, y, width, height, slotIndex) {
        super(x, y, width, height);
        this.slotIndex = slotIndex;
        this.item = null;
        this.isHovered = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };

        this.style = {
            ...this.style,
            backgroundColor: 'rgba(60, 60, 80, 0.8)',
            borderColor: '#666666',
            borderWidth: 2,
            borderRadius: 4
        };

        // Create item icon/label
        this.itemIcon = new Label(5, 5, '', '12px monospace');
        this.itemIcon.style.textColor = '#ffffff';
        this.addChild(this.itemIcon);

        // Create quantity label
        this.quantityLabel = new Label(width - 25, height - 15, '', '10px monospace');
        this.quantityLabel.style.textColor = '#ffff00';
        this.addChild(this.quantityLabel);
    }

    setItem(item) {
        this.item = item;
        if (item) {
            this.itemIcon.setText(item.name.substring(0, 8)); // Truncate long names
            this.quantityLabel.setText(item.quantity > 1 ? item.quantity.toString() : '');
        } else {
            this.itemIcon.setText('');
            this.quantityLabel.setText('');
        }
        this.dirty = true;
    }

    renderContent(ctx) {
        // Highlight on hover
        if (this.isHovered) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(0, 0, this.size.width, this.size.height);
        }

        // Show selection border
        if (this.isHovered || this.isDragging) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, this.size.width, this.size.height);
        }
    }

    handleInput(inputManager) {
        const mouseHandled = super.handleInput(inputManager);

        if (this.hovered && !this.isDragging) {
            this.isHovered = true;
            this.style.borderColor = '#ffd700';
        } else if (!this.hovered) {
            this.isHovered = false;
            this.style.borderColor = '#666666';
        }

        // Handle drag start
        if (this.hovered && inputManager.isMousePressed(0) && this.item && !this.isDragging) {
            this.isDragging = true;
            const mousePos = inputManager.getMousePosition();
            this.dragOffset.x = mousePos.x - this.position.x;
            this.dragOffset.y = mousePos.y - this.position.y;
            this.emit('drag-start', { item: this.item, slotIndex: this.slotIndex });
            return true;
        }

        return mouseHandled;
    }

    getDragPosition(mousePos) {
        return {
            x: mousePos.x - this.dragOffset.x,
            y: mousePos.y - this.dragOffset.y
        };
    }
}

class ItemTooltip extends UIComponent {
    constructor() {
        super(0, 0, 250, 150);
        this.item = null;
        this.visible = false;

        this.style = {
            ...this.style,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderColor: '#ffd700',
            borderWidth: 2,
            borderRadius: 8
        };

        // Tooltip content
        this.nameLabel = new Label(10, 10, '', 'bold 16px monospace');
        this.nameLabel.style.textColor = '#ffd700';
        this.addChild(this.nameLabel);

        this.descriptionLabel = new Label(10, 35, '', '12px monospace');
        this.descriptionLabel.style.textColor = '#ffffff';
        this.addChild(this.descriptionLabel);

        this.statsLabel = new Label(10, 60, '', '12px monospace');
        this.statsLabel.style.textColor = '#cccccc';
        this.addChild(this.statsLabel);

        this.valueLabel = new Label(10, 120, '', '12px monospace');
        this.valueLabel.style.textColor = '#ffff00';
        this.addChild(this.valueLabel);
    }

    showTooltip(item, x, y) {
        if (!item) {
            this.hide();
            return;
        }

        this.item = item;
        this.position.x = x;
        this.position.y = y;

        // Update content
        this.nameLabel.setText(item.name);
        this.descriptionLabel.setText(item.description);

        // Show item stats
        let statsText = '';
        if (item instanceof RPGWeapon) {
            statsText = `Damage: ${item.getTotalDamage()}\nCritical: ${(item.criticalChance * 100).toFixed(1)}%`;
        } else if (item instanceof RPGArmor) {
            statsText = `Defense: ${item.getTotalDefense()}\nWeight: ${item.weight || 1}`;
        } else if (item instanceof RPGConsumable) {
            statsText = `Effect: ${item.effectType}\nUses: ${item.quantity}`;
        }

        this.statsLabel.setText(statsText);
        this.valueLabel.setText(`Value: ${item.getTotalValue()} gold`);

        // Adjust size based on content
        this.size.height = 140;
        this.visible = true;
        this.dirty = true;
    }

    hide() {
        this.visible = false;
        this.item = null;
    }

    updatePosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.dirty = true;
    }
}

class DragPreview extends UIComponent {
    constructor() {
        super(0, 0, 64, 64);
        this.item = null;
        this.visible = false;

        this.style = {
            ...this.style,
            backgroundColor: 'rgba(100, 100, 150, 0.8)',
            borderColor: '#ffd700',
            borderWidth: 2,
            borderRadius: 4
        };

        this.itemLabel = new Label(5, 5, '', '12px monospace');
        this.itemLabel.style.textColor = '#ffffff';
        this.addChild(this.itemLabel);
    }

    startDrag(item, x, y) {
        this.item = item;
        this.position.x = x;
        this.position.y = y;
        this.itemLabel.setText(item.name.substring(0, 10));
        this.visible = true;
        this.dirty = true;
    }

    updateDrag(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.dirty = true;
    }

    endDrag() {
        this.visible = false;
        this.item = null;
    }
}

export class InventoryUI extends UIComponent {
    constructor(engine, inventory, character) {
        super(0, 0, 800, 600);
        this.engine = engine;
        this.inventory = inventory;
        this.character = character;
        this.uiManager = engine.uiManager;
        this.animationManager = new AnimationManager(engine);

        // Inventory state
        this.selectedSlot = null;
        this.isDragging = false;
        this.dragItem = null;
        this.dragSourceSlot = null;

        // UI Components
        this.titleLabel = null;
        this.inventoryGrid = [];
        this.equipmentSlots = new Map();
        this.tooltip = null;
        this.dragPreview = null;

        // Filters and sorting
        this.currentFilter = 'all';
        this.currentSort = 'name';

        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        // Title
        this.titleLabel = new Label(20, 20, 'Inventory', 'bold 24px monospace');
        this.titleLabel.style.textColor = '#ffd700';
        this.addChild(this.titleLabel);

        // Filter buttons
        this.createFilterButtons();

        // Inventory grid (8x6 grid = 48 slots)
        this.createInventoryGrid();

        // Equipment panel
        this.createEquipmentPanel();

        // Tooltip
        this.tooltip = new ItemTooltip();
        this.addChild(this.tooltip);

        // Drag preview
        this.dragPreview = new DragPreview();
        this.addChild(this.dragPreview);

        // Action buttons
        this.createActionButtons();

        // Stats panel
        this.createStatsPanel();
    }

    createFilterButtons() {
        const filters = [
            { id: 'all', text: 'All' },
            { id: 'weapons', text: 'Weapons' },
            { id: 'armor', text: 'Armor' },
            { id: 'consumables', text: 'Items' },
            { id: 'materials', text: 'Materials' }
        ];

        filters.forEach((filter, index) => {
            const button = new Button(20 + index * 120, 60, 100, 30, filter.text);
            button.on('click', () => this.setFilter(filter.id));
            if (filter.id === 'all') {
                button.style.backgroundColor = '#d62828';
            }
            this.addChild(button);
        });
    }

    createInventoryGrid() {
        const gridStartX = 20;
        const gridStartY = 110;
        const slotSize = 60;
        const slotSpacing = 5;
        const slotsPerRow = 8;
        const numRows = 6;

        this.inventoryGrid = [];

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < slotsPerRow; col++) {
                const slotIndex = row * slotsPerRow + col;
                const x = gridStartX + col * (slotSize + slotSpacing);
                const y = gridStartY + row * (slotSize + slotSpacing);

                const slot = new InventorySlot(x, y, slotSize, slotSize, slotIndex);
                slot.on('drag-start', (data) => this.startDrag(data.item, data.slotIndex, slot));
                this.inventoryGrid.push(slot);
                this.addChild(slot);
            }
        }

        this.updateInventoryDisplay();
    }

    createEquipmentPanel() {
        const equipmentSlots = [
            { id: 'helmet', name: 'Helmet', x: 520, y: 110 },
            { id: 'chest', name: 'Armor', x: 520, y: 180 },
            { id: 'weapon', name: 'Weapon', x: 590, y: 180 },
            { id: 'boots', name: 'Boots', x: 520, y: 250 },
            { id: 'gloves', name: 'Gloves', x: 590, y: 250 },
            { id: 'amulet', name: 'Amulet', x: 520, y: 320 },
            { id: 'ring1', name: 'Ring 1', x: 590, y: 320 },
            { id: 'ring2', name: 'Ring 2', x: 520, y: 390 }
        ];

        equipmentSlots.forEach(slot => {
            const equipmentSlot = new InventorySlot(slot.x, slot.y, 60, 60, slot.id);
            equipmentSlot.on('drag-start', (data) => this.startDrag(data.item, data.slotIndex, equipmentSlot));

            // Add label
            const label = new Label(slot.x, slot.y + 65, slot.name, '10px monospace');
            label.style.textColor = '#cccccc';
            this.addChild(label);

            this.equipmentSlots.set(slot.id, equipmentSlot);
            this.addChild(equipmentSlot);
        });

        this.updateEquipmentDisplay();
    }

    createActionButtons() {
        const buttons = [
            { text: 'Use', action: 'use', x: 20, y: 520 },
            { text: 'Drop', action: 'drop', x: 100, y: 520 },
            { text: 'Equip', action: 'equip', x: 180, y: 520 },
            { text: 'Info', action: 'info', x: 260, y: 520 }
        ];

        buttons.forEach(button => {
            const btn = new Button(button.x, button.y, 70, 30, button.text);
            btn.on('click', () => this.handleAction(button.action));
            this.addChild(btn);
        });
    }

    createStatsPanel() {
        const statsPanel = new Panel(520, 470, 260, 110);
        statsPanel.style.backgroundColor = 'rgba(40, 40, 60, 0.8)';
        this.addChild(statsPanel);

        const stats = this.inventory.getRPGStats();
        const statLabels = [
            `Weight: ${stats.totalWeight}/${stats.maxWeight}`,
            `Gold: ${this.character.gold || 0}`,
            `Encumbrance: ${stats.encumbranceLevel}`
        ];

        statLabels.forEach((stat, index) => {
            const label = new Label(10, 10 + index * 25, stat, '12px monospace');
            label.style.textColor = '#ffffff';
            statsPanel.addChild(label);
        });
    }

    setupEventListeners() {
        // Handle mouse movement for tooltips
        document.addEventListener('mousemove', (event) => this.handleMouseMove(event));

        // Handle drag and drop
        document.addEventListener('mouseup', (event) => this.handleMouseUp(event));
    }

    handleMouseMove(event) {
        if (!this.visible) return;

        const rect = this.engine.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Update tooltip position
        if (this.tooltip.visible) {
            this.tooltip.updatePosition(mouseX + 15, mouseY + 15);
        }

        // Update drag preview
        if (this.isDragging && this.dragPreview.visible) {
            this.dragPreview.updateDrag(mouseX - 32, mouseY - 32);
        }

        // Check for slot hovering
        let hoveredSlot = null;
        this.inventoryGrid.forEach(slot => {
            if (this.pointInSlot(mouseX, mouseY, slot)) {
                hoveredSlot = slot;
            }
        });

        this.equipmentSlots.forEach(slot => {
            if (this.pointInSlot(mouseX, mouseY, slot)) {
                hoveredSlot = slot;
            }
        });

        // Show tooltip for hovered item
        if (hoveredSlot && hoveredSlot.item) {
            this.tooltip.showTooltip(hoveredSlot.item, mouseX + 15, mouseY + 15);
        } else {
            this.tooltip.hide();
        }
    }

    handleMouseUp(event) {
        if (!this.isDragging) return;

        const rect = this.engine.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Find drop target
        let dropTarget = null;
        this.inventoryGrid.forEach(slot => {
            if (this.pointInSlot(mouseX, mouseY, slot)) {
                dropTarget = slot;
            }
        });

        this.equipmentSlots.forEach(slot => {
            if (this.pointInSlot(mouseX, mouseY, slot)) {
                dropTarget = slot;
            }
        });

        // Perform drop
        if (dropTarget && dropTarget !== this.dragSourceSlot) {
            this.dropItem(this.dragItem, this.dragSourceSlot, dropTarget);
        }

        this.endDrag();
    }

    pointInSlot(x, y, slot) {
        return x >= slot.position.x &&
               x <= slot.position.x + slot.size.width &&
               y >= slot.position.y &&
               y <= slot.position.y + slot.size.height;
    }

    startDrag(item, slotIndex, slotElement) {
        this.isDragging = true;
        this.dragItem = item;
        this.dragSourceSlot = slotElement;

        const rect = this.engine.canvas.getBoundingClientRect();
        const mousePos = this.uiManager.inputManager?.getMousePosition() || { x: 0, y: 0 };

        this.dragPreview.startDrag(item, mousePos.x - 32, mousePos.y - 32);

        this.uiManager.announceToScreenReader(`Dragging ${item.name}`, 'polite');
    }

    dropItem(item, sourceSlot, targetSlot) {
        try {
            // Handle different drop scenarios
            if (sourceSlot instanceof InventorySlot && targetSlot instanceof InventorySlot) {
                // Inventory to inventory move
                this.moveInventoryItem(sourceSlot.slotIndex, targetSlot.slotIndex);
            } else if (sourceSlot instanceof InventorySlot && typeof targetSlot.slotIndex === 'string') {
                // Inventory to equipment
                this.equipItemFromInventory(sourceSlot.slotIndex, targetSlot.slotIndex);
            } else if (typeof sourceSlot.slotIndex === 'string' && targetSlot instanceof InventorySlot) {
                // Equipment to inventory
                this.unequipItemToInventory(sourceSlot.slotIndex, targetSlot.slotIndex);
            }

            this.updateInventoryDisplay();
            this.updateEquipmentDisplay();

            this.uiManager.announceToScreenReader(`Dropped ${item.name}`, 'polite');
        } catch (error) {
            console.error('Failed to drop item:', error);
            this.uiManager.announceToScreenReader('Failed to move item', 'assertive');
        }
    }

    endDrag() {
        this.isDragging = false;
        this.dragItem = null;
        this.dragSourceSlot = null;
        this.dragPreview.endDrag();
    }

    moveInventoryItem(fromIndex, toIndex) {
        const fromItem = this.inventory.inventory.get(fromIndex);
        const toItem = this.inventory.inventory.get(toIndex);

        if (fromItem && toItem) {
            // Swap items
            this.inventory.inventory.set(fromIndex, toItem);
            this.inventory.inventory.set(toIndex, fromItem);
        } else if (fromItem) {
            // Move item to empty slot
            this.inventory.inventory.delete(fromIndex);
            this.inventory.inventory.set(toIndex, fromItem);
        }
    }

    equipItemFromInventory(inventoryIndex, equipmentSlot) {
        const result = this.inventory.equipItem(inventoryIndex, equipmentSlot);
        if (result.success) {
            this.uiManager.announceToScreenReader(`Equipped ${result.equippedItem.name}`, 'polite');
        } else {
            this.uiManager.announceToScreenReader(`Cannot equip ${result.reason}`, 'assertive');
        }
    }

    unequipItemToInventory(equipmentSlot, inventoryIndex) {
        const result = this.inventory.unequipItem(equipmentSlot, inventoryIndex);
        if (result.success) {
            this.uiManager.announceToScreenReader(`Unequipped ${result.unequippedItem.name}`, 'polite');
        } else {
            this.uiManager.announceToScreenReader(`Cannot unequip ${result.reason}`, 'assertive');
        }
    }

    handleAction(action) {
        if (!this.selectedSlot) {
            this.uiManager.announceToScreenReader('No item selected', 'polite');
            return;
        }

        const item = this.selectedSlot.item;
        if (!item) return;

        switch (action) {
            case 'use':
                this.useItem(this.selectedSlot);
                break;
            case 'drop':
                this.dropItemFromInventory(this.selectedSlot);
                break;
            case 'equip':
                this.equipSelectedItem();
                break;
            case 'info':
                this.showItemInfo(item);
                break;
        }
    }

    useItem(slot) {
        const result = this.inventory.useConsumable(slot.slotIndex);
        if (result.success) {
            this.updateInventoryDisplay();
            this.uiManager.announceToScreenReader(`Used ${slot.item.name}`, 'polite');
        } else {
            this.uiManager.announceToScreenReader(`Cannot use ${result.reason}`, 'assertive');
        }
    }

    dropItemFromInventory(slot) {
        // Confirm drop
        if (confirm(`Drop ${slot.item.name}?`)) {
            this.inventory.inventory.delete(slot.slotIndex);
            this.updateInventoryDisplay();
            this.uiManager.announceToScreenReader(`Dropped ${slot.item.name}`, 'polite');
        }
    }

    equipSelectedItem() {
        const slot = this.selectedSlot;
        if (slot instanceof InventorySlot && typeof slot.slotIndex === 'number') {
            // Find appropriate equipment slot
            const item = slot.item;
            let equipmentSlot = null;

            if (item instanceof RPGWeapon) {
                equipmentSlot = 'weapon';
            } else if (item instanceof RPGArmor) {
                equipmentSlot = item.slot; // helmet, chest, boots, etc.
            }

            if (equipmentSlot) {
                this.equipItemFromInventory(slot.slotIndex, equipmentSlot);
                this.updateInventoryDisplay();
                this.updateEquipmentDisplay();
            }
        }
    }

    showItemInfo(item) {
        // Enhanced tooltip or detailed info panel
        const infoPanel = new Panel(200, 150, 400, 300);
        infoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';

        const nameLabel = new Label(20, 20, item.name, 'bold 20px monospace');
        nameLabel.style.textColor = '#ffd700';
        infoPanel.addChild(nameLabel);

        const descLabel = new Label(20, 50, item.description, '14px monospace');
        descLabel.style.textColor = '#ffffff';
        infoPanel.addChild(descLabel);

        // Add detailed stats based on item type
        let statsText = '';
        if (item instanceof RPGWeapon) {
            statsText = `Damage: ${item.getTotalDamage()}\nCritical: ${(item.criticalChance * 100).toFixed(1)}%\nValue: ${item.value}`;
        } else if (item instanceof RPGArmor) {
            statsText = `Defense: ${item.getTotalDefense()}\nWeight: ${item.weight || 1}\nValue: ${item.value}`;
        }

        if (statsText) {
            const statsLabel = new Label(20, 100, statsText, '14px monospace');
            statsLabel.style.textColor = '#cccccc';
            infoPanel.addChild(statsLabel);
        }

        const closeButton = new Button(320, 250, 70, 30, 'Close');
        closeButton.on('click', () => this.removeChild(infoPanel));
        infoPanel.addChild(closeButton);

        this.addChild(infoPanel);
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.updateInventoryDisplay();

        // Update button states
        this.children.forEach(child => {
            if (child instanceof Button && child.text) {
                const filterText = filter === 'all' ? 'All' :
                                 filter === 'weapons' ? 'Weapons' :
                                 filter === 'armor' ? 'Armor' :
                                 filter === 'consumables' ? 'Items' :
                                 filter === 'materials' ? 'Materials' : '';

                if (child.text === filterText) {
                    child.style.backgroundColor = '#d62828';
                } else if (['All', 'Weapons', 'Armor', 'Items', 'Materials'].includes(child.text)) {
                    child.style.backgroundColor = '#666666';
                }
            }
        });
    }

    updateInventoryDisplay() {
        // Get filtered items
        let items = Array.from(this.inventory.inventory.entries());

        // Apply filter
        if (this.currentFilter !== 'all') {
            items = items.filter(([slot, item]) => {
                switch (this.currentFilter) {
                    case 'weapons':
                        return item instanceof RPGWeapon;
                    case 'armor':
                        return item instanceof RPGArmor;
                    case 'consumables':
                        return item instanceof RPGConsumable;
                    case 'materials':
                        return item.category === 'material';
                    default:
                        return true;
                }
            });
        }

        // Clear all slots
        this.inventoryGrid.forEach(slot => slot.setItem(null));

        // Fill slots with filtered items
        items.forEach(([slotIndex, item]) => {
            if (slotIndex < this.inventoryGrid.length) {
                this.inventoryGrid[slotIndex].setItem(item);
            }
        });
    }

    updateEquipmentDisplay() {
        this.equipmentSlots.forEach((slot, slotId) => {
            const equippedItem = this.inventory.equipmentSlots[slotId];
            slot.setItem(equippedItem);
        });
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.animationManager.update(deltaTime);

        // Update stats panel
        if (this.visible) {
            this.updateStatsPanel();
        }
    }

    updateStatsPanel() {
        // Update weight and gold display
        const stats = this.inventory.getRPGStats();
        // Would update the stats panel labels here
    }

    handleInput(inputManager) {
        if (!this.visible) return false;

        // Handle inventory slot selection
        let inputHandled = false;

        this.inventoryGrid.forEach(slot => {
            if (slot.handleInput(inputManager)) {
                this.selectedSlot = slot;
                inputHandled = true;
            }
        });

        this.equipmentSlots.forEach(slot => {
            if (slot.handleInput(inputManager)) {
                this.selectedSlot = slot;
                inputHandled = true;
            }
        });

        // Handle general input
        if (!inputHandled) {
            inputHandled = super.handleInput(inputManager);
        }

        return inputHandled;
    }

    show() {
        this.visible = true;
        this.updateInventoryDisplay();
        this.updateEquipmentDisplay();
        this.animationManager.fadeIn(this, 300);
    }

    hide() {
        this.animationManager.fadeOut(this, 300, {
            onComplete: () => {
                this.visible = false;
                this.tooltip.hide();
                this.endDrag();
            }
        });
    }

    // Get state for saving
    getState() {
        return {
            currentFilter: this.currentFilter,
            selectedSlot: this.selectedSlot?.slotIndex || null
        };
    }

    // Restore state from save
    setState(state) {
        if (state.currentFilter) {
            this.setFilter(state.currentFilter);
        }
        // Selected slot would be restored if needed
    }
}