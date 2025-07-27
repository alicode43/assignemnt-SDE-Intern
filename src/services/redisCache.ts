import { createClient } from 'redis';
import crypto from 'crypto';

// Redis client setup
const client = createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD || '*******',
  socket: {
    host: process.env.REDIS_HOST || '',
    port: parseInt(process.env.REDIS_PORT || '18520')
  }
});

// Error handling
client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => console.log('✅ Redis connected successfully'));
client.on('ready', () => console.log('🚀 Redis is ready to accept commands'));

// Initialize connection
let isConnected = false;

const connectRedis = async () => {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }
};

// Cache service class
class RedisCache {
  private client: typeof client;

  constructor() {
    this.client = client;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    await connectRedis();
  }

  /**
   * Check if Redis is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Parsed value or null
   */
  async get(key: string): Promise<any> {
    try {
      if (!isConnected) await this.connect();
      
      const value = await this.client.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      console.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with expiration
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
   */
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      if (!isConnected) await this.connect();
      
      await this.client.setEx(key, ttl, JSON.stringify(value));
      console.log(`💾 Cached data for key: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      console.error(`Error setting cache for key ${key}:`, error);
    }
  }

  /**
   * Delete specific key from cache
   * @param key - Cache key to delete
   */
  async delete(key: string): Promise<void> {
    try {
      if (!isConnected) await this.connect();
      
      await this.client.del(key);
      console.log(`🗑️ Deleted cache key: ${key}`);
    } catch (error) {
      console.error(`Error deleting cache for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys matching pattern
   * @param pattern - Pattern to match keys (e.g., "properties:*")
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      if (!isConnected) await this.connect();
      
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`🗑️ Deleted ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Generate cache key for property search
   * @param filters - Search filters object
   * @returns Cache key string
   */
  generateSearchKey(filters: any): string {
    // Sort the object keys to ensure consistent cache keys
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result: any, key) => {
        result[key] = filters[key];
        return result;
      }, {});
    
    const filterString = JSON.stringify(sortedFilters);
    const hash = crypto.createHash('md5').update(filterString).digest('hex');
    return `properties:search:${hash}`;
  }

  /**
   * Cache keys for different data types
   */
  static readonly KEYS = {
    FILTER_OPTIONS: 'properties:filter-options',
    ALL_PROPERTIES: 'properties:all',
    USER_PROPERTIES: (userId: string) => `properties:user:${userId}`,
    PROPERTY_DETAIL: (propertyId: string) => `property:detail:${propertyId}`,
    SEARCH_RESULTS: (hash: string) => `properties:search:${hash}`,
  };

  /**
   * Cache TTL values in seconds
   */
  static readonly TTL = {
    FILTER_OPTIONS: 3600, // 1 hour
    SEARCH_RESULTS: 300,  // 5 minutes
    ALL_PROPERTIES: 600,  // 10 minutes
    USER_PROPERTIES: 300, // 5 minutes
    PROPERTY_DETAIL: 1800, // 30 minutes
  };

  /**
   * Invalidate all property-related caches
   */
  async invalidatePropertyCaches(): Promise<void> {
    await Promise.all([
      this.deletePattern('properties:*'),
      this.deletePattern('property:*')
    ]);
  }
}

// Export singleton instance
export const redisCache = new RedisCache();
export { RedisCache };
export default redisCache;
