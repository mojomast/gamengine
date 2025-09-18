// Item Data - Items, equipment, and monster definitions for Elyndor RPG
// Contains weapon, armor, consumable, and material definitions with detailed stats

import { RPGWeapon, RPGArmor, RPGConsumable, Material, Accessory } from './RPGItemDatabase.js';

// Weapon Definitions
export const WeaponData = {
    // Basic weapons
    iron_sword: new RPGWeapon(
        'iron_sword',
        'Iron Sword',
        'A sturdy sword forged from refined iron ore. Reliable and well-balanced for combat.',
        25,
        'sword',
        'common',
        100,
        {
            strength: 2,
            durability: 100
        }
    ),

    steel_broadsword: new RPGWeapon(
        'steel_broadsword',
        'Steel Broadsword',
        'A heavy two-handed sword with excellent reach and devastating power.',
        45,
        'sword',
        'rare',
        350,
        {
            strength: 5,
            constitution: 2,
            durability: 150
        }
    ),

    elven_dagger: new RPGWeapon(
        'elven_dagger',
        'Elven Dagger',
        'A finely crafted dagger with an enchanted edge that never dulls.',
        18,
        'dagger',
        'uncommon',
        180,
        {
            dexterity: 3,
            luck: 1,
            durability: 80
        }
    ),

    crystal_staff: new RPGWeapon(
        'crystal_staff',
        'Crystal Staff',
        'A staff imbued with crystal energy that amplifies magical abilities.',
        15,
        'staff',
        'rare',
        400,
        {
            intelligence: 6,
            wisdom: 4,
            maxMana: 20,
            durability: 120
        }
    ),

    flaming_sword: new RPGWeapon(
        'flaming_sword',
        'Flaming Sword',
        'A blade wreathed in eternal flame, dealing fire damage to enemies.',
        40,
        'sword',
        'epic',
        600,
        {
            strength: 4,
            fireResistance: 25,
            durability: 200
        },
        'fire',
        10
    ),

    shadow_bow: new RPGWeapon(
        'shadow_bow',
        'Shadow Bow',
        'A bow crafted from shadow-infused wood, its arrows strike unseen.',
        35,
        'bow',
        'epic',
        550,
        {
            dexterity: 5,
            stealth: 3,
            durability: 160
        }
    ),

    groms_hammer: new RPGWeapon(
        'groms_hammer',
        'Grom\'s Forge Hammer',
        'The legendary hammer of Master Grom, capable of shattering mountains.',
        60,
        'hammer',
        'legendary',
        1200,
        {
            strength: 8,
            constitution: 4,
            durability: 500
        }
    )
};

// Armor Definitions
export const ArmorData = {
    leather_armor: new RPGArmor(
        'leather_armor',
        'Leather Armor',
        'Flexible leather armor offering basic protection and mobility.',
        15,
        'light',
        'chest',
        'common',
        75,
        {
            dexterity: 1,
            defense: 2,
            durability: 100
        }
    ),

    chainmail: new RPGArmor(
        'chainmail',
        'Chainmail Armor',
        'Interlocking metal rings provide solid protection for adventurers.',
        30,
        'medium',
        'chest',
        'uncommon',
        200,
        {
            constitution: 2,
            defense: 5,
            durability: 150
        }
    ),

    plate_armor: new RPGArmor(
        'plate_armor',
        'Plate Armor',
        'Heavy steel plates offering maximum protection at the cost of mobility.',
        50,
        'heavy',
        'chest',
        'rare',
        500,
        {
            strength: 3,
            constitution: 3,
            defense: 10,
            durability: 250
        }
    ),

    crystal_helmet: new RPGArmor(
        'crystal_helmet',
        'Crystal Helmet',
        'A helmet infused with crystal energy, providing magical protection.',
        20,
        'light',
        'helmet',
        'rare',
        300,
        {
            wisdom: 3,
            magicResistance: 15,
            durability: 120
        }
    ),

    shadow_boots: new RPGArmor(
        'shadow_boots',
        'Shadow Boots',
        'Boots that allow the wearer to move silently and blend with darkness.',
        12,
        'light',
        'boots',
        'uncommon',
        180,
        {
            stealth: 4,
            movementSpeed: 10,
            durability: 90
        }
    ),

    guardians_shield: new RPGArmor(
        'guardians_shield',
        'Guardian\'s Shield',
        'An enchanted shield that protects against both physical and magical attacks.',
        35,
        'medium',
        'offhand',
        'epic',
        450,
        {
            defense: 8,
            magicResistance: 20,
            blockChance: 15,
            durability: 180
        }
    )
};

// Consumable Definitions
export const ConsumableData = {
    health_potion: new RPGConsumable(
        'health_potion',
        'Health Potion',
        'A red potion that restores 50 health points when consumed.',
        (character) => character.heal(50),
        10,
        'common',
        25,
        'immediate'
    ),

    mana_potion: new RPGConsumable(
        'mana_potion',
        'Mana Potion',
        'A blue potion that restores 30 mana points when consumed.',
        (character) => character.restoreMana(30),
        8,
        'common',
        30,
        'immediate'
    ),

    strength_elixir: new RPGConsumable(
        'strength_elixir',
        'Strength Elixir',
        'A powerful elixir that boosts strength for 5 minutes.',
        (character) => character.addStatusEffect('strength_boost', 5, 300),
        5,
        'rare',
        100,
        'over_time',
        300
    ),

    healing_salve: new RPGConsumable(
        'healing_salve',
        'Healing Salve',
        'A salve that gradually heals wounds over time.',
        (character) => character.addStatusEffect('regeneration', 3, 180),
        3,
        'uncommon',
        60,
        'over_time',
        180
    ),

    crystal_essence: new RPGConsumable(
        'crystal_essence',
        'Crystal Essence',
        'A glowing essence that temporarily enhances magical abilities.',
        (character) => {
            character.addStatusEffect('magic_boost', 10, 240);
            character.restoreMana(20);
        },
        3,
        'epic',
        200,
        'immediate'
    ),

    shadow_antidote: new RPGConsumable(
        'shadow_antidote',
        'Shadow Antidote',
        'Cures shadow poisoning and provides temporary resistance to shadow effects.',
        (character) => {
            character.removeStatusEffect('poison');
            character.addStatusEffect('shadow_resistance', 50, 600);
        },
        2,
        'rare',
        150,
        'immediate'
    )
};

// Material Definitions
export const MaterialData = {
    crystal_dust: new Material(
        'crystal_dust',
        'Crystal Dust',
        'Fine dust from ground crystal shards. Used in magical crafting.',
        'rare',
        50
    ),

    shadow_essence: new Material(
        'shadow_essence',
        'Shadow Essence',
        'Captured essence from shadow creatures. Dangerous but valuable.',
        'epic',
        75
    ),

    volcanic_ore: new Material(
        'volcanic_ore',
        'Volcanic Ore',
        'Ore from active volcanoes, perfect for forging legendary weapons.',
        'rare',
        40
    ),

    ancient_rune: new Material(
        'ancient_rune',
        'Ancient Rune',
        'A carved rune stone containing forgotten knowledge.',
        'legendary',
        200
    ),

    storm_essence: new Material(
        'storm_essence',
        'Storm Essence',
        'Captured energy from lightning storms in the Whispering Winds.',
        'epic',
        85
    )
};

// Accessory Definitions
export const AccessoryData = {
    crystal_amulet: new Accessory(
        'crystal_amulet',
        'Crystal Amulet',
        'An amulet that helps detect crystal shards and provides minor magical protection.',
        'amulet',
        {
            wisdom: 2,
            magicResistance: 5,
            crystalSense: true
        },
        'uncommon',
        150
    ),

    shadow_map: new Accessory(
        'shadow_map',
        'Shadow Map',
        'A magical map that reveals hidden shadow locations and provides stealth bonuses.',
        'amulet',
        {
            stealth: 3,
            perception: 2,
            revealShadows: true
        },
        'rare',
        300
    ),

    elemental_ring: new Accessory(
        'elemental_ring',
        'Elemental Ring',
        'A ring that provides resistance to all elemental damage types.',
        'ring',
        {
            fireResistance: 10,
            iceResistance: 10,
            lightningResistance: 10,
            earthResistance: 10
        },
        'epic',
        400
    ),

    royal_seal: new Accessory(
        'royal_seal',
        'Royal Seal',
        'The official seal of King Theron, granting access to restricted areas.',
        'amulet',
        {
            authority: true,
            accessRoyalAreas: true
        },
        'rare',
        0 // Not for sale
    )
};

// Monster/Enemy Definitions
export const MonsterData = {
    goblin: {
        id: 'goblin',
        name: 'Goblin',
        description: 'Small, cowardly creatures that travel in packs and ambush the unwary.',
        level: 1,
        health: 30,
        maxHealth: 30,
        stats: {
            attack: 8,
            defense: 2,
            speed: 80,
            experience: 25,
            gold: 5
        },
        abilities: ['basic_attack'],
        loot: ['health_potion'],
        behavior: 'aggressive_pack'
    },

    orc: {
        id: 'orc',
        name: 'Orc Warrior',
        description: 'Large, brutish humanoids with superior strength but limited intelligence.',
        level: 3,
        health: 80,
        maxHealth: 80,
        stats: {
            attack: 18,
            defense: 8,
            speed: 60,
            experience: 50,
            gold: 15
        },
        abilities: ['power_attack', 'intimidate'],
        loot: ['chainmail'],
        behavior: 'aggressive_solo'
    },

    shadow_imp: {
        id: 'shadow_imp',
        name: 'Shadow Imp',
        description: 'Small shadow creatures that drain life force and hide in darkness.',
        level: 2,
        health: 25,
        maxHealth: 25,
        stats: {
            attack: 6,
            defense: 3,
            speed: 100,
            experience: 35,
            gold: 8,
            lifeDrain: 3
        },
        abilities: ['life_drain', 'hide_in_shadows'],
        loot: ['shadow_essence'],
        behavior: 'stealthy_ambush'
    },

    skeleton_warrior: {
        id: 'skeleton_warrior',
        name: 'Skeleton Warrior',
        description: 'Animated bones brought to life by dark magic, relentless in combat.',
        level: 2,
        health: 40,
        maxHealth: 40,
        stats: {
            attack: 12,
            defense: 6,
            speed: 70,
            experience: 30,
            gold: 10
        },
        abilities: ['bone_crush'],
        loot: ['ancient_rune'],
        behavior: 'relentless_charge'
    },

    troll: {
        id: 'troll',
        name: 'Mountain Troll',
        description: 'Massive creatures with incredible strength and regenerative abilities.',
        level: 6,
        health: 200,
        maxHealth: 200,
        stats: {
            attack: 35,
            defense: 15,
            speed: 40,
            experience: 150,
            gold: 50,
            regeneration: 5
        },
        abilities: ['smash', 'regenerate'],
        loot: ['troll_hide', 'volcanic_ore'],
        behavior: 'territorial_defense'
    },

    shadow_lord: {
        id: 'shadow_lord',
        name: 'Shadow Lord',
        description: 'Powerful shadow entities that command lesser shadows and manipulate darkness.',
        level: 8,
        health: 150,
        maxHealth: 150,
        stats: {
            attack: 40,
            defense: 20,
            speed: 90,
            experience: 300,
            gold: 100,
            shadowPower: 50
        },
        abilities: ['shadow_bolt', 'summon_minions', 'darkness_shroud'],
        loot: ['shadow_essence', 'shadow_map'],
        behavior: 'commanding_elite'
    },

    dragon_whelp: {
        id: 'dragon_whelp',
        name: 'Dragon Whelp',
        description: 'Young dragons with fiery breath and armored scales.',
        level: 10,
        health: 300,
        maxHealth: 300,
        stats: {
            attack: 50,
            defense: 30,
            speed: 70,
            experience: 500,
            gold: 200,
            fireBreath: 25
        },
        abilities: ['fire_breath', 'tail_sweep', 'wing_buffet'],
        loot: ['dragon_scale', 'crystal_essence'],
        behavior: 'territorial_dragon'
    },

    crystal_guardian: {
        id: 'crystal_guardian',
        name: 'Crystal Guardian',
        description: 'Ancient constructs created to protect the crystal shards, powered by pure crystal energy.',
        level: 12,
        health: 400,
        maxHealth: 400,
        stats: {
            attack: 45,
            defense: 40,
            speed: 50,
            experience: 1000,
            gold: 0, // Guardians don't carry gold
            crystalPower: 100
        },
        abilities: ['crystal_beam', 'energy_shield', 'teleport'],
        loot: ['crystal_dust', 'ancient_rune'],
        behavior: 'protector_construct'
    }
};

// Boss Monster Definitions
export const BossData = {
    shadow_commander: {
        id: 'shadow_commander',
        name: 'Shadow Commander',
        description: 'The leader of the shadow outpost, a powerful entity that commands shadow minions.',
        level: 5,
        health: 120,
        maxHealth: 120,
        stats: {
            attack: 25,
            defense: 12,
            speed: 85,
            experience: 200,
            gold: 75,
            commandPower: 30
        },
        abilities: ['command_minions', 'shadow_strike', 'darkness_burst'],
        loot: ['shadow_map', 'shadow_antidote'],
        behavior: 'boss_commander',
        phases: [
            { healthPercent: 100, abilities: ['command_minions', 'shadow_strike'] },
            { healthPercent: 50, abilities: ['command_minions', 'shadow_strike', 'darkness_burst'], enraged: true }
        ]
    },

    fire_elemental_lord: {
        id: 'fire_elemental_lord',
        name: 'Fire Elemental Lord',
        description: 'The ancient lord of flames, awakened by the Cataclysm\'s disruption of elemental balance.',
        level: 9,
        health: 350,
        maxHealth: 350,
        stats: {
            attack: 55,
            defense: 25,
            speed: 60,
            experience: 800,
            gold: 300,
            firePower: 80
        },
        abilities: ['fire_storm', 'lava_eruption', 'heat_wave'],
        loot: ['volcanic_ore', 'crystal_essence'],
        behavior: 'elemental_boss',
        phases: [
            { healthPercent: 100, abilities: ['fire_storm', 'heat_wave'] },
            { healthPercent: 60, abilities: ['fire_storm', 'lava_eruption', 'heat_wave'] },
            { healthPercent: 30, abilities: ['fire_storm', 'lava_eruption', 'heat_wave', 'final_burn'], enraged: true }
        ]
    },

    ancient_lich: {
        id: 'ancient_lich',
        name: 'Ancient Lich',
        description: 'A powerful undead sorcerer who has guarded forbidden knowledge for centuries.',
        level: 15,
        health: 500,
        maxHealth: 500,
        stats: {
            attack: 40,
            defense: 30,
            speed: 65,
            experience: 2000,
            gold: 1000,
            spellPower: 100
        },
        abilities: ['death_bolt', 'summon_skeletons', 'life_drain', 'curse'],
        loot: ['ancient_rune', 'crystal_essence', 'legendary_weapon'],
        behavior: 'lich_boss',
        phases: [
            { healthPercent: 100, abilities: ['death_bolt', 'summon_skeletons'] },
            { healthPercent: 70, abilities: ['death_bolt', 'summon_skeletons', 'life_drain'] },
            { healthPercent: 40, abilities: ['death_bolt', 'summon_skeletons', 'life_drain', 'curse'], summonRate: 2 },
            { healthPercent: 20, abilities: ['death_bolt', 'summon_skeletons', 'life_drain', 'curse', 'desperate_spell'], enraged: true }
        ]
    }
};

// Collection of all items for easy loading
export const AllItems = {
    ...WeaponData,
    ...ArmorData,
    ...ConsumableData,
    ...MaterialData,
    ...AccessoryData
};

export { WeaponData, ArmorData, ConsumableData, MaterialData, AccessoryData, MonsterData, BossData, AllItems };