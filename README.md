## @ostore/db 基于 fs 的本地数据库

### 安装
```
npm i @ostore/db
```

### 创建
`@ostore/db` 默认会以 `node` 命令运行的根目录作为数据库的根目录，在根目录下根据 `model` 创建对应文档集。如下所示，会在根目录下创建 `${base}/data/demo/` 目录。

```js
const DB = require('@ostore/db');
// 创建数据库文档集
const db = new DB({ model: 'demo' });
```

如果需要指定数据库根目录，则需设置 `base` 参数：

```js
const db = new DB({ model: 'demo', base: '/root' });
```
如上所示，会在 `/root` 下创建 `/root/data/demo/` 目录。

### 使用
`db` 实例提供了数据库常用的增删改查方法，如下：
  
  - db.create(data)
  - db.findOne(query, [options])
  - db.findAll(query, [options])
  - db.updateOne(target, source)
  - db.updateAll(target, source)
  - db.removeOne(query, [options])
  - db.removeAll(query)

#### 查找
`find` 函数接受两个参数，`query` 为匹配条件。`options` 为可选参数，可设置`skip?: number`、`limit?: number`、`sort?: number;` 三个属性。

`skip?: number`、`limit?: number` 用于分页操作，`sort?: number;` 以数据创建时间为基准，默认降序返回。当 `sort > 0` 时，则按照数据创建时间升序返回。

`findOne` 返回符合条件的第一条数据，`findAll` 返回符合条件的所有数据。

#### 更新
`update` 函数接受两个参数，`target` 为数据最终要修改的值。`source` 为数据匹配项。

`updateOne` 更新符合条件的第一条数据，`updateAll` 更新符合条件的所有数据。

### 删除
`removeOne` 接受两个参数，`query` 为匹配条件。`options` 为可选参数，可设置`skip?: number`、`limit?: number`、`sort?: number;` 三个属性。

`removeOne` 删除符合条件的第一条数据，`removeAll` 删除符合条件的所有数据。

删除函数并未将数据文件删除，只是将 `_$status` 标识状态改为 `0`。

### 示例
```js
const Koa = require('koa');
const Router = require('@koa/router');

const DB = require('@ostore/db');
// 使用 model 创建数据库文档集
const db = new DB({ model: 'demo' });

const app = new Koa();
const router = new Router();

router.get('/create', async (ctx) => {
  const query = ctx.query;
  const result = await db.create(query);
  ctx.body = query;
})

router.get('/list', async (ctx) => {
  const query = ctx.query;
  const result = await db.findAll({ name: query.name });
  ctx.body = result;
})

router.get('/update', async (ctx) => {
  const query = ctx.query;
  console.log('update query: ', query)
  const result = await db.updateOne(query, { _$id: query._$id });
  ctx.body = result;
})
router.get('/updateAll', async (ctx) => {
  const query = ctx.query;
  console.log('update query: ', query)
  const result = await db.updateAll(query, { name: query.name });
  ctx.body = result;
})
router.get('/remove', async (ctx) => {
  const query = ctx.query;
  console.log('update query: ', query)
  const result = await db.removeOne({ _$id: query._$id });
  ctx.body = result;
})
router.get('/removeAll', async (ctx) => {
  const query = ctx.query;
  console.log('update query: ', query)
  const result = await db.removeAll({ name: query.name });
  ctx.body = result;
})

app.use(router.routes()).use(router.allowedMethods());
app.listen(9999, () => console.log('app start 9999'));
```