// Quest Data - Main storyline and side quests for Elyndor RPG
// Contains quest definitions, objectives, and rewards

import { Quest, QuestObjective, QuestReward, QuestType, ObjectiveType, QuestState } from './QuestSystem.js';

// Main Story Quest Line
export const MainStoryQuests = {
    crystal_awakening: new Quest({
        id: 'crystal_awakening',
        title: 'The Crystal Awakening',
        description: 'Discover your crystal mark and learn of your destiny to reunite the lost shards.',
        type: QuestType.MAIN_STORY,
        state: QuestState.AVAILABLE,
        level: 1,
        giver: 'elder_mara',
        objectives: [
            new QuestObjective({
                id: 'meet_elder_mara',
                type: ObjectiveType.TALK,
                description: 'Speak with Elder Mara about your crystal mark',
                required: 1,
                targetId: 'elder_mara'
            }),
            new QuestObjective({
                id: 'learn_crystal_history',
                type: ObjectiveType.CUSTOM,
                description: 'Learn about the Cataclysm and the crystal shards',
                required: 1,
                condition: 'flag.crystal_mark_explained'
            })
        ],
        rewards: [
            new QuestReward({
                type: 'experience',
                amount: 100
            }),
            new QuestReward({
                type: 'item',
                itemId: 'crystal_amulet',
                amount: 1
            })
        ]
    }),

    first_shard: new Quest({
        id: 'first_shard',
        title: 'The Shard of Light',
        description: 'Retrieve the Shard of Light from the Crystal Temple guarded by King Theron.',
        type: QuestType.MAIN_STORY,
        state: QuestState.INACTIVE,
        level: 1,
        giver: 'elder_mara',
        prerequisites: ['quest.crystal_awakening'],
        objectives: [
            new QuestObjective({
                id: 'meet_king_theron',
                type: ObjectiveType.TALK,
                description: 'Speak with King Theron about accessing the Crystal Temple',
                required: 1,
                targetId: 'king_theron'
            }),
            new QuestObjective({
                id: 'enter_crystal_temple',
                type: ObjectiveType.EXPLORE,
                description: 'Enter the Crystal Temple',
                required: 1,
                location: 'crystal_temple_entrance'
            }),
            new QuestObjective({
                id: 'retrieve_shard_of_light',
                type: ObjectiveType.COLLECT,
                description: 'Retrieve the Shard of Light from the temple vault',
                required: 1,
                targetId: 'shard_of_light'
            })
        ],
        rewards: [
            new QuestReward({
                type: 'experience',
                amount: 250
            }),
            new QuestReward({
                type: 'gold',
                amount: 50
            }),
            new QuestReward({
                type: 'item',
                itemId: 'crystal_shard_light',
                amount: 1
            })
        ]
    }),

    shadow_alliance: new Quest({
        id: 'shadow_alliance',
        title: 'Alliance in the Shadows',
        description: 'Form an alliance with Lira Shadowweaver to learn about the shadow threat.',
        type: QuestType.MAIN_STORY,
        state: QuestState.INACTIVE,
        level: 3,
        giver: 'lira_shadowweaver',
        prerequisites: ['quest.first_shard'],
        objectives: [
            new QuestObjective({
                id: 'meet_lira_shadowweaver',
                type: ObjectiveType.TALK,
                description: 'Speak with Lira Shadowweaver about the shadows',
                required: 1,
                targetId: 'lira_shadowweaver'
            }),
            new QuestObjective({
                id: 'clear_shadow_outpost',
                type: ObjectiveType.KILL,
                description: 'Defeat the shadow commander at the eastern outpost',
                required: 1,
                targetId: 'shadow_commander'
            }),
            new QuestObjective({
                id: 'learn_shadow_lore',
                type: ObjectiveType.FLAG,
                description: 'Learn about the Shadow Rift and its origins',
                required: 1,
                targetId: 'shadow_lore_learned'
            })
        ],
        rewards: [
            new QuestReward({
                type: 'experience',
                amount: 400
            }),
            new QuestReward({
                type: 'item',
                itemId: 'shadow_map',
                amount: 1
            })
        ]
    }),

    forge_redemption: new Quest({
        id: 'forge_redemption',
        title: 'Forging Redemption',
        description: 'Help Grom Ironfist restore his corrupted forge to craft weapons against the shadows.',
        type: QuestType.MAIN_STORY,
        state: QuestState.INACTIVE,
        level: 5,
        giver: 'grom_ironfist',
        prerequisites: ['quest.shadow_alliance'],
        objectives: [
            new QuestObjective({
                id: 'meet_grom_ironfist',
                type: ObjectiveType.TALK,
                description: 'Speak with Grom Ironfist about his forge',
                required: 1,
                targetId: 'grom_ironfist'
            }),
            new QuestObjective({
                id: 'gather_crystal_dust',
                type: ObjectiveType.COLLECT,
                description: 'Collect crystal dust from the Crystal Caves',
                required: 5,
                targetId: 'crystal_dust'
            }),
            new QuestObjective({
                id: 'gather_shadow_essence',
                type: ObjectiveType.COLLECT,
                description: 'Collect shadow essence from defeated shadow lords',
                required: 3,
                targetId: 'shadow_essence'
            }),
            new QuestObjective({
                id: 'gather_volcanic_ore',
                type: ObjectiveType.COLLECT,
                description: 'Mine pure volcanic ore from the Forge Peaks',
                required: 10,
                targetId: 'volcanic_ore'
            })
        ],
        rewards: [
            new QuestReward({
                type: 'experience',
                amount: 600
            }),
            new QuestReward({
                type: 'item',
                itemId: 'legendary_weapon',
                amount: 1
            })
        ]
    }),

    rift_confrontation: new Quest({
        id: 'rift_confrontation',
        title: 'The Heart of the Rift',
        description: 'Confront the source of the shadow invasion at the Shadow Rift.',
        type: QuestType.MAIN_STORY,
        state: QuestState.INACTIVE,
        level: 8,
        giver: 'elder_mara',
        prerequisites: ['quest.forge_redemption', 'quest.alliance_formed'],
        objectives: [
            new QuestObjective({
                id: 'enter_shadow_rift',
                type: ObjectiveType.EXPLORE,
                description: 'Enter the Shadow Rift',
                required: 1,
                location: 'shadow_rift_entrance'
            }),
            new QuestObjective({
                id: 'defeat_shadow_lords',
                type: ObjectiveType.KILL,
                description: 'Defeat the three Shadow Lords guarding the rift',
                required: 3,
                targetId: 'shadow_lord'
            }),
            new QuestObjective({
                id: 'seal_the_rift',
                type: ObjectiveType.CUSTOM,
                description: 'Use the reunited crystal shards to seal the Shadow Rift',
                required: 1,
                condition: 'flag.all_shards_collected'
            })
        ],
        rewards: [
            new QuestReward({
                type: 'experience',
                amount: 1500
            }),
            new QuestReward({
                type: 'gold',
                amount: 500
            }),
            new QuestReward({
                type: 'item',
                itemId: 'crystal_heart',
                amount: 1
            })
        ]
    })
};

// Side Quests
export const SideQuests = {
    village_defense: new Quest({
        id: 'village_defense',
        title: 'Guardian of the Village',
        description: 'Help the village prepare defenses against recurring shadow raids.',
        type: QuestType.SIDE_QUEST,
        state: QuestState.AVAILABLE,
        level: 2,
        giver: 'village_elder',
        objectives: [
            new QuestObjective({
                id: 'set_up_barricades',
                type: ObjectiveType.CUSTOM,
                description: 'Set up defensive barricades around the village',
                required: 1,
                condition: 'flag.village_barricades_built'
            }),
            new QuestObjective({
                id: 'train_villagers',
                type: ObjectiveType.CUSTOM,
                description: 'Train 5 villagers in basic combat',
                required: 5,
                condition: 'context.villagers_trained >= 5'
            }),
            new QuestObjective({
                id: 'repel_raid',
                type: ObjectiveType.KILL,
                description: 'Defeat the shadow raiders attacking the village',
                required: 10,
                targetId: 'shadow_raider'
            })
        ],
        rewards: [
            new QuestReward({
                type: 'experience',
                amount: 300
            }),
            new QuestReward({
                type: 'gold',
                amount: 75
            }),
            new QuestReward({
                type: 'item',
                itemId: 'defensive_ward',
                amount: 1
            })
        ]
    }),

    lost_merchant: new Quest({
        id: 'lost_merchant',
        title: 'The Lost Merchant',
        description: 'Find the missing merchant who was last seen heading to the Whispering Winds.',
        type: QuestType.SIDE_QUEST,
        state: QuestState.AVAILABLE,
        level: 3,
        giver: 'merchant_guild',
        objectives: [
            new QuestObjective({
                id: 'investigate_merchant_route',
                type: ObjectiveType.EXPLORE,
                description: 'Investigate the merchant\'s last known route',
                required: 1,
                location: 'merchant_road'
            }),
            new QuestObjective({
                id: 'find_merchant_caravan',
                type: ObjectiveType.EXPLORE,
                description: 'Locate the merchant\'s caravan in the Whispering Winds',
                required: 1,
                location: 'whispering_winds_camp'
            }),
            new QuestObjective({
                id: 'rescue_merchant',
                type: ObjectiveType.CUSTOM,
                description: 'Rescue the merchant from the storm spirits',
                required: 1,
                condition: 'flag.merchant_rescued'
            })
        ],
        rewards: [
            new QuestReward({
                type: 'experience',
                amount: 350
            }),
            new QuestReward({
                type: 'gold',
                amount: 100
            }),
            new QuestReward({
                type: 'item',
                itemId: 'storm_essence',
                amount: 3
            })
        ]
    }),

    ancient_ruins: new Quest({
        id: 'ancient_ruins',
        title: 'Echoes of the Past',
        description: 'Explore the ancient ruins that appeared after the Cataclysm.',
        type: QuestType.SIDE_QUEST,
        state: QuestState.AVAILABLE,
        level: 4,
        giver: 'archaeologist',
        objectives: [
            new QuestObjective({
                id: 'enter_ruins',
                type: ObjectiveType.EXPLORE,
                description: 'Enter the ancient ruins',
                required: 1,
                location: 'ancient_ruins_entrance'
            }),
            new QuestObjective({
                id: 'solve_puzzle',
                type: ObjectiveType.CUSTOM,
                description: 'Solve the ancient puzzle guarding the inner chamber',
                required: 1,
                condition: 'flag.ruin_puzzle_solved'
            }),
            new QuestObjective({
                id: 'retrieve_artifact',
                type: ObjectiveType.COLLECT,
                description: 'Retrieve the ancient artifact from the ruins',
                required: 1,
                targetId: 'ancient_artifact'
            })
        ],
        rewards: [
            new QuestReward({
                type: 'experience',
                amount: 450
            }),
            new QuestReward({
                type: 'item',
                itemId: 'ancient_tome',
                amount: 1
            })
        ]
    }),

    elemental_balance: new Quest({
        id: 'elemental_balance',
        title: 'Restoring Balance',
        description: 'Help restore the balance between the elemental spirits disrupted by the Cataclysm.',
        type: QuestType.SIDE_QUEST,
        state: QuestState.AVAILABLE,
        level: 6,
        giver: 'spirit_shaman',
        objectives: [
            new QuestObjective({
                id: 'visit_fire_spirit',
                type: ObjectiveType.TALK,
                description: 'Speak with the Fire Spirit in the Forge Lands',
                required: 1,
                targetId: 'fire_spirit'
            }),
            new QuestObjective({
                id: 'visit_water_spirit',
                type: ObjectiveType.TALK,
                description: 'Speak with the Water Spirit in the Endless Plains',
                required: 1,
                targetId: 'water_spirit'
            }),
            new QuestObjective({
                id: 'visit_air_spirit',
                type: ObjectiveType.TALK,
                description: 'Speak with the Air Spirit in the Whispering Winds',
                required: 1,
                targetId: 'air_spirit'
            }),
            new QuestObjective({
                id: 'visit_earth_spirit',
                type: ObjectiveType.TALK,
                description: 'Speak with the Earth Spirit in the Crystal Spires',
                required: 1,
                targetId: 'earth_spirit'
            }),
            new QuestObjective({
                id: 'perform_ritual',
                type: ObjectiveType.CUSTOM,
                description: 'Perform the ritual to restore elemental balance',
                required: 1,
                condition: 'flag.elemental_balance_restored'
            })
        ],
        rewards: [
            new QuestReward({
                type: 'experience',
                amount: 800
            }),
            new QuestReward({
                type: 'item',
                itemId: 'elemental_ring',
                amount: 1
            })
        ]
    })
};

// All quests collection for easy loading
export const AllQuests = {
    ...MainStoryQuests,
    ...SideQuests
};

// Quest progression requirements
export const QuestPrerequisites = {
    crystal_awakening: [],
    first_shard: ['crystal_awakening'],
    shadow_alliance: ['first_shard'],
    forge_redemption: ['shadow_alliance'],
    rift_confrontation: ['forge_redemption', 'elemental_balance'],

    village_defense: [],
    lost_merchant: ['level.3'],
    ancient_ruins: ['level.4'],
    elemental_balance: ['level.6', 'flag.elemental_spirits_known']
};

export { MainStoryQuests, SideQuests, AllQuests, QuestPrerequisites };