import { GameObject } from '../../game-engine/src/core/GameObject.js';
import { ValidationHelpers } from '../../game-engine/src/core/ValidationHelpers.js';

/**
 * NPC (Non-Player Character) System
 * Extends GameObject for interactive characters in the game world
 */
class NPC extends GameObject {
    constructor(x, y, config = {}) {
        // Validate parameters
        ValidationHelpers.validateType(x, 'number', 'x');
        ValidationHelpers.validateType(y, 'number', 'y');
        ValidationHelpers.validateObject(config, ['id'], 'config');

        super(x, y);

        // Basic NPC properties
        this.id = config.id;
        this.name = config.name || 'Unknown NPC';
        this.displayName = config.displayName || this.name;
        this.description = config.description || '';

        // Visual properties
        this.sprite = config.sprite || null;
        this.portrait = config.portrait || null;
        this.animationSet = config.animationSet || {};

        // Dialog properties
        this.dialogId = config.dialogId || null;
        this.dialogManager = null; // Will be set by scene

        // Behavior properties
        this.behaviorType = config.behaviorType || 'static';
        this.movementPattern = config.movementPattern || 'idle';
        this.interactionRadius = config.interactionRadius || 32;

        // Schedule and AI properties
        this.schedule = config.schedule || [];
        this.currentScheduleIndex = 0;
        this.movementSpeed = config.movementSpeed || 50;
        this.wanderRadius = config.wanderRadius || 100;

        // State properties
        this.isInteractable = config.isInteractable !== false;
        this.isMoving = false;
        this.isTalking = false;
        this.facing = config.facing || 'down';

        // Movement waypoints for patterns
        this.waypoints = config.waypoints || [];
        this.currentWaypoint = 0;
        this.movementTimer = 0;
        this.idleTimer = 0;
        this.movementDuration = config.movementDuration || 2000; // 2 seconds
        this.idleDuration = config.idleDuration || 3000; // 3 seconds

        // Collision setup
        this.collision.enabled = true;
        this.collision.type = 'rectangle';
        this.collision.size = { width: 24, height: 24 };
        this.collision.offset = { x: -12, y: -12 };

        // Tags for identification
        this.addTag('npc');
        this.addTag('interactable');

        // Events
        this.on('interaction', (player) => this.handleInteraction(player));
        this.on('dialog-started', () => this.onDialogStart());
        this.on('dialog-ended', () => this.onDialogEnd());
    }

    update(deltaTime) {
        if (!this.active) return;

        super.update(deltaTime);

        // Update schedule
        this.updateSchedule(deltaTime);

        // Update movement pattern
        this.updateMovementPattern(deltaTime);

        // Update animation based on state
        this.updateAnimation();
    }

    updateSchedule(deltaTime) {
        if (this.schedule.length === 0) return;

        // Simple time-based schedule (can be expanded)
        const currentTime = Date.now();
        const scheduleEntry = this.schedule[this.currentScheduleIndex];

        if (scheduleEntry && currentTime >= scheduleEntry.time) {
            this.applyScheduleEntry(scheduleEntry);
            this.currentScheduleIndex = (this.currentScheduleIndex + 1) % this.schedule.length;
        }
    }

    applyScheduleEntry(entry) {
        switch (entry.type) {
            case 'move':
                this.moveTo(entry.x, entry.y);
                break;
            case 'behavior':
                this.behaviorType = entry.behavior;
                break;
            case 'dialog':
                this.dialogId = entry.dialogId;
                break;
            case 'visible':
                this.visible = entry.visible;
                break;
        }
    }

    updateMovementPattern(deltaTime) {
        if (this.isTalking) return; // Don't move while talking

        switch (this.movementPattern) {
            case 'idle':
                this.updateIdlePattern(deltaTime);
                break;
            case 'wander':
                this.updateWanderPattern(deltaTime);
                break;
            case 'patrol':
                this.updatePatrolPattern(deltaTime);
                break;
            case 'follow':
                this.updateFollowPattern(deltaTime);
                break;
            case 'waypoint':
                this.updateWaypointPattern(deltaTime);
                break;
        }
    }

    updateIdlePattern(deltaTime) {
        this.idleTimer += deltaTime * 1000;

        if (this.idleTimer >= this.idleDuration) {
            // Random small movement occasionally
            if (Math.random() < 0.3) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 20;
                const targetX = this.position.x + Math.cos(angle) * distance;
                const targetY = this.position.y + Math.sin(angle) * distance;

                this.moveTo(targetX, targetY);
            }
            this.idleTimer = 0;
        }
    }

    updateWanderPattern(deltaTime) {
        if (!this.isMoving) {
            this.movementTimer += deltaTime * 1000;

            if (this.movementTimer >= this.idleDuration) {
                // Choose random direction
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * this.wanderRadius;
                const targetX = this.position.x + Math.cos(angle) * distance;
                const targetY = this.position.y + Math.sin(angle) * distance;

                this.moveTo(targetX, targetY);
                this.movementTimer = 0;
            }
        } else {
            // Check if reached destination
            const dx = this.position.x - this.targetX;
            const dy = this.position.y - this.targetY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 5) {
                this.isMoving = false;
                this.velocity.x = 0;
                this.velocity.y = 0;
            }
        }
    }

    updatePatrolPattern(deltaTime) {
        if (this.waypoints.length === 0) return;

        if (!this.isMoving) {
            const waypoint = this.waypoints[this.currentWaypoint];
            if (waypoint) {
                this.moveTo(waypoint.x, waypoint.y);
                this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
            }
        } else {
            // Check if reached current waypoint
            const waypoint = this.waypoints[this.currentWaypoint];
            if (waypoint) {
                const dx = this.position.x - waypoint.x;
                const dy = this.position.y - waypoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 5) {
                    this.isMoving = false;
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                    // Wait before moving to next waypoint
                    this.movementTimer = 0;
                }
            }
        }
    }

    updateWaypointPattern(deltaTime) {
        // Similar to patrol but doesn't loop
        if (this.waypoints.length === 0) return;

        if (!this.isMoving && this.currentWaypoint < this.waypoints.length) {
            const waypoint = this.waypoints[this.currentWaypoint];
            this.moveTo(waypoint.x, waypoint.y);
        } else if (this.isMoving) {
            const waypoint = this.waypoints[this.currentWaypoint];
            if (waypoint) {
                const dx = this.position.x - waypoint.x;
                const dy = this.position.y - waypoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 5) {
                    this.isMoving = false;
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                    this.currentWaypoint++;
                }
            }
        }
    }

    updateFollowPattern(deltaTime) {
        // Follow player if available
        if (this.scene && this.scene.player) {
            const player = this.scene.player;
            const distance = this.distanceTo(player);

            if (distance > this.interactionRadius * 2) {
                // Move towards player
                const angle = this.angleTo(player);
                this.velocity.x = Math.cos(angle) * this.movementSpeed;
                this.velocity.y = Math.sin(angle) * this.movementSpeed;
                this.isMoving = true;
            } else {
                this.velocity.x = 0;
                this.velocity.y = 0;
                this.isMoving = false;
            }
        }
    }

    updateAnimation() {
        // Update facing direction based on movement
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            if (Math.abs(this.velocity.x) > Math.abs(this.velocity.y)) {
                this.facing = this.velocity.x > 0 ? 'right' : 'left';
            } else {
                this.facing = this.velocity.y > 0 ? 'down' : 'up';
            }
        }

        // Set animation based on state
        let animationName = 'idle';
        if (this.isMoving) {
            animationName = 'walk';
        }

        animationName += '_' + this.facing;

        if (this.animationSet[animationName]) {
            this.playAnimation(animationName);
        }
    }

    moveTo(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;

        const angle = Math.atan2(targetY - this.position.y, targetX - this.position.x);
        this.velocity.x = Math.cos(angle) * this.movementSpeed;
        this.velocity.y = Math.sin(angle) * this.movementSpeed;

        this.isMoving = true;
    }

    handleInteraction(player) {
        if (!this.isInteractable || !this.dialogManager) return;

        // Check if player is within interaction radius
        const distance = this.distanceTo(player);
        if (distance > this.interactionRadius) return;

        // Face the player
        const angle = this.angleTo(player);
        const angleDegrees = (angle * 180 / Math.PI + 360) % 360;

        if (angleDegrees >= 45 && angleDegrees < 135) {
            this.facing = 'down';
        } else if (angleDegrees >= 135 && angleDegrees < 225) {
            this.facing = 'left';
        } else if (angleDegrees >= 225 && angleDegrees < 315) {
            this.facing = 'up';
        } else {
            this.facing = 'right';
        }

        // Start dialog
        if (this.dialogId) {
            this.dialogManager.startDialog(this.dialogId, {
                player: player,
                npc: this,
                playerGold: player.gold || 0,
                playerLevel: player.level || 1,
                hasQuestItem: false // Can be extended
            });
        }
    }

    onDialogStart() {
        this.isTalking = true;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.isMoving = false;
    }

    onDialogEnd() {
        this.isTalking = false;
    }

    draw(ctx) {
        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(
            this.position.x - 8,
            this.position.y + 8,
            16, 8
        );

        // Draw NPC sprite or placeholder
        if (this.sprite) {
            // Draw sprite (implementation depends on sprite system)
            ctx.drawImage(
                this.sprite,
                this.position.x - 16,
                this.position.y - 24,
                32, 32
            );
        } else {
            // Draw placeholder rectangle
            ctx.fillStyle = '#8B4513'; // Brown color
            ctx.fillRect(
                this.position.x - 12,
                this.position.y - 20,
                24, 28
            );

            // Draw simple face
            ctx.fillStyle = '#FFE4B5'; // Moccasin color for face
            ctx.fillRect(
                this.position.x - 8,
                this.position.y - 16,
                16, 12
            );

            // Draw eyes
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.position.x - 4, this.position.y - 12, 2, 2);
            ctx.fillRect(this.position.x + 2, this.position.y - 12, 2, 2);
        }

        // Draw name if close to player
        if (this.scene && this.scene.player) {
            const distance = this.distanceTo(this.scene.player);
            if (distance < this.interactionRadius * 2) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeText(this.displayName, this.position.x, this.position.y - 28);
                ctx.fillText(this.displayName, this.position.x, this.position.y - 28);
            }
        }
    }

    // Utility methods
    setDialogManager(dialogManager) {
        this.dialogManager = dialogManager;
    }

    setMovementPattern(pattern) {
        this.movementPattern = pattern;
    }

    addWaypoint(x, y) {
        this.waypoints.push({ x, y });
    }

    clearWaypoints() {
        this.waypoints = [];
        this.currentWaypoint = 0;
    }

    setSchedule(newSchedule) {
        this.schedule = newSchedule;
        this.currentScheduleIndex = 0;
    }

    // Serialization for save/load
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            position: this.position,
            behaviorType: this.behaviorType,
            movementPattern: this.movementPattern,
            dialogId: this.dialogId,
            waypoints: this.waypoints,
            schedule: this.schedule,
            facing: this.facing
        };
    }

    static fromJSON(data) {
        const npc = new NPC(data.position.x, data.position.y, data);
        return npc;
    }
}

export { NPC };