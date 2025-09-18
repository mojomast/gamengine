// Game initialization and global functions
let vampireGame = null;

// Global functions for UI interaction
window.startGame = function() {
    if (vampireGame) {
        vampireGame.startGame();
    }
};

window.showCharacters = function() {
    alert('Character Selection - Coming Soon!\nChoose different starting characters with unique abilities.');
};

window.showUpgrades = function() {
    alert('Permanent Upgrades - Coming Soon!\nUse gold to buy permanent boosts between runs.');
};

window.showControls = function() {
    alert('CONTROLS:\n\nMovement: WASD or Arrow Keys\nWeapons: Fire Automatically\nGoal: Survive 30 Minutes!\n\nTip: Collect XP gems to level up and gain new weapons/abilities.');
};

window.restartGame = function() {
    if (vampireGame) {
        document.getElementById('gameOverOverlay').style.display = 'none';
        vampireGame.startGame();
    }
};

window.returnToMenu = function() {
    if (vampireGame) {
        document.getElementById('gameOverOverlay').style.display = 'none';
        document.getElementById('menuOverlay').style.display = 'flex';
        vampireGame.gameState = 'menu';
    }
};

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', async () => {
    const { VampireSurvivorsGame } = await import('./vampire-survivors-engine.js');
    vampireGame = new VampireSurvivorsGame();
    console.log('Vampire Survivors game loaded!');
});