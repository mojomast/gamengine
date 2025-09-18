/**
 * Controller Navigation System
 * Provides gamepad/controller support for UI navigation with focus management
 */

import { InputManager } from '../../../game-engine/src/core/InputManager.js';

export class ControllerNavigation {
    constructor(uiManager, inputManager) {
        this.uiManager = uiManager;
        this.inputManager = inputManager;
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.enabled = true;
        this.stickDeadzone = 0.2;
        this.lastStickInput = { x: 0, y: 0 };
        this.stickRepeatDelay = 300; // ms
        this.lastStickTime = 0;

        this.setupControllerInput();
    }

    setupControllerInput() {
        // Set up controller input handling
        this.inputManager.onGamepadConnected = (gamepad) => {
            console.log('Gamepad connected:', gamepad.id);
            this.uiManager.announceToScreenReader('Gamepad connected for UI navigation', 'polite');
        };

        this.inputManager.onGamepadDisconnected = (gamepad) => {
            console.log('Gamepad disconnected:', gamepad.id);
            this.uiManager.announceToScreenReader('Gamepad disconnected', 'polite');
        };
    }

    update(deltaTime) {
        if (!this.enabled) return;

        this.handleControllerInput(deltaTime);
    }

    handleControllerInput(deltaTime) {
        if (!this.inputManager.hasActiveGamepad()) return;

        const gamepad = this.inputManager.getGamepadState();

        // Handle D-pad navigation
        if (this.inputManager.isGamepadButtonPressed('DPadUp') ||
            this.inputManager.isGamepadButtonPressed('DPadDown') ||
            this.inputManager.isGamepadButtonPressed('DPadLeft') ||
            this.inputManager.isGamepadButtonPressed('DPadRight')) {

            let direction = null;
            if (this.inputManager.isGamepadButtonPressed('DPadUp')) direction = 'up';
            else if (this.inputManager.isGamepadButtonPressed('DPadDown')) direction = 'down';
            else if (this.inputManager.isGamepadButtonPressed('DPadLeft')) direction = 'left';
            else if (this.inputManager.isGamepadButtonPressed('DPadRight')) direction = 'right';

            this.navigateDirection(direction);
        }

        // Handle left stick navigation with repeat delay
        const now = Date.now();
        if (now - this.lastStickTime > this.stickRepeatDelay) {
            const leftStick = gamepad.axes.slice(0, 2); // First two axes are left stick
            const stickX = Math.abs(leftStick[0]) > this.stickDeadzone ? leftStick[0] : 0;
            const stickY = Math.abs(leftStick[1]) > this.stickDeadzone ? leftStick[1] : 0;

            if (stickX !== 0 || stickY !== 0) {
                let direction = null;
                if (Math.abs(stickY) > Math.abs(stickX)) {
                    direction = stickY < 0 ? 'up' : 'down';
                } else {
                    direction = stickX < 0 ? 'left' : 'right';
                }

                // Only navigate if stick input changed direction or is new
                if (direction !== this.lastStickDirection) {
                    this.navigateDirection(direction);
                    this.lastStickTime = now;
                    this.lastStickDirection = direction;
                }
            } else {
                this.lastStickDirection = null;
            }
        }

        // Handle button presses
        if (this.inputManager.isGamepadButtonPressed('A')) { // Confirm/Select
            this.activateCurrentFocus();
        }

        if (this.inputManager.isGamepadButtonPressed('B')) { // Cancel/Back
            this.handleBackAction();
        }

        if (this.inputManager.isGamepadButtonPressed('Y')) { // Secondary action
            this.handleSecondaryAction();
        }

        if (this.inputManager.isGamepadButtonPressed('Start')) { // Menu
            this.handleMenuAction();
        }
    }

    setFocusableElements(elements) {
        this.focusableElements = elements;
        this.currentFocusIndex = -1;

        // Set initial focus if elements exist
        if (this.focusableElements.length > 0) {
            this.setFocus(0);
        }
    }

    addFocusableElement(element) {
        if (!this.focusableElements.includes(element)) {
            this.focusableElements.push(element);

            // If this is the first element, focus it
            if (this.focusableElements.length === 1) {
                this.setFocus(0);
            }
        }
    }

    removeFocusableElement(element) {
        const index = this.focusableElements.indexOf(element);
        if (index > -1) {
            this.focusableElements.splice(index, 1);

            // Adjust current focus index
            if (this.currentFocusIndex >= index && this.currentFocusIndex > 0) {
                this.currentFocusIndex--;
            } else if (this.focusableElements.length === 0) {
                this.currentFocusIndex = -1;
            }

            // Update focus
            if (this.currentFocusIndex >= 0) {
                this.setFocus(this.currentFocusIndex);
            }
        }
    }

    navigateDirection(direction) {
        if (this.focusableElements.length === 0) return;

        let newIndex = this.currentFocusIndex;

        switch (direction) {
            case 'up':
                newIndex = this.findNextElement('up');
                break;
            case 'down':
                newIndex = this.findNextElement('down');
                break;
            case 'left':
                newIndex = this.findNextElement('left');
                break;
            case 'right':
                newIndex = this.findNextElement('right');
                break;
        }

        if (newIndex !== this.currentFocusIndex) {
            this.setFocus(newIndex);
        }
    }

    findNextElement(direction) {
        if (this.focusableElements.length === 0) return -1;

        // For now, simple linear navigation based on direction
        // In a more advanced implementation, this would consider 2D positioning
        switch (direction) {
            case 'up':
            case 'left':
                return Math.max(0, this.currentFocusIndex - 1);
            case 'down':
            case 'right':
                return Math.min(this.focusableElements.length - 1, this.currentFocusIndex + 1);
            default:
                return this.currentFocusIndex;
        }
    }

    setFocus(index) {
        if (index < 0 || index >= this.focusableElements.length) return;

        // Remove focus from current element
        if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableElements.length) {
            const currentElement = this.focusableElements[this.currentFocusIndex];
            if (currentElement && typeof currentElement.blur === 'function') {
                currentElement.blur();
            }
        }

        // Set focus to new element
        this.currentFocusIndex = index;
        const newElement = this.focusableElements[index];

        if (newElement) {
            if (typeof newElement.focus === 'function') {
                newElement.focus();
            }

            // Announce focus change for accessibility
            const label = this.getElementLabel(newElement);
            this.uiManager.announceToScreenReader(`Focused: ${label}`, 'polite');
        }
    }

    getElementLabel(element) {
        // Try to get a human-readable label from the element
        if (element.text) return element.text;
        if (element.label) return element.label;
        if (element.name) return element.name;
        if (element.id) return element.id;
        return 'UI Element';
    }

    activateCurrentFocus() {
        if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableElements.length) {
            const element = this.focusableElements[this.currentFocusIndex];

            if (element) {
                // Simulate click or activation
                if (typeof element.click === 'function') {
                    element.click();
                } else if (element.emit) {
                    element.emit('activate');
                }

                const label = this.getElementLabel(element);
                this.uiManager.announceToScreenReader(`Activated: ${label}`, 'polite');
            }
        }
    }

    handleBackAction() {
        // Emit back action - UI components can listen for this
        this.uiManager.emit('controller-back');

        // Try to find and activate a back/cancel button
        const backButton = this.focusableElements.find(el =>
            el.text && (el.text.toLowerCase().includes('back') ||
                       el.text.toLowerCase().includes('cancel') ||
                       el.text.toLowerCase().includes('close'))
        );

        if (backButton) {
            this.setFocus(this.focusableElements.indexOf(backButton));
            this.activateCurrentFocus();
        } else {
            // Default back behavior - close current menu or go back
            this.uiManager.announceToScreenReader('Back/Cancel action', 'polite');
        }
    }

    handleSecondaryAction() {
        // Secondary action (like right-click or alternate select)
        if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableElements.length) {
            const element = this.focusableElements[this.currentFocusIndex];
            if (element && element.emit) {
                element.emit('secondary-activate');
            }
        }

        this.uiManager.announceToScreenReader('Secondary action', 'polite');
    }

    handleMenuAction() {
        // Menu action (Start button)
        this.uiManager.emit('controller-menu');
        this.uiManager.announceToScreenReader('Menu opened', 'polite');
    }

    // Public methods
    enable() {
        this.enabled = true;
        this.uiManager.announceToScreenReader('Controller navigation enabled', 'polite');
    }

    disable() {
        this.enabled = false;
        this.uiManager.announceToScreenReader('Controller navigation disabled', 'polite');
    }

    isEnabled() {
        return this.enabled;
    }

    getCurrentFocus() {
        if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableElements.length) {
            return this.focusableElements[this.currentFocusIndex];
        }
        return null;
    }

    getFocusableElements() {
        return [...this.focusableElements];
    }

    // Utility method to make an element focusable
    makeFocusable(uiComponent) {
        if (!uiComponent) return;

        // Add controller navigation properties
        uiComponent.controllerFocusable = true;
        uiComponent.focus = () => {
            uiComponent.focused = true;
            uiComponent.dirty = true;
            // Visual feedback for focus
            if (uiComponent.style) {
                uiComponent.originalBorderColor = uiComponent.style.borderColor;
                uiComponent.style.borderColor = '#00ff00'; // Green border for focus
            }
        };

        uiComponent.blur = () => {
            uiComponent.focused = false;
            uiComponent.dirty = true;
            // Restore original border color
            if (uiComponent.style && uiComponent.originalBorderColor) {
                uiComponent.style.borderColor = uiComponent.originalBorderColor;
            }
        };

        return uiComponent;
    }

    // Batch make elements focusable and set up navigation
    setupNavigationForUI(uiComponents) {
        const focusableComponents = uiComponents.filter(component =>
            component.visible && component.enabled &&
            (component instanceof Button || component.controllerFocusable)
        );

        focusableComponents.forEach(component => this.makeFocusable(component));
        this.setFocusableElements(focusableComponents);
    }
}

// Enhanced Button class with controller support
import { Button } from '../../../game-engine/src/ui/UIManager.js';

export class ControllerButton extends Button {
    constructor(x, y, width, height, text) {
        super(x, y, width, height, text);
        this.controllerFocusable = true;
        this.controllerActivated = false;
    }

    handleInput(inputManager) {
        // Handle both mouse and controller input
        const mouseHandled = super.handleInput(inputManager);

        // Controller activation (handled by ControllerNavigation)
        if (this.controllerActivated) {
            this.controllerActivated = false;
            this.emit('click');
            return true;
        }

        return mouseHandled;
    }

    activate() {
        this.controllerActivated = true;
    }
}

// Controller navigation helpers for common UI patterns
export class UINavigationGrid {
    constructor(elements, columns = null) {
        this.elements = elements;
        this.columns = columns || Math.ceil(Math.sqrt(elements.length));
        this.rows = Math.ceil(elements.length / this.columns);
    }

    getElementAt(x, y) {
        const index = y * this.columns + x;
        return this.elements[index] || null;
    }

    getPosition(element) {
        const index = this.elements.indexOf(element);
        if (index === -1) return null;

        return {
            x: index % this.columns,
            y: Math.floor(index / this.columns)
        };
    }

    getNextElement(element, direction) {
        const pos = this.getPosition(element);
        if (!pos) return null;

        let newX = pos.x;
        let newY = pos.y;

        switch (direction) {
            case 'up':
                newY = Math.max(0, pos.y - 1);
                break;
            case 'down':
                newY = Math.min(this.rows - 1, pos.y + 1);
                break;
            case 'left':
                newX = Math.max(0, pos.x - 1);
                break;
            case 'right':
                newX = Math.min(this.columns - 1, pos.x + 1);
                break;
        }

        return this.getElementAt(newX, newY);
    }
}

// Controller vibration/rumble support
export class ControllerFeedback {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.enabled = true;
    }

    vibrate(duration = 200, weakMagnitude = 0.5, strongMagnitude = 0.5) {
        if (!this.enabled || !this.inputManager.hasActiveGamepad()) return;

        // Request vibration if supported
        const gamepad = navigator.getGamepads()[0];
        if (gamepad && gamepad.vibrationActuator) {
            gamepad.vibrationActuator.playEffect('dual-rumble', {
                duration: duration,
                weakMagnitude: weakMagnitude,
                strongMagnitude: strongMagnitude
            });
        }
    }

    // Preset feedback patterns
    buttonPress() {
        this.vibrate(50, 0.3, 0.3);
    }

    navigation() {
        this.vibrate(30, 0.2, 0.1);
    }

    error() {
        this.vibrate(100, 0.5, 0.8);
    }

    success() {
        this.vibrate(150, 0.4, 0.6);
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}