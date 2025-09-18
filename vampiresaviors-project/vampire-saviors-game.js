
// Vampire Saviors - Fighting Game using mojomast/gamengine architecture
// Inspired by Darkstalkers/Vampire Savior mechanics

// Import the game engine (assuming it's available)
// import { GameEngine } from './game-engine/src/core/GameEngine.js';

// Game constants
const GAME_CONFIG = {
    canvas: {
        width: 1920,
        height: 1080,
        scale: 1
    },
    physics: {
        gravity: 0.8,
        jumpPower: -15,
        walkSpeed: 4,
        dashSpeed: 8,
        friction: 0.85
    },
    combat: {
        blockstun: 12,
        hitstun: 18,
        comboDecay: 0.85,
        meterGain: 10,
        darkForceTime: 300, // frames
        healthRegenRate: 0.1
    }
};

// Input mappings for both players
const INPUT_MAP = {
    player1: {
        left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS',
        lp: 'KeyU', mp: 'KeyI', hp: 'KeyO',
        lk: 'KeyJ', mk: 'KeyK', hk: 'KeyL'
    },
    player2: {
        left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown',
        lp: 'Numpad7', mp: 'Numpad8', hp: 'Numpad9',
        lk: 'Numpad4', mk: 'Numpad5', hk: 'Numpad6'
    }
};

// Character data for Vampire Saviors characters
const CHARACTERS = {
    morrigan: {
        name: "Morrigan Aensland",
        health: 1000,
        walkSpeed: 4.5,
        dashSpeed: 8,
        jumpHeight: -16,
        color: "#9900ff",
        moves: {
            fireball: { input: "236P", damage: 80, meter: 0 },
            uppercut: { input: "623P", damage: 120, meter: 0 },
            divekick: { input: "214K", damage: 100, meter: 0 },
            shellPierce: { input: "236236P", damage: 200, meter: 1 },
            soulFist: { input: "214214P", damage: 300, meter: 2 }
        },
        darkForce: "Creates shadow clone that mimics attacks"
    },
    demitri: {
        name: "Demitri Maximoff", 
        health: 1100,
        walkSpeed: 4,
        dashSpeed: 7.5,
        jumpHeight: -15,
        color: "#cc0000",
        moves: {
            fireball: { input: "236P", damage: 90, meter: 0 },
            uppercut: { input: "623P", damage: 130, meter: 0 },
            command_throw: { input: "214214K", damage: 180, meter: 1 },
            batSpin: { input: "236236P", damage: 220, meter: 1 },
            midnightBliss: { input: "632146P", damage: 400, meter: 3 }
        },
        darkForce: "Transforms into vampire lord with enhanced abilities"
    },
    felicia: {
        name: "Felicia",
        health: 950,
        walkSpeed: 5,
        dashSpeed: 9,
        jumpHeight: -17,
        color: "#ffaa00",
        moves: {
            rollingAttack: { input: "236P", damage: 85, meter: 0 },
            catSpike: { input: "623K", damage: 110, meter: 0 },
            sandSplash: { input: "214P", damage: 70, meter: 0 },
            deltaKick: { input: "214214K", damage: 190, meter: 1 },
            pleasureHelp: { input: "236236K", damage: 250, meter: 2 }
        },
        darkForce: "Calls helper cats for additional attacks"
    }
};

// Game state management
class VampireSaviorsGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.gameState = 'menu'; // menu, characterSelect, fighting, paused, gameOver

        // Game systems
        this.inputManager = new InputManager();
        this.audioManager = new AudioManager();
        this.effectsManager = new EffectsManager(this.ctx);

        // Fighter instances
        this.player1 = null;
        this.player2 = null;

        // Game timer and round management
        this.roundTimer = 99 * 60; // 99 seconds in frames
        this.roundNumber = 1;
        this.matchWins = { player1: 0, player2: 0 };

        // Camera and stage
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.stage = new Stage();

        this.init();
    }

    init() {
        this.setupCanvas();
        this.inputManager.init();
        this.gameLoop();
        console.log('Vampire Saviors initialized');
    }

    setupCanvas() {
        // Responsive canvas setup
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();

        const scale = Math.min(
            containerRect.width / GAME_CONFIG.canvas.width,
            containerRect.height / GAME_CONFIG.canvas.height
        );

        this.canvas.style.width = (GAME_CONFIG.canvas.width * scale) + 'px';
        this.canvas.style.height = (GAME_CONFIG.canvas.height * scale) + 'px';

        GAME_CONFIG.canvas.scale = scale;
    }

    startFight(player1Char = 'morrigan', player2Char = 'demitri') {
        this.player1 = new Fighter(CHARACTERS[player1Char], 1, 300, 800);
        this.player2 = new Fighter(CHARACTERS[player2Char], 2, 1620, 800);

        this.gameState = 'fighting';
        this.roundTimer = 99 * 60;

        document.getElementById('menuOverlay').style.display = 'none';
        this.updateHUD();
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (this.gameState !== 'fighting') return;

        // Update input
        this.inputManager.update();

        // Update fighters
        if (this.player1 && this.player2) {
            this.player1.update(this.inputManager, this.player2);
            this.player2.update(this.inputManager, this.player1);

            // Check for collision between fighters
            this.checkCombat();
        }

        // Update timer
        if (this.roundTimer > 0) {
            this.roundTimer--;
        } else {
            this.handleTimeUp();
        }

        // Update camera
        this.updateCamera();

        // Update effects
        this.effectsManager.update();

        // Update HUD
        this.updateHUD();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a0033';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context for camera
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);

        // Render stage
        this.stage.render(this.ctx);

        // Render fighters
        if (this.player1) this.player1.render(this.ctx);
        if (this.player2) this.player2.render(this.ctx);

        // Render effects
        this.effectsManager.render(this.ctx);

        // Restore context
        this.ctx.restore();

        // Render debug info if needed
        if (window.debugMode) {
            this.renderDebugInfo();
        }
    }

    checkCombat() {
        // Check if either player's hitboxes intersect with opponent's hurtboxes
        const p1Hitboxes = this.player1.getActiveHitboxes();
        const p2Hitboxes = this.player2.getActiveHitboxes();
        const p1Hurtboxes = this.player1.getHurtboxes();
        const p2Hurtboxes = this.player2.getHurtboxes();

        // Player 1 hitting Player 2
        for (let hitbox of p1Hitboxes) {
            for (let hurtbox of p2Hurtboxes) {
                if (this.boxesIntersect(hitbox, hurtbox)) {
                    this.resolveHit(this.player1, this.player2, hitbox);
                    break;
                }
            }
        }

        // Player 2 hitting Player 1  
        for (let hitbox of p2Hitboxes) {
            for (let hurtbox of p1Hurtboxes) {
                if (this.boxesIntersect(hitbox, hurtbox)) {
                    this.resolveHit(this.player2, this.player1, hitbox);
                    break;
                }
            }
        }
    }

    boxesIntersect(box1, box2) {
        return box1.x < box2.x + box2.width &&
               box1.x + box1.width > box2.x &&
               box1.y < box2.y + box2.height &&
               box1.y + box1.height > box2.y;
    }

    resolveHit(attacker, defender, hitbox) {
        if (defender.isBlocking()) {
            // Handle block
            const blockDamage = Math.floor(hitbox.damage * 0.1);
            defender.takeDamage(blockDamage, true);
            defender.enterBlockstun(hitbox.blockstun || 12);
            attacker.gainMeter(5);

            this.effectsManager.createBlockEffect(defender.x, defender.y - 100);
            this.audioManager.playSound('block');
        } else {
            // Handle hit
            defender.takeDamage(hitbox.damage, false);
            defender.enterHitstun(hitbox.hitstun || 18);
            attacker.gainMeter(hitbox.meterGain || 10);

            // Combo system
            if (attacker.comboCount > 0) {
                attacker.comboCount++;
                attacker.comboDamage += hitbox.damage;
            } else {
                attacker.startCombo();
            }

            this.effectsManager.createHitEffect(defender.x, defender.y - 100, hitbox.damage);
            this.audioManager.playSound('hit');

            // Screen shake on heavy hits
            if (hitbox.damage > 100) {
                this.effectsManager.screenShake(8, 300);
            }
        }

        // Deactivate the hitbox after it connects
        attacker.deactivateHitbox(hitbox);
    }

    updateCamera() {
        if (!this.player1 || !this.player2) return;

        // Center camera between players
        const centerX = (this.player1.x + this.player2.x) / 2;
        const centerY = (this.player1.y + this.player2.y) / 2;

        // Calculate zoom based on distance
        const distance = Math.abs(this.player1.x - this.player2.x);
        const targetZoom = Math.max(0.6, Math.min(1.0, 800 / distance));

        this.camera.x = centerX - this.canvas.width / 2;
        this.camera.y = centerY - this.canvas.height / 2;
        this.camera.zoom = this.camera.zoom + (targetZoom - this.camera.zoom) * 0.05;
    }

    updateHUD() {
        // Update health bars
        if (this.player1) {
            const healthPercent = (this.player1.health / this.player1.maxHealth) * 100;
            const damagePercent = (this.player1.whiteDamage / this.player1.maxHealth) * 100;
            document.getElementById('player1Damage').style.width = damagePercent + '%';

            const meterPercent = (this.player1.meter / this.player1.maxMeter) * 100;
            document.getElementById('player1Meter').style.width = meterPercent + '%';
        }

        if (this.player2) {
            const healthPercent = (this.player2.health / this.player2.maxHealth) * 100;
            const damagePercent = (this.player2.whiteDamage / this.player2.maxHealth) * 100;
            document.getElementById('player2Damage').style.width = damagePercent + '%';

            const meterPercent = (this.player2.meter / this.player2.maxMeter) * 100;
            document.getElementById('player2Meter').style.width = meterPercent + '%';
        }

        // Update timer
        const seconds = Math.ceil(this.roundTimer / 60);
        document.getElementById('roundTimer').textContent = seconds;

        // Update combo display
        const activePlayer = this.player1?.comboCount > 0 ? this.player1 : 
                           this.player2?.comboCount > 0 ? this.player2 : null;

        if (activePlayer && activePlayer.comboCount > 1) {
            const comboDisplay = document.getElementById('comboDisplay');
            comboDisplay.textContent = activePlayer.comboCount + ' HIT COMBO!';
            comboDisplay.style.opacity = '1';
        } else {
            document.getElementById('comboDisplay').style.opacity = '0';
        }
    }

    handleTimeUp() {
        // Determine winner based on health
        if (this.player1.health > this.player2.health) {
            this.handleRoundEnd(this.player1);
        } else if (this.player2.health > this.player1.health) {
            this.handleRoundEnd(this.player2);
        } else {
            // Draw - continue round or handle based on game rules
            this.roundTimer = 99 * 60;
        }
    }

    handleRoundEnd(winner) {
        console.log('Round ended, winner:', winner.character.name);
        // Handle round end logic, reset positions, etc.
    }

    renderDebugInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 300, 150);

        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('DEBUG INFO', 15, 30);
        this.ctx.fillText('Game State: ' + this.gameState, 15, 50);
        this.ctx.fillText('Round Timer: ' + Math.ceil(this.roundTimer / 60), 15, 70);

        if (this.player1) {
            this.ctx.fillText('P1 Health: ' + this.player1.health, 15, 90);
            this.ctx.fillText('P1 State: ' + this.player1.state, 15, 110);
        }

        if (this.player2) {
            this.ctx.fillText('P2 Health: ' + this.player2.health, 15, 130);
            this.ctx.fillText('P2 State: ' + this.player2.state, 15, 150);
        }
    }
}

// Fighter class representing a character in the fighting game
class Fighter {
    constructor(character, playerNumber, startX, startY) {
        this.character = character;
        this.playerNumber = playerNumber;

        // Position and physics
        this.x = startX;
        this.y = startY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.facing = playerNumber === 1 ? 1 : -1; // 1 = right, -1 = left
        this.grounded = true;

        // Health and meter
        this.health = character.health;
        this.maxHealth = character.health;
        this.whiteDamage = 0; // Recoverable damage
        this.meter = 0;
        this.maxMeter = 300;

        // State management
        this.state = 'idle';
        this.stateTimer = 0;
        this.animationFrame = 0;
        this.animationTimer = 0;

        // Combat properties
        this.hitboxes = [];
        this.hurtboxes = [{ x: -30, y: -120, width: 60, height: 120 }]; // Default hurtbox
        this.hitstun = 0;
        this.blockstun = 0;
        this.invulnerable = 0;

        // Attack animation properties
        this.currentAttackType = null;
        this.attackPhase = null; // 'startup', 'active', 'recovery'
        this.attackFrame = 0;
        this.attackData = null; // Store current attack data
        this.previousState = null; // State to return to after attack

        // Combo system
        this.comboCount = 0;
        this.comboDamage = 0;
        this.comboTimer = 0;

        // Input buffer for special moves
        this.inputBuffer = [];
        this.inputBufferTime = 0;

        // Dark Force mode
        this.darkForceActive = false;
        this.darkForceTimer = 0;

        // Status effects
        this.statusEffects = new Map();
    }

    update(inputManager, opponent) {
        this.stateTimer++;
        this.animationTimer++;

        // Update attack animation frame if attacking
        if (this.state === 'attacking' && this.attackData) {
            this.attackFrame++;
        }

        // Update status effects
        this.updateStatusEffects();

        // Health regeneration (white damage recovery)
        if (this.whiteDamage > 0 && this.stateTimer % 60 === 0) {
            const regenAmount = Math.min(this.whiteDamage, GAME_CONFIG.combat.healthRegenRate);
            this.whiteDamage -= regenAmount;
            this.health += regenAmount;
        }

        // Update input buffer
        this.updateInputBuffer(inputManager);

        // Update timers
        if (this.hitstun > 0) this.hitstun--;
        if (this.blockstun > 0) this.blockstun--;
        if (this.invulnerable > 0) this.invulnerable--;
        if (this.darkForceTimer > 0) this.darkForceTimer--;
        if (this.comboTimer > 0) this.comboTimer--;

        // End combo if timer expires
        if (this.comboTimer <= 0 && this.comboCount > 0) {
            this.endCombo();
        }

        // Update based on current state
        this.updateState(inputManager, opponent);

        // Update physics
        this.updatePhysics();

        // Update facing direction
        this.updateFacing(opponent);

        // Update animation
        this.updateAnimation();
    }

    updateState(inputManager, opponent) {
        const playerKey = this.playerNumber === 1 ? 'player1' : 'player2';

        // Can't act during hitstun or blockstun
        if (this.hitstun > 0 || this.blockstun > 0) {
            this.state = this.hitstun > 0 ? 'hitstun' : 'blockstun';
            return;
        }

        // Check for special move inputs first
        if (this.checkSpecialMoves(inputManager)) {
            return;
        }

        // Normal state transitions
        switch (this.state) {
            case 'idle':
                this.handleIdleState(inputManager, playerKey);
                break;
            case 'walking':
                this.handleWalkingState(inputManager, playerKey);
                break;
            case 'jumping':
                this.handleJumpingState(inputManager, playerKey);
                break;
            case 'attacking':
                this.handleAttackingState(inputManager, playerKey);
                break;
            case 'blocking':
                this.handleBlockingState(inputManager, playerKey);
                break;
        }
    }

    handleIdleState(inputManager, playerKey) {
        const inputs = INPUT_MAP[playerKey];

        // Check for movement
        if (inputManager.isKeyDown(inputs.left) || inputManager.isKeyDown(inputs.right)) {
            this.state = 'walking';
            this.stateTimer = 0;
        }

        // Check for jump
        if (inputManager.isKeyPressed(inputs.up) && this.grounded) {
            this.jump();
        }

        // Check for attacks
        if (this.checkNormalAttacks(inputManager, inputs)) {
            return;
        }

        // Check for blocking
        if (inputManager.isKeyDown(inputs.left) && this.facing === 1 ||
            inputManager.isKeyDown(inputs.right) && this.facing === -1) {
            this.state = 'blocking';
            this.stateTimer = 0;
        }

        // Apply friction
        this.velocityX *= GAME_CONFIG.physics.friction;
    }

    handleWalkingState(inputManager, playerKey) {
        const inputs = INPUT_MAP[playerKey];

        // Walking movement
        if (inputManager.isKeyDown(inputs.left)) {
            this.velocityX = -GAME_CONFIG.physics.walkSpeed * this.facing;
        } else if (inputManager.isKeyDown(inputs.right)) {
            this.velocityX = GAME_CONFIG.physics.walkSpeed * this.facing;
        } else {
            this.state = 'idle';
            this.stateTimer = 0;
        }

        // Check for jump
        if (inputManager.isKeyPressed(inputs.up) && this.grounded) {
            this.jump();
        }

        // Check for attacks
        if (this.checkNormalAttacks(inputManager, inputs)) {
            return;
        }
    }

    handleJumpingState(inputManager, playerKey) {
        const inputs = INPUT_MAP[playerKey];

        // Aerial movement
        if (inputManager.isKeyDown(inputs.left)) {
            this.velocityX = -GAME_CONFIG.physics.walkSpeed * 0.7 * this.facing;
        } else if (inputManager.isKeyDown(inputs.right)) {
            this.velocityX = GAME_CONFIG.physics.walkSpeed * 0.7 * this.facing;
        }

        // Check for aerial attacks
        if (this.checkNormalAttacks(inputManager, inputs)) {
            return;
        }

        // Land on ground
        if (this.grounded) {
            this.state = 'idle';
            this.stateTimer = 0;
        }
    }

    handleAttackingState(inputManager, playerKey) {
        const inputs = INPUT_MAP[playerKey];

        // Update attack phase based on current frame
        if (this.attackFrame <= this.attackData.startup) {
            this.attackPhase = 'startup';
        } else if (this.attackFrame <= this.attackData.startup + this.attackData.active) {
            this.attackPhase = 'active';
        } else if (this.attackFrame <= this.attackData.startup + this.attackData.active + this.attackData.recovery) {
            this.attackPhase = 'recovery';
        }

        // Prevent new inputs during recovery phase
        if (this.attackPhase === 'recovery') {
            // Don't process attack inputs during recovery
            return;
        }

        // Check for new attacks only during startup and active phases (cancellable)
        if (this.attackPhase === 'startup' || this.attackPhase === 'active') {
            if (this.checkNormalAttacks(inputManager, inputs)) {
                return; // New attack started, exit this method
            }
        }

        // Attack finished - return to previous state
        const totalFrames = this.attackData.startup + this.attackData.active + this.attackData.recovery;
        if (this.attackFrame >= totalFrames) {
            this.state = this.previousState || 'idle';
            this.stateTimer = 0;
            this.currentAttackType = null;
            this.attackPhase = null;
            this.attackFrame = 0;
            this.attackData = null;
            this.previousState = null;
        }
    }

    handleBlockingState(inputManager, playerKey) {
        const inputs = INPUT_MAP[playerKey];

        // Continue blocking while holding block direction
        const isHoldingBlock = (inputManager.isKeyDown(inputs.left) && this.facing === 1) ||
                              (inputManager.isKeyDown(inputs.right) && this.facing === -1);

        if (!isHoldingBlock) {
            // Stop blocking
            this.state = 'idle';
            this.stateTimer = 0;
        }

        // Can still jump out of block
        if (inputManager.isKeyPressed(inputs.up) && this.grounded) {
            this.jump();
        }

        // Apply friction while blocking
        this.velocityX *= GAME_CONFIG.physics.friction;
    }

    checkNormalAttacks(inputManager, inputs) {
        // Check all attack buttons
        const attacks = ['lp', 'mp', 'hp', 'lk', 'mk', 'hk'];

        for (let attack of attacks) {
            if (inputManager.isKeyPressed(inputs[attack])) {
                this.performNormalAttack(attack);
                return true;
            }
        }

        return false;
    }

    performNormalAttack(attackType) {
        // Store previous state to return to after attack
        this.previousState = this.state;

        this.state = 'attacking';
        this.stateTimer = 0;
        this.animationFrame = 0;

        // Set attack animation properties
        this.currentAttackType = attackType;
        this.attackPhase = 'startup';
        this.attackFrame = 0;
        this.attackData = this.getNormalAttackData(attackType);

        // Create hitbox based on attack type
        this.createHitbox(this.attackData);

        console.log(`${this.character.name} performs ${attackType}`);
    }

    getNormalAttackData(attackType) {
        const baseData = {
            lp: { damage: 60, hitstun: 12, blockstun: 8, startup: 4, active: 3, recovery: 8 },
            mp: { damage: 80, hitstun: 15, blockstun: 10, startup: 6, active: 4, recovery: 12 },
            hp: { damage: 110, hitstun: 20, blockstun: 15, startup: 8, active: 5, recovery: 18 },
            lk: { damage: 70, hitstun: 14, blockstun: 9, startup: 5, active: 3, recovery: 10 },
            mk: { damage: 90, hitstun: 16, blockstun: 12, startup: 7, active: 4, recovery: 14 },
            hk: { damage: 120, hitstun: 22, blockstun: 16, startup: 10, active: 6, recovery: 20 }
        };

        return baseData[attackType] || baseData.lp;
    }

    createHitbox(data) {
        const hitbox = {
            x: this.x + (50 * this.facing),
            y: this.y - 80,
            width: 80,
            height: 60,
            damage: data.damage,
            hitstun: data.hitstun,
            blockstun: data.blockstun,
            startupFrames: data.startup,
            activeFrames: data.active,
            currentFrame: 0,
            active: false,
            id: Date.now() + Math.random()
        };

        this.hitboxes.push(hitbox);
    }

    jump() {
        this.velocityY = GAME_CONFIG.physics.jumpPower;
        this.grounded = false;
        this.state = 'jumping';
        this.stateTimer = 0;
    }

    updatePhysics() {
        // Apply gravity
        if (!this.grounded) {
            this.velocityY += GAME_CONFIG.physics.gravity;
        }

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Ground collision (simplified)
        const groundY = 800;
        if (this.y >= groundY) {
            this.y = groundY;
            this.velocityY = 0;
            this.grounded = true;

            if (this.state === 'jumping') {
                this.state = 'idle';
                this.stateTimer = 0;
            }
        }

        // Stage boundaries
        this.x = Math.max(100, Math.min(1820, this.x));

        // Update hitboxes
        this.updateHitboxes();
    }

    updateHitboxes() {
        for (let i = this.hitboxes.length - 1; i >= 0; i--) {
            const hitbox = this.hitboxes[i];
            hitbox.currentFrame++;

            // Activate hitbox after startup frames
            if (hitbox.currentFrame >= hitbox.startupFrames && 
                hitbox.currentFrame < hitbox.startupFrames + hitbox.activeFrames) {
                hitbox.active = true;
            } else {
                hitbox.active = false;
            }

            // Remove hitbox after total duration
            if (hitbox.currentFrame >= hitbox.startupFrames + hitbox.activeFrames + 10) {
                this.hitboxes.splice(i, 1);
            }
        }
    }

    updateFacing(opponent) {
        // Always face opponent when not in specific states
        if (this.state !== 'attacking' && this.hitstun <= 0) {
            this.facing = this.x < opponent.x ? 1 : -1;
        }
    }

    updateAnimation() {
        // Simple animation system
        if (this.animationTimer >= 6) { // Change frame every 6 game frames
            this.animationFrame++;
            this.animationTimer = 0;
        }
    }

    updateInputBuffer(inputManager) {
        // Add new inputs to buffer
        // This would be more complex in a real implementation
        // For now, just track basic directional inputs

        this.inputBufferTime++;
        if (this.inputBufferTime >= 60) { // Clear buffer every second
            this.inputBuffer = [];
            this.inputBufferTime = 0;
        }
    }

    checkSpecialMoves(inputManager) {
        // Check for quarter circle forward + punch (fireball)
        // This is a simplified implementation
        const playerKey = this.playerNumber === 1 ? 'player1' : 'player2';
        const inputs = INPUT_MAP[playerKey];

        if (inputManager.isKeyPressed(inputs.lp) || 
            inputManager.isKeyPressed(inputs.mp) || 
            inputManager.isKeyPressed(inputs.hp)) {
            // For demo purposes, perform fireball on any punch after down-forward motion
            if (inputManager.isKeyDown(inputs.down) && inputManager.isKeyDown(inputs.right)) {
                this.performSpecialMove('fireball');
                return true;
            }
        }

        return false;
    }

    performSpecialMove(moveName) {
        const move = this.character.moves[moveName];
        if (!move || this.meter < move.meter * 100) return;

        this.state = 'special';
        this.stateTimer = 0;
        this.meter -= move.meter * 100;

        // Create special move hitbox
        this.createSpecialHitbox(move);

        console.log(`${this.character.name} performs ${moveName}!`);
    }

    createSpecialHitbox(moveData) {
        const hitbox = {
            x: this.x + (100 * this.facing),
            y: this.y - 60,
            width: 120,
            height: 80,
            damage: moveData.damage,
            hitstun: 25,
            blockstun: 20,
            startupFrames: 8,
            activeFrames: 6,
            currentFrame: 0,
            active: false,
            special: true,
            id: Date.now() + Math.random()
        };

        this.hitboxes.push(hitbox);
    }

    takeDamage(amount, blocked = false) {
        if (this.invulnerable > 0) return;

        if (blocked) {
            // Chip damage goes to white damage
            this.whiteDamage += amount;
        } else {
            // Regular damage - portion goes to white damage for potential recovery
            const whiteDamageRatio = 0.3;
            const realDamage = Math.floor(amount * (1 - whiteDamageRatio));
            const whiteDamage = amount - realDamage;

            this.health -= realDamage;
            this.whiteDamage += whiteDamage;
        }

        this.health = Math.max(0, this.health);

        // Check for KO
        if (this.health <= 0) {
            this.state = 'ko';
            this.stateTimer = 0;
        }
    }

    enterHitstun(frames) {
        this.hitstun = frames;
        this.state = 'hitstun';
        this.stateTimer = 0;

        // Push away from opponent
        this.velocityX = -2 * this.facing;
    }

    enterBlockstun(frames) {
        this.blockstun = frames;
        this.state = 'blockstun';
        this.stateTimer = 0;
    }

    isBlocking() {
        return this.state === 'blocking' || this.blockstun > 0;
    }

    gainMeter(amount) {
        this.meter = Math.min(this.maxMeter, this.meter + amount);
    }

    startCombo() {
        this.comboCount = 1;
        this.comboDamage = 0;
        this.comboTimer = 120; // 2 seconds to continue combo
    }

    endCombo() {
        if (this.comboCount > 1) {
            console.log(`${this.character.name} combo: ${this.comboCount} hits, ${this.comboDamage} damage`);
        }
        this.comboCount = 0;
        this.comboDamage = 0;
        this.comboTimer = 0;
    }

    getActiveHitboxes() {
        return this.hitboxes.filter(hitbox => hitbox.active);
    }

    getHurtboxes() {
        return this.hurtboxes.map(hurtbox => ({
            x: this.x + hurtbox.x,
            y: this.y + hurtbox.y,
            width: hurtbox.width,
            height: hurtbox.height
        }));
    }

    deactivateHitbox(hitbox) {
        hitbox.active = false;
    }

    updateStatusEffects() {
        // Update any status effects like poison, burn, etc.
        for (let [effect, data] of this.statusEffects) {
            data.duration--;
            if (data.duration <= 0) {
                this.statusEffects.delete(effect);
            }
        }
    }

    renderAttackAnimation(ctx) {
        // Determine attack type (punch or kick)
        const isPunch = this.currentAttackType.includes('p');
        const isKick = this.currentAttackType.includes('k');

        // Get phase color
        let phaseColor = '#ffff00'; // default yellow
        if (this.attackPhase === 'startup') phaseColor = '#ffff00'; // yellow
        else if (this.attackPhase === 'active') phaseColor = '#ff4444'; // red
        else if (this.attackPhase === 'recovery') phaseColor = '#4444ff'; // blue

        // Draw base character
        ctx.fillStyle = this.character.color;
        ctx.fillRect(this.x - 30, this.y - 120, 60, 120);

        // Draw attack extension based on type
        if (isPunch) {
            // Punch animation - extending arm
            const armLength = 40 + (this.attackFrame * 2); // Grows during attack
            const armX = this.x + (50 * this.facing);
            const armY = this.y - 80;

            ctx.strokeStyle = phaseColor;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - 80);
            ctx.lineTo(armX, armY);
            ctx.stroke();

            // Draw fist
            ctx.fillStyle = phaseColor;
            ctx.beginPath();
            ctx.arc(armX, armY, 15, 0, Math.PI * 2);
            ctx.fill();

        } else if (isKick) {
            // Kick animation - kicking leg
            const kickAngle = (this.attackFrame / 10) * Math.PI / 4; // Rotate leg
            const legLength = 60;
            const legX = this.x + Math.cos(kickAngle) * legLength * this.facing;
            const legY = this.y - 40 + Math.sin(kickAngle) * legLength;

            ctx.strokeStyle = phaseColor;
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - 40);
            ctx.lineTo(legX, legY);
            ctx.stroke();

            // Draw foot
            ctx.fillStyle = phaseColor;
            ctx.beginPath();
            ctx.arc(legX, legY, 18, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw attack frame indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(`${this.attackFrame}`, this.x, this.y - 100);
    }

    render(ctx) {
        ctx.save();

        // Flip sprite based on facing direction
        if (this.facing === -1) {
            ctx.scale(-1, 1);
            ctx.translate(-this.x * 2, 0);
        }

        // Draw character with attack animation
        if (this.state === 'attacking' && this.currentAttackType) {
            this.renderAttackAnimation(ctx);
        } else {
            // Draw normal character
            ctx.fillStyle = this.character.color;
            ctx.fillRect(this.x - 30, this.y - 120, 60, 120);
        }

        // Draw character name/indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.character.name, this.x, this.y - 140);

        // Draw state indicator
        ctx.fillStyle = '#ffff00';
        ctx.font = '12px monospace';
        ctx.fillText(this.state, this.x, this.y - 125);

        // Draw attack info if attacking
        if (this.state === 'attacking' && this.currentAttackType) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '10px monospace';
            ctx.fillText(`${this.currentAttackType} ${this.attackPhase}`, this.x, this.y - 110);
        }

        ctx.restore();

        // Draw hitboxes (debug)
        if (window.debugMode) {
            this.renderDebugBoxes(ctx);
        }
    }

    renderDebugBoxes(ctx) {
        // Draw hitboxes in red
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        for (let hitbox of this.hitboxes) {
            if (hitbox.active) {
                ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
            }
        }

        // Draw hurtboxes in blue
        ctx.strokeStyle = '#0000ff';
        const hurtboxes = this.getHurtboxes();
        for (let hurtbox of hurtboxes) {
            ctx.strokeRect(hurtbox.x, hurtbox.y, hurtbox.width, hurtbox.height);
        }
    }
}

// Input Manager for handling keyboard input
class InputManager {
    constructor() {
        this.keys = {};
        this.previousKeys = {};
    }

    init() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    update() {
        // Store previous frame's key states
        this.previousKeys = { ...this.keys };
    }

    isKeyDown(keyCode) {
        return !!this.keys[keyCode];
    }

    isKeyPressed(keyCode) {
        return this.keys[keyCode] && !this.previousKeys[keyCode];
    }

    isKeyReleased(keyCode) {
        return !this.keys[keyCode] && this.previousKeys[keyCode];
    }
}

// Audio Manager for sound effects and music
class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
    }

    loadSound(name, url) {
        const audio = new Audio(url);
        audio.volume = this.sfxVolume;
        this.sounds[name] = audio;
    }

    playSound(name) {
        if (this.sounds[name]) {
            const sound = this.sounds[name].cloneNode();
            sound.play().catch(e => console.log('Audio play failed:', e));
        } else {
            // Placeholder audio feedback
            console.log('Playing sound:', name);
        }
    }

    playMusic(name) {
        // Music implementation
        console.log('Playing music:', name);
    }
}

// Effects Manager for visual effects and particles
class EffectsManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.effects = [];
        this.particles = [];
        this.screenShakeX = 0;
        this.screenShakeY = 0;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
    }

    update() {
        // Update screen shake
        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            this.screenShakeX = (Math.random() - 0.5) * this.shakeIntensity;
            this.screenShakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= 0.95; // Decay
        } else {
            this.screenShakeX = 0;
            this.screenShakeY = 0;
        }

        // Update effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.update();

            if (effect.isDead()) {
                this.effects.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();

            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.screenShakeX, this.screenShakeY);

        // Render effects
        for (let effect of this.effects) {
            effect.render(ctx);
        }

        // Render particles
        for (let particle of this.particles) {
            particle.render(ctx);
        }

        ctx.restore();
    }

    createHitEffect(x, y, damage) {
        const effect = new HitEffect(x, y, damage);
        this.effects.push(effect);

        // Create hit particles
        for (let i = 0; i < 8; i++) {
            const particle = new HitParticle(x, y);
            this.particles.push(particle);
        }
    }

    createBlockEffect(x, y) {
        const effect = new BlockEffect(x, y);
        this.effects.push(effect);
    }

    screenShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }
}

// Visual effect classes
class HitEffect {
    constructor(x, y, damage) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.timer = 0;
        this.maxTime = 30;
    }

    update() {
        this.timer++;
        this.y -= 2; // Float upward
    }

    render(ctx) {
        const alpha = 1 - (this.timer / this.maxTime);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.damage.toString(), this.x, this.y);
        ctx.restore();
    }

    isDead() {
        return this.timer >= this.maxTime;
    }
}

class BlockEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.timer = 0;
        this.maxTime = 15;
    }

    update() {
        this.timer++;
    }

    render(ctx) {
        const alpha = 1 - (this.timer / this.maxTime);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#00aaff';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BLOCK', this.x, this.y);
        ctx.restore();
    }

    isDead() {
        return this.timer >= this.maxTime;
    }
}

class HitParticle {
    constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 40;
        this.y = y + (Math.random() - 0.5) * 40;
        this.velocityX = (Math.random() - 0.5) * 8;
        this.velocityY = (Math.random() - 0.5) * 8 - 2;
        this.size = Math.random() * 4 + 2;
        this.timer = 0;
        this.maxTime = 20;
        this.color = `hsl(${Math.random() * 60 + 15}, 100%, 70%)`; // Orange/yellow particles
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.3; // Gravity
        this.timer++;
    }

    render(ctx) {
        const alpha = 1 - (this.timer / this.maxTime);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.timer >= this.maxTime;
    }
}

// Stage class for background and environment
class Stage {
    constructor() {
        this.name = "Vampire Castle";
        this.width = 1920;
        this.height = 1080;
    }

    render(ctx) {
        // Draw background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#2d0a4d');
        gradient.addColorStop(0.7, '#1a0033');
        gradient.addColorStop(1, '#000000');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw ground
        ctx.fillStyle = '#330066';
        ctx.fillRect(0, 800, this.width, 280);

        // Draw some gothic architecture elements (simplified)
        this.drawCastleElements(ctx);
    }

    drawCastleElements(ctx) {
        // Gothic pillars
        ctx.fillStyle = '#1a0033';
        for (let i = 0; i < 4; i++) {
            const x = 200 + i * 400;
            ctx.fillRect(x, 600, 40, 200);

            // Pillar tops
            ctx.fillRect(x - 10, 580, 60, 40);
        }

        // Background castle silhouette
        ctx.fillStyle = '#0d001a';
        ctx.beginPath();
        ctx.moveTo(0, 400);
        ctx.lineTo(300, 350);
        ctx.lineTo(400, 300);
        ctx.lineTo(500, 320);
        ctx.lineTo(800, 280);
        ctx.lineTo(1000, 300);
        ctx.lineTo(1200, 250);
        ctx.lineTo(1400, 280);
        ctx.lineTo(1600, 240);
        ctx.lineTo(1920, 260);
        ctx.lineTo(1920, 800);
        ctx.lineTo(0, 800);
        ctx.closePath();
        ctx.fill();
    }
}

// Global functions for menu interaction
window.startGame = function() {
    if (window.game) {
        window.game.startFight();
    }
};

window.showCharacterSelect = function() {
    alert('Character Select - Coming Soon!\nCurrently using Morrigan vs Demitri');
};

window.showControls = function() {
    document.getElementById('controlsHelp').style.display = 'block';
};

window.hideControls = function() {
    document.getElementById('controlsHelp').style.display = 'none';
};

window.showOptions = function() {
    alert('Options - Coming Soon!');
};

// Debug toggle
window.toggleDebug = function() {
    window.debugMode = !window.debugMode;
    console.log('Debug mode:', window.debugMode ? 'ON' : 'OFF');
};

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new VampireSaviorsGame();
    console.log('Vampire Saviors - The Lord of Vampire loaded!');
    console.log('Press F12 and type toggleDebug() to enable debug mode');
});
