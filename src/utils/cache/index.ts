import QuickLRU from 'quick-lru';

const lruInfinity = new QuickLRU<string, any>({ maxSize: 1000 });
const lru1Hour = new QuickLRU<string, any>({ maxSize: 1000, maxAge: 1000 * 60 * 60 });

const setCache = async (key: string, value: any, cache: QuickLRU<string, any>) => {
    cache.set(key, value);
}

const getCache = async (key: string, cache: QuickLRU<string, any>) => {
    return cache.get(key);
}

const hasCache = async (key: string, cache: QuickLRU<string, any>) => {
    return cache.has(key);
}

export {
    lruInfinity,
    lru1Hour,
    setCache,
    getCache,
    hasCache,
};
