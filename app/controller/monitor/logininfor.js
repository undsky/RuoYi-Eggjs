/*
 * @Description: 登录日志监控控制器
 * @Author: AI Assistant
 * @Date: 2025-10-24
 */

const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');

module.exports = app => {

  @Route('/api/monitor/logininfor')
  class LogininforController extends Controller {

    /**
     * 获取登录日志列表（分页）
     * GET /api/monitor/logininfor/list
     * 权限：monitor:logininfor:list
     */
    @RequiresPermissions('monitor:logininfor:list')
    @HttpGet('/list')
    async list() {
      const { ctx, service } = this;

      try {
        const params = ctx.query;

        // 查询列表
        const result = await service.monitor.logininfor.selectLogininforPage(params);

        ctx.body = {
          code: 200,
          msg: "查询成功",
          ...result,
        };
      } catch (err) {
        ctx.logger.error('查询登录日志列表失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '查询登录日志列表失败'
        };
      }
    }

    /**
     * 删除登录日志
     * DELETE /api/monitor/logininfor/:infoIds
     * 权限：monitor:logininfor:remove
     */
    @RequiresPermissions('monitor:logininfor:remove')
    @HttpDelete('/:infoIds')
    async remove() {
      const { ctx, service } = this;
      
      try {
        const { infoIds } = ctx.params;
        
        // 解析日志ID数组
        const infoIdArray = infoIds.split(',').map(id => parseInt(id));
        
        // 删除登录日志
        const rows = await service.monitor.logininfor.deleteLogininforByIds(infoIdArray);
        
        ctx.body = {
          code: 200,
          msg: rows > 0 ? '删除成功' : '删除失败'
        };
      } catch (err) {
        ctx.logger.error('删除登录日志失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '删除登录日志失败'
        };
      }
    }

    /**
     * 清空登录日志
     * DELETE /api/monitor/logininfor/clean
     * 权限：monitor:logininfor:remove
     */
    @RequiresPermissions('monitor:logininfor:remove')
    @HttpDelete('/clean')
    async clean() {
      const { ctx, service } = this;
      
      try {
        // 清空登录日志
        await service.monitor.logininfor.cleanLogininfor();
        
        ctx.body = {
          code: 200,
          msg: '清空成功'
        };
      } catch (err) {
        ctx.logger.error('清空登录日志失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '清空登录日志失败'
        };
      }
    }

    /**
     * 解锁用户
     * GET /api/monitor/logininfor/unlock/:userName
     * 权限：monitor:logininfor:unlock
     */
    @RequiresPermissions('monitor:logininfor:unlock')
    @HttpGet('/unlock/:userName')
    async unlock() {
      const { ctx, service } = this;
      
      try {
        const { userName } = ctx.params;
        
        // 解锁用户
        await service.monitor.logininfor.unlockUser(userName);
        
        ctx.body = {
          code: 200,
          msg: '解锁成功'
        };
      } catch (err) {
        ctx.logger.error('解锁用户失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '解锁用户失败'
        };
      }
    }

    /**
     * 导出登录日志
     * POST /api/monitor/logininfor/export
     * 权限：monitor:logininfor:export
     */
    @RequiresPermissions('monitor:logininfor:export')
    @HttpPost('/export')
    async export() {
      const { ctx, service } = this;
      
      try {
        const params = ctx.request.body;
        
        // 查询登录日志列表
        const list = await service.monitor.logininfor.selectLogininforList(params);
        
        // TODO: 实现 Excel 导出功能
        // 目前返回 JSON 数据
        ctx.body = {
          code: 200,
          msg: '导出成功',
          data: list
        };
      } catch (err) {
        ctx.logger.error('导出登录日志失败:', err);
        ctx.body = {
          code: 500,
          msg: err.message || '导出登录日志失败'
        };
      }
    }
  }

  return LogininforController;
};

