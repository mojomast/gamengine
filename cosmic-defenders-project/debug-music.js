// Debug script to check music player elements
console.log('=== MUSIC PLAYER DEBUG ===');

// Check if HTML elements exist
setTimeout(() => {
    const musicPlayer = document.querySelector('.music-player');
    const playBtn = document.getElementById('playPause');
    const trackName = document.getElementById('trackName');
    
    console.log('Music player element:', musicPlayer);
    console.log('Play button element:', playBtn);
    console.log('Track name element:', trackName);
    
    if (musicPlayer) {
        console.log('Music player computed style:', window.getComputedStyle(musicPlayer).display);
        console.log('Music player visibility:', window.getComputedStyle(musicPlayer).visibility);
        console.log('Music player z-index:', window.getComputedStyle(musicPlayer).zIndex);
    }
    
    // Check SoundManager
    console.log('window.SoundManager:', window.SoundManager);
    if (window.SoundManager) {
        console.log('SoundManager.musicPlayer:', window.SoundManager.musicPlayer);
        if (window.SoundManager.musicPlayer) {
            console.log('Current track:', window.SoundManager.musicPlayer.currentTrack);
        }
    }
    
    // Force show music player
    if (musicPlayer) {
        musicPlayer.style.display = 'block';
        musicPlayer.style.position = 'fixed';
        musicPlayer.style.bottom = '120px';
        musicPlayer.style.left = '50%';
        musicPlayer.style.transform = 'translateX(-50%)';
        musicPlayer.style.zIndex = '1000';
        musicPlayer.style.background = 'linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)';
        musicPlayer.style.border = '2px solid #00ffff';
        musicPlayer.style.padding = '10px';
        musicPlayer.style.borderRadius = '8px';
        console.log('Forced music player visibility');
    }
}, 2000);