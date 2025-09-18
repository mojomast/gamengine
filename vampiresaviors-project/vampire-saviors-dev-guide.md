
# Vampire Saviors Development Guide

This guide explains how to extend and modify the Vampire Saviors fighting game built with the mojomast/gamengine architecture.

## 🏗️ Engine Architecture

### Core Systems Overview

The game is built using a modular architecture inspired by the mojomast/gamengine framework:

```
VampireSaviorsGame (Main Controller)
├── InputManager (Keyboard input handling)
├── AudioManager (Sound effects and music)
├── EffectsManager (Particles and visual effects)
├── Fighter (Character logic and combat)
├── Stage (Background and environment)
└── UI Systems (HUD, menus, overlays)
```

### Game Loop Structure

```javascript
gameLoop() {
    this.update();    // Game logic
    this.render();    // Drawing
    requestAnimationFrame(() => this.gameLoop());
}
```

## 🎮 Adding New Characters

### 1. Character Data Structure

Add new characters to the `CHARACTERS` object:

```javascript
const CHARACTERS = {
    newCharacter: {
        name: "Character Name",
        health: 1000,           // Max health
        walkSpeed: 4.5,         // Ground movement speed
        dashSpeed: 8,           // Dash speed
        jumpHeight: -16,        // Jump velocity (negative = up)
        color: "#color",        // Placeholder sprite color
        moves: {
            // Special moves with motion inputs
            specialMove: { 
                input: "236P",      // Quarter circle forward + Punch
                damage: 100, 
                meter: 0            // Meter cost (0 = no meter)
            },
            superMove: { 
                input: "236236P",   // Double quarter circle + Punch
                damage: 300, 
                meter: 2            // Costs 2 meter bars
            }
        },
        darkForce: "Description of unique Dark Force ability"
    }
};
```

### 2. Motion Input Notation

Fighting game motion inputs use numpad notation:
- `236` = Quarter Circle Forward (Down, Down-Forward, Forward)
- `214` = Quarter Circle Back (Down, Down-Back, Back)  
- `623` = Dragon Punch (Forward, Down, Down-Forward)
- `632146` = Half Circle Forward
- `P` = Punch, `K` = Kick

### 3. Character-Specific Logic

Extend the `Fighter` class for unique character abilities:

```javascript
class Morrigan extends Fighter {
    constructor(character, playerNumber, startX, startY) {
        super(character, playerNumber, startX, startY);
        this.shadowClone = null; // Dark Force ability
    }

    activateDarkForce() {
        super.activateDarkForce();
        this.shadowClone = new ShadowClone(this);
    }
}
```

## ⚔️ Combat System Mechanics

### Hitbox/Hurtbox System

The collision detection uses rectangular hitboxes and hurtboxes:

```javascript
// Create hitbox for an attack
createHitbox(data) {
    const hitbox = {
        x: this.x + (50 * this.facing),    // Position relative to character
        y: this.y - 80,
        width: 80,
        height: 60,
        damage: data.damage,
        hitstun: data.hitstun,             // Frames opponent is stunned
        blockstun: data.blockstun,         // Frames opponent is in blockstun
        startupFrames: data.startup,       // Frames before hitbox becomes active
        activeFrames: data.active,         // Frames hitbox stays active
        currentFrame: 0,
        active: false,
        id: Date.now() + Math.random()
    };

    this.hitboxes.push(hitbox);
}
```

### Frame Data System

Each attack has specific frame data:
- **Startup**: Frames before attack becomes active
- **Active**: Frames the attack can hit
- **Recovery**: Frames after attack ends before character can act
- **Hitstun**: Frames opponent is stunned when hit
- **Blockstun**: Frames opponent is locked in block

### Health System Implementation

The unique three-tier health system:

```javascript
takeDamage(amount, blocked = false) {
    if (blocked) {
        // Chip damage becomes white damage (recoverable)
        this.whiteDamage += amount;
    } else {
        // Split damage between permanent and recoverable
        const whiteDamageRatio = 0.3;
        const realDamage = Math.floor(amount * (1 - whiteDamageRatio));
        const whiteDamage = amount - realDamage;

        this.health -= realDamage;
        this.whiteDamage += whiteDamage;
    }
}
```

## 🎨 Visual Effects System

### Particle Effects

Add new particle effects through the `EffectsManager`:

```javascript
createCustomEffect(x, y, type) {
    switch(type) {
        case 'explosion':
            for (let i = 0; i < 12; i++) {
                const particle = new ExplosionParticle(x, y);
                this.particles.push(particle);
            }
            break;
        case 'ice':
            const iceEffect = new IceEffect(x, y);
            this.effects.push(iceEffect);
            break;
    }
}
```

### Screen Effects

Implement screen shake and visual feedback:

```javascript
screenShake(intensity, duration) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
}

// In render loop
render(ctx) {
    ctx.save();
    ctx.translate(this.screenShakeX, this.screenShakeY);
    // ... render game objects
    ctx.restore();
}
```

## 🎵 Audio Integration

### Sound Effect System

Replace placeholder audio with real sounds:

```javascript
class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
    }

    async loadSound(name, url) {
        try {
            const audio = new Audio(url);
            audio.volume = this.sfxVolume;
            await audio.load();
            this.sounds.set(name, audio);
        } catch (error) {
            console.warn(`Failed to load sound: ${name}`, error);
        }
    }

    playSound(name) {
        const sound = this.sounds.get(name);
        if (sound) {
            const instance = sound.cloneNode();
            instance.play().catch(e => console.log('Audio play failed:', e));
        }
    }
}
```

### Audio Asset Structure

Organize audio files:
```
assets/
├── sfx/
│   ├── hit_light.wav
│   ├── hit_medium.wav
│   ├── hit_heavy.wav
│   ├── block.wav
│   ├── special_move.wav
│   └── super_move.wav
├── voices/
│   ├── morrigan/
│   │   ├── attack1.wav
│   │   ├── special.wav
│   │   └── victory.wav
│   └── demitri/
│       ├── attack1.wav
│       ├── special.wav
│       └── victory.wav
└── music/
    ├── character_select.mp3
    ├── stage1.mp3
    └── victory.mp3
```

## 🏟️ Stage Development

### Creating New Stages

Extend the `Stage` class for new backgrounds:

```javascript
class CastleStage extends Stage {
    constructor() {
        super();
        this.name = "Vampire Castle";
        this.backgroundLayers = [];  // For parallax scrolling
        this.groundY = 800;          // Ground level
    }

    render(ctx) {
        // Draw background layers
        this.renderBackground(ctx);

        // Draw interactive elements
        this.renderForeground(ctx);

        // Draw ground collision
        this.renderGround(ctx);
    }

    renderBackground(ctx) {
        // Implement parallax background layers
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#2d0a4d');
        gradient.addColorStop(1, '#000000');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
    }
}
```

### Stage Boundaries and Interactions

```javascript
// In Fighter update method
updatePhysics() {
    // ... existing physics code ...

    // Stage-specific boundaries
    const stageLeft = this.stage.getBoundaryLeft();
    const stageRight = this.stage.getBoundaryRight();
    const stageGround = this.stage.getGroundY();

    // Constrain to stage
    this.x = Math.max(stageLeft, Math.min(stageRight, this.x));

    // Ground collision
    if (this.y >= stageGround) {
        this.y = stageGround;
        this.velocityY = 0;
        this.grounded = true;
    }
}
```

## 🎯 Input System Enhancement

### Custom Input Mapping

Allow players to customize controls:

```javascript
class InputManager {
    constructor() {
        this.playerControls = {
            player1: {
                left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS',
                lp: 'KeyU', mp: 'KeyI', hp: 'KeyO',
                lk: 'KeyJ', mk: 'KeyK', hk: 'KeyL'
            },
            player2: {
                left: 'ArrowLeft', right: 'ArrowRight', 
                up: 'ArrowUp', down: 'ArrowDown',
                lp: 'Numpad7', mp: 'Numpad8', hp: 'Numpad9',
                lk: 'Numpad4', mk: 'Numpad5', hk: 'Numpad6'
            }
        };
    }

    remapControl(player, action, newKey) {
        this.playerControls[player][action] = newKey;
        this.saveControlsToStorage();
    }
}
```

### Gamepad Support

Add controller support:

```javascript
// In InputManager
updateGamepads() {
    const gamepads = navigator.getGamepads();

    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad) {
            this.processGamepadInput(gamepad, i);
        }
    }
}

processGamepadInput(gamepad, playerIndex) {
    const player = `player${playerIndex + 1}`;

    // Map gamepad buttons to game actions
    if (gamepad.buttons[0].pressed) {
        this.keys[`${player}_lp`] = true;
    }

    // Map analog stick to movement
    if (gamepad.axes[0] < -0.5) {
        this.keys[`${player}_left`] = true;
    }
}
```

## 📊 Performance Optimization

### Object Pooling

Reuse objects to reduce garbage collection:

```javascript
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createFn();
    }

    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }
}

// Usage for particles
const particlePool = new ObjectPool(
    () => new HitParticle(0, 0),
    (particle) => particle.reset(),
    50
);
```

### Frame Rate Management

Optimize rendering for consistent 60 FPS:

```javascript
class PerformanceManager {
    constructor() {
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        this.deltaAccumulator = 0;
    }

    shouldUpdate(currentTime) {
        const deltaTime = currentTime - this.lastFrameTime;
        this.deltaAccumulator += deltaTime;
        this.lastFrameTime = currentTime;

        if (this.deltaAccumulator >= this.frameTime) {
            this.deltaAccumulator -= this.frameTime;
            return true;
        }
        return false;
    }
}
```

## 🔧 Debug Tools

### Enhanced Debug Mode

Add comprehensive debugging features:

```javascript
class DebugManager {
    constructor(game) {
        this.game = game;
        this.showHitboxes = false;
        this.showFrameData = false;
        this.showInputs = false;
        this.logCombos = false;
    }

    renderDebugInfo(ctx) {
        if (this.showHitboxes) {
            this.renderHitboxes(ctx);
        }

        if (this.showFrameData) {
            this.renderFrameData(ctx);
        }

        if (this.showInputs) {
            this.renderInputHistory(ctx);
        }
    }

    toggleDebugFeature(feature) {
        this[feature] = !this[feature];
        console.log(`Debug ${feature}:`, this[feature] ? 'ON' : 'OFF');
    }
}

// Console commands for debugging
window.debug = {
    hitboxes: () => game.debugManager.toggleDebugFeature('showHitboxes'),
    frameData: () => game.debugManager.toggleDebugFeature('showFrameData'),
    inputs: () => game.debugManager.toggleDebugFeature('showInputs')
};
```

## 🚀 Deployment and Distribution

### Build Process

Create a build script for production:

```javascript
// build.js
const fs = require('fs');
const path = require('path');

class GameBuilder {
    constructor() {
        this.sourceDir = './src';
        this.distDir = './dist';
    }

    build() {
        // Minify JavaScript
        this.minifyJS();

        // Optimize CSS
        this.optimizeCSS();

        // Compress assets
        this.compressAssets();

        // Generate index.html
        this.generateHTML();
    }

    minifyJS() {
        // Implement JavaScript minification
        console.log('Minifying JavaScript...');
    }

    optimizeCSS() {
        // Implement CSS optimization
        console.log('Optimizing CSS...');
    }
}
```

### Asset Management

Organize and optimize game assets:

```
assets/
├── sprites/
│   ├── characters/
│   │   ├── morrigan/
│   │   │   ├── idle.png
│   │   │   ├── walk.png
│   │   │   └── attack.png
│   │   └── demitri/
│   │       ├── idle.png
│   │       ├── walk.png
│   │       └── attack.png
│   └── effects/
│       ├── hit_spark.png
│       ├── block_spark.png
│       └── super_flash.png
├── audio/
│   ├── sfx/
│   ├── voices/
│   └── music/
└── stages/
    ├── castle_bg.png
    ├── forest_bg.png
    └── lab_bg.png
```

## 📈 Testing and Quality Assurance

### Unit Testing

Test combat mechanics:

```javascript
// test/combat.test.js
describe('Combat System', () => {
    let fighter1, fighter2;

    beforeEach(() => {
        fighter1 = new Fighter(CHARACTERS.morrigan, 1, 300, 800);
        fighter2 = new Fighter(CHARACTERS.demitri, 2, 900, 800);
    });

    test('should deal correct damage on hit', () => {
        const initialHealth = fighter2.health;
        const hitbox = {
            damage: 100,
            hitstun: 15,
            x: fighter2.x, y: fighter2.y - 60,
            width: 80, height: 60
        };

        fighter2.takeDamage(hitbox.damage);
        expect(fighter2.health).toBe(initialHealth - 70); // Accounting for white damage
    });

    test('should register combo correctly', () => {
        fighter1.startCombo();
        expect(fighter1.comboCount).toBe(1);

        fighter1.comboCount++;
        expect(fighter1.comboCount).toBe(2);
    });
});
```

### Performance Testing

Monitor frame rate and memory usage:

```javascript
class PerformanceMonitor {
    constructor() {
        this.fpsHistory = [];
        this.memoryHistory = [];
        this.maxHistoryLength = 60;
    }

    update() {
        // Track FPS
        this.fpsHistory.push(this.getCurrentFPS());
        if (this.fpsHistory.length > this.maxHistoryLength) {
            this.fpsHistory.shift();
        }

        // Track memory usage
        if (performance.memory) {
            this.memoryHistory.push(performance.memory.usedJSHeapSize);
            if (this.memoryHistory.length > this.maxHistoryLength) {
                this.memoryHistory.shift();
            }
        }
    }

    getAverageFPS() {
        return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    }
}
```

## 🎮 Next Steps

### Recommended Enhancements

1. **AI System**: Implement computer opponents with behavior trees
2. **Network Play**: Add online multiplayer with rollback netcode
3. **Replay System**: Record and playback matches
4. **Tutorial Mode**: Interactive training for new players
5. **Tournament Mode**: Bracket-style competition system

### Community Features

1. **Custom Character Creator**: Let players design fighters
2. **Stage Editor**: Build custom fighting arenas
3. **Combo Sharing**: Upload and share combo videos
4. **Mod Support**: Allow community modifications

This development guide provides the foundation for extending the Vampire Saviors fighting game into a full-featured fighting game engine.
