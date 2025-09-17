/**
 * Batch Renderer for optimized canvas operations
 * Reduces draw calls and state changes for better performance
 */

class BatchRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.batches = new Map();
        this.currentBatch = null;
        this.maxBatchSize = 100;
    }

    beginBatch(type = 'default') {
        if (!this.batches.has(type)) {
            this.batches.set(type, {
                operations: [],
                state: null,
                count: 0
            });
        }
        this.currentBatch = this.batches.get(type);
        return this;
    }

    endBatch() {
        if (this.currentBatch) {
            this.flushBatch(this.currentBatch);
            this.currentBatch = null;
        }
        return this;
    }

    // Optimized sprite rendering
    drawSprite(texture, x, y, options = {}) {
        if (!this.currentBatch) {
            // Direct rendering if not batching
            this._drawSpriteDirect(texture, x, y, options);
            return this;
        }

        // Add to batch
        this.currentBatch.operations.push({
            type: 'sprite',
            texture,
            x,
            y,
            options
        });

        // Auto-flush if batch is full
        if (this.currentBatch.operations.length >= this.maxBatchSize) {
            this.flushBatch(this.currentBatch);
            this.currentBatch.operations = [];
        }

        return this;
    }

    // Optimized rectangle rendering
    fillRect(x, y, width, height, color = '#ffffff') {
        if (!this.currentBatch) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, width, height);
            return this;
        }

        this.currentBatch.operations.push({
            type: 'fillRect',
            x,
            y,
            width,
            height,
            color
        });

        if (this.currentBatch.operations.length >= this.maxBatchSize) {
            this.flushBatch(this.currentBatch);
            this.currentBatch.operations = [];
        }

        return this;
    }

    // Optimized text rendering
    drawText(text, x, y, options = {}) {
        const font = options.font || '16px monospace';
        const color = options.color || '#ffffff';
        const align = options.align || 'left';
        const baseline = options.baseline || 'top';

        if (!this.currentBatch) {
            this.ctx.font = font;
            this.ctx.fillStyle = color;
            this.ctx.textAlign = align;
            this.ctx.textBaseline = baseline;
            this.ctx.fillText(text, x, y);
            return this;
        }

        this.currentBatch.operations.push({
            type: 'text',
            text,
            x,
            y,
            font,
            color,
            align,
            baseline
        });

        if (this.currentBatch.operations.length >= this.maxBatchSize) {
            this.flushBatch(this.currentBatch);
            this.currentBatch.operations = [];
        }

        return this;
    }

    flushBatch(batch) {
        if (batch.operations.length === 0) return;

        // Group operations by state for minimal state changes
        const stateGroups = new Map();

        batch.operations.forEach(op => {
            const stateKey = this.getStateKey(op);
            if (!stateGroups.has(stateKey)) {
                stateGroups.set(stateKey, []);
            }
            stateGroups.get(stateKey).push(op);
        });

        // Execute grouped operations
        stateGroups.forEach((operations, stateKey) => {
            this.applyState(stateKey);
            operations.forEach(op => this.executeOperation(op));
        });

        batch.operations = [];
    }

    getStateKey(operation) {
        switch (operation.type) {
            case 'sprite':
                return `sprite_${operation.options.alpha || 1}_${operation.options.rotation || 0}`;
            case 'fillRect':
                return `fill_${operation.color}`;
            case 'text':
                return `text_${operation.font}_${operation.color}_${operation.align}_${operation.baseline}`;
            default:
                return 'default';
        }
    }

    applyState(stateKey) {
        const parts = stateKey.split('_');
        const type = parts[0];

        switch (type) {
            case 'sprite':
                const alpha = parseFloat(parts[1]);
                const rotation = parseFloat(parts[2]);
                this.ctx.globalAlpha = alpha;
                if (rotation !== 0) {
                    this.ctx.save();
                    // Rotation will be applied per sprite
                }
                break;

            case 'fill':
                this.ctx.fillStyle = parts[1];
                break;

            case 'text':
                this.ctx.font = parts[1];
                this.ctx.fillStyle = parts[2];
                this.ctx.textAlign = parts[3];
                this.ctx.textBaseline = parts[4];
                break;
        }
    }

    executeOperation(operation) {
        switch (operation.type) {
            case 'sprite':
                this._drawSpriteDirect(
                    operation.texture,
                    operation.x,
                    operation.y,
                    operation.options
                );
                break;

            case 'fillRect':
                this.ctx.fillRect(
                    operation.x,
                    operation.y,
                    operation.width,
                    operation.height
                );
                break;

            case 'text':
                this.ctx.fillText(operation.text, operation.x, operation.y);
                break;
        }
    }

    _drawSpriteDirect(texture, x, y, options = {}) {
        if (!this.ctx || !texture) return;

        const { width = texture.width, height = texture.height, alpha = 1, rotation = 0 } = options;

        const needsSave = alpha !== 1 || rotation !== 0;

        if (needsSave) {
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.translate(x, y);
            if (rotation) this.ctx.rotate(rotation);
            this.ctx.drawImage(texture, -width / 2, -height / 2, width, height);
            this.ctx.restore();
        } else {
            this.ctx.drawImage(texture, x - width / 2, y - height / 2, width, height);
        }
    }

    // Clear all batches
    clear() {
        this.batches.forEach(batch => {
            batch.operations = [];
        });
        this.currentBatch = null;
    }

    // Get performance stats
    getStats() {
        let totalOperations = 0;
        this.batches.forEach(batch => {
            totalOperations += batch.operations.length;
        });

        return {
            batches: this.batches.size,
            queuedOperations: totalOperations,
            maxBatchSize: this.maxBatchSize
        };
    }
}

export { BatchRenderer };