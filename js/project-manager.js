/**
 * Game Engine Project Manager
 * Handles project creation, saving, loading, and management
 */

class ProjectManager {
    constructor() {
        this.projects = new Map();
        this.currentProject = null;
        this.templates = new Map();
        this.settings = {
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            maxBackups: 10,
            compressionEnabled: true
        };
        
        this.init();
    }

    async init() {
        // Load existing projects and settings
        await this.loadProjects();
        await this.loadSettings();
        this.initializeTemplates();
        this.setupEventListeners();
        this.updateUI();
        
        // Start auto-save if enabled
        if (this.settings.autoSave) {
            this.startAutoSave();
        }
        
        console.log('Project Manager initialized successfully');
    }

    // Enhanced Template Management
    initializeTemplates() {
        // Initialize built-in templates
        this.initializeBuiltInTemplates();

        // Load custom templates
        this.loadCustomTemplates();
    }

    initializeBuiltInTemplates() {
        // Blank Project Template
        this.templates.set('blank', {
            id: 'blank',
            name: 'Blank Project',
            description: 'Start from scratch with an empty canvas',
            icon: '📄',
            files: {
                'index.html': this.getBlankHTMLTemplate(),
                'js/main.js': this.getBlankJSTemplate(),
                'css/style.css': this.getBlankCSSTemplate(),
                'README.md': this.getReadmeTemplate()
            },
            config: {
                engine: 'custom',
                version: '1.0.0'
            }
        });

        // Poker Game Template (based on your current index.html)
        this.templates.set('poker-game', {
            id: 'poker-game',
            name: 'Poker Game',
            description: 'Card-based game with combat mechanics',
            icon: '🃏',
            files: {
                'index.html': this.getPokerGameTemplate(),
                'js/main.js': '// Poker game logic goes here',
                'css/style.css': '/* Poker game styles */',
                'README.md': '# Poker Game\n\nA card-based combat game.'
            },
            config: {
                engine: 'custom',
                version: '1.0.0',
                gameType: 'card-game'
            }
        });

        // Game Engine Template (based on your game-engine)
        this.templates.set('game-engine', {
            id: 'game-engine',
            name: 'Full Game Engine',
            description: 'Complete game engine with all systems',
            icon: '🎮',
            files: {
                'index.html': this.getGameEngineTemplate(),
                'js/GameEngine.js': '// Full game engine implementation',
                'js/main.js': '// Game logic using the engine',
                'css/style.css': '/* Game engine styles */',
                'README.md': '# Game Engine Project\n\nBuilt with the comprehensive game engine.'
            },
            config: {
                engine: 'full-engine',
                version: '2.0.0',
                features: ['dialogs', 'inventory', 'characters', 'animations']
            }
        });

        // Platformer Template
        this.templates.set('platformer', {
            id: 'platformer',
            name: 'Platformer Game',
            description: 'Side-scrolling platformer with physics',
            icon: '🏃',
            files: {
                'index.html': this.getPlatformerTemplate(),
                'js/main.js': this.getPlatformerJSTemplate(),
                'css/style.css': this.getPlatformerCSSTemplate(),
                'README.md': '# Platformer Game\n\nA classic side-scrolling platformer.'
            },
            config: {
                engine: 'physics',
                version: '1.0.0',
                gameType: 'platformer'
            }
        });

        // RPG Template
        this.templates.set('rpg', {
            id: 'rpg',
            name: 'RPG Adventure',
            description: 'Role-playing game with character progression',
            icon: '⚔️',
            files: {
                'index.html': this.getRPGTemplate(),
                'js/main.js': this.getRPGJSTemplate(),
                'css/style.css': this.getRPGCSSTemplate(),
                'data/characters.json': '{}',
                'data/items.json': '{}',
                'README.md': '# RPG Adventure\n\nAn epic role-playing adventure.'
            },
            config: {
                engine: 'rpg-engine',
                version: '1.0.0',
                gameType: 'rpg',
                features: ['inventory', 'character-stats', 'dialog-system']
            }
        });

        // Strategy Game Template
        this.templates.set('strategy', {
            id: 'strategy',
            name: 'Strategy Game',
            description: 'Turn-based strategy with resource management',
            icon: '🏰',
            files: {
                'index.html': this.getStrategyTemplate(),
                'js/main.js': this.getStrategyJSTemplate(),
                'css/style.css': this.getStrategyCSSTemplate(),
                'data/units.json': '[]',
                'data/buildings.json': '[]',
                'README.md': '# Strategy Game\n\nCommand your forces to victory.'
            },
            config: {
                engine: 'strategy-engine',
                version: '1.0.0',
                gameType: 'strategy',
                features: ['grid-system', 'resource-management', 'unit-ai']
            }
        });

        // Puzzle Game Template
        this.templates.set('puzzle', {
            id: 'puzzle',
            name: 'Puzzle Game',
            description: 'Brain-teasing puzzles with elegant mechanics',
            icon: '🧩',
            files: {
                'index.html': this.getPuzzleTemplate(),
                'js/main.js': this.getPuzzleJSTemplate(),
                'css/style.css': this.getPuzzleCSSTemplate(),
                'data/levels.json': '[]',
                'README.md': '# Puzzle Game\n\nChallenge your mind with clever puzzles.'
            },
            config: {
                engine: 'puzzle-engine',
                version: '1.0.0',
                gameType: 'puzzle',
                features: ['level-system', 'hint-system', 'progress-tracking']
            }
        });

        // Racing Game Template
        this.templates.set('racing', {
            id: 'racing',
            name: 'Racing Game',
            description: 'High-speed racing with customizable vehicles',
            icon: '🏎️',
            files: {
                'index.html': this.getRacingTemplate(),
                'js/main.js': this.getRacingJSTemplate(),
                'css/style.css': this.getRacingCSSTemplate(),
                'data/tracks.json': '[]',
                'data/vehicles.json': '[]',
                'README.md': '# Racing Game\n\nSpeed through tracks and compete for victory.'
            },
            config: {
                engine: 'racing-engine',
                version: '1.0.0',
                gameType: 'racing',
                features: ['physics-engine', 'track-editor', 'multiplayer']
            }
        });

        // Simulation Game Template
        this.templates.set('simulation', {
            id: 'simulation',
            name: 'Simulation Game',
            description: 'Build and manage complex systems',
            icon: '🏗️',
            files: {
                'index.html': this.getSimulationTemplate(),
                'js/main.js': this.getSimulationJSTemplate(),
                'css/style.css': this.getSimulationCSSTemplate(),
                'data/scenarios.json': '[]',
                'README.md': '# Simulation Game\n\nBuild, manage, and optimize complex systems.'
            },
            config: {
                engine: 'simulation-engine',
                version: '1.0.0',
                gameType: 'simulation',
                features: ['system-modeling', 'optimization', 'scenario-editor']
            }
        });
    }

    // Enhanced project creation with validation
    async createProject(projectData) {
        // Validate project data
        const validation = this.validateProjectData(projectData);
        if (!validation.valid) {
            throw new Error(`Project validation failed: ${validation.errors.join(', ')}`);
        }

        const projectId = this.generateProjectId();
        const timestamp = Date.now();

        const project = {
            id: projectId,
            name: projectData.name.trim(),
            description: projectData.description?.trim() || '',
            template: projectData.template,
            created: timestamp,
            modified: timestamp,
            version: '1.0.0',
            status: 'active',
            files: new Map(),
            config: {},
            metadata: {
                author: 'Game Developer',
                tags: projectData.tags || [],
                screenshots: [],
                playable: false,
                dependencies: projectData.dependencies || [],
                categories: projectData.categories || []
            }
        };

        // Apply template with error handling
        if (projectData.template && this.templates.has(projectData.template)) {
            try {
                const template = this.templates.get(projectData.template);

                // Copy template files
                Object.entries(template.files).forEach(([path, content]) => {
                    project.files.set(path, content);
                });

                // Copy template config
                project.config = { ...template.config };

                // Add template-specific metadata
                if (template.icon) {
                    project.metadata.icon = template.icon;
                }
            } catch (error) {
                console.warn(`Failed to apply template ${projectData.template}:`, error);
                // Continue with empty project
            }
        }

        // Save project with error handling
        try {
            this.projects.set(projectId, project);
            await this.saveProjects();

            // Add to recent activity
            this.addActivity(`Created new project: ${project.name}`, 'create');

            console.log(`✅ Project "${project.name}" created successfully`);
            return project;
        } catch (error) {
            // Rollback on failure
            this.projects.delete(projectId);
            throw new Error(`Failed to save project: ${error.message}`);
        }
    }

    async saveProject(projectId, projectData) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const project = this.projects.get(projectId);
        
        // Update project data
        Object.assign(project, {
            ...projectData,
            modified: Date.now()
        });

        // Save to storage
        await this.saveProjects();
        
        // Add to recent activity
        this.addActivity(`Saved project: ${project.name}`, 'save');
        
        return project;
    }

    async loadProject(projectId) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const project = this.projects.get(projectId);
        this.currentProject = project;
        
        // Add to recent activity
        this.addActivity(`Opened project: ${project.name}`, 'open');
        
        return project;
    }

    async deleteProject(projectId) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const project = this.projects.get(projectId);
        
        // Create backup before deletion
        await this.createBackup(projectId);
        
        // Remove project
        this.projects.delete(projectId);
        await this.saveProjects();
        
        // Add to recent activity
        this.addActivity(`Deleted project: ${project.name}`, 'delete');
        
        return true;
    }

    async duplicateProject(projectId, newName) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const originalProject = this.projects.get(projectId);
        const newProjectId = this.generateProjectId();
        
        const duplicatedProject = {
            ...JSON.parse(JSON.stringify(originalProject)),
            id: newProjectId,
            name: newName || `${originalProject.name} (Copy)`,
            created: Date.now(),
            modified: Date.now()
        };

        // Convert files back to Map
        duplicatedProject.files = new Map(Object.entries(duplicatedProject.files));
        
        this.projects.set(newProjectId, duplicatedProject);
        await this.saveProjects();
        
        // Add to recent activity
        this.addActivity(`Duplicated project: ${originalProject.name}`, 'duplicate');
        
        return duplicatedProject;
    }

    // File Management within Projects
    updateProjectFile(projectId, filePath, content) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const project = this.projects.get(projectId);
        project.files.set(filePath, content);
        project.modified = Date.now();
        
        return true;
    }

    getProjectFile(projectId, filePath) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const project = this.projects.get(projectId);
        return project.files.get(filePath) || null;
    }

    // Storage Management
    async saveProjects() {
        const projectsData = {};
        
        this.projects.forEach((project, id) => {
            // Convert Map to Object for JSON serialization
            const projectCopy = { ...project };
            projectCopy.files = Object.fromEntries(project.files);
            projectsData[id] = projectCopy;
        });

        localStorage.setItem('gameEngineProjects', JSON.stringify(projectsData));
        localStorage.setItem('gameEngineProjectsBackup', JSON.stringify({
            data: projectsData,
            timestamp: Date.now()
        }));
    }

    async loadProjects() {
        try {
            const projectsData = localStorage.getItem('gameEngineProjects');
            if (projectsData) {
                const parsed = JSON.parse(projectsData);
                
                Object.entries(parsed).forEach(([id, project]) => {
                    // Convert files Object back to Map
                    project.files = new Map(Object.entries(project.files || {}));
                    
                    // Mark as modular if it has the new structure
                    if (project.structure && project.compatibility) {
                        project.modular = true;
                        project.isGameEngine = true;
                    }
                    
                    this.projects.set(id, project);
                });
            }
            
            // Also check for latest saves from game engine
            const latestSave = localStorage.getItem('pm_latest_save');
            if (latestSave) {
                try {
                    const parsed = JSON.parse(latestSave);
                    if (parsed.projectId && parsed.data && !this.projects.has(parsed.projectId)) {
                        // Add latest save as a project if not already loaded
                        const project = parsed.data;
                        project.modular = true;
                        project.isGameEngine = true;
                        if (project.files) {
                            project.files = new Map(Object.entries(project.files));
                        }
                        this.projects.set(parsed.projectId, project);
                    }
                } catch (e) {
                    console.log('Could not parse latest save:', e);
                }
            }
            
        } catch (error) {
            console.error('Failed to load projects:', error);
            // Try to load from backup
            await this.loadFromBackup();
        }
    }

    async loadFromBackup() {
        try {
            const backupData = localStorage.getItem('gameEngineProjectsBackup');
            if (backupData) {
                const backup = JSON.parse(backupData);
                
                Object.entries(backup.data).forEach(([id, project]) => {
                    project.files = new Map(Object.entries(project.files || {}));
                    this.projects.set(id, project);
                });
                
                console.log('Projects restored from backup');
            }
        } catch (error) {
            console.error('Failed to load from backup:', error);
        }
    }

    async saveSettings() {
        localStorage.setItem('gameEngineSettings', JSON.stringify(this.settings));
    }

    async loadSettings() {
        try {
            const settingsData = localStorage.getItem('gameEngineSettings');
            if (settingsData) {
                this.settings = { ...this.settings, ...JSON.parse(settingsData) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    // Backup Management
    async createBackup(projectId = null) {
        const timestamp = Date.now();
        const backupData = {
            timestamp,
            version: '1.0.0',
            projects: projectId ? 
                { [projectId]: this.projects.get(projectId) } : 
                Object.fromEntries(this.projects)
        };

        // Convert Maps to Objects
        Object.values(backupData.projects).forEach(project => {
            if (project.files instanceof Map) {
                project.files = Object.fromEntries(project.files);
            }
        });

        const backupKey = `gameEngineBackup_${timestamp}`;
        localStorage.setItem(backupKey, JSON.stringify(backupData));
        
        // Clean old backups
        this.cleanOldBackups();
        
        return backupKey;
    }

    cleanOldBackups() {
        const keys = Object.keys(localStorage).filter(key => 
            key.startsWith('gameEngineBackup_')
        );
        
        if (keys.length > this.settings.maxBackups) {
            // Sort by timestamp and remove oldest
            keys.sort((a, b) => {
                const timeA = parseInt(a.split('_')[1]);
                const timeB = parseInt(b.split('_')[1]);
                return timeA - timeB;
            });
            
            const toRemove = keys.slice(0, keys.length - this.settings.maxBackups);
            toRemove.forEach(key => localStorage.removeItem(key));
        }
    }

    // Auto-save functionality
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(async () => {
            if (this.currentProject) {
                await this.saveProjects();
                console.log('Auto-saved projects');
            }
        }, this.settings.autoSaveInterval);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // Export/Import functionality
    async exportProject(projectId) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const project = this.projects.get(projectId);
        const exportData = {
            ...project,
            files: Object.fromEntries(project.files),
            exportedAt: Date.now(),
            exportVersion: '1.0.0'
        };

        return JSON.stringify(exportData, null, 2);
    }

    async importProject(projectData) {
        try {
            const parsed = typeof projectData === 'string' ? 
                JSON.parse(projectData) : projectData;
            
            const projectId = this.generateProjectId();
            const project = {
                ...parsed,
                id: projectId,
                created: Date.now(),
                modified: Date.now(),
                files: new Map(Object.entries(parsed.files || {}))
            };

            this.projects.set(projectId, project);
            await this.saveProjects();
            
            // Add to recent activity
            this.addActivity(`Imported project: ${project.name}`, 'import');
            
            return project;
        } catch (error) {
            throw new Error(`Failed to import project: ${error.message}`);
        }
    }

    // Validation methods
    validateProjectData(projectData) {
        const errors = [];
        const result = { valid: true, errors };

        // Required fields
        if (!projectData.name || typeof projectData.name !== 'string') {
            errors.push('Project name is required and must be a string');
            result.valid = false;
        } else if (projectData.name.trim().length < 2) {
            errors.push('Project name must be at least 2 characters long');
            result.valid = false;
        } else if (projectData.name.length > 100) {
            errors.push('Project name cannot exceed 100 characters');
            result.valid = false;
        }

        // Check for duplicate names
        if (projectData.name) {
            const existingProject = Array.from(this.projects.values())
                .find(p => p.name.toLowerCase() === projectData.name.trim().toLowerCase());
            if (existingProject) {
                errors.push('A project with this name already exists');
                result.valid = false;
            }
        }

        // Template validation
        if (projectData.template && !this.templates.has(projectData.template)) {
            errors.push('Invalid template specified');
            result.valid = false;
        }

        // Description validation
        if (projectData.description && projectData.description.length > 1000) {
            errors.push('Description cannot exceed 1000 characters');
            result.valid = false;
        }

        return result;
    }

    validateProjectFile(projectId, filePath, content) {
        const errors = [];

        // Basic file path validation
        if (!filePath || typeof filePath !== 'string') {
            errors.push('File path is required and must be a string');
            return { valid: false, errors };
        }

        // Prevent directory traversal
        if (filePath.includes('..') || filePath.includes('../') || filePath.startsWith('/')) {
            errors.push('Invalid file path - directory traversal not allowed');
            return { valid: false, errors };
        }

        // File size limit (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (content && content.length > maxSize) {
            errors.push('File size exceeds 10MB limit');
            return { valid: false, errors };
        }

        // File extension validation
        const allowedExtensions = ['.html', '.js', '.css', '.json', '.md', '.txt', '.xml', '.svg'];
        const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
        if (!allowedExtensions.includes(extension) && extension !== filePath.toLowerCase()) {
            errors.push('File type not allowed');
            return { valid: false, errors };
        }

        return { valid: true, errors };
    }

    // Utility functions
    generateProjectId() {
        return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    addActivity(message, type) {
        const activities = this.getRecentActivities();
        activities.unshift({
            id: Date.now(),
            message,
            type,
            timestamp: Date.now()
        });
        
        // Keep only last 50 activities
        const trimmed = activities.slice(0, 50);
        localStorage.setItem('gameEngineActivities', JSON.stringify(trimmed));
    }

    getRecentActivities() {
        try {
            const activities = localStorage.getItem('gameEngineActivities');
            return activities ? JSON.parse(activities) : [];
        } catch (error) {
            return [];
        }
    }

    // Statistics
    getProjectStats() {
        const total = this.projects.size;
        const active = Array.from(this.projects.values()).filter(p => p.status === 'active').length;
        
        // Calculate storage usage
        const storageUsed = this.calculateStorageUsage();
        
        // Get last backup time
        const backupKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('gameEngineBackup_')
        );
        const lastBackup = backupKeys.length > 0 ? 
            Math.max(...backupKeys.map(key => parseInt(key.split('_')[1]))) : null;

        return {
            total,
            active,
            storageUsed,
            lastBackup
        };
    }

    calculateStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith('gameEngine')) {
                total += localStorage[key].length;
            }
        }
        return Math.round(total / 1024); // KB
    }

    // UI Update methods
    updateUI() {
        this.updateProjectsGrid();
        this.updateStats();
        this.updateRecentActivity();
        this.updateTemplateList();
    }

    updateProjectsGrid() {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        if (this.projects.size === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-400">
                    <p class="text-xl mb-4">No projects yet!</p>
                    <p>Create your first project to get started.</p>
                </div>
            `;
            return;
        }

        this.projects.forEach(project => {
            const projectCard = this.createProjectCard(project);
            grid.appendChild(projectCard);
        });
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card card-hover';
        card.dataset.projectId = project.id;
        
        const template = this.templates.get(project.template);
        const templateIcon = template ? template.icon : '📁';
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">${templateIcon}</span>
                    <div>
                        <h3 class="text-lg font-bold text-white">${project.name}</h3>
                        <p class="text-sm text-gray-400">${template ? template.name : 'Custom'}</p>
                    </div>
                </div>
                <span class="status-indicator status-${project.status}"></span>
            </div>
            
            <p class="text-gray-300 mb-4 line-clamp-2">${project.description || 'No description'}</p>
            
            <div class="flex justify-between items-center text-sm text-gray-400">
                <span>Modified: ${new Date(project.modified).toLocaleDateString()}</span>
                <span>v${project.version}</span>
            </div>
            
            <div class="flex gap-2 mt-4">
                <button class="open-project bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm" 
                        data-project-id="${project.id}">Open</button>
                <button class="project-details bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm" 
                        data-project-id="${project.id}">Details</button>
            </div>
        `;

        // Add event listeners
        card.querySelector('.open-project').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openProject(project.id);
        });

        card.querySelector('.project-details').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showProjectDetails(project.id);
        });

        card.addEventListener('click', () => {
            this.showProjectDetails(project.id);
        });

        return card;
    }

    updateStats() {
        const stats = this.getProjectStats();
        
        const totalEl = document.getElementById('totalProjects');
        const activeEl = document.getElementById('activeProjects');
        const lastBackupEl = document.getElementById('lastBackup');
        const storageEl = document.getElementById('storageUsed');

        if (totalEl) totalEl.textContent = stats.total;
        if (activeEl) activeEl.textContent = stats.active;
        if (storageEl) storageEl.textContent = `${stats.storageUsed} KB`;
        
        if (lastBackupEl) {
            if (stats.lastBackup) {
                const date = new Date(stats.lastBackup);
                lastBackupEl.textContent = date.toLocaleDateString();
            } else {
                lastBackupEl.textContent = 'Never';
            }
        }
    }

    updateRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        const activities = this.getRecentActivities();
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="text-gray-400">No recent activity</p>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="flex items-center justify-between py-2 border-b border-gray-700">
                <span class="text-white">${activity.message}</span>
                <span class="text-gray-400 text-sm">
                    ${new Date(activity.timestamp).toLocaleTimeString()}
                </span>
            </div>
        `).join('');
    }

    updateTemplateList() {
        const container = document.getElementById('templateList');
        if (!container) return;

        container.innerHTML = '';

        this.templates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.dataset.templateId = template.id;
            
            templateItem.innerHTML = `
                <div class="flex items-start">
                    <span class="text-2xl mr-3">${template.icon}</span>
                    <div class="flex-1">
                        <h4 class="font-bold text-white">${template.name}</h4>
                        <p class="text-gray-400 text-sm">${template.description}</p>
                    </div>
                </div>
            `;

            templateItem.addEventListener('click', () => {
                // Remove previous selection
                container.querySelectorAll('.template-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Select this template
                templateItem.classList.add('selected');
            });

            container.appendChild(templateItem);
        });

        // Select first template by default
        const firstTemplate = container.querySelector('.template-item');
        if (firstTemplate) {
            firstTemplate.classList.add('selected');
        }
    }

    // Event handlers
    setupEventListeners() {
        // New Project Modal
        const newProjectBtn = document.getElementById('newProjectBtn');
        const newProjectModal = document.getElementById('newProjectModal');
        const closeNewProjectModal = document.getElementById('closeNewProjectModal');
        const cancelNewProject = document.getElementById('cancelNewProject');
        const newProjectForm = document.getElementById('newProjectForm');

        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => {
                newProjectModal.style.display = 'flex';
            });
        }

        if (closeNewProjectModal) {
            closeNewProjectModal.addEventListener('click', () => {
                newProjectModal.style.display = 'none';
            });
        }

        if (cancelNewProject) {
            cancelNewProject.addEventListener('click', () => {
                newProjectModal.style.display = 'none';
            });
        }

        if (newProjectForm) {
            newProjectForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleNewProjectSubmit();
            });
        }

        // Other buttons
        const importBtn = document.getElementById('importProjectBtn');
        const backupBtn = document.getElementById('backupAllBtn');
        const settingsBtn = document.getElementById('settingsBtn');

        if (importBtn) {
            importBtn.addEventListener('click', () => this.handleImportProject());
        }

        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.handleBackupAll());
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        const typeFilter = document.getElementById('typeFilter');
        const sortBy = document.getElementById('sortBy');
        const sortOrder = document.getElementById('sortOrder');
        const closeSearchModal = document.getElementById('closeSearchModal');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                document.getElementById('searchModal').style.display = 'flex';
                this.performSearch();
            });
        }

        if (closeSearchModal) {
            closeSearchModal.addEventListener('click', () => {
                document.getElementById('searchModal').style.display = 'none';
            });
        }

        // Live search
        if (searchInput) {
            searchInput.addEventListener('input', () => this.performSearch());
        }
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.performSearch());
        }
        if (sortBy) {
            sortBy.addEventListener('change', () => this.performSearch());
        }
        if (sortOrder) {
            sortOrder.addEventListener('change', () => this.performSearch());
        }

        // Project Details Modal
        const projectDetailsModal = document.getElementById('projectDetailsModal');
        const closeProjectDetailsModal = document.getElementById('closeProjectDetailsModal');

        if (closeProjectDetailsModal) {
            closeProjectDetailsModal.addEventListener('click', () => {
                projectDetailsModal.style.display = 'none';
            });
        }

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    async handleNewProjectSubmit() {
        const form = document.getElementById('newProjectForm');
        const spinner = document.getElementById('createProjectSpinner');
        
        try {
            // Show loading spinner
            spinner.classList.remove('hidden');
            
            const formData = new FormData(form);
            const selectedTemplate = document.querySelector('.template-item.selected');
            
            const projectData = {
                name: document.getElementById('projectName').value,
                description: document.getElementById('projectDescription').value,
                template: selectedTemplate ? selectedTemplate.dataset.templateId : 'blank'
            };

            const project = await this.createProject(projectData);
            
            // Close modal and update UI
            document.getElementById('newProjectModal').style.display = 'none';
            form.reset();
            this.updateUI();
            
            // Show success message
            this.showNotification(`Project "${project.name}" created successfully!`, 'success');
            
        } catch (error) {
            console.error('Failed to create project:', error);
            this.showNotification('Failed to create project. Please try again.', 'error');
        } finally {
            // Hide loading spinner
            spinner.classList.add('hidden');
        }
    }

    async openProject(projectId) {
        try {
            const project = await this.loadProject(projectId);
            
            // Handle modular game engine projects specially
            if (project.modular && project.isGameEngine) {
                await this.openModularGameProject(project);
            } else {
                // Create a new window/tab with the project
                this.deployProject(project);
            }
            
        } catch (error) {
            console.error('Failed to open project:', error);
            this.showNotification('Failed to open project.', 'error');
        }
    }
    
    async openModularGameProject(project) {
        try {
            // Get the main HTML file
            const indexHtml = project.files.get('index.html');
            if (!indexHtml) {
                throw new Error('No index.html found in project');
            }
            
            // Extract content from file object structure
            const htmlContent = typeof indexHtml === 'object' ? indexHtml.content : indexHtml;
            
            // Create a blob URL for the HTML content
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // Open in new window with larger size for game engine
            const newWindow = window.open(url, `game_project_${project.id}`, 
                'width=1400,height=900,menubar=no,toolbar=no,status=no');
            
            if (newWindow) {
                // Set window title
                newWindow.addEventListener('load', () => {
                    newWindow.document.title = `${project.name} - Game Engine`;
                    
                    // Restore game state if available
                    if (project.files.has('data/gameState.json')) {
                        const gameStateFile = project.files.get('data/gameState.json');
                        const gameStateContent = typeof gameStateFile === 'object' ? gameStateFile.content : gameStateFile;
                        
                        try {
                            const gameState = JSON.parse(gameStateContent);
                            
                            // Store restoration data in the new window
                            newWindow.localStorage.setItem('pm_restoration_data', JSON.stringify({
                                gameState: gameState,
                                projectId: project.id,
                                projectName: project.name,
                                modular: true,
                                restoreComponents: true
                            }));
                            
                            console.log('🎮 Game state prepared for restoration:', project.id);
                            
                        } catch (e) {
                            console.warn('Could not parse game state:', e);
                        }
                    }
                    
                    // Store project metadata for the new window
                    newWindow.localStorage.setItem('pm_project_metadata', JSON.stringify({
                        id: project.id,
                        name: project.name,
                        modular: true,
                        structure: project.structure,
                        files: Array.from(project.files.keys()),
                        created: project.created,
                        modified: project.modified
                    }));
                    
                    // Clean up URL
                    URL.revokeObjectURL(url);
                    
                    this.showNotification(`🎮 Opened modular project: ${project.name}`, 'success');
                });
                
                // Handle window close
                const checkClosed = setInterval(() => {
                    if (newWindow.closed) {
                        clearInterval(checkClosed);
                        console.log('🔒 Game project window closed:', project.id);
                    }
                }, 1000);
            }
            
        } catch (error) {
            console.error('Failed to open modular game project:', error);
            this.showNotification('Failed to open game project: ' + error.message, 'error');
        }
    }

    deployProject(project) {
        // Create a new window with the project's main HTML file
        const mainHTML = project.files.get('index.html') || this.getBlankHTMLTemplate();
        
        // Create a blob URL for the HTML content
        const blob = new Blob([mainHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Open in new window
        const newWindow = window.open(url, `project_${project.id}`, 'width=1200,height=800');
        
        if (newWindow) {
            // Set window title
            newWindow.document.title = project.name;
            
            // Clean up URL after window loads
            newWindow.addEventListener('load', () => {
                URL.revokeObjectURL(url);
            });
        }
    }

    showProjectDetails(projectId) {
        const project = this.projects.get(projectId);
        if (!project) return;

        const modal = document.getElementById('projectDetailsModal');
        const title = document.getElementById('projectDetailsTitle');
        const content = document.getElementById('projectDetailsContent');

        title.textContent = project.name;
        
        const template = this.templates.get(project.template);
        const fileCount = project.files.size;
        
        // Check if this is a modular game engine project
        const isModular = project.modular && project.isGameEngine;
        const projectType = isModular ? 'Game Engine (Modular)' : template ? template.name : 'Custom';
        
        let modularInfo = '';
        if (isModular && project.structure) {
            const componentTypes = Object.keys(project.structure);
            const totalComponents = Object.values(project.structure).reduce((total, arr) => total + arr.length, 0);
            
            modularInfo = `
                <div>
                    <h3 class="text-lg font-bold text-green-400 mb-2">🎮 Modular Structure</h3>
                    <p><strong>Component Types:</strong> ${componentTypes.length}</p>
                    <p><strong>Total Components:</strong> ${totalComponents}</p>
                    <p><strong>Individually Editable:</strong> ✅ Yes</p>
                    ${project.compatibility ? `<p><strong>Engine Version:</strong> ${project.compatibility.minEngineVersion || 'Unknown'}</p>` : ''}
                </div>
            `;
        }
        
        let gameStateInfo = '';
        if (isModular && project.files.has('data/gameState.json')) {
            try {
                const gameStateFile = project.files.get('data/gameState.json');
                const gameStateContent = typeof gameStateFile === 'object' ? gameStateFile.content : gameStateFile;
                const gameState = JSON.parse(gameStateContent);
                
                gameStateInfo = `
                    <div class="mb-6">
                        <h3 class="text-lg font-bold text-purple-400 mb-2">🎯 Game State</h3>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            ${gameState.player ? `
                                <div>
                                    <strong>Player:</strong><br>
                                    Position: (${gameState.player.position.x}, ${gameState.player.position.y})<br>
                                    Health: ${gameState.player.health}/${gameState.player.maxHealth}<br>
                                    Energy: ${gameState.player.energy}/${gameState.player.maxEnergy}
                                </div>
                            ` : ''}
                            ${gameState.statistics ? `
                                <div>
                                    <strong>Statistics:</strong><br>
                                    Score: ${gameState.statistics.score}<br>
                                    Clicks: ${gameState.statistics.clicks}<br>
                                    Particles: ${gameState.statistics.particleCount}<br>
                                    Game Time: ${Math.round(gameState.statistics.gameTime)}s
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            } catch (e) {
                console.warn('Could not parse game state for display:', e);
            }
        }
        
        let componentStructure = '';
        if (isModular && project.structure) {
            componentStructure = `
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-yellow-400 mb-2">🔧 Component Structure</h3>
                    <div class="bg-gray-800 rounded p-3 max-h-32 overflow-y-auto">
                        ${Object.entries(project.structure).map(([type, files]) => 
                            `<div class="mb-2">
                                <strong class="text-blue-300">${type}:</strong> 
                                <span class="text-gray-300">${files.length} files</span>
                                <div class="ml-4 text-sm text-gray-400">
                                    ${files.slice(0, 3).join(', ')}${files.length > 3 ? ` + ${files.length - 3} more` : ''}
                                </div>
                            </div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <h3 class="text-lg font-bold text-blue-400 mb-2">Project Info</h3>
                    <p><strong>Type:</strong> ${projectType}</p>
                    ${isModular ? '<p><strong>Format:</strong> <span class="text-green-400">Modular</span></p>' : ''}
                    <p><strong>Version:</strong> ${project.version || project.metadata?.version || 'Unknown'}</p>
                    <p><strong>Status:</strong> ${project.status || 'Active'}</p>
                    <p><strong>Files:</strong> ${fileCount}</p>
                </div>
                ${modularInfo || `
                <div>
                    <h3 class="text-lg font-bold text-blue-400 mb-2">Timestamps</h3>
                    <p><strong>Created:</strong> ${new Date(project.created).toLocaleString()}</p>
                    <p><strong>Modified:</strong> ${new Date(project.modified).toLocaleString()}</p>
                </div>
                `}
            </div>
            
            ${gameStateInfo}
            
            ${componentStructure}
            
            <div class="mb-6">
                <h3 class="text-lg font-bold text-blue-400 mb-2">Description</h3>
                <p class="text-gray-300">${project.description || project.metadata?.description || 'No description provided.'}</p>
            </div>
            
            <div>
                <h3 class="text-lg font-bold text-blue-400 mb-2">Files</h3>
                <div class="bg-gray-800 rounded p-3 max-h-48 overflow-y-auto">
                    ${Array.from(project.files.keys()).map(path => {
                        const file = project.files.get(path);
                        const isEditable = typeof file === 'object' && file.modifiable;
                        const fileType = typeof file === 'object' ? file.type : 'unknown';
                        const fileDesc = typeof file === 'object' ? file.description : '';
                        
                        return `<div class="text-gray-300 py-1 flex justify-between items-center">
                            <span>${path}</span>
                            <div class="text-xs text-gray-500">
                                ${isEditable ? '<span class="text-green-400">✏️ Editable</span>' : ''}
                                <span class="ml-2">${fileType}</span>
                            </div>
                        </div>
                        ${fileDesc ? `<div class="text-xs text-gray-500 ml-4 pb-1">${fileDesc}</div>` : ''}`;
                    }).join('')}
                </div>
            </div>
        `;

        // Setup action buttons
        const openBtn = document.getElementById('openProjectBtn');
        const duplicateBtn = document.getElementById('duplicateProjectBtn');
        const exportBtn = document.getElementById('exportProjectBtn');
        const deleteBtn = document.getElementById('deleteProjectBtn');

        openBtn.onclick = () => this.openProject(projectId);
        duplicateBtn.onclick = () => this.handleDuplicateProject(projectId);
        exportBtn.onclick = () => this.handleExportProject(projectId);
        deleteBtn.onclick = () => this.handleDeleteProject(projectId);

        modal.style.display = 'flex';
    }

    async handleDuplicateProject(projectId) {
        const project = this.projects.get(projectId);
        const newName = prompt(`Enter name for duplicated project:`, `${project.name} (Copy)`);
        
        if (newName) {
            try {
                await this.duplicateProject(projectId, newName);
                this.updateUI();
                this.showNotification('Project duplicated successfully!', 'success');
                document.getElementById('projectDetailsModal').style.display = 'none';
            } catch (error) {
                this.showNotification('Failed to duplicate project.', 'error');
            }
        }
    }

    async handleExportProject(projectId) {
        try {
            const exportData = await this.exportProject(projectId);
            const project = this.projects.get(projectId);
            
            // Create download
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_export.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showNotification('Project exported successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to export project.', 'error');
        }
    }

    async handleDeleteProject(projectId) {
        const project = this.projects.get(projectId);
        const confirmed = confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`);
        
        if (confirmed) {
            try {
                await this.deleteProject(projectId);
                this.updateUI();
                this.showNotification('Project deleted successfully.', 'success');
                document.getElementById('projectDetailsModal').style.display = 'none';
            } catch (error) {
                this.showNotification('Failed to delete project.', 'error');
            }
        }
    }

    handleImportProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    await this.importProject(text);
                    this.updateUI();
                    this.showNotification('Project imported successfully!', 'success');
                } catch (error) {
                    this.showNotification('Failed to import project.', 'error');
                }
            }
        };
        
        input.click();
    }

    async handleBackupAll() {
        try {
            const backupKey = await this.createBackup();
            this.showNotification('Backup created successfully!', 'success');
            this.updateUI();
        } catch (error) {
            this.showNotification('Failed to create backup.', 'error');
        }
    }

    showSettings() {
        // TODO: Implement settings modal
        this.showNotification('Settings panel coming soon!', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' :
            type === 'warning' ? 'bg-yellow-600' :
            'bg-blue-600'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Template content generators
    getBlankHTMLTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Game Project</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="game-container">
        <h1>Welcome to Your New Game!</h1>
        <p>Start building something amazing...</p>
    </div>
    <script src="js/main.js"></script>
</body>
</html>`;
    }

    getBlankJSTemplate() {
        return `// Main game logic
console.log('Game started!');

// Initialize your game here
function initGame() {
    console.log('Initializing game...');
}

// Game loop
function gameLoop() {
    // Update game state
    // Render game
    requestAnimationFrame(gameLoop);
}

// Start the game
initGame();
gameLoop();`;
    }

    getBlankCSSTemplate() {
        return `/* Game Styles */
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background: #000;
    color: #fff;
}

#game-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

p {
    font-size: 1.2rem;
}`;
    }

    getReadmeTemplate() {
        return `# Game Project

## Description
A new game project created with the Game Engine.

## Getting Started
1. Open \`index.html\` in your browser
2. Start editing the files to build your game
3. Have fun creating!

## Files
- \`index.html\` - Main HTML file
- \`js/main.js\` - Game logic
- \`css/style.css\` - Styles

## Documentation
Check out the [Game Engine Documentation](../game-engine/docs/) for advanced features.`;
    }

    getPokerGameTemplate() {
        // Return a simplified version of your current poker game
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Poker Game</title>
    <style>
        body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; }
        #game-container { width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center; }
        .card { width: 80px; height: 120px; background: white; color: black; margin: 5px; border-radius: 8px; display: flex; justify-content: center; align-items: center; }
    </style>
</head>
<body>
    <div id="game-container">
        <div>
            <h1>Poker Game</h1>
            <div id="hand">
                <div class="card">A♠</div>
                <div class="card">K♥</div>
                <div class="card">Q♦</div>
                <div class="card">J♣</div>
                <div class="card">10♠</div>
            </div>
            <button onclick="dealNewHand()">Deal New Hand</button>
        </div>
    </div>
    <script>
        function dealNewHand() {
            console.log('Dealing new hand...');
        }
    </script>
</body>
</html>`;
    }

    getGameEngineTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Engine Project</title>
    <style>
        body { margin: 0; padding: 0; background: #000; }
        #gameCanvas { border: 1px solid #333; }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <script src="js/GameEngine.js"></script>
    <script src="js/main.js"></script>
</body>
</html>`;
    }

    getPlatformerTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Platformer Game</title>
    <style>
        body { margin: 0; padding: 0; background: #87CEEB; }
        #gameCanvas { display: block; margin: 0 auto; background: linear-gradient(#87CEEB, #98FB98); }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <script src="js/main.js"></script>
</body>
</html>`;
    }

    getPlatformerJSTemplate() {
        return `// Platformer Game Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player object
const player = {
    x: 100,
    y: 500,
    width: 32,
    height: 32,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    speed: 5,
    jumpPower: 15
};

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Apply gravity
    player.velocityY += 0.8;
    
    // Move player
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Ground collision
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }
    
    // Friction
    player.velocityX *= 0.8;
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 32, canvas.width, 32);
}

// Input handling
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            player.velocityX = -player.speed;
            break;
        case 'ArrowRight':
        case 'KeyD':
            player.velocityX = player.speed;
            break;
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
            if (player.onGround) {
                player.velocityY = -player.jumpPower;
                player.onGround = false;
            }
            break;
    }
});

// Start game
gameLoop();`;
    }

    getPlatformerCSSTemplate() {
        return `/* Platformer Game Styles */
body {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #87CEEB, #98FB98);
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

#gameCanvas {
    border: 3px solid #333;
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
    border-radius: 8px;
}`;
    }

    getRPGTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RPG Adventure</title>
    <style>
        body { margin: 0; padding: 0; background: #2d1810; color: #fff; font-family: serif; }
        #gameWorld { width: 100vw; height: 100vh; position: relative; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23654321"/></svg>'); }
        #ui { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
        .ui-panel { position: absolute; background: rgba(0,0,0,0.8); border: 2px solid gold; padding: 10px; pointer-events: auto; }
        #playerStats { top: 10px; left: 10px; }
        #inventory { top: 10px; right: 10px; }
    </style>
</head>
<body>
    <div id="gameWorld">
        <div id="ui">
            <div id="playerStats" class="ui-panel">
                <h3>Player Stats</h3>
                <p>Health: <span id="health">100</span></p>
                <p>Level: <span id="level">1</span></p>
                <p>XP: <span id="xp">0</span></p>
            </div>
            <div id="inventory" class="ui-panel">
                <h3>Inventory</h3>
                <div id="items">Empty</div>
            </div>
        </div>
    </div>
    <script src="js/main.js"></script>
</body>
</html>`;
    }

    getRPGJSTemplate() {
        return `// RPG Game Logic
const game = {
    player: {
        name: 'Hero',
        level: 1,
        health: 100,
        maxHealth: 100,
        xp: 0,
        xpToNext: 100,
        inventory: []
    },
    
    init() {
        console.log('Welcome to the RPG Adventure!');
        this.updateUI();
    },
    
    updateUI() {
        document.getElementById('health').textContent = this.player.health;
        document.getElementById('level').textContent = this.player.level;
        document.getElementById('xp').textContent = this.player.xp;
        
        const itemsDiv = document.getElementById('items');
        if (this.player.inventory.length === 0) {
            itemsDiv.innerHTML = 'Empty';
        } else {
            itemsDiv.innerHTML = this.player.inventory.map(item => item.name).join(', ');
        }
    },
    
    addItem(item) {
        this.player.inventory.push(item);
        this.updateUI();
        console.log(\`Found: \${item.name}\`);
    },
    
    gainXP(amount) {
        this.player.xp += amount;
        if (this.player.xp >= this.player.xpToNext) {
            this.levelUp();
        }
        this.updateUI();
    },
    
    levelUp() {
        this.player.level++;
        this.player.xp = 0;
        this.player.xpToNext = this.player.level * 100;
        this.player.maxHealth += 20;
        this.player.health = this.player.maxHealth;
        console.log(\`Level up! Now level \${this.player.level}\`);
    }
};

// Start the game
game.init();

// Demo: Add some items and XP
setTimeout(() => {
    game.addItem({ name: 'Iron Sword', type: 'weapon' });
    game.gainXP(50);
}, 2000);`;
    }

    getRPGCSSTemplate() {
        return `/* RPG Game Styles */
        body {
            margin: 0;
            padding: 0;
            background: radial-gradient(circle, #2d1810, #1a0f08);
            color: #f4e4bc;
            font-family: 'Times New Roman', serif;
        }

        #gameWorld {
            width: 100vw;
            height: 100vh;
            position: relative;
            background-image:
                radial-gradient(circle at 25% 25%, #4a3728 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, #3d2f1f 0%, transparent 50%);
        }

        .ui-panel {
            background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,15,5,0.9));
            border: 2px solid #d4af37;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }

        .ui-panel h3 {
            margin: 0 0 10px 0;
            color: #d4af37;
            text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
        }

        .ui-panel p {
            margin: 5px 0;
            font-size: 14px;
        }`;
    }

    // New Template Generators
    getStrategyTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Strategy Game</title>
    <style>
        body { margin: 0; padding: 0; background: #2c3e50; color: #ecf0f1; font-family: Arial, sans-serif; }
        #gameContainer { width: 100vw; height: 100vh; position: relative; }
        #grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px; width: 80%; height: 80%; margin: 10vh auto; }
        .cell { background: #34495e; border: 1px solid #7f8c8d; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .cell:hover { background: #2980b9; }
        .unit { width: 20px; height: 20px; border-radius: 50%; cursor: pointer; }
        .unit.player { background: #27ae60; }
        .unit.enemy { background: #e74c3c; }
        #ui { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div id="gameContainer">
        <div id="grid"></div>
        <div id="ui">
            <h3>Strategy Game</h3>
            <p>Click cells to place units, right-click to move</p>
            <div id="resources">
                <p>Gold: <span id="gold">100</span></p>
                <p>Mana: <span id="mana">50</span></p>
            </div>
        </div>
    </div>
    <script src="js/main.js"></script>
</body>
</html>`;
    }

    getStrategyJSTemplate() {
        return `// Strategy Game Logic
const grid = document.getElementById('grid');
const goldElement = document.getElementById('gold');
const manaElement = document.getElementById('mana');

let gold = 100;
let mana = 50;
let selectedUnit = null;

function createGrid() {
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('contextmenu', handleCellRightClick);
        grid.appendChild(cell);
    }
}

function handleCellClick(e) {
    e.preventDefault();
    const cell = e.target.closest('.cell');
    const index = parseInt(cell.dataset.index);

    if (gold >= 10) {
        const unit = document.createElement('div');
        unit.className = 'unit player';
        unit.dataset.index = index;
        cell.appendChild(unit);
        gold -= 10;
        updateUI();
    }
}

function handleCellRightClick(e) {
    e.preventDefault();
    const cell = e.target.closest('.cell');
    const index = parseInt(cell.dataset.index);

    if (selectedUnit) {
        // Move unit to new position
        const oldCell = document.querySelector(\`[data-index="\${selectedUnit.dataset.index}"]\`);
        if (oldCell && oldCell !== cell) {
            cell.appendChild(selectedUnit);
            selectedUnit.dataset.index = index;
            selectedUnit = null;
            if (mana >= 5) {
                mana -= 5;
                updateUI();
            }
        }
    } else {
        // Select unit
        const unit = cell.querySelector('.unit');
        if (unit) {
            selectedUnit = unit;
            unit.style.border = '2px solid yellow';
        }
    }
}

function updateUI() {
    goldElement.textContent = gold;
    manaElement.textContent = mana;
}

// Initialize game
createGrid();
updateUI();

// Game loop
setInterval(() => {
    gold += 1;
    mana += 0.5;
    updateUI();
}, 1000);`;
    }

    getStrategyCSSTemplate() {
        return `/* Strategy Game Styles */
body {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #2c3e50, #34495e);
    color: #ecf0f1;
    font-family: 'Arial', sans-serif;
    overflow: hidden;
}

#gameContainer {
    width: 100vw;
    height: 100vh;
    position: relative;
}

#grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 2px;
    width: 80%;
    height: 80%;
    margin: 10vh auto;
}

.cell {
    background: #34495e;
    border: 1px solid #7f8c8d;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
}

.cell:hover {
    background: #2980b9;
}

.unit {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;
}

.unit:hover {
    transform: scale(1.2);
}

.unit.player {
    background: #27ae60;
    box-shadow: 0 0 10px rgba(39, 174, 96, 0.5);
}

.unit.enemy {
    background: #e74c3c;
    box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
}

#ui {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.8);
    padding: 20px;
    border-radius: 8px;
    border: 2px solid #3498db;
    box-shadow: 0 0 20px rgba(52, 152, 219, 0.3);
}

#ui h3 {
    margin: 0 0 10px 0;
    color: #3498db;
}

#ui p {
    margin: 5px 0;
    font-size: 14px;
}

#resources {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #7f8c8d;
}`;
    }

    getPuzzleTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Puzzle Game</title>
    <style>
        body { margin: 0; padding: 0; background: linear-gradient(45deg, #667eea, #764ba2); color: white; font-family: Arial, sans-serif; }
        #gameContainer { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        #puzzleGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; width: 300px; height: 300px; margin: 20px auto; }
        .tile { background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; cursor: pointer; transition: all 0.3s; }
        .tile:hover { background: rgba(255,255,255,0.4); transform: scale(1.05); }
        .tile.empty { background: transparent; cursor: default; }
        #ui { text-align: center; margin-top: 20px; }
        #moves { font-size: 18px; margin-bottom: 10px; }
        #hint { margin-top: 20px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px; cursor: pointer; display: inline-block; }
    </style>
</head>
<body>
    <div id="gameContainer">
        <h1>Sliding Puzzle</h1>
        <div id="puzzleGrid"></div>
        <div id="ui">
            <div id="moves">Moves: <span id="moveCount">0</span></div>
            <button id="shuffleBtn">Shuffle</button>
            <button id="resetBtn">Reset</button>
            <div id="hint">💡 Hint</div>
        </div>
    </div>
    <script src="js/main.js"></script>
</body>
</html>`;
    }

    getPuzzleJSTemplate() {
        return `// Puzzle Game Logic
const grid = document.getElementById('puzzleGrid');
const moveCountElement = document.getElementById('moveCount');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn = document.getElementById('resetBtn');
const hintElement = document.getElementById('hint');

let tiles = [];
let moveCount = 0;
let emptyPosition = 15; // Last position (4x4 grid)

function createPuzzle() {
    // Create numbers 1-15 and empty space
    const numbers = Array.from({length: 15}, (_, i) => i + 1);
    numbers.push(''); // Empty space

    // Shuffle the puzzle
    shufflePuzzle();

    updateDisplay();
}

function shufflePuzzle() {
    // Fisher-Yates shuffle
    const array = Array.from({length: 16}, (_, i) => i < 15 ? i + 1 : '');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    tiles = array;
    emptyPosition = tiles.indexOf('');
    moveCount = 0;
}

function updateDisplay() {
    grid.innerHTML = '';

    tiles.forEach((tile, index) => {
        const tileElement = document.createElement('div');
        tileElement.className = tile === '' ? 'tile empty' : 'tile';
        tileElement.textContent = tile;
        tileElement.dataset.index = index;

        if (tile !== '') {
            tileElement.addEventListener('click', () => moveTile(index));
        }

        grid.appendChild(tileElement);
    });

    moveCountElement.textContent = moveCount;
    checkWinCondition();
}

function moveTile(index) {
    if (canMove(index)) {
        // Swap tiles
        [tiles[index], tiles[emptyPosition]] = [tiles[emptyPosition], tiles[index]];
        emptyPosition = index;
        moveCount++;
        updateDisplay();
    }
}

function canMove(index) {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyPosition / 4);
    const emptyCol = emptyPosition % 4;

    // Check if adjacent
    return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
           (Math.abs(col - emptyCol) === 1 && row === emptyRow);
}

function checkWinCondition() {
    // Check if tiles are in correct order
    for (let i = 0; i < 15; i++) {
        if (tiles[i] !== i + 1) return;
    }

    // Puzzle solved!
    setTimeout(() => {
        alert(\`Congratulations! Solved in \${moveCount} moves!\`);
    }, 100);
}

function showHint() {
    const correctPositions = Array.from({length: 15}, (_, i) => i + 1).concat(['']);
    let hint = 'Try moving tiles adjacent to the empty space to match: ';

    // Show next correct tile to move
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] !== correctPositions[i] && tiles[i] !== '') {
            hint += tiles[i];
            break;
        }
    }

    alert(hint);
}

// Event listeners
shuffleBtn.addEventListener('click', shufflePuzzle);
resetBtn.addEventListener('click', createPuzzle);
hintElement.addEventListener('click', showHint);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const emptyRow = Math.floor(emptyPosition / 4);
    const emptyCol = emptyPosition % 4;

    let targetIndex = -1;
    switch(e.key) {
        case 'ArrowUp':
            if (emptyRow < 3) targetIndex = emptyPosition + 4;
            break;
        case 'ArrowDown':
            if (emptyRow > 0) targetIndex = emptyPosition - 4;
            break;
        case 'ArrowLeft':
            if (emptyCol < 3) targetIndex = emptyPosition + 1;
            break;
        case 'ArrowRight':
            if (emptyCol > 0) targetIndex = emptyPosition - 1;
            break;
    }

    if (targetIndex >= 0 && targetIndex < 16) {
        e.preventDefault();
        moveTile(targetIndex);
    }
});

// Initialize
createPuzzle();`;
    }

    getPuzzleCSSTemplate() {
        return `/* Puzzle Game Styles */
body {
    margin: 0;
    padding: 0;
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-family: 'Arial', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

#gameContainer {
    text-align: center;
    padding: 20px;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 30px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

#puzzleGrid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    width: 320px;
    height: 320px;
    margin: 20px auto;
    perspective: 1000px;
}

.tile {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    color: #333;
    user-select: none;
}

.tile:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0,0,0,0.3);
}

.tile.empty {
    background: rgba(255, 255, 255, 0.1);
    cursor: default;
    box-shadow: none;
}

.tile.empty:hover {
    transform: none;
    background: rgba(255, 255, 255, 0.1);
}

#ui {
    margin-top: 30px;
}

#moves {
    font-size: 18px;
    margin-bottom: 20px;
    font-weight: bold;
}

button {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid white;
    color: white;
    padding: 10px 20px;
    margin: 0 10px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
}

button:hover {
    background: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
}

#hint {
    margin-top: 20px;
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 25px;
    cursor: pointer;
    display: inline-block;
    transition: all 0.3s ease;
    font-size: 16px;
}

#hint:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: translateY(-2px);
}`;
    }

    getRacingTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Racing Game</title>
    <style>
        body { margin: 0; padding: 0; background: #2c3e50; color: white; font-family: Arial, sans-serif; overflow: hidden; }
        #gameContainer { width: 100vw; height: 100vh; position: relative; }
        #track { position: absolute; top: 0; left: 0; width: 100%; height: 80%; background: linear-gradient(to bottom, #27ae60, #2ecc71); }
        #finishLine { position: absolute; top: 0; left: 50%; width: 4px; height: 100%; background: repeating-linear-gradient(to bottom, white 0px, white 20px, black 20px, black 40px); }
        #car { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); width: 40px; height: 20px; background: #e74c3c; border-radius: 5px; transition: left 0.1s; }
        #car::before { content: ''; position: absolute; top: -5px; left: 5px; width: 6px; height: 6px; background: #f39c12; border-radius: 50%; box-shadow: 20px 0 #f39c12; }
        #ui { position: absolute; bottom: 0; left: 0; width: 100%; height: 20%; background: rgba(0,0,0,0.8); padding: 20px; box-sizing: border-box; }
        #speed { font-size: 24px; margin-bottom: 10px; }
        #lapTime { font-size: 18px; }
        .track-marker { position: absolute; width: 100%; height: 2px; background: rgba(255,255,255,0.3); }
    </style>
</head>
<body>
    <div id="gameContainer">
        <div id="track">
            <div id="finishLine"></div>
            <div id="car"></div>
        </div>
        <div id="ui">
            <div id="speed">Speed: 0 km/h</div>
            <div id="lapTime">Lap Time: 0.00s</div>
            <div id="controls">
                <p>Use A/D or Left/Right arrows to steer</p>
                <p>W/S or Up/Down to accelerate/brake</p>
            </div>
        </div>
    </div>
    <script src="js/main.js"></script>
</body>
</html>`;
    }

    getRacingJSTemplate() {
        return `// Racing Game Logic
const car = document.getElementById('car');
const speedElement = document.getElementById('speed');
const lapTimeElement = document.getElementById('lapTime');

let carPosition = 50; // Percentage across track (0-100)
let carSpeed = 0;
let maxSpeed = 200;
let acceleration = 2;
let deceleration = 1.5;
let lapStartTime = Date.now();
let bestLapTime = Infinity;

let keys = {
    left: false,
    right: false,
    up: false,
    down: false
};

function updateCar() {
    // Handle acceleration/braking
    if (keys.up) {
        carSpeed = Math.min(maxSpeed, carSpeed + acceleration);
    } else if (keys.down) {
        carSpeed = Math.max(0, carSpeed - deceleration * 2);
    } else {
        // Natural deceleration
        carSpeed = Math.max(0, carSpeed - deceleration);
    }

    // Handle steering (only when moving)
    if (carSpeed > 10) {
        if (keys.left) {
            carPosition = Math.max(5, carPosition - (carSpeed / maxSpeed) * 3);
        }
        if (keys.right) {
            carPosition = Math.min(95, carPosition + (carSpeed / maxSpeed) * 3);
        }
    }

    // Update visual position
    car.style.left = carPosition + '%';

    // Update UI
    speedElement.textContent = \`Speed: \${Math.round(carSpeed)} km/h\`;

    const currentTime = Date.now();
    const lapTime = (currentTime - lapStartTime) / 1000;
    lapTimeElement.textContent = \`Lap Time: \${lapTime.toFixed(2)}s\`;

    // Check for lap completion (crossing finish line)
    const finishLinePos = 50;
    const carLeftEdge = carPosition;
    const carRightEdge = carPosition + 4; // Car width in percentage

    if (carLeftEdge <= finishLinePos && carRightEdge >= finishLinePos) {
        // Car is crossing the finish line
        if (lapTime > 1) { // Avoid immediate lap completion
            if (lapTime < bestLapTime) {
                bestLapTime = lapTime;
                alert(\`New best lap: \${lapTime.toFixed(2)}s!\`);
            } else {
                alert(\`Lap completed: \${lapTime.toFixed(2)}s\`);
            }
            lapStartTime = currentTime;
        }
    }
}

function createTrackMarkers() {
    const track = document.getElementById('track');
    for (let i = 1; i <= 10; i++) {
        const marker = document.createElement('div');
        marker.className = 'track-marker';
        marker.style.top = (i * 10) + '%';
        track.appendChild(marker);
    }
}

// Keyboard event listeners
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'KeyA':
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'KeyW':
        case 'ArrowUp':
            keys.up = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.down = true;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'KeyA':
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'KeyW':
        case 'ArrowUp':
            keys.up = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.down = false;
            break;
    }
});

// Game loop
function gameLoop() {
    updateCar();
    requestAnimationFrame(gameLoop);
}

// Initialize
createTrackMarkers();
gameLoop();`;
    }

    getRacingCSSTemplate() {
        return `/* Racing Game Styles */
body {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #2c3e50, #34495e);
    color: white;
    font-family: 'Arial', sans-serif;
    overflow: hidden;
}

#gameContainer {
    width: 100vw;
    height: 100vh;
    position: relative;
}

#track {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 80%;
    background: linear-gradient(to bottom, #27ae60 0%, #2ecc71 50%, #27ae60 100%);
    overflow: hidden;
}

#finishLine {
    position: absolute;
    top: 0;
    left: 50%;
    width: 4px;
    height: 100%;
    background: repeating-linear-gradient(
        to bottom,
        white 0px,
        white 20px,
        black 20px,
        black 40px
    );
    transform: translateX(-50%);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

#car {
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 20px;
    background: linear-gradient(45deg, #e74c3c, #c0392b);
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    transition: left 0.1s ease-out;
}

#car::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 5px;
    width: 6px;
    height: 6px;
    background: #f39c12;
    border-radius: 50%;
    box-shadow: 20px 0 #f39c12, 0 0 5px rgba(243, 156, 18, 0.5), 20px 0 5px rgba(243, 156, 18, 0.5);
}

.track-marker {
    position: absolute;
    width: 100%;
    height: 2px;
    background: rgba(255, 255, 255, 0.3);
    border-top: 1px dashed rgba(255, 255, 255, 0.5);
}

#ui {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 20%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7));
    padding: 20px;
    box-sizing: border-box;
    border-top: 2px solid #3498db;
}

#speed {
    font-size: 24px;
    margin-bottom: 10px;
    color: #3498db;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
}

#lapTime {
    font-size: 18px;
    margin-bottom: 15px;
    color: #e74c3c;
}

#controls {
    font-size: 14px;
    color: #95a5a6;
    line-height: 1.4;
}

#controls p {
    margin: 5px 0;
}`;
    }

    getSimulationTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulation Game</title>
    <style>
        body { margin: 0; padding: 0; background: #1a1a2e; color: white; font-family: Arial, sans-serif; }
        #gameContainer { width: 100vw; height: 100vh; display: flex; flex-direction: column; }
        #simulationCanvas { flex: 1; background: #16213e; border: 2px solid #0f3460; }
        #ui { height: 200px; background: #0f3460; padding: 20px; border-top: 2px solid #e94560; }
        .control-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .control-group { background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; }
        .control-group h4 { margin: 0 0 10px 0; color: #e94560; }
        .slider-container { margin-bottom: 10px; }
        .slider { width: 100%; }
        .value { font-weight: bold; color: #00d4ff; }
        #startStopBtn { background: #e94560; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        #startStopBtn.running { background: #f39c12; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
        .stat-item { text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #00d4ff; }
        .stat-label { font-size: 12px; color: #95a5a6; }
    </style>
</head>
<body>
    <div id="gameContainer">
        <canvas id="simulationCanvas" width="800" height="400"></canvas>
        <div id="ui">
            <div class="control-panel">
                <div class="control-group">
                    <h4>Population</h4>
                    <div class="slider-container">
                        <input type="range" class="slider" id="populationSlider" min="10" max="200" value="50">
                        <div class="value" id="populationValue">50</div>
                    </div>
                </div>
                <div class="control-group">
                    <h4>Speed</h4>
                    <div class="slider-container">
                        <input type="range" class="slider" id="speedSlider" min="1" max="10" value="3">
                        <div class="value" id="speedValue">3</div>
                    </div>
                </div>
                <div class="control-group">
                    <h4>Environment</h4>
                    <div class="slider-container">
                        <input type="range" class="slider" id="environmentSlider" min="0" max="100" value="50">
                        <div class="value" id="environmentValue">50</div>
                    </div>
                </div>
                <div class="control-group">
                    <h4>Resources</h4>
                    <div class="slider-container">
                        <input type="range" class="slider" id="resourcesSlider" min="0" max="1000" value="500">
                        <div class="value" id="resourcesValue">500</div>
                    </div>
                </div>
            </div>
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value" id="aliveCount">0</div>
                    <div class="stat-label">Alive</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="generationCount">0</div>
                    <div class="stat-label">Generation</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="avgFitness">0.00</div>
                    <div class="stat-label">Avg Fitness</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="timeValue">0s</div>
                    <div class="stat-label">Time</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 15px;">
                <button id="startStopBtn">Start Simulation</button>
                <button id="resetBtn" style="background: #95a5a6; margin-left: 10px;">Reset</button>
            </div>
        </div>
    </div>
    <script src="js/main.js"></script>
</body>
</html>`;
    }

    getSimulationJSTemplate() {
        return `// Simulation Game Logic
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');

// UI Elements
const populationSlider = document.getElementById('populationSlider');
const populationValue = document.getElementById('populationValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const environmentSlider = document.getElementById('environmentSlider');
const environmentValue = document.getElementById('environmentValue');
const resourcesSlider = document.getElementById('resourcesSlider');
const resourcesValue = document.getElementById('resourcesValue');

const aliveCount = document.getElementById('aliveCount');
const generationCount = document.getElementById('generationCount');
const avgFitness = document.getElementById('avgFitness');
const timeValue = document.getElementById('timeValue');

let entities = [];
let isRunning = false;
let generation = 0;
let startTime = Date.now();
let lastGenerationTime = Date.now();

class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = 3 + Math.random() * 2;
        this.energy = 100;
        this.fitness = 0;
        this.color = \`hsl(\${Math.random() * 360}, 70%, 50%)\`;
    }

    update() {
        // Movement
        this.x += this.vx;
        this.y += this.vy;

        // Boundary collision
        if (this.x < 0 || this.x > canvas.width) this.vx *= -0.8;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -0.8;

        // Keep in bounds
        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));

        // Energy consumption
        this.energy -= 0.1;
        if (this.energy <= 0) {
            this.energy = 0;
        }

        // Fitness calculation based on position and energy
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const distanceFromCenter = Math.sqrt((this.x - centerX) ** 2 + (this.y - centerY) ** 2);
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        const proximityFitness = 1 - (distanceFromCenter / maxDistance);
        this.fitness = (this.energy / 100) * 0.5 + proximityFitness * 0.5;
    }

    render() {
        ctx.save();
        ctx.globalAlpha = this.energy / 100;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Energy indicator
        if (this.energy < 50) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }
}

function createEntities(count) {
    entities = [];
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        entities.push(new Entity(x, y));
    }
}

function updateSimulation() {
    if (!isRunning) return;

    const speed = parseInt(speedSlider.value);
    for (let i = 0; i < speed; i++) {
        entities.forEach(entity => entity.update());
    }

    // Remove dead entities
    entities = entities.filter(entity => entity.energy > 0);

    // Check for new generation (every 10 seconds)
    const currentTime = Date.now();
    if (currentTime - lastGenerationTime > 10000 && entities.length > 0) {
        evolveGeneration();
        lastGenerationTime = currentTime;
    }

    updateStats();
    renderSimulation();
}

function evolveGeneration() {
    generation++;

    // Sort by fitness
    entities.sort((a, b) => b.fitness - a.fitness);

    // Keep top performers and create offspring
    const survivors = entities.slice(0, Math.floor(entities.length * 0.3));
    const newEntities = [];

    // Create offspring from survivors
    while (newEntities.length + survivors.length < entities.length) {
        const parent1 = survivors[Math.floor(Math.random() * survivors.length)];
        const parent2 = survivors[Math.floor(Math.random() * survivors.length)];

        const child = new Entity(
            (parent1.x + parent2.x) / 2 + (Math.random() - 0.5) * 20,
            (parent1.y + parent2.y) / 2 + (Math.random() - 0.5) * 20
        );

        // Inherit traits with mutation
        child.vx = (parent1.vx + parent2.vx) / 2 + (Math.random() - 0.5) * 0.5;
        child.vy = (parent1.vy + parent2.vy) / 2 + (Math.random() - 0.5) * 0.5;
        child.energy = 100;

        newEntities.push(child);
    }

    entities = [...survivors, ...newEntities];
}

function renderSimulation() {
    // Clear canvas
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw environment effects
    const environmentValue = parseInt(environmentSlider.value);
    ctx.fillStyle = \`rgba(0, 212, 255, \${environmentValue / 200})\`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw entities
    entities.forEach(entity => entity.render());
}

function updateStats() {
    aliveCount.textContent = entities.length;

    if (entities.length > 0) {
        const totalFitness = entities.reduce((sum, entity) => sum + entity.fitness, 0);
        const avgFitnessValue = (totalFitness / entities.length).toFixed(2);
        avgFitness.textContent = avgFitnessValue;
    }

    generationCount.textContent = generation;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeValue.textContent = elapsed + 's';
}

function updateValueDisplays() {
    populationValue.textContent = populationSlider.value;
    speedValue.textContent = speedSlider.value;
    environmentValue.textContent = environmentSlider.value;
    resourcesValue.textContent = resourcesSlider.value;
}

function startStopSimulation() {
    isRunning = !isRunning;
    startStopBtn.textContent = isRunning ? 'Stop Simulation' : 'Start Simulation';
    startStopBtn.classList.toggle('running', isRunning);

    if (isRunning) {
        startTime = Date.now();
        lastGenerationTime = Date.now();
    }
}

function resetSimulation() {
    isRunning = false;
    generation = 0;
    startStopBtn.textContent = 'Start Simulation';
    startStopBtn.classList.remove('running');

    const population = parseInt(populationSlider.value);
    createEntities(population);
    updateStats();
    renderSimulation();
}

// Event listeners
startStopBtn.addEventListener('click', startStopSimulation);
resetBtn.addEventListener('click', resetSimulation);

populationSlider.addEventListener('input', updateValueDisplays);
speedSlider.addEventListener('input', updateValueDisplays);
environmentSlider.addEventListener('input', updateValueDisplays);
resourcesSlider.addEventListener('input', updateValueDisplays);

// Initialize
updateValueDisplays();
createEntities(50);
renderSimulation();

// Game loop
function gameLoop() {
    updateSimulation();
    requestAnimationFrame(gameLoop);
}

gameLoop();`;
    }

    getSimulationCSSTemplate() {
        return `/* Simulation Game Styles */
body {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
    color: white;
    font-family: 'Arial', sans-serif;
    overflow: hidden;
}

#gameContainer {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

#simulationCanvas {
    flex: 1;
    background: #16213e;
    border: 2px solid #0f3460;
    border-radius: 4px;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}

#ui {
    height: 200px;
    background: linear-gradient(to top, #0f3460, #16213e);
    padding: 20px;
    border-top: 2px solid #e94560;
    box-sizing: border-box;
}

.control-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.control-group {
    background: rgba(255, 255, 255, 0.1);
    padding: 15px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: background 0.3s;
}

.control-group:hover {
    background: rgba(255, 255, 255, 0.15);
}

.control-group h4 {
    margin: 0 0 15px 0;
    color: #e94560;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.slider-container {
    margin-bottom: 10px;
}

.slider {
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.2);
    outline: none;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #00d4ff;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #00d4ff;
    cursor: pointer;
    border: none;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.value {
    font-weight: bold;
    color: #00d4ff;
    font-size: 18px;
    text-align: center;
    margin-top: 5px;
}

#startStopBtn {
    background: linear-gradient(45deg, #e94560, #c44569);
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(233, 69, 96, 0.3);
}

#startStopBtn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(233, 69, 96, 0.4);
}

#startStopBtn.running {
    background: linear-gradient(45deg, #f39c12, #e67e22);
    box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
}

#startStopBtn.running:hover {
    box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
}

#resetBtn {
    background: #95a5a6;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s;
    margin-left: 10px;
}

#resetBtn:hover {
    background: #7f8c8d;
    transform: translateY(-2px);
}

.stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.stat-item {
    text-align: center;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #00d4ff;
    margin-bottom: 5px;
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.stat-label {
    font-size: 12px;
    color: #95a5a6;
    text-transform: uppercase;
    letter-spacing: 1px;
}`;
    }

    // Custom Template Management
    loadCustomTemplates() {
        try {
            const customTemplates = localStorage.getItem('gameEngineCustomTemplates');
            if (customTemplates) {
                const templates = JSON.parse(customTemplates);
                Object.entries(templates).forEach(([id, template]) => {
                    this.templates.set(id, template);
                });
                console.log(`Loaded ${Object.keys(templates).length} custom templates`);
            }
        } catch (error) {
            console.error('Failed to load custom templates:', error);
        }
    }

    saveCustomTemplates() {
        try {
            const customTemplates = {};
            this.templates.forEach((template, id) => {
                // Only save custom templates (those not built-in)
                if (!this.isBuiltInTemplate(id)) {
                    customTemplates[id] = template;
                }
            });
            localStorage.setItem('gameEngineCustomTemplates', JSON.stringify(customTemplates));
        } catch (error) {
            console.error('Failed to save custom templates:', error);
        }
    }

    isBuiltInTemplate(templateId) {
        const builtInTemplates = ['blank', 'poker-game', 'game-engine', 'platformer', 'rpg', 'strategy', 'puzzle', 'racing', 'simulation'];
        return builtInTemplates.includes(templateId);
    }

    createCustomTemplate(templateData) {
        const templateId = 'custom_' + Date.now();
        const template = {
            id: templateId,
            name: templateData.name,
            description: templateData.description,
            icon: templateData.icon || '🎨',
            files: new Map(Object.entries(templateData.files || {})),
            config: templateData.config || {},
            created: Date.now(),
            isCustom: true
        };

        this.templates.set(templateId, template);
        this.saveCustomTemplates();

        console.log(`Created custom template: ${template.name}`);
        return template;
    }

    deleteCustomTemplate(templateId) {
        if (!this.templates.has(templateId) || this.isBuiltInTemplate(templateId)) {
            throw new Error('Cannot delete built-in template');
        }

        this.templates.delete(templateId);
        this.saveCustomTemplates();
        console.log(`Deleted custom template: ${templateId}`);
    }

    cloneTemplate(templateId, newName) {
        if (!this.templates.has(templateId)) {
            throw new Error(`Template ${templateId} not found`);
        }

        const originalTemplate = this.templates.get(templateId);
        const clonedTemplate = {
            ...JSON.parse(JSON.stringify(originalTemplate)),
            id: 'custom_' + Date.now(),
            name: newName || `${originalTemplate.name} (Clone)`,
            created: Date.now(),
            isCustom: true
        };

        // Convert files back to Map
        clonedTemplate.files = new Map(Object.entries(clonedTemplate.files || {}));

        this.templates.set(clonedTemplate.id, clonedTemplate);
        this.saveCustomTemplates();

        console.log(`Cloned template: ${originalTemplate.name} -> ${clonedTemplate.name}`);
        return clonedTemplate;
    }

    // Project Versioning System
    createVersion(projectId, versionName = null, description = '') {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const project = this.projects.get(projectId);
        const version = {
            id: this.generateVersionId(),
            name: versionName || `v${project.version}`,
            description,
            timestamp: Date.now(),
            projectState: {
                name: project.name,
                description: project.description,
                files: Object.fromEntries(project.files),
                config: project.config,
                metadata: project.metadata
            },
            parentVersion: project.currentVersion || null
        };

        // Initialize versions array if it doesn't exist
        if (!project.versions) {
            project.versions = [];
        }

        // Add version
        project.versions.push(version);
        project.currentVersion = version.id;

        // Keep only last 20 versions
        if (project.versions.length > 20) {
            project.versions = project.versions.slice(-20);
        }

        // Save changes
        this.saveProjects();

        console.log(`Created version ${version.name} for project ${project.name}`);
        return version;
    }

    restoreVersion(projectId, versionId) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const project = this.projects.get(projectId);
        const version = project.versions?.find(v => v.id === versionId);

        if (!version) {
            throw new Error(`Version ${versionId} not found`);
        }

        // Create backup before restoring
        const backupVersion = this.createVersion(projectId, `Backup before restore to ${version.name}`);

        // Restore project state
        Object.assign(project, {
            name: version.projectState.name,
            description: version.projectState.description,
            files: new Map(Object.entries(version.projectState.files)),
            config: version.projectState.config,
            metadata: version.projectState.metadata,
            modified: Date.now()
        });

        // Save changes
        this.saveProjects();

        console.log(`Restored project ${project.name} to version ${version.name}`);
        return { project, backupVersion };
    }

    getVersions(projectId) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const project = this.projects.get(projectId);
        return project.versions || [];
    }

    deleteVersion(projectId, versionId) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const project = this.projects.get(projectId);
        if (!project.versions) return false;

        const versionIndex = project.versions.findIndex(v => v.id === versionId);
        if (versionIndex === -1) return false;

        // Don't allow deleting the current version
        if (project.currentVersion === versionId) {
            throw new Error('Cannot delete the current version');
        }

        project.versions.splice(versionIndex, 1);
        this.saveProjects();

        console.log(`Deleted version ${versionId} from project ${project.name}`);
        return true;
    }

    generateVersionId() {
        return 'ver_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    // Enhanced metadata management
    updateProjectMetadata(projectId, metadata) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const project = this.projects.get(projectId);
        project.metadata = { ...project.metadata, ...metadata };
        project.modified = Date.now();

        this.saveProjects();
        console.log(`Updated metadata for project ${project.name}`);
        return project.metadata;
    }

    searchProjects(query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        this.projects.forEach(project => {
            const matches = (
                project.name.toLowerCase().includes(searchTerm) ||
                project.description.toLowerCase().includes(searchTerm) ||
                project.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                project.metadata?.categories?.some(cat => cat.toLowerCase().includes(searchTerm))
            );

            if (matches) {
                results.push(project);
            }
        });

        return results;
    }

    getProjectsByTag(tag) {
        const results = [];
        this.projects.forEach(project => {
            if (project.metadata?.tags?.includes(tag)) {
                results.push(project);
            }
        });
        return results;
    }

    // Enhanced search functionality
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const typeFilter = document.getElementById('typeFilter');
        const sortBy = document.getElementById('sortBy');
        const sortOrder = document.getElementById('sortOrder');
        const resultsContainer = document.getElementById('searchResults');
        const statsContainer = document.getElementById('searchStats');

        if (!resultsContainer) return;

        const query = searchInput ? searchInput.value.trim() : '';
        const type = typeFilter ? typeFilter.value : '';
        const sortField = sortBy ? sortBy.value : 'name';
        const sortDirection = sortOrder ? sortOrder.value : 'asc';

        let results = Array.from(this.projects.values());

        // Apply text search
        if (query) {
            results = results.filter(project => {
                const searchIn = [
                    project.name,
                    project.description,
                    project.metadata?.tags?.join(' '),
                    project.metadata?.categories?.join(' ')
                ].filter(Boolean).join(' ').toLowerCase();

                return searchIn.includes(query.toLowerCase());
            });
        }

        // Apply type filter
        if (type) {
            results = results.filter(project => project.template === type);
        }

        // Apply sorting
        results.sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'created':
                    aValue = new Date(a.created);
                    bValue = new Date(b.created);
                    break;
                case 'modified':
                    aValue = new Date(a.modified);
                    bValue = new Date(b.modified);
                    break;
                case 'size':
                    aValue = this.calculateProjectSize(a);
                    bValue = this.calculateProjectSize(b);
                    break;
                default: // name
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        // Display results
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No projects found matching your criteria.</p>';
        } else {
            resultsContainer.innerHTML = results.map(project => this.createSearchResultItem(project)).join('');
        }

        // Update stats
        if (statsContainer) {
            statsContainer.textContent = `Found ${results.length} project${results.length !== 1 ? 's' : ''}`;
        }
    }

    createSearchResultItem(project) {
        const template = this.templates.get(project.template);
        const templateIcon = template ? template.icon : '📁';
        const fileCount = project.files ? project.files.size : 0;

        return `
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 cursor-pointer transition-colors"
                 onclick="window.projectManager.showProjectDetails('${project.id}')">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center">
                        <span class="text-2xl mr-3">${templateIcon}</span>
                        <div>
                            <h4 class="font-bold text-white">${project.name}</h4>
                            <p class="text-sm text-gray-400">${template ? template.name : 'Custom'}</p>
                        </div>
                    </div>
                    <span class="text-xs bg-gray-700 px-2 py-1 rounded">${fileCount} files</span>
                </div>

                <p class="text-gray-300 text-sm mb-2 line-clamp-2">${project.description || 'No description'}</p>

                <div class="flex justify-between items-center text-xs text-gray-500">
                    <span>Created: ${new Date(project.created).toLocaleDateString()}</span>
                    <span>v${project.version || '1.0.0'}</span>
                </div>
            </div>
        `;
    }

    calculateProjectSize(project) {
        if (!project.files) return 0;

        let totalSize = 0;
        project.files.forEach(content => {
            totalSize += (content || '').length;
        });

        return totalSize;
    }
}

// Initialize the Project Manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.projectManager = new ProjectManager();
});
