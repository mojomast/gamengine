/**
 * Error Handler and Crash Recovery System
 * Provides comprehensive error handling and recovery mechanisms
 */

import { ValidationHelpers } from '../../../game-engine/src/core/ValidationHelpers.js';

export class ErrorHandler {
    constructor(engine) {
        this.engine = engine;
        this.errors = [];
        this.maxErrors = 100;
        this.recoveryStrategies = new Map();
        this.errorCallbacks = new Map();
        this.crashRecoveryEnabled = true;

        this.setupGlobalErrorHandling();
        this.registerDefaultRecoveryStrategies();
    }

    setupGlobalErrorHandling() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError('uncaught', event.error, {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('unhandled_promise', event.reason, {
                promise: event.promise
            });
            event.preventDefault(); // Prevent default browser handling
        });

        // Handle game-specific errors
        if (this.engine && this.engine.eventBus) {
            this.engine.eventBus.on('system-error', (errorData) => {
                this.handleError('system', errorData.error, errorData.context);
            });
        }
    }

    registerDefaultRecoveryStrategies() {
        // Strategy for rendering errors
        this.recoveryStrategies.set('render', {
            name: 'render_error',
            description: 'Recover from rendering errors',
            action: async (error) => {
                console.warn('Attempting render error recovery...');

                // Reduce render quality
                if (this.engine.renderer) {
                    this.engine.renderer.reduceQuality();
                }

                // Clear render cache
                if (this.engine.renderer && this.engine.renderer.clearCache) {
                    this.engine.renderer.clearCache();
                }

                return { success: true, message: 'Render quality reduced, cache cleared' };
            }
        });

        // Strategy for memory errors
        this.recoveryStrategies.set('memory', {
            name: 'memory_error',
            description: 'Recover from memory pressure',
            action: async (error) => {
                console.warn('Attempting memory recovery...');

                // Force garbage collection if available
                if (window.gc) {
                    window.gc();
                }

                // Clear object pools
                if (this.engine.objectPool) {
                    this.engine.objectPool.clear();
                }

                // Clear resource cache
                if (this.engine.resourceManager) {
                    this.engine.resourceManager.clearCache();
                }

                return { success: true, message: 'Memory cleared, pools reset' };
            }
        });

        // Strategy for battle system errors
        this.recoveryStrategies.set('battle', {
            name: 'battle_error',
            description: 'Recover from battle system errors',
            action: async (error) => {
                console.warn('Attempting battle error recovery...');

                // Reset battle state
                if (this.engine.battleSystem) {
                    this.engine.battleSystem.reset();
                }

                // Return to world map
                if (this.engine.sceneManager) {
                    this.engine.sceneManager.switchToScene('world');
                }

                return { success: true, message: 'Battle reset, returned to world' };
            }
        });

        // Strategy for save/load errors
        this.recoveryStrategies.set('save_load', {
            name: 'save_load_error',
            description: 'Recover from save/load errors',
            action: async (error) => {
                console.warn('Attempting save/load recovery...');

                // Create emergency save
                const emergencySave = this.createEmergencySave();

                // Attempt to save emergency data
                try {
                    localStorage.setItem('emergency_save', JSON.stringify(emergencySave));
                    return { success: true, message: 'Emergency save created' };
                } catch (saveError) {
                    return { success: false, message: 'Could not create emergency save' };
                }
            }
        });
    }

    async handleError(type, error, context = {}) {
        const errorData = {
            id: this.generateErrorId(),
            type,
            error,
            message: error.message || 'Unknown error',
            stack: error.stack,
            context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            gameState: this.captureGameState()
        };

        // Log error
        console.error(`[${type.toUpperCase()}] ${errorData.message}`, errorData);

        // Store error
        this.errors.push(errorData);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift(); // Remove oldest error
        }

        // Notify error callbacks
        this.notifyErrorCallbacks(errorData);

        // Attempt recovery
        if (this.crashRecoveryEnabled) {
            const recoveryResult = await this.attemptRecovery(errorData);
            if (recoveryResult.success) {
                console.log(`✅ Recovery successful: ${recoveryResult.message}`);
                return;
            }
        }

        // If recovery failed or disabled, show user-friendly error
        this.displayErrorToUser(errorData);
    }

    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    captureGameState() {
        try {
            return {
                scene: this.engine?.sceneManager?.currentScene?.name,
                playerPosition: this.engine?.player?.position,
                partySize: this.engine?.partyManager?.party?.length,
                memoryUsage: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize
                } : null
            };
        } catch (e) {
            return { captureFailed: true, reason: e.message };
        }
    }

    async attemptRecovery(errorData) {
        const strategy = this.selectRecoveryStrategy(errorData);

        if (!strategy) {
            return { success: false, message: 'No recovery strategy available' };
        }

        try {
            return await strategy.action(errorData);
        } catch (recoveryError) {
            console.error('Recovery failed:', recoveryError);
            return { success: false, message: `Recovery failed: ${recoveryError.message}` };
        }
    }

    selectRecoveryStrategy(errorData) {
        // Select strategy based on error type
        switch (errorData.type) {
            case 'render':
            case 'webgl':
                return this.recoveryStrategies.get('render');
            case 'memory':
            case 'out_of_memory':
                return this.recoveryStrategies.get('memory');
            case 'battle':
            case 'combat':
                return this.recoveryStrategies.get('battle');
            case 'save':
            case 'load':
                return this.recoveryStrategies.get('save_load');
            default:
                // Try to match by error message
                if (errorData.message.includes('memory') || errorData.message.includes('heap')) {
                    return this.recoveryStrategies.get('memory');
                }
                if (errorData.message.includes('render') || errorData.message.includes('canvas')) {
                    return this.recoveryStrategies.get('render');
                }
                return null;
        }
    }

    displayErrorToUser(errorData) {
        // Create user-friendly error display
        const errorDialog = {
            title: 'Oops! Something went wrong',
            message: this.getUserFriendlyMessage(errorData),
            actions: [
                {
                    text: 'Try Again',
                    action: () => window.location.reload()
                },
                {
                    text: 'Report Bug',
                    action: () => this.reportError(errorData)
                },
                {
                    text: 'Continue',
                    action: () => this.dismissError()
                }
            ]
        };

        // Show error dialog (would integrate with UI system)
        if (this.engine.uiManager) {
            this.showErrorDialog(errorDialog);
        } else {
            // Fallback to alert
            alert(`${errorDialog.title}\n\n${errorDialog.message}`);
        }
    }

    getUserFriendlyMessage(errorData) {
        const messages = {
            memory: 'The game is running low on memory. Try closing other tabs and refreshing.',
            render: 'There was a problem displaying graphics. Try refreshing the page.',
            network: 'Connection problem detected. Check your internet and try again.',
            save: 'Could not save game progress. Your progress is safe locally.',
            load: 'Could not load game data. Try refreshing the page.',
            battle: 'Battle system error occurred. Returning to safe location.',
            default: 'An unexpected error occurred. The game will attempt to continue.'
        };

        return messages[errorData.type] || messages.default;
    }

    createEmergencySave() {
        try {
            return {
                timestamp: Date.now(),
                type: 'emergency',
                gameState: this.captureGameState(),
                lastError: this.errors[this.errors.length - 1],
                version: '1.0.0'
            };
        } catch (e) {
            return {
                timestamp: Date.now(),
                type: 'emergency',
                error: 'Could not create emergency save',
                reason: e.message
            };
        }
    }

    showErrorDialog(dialogData) {
        // This would integrate with the UI system to show a modal dialog
        console.log('Error Dialog:', dialogData);

        // For now, create a simple modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: monospace;
            color: white;
        `;

        modal.innerHTML = `
            <div style="
                background: #333;
                border: 2px solid #ffd700;
                padding: 20px;
                border-radius: 10px;
                max-width: 500px;
                text-align: center;
            ">
                <h2 style="color: #ff6b6b; margin-top: 0;">${dialogData.title}</h2>
                <p style="margin: 20px 0; line-height: 1.5;">${dialogData.message}</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    ${dialogData.actions.map(action =>
                        `<button onclick="this.closest('.error-modal').remove(); ${action.action.toString().replace('function () {', '').replace('}', '')}"
                                style="background: #d62828; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                            ${action.text}
                        </button>`
                    ).join('')}
                </div>
            </div>
        `;

        modal.className = 'error-modal';
        document.body.appendChild(modal);
    }

    reportError(errorData) {
        // Prepare error report
        const report = {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            error: {
                message: errorData.message,
                stack: errorData.stack,
                type: errorData.type
            },
            gameState: errorData.gameState,
            additionalInfo: {
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                language: navigator.language,
                platform: navigator.platform
            }
        };

        // Copy to clipboard
        navigator.clipboard.writeText(JSON.stringify(report, null, 2))
            .then(() => {
                alert('Error report copied to clipboard. Please share this with the developers.');
            })
            .catch(() => {
                // Fallback: show in console
                console.log('Error Report:', report);
                alert('Error report logged to console. Press F12 to view and copy the details.');
            });
    }

    dismissError() {
        // Simply remove any error modals
        const modals = document.querySelectorAll('.error-modal');
        modals.forEach(modal => modal.remove());
    }

    onError(type, callback) {
        if (!this.errorCallbacks.has(type)) {
            this.errorCallbacks.set(type, []);
        }
        this.errorCallbacks.get(type).push(callback);
    }

    notifyErrorCallbacks(errorData) {
        const callbacks = this.errorCallbacks.get(errorData.type) || [];
        callbacks.forEach(callback => {
            try {
                callback(errorData);
            } catch (e) {
                console.error('Error callback failed:', e);
            }
        });
    }

    getErrors(filter = {}) {
        let filteredErrors = [...this.errors];

        if (filter.type) {
            filteredErrors = filteredErrors.filter(e => e.type === filter.type);
        }

        if (filter.since) {
            filteredErrors = filteredErrors.filter(e => e.timestamp >= filter.since);
        }

        if (filter.limit) {
            filteredErrors = filteredErrors.slice(-filter.limit);
        }

        return filteredErrors;
    }

    clearErrors() {
        this.errors = [];
    }

    exportErrorLog() {
        const log = {
            exportTime: new Date().toISOString(),
            totalErrors: this.errors.length,
            errors: this.errors,
            systemInfo: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: Date.now()
            }
        };

        return JSON.stringify(log, null, 2);
    }

    enableRecovery() {
        this.crashRecoveryEnabled = true;
    }

    disableRecovery() {
        this.crashRecoveryEnabled = false;
    }
}