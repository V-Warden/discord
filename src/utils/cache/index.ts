import { LRUCache } from 'lru-cache'

const lruInfinity = new LRUCache<string, any>({ max: 1000 });
const lru1Hour = new LRUCache<string, any>({ max: 1000, ttl: 1000 * 60 * 60 });

const setCache = async (key: string, value: any, cache: LRUCache<string, any>) => {
    cache.set(key, value);
}

const getCache = async (key: string, cache: LRUCache<string, any>) => {
    return cache.get(key);
}

const hasCache = async (key: string, cache: LRUCache<string, any>) => {
    return cache.has(key);
}

export {
    lruInfinity,
    lru1Hour,
    setCache,
    getCache,
    hasCache,
};
