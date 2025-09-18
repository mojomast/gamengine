/**
 * Map UI - Navigation aids and mini-map system
 * Provides mini-map, location tracking, quest markers, and navigation assistance
 */

import { UIComponent, Button, Label, Panel } from '../../../game-engine/src/ui/UIManager.js';
import { AnimationManager } from '../../../game-engine/src/effects/AnimationManager.js';

class MiniMap extends UIComponent {
    constructor(x, y, width, height, tileMap) {
        super(x, y, width, height);
        this.tileMap = tileMap;
        this.zoom = 0.1; // Zoom level (pixels per tile)
        this.centerX = 0;
        this.centerY = 0;
        this.showPlayer = true;
        this.showNPCs = true;
        this.showQuests = true;
        this.showEnemies = false;

        this.style = {
            ...this.style,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderColor: '#ffd700',
            borderWidth: 2,
            borderRadius: 4
        };

        // Map data cache
        this.mapData = null;
        this.lastUpdate = 0;
    }

    updateCenter(playerX, playerY) {
        this.centerX = playerX;
        this.centerY = playerY;
    }

    setZoom(zoom) {
        this.zoom = Math.max(0.05, Math.min(0.5, zoom));
    }

    toggleLayer(layer) {
        switch (layer) {
            case 'player':
                this.showPlayer = !this.showPlayer;
                break;
            case 'npcs':
                this.showNPCs = !this.showNPCs;
                break;
            case 'quests':
                this.showQuests = !this.showQuests;
                break;
            case 'enemies':
                this.showEnemies = !this.showEnemies;
                break;
        }
    }

    renderContent(ctx) {
        if (!this.tileMap) return;

        const halfWidth = this.size.width / 2;
        const halfHeight = this.size.height / 2;

        // Calculate visible area
        const startTileX = Math.max(0, Math.floor(this.centerX - halfWidth / this.zoom));
        const startTileY = Math.max(0, Math.floor(this.centerY - halfHeight / this.zoom));
        const endTileX = Math.min(this.tileMap.width, Math.ceil(this.centerX + halfWidth / this.zoom));
        const endTileY = Math.min(this.tileMap.height, Math.ceil(this.centerY + halfHeight / this.zoom));

        // Render map tiles
        for (let y = startTileY; y < endTileY; y++) {
            for (let x = startTileX; x < endTileX; x++) {
                const tile = this.tileMap.getTile(x, y);
                if (tile) {
                    const screenX = halfWidth + (x - this.centerX) * this.zoom;
                    const screenY = halfHeight + (y - this.centerY) * this.zoom;

                    // Choose color based on tile type
                    let color;
                    switch (tile.type) {
                        case 'grass':
                            color = '#4CAF50';
                            break;
                        case 'water':
                            color = '#2196F3';
                            break;
                        case 'mountain':
                            color = '#795548';
                            break;
                        case 'forest':
                            color = '#2E7D32';
                            break;
                        case 'path':
                            color = '#BCAAA4';
                            break;
                        default:
                            color = '#666666';
                    }

                    ctx.fillStyle = color;
                    ctx.fillRect(screenX, screenY, this.zoom, this.zoom);
                }
            }
        }

        // Render player position
        if (this.showPlayer) {
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(halfWidth, halfHeight, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Render NPCs (placeholder - would need NPC data)
        if (this.showNPCs) {
            // Example NPC positions - in real implementation, get from tileMap or scene
            const npcs = [
                { x: this.centerX + 10, y: this.centerY + 5 },
                { x: this.centerX - 15, y: this.centerY + 8 }
            ];

            ctx.fillStyle = '#FFFF00';
            npcs.forEach(npc => {
                const screenX = halfWidth + (npc.x - this.centerX) * this.zoom;
                const screenY = halfHeight + (npc.y - this.centerY) * this.zoom;
                ctx.beginPath();
                ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Render quest markers
        if (this.showQuests) {
            // Example quest locations
            const quests = [
                { x: this.centerX + 20, y: this.centerY - 10, type: 'main' },
                { x: this.centerX - 5, y: this.centerY + 15, type: 'side' }
            ];

            quests.forEach(quest => {
                const screenX = halfWidth + (quest.x - this.centerX) * this.zoom;
                const screenY = halfHeight + (quest.y - this.centerY) * this.zoom;

                ctx.fillStyle = quest.type === 'main' ? '#FFD700' : '#87CEEB';
                ctx.beginPath();
                ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
                ctx.fill();

                // Add exclamation mark
                ctx.fillStyle = '#000000';
                ctx.font = '8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('!', screenX, screenY + 2);
            });
        }

        // Render enemies (if toggle enabled)
        if (this.showEnemies) {
            // Example enemy positions
            const enemies = [
                { x: this.centerX + 8, y: this.centerY + 12 }
            ];

            ctx.fillStyle = '#FF0000';
            enemies.forEach(enemy => {
                const screenX = halfWidth + (enemy.x - this.centerX) * this.zoom;
                const screenY = halfHeight + (enemy.y - this.centerY) * this.zoom;
                ctx.fillRect(screenX - 1, screenY - 1, 3, 3);
            });
        }
    }
}

class LocationMarker extends UIComponent {
    constructor(x, y, width, height, location) {
        super(x, y, width, height);
        this.location = location;
        this.isVisited = false;
        this.hasQuest = false;
        this.isCurrentLocation = false;

        this.markerLabel = new Label(width / 2, height / 2, location.name, '10px monospace');
        this.markerLabel.style.textColor = '#ffffff';
        this.markerLabel.style.textAlign = 'center';
        this.markerLabel.style.textBaseline = 'middle';
        this.addChild(this.markerLabel);

        this.updateAppearance();
    }

    updateAppearance() {
        if (this.isCurrentLocation) {
            this.style.backgroundColor = '#FFD700';
            this.markerLabel.style.textColor = '#000000';
        } else if (this.hasQuest) {
            this.style.backgroundColor = '#FF6B6B';
            this.markerLabel.style.textColor = '#ffffff';
        } else if (this.isVisited) {
            this.style.backgroundColor = '#4ECDC4';
            this.markerLabel.style.textColor = '#ffffff';
        } else {
            this.style.backgroundColor = '#95A5A6';
            this.markerLabel.style.textColor = '#ffffff';
        }
    }

    setVisited(visited) {
        this.isVisited = visited;
        this.updateAppearance();
    }

    setHasQuest(hasQuest) {
        this.hasQuest = hasQuest;
        this.updateAppearance();
    }

    setCurrentLocation(isCurrent) {
        this.isCurrentLocation = isCurrent;
        this.updateAppearance();
    }
}

class NavigationCompass extends UIComponent {
    constructor(x, y, size) {
        super(x, y, size, size);
        this.direction = 0; // Radians
        this.targetDirection = null;
        this.showTarget = false;

        this.style = {
            ...this.style,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderColor: '#ffd700',
            borderWidth: 2,
            borderRadius: size / 2
        };
    }

    setDirection(angle) {
        this.direction = angle;
    }

    setTargetDirection(angle) {
        this.targetDirection = angle;
        this.showTarget = true;
    }

    clearTarget() {
        this.targetDirection = null;
        this.showTarget = false;
    }

    renderContent(ctx) {
        const centerX = this.size.width / 2;
        const centerY = this.size.height / 2;
        const radius = (this.size.width - 10) / 2;

        // Draw compass rose
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        // North
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY - radius);
        ctx.stroke();

        // East
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.stroke();

        // South
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY + radius);
        ctx.stroke();

        // West
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX - radius, centerY);
        ctx.stroke();

        // Direction labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N', centerX, centerY - radius - 5);
        ctx.fillText('E', centerX + radius + 5, centerY);
        ctx.fillText('S', centerX, centerY + radius + 5);
        ctx.fillText('W', centerX - radius - 5, centerY);

        // Player direction indicator
        ctx.fillStyle = '#FF0000';
        const playerX = centerX + Math.sin(this.direction) * (radius * 0.7);
        const playerY = centerY - Math.cos(this.direction) * (radius * 0.7);
        ctx.beginPath();
        ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Target direction indicator
        if (this.showTarget && this.targetDirection !== null) {
            ctx.fillStyle = '#00FF00';
            const targetX = centerX + Math.sin(this.targetDirection) * (radius * 0.7);
            const targetY = centerY - Math.cos(this.targetDirection) * (radius * 0.7);
            ctx.beginPath();
            ctx.arc(targetX, targetY, 3, 0, Math.PI * 2);
            ctx.fill();

            // Draw line to target
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

export class MapUI extends UIComponent {
    constructor(engine, tileMap, player) {
        super(0, 0, engine.canvas.width, engine.canvas.height);
        this.engine = engine;
        this.tileMap = tileMap;
        this.player = player;
        this.uiManager = engine.uiManager;
        this.animationManager = new AnimationManager(engine);

        // UI Components
        this.miniMap = null;
        this.locationPanel = null;
        this.compass = null;
        this.locationMarkers = [];
        this.navigationPanel = null;

        // Map state
        this.currentLocation = null;
        this.knownLocations = new Set();
        this.activeQuests = [];
        this.navigationTarget = null;

        this.initializeUI();
        this.setupLocations();
    }

    initializeUI() {
        // Mini-map in top-right corner
        this.miniMap = new MiniMap(
            this.size.width - 220,
            20,
            200,
            200,
            this.tileMap
        );
        this.addChild(this.miniMap);

        // Location panel below mini-map
        this.locationPanel = new Panel(
            this.size.width - 220,
            240,
            200,
            150
        );
        this.locationPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.locationPanel.style.borderColor = '#ffd700';
        this.addChild(this.locationPanel);

        // Add location title
        const locationTitle = new Label(10, 15, 'Current Location', '12px monospace');
        locationTitle.style.textColor = '#ffd700';
        this.locationPanel.addChild(locationTitle);

        // Add location name
        this.locationNameLabel = new Label(10, 35, 'Unknown', '14px monospace');
        this.locationNameLabel.style.textColor = '#ffffff';
        this.locationPanel.addChild(this.locationNameLabel);

        // Compass in top-left
        this.compass = new NavigationCompass(20, 20, 80);
        this.addChild(this.compass);

        // Navigation panel
        this.navigationPanel = new Panel(20, 120, 200, 100);
        this.navigationPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.navigationPanel.style.borderColor = '#ffd700';
        this.addChild(this.navigationPanel);

        // Add navigation info
        const navTitle = new Label(10, 15, 'Navigation', '12px monospace');
        navTitle.style.textColor = '#ffd700';
        this.navigationPanel.addChild(navTitle);

        this.distanceLabel = new Label(10, 35, 'Distance: --', '11px monospace');
        this.distanceLabel.style.textColor = '#ffffff';
        this.navigationPanel.addChild(this.distanceLabel);

        this.directionLabel = new Label(10, 50, 'Direction: --', '11px monospace');
        this.directionLabel.style.textColor = '#ffffff';
        this.navigationPanel.addChild(this.directionLabel);
    }

    setupLocations() {
        // Example locations - in real implementation, load from map data
        const locations = [
            { name: 'Starting Village', x: 50, y: 50, type: 'town' },
            { name: 'Dark Forest', x: 120, y: 80, type: 'dungeon' },
            { name: 'Mountain Pass', x: 200, y: 30, type: 'outdoor' },
            { name: 'Crystal Lake', x: 80, y: 150, type: 'location' },
            { name: 'Ancient Ruins', x: 180, y: 120, type: 'dungeon' }
        ];

        locations.forEach(location => {
            const marker = new LocationMarker(0, 0, 100, 30, location);

            // Position marker on mini-map (simplified scaling)
            const mapScale = this.miniMap.zoom;
            const mapCenterX = this.miniMap.centerX;
            const mapCenterY = this.miniMap.centerY;
            const markerX = this.miniMap.position.x + this.miniMap.size.width / 2 +
                           (location.x - mapCenterX) * mapScale;
            const markerY = this.miniMap.position.y + this.miniMap.size.height / 2 +
                           (location.y - mapCenterY) * mapScale;

            marker.setPosition(markerX - 50, markerY - 15);

            this.locationMarkers.push(marker);
            // Don't add to main UI - markers are positioned relative to mini-map
        });
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.animationManager.update(deltaTime);

        // Update mini-map center
        if (this.player) {
            this.miniMap.updateCenter(this.player.x || 0, this.player.y || 0);
        }

        // Update current location
        this.updateCurrentLocation();

        // Update navigation
        this.updateNavigation();

        // Update compass
        this.updateCompass();
    }

    updateCurrentLocation() {
        if (!this.player) return;

        // Simple location detection based on coordinates
        const playerX = this.player.x || 0;
        const playerY = this.player.y || 0;

        let currentLocation = null;
        let minDistance = Infinity;

        this.locationMarkers.forEach(marker => {
            const location = marker.location;
            const distance = Math.sqrt(
                Math.pow(playerX - location.x, 2) + Math.pow(playerY - location.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                currentLocation = location;
            }

            // Mark as visited if close enough
            if (distance < 10) {
                marker.setVisited(true);
                this.knownLocations.add(location.name);
            }

            // Update current location marker
            marker.setCurrentLocation(location === currentLocation);
        });

        if (currentLocation !== this.currentLocation) {
            this.currentLocation = currentLocation;
            this.locationNameLabel.setText(currentLocation ? currentLocation.name : 'Wilderness');

            // Announce location change for accessibility
            if (this.uiManager) {
                this.uiManager.announceToScreenReader(
                    `Entered location: ${currentLocation ? currentLocation.name : 'Wilderness'}`,
                    'polite'
                );
            }
        }
    }

    updateNavigation() {
        if (!this.navigationTarget || !this.player) {
            this.distanceLabel.setText('Distance: --');
            this.directionLabel.setText('Direction: --');
            this.compass.clearTarget();
            return;
        }

        const playerX = this.player.x || 0;
        const playerY = this.player.y || 0;
        const targetX = this.navigationTarget.x;
        const targetY = this.navigationTarget.y;

        // Calculate distance
        const distance = Math.sqrt(
            Math.pow(targetX - playerX, 2) + Math.pow(targetY - playerY, 2)
        );

        this.distanceLabel.setText(`Distance: ${Math.round(distance)} units`);

        // Calculate direction
        const angle = Math.atan2(targetY - playerY, targetX - playerX);
        const directions = ['North', 'Northeast', 'East', 'Southeast',
                           'South', 'Southwest', 'West', 'Northwest'];
        const directionIndex = Math.round((angle + Math.PI) / (Math.PI / 4)) % 8;
        const direction = directions[directionIndex];

        this.directionLabel.setText(`Direction: ${direction}`);

        // Update compass
        this.compass.setTargetDirection(angle);
    }

    updateCompass() {
        // Update player direction (simplified - would use player facing direction)
        if (this.player && this.player.facing) {
            // Convert facing direction to radians
            const facingAngles = {
                'north': 0,
                'east': Math.PI / 2,
                'south': Math.PI,
                'west': -Math.PI / 2
            };
            this.compass.setDirection(facingAngles[this.player.facing] || 0);
        }
    }

    setNavigationTarget(locationName) {
        const marker = this.locationMarkers.find(m => m.location.name === locationName);
        if (marker) {
            this.navigationTarget = marker.location;

            // Announce navigation target
            if (this.uiManager) {
                this.uiManager.announceToScreenReader(
                    `Navigation set to ${locationName}`,
                    'polite'
                );
            }
        }
    }

    clearNavigationTarget() {
        this.navigationTarget = null;
        this.distanceLabel.setText('Distance: --');
        this.directionLabel.setText('Direction: --');
        this.compass.clearTarget();
    }

    addQuestMarker(locationName) {
        const marker = this.locationMarkers.find(m => m.location.name === locationName);
        if (marker) {
            marker.setHasQuest(true);
            this.activeQuests.push(locationName);
        }
    }

    removeQuestMarker(locationName) {
        const marker = this.locationMarkers.find(m => m.location.name === locationName);
        if (marker) {
            marker.setHasQuest(false);
            const index = this.activeQuests.indexOf(locationName);
            if (index > -1) {
                this.activeQuests.splice(index, 1);
            }
        }
    }

    toggleMiniMapLayer(layer) {
        this.miniMap.toggleLayer(layer);

        // Announce toggle for accessibility
        if (this.uiManager) {
            this.uiManager.announceToScreenReader(
                `${layer} layer ${this.miniMap.showPlayer ? 'shown' : 'hidden'}`,
                'polite'
            );
        }
    }

    zoomMiniMap(increase) {
        const zoomChange = increase ? 0.05 : -0.05;
        this.miniMap.setZoom(this.miniMap.zoom + zoomChange);
    }

    // Public methods for external control
    getKnownLocations() {
        return Array.from(this.knownLocations);
    }

    getCurrentLocation() {
        return this.currentLocation;
    }

    getActiveQuests() {
        return [...this.activeQuests];
    }

    // Render additional UI elements
    render(ctx) {
        if (!this.visible) return;

        super.render(ctx);

        // Render location markers (on top of mini-map)
        this.locationMarkers.forEach(marker => {
            if (this.knownLocations.has(marker.location.name)) {
                marker.render(ctx);
            }
        });
    }

    // Get state for saving
    getState() {
        return {
            knownLocations: Array.from(this.knownLocations),
            activeQuests: [...this.activeQuests],
            navigationTarget: this.navigationTarget ? this.navigationTarget.name : null,
            miniMapZoom: this.miniMap.zoom
        };
    }

    // Restore state from save
    setState(state) {
        if (state.knownLocations) {
            this.knownLocations = new Set(state.knownLocations);
        }
        if (state.activeQuests) {
            this.activeQuests = [...state.activeQuests];
        }
        if (state.navigationTarget) {
            this.setNavigationTarget(state.navigationTarget);
        }
        if (state.miniMapZoom) {
            this.miniMap.setZoom(state.miniMapZoom);
        }

        // Update markers based on state
        this.locationMarkers.forEach(marker => {
            marker.setVisited(this.knownLocations.has(marker.location.name));
            marker.setHasQuest(this.activeQuests.includes(marker.location.name));
        });
    }
}