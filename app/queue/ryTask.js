/**
 * 若依定时任务队列处理器
 * @Author: 姜彦汐
 * @Date: 2025-11-21
 * 
 * 使用 egg-bull 实现动态定时任务
 * 文档: https://github.com/hackycy/egg-bull
 */

module.exports = app => {
  return {
    /**
     * 任务处理器
     * @param {Object} job - Bull Job 对象
     * @param {Object} job.data - 任务数据
     * @param {String} job.data.invokeTarget - 调用目标字符串
     * @param {Object} job.data.jobInfo - 任务信息
     */
    async process(job) {
      const { ctx } = this;
      const { invokeTarget, jobInfo } = job.data;
      
      const startTime = Date.now();
      let status = '0'; // 0-成功 1-失败
      let jobMessage = '';
      let exceptionInfo = '';

      try {
        ctx.logger.info(`[Bull] 开始执行任务: ${jobInfo.jobName} (${invokeTarget})`);
        
        // 调用 ryTask 服务执行任务
        const result = await ctx.service.ryTask.execute(invokeTarget);
        
        jobMessage = result.message || '任务执行成功';
        ctx.logger.info(`[Bull] 任务执行成功: ${jobInfo.jobName}`);
      } catch (err) {
        status = '1';
        jobMessage = '任务执行失败';
        exceptionInfo = err.message || err.toString();
        
        ctx.logger.error(`[Bull] 任务执行失败: ${jobInfo.jobName}`, err);
        throw err; // 抛出错误，让 Bull 记录失败
      } finally {
        const stopTime = Date.now();
        const duration = stopTime - startTime;
        
        // 记录任务执行日志
        try {
          await ctx.service.monitor.jobLog.insertJobLog({
            jobName: jobInfo.jobName,
            jobGroup: jobInfo.jobGroup,
            invokeTarget: invokeTarget,
            jobMessage: `${jobMessage} (耗时: ${duration}ms)`,
            status,
            exceptionInfo: exceptionInfo.substring(0, 2000),
            createTime: ctx.helper.formatDate(new Date(startTime)),
          });
        } catch (logErr) {
          ctx.logger.error('[Bull] 记录任务日志失败:', logErr);
        }
      }
    },

    /**
     * 任务完成事件
     */
    async onCompleted(job, result) {
      const { ctx } = this;
      ctx.logger.info(`[Bull] 任务完成: ${job.data.jobInfo.jobName}`);
    },

    /**
     * 任务失败事件
     */
    async onFailed(job, err) {
      const { ctx } = this;
      ctx.logger.error(`[Bull] 任务失败: ${job.data.jobInfo.jobName}`, err);
    },

    /**
     * 任务进度事件
     */
    async onProgress(job, progress) {
      const { ctx } = this;
      ctx.logger.info(`[Bull] 任务进度: ${job.data.jobInfo.jobName} - ${progress}%`);
    },
  };
};
