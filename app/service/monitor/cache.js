/*
 * @Description: 缓存监控服务层
 * @Author: AI Assistant
 * @Date: 2025-10-24
 */

const Service = require('egg').Service;

class CacheService extends Service {

  /**
   * 获取缓存信息
   * @return {object} 缓存信息
   */
  async getCacheInfo() {
    const { app } = this;
    
    // 获取所有缓存键
    const allKeys = await app.cache.default.keys('*');
    
    // 按前缀分组统计
    const cacheStats = {};
    const prefixes = ['online_user:', 'config:', 'dict_', 'captcha:', 'login_fail:'];
    
    prefixes.forEach(prefix => {
      const keys = allKeys.filter(key => key.startsWith(prefix));
      cacheStats[prefix] = keys.length;
    });
    
    // 总键数
    const dbSize = allKeys.length;
    
    return {
      info: {
        cacheStats,
        totalKeys: dbSize
      },
      dbSize,
      commandStats: []  // 命令统计（简化处理）
    };
  }

  /**
   * 获取缓存名称列表
   * @return {array} 缓存名称列表
   */
  getCacheNames() {
    return [
      { cacheName: 'online_user:', remark: '在线用户' },
      { cacheName: 'config:', remark: '配置信息' },
      { cacheName: 'dict_', remark: '数据字典' },
      { cacheName: 'captcha:', remark: '验证码' },
      { cacheName: 'login_fail:', remark: '登录失败次数' }
    ];
  }

  /**
   * 获取缓存键名列表
   * @param {string} cacheName - 缓存名称（前缀）
   * @return {array} 缓存键名列表
   */
  async getCacheKeys(cacheName) {
    const { app } = this;
    
    // 查询指定前缀的所有键
    const pattern = cacheName.endsWith('*') ? cacheName : `${cacheName}*`;
    const keys = await app.cache.default.keys(pattern);
    
    // 排序
    return keys.sort();
  }

  /**
   * 获取缓存值
   * @param {string} cacheKey - 缓存键名
   * @return {object} 缓存信息
   */
  async getCacheValue(cacheName, cacheKey) {
    const { app } = this;
    
    // 获取缓存值
    const cacheValue = await app.cache.default.get(cacheKey);
    
    return {
      cacheName,
      cacheKey,
      cacheValue: cacheValue || ''
    };
  }

  /**
   * 清空指定缓存名称
   * @param {string} cacheName - 缓存名称（前缀）
   */
  async clearCacheName(cacheName) {
    const { app } = this;
    
    // 查询指定前缀的所有键
    const pattern = cacheName.endsWith('*') ? cacheName : `${cacheName}*`;
    const keys = await app.cache.default.keys(pattern);
    
    // 删除所有匹配的键
    for (const key of keys) {
      await app.cache.default.del(key);
    }
  }

  /**
   * 清空指定缓存键
   * @param {string} cacheKey - 缓存键名
   */
  async clearCacheKey(cacheKey) {
    const { app } = this;
    
    // 删除指定键
    await app.cache.default.del(cacheKey);
  }

  /**
   * 清空所有缓存
   */
  async clearCacheAll() {
    const { app } = this;
    
    // 获取所有键
    const keys = await app.cache.default.keys('*');
    
    // 删除所有键
    for (const key of keys) {
      await app.cache.default.del(key);
    }
  }
}

module.exports = CacheService;


