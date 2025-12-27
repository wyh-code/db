# @ostore/db

基于文件系统的轻量级 NoSQL 数据库【Lightweight file-based NoSQL database】

## 特性【Features】

- 🚀 零配置，开箱即用【Zero configuration】
- 💾 JSON 文件存储【JSON file storage】
- 🔍 支持函数查询【Function-based queries】
- 📝 软删除机制【Soft delete】
- 🔒 自动备份恢复【Auto backup】
- ⚡️ 批量操作并发优化【Concurrent batch operations】
- 📦 完整 TypeScript 支持【Full TypeScript support】

## 安装【Installation】

```bash
npm install @ostore/db
```

## 快速开始【Quick Start】

```typescript
import DB from '@ostore/db';

const db = new DB({ model: 'users' });

// 创建【Create】
await db.create({ name: 'Alice', age: 25 });

// 查询【Query】
const result = await db.findMany({ age: (v) => v >= 18 });
console.log(result.data); // [{ name: 'Alice', age: 25, _$id: ... }]
```

## API 文档【API Documentation】

### 初始化【Constructor】

```typescript
new DB(config: IDBConfig)
```

| 参数【Parameter】 | 类型【Type】 | 必填【Required】 | 说明【Description】 |
|---------|------|------|------|
| `model` | string | ✅ | 模型名称【Model name】 |
| `base` | string | - | 数据根目录（默认：`process.cwd()`）【Root directory】 |

```typescript
const db = new DB({ 
  model: 'users',
  base: '/path/to/data'
});
```

---

### create()

创建文档【Create document】

```typescript
create(data: object): Promise<IWriteDatabaseResult>
```

```typescript
const result = await db.create({ 
  name: 'Bob', 
  age: 30 
});
// { code: 200, doc: { _$id, _$status, content } }
```

---

### findOne()

查询单个文档【Find one document】

```typescript
findOne(query: object, options?: IFindOptions): Promise<IFindResult>
```

**参数【Parameters】：**
- `query` - 查询条件【Query conditions】
- `options.skip` - 跳过数量【Skip count】（默认：0）
- `options.limit` - 限制数量【Limit】（默认：10000）
- `options.sort` - 排序【Sort】（1: 升序【asc】, -1: 降序【desc】）

```typescript
// 精确查询【Exact match】
await db.findOne({ name: 'Alice' });

// 按 _$id 查询【Query by _$id】
await db.findOne({ _$id: 123 });

// 函数查询【Function query】
await db.findOne({ age: (v) => v >= 18 });
```

---

### findMany()

查询所有匹配文档【Find all documents】

```typescript
findMany(query: object, options?: IFindOptions): Promise<IFindResult>
```

```typescript
// 查询所有【Find all】
await db.findMany({});

// 条件查询【Conditional query】
await db.findMany({ age: (v) => v > 20 });

// 分页查询【Pagination】
await db.findMany(
  { status: 'active' },
  { skip: 10, limit: 10, sort: -1 }
);
```

---

### updateOne()

更新单个文档【Update one document】

```typescript
updateOne(target: object, source?: object): Promise<IUpdateResult>
```

**参数【Parameters】：**
- `target` - 更新的数据【Update data】
- `source` - 查询条件（可选）【Query condition (optional)】

**⚠️ 重要【Important】：** 当 `source` 为空时，`target` 必须包含 `_$id`【When source is empty, target must include _$id】

```typescript
// 用法 1：使用 _$id【Usage 1: With _$id】
await db.updateOne({ 
  _$id: 123, 
  age: 26 
});

// 用法 2：明确 source【Usage 2: Explicit source】
await db.updateOne(
  { age: 26, email: 'new@mail.com' },  // 更新数据【Update data】
  { name: 'Alice' }                     // 查询条件【Query condition】
);

// 用法 3：按 _$id 查询【Usage 3: Query by _$id】
await db.updateOne(
  { name: 'NewName' },
  { _$id: 123 }
);
```

**❌ 错误用法【Invalid usage】：**
```typescript
// 缺少 _$id 会报错【Missing _$id will cause error】
await db.updateOne({ name: 'Alice', age: 99 });
// Error: updateOne requires _$id in target when source is not provided
```

---

### updateMany()

批量更新文档【Update multiple documents】

```typescript
updateMany(target: object, source?: object): Promise<IUpdateResult>
```

**✨ 智能过滤【Smart filtering】：** 只移除值相同的查询字段【Only removes query fields with same value】

```typescript
// 批量更新【Batch update】
await db.updateMany(
  { status: 'active' },
  { age: (v) => v >= 18 }
);

// ✅ 支持更新查询字段本身【Support updating query field itself】
await db.updateMany(
  { name: 'NewName', age: 30 },
  { name: 'OldName' }
);
// name 会被更新为 'NewName'【name will be updated to 'NewName'】
```

---

### removeOne()

删除单个文档（软删除）【Remove one document (soft delete)】

```typescript
removeOne(query: object, options?: IFindOptions): Promise<IUpdateResult>
```

```typescript
await db.removeOne({ _$id: 123 });
await db.removeOne({ name: 'Alice' });
```

---

### removeMany()

批量删除文档（软删除）【Remove multiple documents (soft delete)】

```typescript
removeMany(query: object): Promise<IUpdateResult>
```

```typescript
await db.removeMany({ status: 'inactive' });
await db.removeMany({ age: (v) => v < 18 });
```

---

## 高级用法【Advanced Usage】

### 函数查询【Function Queries】

```typescript
// 范围查询【Range query】
await db.findMany({ 
  age: (val) => val >= 18 && val <= 65 
});

// 模糊匹配【Fuzzy match】
await db.findMany({ 
  name: (val) => val.includes('Alice') 
});

// 多条件【Multiple conditions】
await db.findMany({
  age: (val) => val > 20,
  status: 'active',
  email: (val) => val.endsWith('@example.com')
});
```

### 分页和排序【Pagination & Sorting】

```typescript
// 获取第 2 页，每页 10 条【Get page 2, 10 per page】
const page2 = await db.findMany(
  {},
  { skip: 10, limit: 10, sort: -1 }
);

// 按 _$id 升序【Sort by _$id ascending】
const sorted = await db.findMany({}, { sort: 1 });
```

### 批量操作【Batch Operations】

```typescript
// ⚡️ 并发执行，性能优化【Concurrent execution, optimized】
await db.updateMany(
  { verified: true },
  { status: 'active' }
);

await db.removeMany({ 
  createdAt: (val) => val < Date.now() - 30 * 86400000 
});
```

---

## Koa 集成示例【Koa Integration】

```typescript
import Koa from 'koa';
import Router from '@koa/router';
import DB from '@ostore/db';

const app = new Koa();
const router = new Router();
const db = new DB({ model: 'users' });

// 错误处理【Error handling】
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: err.message };
  }
});

// 创建【Create】
router.post('/users', async (ctx) => {
  const result = await db.create(ctx.request.body);
  ctx.body = result;
});

// 查询【Query】
router.get('/users', async (ctx) => {
  const { name } = ctx.query;
  const result = await db.findMany({ name });
  ctx.body = result;
});

// 更新【Update】
router.put('/users/:id', async (ctx) => {
  const result = await db.updateOne(
    ctx.request.body,
    { _$id: +ctx.params.id }
  );
  ctx.body = result;
});

// 删除【Delete】
router.delete('/users/:id', async (ctx) => {
  const result = await db.removeOne({ _$id: +ctx.params.id });
  ctx.body = result;
});

app.use(router.routes());
app.listen(3000);
```

---

## 数据结构【Data Structure】

### 存储格式【Storage Format】
```json
{
  "_$id": 1766848000000000,
  "_$status": 1,
  "content": {
    "name": "Alice",
    "age": 25,
    "email": "alice@example.com"
  }
}
```

| 字段【Field】 | 说明【Description】 |
|-------|------|
| `_$id` | 唯一标识（微秒级时间戳）【Unique ID (microsecond timestamp)】 |
| `_$status` | 状态（1=正常，0=已删除）【Status (1=active, 0=deleted)】 |
| `content` | 实际数据【Actual data】 |

### 文件存储【File Storage】
```
project/
└── data/
    └── users/
        ├── 1766848000000000.json
        └── 1766848000000001.json
```

---

## 性能特性【Performance】

| 特性【Feature】 | 说明【Description】 |
|---------|------|
| **批量操作并发** | 使用 `Promise.allSettled` 并发执行【Concurrent with Promise.allSettled】 |
| **单次排序** | 避免重复排序，性能提升 50%【Avoid duplicate sorting, 50% faster】 |
| **自动备份** | 更新时自动创建备份，失败时恢复【Auto backup on update, restore on failure】 |
| **软删除** | 标记删除，不删除文件【Mark as deleted, keep files】 |

### 性能数据【Performance Metrics】
- 批量更新 100 个文档：~300ms（优化前 ~3s）【Batch update 100 docs: ~300ms (was ~3s)】
- 单个文档查询：< 10ms【Single doc query: < 10ms】
- 分页查询 1000 条：~50ms【Paginated query 1000 docs: ~50ms】

---

## 类型定义【Type Definitions】

```typescript
interface IDBConfig {
  base?: string;
  model: string;
}

interface IFindOptions {
  skip?: number;
  limit?: number;
  sort?: number;  // 1: 升序【asc】, -1: 降序【desc】
}

interface IFindResult {
  code: 200 | 500;
  data?: any[];
  count: number;
  error?: any;
}

interface IUpdateResult {
  code: 200 | 500;
  status?: boolean;
  errlist?: any[];
  doc?: any;
  error?: any;
}
```

---

## 注意事项【Important Notes】

### 1. **线程安全【Thread Safety】**
不支持多进程并发写入【Not thread-safe, single process recommended】

### 2. **数据规模【Data Scale】**
适用于中小型数据集（< 10000 条）【Suitable for small to medium datasets (< 10k docs)】

### 3. **软删除【Soft Delete】**
删除操作仅标记 `_$status=0`，文件仍保留【Delete only marks _$status=0, files remain】

### 4. **updateOne 限制【updateOne Restriction】**
当 `source` 为空时，`target` 必须包含 `_$id`【When source is empty, target must include _$id】

### 5. **查询性能【Query Performance】**
函数查询需遍历所有文档，大数据集时性能较低【Function queries iterate all docs, slow for large datasets】

---

## 最佳实践【Best Practices】

### ✅ 推荐【Recommended】

```typescript
// 使用 _$id 更新【Update with _$id】
await db.updateOne({ _$id: 123, age: 26 });

// 明确查询条件【Explicit query condition】
await db.updateOne({ age: 26 }, { name: 'Alice' });

// 批量操作用函数查询【Function query for batch ops】
await db.updateMany({ status: 'active' }, { 
  age: (v) => v >= 18 
});
```

### ❌ 避免【Avoid】

```typescript
// 不要：source 为空且无 _$id【Don't: empty source without _$id】
await db.updateOne({ name: 'Alice', age: 26 });

// 不要：在大数据集上使用复杂函数查询【Don't: complex function queries on large datasets】
await db.findMany({ 
  field: (v) => someExpensiveOperation(v) 
});
```

---

## 错误处理【Error Handling】

```typescript
const result = await db.updateOne({ _$id: 123, age: 26 });

if (result.code === 200) {
  console.log('✅ 更新成功【Update success】');
} else {
  console.error('❌ 更新失败【Update failed】:', result.error);
}
```

---

## 示例项目【Example Project】

```
project/
├── src/
│   └── index.ts
├── data/              # 自动创建【Auto created】
│   └── users/
│       └── *.json
├── package.json
└── tsconfig.json
```

```json
// package.json
{
  "dependencies": {
    "@ostore/db": "^1.0.0"
  },
  "scripts": {
    "start": "ts-node src/index.ts"
  }
}
```

---

## License

MIT
