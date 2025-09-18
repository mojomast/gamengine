# 🎲 Bingolotro

**Balatro meets Bingo using the Game Engine Framework!**

A strategic fusion that combines traditional bingo mechanics with Balatro's innovative joker system, built using the comprehensive 2D Game Engine Framework.

## 🎮 Game Engine Integration

This game properly utilizes the modular game engine architecture:

### Core Systems Used:
- **GameEngine**: Main orchestrator managing all subsystems
- **Scene Management**: BingolotroGameScene extends the Scene class
- **GameObject System**: BingoCard extends GameObject with component architecture
- **Input Manager**: Keyboard shortcuts and mouse interaction handling
- **Particle System**: Visual effects for marking numbers and joker activation
- **Event-Driven Architecture**: Proper system communication patterns

### Engine Features Demonstrated:
- Scene-based state management
- GameObject lifecycle and rendering
- Particle effects integration
- Input handling with action mapping
- Canvas-based 2D rendering
- Component-based architecture

## 🎯 How to Play

### Basic Gameplay
1. **Start**: Click "Call Number" or press `Spacebar`
2. **Mark Numbers**: Called numbers are automatically marked on your bingo card
3. **Win Patterns**: Complete the current pattern to win the round
4. **Score Points**: Earn points for marked numbers and pattern completion

### 🃏 Joker System (Balatro-Inspired)

Strategic modifiers that enhance gameplay:

#### Available Jokers:
- **Lucky Caller** (50 pts): Next 3 called numbers have chance to appear twice
- **Score Booster** (100 pts): Doubles your score multiplier for 5 numbers  
- **Wild Mark** (40 pts): Automatically marks any unmarked corner

### 🎯 Bingo Patterns

Multiple winning conditions with different score multipliers:
- **Line** (1x): Any row, column, or diagonal
- **Four Corners** (2x): Mark all four corner squares
- **X Pattern** (3x): Complete both diagonals
- **Full Card** (5x): Mark every number on the card

## 🔧 Engine Architecture Implementation

### Game Scene Structure
```javascript
class BingolotroGameScene extends Scene {
    // Proper Scene lifecycle implementation
    init() { /* Initialize game systems */ }
    update(deltaTime) { /* Game logic updates */ }  
    render(ctx) { /* Custom rendering */ }
}
```

### GameObject Integration
```javascript
class BingoCard extends GameObject {
    // Component-based game object
    constructor(engine, x, y) {
        super(x, y);
        this.addTag('bingoCard');
        // Custom bingo card logic
    }
}
```

### Engine Systems Usage
- **Particle Effects**: Visual feedback for number marking and joker activation
- **Input Management**: Keyboard shortcuts and mouse interaction
- **Event System**: Decoupled component communication
- **Resource Management**: Proper cleanup and object lifecycle

## 🚀 Development Patterns

### Following Engine Guidelines:
1. **Scene Management**: Single scene for game state
2. **Component Architecture**: BingoCard as GameObject component
3. **Event-Driven Design**: Proper system communication
4. **Resource Management**: Cleanup and memory management
5. **Engine Integration**: Uses engine's render pipeline and update loop

### Code Organization:
```
bingolotro-project/
├── index.html          # Main game with engine script loading
├── script.js           # Game logic using engine classes  
├── project.json        # Project metadata
├── styles.css          # Additional styling and effects
└── README.md          # This documentation
```

## 🎨 Visual Features

Built on the engine's rendering system:
- **Canvas-based Rendering**: Smooth 2D graphics
- **Particle Effects**: Dynamic visual feedback using engine's ParticleSystem
- **Responsive Design**: Adaptive UI that works with engine's systems
- **Balatro Color Scheme**: Vibrant neon aesthetic

## 🎮 Controls

Following engine input patterns:
- **Spacebar**: Call next number
- **N Key**: Start new game
- **Mouse Click**: Interact with bingo card and jokers
- **UI Buttons**: Alternative control method

## 🔄 Engine Benefits

Using the game engine framework provides:
- **Performance Optimization**: Object pooling and efficient rendering
- **Modular Architecture**: Easy to extend and maintain
- **Professional Patterns**: Industry-standard game development practices
- **Built-in Systems**: Particle effects, input handling, scene management
- **Scalability**: Can easily add new features using engine systems

## 🚀 Running the Game

1. **Engine Dependencies**: Game automatically loads required engine modules
2. **Open**: Navigate to `index.html` in a web browser
3. **Play**: Game initializes using the GameEngine framework
4. **Debug**: Use browser developer tools to see engine debugging info

## 🎯 Strategic Gameplay

The game combines:
- **Resource Management**: Strategic spending of points on jokers
- **Risk/Reward**: Timing joker usage for maximum benefit
- **Pattern Recognition**: Understanding different bingo win conditions
- **Probability**: Managing randomness with strategic modifiers

---

**Built with the Game Engine Framework** - demonstrating proper integration patterns, component architecture, and professional game development practices.

🎮 **Ready to play Bingolotro!** A perfect example of how the game engine enables rapid development of engaging games with minimal boilerplate code.