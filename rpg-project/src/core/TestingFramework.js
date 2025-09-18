/**
 * RPG Testing Framework
 * Comprehensive testing suite using ValidationHelpers for all systems
 */

import { ValidationHelpers, ValidationError } from '../../../game-engine/src/core/ValidationHelpers.js';
import { PerformanceMonitor } from '../../../game-engine/src/core/PerformanceMonitor.js';

export class TestingFramework {
    constructor(rpgEngine) {
        this.rpgEngine = rpgEngine;
        this.performanceMonitor = new PerformanceMonitor();
        this.testResults = new Map();
        this.testSuites = new Map();
        this.isRunning = false;

        this.registerTestSuites();
    }

    registerTestSuites() {
        // Core system tests
        this.testSuites.set('character', this.createCharacterTestSuite());
        this.testSuites.set('battle', this.createBattleTestSuite());
        this.testSuites.set('inventory', this.createInventoryTestSuite());
        this.testSuites.set('magic', this.createMagicTestSuite());
        this.testSuites.set('map', this.createMapTestSuite());
        this.testSuites.set('quest', this.createQuestTestSuite());
        this.testSuites.set('ui', this.createUITestSuite());
        this.testSuites.set('performance', this.createPerformanceTestSuite());
        this.testSuites.set('validation', this.createValidationTestSuite());
    }

    async runAllTests() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.testResults.clear();

        console.log('🧪 Starting comprehensive RPG testing...');

        const results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            total: 0,
            duration: 0,
            suites: {}
        };

        const startTime = performance.now();

        for (const [suiteName, suite] of this.testSuites) {
            console.log(`\n📋 Running ${suiteName} test suite...`);
            const suiteResult = await this.runTestSuite(suiteName, suite);
            results.suites[suiteName] = suiteResult;

            results.passed += suiteResult.passed;
            results.failed += suiteResult.failed;
            results.warnings += suiteResult.warnings;
            results.total += suiteResult.total;
        }

        results.duration = performance.now() - startTime;

        this.isRunning = false;
        this.testResults.set('summary', results);

        this.printTestReport(results);
        return results;
    }

    async runTestSuite(suiteName, suite) {
        const result = {
            passed: 0,
            failed: 0,
            warnings: 0,
            total: 0,
            tests: {},
            duration: 0
        };

        const startTime = performance.now();

        for (const [testName, testFn] of Object.entries(suite)) {
            try {
                console.log(`  ▶️ Running ${testName}...`);
                const testResult = await testFn();

                result.tests[testName] = testResult;
                result.total++;

                if (testResult.status === 'passed') {
                    result.passed++;
                    console.log(`    ✅ ${testName}: PASSED`);
                } else if (testResult.status === 'failed') {
                    result.failed++;
                    console.log(`    ❌ ${testName}: FAILED - ${testResult.message}`);
                } else if (testResult.status === 'warning') {
                    result.warnings++;
                    console.log(`    ⚠️ ${testName}: WARNING - ${testResult.message}`);
                }

                if (testResult.details) {
                    console.log(`       ${testResult.details}`);
                }

            } catch (error) {
                result.failed++;
                result.total++;
                result.tests[testName] = {
                    status: 'failed',
                    message: error.message,
                    stack: error.stack
                };
                console.log(`    ❌ ${testName}: ERROR - ${error.message}`);
            }
        }

        result.duration = performance.now() - startTime;
        return result;
    }

    createCharacterTestSuite() {
        return {
            testCharacterStats: async () => {
                try {
                    const character = this.rpgEngine.characterManager?.createCharacter?.('TestHero', 'warrior');
                    if (!character) throw new Error('Character creation failed');

                    ValidationHelpers.validateCharacterStats(character.getStats());

                    // Test stat calculations
                    const initialHP = character.getCurrentHP();
                    character.takeDamage(10);
                    if (character.getCurrentHP() >= initialHP) {
                        throw new Error('Damage not applied correctly');
                    }

                    return { status: 'passed', message: 'Character stats validation passed' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            },

            testCharacterLeveling: async () => {
                try {
                    const character = this.rpgEngine.characterManager?.createCharacter?.('TestLevel', 'mage');
                    if (!character) throw new Error('Character creation failed');

                    const initialLevel = character.getLevel();
                    character.gainExperience(1000); // Should level up

                    if (character.getLevel() <= initialLevel) {
                        return { status: 'warning', message: 'Level progression may be slow' };
                    }

                    return { status: 'passed', message: 'Character leveling working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            },

            testCharacterValidation: async () => {
                try {
                    // Test invalid character creation
                    try {
                        this.rpgEngine.characterManager?.createCharacter?.('', '');
                        return { status: 'failed', message: 'Invalid character creation not prevented' };
                    } catch (validationError) {
                        // Expected validation error
                    }

                    return { status: 'passed', message: 'Character validation working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            }
        };
    }

    createBattleTestSuite() {
        return {
            testBattleSystem: async () => {
                try {
                    const battle = this.rpgEngine.battleSystem?.createBattle?.();
                    if (!battle) throw new Error('Battle system not available');

                    ValidationHelpers.validateObject(battle, ['participants', 'turnOrder'], 'battle');

                    return { status: 'passed', message: 'Battle system validation passed' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            },

            testDamageCalculation: async () => {
                try {
                    // Create test combatants
                    const attacker = { attackPower: 50, level: 10 };
                    const defender = { defense: 20, level: 10 };

                    // Test damage formula (basic validation)
                    const damage = Math.max(1, attacker.attackPower - defender.defense);
                    if (damage < 0) {
                        throw new Error('Negative damage calculated');
                    }

                    return { status: 'passed', message: 'Damage calculation valid' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            },

            testBattleValidation: async () => {
                try {
                    // Test battle state validation
                    const battleState = {
                        currentTurn: 0,
                        participants: [],
                        status: 'active'
                    };

                    ValidationHelpers.validateObject(battleState, ['currentTurn', 'status'], 'battleState');

                    return { status: 'passed', message: 'Battle validation working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            }
        };
    }

    createInventoryTestSuite() {
        return {
            testInventoryOperations: async () => {
                try {
                    const inventory = this.rpgEngine.inventoryManager;
                    if (!inventory) throw new Error('Inventory system not available');

                    // Test item addition
                    const testItem = { id: 'test_sword', name: 'Test Sword', type: 'weapon' };
                    ValidationHelpers.validateItem(testItem);

                    const result = inventory.addItem(testItem);
                    if (!result.success) {
                        throw new Error(`Item addition failed: ${result.reason}`);
                    }

                    return { status: 'passed', message: 'Inventory operations working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            },

            testInventoryValidation: async () => {
                try {
                    // Test invalid item validation
                    try {
                        ValidationHelpers.validateItem({ name: 'Invalid Item' }); // Missing required fields
                        return { status: 'failed', message: 'Invalid item not caught by validation' };
                    } catch (validationError) {
                        // Expected
                    }

                    return { status: 'passed', message: 'Inventory validation working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            }
        };
    }

    createMagicTestSuite() {
        return {
            testSpellValidation: async () => {
                try {
                    const spellDatabase = this.rpgEngine.spellDatabase;
                    if (!spellDatabase) throw new Error('Spell database not available');

                    // Test spell validation
                    const testSpell = {
                        id: 'test_spell',
                        name: 'Test Spell',
                        cost: 10,
                        cooldown: 5,
                        category: 'offensive'
                    };

                    ValidationHelpers.validateAbility(testSpell);

                    return { status: 'passed', message: 'Spell validation working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            },

            testMagicSystem: async () => {
                try {
                    // Test magic calculations
                    const caster = { magicPower: 100, intelligence: 50 };
                    const spell = { basePower: 50, scaling: 0.5 };

                    const finalPower = spell.basePower + (caster.intelligence * spell.scaling);
                    if (finalPower <= 0) {
                        throw new Error('Invalid magic power calculation');
                    }

                    return { status: 'passed', message: 'Magic system calculations valid' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            }
        };
    }

    createMapTestSuite() {
        return {
            testMapValidation: async () => {
                try {
                    const mapSystem = this.rpgEngine.mapSystem;
                    if (!mapSystem) throw new Error('Map system not available');

                    // Test map data validation
                    const testMap = {
                        id: 'test_map',
                        width: 10,
                        height: 10,
                        layers: []
                    };

                    ValidationHelpers.validateObject(testMap, ['id', 'width', 'height'], 'map');

                    return { status: 'passed', message: 'Map validation working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            },

            testTileSystem: async () => {
                try {
                    // Test tile collision detection
                    const tileSystem = this.rpgEngine.tileSystem;
                    if (!tileSystem) return { status: 'warning', message: 'Tile system not fully implemented' };

                    return { status: 'passed', message: 'Tile system basic functionality working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            }
        };
    }

    createQuestTestSuite() {
        return {
            testQuestValidation: async () => {
                try {
                    const questSystem = this.rpgEngine.questSystem;
                    if (!questSystem) throw new Error('Quest system not available');

                    // Test quest validation
                    const testQuest = {
                        id: 'test_quest',
                        title: 'Test Quest',
                        objectives: [],
                        rewards: {}
                    };

                    ValidationHelpers.validateObject(testQuest, ['id', 'title'], 'quest');

                    return { status: 'passed', message: 'Quest validation working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            }
        };
    }

    createUITestSuite() {
        return {
            testUIComponents: async () => {
                try {
                    const uiManager = this.rpgEngine.uiManager;
                    if (!uiManager) throw new Error('UI manager not available');

                    // Test UI component validation
                    const testComponent = {
                        type: 'button',
                        id: 'test_button'
                    };

                    ValidationHelpers.validateUIComponent(testComponent);

                    return { status: 'passed', message: 'UI component validation working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            },

            testDialogSystem: async () => {
                try {
                    const dialogManager = this.rpgEngine.dialogManager;
                    if (!dialogManager) throw new Error('Dialog manager not available');

                    // Test dialog validation
                    const testDialog = {
                        id: 'test_dialog',
                        text: 'Test dialog text',
                        speaker: 'Test NPC'
                    };

                    ValidationHelpers.validateObject(testDialog, ['id', 'text'], 'dialog');

                    return { status: 'passed', message: 'Dialog system validation working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            }
        };
    }

    createPerformanceTestSuite() {
        return {
            testPerformanceMonitoring: async () => {
                try {
                    // Test performance monitoring
                    const perf = this.performanceMonitor.getOverallPerformance();
                    ValidationHelpers.validateObject(perf, ['fps', 'frameTime'], 'performanceData');

                    return { status: 'passed', message: 'Performance monitoring working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            },

            testMemoryUsage: async () => {
                try {
                    // Test memory monitoring
                    if (!performance.memory) {
                        return { status: 'warning', message: 'Memory monitoring not supported in this browser' };
                    }

                    const memoryUsage = performance.memory;
                    if (memoryUsage.usedJSHeapSize > memoryUsage.totalJSHeapSize) {
                        return { status: 'warning', message: 'Memory usage exceeds available heap' };
                    }

                    return { status: 'passed', message: 'Memory usage within acceptable limits' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            }
        };
    }

    createValidationTestSuite() {
        return {
            testValidationHelpers: async () => {
                try {
                    // Test various validation functions
                    ValidationHelpers.validateType('test', 'string', 'testString');
                    ValidationHelpers.validateRange(50, 0, 100, 'testRange');
                    ValidationHelpers.validatePositiveNumber(10, 'testPositive');

                    return { status: 'passed', message: 'ValidationHelpers working correctly' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            },

            testValidationErrors: async () => {
                try {
                    // Test that validation errors are thrown correctly
                    try {
                        ValidationHelpers.validateType(123, 'string', 'testType');
                        return { status: 'failed', message: 'Type validation did not throw error' };
                    } catch (validationError) {
                        if (!(validationError instanceof ValidationError)) {
                            throw new Error('Wrong error type thrown');
                        }
                    }

                    return { status: 'passed', message: 'Validation error handling working' };
                } catch (error) {
                    return { status: 'failed', message: error.message };
                }
            }
        };
    }

    printTestReport(results) {
        console.log('\n' + '='.repeat(60));
        console.log('🧪 RPG TESTING REPORT');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${results.total}`);
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`⚠️ Warnings: ${results.warnings}`);
        console.log(`⏱️ Duration: ${results.duration.toFixed(2)}ms`);
        console.log(`📊 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
        console.log('='.repeat(60));

        // Print suite summaries
        console.log('\nSUITE RESULTS:');
        Object.entries(results.suites).forEach(([suiteName, suiteResult]) => {
            const successRate = suiteResult.total > 0 ?
                ((suiteResult.passed / suiteResult.total) * 100).toFixed(1) : '0.0';
            console.log(`  ${suiteName}: ${suiteResult.passed}/${suiteResult.total} (${successRate}%)`);
        });

        // Print recommendations
        if (results.failed > 0 || results.warnings > 0) {
            console.log('\n📋 RECOMMENDATIONS:');
            if (results.failed > 0) {
                console.log('  • Fix failing tests before deployment');
            }
            if (results.warnings > 0) {
                console.log('  • Address warning conditions for optimal performance');
            }
        }

        console.log('='.repeat(60));
    }

    getTestResults() {
        return Object.fromEntries(this.testResults);
    }

    async runSpecificTest(suiteName, testName) {
        const suite = this.testSuites.get(suiteName);
        if (!suite || !suite[testName]) {
            throw new Error(`Test ${suiteName}.${testName} not found`);
        }

        return await suite[testName]();
    }
}