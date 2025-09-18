
# Vampire Saviors - Fighting Game

A 2D fighting game inspired by Capcom's Darkstalkers/Vampire Savior series, built using the mojomast/gamengine architecture.

## 🎮 Game Overview

Vampire Saviors recreates the fast-paced, supernatural fighting action of the classic Darkstalkers series. Fight as legendary creatures of the night in gothic arenas with fluid combat mechanics, unique special moves, and the iconic regenerating health system.

## ✨ Key Features

### Combat System
- **6-Button Fighter**: Light/Medium/Heavy Punch and Kick system
- **Chain Combo System**: Light → Medium → Heavy, Punch → Kick chains
- **Regenerating Health**: Three-tier health system (Red/White/Green)
  - Red: Current health
  - White: Recoverable damage over time  
  - Green: Temporary damage from chip/blocks
- **Meter System**: Build meter for Enhanced Specials and Super moves
- **Dark Force Mode**: Character-specific power-up abilities
- **Advanced Mechanics**: Guard Cancel, Tech Rolls, Push Blocking, Air Blocking

### Characters (Currently Implemented)
- **Morrigan Aensland**: Succubus with projectiles and flight abilities
- **Demitri Maximoff**: Vampire lord with bat transformations
- **Felicia**: Catgirl with rolling attacks and agility

### Technical Features
- **Precise Hitbox System**: Frame-accurate collision detection
- **Input Buffer**: Forgiving special move inputs
- **Frame Data**: Proper startup, active, and recovery frames
- **Screen Effects**: Dynamic camera, screen shake, particle effects
- **Responsive Design**: Scales to different screen sizes
- **Debug Mode**: Visual hitbox/hurtbox display for development

## 🎯 Controls

### Player 1
- **Movement**: WASD
- **Attacks**: 
  - Light Punch: U | Medium Punch: I | Heavy Punch: O
  - Light Kick: J | Medium Kick: K | Heavy Kick: L
- **Special Moves**: Quarter Circle + Attack button
- **Super Moves**: Double Quarter Circle + Attack button
- **Dark Force**: Press two buttons of same type simultaneously

### Player 2  
- **Movement**: Arrow Keys
- **Attacks**:
  - Light Punch: Numpad 7 | Medium Punch: Numpad 8 | Heavy Punch: Numpad 9
  - Light Kick: Numpad 4 | Medium Kick: Numpad 5 | Heavy Kick: Numpad 6

### Debug Commands
- Open browser console (F12) and type `toggleDebug()` to enable debug mode
- Debug mode shows hitboxes, hurtboxes, and game state information

## 🏗️ Architecture

Built on the mojomast/gamengine framework with the following components:

### Core Systems
- **GameEngine**: Main game loop, scene management, state handling
- **InputManager**: Keyboard input processing with buffer system
- **Fighter**: Character logic with state machines and combat systems
- **EffectsManager**: Visual effects, particles, and screen effects
- **AudioManager**: Sound effects and music (placeholder implementation)
- **Stage**: Background rendering and environmental elements

### Game States
- **Menu**: Main menu with options
- **Fighting**: Active combat between two fighters
- **Character Select**: Choose your fighter (planned)
- **Options**: Game settings (planned)

### Fighter States
- **Idle**: Standing neutral
- **Walking**: Ground movement
- **Jumping**: Airborne movement
- **Attacking**: Performing normal attacks
- **Special**: Executing special moves
- **Blocking**: Defensive state
- **Hitstun**: Stunned after being hit
- **Blockstun**: Recovery after blocking
- **KO**: Knocked out state

## 📁 File Structure

```
vampire-saviors/
├── vampire-saviors-index.html    # Main HTML file with UI
├── vampire-saviors-game.js       # Complete game implementation
└── README.md                     # This file
```

## 🚀 Getting Started

1. **Clone or download** the game files
2. **Open** `vampire-saviors-index.html` in a modern web browser
3. **Click "START BATTLE"** to begin fighting
4. **Use the controls** listed above to fight

### Development Setup
1. Ensure you have the mojomast/gamengine repository available
2. The game currently runs standalone but can be integrated with the full engine
3. For development, enable debug mode with `toggleDebug()` in browser console

## 🎨 Visual Style

The game captures the gothic horror aesthetic of Vampire Savior with:
- **Dark Color Palette**: Deep purples, blues, and blacks
- **Gothic Architecture**: Castle backgrounds with stone pillars
- **Supernatural Effects**: Glowing particles and energy effects
- **Retro Fonts**: Pixel-perfect text rendering
- **Screen Effects**: Dynamic lighting and atmosphere

## ⚔️ Combat Mechanics Deep Dive

### Health System
The unique three-tier health system adds strategic depth:
- Taking damage fills the "white damage" bar
- White damage slowly regenerates when not taking hits
- Blocking causes chip damage that goes to white damage
- Only red damage is permanent until recovery

### Combo System
- **Chain Rules**: Can only go from weaker to stronger attacks
- **Combo Decay**: Damage scaling reduces combo damage over time
- **Combo Counter**: Tracks hit count and total damage
- **Combo Timer**: Limited time to continue combos

### Special Moves
Each character has unique special moves with specific inputs:
- **Quarter Circle Forward + Punch**: Projectile attacks
- **Dragon Punch Motion + Punch**: Anti-air uppercuts  
- **Quarter Circle Back + Kick**: Movement/utility moves
- **Double Quarter Circle + Attack**: Super moves (requires meter)

### Dark Force System
Each character has unique Dark Force abilities:
- **Morrigan**: Creates shadow clone for double attacks
- **Demitri**: Vampire transformation with enhanced abilities
- **Felicia**: Helper cats provide additional attacks

## 🔧 Technical Implementation

### Engine Integration
Built using mojomast/gamengine patterns:
- **Modular ES6+ Architecture**: Clean, maintainable code structure  
- **Component-Based Design**: Reusable game systems
- **Scene Management**: Smooth transitions between game states
- **Performance Monitoring**: Built-in FPS and performance tracking
- **Mobile Support**: Touch-friendly responsive design

### Collision Detection
Implements precise fighting game collision:
- **Hitboxes**: Define where attacks can hit
- **Hurtboxes**: Define vulnerable areas on characters
- **Frame-Perfect Timing**: Attacks activate/deactivate on specific frames
- **Priority System**: Handles simultaneous attack resolution

### Animation System
- **State-Based Animation**: Different animations per character state
- **Frame Timing**: 60 FPS with consistent frame data
- **Sprite Flipping**: Characters always face each other
- **Effect Integration**: Particles sync with combat actions

## 🎵 Audio Design

Audio system ready for:
- **Sound Effects**: Hit sounds, block sounds, special move audio
- **Character Voices**: Attack calls and victory quotes
- **Background Music**: Gothic orchestral tracks
- **Dynamic Audio**: Volume changes based on action intensity

## 🚧 Future Enhancements

### Planned Features
- **Character Select Screen**: Choose from full roster
- **Additional Characters**: Jon Talbain, Sasquatch, Lord Raptor, etc.
- **Story Mode**: Single-player campaign
- **Training Mode**: Practice combos and techniques
- **Online Multiplayer**: Network play support
- **Tournament Mode**: Bracket-style competitions

### Technical Improvements
- **Sprite Animation**: Replace placeholder rectangles with actual sprites
- **Sound Integration**: Add complete audio system
- **AI Opponents**: Computer-controlled fighters
- **Replay System**: Save and review matches
- **Frame Data Display**: In-game move information

### Advanced Mechanics
- **Roman Canceling**: Cancel moves into other moves
- **Guard Impact**: Counter-attack system
- **Throw Escapes**: Technical throw breaks
- **Air Dashing**: Enhanced aerial mobility
- **Install Supers**: Temporary character transformations

## 🐛 Known Issues

- Character sprites are placeholder rectangles
- Audio system is placeholder (no actual sounds)
- Single stage only
- Limited character roster
- No AI opponents yet

## 🤝 Contributing

This project demonstrates fighting game development using the mojomast/gamengine framework. Contributions welcome for:

- Additional characters and moves
- Sprite artwork and animations  
- Sound effects and music
- New stages and backgrounds
- Bug fixes and optimizations
- Documentation improvements

## 📜 License

Built as a demonstration of the mojomast/gamengine capabilities. 
Original Darkstalkers/Vampire Savior © Capcom.

## 🎮 Play Now!

Open `vampire-saviors-index.html` in your browser and experience the supernatural fighting action!
