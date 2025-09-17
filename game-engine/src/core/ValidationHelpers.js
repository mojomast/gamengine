/**
 * Validation Helper Functions
 * Provides reusable validation utilities for all core systems
 */

export class ValidationError extends Error {
    constructor(message, paramName) {
        super(message);
        this.name = 'ValidationError';
        this.paramName = paramName;
    }
}

export const ValidationHelpers = {
    /**
     * Validates parameter type
     * @param {*} value - Value to validate
     * @param {string} expectedType - Expected type ('string', 'number', 'object', etc.)
     * @param {string} paramName - Parameter name for error messages
     * @param {*} defaultValue - Default value if undefined
     * @throws {ValidationError} If validation fails
     */
    validateType(value, expectedType, paramName, defaultValue = undefined) {
        if (value === undefined && defaultValue !== undefined) {
            return defaultValue;
        }
        
        const actualType = typeof value;
        if (actualType !== expectedType) {
            throw new ValidationError(
                `Parameter '${paramName}' must be of type '${expectedType}', received '${actualType}'`,
                paramName
            );
        }
        return value;
    },

    /**
     * Validates numeric range
     * @param {number} value - Value to validate
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (inclusive)
     * @param {string} paramName - Parameter name for error messages
     * @throws {ValidationError} If validation fails
     */
    validateRange(value, min, max, paramName) {
        if (!Number.isFinite(value)) {
            throw new ValidationError(
                `Parameter '${paramName}' must be a finite number, received '${value}'`,
                paramName
            );
        }
        
        if (value < min || value > max) {
            throw new ValidationError(
                `Parameter '${paramName}' must be between ${min} and ${max}, received ${value}`,
                paramName
            );
        }
        return value;
    },

    /**
     * Validates string format with regex
     * @param {string} value - String to validate
     * @param {RegExp} pattern - Regex pattern
     * @param {string} paramName - Parameter name for error messages
     * @param {string} description - Description of expected format
     * @throws {ValidationError} If validation fails
     */
    validateStringFormat(value, pattern, paramName, description = 'valid format') {
        if (typeof value !== 'string') {
            throw new ValidationError(
                `Parameter '${paramName}' must be a string, received '${typeof value}'`,
                paramName
            );
        }
        
        if (!pattern.test(value)) {
            throw new ValidationError(
                `Parameter '${paramName}' must match ${description}, received '${value}'`,
                paramName
            );
        }
        return value;
    },

    /**
     * Validates object has required keys
     * @param {*} value - Value to validate
     * @param {Array<string>} requiredKeys - Required property keys
     * @param {string} paramName - Parameter name for error messages
     * @param {boolean} allowNull - Whether null/undefined is allowed
     * @throws {ValidationError} If validation fails
     */
    validateObject(value, requiredKeys, paramName, allowNull = false) {
        if (value == null) {
            if (!allowNull) {
                throw new ValidationError(
                    `Parameter '${paramName}' cannot be null or undefined`,
                    paramName
                );
            }
            return value;
        }
        
        if (typeof value !== 'object') {
            throw new ValidationError(
                `Parameter '${paramName}' must be an object, received '${typeof value}'`,
                paramName
            );
        }
        
        for (const key of requiredKeys) {
            if (!(key in value)) {
                throw new ValidationError(
                    `Parameter '${paramName}' missing required property '${key}'`,
                    paramName
                );
            }
        }
        return value;
    },

    /**
     * Validates array properties
     * @param {*} value - Value to validate
     * @param {number} minLength - Minimum array length
     * @param {number} maxLength - Maximum array length
     * @param {string} paramName - Parameter name for error messages
     * @throws {ValidationError} If validation fails
     */
    validateArray(value, minLength = 0, maxLength = Infinity, paramName) {
        if (!Array.isArray(value)) {
            throw new ValidationError(
                `Parameter '${paramName}' must be an array, received '${typeof value}'`,
                paramName
            );
        }
        
        if (value.length < minLength) {
            throw new ValidationError(
                `Parameter '${paramName}' must have at least ${minLength} elements, received ${value.length}`,
                paramName
            );
        }
        
        if (value.length > maxLength) {
            throw new ValidationError(
                `Parameter '${paramName}' cannot have more than ${maxLength} elements, received ${value.length}`,
                paramName
            );
        }
        return value;
    },

    /**
     * Validates DOM element exists
     * @param {string} elementId - Element ID to validate
     * @throws {ValidationError} If element not found
     */
    validateDOMElement(elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new ValidationError(
                `DOM element with ID '${elementId}' not found`,
                'elementId'
            );
        }
        return element;
    },

    /**
     * Validates function is callable
     * @param {*} value - Value to validate
     * @param {string} paramName - Parameter name for error messages
     * @throws {ValidationError} If validation fails
     */
    validateFunction(value, paramName) {
        if (typeof value !== 'function') {
            throw new ValidationError(
                `Parameter '${paramName}' must be a function, received '${typeof value}'`,
                paramName
            );
        }
        return value;
    },

    /**
     * Validates boolean value
     * @param {*} value - Value to validate
     * @param {string} paramName - Parameter name for error messages
     * @param {boolean} defaultValue - Default value if undefined
     * @throws {ValidationError} If validation fails
     */
    validateBoolean(value, paramName, defaultValue = undefined) {
        if (value === undefined && defaultValue !== undefined) {
            return defaultValue;
        }
        
        if (typeof value !== 'boolean') {
            throw new ValidationError(
                `Parameter '${paramName}' must be a boolean, received '${typeof value}'`,
                paramName
            );
        }
        return value;
    },

    /**
     * Validates positive number
     * @param {number} value - Value to validate
     * @param {string} paramName - Parameter name for error messages
     * @throws {ValidationError} If validation fails
     */
    validatePositiveNumber(value, paramName) {
        this.validateType(value, 'number', paramName);
        if (value <= 0) {
            throw new ValidationError(
                `Parameter '${paramName}' must be positive, received ${value}`,
                paramName
            );
        }
        return value;
    },

    /**
     * Validates scene object structure
     * @param {*} scene - Scene object to validate
     * @throws {ValidationError} If validation fails
     */
    validateScene(scene) {
        this.validateObject(scene, ['update', 'render'], 'scene');
        this.validateFunction(scene.update, 'scene.update');
        this.validateFunction(scene.render, 'scene.render');
        return scene;
    },

    /**
     * Validates character stats
     * @param {*} stats - Stats object to validate
     * @throws {ValidationError} If validation fails
     */
    validateCharacterStats(stats) {
        this.validateObject(stats, ['health', 'maxHealth', 'level'], 'stats');
        
        // Validate ranges
        this.validateRange(stats.health, 0, stats.maxHealth, 'stats.health');
        this.validatePositiveNumber(stats.maxHealth, 'stats.maxHealth');
        this.validatePositiveNumber(stats.level, 'stats.level');
        
        return stats;
    },

    /**
     * Validates ability definition
     * @param {*} ability - Ability object to validate
     * @throws {ValidationError} If validation fails
     */
    validateAbility(ability) {
        this.validateObject(ability, ['name', 'cost', 'cooldown'], 'ability');
        this.validateType(ability.name, 'string', 'ability.name');
        this.validatePositiveNumber(ability.cost, 'ability.cost');
        this.validateRange(ability.cooldown, 0, 300, 'ability.cooldown'); // Max 5 minutes
        return ability;
    },

    /**
     * Validates item definition
     * @param {*} item - Item object to validate
     * @throws {ValidationError} If validation fails
     */
    validateItem(item) {
        this.validateObject(item, ['id', 'name', 'type'], 'item');
        this.validateType(item.id, 'string', 'item.id');
        this.validateType(item.name, 'string', 'item.name');
        this.validateType(item.type, 'string', 'item.type');
        
        if (item.weight !== undefined) {
            this.validateRange(item.weight, 0, 1000, 'item.weight'); // Max 1000 units
        }
        
        return item;
    },

    /**
     * Validates UI component
     * @param {*} component - Component object to validate
     * @throws {ValidationError} If validation fails
     */
    validateUIComponent(component) {
        this.validateObject(component, ['type', 'id'], 'component');
        this.validateType(component.type, 'string', 'component.type');
        this.validateType(component.id, 'string', 'component.id');
        return component;
    }
};