/**
 * Easy Integration Script for Existing Projects
 * Add this script to any HTML file to instantly get project management capabilities
 */

(function() {
    'use strict';
    
    // Configuration
    const PROJECT_MANAGER_URL = './project-manager.html';
    const ENABLE_AUTO_PRESERVATION = true;
    const ENABLE_KEYBOARD_SHORTCUTS = true;
    
    // Initialize project management integration
    function initProjectManagement() {
        console.log('🎮 Initializing Project Management Integration...');
        
        // Add project management styles
        addProjectManagementStyles();
        
        // Add floating action button
        addFloatingActionButton();
        
        // Setup auto-preservation
        if (ENABLE_AUTO_PRESERVATION) {
            setupAutoPreservation();
        }
        
        // Setup keyboard shortcuts
        if (ENABLE_KEYBOARD_SHORTCUTS) {
            setupKeyboardShortcuts();
        }
        
        // Add console helpers
        addConsoleHelpers();
        
        console.log('✅ Project Management Integration Ready!');
        console.log('💡 Click the floating 🎮 button or press Ctrl+Shift+M to open Project Manager');
    }
    
    function addProjectManagementStyles() {
        const styles = `
            <style id="project-management-styles">
                .pm-fab {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(45deg, #ff206e, #05d9e8);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(255, 32, 110, 0.4);
                    z-index: 10000;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                }
                
                .pm-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px rgba(255, 32, 110, 0.6);
                }
                
                .pm-fab:active {
                    transform: scale(0.95);
                }
                
                .pm-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    border-left: 4px solid #00f593;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    z-index: 10001;
                    max-width: 300px;
                    word-wrap: break-word;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                }
                
                .pm-notification.show {
                    transform: translateX(0);
                }
                
                .pm-notification.success {
                    border-left-color: #00f593;
                }
                
                .pm-notification.warning {
                    border-left-color: #ffd700;
                }
                
                .pm-notification.error {
                    border-left-color: #ff206e;
                }
                
                .pm-shortcut-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 10002;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Courier New', monospace;
                }
                
                .pm-shortcut-panel {
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border: 2px solid #00f593;
                    border-radius: 12px;
                    padding: 30px;
                    color: white;
                    max-width: 500px;
                    box-shadow: 0 0 30px rgba(0, 245, 147, 0.3);
                }
                
                .pm-preserve-indicator {
                    position: fixed;
                    bottom: 90px;
                    right: 20px;
                    background: rgba(0, 245, 147, 0.9);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 9999;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    font-family: 'Courier New', monospace;
                }
                
                .pm-preserve-indicator.show {
                    opacity: 1;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    function addFloatingActionButton() {
        const fab = document.createElement('button');
        fab.className = 'pm-fab';
        fab.innerHTML = '🎮';
        fab.title = 'Open Project Manager (Ctrl+Shift+M)';
        
        fab.addEventListener('click', openProjectManager);
        
        document.body.appendChild(fab);
    }
    
    function openProjectManager() {
        // Open project manager in new window/tab
        const managerWindow = window.open(PROJECT_MANAGER_URL, 'ProjectManager', 
            'width=1400,height=900,menubar=yes,toolbar=yes,scrollbars=yes,resizable=yes');
        
        if (managerWindow) {
            showNotification('🚀 Project Manager opened in new window', 'success');
            managerWindow.focus();
        } else {
            showNotification('❌ Please allow popups to use Project Manager', 'error');
        }
    }
    
    function setupAutoPreservation() {
        // Auto-preserve every 5 minutes
        setInterval(() => {
            preserveCurrentState('Auto-preservation');
        }, 5 * 60 * 1000);
        
        // Preserve before page unload
        window.addEventListener('beforeunload', () => {
            preserveCurrentState('Before page unload');
        });
        
        // Show preservation indicator
        const indicator = document.createElement('div');
        indicator.className = 'pm-preserve-indicator';
        indicator.textContent = '💾 Auto-Save Active';
        document.body.appendChild(indicator);
        
        // Flash indicator periodically
        setInterval(() => {
            indicator.classList.add('show');
            setTimeout(() => indicator.classList.remove('show'), 2000);
        }, 60000); // Every minute
        
        console.log('🛡️ Auto-preservation enabled');
    }
    
    function preserveCurrentState(reason = 'Manual preservation') {
        try {
            const preservation = {
                timestamp: Date.now(),
                reason,
                url: window.location.href,
                title: document.title,
                content: document.documentElement.outerHTML,
                userAgent: navigator.userAgent
            };
            
            // Store in localStorage with unique key
            const key = `pm_preservation_${preservation.timestamp}`;
            localStorage.setItem(key, JSON.stringify(preservation));
            
            // Clean old preservations (keep only last 20)
            const keys = Object.keys(localStorage)
                .filter(k => k.startsWith('pm_preservation_'))
                .sort()
                .slice(0, -20);
            
            keys.forEach(key => localStorage.removeItem(key));
            
            console.log(`💾 Project preserved: ${reason}`);
            return preservation;
            
        } catch (error) {
            console.error('Failed to preserve project:', error);
            return null;
        }
    }
    
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+M - Open Project Manager
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                openProjectManager();
            }
            
            // Ctrl+Shift+S - Preserve current project
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                const preservation = preserveCurrentState('Manual preservation via shortcut');
                if (preservation) {
                    showNotification('💾 Project preserved successfully!', 'success');
                }
            }
            
            // Ctrl+Shift+H - Show help/shortcuts
            if (e.ctrlKey && e.shiftKey && e.key === 'H') {
                e.preventDefault();
                showShortcutHelp();
            }
            
            // Ctrl+Shift+R - Show restore options
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                showRestoreOptions();
            }
        });
        
        console.log('⌨️ Keyboard shortcuts enabled');
    }
    
    function showShortcutHelp() {
        const overlay = document.createElement('div');
        overlay.className = 'pm-shortcut-overlay';
        overlay.style.display = 'flex';
        
        overlay.innerHTML = `
            <div class="pm-shortcut-panel">
                <h2 style="color: #00f593; margin-top: 0;">🎮 Project Manager Shortcuts</h2>
                
                <div style="margin: 20px 0;">
                    <h3 style="color: #05d9e8;">⌨️ Keyboard Shortcuts:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin: 8px 0;"><code style="background: #333; padding: 2px 6px; border-radius: 3px;">Ctrl+Shift+M</code> - Open Project Manager</li>
                        <li style="margin: 8px 0;"><code style="background: #333; padding: 2px 6px; border-radius: 3px;">Ctrl+Shift+S</code> - Preserve Current Project</li>
                        <li style="margin: 8px 0;"><code style="background: #333; padding: 2px 6px; border-radius: 3px;">Ctrl+Shift+R</code> - Show Restore Options</li>
                        <li style="margin: 8px 0;"><code style="background: #333; padding: 2px 6px; border-radius: 3px;">Ctrl+Shift+H</code> - Show This Help</li>
                    </ul>
                </div>
                
                <div style="margin: 20px 0;">
                    <h3 style="color: #ffd700;">💻 Console Commands:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin: 8px 0;"><code style="background: #333; padding: 2px 6px; border-radius: 3px;">preserveProject()</code> - Preserve current state</li>
                        <li style="margin: 8px 0;"><code style="background: #333; padding: 2px 6px; border-radius: 3px;">listPreservations()</code> - List saved states</li>
                        <li style="margin: 8px 0;"><code style="background: #333; padding: 2px 6px; border-radius: 3px;">restoreProject(id)</code> - Restore specific state</li>
                        <li style="margin: 8px 0;"><code style="background: #333; padding: 2px 6px; border-radius: 3px;">openProjectManager()</code> - Open manager</li>
                    </ul>
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #ff206e; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 20px;">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Close on outside click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }
    
    function showRestoreOptions() {
        const preservations = getPreservations();
        
        if (preservations.length === 0) {
            showNotification('📭 No preservations found', 'warning');
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'pm-shortcut-overlay';
        overlay.style.display = 'flex';
        
        const optionsList = preservations.slice(0, 10).map((p, index) => `
            <li style="margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;"
                onclick="restoreProjectFromOverlay('${p.key}', this.parentElement.parentElement.parentElement.parentElement)">
                <strong>${new Date(p.data.timestamp).toLocaleString()}</strong><br>
                <small style="color: #ccc;">${p.data.reason} - ${p.data.title}</small>
            </li>
        `).join('');
        
        overlay.innerHTML = `
            <div class="pm-shortcut-panel">
                <h2 style="color: #00f593; margin-top: 0;">🔙 Restore Options</h2>
                <p style="color: #ccc;">Select a preservation to restore:</p>
                
                <ul style="list-style: none; padding: 0; max-height: 300px; overflow-y: auto;">
                    ${optionsList}
                </ul>
                
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 20px;">
                    Cancel
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Make restore function available globally temporarily
        window.restoreProjectFromOverlay = (key, overlay) => {
            const preservation = JSON.parse(localStorage.getItem(key));
            if (preservation) {
                if (confirm(`Restore from: ${preservation.reason}\nCreated: ${new Date(preservation.timestamp).toLocaleString()}\n\nThis will replace your current work. Continue?`)) {
                    document.open();
                    document.write(preservation.content);
                    document.close();
                }
            }
            overlay.remove();
            delete window.restoreProjectFromOverlay;
        };
    }
    
    function getPreservations() {
        const preservations = [];
        
        for (let key in localStorage) {
            if (key.startsWith('pm_preservation_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    preservations.push({ key, data });
                } catch (error) {
                    console.warn(`Failed to parse preservation: ${key}`);
                }
            }
        }
        
        return preservations.sort((a, b) => b.data.timestamp - a.data.timestamp);
    }
    
    function addConsoleHelpers() {
        // Add global helper functions
        window.openProjectManager = openProjectManager;
        
        window.preserveProject = (reason) => {
            const preservation = preserveCurrentState(reason || 'Manual console preservation');
            if (preservation) {
                console.log('✅ Project preserved:', preservation);
                showNotification('💾 Project preserved!', 'success');
            }
            return preservation;
        };
        
        window.listPreservations = () => {
            const preservations = getPreservations();
            console.table(preservations.map(p => ({
                timestamp: new Date(p.data.timestamp).toLocaleString(),
                reason: p.data.reason,
                title: p.data.title,
                key: p.key
            })));
            return preservations;
        };
        
        window.restoreProject = (key) => {
            if (!key) {
                console.log('Available preservations:');
                return listPreservations();
            }
            
            const preservation = localStorage.getItem(key);
            if (!preservation) {
                console.error(`Preservation not found: ${key}`);
                return false;
            }
            
            try {
                const data = JSON.parse(preservation);
                if (confirm(`Restore from: ${data.reason}\nCreated: ${new Date(data.timestamp).toLocaleString()}\n\nThis will replace your current work. Continue?`)) {
                    document.open();
                    document.write(data.content);
                    document.close();
                    return true;
                }
            } catch (error) {
                console.error('Failed to restore:', error);
            }
            return false;
        };
        
        // Log available commands
        console.log('%c🎮 Project Management Integration Loaded!', 'color: #00f593; font-size: 16px; font-weight: bold;');
        console.log('%cAvailable commands:', 'color: #05d9e8; font-weight: bold;');
        console.log('  openProjectManager() - Open project manager');
        console.log('  preserveProject(reason) - Save current state');
        console.log('  listPreservations() - Show all saved states');
        console.log('  restoreProject(key) - Restore specific state');
        console.log('%cKeyboard shortcuts: Ctrl+Shift+H for help', 'color: #ffd700;');
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `pm-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectManagement);
    } else {
        initProjectManagement();
    }
})();
