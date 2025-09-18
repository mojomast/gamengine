export class GameEngine {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.fps = options.fps || 60;
        this.frameInterval = 1000 / this.fps;
        this.lastFrameTime = 0;
        this.running = false;
        this.debug = options.debug || false;

        // Handle responsive canvas if option is set
        if (options.responsive) {
            window.addEventListener('resize', () => this.handleResize());
            this.handleResize();
        }
    }

    handleResize() {
        const container = this.canvas.parentElement;
        const containerStyle = window.getComputedStyle(container);
        const containerWidth = parseInt(containerStyle.width, 10);
        const containerHeight = parseInt(containerStyle.height, 10);

        // Maintain aspect ratio
        const aspectRatio = this.canvas.width / this.canvas.height;
        let newWidth = containerWidth;
        let newHeight = containerWidth / aspectRatio;

        if (newHeight > containerHeight) {
            newHeight = containerHeight;
            newWidth = containerHeight * aspectRatio;
        }

        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;
    }

    async init() {
        // Override this method to initialize game resources
        return Promise.resolve();
    }

    start() {
        if (!this.running) {
            this.running = true;
            this.lastFrameTime = performance.now();
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }

    stop() {
        this.running = false;
    }

    gameLoop(timestamp) {
        if (!this.running) return;

        const deltaTime = timestamp - this.lastFrameTime;

        if (deltaTime >= this.frameInterval) {
            this.update(deltaTime);
            this.render(this.ctx);
            this.lastFrameTime = timestamp;
        }

        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    update(deltaTime) {
        // Override this method to update game state
    }

    render(ctx) {
        // Override this method to render game state
    }
}