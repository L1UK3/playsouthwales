import type { Event } from "../types/Event";

export class CalendarCache {
    private cache: Map<string, Event[]>;
    private maxSize: number;
    private fetchPromises: Map<string, Promise<Event[] | null>>;

    constructor(maxSize = 12) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.fetchPromises = new Map();
    }

    get(key: string): Event[] | null {
        if (this.cache.has(key)) {
            const value = this.cache.get(key)!;
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return null;
    }

    set(key: string, value: Event[]): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey !== undefined) {
                this.cache.delete(oldestKey);
            }
        }
        this.cache.set(key, value);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    getFetchPromise(key: string): Promise<Event[] | null> | undefined {
        return this.fetchPromises.get(key);
    }

    setFetchPromise(key: string, promise: Promise<Event[] | null>): void {
        this.fetchPromises.set(key, promise);
    }

    deleteFetchPromise(key: string): void {
        this.fetchPromises.delete(key);
    }

    getAll(): Event[] {
        let all: Event[] = [];
        for (const value of this.cache.values()) {
            all.push(...value);
        }
        return all;
    }
}
