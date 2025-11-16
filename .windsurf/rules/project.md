---
trigger: always_on
description:
globs:
---

## 项目概述

**项目名称**: ruoyi-eggjs  
**版本**: 1.1.0  
**描述**: 基于 Egg.js 的企业级后台管理系统，参照若依（RuoYi）架构设计  
**作者**: 姜彦汐  
**官网**: https://www.undsky.com  
**仓库**: https://github.com/undsky/ruoyi-eggjs  
**协议**: MIT

### 核心特性

- 🗄️ MyBatis XML 风格的 SQL 映射
- 🤖 基于 XML Mapper 的代码自动生成
- 🎯 装饰器路由（@Route、@HttpGet、@HttpPost 等）
- 🔐 JWT 认证授权
- 🔒 权限控制装饰器（@RequiresPermissions、@RequiresRoles）
- 🚀 多层级缓存（Memory、File、Redis）
- 🛡️ API 限流保护
- 📦 文件上传下载
- 📝 统一响应格式化

---

## 技术栈

### 核心框架
- **Node.js**: >=20.0.0
- **Egg.js**: ^3.x - 企业级 Node.js 框架
- **MySQL**: >=5.7 或 MariaDB >=10.2
- **Redis**: >=5.0（可选）

### 主要依赖
- **egg-decorator-router**: ^1.0.7 - 装饰器路由
- **egg-jwt**: ^3.1.7 - JWT 认证
- **egg-cors**: ^3.0.0 - 跨域支持
- **bcryptjs**: ^2.4.3 - 密码加密
- **dayjs**: ^1.11.10 - 日期处理
- **lodash**: ^4.17.21 - 工具函数库
- **nanoid**: ^3.3.7 - 唯一 ID 生成
- **fs-extra**: ^11.2.0 - 文件系统增强
- **trek-captcha**: ^0.4.0 - 验证码生成

### 自研插件
- **ruoyi-eggjs-mybatis**: MyBatis XML SQL 映射
- **ruoyi-eggjs-mysql**: MySQL 数据库操作
- **ruoyi-eggjs-cache**: 多层级缓存管理
- **ruoyi-eggjs-ratelimiter**: API 限流
- **ruoyi-eggjs-cli**: 代码生成命令行工具
- **ruoyi-eggjs-sqlite**: SQLite 数据库支持
- **ruoyi-eggjs-handlebars**: Handlebars 模板引擎

---

## 项目结构

```
ruoyi-eggjs/
├── app/                          # 应用代码目录
│   ├── controller/               # 控制器（API 入口）
│   │   ├── api/                  # 公共 API
│   │   ├── system/               # 系统管理模块
│   │   │   ├── login.js          # 登录认证
│   │   │   ├── user.js           # 用户管理
│   │   │   ├── role.js           # 角色管理
│   │   │   ├── menu.js           # 菜单管理
│   │   │   ├── dept.js           # 部门管理
│   │   │   ├── post.js           # 岗位管理
│   │   │   ├── config.js         # 参数配置
│   │   │   ├── dictType.js       # 字典类型
│   │   │   ├── dictData.js       # 字典数据
│   │   │   ├── notice.js         # 通知公告
│   │   │   └── profile.js        # 个人中心
│   │   ├── monitor/              # 系统监控模块
│   │   │   ├── online.js         # 在线用户
│   │   │   ├── logininfor.js     # 登录日志
│   │   │   ├── operlog.js        # 操作日志
│   │   │   ├── job.js            # 定时任务
│   │   │   ├── jobLog.js         # 任务日志
│   │   │   ├── server.js         # 服务监控
│   │   │   └── cache.js          # 缓存监控
│   │   ├── tool/                 # 系统工具模块
│   │   │   └── gen.js            # 代码生成
│   │   └── common.js             # 公共控制器（上传下载）
│   ├── service/                  # 服务层（业务逻辑）
│   │   ├── db/                   # 数据库服务（自动生成）
│   │   │   └── mysql/
│   │   │       └── ruoyi/        # 若依系统表服务
│   │   ├── system/               # 系统服务
│   │   ├── monitor/              # 监控服务
│   │   ├── tool/                 # 工具服务
│   │   └── upload.js             # 上传服务
│   ├── decorator/                # 自定义装饰器
│   │   └── permission.js         # 权限控制装饰器
│   ├── middleware/               # 中间件
│   │   ├── accessControl.js      # 访问控制（JWT 验证）
│   │   ├── formatBody.js         # 响应格式化
│   │   └── permission.js         # 权限验证中间件
│   ├── extend/                   # 扩展
│   │   └── helper.js             # 辅助函数
│   ├── constant/                 # 常量定义
│   │   └── index.js              # 系统常量
│   ├── public/                   # 静态资源
│   │   ├── uploads/              # 文件上传目录
│   │   └── favicon.ico           # 网站图标
│   └── schedule/                 # 定时任务（Egg.js 原生）
├── config/                       # 配置文件
│   ├── config.default.js         # 默认配置（所有环境）
│   ├── config.local.js           # 本地开发配置
│   ├── config.prod.js            # 生产环境配置
│   └── plugin.js                 # 插件配置
├── mapper/                       # MyBatis XML 映射文件
│   └── mysql/
│       └── ruoyi/                # 若依系统表 Mapper
│           ├── SysUserMapper.xml
│           ├── SysRoleMapper.xml
│           ├── SysMenuMapper.xml
│           ├── SysDeptMapper.xml
│           ├── SysPostMapper.xml
│           ├── SysConfigMapper.xml
│           ├── SysDictTypeMapper.xml
│           ├── SysDictDataMapper.xml
│           ├── SysNoticeMapper.xml
│           ├── SysLogininforMapper.xml
│           ├── SysOperLogMapper.xml
│           ├── SysJobLogMapper.xml
│           ├── SysRoleMenuMapper.xml
│           ├── SysRoleDeptMapper.xml
│           ├── SysUserRoleMapper.xml
│           └── SysUserPostMapper.xml
├── docs/                         # 项目文档
│   ├── API_MAPPING.md            # API 映射文档
│   ├── PERMISSION_GUIDE.md       # 权限控制完整指南
│   ├── PERMISSION_QUICK_START.md # 权限控制快速开始
│   ├── PERMISSION_IMPLEMENTATION.md # 权限控制实现细节
│   ├── AUTH_MODULE_README.md     # 认证模块说明
│   ├── QUICK_START_AUTH.md       # 认证快速开始
│   ├── *_MANAGEMENT_API.md       # 各模块 API 文档
│   └── *_MODULE_COMPLETED.md     # 各模块完成状态
├── cache/                        # 文件缓存目录（运行时生成）
├── logs/                         # 日志目录（运行时生成）
├── run/                          # 进程 PID 文件（运行时生成）
├── lib/                          # 第三方库或自定义库
├── typings/                      # TypeScript 类型定义
├── .dtpl/                        # 代码模板（VSCode dot-template）
├── package.json                  # 项目依赖配置
├── jsconfig.json                 # JavaScript 配置
├── .eslintrc                     # ESLint 配置
├── .babelrc                      # Babel 配置（装饰器支持）
└── README.md                     # 项目说明文档
```

---

## 代码规范

### 1. 命名规范

#### 文件命名
- **Controller**: 驼峰命名，如 `user.js`、`dictType.js`
- **Service**: 与 Controller 对应，如 `user.js`、`dictType.js`
- **Mapper XML**: 帕斯卡命名，如 `SysUserMapper.xml`
- **自动生成的 Service**: 与 Mapper XML 对应，如 `SysUserMapper.js`

#### 变量命名
- **驼峰命名**: `userName`、`roleId`、`deptName`
- **常量**: 大写下划线，如 `MAX_SIZE`、`DEFAULT_VALUE`
- **私有变量**: 下划线前缀，如 `_cache`、`_config`

#### 函数命名
- **增**: `add`、`create`、`insert`
- **删**: `remove`、`delete`
- **改**: `edit`、`update`、`modify`
- **查**: `list`、`get`、`select`、`query`
- **查询列表**: `selectXxxList`
- **查询单条**: `selectXxxById`

### 2. 代码结构

#### Controller 结构
```javascript
const Controller = require('egg').Controller;
const { Route, HttpGet, HttpPost, HttpPut, HttpDelete } = require('egg-decorator-router');
const { RequiresPermissions } = require('../../decorator/permission');

module.exports = app => {
  @Route('/api/system/xxx')
  class XxxController extends Controller {
    
    /**
     * 查询列表
     * GET /api/system/xxx/list
     * 权限：system:xxx:list
     */
    @RequiresPermissions('system:xxx:list')
    @HttpGet('/list')
    async list() {
      const { ctx } = this;
      const { pageNum = 1, pageSize = 10 } = ctx.request.body;
      
      const result = await ctx.service.system.xxx.selectXxxList(
        ctx.helper.page(ctx.request.body),
        ctx.request.body
      );
      
      ctx.body = result;
    }
    
    /**
     * 查询详情
     * GET /api/system/xxx/:id
     */
    @RequiresPermissions('system:xxx:query')
    @HttpGet('/:id')
    async getInfo() {
      const { ctx } = this;
      const result = await ctx.service.system.xxx.selectXxxById(ctx.params.id);
      ctx.body = result;
    }
    
    /**
     * 新增
     * POST /api/system/xxx
     */
    @RequiresPermissions('system:xxx:add')
    @HttpPost('/')
    async add() {
      const { ctx } = this;
      const result = await ctx.service.system.xxx.insertXxx(ctx.request.body);
      ctx.body = result;
    }
    
    /**
     * 修改
     * PUT /api/system/xxx
     */
    @RequiresPermissions('system:xxx:edit')
    @HttpPut('/')
    async edit() {
      const { ctx } = this;
      const result = await ctx.service.system.xxx.updateXxx(ctx.request.body);
      ctx.body = result;
    }
    
    /**
     * 删除
     * DELETE /api/system/xxx/:ids
     */
    @RequiresPermissions('system:xxx:remove')
    @HttpDelete('/:ids')
    async remove() {
      const { ctx } = this;
      const ids = ctx.params.ids.split(',');
      const result = await ctx.service.system.xxx.deleteXxxByIds(ids);
      ctx.body = result;
    }
  }
  
  return XxxController;
};
```

#### Service 结构
```javascript
const Service = require('egg').Service;

class XxxService extends Service {
  
  /**
   * 查询列表
   */
  async selectXxxList(values, params) {
    const { ctx } = this;
    // 调用自动生成的 DB Service
    const result = await ctx.service.db.mysql.ruoyi.sysXxxMapper.selectXxxList(
      values,
      params
    );
    return result;
  }
  
  /**
   * 查询详情
   */
  async selectXxxById(id) {
    const { ctx } = this;
    const result = await ctx.service.db.mysql.ruoyi.sysXxxMapper.selectXxxById([id]);
    return result[0] || null;
  }
  
  /**
   * 新增
   */
  async insertXxx(data) {
    const { ctx } = this;
    const result = await ctx.service.db.mysql.ruoyi.sysXxxMapper.insertXxx([data]);
    return { code: 200, msg: '新增成功', data: result };
  }
  
  /**
   * 修改
   */
  async updateXxx(data) {
    const { ctx } = this;
    const result = await ctx.service.db.mysql.ruoyi.sysXxxMapper.updateXxx([data]);
    return { code: 200, msg: '修改成功', data: result };
  }
  
  /**
   * 删除
   */
  async deleteXxxByIds(ids) {
    const { ctx } = this;
    const result = await ctx.service.db.mysql.ruoyi.sysXxxMapper.deleteXxxByIds([ids]);
    return { code: 200, msg: '删除成功', data: result };
  }
}

module.exports = XxxService;
```

#### Mapper XML 结构
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="mapper.mysql.ruoyi.SysXxxMapper">

    <!-- 通用查询结果列 -->
    <sql id="selectXxxVo">
        select xxx_id, xxx_name, create_time, update_time
        from sys_xxx
    </sql>

    <!-- 查询列表 -->
    <select id="selectXxxList" parameterType="SysXxx" resultType="SysXxx">
        <include refid="selectXxxVo"/>
        <where>
            <if test="xxxName != null and xxxName != ''">
                AND xxx_name like concat('%', #{xxxName}, '%')
            </if>
        </where>
        order by create_time desc
        <if test="pageNum != null and pageSize != null">
            limit #{offset}, #{pageSize}
        </if>
    </select>

    <!-- 查询详情 -->
    <select id="selectXxxById" parameterType="Long" resultType="SysXxx">
        <include refid="selectXxxVo"/>
        where xxx_id = #{xxxId}
    </select>

    <!-- 新增 -->
    <insert id="insertXxx" parameterType="SysXxx" useGeneratedKeys="true" keyProperty="xxxId">
        insert into sys_xxx
        <trim prefix="(" suffix=")" suffixOverrides=",">
            <if test="xxxName != null and xxxName != ''">xxx_name,</if>
            <if test="createBy != null">create_by,</if>
            create_time
        </trim>
        <trim prefix="values (" suffix=")" suffixOverrides=",">
            <if test="xxxName != null and xxxName != ''">#{xxxName},</if>
            <if test="createBy != null">#{createBy},</if>
            sysdate()
        </trim>
    </insert>

    <!-- 修改 -->
    <update id="updateXxx" parameterType="SysXxx">
        update sys_xxx
        <set>
            <if test="xxxName != null and xxxName != ''">xxx_name = #{xxxName},</if>
            <if test="updateBy != null">update_by = #{updateBy},</if>
            update_time = sysdate()
        </set>
        where xxx_id = #{xxxId}
    </update>

    <!-- 删除 -->
    <delete id="deleteXxxByIds" parameterType="Long">
        delete from sys_xxx where xxx_id in
        <foreach collection="array" item="xxxId" open="(" separator="," close=")">
            #{xxxId}
        </foreach>
    </delete>

</mapper>
```

### 3. 权限控制装饰器

#### @RequiresPermissions - 权限验证
```javascript
// 单个权限
@RequiresPermissions('system:user:list')

// 多个权限（AND 逻辑 - 需要同时具备）
@RequiresPermissions(['system:user:list', 'system:user:query'], 'AND')

// 多个权限（OR 逻辑 - 具备其一即可）
@RequiresPermissions(['system:user:list', 'system:user:query'], 'OR')

// 通配符权限
@RequiresPermissions('system:*:*')  // 所有 system 模块权限
@RequiresPermissions('*:*:*')       // 所有权限（管理员）
```

#### @RequiresRoles - 角色验证
```javascript
// 单个角色
@RequiresRoles('admin')

// 多个角色（AND 逻辑）
@RequiresRoles(['admin', 'editor'], 'AND')

// 多个角色（OR 逻辑）
@RequiresRoles(['admin', 'editor'], 'OR')
```

#### @RequiresAuth - 组合验证
```javascript
// 同时验证角色和权限
@RequiresAuth({
  roles: ['admin'],
  permissions: ['system:user:list'],
  logical: 'AND'
})
```

### 4. 响应格式

#### 成功响应
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    // 业务数据
  }
}
```

#### 分页响应
```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [...],
  "total": 100
}
```

#### 错误响应
```json
{
  "code": 500,
  "msg": "错误信息"
}
```

### 5. 常用辅助函数

#### ctx.helper.page() - 分页参数
```javascript
// 将前端传入的 pageNum、pageSize 转换为数据库 offset
const values = ctx.helper.page(ctx.request.body);
// 返回: { offset: 0, pageSize: 10 }
```

#### ctx.helper.formatDate() - 日期格式化
```javascript
const formattedDate = ctx.helper.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
```

#### ctx.app.cache - 缓存操作
```javascript
// 设置缓存
await ctx.app.cache.default.set('key', value, { ttl: 600 });

// 获取缓存
const value = await ctx.app.cache.default.get('key');

// 删除缓存
await ctx.app.cache.default.del('key');

// 带回调的缓存（不存在时自动执行回调并缓存）
const value = await ctx.app.cache.default.wrap('key', async () => {
  return await fetchDataFromDb();
}, { ttl: 600 });
```

---

## 开发工作流

### 1. 新增功能模块

#### 步骤 1：编写 Mapper XML
```bash
# 在 mapper/mysql/ruoyi/ 目录下创建 XML 文件
# 例如：SysXxxMapper.xml
```

#### 步骤 2：自动生成 Service
```bash
# 开发模式会自动监听 XML 变化并生成代码
npm run dev

# 或手动生成
npm run mapper
```

#### 步骤 3：编写 Service 业务逻辑
```bash
# 在 app/service/system/ 目录下创建对应的 Service
# 例如：xxx.js
```

#### 步骤 4：编写 Controller
```bash
# 在 app/controller/system/ 目录下创建对应的 Controller
# 例如：xxx.js
```

#### 步骤 5：添加权限注解
```javascript
// 使用 @RequiresPermissions 装饰器添加权限控制
@RequiresPermissions('system:xxx:list')
```

#### 步骤 6：测试接口
```bash
# 使用 Postman、curl 或前端项目测试
```

### 2. 修改现有功能

#### 修改 SQL
- 编辑 `mapper/mysql/ruoyi/XxxMapper.xml`
- 保存后会自动重新生成 Service（开发模式）

#### 修改业务逻辑
- 编辑 `app/service/system/xxx.js`
- 无需重启服务（热重载）

#### 修改接口
- 编辑 `app/controller/system/xxx.js`
- 无需重启服务（热重载）

### 3. 常用命令

```bash
# 开发模式（推荐）
npm run dev          # Mapper 自动生成 + 调试服务 + 热重载

# 单独运行
npm run mapper       # 仅生成 Mapper Service
npm run debug        # 仅启动调试服务

# 生产模式
npm start            # 启动生产服务（后台守护进程）
npm stop             # 停止生产服务

# 其他
npm run lint         # 代码检查
npm test             # 运行测试
```

---

## 配置说明

### 环境配置文件

- **config.default.js**: 所有环境的默认配置
- **config.local.js**: 本地开发配置（优先级高）
- **config.prod.js**: 生产环境配置（优先级高）

### 重要配置项

#### JWT 配置
```javascript
config.jwt = {
  enable: true,
  match: /^\/api[\/]?((?!version|login|register|captcha).)*$/i,
  secret: 'z2Em*CpGBZDw+',  // 生产环境必须修改
  expiresIn: '7d',
  getToken(ctx) { /* ... */ },
  isRevoked: async (ctx, payload) => { /* ... */ }
};
```

#### 数据库配置
```javascript
config.mysql = {
  default: {
    port: 3306,
    charset: 'utf8mb4',
    multipleStatements: true,
    connectionLimit: 100,
  },
  clients: {
    ruoyi: {
      host: '127.0.0.1',
      user: 'root',
      password: 'your_password',
      database: 'ruoyi',
    },
  },
};
```

#### 缓存配置
```javascript
config.cache = {
  default: 'redis',  // 默认使用 Redis，可选 'memory'、'fs'
  ttl: 600,          // 默认 TTL（秒）
  redis: {
    host: '127.0.0.1',
    port: 6379,
    password: '',
    db: 0,
  },
};
```

#### 限流配置
```javascript
config.ratelimiter = {
  points: 100,       // 允许的请求次数
  duration: 60,      // 时间窗口（秒）
  redis: { /* ... */ }
};
```

---

## 数据库设计

### 核心表

- **sys_user**: 用户信息表
- **sys_role**: 角色信息表
- **sys_menu**: 菜单权限表
- **sys_dept**: 部门信息表
- **sys_post**: 岗位信息表
- **sys_user_role**: 用户角色关联表
- **sys_role_menu**: 角色菜单关联表
- **sys_role_dept**: 角色部门关联表
- **sys_user_post**: 用户岗位关联表
- **sys_dict_type**: 字典类型表
- **sys_dict_data**: 字典数据表
- **sys_config**: 参数配置表
- **sys_notice**: 通知公告表
- **sys_logininfor**: 登录日志表
- **sys_oper_log**: 操作日志表
- **sys_job_log**: 定时任务日志表

详细设计参考：`docs/DATABASE_DESIGN.md`

---

## API 规范

### 路由规范

```
/api/system/模块/操作
```

### HTTP 方法
- **GET**: 查询操作
- **POST**: 新增操作
- **PUT**: 修改操作
- **DELETE**: 删除操作

### 权限标识符规范

```
模块:子模块:操作
```

示例：
- `system:user:list` - 用户列表查询
- `system:user:query` - 用户详情查询
- `system:user:add` - 新增用户
- `system:user:edit` - 修改用户
- `system:user:remove` - 删除用户
- `system:role:*` - 角色模块所有权限
- `*:*:*` - 所有权限（超级管理员）

### 请求参数
- **分页参数**: `pageNum`、`pageSize`
- **查询参数**: 与数据库字段对应的驼峰命名
- **日期范围**: `beginTime`、`endTime`

### 响应数据
- **列表查询**: `{ rows: [], total: 0 }`
- **详情查询**: `{ data: {} }`
- **增删改**: `{ code: 200, msg: '操作成功' }`

---

## 常见问题

### 1. 如何新增一个模块？

参考 [开发工作流 - 新增功能模块](#1-新增功能模块)

### 2. Mapper XML 修改后没有生效？

**方案 1**: 确保运行的是 `npm run dev`（会自动监听变化）  
**方案 2**: 手动执行 `npm run mapper` 重新生成  
**方案 3**: 重启服务

### 3. 如何调试 SQL？

在自动生成的 Service 中，可以打印 SQL：

```javascript
const sql = this.selectUserListMapper(values, params);
ctx.logger.info('SQL:', sql);
```

### 4. 如何添加权限控制？

在 Controller 方法上添加 `@RequiresPermissions` 装饰器：

```javascript
@RequiresPermissions('system:user:list')
@HttpGet('/list')
async list() { /* ... */ }
```

### 5. 如何使用缓存？

```javascript
// 方式 1：直接使用
await ctx.app.cache.default.set('key', value);
const value = await ctx.app.cache.default.get('key');

// 方式 2：带回调（推荐）
const value = await ctx.app.cache.default.wrap('key', async () => {
  return await fetchData();
});
```

### 6. 如何上传文件？

调用公共上传接口：`POST /api/common/upload`

```javascript
const formData = new FormData();
formData.append('file', file);
const response = await axios.post('/api/common/upload', formData);
```

### 7. 跨域问题如何解决？

已在 `config.default.js` 中配置 CORS，如需调整：

```javascript
config.cors = {
  allowMethods: 'GET,POST,PUT,DELETE',
  credentials: true,
  origin: 'http://localhost:8080',  // 配置具体域名
};
```

### 8. 如何获取当前登录用户？

在 Controller 或 Service 中：

```javascript
const user = ctx.state.user;
const userId = user.userId;
const userName = user.userName;
```

### 9. Optional Chaining 语法错误？

Node.js 20+ 支持可选链，但如果遇到问题，改为：

```javascript
// 不推荐
const value = obj?.prop?.value;

// 推荐
const obj2 = obj || {};
const prop = obj2.prop || {};
const value = prop.value;
```

### 10. 如何部署到生产环境？

参考 [部署说明](#部署说明)，推荐使用 PM2 或 Docker。

---

## 开发建议

### 代码质量
1. **遵循 ESLint 规范**: 保持代码风格一致
2. **添加注释**: 复杂逻辑必须添加注释
3. **错误处理**: 使用 try-catch 捕获异常
4. **日志记录**: 关键操作记录日志（`ctx.logger`）

### 安全性
1. **JWT Secret**: 生产环境必须修改
2. **SQL 注入**: 使用参数化查询（MyBatis 自动处理）
3. **XSS 防护**: 前端输入验证和转义
4. **权限控制**: 所有敏感接口添加 `@RequiresPermissions`
5. **密码加密**: 使用 bcryptjs 加密存储

### 性能优化
1. **使用缓存**: 频繁查询的数据缓存
2. **分页查询**: 大数据量必须分页
3. **索引优化**: 数据库表添加合适的索引
4. **连接池**: 配置合理的数据库连接池大小
5. **限流保护**: 高频接口启用限流

### 可维护性
1. **模块化**: 功能按模块划分
2. **命名规范**: 统一的命名风格
3. **文档完善**: 及时更新文档
4. **版本控制**: 使用 Git 进行版本管理
5. **单元测试**: 核心功能编写测试用例

---

## 快速参考

### 装饰器

| 装饰器 | 说明 | 示例 |
|--------|------|------|
| `@Route` | 定义路由前缀 | `@Route('/api/system/user')` |
| `@HttpGet` | GET 请求 | `@HttpGet('/list')` |
| `@HttpPost` | POST 请求 | `@HttpPost('/')` |
| `@HttpPut` | PUT 请求 | `@HttpPut('/')` |
| `@HttpDelete` | DELETE 请求 | `@HttpDelete('/:ids')` |
| `@RequiresPermissions` | 权限验证 | `@RequiresPermissions('system:user:list')` |
| `@RequiresRoles` | 角色验证 | `@RequiresRoles('admin')` |
| `@RequiresAuth` | 组合验证 | `@RequiresAuth({roles: ['admin']})` |

### 常用路径

```javascript
// Controller
ctx.service.system.user
ctx.service.monitor.cache
ctx.service.tool.gen

// 自动生成的 DB Service
ctx.service.db.mysql.ruoyi.sysUserMapper
ctx.service.db.mysql.ruoyi.sysRoleMapper

// Helper
ctx.helper.page()
ctx.helper.formatDate()

// Cache
ctx.app.cache.default.get()
ctx.app.cache.default.set()

// Logger
ctx.logger.info()
ctx.logger.error()
ctx.logger.warn()

// 当前用户
ctx.state.user
```

### 文档索引

- **API 映射**: `docs/API_MAPPING.md`
- **权限控制**: `docs/PERMISSION_GUIDE.md`
- **认证授权**: `docs/AUTH_MODULE_README.md`
- **快速开始**: `docs/QUICK_START_AUTH.md`
- **各模块 API**: `docs/*_MANAGEMENT_API.md`
- **项目分析**: `docs/PROJECT_ANALYSIS_SUMMARY.md`
- **架构对比**: `docs/ARCHITECTURE_COMPARISON.md`

---

## AI 辅助提示

当使用 AI 辅助开发时，请遵循以下原则：

1. **明确需求**: 清楚说明要实现的功能
2. **提供上下文**: 指定相关的模块和文件
3. **遵循规范**: 生成的代码应符合项目规范
4. **权限控制**: 新增接口不要忘记添加权限注解
5. **完整实现**: Controller、Service、Mapper 三层都要实现
6. **测试验证**: 生成代码后需要测试验证

### 常用 AI 指令示例

```
# 新增模块
"帮我创建一个商品管理模块，包括 Controller、Service 和 Mapper XML，
支持增删改查和分页，权限标识符使用 system:goods:*"

# 修改功能
"修改用户列表查询接口，增加按部门 ID 筛选的功能"

# 添加权限
"为所有系统管理模块的 Controller 添加 @RequiresPermissions 装饰器"

# 优化性能
"优化用户列表查询的 SQL，添加索引和缓存"

# 修复 Bug
"修复登录日志查询时日期范围筛选不生效的问题"
```

---

