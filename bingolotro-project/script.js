// Bingolotro - Balatro meets Bingo
// Standalone implementation following engine patterns

// Simple particle class for visual effects
class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * (options.speed || 200);
        this.vy = (Math.random() - 0.5) * (options.speed || 200);
        this.life = options.life || 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * (options.size || 5) + 2;
        this.color = options.colors ? 
            options.colors[Math.floor(Math.random() * options.colors.length)] : 
            `hsl(${Math.random() * 360}, 70%, 60%)`;
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= this.decay;
        this.vx *= 0.98;
        this.vy *= 0.98;
        return this.life > 0;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Particle system
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    createExplosion(x, y, options = {}) {
        const count = options.count || 10;
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, options));
        }
    }
    
    update(dt) {
        this.particles = this.particles.filter(particle => particle.update(dt));
    }
    
    render(ctx) {
        this.particles.forEach(particle => particle.render(ctx));
    }
}

// Game Data Classes
class BingoNumber {
    constructor(value, letter) {
        this.value = value;
        this.letter = letter;
        this.called = false;
    }
    
    getDisplayString() {
        return `${this.letter}${this.value}`;
    }
}

class BingoCard {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.grid = [];
        this.marked = new Set();
        this.cellSize = 50;
        this.generateCard();
    }
    
    generateCard() {
        const ranges = {
            'B': [1, 15], 'I': [16, 30], 'N': [31, 45], 'G': [46, 60], 'O': [61, 75]
        };
        
        const letters = ['B', 'I', 'N', 'G', 'O'];
        this.grid = [];
        
        for (let col = 0; col < 5; col++) {
            const letter = letters[col];
            const [min, max] = ranges[letter];
            const colNumbers = [];
            const available = [];
            
            for (let i = min; i <= max; i++) {
                available.push(i);
            }
            
            for (let row = 0; row < 5; row++) {
                if (col === 2 && row === 2) {
                    colNumbers.push(new BingoNumber(0, 'FREE'));
                } else {
                    const randomIndex = Math.floor(Math.random() * available.length);
                    const number = available.splice(randomIndex, 1)[0];
                    colNumbers.push(new BingoNumber(number, letter));
                }
            }
            this.grid.push(colNumbers);
        }
        
        // Mark free space
        this.marked.add('2,2');
    }
    
    markNumber(number) {
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 5; row++) {
                const cell = this.grid[col][row];
                if (cell.value === number && !this.isMarked(col, row)) {
                    this.marked.add(`${col},${row}`);
                    return { col, row, letter: cell.letter };
                }
            }
        }
        return null;
    }
    
    isMarked(col, row) {
        return this.marked.has(`${col},${row}`);
    }
    
    checkPattern(pattern) {
        return pattern.check(this);
    }
    
    getNumber(col, row) {
        return this.grid[col][row];
    }
    
    render(ctx) {
        // Draw header
        const letters = ['B', 'I', 'N', 'G', 'O'];
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 16px Courier New';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(this.x + i * this.cellSize, this.y - 30, this.cellSize, 25);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText(letters[i], this.x + i * this.cellSize + this.cellSize/2, this.y - 10);
            ctx.fillStyle = '#e94560';
        }
        
        // Draw grid
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 5; row++) {
                const cellX = this.x + col * this.cellSize;
                const cellY = this.y + row * this.cellSize;
                const number = this.grid[col][row];
                
                // Cell background
                if (this.isMarked(col, row)) {
                    ctx.fillStyle = number.value === 0 ? '#8e44ad' : '#27ae60';
                } else {
                    ctx.fillStyle = '#f39c12';
                }
                ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Cell border
                ctx.strokeStyle = '#1a1a2e';
                ctx.lineWidth = 2;
                ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Cell text
                ctx.fillStyle = this.isMarked(col, row) ? 'white' : '#1a1a2e';
                ctx.font = number.value === 0 ? 'bold 10px Courier New' : 'bold 14px Courier New';
                ctx.textAlign = 'center';
                const text = number.value === 0 ? 'FREE' : number.value.toString();
                ctx.fillText(text, cellX + this.cellSize/2, cellY + this.cellSize/2 + 5);
            }
        }
    }
    
    handleClick(mouseX, mouseY) {
        if (mouseX >= this.x && mouseX < this.x + this.cellSize * 5 &&
            mouseY >= this.y && mouseY < this.y + this.cellSize * 5) {
            
            const col = Math.floor((mouseX - this.x) / this.cellSize);
            const row = Math.floor((mouseY - this.y) / this.cellSize);
            
            if (col >= 0 && col < 5 && row >= 0 && row < 5) {
                const number = this.grid[col][row];
                if (number.called && !this.isMarked(col, row)) {
                    this.marked.add(`${col},${row}`);
                    return { col, row, number: number.value };
                }
            }
        }
        return null;
    }
}

class BingoPattern {
    constructor(name, checkFunction, scoreMultiplier = 1) {
        this.name = name;
        this.check = checkFunction;
        this.scoreMultiplier = scoreMultiplier;
    }
}

class Joker {
    constructor(name, description, effect, cost = 0, oneTimeUse = false) {
        this.name = name;
        this.description = description;
        this.effect = effect;
        this.cost = cost;
        this.oneTimeUse = oneTimeUse;
        this.used = false;
        this.active = true;
    }
    
    canUse(gameState) {
        return this.active && !this.used && gameState.score >= this.cost;
    }
    
    use(gameState) {
        if (!this.canUse(gameState)) return false;
        
        gameState.score -= this.cost;
        this.effect(gameState);
        
        if (this.oneTimeUse) {
            this.used = true;
        }
        
        return true;
    }
}

// Main Game Class
class BingolotroGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.bingoCard = null;
        this.calledNumbers = [];
        this.availableNumbers = [];
        this.currentNumber = null;
        this.score = 0;
        this.multiplier = 1;
        this.round = 1;
        this.patterns = [];
        this.currentPattern = null;
        this.jokers = [];
        this.activeEffects = [];
        this.gameOver = false;
        
        // Systems
        this.particleSystem = new ParticleSystem();
        this.keys = {};
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log('Bingolotro initialized');
        
        // Initialize patterns
        this.initializePatterns();
        this.currentPattern = this.patterns[0];
        
        // Create bingo card
        this.bingoCard = new BingoCard(50, 80);
        
        // Initialize available numbers
        this.initializeAvailableNumbers();
        
        // Initialize jokers
        this.initializeJokers();
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Update UI
        this.updateUI();
        
        // Start game loop
        this.gameLoop();
    }
    
    initializePatterns() {
        this.patterns = [
            new BingoPattern('Line', (card) => {
                // Check rows
                for (let row = 0; row < 5; row++) {
                    let complete = true;
                    for (let col = 0; col < 5; col++) {
                        if (!card.isMarked(col, row)) {
                            complete = false;
                            break;
                        }
                    }
                    if (complete) return true;
                }
                
                // Check columns
                for (let col = 0; col < 5; col++) {
                    let complete = true;
                    for (let row = 0; row < 5; row++) {
                        if (!card.isMarked(col, row)) {
                            complete = false;
                            break;
                        }
                    }
                    if (complete) return true;
                }
                
                // Check diagonals
                let diag1 = true, diag2 = true;
                for (let i = 0; i < 5; i++) {
                    if (!card.isMarked(i, i)) diag1 = false;
                    if (!card.isMarked(i, 4 - i)) diag2 = false;
                }
                
                return diag1 || diag2;
            }, 1),
            
            new BingoPattern('Four Corners', (card) => {
                return card.isMarked(0, 0) && card.isMarked(0, 4) && 
                       card.isMarked(4, 0) && card.isMarked(4, 4);
            }, 2),
            
            new BingoPattern('Full Card', (card) => {
                return card.marked.size === 25;
            }, 5),
            
            new BingoPattern('X Pattern', (card) => {
                for (let i = 0; i < 5; i++) {
                    if (!card.isMarked(i, i) || !card.isMarked(i, 4 - i)) {
                        return false;
                    }
                }
                return true;
            }, 3)
        ];
    }
    
    initializeAvailableNumbers() {
        this.availableNumbers = [];
        const ranges = [
            { letter: 'B', min: 1, max: 15 },
            { letter: 'I', min: 16, max: 30 },
            { letter: 'N', min: 31, max: 45 },
            { letter: 'G', min: 46, max: 60 },
            { letter: 'O', min: 61, max: 75 }
        ];
        
        ranges.forEach(range => {
            for (let i = range.min; i <= range.max; i++) {
                this.availableNumbers.push(new BingoNumber(i, range.letter));
            }
        });
        
        // Shuffle
        for (let i = this.availableNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.availableNumbers[i], this.availableNumbers[j]] = [this.availableNumbers[j], this.availableNumbers[i]];
        }
    }
    
    initializeJokers() {
        const jokerTemplates = [
            {
                name: "Lucky Caller",
                description: "Next 3 numbers have chance to appear twice",
                effect: (gameState) => {
                    gameState.activeEffects.push({
                        name: "Lucky Caller",
                        duration: 3,
                        apply: (number, card) => {
                            if (Math.random() < 0.5) {
                                card.markNumber(number);
                            }
                        }
                    });
                },
                cost: 50,
                oneTimeUse: true
            },
            {
                name: "Score Booster",
                description: "Double multiplier for 5 numbers",
                effect: (gameState) => {
                    gameState.multiplier *= 2;
                    gameState.activeEffects.push({
                        name: "Score Booster",
                        duration: 5,
                        onExpire: () => { gameState.multiplier = Math.max(1, gameState.multiplier / 2); }
                    });
                },
                cost: 100,
                oneTimeUse: true
            },
            {
                name: "Wild Mark",
                description: "Mark any unmarked corner",
                effect: (gameState) => {
                    const corners = [[0,0], [0,4], [4,0], [4,4]];
                    const unmarkedCorners = corners.filter(([col, row]) => 
                        !gameState.bingoCard.isMarked(col, row)
                    );
                    
                    if (unmarkedCorners.length > 0) {
                        const [col, row] = unmarkedCorners[Math.floor(Math.random() * unmarkedCorners.length)];
                        gameState.bingoCard.marked.add(`${col},${row}`);
                        
                        // Visual effect
                        gameState.particleSystem.createExplosion(
                            gameState.bingoCard.x + col * gameState.bingoCard.cellSize + gameState.bingoCard.cellSize/2,
                            gameState.bingoCard.y + row * gameState.bingoCard.cellSize + gameState.bingoCard.cellSize/2,
                            { count: 10, colors: ['#8e44ad', '#9b59b6'], speed: 150 }
                        );
                    }
                },
                cost: 40,
                oneTimeUse: true
            }
        ];
        
        const shuffled = [...jokerTemplates].sort(() => Math.random() - 0.5);
        this.jokers = shuffled.slice(0, 3).map(template => 
            new Joker(template.name, template.description, template.effect, template.cost, template.oneTimeUse)
        );
    }
    
    setupInputHandlers() {
        // Keyboard shortcuts
        window.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            if (event.code === 'Space') {
                event.preventDefault();
                this.callNextNumber();
            } else if (event.code === 'KeyN') {
                this.startNewGame();
            }
        });
        
        window.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Mouse clicks on bingo card
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            const clicked = this.bingoCard.handleClick(mouseX, mouseY);
            if (clicked) {
                this.score += Math.floor(10 * this.multiplier);
                this.particleSystem.createExplosion(mouseX, mouseY, {
                    count: 5,
                    colors: ['#27ae60', '#2ecc71'],
                    speed: 100
                });
                this.updateUI();
                
                if (this.checkWin()) {
                    this.handleWin();
                }
            }
        });
        
        // Button clicks
        document.getElementById('callNumberBtn').addEventListener('click', () => this.callNextNumber());
        document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
    }
    
    callNextNumber() {
        if (this.gameOver || this.availableNumbers.length === 0) return;
        
        // Check for custom call effects
        for (let effect of this.activeEffects) {
            if (effect.customCall) {
                const customNumber = effect.customCall();
                if (customNumber) {
                    const index = this.availableNumbers.findIndex(n => 
                        n.value === customNumber.value && n.letter === customNumber.letter
                    );
                    if (index !== -1) {
                        this.currentNumber = this.availableNumbers.splice(index, 1)[0];
                        this.processCalledNumber();
                        return;
                    }
                }
            }
        }
        
        // Normal random call
        const randomIndex = Math.floor(Math.random() * this.availableNumbers.length);
        this.currentNumber = this.availableNumbers.splice(randomIndex, 1)[0];
        this.processCalledNumber();
    }
    
    processCalledNumber() {
        this.currentNumber.called = true;
        this.calledNumbers.push(this.currentNumber);
        
        // Mark on card if present
        const marked = this.bingoCard.markNumber(this.currentNumber.value);
        if (marked) {
            let points = 10;
            
            // Apply effects
            this.activeEffects.forEach(effect => {
                if (effect.apply) {
                    effect.apply(this.currentNumber.value, this.bingoCard);
                }
                effect.duration--;
            });
            
            // Remove expired effects
            this.activeEffects = this.activeEffects.filter(effect => {
                if (effect.duration <= 0) {
                    if (effect.onExpire) effect.onExpire();
                    return false;
                }
                return true;
            });
            
            this.score += Math.floor(points * this.multiplier);
            
            // Create particle effect
            this.particleSystem.createExplosion(
                this.bingoCard.x + marked.col * this.bingoCard.cellSize + this.bingoCard.cellSize/2,
                this.bingoCard.y + marked.row * this.bingoCard.cellSize + this.bingoCard.cellSize/2,
                {
                    count: 8,
                    colors: ['#27ae60', '#2ecc71'],
                    speed: 100
                }
            );
            
            if (this.checkWin()) {
                this.handleWin();
            }
        }
        
        this.updateUI();
        this.updateCalledNumbers();
    }
    
    checkWin() {
        return this.bingoCard.checkPattern(this.currentPattern);
    }
    
    handleWin() {
        this.gameOver = true;
        
        // Bonus points
        this.score += Math.floor(500 * this.currentPattern.scoreMultiplier * this.multiplier);
        
        // Victory particles
        this.particleSystem.createExplosion(300, 250, {
            count: 50,
            colors: ['#f39c12', '#e94560', '#8e44ad'],
            speed: 300,
            life: 2
        });
        
        setTimeout(() => {
            alert(`BINGO! Final Score: ${this.score}`);
        }, 1000);
        
        this.updateUI();
    }
    
    startNewGame() {
        this.gameOver = false;
        this.score = 0;
        this.multiplier = 1;
        this.round = 1;
        this.calledNumbers = [];
        this.currentNumber = null;
        this.activeEffects = [];
        
        // Create new bingo card
        this.bingoCard = new BingoCard(50, 80);
        
        // Reset available numbers
        this.initializeAvailableNumbers();
        
        // New jokers
        this.initializeJokers();
        
        this.updateUI();
        this.updateCalledNumbers();
        this.updateJokers();
    }
    
    updateUI() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('roundDisplay').textContent = this.round;
        document.getElementById('numbersCalledDisplay').textContent = this.calledNumbers.length;
        document.getElementById('multiplierDisplay').textContent = `${this.multiplier}x`;
        document.getElementById('currentPatternDisplay').textContent = `Current Pattern: ${this.currentPattern.name}`;
        
        this.updateJokers();
    }
    
    updateCalledNumbers() {
        const grid = document.getElementById('calledNumbersGrid');
        grid.innerHTML = '';
        
        this.calledNumbers.forEach(number => {
            const div = document.createElement('div');
            div.className = 'called-number';
            div.textContent = number.getDisplayString();
            grid.appendChild(div);
        });
    }
    
    updateJokers() {
        const container = document.getElementById('jokersContainer');
        container.innerHTML = '';
        
        this.jokers.forEach((joker, index) => {
            const div = document.createElement('div');
            div.className = `joker-card ${joker.used ? 'used' : ''}`;
            
            div.innerHTML = `
                <div class="joker-name">${joker.name}</div>
                <div class="joker-description">${joker.description}</div>
                ${joker.cost > 0 ? `<div class="joker-cost">Cost: ${joker.cost} pts</div>` : ''}
            `;
            
            if (joker.canUse(this)) {
                div.addEventListener('click', () => {
                    if (joker.use(this)) {
                        this.updateUI();
                        
                        // Visual feedback
                        this.particleSystem.createExplosion(300, 200, {
                            count: 15,
                            colors: ['#8e44ad', '#9b59b6'],
                            speed: 200
                        });
                    }
                });
            }
            
            container.appendChild(div);
        });
    }
    
    gameLoop() {
        const dt = 0.016; // ~60 FPS
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render current number display
        if (this.currentNumber) {
            this.ctx.fillStyle = '#f39c12';
            this.ctx.font = 'bold 32px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.currentNumber.value, 350, 50);
            
            this.ctx.fillStyle = '#e94560';
            this.ctx.font = 'bold 16px Courier New';
            this.ctx.fillText(this.currentNumber.letter, 350, 75);
        } else {
            this.ctx.fillStyle = '#666';
            this.ctx.font = 'bold 20px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Ready to Start', 350, 50);
        }
        
        // Render bingo card
        this.bingoCard.render(this.ctx);
        
        // Update and render particles
        this.particleSystem.update(dt);
        this.particleSystem.render(this.ctx);
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new BingolotroGame();
    console.log('Bingolotro started!');
});