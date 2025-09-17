// Dialog System Foundation
// Provides dialog management, UI components, and conversation handling
// Enhanced with accessibility features for screen readers and keyboard navigation

import { UIComponent, MenuManager } from './UIManager.js';

// Dialog Tree Node Structure
class DialogNode {
    constructor(config) {
        this.id = config.id;
        this.text = config.text;
        this.speaker = config.speaker || '';
        this.portrait = config.portrait || null;
        this.choices = config.choices || [];
        this.autoAdvance = config.autoAdvance || false;
        this.nextNode = config.nextNode || null;
        this.voiceLine = config.voiceLine || null; // Voice integration point
    }
}

// DialogBubble UI Component with Typewriter Effect
class DialogBubble extends UIComponent {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.text = '';
        this.displayText = '';
        this.speaker = '';
        this.portrait = null;
        this.typewriterSpeed = 30; // characters per second
        this.currentCharIndex = 0;
        this.isTyping = false;
        this.isComplete = false;
        this.voiceCallback = null; // Voice integration point

        // Accessibility properties
        this.accessibility = {
            role: 'dialog',
            ariaLive: 'polite',
            ariaLabel: '',
            ariaAtomic: true,
            lastAnnouncedText: ''
        };

        this.style = {
            ...this.style,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#ffd700',
            borderWidth: 3,
            borderRadius: 10,
            textColor: '#ffffff',
            font: '18px monospace',
            padding: 15
        };
    }

    setDialog(text, speaker = '', portrait = null, voiceCallback = null) {
        this.text = text;
        this.speaker = speaker;
        this.portrait = portrait;
        this.voiceCallback = voiceCallback;
        this.displayText = '';
        this.currentCharIndex = 0;
        this.isTyping = true;
        this.isComplete = false;
        this.dirty = true;

        // Update accessibility attributes
        this.updateAccessibilityAttributes();

        // Trigger voice if callback provided
        if (this.voiceCallback) {
            this.voiceCallback(text, speaker);
        }
    }

    update(deltaTime) {
        if (this.isTyping && !this.isComplete) {
            this.currentCharIndex += this.typewriterSpeed * deltaTime;
            if (this.currentCharIndex >= this.text.length) {
                this.currentCharIndex = this.text.length;
                this.isComplete = true;
                this.isTyping = false;
                this.emit('text-complete');
            }
            this.displayText = this.text.substring(0, Math.floor(this.currentCharIndex));
            this.dirty = true;
        }
        super.update(deltaTime);
    }

    renderContent(ctx) {
        // Render portrait if available
        if (this.portrait) {
            const portraitSize = 64;
            ctx.drawImage(this.portrait, this.style.padding, this.style.padding, portraitSize, portraitSize);
        }

        // Render speaker name
        if (this.speaker) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(this.speaker + ':', this.portrait ? 80 : this.style.padding, this.style.padding);
        }

        // Render text with word wrapping
        ctx.fillStyle = this.style.textColor;
        ctx.font = this.style.font;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const textX = this.portrait ? 80 : this.style.padding;
        const textY = this.speaker ? this.style.padding + 25 : this.style.padding;
        const maxWidth = this.size.width - textX - this.style.padding;

        this.renderWrappedText(ctx, this.displayText, textX, textY, maxWidth);
    }

    renderWrappedText(ctx, text, x, y, maxWidth) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += 20;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }

    skipTypewriter() {
        this.currentCharIndex = this.text.length;
        this.displayText = this.text;
        this.isComplete = true;
        this.isTyping = false;
        this.emit('text-complete');
        this.dirty = true;
    }

    updateAccessibilityAttributes() {
        // Update aria-label for screen readers
        const speakerText = this.speaker ? `${this.speaker} says: ` : '';
        this.accessibility.ariaLabel = `${speakerText}${this.text}`;

        // Announce to screen reader if text changed
        if (this.accessibility.lastAnnouncedText !== this.text) {
            this.announceToScreenReader(`${speakerText}${this.text}`);
            this.accessibility.lastAnnouncedText = this.text;
        }
    }

    announceToScreenReader(message) {
        // Create or update a live region for screen reader announcements
        let liveRegion = document.getElementById('dialog-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'dialog-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
        liveRegion.textContent = message;
    }
}

// DialogManager Class
class DialogManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.currentDialog = null;
        this.dialogQueue = [];
        this.currentNode = null;
        this.dialogData = new Map(); // Store loaded dialog trees
        this.characterStates = new Map();
        this.globalFlags = new Map();
        this.isActive = false;

        // Accessibility properties
        this.focusTrapEnabled = false;
        this.previousFocusElement = null;
        this.focusableElements = new Set();
        this.currentFocusIndex = -1;

        // UI Components
        this.dialogBubble = new DialogBubble(50, 400, 700, 150);
        this.choiceMenu = new MenuManager(50, 560, 700, 200);
        this.uiManager.addComponent(this.dialogBubble);
        this.uiManager.addComponent(this.choiceMenu);

        this.choiceMenu.hide();

        // Event listeners
        this.dialogBubble.on('text-complete', () => this.onTextComplete());
        this.choiceMenu.on('choice-selected', (choice) => this.onChoiceSelected(choice));

        // Keyboard navigation setup
        this.setupKeyboardNavigation();
    }

    setupKeyboardNavigation() {
        this.keyboardHandler = (event) => {
            if (!this.isActive) return;

            switch (event.key) {
                case 'Tab':
                    event.preventDefault();
                    if (this.focusTrapEnabled) {
                        this.handleTabNavigation(event.shiftKey);
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.endDialog();
                    break;
                case ' ':
                    event.preventDefault();
                    this.skipTypewriter();
                    break;
            }
        };

        document.addEventListener('keydown', this.keyboardHandler);
    }

    handleTabNavigation(shiftKey) {
        const focusableArray = Array.from(this.focusableElements);
        if (focusableArray.length === 0) return;

        if (shiftKey) {
            this.currentFocusIndex = this.currentFocusIndex <= 0 ?
                focusableArray.length - 1 : this.currentFocusIndex - 1;
        } else {
            this.currentFocusIndex = this.currentFocusIndex >= focusableArray.length - 1 ?
                0 : this.currentFocusIndex + 1;
        }

        const element = focusableArray[this.currentFocusIndex];
        if (element && typeof element.focus === 'function') {
            element.focus();
        }
    }

    skipTypewriter() {
        if (this.dialogBubble && this.dialogBubble.isTyping) {
            this.dialogBubble.skipTypewriter();
        }
    }

    enableFocusTrap() {
        this.focusTrapEnabled = true;
        this.updateFocusableElements();
        this.previousFocusElement = document.activeElement;

        // Set initial focus
        this.setInitialFocus();
    }

    disableFocusTrap() {
        this.focusTrapEnabled = false;
        this.focusableElements.clear();
        this.currentFocusIndex = -1;

        // Restore previous focus
        if (this.previousFocusElement && typeof this.previousFocusElement.focus === 'function') {
            this.previousFocusElement.focus();
        }
        this.previousFocusElement = null;
    }

    updateFocusableElements() {
        this.focusableElements.clear();

        // Add dialog bubble (canvas-based, focus handled on canvas element)
        if (this.dialogBubble.visible) {
            this.focusableElements.add(this.dialogBubble);
        }

        // Add choice menu (handled as a single focusable unit)
        if (this.choiceMenu.visible) {
            this.focusableElements.add(this.choiceMenu);
        }
    }

    setInitialFocus() {
        // Focus the canvas element for accessibility
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.focus();
            canvas.setAttribute('aria-label', 'Game dialog interface');
            canvas.setAttribute('role', 'dialog');
            this.announceToScreenReader('Dialog opened. Use arrow keys to navigate menu, Enter to select, Escape to close, Space to skip text.');
        }
    }

    announceToScreenReader(message) {
        // Create or update a live region for screen reader announcements
        let liveRegion = document.getElementById('dialog-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'dialog-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
        liveRegion.textContent = message;
    }

    // Load a dialog tree
    loadDialog(id, dialogTree) {
        const nodes = new Map();
        Object.entries(dialogTree.nodes).forEach(([nodeId, config]) => {
            nodes.set(nodeId, new DialogNode({ id: nodeId, ...config }));
        });
        this.dialogData.set(id, dialogTree);
        this.dialogData.set(`${id}_nodes`, nodes);
    }

    // Start a dialog
    startDialog(dialogId, context = {}) {
        const dialogTree = this.dialogData.get(dialogId);
        if (!dialogTree) {
            console.warn(`Dialog ${dialogId} not found`);
            return;
        }

        this.currentDialog = dialogTree;
        this.context = context;

        if (this.isActive) {
            this.dialogQueue.push({ dialogId, context });
            return;
        }

        this.isActive = true;
        this.enableFocusTrap();
        this.announceToScreenReader(`Dialog started: ${dialogTree.title || dialogId}`);
        this.goToNode('start');
    }

    // Navigate to a specific node
    goToNode(nodeId) {
        const nodes = this.dialogData.get(`${this.currentDialog.id}_nodes`);
        const node = nodes.get(nodeId);

        if (!node) {
            console.warn(`Node ${nodeId} not found in dialog ${this.currentDialog.id}`);
            this.endDialog();
            return;
        }

        this.currentNode = node;

        // Set dialog bubble content
        this.dialogBubble.setDialog(
            node.text,
            node.speaker,
            node.portrait,
            node.voiceLine ? (text, speaker) => this.playVoice(text, speaker, node.voiceLine) : null
        );

        // Set up choices if any
        if (node.choices && node.choices.length > 0) {
            const menuItems = node.choices.map(choice => ({
                text: choice.text,
                callback: () => this.selectChoice(choice)
            }));

            this.choiceMenu.setMenu({
                title: 'Choose your response:',
                items: menuItems
            });
            this.choiceMenu.show();

            // Announce choices to screen reader
            const choiceTexts = node.choices.map(choice => choice.text).join(', ');
            this.announceToScreenReader(`Dialog choices available: ${choiceTexts}. Use Tab to navigate, Enter to select.`);
        } else {
            this.choiceMenu.hide();
            if (node.autoAdvance && node.nextNode) {
                // Auto advance after text completes
                this.dialogBubble.once('text-complete', () => {
                    // Store timeout for cleanup
                    this.autoAdvanceTimeoutId = setTimeout(() => {
                        this.goToNode(node.nextNode);
                        this.autoAdvanceTimeoutId = null;
                    }, 1000);
                });
            } else {
                // Announce that dialog will continue on user input
                this.announceToScreenReader('Press Space or Enter to continue dialog.');
            }
        }

        this.dialogBubble.show();
        this.updateFocusableElements();
    }

    // Handle choice selection
    selectChoice(choice) {
        // Apply choice effects if any (simplified)
        if (choice.condition) {
            // Basic condition check (can be expanded)
            if (!this.evaluateCondition(choice.condition)) {
                return; // Choice not available
            }
        }

        if (choice.goto) {
            this.goToNode(choice.goto);
        } else {
            this.endDialog();
        }
    }

    // Event handlers
    onTextComplete() {
        // Text typing finished
    }

    onChoiceSelected(choice) {
        // Choice selected via menu
    }

    // End current dialog
    endDialog() {
        this.isActive = false;
        this.currentDialog = null;
        this.currentNode = null;
        this.dialogBubble.hide();
        this.choiceMenu.hide();

        // Clear any auto-advance timeout
        if (this.autoAdvanceTimeoutId) {
            clearTimeout(this.autoAdvanceTimeoutId);
            this.autoAdvanceTimeoutId = null;
        }

        this.disableFocusTrap();
        this.announceToScreenReader('Dialog ended.');

        // Start next queued dialog
        if (this.dialogQueue.length > 0) {
            const next = this.dialogQueue.shift();
            this.startDialog(next.dialogId, next.context);
        }

        this.emit('dialog-ended');
    }

    // Voice integration point
    playVoice(text, speaker, voiceLine) {
        // Placeholder for voice system integration
        // Could trigger audio playback, TTS, etc.
        console.log(`Playing voice: ${speaker} says "${text}"`);
        // e.g., audioManager.playVoice(voiceLine);
    }

    // Basic condition evaluation
    evaluateCondition(condition) {
        // Simplified condition evaluation
        // Can be expanded with proper expression parser
        try {
            // Basic flag and context checks
            if (condition.startsWith('flag.')) {
                const flag = condition.substring(5);
                return this.globalFlags.get(flag) || false;
            }
            if (condition.startsWith('context.')) {
                const path = condition.substring(8).split('.');
                let value = this.context;
                for (const key of path) {
                    value = value[key];
                    if (value === undefined) return false;
                }
                return !!value;
            }
            return true; // Default to true for simple conditions
        } catch (e) {
            console.warn('Condition evaluation error:', e);
            return false;
        }
    }

    // Set global flags
    setGlobalFlag(flag, value) {
        this.globalFlags.set(flag, value);
    }

    // Get global flag
    getGlobalFlag(flag) {
        return this.globalFlags.get(flag) || false;
    }

    // Update and render (called by game loop)
    update(deltaTime) {
        if (this.isActive) {
            this.dialogBubble.update(deltaTime);
            this.choiceMenu.update(deltaTime);
        }
    }

    render(ctx) {
        // Components handle their own rendering via UIManager
    }

    // Event system (basic)
    events = new Map();

    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => callback(data, this));
        }
    }

    // Cleanup method for accessibility features
    destroy() {
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }
        this.disableFocusTrap();
        // Clean up live region
        const liveRegion = document.getElementById('dialog-live-region');
        if (liveRegion) {
            liveRegion.remove();
        }
    }
}

export { DialogManager, DialogBubble, DialogNode };