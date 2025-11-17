/*
 * @Description: 在线用户服务层
 * @Author: AI Assistant
 * @Date: 2025-10-24
 */

const Service = require('egg').Service;

class OnlineService extends Service {

  /**
   * 查询在线用户列表
   * @param {object} params - 查询参数
   * @return {array} 在线用户列表
   */
  async selectOnlineList(params = {}) {
    const { app } = this;
    
    // 获取所有在线用户缓存键
    const keys = await app.cache.default.keys('online_user:*');
    
    const userOnlineList = [];
    
    for (const key of keys) {
      const onlineUser = await app.cache.default.get(key);
      
      if (!onlineUser) {
        continue;
      }
      
      // 过滤条件
      if (params.ipaddr && !onlineUser.ipaddr.includes(params.ipaddr)) {
        continue;
      }
      
      if (params.userName && !onlineUser.userName.includes(params.userName)) {
        continue;
      }
      
      userOnlineList.push(onlineUser);
    }
    
    // 按登录时间倒序排列
    userOnlineList.sort((a, b) => {
      return new Date(b.loginTime) - new Date(a.loginTime);
    });
    
    return userOnlineList;
  }

  /**
   * 强退用户
   * @param {string} tokenId - Token ID
   * @return {boolean} 是否成功
   */
  async forceLogout(tokenId) {
    const { app } = this;
    
    // 将 Token 加入黑名单（标记为已撤销）
    await app.cache.default.set(tokenId, 'revoked', { ttl: 7 * 24 * 60 * 60 });
    
    // 删除在线用户信息
    // 通过 tokenId 反查 userId（从所有在线用户中查找）
    const keys = await app.cache.default.keys('online_user:*');
    
    for (const key of keys) {
      const onlineUser = await app.cache.default.get(key);
      
      if (onlineUser && onlineUser.tokenId === tokenId) {
        await app.cache.default.del(key);
        break;
      }
    }
    
    return true;
  }
}

module.exports = OnlineService;


