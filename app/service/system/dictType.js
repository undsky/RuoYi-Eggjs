/*
 * @Description: 字典类型服务层
 * @Author: AI Assistant
 * @Date: 2025-10-24
 */

const Service = require('egg').Service;

class DictTypeService extends Service {

  /**
   * 查询字典类型列表
   * @param {object} dictType - 查询参数
   * @return {array} 字典类型列表
   */
  async selectDictTypeList(dictType = {}) {
    const { ctx } = this;
    
    // 查询条件
    const conditions = {
      dictName: dictType.dictName,
      dictType: dictType.dictType,
      status: dictType.status,
      params: {
        beginTime: dictType.beginTime,
        endTime: dictType.endTime
      }
    };

    // 查询列表
    const dictTypes = await ctx.helper.getDB(ctx).sysDictTypeMapper.selectDictTypeList([], conditions);
    
    return dictTypes || [];
  }

  /**
   * 查询所有字典类型
   * @return {array} 字典类型列表
   */
  async selectDictTypeAll() {
    const { ctx } = this;
    
    const dictTypes = await ctx.helper.getDB(ctx).sysDictTypeMapper.selectDictTypeAll();
    
    return dictTypes || [];
  }

  /**
   * 根据字典ID查询字典类型
   * @param {number} dictId - 字典ID
   * @return {object} 字典类型信息
   */
  async selectDictTypeById(dictId) {
    const { ctx } = this;
    
    const dictTypes = await ctx.helper.getDB(ctx).sysDictTypeMapper.selectDictTypeById([], {dictId});
    
    return dictTypes && dictTypes.length > 0 ? dictTypes[0] : null;
  }

  /**
   * 根据字典类型查询字典类型
   * @param {string} dictType - 字典类型
   * @return {object} 字典类型信息
   */
  async selectDictTypeByType(dictType) {
    const { ctx } = this;
    
    const dictTypes = await ctx.helper.getDB(ctx).sysDictTypeMapper.selectDictTypeByType([], {dictType});
    
    return dictTypes && dictTypes.length > 0 ? dictTypes[0] : null;
  }

  /**
   * 校验字典类型是否唯一
   * @param {object} dictType - 字典类型对象
   * @return {boolean} true-唯一 false-不唯一
   */
  async checkDictTypeUnique(dictType) {
    const { ctx } = this;
    
    const dictId = dictType.dictId || -1;
    const dictTypes = await ctx.helper.getDB(ctx).sysDictTypeMapper.checkDictTypeUnique([], {dictType: dictType.dictType});
    
    if (dictTypes && dictTypes.length > 0 && dictTypes[0].dictId !== dictId) {
      return false;
    }
    
    return true;
  }

  /**
   * 新增字典类型
   * @param {object} dictType - 字典类型对象
   * @return {number} 影响行数
   */
  async insertDictType(dictType) {
    const { ctx } = this;
    
    // 设置创建信息
    dictType.createBy = ctx.state.user.userName;
    
    // 插入字典类型
    const result = await ctx.helper.getMasterDB(ctx).sysDictTypeMapper.insertDictType([], dictType);
    
    // 清空缓存
    if (result && result.length > 0) {
      await this.clearDictCache();
      return 1;
    }
    
    return 0;
  }

  /**
   * 修改字典类型
   * @param {object} dictType - 字典类型对象
   * @return {number} 影响行数
   */
  async updateDictType(dictType) {
    const { ctx } = this;
    
    // 查询旧的字典类型
    const oldDict = await this.selectDictTypeById(dictType.dictId);
    
    // 设置更新信息
    dictType.updateBy = ctx.state.user.userName;
    
    // 更新字典类型
    const result = await ctx.helper.getMasterDB(ctx).sysDictTypeMapper.updateDictType([], dictType);
    
    // 如果字典类型改变，需要更新字典数据表中的类型
    if (oldDict && oldDict.dictType !== dictType.dictType) {
      await ctx.helper.getMasterDB(ctx).sysDictDataMapper.updateDictDataType([], {oldDictType: oldDict.dictType, newDictType: dictType.dictType});
    }
    
    // 清空缓存
    if (result && result.length > 0) {
      await this.clearDictCache();
      return 1;
    }
    
    return 0;
  }

  /**
   * 删除字典类型
   * @param {array} dictIds - 字典ID数组
   * @return {number} 影响行数
   */
  async deleteDictTypeByIds(dictIds) {
    const { ctx } = this;
    
    let deletedCount = 0;
    
    for (const dictId of dictIds) {
      // 查询字典类型
      const dictType = await this.selectDictTypeById(dictId);
      
      if (!dictType) {
        continue;
      }
      
      // 检查是否有字典数据
      const count = await ctx.helper.getDB(ctx).sysDictDataMapper.countDictDataByType([], {dictType: dictType.dictType});
      
      if (count && count.length > 0 && count[0].count > 0) {
        throw new Error(`${dictType.dictName}已分配,不能删除`);
      }
      
      // 删除字典类型
      await ctx.helper.getMasterDB(ctx).sysDictTypeMapper.deleteDictTypeById([], {dictId});
      deletedCount++;
    }
    
    // 清空缓存
    if (deletedCount > 0) {
      await this.clearDictCache();
    }
    
    return deletedCount;
  }

  /**
   * 加载字典缓存
   */
  async loadingDictCache() {
    const { ctx, app } = this;
    
    // 查询所有正常状态的字典数据
    const sql = `
      SELECT dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_time, remark
      FROM sys_dict_data
      WHERE status = '0'
      ORDER BY dict_type, dict_sort
    `;
    
    const dictDataList = await ctx.app.mysql.get('ruoyi').query(sql);
    
    // 按字典类型分组
    const dictDataMap = {};
    dictDataList.forEach(data => {
      if (!dictDataMap[data.dictType]) {
        dictDataMap[data.dictType] = [];
      }
      dictDataMap[data.dictType].push(data);
    });
    
    // 存入缓存
    for (const dictType in dictDataMap) {
      await app.cache.default.set(`dict_${dictType}`, JSON.stringify(dictDataMap[dictType]), 0);
    }
    
    ctx.logger.info('字典缓存加载完成');
  }

  /**
   * 清空字典缓存
   */
  async clearDictCache() {
    const { app } = this;
    
    // 获取所有缓存键
    const keys = await app.cache.default.keys('dict_*');
    
    // 删除所有字典缓存
    for (const key of keys) {
      await app.cache.default.del(key);
    }
  }

  /**
   * 重置字典缓存
   */
  async resetDictCache() {
    // 清空缓存
    await this.clearDictCache();
    
    // 重新加载缓存
    await this.loadingDictCache();
  }
}

module.exports = DictTypeService;


