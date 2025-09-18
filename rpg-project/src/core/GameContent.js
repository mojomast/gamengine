// Game Content - Lore, Backstories, and Dialogs
// Contains all game world content including character backstories, quest narratives, and NPC dialogs

import { DialogTree, DialogChoice, DialogNode } from './DialogTree.js';

export const GameLore = {
    // World Background
    world: {
        name: "Elyndor",
        age: "The world of Elyndor emerged from the ancient Cataclysm 500 years ago, when the old gods shattered the primordial crystal that bound reality together.",
        regions: [
            "The Crystal Spires - Ancient floating islands where magic is strongest",
            "The Shadowed Realms - Dark forests and cursed lands where forgotten evils dwell",
            "The Forge Lands - Volcanic regions home to dwarven smiths and fire elementals",
            "The Whispering Winds - Mountainous areas with eternal storms and air spirits",
            "The Endless Plains - Vast grasslands inhabited by nomadic tribes and wild beasts"
        ],
        prophecy: "When the seven shards are reunited, the Crystal Heart will awaken, and with it, either salvation or eternal darkness."
    },

    // Major Characters
    characters: {
        player: {
            name: "Hero of Elyndor",
            backstory: "Born in a small village on the borders of the Endless Plains, you discovered your latent magical abilities during a raid by shadow creatures. The village elder revealed you were marked by destiny - a Chosen One who could reunite the lost crystal shards."
        },

        elder_mara: {
            name: "Elder Mara",
            backstory: "The last surviving guardian of the ancient Crystal Temple. She has protected the knowledge of the Cataclysm and the prophecy for over 300 years. Her family was destroyed during the Cataclysm, leaving her as the sole keeper of Elyndor's history.",
            personality: "Wise, cautious, and deeply scarred by loss. She speaks in riddles and metaphors, forcing others to seek their own understanding."
        },

        king_theron: {
            name: "King Theron",
            backstory: "Ruler of the Crystal Kingdom, descended from the line that once protected the primordial crystal. His kingdom has prospered since the Cataclysm, but recent shadow incursions have strained his rule and tested his leadership.",
            personality: "Noble and honorable, but increasingly desperate. He values tradition but understands that old ways must bend before new threats."
        },

        lira_shadowweaver: {
            name: "Lira Shadowweaver",
            backstory: "A mysterious rogue who operates in both light and shadow. Some say she was once a noblewoman betrayed by her family, others claim she made a pact with shadow entities. Her true motives remain unclear.",
            personality: "Enigmatic and self-serving, but with a hidden code of honor. She helps those who can pay or further her own mysterious goals."
        },

        grom_ironfist: {
            name: "Grom Ironfist",
            backstory: "Champion of the dwarven clans from the Forge Lands. Lost his clan during a shadow invasion that corrupted their ancestral forges. Now wanders Elyndor seeking both vengeance and a way to restore his people's lost craftsmanship.",
            personality: "Gruff and straightforward, with a deep well of sorrow beneath his tough exterior. Values craftsmanship above all else."
        }
    },

    // Key Locations
    locations: {
        crystal_spire: {
            name: "Crystal Spire Temple",
            description: "The ancient temple at the heart of the Crystal Kingdom, built around the remaining fragment of the primordial crystal. Protected by powerful wards that weaken over time.",
            significance: "Contains the last intact crystal shard and ancient knowledge about the Cataclysm."
        },

        shadow_rift: {
            name: "The Shadow Rift",
            description: "A massive tear in reality created during the Cataclysm, from which shadow creatures emerge. Grows larger with each passing year, threatening to consume more of Elyndor.",
            significance: "Source of the shadow threat and potential gateway to other realms."
        },

        forge_peaks: {
            name: "Forge Peaks",
            description: "Volcanic mountains home to the dwarven clans. The eternal fires here were once used to craft legendary weapons, but many forges now lie dormant after the shadow invasion.",
            significance: "Contains rare minerals needed to repair the crystal artifacts and houses the greatest weapon smiths in Elyndor."
        }
    }
};

// Dialog Trees for Key Characters
export const GameDialogs = {
    elder_mara_greeting: new DialogTree({
        id: 'elder_mara_greeting',
        title: 'Elder Mara - First Meeting',
        description: 'Initial conversation with the village elder',
        startNode: 'introduction',
        nodes: {
            introduction: new DialogNode({
                id: 'introduction',
                text: 'Ah, young one. I have watched you grow from afar. The mark of the crystal shines brightly within you. You are the one spoken of in the ancient prophecies.',
                speaker: 'Elder Mara',
                choices: [
                    new DialogChoice({
                        text: 'What mark? What are you talking about?',
                        goto: 'explanation',
                        conditions: ['!flag.crystal_mark_explained']
                    }),
                    new DialogChoice({
                        text: 'I felt something strange after the raid...',
                        goto: 'raid_followup',
                        conditions: ['flag.village_raid_survived']
                    }),
                    new DialogChoice({
                        text: 'I\'m not interested in prophecies.',
                        goto: 'dismissal'
                    })
                ]
            }),

            explanation: new DialogNode({
                id: 'explanation',
                text: 'Five centuries ago, the Cataclysm shattered our world. The primordial crystal that bound reality together was broken into seven shards. You bear the mark of the Crystal Heart - the ability to sense and reunite these shards.',
                speaker: 'Elder Mara',
                effects: ['set_flag.crystal_mark_explained'],
                choices: [
                    new DialogChoice({
                        text: 'How did the Cataclysm happen?',
                        goto: 'cataclysm_story'
                    }),
                    new DialogChoice({
                        text: 'What must I do?',
                        goto: 'quest_offer'
                    }),
                    new DialogChoice({
                        text: 'This is too much to handle.',
                        goto: 'comfort'
                    })
                ]
            }),

            cataclysm_story: new DialogNode({
                id: 'cataclysm_story',
                text: 'The old gods grew jealous of mortal prosperity. In their rage, they shattered the crystal that maintained the balance of creation. My family... everyone I knew... was lost in the chaos that followed.',
                speaker: 'Elder Mara',
                choices: [
                    new DialogChoice({
                        text: 'I\'m sorry for your loss.',
                        goto: 'comfort'
                    }),
                    new DialogChoice({
                        text: 'The gods did this?',
                        goto: 'gods_question'
                    })
                ]
            }),

            quest_offer: new DialogNode({
                id: 'quest_offer',
                text: 'You must journey to the Crystal Spire Temple and recover the first shard. King Theron guards it, but shadow creatures grow bolder each day. Take this amulet - it will help you sense other shards.',
                speaker: 'Elder Mara',
                effects: ['set_flag.main_quest_started', 'context.inventory.add_crystal_amulet'],
                choices: [
                    new DialogChoice({
                        text: 'I\'ll do it.',
                        goto: 'acceptance'
                    }),
                    new DialogChoice({
                        text: 'I need time to prepare.',
                        goto: 'preparation'
                    })
                ]
            }),

            acceptance: new DialogNode({
                id: 'acceptance',
                text: 'May the crystal light guide your path. Return to me when you have the first shard, and I will teach you more about your destiny.',
                speaker: 'Elder Mara',
                autoAdvance: true,
                nextNode: null
            })
        }
    }),

    king_theron_meeting: new DialogTree({
        id: 'king_theron_meeting',
        title: 'King Theron - Crystal Guardian',
        description: 'Conversation with the king about the crystal shard',
        startNode: 'royal_greeting',
        nodes: {
            royal_greeting: new DialogNode({
                id: 'royal_greeting',
                text: 'Welcome to the Crystal Kingdom, traveler. What brings you to my throne room?',
                speaker: 'King Theron',
                choices: [
                    new DialogChoice({
                        text: 'I seek the crystal shard protected here.',
                        goto: 'crystal_question',
                        conditions: ['flag.crystal_mark_explained']
                    }),
                    new DialogChoice({
                        text: 'I\'m here to help with the shadow threat.',
                        goto: 'shadow_help'
                    }),
                    new DialogChoice({
                        text: 'Just passing through.',
                        goto: 'casual_visit'
                    })
                ]
            }),

            crystal_question: new DialogNode({
                id: 'crystal_question',
                text: 'The crystal shard? How do you know of it? Only the royal line and the ancient guardians should know of its existence.',
                speaker: 'King Theron',
                choices: [
                    new DialogChoice({
                        text: 'Elder Mara sent me. I bear the crystal mark.',
                        goto: 'elder_reference',
                        conditions: ['flag.talked_to_elder_mara']
                    }),
                    new DialogChoice({
                        text: 'I had a vision about it.',
                        goto: 'vision_response'
                    })
                ]
            }),

            elder_reference: new DialogNode({
                id: 'elder_reference',
                text: 'Elder Mara... yes, I remember her from the old tales. Very well, if you truly bear the mark, prove it by retrieving the Shard of Light from the temple vault. But beware - shadow creatures have been seen nearby.',
                speaker: 'King Theron',
                effects: ['set_flag.king_quest_given'],
                choices: [
                    new DialogChoice({
                        text: 'I accept this challenge.',
                        goto: 'accept_challenge'
                    }),
                    new DialogChoice({
                        text: 'I need more information first.',
                        goto: 'temple_info'
                    })
                ]
            }),

            temple_info: new DialogNode({
                id: 'temple_info',
                text: 'The Crystal Temple lies at the peak of Mount Aranthor. Ancient wards protect it, but they grow weaker. Shadow tendrils creep closer each night. Take this royal seal - it will grant you access to the inner chambers.',
                speaker: 'King Theron',
                effects: ['context.inventory.add_royal_seal'],
                choices: [
                    new DialogChoice({
                        text: 'Thank you. I\'ll retrieve the shard.',
                        goto: 'accept_challenge'
                    })
                ]
            }),

            accept_challenge: new DialogNode({
                id: 'accept_challenge',
                text: 'May the crystal\'s light protect you. Return with the shard, and I shall reward you handsomely.',
                speaker: 'King Theron',
                autoAdvance: true,
                nextNode: null
            })
        }
    }),

    lira_shadowweaver_encounter: new DialogTree({
        id: 'lira_shadowweaver_encounter',
        title: 'Lira Shadowweaver - Mysterious Ally',
        description: 'Meeting the enigmatic shadow rogue',
        startNode: 'shadow_approach',
        nodes: {
            shadow_approach: new DialogNode({
                id: 'shadow_approach',
                text: 'Well, well. What do we have here? A crystal-marked wanderer stumbling through my territory. The shadows whisper interesting things about you.',
                speaker: 'Lira Shadowweaver',
                choices: [
                    new DialogChoice({
                        text: 'Who are you? How do you know about me?',
                        goto: 'identity_question'
                    }),
                    new DialogChoice({
                        text: 'The shadows talk to you?',
                        goto: 'shadow_question'
                    }),
                    new DialogChoice({
                        text: 'Stay back! I\'m armed.',
                        goto: 'hostile_response'
                    })
                ]
            }),

            identity_question: new DialogNode({
                id: 'identity_question',
                text: 'Names are dangerous in my line of work, but you can call me Lira. As for knowing about you... let\'s just say I have sources in both light and shadow. The crystal mark makes you quite the celebrity.',
                speaker: 'Lira Shadowweaver',
                choices: [
                    new DialogChoice({
                        text: 'What do you want from me?',
                        goto: 'motives'
                    }),
                    new DialogChoice({
                        text: 'Can you help me with my quest?',
                        goto: 'help_offer'
                    })
                ]
            }),

            motives: new DialogNode({
                id: 'motives',
                text: 'What I want? Information, mostly. And perhaps some mutual benefit. The shadows are growing stronger, and that affects everyone - even someone like me who dances between worlds.',
                speaker: 'Lira Shadowweaver',
                choices: [
                    new DialogChoice({
                        text: 'What can you tell me about the shadows?',
                        goto: 'shadow_lore'
                    }),
                    new DialogChoice({
                        text: 'How can we help each other?',
                        goto: 'mutual_benefit'
                    })
                ]
            }),

            shadow_lore: new DialogNode({
                id: 'shadow_lore',
                text: 'The shadows come from the Rift - that tear in reality created by the Cataclysm. They feed on fear and despair, growing stronger with each victory. The crystal shards are the only things that can seal the Rift, but gathering them won\'t be easy.',
                speaker: 'Lira Shadowweaver',
                effects: ['set_flag.shadow_lore_learned'],
                choices: [
                    new DialogChoice({
                        text: 'How do you know so much?',
                        goto: 'knowledge_source'
                    }),
                    new DialogChoice({
                        text: 'Will you help me find the shards?',
                        goto: 'help_offer'
                    })
                ]
            }),

            help_offer: new DialogNode({
                id: 'help_offer',
                text: 'Help you? Perhaps. For a price. I know where several shards might be hidden. But first, prove yourself useful. There\'s a shadow outpost to the east that\'s been causing trouble. Clear it out, and I\'ll share what I know.',
                speaker: 'Lira Shadowweaver',
                effects: ['set_flag.lira_quest_given'],
                choices: [
                    new DialogChoice({
                        text: 'I\'ll clear the outpost.',
                        goto: 'quest_accept'
                    }),
                    new DialogChoice({
                        text: 'What\'s in it for you?',
                        goto: 'payment_discussion'
                    })
                ]
            }),

            quest_accept: new DialogNode({
                id: 'quest_accept',
                text: 'Smart choice. Here\'s a map to the outpost. Be careful - the shadows there are particularly hungry. Return when it\'s done, and we\'ll talk more about those shards.',
                speaker: 'Lira Shadowweaver',
                effects: ['context.inventory.add_shadow_map'],
                autoAdvance: true,
                nextNode: null
            })
        }
    }),

    grom_ironfist_meeting: new DialogTree({
        id: 'grom_ironfist_meeting',
        title: 'Grom Ironfist - Dwarven Warrior',
        description: 'Conversation with the wandering dwarf',
        startNode: 'dwarf_greeting',
        nodes: {
            dwarf_greeting: new DialogNode({
                id: 'dwarf_greeting',
                text: 'Hmph. Another surface-dweller wandering these hills. What brings you to my forge, human?',
                speaker: 'Grom Ironfist',
                choices: [
                    new DialogChoice({
                        text: 'I\'m looking for a skilled smith.',
                        goto: 'smith_request'
                    }),
                    new DialogChoice({
                        text: 'I heard about your clan\'s fall.',
                        goto: 'clan_story'
                    }),
                    new DialogChoice({
                        text: 'Just passing through.',
                        goto: 'dismissal'
                    })
                ]
            }),

            smith_request: new DialogNode({
                id: 'smith_request',
                text: 'A smith, eh? Well, you\'ve found one. But I don\'t work for gold anymore. My forge was corrupted by shadow magic. Help me restore it, and I\'ll craft you weapons that could slay dragons.',
                speaker: 'Grom Ironfist',
                choices: [
                    new DialogChoice({
                        text: 'What happened to your forge?',
                        goto: 'forge_story'
                    }),
                    new DialogChoice({
                        text: 'I\'ll help restore your forge.',
                        goto: 'forge_quest'
                    })
                ]
            }),

            forge_story: new DialogNode({
                id: 'forge_story',
                text: 'The shadows came in the night. Twisted our beautiful forges into something... wrong. My people fought bravely, but the corruption spread too quickly. I was the only survivor. Now I wander, seeking the minerals needed to purify the flames.',
                speaker: 'Grom Ironfist',
                choices: [
                    new DialogChoice({
                        text: 'That\'s terrible. I\'ll help you.',
                        goto: 'forge_quest'
                    }),
                    new DialogChoice({
                        text: 'What minerals do you need?',
                        goto: 'mineral_list'
                    })
                ]
            }),

            forge_quest: new DialogNode({
                id: 'forge_quest',
                text: 'Good. I need three things: crystal dust from the Crystal Caves, shadow essence from defeated shadow lords, and pure volcanic ore from the Forge Peaks. Bring them to me, and I\'ll restore my forge and craft you legendary weapons.',
                speaker: 'Grom Ironfist',
                effects: ['set_flag.forge_restoration_quest'],
                choices: [
                    new DialogChoice({
                        text: 'I\'ll gather the materials.',
                        goto: 'quest_accept'
                    }),
                    new DialogChoice({
                        text: 'Tell me where to find them.',
                        goto: 'material_locations'
                    })
                ]
            }),

            quest_accept: new DialogNode({
                id: 'quest_accept',
                text: 'May your hammer strike true. Return when you have the materials, and I\'ll show you what dwarven craftsmanship can really do.',
                speaker: 'Grom Ironfist',
                autoAdvance: true,
                nextNode: null
            })
        }
    })
};

// NPC Personality Traits
export const NPCPersonalities = {
    elder_mara: {
        traits: ['wise', 'mysterious', 'cautious', 'prophetic'],
        speech_patterns: ['Speaks in riddles', 'References ancient prophecies', 'Shows deep sorrow', 'Offers cryptic guidance'],
        relationship_triggers: ['Shows crystal mark', 'Mentions Cataclysm', 'Asks about history']
    },

    king_theron: {
        traits: ['noble', 'authoritative', 'concerned', 'traditional'],
        speech_patterns: ['Uses royal language', 'Expresses concern for kingdom', 'References royal duty', 'Offers rewards for service'],
        relationship_triggers: ['Helps with shadow threats', 'Shows royal seal', 'Mentions crystal shards']
    },

    lira_shadowweaver: {
        traits: ['mysterious', 'cunning', 'self-serving', 'informative'],
        speech_patterns: ['Speaks cryptically', 'Hints at hidden knowledge', 'Negotiates terms', 'Reveals information gradually'],
        relationship_triggers: ['Proves trustworthy', 'Shows ability to handle shadows', 'Offers fair deals']
    },

    grom_ironfist: {
        traits: ['gruff', 'honorable', 'skilled', 'grieving'],
        speech_patterns: ['Uses dwarven expressions', 'Talks about craftsmanship', 'Shows anger at shadows', 'Expresses pride in work'],
        relationship_triggers: ['Shows respect for craftsmanship', 'Helps with forge restoration', 'Fights alongside in battle']
    }
};

// Quest Narrative Templates
export const QuestNarratives = {
    main_quest: {
        title: "The Crystal's Call",
        description: "Unite the seven crystal shards to prevent the shadow rift from consuming Elyndor.",
        phases: [
            { name: "Awakening", description: "Discover your crystal mark and learn of your destiny." },
            { name: "First Shard", description: "Retrieve the Shard of Light from the Crystal Temple." },
            { name: "Alliance", description: "Form alliances with key figures across Elyndor." },
            { name: "Shadow War", description: "Combat the growing shadow threat." },
            { name: "The Rift", description: "Confront the source of the shadow invasion." },
            { name: "Reunion", description: "Reunite all seven shards and save Elyndor." }
        ]
    },

    side_quests: {
        shadow_outpost: {
            title: "Shadows in the East",
            description: "Clear out the shadow outpost that's been terrorizing local villages.",
            objectives: ["Defeat shadow commander", "Rescue captured villagers", "Destroy shadow altar"],
            rewards: ["Experience", "Gold", "Shadow-resistant equipment"]
        },

        forge_restoration: {
            title: "Restoring the Flame",
            description: "Help Grom Ironfist restore his corrupted forge and craft legendary weapons.",
            objectives: ["Gather crystal dust", "Collect shadow essence", "Mine volcanic ore"],
            rewards: ["Legendary weapons", "Forging knowledge", "Dwarven alliance"]
        },

        village_defense: {
            title: "Guardian of the Village",
            description: "Protect the village from recurring shadow raids.",
            objectives: ["Set up defenses", "Train villagers", "Defeat raid leaders"],
            rewards: ["Village reputation", "Defensive equipment", "Loyal followers"]
        }
    }
};

export { GameLore, GameDialogs, NPCPersonalities, QuestNarratives };