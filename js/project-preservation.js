/**
 * Enhanced Project Preservation and State Management System
 * Advanced preservation with intelligent state management, conflict resolution, and recovery
 */

class ProjectPreservation {
    constructor() {
        this.preservedProjects = new Map();
        this.migrationHistory = [];
        this.autoBackupEnabled = true;
        this.preservationPath = 'preserved-projects/';
        this.knownProjects = this.loadKnownProjects();

        // Enhanced state management
        this.stateSnapshots = new Map();
        this.conflictResolver = new ConflictResolver();
        this.recoveryManager = new RecoveryManager();
        this.stateValidator = new StateValidator();

        this.init();
    }

    // Load known projects from localStorage or use defaults
    loadKnownProjects() {
        try {
            const stored = localStorage.getItem('gameEngineKnownProjects');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load known projects from localStorage:', error);
        }

        // Default known projects
        const defaults = [
            {
                id: 'poker-doom-main',
                name: 'Poker Doom: Mundane Apocalypse',
                path: './index.html',
                type: 'main-project',
                discovered: Date.now(),
                description: 'Your main Poker Doom game project'
            },
            {
                id: 'game-engine-demo',
                name: 'Game Engine Demo',
                path: './game-engine/index.html',
                type: 'engine-demo',
                discovered: Date.now(),
                description: 'Game engine demonstration project'
            }
        ];

        // Save defaults to localStorage
        localStorage.setItem('gameEngineKnownProjects', JSON.stringify(defaults));
        return defaults;
    }

    // Register a new project manually
    registerProject(projectData) {
        const project = {
            id: projectData.id || `manual_${Date.now()}`,
            name: projectData.name,
            path: projectData.path,
            type: projectData.type || 'manual',
            content: projectData.content || null,
            discovered: Date.now(),
            description: projectData.description || 'Manually registered project'
        };

        // Add to known projects
        this.knownProjects.push(project);

        // Save to localStorage
        localStorage.setItem('gameEngineKnownProjects', JSON.stringify(this.knownProjects));

        console.log(`📝 Registered new project: ${project.name}`);
        return project.id;
    }

    async init() {
        console.log('🛡️ Initializing Project Preservation System...');

        // Check for existing projects that need preservation
        // Uses localStorage fallback for CORS-limited environments (file:// protocol)
        await this.scanExistingProjects();

        // Setup auto-backup system
        if (this.autoBackupEnabled) {
            this.setupAutoBackup();
        }

        console.log('✅ Project Preservation System ready');
    }

    // Scan for existing projects in the workspace
    async scanExistingProjects() {
        const existingProjects = [];

        // Load known projects from localStorage (fallback for fetch limitations)
        for (const project of this.knownProjects) {
            let content = null;

            // Try to fetch content if fetch is available and not blocked by CORS
            if (typeof fetch !== 'undefined' && window.location.protocol !== 'file:') {
                try {
                    const response = await fetch(project.path);
                    if (response.ok) {
                        content = await response.text();
                        // Content fetched successfully (operation completed silently)
                    }
                } catch (error) {
                    // Silently handle CORS errors - fallback to localStorage works without fetch
                }
            } else {
                // Fetch API not available or running from file:// protocol, proceeding with localStorage fallback
            }

            // Add project with content if available
            existingProjects.push({
                ...project,
                content: content
            });
        }

        // Store discovered projects
        existingProjects.forEach(project => {
            this.preservedProjects.set(project.id, project);
        });

        console.log(`📦 Discovered ${existingProjects.length} existing projects`);
        return existingProjects;
    }

    // Preserve current project state
    async preserveCurrentProject(projectName = 'Current Project') {
        const timestamp = Date.now();
        const preservationId = `preserved_${timestamp}`;
        
        const preservation = {
            id: preservationId,
            name: projectName,
            timestamp: timestamp,
            type: 'manual-preservation',
            files: new Map(),
            metadata: {
                preservedAt: new Date(timestamp).toISOString(),
                reason: 'Manual preservation before creating new project',
                originalLocation: window.location.href
            }
        };

        // Capture current HTML state
        preservation.files.set('index.html', document.documentElement.outerHTML);
        
        // Store preservation
        this.preservedProjects.set(preservationId, preservation);
        await this.savePreservations();
        
        // Log migration
        this.migrationHistory.push({
            timestamp,
            action: 'preserve',
            projectId: preservationId,
            projectName: projectName
        });

        console.log(`🔒 Project "${projectName}" preserved with ID: ${preservationId}`);
        return preservationId;
    }

    // Restore a preserved project
    async restoreProject(preservationId) {
        const preservation = this.preservedProjects.get(preservationId);
        if (!preservation) {
            throw new Error(`Preservation ${preservationId} not found`);
        }

        // Create restoration data
        const restorationData = {
            id: preservation.id,
            name: preservation.name,
            files: preservation.files,
            metadata: preservation.metadata,
            restoredAt: Date.now()
        };

        // Log restoration
        this.migrationHistory.push({
            timestamp: Date.now(),
            action: 'restore',
            projectId: preservationId,
            projectName: preservation.name
        });

        console.log(`🔄 Restored project: ${preservation.name}`);
        return restorationData;
    }

    // Create a safe migration checkpoint
    async createMigrationCheckpoint(description = 'Migration checkpoint') {
        const checkpoint = {
            id: `checkpoint_${Date.now()}`,
            description,
            timestamp: Date.now(),
            projectState: document.documentElement.outerHTML,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Store checkpoint
        const checkpoints = this.getCheckpoints();
        checkpoints.push(checkpoint);
        localStorage.setItem('gameEngineCheckpoints', JSON.stringify(checkpoints));

        console.log(`📍 Migration checkpoint created: ${description}`);
        return checkpoint.id;
    }

    // Get all checkpoints
    getCheckpoints() {
        try {
            const checkpoints = localStorage.getItem('gameEngineCheckpoints');
            return checkpoints ? JSON.parse(checkpoints) : [];
        } catch (error) {
            console.error('Failed to load checkpoints:', error);
            return [];
        }
    }

    // Setup automatic backup system
    setupAutoBackup() {
        // Backup every 5 minutes
        setInterval(async () => {
            await this.createAutoBackup();
        }, 5 * 60 * 1000);

        // Backup before page unload
        window.addEventListener('beforeunload', async () => {
            await this.createAutoBackup('Before page unload');
        });

        console.log('🔄 Auto-backup system activated');
    }

    // Create automatic backup
    async createAutoBackup(reason = 'Automatic backup') {
        try {
            const backupId = `autobackup_${Date.now()}`;
            const backup = {
                id: backupId,
                reason,
                timestamp: Date.now(),
                content: document.documentElement.outerHTML,
                url: window.location.href
            };

            // Store backup
            const backups = this.getAutoBackups();
            backups.push(backup);
            
            // Keep only last 20 auto-backups
            const trimmedBackups = backups.slice(-20);
            localStorage.setItem('gameEngineAutoBackups', JSON.stringify(trimmedBackups));

            console.log(`💾 Auto-backup created: ${reason}`);
        } catch (error) {
            console.error('Auto-backup failed:', error);
        }
    }

    // Get auto-backups
    getAutoBackups() {
        try {
            const backups = localStorage.getItem('gameEngineAutoBackups');
            return backups ? JSON.parse(backups) : [];
        } catch (error) {
            return [];
        }
    }

    // Enhanced save preservations with validation and error recovery
    async savePreservations() {
        try {
            const preservationsData = {};

            this.preservedProjects.forEach((preservation, id) => {
                const preservationCopy = { ...preservation };
                // Convert Map to Object for JSON serialization
                if (preservation.files instanceof Map) {
                    preservationCopy.files = Object.fromEntries(preservation.files);
                }
                preservationsData[id] = preservationCopy;
            });

            // Add validation data
            const saveData = {
                data: preservationsData,
                metadata: {
                    version: '2.0.0',
                    savedAt: Date.now(),
                    checksum: this.generateChecksum(preservationsData),
                    count: Object.keys(preservationsData).length
                }
            };

            // Save to localStorage with backup
            const existingData = localStorage.getItem('gameEnginePreservations');
            if (existingData) {
                localStorage.setItem('gameEnginePreservations.backup', existingData);
            }

            localStorage.setItem('gameEnginePreservations', JSON.stringify(saveData));
            localStorage.setItem('gameEngineMigrationHistory', JSON.stringify(this.migrationHistory));

            console.log(`💾 Preservations saved successfully (${Object.keys(preservationsData).length} projects)`);
            return true;

        } catch (error) {
            console.error('Failed to save preservations:', error);
            // Attempt recovery from backup
            await this.attemptRecovery();
            return false;
        }
    }

    // Enhanced load preservations with validation and recovery
    async loadPreservations() {
        try {
            const preservationsData = localStorage.getItem('gameEnginePreservations');
            if (preservationsData) {
                const parsed = JSON.parse(preservationsData);

                // Handle new format with metadata
                const data = parsed.data || parsed;
                const metadata = parsed.metadata;

                // Validate data integrity if metadata exists
                if (metadata && metadata.checksum) {
                    const calculatedChecksum = this.generateChecksum(data);
                    if (calculatedChecksum !== metadata.checksum) {
                        console.warn('Data integrity check failed, attempting recovery...');
                        return await this.attemptRecovery();
                    }
                }

                Object.entries(data).forEach(([id, preservation]) => {
                    // Convert files Object back to Map
                    if (preservation.files && typeof preservation.files === 'object') {
                        preservation.files = new Map(Object.entries(preservation.files));
                    }
                    this.preservedProjects.set(id, preservation);
                });

                console.log(`📦 Loaded ${this.preservedProjects.size} preserved projects`);
            }

            const historyData = localStorage.getItem('gameEngineMigrationHistory');
            if (historyData) {
                this.migrationHistory = JSON.parse(historyData);
            }
        } catch (error) {
            console.error('Failed to load preservations:', error);
            await this.attemptRecovery();
        }
    }

    // Get preservation statistics
    getPreservationStats() {
        const totalPreservations = this.preservedProjects.size;
        const autoBackups = this.getAutoBackups().length;
        const checkpoints = this.getCheckpoints().length;
        
        // Calculate storage usage
        let storageUsed = 0;
        for (let key in localStorage) {
            if (key.startsWith('gameEngine')) {
                storageUsed += localStorage[key].length;
            }
        }

        return {
            totalPreservations,
            autoBackups,
            checkpoints,
            storageUsed: Math.round(storageUsed / 1024), // KB
            lastBackup: this.getLastBackupTime(),
            migrationCount: this.migrationHistory.length
        };
    }

    getLastBackupTime() {
        const backups = this.getAutoBackups();
        if (backups.length === 0) return null;
        
        const lastBackup = backups[backups.length - 1];
        return lastBackup.timestamp;
    }

    // Export preservation data
    async exportPreservationData() {
        const exportData = {
            preservations: Object.fromEntries(this.preservedProjects),
            migrationHistory: this.migrationHistory,
            autoBackups: this.getAutoBackups(),
            checkpoints: this.getCheckpoints(),
            exportedAt: Date.now(),
            version: '1.0.0'
        };

        // Convert Maps to Objects for serialization
        Object.values(exportData.preservations).forEach(preservation => {
            if (preservation.files instanceof Map) {
                preservation.files = Object.fromEntries(preservation.files);
            }
        });

        return JSON.stringify(exportData, null, 2);
    }

    // Import preservation data
    async importPreservationData(data) {
        try {
            const importData = typeof data === 'string' ? JSON.parse(data) : data;
            
            // Import preservations
            Object.entries(importData.preservations || {}).forEach(([id, preservation]) => {
                if (preservation.files && typeof preservation.files === 'object') {
                    preservation.files = new Map(Object.entries(preservation.files));
                }
                this.preservedProjects.set(id, preservation);
            });

            // Import migration history
            if (importData.migrationHistory) {
                this.migrationHistory.push(...importData.migrationHistory);
            }

            await this.savePreservations();
            console.log('📥 Preservation data imported successfully');
            
        } catch (error) {
            throw new Error(`Failed to import preservation data: ${error.message}`);
        }
    }

    // Clean old data
    cleanOldData(daysToKeep = 30) {
        const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        
        // Clean old preservations
        let cleanedCount = 0;
        this.preservedProjects.forEach((preservation, id) => {
            if (preservation.timestamp < cutoffTime && preservation.type === 'auto-backup') {
                this.preservedProjects.delete(id);
                cleanedCount++;
            }
        });

        // Clean old auto-backups
        const backups = this.getAutoBackups();
        const filteredBackups = backups.filter(backup => backup.timestamp >= cutoffTime);
        localStorage.setItem('gameEngineAutoBackups', JSON.stringify(filteredBackups));

        // Clean old checkpoints
        const checkpoints = this.getCheckpoints();
        const filteredCheckpoints = checkpoints.filter(checkpoint => checkpoint.timestamp >= cutoffTime);
        localStorage.setItem('gameEngineCheckpoints', JSON.stringify(filteredCheckpoints));

        console.log(`🧹 Cleaned ${cleanedCount} old preservation entries`);
        return cleanedCount;
    }

    // Recovery utilities
    async emergencyRestore() {
        console.log('🚨 Emergency restore initiated...');
        
        // Try to restore from latest auto-backup
        const backups = this.getAutoBackups();
        if (backups.length > 0) {
            const latestBackup = backups[backups.length - 1];
            console.log(`🔄 Restoring from backup: ${new Date(latestBackup.timestamp).toLocaleString()}`);
            
            // Replace current document with backup
            document.open();
            document.write(latestBackup.content);
            document.close();
            
            return true;
        }

        console.log('❌ No backups available for emergency restore');
        return false;
    }

    // Get recovery options
    getRecoveryOptions() {
        const options = [];

        // Add preserved projects
        this.preservedProjects.forEach((preservation, id) => {
            options.push({
                id,
                type: 'preservation',
                name: preservation.name,
                timestamp: preservation.timestamp,
                description: preservation.metadata?.reason || 'Preserved project'
            });
        });

        // Add auto-backups
        const backups = this.getAutoBackups();
        backups.forEach(backup => {
            options.push({
                id: backup.id,
                type: 'auto-backup',
                name: `Auto Backup - ${backup.reason}`,
                timestamp: backup.timestamp,
                description: `Automatic backup created at ${new Date(backup.timestamp).toLocaleString()}`
            });
        });

        // Add checkpoints
        const checkpoints = this.getCheckpoints();
        checkpoints.forEach(checkpoint => {
            options.push({
                id: checkpoint.id,
                type: 'checkpoint',
                name: `Checkpoint - ${checkpoint.description}`,
                timestamp: checkpoint.timestamp,
                description: checkpoint.description
            });
        });

        // Sort by timestamp (newest first)
        return options.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Utility method to generate checksum for data integrity
    generateChecksum(data) {
        const str = JSON.stringify(data, Object.keys(data).sort());
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // Attempt recovery from backup data
    async attemptRecovery() {
        try {
            const backupData = localStorage.getItem('gameEnginePreservations.backup');
            if (backupData) {
                console.log('🔄 Attempting recovery from backup...');
                const parsed = JSON.parse(backupData);
                const data = parsed.data || parsed;

                Object.entries(data).forEach(([id, preservation]) => {
                    if (preservation.files && typeof preservation.files === 'object') {
                        preservation.files = new Map(Object.entries(preservation.files));
                    }
                    this.preservedProjects.set(id, preservation);
                });

                console.log('✅ Recovery successful from backup');
                return true;
            }
        } catch (error) {
            console.error('Recovery failed:', error);
        }
        return false;
    }
}

// Enhanced State Management Components

class StateValidator {
    constructor() {
        this.validationRules = new Map();
        this.setupDefaultRules();
    }

    setupDefaultRules() {
        // HTML validation
        this.validationRules.set('html', {
            validate: (content) => {
                if (!content || typeof content !== 'string') return false;
                return content.includes('<html') && content.includes('</html>');
            },
            error: 'Invalid HTML content'
        });

        // JSON validation
        this.validationRules.set('json', {
            validate: (content) => {
                try {
                    JSON.parse(content);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            error: 'Invalid JSON content'
        });

        // JavaScript validation
        this.validationRules.set('javascript', {
            validate: (content) => {
                // Basic syntax check
                try {
                    new Function(content);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            error: 'Invalid JavaScript syntax'
        });
    }

    validateState(state) {
        const errors = [];

        // Validate basic structure
        if (!state.id) errors.push('Missing state ID');
        if (!state.timestamp) errors.push('Missing timestamp');
        if (!state.files || typeof state.files !== 'object') errors.push('Invalid files structure');

        // Validate files
        if (state.files) {
            for (const [path, content] of Object.entries(state.files)) {
                const fileType = this.detectFileType(path);
                const rule = this.validationRules.get(fileType);

                if (rule && !rule.validate(content)) {
                    errors.push(`${path}: ${rule.error}`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    detectFileType(path) {
        const ext = path.split('.').pop().toLowerCase();
        switch (ext) {
            case 'html': return 'html';
            case 'js': case 'javascript': return 'javascript';
            case 'json': return 'json';
            default: return 'unknown';
        }
    }
}

class ConflictResolver {
    constructor() {
        this.resolutionStrategies = {
            'newer-wins': (local, remote) => local.timestamp > remote.timestamp ? local : remote,
            'manual': (local, remote) => null, // Requires manual intervention
            'merge': (local, remote) => this.mergeStates(local, remote)
        };
    }

    detectConflicts(localState, remoteState) {
        const conflicts = [];

        // Check file conflicts
        const localFiles = Object.keys(localState.files || {});
        const remoteFiles = Object.keys(remoteState.files || {});

        for (const file of localFiles) {
            if (remoteFiles.includes(file)) {
                const localContent = localState.files[file];
                const remoteContent = remoteState.files[file];

                if (localContent !== remoteContent) {
                    conflicts.push({
                        type: 'file',
                        file,
                        local: localContent,
                        remote: remoteContent
                    });
                }
            }
        }

        return conflicts;
    }

    resolveConflict(conflict, strategy = 'newer-wins') {
        const resolver = this.resolutionStrategies[strategy];
        if (!resolver) {
            throw new Error(`Unknown resolution strategy: ${strategy}`);
        }

        return resolver(conflict.local, conflict.remote);
    }

    mergeStates(localState, remoteState) {
        const merged = {
            ...localState,
            files: { ...localState.files }
        };

        // Merge files, preferring newer timestamps
        Object.entries(remoteState.files || {}).forEach(([path, content]) => {
            if (!merged.files[path] || remoteState.timestamp > localState.timestamp) {
                merged.files[path] = content;
            }
        });

        merged.mergedFrom = {
            local: localState.id,
            remote: remoteState.id,
            timestamp: Date.now()
        };

        return merged;
    }
}

class RecoveryManager {
    constructor() {
        this.recoveryStrategies = new Map();
        this.setupRecoveryStrategies();
    }

    setupRecoveryStrategies() {
        this.recoveryStrategies.set('incremental', this.incrementalRecovery.bind(this));
        this.recoveryStrategies.set('checkpoint', this.checkpointRecovery.bind(this));
        this.recoveryStrategies.set('backup-chain', this.backupChainRecovery.bind(this));
    }

    async recoverFromCorruption(strategy = 'incremental') {
        const recoveryFn = this.recoveryStrategies.get(strategy);
        if (!recoveryFn) {
            throw new Error(`Unknown recovery strategy: ${strategy}`);
        }

        return await recoveryFn();
    }

    async incrementalRecovery() {
        // Try to recover by rebuilding from known good states
        const backups = this.getAutoBackups();
        const checkpoints = this.getCheckpoints();

        // Find the most recent valid backup
        for (const backup of backups.reverse()) {
            if (this.validateBackup(backup)) {
                return this.restoreFromBackup(backup);
            }
        }

        // Fall back to checkpoints
        for (const checkpoint of checkpoints.reverse()) {
            if (this.validateCheckpoint(checkpoint)) {
                return this.restoreFromCheckpoint(checkpoint);
            }
        }

        throw new Error('No valid recovery point found');
    }

    async checkpointRecovery() {
        const checkpoints = this.getCheckpoints();
        if (checkpoints.length === 0) {
            throw new Error('No checkpoints available');
        }

        const latestCheckpoint = checkpoints[checkpoints.length - 1];
        return this.restoreFromCheckpoint(latestCheckpoint);
    }

    async backupChainRecovery() {
        const backups = this.getAutoBackups();
        if (backups.length < 2) {
            throw new Error('Insufficient backup history for chain recovery');
        }

        // Try to reconstruct state from backup chain
        let reconstructedState = null;
        for (const backup of backups.slice(-5)) { // Use last 5 backups
            if (this.validateBackup(backup)) {
                if (!reconstructedState) {
                    reconstructedState = backup;
                } else {
                    reconstructedState = this.mergeBackupStates(reconstructedState, backup);
                }
            }
        }

        if (reconstructedState) {
            return this.restoreFromBackup(reconstructedState);
        }

        throw new Error('Failed to reconstruct state from backup chain');
    }

    validateBackup(backup) {
        return backup && backup.content && backup.timestamp;
    }

    validateCheckpoint(checkpoint) {
        return checkpoint && checkpoint.projectState && checkpoint.timestamp;
    }

    restoreFromBackup(backup) {
        document.open();
        document.write(backup.content);
        document.close();
        return true;
    }

    restoreFromCheckpoint(checkpoint) {
        document.open();
        document.write(checkpoint.projectState);
        document.close();
        return true;
    }

    mergeBackupStates(state1, state2) {
        // Simple merge preferring newer state
        return state1.timestamp > state2.timestamp ? state1 : state2;
    }

    getAutoBackups() {
        try {
            const backups = localStorage.getItem('gameEngineAutoBackups');
            return backups ? JSON.parse(backups) : [];
        } catch (e) {
            return [];
        }
    }

    getCheckpoints() {
        try {
            const checkpoints = localStorage.getItem('gameEngineCheckpoints');
            return checkpoints ? JSON.parse(checkpoints) : [];
        } catch (e) {
            return [];
        }
    }
}

// Enhanced State Snapshot System
class StateSnapshot {
    constructor(projectId, name = 'Auto Snapshot') {
        this.id = this.generateId();
        this.projectId = projectId;
        this.name = name;
        this.timestamp = Date.now();
        this.state = this.captureCurrentState();
        this.metadata = this.captureMetadata();
        this.checksum = this.generateChecksum();
    }

    captureCurrentState() {
        return {
            html: document.documentElement.outerHTML,
            url: window.location.href,
            title: document.title,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }

    captureMetadata() {
        return {
            userAgent: navigator.userAgent,
            cookies: document.cookie,
            localStorage: this.sanitizeStorage(localStorage),
            sessionStorage: this.sanitizeStorage(sessionStorage)
        };
    }

    sanitizeStorage(storage) {
        const sanitized = {};
        for (let key in storage) {
            if (key.startsWith('gameEngine') || key.startsWith('pm_')) {
                sanitized[key] = storage[key];
            }
        }
        return sanitized;
    }

    generateChecksum() {
        const data = JSON.stringify({
            state: this.state,
            metadata: this.metadata,
            timestamp: this.timestamp
        });
        return this.simpleHash(data);
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    validate() {
        const currentChecksum = this.generateChecksum();
        return currentChecksum === this.checksum;
    }

    generateId() {
        return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    toJSON() {
        return {
            id: this.id,
            projectId: this.projectId,
            name: this.name,
            timestamp: this.timestamp,
            state: this.state,
            metadata: this.metadata,
            checksum: this.checksum
        };
    }

    static fromJSON(data) {
        const snapshot = Object.assign(new StateSnapshot('', ''), data);
        return snapshot;
    }
}

// Make components globally available
window.ProjectPreservation = ProjectPreservation;
window.StateValidator = StateValidator;
window.ConflictResolver = ConflictResolver;
window.RecoveryManager = RecoveryManager;
window.StateSnapshot = StateSnapshot;
