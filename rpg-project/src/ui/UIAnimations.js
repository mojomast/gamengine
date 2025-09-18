/**
 * UI Animations and Effects
 * Predefined animation patterns and responsive scaling utilities for RPG UI
 */

import { AnimationManager } from '../../../game-engine/src/effects/AnimationManager.js';

export class UIAnimations {
    constructor(animationManager) {
        this.animationManager = animationManager;
    }

    // Menu transition animations
    slideInMenu(menu, direction = 'right', duration = 400) {
        const startX = direction === 'right' ? -menu.size.width : menu.size.width;
        menu.setPosition(startX, menu.position.y);

        return this.animationManager.to(menu, {
            'position.x': 0
        }, duration, {
            easing: AnimationManager.Easing.easeOutQuad
        });
    }

    slideOutMenu(menu, direction = 'right', duration = 400, callback) {
        const endX = direction === 'right' ? menu.size.width : -menu.size.width;

        return this.animationManager.to(menu, {
            'position.x': endX
        }, duration, {
            easing: AnimationManager.Easing.easeInQuad,
            onComplete: callback
        });
    }

    fadeInMenu(menu, duration = 300) {
        menu.alpha = 0;
        return this.animationManager.to(menu, {
            alpha: 1
        }, duration, {
            easing: AnimationManager.Easing.easeOutQuad
        });
    }

    fadeOutMenu(menu, duration = 300, callback) {
        return this.animationManager.to(menu, {
            alpha: 0
        }, duration, {
            easing: AnimationManager.Easing.easeInQuad,
            onComplete: callback
        });
    }

    // Button interactions
    buttonPress(button, callback) {
        return this.animationManager.to(button, {
            'scale.x': 0.95,
            'scale.y': 0.95
        }, 100, {
            yoyo: true,
            easing: AnimationManager.Easing.easeInOutQuad,
            onComplete: callback
        });
    }

    buttonHover(button) {
        return this.animationManager.to(button, {
            'scale.x': 1.05,
            'scale.y': 1.05
        }, 200, {
            easing: AnimationManager.Easing.easeOutQuad
        });
    }

    buttonUnhover(button) {
        return this.animationManager.to(button, {
            'scale.x': 1.0,
            'scale.y': 1.0
        }, 200, {
            easing: AnimationManager.Easing.easeOutQuad
        });
    }

    // Health/mana bar animations
    animateStatBar(bar, fromValue, toValue, duration = 800) {
        return this.animationManager.fromTo(bar, {
            value: fromValue
        }, {
            value: toValue
        }, duration, {
            easing: AnimationManager.Easing.easeOutQuad
        });
    }

    // Damage/healing numbers
    animateDamageNumber(number, startY, endY, duration = 1000) {
        return this.animationManager.fromTo(number, {
            y: startY,
            alpha: 1,
            scale: 1.5
        }, {
            y: endY,
            alpha: 0,
            scale: 1.0
        }, duration, {
            easing: AnimationManager.Easing.easeOutQuad
        });
    }

    // UI element focus animations
    focusElement(element) {
        return this.animationManager.to(element, {
            'style.borderWidth': 3
        }, 200, {
            easing: AnimationManager.Easing.easeOutQuad
        });
    }

    unfocusElement(element) {
        return this.animationManager.to(element, {
            'style.borderWidth': 2
        }, 200, {
            easing: AnimationManager.Easing.easeOutQuad
        });
    }

    // Pulsing animations for important elements
    pulseElement(element, minScale = 0.95, maxScale = 1.05, duration = 1000) {
        return this.animationManager.to(element, {
            'scale.x': maxScale,
            'scale.y': maxScale
        }, duration, {
            repeat: -1,
            yoyo: true,
            easing: AnimationManager.Easing.easeInOutQuad
        });
    }

    // Screen shake for impactful events
    shakeUI(element, intensity = 5, duration = 200) {
        const originalX = element.position.x;
        const originalY = element.position.y;

        return this.animationManager.sequence(element, [
            { 'position.x': originalX + intensity, duration: duration / 4 },
            { 'position.x': originalX - intensity, duration: duration / 4 },
            { 'position.x': originalX + intensity / 2, duration: duration / 4 },
            { 'position.x': originalX, duration: duration / 4 }
        ]);
    }

    // Transition effects for scene changes
    fadeToBlack(overlay, duration = 500, callback) {
        overlay.alpha = 0;
        overlay.visible = true;

        return this.animationManager.to(overlay, {
            alpha: 1
        }, duration, {
            easing: AnimationManager.Easing.linear,
            onComplete: callback
        });
    }

    fadeFromBlack(overlay, duration = 500, callback) {
        overlay.alpha = 1;
        overlay.visible = true;

        return this.animationManager.to(overlay, {
            alpha: 0
        }, duration, {
            easing: AnimationManager.Easing.linear,
            onComplete: () => {
                overlay.visible = false;
                if (callback) callback();
            }
        });
    }

    // Staggered animations for lists
    staggerFadeIn(elements, staggerDelay = 100, totalDuration = 500) {
        const individualDuration = totalDuration / elements.length;

        elements.forEach((element, index) => {
            element.alpha = 0;
            this.animationManager.to(element, {
                alpha: 1
            }, individualDuration, {
                delay: index * staggerDelay,
                easing: AnimationManager.Easing.easeOutQuad
            });
        });
    }

    // Bounce animation for notifications
    bounceIn(element, callback) {
        element.scale = { x: 0.3, y: 0.3 };
        element.alpha = 0;

        return this.animationManager.sequence(element, [
            { 'scale.x': 1.05, 'scale.y': 1.05, alpha: 1, duration: 300, easing: AnimationManager.Easing.easeOutQuad },
            { 'scale.x': 0.95, 'scale.y': 0.95, duration: 150, easing: AnimationManager.Easing.easeInOutQuad },
            { 'scale.x': 1.0, 'scale.y': 1.0, duration: 100, easing: AnimationManager.Easing.easeOutQuad }
        ], {
            onComplete: callback
        });
    }
}

export class UIResponsive {
    constructor(engine) {
        this.engine = engine;
        this.currentScale = 1.0;
        this.baseWidth = 800;
        this.baseHeight = 600;
        this.minScale = 0.5;
        this.maxScale = 2.0;
    }

    updateScale() {
        const canvas = this.engine.canvas;
        if (!canvas) return;

        const scaleX = canvas.width / this.baseWidth;
        const scaleY = canvas.height / this.baseHeight;
        this.currentScale = Math.min(scaleX, scaleY);
        this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, this.currentScale));
    }

    getScale() {
        return this.currentScale;
    }

    scaleElement(element) {
        if (!element || !element.size) return;

        element.size.width = Math.floor(element.size.width * this.currentScale);
        element.size.height = Math.floor(element.size.height * this.currentScale);
        element.position.x = Math.floor(element.position.x * this.currentScale);
        element.position.y = Math.floor(element.position.y * this.currentScale);

        // Scale font sizes
        if (element.style && element.style.font) {
            const fontMatch = element.style.font.match(/(\d+)px/);
            if (fontMatch) {
                const baseSize = parseInt(fontMatch[1]);
                const newSize = Math.floor(baseSize * this.currentScale);
                element.style.font = element.style.font.replace(/\d+px/, newSize + 'px');
            }
        }

        // Recursively scale children
        if (element.children) {
            element.children.forEach(child => this.scaleElement(child));
        }

        element.dirty = true;
    }

    // Check if we're on a mobile device
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && window.innerHeight <= 1024);
    }

    // Apply mobile-specific scaling
    applyMobileScaling(element) {
        if (!this.isMobile()) return;

        const mobileScale = 1.2; // Slightly larger for touch

        if (element.size) {
            element.size.width = Math.floor(element.size.width * mobileScale);
            element.size.height = Math.floor(element.size.height * mobileScale);
        }

        // Ensure minimum touch target sizes
        if (element.size) {
            element.size.width = Math.max(element.size.width, 44);
            element.size.height = Math.max(element.size.height, 44);
        }

        element.dirty = true;
    }

    // Auto-arrange UI elements based on screen size
    autoArrange(elements, container, layout = 'grid') {
        if (!container || !elements.length) return;

        const padding = 10;
        const availableWidth = container.size.width - padding * 2;
        const availableHeight = container.size.height - padding * 2;

        switch (layout) {
            case 'grid':
                this.arrangeGrid(elements, availableWidth, availableHeight, padding);
                break;
            case 'list':
                this.arrangeList(elements, availableWidth, availableHeight, padding);
                break;
            case 'radial':
                this.arrangeRadial(elements, container, padding);
                break;
        }
    }

    arrangeGrid(elements, width, height, padding) {
        const cols = Math.ceil(Math.sqrt(elements.length));
        const rows = Math.ceil(elements.length / cols);

        const elementWidth = (width - (cols - 1) * padding) / cols;
        const elementHeight = (height - (rows - 1) * padding) / rows;

        elements.forEach((element, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;

            element.setPosition(
                padding + col * (elementWidth + padding),
                padding + row * (elementHeight + padding)
            );

            if (element.size) {
                element.setSize(elementWidth, elementHeight);
            }
        });
    }

    arrangeList(elements, width, height, padding) {
        const elementHeight = (height - (elements.length - 1) * padding) / elements.length;

        elements.forEach((element, index) => {
            element.setPosition(padding, padding + index * (elementHeight + padding));

            if (element.size) {
                element.setSize(width, elementHeight);
            }
        });
    }

    arrangeRadial(elements, container, padding) {
        const centerX = container.size.width / 2;
        const centerY = container.size.height / 2;
        const radius = Math.min(centerX, centerY) - padding - 30;

        const angleStep = (Math.PI * 2) / elements.length;

        elements.forEach((element, index) => {
            const angle = index * angleStep - Math.PI / 2; // Start from top
            const x = centerX + Math.cos(angle) * radius - element.size.width / 2;
            const y = centerY + Math.sin(angle) * radius - element.size.height / 2;

            element.setPosition(x, y);
        });
    }

    // Handle orientation changes
    handleOrientationChange() {
        setTimeout(() => {
            this.updateScale();
            // Re-arrange UI elements if needed
            // This would trigger a re-layout of all UI components
        }, 100);
    }

    // Get safe area insets (for notched devices)
    getSafeAreaInsets() {
        const style = getComputedStyle(document.documentElement);
        return {
            top: parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
            right: parseInt(style.getPropertyValue('env(safe-area-inset-right)')) || 0,
            bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
            left: parseInt(style.getPropertyValue('env(safe-area-inset-left)')) || 0
        };
    }

    // Apply safe area adjustments
    applySafeArea(element) {
        const insets = this.getSafeAreaInsets();

        if (element.position) {
            element.position.x += insets.left;
            element.position.y += insets.top;
        }

        element.dirty = true;
    }
}

// Performance optimizations for UI rendering
export class UIOptimizations {
    constructor() {
        this.dirtyElements = new Set();
        this.lastRenderTime = 0;
        this.maxFPS = 60;
        this.frameInterval = 1000 / this.maxFPS;
    }

    markDirty(element) {
        this.dirtyElements.add(element);
    }

    clearDirty(element) {
        this.dirtyElements.delete(element);
    }

    shouldRender() {
        const now = performance.now();
        if (now - this.lastRenderTime < this.frameInterval) {
            return false;
        }
        this.lastRenderTime = now;
        return true;
    }

    getDirtyElements() {
        return Array.from(this.dirtyElements);
    }

    clearAllDirty() {
        this.dirtyElements.clear();
    }

    // Batch UI updates for performance
    batchUpdate(updates) {
        // Group similar updates together
        const batchedUpdates = {};

        updates.forEach(update => {
            const type = update.type || 'default';
            if (!batchedUpdates[type]) {
                batchedUpdates[type] = [];
            }
            batchedUpdates[type].push(update);
        });

        // Execute batched updates
        Object.values(batchedUpdates).forEach(batch => {
            // Process each batch
            batch.forEach(update => update.execute());
        });
    }

    // Cull off-screen UI elements
    cullOffScreen(elements, viewport) {
        return elements.filter(element => {
            if (!element.position || !element.size) return true;

            return !(element.position.x + element.size.width < viewport.left ||
                   element.position.x > viewport.right ||
                   element.position.y + element.size.height < viewport.top ||
                   element.position.y > viewport.bottom);
        });
    }
}