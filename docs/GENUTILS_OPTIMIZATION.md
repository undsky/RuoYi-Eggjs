# GenUtils 工具类优化说明

## 概述

已完全参照 RuoYi-Vue 的 Java 版本 `GenUtils.java` 优化了 ruoyi-eggjs 的 `genUtils.js`，特别是 `initColumnField` 方法的数字类型处理逻辑。

## 优化内容

### 1. 数字类型精细化处理

#### 优化前
```javascript
else if (GenUtils.arraysContains(GenConstants.COLUMNTYPE_NUMBER, dataType)) {
  column.htmlType = GenConstants.HTML_INPUT;
  // JavaScript 中统一使用 Number 类型
  column.javaType = GenConstants.TYPE_INTEGER;
}
```

#### 优化后
```javascript
else if (GenUtils.arraysContains(GenConstants.COLUMNTYPE_NUMBER, dataType)) {
  column.htmlType = GenConstants.HTML_INPUT;

  // 如果是浮点型 统一用BigDecimal
  const typeInfo = GenUtils.getColumnTypeInfo(column.columnType);
  if (typeInfo && typeInfo.length === 2 && parseInt(typeInfo[1]) > 0) {
    column.javaType = GenConstants.TYPE_BIGDECIMAL;
  }
  // 如果是整形
  else if (typeInfo && typeInfo.length === 1 && parseInt(typeInfo[0]) <= 10) {
    column.javaType = GenConstants.TYPE_INTEGER;
  }
  // 长整形
  else {
    column.javaType = GenConstants.TYPE_LONG;
  }
}
```

### 2. 新增辅助方法

#### getColumnTypeInfo()
解析列类型的长度和精度信息

```javascript
/**
 * 获取字段类型信息（长度和精度）
 * @param {string} columnType - 列类型，如 int(11)、decimal(10,2)
 * @return {array} 类型信息数组，如 ['11'] 或 ['10', '2']
 */
static getColumnTypeInfo(columnType) {
  if (!columnType) return [];
  const startIndex = columnType.indexOf('(');
  const endIndex = columnType.indexOf(')');
  if (startIndex > 0 && endIndex > startIndex) {
    const typeInfo = columnType.substring(startIndex + 1, endIndex);
    return typeInfo.split(',').map(s => s.trim()).filter(s => s);
  }
  return [];
}
```

## 类型判断逻辑

### 浮点型（BigDecimal）
- **条件**: 类型定义包含两个参数且第二个参数 > 0
- **示例**: `decimal(10,2)`, `float(8,2)`, `double(12,4)`
- **映射**: `GenConstants.TYPE_BIGDECIMAL` → `Number`

```javascript
// decimal(10,2) → typeInfo = ['10', '2']
// typeInfo.length === 2 && parseInt(typeInfo[1]) > 0
// → TYPE_BIGDECIMAL
```

### 整型（Integer）
- **条件**: 类型定义只有一个参数且 <= 10
- **示例**: `int(5)`, `tinyint(1)`, `smallint(6)`
- **映射**: `GenConstants.TYPE_INTEGER` → `Number`

```javascript
// int(5) → typeInfo = ['5']
// typeInfo.length === 1 && parseInt(typeInfo[0]) <= 10
// → TYPE_INTEGER
```

### 长整型（Long）
- **条件**: 其他情况（参数 > 10 或无参数）
- **示例**: `bigint(20)`, `int(11)`, `bigint`
- **映射**: `GenConstants.TYPE_LONG` → `Number`

```javascript
// int(11) → typeInfo = ['11']
// typeInfo.length === 1 && parseInt(typeInfo[0]) > 10
// → TYPE_LONG

// bigint → typeInfo = []
// → TYPE_LONG
```

## 类型映射对比

| MySQL 类型 | Java 类型 | JavaScript 类型 | 常量 |
|-----------|-----------|----------------|------|
| `tinyint(1)` | Integer | Number | TYPE_INTEGER |
| `int(5)` | Integer | Number | TYPE_INTEGER |
| `int(11)` | Long | Number | TYPE_LONG |
| `bigint(20)` | Long | Number | TYPE_LONG |
| `float(8,2)` | BigDecimal | Number | TYPE_BIGDECIMAL |
| `double(12,4)` | BigDecimal | Number | TYPE_BIGDECIMAL |
| `decimal(10,2)` | BigDecimal | Number | TYPE_BIGDECIMAL |

## 完整的 initColumnField 流程

```javascript
static initColumnField(column, table) {
  const dataType = GenUtils.getDbType(column.columnType);
  const columnName = column.columnName;
  
  // 1. 设置基础信息
  column.tableId = table.tableId;
  column.createBy = table.createBy;
  column.javaField = GenUtils.toCamelCase(columnName);
  
  // 2. 设置默认类型
  column.javaType = GenConstants.TYPE_STRING;
  column.queryType = GenConstants.QUERY_EQ;

  // 3. 根据数据类型设置 javaType 和 htmlType
  if (字符串或文本类型) {
    // 长度 >= 500 或 text 类型 → textarea
    // 否则 → input
  }
  else if (时间类型) {
    // javaType = Date
    // htmlType = datetime
  }
  else if (数字类型) {
    // htmlType = input
    // 浮点型 → BigDecimal
    // 小整数 → Integer
    // 大整数 → Long
  }

  // 4. 设置字段属性
  column.isInsert = '1';  // 默认都需要插入
  
  if (!排除字段 && !主键) {
    column.isEdit = '1';   // 可编辑
    column.isList = '1';   // 显示在列表
    column.isQuery = '1';  // 可查询
  }

  // 5. 根据字段名设置特殊属性
  if (name 结尾) → queryType = LIKE
  if (status 结尾) → htmlType = radio
  if (type/sex 结尾) → htmlType = select
  if (image 结尾) → htmlType = imageUpload
  if (file 结尾) → htmlType = fileUpload
  if (content 结尾) → htmlType = editor
}
```

## 使用示例

### 示例 1: 整型字段
```javascript
const column = {
  columnName: 'user_id',
  columnType: 'bigint(20)',
  isPk: true
};

GenUtils.initColumnField(column, table);

// 结果:
// column.javaField = 'userId'
// column.javaType = 'Number' (TYPE_LONG)
// column.htmlType = 'input'
// column.isInsert = '1'
// column.isEdit = undefined (因为是主键)
```

### 示例 2: 浮点型字段
```javascript
const column = {
  columnName: 'price',
  columnType: 'decimal(10,2)'
};

GenUtils.initColumnField(column, table);

// 结果:
// column.javaField = 'price'
// column.javaType = 'Number' (TYPE_BIGDECIMAL)
// column.htmlType = 'input'
// column.isInsert = '1'
// column.isEdit = '1'
// column.isList = '1'
// column.isQuery = '1'
```

### 示例 3: 状态字段
```javascript
const column = {
  columnName: 'status',
  columnType: 'char(1)'
};

GenUtils.initColumnField(column, table);

// 结果:
// column.javaField = 'status'
// column.javaType = 'String'
// column.htmlType = 'radio'  // 特殊处理
// column.queryType = 'EQ'
```

### 示例 4: 名称字段
```javascript
const column = {
  columnName: 'user_name',
  columnType: 'varchar(30)'
};

GenUtils.initColumnField(column, table);

// 结果:
// column.javaField = 'userName'
// column.javaType = 'String'
// column.htmlType = 'input'
// column.queryType = 'LIKE'  // 特殊处理
```

## 与 Java 版本的对比

| 功能点 | Java 版本 | JavaScript 版本 | 状态 |
|--------|----------|----------------|------|
| 基础字段设置 | ✅ | ✅ | 完全一致 |
| 字符串类型处理 | ✅ | ✅ | 完全一致 |
| 时间类型处理 | ✅ | ✅ | 完全一致 |
| 数字类型处理 | ✅ | ✅ | 完全一致 |
| 字段属性设置 | ✅ | ✅ | 完全一致 |
| 字段名特殊处理 | ✅ | ✅ | 完全一致 |
| 类型推断逻辑 | BigDecimal/Integer/Long | Number (带类型标识) | 适配 JS |

## 优化效果

### 1. 类型识别更精准
- 自动识别浮点型、整型、长整型
- 生成的代码注释更准确
- 前端组件选择更合理

### 2. 代码生成更智能
- 根据数据类型自动选择合适的表单控件
- 根据字段名自动设置查询方式
- 减少手动调整的工作量

### 3. 与 Java 版本保持一致
- 相同的业务逻辑
- 相同的处理规则
- 便于维护和理解

## 测试建议

### 测试用例 1: 各种数字类型
```sql
CREATE TABLE test_number (
  id bigint(20) PRIMARY KEY,           -- TYPE_LONG
  age tinyint(3),                      -- TYPE_INTEGER
  amount decimal(10,2),                -- TYPE_BIGDECIMAL
  count int(11),                       -- TYPE_LONG
  score int(3)                         -- TYPE_INTEGER
);
```

### 测试用例 2: 特殊字段名
```sql
CREATE TABLE test_special (
  user_name varchar(50),               -- queryType = LIKE
  user_status char(1),                 -- htmlType = radio
  user_type varchar(10),               -- htmlType = select
  user_image varchar(200),             -- htmlType = imageUpload
  content text                         -- htmlType = editor
);
```

## 注意事项

1. **JavaScript 类型系统**
   - JS 只有 Number 类型，但通过常量区分语义
   - 在代码注释和文档中体现类型差异
   - 生成的代码可读性更好

2. **数据库兼容性**
   - 支持 MySQL、MariaDB 等常见数据库
   - 类型名称不区分大小写
   - 自动处理各种类型定义格式

3. **边界情况处理**
   - 空值检查
   - 数组长度验证
   - 默认值设置

---

**版本**: 1.1.0  
**更新时间**: 2024-11-22  
**参照**: RuoYi-Vue GenUtils.java
