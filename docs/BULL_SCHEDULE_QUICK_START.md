# egg-bull 定时任务快速开始

## 5 分钟上手

### 前提条件

✅ 已安装 Redis  
✅ Redis 服务已启动

```bash
# 检查 Redis
redis-cli ping
# 应返回: PONG
```

---

## 快速开始

### 1. 安装依赖

```bash
npm install egg-bull --save
```

### 2. 配置 Redis

**文件**：`config/config.default.js`

```javascript
config.bull = {
  client: {
    port: 6379,
    host: "127.0.0.1",
    password: "",  // 如果 Redis 有密码
    db: 0,
  },
};
```

### 3. 启动应用

```bash
npm run dev
```

### 4. 创建第一个定时任务

#### 方式一：通过前端界面（推荐）

访问 **系统监控 > 定时任务 > 新增**

填写：
- **任务名称**：测试任务
- **任务组名**：DEFAULT
- **调用目标**：`ryTask.ryNoParams`
- **cron 表达式**：`0 */5 * * * *`（每 5 分钟）
- **状态**：正常

点击确定，任务立即生效！

#### 方式二：通过 API

```bash
curl -X POST http://localhost:7001/api/monitor/job \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobName": "测试任务",
    "jobGroup": "DEFAULT",
    "invokeTarget": "ryTask.ryNoParams",
    "cronExpression": "0 */5 * * * *",
    "status": "0"
  }'
```

---

## 测试功能

### 1. 手动执行任务

在任务列表中点击 "执行一次" 按钮，或调用 API：

```bash
curl -X PUT http://localhost:7001/api/monitor/job/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"jobId": 1}'
```

### 2. 修改 cron 表达式

点击 "修改" 按钮，修改 cron 表达式：

```
0 */10 * * * *  # 改为每 10 分钟
```

保存后立即生效，无需重启！

### 3. 暂停/恢复任务

点击状态切换按钮：
- **正常** → **暂停**：任务停止调度
- **暂停** → **正常**：任务恢复调度

### 4. 查看执行日志

访问 **系统监控 > 定时任务 > 任务日志**

---

## 常用 cron 表达式

| 表达式 | 说明 |
|--------|------|
| `0 */5 * * * *` | 每 5 分钟 |
| `0 0 * * * *` | 每小时 |
| `0 0 2 * * *` | 每日凌晨 2 点 |
| `0 0 */2 * * *` | 每 2 小时 |
| `0 0 0 * * 0` | 每周日凌晨 |
| `0 0 1 1 * *` | 每月 1 号凌晨 1 点 |

**生成工具**：https://crontab.guru/

---

## 创建自定义任务

### 1. 在 ryTask.js 中添加方法

**文件**：`app/service/ryTask.js`

```javascript
class RyTask extends Service {
  /**
   * 我的自定义任务
   */
  async myCustomTask(params) {
    const { ctx } = this;
    ctx.logger.info(`[RyTask] 执行自定义任务: ${params}`);
    
    try {
      // 你的业务逻辑
      // 例如：数据同步、报表生成等
      
      return {
        success: true,
        message: '任务执行成功'
      };
    } catch (err) {
      ctx.logger.error('[RyTask] 任务执行失败:', err);
      throw err;
    }
  }
}
```

### 2. 在界面创建任务

调用目标：`ryTask.myCustomTask('test')`

---

## 查看任务状态

### 方式一：查看日志

```bash
# 应用日志
tail -f logs/ruoyi-eggjs/egg-web.log

# 应该看到类似：
# [Bull] 创建定时任务成功: 测试任务 (0 */5 * * * *)
# [Bull] 开始执行任务: 测试任务
# [Bull] 任务完成: 测试任务
```

### 方式二：查看数据库

```sql
-- 查看任务配置
SELECT * FROM sys_job;

-- 查看任务执行日志
SELECT * FROM sys_job_log 
ORDER BY create_time DESC 
LIMIT 10;
```

### 方式三：Redis 查看

```bash
redis-cli

# 查看 Bull 队列
KEYS bull:ryTask:*

# 查看重复任务
SMEMBERS bull:ryTask:repeat
```

---

## 常见问题

### Q1: 任务没有执行？

**检查**：
1. Redis 是否运行：`redis-cli ping`
2. 任务状态是否为"正常"
3. cron 表达式是否正确
4. 查看日志是否有错误

**解决**：
```bash
# 重启应用
npm run dev

# 查看日志
tail -f logs/ruoyi-eggjs/egg-web.log
```

### Q2: 修改 cron 表达式没有生效？

**原因**：可能缓存了旧任务

**解决**：
```bash
# 清空 Redis 中的任务
redis-cli
FLUSHDB

# 重启应用
npm run dev
```

### Q3: 任务执行失败？

**查看**：
1. 任务日志表：`SELECT * FROM sys_job_log WHERE status = '1'`
2. 应用日志：`logs/ruoyi-eggjs/egg-web.log`

**常见原因**：
- `invokeTarget` 格式错误
- 方法不存在
- 业务逻辑异常

---

## 下一步

✅ 已经掌握基本用法  
👉 阅读[完整文档](./BULL_SCHEDULE_GUIDE.md)了解高级功能  
👉 集成 Bull Board 实现可视化监控  
👉 配置失败重试策略  

**开始使用 egg-bull 管理你的定时任务吧！** 🚀
