// Simple Audio Manager for ButtFights
// Created by Aisatoshi
// Provides basic sound effect functionality

class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.enabled = true;
        this.volume = 0.5;
        
        // Create placeholder sounds with Web Audio API
        this.initializeSounds();
    }
    
    initializeSounds() {
        // For now, we'll create simple synthesized sounds
        // In a full game, you'd load actual audio files
        
        console.log('🔊 Audio Manager initialized for ButtFights');
        console.log('🎵 Sound effects ready (synthesized)');
    }
    
    // Simple sound synthesis for punch effects
    createPunchSound(frequency = 200, duration = 0.1) {
        if (!this.enabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            // Fallback if Web Audio API not available
            console.log('🔇 Audio not available, playing in silence');
        }
    }
    
    // Different sound for special attacks
    createButtAttackSound() {
        if (!this.enabled) return;
        
        console.log('🍑 BUTT ATTACK SOUND!');
        
        // Create a more complex sound for special attacks
        this.createPunchSound(150, 0.3); // Lower, longer sound
        
        setTimeout(() => {
            this.createPunchSound(300, 0.2); // Higher follow-up
        }, 100);
    }
    
    // Hit sound effect
    createHitSound() {
        this.createPunchSound(180 + Math.random() * 40, 0.15);
    }
    
    // Enemy death sound
    createDeathSound() {
        this.createPunchSound(100, 0.4); // Low groan sound
    }
    
    // Combo sound
    createComboSound(comboLevel) {
        const frequency = 300 + (comboLevel * 50);
        this.createPunchSound(frequency, 0.2);
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// Export for use in the main game
window.AudioManager = AudioManager;