// Balance Data - Game balance validation and difficulty curves
// Uses ValidationHelpers to ensure balanced gameplay and scaling

import { ValidationHelpers } from '../../game-engine/src/core/ValidationHelpers.js';

export const BalanceConstants = {
    // Character stat ranges
    characterStats: {
        health: { min: 50, max: 5000, scaling: 1.15 },
        mana: { min: 30, max: 3000, scaling: 1.12 },
        strength: { min: 5, max: 100, scaling: 1.08 },
        dexterity: { min: 5, max: 100, scaling: 1.08 },
        constitution: { min: 5, max: 100, scaling: 1.08 },
        intelligence: { min: 5, max: 100, scaling: 1.08 },
        wisdom: { min: 5, max: 100, scaling: 1.08 },
        charisma: { min: 5, max: 100, scaling: 1.08 },
        luck: { min: 1, max: 50, scaling: 1.05 }
    },

    // Damage scaling
    damageScaling: {
        physical: { base: 10, perLevel: 2.5, variance: 0.1 },
        magical: { base: 8, perLevel: 3.0, variance: 0.15 },
        elemental: { base: 12, perLevel: 2.8, variance: 0.12 }
    },

    // Difficulty multipliers
    difficultyMultipliers: {
        easy: {
            enemyStats: 0.8,
            enemyHealth: 0.9,
            enemyDamage: 0.85,
            experience: 0.9,
            loot: 0.95
        },
        normal: {
            enemyStats: 1.0,
            enemyHealth: 1.0,
            enemyDamage: 1.0,
            experience: 1.0,
            loot: 1.0
        },
        hard: {
            enemyStats: 1.25,
            enemyHealth: 1.3,
            enemyDamage: 1.2,
            experience: 1.2,
            loot: 1.1
        },
        expert: {
            enemyStats: 1.5,
            enemyHealth: 1.6,
            enemyDamage: 1.4,
            experience: 1.4,
            loot: 1.2
        }
    },

    // Level scaling
    levelScaling: {
        healthPerLevel: 15,
        manaPerLevel: 8,
        statPointsPerLevel: 3,
        experienceBase: 100,
        experienceMultiplier: 1.2
    }
};

export class BalanceValidator {
    constructor() {
        this.warnings = [];
        this.errors = [];
    }

    /**
     * Validates character stats against balance constants
     */
    validateCharacterStats(character, level) {
        this.warnings = [];
        this.errors = [];

        try {
            // Validate base stats
            this.validateStatRange(character.stats.health, 'health', level);
            this.validateStatRange(character.stats.mana, 'mana', level);
            this.validateStatRange(character.stats.strength, 'strength', level);
            this.validateStatRange(character.stats.dexterity, 'dexterity', level);
            this.validateStatRange(character.stats.constitution, 'constitution', level);
            this.validateStatRange(character.stats.intelligence, 'intelligence', level);
            this.validateStatRange(character.stats.wisdom, 'wisdom', level);
            this.validateStatRange(character.stats.charisma, 'charisma', level);
            this.validateStatRange(character.stats.luck, 'luck', level);

            // Validate stat balance
            this.validateStatBalance(character.stats);

            // Validate level-appropriate power
            this.validateLevelAppropriatePower(character, level);

        } catch (error) {
            this.errors.push(`Validation error: ${error.message}`);
        }

        return {
            valid: this.errors.length === 0,
            warnings: this.warnings,
            errors: this.errors
        };
    }

    /**
     * Validates enemy stats against balance constants
     */
    validateEnemyStats(enemy, difficulty = 'normal') {
        this.warnings = [];
        this.errors = [];

        try {
            const multiplier = BalanceConstants.difficultyMultipliers[difficulty];

            // Apply difficulty scaling
            const scaledHealth = enemy.health * multiplier.enemyHealth;
            const scaledAttack = enemy.attack * multiplier.enemyDamage;

            // Validate scaled stats
            this.validateEnemyHealth(scaledHealth, enemy.level);
            this.validateEnemyAttack(scaledAttack, enemy.level);

            // Validate loot balance
            this.validateEnemyLoot(enemy, difficulty);

        } catch (error) {
            this.errors.push(`Enemy validation error: ${error.message}`);
        }

        return {
            valid: this.errors.length === 0,
            warnings: this.warnings,
            errors: this.errors
        };
    }

    /**
     * Validates item stats and balance
     */
    validateItemStats(item, itemLevel) {
        this.warnings = [];
        this.errors = [];

        try {
            // Validate item level vs stats
            if (item.damage) {
                this.validateWeaponDamage(item.damage, itemLevel, item.rarity);
            }

            if (item.defense) {
                this.validateArmorDefense(item.defense, itemLevel, item.rarity);
            }

            if (item.statBonuses) {
                this.validateStatBonuses(item.statBonuses, itemLevel, item.rarity);
            }

            // Validate item value
            this.validateItemValue(item, itemLevel);

        } catch (error) {
            this.errors.push(`Item validation error: ${error.message}`);
        }

        return {
            valid: this.errors.length === 0,
            warnings: this.warnings,
            errors: this.errors
        };
    }

    /**
     * Validates quest rewards and difficulty
     */
    validateQuestBalance(quest) {
        this.warnings = [];
        this.errors = [];

        try {
            // Validate objective difficulty vs rewards
            const objectiveDifficulty = this.calculateObjectiveDifficulty(quest.objectives);
            const rewardValue = this.calculateRewardValue(quest.rewards);

            if (objectiveDifficulty > rewardValue * 1.5) {
                this.warnings.push('Quest may be too difficult for the rewards offered');
            } else if (rewardValue > objectiveDifficulty * 2) {
                this.warnings.push('Quest rewards may be too generous for the difficulty');
            }

            // Validate experience rewards
            this.validateExperienceRewards(quest.rewards, quest.level);

        } catch (error) {
            this.errors.push(`Quest validation error: ${error.message}`);
        }

        return {
            valid: this.errors.length === 0,
            warnings: this.warnings,
            errors: this.errors
        };
    }

    // Private validation methods
    validateStatRange(statValue, statName, level) {
        const statConfig = BalanceConstants.characterStats[statName];
        const expectedMin = this.calculateExpectedStat(statConfig.min, level, statConfig.scaling);
        const expectedMax = this.calculateExpectedStat(statConfig.max, level, statConfig.scaling);

        ValidationHelpers.validateRange(statValue, expectedMin * 0.5, expectedMax * 1.5, `${statName} at level ${level}`);

        if (statValue < expectedMin * 0.8) {
            this.warnings.push(`${statName} is significantly below expected value for level ${level}`);
        } else if (statValue > expectedMax * 1.2) {
            this.warnings.push(`${statName} is significantly above expected value for level ${level}`);
        }
    }

    validateStatBalance(stats) {
        const totalStats = stats.strength + stats.dexterity + stats.constitution +
                          stats.intelligence + stats.wisdom + stats.charisma;

        // Check for over-specialization
        const highestStat = Math.max(stats.strength, stats.dexterity, stats.constitution,
                                     stats.intelligence, stats.wisdom, stats.charisma);
        const averageStat = totalStats / 6;

        if (highestStat > averageStat * 1.8) {
            this.warnings.push('Character appears over-specialized in one stat');
        }

        // Check for well-rounded characters
        if (highestStat < averageStat * 1.3) {
            this.warnings.push('Character stats are very well-balanced');
        }
    }

    validateLevelAppropriatePower(character, level) {
        const totalPower = this.calculateCharacterPower(character);
        const expectedPower = this.calculateExpectedPower(level);

        if (totalPower > expectedPower * 1.5) {
            this.warnings.push(`Character power level significantly exceeds expectations for level ${level}`);
        } else if (totalPower < expectedPower * 0.7) {
            this.warnings.push(`Character power level is below expectations for level ${level}`);
        }
    }

    validateEnemyHealth(health, level) {
        const expectedHealth = 50 + (level - 1) * 25;
        ValidationHelpers.validateRange(health, expectedHealth * 0.6, expectedHealth * 1.8, `enemy health at level ${level}`);
    }

    validateEnemyAttack(attack, level) {
        const expectedAttack = 8 + (level - 1) * 3;
        ValidationHelpers.validateRange(attack, expectedAttack * 0.7, expectedAttack * 1.6, `enemy attack at level ${level}`);
    }

    validateEnemyLoot(enemy, difficulty) {
        const multiplier = BalanceConstants.difficultyMultipliers[difficulty];
        const expectedGold = enemy.level * 10 * multiplier.loot;

        if (enemy.gold < expectedGold * 0.5) {
            this.warnings.push('Enemy drops unusually low gold for its level');
        } else if (enemy.gold > expectedGold * 2) {
            this.warnings.push('Enemy drops unusually high gold for its level');
        }
    }

    validateWeaponDamage(damage, itemLevel, rarity) {
        const rarityMultiplier = this.getRarityMultiplier(rarity);
        const expectedDamage = BalanceConstants.damageScaling.physical.base +
                              (itemLevel - 1) * BalanceConstants.damageScaling.physical.perLevel;

        const minDamage = expectedDamage * 0.8 * rarityMultiplier;
        const maxDamage = expectedDamage * 1.5 * rarityMultiplier;

        ValidationHelpers.validateRange(damage, minDamage, maxDamage, `weapon damage at level ${itemLevel}`);
    }

    validateArmorDefense(defense, itemLevel, rarity) {
        const rarityMultiplier = this.getRarityMultiplier(rarity);
        const expectedDefense = 5 + (itemLevel - 1) * 2;

        const minDefense = expectedDefense * 0.8 * rarityMultiplier;
        const maxDefense = expectedDefense * 1.5 * rarityMultiplier;

        ValidationHelpers.validateRange(defense, minDefense, maxDefense, `armor defense at level ${itemLevel}`);
    }

    validateStatBonuses(statBonuses, itemLevel, rarity) {
        const rarityMultiplier = this.getRarityMultiplier(rarity);
        const totalBonus = Object.values(statBonuses).reduce((sum, bonus) => sum + bonus, 0);

        const expectedBonus = itemLevel * 0.5 * rarityMultiplier;
        const maxBonus = expectedBonus * 2;

        if (totalBonus > maxBonus) {
            this.warnings.push('Item stat bonuses may be too high for its level and rarity');
        }
    }

    validateItemValue(item, itemLevel) {
        const rarityMultiplier = this.getRarityMultiplier(item.rarity);
        const expectedValue = itemLevel * 25 * rarityMultiplier;

        if (item.value < expectedValue * 0.5) {
            this.warnings.push('Item value is significantly below expected for its level and rarity');
        } else if (item.value > expectedValue * 2) {
            this.warnings.push('Item value is significantly above expected for its level and rarity');
        }
    }

    // Utility methods
    calculateExpectedStat(baseValue, level, scaling) {
        return Math.floor(baseValue * Math.pow(scaling, level - 1));
    }

    calculateCharacterPower(character) {
        const stats = character.stats;
        return (stats.health / 10) +
               (stats.mana / 5) +
               stats.strength +
               stats.dexterity +
               stats.constitution +
               stats.intelligence +
               stats.wisdom +
               stats.charisma;
    }

    calculateExpectedPower(level) {
        return level * 50 + 200;
    }

    getRarityMultiplier(rarity) {
        const multipliers = {
            common: 1.0,
            uncommon: 1.2,
            rare: 1.5,
            epic: 2.0,
            legendary: 3.0
        };
        return multipliers[rarity] || 1.0;
    }

    calculateObjectiveDifficulty(objectives) {
        let totalDifficulty = 0;
        objectives.forEach(obj => {
            switch (obj.type) {
                case 'kill': totalDifficulty += obj.required * 2; break;
                case 'collect': totalDifficulty += obj.required * 1.5; break;
                case 'explore': totalDifficulty += obj.required * 3; break;
                case 'talk': totalDifficulty += obj.required * 1; break;
                case 'custom': totalDifficulty += obj.required * 4; break;
                default: totalDifficulty += obj.required * 2;
            }
        });
        return totalDifficulty;
    }

    calculateRewardValue(rewards) {
        let totalValue = 0;
        rewards.forEach(reward => {
            switch (reward.type) {
                case 'experience': totalValue += reward.amount / 10; break;
                case 'gold': totalValue += reward.amount / 5; break;
                case 'item': totalValue += 50; break; // Base item value
            }
        });
        return totalValue;
    }

    validateExperienceRewards(rewards, questLevel) {
        const expReward = rewards.find(r => r.type === 'experience');
        if (expReward) {
            const expectedExp = questLevel * 50;
            if (expReward.amount < expectedExp * 0.5) {
                this.warnings.push('Quest experience reward is low for the quest level');
            } else if (expReward.amount > expectedExp * 2) {
                this.warnings.push('Quest experience reward is high for the quest level');
            }
        }
    }
}

export const DifficultyCurves = {
    // Experience required for each level
    experienceTable: {
        1: 0,
        2: 100,
        3: 250,
        4: 450,
        5: 700,
        6: 1000,
        7: 1350,
        8: 1750,
        9: 2200,
        10: 2700,
        11: 3250,
        12: 3850,
        13: 4500,
        14: 5200,
        15: 5950,
        16: 6750,
        17: 7600,
        18: 8500,
        19: 9450,
        20: 10450
    },

    // Enemy scaling by level
    enemyScaling: {
        health: (level) => 50 + (level - 1) * 25,
        attack: (level) => 8 + (level - 1) * 3,
        defense: (level) => 3 + (level - 1) * 2,
        experience: (level) => level * 20,
        gold: (level) => level * 10
    },

    // Item power scaling
    itemScaling: {
        weaponDamage: (level, rarity) => {
            const baseDamage = 10 + (level - 1) * 2.5;
            const rarityMultiplier = BalanceValidator.prototype.getRarityMultiplier(rarity);
            return Math.floor(baseDamage * rarityMultiplier);
        },
        armorDefense: (level, rarity) => {
            const baseDefense = 5 + (level - 1) * 2;
            const rarityMultiplier = BalanceValidator.prototype.getRarityMultiplier(rarity);
            return Math.floor(baseDefense * rarityMultiplier);
        }
    }
};

export { BalanceValidator, DifficultyCurves };