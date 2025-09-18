// NPC Data - Non-player characters with personalities, dialogs, and behaviors
// Contains NPC definitions, personality traits, and dialog trees for Elyndor RPG

import { NPC } from './NPC.js';
import { DialogTree, DialogChoice, DialogNode } from './DialogTree.js';

// NPC Personality Definitions with detailed traits
export const NPCPersonalities = {
    elder_mara: {
        basePersonality: 'wise_crone',
        traits: {
            wisdom: 95,
            kindness: 80,
            mysteriousness: 90,
            determination: 85
        },
        speechPatterns: [
            'Speaks in ancient proverbs and metaphors',
            'Uses formal, archaic language',
            'Often pauses for dramatic effect',
            'References long-forgotten lore'
        ],
        behavioralTendencies: [
            'Sits quietly in contemplation',
            'Offers cryptic advice',
            'Shows hidden pain in eyes',
            'Creates protective wards magically'
        ],
        relationshipDynamics: {
            player: { trust: 'growing', respect: 'deep', understanding: 'mystical' },
            king_theron: { alliance: 'ancient', respect: 'mutual', tension: 'political' },
            villagers: { protection: 'maternal', guidance: 'spiritual', love: 'familial' }
        }
    },

    king_theron: {
        basePersonality: 'noble_ruler',
        traits: {
            leadership: 90,
            honor: 85,
            responsibility: 95,
            doubt: 60
        },
        speechPatterns: [
            'Uses royal "we" in formal situations',
            'Speaks with authority and command',
            'Expresses concern for his people',
            'Makes diplomatic compromises'
        ],
        behavioralTendencies: [
            'Stands tall with regal bearing',
            'Consults advisors frequently',
            'Shows weariness from constant decisions',
            'Maintains strict court protocol'
        ],
        relationshipDynamics: {
            player: { alliance: 'potential', respect: 'earned', trust: 'testing' },
            elder_mara: { history: 'long', respect: 'deep', tension: 'generational' },
            court: { loyalty: 'demanded', protection: 'sacred', burden: 'heavy' }
        }
    },

    lira_shadowweaver: {
        basePersonality: 'enigmatic_rogue',
        traits: {
            cunning: 95,
            independence: 90,
            self_preservation: 85,
            hidden_loyalty: 70
        },
        speechPatterns: [
            'Uses metaphors about shadows and light',
            'Speaks cryptically about multiple meanings',
            'Negotiates terms carefully',
            'Reveals information gradually'
        ],
        behavioralTendencies: [
            'Appears and disappears unexpectedly',
            'Maintains multiple escape routes',
            'Observes more than participates',
            'Has contingency plans for everything'
        ],
        relationshipDynamics: {
            player: { partnership: 'transactional', respect: 'earned', trust: 'limited' },
            shadows: { understanding: 'intimate', control: 'partial', fear: 'none' },
            society: { outsider: 'self-chosen', manipulator: 'skilled', target: 'constant' }
        }
    },

    grom_ironfist: {
        basePersonality: 'gruff_artisan',
        traits: {
            craftsmanship: 95,
            honor: 80,
            grief: 85,
            determination: 90
        },
        speechPatterns: [
            'Uses dwarven expressions and oaths',
            'Speaks bluntly and directly',
            'Expresses pride in quality work',
            'Shows anger at corruption and waste'
        ],
        behavioralTendencies: [
            'Works tirelessly at his forge',
            'Inspects tools and materials constantly',
            'Shows craftsmanship through actions',
            'Protects his work fiercely'
        ],
        relationshipDynamics: {
            player: { respect: 'earned_through_skill', alliance: 'forged_in_fire' },
            dwarven_clan: { loss: 'devastating', memory: 'sacred', vengeance: 'cold' },
            craftsmanship: { passion: 'all-consuming', pride: 'righteous', purity: 'essential' }
        }
    },

    tavern_keeper: {
        basePersonality: 'jovial_host',
        traits: {
            hospitality: 90,
            gossip: 75,
            business_sense: 85,
            discretion: 70
        },
        speechPatterns: [
            'Greets everyone warmly by name',
            'Shares latest rumors and news',
            'Negotiates prices fairly',
            'Offers unsolicited advice'
        ],
        behavioralTendencies: [
            'Keeps tavern clean and welcoming',
            'Remembers regular customers',
            'Mediates disputes peacefully',
            'Knows everyone\'s business'
        ]
    },

    wandering_merchant: {
        basePersonality: 'charming_salesman',
        traits: {
            persuasion: 85,
            adaptability: 80,
            greed: 60,
            charisma: 90
        },
        speechPatterns: [
            'Uses sales patter and flattery',
            'Tells exaggerated stories',
            'Negotiates aggressively',
            'Complains about "hard times"'
        ],
        behavioralTendencies: [
            'Sets up shop wherever profitable',
            'Travels with caravan guards',
            'Collects rare and exotic items',
            'Makes friends easily'
        ]
    },

    village_guard: {
        basePersonality: 'dutiful_soldier',
        traits: {
            discipline: 85,
            loyalty: 90,
            suspicion: 70,
            courage: 80
        },
        speechPatterns: [
            'Speaks formally and directly',
            'Asks for identification',
            'Reports to superiors regularly',
            'Expresses concern for safety'
        ],
        behavioralTendencies: [
            'Patrols assigned routes',
            'Checks for suspicious activity',
            'Helps citizens in need',
            'Follows orders precisely'
        ]
    },

    mysterious_stranger: {
        basePersonality: 'enigmatic_wanderer',
        traits: {
            mystery: 95,
            knowledge: 85,
            detachment: 80,
            insight: 75
        },
        speechPatterns: [
            'Speaks in riddles and hints',
            'Reveals information reluctantly',
            'Asks more questions than answers',
            'Shows flashes of deep wisdom'
        ],
        behavioralTendencies: [
            'Appears at significant moments',
            'Observes without interfering',
            'Disappears when questions get too direct',
            'Leaves cryptic clues or gifts'
        ]
    }
};

// NPC Definitions with detailed configurations
export const NPCDefinitions = {
    elder_mara: new NPC(100, 150, {
        id: 'elder_mara',
        name: 'Elder Mara',
        displayName: 'Elder Mara',
        description: 'An ancient guardian with eyes that hold centuries of wisdom and sorrow.',
        personality: NPCPersonalities.elder_mara,
        dialogId: 'elder_mara_greeting',
        sprite: 'elder_mara_sprite',
        portrait: 'elder_mara_portrait',
        interactionRadius: 40,
        behaviorType: 'static',
        movementPattern: 'static',
        level: 15,
        stats: {
            health: 200,
            maxHealth: 200,
            mana: 300,
            maxMana: 300
        }
    }),

    king_theron: new NPC(400, 100, {
        id: 'king_theron',
        name: 'King Theron',
        displayName: 'His Majesty King Theron',
        description: 'The noble ruler of the Crystal Kingdom, bearing the weight of his crown and responsibilities.',
        personality: NPCPersonalities.king_theron,
        dialogId: 'king_theron_meeting',
        sprite: 'king_theron_sprite',
        portrait: 'king_theron_portrait',
        interactionRadius: 35,
        behaviorType: 'static',
        movementPattern: 'static',
        level: 12,
        stats: {
            health: 180,
            maxHealth: 180,
            mana: 150,
            maxMana: 150
        }
    }),

    lira_shadowweaver: new NPC(200, 300, {
        id: 'lira_shadowweaver',
        name: 'Lira Shadowweaver',
        displayName: 'The Shadow Weaver',
        description: 'A mysterious figure who moves between worlds, her motives as fluid as shadow itself.',
        personality: NPCPersonalities.lira_shadowweaver,
        dialogId: 'lira_shadowweaver_encounter',
        sprite: 'lira_shadowweaver_sprite',
        portrait: 'lira_shadowweaver_portrait',
        interactionRadius: 30,
        behaviorType: 'wander',
        movementPattern: 'wander',
        wanderRadius: 100,
        level: 10,
        stats: {
            health: 120,
            maxHealth: 120,
            mana: 200,
            maxMana: 200
        }
    }),

    grom_ironfist: new NPC(600, 400, {
        id: 'grom_ironfist',
        name: 'Grom Ironfist',
        displayName: 'Master Grom Ironfist',
        description: 'A dwarven smith of legendary skill, his hands calloused by centuries of perfecting his craft.',
        personality: NPCPersonalities.grom_ironfist,
        dialogId: 'grom_ironfist_meeting',
        sprite: 'grom_ironfist_sprite',
        portrait: 'grom_ironfist_portrait',
        interactionRadius: 45,
        behaviorType: 'static',
        movementPattern: 'static',
        level: 14,
        stats: {
            health: 250,
            maxHealth: 250,
            mana: 80,
            maxMana: 80
        }
    }),

    tavern_keeper_mira: new NPC(250, 180, {
        id: 'tavern_keeper_mira',
        name: 'Mira Stoutheart',
        displayName: 'Mira',
        description: 'The warm-hearted keeper of the local tavern, who knows every face and every story in town.',
        personality: NPCPersonalities.tavern_keeper,
        dialogId: 'tavern_keeper_greeting',
        sprite: 'mira_sprite',
        portrait: 'mira_portrait',
        interactionRadius: 32,
        behaviorType: 'idle',
        movementPattern: 'idle',
        level: 5,
        stats: {
            health: 80,
            maxHealth: 80,
            mana: 50,
            maxMana: 50
        }
    }),

    merchant_zane: new NPC(150, 220, {
        id: 'merchant_zane',
        name: 'Zane Quickwit',
        displayName: 'Merchant Zane',
        description: 'A traveling merchant with a silver tongue and a wagon full of wonders from distant lands.',
        personality: NPCPersonalities.wandering_merchant,
        dialogId: 'merchant_greeting',
        sprite: 'zane_sprite',
        portrait: 'zane_portrait',
        interactionRadius: 35,
        behaviorType: 'idle',
        movementPattern: 'idle',
        level: 6,
        stats: {
            health: 90,
            maxHealth: 90,
            mana: 40,
            maxMana: 40
        }
    }),

    guard_captain_harold: new NPC(320, 140, {
        id: 'guard_captain_harold',
        name: 'Captain Harold Ironshield',
        displayName: 'Captain Harold',
        description: 'The stern but fair captain of the village guard, dedicated to protecting the innocent.',
        personality: NPCPersonalities.village_guard,
        dialogId: 'guard_captain_greeting',
        sprite: 'harold_sprite',
        portrait: 'harold_portrait',
        interactionRadius: 38,
        behaviorType: 'patrol',
        movementPattern: 'patrol',
        waypoints: [
            { x: 320, y: 140 },
            { x: 380, y: 140 },
            { x: 380, y: 200 },
            { x: 320, y: 200 }
        ],
        level: 8,
        stats: {
            health: 140,
            maxHealth: 140,
            mana: 60,
            maxMana: 60
        }
    }),

    mysterious_stranger: new NPC(500, 350, {
        id: 'mysterious_stranger',
        name: '???',
        displayName: 'The Stranger',
        description: 'A figure shrouded in mystery, appearing at moments of significance with knowledge of things unseen.',
        personality: NPCPersonalities.mysterious_stranger,
        dialogId: 'stranger_encounter',
        sprite: 'stranger_sprite',
        portrait: 'stranger_portrait',
        interactionRadius: 25,
        behaviorType: 'static',
        movementPattern: 'static',
        level: 20,
        stats: {
            health: 300,
            maxHealth: 300,
            mana: 400,
            maxMana: 400
        }
    })
};

// Additional Dialog Trees for supporting NPCs
export const NPCDialogTrees = {
    tavern_keeper_greeting: new DialogTree({
        id: 'tavern_keeper_greeting',
        title: 'Tavern Keeper Mira - Warm Welcome',
        description: 'Conversation with the friendly tavern keeper',
        startNode: 'welcome',
        nodes: {
            welcome: new DialogNode({
                id: 'welcome',
                text: 'Welcome to my humble establishment, traveler! Pull up a stool and tell me your tale. What brings you to our little corner of Elyndor?',
                speaker: 'Mira Stoutheart',
                choices: [
                    new DialogChoice({
                        text: 'Just looking for a place to rest.',
                        goto: 'room_offer'
                    }),
                    new DialogChoice({
                        text: 'Have you heard any interesting rumors?',
                        goto: 'rumors'
                    }),
                    new DialogChoice({
                        text: 'I\'m on a quest. Any advice?',
                        goto: 'advice'
                    }),
                    new DialogChoice({
                        text: 'Goodbye for now.',
                        goto: null
                    })
                ]
            }),

            room_offer: new DialogNode({
                id: 'room_offer',
                text: 'Of course! A clean room and a hot meal for just 10 gold pieces. You look like you\'ve had quite the journey. Rest well!',
                speaker: 'Mira Stoutheart',
                effects: ['context.player.gold -= 10', 'flag.player_rested'],
                choices: [
                    new DialogChoice({
                        text: 'Thank you, Mira.',
                        goto: 'welcome'
                    })
                ]
            }),

            rumors: new DialogNode({
                id: 'rumors',
                text: 'Oh, where to begin! There\'s talk of strange lights in the Whispering Winds, and some folks swear they\'ve seen shadow creatures near the old ruins. And that merchant Zane has some fascinating wares from the southern lands!',
                speaker: 'Mira Stoutheart',
                effects: ['set_flag.rumors_heard'],
                choices: [
                    new DialogChoice({
                        text: 'Tell me more about the shadow creatures.',
                        goto: 'shadow_rumors'
                    }),
                    new DialogChoice({
                        text: 'Where can I find Merchant Zane?',
                        goto: 'zane_location'
                    }),
                    new DialogChoice({
                        text: 'Thanks for the information.',
                        goto: 'welcome'
                    })
                ]
            }),

            advice: new DialogNode({
                id: 'advice',
                text: 'Ah, a quest, you say? Well, remember that the crystal light shines brightest in the darkest times. Trust your instincts, but don\'t be afraid to ask for help. And always carry a good weapon!',
                speaker: 'Mira Stoutheart',
                choices: [
                    new DialogChoice({
                        text: 'Wise words, thank you.',
                        goto: 'welcome'
                    })
                ]
            })
        }
    }),

    guard_captain_greeting: new DialogTree({
        id: 'guard_captain_greeting',
        title: 'Captain Harold - Duty Bound',
        description: 'Conversation with the village guard captain',
        startNode: 'challenge',
        nodes: {
            challenge: new DialogNode({
                id: 'challenge',
                text: 'Halt! State your business in these parts. We\'ve had trouble with shadow creatures lately, so I must be cautious.',
                speaker: 'Captain Harold',
                choices: [
                    new DialogChoice({
                        text: 'I\'m just passing through peacefully.',
                        goto: 'pass_through'
                    }),
                    new DialogChoice({
                        text: 'I\'m here to help with the shadow threat.',
                        goto: 'help_offer'
                    }),
                    new DialogChoice({
                        text: 'Show me some respect, guard!',
                        goto: 'confrontation'
                    })
                ]
            }),

            pass_through: new DialogNode({
                id: 'pass_through',
                text: 'Very well. Move along, but keep your wits about you. The shadows have been growing bolder. If you see anything suspicious, report it to me immediately.',
                speaker: 'Captain Harold',
                choices: [
                    new DialogChoice({
                        text: 'I will. Farewell.',
                        goto: null
                    })
                ]
            }),

            help_offer: new DialogNode({
                id: 'help_offer',
                text: 'Help, eh? We could use someone with your apparent... determination. The shadows have been attacking our patrols. If you clear out their outpost to the east, I\'ll see you\'re properly rewarded.',
                speaker: 'Captain Harold',
                effects: ['set_flag.guard_quest_offered'],
                choices: [
                    new DialogChoice({
                        text: 'I\'ll clear the outpost.',
                        goto: 'quest_accepted'
                    }),
                    new DialogChoice({
                        text: 'I\'ll think about it.',
                        goto: 'maybe_later'
                    })
                ]
            }),

            confrontation: new DialogNode({
                id: 'confrontation',
                text: 'Respect is earned, not demanded. I suggest you watch your tone, or you might find yourself spending the night in our modest accommodations.',
                speaker: 'Captain Harold',
                choices: [
                    new DialogChoice({
                        text: 'My apologies, Captain.',
                        goto: 'pass_through'
                    }),
                    new DialogChoice({
                        text: 'We\'ll see about that.',
                        goto: 'hostile'
                    })
                ]
            })
        }
    }),

    stranger_encounter: new DialogTree({
        id: 'stranger_encounter',
        title: 'The Mysterious Stranger',
        description: 'A cryptic encounter with someone who knows too much',
        startNode: 'appearance',
        nodes: {
            appearance: new DialogNode({
                id: 'appearance',
                text: 'The wind whispers your name, crystal-marked one. The shards call to you, but the shadows listen. Which path will you choose when the moment comes?',
                speaker: 'The Stranger',
                choices: [
                    new DialogChoice({
                        text: 'Who are you?',
                        goto: 'identity_question'
                    }),
                    new DialogChoice({
                        text: 'What do you know about the shards?',
                        goto: 'shard_knowledge'
                    }),
                    new DialogChoice({
                        text: 'Leave me alone.',
                        goto: 'departure'
                    })
                ]
            }),

            identity_question: new DialogNode({
                id: 'identity_question',
                text: 'Names are chains in this world, child of crystal. I am the echo of what was, the whisper of what will be. Some call me fate\'s messenger, others call me madness incarnate.',
                speaker: 'The Stranger',
                choices: [
                    new DialogChoice({
                        text: 'What message do you bring?',
                        goto: 'message'
                    }),
                    new DialogChoice({
                        text: 'This is too confusing.',
                        goto: 'departure'
                    })
                ]
            }),

            shard_knowledge: new DialogNode({
                id: 'shard_knowledge',
                text: 'Seven pieces of broken light, scattered across the wounds of the world. Each shard sings its own song, but together they harmonize into salvation... or destruction. Trust not the shadows that promise power.',
                speaker: 'The Stranger',
                effects: ['set_flag.stranger_knowledge_gained'],
                choices: [
                    new DialogChoice({
                        text: 'How do I find them?',
                        goto: 'finding_shards'
                    }),
                    new DialogChoice({
                        text: 'What do you mean by destruction?',
                        goto: 'warning'
                    })
                ]
            }),

            finding_shards: new DialogNode({
                id: 'finding_shards',
                text: 'Listen to the crystal within. It will guide you, but beware false echoes. The shards hide in places of power: where fire meets earth, where wind touches water, where light confronts darkness.',
                speaker: 'The Stranger',
                choices: [
                    new DialogChoice({
                        text: 'I understand.',
                        goto: 'departure'
                    })
                ]
            }),

            warning: new DialogNode({
                id: 'warning',
                text: 'Power corrupts, crystal child. The shards offer unity, but at what cost? Remember that some shadows are born of light, and some lights cast the darkest shadows.',
                speaker: 'The Stranger',
                choices: [
                    new DialogChoice({
                        text: 'I\'ll be careful.',
                        goto: 'departure'
                    })
                ]
            }),

            departure: new DialogNode({
                id: 'departure',
                text: 'Our paths will cross again when the crystal calls. Walk in light, but remember the shadows are watching.',
                speaker: 'The Stranger',
                autoAdvance: true,
                nextNode: null
            })
        }
    })
};

export { NPCPersonalities, NPCDefinitions, NPCDialogTrees };