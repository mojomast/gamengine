# Slopvania - A Metroidvania Adventure

A side-scrolling Metroidvania-style game built with the custom game engine from the `gamengine` project. Features branching paths, ability-gated progression, and a comprehensive save system.

## 🎮 Game Features

### Core Gameplay
- **Side-scrolling platformer** with physics-based movement
- **Metroidvania progression** - unlock abilities to access new areas
- **Branching map design** with multiple distinct zones
- **Ability-gated exploration** - areas locked until you get the right powers

### Abilities & Upgrades
- **Jump** (default) - Basic vertical movement
- **Dash** - High-speed horizontal movement through gaps
- **Wall Jump** - Scale vertical walls by bouncing between them
- **Double Jump** - Extended air mobility for high platforms

### Game Systems
- **Complete save/load system** with auto-save and manual saves
- **Mini-map** showing explored areas, items, and player location
- **Progress tracking** with completion percentage
- **Area detection** with dynamic area names
- **Play time tracking** and statistics

## 🕹️ Controls

### Movement
- **Arrow Keys** or **WASD** - Move left/right
- **Space** or **Up Arrow/W** - Jump (double jump when unlocked)
- **Shift** - Dash (when unlocked)

### Interface
- **M** - Toggle mini-map visibility
- **F5** - Quick save
- **F9** - Open save menu (save/load/export/import)
- **E** - Interact (reserved for future use)

## 🚀 How to Run

### Requirements
- Modern web browser with ES6 module support
- Local web server (due to CORS restrictions with ES6 modules)

### Setup
1. Navigate to the `slopvania-project` directory
2. Start a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8000
```

3. Open your browser and go to `http://localhost:8000`

### Development
The game follows the architecture patterns from the main game engine project. See `../game-engine/warp.md` for detailed development guidelines.

## 🗺️ Game World

### Starting Area
- Tutorial space with basic jumping challenges
- Learn basic movement mechanics
- Safe area to get comfortable with controls

### Dash Chamber
- First upgrade area requiring basic platforming
- Large gaps that can only be crossed with dash ability
- Vertical shaft with spaced platforms

### Wall Jump Ruins
- Tall vertical chambers with narrow walls
- Requires dash ability to reach the area
- Small platforms between walls for precise wall-jumping

### Double Jump Peaks
- Highest area with maximum vertical challenges
- Requires wall jump to access
- Wide gaps needing double jump to cross

## 💾 Save System

### Features
- **Auto-save** every 2 minutes during gameplay
- **Quick save** with F5 hotkey
- **Manual save/load** via save menu (F9)
- **Export/Import** saves for backup or sharing
- **Progress tracking** with completion percentage
- **Version compatibility** checking

### Save Data Includes
- Player position and stats
- All unlocked abilities
- Visited areas and exploration progress
- Collected items
- Play time and game statistics
- UI preferences

## 🎨 Graphics & Design

### Visual Style
- **Neon cyberpunk aesthetic** with bright accent colors
- **Pixel art rendering** for crisp, retro look
- **SVG-based sprites** for scalable graphics
- **Procedural particle effects** for visual feedback

### Color Palette
- Primary: Hot Pink (`#ff206e`)
- Secondary: Neon Green (`#00f593`)
- Accent: Gold (`#ffd700`)
- Background: Dark Blues (`#001122`, `#112233`)

### UI Elements
- **Health bar** with gradient fill
- **Ability indicators** showing unlocked powers
- **Completion progress bar** with percentage
- **Mini-map** with real-time world representation
- **Save notifications** with smooth animations

## 🏗️ Technical Architecture

### Game Engine Integration
Built on the modular game engine architecture following these patterns:

- **Component-based GameObjects** for player and world elements
- **Scene management** for different game states
- **Event-driven communication** between systems
- **Physics system** with gravity, collision, and movement
- **Input management** with action mapping
- **Resource management** for efficient asset loading

### Key Classes
- **Player** - Main character with physics and abilities
- **World** - Tile-based map system with item placement
- **GameScene** - Main gameplay scene managing all objects
- **SlopvaniaSaveSystem** - Comprehensive save/load functionality

### Performance Optimizations
- **Tile-based collision** detection for efficiency
- **Viewport culling** - only render visible world sections
- **Mini-map sampling** - reduced resolution for performance
- **Component pooling** for frequently created/destroyed objects

## 🔧 Customization & Modding

### Extending the Game
The modular architecture makes it easy to add new features:

1. **New Abilities** - Add to the abilities object and implement in Player class
2. **New Areas** - Extend the World class with new generation functions  
3. **New Items** - Add to the items array with custom behavior
4. **Save Data** - Extend SlopvaniaSaveSystem for new data types

### Configuration
Key game constants can be modified at the top of `index.html`:

```javascript
const WORLD_WIDTH = 4800;    // World size
const WORLD_HEIGHT = 2400;   
const TILE_SIZE = 32;        // Tile resolution
const GRAVITY = 800;         // Physics constants
const JUMP_FORCE = -400;
const MOVE_SPEED = 200;
```

## 🐛 Troubleshooting

### Common Issues
1. **Game won't load** - Ensure you're running from a web server, not file:// protocol
2. **Save system errors** - Check browser console for localStorage issues
3. **Performance problems** - Try reducing WORLD_WIDTH/HEIGHT or TILE_SIZE
4. **Input not working** - Make sure the game canvas has focus

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Most features (some ES6 modules may need polyfills)
- Mobile: Basic support (touch controls automatically enabled)

## 📈 Future Enhancements

### Planned Features
- **Enemies and combat** system
- **More abilities** (climb, swim, glide)
- **Boss battles** at the end of each area
- **Collectible items** and power-ups
- **Achievement system**
- **Multiple save slots**
- **Settings menu** for audio/video options

### Advanced Features
- **Procedural world generation**
- **Online leaderboards** for completion times
- **Level editor** for custom maps
- **Multiplayer racing** modes

## 🎵 Credits

- **Game Engine**: Custom engine from `gamengine` project
- **Architecture**: Based on warp.md development guidelines
- **Graphics**: SVG-based pixel art sprites
- **Design**: Inspired by classic Metroidvania games

---

🎮 **Have fun exploring Slopvania!** 🎮

The world is full of secrets and challenges. Can you unlock all abilities and reach 100% completion?