const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const DB = require('../lib/index.cjs');

const db = new DB({ model });

const app = new Koa();
const router = new Router();

// 使用 koa-bodyparser 中间件来解析请求的body
app.use(bodyParser());

router.get('/create', async (ctx) => {
  const query = ctx.query;
  const result = await db.create(query);
  console.log('query: ', query, result);
})

router.get('/list', async (ctx) => {

})

// 使用默认根路径的路由器
app.use(router.routes()).use(router.allowedMethods());

app.listen(9999, () => console.log('app start 9999'));
