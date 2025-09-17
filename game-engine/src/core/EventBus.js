// EventBus - simple pub/sub for decoupled communication
// Not yet wired into GameEngine by default

class EventBus {
  constructor() {
    this.events = new Map(); // event -> Set<handler>
  }

  on(event, handler) {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event).add(handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    const off = this.on(event, (data) => {
      try { handler(data); } finally { off(); }
    });
    return off;
  }

  off(event, handler) {
    const set = this.events.get(event);
    if (set) set.delete(handler);
  }

  emit(event, data) {
    const set = this.events.get(event);
    if (!set) return;
    // copy to avoid mutation during iteration
    [...set].forEach(fn => {
      try { fn(data); } catch (e) { console.warn('EventBus handler error for', event, e); }
    });
  }

  clear(event = null) {
    if (event === null) this.events.clear();
    else this.events.delete(event);
  }
}

export { EventBus };