/**
 * PartyManager - Manages a 4-character party with movement and collision detection
 */

import { ValidationHelpers } from '../../game-engine/src/core/ValidationHelpers.js';

class PartyFormation {
    static FORMATIONS = {
        SQUARE: 'square',
        LINE: 'line',
        DIAMOND: 'diamond',
        V_SHAPE: 'v-shape'
    };

    static getFormationPositions(formation, leaderX, leaderY, spacing = 32) {
        const positions = [];

        switch (formation) {
            case PartyFormation.FORMATIONS.SQUARE:
                positions.push(
                    { x: leaderX - spacing, y: leaderY - spacing }, // Top-left
                    { x: leaderX + spacing, y: leaderY - spacing }, // Top-right
                    { x: leaderX - spacing, y: leaderY + spacing }  // Bottom-left
                );
                break;

            case PartyFormation.FORMATIONS.LINE:
                positions.push(
                    { x: leaderX - spacing * 2, y: leaderY }, // Left
                    { x: leaderX - spacing, y: leaderY },     // Middle-left
                    { x: leaderX + spacing, y: leaderY }      // Right
                );
                break;

            case PartyFormation.FORMATIONS.DIAMOND:
                positions.push(
                    { x: leaderX, y: leaderY - spacing * 2 },    // Top
                    { x: leaderX - spacing, y: leaderY },         // Left
                    { x: leaderX + spacing, y: leaderY }          // Right
                );
                break;

            case PartyFormation.FORMATIONS.V_SHAPE:
                positions.push(
                    { x: leaderX - spacing * 1.5, y: leaderY + spacing }, // Bottom-left
                    { x: leaderX - spacing * 0.5, y: leaderY + spacing }, // Bottom-center-left
                    { x: leaderX + spacing * 0.5, y: leaderY + spacing }  // Bottom-center-right
                );
                break;

            default:
                // Default to square formation
                return PartyFormation.getFormationPositions(PartyFormation.FORMATIONS.SQUARE, leaderX, leaderY, spacing);
        }

        return positions;
    }
}

class PartyManager {
    constructor(options = {}) {
        this.maxPartySize = options.maxPartySize || 4;
        this.members = [];
        this.leader = null;
        this.formation = PartyFormation.FORMATIONS.SQUARE;
        this.formationSpacing = options.formationSpacing || 32;
        this.collisionDetection = options.collisionDetection !== false;
        this.movementSpeed = options.movementSpeed || 100;

        // Movement state
        this.targetPositions = new Map();
        this.movementQueue = [];
        this.isMoving = false;

        // Collision and pathfinding
        this.collisionMap = null;
        this.pathfindingGrid = null;
    }

    addMember(character, position = null) {
        ValidationHelpers.validateObject(character, ['name'], 'character');

        if (this.members.length >= this.maxPartySize) {
            return { success: false, message: "Party is full" };
        }

        if (this.members.find(m => m.character.name === character.name)) {
            return { success: false, message: "Character already in party" };
        }

        const member = {
            character,
            position: position || { x: 0, y: 0 },
            targetPosition: null,
            isMoving: false,
            formationIndex: this.members.length
        };

        this.members.push(member);

        // Set as leader if first member
        if (!this.leader) {
            this.leader = member;
        }

        // Update formation positions
        this.updateFormationPositions();

        return { success: true, member };
    }

    removeMember(characterName) {
        ValidationHelpers.validateType(characterName, 'string', 'characterName');

        const index = this.members.findIndex(m => m.character.name === characterName);
        if (index === -1) {
            return { success: false, message: "Character not found in party" };
        }

        const removed = this.members.splice(index, 1)[0];

        // Update leader if necessary
        if (this.leader === removed) {
            this.leader = this.members[0] || null;
        }

        // Update formation indices
        this.members.forEach((member, idx) => {
            member.formationIndex = idx;
        });

        this.updateFormationPositions();

        return { success: true, removed: removed.character };
    }

    setLeader(characterName) {
        ValidationHelpers.validateType(characterName, 'string', 'characterName');

        const member = this.members.find(m => m.character.name === characterName);
        if (!member) {
            return { success: false, message: "Character not found in party" };
        }

        this.leader = member;
        this.updateFormationPositions();

        return { success: true };
    }

    setFormation(formation) {
        if (!Object.values(PartyFormation.FORMATIONS).includes(formation)) {
            return { success: false, message: "Invalid formation" };
        }

        this.formation = formation;
        this.updateFormationPositions();

        return { success: true };
    }

    updateFormationPositions() {
        if (!this.leader || this.members.length <= 1) return;

        const leaderPos = this.leader.position;
        const formationPositions = PartyFormation.getFormationPositions(
            this.formation,
            leaderPos.x,
            leaderPos.y,
            this.formationSpacing
        );

        // Assign positions to non-leader members
        this.members.forEach((member, index) => {
            if (member !== this.leader && index - 1 < formationPositions.length) {
                const formationPos = formationPositions[index - 1];
                if (this.collisionDetection) {
                    member.targetPosition = this.findValidPosition(formationPos);
                } else {
                    member.targetPosition = { ...formationPos };
                }
            }
        });
    }

    moveParty(targetX, targetY) {
        if (!this.leader) return false;

        // Move leader to target position
        this.leader.targetPosition = { x: targetX, y: targetY };
        this.leader.isMoving = true;

        // Update formation positions
        this.updateFormationPositions();

        this.isMoving = true;
        return true;
    }

    update(deltaTime) {
        let allReached = true;

        this.members.forEach(member => {
            if (member.targetPosition && member.isMoving) {
                const reached = this.updateMemberMovement(member, deltaTime);
                if (!reached) {
                    allReached = false;
                }
            }
        });

        if (allReached) {
            this.isMoving = false;
        }
    }

    updateMemberMovement(member, deltaTime) {
        const currentPos = member.position;
        const targetPos = member.targetPosition;

        if (!targetPos) return true;

        const distance = Math.sqrt(
            Math.pow(targetPos.x - currentPos.x, 2) +
            Math.pow(targetPos.y - currentPos.y, 2)
        );

        if (distance < 5) { // Close enough to target
            member.position.x = targetPos.x;
            member.position.y = targetPos.y;
            member.targetPosition = null;
            member.isMoving = false;
            return true;
        }

        // Move towards target
        const speed = this.movementSpeed * deltaTime;
        const angle = Math.atan2(targetPos.y - currentPos.y, targetPos.x - currentPos.x);

        const newX = currentPos.x + Math.cos(angle) * speed;
        const newY = currentPos.y + Math.sin(angle) * speed;

        // Check collision if enabled
        if (this.collisionDetection && this.collisionMap) {
            if (this.isPositionBlocked(newX, newY)) {
                // Try to find alternative path or stop
                member.isMoving = false;
                return false;
            }
        }

        member.position.x = newX;
        member.position.y = newY;

        return false;
    }

    isPositionBlocked(x, y) {
        if (!this.collisionMap) return false;

        // Simple grid-based collision check
        const gridX = Math.floor(x / this.collisionMap.tileSize);
        const gridY = Math.floor(y / this.collisionMap.tileSize);

        return this.collisionMap.isBlocked(gridX, gridY);
    }

    findValidPosition(targetPos) {
        // Simple collision avoidance - try adjacent positions
        const attempts = [
            { x: targetPos.x, y: targetPos.y }, // Original
            { x: targetPos.x + 16, y: targetPos.y }, // Right
            { x: targetPos.x - 16, y: targetPos.y }, // Left
            { x: targetPos.x, y: targetPos.y + 16 }, // Down
            { x: targetPos.x, y: targetPos.y - 16 }, // Up
            { x: targetPos.x + 16, y: targetPos.y + 16 }, // Down-right
            { x: targetPos.x - 16, y: targetPos.y - 16 }, // Up-left
            { x: targetPos.x + 16, y: targetPos.y - 16 }, // Up-right
            { x: targetPos.x - 16, y: targetPos.y + 16 }  // Down-left
        ];

        for (const pos of attempts) {
            if (!this.isPositionBlocked(pos.x, pos.y)) {
                return pos;
            }
        }

        // If no valid position found, return original
        return targetPos;
    }

    setCollisionMap(collisionMap) {
        this.collisionMap = collisionMap;
    }

    getPartyInfo() {
        return {
            size: this.members.length,
            maxSize: this.maxPartySize,
            leader: this.leader ? this.leader.character.name : null,
            formation: this.formation,
            members: this.members.map(member => ({
                name: member.character.name,
                level: member.character.level,
                job: member.character.getJobInfo()?.name || 'None',
                health: member.character.health,
                maxHealth: member.character.maxHealth,
                position: { ...member.position },
                isMoving: member.isMoving
            })),
            isMoving: this.isMoving
        };
    }

    getMemberByName(name) {
        ValidationHelpers.validateType(name, 'string', 'name');
        return this.members.find(m => m.character.name === name);
    }

    getAllMembers() {
        return this.members.map(m => m.character);
    }

    getMemberPositions() {
        return this.members.map(member => ({
            name: member.character.name,
            position: { ...member.position },
            targetPosition: member.targetPosition ? { ...member.targetPosition } : null
        }));
    }

    // Combat formation methods
    enterCombatFormation() {
        // Tight formation for combat
        this.formationSpacing = 16;
        this.updateFormationPositions();
    }

    enterExplorationFormation() {
        // Spread out formation for exploration
        this.formationSpacing = 48;
        this.updateFormationPositions();
    }

    // Save/Load functionality
    getSaveData() {
        return {
            maxPartySize: this.maxPartySize,
            formation: this.formation,
            formationSpacing: this.formationSpacing,
            leaderName: this.leader ? this.leader.character.name : null,
            members: this.members.map(member => ({
                characterName: member.character.name,
                position: member.position,
                formationIndex: member.formationIndex
            }))
        };
    }

    loadSaveData(data, characterMap) {
        this.maxPartySize = data.maxPartySize || 4;
        this.formation = data.formation || PartyFormation.FORMATIONS.SQUARE;
        this.formationSpacing = data.formationSpacing || 32;

        // Clear current party
        this.members = [];
        this.leader = null;

        // Restore members
        if (data.members) {
            data.members.forEach(memberData => {
                const character = characterMap[memberData.characterName];
                if (character) {
                    const member = {
                        character,
                        position: memberData.position,
                        targetPosition: null,
                        isMoving: false,
                        formationIndex: memberData.formationIndex
                    };

                    this.members.push(member);

                    // Set leader
                    if (memberData.characterName === data.leaderName) {
                        this.leader = member;
                    }
                }
            });
        }

        this.updateFormationPositions();
    }
}

export { PartyManager, PartyFormation };