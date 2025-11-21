# 缓存监控 Redis INFO 支持说明

## 更新时间
2025-11-21

## 实现方案

为支持完整的 Redis INFO 信息和命令统计，采用以下方案：

### 1. 添加 ioredis 依赖

在 `package.json` 中添加：
```json
"ioredis": "^5.3.2"
```

### 2. 创建监控专用 Redis 客户端

在 `/app/extend/application.js` 中扩展应用对象，添加 `redisMonitor` 属性：

```javascript
const Redis = require('ioredis');

module.exports = {
  get redisMonitor() {
    // 创建独立的 Redis 连接用于监控
    // 读取 config.cache.redis 配置
    // 返回 ioredis 客户端实例
  }
};
```

**优势**：
- 独立连接，不影响业务缓存操作
- 复用现有 Redis 配置
- 自动错误处理和日志记录
- 懒加载，首次访问时创建

### 3. 获取 Redis 详细信息

通过 `app.redisMonitor` 调用原生 Redis 命令：

```javascript
// 获取 Redis INFO
const infoStr = await app.redisMonitor.info();

// 获取数据库大小
const dbSize = await app.redisMonitor.dbsize();

// 获取命令统计
const commandStatsStr = await app.redisMonitor.info('commandstats');
```

### 4. 信息解析

#### Redis INFO 解析
```javascript
parseRedisInfo(infoStr) {
  const info = {};
  const lines = infoStr.split('\r\n');
  
  lines.forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split(':');
      if (key && value !== undefined) {
        info[key] = value;
      }
    }
  });
  
  return info;
}
```

**返回字段包括**（部分）：
- `redis_version` - Redis 版本
- `redis_mode` - 运行模式（standalone/cluster）
- `os` - 操作系统
- `tcp_port` - 端口
- `uptime_in_seconds` - 运行时间（秒）
- `connected_clients` - 连接客户端数
- `used_memory` - 已用内存（字节）
- `used_memory_human` - 已用内存（人类可读）
- `used_memory_peak` - 内存峰值
- `maxmemory` - 最大内存限制
- `total_connections_received` - 总连接数
- `total_commands_processed` - 总命令数
- `instantaneous_ops_per_sec` - 每秒操作数
- `keyspace_hits` - 键空间命中数
- `keyspace_misses` - 键空间未命中数
- `expired_keys` - 过期键数
- `evicted_keys` - 驱逐键数

#### 命令统计解析
```javascript
parseCommandStats(statsStr) {
  const commandStats = [];
  const lines = statsStr.split('\r\n');
  
  lines.forEach(line => {
    if (line.startsWith('cmdstat_')) {
      const [cmdKey, statsValue] = line.split(':');
      const cmdName = cmdKey.replace('cmdstat_', '');
      
      const callsMatch = statsValue.match(/calls=(\d+)/);
      if (callsMatch) {
        commandStats.push({
          name: cmdName,
          value: callsMatch[1]
        });
      }
    }
  });
  
  return commandStats;
}
```

**返回格式**：
```javascript
[
  { name: "ping", value: "1234" },
  { name: "get", value: "5678" },
  { name: "set", value: "910" },
  { name: "info", value: "45" },
  // ...
]
```

## API 返回示例

```javascript
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "info": {
      "redis_version": "7.0.0",
      "redis_mode": "standalone",
      "os": "Darwin 23.1.0 arm64",
      "arch_bits": "64",
      "tcp_port": "6379",
      "uptime_in_seconds": "123456",
      "uptime_in_days": "1",
      "connected_clients": "2",
      "used_memory": "1234567",
      "used_memory_human": "1.18M",
      "used_memory_peak": "2345678",
      "used_memory_peak_human": "2.24M",
      "maxmemory": "0",
      "maxmemory_human": "0B",
      "total_connections_received": "1000",
      "total_commands_processed": "5000",
      "instantaneous_ops_per_sec": "10",
      "total_net_input_bytes": "1234567",
      "total_net_output_bytes": "2345678",
      "rejected_connections": "0",
      "expired_keys": "100",
      "evicted_keys": "0",
      "keyspace_hits": "3000",
      "keyspace_misses": "200"
      // ... 更多字段
    },
    "dbSize": 128,
    "commandStats": [
      { "name": "ping", "value": "1234" },
      { "name": "get", "value": "5678" },
      { "name": "set", "value": "910" },
      { "name": "del", "value": "45" },
      { "name": "keys", "value": "23" },
      { "name": "info", "value": "12" }
    ]
  }
}
```

## 配置要求

确保 `config.local.js` 或 `config.prod.js` 中有正确的 Redis 配置：

```javascript
const redis = {
  port: 6379,
  host: "127.0.0.1",
  password: "",  // 如果有密码
  db: 5,
};

config.cache = { redis };
```

## 使用说明

### 1. 安装依赖
```bash
npm install
```

### 2. 重启应用
```bash
npm run dev  # 开发环境
# 或
npm run start  # 生产环境
```

### 3. 测试接口
```bash
curl -X GET http://localhost:7001/api/monitor/cache \
  -H "Authorization: Bearer {token}"
```

## 技术优势

1. **独立连接**：监控连接与业务缓存分离，互不影响
2. **完整信息**：获取 Redis 原生的 INFO 和 COMMANDSTATS 数据
3. **性能友好**：懒加载，仅在需要时创建连接
4. **错误隔离**：监控连接错误不影响业务功能
5. **配置复用**：自动读取现有的 Redis 配置

## 注意事项

1. **连接数**：会额外占用一个 Redis 连接，请确保 Redis 配置的 `maxclients` 足够
2. **权限**：确保 Redis 用户有执行 `INFO` 和 `DBSIZE` 命令的权限
3. **网络延迟**：INFO 命令会有轻微的网络延迟，正常情况下小于 10ms
4. **密码配置**：如果 Redis 设置了密码，确保配置正确

## 故障排查

### 连接失败
检查 Redis 服务是否运行：
```bash
redis-cli ping
```

### 权限错误
确保 Redis 配置文件中没有禁用 INFO 命令：
```
# redis.conf
rename-command INFO ""  # 不要这样配置
```

### 日志查看
监控连接的错误会记录在应用日志中：
```
2025-11-21 22:00:00,000 ERROR Redis 监控连接错误: ...
```

## 与 Java 版本对比

| 功能 | Java 版本 | Node.js 版本 | 状态 |
|------|-----------|--------------|------|
| Redis INFO | ✅ RedisTemplate | ✅ ioredis | 完全对齐 |
| DBSIZE | ✅ | ✅ | 完全对齐 |
| COMMANDSTATS | ✅ | ✅ | 完全对齐 |
| 返回格式 | Properties | Object | 结构一致 |

## 后续优化

1. **连接池**：如果频繁调用，可考虑使用连接池
2. **缓存结果**：INFO 数据可以短时间缓存（如 10 秒）
3. **分片支持**：如果使用 Redis Cluster，需要适配分片信息
4. **Sentinel 支持**：如果使用 Redis Sentinel，需要适配哨兵配置
