// Renderer - small abstraction over Canvas 2D with mobile optimizations
// Not yet wired into GameEngine by default

class Renderer {
   constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas?.getContext('2d') || null;

      if (canvas && !this.ctx) {
         console.error('2D canvas context not available. Canvas rendering will not work.');
         return;
      }

      // Mobile optimization properties
      this.devicePixelRatio = this.getDevicePixelRatio();
      this.isMobile = this.detectMobile();
      this.powerSavingMode = false;
      this.lastFrameTime = 0;
      this.frameCount = 0;
      this.fps = 60;

      // Performance monitoring
      this.performanceStats = {
         drawCalls: 0,
         triangles: 0,
         textureSwitches: 0
      };

      this.setupMobileOptimizations();
   }

   detectMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             ('ontouchstart' in window && window.innerWidth <= 1024);
   }

   getDevicePixelRatio() {
      return window.devicePixelRatio || 1;
   }

   setupMobileOptimizations() {
      if (!this.ctx) return;

      // Set up high DPI rendering
      this.updateCanvasSize();

      // Enable image smoothing based on device
      this.ctx.imageSmoothingEnabled = !this.isMobile; // Disable on mobile for performance
      this.ctx.imageSmoothingQuality = this.isMobile ? 'low' : 'high';

      // Set up power saving
      this.setupPowerSaving();
   }

   updateCanvasSize() {
      if (!this.canvas) return;

      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Set actual canvas size for high DPI
      this.canvas.width = width * this.devicePixelRatio;
      this.canvas.height = height * this.devicePixelRatio;

      // Scale context to match CSS size
      this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);

      // Reset CSS size
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
   }

   setupPowerSaving() {
      // Monitor battery level if available
      if ('getBattery' in navigator) {
         navigator.getBattery().then(battery => {
            this.monitorBattery(battery);
         });
      }

      // Reduce quality on mobile devices
      if (this.isMobile) {
         this.enablePowerSavingMode();
      }
   }

   monitorBattery(battery) {
      const updatePowerMode = () => {
         if (battery.level < 0.2 && !battery.charging) {
            this.enablePowerSavingMode();
         } else if (battery.level > 0.5 || battery.charging) {
            this.disablePowerSavingMode();
         }
      };

      battery.addEventListener('levelchange', updatePowerMode);
      battery.addEventListener('chargingchange', updatePowerMode);
      updatePowerMode();
   }

   enablePowerSavingMode() {
      this.powerSavingMode = true;
      if (this.ctx) {
         this.ctx.imageSmoothingEnabled = false;
         this.ctx.globalCompositeOperation = 'source-over'; // Simpler compositing
      }
      console.log('Power saving mode enabled for mobile/battery optimization');
   }

   disablePowerSavingMode() {
      this.powerSavingMode = false;
      if (this.ctx) {
         this.ctx.imageSmoothingEnabled = !this.isMobile;
         this.ctx.imageSmoothingQuality = this.isMobile ? 'low' : 'high';
      }
      console.log('Power saving mode disabled');
   }

  clear(color = null) {
    if (!this.ctx) return;

    // Performance optimization: use clearRect when possible
    if (!color) {
      this.ctx.clearRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);
      return;
    }

    // Mobile optimization: reduce clear operations in power saving mode
    if (this.powerSavingMode) {
      // Only clear changed areas (simplified - would need dirty rectangle tracking)
      this.ctx.clearRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);
      return;
    }

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);
    this.ctx.restore();

    this.performanceStats.drawCalls++;
  }

  present() {
    // Performance monitoring
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;
    }

    // Reset performance stats for next frame
    this.performanceStats.drawCalls = 0;
    this.performanceStats.triangles = 0;
    this.performanceStats.textureSwitches = 0;
  }

  // Lazy loading for mobile
  shouldSkipFrame() {
    // Skip frames on mobile when battery is low or device is under heavy load
    if (!this.isMobile || !this.powerSavingMode) return false;

    // Simple frame skipping based on performance
    return this.fps < 30 && Math.random() < 0.3; // Skip 30% of frames at low FPS
  }

  getPerformanceStats() {
    return {
      fps: this.fps,
      devicePixelRatio: this.devicePixelRatio,
      isMobile: this.isMobile,
      powerSavingMode: this.powerSavingMode,
      drawCalls: this.performanceStats.drawCalls,
      ...this.performanceStats
    };
  }

  drawSprite(texture, x, y, options = {}) {
    if (!this.ctx || !texture) return;

    const { width = texture.width, height = texture.height, alpha = 1, rotation = 0 } = options;

    // Skip rendering off-screen sprites for performance
    if (this.powerSavingMode) {
      const screenWidth = this.canvas.width / this.devicePixelRatio;
      const screenHeight = this.canvas.height / this.devicePixelRatio;
      if (x + width/2 < 0 || x - width/2 > screenWidth ||
          y + height/2 < 0 || y - height/2 > screenHeight) {
        return;
      }
    }

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.translate(x, y);
    if (rotation) this.ctx.rotate(rotation);

    // Mobile optimization: reduce texture quality in power saving mode
    if (this.powerSavingMode) {
      const reducedWidth = Math.floor(width * 0.75);
      const reducedHeight = Math.floor(height * 0.75);
      this.ctx.drawImage(texture, -reducedWidth / 2, -reducedHeight / 2, reducedWidth, reducedHeight);
    } else {
      this.ctx.drawImage(texture, -width / 2, -height / 2, width, height);
    }

    this.ctx.restore();
    this.performanceStats.drawCalls++;
  }
}

export { Renderer };