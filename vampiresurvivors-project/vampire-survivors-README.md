
# Vampire Survivors - Bullet Hell Survival Game

A complete implementation of a Vampire Survivors-style bullet hell survival game built using the mojomast/gamengine architecture. Survive 30 minutes against endless waves of enemies with automatic weapons and strategic upgrades.

## 🎮 About Vampire Survivors

Vampire Survivors is a bullet hell survival game where:
- **Automatic Combat**: Your weapons fire automatically - you only control movement
- **Survival Goal**: Survive for 30 minutes against endless enemy waves
- **Power Progression**: Kill enemies to gain XP, level up, and choose upgrades
- **Weapon Evolution**: Combine max-level weapons with items for powerful evolutions
- **Strategic Upgrades**: Choose from random upgrades each level to build your character

## 🚀 Play the Game

**[🎮 PLAY VAMPIRE SURVIVORS NOW](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/9da0757b00c3468f6ba23281593d22fc/2cc55aa7-5290-4718-acff-f7a7a3499350/index.html)**

## 🎯 How to Play

### Controls
- **Movement**: WASD or Arrow Keys
- **Combat**: Weapons fire automatically
- **Goal**: Survive for 30 minutes!

### Game Loop
1. **Move** around to avoid enemy contact
2. **Kill enemies** to collect XP gems (they fly towards you when close)
3. **Level up** to choose from 3 random upgrades
4. **Evolve weapons** by combining weapons with specific items
5. **Survive** increasingly difficult waves for 30 minutes

## ⚔️ Weapons System

### Base Weapons
- **Whip**: Horizontal slashing attack in front of player
- **Magic Wand**: Automatically targets nearest enemy
- **Knife**: Flies in the direction you're facing
- **Axe**: Spins around player in orbital pattern
- **Cross**: Boomerangs to nearest enemy and returns
- **King Bible**: Creates protective orbital around player
- **Garlic**: Damages all nearby enemies continuously

### Weapon Evolutions
Combine max-level weapons with specific items to unlock powerful evolved versions:

- **Whip + Hollow Heart = Bloody Tear**: Critical hits restore health
- **Magic Wand + Empty Tome = Holy Wand**: Fires with no cooldown
- **Knife + Bracer = Thousand Edge**: Continuous stream of projectiles
- **Axe + Candelabrador = Death Spiral**: Larger, piercing scythes

## 🛡️ Passive Items

Boost your character's abilities:

- **Spinach**: +10% Damage to all weapons
- **Armor**: -8% Incoming damage from enemies
- **Hollow Heart**: +20 Max Health
- **Pummarola**: +0.2 Health regeneration per second
- **Empty Tome**: -8% Weapon cooldown (faster firing)
- **Bracer**: +10% Projectile speed

## 👹 Enemy Types

Enemies get stronger as time progresses:

| Enemy Type | Health | Speed | Damage | XP | Spawn Time |
|------------|--------|-------|--------|----|-----------| 
| **Bat** | 15 | Fast | 8 | 1 | 0-5 min |
| **Skeleton** | 30 | Medium | 12 | 2 | 5-10 min |
| **Ghost** | 25 | Fast | 10 | 2 | 10-15 min |
| **Orc** | 60 | Slow | 20 | 5 | 15-20 min |
| **Demon** | 100 | Medium | 25 | 8 | 20+ min |

## 🏗️ Technical Implementation

### Built with mojomast/gamengine Architecture

This game demonstrates key concepts from the mojomast/gamengine framework:

#### Core Systems
- **Game Loop**: 60 FPS update/render cycle with delta time
- **Scene Management**: Menu → Game → Level Up → Game Over states
- **Input Handling**: WASD/Arrow key movement with smooth controls
- **Object Management**: Efficient spawning/despawning of enemies and projectiles
- **Collision Detection**: Optimized collision between projectiles and enemies
- **Audio System**: Sound effect placeholders with console logging

#### Game-Specific Systems
- **Automatic Weapon System**: Each weapon type has unique firing patterns
- **Enemy Wave Spawning**: Dynamic enemy spawning with difficulty scaling
- **XP and Leveling**: Experience collection with magnetic pickup
- **Upgrade System**: Random upgrade selection with weighted probabilities  
- **Weapon Evolution**: Complex combination system for weapon upgrades
- **Particle Effects**: Visual feedback for hits, deaths, and level-ups

### Performance Optimizations

#### Object Pooling
```javascript
// Efficient projectile management
updateProjectiles(deltaTime) {
    this.projectiles.forEach((projectile, index) => {
        // Update position based on projectile type
        // Remove expired projectiles
        // Handle collision detection
    });
}
```

#### Efficient Enemy Spawning
```javascript
spawnEnemies() {
    // Limit max enemies on screen
    if (this.enemies.length >= this.config.maxEnemies) return;

    // Spawn based on time and difficulty scaling
    const timeMinutes = this.survivedTime / 60000;
    const enemyType = this.selectEnemyType(timeMinutes);

    // Spawn outside visible area
    const spawnPos = this.calculateSpawnPosition();
}
```

#### Smart Collision Detection
```javascript
checkCollisions() {
    // Only check collisions for active projectiles
    this.projectiles.forEach(projectile => {
        this.enemies.forEach(enemy => {
            if (this.isColliding(projectile, enemy)) {
                this.handleHit(projectile, enemy);
            }
        });
    });
}
```

## 🎨 Visual Design

### Gothic Horror Theme
- **Dark Color Palette**: Deep purples, blues, and blacks
- **Neon Effects**: Glowing weapons and UI elements
- **Particle Systems**: Hit effects, enemy deaths, XP collection
- **Smooth Animations**: 60 FPS gameplay with fluid movement

### Responsive UI
- **Health Bar**: Real-time health with damage visualization
- **Timer**: 30-minute countdown with MM:SS format
- **XP Bar**: Visual progress towards next level
- **Level Up Screen**: Clean upgrade selection interface

## 🔧 Code Architecture

### Main Game Class Structure
```javascript
class VampireSurvivors {
    constructor() {
        // Initialize canvas, input, game state
    }

    // Core game loop
    update(deltaTime) {
        this.updatePlayer(deltaTime);
        this.updateWeapons(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateProjectiles(deltaTime);
        this.updateXpGems(deltaTime);
    }

    render(ctx) {
        this.renderPlayer(ctx);
        this.renderEnemies(ctx);
        this.renderProjectiles(ctx);
        this.renderEffects(ctx);
    }
}
```

### Weapon System Architecture
```javascript
// Each weapon has unique firing pattern
fireWeapon(weaponId) {
    const weapon = this.getWeaponData(weaponId);

    switch (weaponId) {
        case 'whip': this.fireWhip(weapon); break;
        case 'magicWand': this.fireMagicWand(weapon); break;
        case 'knife': this.fireKnife(weapon); break;
        // ... other weapons
    }
}
```

### Upgrade System
```javascript
generateUpgradeOptions() {
    const options = [];

    // Add available weapons if slots open
    if (this.player.weapons.length < 6) {
        options.push(this.getRandomWeapon());
    }

    // Add passive items
    options.push(this.getRandomPassiveItem());

    // Add stat boosts
    options.push(this.getRandomStatBoost());

    return options.slice(0, 3); // Always show 3 options
}
```

## 📊 Game Balance

### Progression Curve
- **Early Game (0-10 min)**: Learn basic mechanics, get first weapons
- **Mid Game (10-20 min)**: Acquire weapon evolutions, power scaling
- **Late Game (20-30 min)**: Survive overwhelming enemy density

### XP Requirements
```javascript
const xpLevels = [5, 13, 23, 35, 50, 70, 95, 125, 160, 200];
// Exponential scaling encourages strategic upgrade choices
```

### Enemy Scaling
- **Spawn Rate**: Increases from 1000ms to 100ms over 30 minutes
- **Enemy Types**: Stronger enemies spawn as time progresses
- **Density**: Up to 500 enemies on screen simultaneously

## 🚧 Future Enhancements

### Planned Features
- **Character Selection**: Different starting characters with unique abilities
- **More Weapons**: Additional weapon types with evolution chains
- **Boss Enemies**: Special enemies at specific time intervals
- **Achievement System**: Unlockable rewards for specific accomplishments
- **Save System**: Persistent progression between runs
- **Sound Effects**: Full audio implementation with dynamic music

### Technical Improvements
- **WebGL Rendering**: Hardware acceleration for better performance
- **Web Workers**: Background processing for complex calculations
- **Progressive Web App**: Offline play and app-like experience
- **Mobile Optimization**: Touch controls and responsive design

## 🎓 Educational Value

This implementation demonstrates:

### Game Development Concepts
- **Game Loop Architecture**: Understanding frame-based updates
- **State Management**: Clean transitions between game states
- **Component Systems**: Modular weapon and enemy behaviors
- **Collision Detection**: Efficient spatial algorithms
- **Performance Optimization**: Managing hundreds of game objects

### JavaScript/Web Technologies
- **Canvas API**: 2D rendering and animation
- **ES6+ Features**: Classes, modules, destructuring
- **Event Handling**: Keyboard input and UI interactions
- **DOM Manipulation**: Dynamic UI updates
- **Performance Monitoring**: FPS tracking and optimization

### Software Architecture
- **Separation of Concerns**: Clean separation between systems
- **Data-Driven Design**: JSON configuration for game balance
- **Scalable Code Structure**: Easy to add new features
- **Error Handling**: Graceful degradation and debugging

## 🤝 Contributing

This game demonstrates the capabilities of the mojomast/gamengine architecture. To contribute:

1. **Add New Weapons**: Implement unique firing patterns and evolutions
2. **Create Enemies**: Design new enemy types with different behaviors  
3. **Improve Performance**: Optimize collision detection and rendering
4. **Enhance UI**: Add more visual polish and effects
5. **Audio Integration**: Add sound effects and music

## 📜 License

Built as a demonstration of game development using modern web technologies and the mojomast/gamengine architecture.

---

**🎮 Ready to survive the vampire apocalypse? [PLAY NOW!](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/9da0757b00c3468f6ba23281593d22fc/2cc55aa7-5290-4718-acff-f7a7a3499350/index.html)**
