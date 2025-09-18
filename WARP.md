# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a game engine development project called "slop" that provides a fully implemented, comprehensive framework for building web-based games. The project includes:

- **Multiple HTML-based games/demos**: Poker Doom, interactive game engines, setup utilities
- **Complete game engine implementation** with modular, production-ready systems
- **Advanced features**: Performance monitoring, mobile optimizations, accessibility support, theming system
- **Project management tools** for enhanced save/load functionality with versioning
- **Comprehensive source code** alongside rich documentation covering all engine systems

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
- **Input Manager**: Advanced unified input handling with gestures, device orientation, virtual gamepad, and input recording (keyboard, mouse, touch)
- **Renderer**: Enhanced canvas-based 2D rendering system with batch rendering optimization
- **Audio Manager**: Web Audio API integration with spatial audio support
- **BatchRenderer**: Optimized batch rendering for improved performance
- **ValidationHelpers**: Data validation utilities for game state integrity
- **ResourceManager**: Centralized resource loading and caching system
- **ObjectPool**: Memory-efficient object reuse system for performance

#### Game Systems (Modular)
- **Character System**: Player stats, leveling, progression with enhanced stat management (`game-engine/docs/CHARACTER-STATS.md`)
- **Dialog System**: Conversation trees and NPC interactions with branching narratives (`game-engine/docs/DIALOG-SYSTEM.md`)
- **Inventory Management**: Items, equipment, crafting with advanced item systems (`game-engine/docs/INVENTORY-MANAGEMENT.md`)
- **Powers & Abilities**: Spells, skills, cooldowns with ability progression (`game-engine/docs/POWERS-ABILITIES.md`)
- **Animation System**: Advanced timelines, keyframe animations, sprite animators, visual effects, tweens, particles (`game-engine/docs/ANIMATION-SYSTEM.md`)
- **UI Components**: Buttons, panels, HUD elements with theming and accessibility support (`game-engine/docs/UI-ELEMENTS.md`)
- **Performance Monitoring**: Built-in system performance tracking and optimization
- **Mobile Optimizations**: Touch controls, adaptive frame rate, power saving modes
- **Accessibility Features**: ARIA labels, screen reader support, keyboard navigation
- **Enhanced Save/Load System**: Comprehensive state preservation with versioning

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
├── .gitignore
├── index.html                 # Main Poker Doom game
├── project-manager.html       # Project management interface
├── setup.html                # Setup utilities
├── setup-neon.html           # Alternative setup
├── 1.html                    # Additional demo
├── improvements.md           # Improvement notes
├── mobile-test.js            # Mobile testing utilities
├── WARP.md                   # WARP development guide
├── js/                       # JavaScript modules
│   ├── project-manager.js    # Project management logic
│   ├── project-preservation.js  # Save/load system
│   ├── project-workflow.js   # Development workflow
│   └── project-integration.js   # System integration
├── game-engine/              # Complete engine implementation and documentation
│   ├── index.html            # Engine demo interface
│   ├── agent.md              # Agent system documentation
│   ├── CONTROLS-AND-FEATURES.md # Controls and features overview
│   ├── GRAPHICS.md           # Graphics system documentation
│   ├── INTEGRATION.md        # System integration guide
│   ├── PROJECT_MANAGEMENT.md # Save system docs
│   ├── SCHEMA.MD             # Data schema definitions
│   ├── server-setup.md       # Server setup instructions
│   ├── UI.md                 # UI system overview
│   ├── README.md             # Engine overview & examples
│   ├── MASTER-ARCHITECTURE.md # Integration guide
│   ├── docs/                 # System-specific documentation
│   │   ├── ANIMATION-SYSTEM.md
│   │   ├── CHARACTER-STATS.md
│   │   ├── DIALOG-SYSTEM.md
│   │   ├── INVENTORY-MANAGEMENT.md
│   │   ├── POWERS-ABILITIES.md
│   │   ├── SYSTEM-INTEGRATION-EXAMPLES.md
│   │   └── UI-ELEMENTS.md
│   ├── examples/             # Example implementations
│   │   └── NeonClickerBattle.js
│   └── src/                  # Engine source code
│       ├── core/             # Core engine components
│       │   ├── AbilityManager.js
│       │   ├── AudioManager.js
│       │   ├── BatchRenderer.js
│       │   ├── Character.js
│       │   ├── EventBus.js
│       │   ├── GameEngine.js
│       │   ├── GameObject.js
│       │   ├── InputManager.js
│       │   ├── InventoryManager.js
│       │   ├── ObjectPool.js
│       │   ├── Renderer.js
│       │   ├── ResourceManager.js
│       │   ├── Scene.js
│       │   └── ValidationHelpers.js
│       ├── effects/          # Visual effects systems
│       │   ├── AnimationManager.js
│       │   └── ParticleSystem.js
│       └── ui/               # UI management systems
│           ├── DialogManager.js
│           └── UIManager.js
├── shared/                   # Shared utilities and resources
└── *-project/               # Saved project data
    ├── index.html           # Project HTML
    ├── project.json         # Project metadata
    ├── script.js            # Project code
    └── styles.css           # Project styles
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
- Engine uses advanced object pooling (ObjectPool.js) for particles and temporary objects
- Adaptive frame rate management with power saving modes for mobile devices
- Comprehensive performance monitoring system tracks execution times and memory usage
- Systems can be disabled independently for performance tuning
- Resource management with centralized loading and caching (ResourceManager.js)
- Batch rendering optimization for improved graphics performance (BatchRenderer.js)

#### Mobile and Accessibility Development
- Touch-optimized controls with gesture recognition and virtual gamepad support
- Device orientation and motion input handling for immersive experiences
- Responsive UI with adaptive layouts and accessibility features
- ARIA labels and screen reader support for inclusive game design
- Keyboard navigation and focus management throughout the interface
- Mobile-specific optimizations including reduced power consumption and battery management

## Important Context

### Project Philosophy
This is a **comprehensive game engine framework** designed for:
- **Rapid prototyping** of web games
- **Educational purposes** (learning game architecture)
- **Modular system design** (use only what you need)
- **Integration examples** (how systems work together)

### Browser Compatibility
- Modern ES6+ JavaScript with implemented source code (no transpilation)
- Canvas 2D API for advanced 2D rendering with batch optimization
- Web Audio API for spatial audio and sound effects
- LocalStorage with enhanced save/load system for comprehensive state preservation
- Touch, pointer, and gesture events for mobile interaction
- Device orientation and motion APIs for immersive controls
- Accessibility APIs (ARIA, screen readers) for inclusive design

### Documentation Strategy
The project combines comprehensive source code implementation with extensive documentation:
- Each system has both implemented source code and dedicated documentation
- Integration examples demonstrate real system combinations with working code
- Architecture guides explain design decisions backed by implemented patterns
- Advanced features like performance monitoring, accessibility, and mobile optimizations are fully documented
- Code examples in both documentation and working engine source demonstrate proper usage

This codebase serves as both a working game engine and an educational resource for understanding game architecture patterns.