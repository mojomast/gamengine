// ResourceManager - basic asset loading utility
// Not yet wired into GameEngine by default

class ResourceManager {
  constructor() {
    this.textures = new Map();
    this.audio = new Map();
    this.json = new Map();
  }

  async loadTexture(id, url) {
    try {
      if (this.textures.has(id)) return this.textures.get(id);
      const img = new Image();
      img.decoding = 'async';
      const p = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
      img.src = url;
      const loaded = await p;
      this.textures.set(id, loaded);
      return loaded;
    } catch (error) {
      console.error(`Failed to load texture ${id}:`, error);
      throw error;
    }
  }

  async loadAudio(id, url) {
    try {
      if (this.audio.has(id)) return this.audio.get(id);
      const audio = new Audio();
      const p = new Promise((resolve, reject) => {
        audio.oncanplaythrough = () => resolve(audio);
        audio.onerror = reject;
      });
      audio.src = url;
      const loaded = await p;
      this.audio.set(id, loaded);
      return loaded;
    } catch (error) {
      console.error(`Failed to load audio ${id}:`, error);
      throw error;
    }
  }

  async loadJSON(id, url) {
    try {
      if (this.json.has(id)) return this.json.get(id);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      this.json.set(id, data);
      return data;
    } catch (error) {
      console.error(`Failed to load JSON ${id}:`, error);
      throw error;
    }
  }

  async preloadAll(manifest = { textures: [], audio: [], json: [] }) {
    try {
      const jobs = [];
      (manifest.textures || []).forEach(({ id, url }) => jobs.push(this.loadTexture(id, url).catch(error => console.warn(`Failed to preload texture ${id}:`, error))));
      (manifest.audio || []).forEach(({ id, url }) => jobs.push(this.loadAudio(id, url).catch(error => console.warn(`Failed to preload audio ${id}:`, error))));
      (manifest.json || []).forEach(({ id, url }) => jobs.push(this.loadJSON(id, url).catch(error => console.warn(`Failed to preload JSON ${id}:`, error))));
      await Promise.all(jobs);
    } catch (error) {
      console.error('Failed to preload resources:', error);
      throw error;
    }
  }
}

export { ResourceManager };