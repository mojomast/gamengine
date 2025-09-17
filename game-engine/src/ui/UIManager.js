/**
 * UI Manager and Components
 * Provides reusable UI elements inspired by both analyzed games
 * Enhanced with accessibility features for screen readers and assistive technologies
 */

import { ValidationHelpers, ValidationError } from '../core/ValidationHelpers.js';

class UIComponent {
    constructor(x, y, width, height) {
        // Validate parameters
        ValidationHelpers.validateType(x, 'number', 'x', 0);
        ValidationHelpers.validateType(y, 'number', 'y', 0);
        ValidationHelpers.validatePositiveNumber(width, 'width');
        ValidationHelpers.validatePositiveNumber(height, 'height');

        this.position = { x, y };
        this.size = { width, height };
        this.visible = true;
        this.enabled = true;
        this.focused = false;
        this.hovered = false;
        this.clicked = false;
        
        this.style = {
            backgroundColor: '#333333',
            borderColor: '#666666',
            borderWidth: 2,
            borderRadius: 4,
            textColor: '#ffffff',
            font: '16px monospace',
            padding: 8,
            margin: 4
        };
        
        this.parent = null;
        this.children = [];
        this.events = new Map();
        
        this.animation = null;
        this.dirty = true; // Needs redraw
    }

    update(deltaTime) {
        if (!this.visible) return;
        
        // Update animation
        if (this.animation) {
            this.animation.update(deltaTime);
        }
        
        // Update children
        this.children.forEach(child => {
            child.update(deltaTime);
        });
    }

    render(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        
        // Apply position
        ctx.translate(this.position.x, this.position.y);
        
        // Render background
        this.renderBackground(ctx);
        
        // Render content (override in subclasses)
        this.renderContent(ctx);
        
        // Render border
        this.renderBorder(ctx);
        
        // Render children
        this.children.forEach(child => {
            child.render(ctx);
        });
        
        ctx.restore();
        
        this.dirty = false;
    }

    renderBackground(ctx) {
        if (this.style.backgroundColor) {
            ctx.fillStyle = this.style.backgroundColor;
            if (this.style.borderRadius > 0) {
                this.roundedRect(ctx, 0, 0, this.size.width, this.size.height, this.style.borderRadius);
                ctx.fill();
            } else {
                ctx.fillRect(0, 0, this.size.width, this.size.height);
            }
        }
    }

    renderBorder(ctx) {
        if (this.style.borderWidth > 0 && this.style.borderColor) {
            ctx.strokeStyle = this.style.borderColor;
            ctx.lineWidth = this.style.borderWidth;
            
            if (this.style.borderRadius > 0) {
                this.roundedRect(ctx, 0, 0, this.size.width, this.size.height, this.style.borderRadius);
                ctx.stroke();
            } else {
                ctx.strokeRect(0, 0, this.size.width, this.size.height);
            }
        }
    }

    renderContent(ctx) {
        // Override in subclasses
    }

    roundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Event handling
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                callback(data, this);
            });
        }
    }

    // Input handling (enhanced for touch)
    handleInput(inputManager) {
        if (!this.visible || !this.enabled) return false;

        let handled = false;

        // Handle mouse input (desktop)
        const mouse = inputManager.getMousePosition();
        const bounds = this.getBounds();

        const wasHovered = this.hovered;
        this.hovered = this.pointInBounds(mouse.x, mouse.y, bounds);

        if (this.hovered && !wasHovered) {
            this.emit('mouseenter');
        } else if (!this.hovered && wasHovered) {
            this.emit('mouseleave');
        }

        if (this.hovered) {
            if (inputManager.isMousePressed(0)) {
                this.clicked = true;
                this.focused = true;
                this.emit('mousedown');
                handled = true;
            }

            if (inputManager.isMouseReleased(0) && this.clicked) {
                this.clicked = false;
                this.emit('click');
                handled = true;
            }
        }

        if (inputManager.isMouseReleased(0)) {
            this.clicked = false;
        }

        // Handle touch input (mobile)
        const touches = inputManager.getTouches();
        if (touches.length > 0) {
            const touch = touches[0]; // Primary touch
            const touchInBounds = this.pointInBounds(touch.x, touch.y, bounds);

            if (touchInBounds) {
                if (inputManager.isTouchPressed(touch.id)) {
                    this.clicked = true;
                    this.focused = true;
                    this.emit('touchstart');
                    handled = true;
                }

                if (inputManager.isTouchReleased(touch.id) && this.clicked) {
                    this.clicked = false;
                    this.emit('touchend');
                    this.emit('click'); // Treat touch release as click
                    handled = true;
                }
            }
        }

        // Handle gestures
        if (inputManager.isSwiped()) {
            const swipe = inputManager.getSwipeGesture();
            if (this.pointInBounds(swipe.start.x, swipe.start.y, bounds)) {
                this.emit('swipe', swipe);
                handled = true;
            }
        }

        return handled;
    }

    getBounds() {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.size.width,
            height: this.size.height
        };
    }

    pointInBounds(x, y, bounds) {
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }

    // Hierarchy
    addChild(child) {
        if (!this.children.includes(child)) {
            this.children.push(child);
            child.parent = this;
        }
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    setStyle(properties) {
        Object.assign(this.style, properties);
        this.dirty = true;
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.dirty = true;
    }

    setSize(width, height) {
        this.size.width = width;
        this.size.height = height;
        this.dirty = true;
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}

class Button extends UIComponent {
    constructor(x, y, width, height, text = '') {
        super(x, y, width, height);
        this.text = text;
        this.textAlign = 'center';
        this.textBaseline = 'middle';
        
        // Button-specific styling inspired by both games
        this.style = {
            ...this.style,
            backgroundColor: '#d62828',
            borderColor: '#ffd700',
            borderWidth: 3,
            borderRadius: 8,
            textColor: '#ffffff',
            font: 'bold 16px monospace',
            hoverBackgroundColor: '#ff0000',
            clickBackgroundColor: '#8b0000',
            disabledBackgroundColor: '#444444',
            disabledTextColor: '#666666'
        };
    }

    renderContent(ctx) {
        // Determine colors based on state
        let bgColor = this.style.backgroundColor;
        let textColor = this.style.textColor;
        
        if (!this.enabled) {
            bgColor = this.style.disabledBackgroundColor;
            textColor = this.style.disabledTextColor;
        } else if (this.clicked) {
            bgColor = this.style.clickBackgroundColor;
        } else if (this.hovered) {
            bgColor = this.style.hoverBackgroundColor;
        }
        
        // Update background color
        if (bgColor !== this.style.backgroundColor) {
            ctx.fillStyle = bgColor;
            if (this.style.borderRadius > 0) {
                this.roundedRect(ctx, 0, 0, this.size.width, this.size.height, this.style.borderRadius);
                ctx.fill();
            } else {
                ctx.fillRect(0, 0, this.size.width, this.size.height);
            }
        }
        
        // Render text
        if (this.text) {
            ctx.fillStyle = textColor;
            ctx.font = this.style.font;
            ctx.textAlign = this.textAlign;
            ctx.textBaseline = this.textBaseline;
            
            const textX = this.textAlign === 'center' ? this.size.width / 2 : this.style.padding;
            const textY = this.textBaseline === 'middle' ? this.size.height / 2 : this.style.padding;
            
            // Add text shadow for retro effect
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            ctx.fillText(this.text, textX, textY);
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    }

    setText(text) {
        this.text = text;
        this.dirty = true;
    }
}

class Label extends UIComponent {
    constructor(x, y, text = '', font = '16px monospace') {
        super(x, y, 0, 0);
        this.text = text;
        this.textAlign = 'left';
        this.textBaseline = 'top';
        
        this.style = {
            ...this.style,
            backgroundColor: 'transparent',
            borderWidth: 0,
            textColor: '#ffffff',
            font: font
        };
        
        this.autoSize = true;
    }

    renderContent(ctx) {
        if (this.text) {
            ctx.fillStyle = this.style.textColor;
            ctx.font = this.style.font;
            ctx.textAlign = this.textAlign;
            ctx.textBaseline = this.textBaseline;
            
            // Auto-size if enabled
            if (this.autoSize) {
                const metrics = ctx.measureText(this.text);
                this.size.width = metrics.width;
                this.size.height = parseInt(this.style.font) || 16;
            }
            
            ctx.fillText(this.text, this.style.padding, this.style.padding);
        }
    }

    setText(text) {
        this.text = text;
        this.dirty = true;
    }
}

class ProgressBar extends UIComponent {
    constructor(x, y, width, height, min = 0, max = 100) {
        super(x, y, width, height);
        this.min = min;
        this.max = max;
        this.value = min;
        this.showText = true;
        
        this.style = {
            ...this.style,
            backgroundColor: '#333333',
            borderColor: '#ffd700',
            borderWidth: 2,
            fillColor: '#00ff00',
            fillGradient: true,
            textColor: '#ffffff',
            font: 'bold 14px monospace'
        };
    }

    renderContent(ctx) {
        const progress = (this.value - this.min) / (this.max - this.min);
        const fillWidth = (this.size.width - this.style.padding * 2) * progress;
        
        // Render fill
        if (fillWidth > 0) {
            if (this.style.fillGradient) {
                const gradient = ctx.createLinearGradient(
                    this.style.padding, 0,
                    this.style.padding + fillWidth, 0
                );
                gradient.addColorStop(0, '#00ff00');
                gradient.addColorStop(0.5, '#ffff00');
                gradient.addColorStop(1, '#ff0000');
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = this.style.fillColor;
            }
            
            ctx.fillRect(
                this.style.padding,
                this.style.padding,
                fillWidth,
                this.size.height - this.style.padding * 2
            );
        }
        
        // Render text
        if (this.showText) {
            ctx.fillStyle = this.style.textColor;
            ctx.font = this.style.font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                `${Math.round(progress * 100)}%`,
                this.size.width / 2,
                this.size.height / 2
            );
        }
    }

    setValue(value) {
        this.value = Math.max(this.min, Math.min(this.max, value));
        this.dirty = true;
    }

    setRange(min, max) {
        this.min = min;
        this.max = max;
        this.setValue(this.value); // Clamp current value
    }
}

class Panel extends UIComponent {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        
        this.style = {
            ...this.style,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderColor: '#ffd700',
            borderWidth: 2,
            borderRadius: 8
        };
    }

    renderContent(ctx) {
        // Panels don't have content by default, just background and border
    }
}

class HUD extends UIComponent {
    constructor(engine, uiManager = null) {
        super(0, 0, 0, 0);
        this.engine = engine;
        this.uiManager = uiManager;
        this.elements = new Map();

        // Make HUD cover entire screen
        this.size.width = engine.canvas.width;
        this.size.height = engine.canvas.height;

        this.style.backgroundColor = 'transparent';
        this.style.borderWidth = 0;
    }

    addElement(id, element) {
        this.elements.set(id, element);
        this.addChild(element);
    }

    getElement(id) {
        return this.elements.get(id);
    }

    removeElement(id) {
        const element = this.elements.get(id);
        if (element) {
            this.removeChild(element);
            this.elements.delete(id);
        }
    }

    update(deltaTime) {
        // Update size if canvas size changed
        if (this.engine.canvas) {
            this.size.width = this.engine.canvas.width;
            this.size.height = this.engine.canvas.height;
        }
        
        super.update(deltaTime);
    }

    createStatsDisplay(stats) {
        const statElements = [];
        let y = 20;
        
        Object.entries(stats).forEach(([key, value]) => {
            const label = new Label(20, y, `${key.toUpperCase()}: ${value}`, 'bold 18px monospace');
            label.style.textColor = '#ffd700';
            this.addElement(`stat_${key}`, label);
            statElements.push(label);
            y += 30;
        });
        
        return statElements;
    }

    updateStat(statName, value) {
        const element = this.getElement(`stat_${statName}`);
        if (element) {
            element.setText(`${statName.toUpperCase()}: ${value}`);
            // Announce stat updates for accessibility
            if (this.uiManager) {
                this.uiManager.announceToScreenReader(`${statName} updated to ${value}`);
            }
        }
    }
}

class UIManager {
    constructor(engine) {
        // Validate parameter
        ValidationHelpers.validateObject(engine, [], 'engine');

        this.engine = engine;
        this.components = new Map(); // Optimized for faster lookups
        this.componentList = []; // Keep array for ordered iteration
        this.focusedComponent = null;
        this.hud = null;
        this.modalStack = [];
        
        this.themes = {
            default: {
                primaryColor: '#d62828',
                secondaryColor: '#ffd700',
                backgroundColor: '#333333',
                textColor: '#ffffff',
                borderColor: '#666666'
            },
            neon: {
                primaryColor: '#ff206e',
                secondaryColor: '#05d9e8',
                backgroundColor: '#0a0a0a',
                textColor: '#ffffff',
                borderColor: '#00f593'
            },
            retro: {
                primaryColor: '#ff8000',
                secondaryColor: '#ffff00',
                backgroundColor: '#1a1a2e',
                textColor: '#ffffff',
                borderColor: '#ff9900'
            }
        };
        
        this.currentTheme = 'default';

        // Mobile-specific properties
        this.isMobile = this.detectMobile();
        this.touchScale = this.isMobile ? 1.2 : 1; // Scale UI elements for touch
        this.mobileLayout = this.isMobile;

        // Accessibility features
        this.setupAccessibility();
    }

    setupAccessibility() {
        // Create ARIA live regions for dynamic content
        this.createLiveRegions();

        // Initialize accessibility state
        this.accessibility = {
            announcementsEnabled: true,
            highContrastMode: false,
            reducedMotion: false
        };

        // Detect user preferences
        this.detectUserPreferences();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && window.innerHeight <= 1024) ||
               ('ontouchstart' in window && window.innerWidth <= 1024);
    }

    // Mobile UI adjustments
    enableMobileLayout() {
        this.mobileLayout = true;
        this.touchScale = 1.2;

        // Adjust button sizes for touch
        this.componentList.forEach(component => {
            if (component instanceof Button) {
                component.setSize(
                    Math.max(component.size.width, 44),
                    Math.max(component.size.height, 44)
                );
            }
        });

        // Reposition UI elements for mobile
        this.repositionForMobile();

        this.announceToScreenReader('Mobile layout enabled', 'polite');
    }

    disableMobileLayout() {
        this.mobileLayout = false;
        this.touchScale = 1;

        // Reset button sizes
        this.componentList.forEach(component => {
            if (component instanceof Button) {
                component.setSize(
                    Math.max(component.size.width / 1.2, 32),
                    Math.max(component.size.height / 1.2, 32)
                );
            }
        });

        this.announceToScreenReader('Desktop layout enabled', 'polite');
    }

    repositionForMobile() {
        // Reposition UI elements for better mobile UX
        // Move HUD elements to more accessible positions
        if (this.hud) {
            // Adjust HUD for mobile - move elements to edges, increase spacing
            this.hud.children.forEach((element, index) => {
                if (this.isMobile) {
                    // Stack vertically on mobile
                    element.setPosition(10, 10 + index * 50);
                } else {
                    // Spread out on desktop
                    element.setPosition(10 + index * 120, 10);
                }
            });
        }
    }

    // Touch-friendly dialog system
    createMobileDialog(options = {}) {
        const dialog = new Panel(
            this.isMobile ? 10 : 100,
            this.isMobile ? 10 : 100,
            this.isMobile ? window.innerWidth - 20 : 400,
            this.isMobile ? window.innerHeight - 20 : 300
        );

        dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        dialog.style.borderColor = this.themes[this.currentTheme].secondaryColor;
        dialog.style.borderRadius = this.isMobile ? 8 : 12;

        // Add close button that's easy to tap
        const closeBtn = new Button(
            dialog.size.width - 50,
            10,
            40, 40,
            '×'
        );
        closeBtn.style.font = 'bold 24px monospace';
        closeBtn.on('click', () => this.removeComponent(dialog));
        dialog.addChild(closeBtn);

        // Add content area
        if (options.title) {
            const title = new Label(10, 60, options.title, 'bold 18px monospace');
            title.style.textColor = this.themes[this.currentTheme].secondaryColor;
            dialog.addChild(title);
        }

        if (options.content) {
            const content = new Label(10, 90, options.content, '14px monospace');
            content.autoSize = false;
            content.setSize(dialog.size.width - 20, dialog.size.height - 120);
            dialog.addChild(content);
        }

        // Add action buttons
        if (options.actions) {
            options.actions.forEach((action, index) => {
                const btn = new Button(
                    10 + index * 120,
                    dialog.size.height - 50,
                    100, 40,
                    action.text
                );
                btn.on('click', () => {
                    action.callback();
                    this.removeComponent(dialog);
                });
                dialog.addChild(btn);
            });
        }

        // Swipe to dismiss on mobile
        dialog.on('swipe', (swipeData) => {
            if (swipeData.direction === 'down' && this.isMobile) {
                this.removeComponent(dialog);
            }
        });

        return dialog;
    }

    createLiveRegions() {
        // Create assertive live region for critical announcements
        if (!document.getElementById('ui-assertive-live-region')) {
            const assertiveRegion = document.createElement('div');
            assertiveRegion.id = 'ui-assertive-live-region';
            assertiveRegion.setAttribute('aria-live', 'assertive');
            assertiveRegion.setAttribute('aria-atomic', 'true');
            assertiveRegion.style.position = 'absolute';
            assertiveRegion.style.left = '-10000px';
            assertiveRegion.style.width = '1px';
            assertiveRegion.style.height = '1px';
            assertiveRegion.style.overflow = 'hidden';
            document.body.appendChild(assertiveRegion);
        }

        // Create polite live region for general announcements
        if (!document.getElementById('ui-polite-live-region')) {
            const politeRegion = document.createElement('div');
            politeRegion.id = 'ui-polite-live-region';
            politeRegion.setAttribute('aria-live', 'polite');
            politeRegion.setAttribute('aria-atomic', 'true');
            politeRegion.style.position = 'absolute';
            politeRegion.style.left = '-10000px';
            politeRegion.style.width = '1px';
            politeRegion.style.height = '1px';
            politeRegion.style.overflow = 'hidden';
            document.body.appendChild(politeRegion);
        }
    }

    detectUserPreferences() {
        // Detect high contrast preference
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            this.accessibility.highContrastMode = true;
            this.enableHighContrastMode();
        }

        // Detect reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.accessibility.reducedMotion = true;
            this.enableReducedMotion();
        }

        // Listen for preference changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
                this.accessibility.highContrastMode = e.matches;
                if (e.matches) {
                    this.enableHighContrastMode();
                } else {
                    this.disableHighContrastMode();
                }
            });

            window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
                this.accessibility.reducedMotion = e.matches;
                if (e.matches) {
                    this.enableReducedMotion();
                } else {
                    this.disableReducedMotion();
                }
            });
        }
    }

    enableHighContrastMode() {
        // Apply high contrast styles to canvas and UI elements
        const canvas = this.engine.canvas;
        if (canvas) {
            canvas.style.filter = 'contrast(1.5)';
        }
        this.announceToScreenReader('High contrast mode enabled', 'assertive');
    }

    disableHighContrastMode() {
        const canvas = this.engine.canvas;
        if (canvas) {
            canvas.style.filter = 'none';
        }
        this.announceToScreenReader('High contrast mode disabled', 'assertive');
    }

    enableReducedMotion() {
        // Disable animations and transitions
        this.announceToScreenReader('Reduced motion mode enabled', 'assertive');
    }

    disableReducedMotion() {
        // Re-enable animations and transitions
        this.announceToScreenReader('Reduced motion mode disabled', 'assertive');
    }

    announceToScreenReader(message, priority = 'polite') {
        if (!this.accessibility.announcementsEnabled) return;

        const regionId = priority === 'assertive' ? 'ui-assertive-live-region' : 'ui-polite-live-region';
        const liveRegion = document.getElementById(regionId);

        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    announceUIStateChange(component, state, details = '') {
        let message = `${component} `;
        switch (state) {
            case 'shown':
                message += 'appeared';
                break;
            case 'hidden':
                message += 'disappeared';
                break;
            case 'enabled':
                message += 'enabled';
                break;
            case 'disabled':
                message += 'disabled';
                break;
            case 'focused':
                message += 'focused';
                break;
            case 'selected':
                message += 'selected';
                break;
            default:
                message += state;
        }

        if (details) {
            message += `: ${details}`;
        }

        this.announceToScreenReader(message);
    }

    announceProgressUpdate(componentId, current, total, label = '') {
        const percentage = Math.round((current / total) * 100);
        const message = `${componentId} progress: ${current} of ${total}${label ? ` ${label}` : ''}, ${percentage}% complete`;
        this.announceToScreenReader(message);
    }

    announceError(message) {
        this.announceToScreenReader(`Error: ${message}`, 'assertive');
    }

    announceSuccess(message) {
        this.announceToScreenReader(`Success: ${message}`, 'polite');
    }

    update(deltaTime) {
        // Update all components
        this.componentList.forEach(component => {
            component.update(deltaTime);
        });
        
        // Update HUD
        if (this.hud) {
            this.hud.update(deltaTime);
        }
        
        // Update modals
        this.modalStack.forEach(modal => {
            modal.update(deltaTime);
        });
    }

    render(ctx) {
        // Apply mobile scaling if needed
        if (this.touchScale !== 1) {
            ctx.save();
            ctx.scale(this.touchScale, this.touchScale);
            ctx.translate(
                (1 - this.touchScale) * ctx.canvas.width / 2 / this.touchScale,
                (1 - this.touchScale) * ctx.canvas.height / 2 / this.touchScale
            );
        }

        // Render components
        this.componentList.forEach(component => {
            component.render(ctx);
        });

        // Render HUD on top
        if (this.hud) {
            this.hud.render(ctx);
        }

        // Render modals on top of everything
        this.modalStack.forEach(modal => {
            modal.render(ctx);
        });

        if (this.touchScale !== 1) {
            ctx.restore();
        }
    }

    handleInput(inputManager) {
        let handled = false;
        
        // Handle modals first (they have priority)
        for (let i = this.modalStack.length - 1; i >= 0; i--) {
            if (this.modalStack[i].handleInput(inputManager)) {
                handled = true;
                break;
            }
        }
        
        if (!handled && this.hud) {
            handled = this.hud.handleInput(inputManager);
        }
        
        if (!handled) {
            for (let i = this.componentList.length - 1; i >= 0; i--) {
                if (this.componentList[i].handleInput(inputManager)) {
                    break;
                }
            }
        }
    }

    addComponent(component, id = null) {
        const componentId = id || ('component_' + Math.random().toString(36).substr(2, 9));
        if (!this.components.has(componentId)) {
            this.components.set(componentId, component);
            this.componentList.push(component);
            component._uiId = componentId; // Store ID for removal
        }
        return componentId;
    }

    removeComponent(component) {
        const componentId = component._uiId;
        if (componentId && this.components.has(componentId)) {
            this.components.delete(componentId);
            const index = this.componentList.indexOf(component);
            if (index > -1) {
                this.componentList.splice(index, 1);
            }
        }
    }

    getComponent(id) {
        return this.components.get(id);
    }

    createHUD() {
        this.hud = new HUD(this.engine, this);
        return this.hud;
    }

    showModal(modal) {
        this.modalStack.push(modal);
    }

    hideModal(modal) {
        const index = this.modalStack.indexOf(modal);
        if (index > -1) {
            this.modalStack.splice(index, 1);
        }
    }

    hideTopModal() {
        if (this.modalStack.length > 0) {
            this.modalStack.pop();
        }
    }

    clearModals() {
        this.modalStack = [];
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.applyThemeToComponents();
        }
    }

    // Cleanup method for memory leak prevention
    destroy() {
        // Clear all timeouts
        this.componentList.forEach(component => {
            if (component.timeoutId) {
                clearTimeout(component.timeoutId);
            }
        });

        // Clear collections
        this.components.clear();
        this.componentList = [];
        this.modalStack = [];

        // Destroy HUD
        if (this.hud) {
            this.hud.destroy();
            this.hud = null;
        }

        // Clean up accessibility live regions
        const assertiveRegion = document.getElementById('ui-assertive-live-region');
        if (assertiveRegion) {
            assertiveRegion.remove();
        }

        const politeRegion = document.getElementById('ui-polite-live-region');
        if (politeRegion) {
            politeRegion.remove();
        }

        console.log('UIManager destroyed and cleaned up');
    }

    applyThemeToComponents() {
        const theme = this.themes[this.currentTheme];
        
        const applyTheme = (component) => {
            if (component instanceof Button) {
                component.setStyle({
                    backgroundColor: theme.primaryColor,
                    borderColor: theme.secondaryColor,
                    textColor: theme.textColor
                });
            } else if (component instanceof Panel) {
                component.setStyle({
                    backgroundColor: theme.backgroundColor,
                    borderColor: theme.secondaryColor
                });
            }
            
            // Apply to children recursively
            component.children.forEach(applyTheme);
        };
        
        this.componentList.forEach(applyTheme);
        if (this.hud) {
            this.hud.children.forEach(applyTheme);
        }
    }

    // Factory methods for common UI patterns
    createMenu(title, items, x, y) {
        const menu = new Panel(x, y, 300, 60 + items.length * 50);
        
        // Title
        const titleLabel = new Label(10, 10, title, 'bold 24px monospace');
        titleLabel.style.textColor = this.themes[this.currentTheme].secondaryColor;
        menu.addChild(titleLabel);
        
        // Menu items
        items.forEach((item, index) => {
            const button = new Button(20, 50 + index * 50, 260, 40, item.text);
            button.on('click', item.callback);
            menu.addChild(button);
        });
        
        return menu;
    }

    createNotification(text, duration = 3000, type = 'info') {
        const colors = {
            info: '#05d9e8',
            success: '#00f593',
            warning: '#ffff00',
            error: '#ff206e'
        };

        const typeLabels = {
            info: 'Information',
            success: 'Success',
            warning: 'Warning',
            error: 'Error'
        };

        const notification = new Panel(
            this.engine.canvas.width - 320,
            20,
            300,
            80
        );

        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        notification.style.borderColor = colors[type];

        // Add accessibility attributes
        notification.accessibility = {
            role: 'alert',
            ariaLive: 'assertive',
            ariaLabel: `${typeLabels[type]} notification: ${text}`
        };

        const label = new Label(10, 10, text, '14px monospace');
        label.style.textColor = colors[type];
        notification.addChild(label);

        const notificationId = this.addComponent(notification);

        // Announce notification to screen readers
        this.announceToScreenReader(`${typeLabels[type]}: ${text}`, 'assertive');

        // Store timeout for cleanup
        notification.timeoutId = setTimeout(() => {
            if (this.components.has(notificationId)) {
                this.removeComponent(notification);
                this.announceToScreenReader(`${typeLabels[type]} notification dismissed`);
            }
        }, duration);

        return notification;
    }
}

class InputField extends UIComponent {
    constructor(x, y, width, height, placeholder = '') {
        super(x, y, width, height);
        this.text = '';
        this.placeholder = placeholder;
        this.cursorPosition = 0;
        this.selectionStart = this.cursorPosition;
        this.selectionEnd = this.cursorPosition;
        this.maxLength = 100;
        this.cursorVisible = true;
        this.cursorBlinkRate = 500; // ms
        this.lastBlinkTime = 0;

        this.style = {
            ...this.style,
            backgroundColor: '#222222',
            borderColor: '#666666',
            borderWidth: 2,
            borderRadius: 4,
            textColor: '#ffffff',
            font: '16px monospace',
            padding: 8
        };

        this.on('focus', () => {
            this.cursorVisible = true;
            this.lastBlinkTime = Date.now();
        });

        this.on('blur', () => {
            this.cursorVisible = false;
        });
    }

    update(deltaTime) {
        if (this.focused) {
            const now = Date.now();
            if (now - this.lastBlinkTime > this.cursorBlinkRate) {
                this.cursorVisible = !this.cursorVisible;
                this.lastBlinkTime = now;
            }
        }
    }

    renderContent(ctx) {
        ctx.fillStyle = this.style.textColor;
        ctx.font = this.style.font;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const displayText = this.text || this.placeholder;
        const isPlaceholder = !this.text;
        ctx.fillStyle = isPlaceholder ? '#888888' : this.style.textColor;
        ctx.fillText(displayText, this.style.padding, this.size.height / 2);

        if (this.focused && this.cursorVisible && !isPlaceholder) {
            // Draw cursor
            const textBeforeCursor = this.text.substring(0, this.cursorPosition);
            const cursorX = this.style.padding + ctx.measureText(textBeforeCursor).width;
            ctx.fillStyle = this.style.textColor;
            ctx.fillRect(cursorX, this.style.padding, 2, this.size.height - 2 * this.style.padding);
        }
    }

    handleInput(inputManager) {
        if (!this.visible || !this.enabled) return false;

        // Handle mouse for focus
        const mouseHandled = super.handleInput(inputManager);

        if (this.focused) {
            // Handle keyboard input
            // Assuming inputManager provides typed characters and key presses
            if (inputManager.getTypedChars) {
                const typed = inputManager.getTypedChars();
                if (typed) {
                    this.insertText(typed);
                }
            }

            // Handle special keys
            if (inputManager.isKeyPressed('Backspace')) {
                this.backspace();
            } else if (inputManager.isKeyPressed('Enter')) {
                this.emit('submit', this.text);
            } else if (inputManager.isKeyPressed('Escape')) {
                this.blur();
            }
        }

        return mouseHandled || this.focused;
    }

    insertText(text) {
        if (this.text.length + text.length > this.maxLength) {
            text = text.substring(0, this.maxLength - this.text.length);
        }
        this.text = this.text.substring(0, this.cursorPosition) + text + this.text.substring(this.cursorPosition);
        this.cursorPosition += text.length;
        this.dirty = true;
    }

    backspace() {
        if (this.cursorPosition > 0) {
            this.text = this.text.substring(0, this.cursorPosition - 1) + this.text.substring(this.cursorPosition);
            this.cursorPosition--;
            this.dirty = true;
        }
    }

    setText(text) {
        this.text = text.substring(0, this.maxLength);
        this.cursorPosition = this.text.length;
        this.dirty = true;
    }

    blur() {
        this.focused = false;
        this.emit('blur');
    }
}

class MenuManager extends UIComponent {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.menus = []; // Stack of menu objects: {title, items: [{text, callback, submenu}]}
        this.selectedIndex = 0;
        this.currentMenu = null;

        this.style = {
            ...this.style,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#ffd700',
            borderWidth: 2,
            borderRadius: 8,
            textColor: '#ffffff',
            font: '16px monospace',
            padding: 10
        };
    }

    pushMenu(menu) {
        this.menus.push(menu);
        this.currentMenu = menu;
        this.selectedIndex = 0;
        this.dirty = true;
    }

    popMenu() {
        if (this.menus.length > 1) {
            this.menus.pop();
            this.currentMenu = this.menus[this.menus.length - 1];
            this.selectedIndex = Math.min(this.selectedIndex, this.currentMenu.items.length - 1);
            this.dirty = true;
        }
    }

    update(deltaTime) {
        // Could add animations here if needed
    }

    renderContent(ctx) {
        if (!this.currentMenu) return;

        // Render title
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(this.currentMenu.title, this.style.padding, this.style.padding + 10);

        // Render menu items
        ctx.font = this.style.font;
        this.currentMenu.items.forEach((item, index) => {
            const y = this.style.padding + 40 + index * 30;
            const isSelected = index === this.selectedIndex;
            ctx.fillStyle = isSelected ? '#ffff00' : this.style.textColor;
            ctx.fillText(item.text, this.style.padding + 20, y);
        });
    }

    handleInput(inputManager) {
        if (!this.currentMenu) return false;

        let handled = false;

        if (inputManager.isKeyPressed('ArrowDown')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.currentMenu.items.length;
            handled = true;
        } else if (inputManager.isKeyPressed('ArrowUp')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.currentMenu.items.length) % this.currentMenu.items.length;
            handled = true;
        } else if (inputManager.isKeyPressed('Enter')) {
            const item = this.currentMenu.items[this.selectedIndex];
            if (item.callback) {
                item.callback();
            }
            if (item.submenu) {
                this.pushMenu(item.submenu);
            }
            handled = true;
        } else if (inputManager.isKeyPressed('Escape')) {
            this.popMenu();
            handled = true;
        }

        this.dirty = handled;
        return handled;
    }

    setMenu(menu) {
        this.menus = [menu];
        this.currentMenu = menu;
        this.selectedIndex = 0;
        this.dirty = true;
    }
}

export { UIManager, UIComponent, Button, Label, ProgressBar, Panel, HUD, InputField, MenuManager };
