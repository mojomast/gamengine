/**
 * In-Game Menu System
 * Handles all in-game menus using UIManager and integrates with RPG systems
 */

import { UIComponent, Button, Label, Panel, ProgressBar, MenuManager } from '../../../game-engine/src/ui/UIManager.js';
import { AnimationManager } from '../../../game-engine/src/effects/AnimationManager.js';
import { InputManager } from '../../../game-engine/src/core/InputManager.js';

export class MenuSystem extends UIComponent {
    constructor(engine, character, inventory) {
        super(0, 0, engine.canvas.width, engine.canvas.height);
        this.engine = engine;
        this.character = character;
        this.inventory = inventory;
        this.uiManager = engine.uiManager || new UIManager(engine);
        this.animationManager = new AnimationManager(engine);
        this.inputManager = new InputManager();

        // Menu state
        this.activeMenu = null;
        this.menuStack = [];
        this.isOpen = false;

        // Menu components
        this.overlay = null;
        this.mainMenuPanel = null;
        this.contentPanel = null;
        this.menuButtons = [];

        // Sub-menus
        this.statusUI = null;
        this.inventoryUI = null;
        this.equipmentUI = null;
        this.saveLoadUI = null;
        this.settingsUI = null;

        this.initializeMenus();
        this.setupEventListeners();
    }

    initializeMenus() {
        // Create overlay
        this.overlay = new Panel(0, 0, this.size.width, this.size.height);
        this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.overlay.style.borderWidth = 0;
        this.addChild(this.overlay);

        // Create main menu panel
        this.mainMenuPanel = new Panel(
            this.size.width / 2 - 150,
            this.size.height / 2 - 100,
            300,
            200
        );
        this.mainMenuPanel.style.backgroundColor = 'rgba(20, 20, 40, 0.95)';
        this.mainMenuPanel.style.borderColor = '#ffd700';
        this.addChild(this.mainMenuPanel);

        // Create content panel for sub-menus
        this.contentPanel = new Panel(
            50,
            50,
            this.size.width - 100,
            this.size.height - 100
        );
        this.contentPanel.style.backgroundColor = 'rgba(30, 30, 50, 0.95)';
        this.contentPanel.style.borderColor = '#ffd700';
        this.contentPanel.hide();
        this.addChild(this.contentPanel);

        // Create main menu buttons
        this.createMainMenuButtons();

        // Initialize sub-menu systems
        this.initializeSubMenus();
    }

    createMainMenuButtons() {
        const menuItems = [
            { text: 'Status', action: 'status' },
            { text: 'Items', action: 'items' },
            { text: 'Equipment', action: 'equipment' },
            { text: 'Save/Load', action: 'save_load' },
            { text: 'Settings', action: 'settings' },
            { text: 'Close', action: 'close' }
        ];

        const startY = 20;
        const buttonHeight = 30;
        const buttonSpacing = 10;

        this.menuButtons = menuItems.map((item, index) => {
            const button = new Button(
                20,
                startY + index * (buttonHeight + buttonSpacing),
                this.mainMenuPanel.size.width - 40,
                buttonHeight,
                item.text
            );

            button.on('click', () => this.handleMenuAction(item.action));
            this.mainMenuPanel.addChild(button);

            return button;
        });
    }

    initializeSubMenus() {
        // Initialize sub-menu UI components (to be implemented)
        this.statusUI = new StatusUI(this.engine, this.contentPanel, this.character);
        this.inventoryUI = new InventoryUI(this.engine, this.contentPanel, this.inventory);
        this.equipmentUI = new EquipmentUI(this.engine, this.contentPanel, this.character, this.inventory);
        this.saveLoadUI = new SaveLoadUI(this.engine, this.contentPanel);
        this.settingsUI = new SettingsUI(this.engine, this.contentPanel);
    }

    setupEventListeners() {
        // Handle keyboard navigation
        document.addEventListener('keydown', (event) => this.handleKeyInput(event));
    }

    handleKeyInput(event) {
        if (!this.isOpen) return;

        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                if (this.activeMenu) {
                    this.closeSubMenu();
                } else {
                    this.closeMenu();
                }
                break;
            case 'Tab':
                event.preventDefault();
                // Handle tab navigation within current menu
                break;
        }
    }

    openMenu() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.show();

        // Animate menu in
        this.animateMenuIn();

        // Announce for accessibility
        this.uiManager.announceToScreenReader('Game menu opened. Use Tab to navigate, Enter to select, Escape to close.', 'assertive');
    }

    closeMenu() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.activeMenu = null;
        this.menuStack = [];

        // Close any open sub-menu
        this.closeSubMenu();

        // Animate menu out
        this.animateMenuOut(() => {
            this.hide();
        });

        // Announce for accessibility
        this.uiManager.announceToScreenReader('Game menu closed.', 'polite');
    }

    handleMenuAction(action) {
        switch (action) {
            case 'status':
                this.openSubMenu('status');
                break;
            case 'items':
                this.openSubMenu('items');
                break;
            case 'equipment':
                this.openSubMenu('equipment');
                break;
            case 'save_load':
                this.openSubMenu('save_load');
                break;
            case 'settings':
                this.openSubMenu('settings');
                break;
            case 'close':
                this.closeMenu();
                break;
        }
    }

    openSubMenu(menuType) {
        // Hide main menu
        this.mainMenuPanel.hide();

        // Show content panel
        this.contentPanel.show();

        // Set active menu and show appropriate UI
        this.activeMenu = menuType;
        this.menuStack.push(menuType);

        switch (menuType) {
            case 'status':
                this.statusUI.show();
                break;
            case 'items':
                this.inventoryUI.show();
                break;
            case 'equipment':
                this.equipmentUI.show();
                break;
            case 'save_load':
                this.saveLoadUI.show();
                break;
            case 'settings':
                this.settingsUI.show();
                break;
        }

        // Announce sub-menu opening
        this.uiManager.announceToScreenReader(`${menuType} menu opened.`, 'polite');
    }

    closeSubMenu() {
        if (!this.activeMenu) return;

        // Hide current sub-menu
        this.hideCurrentSubMenu();

        // Clear menu stack and active menu
        this.menuStack = [];
        this.activeMenu = null;

        // Show main menu again
        this.mainMenuPanel.show();
        this.contentPanel.hide();

        // Announce sub-menu closing
        this.uiManager.announceToScreenReader('Returned to main menu.', 'polite');
    }

    hideCurrentSubMenu() {
        switch (this.activeMenu) {
            case 'status':
                this.statusUI.hide();
                break;
            case 'items':
                this.inventoryUI.hide();
                break;
            case 'equipment':
                this.equipmentUI.hide();
                break;
            case 'save_load':
                this.saveLoadUI.hide();
                break;
            case 'settings':
                this.settingsUI.hide();
                break;
        }
    }

    animateMenuIn() {
        // Animate overlay fade in
        this.animationManager.fadeIn(this.overlay, 300);

        // Animate main menu slide in
        this.animationManager.slideIn(this.mainMenuPanel, 'right', 50, 400);
    }

    animateMenuOut(callback) {
        // Animate overlay fade out
        this.animationManager.fadeOut(this.overlay, 300);

        // Animate main menu slide out
        this.animationManager.slideOut(this.mainMenuPanel, 'right', 50, 400);

        // Call callback after animation
        setTimeout(callback, 400);
    }

    update(deltaTime) {
        if (!this.visible) return;

        super.update(deltaTime);
        this.animationManager.update(deltaTime);

        // Update active sub-menu
        if (this.activeMenu) {
            switch (this.activeMenu) {
                case 'status':
                    this.statusUI.update(deltaTime);
                    break;
                case 'items':
                    this.inventoryUI.update(deltaTime);
                    break;
                case 'equipment':
                    this.equipmentUI.update(deltaTime);
                    break;
                case 'save_load':
                    this.saveLoadUI.update(deltaTime);
                    break;
                case 'settings':
                    this.settingsUI.update(deltaTime);
                    break;
            }
        }
    }

    render(ctx) {
        if (!this.visible) return;

        super.render(ctx);
    }

    handleInput(inputManager) {
        if (!this.visible) return false;

        let handled = false;

        // Handle sub-menu input first
        if (this.activeMenu) {
            switch (this.activeMenu) {
                case 'status':
                    handled = this.statusUI.handleInput(inputManager);
                    break;
                case 'items':
                    handled = this.inventoryUI.handleInput(inputManager);
                    break;
                case 'equipment':
                    handled = this.equipmentUI.handleInput(inputManager);
                    break;
                case 'save_load':
                    handled = this.saveLoadUI.handleInput(inputManager);
                    break;
                case 'settings':
                    handled = this.settingsUI.handleInput(inputManager);
                    break;
            }
        }

        // Handle main menu input if not handled by sub-menu
        if (!handled) {
            handled = super.handleInput(inputManager);
        }

        return handled;
    }

    // Public methods for external control
    toggle() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    // Get current menu state
    getState() {
        return {
            isOpen: this.isOpen,
            activeMenu: this.activeMenu,
            menuStack: [...this.menuStack]
        };
    }

    // Restore menu state
    setState(state) {
        if (state.isOpen) {
            this.openMenu();
            if (state.activeMenu) {
                this.openSubMenu(state.activeMenu);
            }
        }
    }
}

// Base class for sub-menu UIs
class SubMenuUI extends UIComponent {
    constructor(engine, parentPanel) {
        super(0, 0, parentPanel.size.width, parentPanel.size.height);
        this.engine = engine;
        this.parentPanel = parentPanel;
        this.uiManager = engine.uiManager;
        this.animationManager = new AnimationManager(engine);

        // Common UI elements
        this.titleLabel = null;
        this.backButton = null;

        this.initializeCommonElements();
    }

    initializeCommonElements() {
        // Title label
        this.titleLabel = new Label(20, 20, '', 'bold 24px monospace');
        this.titleLabel.style.textColor = '#ffd700';
        this.addChild(this.titleLabel);

        // Back button
        this.backButton = new Button(
            this.size.width - 120,
            10,
            100,
            30,
            'Back'
        );
        this.backButton.on('click', () => this.onBack());
        this.addChild(this.backButton);
    }

    show() {
        this.visible = true;
        this.parentPanel.addChild(this);
        this.animateIn();
    }

    hide() {
        this.visible = false;
        if (this.parentPanel.children.includes(this)) {
            this.parentPanel.removeChild(this);
        }
    }

    animateIn() {
        this.animationManager.fadeIn(this, 300);
    }

    animateOut(callback) {
        this.animationManager.fadeOut(this, 300, {
            onComplete: callback
        });
    }

    onBack() {
        this.hide();
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.animationManager.update(deltaTime);
    }
}

// Status UI Subclass
class StatusUI extends SubMenuUI {
    constructor(engine, parentPanel, character) {
        super(engine, parentPanel);
        this.character = character;

        this.initializeStatusUI();
    }

    initializeStatusUI() {
        this.titleLabel.setText('Character Status');

        // Character info
        this.nameLabel = new Label(20, 80, `Name: ${this.character.name}`, '18px monospace');
        this.addChild(this.nameLabel);

        this.levelLabel = new Label(20, 110, `Level: ${this.character.level}`, '18px monospace');
        this.addChild(this.levelLabel);

        this.jobLabel = new Label(20, 140, `Job: ${this.character.getJobInfo()?.name || 'None'}`, '18px monospace');
        this.addChild(this.jobLabel);

        // Stats display
        this.statsPanel = new Panel(20, 180, this.size.width - 40, 200);
        this.statsPanel.style.backgroundColor = 'rgba(40, 40, 60, 0.8)';
        this.addChild(this.statsPanel);

        // Create stat bars and labels
        this.createStatDisplay();
    }

    createStatDisplay() {
        const stats = [
            { name: 'Health', value: this.character.health, max: this.character.maxHealth, color: '#ff4444' },
            { name: 'Mana', value: this.character.mana, max: this.character.maxMana, color: '#4444ff' },
            { name: 'Experience', value: this.character.experience, max: this.character.experienceToNext, color: '#44ff44' }
        ];

        stats.forEach((stat, index) => {
            const y = 20 + index * 50;

            // Stat label
            const label = new Label(20, y, stat.name, '16px monospace');
            label.style.textColor = '#ffffff';
            this.statsPanel.addChild(label);

            // Progress bar
            const progressBar = new ProgressBar(120, y - 5, 200, 20, 0, stat.max);
            progressBar.setValue(stat.value);
            progressBar.style.fillColor = stat.color;
            this.statsPanel.addChild(progressBar);

            // Value text
            const valueLabel = new Label(340, y, `${stat.value}/${stat.max}`, '16px monospace');
            valueLabel.style.textColor = '#ffffff';
            this.statsPanel.addChild(valueLabel);
        });
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Update stats display
        if (this.visible) {
            this.levelLabel.setText(`Level: ${this.character.level}`);
            this.jobLabel.setText(`Job: ${this.character.getJobInfo()?.name || 'None'}`);

            // Update progress bars (simplified - would need to get references)
            // This would be enhanced to update all stat displays
        }
    }
}

// Inventory UI Subclass (placeholder - will be implemented with drag-and-drop)
class InventoryUI extends SubMenuUI {
    constructor(engine, parentPanel, inventory) {
        super(engine, parentPanel);
        this.inventory = inventory;

        this.initializeInventoryUI();
    }

    initializeInventoryUI() {
        this.titleLabel.setText('Inventory');

        // Inventory grid will be implemented with drag-and-drop functionality
        const placeholderLabel = new Label(20, 80, 'Inventory management coming soon...', '16px monospace');
        this.addChild(placeholderLabel);
    }
}

// Equipment UI Subclass (placeholder)
class EquipmentUI extends SubMenuUI {
    constructor(engine, parentPanel, character, inventory) {
        super(engine, parentPanel);
        this.character = character;
        this.inventory = inventory;

        this.initializeEquipmentUI();
    }

    initializeEquipmentUI() {
        this.titleLabel.setText('Equipment');

        const placeholderLabel = new Label(20, 80, 'Equipment management coming soon...', '16px monospace');
        this.addChild(placeholderLabel);
    }
}

// Save/Load UI Subclass (placeholder)
class SaveLoadUI extends SubMenuUI {
    constructor(engine, parentPanel) {
        super(engine, parentPanel);

        this.initializeSaveLoadUI();
    }

    initializeSaveLoadUI() {
        this.titleLabel.setText('Save/Load Game');

        const placeholderLabel = new Label(20, 80, 'Save/Load functionality coming soon...', '16px monospace');
        this.addChild(placeholderLabel);
    }
}

// Settings UI Subclass (placeholder)
class SettingsUI extends SubMenuUI {
    constructor(engine, parentPanel) {
        super(engine, parentPanel);

        this.initializeSettingsUI();
    }

    initializeSettingsUI() {
        this.titleLabel.setText('Settings');

        const placeholderLabel = new Label(20, 80, 'Settings menu coming soon...', '16px monospace');
        this.addChild(placeholderLabel);
    }
}

export {
    MenuSystem,
    StatusUI,
    InventoryUI,
    EquipmentUI,
    SaveLoadUI,
    SettingsUI
};