/**
 * 定时任务服务层
 * @Author: 姜彦汐
 * @Date: 2025-11-08
 */

const Service = require('egg').Service;
const CronUtils = require('../../util/cronUtils');
const scheduleUtils = require('../../util/scheduleUtils');

class JobService extends Service {

  /**
   * 查询定时任务列表
   * @param {object} page - 分页参数 {pageNum, pageSize}
   * @param {object} job - 查询条件
   * @return {array} 定时任务列表
   */
  async selectJobList(page, job = {}) {
    const { ctx } = this;
    
    try {
      const mapper = ctx.helper.getDB(ctx).sysJobMapper;
      
      // 构造分页参数
      const values = ctx.helper.page({ pageNum: page.pageNum, pageSize: page.pageSize });
      
      // 查询任务列表
      const list = await mapper.selectJobList(
        [values.offset, values.pageSize],
        job
      );
      
      // 为每个任务添加下次执行时间
      if (list && list.length > 0) {
        list.forEach(item => {
          if (item.cronExpression) {
            item.nextValidTime = CronUtils.getNextExecution(item.cronExpression);
          }
        });
      }
      
      return list || [];
    } catch (err) {
      ctx.logger.error('查询定时任务列表失败:', err);
      throw err;
    }
  }

  /**
   * 查询定时任务总数
   * @param {object} job - 查询条件
   * @return {number} 总数
   */
  async selectJobCount(job = {}) {
    const { ctx } = this;
    
    try {
      const mapper = ctx.helper.getDB(ctx).sysJobMapper;
      const result = await mapper.countJobList([], job);
      
      return result && result[0] ? result[0].count : 0;
    } catch (err) {
      ctx.logger.error('查询定时任务总数失败:', err);
      return 0;
    }
  }

  /**
   * 根据任务ID查询定时任务
   * @param {number} jobId - 任务ID
   * @return {object} 定时任务信息
   */
  async selectJobById(jobId) {
    const { ctx } = this;
    
    try {
      const mapper = ctx.helper.getDB(ctx).sysJobMapper;
      const result = await mapper.selectJobById([jobId]);
      
      if (result && result[0]) {
        const job = result[0];
        
        // 添加下次执行时间
        if (job.cronExpression) {
          job.nextValidTime = CronUtils.getNextExecution(job.cronExpression);
        }
        
        return job;
      }
      
      return null;
    } catch (err) {
      ctx.logger.error('查询定时任务详情失败:', err);
      throw err;
    }
  }

  /**
   * 查询所有定时任务
   * @return {array} 定时任务列表
   */
  async selectJobAll() {
    const { ctx } = this;
    
    try {
      const mapper = ctx.helper.getDB(ctx).sysJobMapper;
      const result = await mapper.selectJobAll([]);
      
      return result || [];
    } catch (err) {
      ctx.logger.error('查询所有定时任务失败:', err);
      throw err;
    }
  }

  /**
   * 新增定时任务
   * @param {object} job - 定时任务对象
   * @return {number} 影响行数
   */
  async insertJob(job) {
    const { ctx } = this;
    
    try {
      const mapper = ctx.helper.getDB(ctx).sysJobMapper;
      
      // 设置创建信息
      job.createBy = ctx.state.user ? ctx.state.user.userName : 'system';
      job.createTime = ctx.helper.formatDate(new Date());
      
      // 新任务默认暂停状态
      job.status = '1';
      
      // 插入数据库
      const result = await mapper.insertJob([job]);
      
      if (result.affectedRows > 0 && result.insertId) {
        job.jobId = result.insertId;
        
        // 创建定时任务调度（如果状态为正常）
        if (job.status === '0') {
          await this.createScheduleJob(job);
        }
      }
      
      return result.affectedRows;
    } catch (err) {
      ctx.logger.error('新增定时任务失败:', err);
      throw err;
    }
  }

  /**
   * 修改定时任务
   * @param {object} job - 定时任务对象
   * @return {number} 影响行数
   */
  async updateJob(job) {
    const { ctx } = this;
    
    try {
      const mapper = ctx.helper.getDB(ctx).sysJobMapper;
      
      // 获取原任务信息
      const oldJob = await this.selectJobById(job.jobId);
      
      if (!oldJob) {
        throw new Error('任务不存在');
      }

      // 设置更新信息
      job.updateBy = ctx.state.user ? ctx.state.user.userName : 'system';
      job.updateTime = ctx.helper.formatDate(new Date());
      
      // 更新数据库
      const result = await mapper.updateJob([job]);
      
      if (result.affectedRows > 0) {
        // 更新任务调度
        await this.updateScheduleJob(job, oldJob);
      }
      
      return result.affectedRows;
    } catch (err) {
      ctx.logger.error('修改定时任务失败:', err);
      throw err;
    }
  }

  /**
   * 删除定时任务
   * @param {array} jobIds - 任务ID数组
   * @return {number} 影响行数
   */
  async deleteJobByIds(jobIds) {
    const { ctx } = this;
    
    try {
      const mapper = ctx.helper.getDB(ctx).sysJobMapper;
      
      // 先获取所有任务信息，用于删除调度
      const jobs = [];
      for (const jobId of jobIds) {
        const job = await this.selectJobById(jobId);
        if (job) {
          jobs.push(job);
        }
      }
      
      // 删除数据库记录
      const result = await mapper.deleteJobByIds([jobIds]);
      
      // 删除任务调度
      for (const job of jobs) {
        scheduleUtils.deleteJob(job.jobId, job.jobGroup);
      }
      
      return result.affectedRows;
    } catch (err) {
      ctx.logger.error('删除定时任务失败:', err);
      throw err;
    }
  }

  /**
   * 修改任务状态
   * @param {object} job - 定时任务对象
   * @return {number} 影响行数
   */
  async changeStatus(job) {
    const { ctx } = this;
    
    try {
      const mapper = ctx.helper.getDB(ctx).sysJobMapper;
      
      // 获取完整的任务信息
      const fullJob = await this.selectJobById(job.jobId);
      
      if (!fullJob) {
        throw new Error('任务不存在');
      }

      // 更新状态
      fullJob.status = job.status;
      fullJob.updateBy = ctx.state.user ? ctx.state.user.userName : 'system';
      fullJob.updateTime = ctx.helper.formatDate(new Date());
      
      // 更新数据库
      const result = await mapper.updateJob([fullJob]);
      
      if (result.affectedRows > 0) {
        // 根据状态启动或暂停任务
        if (job.status === '0') {
          // 恢复任务
          await this.resumeJob(fullJob);
        } else {
          // 暂停任务
          await this.pauseJob(fullJob);
        }
      }
      
      return result.affectedRows;
    } catch (err) {
      ctx.logger.error('修改任务状态失败:', err);
      throw err;
    }
  }

  /**
   * 立即执行任务
   * @param {object} job - 定时任务对象
   * @return {boolean} 是否成功
   */
  async run(job) {
    const { ctx } = this;
    
    try {
      // 获取完整的任务信息
      const fullJob = await this.selectJobById(job.jobId);
      
      if (!fullJob) {
        return false;
      }

      // 立即执行任务
      const result = await scheduleUtils.runJobNow(
        fullJob.jobId,
        fullJob.jobGroup,
        fullJob,
        this.executeJob.bind(this)
      );
      
      // 如果任务不在调度中，直接执行
      if (!result) {
        await this.executeJob(fullJob);
        return true;
      }
      
      return result;
    } catch (err) {
      ctx.logger.error('立即执行任务失败:', err);
      return false;
    }
  }

  /**
   * 暂停任务
   * @param {object} job - 定时任务对象
   * @return {boolean} 是否成功
   */
  async pauseJob(job) {
    const result = scheduleUtils.pauseJob(job.jobId, job.jobGroup);
    return result;
  }

  /**
   * 恢复任务
   * @param {object} job - 定时任务对象
   * @return {boolean} 是否成功
   */
  async resumeJob(job) {
    const result = scheduleUtils.resumeJob(job, this.executeJob.bind(this));
    return result;
  }

  /**
   * 创建定时任务调度
   * @param {object} job - 定时任务对象
   * @return {boolean} 是否成功
   */
  async createScheduleJob(job) {
    const result = scheduleUtils.createJob(job, this.executeJob.bind(this));
    return result;
  }

  /**
   * 更新定时任务调度
   * @param {object} newJob - 新的任务对象
   * @param {object} oldJob - 旧的任务对象
   * @return {boolean} 是否成功
   */
  async updateScheduleJob(newJob, oldJob) {
    // 删除旧任务
    scheduleUtils.deleteJob(oldJob.jobId, oldJob.jobGroup);
    
    // 创建新任务（如果状态为正常）
    if (newJob.status === '0') {
      const result = scheduleUtils.createJob(newJob, this.executeJob.bind(this));
      return result;
    }
    
    return true;
  }

  /**
   * 执行任务
   * @param {object} job - 任务配置
   */
  async executeJob(job) {
    const { ctx } = this;
    const startTime = new Date();
    
    let status = '0'; // 0-成功 1-失败
    let jobMessage = '';
    let exceptionInfo = '';

    try {
      ctx.logger.info(`开始执行任务: ${job.jobName} (${job.invokeTarget})`);
      
      // 解析并执行任务
      const result = await this.invokeMethod(job.invokeTarget);
      
      jobMessage = result.message || '任务执行成功';
      ctx.logger.info(`任务执行成功: ${job.jobName}`);
    } catch (err) {
      status = '1';
      jobMessage = '任务执行失败';
      exceptionInfo = err.message || err.toString();
      
      ctx.logger.error(`任务执行失败: ${job.jobName}`, err);
    } finally {
      const stopTime = new Date();
      const duration = stopTime - startTime;
      
      // 记录任务执行日志
      await ctx.service.monitor.jobLog.insertJobLog({
        jobName: job.jobName,
        jobGroup: job.jobGroup,
        invokeTarget: job.invokeTarget,
        jobMessage: `${jobMessage} (耗时: ${duration}ms)`,
        status,
        exceptionInfo: exceptionInfo.substring(0, 2000),
        createTime: ctx.helper.formatDate(startTime)
      });
    }
  }

  /**
   * 调用任务方法
   * @param {string} invokeTarget - 调用目标字符串
   * @return {object} 执行结果
   */
  async invokeMethod(invokeTarget) {
    const { ctx } = this;
    
    // 解析调用目标
    // 格式：className.methodName 或 className.methodName(params)
    const match = invokeTarget.match(/^(\w+)\.(\w+)(\((.*)\))?$/);
    
    if (!match) {
      throw new Error(`无效的调用目标格式: ${invokeTarget}`);
    }

    const className = match[1];
    const methodName = match[2];
    
    // 根据类名创建实例
    let taskInstance;
    if (className === 'ryTask') {
      const RyTask = require('../ryTask');
      taskInstance = new RyTask(ctx);
    } else {
      throw new Error(`不支持的任务类: ${className}`);
    }

    // 执行任务
    const result = await taskInstance.execute(invokeTarget);
    
    return result;
  }

  /**
   * 校验 cron 表达式是否有效
   * @param {string} cronExpression - cron 表达式
   * @return {boolean} 是否有效
   */
  isValidCron(cronExpression) {
    return CronUtils.isValid(cronExpression);
  }

  /**
   * 初始化所有定时任务
   * 项目启动时调用，从数据库加载所有正常状态的任务并启动
   */
  async initJobs() {
    const { ctx } = this;
    
    try {
      ctx.logger.info('开始初始化定时任务...');
      
      // 清空现有任务
      scheduleUtils.clear();
      
      // 查询所有正常状态的任务
      const jobs = await this.selectJobAll();
      
      // 启动任务
      let successCount = 0;
      for (const job of jobs) {
        if (job.status === '0') {
          const result = await this.createScheduleJob(job);
          if (result) {
            successCount++;
          }
        }
      }
      
      ctx.logger.info(`定时任务初始化完成，共启动 ${successCount} 个任务`);
      
      return successCount;
    } catch (err) {
      ctx.logger.error('初始化定时任务失败:', err);
      throw err;
    }
  }
}

module.exports = JobService;

