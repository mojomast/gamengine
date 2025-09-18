/**
 * Cutscene Editor
 * Timeline-based cutscene creation and editing tool
 */

import { UIComponent, UIManager } from '../../game-engine/src/ui/UIManager.js';
import { CutsceneScene, CutsceneAction } from '../core/CutsceneScene.js';

class TimelineTrack extends UIComponent {
    constructor(x, y, width, height, trackType, color = '#666666') {
        super(x, y, width, height);
        this.trackType = trackType;
        this.color = color;
        this.actions = [];
        this.selectedAction = null;
        this.draggedAction = null;
        this.dragOffset = 0;
    }

    addAction(action, startTime) {
        const actionBlock = {
            action,
            startTime,
            width: Math.max(50, action.duration / 10), // Scale duration to pixels
            selected: false
        };
        this.actions.push(actionBlock);
        this.actions.sort((a, b) => a.startTime - b.startTime);
    }

    renderContent(ctx) {
        // Render track background
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.size.width, this.size.height);

        // Render track label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.trackType, 5, this.size.height / 2);

        // Render actions
        this.actions.forEach(actionBlock => {
            const x = this.timeToX(actionBlock.startTime);
            const y = 2;
            const width = actionBlock.width;
            const height = this.size.height - 4;

            // Action block
            ctx.fillStyle = actionBlock.selected ? '#00ff00' : '#cccccc';
            ctx.fillRect(x, y, width, height);
            ctx.strokeStyle = '#000000';
            ctx.strokeRect(x, y, width, height);

            // Action type label
            ctx.fillStyle = '#000000';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(actionBlock.action.type, x + width / 2, y + height / 2);
        });
    }

    timeToX(time) {
        // Convert time to x position (assuming 100ms per 10px)
        return (time / 100) * 10;
    }

    xToTime(x) {
        // Convert x position to time
        return (x / 10) * 100;
    }

    handleClick(x, y) {
        // Deselect all
        this.actions.forEach(action => action.selected = false);

        // Find clicked action
        const clickedAction = this.actions.find(actionBlock => {
            const actionX = this.timeToX(actionBlock.startTime);
            return x >= actionX && x <= actionX + actionBlock.width &&
                   y >= 2 && y <= this.size.height - 2;
        });

        if (clickedAction) {
            clickedAction.selected = true;
            this.selectedAction = clickedAction;
            return clickedAction;
        }

        this.selectedAction = null;
        return null;
    }

    handleDragStart(x, y) {
        const actionBlock = this.handleClick(x, y);
        if (actionBlock) {
            this.draggedAction = actionBlock;
            this.dragOffset = x - this.timeToX(actionBlock.startTime);
        }
    }

    handleDrag(x, y) {
        if (this.draggedAction) {
            const newTime = this.xToTime(x - this.dragOffset);
            this.draggedAction.startTime = Math.max(0, newTime);
            this.draggedAction.action.startTime = this.draggedAction.startTime;
        }
    }

    handleDragEnd() {
        this.draggedAction = null;
    }
}

class TimelineRuler extends UIComponent {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.currentTime = 0;
        this.duration = 10000; // 10 seconds default
        this.zoom = 1.0;
    }

    renderContent(ctx) {
        // Render ruler background
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, this.size.width, this.size.height);

        // Render time markers
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;

        const step = 1000 / this.zoom; // 1 second steps
        for (let time = 0; time <= this.duration; time += step) {
            const x = this.timeToX(time);
            if (x >= 0 && x <= this.size.width) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, this.size.height);
                ctx.stroke();

                // Time label
                ctx.fillStyle = '#ffffff';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`${time/1000}s`, x, 2);
            }
        }

        // Render current time indicator
        const currentX = this.timeToX(this.currentTime);
        if (currentX >= 0 && currentX <= this.size.width) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(currentX, 0);
            ctx.lineTo(currentX, this.size.height);
            ctx.stroke();
        }
    }

    timeToX(time) {
        return (time / this.duration) * this.size.width;
    }

    xToTime(x) {
        return (x / this.size.width) * this.duration;
    }

    setCurrentTime(time) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
    }
}

class CutsceneEditor extends UIComponent {
    constructor(x, y, width, height, engine) {
        super(x, y, width, height);
        this.engine = engine;
        this.cutscene = null;
        this.selectedAction = null;
        this.isPlaying = false;
        this.currentTime = 0;

        // Timeline components
        this.ruler = new TimelineRuler(0, 0, width - 200, 30);
        this.tracks = new Map();
        this.setupTracks();

        // Property panel
        this.propertyPanel = this.createPropertyPanel();

        // Toolbar
        this.toolbar = this.createToolbar();

        // Preview area
        this.previewArea = {
            x: width - 190,
            y: 40,
            width: 180,
            height: 200
        };

        // Event handlers
        this.draggedItem = null;
        this.setupEventHandlers();
    }

    setupTracks() {
        const trackHeight = 40;
        let y = 30;

        const trackConfigs = [
            { type: 'camera', color: '#4a90e2' },
            { type: 'character', color: '#7ed321' },
            { type: 'dialog', color: '#f5a623' },
            { type: 'effect', color: '#d0021b' },
            { type: 'sound', color: '#9013fe' },
            { type: 'conditional', color: '#ff69b4' }
        ];

        trackConfigs.forEach(config => {
            const track = new TimelineTrack(0, y, this.size.width - 200, trackHeight, config.type, config.color);
            this.tracks.set(config.type, track);
            this.addChild(track);
            y += trackHeight;
        });
    }

    createPropertyPanel() {
        // Simple property panel implementation
        return {
            x: this.size.width - 190,
            y: 250,
            width: 180,
            height: this.size.height - 260,
            render: (ctx) => {
                ctx.fillStyle = '#2c2c2c';
                ctx.fillRect(this.propertyPanel.x, this.propertyPanel.y, this.propertyPanel.width, this.propertyPanel.height);
                ctx.strokeStyle = '#666666';
                ctx.strokeRect(this.propertyPanel.x, this.propertyPanel.y, this.propertyPanel.width, this.propertyPanel.height);

                ctx.fillStyle = '#ffffff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText('Properties', this.propertyPanel.x + 5, this.propertyPanel.y + 5);

                if (this.selectedAction) {
                    ctx.fillText(`Type: ${this.selectedAction.action.type}`, this.propertyPanel.x + 5, this.propertyPanel.y + 25);
                    ctx.fillText(`Time: ${this.selectedAction.startTime}ms`, this.propertyPanel.x + 5, this.propertyPanel.y + 45);
                }
            }
        };
    }

    createToolbar() {
        return {
            buttons: [
                { id: 'play', text: '▶', x: 10, y: 5, width: 30, height: 25, action: () => this.playPreview() },
                { id: 'pause', text: '⏸', x: 45, y: 5, width: 30, height: 25, action: () => this.pausePreview() },
                { id: 'stop', text: '⏹', x: 80, y: 5, width: 30, height: 25, action: () => this.stopPreview() },
                { id: 'save', text: '💾', x: 120, y: 5, width: 30, height: 25, action: () => this.saveCutscene() },
                { id: 'load', text: '📁', x: 155, y: 5, width: 30, height: 25, action: () => this.loadCutscene() }
            ],
            render: (ctx) => {
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(0, 0, this.size.width, 35);

                this.toolbar.buttons.forEach(button => {
                    ctx.fillStyle = '#333333';
                    ctx.fillRect(button.x, button.y, button.width, button.height);
                    ctx.strokeStyle = '#666666';
                    ctx.strokeRect(button.x, button.y, button.width, button.height);

                    ctx.fillStyle = '#ffffff';
                    ctx.font = '14px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
                });
            }
        };
    }

    setupEventHandlers() {
        this.onMouseDown = (x, y) => {
            // Check toolbar buttons
            const toolbarButton = this.toolbar.buttons.find(button =>
                x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height
            );

            if (toolbarButton) {
                toolbarButton.action();
                return;
            }

            // Check tracks
            for (const [type, track] of this.tracks) {
                const localY = y - track.position.y;
                if (localY >= 0 && localY <= track.size.height) {
                    const trackX = x - track.position.x;
                    track.handleClick(trackX, localY);
                    this.selectedAction = track.selectedAction;
                    break;
                }
            }
        };

        this.onMouseDragStart = (x, y) => {
            // Check if dragging an action
            for (const [type, track] of this.tracks) {
                const localY = y - track.position.y;
                if (localY >= 0 && localY <= track.size.height) {
                    const trackX = x - track.position.x;
                    track.handleDragStart(trackX, localY);
                    if (track.draggedAction) {
                        this.draggedItem = track.draggedAction;
                        break;
                    }
                }
            }
        };

        this.onMouseDrag = (x, y) => {
            if (this.draggedItem) {
                for (const [type, track] of this.tracks) {
                    if (track.draggedAction) {
                        const trackX = x - track.position.x;
                        track.handleDrag(trackX, y - track.position.y);
                        break;
                    }
                }
            }
        };

        this.onMouseDragEnd = () => {
            if (this.draggedItem) {
                for (const [type, track] of this.tracks) {
                    if (track.draggedAction) {
                        track.handleDragEnd();
                        break;
                    }
                }
                this.draggedItem = null;
            }
        };
    }

    loadCutscene(cutsceneId) {
        // Load cutscene from data
        this.cutscene = {
            id: cutsceneId,
            actions: [] // Would load from storage
        };

        // Clear existing tracks
        this.tracks.forEach(track => track.actions = []);

        // Populate tracks with actions
        if (this.cutscene.actions) {
            this.cutscene.actions.forEach(action => {
                const track = this.tracks.get(action.type);
                if (track) {
                    track.addAction(action, action.startTime);
                }
            });
        }
    }

    addAction(type, startTime, config) {
        const action = new CutsceneAction(type, { ...config, startTime });
        const track = this.tracks.get(type);

        if (track) {
            track.addAction(action, startTime);
            this.cutscene.actions.push(action);
        }
    }

    removeSelectedAction() {
        if (!this.selectedAction) return;

        this.tracks.forEach(track => {
            const index = track.actions.indexOf(this.selectedAction);
            if (index > -1) {
                track.actions.splice(index, 1);
            }
        });

        const actionIndex = this.cutscene.actions.indexOf(this.selectedAction.action);
        if (actionIndex > -1) {
            this.cutscene.actions.splice(actionIndex, 1);
        }

        this.selectedAction = null;
    }

    playPreview() {
        if (!this.cutscene) return;

        this.isPlaying = true;
        this.currentTime = 0;
        this.playStartTime = performance.now();

        // Create preview cutscene scene
        this.previewScene = new CutsceneScene('preview', this.engine);
        this.previewScene.loadCutscene(this.cutscene.id);
        // Note: In a real implementation, you'd need to integrate with scene manager
    }

    pausePreview() {
        this.isPlaying = false;
    }

    stopPreview() {
        this.isPlaying = false;
        this.currentTime = 0;
        if (this.previewScene) {
            this.previewScene.stop();
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.isPlaying) {
            const elapsed = performance.now() - this.playStartTime;
            this.currentTime = elapsed;
            this.ruler.setCurrentTime(this.currentTime);

            if (this.currentTime >= this.ruler.duration) {
                this.stopPreview();
            }
        }
    }

    renderContent(ctx) {
        // Render toolbar
        if (this.toolbar.render) {
            this.toolbar.render(ctx);
        }

        // Render ruler
        this.ruler.render(ctx);

        // Render tracks
        this.tracks.forEach(track => {
            ctx.save();
            ctx.translate(track.position.x, track.position.y);
            track.render(ctx);
            ctx.restore();
        });

        // Render property panel
        if (this.propertyPanel.render) {
            this.propertyPanel.render(ctx);
        }

        // Render preview area
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.previewArea.x, this.previewArea.y, this.previewArea.width, this.previewArea.height);
        ctx.strokeStyle = '#666666';
        ctx.strokeRect(this.previewArea.x, this.previewArea.y, this.previewArea.width, this.previewArea.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Preview', this.previewArea.x + this.previewArea.width / 2, this.previewArea.y + this.previewArea.height / 2);
    }

    saveCutscene() {
        if (!this.cutscene) return;

        // Compile actions from tracks
        const actions = [];
        this.tracks.forEach(track => {
            track.actions.forEach(actionBlock => {
                actions.push({
                    type: actionBlock.action.type,
                    startTime: actionBlock.startTime,
                    duration: actionBlock.action.duration,
                    config: actionBlock.action.config
                });
            });
        });

        this.cutscene.actions = actions;

        // Save to storage (localStorage for demo)
        const cutsceneData = {
            id: this.cutscene.id,
            duration: this.ruler.duration,
            actions: actions
        };

        localStorage.setItem(`cutscene_${this.cutscene.id}`, JSON.stringify(cutsceneData));
        console.log('Cutscene saved:', this.cutscene.id);
    }

    exportCutscene() {
        if (!this.cutscene) return null;

        return {
            id: this.cutscene.id,
            duration: this.ruler.duration,
            actions: this.cutscene.actions.map(action => ({
                type: action.type,
                startTime: action.startTime,
                duration: action.duration,
                config: action.config
            }))
        };
    }

    destroy() {
        this.stopPreview();
        super.destroy();
    }
}

// Static method to create editor scene
CutsceneEditor.createEditorScene = function(cutsceneId, engine) {
    const editor = new CutsceneEditor(0, 0, engine.canvas.width, engine.canvas.height, engine);
    if (cutsceneId) {
        editor.loadCutscene(cutsceneId);
    }
    return editor;
};

export { CutsceneEditor, TimelineTrack, TimelineRuler };