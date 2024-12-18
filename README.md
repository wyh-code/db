## @ostore/db 基于 fs 的本地数据库

### 使用
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