# 数据权限使用指南

## 📋 概述

数据权限功能允许根据用户的角色权限，自动过滤查询数据，确保用户只能看到其权限范围内的数据。

## 🎯 数据权限类型

系统支持 5 种数据权限类型：

| 类型 | 值 | 说明 |
|------|---|------|
| 全部数据权限 | 1 | 可以查看所有数据 |
| 自定义数据权限 | 2 | 可以查看指定部门的数据（通过 sys_role_dept 表配置） |
| 部门数据权限 | 3 | 只能查看本部门的数据 |
| 部门及以下数据权限 | 4 | 可以查看本部门及其子部门的数据 |
| 仅本人数据权限 | 5 | 只能查看自己创建的数据 |

## 📦 使用方法

### 1. 引入装饰器

```javascript
const { DataScope } = require('../../decorator/dataScope');
```

### 2. 添加装饰器到方法

在需要数据权限过滤的查询方法上添加 `@DataScope` 装饰器：

```javascript
class UserService extends Service {
  /**
   * 查询用户列表（带数据权限过滤）
   * @param {object} params - 查询参数
   * @return {array} 用户列表
   */
  @DataScope({ deptAlias: "d", userAlias: "u" })
  async selectUserList(params = {}) {
    const { ctx } = this;
    
    const conditions = {
      ...params,
      params: {
        dataScope: "" // 装饰器会自动填充此字段
      }
    };
    
    return await ctx.helper.getDB(ctx).sysUserMapper.selectUserList([], conditions);
  }
}
```

### 3. 装饰器参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| deptAlias | string | 否 | 'd' | 部门表的别名 |
| userAlias | string | 否 | 'u' | 用户表的别名 |
| permission | string | 否 | '' | 权限字符，多个权限用逗号分隔 |

### 4. MyBatis Mapper 配置

在 MyBatis XML 文件中使用 `${params.dataScope}` 占位符：

```xml
<selects id="selectUserList" parameterType="SysUser" resultMap="SysUserResult">
    select u.user_id, u.dept_id, u.user_name, u.nick_name, u.email
    from sys_user u
    left join sys_dept d on u.dept_id = d.dept_id
    where u.del_flag = '0'
    
    <if test="userName != null and userName != ''">
        AND u.user_name like concat('%', #{userName}, '%')
    </if>
    
    <!-- 数据权限过滤 - 重要！-->
    ${params.dataScope}
</selects>
```

## 🔧 工作原理

1. **拦截方法调用**：装饰器在方法执行前拦截
2. **获取用户角色**：查询当前用户的所有角色及其数据权限范围
3. **生成 SQL 条件**：根据角色的数据权限类型，生成对应的 SQL WHERE 条件
4. **注入查询参数**：将生成的 SQL 条件注入到 `params.dataScope` 字段
5. **执行查询**：MyBatis 使用 `${params.dataScope}` 将 SQL 条件拼接到查询语句中

## 📝 生成的 SQL 示例

### 全部数据权限
```sql
-- 不添加任何过滤条件
```

### 自定义数据权限
```sql
AND (d.dept_id IN (SELECT dept_id FROM sys_role_dept WHERE role_id = 2))
```

### 部门数据权限
```sql
AND (d.dept_id = 103)
```

### 部门及以下数据权限
```sql
AND (d.dept_id IN (SELECT dept_id FROM sys_dept WHERE dept_id = 103 OR FIND_IN_SET(103, ancestors)))
```

### 仅本人数据权限
```sql
AND (u.user_id = 1)
```

## ⚠️ 注意事项

1. **超级管理员豁免**：超级管理员（userId = 1）不进行数据权限过滤
2. **未登录用户**：未登录用户会被过滤掉所有数据
3. **表别名一致性**：装饰器中的别名必须与 SQL 中的表别名一致
4. **角色停用状态**：停用的角色（status = '1'）不参与权限过滤
5. **多角色优先级**：如果用户有多个角色，权限范围取并集（OR 关系）
6. **SQL 注入防护**：装饰器会在执行前清空 `dataScope` 字段，防止 SQL 注入

## 🎨 完整示例

### Service 层

```javascript
const Service = require('egg').Service;
const { DataScope } = require('../../decorator/dataScope');

class DeptService extends Service {
  /**
   * 查询部门列表（带数据权限）
   */
  @DataScope({ deptAlias: 'd' })
  async selectDeptList(params = {}) {
    const { ctx } = this;
    
    const conditions = {
      ...params,
      params: {
        dataScope: ""
      }
    };
    
    return await ctx.helper.getDB(ctx).sysDeptMapper.selectDeptList([], conditions);
  }

  /**
   * 查询已分配部门用户列表（带权限过滤）
   * 指定权限字符，只有拥有 system:user:list 权限的角色才会参与数据权限过滤
   */
  @DataScope({ deptAlias: 'd', userAlias: 'u', permission: 'system:user:list' })
  async selectAllocatedUserList(params = {}) {
    const { ctx } = this;
    
    const conditions = {
      ...params,
      params: {
        dataScope: ""
      }
    };
    
    return await ctx.helper.getDB(ctx).sysUserMapper.selectAllocatedList([], conditions);
  }
}

module.exports = DeptService;
```

### Mapper XML

```xml
<mapper namespace="SysDeptMapper">
    <selects id="selectDeptList" parameterType="SysDept" resultMap="SysDeptResult">
        select d.dept_id, d.parent_id, d.ancestors, d.dept_name, d.order_num, d.leader, d.status
        from sys_dept d
        where d.del_flag = '0'
        
        <if test="deptName != null and deptName != ''">
            AND d.dept_name like concat('%', #{deptName}, '%')
        </if>
        
        <if test="status != null and status != ''">
            AND d.status = #{status}
        </if>
        
        <!-- 数据权限过滤 -->
        ${params.dataScope}
        
        order by d.parent_id, d.order_num
    </selects>
</mapper>
```

## 🔍 调试

如果需要调试数据权限生成的 SQL，可以在装饰器中添加日志：

```javascript
// 在 app/decorator/dataScope.js 的 generateDataScopeSql 函数中添加
console.log('Generated dataScope SQL:', dataScopeSql);
```

或在 service 方法中打印参数：

```javascript
@DataScope({ deptAlias: 'd', userAlias: 'u' })
async selectUserList(params = {}) {
  console.log('DataScope:', params.params.dataScope);
  // ... 执行查询
}
```

## 📚 相关文件

- 装饰器实现：`app/decorator/dataScope.js`
- 常量定义：`app/constant/index.js`
- 使用示例：`app/service/system/user.js`
- Mapper 配置：`mapper/mysql/ruoyi/SysUserMapper.xml`

## 🚀 最佳实践

1. **统一别名**：在项目中统一使用 `d` 作为部门表别名，`u` 作为用户表别名
2. **合理权限字符**：在需要精细控制权限的场景下使用 `permission` 参数
3. **日志记录**：在开发环境下开启 SQL 日志，观察生成的数据权限条件
4. **性能优化**：对于数据量大的表，确保 `dept_id` 和 `user_id` 字段有索引
5. **测试覆盖**：针对不同数据权限类型编写单元测试

---

**更多信息请参考 Spring Boot 版 RuoYi-Vue 的数据权限实现。**
