/**
 * Audio Manager
 * Handles sound effects, music, and audio processing
 * Inspired by Howler.js usage in the analyzed games
 */

class AudioManager {
    constructor(engine) {
        this.engine = engine;
        this.sounds = new Map();
        this.music = new Map();
        this.currentMusic = null;
        this.masterVolume = 1.0;
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
        this.muted = false;
        this.audioContext = null;
        this.initialized = false;
        
        // Audio categories for organization
        this.categories = {
            music: { volume: this.musicVolume, muted: false },
            sfx: { volume: this.sfxVolume, muted: false },
            ui: { volume: this.sfxVolume, muted: false },
            ambient: { volume: 0.5, muted: false }
        };

        this.init();
    }

    async init() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.masterVolume;

            // Create category gain nodes
            this.categoryGains = {};
            Object.keys(this.categories).forEach(category => {
                this.categoryGains[category] = this.audioContext.createGain();
                this.categoryGains[category].connect(this.masterGain);
                this.categoryGains[category].gain.value = this.categories[category].volume;
            });

            this.initialized = true;
            console.log('Audio Manager initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    // Sound loading and management
    async loadSound(id, url, category = 'sfx', options = {}) {
        try {
            const audio = new Audio(url);
            audio.preload = 'auto';
            
            const sound = {
                id,
                audio,
                category,
                volume: options.volume || 1.0,
                loop: options.loop || false,
                loaded: false,
                instances: []
            };

            // Wait for audio to load
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', () => {
                    sound.loaded = true;
                    resolve();
                });
                audio.addEventListener('error', reject);
                audio.load();
            });

            this.sounds.set(id, sound);
            console.log(`Sound loaded: ${id}`);
            return sound;
        } catch (error) {
            console.error(`Failed to load sound ${id}:`, error);
        }
    }

    // Music loading (similar to sounds but with different handling)
    async loadMusic(id, url, options = {}) {
        try {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.loop = options.loop !== false; // Default to loop for music
            
            const music = {
                id,
                audio,
                category: 'music',
                volume: options.volume || 1.0,
                loaded: false,
                fadeIn: options.fadeIn || 0,
                fadeOut: options.fadeOut || 0
            };

            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', () => {
                    music.loaded = true;
                    resolve();
                });
                audio.addEventListener('error', reject);
                audio.load();
            });

            this.music.set(id, music);
            console.log(`Music loaded: ${id}`);
            return music;
        } catch (error) {
            console.error(`Failed to load music ${id}:`, error);
        }
    }

    // Play sound effect
    playSound(id, options = {}) {
        const sound = this.sounds.get(id);
        if (!sound || !sound.loaded) {
            console.warn(`Sound not found or not loaded: ${id}`);
            return null;
        }

        try {
            // Create audio instance
            const instance = sound.audio.cloneNode();
            instance.volume = this.calculateVolume(sound.category, sound.volume * (options.volume || 1.0));
            
            if (options.rate) {
                instance.playbackRate = options.rate;
            }

            // Play the sound
            const playPromise = instance.play();
            
            if (playPromise) {
                playPromise.catch(error => {
                    console.warn('Sound play failed:', error);
                });
            }

            // Clean up when finished
            instance.addEventListener('ended', () => {
                const index = sound.instances.indexOf(instance);
                if (index > -1) {
                    sound.instances.splice(index, 1);
                }
            });

            sound.instances.push(instance);
            return instance;
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    // Stop all instances of a sound
    stopSound(id) {
        const sound = this.sounds.get(id);
        if (sound) {
            sound.instances.forEach(instance => {
                instance.pause();
                instance.currentTime = 0;
            });
            sound.instances = [];
        }
    }

    // Music playback
    playMusic(id, options = {}) {
        const music = this.music.get(id);
        if (!music || !music.loaded) {
            console.warn(`Music not found or not loaded: ${id}`);
            return;
        }

        // Stop current music if playing
        if (this.currentMusic && this.currentMusic !== music) {
            this.stopMusic(options.fadeOut || 1000);
        }

        this.currentMusic = music;
        music.audio.volume = this.calculateVolume(music.category, music.volume);
        
        const playPromise = music.audio.play();
        if (playPromise) {
            playPromise.catch(error => {
                console.warn('Music play failed:', error);
            });
        }

        // Fade in if specified
        if (music.fadeIn > 0) {
            this.fadeIn(music.audio, music.fadeIn);
        }

        console.log(`Playing music: ${id}`);
    }

    stopMusic(fadeTime = 0) {
        if (this.currentMusic) {
            if (fadeTime > 0) {
                this.fadeOut(this.currentMusic.audio, fadeTime, () => {
                    this.currentMusic.audio.pause();
                    this.currentMusic.audio.currentTime = 0;
                    this.currentMusic = null;
                });
            } else {
                this.currentMusic.audio.pause();
                this.currentMusic.audio.currentTime = 0;
                this.currentMusic = null;
            }
        }
    }

    // Volume control
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
        }
        this.updateAllVolumes();
    }

    setCategoryVolume(category, volume) {
        if (this.categories[category]) {
            this.categories[category].volume = Math.max(0, Math.min(1, volume));
            if (this.categoryGains && this.categoryGains[category]) {
                this.categoryGains[category].gain.value = this.categories[category].muted ? 0 : this.categories[category].volume;
            }
            this.updateAllVolumes();
        }
    }

    setMuted(muted) {
        this.muted = muted;
        if (this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : this.masterVolume;
        }
        this.updateAllVolumes();
    }

    mutateCategory(category, muted) {
        if (this.categories[category]) {
            this.categories[category].muted = muted;
            if (this.categoryGains && this.categoryGains[category]) {
                this.categoryGains[category].gain.value = muted ? 0 : this.categories[category].volume;
            }
            this.updateAllVolumes();
        }
    }

    calculateVolume(category, baseVolume) {
        if (this.muted || (this.categories[category] && this.categories[category].muted)) {
            return 0;
        }
        
        const categoryVolume = this.categories[category] ? this.categories[category].volume : 1;
        return this.masterVolume * categoryVolume * baseVolume;
    }

    updateAllVolumes() {
        // Update current music volume
        if (this.currentMusic) {
            this.currentMusic.audio.volume = this.calculateVolume(
                this.currentMusic.category,
                this.currentMusic.volume
            );
        }

        // Update all playing sound instances
        this.sounds.forEach(sound => {
            sound.instances.forEach(instance => {
                instance.volume = this.calculateVolume(sound.category, sound.volume);
            });
        });
    }

    // Audio effects
    fadeIn(audio, duration) {
        audio.volume = 0;
        const startTime = performance.now();
        const targetVolume = this.calculateVolume('music', 1);

        const fade = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            audio.volume = targetVolume * progress;
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            }
        };

        fade();
    }

    fadeOut(audio, duration, callback) {
        const startVolume = audio.volume;
        const startTime = performance.now();

        const fade = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            audio.volume = startVolume * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else if (callback) {
                callback();
            }
        };

        fade();
    }

    // Preload commonly used sounds (inspired by the games' pattern)
    async preloadGameSounds() {
        const gameSounds = [
            // UI sounds
            { id: 'click', url: 'assets/audio/click.wav', category: 'ui' },
            { id: 'hover', url: 'assets/audio/hover.wav', category: 'ui' },
            { id: 'select', url: 'assets/audio/select.wav', category: 'ui' },
            { id: 'error', url: 'assets/audio/error.wav', category: 'ui' },
            
            // Game sounds
            { id: 'score', url: 'assets/audio/score.wav', category: 'sfx' },
            { id: 'powerup', url: 'assets/audio/powerup.wav', category: 'sfx' },
            { id: 'explosion', url: 'assets/audio/explosion.wav', category: 'sfx' },
            { id: 'collect', url: 'assets/audio/collect.wav', category: 'sfx' },
        ];

        const loadPromises = gameSounds.map(sound => 
            this.loadSound(sound.id, sound.url, sound.category).catch(() => {
                // Ignore load failures for optional assets
                console.warn(`Optional sound failed to load: ${sound.id}`);
            })
        );

        await Promise.allSettled(loadPromises);
        console.log('Game sounds preloaded');
    }

    // Generate simple audio procedurally (for when assets aren't available)
    generateTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.categoryGains.sfx || this.masterGain);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);

        return { oscillator, gainNode };
    }

    // Common sound effects generators
    playBeep(frequency = 440, duration = 0.1) {
        this.generateTone(frequency, duration);
    }

    playClick() {
        this.generateTone(800, 0.1, 'square');
    }

    playError() {
        this.generateTone(200, 0.3, 'sawtooth');
    }

    playSuccess() {
        // Rising tone sequence
        setTimeout(() => this.generateTone(440, 0.1), 0);
        setTimeout(() => this.generateTone(554, 0.1), 100);
        setTimeout(() => this.generateTone(659, 0.2), 200);
    }

    // Cleanup
    destroy() {
        this.stopMusic();
        
        this.sounds.forEach(sound => {
            this.stopSound(sound.id);
        });

        if (this.audioContext) {
            this.audioContext.close();
        }

        this.sounds.clear();
        this.music.clear();
        this.currentMusic = null;
    }

    // Debug information
    getDebugInfo() {
        return {
            soundsLoaded: this.sounds.size,
            musicLoaded: this.music.size,
            currentMusic: this.currentMusic ? this.currentMusic.id : null,
            masterVolume: this.masterVolume,
            muted: this.muted,
            categories: this.categories
        };
    }
}

export { AudioManager };
