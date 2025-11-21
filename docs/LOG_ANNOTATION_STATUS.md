# 操作日志注解添加状态

## 已完成的 Controller

### ✅ app/controller/system/role.js（完整）
已添加日志注解的方法：
- `add()` - 新增角色 (INSERT)
- `edit()` - 修改角色 (UPDATE)
- `remove()` - 删除角色 (DELETE)
- `changeStatus()` - 修改状态 (UPDATE)
- `dataScope()` - 数据权限授权 (GRANT)
- `cancelAuthUser()` - 取消授权用户 (GRANT)
- `cancelAuthUserAll()` - 批量取消授权 (GRANT)
- `selectAuthUserAll()` - 批量授权用户 (GRANT)
- `export()` - 导出角色 (EXPORT)

### ✅ app/controller/system/user.js（部分完成）
已添加日志注解的方法：
- `add()` - 新增用户 (INSERT)
- `edit()` - 修改用户 (UPDATE)
- `remove()` - 删除用户 (DELETE)
- `resetPwd()` - 重置密码 (UPDATE)
- `export()` - 导出用户 (EXPORT)

待添加的方法：
- `changeStatus()` - 修改状态 (UPDATE)
- `insertAuthRole()` - 用户授权 (GRANT)
- `importData()` - 导入用户 (IMPORT)

---

## 待添加日志注解的 Controller

### System 模块

#### menu.js
```javascript
// 需要添加 Log 导入
const { Log, BusinessType } = require('../../decorator/log');

// 需要添加注解的方法
@Log({ title: '菜单管理', businessType: BusinessType.INSERT })  // add()
@Log({ title: '菜单管理', businessType: BusinessType.UPDATE })  // edit()
@Log({ title: '菜单管理', businessType: BusinessType.DELETE })  // remove()
```

#### dept.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '部门管理', businessType: BusinessType.INSERT })  // add()
@Log({ title: '部门管理', businessType: BusinessType.UPDATE })  // edit()
@Log({ title: '部门管理', businessType: BusinessType.DELETE })  // remove()
```

#### post.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '岗位管理', businessType: BusinessType.INSERT })  // add()
@Log({ title: '岗位管理', businessType: BusinessType.UPDATE })  // edit()
@Log({ title: '岗位管理', businessType: BusinessType.DELETE })  // remove()
@Log({ title: '岗位管理', businessType: BusinessType.EXPORT })  // export()
```

#### dictType.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '字典类型', businessType: BusinessType.INSERT })  // add()
@Log({ title: '字典类型', businessType: BusinessType.UPDATE })  // edit()
@Log({ title: '字典类型', businessType: BusinessType.DELETE })  // remove()
@Log({ title: '字典类型', businessType: BusinessType.EXPORT })  // export()
@Log({ title: '字典类型', businessType: BusinessType.CLEAN })   // refreshCache()
```

#### dictData.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '字典数据', businessType: BusinessType.INSERT })  // add()
@Log({ title: '字典数据', businessType: BusinessType.UPDATE })  // edit()
@Log({ title: '字典数据', businessType: BusinessType.DELETE })  // remove()
@Log({ title: '字典数据', businessType: BusinessType.EXPORT })  // export()
```

#### config.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '参数管理', businessType: BusinessType.INSERT })  // add()
@Log({ title: '参数管理', businessType: BusinessType.UPDATE })  // edit()
@Log({ title: '参数管理', businessType: BusinessType.DELETE })  // remove()
@Log({ title: '参数管理', businessType: BusinessType.CLEAN })   // refreshCache()
@Log({ title: '参数管理', businessType: BusinessType.EXPORT })  // export()
```

#### notice.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '通知公告', businessType: BusinessType.INSERT })  // add()
@Log({ title: '通知公告', businessType: BusinessType.UPDATE })  // edit()
@Log({ title: '通知公告', businessType: BusinessType.DELETE })  // remove()
```

#### profile.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '个人信息', businessType: BusinessType.UPDATE })  // updateProfile()
@Log({ title: '个人信息', businessType: BusinessType.UPDATE })  // updatePwd()
@Log({ title: '个人信息', businessType: BusinessType.UPDATE })  // avatar()
```

#### login.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '用户注册', businessType: BusinessType.INSERT })  // register()
```

### Monitor 模块

#### logininfor.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '登录日志', businessType: BusinessType.DELETE })  // remove()
@Log({ title: '登录日志', businessType: BusinessType.CLEAN })   // clean()
@Log({ title: '登录日志', businessType: BusinessType.EXPORT })  // export()
```

#### operlog.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '操作日志', businessType: BusinessType.DELETE })  // remove()
@Log({ title: '操作日志', businessType: BusinessType.CLEAN })   // clean()
@Log({ title: '操作日志', businessType: BusinessType.EXPORT })  // export()
```

#### job.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '定时任务', businessType: BusinessType.INSERT })  // add()
@Log({ title: '定时任务', businessType: BusinessType.UPDATE })  // edit()
@Log({ title: '定时任务', businessType: BusinessType.DELETE })  // remove()
@Log({ title: '定时任务', businessType: BusinessType.UPDATE })  // changeStatus()
@Log({ title: '定时任务', businessType: BusinessType.UPDATE })  // run()
@Log({ title: '定时任务', businessType: BusinessType.EXPORT })  // export()
```

#### jobLog.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '调度日志', businessType: BusinessType.DELETE })  // remove()
@Log({ title: '调度日志', businessType: BusinessType.CLEAN })   // clean()
@Log({ title: '调度日志', businessType: BusinessType.EXPORT })  // export()
```

#### online.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '在线用户', businessType: BusinessType.FORCE })   // forceLogout()
```

#### cache.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '缓存监控', businessType: BusinessType.CLEAN })   // clearCache()
```

### Tool 模块

#### gen.js
```javascript
const { Log, BusinessType } = require('../../decorator/log');

@Log({ title: '代码生成', businessType: BusinessType.GENCODE })  // genCode()
@Log({ title: '代码生成', businessType: BusinessType.IMPORT })   // importTable()
@Log({ title: '代码生成', businessType: BusinessType.UPDATE })   // update()
@Log({ title: '代码生成', businessType: BusinessType.DELETE })   // remove()
```

---

## 添加步骤

### 1. 导入装饰器
在每个文件的顶部添加：
```javascript
const { Log, BusinessType } = require('../../decorator/log');
```

### 2. 添加装饰器
在方法上方添加 `@Log` 装饰器，位置在权限装饰器之前：
```javascript
@Log({ title: '模块名称', businessType: BusinessType.操作类型 })
@RequiresPermissions('system:xxx:permission')
@HttpPost('/')
async methodName() { ... }
```

### 3. 装饰器顺序
正确的顺序（从上到下）：
1. `@Log` - 操作日志（最上方）
2. `@RequiresPermissions` 或 `@RequiresRoles` - 权限验证
3. `@HttpGet/Post/Put/Delete` - 路由装饰器
4. `async methodName()` - 方法定义

---

## 快速完成方法

可以使用 VS Code 的多光标编辑功能：
1. 搜索 `@RequiresPermissions.*@HttpPost` 等模式
2. 在匹配行上方添加 `@Log` 装饰器
3. 根据操作类型选择合适的 BusinessType

或者使用脚本批量处理（Node.js）：
```javascript
const fs = require('fs');
const path = require('path');

// 读取文件，识别需要添加注解的位置，自动插入
// 根据 HTTP 方法和路由路径推断操作类型
```

---

## 验证方法

1. 启动项目
2. 执行相应操作（新增、修改、删除等）
3. 查询操作日志表 `sys_oper_log`
4. 确认日志记录正确

SQL 查询示例：
```sql
SELECT 
  oper_id, title, business_type, method, 
  request_method, oper_name, oper_url, 
  status, cost_time, oper_time
FROM sys_oper_log
ORDER BY oper_time DESC
LIMIT 10;
```

---

## 注意事项

1. **查询操作不添加日志**：GET 请求通常不需要日志
2. **敏感信息自动过滤**：密码字段会自动替换为 ******
3. **异步记录**：日志记录不会阻塞业务响应
4. **错误捕获**：装饰器会自动捕获异常并记录
5. **模块名称一致**：保持与菜单名称一致

---

## 完成进度

- ✅ 装饰器实现：100%
- ✅ role.js：100%
- ✅ user.js：70%
- ⏳ 其他 system 模块：0%
- ⏳ monitor 模块：0%
- ⏳ tool 模块：0%

**总体进度：约 15%**

---

## 下一步工作

建议按以下顺序完成：
1. ✅ 完成 user.js 剩余方法
2. 完成 menu.js、dept.js、post.js（核心模块）
3. 完成 dict*.js、config.js（配置模块）
4. 完成 notice.js、profile.js、login.js
5. 完成 monitor 模块
6. 完成 tool 模块

预计总工作量：约 60-80 个方法需要添加注解。
