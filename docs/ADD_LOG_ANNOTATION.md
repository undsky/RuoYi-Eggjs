# 批量添加日志注解指南

## 概述
根据 `app/controller/system/role.js` 的实现，为所有 Controller 中的非查询操作添加 `@Log` 装饰器。

## 添加步骤

### 1. 导入装饰器（在文件顶部）

```javascript
// 添加这一行
const { Log, BusinessType } = require('../../decorator/log');
```

### 2. 根据操作类型添加装饰器

装饰器应该放在方法的最上方，在权限装饰器之前。

#### 新增操作 (POST)
```javascript
@Log({ title: '模块名称', businessType: BusinessType.INSERT })
@RequiresPermissions('system:xxx:add')
@HttpPost('/')
async add() { ... }
```

#### 修改操作 (PUT)
```javascript
@Log({ title: '模块名称', businessType: BusinessType.UPDATE })
@RequiresPermissions('system:xxx:edit')
@HttpPut('/')
async edit() { ... }
```

#### 删除操作 (DELETE)
```javascript
@Log({ title: '模块名称', businessType: BusinessType.DELETE })
@RequiresPermissions('system:xxx:remove')
@HttpDelete('/:ids')
async remove() { ... }
```

#### 授权操作
```javascript
@Log({ title: '模块名称', businessType: BusinessType.GRANT })
@RequiresPermissions('system:xxx:edit')
@HttpPut('/authXxx')
async authXxx() { ... }
```

#### 导出操作
```javascript
@Log({ title: '模块名称', businessType: BusinessType.EXPORT })
@RequiresPermissions('system:xxx:export')
@HttpPost('/export')
async export() { ... }
```

#### 导入操作
```javascript
@Log({ title: '模块名称', businessType: BusinessType.IMPORT })
@RequiresPermissions('system:xxx:import')
@HttpPost('/importData')
async importData() { ... }
```

#### 清空操作
```javascript
@Log({ title: '模块名称', businessType: BusinessType.CLEAN })
@RequiresPermissions('system:xxx:remove')
@HttpDelete('/clean')
async clean() { ... }
```

## 需要添加注解的 Controller 清单

### System 模块 (app/controller/system/)

#### ✅ role.js（已完成）
- 新增角色、修改角色、删除角色、修改状态
- 数据权限授权、用户授权/取消授权
- 导出角色

#### user.js
```javascript
// 1. 导入
const { Log, BusinessType } = require('../../decorator/log');

// 2. 添加注解
@Log({ title: '用户管理', businessType: BusinessType.INSERT })  // 新增用户
@Log({ title: '用户管理', businessType: BusinessType.UPDATE })  // 修改用户
@Log({ title: '用户管理', businessType: BusinessType.DELETE })  // 删除用户
@Log({ title: '用户管理', businessType: BusinessType.UPDATE })  // 重置密码
@Log({ title: '用户管理', businessType: BusinessType.UPDATE })  // 修改状态
@Log({ title: '用户管理', businessType: BusinessType.GRANT })   // 用户授权
@Log({ title: '用户管理', businessType: BusinessType.EXPORT })  // 导出用户
@Log({ title: '用户管理', businessType: BusinessType.IMPORT })  // 导入用户
```

#### menu.js
```javascript
@Log({ title: '菜单管理', businessType: BusinessType.INSERT })  // 新增菜单
@Log({ title: '菜单管理', businessType: BusinessType.UPDATE })  // 修改菜单
@Log({ title: '菜单管理', businessType: BusinessType.DELETE })  // 删除菜单
```

#### dept.js
```javascript
@Log({ title: '部门管理', businessType: BusinessType.INSERT })  // 新增部门
@Log({ title: '部门管理', businessType: BusinessType.UPDATE })  // 修改部门
@Log({ title: '部门管理', businessType: BusinessType.DELETE })  // 删除部门
```

#### post.js
```javascript
@Log({ title: '岗位管理', businessType: BusinessType.INSERT })  // 新增岗位
@Log({ title: '岗位管理', businessType: BusinessType.UPDATE })  // 修改岗位
@Log({ title: '岗位管理', businessType: BusinessType.DELETE })  // 删除岗位
@Log({ title: '岗位管理', businessType: BusinessType.EXPORT })  // 导出岗位
```

#### dictType.js
```javascript
@Log({ title: '字典类型', businessType: BusinessType.INSERT })  // 新增字典类型
@Log({ title: '字典类型', businessType: BusinessType.UPDATE })  // 修改字典类型
@Log({ title: '字典类型', businessType: BusinessType.DELETE })  // 删除字典类型
@Log({ title: '字典类型', businessType: BusinessType.EXPORT })  // 导出字典类型
@Log({ title: '字典类型', businessType: BusinessType.CLEAN })   // 刷新缓存
```

#### dictData.js
```javascript
@Log({ title: '字典数据', businessType: BusinessType.INSERT })  // 新增字典数据
@Log({ title: '字典数据', businessType: BusinessType.UPDATE })  // 修改字典数据
@Log({ title: '字典数据', businessType: BusinessType.DELETE })  // 删除字典数据
@Log({ title: '字典数据', businessType: BusinessType.EXPORT })  // 导出字典数据
```

#### config.js
```javascript
@Log({ title: '参数管理', businessType: BusinessType.INSERT })  // 新增参数
@Log({ title: '参数管理', businessType: BusinessType.UPDATE })  // 修改参数
@Log({ title: '参数管理', businessType: BusinessType.DELETE })  // 删除参数
@Log({ title: '参数管理', businessType: BusinessType.CLEAN })   // 刷新缓存
@Log({ title: '参数管理', businessType: BusinessType.EXPORT })  // 导出参数
```

#### notice.js
```javascript
@Log({ title: '通知公告', businessType: BusinessType.INSERT })  // 新增公告
@Log({ title: '通知公告', businessType: BusinessType.UPDATE })  // 修改公告
@Log({ title: '通知公告', businessType: BusinessType.DELETE })  // 删除公告
```

#### profile.js
```javascript
@Log({ title: '个人信息', businessType: BusinessType.UPDATE })  // 修改个人信息
@Log({ title: '个人信息', businessType: BusinessType.UPDATE })  // 修改密码
@Log({ title: '个人信息', businessType: BusinessType.UPDATE })  // 修改头像
```

#### login.js
```javascript
@Log({ title: '用户注册', businessType: BusinessType.INSERT })  // 用户注册
```

### Monitor 模块 (app/controller/monitor/)

#### logininfor.js
```javascript
@Log({ title: '登录日志', businessType: BusinessType.DELETE })  // 删除日志
@Log({ title: '登录日志', businessType: BusinessType.CLEAN })   // 清空日志
@Log({ title: '登录日志', businessType: BusinessType.EXPORT })  // 导出日志
```

#### operlog.js
```javascript
@Log({ title: '操作日志', businessType: BusinessType.DELETE })  // 删除日志
@Log({ title: '操作日志', businessType: BusinessType.CLEAN })   // 清空日志
@Log({ title: '操作日志', businessType: BusinessType.EXPORT })  // 导出日志
```

#### job.js
```javascript
@Log({ title: '定时任务', businessType: BusinessType.INSERT })  // 新增任务
@Log({ title: '定时任务', businessType: BusinessType.UPDATE })  // 修改任务
@Log({ title: '定时任务', businessType: BusinessType.DELETE })  // 删除任务
@Log({ title: '定时任务', businessType: BusinessType.UPDATE })  // 修改状态
@Log({ title: '定时任务', businessType: BusinessType.UPDATE })  // 执行一次
@Log({ title: '定时任务', businessType: BusinessType.EXPORT })  // 导出任务
```

#### jobLog.js
```javascript
@Log({ title: '调度日志', businessType: BusinessType.DELETE })  // 删除日志
@Log({ title: '调度日志', businessType: BusinessType.CLEAN })   // 清空日志
@Log({ title: '调度日志', businessType: BusinessType.EXPORT })  // 导出日志
```

#### online.js
```javascript
@Log({ title: '在线用户', businessType: BusinessType.FORCE })   // 强退用户
```

#### cache.js
```javascript
@Log({ title: '缓存监控', businessType: BusinessType.CLEAN })   // 清理缓存
```

### Tool 模块 (app/controller/tool/)

#### gen.js
```javascript
@Log({ title: '代码生成', businessType: BusinessType.GENCODE })  // 生成代码
@Log({ title: '代码生成', businessType: BusinessType.IMPORT })   // 导入表
@Log({ title: '代码生成', businessType: BusinessType.UPDATE })   // 修改配置
@Log({ title: '代码生成', businessType: BusinessType.DELETE })   // 删除表
```

## 快速搜索替换方法

可以使用 IDE 的搜索替换功能批量添加：

### 搜索（正则表达式）：
```
(@RequiresPermissions\('system:user:add'\)\s+@HttpPost\('/'\))
```

### 替换为：
```
@Log({ title: '用户管理', businessType: BusinessType.INSERT })
$1
```

## 注意事项

1. **装饰器顺序**：`@Log` 必须放在最上方
2. **查询操作**：`GET` 请求不需要添加日志注解
3. **模块名称**：保持与菜单名称一致
4. **业务类型**：根据实际操作选择合适的类型
5. **导入语句**：每个文件都需要导入 `Log` 和 `BusinessType`

## 验证方法

添加完成后，可以通过以下方式验证：

1. 执行相应操作
2. 查看操作日志表 `sys_oper_log`
3. 确认日志记录正确

## 批量处理脚本

如果需要批量处理，可以编写 Node.js 脚本：

```javascript
const fs = require('fs');
const path = require('path');

// 读取控制器文件
// 查找需要添加注解的方法
// 自动插入 @Log 装饰器
// 保存文件
```

## 总结

按照此指南，可以快速为所有 Controller 添加操作日志注解，实现完整的操作审计功能。
