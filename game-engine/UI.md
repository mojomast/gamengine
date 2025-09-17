# 🕹️ UI Components Documentation

## User Interface Architecture

### Component-Based UI System
The game engine uses a modular UI system built on HTML5 Canvas with additional HTML overlays for complex interactions.

## Core UI Components

### HUD (Heads-Up Display)
**Location**: Main game loop rendering
**Components**: Health bars, energy indicators, statistics display

#### Health Bar Component
```javascript
// Implementation: player.renderHealthBar(ctx)
Dimensions: 40px × 6px
Position: Above player character
Colors: 
  - Green (>50% health): #00f593
  - Yellow (25-50% health): #ffd700  
  - Red (<25% health): #ff206e
Background: rgba(0, 0, 0, 0.7) with 1px border
```

#### Energy Bar Component
```javascript
// Implementation: player.renderEnergyBar(ctx)
Dimensions: 40px × 4px
Position: Above health bar
Color: #05d9e8 (cyan)
Background: rgba(0, 0, 0, 0.5) with 1px border
Updates: Real-time energy tracking
```

### Statistics Panel
**Location**: Top-left corner of canvas
**Purpose**: Real-time game state monitoring

```javascript
Display Elements:
- Score: Current point total
- Clicks: User interaction counter
- Particles: Active particle count
- Ripples: Active ripple effect count
- Player Position: Real-time coordinates (x, y)
- Health/Energy: Numerical values
- Control Status: Input state indicators
```

### Project Management Toolbar
**Location**: Top-right corner (HTML overlay)
**Class**: `.pm-toolbar`

#### Toolbar Buttons
```javascript
Components:
1. 🎮 Manager Button
   - Function: openProjectManager()
   - Opens: Project management interface
   - Target: ../project-manager.html

2. 💾 Save Button  
   - Function: saveCurrentProject()
   - Action: Complete game state preservation
   - Storage: localStorage with enhanced metadata

3. 🔙 Restore Button
   - Function: showRestoreOptions()
   - Interface: Dropdown restoration panel
   - Options: Time-sorted save history

4. ⚡ New Button
   - Function: quickNewProject()
   - Workflow: Auto-save → Open manager
   - Purpose: Streamlined project creation
```

### Notification System
**Class**: `.pm-notification`
**Purpose**: User feedback and system status

#### Notification Types
```javascript
Success Notifications:
- Background: rgba(0, 245, 147, 0.95)
- Usage: Save confirmations, successful operations
- Animation: Slide-in from right, auto-dismiss

Error Notifications:
- Background: rgba(255, 32, 110, 0.95)
- Usage: Operation failures, validation errors
- Animation: Slide-in from right, manual dismiss

Info Notifications:
- Background: rgba(5, 217, 232, 0.95)
- Usage: System information, tips
- Animation: Slide-in from right, auto-dismiss
```

### Restoration Panel
**Class**: `.pm-restore-panel`
**Visibility**: Toggle-based display

#### Panel Features
```javascript
Layout:
- Fixed position: top-right, below toolbar
- Max dimensions: 400px × 300px
- Overflow: Vertical scrolling for many saves
- Background: rgba(0, 0, 0, 0.95) with neon border

Content:
- Header: "🔙 Restore Options"
- Save List: Clickable restore items
- Timestamps: Human-readable save times
- Descriptions: Save reason/context
- Actions: Restore and close buttons
```

## UI Styling System

### CSS Architecture
**Approach**: Inline styles for canvas, CSS classes for HTML overlays
**Theme**: Neon cyberpunk aesthetic with transparency effects

#### Key Style Classes
```css
.pm-toolbar {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid #00f593;
}

.pm-btn {
    background: linear-gradient(45deg, #ff206e, #05d9e8);
    border: none;
    color: white;
    transition: all 0.3s ease;
}

.pm-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(255, 32, 110, 0.5);
}
```

### Responsive Design
```css
@media (max-width: 768px) {
    .pm-toolbar {
        flex-direction: column;
        right: 5px;
        top: 5px;
    }
    
    .pm-btn {
        font-size: 10px;
        padding: 6px 8px;
    }
}
```

## Input Integration

### UI Input Handling
**Method**: Event delegation and direct event listeners
**Coverage**: Click events, hover states, keyboard shortcuts

#### Button Event Binding
```javascript
// Toolbar button events
document.getElementById('pmOpenManager').addEventListener('click', openProjectManager);
document.getElementById('pmSaveProject').addEventListener('click', saveCurrentProject);
document.getElementById('pmRestoreProject').addEventListener('click', showRestoreOptions);
document.getElementById('pmNewProject').addEventListener('click', quickNewProject);
```

### Keyboard Integration
```javascript
// UI-specific keyboard shortcuts (future implementation)
Planned Shortcuts:
- Ctrl+S: Quick save
- Ctrl+O: Open restoration panel
- Ctrl+N: New project workflow
- F1: Help/documentation
```

## Animation and Transitions

### UI Animations
**Library**: Pure CSS transitions with JavaScript triggers
**Performance**: Hardware-accelerated transforms where possible

#### Notification Animations
```css
/* Slide-in animation */
.pm-notification {
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.pm-notification.show {
    transform: translateX(0);
}
```

#### Button Interactions
```css
/* Hover scaling */
.pm-btn:hover {
    transform: scale(1.05);
}

/* Click feedback */
.pm-btn:active {
    transform: scale(0.95);
}
```

## Accessibility Features

### Current Implementation
- High contrast neon color scheme
- Clear visual hierarchy
- Readable font sizes
- Descriptive button text

### Planned Enhancements
- Keyboard navigation support
- Screen reader compatibility
- ARIA labels for complex UI elements
- Alternative input methods

## UI Performance Optimization

### Best Practices
- Minimize DOM manipulation
- Use CSS transforms for animations
- Implement event delegation
- Cache frequently accessed elements
- Lazy load complex UI components

### Memory Management
```javascript
// UI cleanup on game restart
function cleanupUI() {
    // Remove dynamic elements
    document.querySelectorAll('.pm-notification').forEach(n => n.remove());
    
    // Reset UI state
    closeRestorePanel();
    
    // Clear event listeners if needed
}
```

## Integration with Game Systems

### Canvas UI Integration
**Method**: Coordinate game canvas rendering with HTML overlays
**Synchronization**: Z-index management and positioning

### Game State Reflection
```javascript
// UI updates based on game state
if (player.isMoving) {
    // Update movement indicators
}

if (player.health < 25) {
    // Flash health warning
}

if (particles.length > 100) {
    // Show performance warning
}
```

## Future UI Enhancements

### Planned Components
- **Settings Panel**: Game configuration interface
- **Help System**: Interactive tutorial overlays
- **Inventory UI**: Item management system
- **Dialog System**: NPC conversation interface
- **Map Interface**: Level navigation tools

### Advanced Features
- **UI Themes**: Customizable color schemes
- **Layout Editor**: Drag-and-drop UI customization
- **Widgets**: Modular UI components
- **Data Binding**: Reactive UI updates

---

*UI documentation should be updated when new components are added or existing ones are modified.*
