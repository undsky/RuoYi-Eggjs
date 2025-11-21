/*
 * @Description: 应用扩展
 * @Author: 姜彦汐
 * @Date: 2025-11-21
 */

const Redis = require('ioredis');

const REDIS_MONITOR = Symbol('Application#redisMonitor');

module.exports = {
  /**
   * 获取用于监控的 Redis 客户端
   * @return {Redis} Redis 客户端实例
   */
  get redisMonitor() {
    if (!this[REDIS_MONITOR]) {
      const { redis } = this.config.cache;
      
      // 创建专门用于监控的 Redis 连接
      this[REDIS_MONITOR] = new Redis({
        port: redis.port || 6379,
        host: redis.host || '127.0.0.1',
        password: redis.password || null,
        db: redis.db || 0,
        // 监控连接使用较小的连接池
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false
      });
      
      // 监听错误
      this[REDIS_MONITOR].on('error', (err) => {
        this.logger.error('Redis 监控连接错误:', err);
      });
      
      // 监听连接成功
      this[REDIS_MONITOR].on('connect', () => {
        this.logger.info('Redis 监控连接已建立');
      });
    }
    
    return this[REDIS_MONITOR];
  }
};
