/*
 * @Description: 字典数据管理控制器
 * @Author: AI Assistant
 * @Date: 2025-10-24
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpPut, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');

module.exports = app => {

  @Route('/api/system/dict/data')
  class DictDataController extends Controller {

    /**
     * 获取字典数据列表（分页）
     * GET /api/system/dict/data/list
     * 权限：system:dict:list
     */
    @RequiresPermissions('system:dict:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;

      try {
        const params = ctx.query;

        // 查询列表
        const result = await service.system.dictdata.selectDictDataPage(params);

        ctx.body = {
          code: 200,
          msg: "查询成功",
          ...result,
        };
      } catch (err) {
        ctx.logger.error('查询字典数据列表失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '查询字典数据列表失败'
        };
      }
    }

    /**
     * 获取字典数据详情
     * GET /api/system/dict/data/:dictCode
     * 权限：system:dict:query
     */
    @RequiresPermissions('system:dict:query')
    @HttpGet('/:dictCode')
    async getInfo() {
      const { ctx, service } = this;
      
      try {
        const { dictCode } = ctx.params;
        
        // 查询字典数据信息
        const dictData = await service.system.dictData.selectDictDataById(parseInt(dictCode));
        
        if (!dictData) {
          ctx.body = {
            code: 500,
            msg: '字典数据不存在'
          };
          return;
        }
        
        ctx.body = {
          code: 200,
          msg: '操作成功',
          data: dictData
        };
      } catch (err) {
        ctx.logger.error('查询字典数据详情失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '查询字典数据详情失败'
        };
      }
    }

    /**
     * 根据字典类型查询字典数据
     * GET /api/system/dict/data/type/:dictType
     * 权限：system:dict:query
     */
    @RequiresPermissions('system:dict:query')
    @HttpGet('/type/:dictType')
    async dictType() {
      const { ctx, service } = this;
      
      try {
        const { dictType } = ctx.params;
        
        // 查询字典数据
        const data = await service.system.dictData.selectDictDataByType(dictType);
        
        ctx.body = {
          code: 200,
          msg: '操作成功',
          data: data || []
        };
      } catch (err) {
        ctx.logger.error('根据类型查询字典数据失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '根据类型查询字典数据失败'
        };
      }
    }

    /**
     * 新增字典数据
     * POST /api/system/dict/data
     * 权限：system:dict:add
     */
    @RequiresPermissions('system:dict:add')
    @HttpPost('/')
    async add() {
      const { ctx, service } = this;
      
      try {
        const dictData = ctx.request.body;
        
        // 新增字典数据
        const rows = await service.system.dictData.insertDictData(dictData);
        
        ctx.body = {
          code: 200,
          msg: rows > 0 ? '新增成功' : '新增失败'
        };
      } catch (err) {
        ctx.logger.error('新增字典数据失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '新增字典数据失败'
        };
      }
    }

    /**
     * 修改字典数据
     * PUT /api/system/dict/data
     * 权限：system:dict:edit
     */
    @RequiresPermissions('system:dict:edit')
    @HttpPut('/')
    async edit() {
      const { ctx, service } = this;
      
      try {
        const dictData = ctx.request.body;
        
        // 修改字典数据
        const rows = await service.system.dictData.updateDictData(dictData);
        
        ctx.body = {
          code: 200,
          msg: rows > 0 ? '修改成功' : '修改失败'
        };
      } catch (err) {
        ctx.logger.error('修改字典数据失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '修改字典数据失败'
        };
      }
    }

    /**
     * 删除字典数据
     * DELETE /api/system/dict/data/:dictCodes
     * 权限：system:dict:remove
     */
    @RequiresPermissions('system:dict:remove')
    @HttpDelete('/:dictCodes')
    async remove() {
      const { ctx, service } = this;
      
      try {
        const { dictCodes } = ctx.params;
        
        // 解析字典数据ID数组
        const dictCodeArray = dictCodes.split(',').map(id => parseInt(id));
        
        // 删除字典数据
        const rows = await service.system.dictData.deleteDictDataByIds(dictCodeArray);
        
        ctx.body = {
          code: 200,
          msg: rows > 0 ? '删除成功' : '删除失败'
        };
      } catch (err) {
        ctx.logger.error('删除字典数据失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '删除字典数据失败'
        };
      }
    }

    /**
     * 导出字典数据
     * POST /api/system/dict/data/export
     * 权限：system:dict:export
     */
    @RequiresPermissions('system:dict:export')
    @HttpPost('/export')
    async export() {
      const { ctx, service } = this;
      
      try {
        const params = ctx.request.body;
        
        // 查询字典数据列表
        const list = await service.system.dictData.selectDictDataList(params);
        
        // TODO: 实现 Excel 导出功能
        // 目前返回 JSON 数据
        ctx.body = {
          code: 200,
          msg: '导出成功',
          data: list
        };
      } catch (err) {
        ctx.logger.error('导出字典数据失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '导出字典数据失败'
        };
      }
    }
  }

  return DictDataController;
};

