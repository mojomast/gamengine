// Boss Data - Detailed boss encounters with phases, mechanics, and special abilities
// Contains comprehensive boss fight data for integration with BattleScene

export const BossEncounters = {
    shadow_commander: {
        id: 'shadow_commander',
        name: 'Commander Zorath',
        title: 'Shadow Commander',
        description: 'A formidable shadow entity commanding legions of lesser shadows, corrupted by the rift\'s dark energy.',
        level: 5,
        health: 800,
        maxHealth: 800,
        stats: {
            attack: 35,
            defense: 20,
            speed: 85,
            experience: 500,
            gold: 200,
            shadowPower: 80,
            commandPower: 60
        },
        abilities: {
            basic: [
                {
                    id: 'shadow_slash',
                    name: 'Shadow Slash',
                    description: 'A powerful slash that deals shadow damage',
                    damage: 45,
                    type: 'physical',
                    cooldown: 3,
                    targetType: 'single'
                },
                {
                    id: 'command_minions',
                    name: 'Command Minions',
                    description: 'Summons shadow minions to aid in battle',
                    type: 'summon',
                    cooldown: 8,
                    targetType: 'self',
                    summons: ['shadow_imp', 'shadow_imp']
                }
            ],
            special: [
                {
                    id: 'darkness_burst',
                    name: 'Darkness Burst',
                    description: 'Explosive burst of shadow energy damaging all enemies',
                    damage: 25,
                    type: 'magical',
                    cooldown: 12,
                    targetType: 'area',
                    effect: 'apply_blindness'
                },
                {
                    id: 'shadow_teleport',
                    name: 'Shadow Teleport',
                    description: 'Teleports to a new position, avoiding attacks',
                    type: 'utility',
                    cooldown: 6,
                    targetType: 'self',
                    effect: 'dodge_next_attack'
                }
            ]
        },
        phases: [
            {
                name: 'Phase 1: Shadow Assault',
                healthPercent: 100,
                description: 'The commander focuses on direct combat and summoning minions.',
                abilities: ['shadow_slash', 'command_minions'],
                modifiers: {
                    attackMultiplier: 1.0,
                    defenseMultiplier: 1.0,
                    speedMultiplier: 1.0
                },
                triggers: [
                    {
                        condition: 'health_below_75',
                        action: 'enter_phase_2'
                    }
                ]
            },
            {
                name: 'Phase 2: Darkness Unleashed',
                healthPercent: 75,
                description: 'The commander taps into deeper shadow power, gaining new abilities.',
                abilities: ['shadow_slash', 'command_minions', 'darkness_burst'],
                modifiers: {
                    attackMultiplier: 1.2,
                    defenseMultiplier: 1.1,
                    speedMultiplier: 1.1
                },
                triggers: [
                    {
                        condition: 'health_below_50',
                        action: 'enter_phase_3'
                    }
                ],
                onEnter: 'summon_elite_minions'
            },
            {
                name: 'Phase 3: Desperate Shadows',
                healthPercent: 50,
                description: 'Severely weakened, the commander becomes unpredictable and dangerous.',
                abilities: ['shadow_slash', 'darkness_burst', 'shadow_teleport'],
                modifiers: {
                    attackMultiplier: 1.5,
                    defenseMultiplier: 0.8,
                    speedMultiplier: 1.3
                },
                triggers: [],
                onEnter: 'final_transformation'
            }
        ],
        mechanics: {
            shadow_barrier: {
                description: 'Creates a barrier that reduces incoming damage by 50%',
                duration: 10,
                cooldown: 20,
                trigger: 'health_below_25'
            },
            minion_swarm: {
                description: 'Periodically summons waves of shadow minions',
                interval: 15,
                max_minions: 6
            }
        },
        loot: [
            'shadow_map',
            'shadow_antidote',
            'commanders_pauldron',
            'shadow_essence'
        ],
        dialogue: {
            intro: 'You dare challenge me in my domain? The shadows will consume you!',
            phase2: 'Feel the true power of the darkness! You cannot escape!',
            phase3: 'No... this cannot be... the shadows... they abandon me!',
            defeat: 'The rift... calls me back... this is not over...'
        }
    },

    fire_elemental_lord: {
        id: 'fire_elemental_lord',
        name: 'Ignaroth',
        title: 'Fire Elemental Lord',
        description: 'The ancient lord of flames, awakened from millennia of slumber in the volcanic depths.',
        level: 9,
        health: 1500,
        maxHealth: 1500,
        stats: {
            attack: 65,
            defense: 35,
            speed: 60,
            experience: 1200,
            gold: 400,
            firePower: 100,
            heatAura: 80
        },
        abilities: {
            basic: [
                {
                    id: 'fire_strike',
                    name: 'Fire Strike',
                    description: 'A blazing strike that burns the target',
                    damage: 55,
                    type: 'physical',
                    cooldown: 4,
                    targetType: 'single',
                    effect: 'burn_dot'
                },
                {
                    id: 'heat_wave',
                    name: 'Heat Wave',
                    description: 'Wave of intense heat damaging nearby enemies',
                    damage: 30,
                    type: 'magical',
                    cooldown: 8,
                    targetType: 'area',
                    effect: 'reduce_speed'
                }
            ],
            special: [
                {
                    id: 'lava_eruption',
                    name: 'Lava Eruption',
                    description: 'Causes lava to erupt from the ground in random locations',
                    damage: 70,
                    type: 'environmental',
                    cooldown: 15,
                    targetType: 'area',
                    effect: 'create_lava_pools'
                },
                {
                    id: 'flame_shield',
                    name: 'Flame Shield',
                    description: 'Surrounds self with protective flames',
                    type: 'defensive',
                    cooldown: 20,
                    targetType: 'self',
                    effect: 'damage_reflection'
                },
                {
                    id: 'inferno_rage',
                    name: 'Inferno Rage',
                    description: 'Enters a rage state, increasing damage but reducing defense',
                    type: 'buff',
                    cooldown: 30,
                    targetType: 'self',
                    effect: 'damage_boost_defense_reduction'
                }
            ]
        },
        phases: [
            {
                name: 'Phase 1: Awakening Flames',
                healthPercent: 100,
                description: 'The elemental lord tests its enemies with basic fire attacks.',
                abilities: ['fire_strike', 'heat_wave'],
                modifiers: {
                    attackMultiplier: 1.0,
                    defenseMultiplier: 1.0,
                    speedMultiplier: 1.0
                },
                environmental_effects: ['mild_heat']
            },
            {
                name: 'Phase 2: Volcanic Fury',
                healthPercent: 70,
                description: 'The lord draws power from the volcano, unleashing destructive lava attacks.',
                abilities: ['fire_strike', 'heat_wave', 'lava_eruption'],
                modifiers: {
                    attackMultiplier: 1.3,
                    defenseMultiplier: 1.1,
                    speedMultiplier: 1.0
                },
                environmental_effects: ['lava_eruptions', 'increasing_heat'],
                onEnter: 'activate_volcanic_vents'
            },
            {
                name: 'Phase 3: Inferno Incarnate',
                healthPercent: 40,
                description: 'The lord becomes one with the volcano itself, creating an inferno battlefield.',
                abilities: ['fire_strike', 'lava_eruption', 'flame_shield', 'inferno_rage'],
                modifiers: {
                    attackMultiplier: 1.6,
                    defenseMultiplier: 0.7,
                    speedMultiplier: 1.2
                },
                environmental_effects: ['extreme_heat', 'constant_lava', 'fire_storms'],
                onEnter: 'transform_into_inferno_form'
            },
            {
                name: 'Phase 4: Final Burn',
                healthPercent: 15,
                description: 'Near defeat, the lord unleashes its final, desperate blaze.',
                abilities: ['lava_eruption', 'inferno_rage'],
                modifiers: {
                    attackMultiplier: 2.0,
                    defenseMultiplier: 0.5,
                    speedMultiplier: 1.5
                },
                environmental_effects: ['catastrophic_inferno'],
                onEnter: 'final_burn_phase'
            }
        ],
        mechanics: {
            heat_aura: {
                description: 'Constant heat damage to nearby enemies',
                damage: 5,
                interval: 2,
                range: 3
            },
            lava_pools: {
                description: 'Creates pools of lava that damage over time',
                damage: 15,
                duration: 10,
                max_pools: 5
            },
            rage_meter: {
                description: 'Builds rage with each attack taken, powering special abilities',
                max_rage: 100,
                gain_per_hit: 5,
                rage_abilities: ['inferno_rage']
            }
        },
        loot: [
            'volcanic_ore',
            'crystal_essence',
            'flameheart_amulet',
            'elemental_core'
        ],
        dialogue: {
            intro: 'Mortals... you disturb my slumber. Feel the wrath of eternal flame!',
            phase2: 'The volcano awakens! You cannot withstand its fury!',
            phase3: 'I AM the volcano! I AM the fire! Burn with me!',
            phase4: 'No... I will not be extinguished... BURN!',
            defeat: 'The flames... fade... but fire... never truly... dies...'
        }
    },

    ancient_lich: {
        id: 'ancient_lich',
        name: 'Ner\'zul the Undying',
        title: 'Ancient Lich',
        description: 'A powerful undead sorcerer who has guarded forbidden knowledge for centuries, sustained by dark magic.',
        level: 15,
        health: 2000,
        maxHealth: 2000,
        stats: {
            attack: 50,
            defense: 40,
            speed: 65,
            experience: 2500,
            gold: 1000,
            spellPower: 120,
            necromancyPower: 100
        },
        abilities: {
            basic: [
                {
                    id: 'death_bolt',
                    name: 'Death Bolt',
                    description: 'A bolt of necrotic energy that drains life',
                    damage: 60,
                    type: 'magical',
                    cooldown: 3,
                    targetType: 'single',
                    effect: 'life_drain'
                },
                {
                    id: 'summon_skeletons',
                    name: 'Summon Skeletons',
                    description: 'Raises skeletal warriors from the ground',
                    type: 'summon',
                    cooldown: 10,
                    targetType: 'self',
                    summons: ['skeleton_warrior', 'skeleton_warrior', 'skeleton_archer']
                }
            ],
            special: [
                {
                    id: 'life_drain',
                    name: 'Life Drain',
                    description: 'Drains health from target to restore the lich',
                    damage: 40,
                    heal: 30,
                    type: 'magical',
                    cooldown: 8,
                    targetType: 'single'
                },
                {
                    id: 'curse',
                    name: 'Ancient Curse',
                    description: 'Curses target with multiple debilitating effects',
                    type: 'debuff',
                    cooldown: 15,
                    targetType: 'single',
                    effects: ['curse_weakness', 'curse_slow', 'curse_poison']
                },
                {
                    id: 'phylactery_shield',
                    name: 'Phylactery Shield',
                    description: 'Creates a magical barrier using phylactery power',
                    type: 'defensive',
                    cooldown: 25,
                    targetType: 'self',
                    effect: 'damage_absorption'
                },
                {
                    id: 'desperate_spell',
                    name: 'Desperate Spell',
                    description: 'Unleashes chaotic magic when near defeat',
                    damage: 100,
                    type: 'magical',
                    cooldown: 30,
                    targetType: 'area',
                    effect: 'random_curses'
                }
            ]
        },
        phases: [
            {
                name: 'Phase 1: Undead Guardian',
                healthPercent: 100,
                description: 'The lich maintains its tomb, using basic necrotic magic.',
                abilities: ['death_bolt', 'summon_skeletons'],
                modifiers: {
                    attackMultiplier: 1.0,
                    defenseMultiplier: 1.0,
                    speedMultiplier: 1.0
                }
            },
            {
                name: 'Phase 2: Necromantic Power',
                healthPercent: 80,
                description: 'The lich taps into greater necromantic energies.',
                abilities: ['death_bolt', 'summon_skeletons', 'life_drain'],
                modifiers: {
                    attackMultiplier: 1.1,
                    defenseMultiplier: 1.0,
                    speedMultiplier: 1.1
                },
                onEnter: 'summon_elite_skeletons'
            },
            {
                name: 'Phase 3: Ancient Sorcery',
                healthPercent: 60,
                description: 'The lich reveals its true power with ancient spells.',
                abilities: ['death_bolt', 'life_drain', 'curse'],
                modifiers: {
                    attackMultiplier: 1.3,
                    defenseMultiplier: 1.1,
                    speedMultiplier: 1.2
                },
                onEnter: 'activate_ancient_wards'
            },
            {
                name: 'Phase 4: Phylactery\'s Power',
                healthPercent: 40,
                description: 'The lich draws power from its phylactery.',
                abilities: ['death_bolt', 'life_drain', 'curse', 'phylactery_shield'],
                modifiers: {
                    attackMultiplier: 1.4,
                    defenseMultiplier: 1.3,
                    speedMultiplier: 1.3
                },
                mechanics: ['phylactery_regeneration']
            },
            {
                name: 'Phase 5: Final Desperation',
                healthPercent: 20,
                description: 'Near destruction, the lich unleashes chaotic magic.',
                abilities: ['death_bolt', 'desperate_spell'],
                modifiers: {
                    attackMultiplier: 1.6,
                    defenseMultiplier: 0.8,
                    speedMultiplier: 1.5
                },
                onEnter: 'phylactery_destruction_sequence'
            }
        ],
        mechanics: {
            phylactery_link: {
                description: 'The lich is linked to a phylactery that prevents true death',
                health_threshold: 10,
                teleport_to_phylactery: true
            },
            skeleton_horde: {
                description: 'Periodically summons waves of skeletal minions',
                intervals: [10, 20, 30],
                summons_per_wave: [2, 3, 4]
            },
            necrotic_aura: {
                description: 'Aura that weakens living creatures over time',
                damage: 8,
                interval: 3,
                range: 4
            }
        },
        loot: [
            'ancient_rune',
            'crystal_essence',
            'lich_phylactery',
            'necromancy_tome',
            'legendary_staff'
        ],
        dialogue: {
            intro: 'Foolish mortals! You disturb the eternal rest of Ner\'zul! Feel the cold embrace of death!',
            phase2: 'My power grows! The dead rise to serve their master!',
            phase3: 'Ancient curses I unleash upon you! Your doom is sealed!',
            phase4: 'My phylactery sustains me! You cannot destroy what is eternal!',
            phase5: 'No... I will not fall... CHAOS UNLEASHED!',
            defeat: 'The phylactery... shattered... finally... peace...'
        }
    },

    crystal_guardian: {
        id: 'crystal_guardian',
        name: 'Aetherion',
        title: 'Crystal Guardian',
        description: 'An ancient construct created to protect the crystal shards, powered by pure crystal energy.',
        level: 12,
        health: 1800,
        maxHealth: 1800,
        stats: {
            attack: 55,
            defense: 50,
            speed: 50,
            experience: 1500,
            gold: 0, // Guardians don't carry gold
            crystalPower: 120,
            energyEfficiency: 100
        },
        abilities: {
            basic: [
                {
                    id: 'crystal_beam',
                    name: 'Crystal Beam',
                    description: 'Fires a concentrated beam of crystal energy',
                    damage: 65,
                    type: 'magical',
                    cooldown: 4,
                    targetType: 'single',
                    effect: 'crystal_resonance'
                },
                {
                    id: 'energy_shield',
                    name: 'Energy Shield',
                    description: 'Creates a protective shield of crystal energy',
                    type: 'defensive',
                    cooldown: 12,
                    targetType: 'self',
                    effect: 'damage_reduction'
                }
            ],
            special: [
                {
                    id: 'teleport',
                    name: 'Crystal Teleport',
                    description: 'Teleports to a crystal node for tactical advantage',
                    type: 'utility',
                    cooldown: 8,
                    targetType: 'self',
                    effect: 'position_change'
                },
                {
                    id: 'resonance_burst',
                    name: 'Resonance Burst',
                    description: 'Creates a shockwave that disrupts magical effects',
                    damage: 45,
                    type: 'magical',
                    cooldown: 10,
                    targetType: 'area',
                    effect: 'dispel_magic'
                },
                {
                    id: 'crystal_prison',
                    name: 'Crystal Prison',
                    description: 'Traps target in a crystal prison, preventing actions',
                    type: 'control',
                    cooldown: 15,
                    targetType: 'single',
                    effect: 'stun_target'
                }
            ]
        },
        phases: [
            {
                name: 'Phase 1: Guardian Mode',
                healthPercent: 100,
                description: 'The guardian maintains its protective protocols.',
                abilities: ['crystal_beam', 'energy_shield'],
                modifiers: {
                    attackMultiplier: 1.0,
                    defenseMultiplier: 1.0,
                    speedMultiplier: 1.0
                }
            },
            {
                name: 'Phase 2: Active Defense',
                healthPercent: 75,
                description: 'The guardian becomes more aggressive in its defense.',
                abilities: ['crystal_beam', 'energy_shield', 'resonance_burst'],
                modifiers: {
                    attackMultiplier: 1.2,
                    defenseMultiplier: 1.1,
                    speedMultiplier: 1.1
                }
            },
            {
                name: 'Phase 3: Overload Mode',
                healthPercent: 50,
                description: 'Crystal energy begins to overload, increasing power but reducing control.',
                abilities: ['crystal_beam', 'resonance_burst', 'teleport'],
                modifiers: {
                    attackMultiplier: 1.4,
                    defenseMultiplier: 0.9,
                    speedMultiplier: 1.2
                },
                mechanics: ['energy_overload']
            },
            {
                name: 'Phase 4: Critical Failure',
                healthPercent: 25,
                description: 'Systems failing, but power output at maximum.',
                abilities: ['crystal_beam', 'resonance_burst', 'teleport', 'crystal_prison'],
                modifiers: {
                    attackMultiplier: 1.6,
                    defenseMultiplier: 0.7,
                    speedMultiplier: 1.4
                },
                mechanics: ['system_failure', 'random_teleports']
            }
        ],
        mechanics: {
            crystal_resonance: {
                description: 'Attacks build crystal resonance, amplifying damage over time',
                stacks: 5,
                damage_increase: 10
            },
            energy_nodes: {
                description: 'Guardian can teleport between crystal energy nodes',
                node_positions: [
                    { x: 5, y: 5 },
                    { x: 20, y: 5 },
                    { x: 20, y: 15 },
                    { x: 5, y: 15 }
                ]
            },
            adaptive_defense: {
                description: 'Analyzes enemy patterns and adapts defense accordingly',
                adaptation_rate: 0.1
            }
        },
        loot: [
            'crystal_dust',
            'ancient_rune',
            'guardian_core',
            'crystal_matrix'
        ],
        dialogue: {
            intro: 'Intruders detected. Crystal integrity must be maintained. Defense protocols activated.',
            phase2: 'Threat level increasing. Escalating defensive measures.',
            phase3: 'Energy overload detected. Stability compromised.',
            phase4: 'Critical systems failure. Emergency protocols engaged.',
            defeat: 'Crystal... matrix... destabilizing... shutdown... imminent...'
        }
    }
};

// Boss AI Patterns
export const BossAIPatterns = {
    shadow_commander: {
        aggression: 'moderate',
        tactics: ['hit_and_run', 'minion_swarm', 'area_control'],
        weaknesses: ['light_magic', 'holy_attacks'],
        resistances: ['shadow_magic', 'dark_attacks'],
        immunities: []
    },

    fire_elemental_lord: {
        aggression: 'high',
        tactics: ['area_denial', 'damage_over_time', 'rage_building'],
        weaknesses: ['water_magic', 'ice_attacks'],
        resistances: ['fire_magic', 'heat_attacks'],
        immunities: ['burn_effects']
    },

    ancient_lich: {
        aggression: 'low',
        tactics: ['summoning', 'debuffing', 'life_drain'],
        weaknesses: ['holy_magic', 'fire_attacks'],
        resistances: ['necrotic_magic', 'poison_attacks'],
        immunities: ['death_effects', 'poison']
    },

    crystal_guardian: {
        aggression: 'calculated',
        tactics: ['positioning', 'interruption', 'damage_amplification'],
        weaknesses: ['disruption_magic', 'physical_attacks'],
        resistances: ['magical_attacks', 'energy_attacks'],
        immunities: ['control_effects']
    }
};

// Environmental Boss Mechanics
export const EnvironmentalMechanics = {
    shadow_rift: {
        mechanics: [
            {
                name: 'Shadow Fissures',
                description: 'Random shadow fissures appear, dealing damage to players standing on them',
                damage: 20,
                interval: 5,
                duration: 2
            },
            {
                name: 'Darkness Zones',
                description: 'Areas of absolute darkness that reduce visibility and accuracy',
                accuracy_penalty: 30,
                duration: 8,
                interval: 12
            }
        ]
    },

    forge_peaks: {
        mechanics: [
            {
                name: 'Lava Pools',
                description: 'Pools of molten lava that damage over time',
                damage: 15,
                duration: 5,
                max_pools: 4
            },
            {
                name: 'Falling Rocks',
                description: 'Rocks fall from ceiling in random locations',
                damage: 25,
                warning_time: 1,
                interval: 8
            }
        ]
    },

    crystal_temple: {
        mechanics: [
            {
                name: 'Crystal Resonance',
                description: 'Crystal formations amplify magical damage',
                magic_damage_bonus: 25,
                duration: 10
            },
            {
                name: 'Energy Feedback',
                description: 'Using abilities near crystals creates feedback damage',
                damage: 10,
                radius: 3
            }
        ]
    }
};

export { BossEncounters, BossAIPatterns, EnvironmentalMechanics };