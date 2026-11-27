const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('⚠️  Redis недоступен — работаем без кэша и rate-limit');
      return null; // прекращаем попытки подключения
    }
    return Math.min(times * 200, 1000);
  },
});

redis.on('connect', () => console.log('✅ Redis подключён'));
redis.on('error', () => {}); // не спамим в консоль

// Безопасные обёртки: если Redis недоступен — возвращают «пусто», не падают
module.exports = {
  get:   async (k)          => { try { return await redis.get(k); }           catch { return null; } },
  set:   async (k, v, ...a) => { try { return await redis.set(k, v, ...a); }  catch { return null; } },
  incr:  async (k)          => { try { return await redis.incr(k); }          catch { return 0;   } },
  expire:async (k, s)       => { try { return await redis.expire(k, s); }     catch { return null; } },
};