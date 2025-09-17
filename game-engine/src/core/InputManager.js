/**
 * Input Manager
 * Handles keyboard, mouse, and touch input across different devices
 */

import { ValidationHelpers, ValidationError } from './ValidationHelpers.js';

class InputManager {
    constructor(engine) {
        // Validate parameter
        ValidationHelpers.validateObject(engine, [], 'engine');

        this.engine = engine;
        this.keys = new Map();
        this.previousKeys = new Map();
        this.mouse = {
            x: 0,
            y: 0,
            buttons: new Map(),
            previousButtons: new Map(),
            wheel: 0
        };
        this.touch = {
            touches: [],
            previousTouches: [],
            gestures: {
                swipe: { direction: null, distance: 0, velocity: 0 },
                pinch: { scale: 1, center: { x: 0, y: 0 } },
                tap: { count: 0, position: { x: 0, y: 0 } }
            }
        };

        // Input mappings for different control schemes
        this.bindings = new Map();
        this.contexts = new Map();
        this.activeContext = 'default';

        // Accessibility and navigation properties
        this.focusableElements = new Set();
        this.currentFocusIndex = -1;
        this.keyboardNavigationEnabled = false;
        this.screenReaderAnnouncements = [];

        // Device orientation and motion
        this.device = {
            orientation: { alpha: 0, beta: 0, gamma: 0 },
            acceleration: { x: 0, y: 0, z: 0 },
            accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
            rotationRate: { alpha: 0, beta: 0, gamma: 0 }
        };

        // Event listener cleanup
        this.eventListeners = [];

        this.init();
    }

    init() {
        this.setupKeyboardListeners();
        this.setupMouseListeners();
        this.setupTouchListeners();
        this.setupDeviceOrientationListeners();
        this.setupDefaultBindings();
    }

    setupKeyboardListeners() {
        const keydownHandler = (e) => {
            e.preventDefault();
            this.keys.set(e.code, true);
        };
        const keyupHandler = (e) => {
            e.preventDefault();
            this.keys.set(e.code, false);
        };

        window.addEventListener('keydown', keydownHandler);
        window.addEventListener('keyup', keyupHandler);

        this.eventListeners.push({ element: window, type: 'keydown', handler: keydownHandler });
        this.eventListeners.push({ element: window, type: 'keyup', handler: keyupHandler });

        // Prevent right-click context menu on canvas
        if (this.engine.canvas) {
            const contextMenuHandler = (e) => {
                e.preventDefault();
            };
            this.engine.canvas.addEventListener('contextmenu', contextMenuHandler);
            this.eventListeners.push({ element: this.engine.canvas, type: 'contextmenu', handler: contextMenuHandler });
        }
    }

    setupMouseListeners() {
        if (!this.engine.canvas) return;

        const mousemoveHandler = (e) => {
            const rect = this.engine.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        };
        const mousedownHandler = (e) => {
            e.preventDefault();
            this.mouse.buttons.set(e.button, true);
        };
        const mouseupHandler = (e) => {
            e.preventDefault();
            this.mouse.buttons.set(e.button, false);
        };
        const wheelHandler = (e) => {
            e.preventDefault();
            this.mouse.wheel = e.deltaY;
        };

        this.engine.canvas.addEventListener('mousemove', mousemoveHandler);
        this.engine.canvas.addEventListener('mousedown', mousedownHandler);
        this.engine.canvas.addEventListener('mouseup', mouseupHandler);
        this.engine.canvas.addEventListener('wheel', wheelHandler);

        this.eventListeners.push(
            { element: this.engine.canvas, type: 'mousemove', handler: mousemoveHandler },
            { element: this.engine.canvas, type: 'mousedown', handler: mousedownHandler },
            { element: this.engine.canvas, type: 'mouseup', handler: mouseupHandler },
            { element: this.engine.canvas, type: 'wheel', handler: wheelHandler }
        );
    }

    setupTouchListeners() {
        if (!this.engine.canvas) return;

        const touchstartHandler = (e) => {
            e.preventDefault();
            this.updateTouches(e);
        };
        const touchmoveHandler = (e) => {
            e.preventDefault();
            this.updateTouches(e);
        };
        const touchendHandler = (e) => {
            e.preventDefault();
            this.updateTouches(e);
        };
        const touchcancelHandler = (e) => {
            e.preventDefault();
            this.updateTouches(e);
        };

        this.engine.canvas.addEventListener('touchstart', touchstartHandler, { passive: false });
        this.engine.canvas.addEventListener('touchmove', touchmoveHandler, { passive: false });
        this.engine.canvas.addEventListener('touchend', touchendHandler, { passive: false });
        this.engine.canvas.addEventListener('touchcancel', touchcancelHandler, { passive: false });

        this.eventListeners.push(
            { element: this.engine.canvas, type: 'touchstart', handler: touchstartHandler },
            { element: this.engine.canvas, type: 'touchmove', handler: touchmoveHandler },
            { element: this.engine.canvas, type: 'touchend', handler: touchendHandler },
            { element: this.engine.canvas, type: 'touchcancel', handler: touchcancelHandler }
        );
    }

    setupDeviceOrientationListeners() {
        // Device orientation (gyroscope)
        const orientationHandler = (e) => {
            this.device.orientation = {
                alpha: e.alpha || 0, // Z-axis rotation (compass)
                beta: e.beta || 0,   // X-axis rotation (front/back tilt)
                gamma: e.gamma || 0  // Y-axis rotation (left/right tilt)
            };
        };

        // Device motion (accelerometer)
        const motionHandler = (e) => {
            if (e.acceleration) {
                this.device.acceleration = {
                    x: e.acceleration.x || 0,
                    y: e.acceleration.y || 0,
                    z: e.acceleration.z || 0
                };
            }

            if (e.accelerationIncludingGravity) {
                this.device.accelerationIncludingGravity = {
                    x: e.accelerationIncludingGravity.x || 0,
                    y: e.accelerationIncludingGravity.y || 0,
                    z: e.accelerationIncludingGravity.z || 0
                };
            }

            if (e.rotationRate) {
                this.device.rotationRate = {
                    alpha: e.rotationRate.alpha || 0,
                    beta: e.rotationRate.beta || 0,
                    gamma: e.rotationRate.gamma || 0
                };
            }
        };

        // Request permissions and add listeners
        if (window.DeviceOrientationEvent) {
            // iOS 13+ requires user permission
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // Will be requested when needed
                this.deviceOrientationPermissionGranted = false;
            } else {
                window.addEventListener('deviceorientation', orientationHandler);
                this.eventListeners.push({ element: window, type: 'deviceorientation', handler: orientationHandler });
            }
        }

        if (window.DeviceMotionEvent) {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                this.deviceMotionPermissionGranted = false;
            } else {
                window.addEventListener('devicemotion', motionHandler);
                this.eventListeners.push({ element: window, type: 'devicemotion', handler: motionHandler });
            }
        }
    }

    async requestDeviceOrientationPermission() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    this.deviceOrientationPermissionGranted = true;
                    const orientationHandler = (e) => {
                        this.device.orientation = {
                            alpha: e.alpha || 0,
                            beta: e.beta || 0,
                            gamma: e.gamma || 0
                        };
                    };
                    window.addEventListener('deviceorientation', orientationHandler);
                    this.eventListeners.push({ element: window, type: 'deviceorientation', handler: orientationHandler });
                    return true;
                }
            } catch (error) {
                console.warn('Device orientation permission denied:', error);
            }
        }
        return false;
    }

    async requestDeviceMotionPermission() {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceMotionEvent.requestPermission();
                if (permission === 'granted') {
                    this.deviceMotionPermissionGranted = true;
                    const motionHandler = (e) => {
                        if (e.acceleration) {
                            this.device.acceleration = {
                                x: e.acceleration.x || 0,
                                y: e.acceleration.y || 0,
                                z: e.acceleration.z || 0
                            };
                        }
                        // ... (rest of motion handler)
                    };
                    window.addEventListener('devicemotion', motionHandler);
                    this.eventListeners.push({ element: window, type: 'devicemotion', handler: motionHandler });
                    return true;
                }
            } catch (error) {
                console.warn('Device motion permission denied:', error);
            }
        }
        return false;
    }

    updateTouches(e) {
        const rect = this.engine.canvas.getBoundingClientRect();
        const newTouches = Array.from(e.touches).map(touch => ({
            id: touch.identifier,
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
            force: touch.force || 1,
            timestamp: performance.now()
        }));

        // Detect gestures
        this.detectGestures(newTouches, e.type);

        this.touch.touches = newTouches;
    }

    detectGestures(newTouches, eventType) {
        // Swipe detection
        if (eventType === 'touchend' && this.touch.touches.length === 1 && this.touch.previousTouches.length === 1) {
            const startTouch = this.touch.previousTouches[0];
            const endTouch = newTouches.find(t => t.id === this.touch.previousTouches[0].id);

            if (startTouch && endTouch) {
                const deltaX = endTouch.x - startTouch.x;
                const deltaY = endTouch.y - startTouch.y;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const duration = endTouch.timestamp - startTouch.timestamp;
                const velocity = distance / duration;

                if (distance > 50 && velocity > 0.1) { // Minimum distance and velocity for swipe
                    let direction = null;
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        direction = deltaX > 0 ? 'right' : 'left';
                    } else {
                        direction = deltaY > 0 ? 'down' : 'up';
                    }

                    this.touch.gestures.swipe = {
                        direction,
                        distance,
                        velocity,
                        start: { x: startTouch.x, y: startTouch.y },
                        end: { x: endTouch.x, y: endTouch.y }
                    };
                }
            }
        }

        // Pinch detection
        if (newTouches.length === 2 && this.touch.previousTouches.length === 2) {
            const currentDistance = this.getDistanceBetweenTouches(newTouches);
            const previousDistance = this.getDistanceBetweenTouches(this.touch.previousTouches);

            if (previousDistance > 0) {
                const scale = currentDistance / previousDistance;
                const center = this.getCenterOfTouches(newTouches);

                this.touch.gestures.pinch = {
                    scale: scale,
                    center: center,
                    deltaScale: scale - this.touch.gestures.pinch.scale
                };
            }
        }

        // Tap detection
        if (eventType === 'touchstart') {
            this.touch.gestures.tap.count = Math.min(this.touch.gestures.tap.count + 1, 3);
            if (newTouches.length > 0) {
                this.touch.gestures.tap.position = { x: newTouches[0].x, y: newTouches[0].y };
            }
        }
    }

    getDistanceBetweenTouches(touches) {
        if (touches.length < 2) return 0;
        const dx = touches[1].x - touches[0].x;
        const dy = touches[1].y - touches[0].y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getCenterOfTouches(touches) {
        if (touches.length < 2) return { x: 0, y: 0 };
        return {
            x: (touches[0].x + touches[1].x) / 2,
            y: (touches[0].y + touches[1].y) / 2
        };
    }

    setupDefaultBindings() {
        // Default key bindings inspired by both games
        this.bind('move_up', ['KeyW', 'ArrowUp']);
        this.bind('move_down', ['KeyS', 'ArrowDown']);
        this.bind('move_left', ['KeyA', 'ArrowLeft']);
        this.bind('move_right', ['KeyD', 'ArrowRight']);
        this.bind('action', ['Space', 'Enter']);
        this.bind('secondary_action', ['KeyE', 'KeyF']);
        this.bind('cancel', ['Escape', 'KeyQ']);
        this.bind('menu', ['Tab', 'KeyM']);
        
        // Mouse bindings
        this.bind('click', ['mouse_0']);
        this.bind('right_click', ['mouse_2']);
        
        // Game-specific bindings from analyzed games
        this.bind('fold', ['KeyF']);
        this.bind('play', ['KeyP']);
        this.bind('bluff', ['KeyB']);
        this.bind('upgrade', ['KeyU']);

        // Accessibility bindings
        this.bind('navigate_up', ['ArrowUp']);
        this.bind('navigate_down', ['ArrowDown']);
        this.bind('navigate_left', ['ArrowLeft']);
        this.bind('navigate_right', ['ArrowRight']);
        this.bind('tab_forward', ['Tab']);
        this.bind('tab_backward', ['Shift+Tab']);
        this.bind('activate', ['Enter', 'Space']);
        this.bind('escape', ['Escape']);
    }

    update(deltaTime) {
        // Record input state if recording is active
        if (this.recording) {
            const currentTime = performance.now() - this.recording.startTime;
            this.recording.inputs.push({
                timestamp: currentTime,
                keys: Array.from(this.keys.entries()),
                mouseX: this.mouse.x,
                mouseY: this.mouse.y,
                mouseButtons: Array.from(this.mouse.buttons.entries()),
                wheel: this.mouse.wheel
            });
        }

        // Store previous state
        this.previousKeys = new Map(this.keys);
        this.mouse.previousButtons = new Map(this.mouse.buttons);
        this.touch.previousTouches = [...this.touch.touches];

        // Reset wheel delta
        this.mouse.wheel = 0;

        // Reset gestures after processing
        this.touch.gestures.swipe = { direction: null, distance: 0, velocity: 0 };
        this.touch.gestures.pinch.deltaScale = 0;

        // Reset tap count after a delay
        if (this.touch.gestures.tap.count > 0) {
            setTimeout(() => {
                this.touch.gestures.tap.count = 0;
            }, 300);
        }
    }

    // Key state methods
    isKeyDown(key) {
        return this.keys.get(key) || false;
    }

    isKeyUp(key) {
        return !this.keys.get(key);
    }

    isKeyPressed(key) {
        return this.keys.get(key) && !this.previousKeys.get(key);
    }

    isKeyReleased(key) {
        return !this.keys.get(key) && this.previousKeys.get(key);
    }

    // Mouse state methods
    isMouseDown(button = 0) {
        return this.mouse.buttons.get(button) || false;
    }

    isMouseUp(button = 0) {
        return !this.mouse.buttons.get(button);
    }

    isMousePressed(button = 0) {
        return this.mouse.buttons.get(button) && !this.mouse.previousButtons.get(button);
    }

    isMouseReleased(button = 0) {
        return !this.mouse.buttons.get(button) && this.mouse.previousButtons.get(button);
    }

    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    getMouseWheel() {
        return this.mouse.wheel;
    }

    // Touch methods
    getTouches() {
        return this.touch.touches;
    }

    getTouchById(id) {
        return this.touch.touches.find(touch => touch.id === id);
    }

    isTouchPressed(id) {
        const current = this.touch.touches.find(touch => touch.id === id);
        const previous = this.touch.previousTouches.find(touch => touch.id === id);
        return current && !previous;
    }

    isTouchReleased(id) {
        const current = this.touch.touches.find(touch => touch.id === id);
        const previous = this.touch.previousTouches.find(touch => touch.id === id);
        return !current && previous;
    }

    // Gesture methods
    getSwipeGesture() {
        return this.touch.gestures.swipe;
    }

    isSwiped(direction = null) {
        const swipe = this.touch.gestures.swipe;
        return swipe.direction && swipe.distance > 0 && (direction === null || swipe.direction === direction);
    }

    getPinchGesture() {
        return this.touch.gestures.pinch;
    }

    isPinching() {
        return Math.abs(this.touch.gestures.pinch.deltaScale) > 0.01;
    }

    getTapGesture() {
        return this.touch.gestures.tap;
    }

    isTapped(count = 1) {
        return this.touch.gestures.tap.count === count;
    }

    // Device orientation and motion methods
    getDeviceOrientation() {
        return this.device.orientation;
    }

    getDeviceAcceleration() {
        return this.device.acceleration;
    }

    getDeviceAccelerationIncludingGravity() {
        return this.device.accelerationIncludingGravity;
    }

    getDeviceRotationRate() {
        return this.device.rotationRate;
    }

    isDeviceTilted(threshold = 15) {
        const { beta, gamma } = this.device.orientation;
        return Math.abs(beta) > threshold || Math.abs(gamma) > threshold;
    }

    isDeviceShaking(threshold = 1.5) {
        const { x, y, z } = this.device.acceleration;
        return Math.abs(x) > threshold || Math.abs(y) > threshold || Math.abs(z) > threshold;
    }

    // Mobile browser features
    async requestFullscreen() {
        if (!document.fullscreenElement) {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                    return true;
                } else if (document.documentElement.webkitRequestFullscreen) { // Safari
                    await document.documentElement.webkitRequestFullscreen();
                    return true;
                } else if (document.documentElement.msRequestFullscreen) { // IE
                    await document.documentElement.msRequestFullscreen();
                    return true;
                }
            } catch (error) {
                console.warn('Failed to enter fullscreen:', error);
            }
        }
        return false;
    }

    async exitFullscreen() {
        if (document.fullscreenElement) {
            try {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                    return true;
                } else if (document.webkitExitFullscreen) { // Safari
                    await document.webkitExitFullscreen();
                    return true;
                } else if (document.msExitFullscreen) { // IE
                    await document.msExitFullscreen();
                    return true;
                }
            } catch (error) {
                console.warn('Failed to exit fullscreen:', error);
            }
        }
        return false;
    }

    isFullscreen() {
        return !!(document.fullscreenElement ||
                 document.webkitFullscreenElement ||
                 document.msFullscreenElement);
    }

    vibrate(pattern) {
        if ('vibrate' in navigator) {
            // Pattern can be a number (duration in ms) or array [duration, pause, duration, ...]
            navigator.vibrate(pattern);
            return true;
        }
        return false;
    }

    // Wake lock for keeping screen on
    async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                this.wakeLock.addEventListener('release', () => {
                    console.log('Wake lock released');
                });
                return true;
            } catch (error) {
                console.warn('Failed to request wake lock:', error);
            }
        }
        return false;
    }

    async releaseWakeLock() {
        if (this.wakeLock) {
            try {
                await this.wakeLock.release();
                this.wakeLock = null;
                return true;
            } catch (error) {
                console.warn('Failed to release wake lock:', error);
            }
        }
        return false;
    }

    // Action binding system
    bind(action, keys) {
        if (!this.contexts.has(this.activeContext)) {
            this.contexts.set(this.activeContext, new Map());
        }
        
        this.contexts.get(this.activeContext).set(action, keys);
    }

    unbind(action) {
        if (this.contexts.has(this.activeContext)) {
            this.contexts.get(this.activeContext).delete(action);
        }
    }

    isActionDown(action) {
        const keys = this.getActionKeys(action);
        return keys.some(key => {
            if (key.startsWith('mouse_')) {
                const button = parseInt(key.split('_')[1]);
                return this.isMouseDown(button);
            }
            return this.isKeyDown(key);
        });
    }

    isActionPressed(action) {
        const keys = this.getActionKeys(action);
        return keys.some(key => {
            if (key.startsWith('mouse_')) {
                const button = parseInt(key.split('_')[1]);
                return this.isMousePressed(button);
            }
            return this.isKeyPressed(key);
        });
    }

    isActionReleased(action) {
        const keys = this.getActionKeys(action);
        return keys.some(key => {
            if (key.startsWith('mouse_')) {
                const button = parseInt(key.split('_')[1]);
                return this.isMouseReleased(button);
            }
            return this.isKeyReleased(key);
        });
    }

    getActionKeys(action) {
        const context = this.contexts.get(this.activeContext);
        return context ? context.get(action) || [] : [];
    }

    // Context management for different game states
    setContext(context) {
        this.activeContext = context;
        if (!this.contexts.has(context)) {
            this.contexts.set(context, new Map());
        }
    }

    getContext() {
        return this.activeContext;
    }

    // Movement vector calculation (common pattern from games)
    getMovementVector() {
        const vector = { x: 0, y: 0 };
        
        if (this.isActionDown('move_left')) vector.x -= 1;
        if (this.isActionDown('move_right')) vector.x += 1;
        if (this.isActionDown('move_up')) vector.y -= 1;
        if (this.isActionDown('move_down')) vector.y += 1;
        
        // Normalize diagonal movement
        if (vector.x !== 0 && vector.y !== 0) {
            const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            vector.x /= length;
            vector.y /= length;
        }
        
        return vector;
    }

    // Keyboard navigation support for accessibility
    enableKeyboardNavigation() {
        this.keyboardNavigationEnabled = true;
        this.setupKeyboardNavigationListeners();
        console.log('Keyboard navigation enabled for accessibility');
    }

    disableKeyboardNavigation() {
        this.keyboardNavigationEnabled = false;
        this.clearKeyboardNavigationListeners();
        console.log('Keyboard navigation disabled');
    }

    setupKeyboardNavigationListeners() {
        // Enhanced keyboard handler for navigation - separate from game input
        const navigationKeydownHandler = (e) => {
            // Only handle navigation keys when keyboard navigation is enabled
            if (!this.keyboardNavigationEnabled) return;

            // Handle Tab navigation
            if (e.key === 'Tab') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.navigateBackward();
                } else {
                    this.navigateForward();
                }
                return;
            }

            // Handle arrow key navigation for menus (only when not in input fields)
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                if (this.shouldHandleArrowNavigation()) {
                    e.preventDefault();
                    this.handleArrowNavigation(e.key);
                }
                return;
            }

            // Handle Enter/Space activation
            if (e.key === 'Enter' || e.key === ' ') {
                if (this.currentFocusIndex >= 0) {
                    e.preventDefault();
                    this.activateCurrentElement();
                }
                return;
            }

            // Handle Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                this.handleEscape();
                return;
            }
        };

        window.addEventListener('keydown', navigationKeydownHandler, true); // Use capture phase
        this.eventListeners.push({
            element: window,
            type: 'keydown',
            handler: navigationKeydownHandler,
            isNavigationHandler: true
        });
    }

    clearKeyboardNavigationListeners() {
        // Remove navigation-specific listeners
        this.eventListeners = this.eventListeners.filter(({ type }) =>
            !['keydown'].includes(type) || !this.isNavigationHandler
        );
    }

    registerFocusableElement(element) {
        if (element && (element.tabIndex >= 0 || element.tagName === 'BUTTON' ||
            element.tagName === 'INPUT' || element.tagName === 'SELECT' ||
            element.tagName === 'TEXTAREA' || element.hasAttribute('tabindex'))) {
            this.focusableElements.add(element);
        }
    }

    unregisterFocusableElement(element) {
        this.focusableElements.delete(element);
    }

    getFocusableElements() {
        return Array.from(this.focusableElements).filter(el =>
            el.offsetParent !== null && !el.disabled && !el.hidden
        );
    }

    navigateForward() {
        const elements = this.getFocusableElements();
        if (elements.length === 0) return;

        this.currentFocusIndex = (this.currentFocusIndex + 1) % elements.length;
        this.focusElement(elements[this.currentFocusIndex]);
        this.announceNavigation('forward', elements[this.currentFocusIndex]);
    }

    navigateBackward() {
        const elements = this.getFocusableElements();
        if (elements.length === 0) return;

        this.currentFocusIndex = this.currentFocusIndex <= 0 ?
            elements.length - 1 : this.currentFocusIndex - 1;
        this.focusElement(elements[this.currentFocusIndex]);
        this.announceNavigation('backward', elements[this.currentFocusIndex]);
    }

    handleArrowNavigation(key) {
        const elements = this.getFocusableElements();
        if (elements.length === 0) return;

        let newIndex = this.currentFocusIndex;

        switch (key) {
            case 'ArrowUp':
                newIndex = Math.max(0, this.currentFocusIndex - 1);
                break;
            case 'ArrowDown':
                newIndex = Math.min(elements.length - 1, this.currentFocusIndex + 1);
                break;
            case 'ArrowLeft':
                // For grid-like navigation
                newIndex = this.getLeftElementIndex(elements);
                break;
            case 'ArrowRight':
                // For grid-like navigation
                newIndex = this.getRightElementIndex(elements);
                break;
        }

        if (newIndex !== this.currentFocusIndex) {
            this.currentFocusIndex = newIndex;
            this.focusElement(elements[this.currentFocusIndex]);
            this.announceNavigation('arrow', elements[this.currentFocusIndex]);
        }
    }

    getLeftElementIndex(elements) {
        // Simple left navigation - could be enhanced for grid layouts
        return Math.max(0, this.currentFocusIndex - 1);
    }

    getRightElementIndex(elements) {
        // Simple right navigation - could be enhanced for grid layouts
        return Math.min(elements.length - 1, this.currentFocusIndex + 1);
    }

    shouldHandleArrowNavigation() {
        // Determine if we should handle arrow keys (e.g., in menus, not in text inputs)
        const activeElement = document.activeElement;
        return activeElement && !['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName);
    }

    focusElement(element) {
        if (element && typeof element.focus === 'function') {
            element.focus();
            // Scroll into view if needed
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    activateCurrentElement() {
        const elements = this.getFocusableElements();
        if (this.currentFocusIndex >= 0 && this.currentFocusIndex < elements.length) {
            const element = elements[this.currentFocusIndex];
            if (element) {
                if (element.tagName === 'BUTTON' || element.onclick) {
                    element.click();
                } else if (element.tagName === 'INPUT' && element.type === 'checkbox') {
                    element.checked = !element.checked;
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                }
                this.announceActivation(element);
            }
        }
    }

    handleEscape() {
        // Handle escape key - could close menus, dialogs, etc.
        this.announceToScreenReader('Escape pressed - navigation cancelled');
    }

    announceNavigation(direction, element) {
        const label = element.getAttribute('aria-label') ||
                     element.textContent ||
                     element.getAttribute('title') ||
                     element.tagName.toLowerCase();
        const message = `Navigated ${direction} to ${label}`;
        this.announceToScreenReader(message);
    }

    announceActivation(element) {
        const label = element.getAttribute('aria-label') ||
                     element.textContent ||
                     element.getAttribute('title') ||
                     'element';
        const message = `Activated ${label}`;
        this.announceToScreenReader(message);
    }

    announceToScreenReader(message) {
        // Use the engine's announcement system if available, otherwise fallback
        if (this.engine && this.engine.announceToScreenReader) {
            this.engine.announceToScreenReader(message);
        } else {
            // Fallback: try to find screen reader announcement elements
            const announcements = document.querySelector('[aria-live="assertive"], [aria-live="polite"]');
            if (announcements) {
                announcements.textContent = message;
            }
            console.log('Screen reader announcement:', message);
        }
    }

    // Virtual gamepad for mobile (inspired by mobile controls in the games)
    createVirtualGamepad(container) {
        const gamepad = document.createElement('div');
        gamepad.className = 'virtual-gamepad';
        gamepad.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            pointer-events: none;
            z-index: 1000;
        `;

        // D-pad
        const dpad = this.createDPad();
        gamepad.appendChild(dpad);

        // Action buttons
        const actionButtons = this.createActionButtons();
        gamepad.appendChild(actionButtons);

        container.appendChild(gamepad);
        return gamepad;
    }

    createDPad() {
        const dpad = document.createElement('div');
        dpad.className = 'dpad';
        dpad.style.cssText = `
            position: relative;
            width: 120px;
            height: 120px;
            pointer-events: auto;
        `;

        const directions = [
            { name: 'up', x: 40, y: 0, width: 40, height: 40 },
            { name: 'down', x: 40, y: 80, width: 40, height: 40 },
            { name: 'left', x: 0, y: 40, width: 40, height: 40 },
            { name: 'right', x: 80, y: 40, width: 40, height: 40 }
        ];

        directions.forEach(dir => {
            const button = document.createElement('div');
            button.style.cssText = `
                position: absolute;
                left: ${dir.x}px;
                top: ${dir.y}px;
                width: ${dir.width}px;
                height: ${dir.height}px;
                background: rgba(255, 255, 255, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.5);
                border-radius: 8px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 20px;
                color: white;
                user-select: none;
                touch-action: none;
            `;

            const arrows = { up: '↑', down: '↓', left: '←', right: '→' };
            button.textContent = arrows[dir.name];

            // Touch events
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys.set(`Arrow${dir.name.charAt(0).toUpperCase() + dir.name.slice(1)}`, true);
                button.style.background = 'rgba(255, 255, 255, 0.6)';
            });

            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys.set(`Arrow${dir.name.charAt(0).toUpperCase() + dir.name.slice(1)}`, false);
                button.style.background = 'rgba(255, 255, 255, 0.3)';
            });

            dpad.appendChild(button);
        });

        return dpad;
    }

    createActionButtons() {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            gap: 15px;
            flex-direction: column;
            pointer-events: auto;
        `;

        const buttons = [
            { text: 'A', key: 'Space', color: '#4CAF50' },
            { text: 'B', key: 'Escape', color: '#f44336' }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('div');
            button.style.cssText = `
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: ${btn.color};
                border: 3px solid white;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 24px;
                font-weight: bold;
                color: white;
                user-select: none;
                touch-action: none;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            `;

            button.textContent = btn.text;

            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys.set(btn.key, true);
                button.style.transform = 'scale(0.9)';
            });

            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys.set(btn.key, false);
                button.style.transform = 'scale(1)';
            });

            container.appendChild(button);
        });

        return container;
    }

    // Input recording and playback for testing
    startRecording() {
        this.recording = {
            inputs: [],
            startTime: performance.now()
        };
    }

    stopRecording() {
        if (this.recording) {
            const recording = this.recording;
            this.recording = null;
            return recording;
        }
    }

    playback(recording, speed = 1) {
        if (!recording || !recording.inputs) {
            console.warn('Invalid recording data');
            return;
        }

        let currentTime = performance.now();
        let inputIndex = 0;

        const playNextInput = () => {
            if (inputIndex >= recording.inputs.length) {
                console.log('Input playback completed');
                return;
            }

            const input = recording.inputs[inputIndex++];
            const elapsed = performance.now() - currentTime;
            const delay = input.timestamp / speed - elapsed;

            if (delay > 0) {
                setTimeout(() => {
                    // Replay the input state
                    this.keys = new Map(input.keys);
                    this.mouse.x = input.mouseX;
                    this.mouse.y = input.mouseY;
                    this.mouse.buttons = new Map(input.mouseButtons);
                    playNextInput();
                }, delay);
            } else {
                // Immediate replay
                this.keys = new Map(input.keys);
                this.mouse.x = input.mouseX;
                this.mouse.y = input.mouseY;
                this.mouse.buttons = new Map(input.mouseButtons);
                playNextInput();
            }
        };

        console.log('Playing back recorded inputs...');
        playNextInput();
    }

    // Get typed characters (for text input)
    getTypedChars() {
        // This would need to be implemented with proper text input handling
        // For now, return empty string
        return '';
    }

    // Debug information
    getDebugInfo() {
        return {
            activeKeys: Array.from(this.keys.entries()).filter(([key, pressed]) => pressed),
            mousePosition: this.getMousePosition(),
            activeContext: this.activeContext,
            touchCount: this.touch.touches.length,
            gestures: {
                swipe: this.touch.gestures.swipe,
                pinch: this.touch.gestures.pinch,
                tap: this.touch.gestures.tap
            },
            device: {
                orientation: this.device.orientation,
                acceleration: this.device.acceleration,
                shaking: this.isDeviceShaking(),
                tilted: this.isDeviceTilted()
            },
            keyboardNavigationEnabled: this.keyboardNavigationEnabled,
            focusableElementsCount: this.focusableElements.size,
            currentFocusIndex: this.currentFocusIndex,
            screenReaderAnnouncements: this.screenReaderAnnouncements.length,
            fullscreen: this.isFullscreen(),
            wakeLock: !!this.wakeLock
        };
    }

    // Cleanup method for memory leak prevention
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.eventListeners = [];

        // Clear maps
        this.keys.clear();
        this.previousKeys.clear();
        this.mouse.buttons.clear();
        this.mouse.previousButtons.clear();
        this.touch.touches = [];
        this.touch.previousTouches = [];
        this.bindings.clear();
        this.contexts.clear();

        // Clear accessibility properties
        this.focusableElements.clear();
        this.screenReaderAnnouncements = [];
        this.keyboardNavigationEnabled = false;
        this.currentFocusIndex = -1;

        // Release wake lock
        if (this.wakeLock) {
            this.releaseWakeLock();
        }

        console.log('InputManager destroyed and cleaned up');
    }
}

export { InputManager };
