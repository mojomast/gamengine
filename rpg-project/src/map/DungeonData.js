// Dungeon Data - Complex dungeon layouts and puzzle mechanics for Elyndor RPG
// Contains detailed dungeon maps with puzzles, traps, and interactive elements

export const DUNGEON_MAPS = {
    crystal_temple: {
        width: 25,
        height: 20,
        tilewidth: 32,
        tileheight: 32,
        properties: {
            name: "Crystal Temple",
            music: "temple_theme.mp3",
            encounters: ["shadow_imp", "crystal_guardian"],
            puzzles: ["crystal_alignment", "ward_activation"],
            loot: ["shard_of_light", "crystal_dust"]
        },
        tilesets: [{
            name: "temple_tiles",
            firstgid: 1,
            tilewidth: 32,
            tileheight: 32,
            columns: 16,
            tilecount: 256,
            image: "assets/maps/temple_tiles.png",
            imagewidth: 512,
            imageheight: 512
        }],
        layers: [
            {
                name: "background",
                data: [
                    // Temple interior with crystal formations
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                    1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
                    1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,
                    1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2,1,
                    1,2,3,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,2,1,
                    1,2,3,4,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,5,4,2,1,
                    1,2,3,4,5,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,8,8,8,8,8,8,8,8,8,8,8,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,9,9,9,9,9,9,9,9,9,9,9,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,10,10,10,10,10,10,10,10,10,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,11,11,11,11,11,11,10,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,12,12,12,12,12,10,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,12,13,13,12,11,10,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,12,13,12,11,10,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,12,11,10,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,10,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,7,6,5,4,2,1,
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
                ]
            },
            {
                name: "collision",
                data: [
                    // Collision layer with puzzle elements and barriers
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
                ]
            },
            {
                name: "foreground",
                data: [
                    // Decorative elements and interactive objects
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
                ]
            }
        ]
    },

    shadow_rift_dungeon: {
        width: 30,
        height: 25,
        tilewidth: 32,
        tileheight: 32,
        properties: {
            name: "Shadow Rift Dungeon",
            music: "shadow_theme.mp3",
            encounters: ["shadow_imp", "shadow_lord", "ancient_lich"],
            puzzles: ["rift_stabilization", "shadow_bridge"],
            loot: ["shadow_essence", "ancient_rune"],
            hazards: ["shadow_fissures", "darkness_zones"]
        },
        tilesets: [{
            name: "shadow_tiles",
            firstgid: 1,
            tilewidth: 32,
            tileheight: 32,
            columns: 16,
            tilecount: 256,
            image: "assets/maps/shadow_tiles.png",
            imagewidth: 512,
            imageheight: 512
        }],
        layers: [
            {
                name: "background",
                data: [
                    // Shadow rift with unstable terrain
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                    1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
                    1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,
                    1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,
                    1,2,3,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,3,2,1,
                    1,2,3,4,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,10,10,10,10,10,10,10,10,10,10,10,10,9,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,11,11,11,11,11,11,11,11,10,9,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,12,12,12,12,12,12,12,11,10,9,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,12,13,13,13,13,12,11,10,9,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,12,13,14,14,13,12,11,10,9,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,12,13,14,13,12,11,10,9,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,12,13,12,11,10,9,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,12,11,10,9,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,10,9,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,9,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,8,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,7,6,5,4,3,2,1,
                    1,2,3,4,5,6,5,4,3,2,1,
                    1,2,3,4,5,4,3,2,1,
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
                ]
            },
            {
                name: "collision",
                data: [
                    // Collision with shadow fissures and unstable areas
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
                ]
            },
            {
                name: "foreground",
                data: [
                    // Interactive shadow elements and hazards
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
                ]
            }
        ]
    },

    forge_peaks_dungeon: {
        width: 20,
        height: 18,
        tilewidth: 32,
        tileheight: 32,
        properties: {
            name: "Forge Peaks Dungeon",
            music: "forge_theme.mp3",
            encounters: ["fire_elemental", "grom_ironfist"],
            puzzles: ["forge_restoration", "lava_puzzle"],
            loot: ["volcanic_ore", "legendary_weapon"],
            hazards: ["lava_pits", "falling_rocks"]
        },
        tilesets: [{
            name: "forge_tiles",
            firstgid: 1,
            tilewidth: 32,
            tileheight: 32,
            columns: 16,
            tilecount: 256,
            image: "assets/maps/forge_tiles.png",
            imagewidth: 512,
            imageheight: 512
        }],
        layers: [
            {
                name: "background",
                data: [
                    // Volcanic forge interior
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                    1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
                    1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,
                    1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2,1,
                    1,2,3,4,5,5,5,5,5,5,5,5,5,5,5,5,5,4,2,1,
                    1,2,3,4,5,6,6,6,6,6,6,6,6,6,6,6,6,5,4,2,1,
                    1,2,3,4,5,6,7,7,7,7,7,7,7,7,7,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,8,8,8,8,8,8,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,9,9,9,9,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,10,10,10,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,10,11,10,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,9,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,8,7,6,5,4,2,1,
                    1,2,3,4,5,6,7,6,5,4,2,1,
                    1,2,3,4,5,6,5,4,2,1,
                    1,2,3,4,5,4,2,1,
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
                ]
            },
            {
                name: "collision",
                data: [
                    // Collision with lava and forge elements
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
                ]
            },
            {
                name: "foreground",
                data: [
                    // Anvil, forge tools, and molten elements
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
                ]
            }
        ]
    }
};

// Puzzle Systems
export const PuzzleData = {
    crystal_alignment: {
        id: 'crystal_alignment',
        name: 'Crystal Alignment',
        description: 'Align the crystal pillars to focus light beams and unlock the path.',
        type: 'alignment',
        elements: {
            pillars: [
                { id: 'pillar_north', position: { x: 12, y: 5 }, rotation: 0, required: 90 },
                { id: 'pillar_east', position: { x: 18, y: 12 }, rotation: 0, required: 180 },
                { id: 'pillar_south', position: { x: 12, y: 18 }, rotation: 0, required: 270 },
                { id: 'pillar_west', position: { x: 5, y: 12 }, rotation: 0, required: 0 }
            ],
            light_beams: [
                { from: 'pillar_north', to: 'center_crystal', color: 'blue' },
                { from: 'pillar_east', to: 'center_crystal', color: 'red' },
                { from: 'pillar_south', to: 'center_crystal', color: 'green' },
                { from: 'pillar_west', to: 'center_crystal', color: 'yellow' }
            ]
        },
        solution: 'align_all_pillars_correctly',
        reward: 'unlock_inner_temple'
    },

    shadow_bridge: {
        id: 'shadow_bridge',
        name: 'Shadow Bridge',
        description: 'Cross the unstable shadow bridge by timing your movements with the bridge\'s manifestations.',
        type: 'timing',
        elements: {
            bridge_segments: [
                { id: 'segment_1', position: { x: 10, y: 8 }, duration: 3000, delay: 0 },
                { id: 'segment_2', position: { x: 11, y: 8 }, duration: 3000, delay: 1000 },
                { id: 'segment_3', position: { x: 12, y: 8 }, duration: 3000, delay: 2000 },
                { id: 'segment_4', position: { x: 13, y: 8 }, duration: 3000, delay: 3000 },
                { id: 'segment_5', position: { x: 14, y: 8 }, duration: 3000, delay: 4000 }
            ],
            safe_zones: [
                { position: { x: 9, y: 8 } },
                { position: { x: 15, y: 8 } }
            ]
        },
        solution: 'cross_bridge_timing_correctly',
        reward: 'access_shadow_realm'
    },

    lava_puzzle: {
        id: 'lava_puzzle',
        name: 'Lava Flow Control',
        description: 'Redirect lava flows to create safe paths and activate forge mechanisms.',
        type: 'flow_control',
        elements: {
            valves: [
                { id: 'valve_main', position: { x: 8, y: 6 }, state: 'closed' },
                { id: 'valve_branch_1', position: { x: 12, y: 6 }, state: 'closed' },
                { id: 'valve_branch_2', position: { x: 12, y: 10 }, state: 'closed' }
            ],
            lava_flows: [
                { id: 'flow_main', path: [{ x: 8, y: 7 }, { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 8, y: 10 }] },
                { id: 'flow_branch_1', path: [{ x: 12, y: 7 }, { x: 12, y: 8 }, { x: 12, y: 9 }] },
                { id: 'flow_branch_2', path: [{ x: 11, y: 10 }, { x: 10, y: 10 }, { x: 9, y: 10 }] }
            ],
            pressure_plates: [
                { id: 'plate_forge', position: { x: 6, y: 12 }, required_flow: 'flow_main' },
                { id: 'plate_anvil', position: { x: 14, y: 8 }, required_flow: 'flow_branch_1' },
                { id: 'plate_cooling', position: { x: 8, y: 14 }, required_flow: 'flow_branch_2' }
            ]
        },
        solution: 'redirect_lava_to_all_pressure_plates',
        reward: 'activate_forge_mechanisms'
    },

    ward_activation: {
        id: 'ward_activation',
        name: 'Ancient Ward Activation',
        description: 'Solve the ancient ward puzzle to deactivate protective barriers.',
        type: 'symbol_matching',
        elements: {
            symbols: [
                { id: 'symbol_fire', position: { x: 6, y: 8 }, element: 'fire', rune: 'ᚠ' },
                { id: 'symbol_water', position: { x: 14, y: 8 }, element: 'water', rune: 'ᚹ' },
                { id: 'symbol_earth', position: { x: 10, y: 6 }, element: 'earth', rune: 'ᛖ' },
                { id: 'symbol_air', position: { x: 10, y: 10 }, element: 'air', rune: 'ᚫ' }
            ],
            sequence: ['fire', 'earth', 'air', 'water'],
            barriers: [
                { id: 'barrier_1', position: { x: 10, y: 7 }, active: true },
                { id: 'barrier_2', position: { x: 11, y: 8 }, active: true },
                { id: 'barrier_3', position: { x: 10, y: 9 }, active: true },
                { id: 'barrier_4', position: { x: 9, y: 8 }, active: true }
            ]
        },
        solution: 'activate_symbols_in_correct_sequence',
        reward: 'deactivate_all_barriers'
    },

    rift_stabilization: {
        id: 'rift_stabilization',
        name: 'Rift Stabilization',
        description: 'Stabilize the shadow rift by aligning containment runes and balancing shadow energies.',
        type: 'energy_balance',
        elements: {
            containment_runes: [
                { id: 'rune_stability', position: { x: 8, y: 6 }, energy: 0, max_energy: 100 },
                { id: 'rune_purity', position: { x: 18, y: 6 }, energy: 0, max_energy: 100 },
                { id: 'rune_balance', position: { x: 13, y: 4 }, energy: 0, max_energy: 100 }
            ],
            energy_sources: [
                { id: 'crystal_node_1', position: { x: 6, y: 8 }, energy_type: 'light', amount: 25 },
                { id: 'crystal_node_2', position: { x: 20, y: 8 }, energy_type: 'light', amount: 25 },
                { id: 'shadow_node_1', position: { x: 10, y: 12 }, energy_type: 'shadow', amount: 30 },
                { id: 'shadow_node_2', position: { x: 16, y: 12 }, energy_type: 'shadow', amount: 30 }
            ],
            stabilizers: [
                { id: 'stabilizer_1', position: { x: 13, y: 8 }, required_balance: 50 },
                { id: 'stabilizer_2', position: { x: 13, y: 12 }, required_balance: 75 }
            ]
        },
        solution: 'balance_light_and_shadow_energies',
        reward: 'stabilize_shadow_rift'
    }
};

// Interactive Objects and Mechanisms
export const InteractiveData = {
    crystal_pedestal: {
        id: 'crystal_pedestal',
        name: 'Crystal Pedestal',
        description: 'An ancient pedestal that accepts crystal shards.',
        type: 'item_receptacle',
        position: { x: 12, y: 12 },
        requirements: ['crystal_shard'],
        onActivate: 'activate_crystal_alignment_puzzle',
        reward: 'unlock_temple_vault'
    },

    shadow_altar: {
        id: 'shadow_altar',
        name: 'Shadow Altar',
        description: 'A dark altar pulsing with shadow energy.',
        type: 'ritual_site',
        position: { x: 15, y: 10 },
        requirements: ['shadow_essence', 'ancient_rune'],
        onActivate: 'begin_shadow_ritual',
        reward: 'summon_shadow_minions'
    },

    forge_anvil: {
        id: 'forge_anvil',
        name: 'Master Anvil',
        description: 'The legendary anvil of dwarven craftsmanship.',
        type: 'crafting_station',
        position: { x: 10, y: 12 },
        requirements: ['volcanic_ore', 'crystal_dust', 'legendary_weapon_blueprint'],
        onActivate: 'craft_legendary_weapon',
        reward: 'obtain_legendary_weapon'
    },

    ancient_ward: {
        id: 'ancient_ward',
        name: 'Ancient Ward',
        description: 'A magical barrier protecting forbidden knowledge.',
        type: 'barrier',
        position: { x: 10, y: 8 },
        requirements: ['solve_ward_puzzle'],
        onActivate: 'deactivate_barrier',
        reward: 'access_forbidden_chamber'
    }
};

export { DUNGEON_MAPS, PuzzleData, InteractiveData };