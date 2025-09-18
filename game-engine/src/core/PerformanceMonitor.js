/**
 * Performance Monitor for real-time game optimization
 * Tracks FPS, memory usage, and system performance metrics
 */

export class PerformanceMonitor {
    constructor() {
        this.enabled = true;
        this.systemMetrics = new Map();
        this.frameMetrics = [];
        this.maxFrameHistory = 60;
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameTime = 0;
        this.totalFrames = 0;
        this.averageFPS = 60;
        this.memoryUsage = null;
        this.gcPressure = 0;

        // Performance thresholds
        this.thresholds = {
            fps: { warning: 30, critical: 15 },
            frameTime: { warning: 33, critical: 67 }, // ms
            memory: { warning: 50, critical: 80 } // MB
        };

        // Object pool monitoring
        this.poolStats = new Map();

        this.reset();
    }

    reset() {
        this.frameMetrics = [];
        this.systemMetrics.clear();
        this.poolStats.clear();
        this.totalFrames = 0;
        this.averageFPS = 60;
        this.gcPressure = 0;
    }

    update(deltaTime) {
        if (!this.enabled) return;

        const now = performance.now();
        this.frameTime = deltaTime * 1000; // Convert to ms
        this.fps = Math.round(1000 / Math.max(deltaTime, 0.001));

        // Track frame metrics
        this.frameMetrics.push({
            fps: this.fps,
            frameTime: this.frameTime,
            timestamp: now
        });

        // Maintain frame history
        if (this.frameMetrics.length > this.maxFrameHistory) {
            this.frameMetrics.shift();
        }

        // Calculate average FPS
        if (this.frameMetrics.length > 0) {
            const totalFPS = this.frameMetrics.reduce((sum, frame) => sum + frame.fps, 0);
            this.averageFPS = Math.round(totalFPS / this.frameMetrics.length);
        }

        this.totalFrames++;
        this.lastFrameTime = now;

        // Update memory usage
        this.updateMemoryUsage();

        // Check for performance issues
        this.checkPerformanceIssues();
    }

    updateMemoryUsage() {
        if (performance.memory) {
            this.memoryUsage = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                usedMB: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                totalMB: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limitMB: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };

            // Calculate GC pressure
            const memoryPressure = (this.memoryUsage.usedMB / this.memoryUsage.limitMB) * 100;
            this.gcPressure = Math.round(memoryPressure);
        }
    }

    measureSystem(systemName, operation) {
        if (!this.enabled) return operation();

        const start = performance.now();
        const result = operation();
        const duration = performance.now() - start;

        this.recordSystemMetric(systemName, duration);
        return result;
    }

    recordSystemMetric(systemName, duration) {
        if (!this.systemMetrics.has(systemName)) {
            this.systemMetrics.set(systemName, []);
        }

        const metrics = this.systemMetrics.get(systemName);
        metrics.push({
            duration,
            timestamp: performance.now()
        });

        // Keep only recent metrics (last 100 measurements)
        if (metrics.length > 100) {
            metrics.shift();
        }
    }

    getSystemPerformance(systemName) {
        const metrics = this.systemMetrics.get(systemName);
        if (!metrics || metrics.length === 0) {
            return { average: 0, min: 0, max: 0, count: 0 };
        }

        const durations = metrics.map(m => m.duration);
        return {
            average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
            min: Math.min(...durations),
            max: Math.max(...durations),
            count: durations.length,
            last: durations[durations.length - 1]
        };
    }

    getOverallPerformance() {
        const systems = ['render', 'update', 'input', 'audio', 'physics'];
        let totalTime = 0;

        systems.forEach(system => {
            const perf = this.getSystemPerformance(system);
            totalTime += perf.average;
        });

        return {
            fps: this.fps,
            averageFPS: this.averageFPS,
            frameTime: this.frameTime,
            totalFrameTime: totalTime,
            memoryUsage: this.memoryUsage,
            gcPressure: this.gcPressure,
            systemCount: systems.length,
            poolStats: Object.fromEntries(this.poolStats)
        };
    }

    registerPool(poolName, pool) {
        this.poolStats.set(poolName, {
            size: pool.getPoolCount(),
            active: pool.getActiveCount(),
            total: pool.getPoolCount() + pool.getActiveCount()
        });
    }

    updatePoolStats(poolName, stats) {
        this.poolStats.set(poolName, stats);
    }

    checkPerformanceIssues() {
        const issues = [];

        // FPS warnings
        if (this.fps < this.thresholds.fps.critical) {
            issues.push({ type: 'critical', message: `FPS critically low: ${this.fps}` });
        } else if (this.fps < this.thresholds.fps.warning) {
            issues.push({ type: 'warning', message: `FPS low: ${this.fps}` });
        }

        // Frame time warnings
        if (this.frameTime > this.thresholds.frameTime.critical) {
            issues.push({ type: 'critical', message: `Frame time critically high: ${this.frameTime.toFixed(2)}ms` });
        } else if (this.frameTime > this.thresholds.frameTime.warning) {
            issues.push({ type: 'warning', message: `Frame time high: ${this.frameTime.toFixed(2)}ms` });
        }

        // Memory warnings
        if (this.memoryUsage && this.memoryUsage.usedMB > this.thresholds.memory.critical) {
            issues.push({ type: 'critical', message: `Memory usage critical: ${this.memoryUsage.usedMB}MB` });
        } else if (this.memoryUsage && this.memoryUsage.usedMB > this.thresholds.memory.warning) {
            issues.push({ type: 'warning', message: `Memory usage high: ${this.memoryUsage.usedMB}MB` });
        }

        return issues;
    }

    getPerformanceReport() {
        const overall = this.getOverallPerformance();
        const issues = this.checkPerformanceIssues();

        return {
            timestamp: Date.now(),
            overall,
            systemDetails: Object.fromEntries(
                Array.from(this.systemMetrics.keys()).map(system => [
                    system,
                    this.getSystemPerformance(system)
                ])
            ),
            issues,
            recommendations: this.generateRecommendations(issues)
        };
    }

    generateRecommendations(issues) {
        const recommendations = [];

        issues.forEach(issue => {
            switch (issue.type) {
                case 'critical':
                    if (issue.message.includes('FPS')) {
                        recommendations.push('Reduce particle effects, lower texture quality, or decrease render distance');
                    } else if (issue.message.includes('memory')) {
                        recommendations.push('Force garbage collection, reduce object pools, or implement asset unloading');
                    } else if (issue.message.includes('frame time')) {
                        recommendations.push('Optimize rendering pipeline, reduce shader complexity, or implement LOD system');
                    }
                    break;
                case 'warning':
                    recommendations.push('Monitor performance closely and consider optimization if issues persist');
                    break;
            }
        });

        return recommendations;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    // Force garbage collection (if available)
    forceGC() {
        if (window.gc) {
            window.gc();
            console.log('Manual garbage collection triggered');
        } else {
            console.warn('Manual GC not available in this browser');
        }
    }
}