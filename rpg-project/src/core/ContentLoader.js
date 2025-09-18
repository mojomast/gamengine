// Content Loader - Integrates all game content with RPGEngine
// Loads quests, NPCs, items, dialogs, and other content into the game engine

import { RPGEngine } from './RPGEngine.js';
import { QuestManager } from './QuestSystem.js';
import { DialogTree } from './DialogTree.js';
import { NPC } from './NPC.js';
import { AllItems } from './ItemData.js';
import { MainStoryQuests, SideQuests } from './QuestData.js';
import { NPCDefinitions, NPCDialogTrees } from './NPCData.js';
import { GameLore, GameDialogs } from './GameContent.js';
import { BossEncounters } from './BossData.js';
import { DUNGEON_MAPS } from '../map/DungeonData.js';
import { BalanceValidator } from './BalanceData.js';

export class ContentLoader {
    constructor(engine) {
        this.engine = engine;
        this.loadedContent = {
            quests: new Map(),
            npcs: new Map(),
            items: new Map(),
            dialogs: new Map(),
            maps: new Map(),
            bosses: new Map()
        };
        this.balanceValidator = new BalanceValidator();
        this.loadProgress = 0;
        this.totalContent = 0;
    }

    /**
     * Load all game content
     */
    async loadAllContent() {
        console.log('Starting content loading...');

        try {
            // Calculate total content for progress tracking
            this.calculateTotalContent();

            // Load content in order
            await this.loadItems();
            await this.loadDialogs();
            await this.loadNPCs();
            await this.loadQuests();
            await this.loadMaps();
            await this.loadBosses();

            // Validate loaded content
            await this.validateAllContent();

            // Initialize content relationships
            await this.initializeContentRelationships();

            console.log('All content loaded successfully!');
            console.log(`Loaded ${this.loadedContent.quests.size} quests, ${this.loadedContent.npcs.size} NPCs, ${this.loadedContent.items.size} items`);

            return {
                success: true,
                loadedContent: this.loadedContent,
                progress: 100
            };

        } catch (error) {
            console.error('Failed to load content:', error);
            return {
                success: false,
                error: error.message,
                loadedContent: this.loadedContent,
                progress: this.loadProgress
            };
        }
    }

    /**
     * Calculate total content for progress tracking
     */
    calculateTotalContent() {
        this.totalContent =
            Object.keys(AllItems).length +
            Object.keys(GameDialogs).length +
            Object.keys(NPCDefinitions).length +
            Object.keys(MainStoryQuests).length +
            Object.keys(SideQuests).length +
            Object.keys(DUNGEON_MAPS).length +
            Object.keys(BossEncounters).length;
    }

    /**
     * Load items into the game
     */
    async loadItems() {
        console.log('Loading items...');

        for (const [itemId, item] of Object.entries(AllItems)) {
            try {
                // Validate item balance
                const validation = this.balanceValidator.validateItemStats(item, item.levelRequirement || 1);
                if (!validation.valid) {
                    console.warn(`Item ${itemId} failed validation:`, validation.errors);
                }

                // Add to engine's item database
                if (this.engine.itemDatabase) {
                    this.engine.itemDatabase.addItem(item);
                }

                this.loadedContent.items.set(itemId, item);
                this.updateProgress();

            } catch (error) {
                console.error(`Failed to load item ${itemId}:`, error);
            }
        }

        console.log(`Loaded ${this.loadedContent.items.size} items`);
    }

    /**
     * Load dialogs into the game
     */
    async loadDialogs() {
        console.log('Loading dialogs...');

        // Load main story dialogs
        for (const [dialogId, dialogTree] of Object.entries(GameDialogs)) {
            try {
                this.loadedContent.dialogs.set(dialogId, dialogTree);
                this.updateProgress();
            } catch (error) {
                console.error(`Failed to load dialog ${dialogId}:`, error);
            }
        }

        // Load NPC dialogs
        for (const [dialogId, dialogTree] of Object.entries(NPCDialogTrees)) {
            try {
                this.loadedContent.dialogs.set(dialogId, dialogTree);
                this.updateProgress();
            } catch (error) {
                console.error(`Failed to load NPC dialog ${dialogId}:`, error);
            }
        }

        console.log(`Loaded ${this.loadedContent.dialogs.size} dialogs`);
    }

    /**
     * Load NPCs into the game
     */
    async loadNPCs() {
        console.log('Loading NPCs...');

        for (const [npcId, npcConfig] of Object.entries(NPCDefinitions)) {
            try {
                // Create NPC instance
                const npc = new NPC(
                    npcConfig.position.x,
                    npcConfig.position.y,
                    npcConfig
                );

                // Link dialog if available
                if (npcConfig.dialogId && this.loadedContent.dialogs.has(npcConfig.dialogId)) {
                    npc.dialogTree = this.loadedContent.dialogs.get(npcConfig.dialogId);
                }

                // Add to engine's scene or NPC manager
                if (this.engine.scene) {
                    this.engine.scene.addGameObject(npc);
                }

                this.loadedContent.npcs.set(npcId, npc);
                this.updateProgress();

            } catch (error) {
                console.error(`Failed to load NPC ${npcId}:`, error);
            }
        }

        console.log(`Loaded ${this.loadedContent.npcs.size} NPCs`);
    }

    /**
     * Load quests into the game
     */
    async loadQuests() {
        console.log('Loading quests...');

        // Initialize quest manager if not exists
        if (!this.engine.questManager) {
            this.engine.questManager = new QuestManager(this.engine.eventBus, this.engine.dialogManager);
        }

        // Load main story quests
        for (const [questId, quest] of Object.entries(MainStoryQuests)) {
            try {
                // Validate quest balance
                const validation = this.balanceValidator.validateQuestBalance(quest);
                if (!validation.valid) {
                    console.warn(`Quest ${questId} failed validation:`, validation.errors);
                }

                this.engine.questManager.addQuest(quest);
                this.loadedContent.quests.set(questId, quest);
                this.updateProgress();

            } catch (error) {
                console.error(`Failed to load quest ${questId}:`, error);
            }
        }

        // Load side quests
        for (const [questId, quest] of Object.entries(SideQuests)) {
            try {
                const validation = this.balanceValidator.validateQuestBalance(quest);
                if (!validation.valid) {
                    console.warn(`Quest ${questId} failed validation:`, validation.errors);
                }

                this.engine.questManager.addQuest(quest);
                this.loadedContent.quests.set(questId, quest);
                this.updateProgress();

            } catch (error) {
                console.error(`Failed to load quest ${questId}:`, error);
            }
        }

        console.log(`Loaded ${this.loadedContent.quests.size} quests`);
    }

    /**
     * Load dungeon maps
     */
    async loadMaps() {
        console.log('Loading maps...');

        for (const [mapId, mapData] of Object.entries(DUNGEON_MAPS)) {
            try {
                this.loadedContent.maps.set(mapId, mapData);
                this.updateProgress();
            } catch (error) {
                console.error(`Failed to load map ${mapId}:`, error);
            }
        }

        console.log(`Loaded ${this.loadedContent.maps.size} maps`);
    }

    /**
     * Load boss encounters
     */
    async loadBosses() {
        console.log('Loading bosses...');

        for (const [bossId, bossData] of Object.entries(BossEncounters)) {
            try {
                // Validate boss balance
                const validation = this.balanceValidator.validateEnemyStats(bossData, 'normal');
                if (!validation.valid) {
                    console.warn(`Boss ${bossId} failed validation:`, validation.errors);
                }

                this.loadedContent.bosses.set(bossId, bossData);
                this.updateProgress();

            } catch (error) {
                console.error(`Failed to load boss ${bossId}:`, error);
            }
        }

        console.log(`Loaded ${this.loadedContent.bosses.size} bosses`);
    }

    /**
     * Validate all loaded content
     */
    async validateAllContent() {
        console.log('Validating content balance...');

        let totalWarnings = 0;
        let totalErrors = 0;

        // Validate quests
        for (const [questId, quest] of this.loadedContent.quests) {
            const validation = this.balanceValidator.validateQuestBalance(quest);
            totalWarnings += validation.warnings.length;
            totalErrors += validation.errors.length;
        }

        // Validate NPCs (character stats)
        for (const [npcId, npc] of this.loadedContent.npcs) {
            if (npc.stats) {
                const validation = this.balanceValidator.validateCharacterStats(npc, npc.level || 1);
                totalWarnings += validation.warnings.length;
                totalErrors += validation.errors.length;
            }
        }

        // Validate items
        for (const [itemId, item] of this.loadedContent.items) {
            const validation = this.balanceValidator.validateItemStats(item, item.levelRequirement || 1);
            totalWarnings += validation.warnings.length;
            totalErrors += validation.errors.length;
        }

        console.log(`Content validation complete: ${totalWarnings} warnings, ${totalErrors} errors`);
    }

    /**
     * Initialize relationships between content
     */
    async initializeContentRelationships() {
        console.log('Initializing content relationships...');

        // Link NPCs to their dialogs
        for (const [npcId, npc] of this.loadedContent.npcs) {
            if (npc.dialogId && this.loadedContent.dialogs.has(npc.dialogId)) {
                npc.dialogTree = this.loadedContent.dialogs.get(npc.dialogId);
            }
        }

        // Link quests to NPCs
        for (const [questId, quest] of this.loadedContent.quests) {
            if (quest.giver && this.loadedContent.npcs.has(quest.giver)) {
                quest.giverNPC = this.loadedContent.npcs.get(quest.giver);
            }
        }

        // Initialize quest prerequisites
        for (const [questId, quest] of this.loadedContent.quests) {
            if (quest.prerequisites) {
                quest.prerequisites.forEach(prereq => {
                    if (prereq.startsWith('quest.') && this.loadedContent.quests.has(prereq.substring(6))) {
                        // Prerequisite quest exists
                    }
                });
            }
        }

        console.log('Content relationships initialized');
    }

    /**
     * Update loading progress
     */
    updateProgress() {
        this.loadProgress = Math.min(100, ((this.loadedContent.quests.size +
                                           this.loadedContent.npcs.size +
                                           this.loadedContent.items.size +
                                           this.loadedContent.dialogs.size +
                                           this.loadedContent.maps.size +
                                           this.loadedContent.bosses.size) / this.totalContent) * 100);
    }

    /**
     * Get loaded content by type
     */
    getContent(type, id = null) {
        if (id) {
            return this.loadedContent[type]?.get(id);
        }
        return this.loadedContent[type];
    }

    /**
     * Get all lore content
     */
    getLore() {
        return GameLore;
    }

    /**
     * Get game configuration for initial setup
     */
    getGameConfig() {
        return {
            startingLocation: { x: 100, y: 150 },
            startingQuests: ['crystal_awakening'],
            startingItems: ['iron_sword', 'leather_armor', 'health_potion'],
            worldLore: GameLore.world,
            difficulty: 'normal'
        };
    }

    /**
     * Initialize starting game state
     */
    async initializeGameState() {
        const config = this.getGameConfig();

        // Set starting quests as available
        config.startingQuests.forEach(questId => {
            const quest = this.loadedContent.quests.get(questId);
            if (quest && this.engine.questManager) {
                // Make quest available
                quest.state = 'available';
                this.engine.questManager.availableQuests.add(questId);
            }
        });

        // Add starting items to player inventory
        if (this.engine.inventoryManager) {
            config.startingItems.forEach(itemId => {
                const item = this.loadedContent.items.get(itemId);
                if (item) {
                    this.engine.inventoryManager.addItem(item);
                }
            });
        }

        console.log('Game state initialized with starting content');
        return config;
    }

    /**
     * Get content statistics
     */
    getStatistics() {
        return {
            quests: {
                total: this.loadedContent.quests.size,
                mainStory: Object.keys(MainStoryQuests).length,
                sideQuests: Object.keys(SideQuests).length
            },
            npcs: this.loadedContent.npcs.size,
            items: this.loadedContent.items.size,
            dialogs: this.loadedContent.dialogs.size,
            maps: this.loadedContent.maps.size,
            bosses: this.loadedContent.bosses.size,
            totalContent: this.totalContent,
            loadProgress: this.loadProgress
        };
    }
}

export { ContentLoader };