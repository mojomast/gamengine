console.log('🎮 Loading Project Management...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 DOM Ready - Setting up Project Management');

    // Add floating action button
    const fab = document.createElement('button');
    fab.style.cssText = `
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
    `;
    fab.innerHTML = '🎮';
    fab.title = 'Open Project Manager (F9)';

    fab.addEventListener('click', function() {
        console.log('🎮 Opening Project Manager via button...');
        window.open('./project-manager.html', 'ProjectManager',
            'width=1400,height=900,menubar=yes,toolbar=yes,scrollbars=yes,resizable=yes');
    });

    document.body.appendChild(fab);

    // Add keyboard shortcuts (using Function keys for maximum compatibility)
    document.addEventListener('keydown', function(e) {
        console.log('🔍 Key event detected:', {
            key: e.key,
            code: e.code,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            which: e.which,
            keyCode: e.keyCode
        });

        // F9 - Open Project Manager
        if (e.key === 'F9' || e.code === 'F9') {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎮 F9 pressed - Opening Project Manager...');
            window.open('./project-manager.html', 'ProjectManager',
                'width=1400,height=900,menubar=yes,toolbar=yes,scrollbars=yes,resizable=yes');
            return false;
        }

        // F10 - Preserve current project
        if (e.key === 'F10' || e.code === 'F10') {
            e.preventDefault();
            e.stopPropagation();
            console.log('💾 F10 pressed - Preserving current project...');

            const preservation = {
                timestamp: Date.now(),
                reason: 'Manual preservation via F10',
                url: window.location.href,
                title: document.title,
                content: document.documentElement.outerHTML
            };

            const key = `pm_preservation_${preservation.timestamp}`;
            localStorage.setItem(key, JSON.stringify(preservation));

            // Show notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 245, 147, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10001;
                font-family: monospace;
                font-size: 14px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            `;
            notification.textContent = '💾 Project preserved successfully!';
            document.body.appendChild(notification);

            setTimeout(() => notification.remove(), 3000);
            return false;
        }

        // F11 - Show restore options (but check for conflicts)
        if (e.key === 'F8' || e.code === 'F8') {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔙 F8 pressed - Showing restore options...');

            const preservations = [];
            for (let key in localStorage) {
                if (key.startsWith('pm_preservation_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        preservations.push({ key, data });
                    } catch (error) {
                        console.warn('Failed to parse preservation:', key);
                    }
                }
            }

            if (preservations.length === 0) {
                alert('No preserved projects found. Use F10 to preserve your current work first.');
                return false;
            }

            preservations.sort((a, b) => b.data.timestamp - a.data.timestamp);

            let message = 'Available preservations:\\n\\n';
            preservations.slice(0, 5).forEach((p, index) => {
                message += `${index + 1}. ${new Date(p.data.timestamp).toLocaleString()} - ${p.data.reason}\\n`;
            });

            const choice = prompt(message + '\\nEnter number to restore (or cancel):');
            if (choice && !isNaN(choice)) {
                const selected = preservations[parseInt(choice) - 1];
                if (selected) {
                    if (confirm(`Restore from: ${selected.data.reason}\\nCreated: ${new Date(selected.data.timestamp).toLocaleString()}\\n\\nThis will replace your current work. Continue?`)) {
                        document.open();
                        document.write(selected.data.content);
                        document.close();
                    }
                }
            }
            return false;
        }

        // Also add a simple key test - press 'T' to test
        if (e.key === 't' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
            console.log('✅ Test key (T) works! Keyboard events are functioning.');

            const testNotif = document.createElement('div');
            testNotif.style.cssText = `
                position: fixed;
                top: 60px;
                right: 20px;
                background: rgba(0, 150, 255, 0.9);
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                z-index: 10001;
                font-family: monospace;
                font-size: 12px;
            `;
            testNotif.textContent = '✅ Keyboard test successful!';
            document.body.appendChild(testNotif);
            setTimeout(() => testNotif.remove(), 2000);
        }
    });

    console.log('✅ Project Management shortcuts active!');
    console.log('💡 Shortcuts: F9 (Manager), F10 (Save), F8 (Restore)');
    console.log('💡 Test: Press T to test if keyboard events work');
});