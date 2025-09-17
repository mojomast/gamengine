/**
 * Integrated Project Workflow System
 * Combines project management, preservation, and easy project creation
 */

class ProjectWorkflow {
    constructor() {
        this.projectManager = null;
        this.preservation = null;
        this.currentWorkspace = null;
        this.isInitialized = false;
        
        this.workflows = new Map();
        this.activeWorkflow = null;
        
        this.init();
    }

    async init() {
        console.log('🔄 Initializing Project Workflow System...');
        
        // Initialize core systems
        this.preservation = new ProjectPreservation();
        await this.preservation.loadPreservations();
        
        // Setup default workflows
        this.setupDefaultWorkflows();
        
        // Setup global shortcuts and helpers
        this.setupGlobalHelpers();
        
        this.isInitialized = true;
        console.log('✅ Project Workflow System ready');
    }

    setupDefaultWorkflows() {
        // Quick Start Workflow
        this.workflows.set('quick-start', {
            id: 'quick-start',
            name: 'Quick Start New Project',
            description: 'Quickly create a new project while preserving current work',
            steps: [
                { id: 'preserve', name: 'Preserve Current Work', auto: true },
                { id: 'choose-template', name: 'Choose Template', auto: false },
                { id: 'configure', name: 'Configure Project', auto: false },
                { id: 'create', name: 'Create Project', auto: true },
                { id: 'open', name: 'Open New Project', auto: true }
            ]
        });

        // Migration Workflow
        this.workflows.set('migration', {
            id: 'migration',
            name: 'Migrate Existing Project',
            description: 'Convert existing work into managed project',
            steps: [
                { id: 'analyze', name: 'Analyze Current Project', auto: true },
                { id: 'backup', name: 'Create Backup', auto: true },
                { id: 'extract', name: 'Extract Project Files', auto: true },
                { id: 'organize', name: 'Organize Structure', auto: false },
                { id: 'finalize', name: 'Finalize Migration', auto: true }
            ]
        });

        // Clone Workflow
        this.workflows.set('clone', {
            id: 'clone',
            name: 'Clone Current Project',
            description: 'Create a copy of current project for experimentation',
            steps: [
                { id: 'capture', name: 'Capture Current State', auto: true },
                { id: 'clone', name: 'Clone Project', auto: true },
                { id: 'rename', name: 'Rename Clone', auto: false },
                { id: 'open-clone', name: 'Open Clone', auto: true }
            ]
        });

        // Restore Workflow
        this.workflows.set('restore', {
            id: 'restore',
            name: 'Restore Previous Version',
            description: 'Restore from backup or preserved version',
            steps: [
                { id: 'list-options', name: 'List Recovery Options', auto: true },
                { id: 'select', name: 'Select Version', auto: false },
                { id: 'confirm', name: 'Confirm Restore', auto: false },
                { id: 'restore', name: 'Restore Project', auto: true }
            ]
        });
    }

    // Execute workflow
    async executeWorkflow(workflowId, options = {}) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        console.log(`🚀 Starting workflow: ${workflow.name}`);
        this.activeWorkflow = {
            ...workflow,
            startTime: Date.now(),
            currentStep: 0,
            status: 'running',
            results: {},
            options
        };

        try {
            for (let i = 0; i < workflow.steps.length; i++) {
                this.activeWorkflow.currentStep = i;
                const step = workflow.steps[i];
                
                console.log(`  📋 Step ${i + 1}: ${step.name}`);
                
                const result = await this.executeWorkflowStep(workflowId, step, options);
                this.activeWorkflow.results[step.id] = result;
                
                // If step is not auto and returns false, pause workflow
                if (!step.auto && result === false) {
                    this.activeWorkflow.status = 'paused';
                    console.log(`  ⏸️ Workflow paused at step: ${step.name}`);
                    return this.activeWorkflow;
                }
            }

            this.activeWorkflow.status = 'completed';
            this.activeWorkflow.endTime = Date.now();
            console.log(`✅ Workflow completed: ${workflow.name}`);
            
        } catch (error) {
            this.activeWorkflow.status = 'failed';
            this.activeWorkflow.error = error.message;
            console.error(`❌ Workflow failed: ${error.message}`);
            throw error;
        }

        return this.activeWorkflow;
    }

    async executeWorkflowStep(workflowId, step, options) {
        switch (workflowId) {
            case 'quick-start':
                return await this.executeQuickStartStep(step, options);
            case 'migration':
                return await this.executeMigrationStep(step, options);
            case 'clone':
                return await this.executeCloneStep(step, options);
            case 'restore':
                return await this.executeRestoreStep(step, options);
            default:
                throw new Error(`Unknown workflow: ${workflowId}`);
        }
    }

    // Quick Start Workflow Steps
    async executeQuickStartStep(step, options) {
        switch (step.id) {
            case 'preserve':
                const preservationId = await this.preservation.preserveCurrentProject(
                    options.preservationName || 'Current Project (Auto-preserved)'
                );
                return { preservationId };

            case 'choose-template':
                // This step requires user interaction
                return await this.showTemplateSelector();

            case 'configure':
                // This step requires user interaction
                return await this.showProjectConfiguration(options.template);

            case 'create':
                if (!this.projectManager) {
                    throw new Error('Project Manager not initialized');
                }
                
                const project = await this.projectManager.createProject({
                    name: options.projectName,
                    description: options.projectDescription,
                    template: options.template
                });
                return { project };

            case 'open':
                if (options.project) {
                    await this.openProjectInNewWindow(options.project);
                    return { opened: true };
                }
                break;
        }
    }

    // Migration Workflow Steps
    async executeMigrationStep(step, options) {
        switch (step.id) {
            case 'analyze':
                return await this.analyzeCurrentProject();

            case 'backup':
                const checkpointId = await this.preservation.createMigrationCheckpoint(
                    'Pre-migration backup'
                );
                return { checkpointId };

            case 'extract':
                return await this.extractProjectFiles();

            case 'organize':
                // This step requires user interaction
                return await this.showProjectOrganizer(options.extractedFiles);

            case 'finalize':
                return await this.finalizeMigration(options);
        }
    }

    // Clone Workflow Steps
    async executeCloneStep(step, options) {
        switch (step.id) {
            case 'capture':
                const snapshot = await this.captureCurrentState();
                return { snapshot };

            case 'clone':
                const cloneProject = await this.createCloneProject(options.snapshot);
                return { cloneProject };

            case 'rename':
                // This step requires user interaction
                return await this.showRenameDialog(options.cloneProject);

            case 'open-clone':
                await this.openProjectInNewWindow(options.cloneProject);
                return { opened: true };
        }
    }

    // Restore Workflow Steps
    async executeRestoreStep(step, options) {
        switch (step.id) {
            case 'list-options':
                const recoveryOptions = this.preservation.getRecoveryOptions();
                return { recoveryOptions };

            case 'select':
                // This step requires user interaction
                return await this.showRecoverySelector(options.recoveryOptions);

            case 'confirm':
                // This step requires user interaction
                return await this.showRestoreConfirmation(options.selectedOption);

            case 'restore':
                await this.executeRestore(options.selectedOption);
                return { restored: true };
        }
    }

    // Helper methods for workflow steps
    async analyzeCurrentProject() {
        const analysis = {
            url: window.location.href,
            title: document.title,
            hasCanvas: !!document.querySelector('canvas'),
            hasGameElements: this.detectGameElements(),
            scripts: Array.from(document.scripts).map(s => s.src || 'inline'),
            stylesheets: Array.from(document.styleSheets).length,
            projectType: this.detectProjectType(),
            complexity: this.calculateComplexity()
        };

        console.log('📊 Project analysis:', analysis);
        return analysis;
    }

    detectGameElements() {
        const gameKeywords = [
            'game', 'player', 'score', 'level', 'enemy', 'card', 'poker',
            'canvas', 'sprite', 'animation', 'sound', 'music'
        ];

        const content = document.body.textContent.toLowerCase();
        const foundKeywords = gameKeywords.filter(keyword => 
            content.includes(keyword)
        );

        return foundKeywords;
    }

    detectProjectType() {
        // Check for specific patterns to determine project type
        if (document.querySelector('.card') && document.body.textContent.includes('poker')) {
            return 'card-game';
        }
        if (document.querySelector('canvas')) {
            return 'canvas-game';
        }
        if (document.body.textContent.toLowerCase().includes('rpg')) {
            return 'rpg';
        }
        if (document.body.textContent.toLowerCase().includes('platform')) {
            return 'platformer';
        }
        return 'web-game';
    }

    calculateComplexity() {
        let score = 0;
        
        // Count elements
        score += document.querySelectorAll('*').length / 100;
        
        // Count scripts
        score += document.scripts.length * 2;
        
        // Count stylesheets
        score += document.styleSheets.length;
        
        // Check for complex features
        if (document.querySelector('canvas')) score += 5;
        if (document.querySelector('audio, video')) score += 3;
        if (window.localStorage.length > 0) score += 2;
        
        if (score < 5) return 'simple';
        if (score < 15) return 'moderate';
        return 'complex';
    }

    async extractProjectFiles() {
        const files = new Map();
        
        // Extract HTML
        files.set('index.html', document.documentElement.outerHTML);
        
        // Extract inline styles
        const styles = Array.from(document.querySelectorAll('style'))
            .map(style => style.textContent).join('\n');
        if (styles) {
            files.set('css/extracted-styles.css', styles);
        }
        
        // Extract inline scripts
        const scripts = Array.from(document.querySelectorAll('script:not([src])'))
            .map(script => script.textContent).join('\n\n');
        if (scripts) {
            files.set('js/extracted-scripts.js', scripts);
        }
        
        return files;
    }

    async captureCurrentState() {
        return {
            html: document.documentElement.outerHTML,
            url: window.location.href,
            timestamp: Date.now(),
            title: document.title,
            metadata: {
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };
    }

    async createCloneProject(snapshot) {
        if (!this.projectManager) {
            throw new Error('Project Manager not initialized');
        }

        const project = await this.projectManager.createProject({
            name: `${document.title} (Clone)`,
            description: `Cloned from ${window.location.href}`,
            template: 'blank'
        });

        // Update with captured content
        this.projectManager.updateProjectFile(project.id, 'index.html', snapshot.html);
        
        return project;
    }

    async openProjectInNewWindow(project) {
        // Create a deployable version of the project
        const mainHTML = project.files?.get('index.html') || 
                        this.projectManager?.getProjectFile(project.id, 'index.html');
        
        if (mainHTML) {
            const blob = new Blob([mainHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const newWindow = window.open(url, `project_${project.id}`, 
                'width=1200,height=800,menubar=yes,toolbar=yes,scrollbars=yes');
            
            if (newWindow) {
                newWindow.addEventListener('load', () => {
                    URL.revokeObjectURL(url);
                });
                return true;
            }
        }
        return false;
    }

    // UI Helper methods (these would show modals/dialogs)
    async showTemplateSelector() {
        return new Promise((resolve) => {
            // This would show a template selection UI
            // For now, return a default template
            setTimeout(() => resolve({ template: 'blank' }), 100);
        });
    }

    async showProjectConfiguration(template) {
        return new Promise((resolve) => {
            // This would show project configuration UI
            setTimeout(() => resolve({
                projectName: 'New Project',
                projectDescription: 'Created via workflow'
            }), 100);
        });
    }

    async showProjectOrganizer(extractedFiles) {
        return new Promise((resolve) => {
            // This would show file organization UI
            setTimeout(() => resolve({ organized: true }), 100);
        });
    }

    async showRenameDialog(project) {
        return new Promise((resolve) => {
            const newName = prompt('Enter new name for cloned project:', `${project.name} (Copy)`);
            if (newName) {
                project.name = newName;
            }
            resolve({ renamed: !!newName });
        });
    }

    async showRecoverySelector(options) {
        return new Promise((resolve) => {
            // This would show recovery options UI
            // For now, select the most recent option
            if (options.length > 0) {
                resolve({ selectedOption: options[0] });
            } else {
                resolve({ selectedOption: null });
            }
        });
    }

    async showRestoreConfirmation(option) {
        return new Promise((resolve) => {
            if (!option) {
                resolve({ confirmed: false });
                return;
            }
            
            const confirmed = confirm(
                `Are you sure you want to restore from "${option.name}"?\n` +
                `This will replace your current work.`
            );
            resolve({ confirmed });
        });
    }

    async executeRestore(option) {
        if (!option) {
            throw new Error('No restore option selected');
        }

        // Handle different restore types
        switch (option.type) {
            case 'preservation':
                const project = await this.preservation.restoreProject(option.id);
                const mainHTML = project.files.get('index.html');
                if (mainHTML) {
                    document.open();
                    document.write(mainHTML);
                    document.close();
                }
                break;
                
            case 'auto-backup':
                const backups = this.preservation.getAutoBackups();
                const backup = backups.find(b => b.id === option.id);
                if (backup) {
                    document.open();
                    document.write(backup.content);
                    document.close();
                }
                break;
                
            case 'checkpoint':
                const checkpoints = this.preservation.getCheckpoints();
                const checkpoint = checkpoints.find(c => c.id === option.id);
                if (checkpoint) {
                    document.open();
                    document.write(checkpoint.projectState);
                    document.close();
                }
                break;
        }
    }

    async finalizeMigration(options) {
        // Create a proper project from migration
        if (!this.projectManager) {
            throw new Error('Project Manager not initialized');
        }

        const project = await this.projectManager.createProject({
            name: options.projectName || 'Migrated Project',
            description: options.projectDescription || 'Migrated from existing work',
            template: 'blank'
        });

        // Add extracted files
        if (options.extractedFiles) {
            options.extractedFiles.forEach((content, path) => {
                this.projectManager.updateProjectFile(project.id, path, content);
            });
        }

        return { project };
    }

    // Global helper methods
    setupGlobalHelpers() {
        // Add global shortcuts for common workflows
        window.quickStart = () => this.executeWorkflow('quick-start');
        window.cloneProject = () => this.executeWorkflow('clone');
        window.migrateProject = () => this.executeWorkflow('migration');
        window.restoreProject = () => this.executeWorkflow('restore');
        
        // Add preservation shortcuts
        window.preserveNow = (name) => this.preservation.preserveCurrentProject(name);
        window.createCheckpoint = (desc) => this.preservation.createMigrationCheckpoint(desc);
        window.emergencyRestore = () => this.preservation.emergencyRestore();
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+N - Quick start new project
            if (e.ctrlKey && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.executeWorkflow('quick-start');
            }
            
            // Ctrl+Shift+S - Preserve current project
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.preservation.preserveCurrentProject('Manual preservation');
            }
            
            // Ctrl+Shift+R - Show restore options
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.executeWorkflow('restore');
            }
        });

        console.log('⌨️ Global workflow helpers and shortcuts registered');
        console.log('💡 Available commands:');
        console.log('  - quickStart() - Start new project workflow');
        console.log('  - cloneProject() - Clone current project');
        console.log('  - migrateProject() - Migrate to managed project');
        console.log('  - restoreProject() - Restore from backup');
        console.log('  - preserveNow(name) - Preserve current state');
        console.log('  - createCheckpoint(desc) - Create migration checkpoint');
        console.log('  - emergencyRestore() - Emergency restore from backup');
        console.log('🔗 Keyboard shortcuts:');
        console.log('  - Ctrl+Shift+N - Quick start new project');
        console.log('  - Ctrl+Shift+S - Preserve current project');
        console.log('  - Ctrl+Shift+R - Show restore options');
    }

    // Integration with Project Manager
    setProjectManager(projectManager) {
        this.projectManager = projectManager;
        console.log('🔗 Project Manager integrated with workflow system');
    }

    // Get workflow status
    getWorkflowStatus() {
        return this.activeWorkflow;
    }

    // Resume paused workflow
    async resumeWorkflow(options = {}) {
        if (!this.activeWorkflow || this.activeWorkflow.status !== 'paused') {
            throw new Error('No paused workflow to resume');
        }

        // Update options with new data
        Object.assign(this.activeWorkflow.options, options);
        
        // Continue from next step
        this.activeWorkflow.currentStep++;
        this.activeWorkflow.status = 'running';
        
        return await this.executeWorkflow(this.activeWorkflow.id, this.activeWorkflow.options);
    }

    // Cancel active workflow
    cancelWorkflow() {
        if (this.activeWorkflow) {
            this.activeWorkflow.status = 'cancelled';
            this.activeWorkflow.endTime = Date.now();
            console.log(`🚫 Workflow cancelled: ${this.activeWorkflow.name}`);
        }
    }
}

// Initialize global workflow system
window.projectWorkflow = new ProjectWorkflow();
