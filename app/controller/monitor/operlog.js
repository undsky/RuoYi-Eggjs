/*
 * @Description: 操作日志监控控制器
 * @Author: AI Assistant
 * @Date: 2025-10-24
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');

module.exports = app => {

  @Route('/api/monitor/operlog')
  class OperlogController extends Controller {

    /**
     * 获取操作日志列表（分页）
     * GET /api/monitor/operlog/list
     * 权限：monitor:operlog:list
     */
    @RequiresPermissions('monitor:operlog:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;

      try {
        const params = ctx.query;

        // 查询列表
        const result = await service.monitor.operlog.selectOperLogPage(params);

        ctx.body = {
          code: 200,
          msg: "查询成功",
          ...result,
        };
      } catch (err) {
        ctx.logger.error('查询操作日志列表失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '查询操作日志列表失败'
        };
      }
    }

    /**
     * 删除操作日志
     * DELETE /api/monitor/operlog/:operIds
     * 权限：monitor:operlog:remove
     */
    @RequiresPermissions('monitor:operlog:remove')
    @HttpDelete('/:operIds')
    async remove() {
      const { ctx, service } = this;
      
      try {
        const { operIds } = ctx.params;
        
        // 解析日志ID数组
        const operIdArray = operIds.split(',').map(id => parseInt(id));
        
        // 删除操作日志
        const rows = await service.monitor.operlog.deleteOperLogByIds(operIdArray);
        
        ctx.body = {
          code: 200,
          msg: rows > 0 ? '删除成功' : '删除失败'
        };
      } catch (err) {
        ctx.logger.error('删除操作日志失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '删除操作日志失败'
        };
      }
    }

    /**
     * 清空操作日志
     * DELETE /api/monitor/operlog/clean
     * 权限：monitor:operlog:remove
     */
    @RequiresPermissions('monitor:operlog:remove')
    @HttpDelete('/clean')
    async clean() {
      const { ctx, service } = this;
      
      try {
        // 清空操作日志
        await service.monitor.operlog.cleanOperLog();
        
        ctx.body = {
          code: 200,
          msg: '清空成功'
        };
      } catch (err) {
        ctx.logger.error('清空操作日志失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '清空操作日志失败'
        };
      }
    }

    /**
     * 导出操作日志
     * POST /api/monitor/operlog/export
     * 权限：monitor:operlog:export
     */
    @RequiresPermissions('monitor:operlog:export')
    @HttpPost('/export')
    async export() {
      const { ctx, service } = this;
      
      try {
        const params = ctx.request.body;
        
        // 查询操作日志列表
        const list = await service.monitor.operlog.selectOperLogList(params);
        
        // TODO: 实现 Excel 导出功能
        // 目前返回 JSON 数据
        ctx.body = {
          code: 200,
          msg: '导出成功',
          data: list
        };
      } catch (err) {
        ctx.logger.error('导出操作日志失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '导出操作日志失败'
        };
      }
    }
  }

  return OperlogController;
};

