export class CalendarCache {
  cache: Map<string, any[]>;
  maxSize: number;
  fetchPromises: Map<string, Promise<any[] | null>>;

  constructor(maxSize = 12) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.fetchPromises = new Map();
  }

  get(key: string) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value!);
      return value;
    }
    return null;
  }

  set(key: string, value: any[]) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  has(key: string) {
    return this.cache.has(key);
  }

  getAll() {
    let all: any[] = [];
    for (const value of this.cache.values()) {
      if (Array.isArray(value)) {
        all.push(...value);
      }
    }
    return all;
  }
}
