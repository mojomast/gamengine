/**
 * Slopvania Save System
 * Following the warp.md guidelines for enhanced save/load functionality
 */

class SlopvaniaSaveSystem {
    constructor() {
        this.saveKey = 'slopvania_save_data';
        this.version = '1.0';
        this.defaultSaveData = {
            version: this.version,
            timestamp: Date.now(),
            gameState: {
                player: {
                    x: 200,
                    y: 0,
                    health: 100,
                    maxHealth: 100
                },
                abilities: {
                    jump: true,
                    dash: false,
                    wallJump: false,
                    doubleJump: false
                },
                currentArea: 'start',
                visitedAreas: ['start'],
                collectedItems: [],
                playTime: 0,
                deaths: 0,
                completionPercentage: 0
            },
            world: {
                collectedUpgrades: []
            },
            ui: {
                showHints: true,
                musicVolume: 1.0,
                sfxVolume: 1.0
            }
        };
    }

    // Save current game state
    saveGame(gameState) {
        try {
            const saveData = {
                version: this.version,
                timestamp: Date.now(),
                gameState: {
                    player: {
                        x: gameState.player?.position.x || 200,
                        y: gameState.player?.position.y || 0,
                        health: gameState.health,
                        maxHealth: gameState.maxHealth
                    },
                    abilities: { ...gameState.abilities },
                    currentArea: gameState.currentArea,
                    visitedAreas: Array.from(gameState.visitedAreas || []),
                    collectedItems: Array.from(gameState.collectedItems || []),
                    playTime: gameState.playTime || 0,
                    deaths: gameState.deaths || 0,
                    completionPercentage: this.calculateCompletion(gameState)
                },
                world: {
                    collectedUpgrades: this.getCollectedUpgrades(gameState)
                },
                ui: {
                    showHints: gameState.showHints ?? true,
                    musicVolume: gameState.musicVolume ?? 1.0,
                    sfxVolume: gameState.sfxVolume ?? 1.0
                }
            };

            // Compress save data for efficiency
            const compressedData = this.compressSaveData(saveData);
            
            // Save to localStorage with backup
            localStorage.setItem(this.saveKey, JSON.stringify(compressedData));
            localStorage.setItem(this.saveKey + '_backup', JSON.stringify(compressedData));
            
            // Show save confirmation
            this.showSaveNotification('Game Saved Successfully!');
            
            console.log('Game saved successfully:', saveData);
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            this.showSaveNotification('Save Failed! Please try again.', 'error');
            return false;
        }
    }

    // Load game state
    loadGame() {
        try {
            let saveDataString = localStorage.getItem(this.saveKey);
            
            // Try backup if main save is corrupted
            if (!saveDataString) {
                saveDataString = localStorage.getItem(this.saveKey + '_backup');
            }
            
            if (!saveDataString) {
                console.log('No save data found, using defaults');
                return this.defaultSaveData;
            }

            const saveData = JSON.parse(saveDataString);
            
            // Validate save data version
            if (!this.validateSaveData(saveData)) {
                console.warn('Save data invalid or outdated, using defaults');
                return this.defaultSaveData;
            }

            // Decompress if needed
            const decompressedData = this.decompressSaveData(saveData);
            
            console.log('Game loaded successfully:', decompressedData);
            this.showSaveNotification('Game Loaded Successfully!');
            
            return decompressedData;
        } catch (error) {
            console.error('Failed to load game:', error);
            this.showSaveNotification('Load Failed! Starting new game.', 'error');
            return this.defaultSaveData;
        }
    }

    // Check if save data exists
    hasSaveData() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    // Delete save data
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            localStorage.removeItem(this.saveKey + '_backup');
            this.showSaveNotification('Save data deleted.');
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }

    // Get save file info
    getSaveInfo() {
        try {
            const saveDataString = localStorage.getItem(this.saveKey);
            if (!saveDataString) return null;
            
            const saveData = JSON.parse(saveDataString);
            return {
                timestamp: saveData.timestamp,
                date: new Date(saveData.timestamp).toLocaleString(),
                version: saveData.version,
                completionPercentage: saveData.gameState.completionPercentage || 0,
                playTime: saveData.gameState.playTime || 0,
                abilities: Object.keys(saveData.gameState.abilities).filter(key => 
                    saveData.gameState.abilities[key]).length
            };
        } catch (error) {
            console.error('Failed to get save info:', error);
            return null;
        }
    }

    // Validate save data structure and version
    validateSaveData(saveData) {
        if (!saveData || typeof saveData !== 'object') return false;
        if (!saveData.version || !saveData.gameState) return false;
        
        // Check version compatibility
        const [majorVersion] = this.version.split('.');
        const [saveMajorVersion] = (saveData.version || '0.0').split('.');
        
        return majorVersion === saveMajorVersion;
    }

    // Calculate game completion percentage
    calculateCompletion(gameState) {
        let completion = 0;
        const totalItems = 4; // Jump (default) + Dash + WallJump + DoubleJump
        
        // Count unlocked abilities
        const unlockedAbilities = Object.values(gameState.abilities).filter(Boolean).length;
        completion += (unlockedAbilities / totalItems) * 80; // Abilities are 80% of completion
        
        // Count visited areas
        const totalAreas = 4; // start, dash, wallJump, doubleJump areas
        const visitedCount = gameState.visitedAreas ? gameState.visitedAreas.size : 1;
        completion += (visitedCount / totalAreas) * 20; // Exploration is 20% of completion
        
        return Math.round(completion);
    }

    // Get collected upgrade items
    getCollectedUpgrades(gameState) {
        const upgrades = [];
        if (gameState.abilities.dash) upgrades.push('dash');
        if (gameState.abilities.wallJump) upgrades.push('wallJump');
        if (gameState.abilities.doubleJump) upgrades.push('doubleJump');
        return upgrades;
    }

    // Simple compression for save data (remove redundant data)
    compressSaveData(saveData) {
        // For now, just return as-is. Could implement actual compression if needed
        return saveData;
    }

    // Decompress save data
    decompressSaveData(saveData) {
        // For now, just return as-is. Could implement actual decompression if needed
        return saveData;
    }

    // Show save/load notifications
    showSaveNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const color = type === 'error' ? '#ff6b6b' : '#00f593';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: ${color};
            padding: 15px 20px;
            border: 2px solid ${color};
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            z-index: 2000;
            pointer-events: none;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Auto-save functionality
    startAutoSave(gameStateGetter, intervalMinutes = 2) {
        setInterval(() => {
            const currentGameState = gameStateGetter();
            if (currentGameState) {
                this.saveGame(currentGameState);
            }
        }, intervalMinutes * 60 * 1000);
        
        console.log(`Auto-save started: saving every ${intervalMinutes} minutes`);
    }

    // Export save data (for sharing or backup)
    exportSave() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) {
                this.showSaveNotification('No save data to export!', 'error');
                return null;
            }
            
            const exportData = {
                game: 'Slopvania',
                version: this.version,
                exportDate: new Date().toISOString(),
                data: saveData
            };
            
            const exportString = btoa(JSON.stringify(exportData));
            
            // Create download link
            const blob = new Blob([exportString], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `slopvania_save_${new Date().toISOString().slice(0, 10)}.sav`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showSaveNotification('Save exported successfully!');
            
            return exportString;
        } catch (error) {
            console.error('Failed to export save:', error);
            this.showSaveNotification('Export failed!', 'error');
            return null;
        }
    }

    // Import save data
    importSave(importString) {
        try {
            const exportData = JSON.parse(atob(importString));
            
            if (exportData.game !== 'Slopvania') {
                throw new Error('Invalid save file for Slopvania');
            }
            
            const saveData = JSON.parse(exportData.data);
            
            if (!this.validateSaveData(saveData)) {
                throw new Error('Invalid or corrupted save data');
            }
            
            // Backup current save before importing
            const currentSave = localStorage.getItem(this.saveKey);
            if (currentSave) {
                localStorage.setItem(this.saveKey + '_import_backup', currentSave);
            }
            
            // Import the new save
            localStorage.setItem(this.saveKey, exportData.data);
            localStorage.setItem(this.saveKey + '_backup', exportData.data);
            
            this.showSaveNotification('Save imported successfully! Reload the game to apply.');
            return true;
        } catch (error) {
            console.error('Failed to import save:', error);
            this.showSaveNotification('Import failed! Invalid save file.', 'error');
            return false;
        }
    }
}

// Global save system instance
window.SlopvaniaSaveSystem = SlopvaniaSaveSystem;

export { SlopvaniaSaveSystem };