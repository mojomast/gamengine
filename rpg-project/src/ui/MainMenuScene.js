/**
 * Main Menu Scene
 * Handles the main menu system with navigation and theming using UIManager
 */

import { Scene } from '../../../game-engine/src/core/Scene.js';
import { UIManager, Button, Label, Panel } from '../../../game-engine/src/ui/UIManager.js';
import { AnimationManager } from '../../../game-engine/src/effects/AnimationManager.js';

export class MainMenuScene extends Scene {
    constructor(engine) {
        super();
        this.engine = engine;
        this.uiManager = new UIManager(engine);
        this.animationManager = new AnimationManager(engine);

        // Menu state
        this.selectedOption = 0;
        this.menuOptions = [
            { text: 'New Game', action: 'new_game' },
            { text: 'Continue', action: 'continue' },
            { text: 'Settings', action: 'settings' },
            { text: 'Credits', action: 'credits' },
            { text: 'Quit', action: 'quit' }
        ];

        // UI elements
        this.backgroundPanel = null;
        this.titleLabel = null;
        this.menuButtons = [];
        this.versionLabel = null;

        // Animation state
        this.menuVisible = false;
    }

    async init() {
        // Set up UI manager
        this.uiManager.setTheme('default');
        this.uiManager.enableMobileLayout();

        // Create HUD for menu elements
        this.hud = this.uiManager.createHUD();

        this.createBackground();
        this.createTitle();
        this.createMenuButtons();
        this.createVersionInfo();

        // Set up event listeners
        this.setupEventListeners();

        // Animate menu in
        this.animateMenuIn();
    }

    createBackground() {
        this.backgroundPanel = new Panel(
            0, 0,
            this.engine.canvas.width,
            this.engine.canvas.height
        );

        // RPG-themed background styling
        this.backgroundPanel.style.backgroundColor = 'rgba(20, 20, 40, 0.9)';
        this.backgroundPanel.style.borderWidth = 0;

        this.uiManager.addComponent(this.backgroundPanel);
    }

    createTitle() {
        const centerX = this.engine.canvas.width / 2;
        const centerY = this.engine.canvas.height / 2 - 150;

        this.titleLabel = new Label(centerX, centerY, 'FINAL FANTASY\nSTYLE RPG', 'bold 48px monospace');
        this.titleLabel.style.textColor = '#ffd700';
        this.titleLabel.style.textAlign = 'center';
        this.titleLabel.style.textBaseline = 'middle';

        // Add glowing effect
        this.titleLabel.style.textShadow = '0 0 10px #ffd700, 0 0 20px #ffd700, 0 0 30px #ffd700';

        this.uiManager.addComponent(this.titleLabel);
    }

    createMenuButtons() {
        const centerX = this.engine.canvas.width / 2;
        const startY = this.engine.canvas.height / 2 - 50;
        const buttonSpacing = 60;

        this.menuButtons = this.menuOptions.map((option, index) => {
            const button = new Button(
                centerX - 100,
                startY + index * buttonSpacing,
                200,
                40,
                option.text
            );

            // Style buttons
            button.style.backgroundColor = index === 0 ? '#d62828' : '#666666';
            button.style.hoverBackgroundColor = '#ff4444';
            button.style.clickBackgroundColor = '#8b0000';

            // Add event handler
            button.on('click', () => this.handleMenuAction(option.action));

            // Add to UI manager
            this.uiManager.addComponent(button);

            return button;
        });
    }

    createVersionInfo() {
        this.versionLabel = new Label(
            20,
            this.engine.canvas.height - 30,
            'Version 1.0.0 - FF3-Style RPG Engine',
            '12px monospace'
        );
        this.versionLabel.style.textColor = '#888888';

        this.uiManager.addComponent(this.versionLabel);
    }

    setupEventListeners() {
        // Handle keyboard navigation
        document.addEventListener('keydown', (event) => this.handleKeyInput(event));

        // Handle UI manager events
        this.uiManager.on('menu-navigate', (direction) => this.navigateMenu(direction));
    }

    handleKeyInput(event) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.navigateMenu('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.navigateMenu('down');
                break;
            case 'Enter':
                event.preventDefault();
                this.selectMenuOption();
                break;
            case 'Escape':
                event.preventDefault();
                this.handleMenuAction('quit');
                break;
        }
    }

    navigateMenu(direction) {
        // Update visual selection
        this.menuButtons[this.selectedOption].style.backgroundColor = '#666666';

        if (direction === 'up') {
            this.selectedOption = (this.selectedOption - 1 + this.menuButtons.length) % this.menuButtons.length;
        } else if (direction === 'down') {
            this.selectedOption = (this.selectedOption + 1) % this.menuButtons.length;
        }

        // Update visual selection
        this.menuButtons[this.selectedOption].style.backgroundColor = '#d62828';

        // Announce selection for accessibility
        this.uiManager.announceToScreenReader(
            `Menu option ${this.selectedOption + 1} of ${this.menuButtons.length}: ${this.menuOptions[this.selectedOption].text}`,
            'polite'
        );
    }

    selectMenuOption() {
        const selectedOption = this.menuOptions[this.selectedOption];
        this.handleMenuAction(selectedOption.action);
    }

    handleMenuAction(action) {
        switch (action) {
            case 'new_game':
                this.startNewGame();
                break;
            case 'continue':
                this.continueGame();
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'credits':
                this.showCredits();
                break;
            case 'quit':
                this.quitGame();
                break;
        }
    }

    startNewGame() {
        // Animate menu out
        this.animateMenuOut(() => {
            // Transition to character creation or world map
            this.engine.sceneManager.switchScene('character_creation', {
                newGame: true
            });
        });
    }

    continueGame() {
        // Attempt to load saved game
        if (this.engine.loadRPGGame('auto-save')) {
            this.animateMenuOut(() => {
                this.engine.sceneManager.switchScene('world_map');
            });
        } else {
            // Show notification that no save exists
            this.uiManager.createNotification(
                'No saved game found. Start a new game instead.',
                3000,
                'warning'
            );
        }
    }

    showSettings() {
        // Show settings menu (to be implemented)
        this.uiManager.createNotification(
            'Settings menu coming soon!',
            2000,
            'info'
        );
    }

    showCredits() {
        // Show credits screen (to be implemented)
        const creditsPanel = new Panel(
            this.engine.canvas.width / 2 - 200,
            this.engine.canvas.height / 2 - 150,
            400,
            300
        );

        const creditsLabel = new Label(
            creditsPanel.size.width / 2,
            50,
            'CREDITS\n\nGame Engine: mojomast/gamengine\n\nRPG System: FF3-Style Engine\n\nDevelopment: AI Assistant',
            '16px monospace'
        );
        creditsLabel.style.textAlign = 'center';
        creditsLabel.style.textColor = '#ffffff';

        const closeButton = new Button(
            creditsPanel.size.width / 2 - 50,
            creditsPanel.size.height - 60,
            100,
            40,
            'Close'
        );

        closeButton.on('click', () => {
            this.uiManager.removeComponent(creditsPanel);
        });

        creditsPanel.addChild(creditsLabel);
        creditsPanel.addChild(closeButton);

        this.uiManager.showModal(creditsPanel);
    }

    quitGame() {
        // Animate menu out and quit
        this.animateMenuOut(() => {
            if (confirm('Are you sure you want to quit the game?')) {
                window.close();
            }
        });
    }

    animateMenuIn() {
        this.menuVisible = true;

        // Animate title
        this.animationManager.fadeIn(this.titleLabel, 1000);

        // Animate buttons with stagger
        this.menuButtons.forEach((button, index) => {
            this.animationManager.to(
                button,
                { 'position.x': button.position.x },
                500,
                {
                    delay: index * 100,
                    onStart: () => {
                        button.setPosition(button.position.x - 200, button.position.y);
                    }
                }
            );
        });
    }

    animateMenuOut(callback) {
        this.menuVisible = false;

        // Animate elements out
        const animations = [
            this.animationManager.fadeOut(this.titleLabel, 500),
            ...this.menuButtons.map(button =>
                this.animationManager.to(
                    button,
                    { 'position.x': button.position.x - 200 },
                    500
                )
            )
        ];

        // Wait for all animations to complete
        setTimeout(callback, 500);
    }

    update(deltaTime) {
        // Update UI manager
        this.uiManager.update(deltaTime);

        // Update animations
        this.animationManager.update(deltaTime);
    }

    render(ctx) {
        // Clear canvas with gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, this.engine.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);

        // Render UI elements
        this.uiManager.render(ctx);
    }

    handleInput(inputManager) {
        // Handle UI input
        this.uiManager.handleInput(inputManager);
    }

    cleanup() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyInput);

        // Clean up UI manager
        this.uiManager.destroy();

        // Clean up animations
        this.animationManager.killAll();
    }

    // Get state for saving
    getState() {
        return {
            selectedOption: this.selectedOption,
            menuVisible: this.menuVisible
        };
    }

    // Restore state from save
    setState(state) {
        if (state.selectedOption !== undefined) {
            this.selectedOption = state.selectedOption;
        }
        if (state.menuVisible !== undefined) {
            this.menuVisible = state.menuVisible;
        }
    }
}