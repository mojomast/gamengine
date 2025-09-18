/**
 * Loading Screen System with Progress Indicators
 * Provides visual feedback during game loading and transitions
 */

import { UIComponent, ProgressBar, Label, Panel } from '../../../game-engine/src/ui/UIManager.js';
import { ValidationHelpers } from '../../../game-engine/src/core/ValidationHelpers.js';

export class LoadingScreen extends UIComponent {
    constructor(engine, uiManager) {
        super(0, 0, engine.canvas.width, engine.canvas.height);
        this.engine = engine;
        this.uiManager = uiManager;
        this.isLoading = false;
        this.currentProgress = 0;
        this.loadingText = 'Loading...';
        this.subText = '';
        this.loadingSteps = [];

        this.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.style.borderWidth = 0;

        this.createLoadingUI();
        this.hide();
    }

    createLoadingUI() {
        // Main loading panel
        this.loadingPanel = new Panel(
            this.size.width / 2 - 250,
            this.size.height / 2 - 100,
            500,
            200
        );
        this.loadingPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.loadingPanel.style.borderColor = '#ffd700';
        this.loadingPanel.style.borderRadius = 10;

        // Title text
        this.titleLabel = new Label(
            0,
            20,
            'FINAL FANTASY 3 STYLE RPG',
            'bold 24px monospace'
        );
        this.titleLabel.style.textColor = '#ffd700';
        this.titleLabel.style.textAlign = 'center';
        this.titleLabel.setPosition(250 - this.titleLabel.size.width / 2, 20);

        // Loading text
        this.loadingLabel = new Label(
            0,
            70,
            this.loadingText,
            '18px monospace'
        );
        this.loadingLabel.style.textColor = '#ffffff';
        this.loadingLabel.style.textAlign = 'center';
        this.loadingLabel.setPosition(250 - this.loadingLabel.size.width / 2, 70);

        // Progress bar
        this.progressBar = new ProgressBar(
            50,
            110,
            400,
            30,
            0,
            100
        );
        this.progressBar.setValue(0);

        // Progress text
        this.progressLabel = new Label(
            0,
            160,
            '0%',
            '16px monospace'
        );
        this.progressLabel.style.textColor = '#cccccc';
        this.progressLabel.style.textAlign = 'center';
        this.progressLabel.setPosition(250 - this.progressLabel.size.width / 2, 160);

        // Sub-text for additional info
        this.subLabel = new Label(
            0,
            185,
            '',
            '14px monospace'
        );
        this.subLabel.style.textColor = '#888888';
        this.subLabel.style.textAlign = 'center';

        // Add components to panel
        this.loadingPanel.addChild(this.titleLabel);
        this.loadingPanel.addChild(this.loadingLabel);
        this.loadingPanel.addChild(this.progressBar);
        this.loadingPanel.addChild(this.progressLabel);
        this.loadingPanel.addChild(this.subLabel);

        this.addChild(this.loadingPanel);
    }

    async startLoading(loadingSteps = [], onComplete = null) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.loadingSteps = loadingSteps;
        this.currentProgress = 0;
        this.loadingText = 'Initializing...';

        this.show();
        this.uiManager.addComponent(this, 'loading_screen');

        try {
            await this.processLoadingSteps(onComplete);
        } catch (error) {
            console.error('Loading error:', error);
            this.showError('Loading failed: ' + error.message);
        } finally {
            this.isLoading = false;
        }
    }

    async processLoadingSteps(onComplete) {
        const totalSteps = this.loadingSteps.length;

        for (let i = 0; i < totalSteps; i++) {
            const step = this.loadingSteps[i];
            ValidationHelpers.validateObject(step, ['label'], 'loadingStep');

            this.loadingText = step.label;
            this.subText = step.description || '';

            // Update UI
            this.updateDisplay();

            // Simulate step duration or await actual loading
            if (step.duration) {
                await this.delay(step.duration);
            } else if (step.action) {
                await step.action();
            } else {
                await this.delay(500); // Default 500ms per step
            }

            // Update progress
            this.currentProgress = ((i + 1) / totalSteps) * 100;
            this.updateDisplay();
        }

        // Loading complete
        this.loadingText = 'Complete!';
        this.subText = 'Starting game...';
        this.currentProgress = 100;
        this.updateDisplay();

        await this.delay(1000); // Show completion for 1 second

        this.hide();
        this.uiManager.removeComponent(this);

        if (onComplete) {
            onComplete();
        }
    }

    updateDisplay() {
        this.loadingLabel.setText(this.loadingText);
        this.progressBar.setValue(this.currentProgress);
        this.progressLabel.setText(Math.round(this.currentProgress) + '%');

        if (this.subText) {
            this.subLabel.setText(this.subText);
            this.subLabel.setPosition(250 - this.subLabel.size.width / 2, 185);
            this.subLabel.show();
        } else {
            this.subLabel.hide();
        }

        // Center text elements
        this.loadingLabel.setPosition(250 - this.loadingLabel.size.width / 2, 70);
        this.progressLabel.setPosition(250 - this.progressLabel.size.width / 2, 160);

        this.dirty = true;
    }

    showError(message) {
        this.loadingText = 'Error';
        this.subText = message;
        this.progressBar.setValue(0);
        this.progressBar.style.fillColor = '#ff0000';
        this.updateDisplay();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Predefined loading sequences
    static createGameLoadingSequence() {
        return [
            {
                label: 'Initializing Engine...',
                description: 'Setting up game systems',
                duration: 800
            },
            {
                label: 'Loading Assets...',
                description: 'Loading textures, sounds, and data',
                duration: 1200
            },
            {
                label: 'Setting up World...',
                description: 'Generating maps and environments',
                duration: 1000
            },
            {
                label: 'Preparing Characters...',
                description: 'Loading character data and stats',
                duration: 600
            },
            {
                label: 'Initializing Combat...',
                description: 'Setting up battle systems',
                duration: 500
            },
            {
                label: 'Loading Quests...',
                description: 'Preparing story and objectives',
                duration: 400
            },
            {
                label: 'Finalizing...',
                description: 'Almost ready to play!',
                duration: 300
            }
        ];
    }

    static createSaveLoadingSequence() {
        return [
            {
                label: 'Loading Save File...',
                description: 'Reading game progress',
                duration: 600
            },
            {
                label: 'Restoring World State...',
                description: 'Setting up environment',
                duration: 800
            },
            {
                label: 'Loading Characters...',
                description: 'Restoring party members',
                duration: 500
            },
            {
                label: 'Restoring Inventory...',
                description: 'Loading items and equipment',
                duration: 400
            },
            {
                label: 'Loading Quest Progress...',
                description: 'Restoring story state',
                duration: 300
            },
            {
                label: 'Finalizing...',
                description: 'Ready to continue!',
                duration: 200
            }
        ];
    }

    static createTransitionSequence(from, to) {
        return [
            {
                label: `Leaving ${from}...`,
                description: 'Saving current location',
                duration: 400
            },
            {
                label: `Traveling to ${to}...`,
                description: 'Loading destination',
                duration: 800
            },
            {
                label: 'Updating World...',
                description: 'Refreshing environment',
                duration: 300
            }
        ];
    }
}

// Asset Loading Manager with Progress Tracking
export class AssetLoader {
    constructor(resourceManager) {
        this.resourceManager = resourceManager;
        this.loadingPromises = new Map();
        this.loadedAssets = new Set();
        this.totalAssets = 0;
        this.loadedCount = 0;
    }

    async loadAssets(assets, onProgress = null) {
        this.totalAssets = assets.length;
        this.loadedCount = 0;

        const loadingPromises = assets.map(async (asset) => {
            try {
                await this.loadAsset(asset);
                this.loadedCount++;
                this.loadedAssets.add(asset.id);

                if (onProgress) {
                    const progress = (this.loadedCount / this.totalAssets) * 100;
                    onProgress(progress, asset.id);
                }

                return asset;
            } catch (error) {
                console.error(`Failed to load asset ${asset.id}:`, error);
                throw error;
            }
        });

        return Promise.all(loadingPromises);
    }

    async loadAsset(asset) {
        ValidationHelpers.validateObject(asset, ['id', 'type'], 'asset');

        switch (asset.type) {
            case 'image':
                return this.resourceManager.loadImage(asset.id, asset.src);
            case 'audio':
                return this.resourceManager.loadAudio(asset.id, asset.src);
            case 'json':
                return this.resourceManager.loadJSON(asset.id, asset.src);
            case 'font':
                return this.resourceManager.loadFont(asset.id, asset.src);
            default:
                throw new Error(`Unknown asset type: ${asset.type}`);
        }
    }

    getProgress() {
        return this.totalAssets > 0 ? (this.loadedCount / this.totalAssets) * 100 : 0;
    }

    isAssetLoaded(assetId) {
        return this.loadedAssets.has(assetId);
    }

    getLoadedCount() {
        return this.loadedCount;
    }

    getTotalCount() {
        return this.totalAssets;
    }
}