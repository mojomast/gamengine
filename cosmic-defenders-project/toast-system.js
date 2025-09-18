// Toast Notification System
class ToastManager {
    constructor() {
        this.container = document.getElementById('toastContainer');
        this.toasts = [];
        this.maxToasts = 4;
    }

    show(title, message, type = 'info', duration = 4000) {
        // Remove oldest toast if we have too many
        if (this.toasts.length >= this.maxToasts) {
            this.remove(this.toasts[0]);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Get icon based on type
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-icon">${icon}</span>
                <span class="toast-title">${title}</span>
            </div>
            <div class="toast-message">${message}</div>
        `;

        // Add to container and track
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Auto-remove after duration
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        // Play sound based on type
        this.playNotificationSound(type);

        return toast;
    }

    remove(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                this.container.removeChild(toast);
            }
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 500);
    }

    getIcon(type) {
        const icons = {
            info: '🌟',
            success: '✅',
            warning: '⚠️',
            achievement: '🏆',
            levelup: '⬆️',
            upgrade: '🔧',
            wave: '🌊',
            boss: '👹',
            reward: '🎁',
            critical: '💥'
        };
        return icons[type] || '💫';
    }

    playNotificationSound(type) {
        // Different sounds for different notification types
        if (window.SoundManager) {
            switch (type) {
                case 'success':
                case 'achievement':
                    SoundManager.play('levelup');
                    break;
                case 'warning':
                    SoundManager.play('freeze');
                    break;
                case 'upgrade':
                    SoundManager.play('build');
                    break;
                default:
                    SoundManager.play('collect');
                    break;
            }
        }
    }

    // Convenience methods for different types
    info(title, message, duration) {
        return this.show(title, message, 'info', duration);
    }

    success(title, message, duration) {
        return this.show(title, message, 'success', duration);
    }

    warning(title, message, duration) {
        return this.show(title, message, 'warning', duration);
    }

    achievement(title, message, duration = 6000) {
        return this.show(title, message, 'achievement', duration);
    }

    levelUp(level) {
        return this.achievement('Level Up!', `You've reached level ${level}!`);
    }

    waveComplete(wave, bonus) {
        return this.success('Wave Complete!', `Wave ${wave} defeated! Bonus: ${bonus} crystals`);
    }

    newUpgradeAvailable(upgrade) {
        return this.warning('Upgrade Available!', `You can now afford: ${upgrade}`);
    }

    bossWarning(bossName) {
        return this.show('Boss Incoming!', `${bossName} approaches!`, 'boss', 5000);
    }

    criticalHit(damage) {
        return this.show('Critical Hit!', `${damage} damage!`, 'critical', 2000);
    }
}

// Create global toast manager
window.Toast = new ToastManager();

// Integration with game events
// Toast notifications will be triggered by actual game events
// Remove any demo notifications for production
