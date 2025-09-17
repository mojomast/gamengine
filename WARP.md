# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a game engine development project called "slop" that provides a comprehensive framework for building web-based games. The project includes:

- **Multiple HTML-based games/demos**: Poker Doom, interactive game engines, setup utilities
- **Complete game engine architecture** with modular systems
- **Project management tools** for save/load functionality
- **Rich documentation** covering all engine systems

## Common Development Commands

### Basic Development
```bash
# Serve the project locally (use any local server)
python -m http.server 8000
# or
npx serve .
# or  
php -S localhost:8000

# Open main game
# Navigate to http://localhost:8000/index.html

# Open project manager
# Navigate to http://localhost:8000/project-manager.html

# Open setup utilities
# Navigate to http://localhost:8000/setup.html
```

### File Management
```bash
# View project structure
ls -la
ls game-engine/
ls js/

# Check documentation
ls game-engine/docs/
cat game-engine/README.md
```

### Testing & Development
- No formal test suite - this is a demo/prototype project
- Testing is done by opening HTML files in browser
- Use browser developer tools for debugging
- JavaScript console provides engine debugging info

## Architecture & Code Structure

### High-Level Architecture

The project follows a **modular game engine architecture** with these key systems:

#### Core Engine Systems
- **GameEngine**: Main orchestrator class that manages all subsystems
- **Scene Management**: Handle different game states (menu, gameplay, pause)
- **Input Manager**: Unified input handling (keyboard, mouse, touch)
- **Renderer**: Canvas-based 2D rendering system
- **Audio Manager**: Web Audio API integration

#### Game Systems (Modular)
- **Character System**: Player stats, leveling, progression (`game-engine/docs/CHARACTER-STATS.md`)
- **Dialog System**: Conversation trees and NPC interactions (`game-engine/docs/DIALOG-SYSTEM.md`)
- **Inventory Management**: Items, equipment, crafting (`game-engine/docs/INVENTORY-MANAGEMENT.md`)  
- **Powers & Abilities**: Spells, skills, cooldowns (`game-engine/docs/POWERS-ABILITIES.md`)
- **Animation System**: Tweens, particles, effects (`game-engine/docs/ANIMATION-SYSTEM.md`)
- **UI Components**: Buttons, panels, HUD elements (`game-engine/docs/UI-ELEMENTS.md`)

#### Integration Pattern
All systems communicate through an **event-driven architecture**:
```javascript
// Systems don't directly depend on each other
gameEngine.characterManager.on('level-up', (data) => {
    gameEngine.abilityManager.checkNewAbilities(data.character);
    gameEngine.uiManager.showLevelUpNotification(data);
});
```

### File Organization

```
slop/
├── index.html                 # Main Poker Doom game
├── project-manager.html       # Project management interface  
├── setup.html                # Setup utilities
├── setup-neon.html           # Alternative setup
├── 1.html                    # Additional demo
├── js/                       # JavaScript modules
│   ├── project-manager.js    # Project management logic
│   ├── project-preservation.js  # Save/load system
│   ├── project-workflow.js   # Development workflow
│   └── project-integration.js   # System integration
├── game-engine/              # Complete engine documentation
│   ├── README.md            # Engine overview & examples
│   ├── PROJECT_MANAGEMENT.md   # Save system docs
│   ├── MASTER-ARCHITECTURE.md # Integration guide  
│   ├── docs/                # System-specific documentation
│   │   ├── CHARACTER-STATS.md
│   │   ├── DIALOG-SYSTEM.md
│   │   ├── INVENTORY-MANAGEMENT.md
│   │   ├── POWERS-ABILITIES.md
│   │   ├── ANIMATION-SYSTEM.md
│   │   └── UI-ELEMENTS.md
│   └── examples/
│       └── NeonClickerBattle.js
└── *-project/               # Saved project data
    ├── project.json        # Project metadata
    └── script.js          # Project code
```

### Key Architectural Patterns

#### 1. Component-Based Game Objects
```javascript
class Player extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.addComponent('health', new HealthComponent(100));
        this.addComponent('inventory', new InventoryComponent());
        this.addTag('player');
    }
}
```

#### 2. Event-Driven System Communication
```javascript
// Character progression affects multiple systems
gameEngine.characterManager.on('stat-changed', (data) => {
    gameEngine.abilityManager.recalculatePower(data.character);
    gameEngine.inventoryManager.updateCarryCapacity(data.character);
});
```

#### 3. Scene-Based State Management
```javascript
// Different scenes for different game states
engine.addScene('menu', new MainMenuScene(engine));
engine.addScene('game', new GameplayScene(engine)); 
engine.addScene('pause', new PauseScene(engine));
engine.switchScene('game');
```

#### 4. Template-Based Project System
The project manager uses templates for different game types:
- **Blank Project**: Empty starting point
- **Poker Game**: Card-based mechanics (like current index.html)
- **Full Game Engine**: All systems enabled
- **Platformer**: Physics-based movement
- **RPG**: Character progression focus

### System Integration Examples

#### Combat System Integration
```javascript
// Combines Character + Abilities + Inventory + UI + Animation
function executeAttack(attacker, target, weapon) {
    // Character system calculates damage
    const damage = attacker.combat.calculateDamage(weapon, target);
    
    // Apply to target character
    target.takeDamage(damage);
    
    // Animation system shows attack
    gameEngine.animationManager.playAnimation(attacker, 'attack_' + weapon.type);
    
    // UI system shows feedback
    gameEngine.uiManager.showDamageNumber(target.position, damage);
    
    // Audio system plays sound
    gameEngine.audioManager.playSound(weapon.hitSound);
}
```

## Development Workflow

### Project Management Features
This project includes a sophisticated project management system:

#### Keyboard Shortcuts
- **F9**: Open Project Manager window
- **F10**: Save/preserve current project state  
- **F8**: Show restore options for saved projects
- **T**: Test keyboard events (in browser console)

#### Save System
The project uses an advanced save system that captures:
- Complete HTML document state
- Game engine configuration
- Character data and progression
- UI state and settings
- Active effects and animations

#### Template System
New projects can be created from templates via the Project Manager interface, each with:
- Pre-configured game systems
- Example code and assets
- Documentation starters
- Recommended architecture patterns

### Development Best Practices

#### Adding New Game Systems
1. Create system class in appropriate module
2. Integrate with GameEngine via event system  
3. Document system API and integration points
4. Add system to template configurations
5. Update MASTER-ARCHITECTURE.md with integration examples

#### Working with Existing Systems
- **Character Stats**: Use `gameEngine.characterManager` for player data
- **Dialog Trees**: Define in JSON, load via `gameEngine.dialogManager`
- **Items/Equipment**: Manage through `gameEngine.inventoryManager`
- **Abilities**: Register with `gameEngine.abilityManager`
- **Animations**: Control via `gameEngine.animationManager`
- **UI Elements**: Create components with `gameEngine.uiManager`

#### Performance Considerations
- Engine uses object pooling for particles and temporary objects
- Frame rate management maintains consistent 60 FPS with delta time
- Systems can be disabled independently for performance tuning
- Built-in performance monitoring tracks system execution times

## Important Context

### Project Philosophy
This is a **comprehensive game engine framework** designed for:
- **Rapid prototyping** of web games
- **Educational purposes** (learning game architecture)
- **Modular system design** (use only what you need)
- **Integration examples** (how systems work together)

### Browser Compatibility
- Modern ES6+ JavaScript (no transpilation)
- Canvas 2D API for rendering
- Web Audio API for sound
- LocalStorage for save data
- Touch and pointer events for mobile

### Documentation Strategy
The project heavily emphasizes documentation:
- Each system has dedicated documentation
- Integration examples show system combinations
- Architecture guides explain design decisions
- Code examples demonstrate proper usage patterns

This codebase serves as both a working game engine and an educational resource for understanding game architecture patterns.