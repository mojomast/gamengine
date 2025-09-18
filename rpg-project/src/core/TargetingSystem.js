/**
 * TargetingSystem.js - Advanced Targeting System for Magic and Abilities
 * Handles single target, area targeting, self-targeting, and area effects
 */

import { TARGET_TYPES } from '../../game-engine/src/core/AbilityManager.js';

class TargetSelector {
    constructor(type, parameters = {}) {
        this.type = type;
        this.parameters = parameters;
    }

    selectTargets(caster, targetPoint, allEntities) {
        switch (this.type) {
            case TARGET_TYPES.SINGLE:
                return this.selectSingleTarget(caster, targetPoint, allEntities);
            case TARGET_TYPES.AREA:
                return this.selectAreaTargets(caster, targetPoint, allEntities);
            case TARGET_TYPES.SELF:
                return [caster];
            default:
                return [];
        }
    }

    selectSingleTarget(caster, targetPoint, allEntities) {
        // Find closest enemy to target point
        const enemies = allEntities.filter(entity =>
            entity !== caster &&
            this.isHostile(caster, entity) &&
            this.isInRange(caster, entity, this.parameters.range || 100)
        );

        if (enemies.length === 0) return [];

        // Find enemy closest to target point
        let closestEnemy = null;
        let closestDistance = Infinity;

        enemies.forEach(enemy => {
            const distance = this.getDistance(targetPoint, enemy.position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });

        return closestEnemy ? [closestEnemy] : [];
    }

    selectAreaTargets(caster, centerPoint, allEntities) {
        const radius = this.parameters.radius || 50;
        const maxTargets = this.parameters.maxTargets || 10;

        const targets = allEntities.filter(entity => {
            const distance = this.getDistance(centerPoint, entity.position);
            return distance <= radius &&
                   this.isValidTarget(caster, entity, this.parameters.targetFilter);
        });

        // Limit number of targets if specified
        if (maxTargets > 0 && targets.length > maxTargets) {
            // Sort by distance and take closest
            targets.sort((a, b) => {
                const distA = this.getDistance(centerPoint, a.position);
                const distB = this.getDistance(centerPoint, b.position);
                return distA - distB;
            });
            return targets.slice(0, maxTargets);
        }

        return targets;
    }

    isValidTarget(caster, entity, filter) {
        if (!filter) return entity !== caster;

        switch (filter) {
            case 'enemies':
                return this.isHostile(caster, entity);
            case 'allies':
                return !this.isHostile(caster, entity) && entity !== caster;
            case 'all':
                return entity !== caster;
            default:
                return entity !== caster;
        }
    }

    isHostile(caster, entity) {
        // Simple hostility check - can be enhanced with faction system
        return entity.team !== caster.team;
    }

    isInRange(caster, target, range) {
        const distance = this.getDistance(caster.position, target.position);
        return distance <= range;
    }

    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class AreaShape {
    static CIRCLE = 'circle';
    static RECTANGLE = 'rectangle';
    static CONE = 'cone';
    static LINE = 'line';

    static getTargetsInShape(center, shape, parameters, allEntities) {
        switch (shape) {
            case AreaShape.CIRCLE:
                return AreaShape.getCircleTargets(center, parameters.radius || 50, allEntities);
            case AreaShape.RECTANGLE:
                return AreaShape.getRectangleTargets(center, parameters.width || 100, parameters.height || 50, allEntities);
            case AreaShape.CONE:
                return AreaShape.getConeTargets(center, parameters.angle || 90, parameters.range || 100, allEntities);
            case AreaShape.LINE:
                return AreaShape.getLineTargets(center, parameters.direction || { x: 1, y: 0 }, parameters.length || 100, parameters.width || 20, allEntities);
            default:
                return [];
        }
    }

    static getCircleTargets(center, radius, allEntities) {
        return allEntities.filter(entity => {
            const distance = Math.sqrt(
                Math.pow(entity.position.x - center.x, 2) +
                Math.pow(entity.position.y - center.y, 2)
            );
            return distance <= radius;
        });
    }

    static getRectangleTargets(center, width, height, allEntities) {
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        return allEntities.filter(entity =>
            entity.position.x >= center.x - halfWidth &&
            entity.position.x <= center.x + halfWidth &&
            entity.position.y >= center.y - halfHeight &&
            entity.position.y <= center.y + halfHeight
        );
    }

    static getConeTargets(center, angle, range, allEntities) {
        const angleRad = (angle * Math.PI) / 180;
        const halfAngle = angleRad / 2;

        return allEntities.filter(entity => {
            const dx = entity.position.x - center.x;
            const dy = entity.position.y - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > range || distance === 0) return false;

            const targetAngle = Math.atan2(dy, dx);
            const centerAngle = center.facing || 0; // Assume facing direction
            const angleDiff = Math.abs(targetAngle - centerAngle);

            return angleDiff <= halfAngle;
        });
    }

    static getLineTargets(center, direction, length, width, allEntities) {
        const halfWidth = width / 2;
        const endPoint = {
            x: center.x + direction.x * length,
            y: center.y + direction.y * length
        };

        return allEntities.filter(entity => {
            // Check if entity is within the line's bounding box
            const minX = Math.min(center.x, endPoint.x) - halfWidth;
            const maxX = Math.max(center.x, endPoint.x) + halfWidth;
            const minY = Math.min(center.y, endPoint.y) - halfWidth;
            const maxY = Math.max(center.y, endPoint.y) + halfWidth;

            if (entity.position.x < minX || entity.position.x > maxX ||
                entity.position.y < minY || entity.position.y > maxY) {
                return false;
            }

            // Check perpendicular distance to line
            const lineLength = Math.sqrt(
                Math.pow(endPoint.x - center.x, 2) +
                Math.pow(endPoint.y - center.y, 2)
            );

            if (lineLength === 0) return false;

            const t = Math.max(0, Math.min(1,
                ((entity.position.x - center.x) * (endPoint.x - center.x) +
                 (entity.position.y - center.y) * (endPoint.y - center.y)) /
                (lineLength * lineLength)
            ));

            const closestPoint = {
                x: center.x + t * (endPoint.x - center.x),
                y: center.y + t * (endPoint.y - center.y)
            };

            const distance = Math.sqrt(
                Math.pow(entity.position.x - closestPoint.x, 2) +
                Math.pow(entity.position.y - closestPoint.y, 2)
            );

            return distance <= halfWidth;
        });
    }
}

class AreaEffect {
    constructor(center, shape, parameters, effectFunction, duration = 0) {
        this.center = center;
        this.shape = shape;
        this.parameters = parameters;
        this.effectFunction = effectFunction;
        this.duration = duration;
        this.elapsed = 0;
        this.active = true;
        this.affectedEntities = new Set();
    }

    update(deltaTime, allEntities) {
        if (!this.active) return;

        this.elapsed += deltaTime;

        // Get current targets in area
        const currentTargets = AreaShape.getTargetsInShape(
            this.center,
            this.shape,
            this.parameters,
            allEntities
        );

        // Apply effect to new targets
        currentTargets.forEach(entity => {
            if (!this.affectedEntities.has(entity)) {
                this.affectedEntities.add(entity);
                this.effectFunction(entity, this.elapsed);
            }
        });

        // Remove entities that left the area
        const currentTargetIds = new Set(currentTargets.map(e => e.id));
        this.affectedEntities.forEach(entity => {
            if (!currentTargetIds.has(entity.id)) {
                this.affectedEntities.delete(entity);
                // Could trigger exit effect here
            }
        });

        // Check if effect should end
        if (this.duration > 0 && this.elapsed >= this.duration) {
            this.end();
        }
    }

    end() {
        this.active = false;
        this.affectedEntities.clear();
        // Cleanup logic here
    }

    getAffectedCount() {
        return this.affectedEntities.size;
    }
}

class ChainTargeting {
    constructor(maxChains = 3, maxDistance = 50) {
        this.maxChains = maxChains;
        this.maxDistance = maxDistance;
    }

    getChainTargets(initialTarget, allEntities, caster) {
        const chain = [initialTarget];
        let currentTarget = initialTarget;

        for (let i = 1; i < this.maxChains; i++) {
            const nextTarget = this.findNextChainTarget(currentTarget, allEntities, caster, chain);
            if (!nextTarget) break;

            chain.push(nextTarget);
            currentTarget = nextTarget;
        }

        return chain;
    }

    findNextChainTarget(currentTarget, allEntities, caster, excludeTargets) {
        const availableTargets = allEntities.filter(entity =>
            entity !== caster &&
            !excludeTargets.includes(entity) &&
            this.isHostile(caster, entity)
        );

        let closestTarget = null;
        let closestDistance = Infinity;

        availableTargets.forEach(target => {
            const distance = this.getDistance(currentTarget.position, target.position);
            if (distance <= this.maxDistance && distance < closestDistance) {
                closestDistance = distance;
                closestTarget = target;
            }
        });

        return closestTarget;
    }

    isHostile(caster, entity) {
        return entity.team !== caster.team;
    }

    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class AdvancedTargetingSystem {
    constructor() {
        this.targetSelectors = new Map();
        this.areaEffects = new Set();
        this.chainTargeting = new ChainTargeting();
    }

    // Target selection methods
    selectTargets(ability, caster, targetPoint, allEntities) {
        const selector = this.getTargetSelector(ability);
        return selector.selectTargets(caster, targetPoint, allEntities);
    }

    getTargetSelector(ability) {
        if (this.targetSelectors.has(ability.name)) {
            return this.targetSelectors.get(ability.name);
        }

        // Create default selector based on ability targeting
        let selector;
        switch (ability.targeting) {
            case TARGET_TYPES.SINGLE:
                selector = new TargetSelector(TARGET_TYPES.SINGLE, {
                    range: ability.range || 100
                });
                break;
            case TARGET_TYPES.AREA:
                selector = new TargetSelector(TARGET_TYPES.AREA, {
                    radius: ability.areaRadius || 50,
                    maxTargets: ability.maxTargets || 10
                });
                break;
            case TARGET_TYPES.SELF:
                selector = new TargetSelector(TARGET_TYPES.SELF);
                break;
            default:
                selector = new TargetSelector(TARGET_TYPES.SINGLE);
        }

        this.targetSelectors.set(ability.name, selector);
        return selector;
    }

    // Area effect management
    createAreaEffect(center, shape, parameters, effectFunction, duration = 0) {
        const effect = new AreaEffect(center, shape, parameters, effectFunction, duration);
        this.areaEffects.add(effect);
        return effect;
    }

    updateAreaEffects(deltaTime, allEntities) {
        this.areaEffects.forEach(effect => {
            effect.update(deltaTime, allEntities);
        });

        // Remove inactive effects
        this.areaEffects.forEach(effect => {
            if (!effect.active) {
                this.areaEffects.delete(effect);
            }
        });
    }

    // Chain targeting
    getChainTargets(initialTarget, allEntities, caster, maxChains = 3) {
        this.chainTargeting.maxChains = maxChains;
        return this.chainTargeting.getChainTargets(initialTarget, allEntities, caster);
    }

    // Advanced targeting utilities
    getTargetsInCone(caster, angle, range, allEntities) {
        return AreaShape.getConeTargets(
            { x: caster.position.x, y: caster.position.y, facing: caster.facing || 0 },
            angle,
            range,
            allEntities
        );
    }

    getTargetsInLine(caster, direction, length, width, allEntities) {
        return AreaShape.getLineTargets(
            caster.position,
            direction,
            length,
            width,
            allEntities
        );
    }

    getTargetsInRectangle(center, width, height, allEntities) {
        return AreaShape.getRectangleTargets(center, width, height, allEntities);
    }

    // Validation methods
    validateTarget(ability, caster, target) {
        switch (ability.targeting) {
            case TARGET_TYPES.SELF:
                return target === caster;
            case TARGET_TYPES.SINGLE:
                return target !== caster &&
                       this.getDistance(caster.position, target.position) <= (ability.range || 100);
            case TARGET_TYPES.AREA:
                return true; // Area abilities don't require specific target validation
            default:
                return false;
        }
    }

    isInRange(caster, target, range) {
        return this.getDistance(caster.position, target.position) <= range;
    }

    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Cleanup
    clearAreaEffects() {
        this.areaEffects.clear();
    }

    getAreaEffectCount() {
        return this.areaEffects.size;
    }
}

export {
    TargetSelector,
    AreaShape,
    AreaEffect,
    ChainTargeting,
    AdvancedTargetingSystem,
    TARGET_TYPES
};