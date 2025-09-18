// Music Player UI Controls
(function() {
    let retryCount = 0;
    const maxRetries = 10;
    
    function tryInitialize() {
        if (retryCount >= maxRetries) {
            console.error('Failed to initialize music player after', maxRetries, 'attempts');
            return;
        }
        
        retryCount++;
        console.log('Attempting to initialize music player, attempt:', retryCount);
        
        if (document.readyState === 'complete') {
            setTimeout(initializeMusicPlayer, 500);
        } else {
            setTimeout(tryInitialize, 500);
        }
    }
    
    // Try multiple initialization methods
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInitialize);
        window.addEventListener('load', tryInitialize);
    } else {
        tryInitialize();
    }
    
    function initializeMusicPlayer() {
        // Get UI elements
        const musicVolumeSlider = document.getElementById('musicVolume');
        const sfxVolumeSlider = document.getElementById('sfxVolume');
        const musicVolumeValue = document.getElementById('musicVolumeValue');
        const sfxVolumeValue = document.getElementById('sfxVolumeValue');
        
        const prevTrackBtn = document.getElementById('prevTrack');
        const playPauseBtn = document.getElementById('playPause');
        const nextTrackBtn = document.getElementById('nextTrack');
        const shuffleBtn = document.getElementById('shuffleBtn');
        const repeatBtn = document.getElementById('repeatBtn');
        
        const muteMusicBtn = document.getElementById('muteMusic');
        const muteSFXBtn = document.getElementById('muteSFX');
        
        const trackListBtn = document.getElementById('trackListBtn');
        const trackListPopup = document.getElementById('trackListPopup');
        const closeTrackListBtn = document.getElementById('closeTrackList');
        const trackItems = document.querySelectorAll('.track-item');
        
        const trackNumber = document.getElementById('trackNumber');
        const trackName = document.getElementById('trackName');
        
        // State variables
        let isPlaying = true;
        let isShuffled = false;
        let isRepeating = false;
        let previousMusicVolume = 30;
        let previousSFXVolume = 50;
        
        // Check if SoundManager exists and is properly initialized
        if (typeof window.SoundManager === 'undefined' || !window.SoundManager || !window.SoundManager.musicPlayer) {
            console.warn('SoundManager or MusicPlayer not initialized yet, retrying... Attempt:', retryCount);
            if (retryCount < maxRetries) {
                setTimeout(initializeMusicPlayer, 1000);
            }
            return;
        }
        
        const SoundManager = window.SoundManager;
        
        // Volume Controls
        if (musicVolumeSlider) {
            musicVolumeSlider.addEventListener('input', function(e) {
                const value = parseInt(e.target.value);
                musicVolumeValue.textContent = value + '%';
                if (SoundManager && SoundManager.setMusicVolume) {
                    SoundManager.setMusicVolume(value / 100);
                }
                previousMusicVolume = value;
            });
        }
        
        if (sfxVolumeSlider) {
            sfxVolumeSlider.addEventListener('input', function(e) {
                const value = parseInt(e.target.value);
                sfxVolumeValue.textContent = value + '%';
                if (SoundManager && SoundManager.setSFXVolume) {
                    SoundManager.setSFXVolume(value / 100);
                }
                previousSFXVolume = value;
            });
        }
        
        // Playback Controls
        if (prevTrackBtn) {
            prevTrackBtn.addEventListener('click', function() {
                console.log('Previous track clicked');
                if (SoundManager && SoundManager.prevTrack) {
                    const track = SoundManager.prevTrack();
                    if (track) {
                        updateTrackDisplay();
                    }
                }
            });
        }
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', function() {
                console.log('Play/Pause clicked');
                isPlaying = !isPlaying;
                
                if (SoundManager && SoundManager.toggleMusic) {
                    SoundManager.toggleMusic();
                    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
                    
                    // Update visualizer state
                    updateVisualizerState(isPlaying);
                }
            });
            
            // Set initial state
            playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
        }
        
        if (nextTrackBtn) {
            nextTrackBtn.addEventListener('click', function() {
                console.log('Next track clicked');
                if (SoundManager && SoundManager.nextTrack) {
                    const track = SoundManager.nextTrack();
                    if (track) {
                        updateTrackDisplay();
                    }
                }
            });
        }
        
        // Shuffle and Repeat
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', function() {
                isShuffled = !isShuffled;
                shuffleBtn.classList.toggle('active', isShuffled);
                console.log('Shuffle:', isShuffled);
            });
        }
        
        if (repeatBtn) {
            repeatBtn.addEventListener('click', function() {
                isRepeating = !isRepeating;
                repeatBtn.classList.toggle('active', isRepeating);
                console.log('Repeat:', isRepeating);
            });
        }
        
        // Mute Buttons
        if (muteMusicBtn) {
            muteMusicBtn.addEventListener('click', function() {
                const isMuted = muteMusicBtn.classList.contains('muted');
                
                if (isMuted) {
                    // Unmute
                    musicVolumeSlider.value = previousMusicVolume;
                    musicVolumeValue.textContent = previousMusicVolume + '%';
                    if (SoundManager && SoundManager.setMusicVolume) {
                        SoundManager.setMusicVolume(previousMusicVolume / 100);
                    }
                    muteMusicBtn.classList.remove('muted');
                    muteMusicBtn.textContent = '🔇';
                } else {
                    // Mute
                    previousMusicVolume = parseInt(musicVolumeSlider.value);
                    musicVolumeSlider.value = 0;
                    musicVolumeValue.textContent = '0%';
                    if (SoundManager && SoundManager.setMusicVolume) {
                        SoundManager.setMusicVolume(0);
                    }
                    muteMusicBtn.classList.add('muted');
                    muteMusicBtn.textContent = '🔊';
                }
            });
        }
        
        if (muteSFXBtn) {
            muteSFXBtn.addEventListener('click', function() {
                const isMuted = muteSFXBtn.classList.contains('muted');
                
                if (isMuted) {
                    // Unmute
                    sfxVolumeSlider.value = previousSFXVolume;
                    sfxVolumeValue.textContent = previousSFXVolume + '%';
                    if (SoundManager && SoundManager.setSFXVolume) {
                        SoundManager.setSFXVolume(previousSFXVolume / 100);
                    }
                    muteSFXBtn.classList.remove('muted');
                    muteSFXBtn.textContent = '🔇';
                } else {
                    // Mute
                    previousSFXVolume = parseInt(sfxVolumeSlider.value);
                    sfxVolumeSlider.value = 0;
                    sfxVolumeValue.textContent = '0%';
                    if (SoundManager && SoundManager.setSFXVolume) {
                        SoundManager.setSFXVolume(0);
                    }
                    muteSFXBtn.classList.add('muted');
                    muteSFXBtn.textContent = '🔊';
                }
            });
        }
        
        // Track List
        if (trackListBtn && trackListPopup) {
            trackListBtn.addEventListener('click', function() {
                const isVisible = trackListPopup.style.display === 'block';
                trackListPopup.style.display = isVisible ? 'none' : 'block';
            });
        }
        
        if (closeTrackListBtn && trackListPopup) {
            closeTrackListBtn.addEventListener('click', function() {
                trackListPopup.style.display = 'none';
            });
        }
        
        // Track Selection
        trackItems.forEach(function(item) {
            item.addEventListener('click', function() {
                const trackIndex = parseInt(item.dataset.track);
                console.log('Track selected:', trackIndex);
                
                if (SoundManager && SoundManager.musicPlayer) {
                    const track = SoundManager.musicPlayer.setTrack(trackIndex);
                    if (track) {
                        updateTrackDisplay();
                        
                        // Update active state
                        trackItems.forEach(t => t.classList.remove('active'));
                        item.classList.add('active');
                        
                        // Hide track list after selection
                        trackListPopup.style.display = 'none';
                    }
                }
            });
        });
        
        // Update track display
        function updateTrackDisplay() {
            if (SoundManager && SoundManager.musicPlayer) {
                const currentTrack = SoundManager.musicPlayer.currentTrack;
                const currentIndex = SoundManager.musicPlayer.currentTrackIndex;
                
                if (currentTrack && trackName && trackNumber) {
                    trackName.textContent = currentTrack.name;
                    trackNumber.textContent = (currentIndex + 1).toString().padStart(2, '0');
                    
                    // Update active state in track list
                    trackItems.forEach((item, index) => {
                        item.classList.toggle('active', index === currentIndex);
                    });
                }
            }
        }
        
        // Visualizer
        function updateVisualizerState(playing) {
            const bars = document.querySelectorAll('.visualizer .bar');
            bars.forEach(bar => {
                if (playing) {
                    bar.style.animationPlayState = 'running';
                } else {
                    bar.style.animationPlayState = 'paused';
                    bar.style.height = '2px';
                }
            });
        }
        
        // Animated visualizer
        function animateVisualizer() {
            const bars = document.querySelectorAll('.visualizer .bar');
            if (isPlaying && bars.length > 0) {
                bars.forEach((bar, i) => {
                    const height = Math.random() * 18 + 2;
                    bar.style.height = height + 'px';
                    bar.style.transition = 'height 0.1s ease';
                });
            }
        }
        
        // Start visualizer animation
        setInterval(animateVisualizer, 150);
        
        // Auto-advance tracks
        setInterval(function() {
            if (SoundManager && SoundManager.musicPlayer && isPlaying) {
                // Simulate track ending (every ~3 minutes on average)
                if (Math.random() < 0.0055) {
                    if (isRepeating) {
                        // Restart current track
                        if (SoundManager.musicPlayer.currentStep) {
                            SoundManager.musicPlayer.currentStep = 0;
                        }
                    } else if (isShuffled) {
                        // Random track
                        const numTracks = SoundManager.musicPlayer.tracks.length;
                        const randomIndex = Math.floor(Math.random() * numTracks);
                        const track = SoundManager.musicPlayer.setTrack(randomIndex);
                        if (track) updateTrackDisplay();
                    } else {
                        // Next track
                        const track = SoundManager.nextTrack();
                        if (track) updateTrackDisplay();
                    }
                }
            }
        }, 1000);
        
        // Initial display update
        updateTrackDisplay();
        updateVisualizerState(isPlaying);
        
        console.log('Music player UI initialized successfully');
    }
    
})(); // End of IIFE
