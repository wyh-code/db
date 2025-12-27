// db.test.ts
import { DB } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

// ==================== 测试配置 ====================
const TEST_BASE_PATH = path.join(__dirname, 'test_data');
const TEST_MODEL = 'test_users';

describe('@ostore/db 测试套件', () => {
  let db: DB;

  // ==================== 生命周期钩子 ====================

  beforeAll(() => {
    // 初始化测试数据库
    db = new DB({ base: TEST_BASE_PATH, model: TEST_MODEL });
  });

  beforeEach(async () => {
    // 每个测试前清空数据
    await cleanDatabase();
  });

  afterAll(async () => {
    // 所有测试完成后删除测试目录
    await removeTestDirectory();
  });

  // ==================== 辅助函数 ====================

  /**
   * 清空数据库
   */
  async function cleanDatabase() {
    const dbPath = path.join(TEST_BASE_PATH, 'data', TEST_MODEL);
    if (fs.existsSync(dbPath)) {
      const files = fs.readdirSync(dbPath);
      files.forEach(file => {
        fs.unlinkSync(path.join(dbPath, file));
      });
    }
  }

  /**
   * 删除测试目录
   */
  async function removeTestDirectory() {
    if (fs.existsSync(TEST_BASE_PATH)) {
      fs.rmSync(TEST_BASE_PATH, { recursive: true, force: true });
    }
  }

  /**
   * 创建测试数据
   */
  async function createTestUsers() {
    const users = [
      { name: 'Alice', age: 25, email: 'alice@test.com' },
      { name: 'Bob', age: 30, email: 'bob@test.com' },
      { name: 'Charlie', age: 35, email: 'charlie@test.com' },
      { name: 'David', age: 20, email: 'david@test.com' },
      { name: 'Eve', age: 28, email: 'eve@test.com' }
    ];

    const results = [];
    for (const user of users) {
      const result = await db.create(user);
      results.push(result);
    }
    return results;
  }

  // ==================== create() 测试 ====================

  describe('create() - 创建文档', () => {
    test('应该成功创建文档', async () => {
      const data = { name: 'Test User', age: 25 };
      const result = await db.create(data);

      expect(result.code).toBe(200);
      expect(result.doc).toBeDefined();
      expect(result.doc?._$id).toBeDefined();
      expect(result.doc?._$status).toBe(1);
      expect(result.doc?.content).toMatchObject(data);
    });

    test('应该为每个文档生成唯一的 _$id', async () => {
      const result1 = await db.create({ name: 'User1' });
      const result2 = await db.create({ name: 'User2' });

      expect(result1.doc?._$id).not.toBe(result2.doc?._$id);
    });

    test('应该正确保存复杂对象', async () => {
      const complexData = {
        name: 'Complex User',
        profile: {
          address: { city: 'Shanghai', country: 'China' },
          hobbies: ['reading', 'coding']
        },
        scores: [90, 85, 95]
      };

      const result = await db.create(complexData);

      expect(result.code).toBe(200);
      expect(result.doc?.content).toEqual(complexData);
    });
  });

  // ==================== findOne() 测试 ====================

  describe('findOne() - 查询单个文档', () => {
    beforeEach(async () => {
      await createTestUsers();
    });

    test('应该根据精确条件查找到文档', async () => {
      const result = await db.findOne({ name: 'Alice' });

      expect(result.code).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].name).toBe('Alice');
      expect(result.data?.[0].age).toBe(25);
    });

    test('应该返回包含 _$id 的文档', async () => {
      const result = await db.findOne({ name: 'Bob' });

      expect(result.data?.[0]._$id).toBeDefined();
      expect(typeof result.data?.[0]._$id).toBe('number');
    });

    test('查询不存在的文档应返回空数组', async () => {
      const result = await db.findOne({ name: 'NonExistent' });

      expect(result.code).toBe(200);
      expect(result.data).toHaveLength(0);
    });

    test('应该支持函数查询', async () => {
      const result = await db.findOne({
        age: (val: number) => val >= 30
      });

      expect(result.code).toBe(200);
      expect(result.data?.[0].age).toBeGreaterThanOrEqual(30);
    });

    test('应该支持多条件查询', async () => {
      const result = await db.findOne({
        name: 'Alice',
        age: 25
      });

      expect(result.code).toBe(200);
      expect(result.data?.[0].name).toBe('Alice');
      expect(result.data?.[0].age).toBe(25);
    });
  });

  // ==================== findMany() 测试 ====================

  describe('findMany() - 查询所有文档', () => {
    beforeEach(async () => {
      await createTestUsers();
    });

    test('应该查询所有文档', async () => {
      const result = await db.findMany({});

      expect(result.code).toBe(200);
      expect(result.data).toHaveLength(5);
      expect(result.count).toBe(5);
    });

    test('应该支持条件过滤', async () => {
      const result = await db.findMany({
        age: (val: number) => val >= 30
      });

      expect(result.code).toBe(200);
      expect(result.data!.length).toBeGreaterThan(0);
      result.data!.forEach(user => {
        expect(user.age).toBeGreaterThanOrEqual(30);
      });
    });

    test('应该支持分页 - skip', async () => {
      const result = await db.findMany({}, { skip: 2, limit: 10 });

      expect(result.code).toBe(200);
      expect(result.data).toHaveLength(3);
      expect(result.count).toBe(5); // 总数应该是 5
    });

    test('应该支持分页 - limit', async () => {
      const result = await db.findMany({}, { skip: 0, limit: 3 });

      expect(result.code).toBe(200);
      expect(result.data).toHaveLength(3);
      expect(result.count).toBe(5);
    });

    test('应该支持排序 - 升序', async () => {
      const result = await db.findMany({}, { sort: 1 });

      expect(result.code).toBe(200);
      const ids = result.data!.map(u => u._$id);
      const sortedIds = [...ids].sort((a, b) => a - b);
      expect(ids).toEqual(sortedIds);
    });

    test('应该支持排序 - 降序', async () => {
      const result = await db.findMany({}, { sort: -1 });

      expect(result.code).toBe(200);
      const ids = result.data!.map(u => u._$id);
      const sortedIds = [...ids].sort((a, b) => b - a);
      expect(ids).toEqual(sortedIds);
    });

    test('应该支持组合查询（条件+分页+排序）', async () => {
      const result = await db.findMany(
        { age: (val: number) => val >= 25 },
        { skip: 1, limit: 2, sort: 1 }
      );

      expect(result.code).toBe(200);
      expect(result.data!.length).toBeLessThanOrEqual(2);
      result.data!.forEach(user => {
        expect(user.age).toBeGreaterThanOrEqual(25);
      });
    });
  });

  // ==================== updateOne() 测试 ====================

  describe('updateOne() - 更新单个文档', () => {
    let testUser: any;

    beforeEach(async () => {
      const users = await createTestUsers();
      testUser = users[0].doc;
    });

    test('应该根据 _$id 更新文档', async () => {
      const result = await db.updateOne(
        { age: 26 },
        { _$id: testUser._$id }
      );

      expect(result.code).toBe(200);

      const updated = await db.findOne({ _$id: testUser._$id });
      expect(updated.data?.[0].age).toBe(26);
      expect(updated.data?.[0].name).toBe('Alice'); // 其他字段保持不变
    });

    test('应该根据查询条件更新文档', async () => {
      const result = await db.updateOne(
        { age: 31 },
        { name: 'Bob' }
      );

      expect(result.code).toBe(200);

      const updated = await db.findOne({ name: 'Bob' });
      expect(updated.data?.[0].age).toBe(31);
    });

    test('应该支持更新多个字段', async () => {
      const result = await db.updateOne(
        { age: 26, email: 'newalice@test.com' },
        { name: 'Alice' }
      );

      expect(result.code).toBe(200);

      const updated = await db.findOne({ name: 'Alice' });
      expect(updated.data?.[0].age).toBe(26);
      expect(updated.data?.[0].email).toBe('newalice@test.com');
    });

    test('更新不存在的文档应返回错误', async () => {
      const result = await db.updateOne(
        { age: 99 },
        { name: 'NonExistent' }
      );

      expect(result.code).toBe(500);
      expect(result.error).toBe('Document not found');
    });

    test('应该不修改原始参数对象', async () => {
      const updateData = { _$id: testUser._$id, age: 26 };
      const originalId = updateData._$id;

      await db.updateOne(updateData, { _$id: testUser._$id });

      expect(updateData._$id).toBe(originalId); // 参数未被污染
    });

    test('source 为空时应使用 target 作为查询条件', async () => {
      // ✅ 修改：使用 _$id 作为查询条件
      const result = await db.updateOne({
        _$id: testUser._$id,  // 添加 _$id
        age: 99
      });

      expect(result.code).toBe(200);

      const updated = await db.findOne({ name: 'Alice' });
      expect(updated.data?.[0].age).toBe(99);
    });
  });

  // ==================== updateMany() 测试 ====================

  describe('updateMany() - 批量更新文档', () => {
    beforeEach(async () => {
      await createTestUsers();
    });

    test('应该批量更新符合条件的所有文档', async () => {
      const result = await db.updateMany(
        { status: 'senior' },
        { age: (val: number) => val >= 30 }
      );

      expect(result.code).toBe(200);
      expect(result.status).toBe(true);

      const updated = await db.findMany({
        age: (val: number) => val >= 30
      });

      updated.data!.forEach(user => {
        expect(user.status).toBe('senior');
      });
    });

    test('应该从更新数据中移除查询字段', async () => {
      const result = await db.updateMany(
        { name: 'Alice', age: 100 },
        { name: 'Alice' }
      );

      expect(result.code).toBe(200);

      const updated = await db.findOne({ name: 'Alice' });
      expect(updated.data?.[0].age).toBe(100);
      expect(updated.data?.[0].name).toBe('Alice'); // name 仍为原值
    });

    test('应该不修改原始参数对象', async () => {
      const updateData = { name: 'Alice', age: 100 };
      const queryData = { name: 'Alice' };

      await db.updateMany(updateData, queryData);

      expect(updateData.name).toBe('Alice'); // 未被删除
      expect(queryData.name).toBe('Alice');
    });

    test('更新不存在的文档应返回错误', async () => {
      const result = await db.updateMany(
        { age: 99 },
        { name: 'NonExistent' }
      );

      expect(result.code).toBe(500);
      expect(result.error).toBe('No documents found');
    });

    test('批量更新失败时应记录错误列表', async () => {
      // 模拟部分失败的场景需要 mock fs 操作
      // 这里先跳过，实际项目中可使用 jest.spyOn
    });
  });

  // ==================== removeOne() 测试 ====================

  describe('removeOne() - 删除单个文档', () => {
    let testUser: any;

    beforeEach(async () => {
      const users = await createTestUsers();
      testUser = users[0].doc;
    });

    test('应该根据 _$id 软删除文档', async () => {
      const result = await db.removeOne({ _$id: testUser._$id });

      expect(result.code).toBe(200);

      // 删除后查询不到
      const found = await db.findOne({ _$id: testUser._$id });
      expect(found.data).toHaveLength(0);
    });

    test('应该根据查询条件软删除文档', async () => {
      const result = await db.removeOne({ name: 'Bob' });

      expect(result.code).toBe(200);

      const found = await db.findOne({ name: 'Bob' });
      expect(found.data).toHaveLength(0);
    });

    test('删除不存在的文档应返回错误', async () => {
      const result = await db.removeOne({ name: 'NonExistent' });

      expect(result.code).toBe(500);
      expect(result.error).toBe('Document not found');
    });

    test('应该不修改原始参数对象', async () => {
      const queryData = { _$id: testUser._$id };
      const originalId = queryData._$id;

      await db.removeOne(queryData);

      expect(queryData._$id).toBe(originalId); // 参数未被污染
    });

    test('软删除后文件仍然存在', async () => {
      await db.removeOne({ _$id: testUser._$id });

      const dbPath = path.join(TEST_BASE_PATH, 'data', TEST_MODEL);
      const filePath = path.join(dbPath, `${testUser._$id}.json`);

      expect(fs.existsSync(filePath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(content._$status).toBe(0);
    });
  });

  // ==================== removeMany() 测试 ====================

  describe('removeMany() - 批量删除文档', () => {
    beforeEach(async () => {
      await createTestUsers();
    });

    test('应该批量软删除符合条件的文档', async () => {
      const result = await db.removeMany({
        age: (val: number) => val < 30
      });

      expect(result.code).toBe(200);
      expect(result.status).toBe(true);

      const remaining = await db.findMany({});
      remaining.data!.forEach(user => {
        expect(user.age).toBeGreaterThanOrEqual(30);
      });
    });

    test('应该删除所有文档', async () => {
      const result = await db.removeMany({});

      expect(result.code).toBe(200);

      const remaining = await db.findMany({});
      expect(remaining.data).toHaveLength(0);
    });

    test('删除不存在的文档应返回错误', async () => {
      const result = await db.removeMany({ name: 'NonExistent' });

      expect(result.code).toBe(500);
      expect(result.error).toBe('No documents found');
    });
  });

  // ==================== 边界情况测试 ====================

  describe('边界情况测试', () => {
    test('空数据库查询应返回空数组', async () => {
      const result = await db.findMany({});

      expect(result.code).toBe(200);
      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    test('查询条件为空对象应返回所有文档', async () => {
      await createTestUsers();
      const result = await db.findMany({});

      expect(result.data).toHaveLength(5);
    });

    test('分页参数为 0 应正常工作', async () => {
      await createTestUsers();
      const result = await db.findMany({}, { skip: 0, limit: 0 });

      expect(result.code).toBe(200);
    });

    test('skip 超过总数应返回空数组', async () => {
      await createTestUsers();
      const result = await db.findMany({}, { skip: 100 });

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(5);
    });

    test('limit 超过总数应返回所有剩余文档', async () => {
      await createTestUsers();
      const result = await db.findMany({}, { skip: 3, limit: 100 });

      expect(result.data).toHaveLength(2);
    });
  });

  // ==================== 数据完整性测试 ====================

  describe('数据完整性测试', () => {
    test('更新后原始数据字段应保留', async () => {
      const original = await db.create({
        name: 'Test',
        age: 25,
        email: 'test@test.com'
      });

      await db.updateOne(
        { age: 26 },
        { _$id: original.doc!._$id }
      );

      const updated = await db.findOne({ _$id: original.doc!._$id });
      expect(updated.data?.[0].name).toBe('Test');
      expect(updated.data?.[0].email).toBe('test@test.com');
    });

    test('多次更新应累积生效', async () => {
      const created = await db.create({ name: 'Test', age: 25 });
      const id = created.doc!._$id;

      await db.updateOne({ age: 26 }, { _$id: id });
      await db.updateOne({ email: 'test@test.com' }, { _$id: id });
      await db.updateOne({ age: 27 }, { _$id: id });

      const final = await db.findOne({ _$id: id });
      expect(final.data?.[0].age).toBe(27);
      expect(final.data?.[0].email).toBe('test@test.com');
    });
  });

  // ==================== 复杂查询测试 ====================

  describe('复杂查询测试', () => {
    beforeEach(async () => {
      await db.create({ name: 'Alice', age: 25, city: 'Beijing' });
      await db.create({ name: 'Bob', age: 30, city: 'Shanghai' });
      await db.create({ name: 'Charlie', age: 35, city: 'Beijing' });
    });

    test('应该支持多字段组合查询', async () => {
      const result = await db.findMany({
        city: 'Beijing',
        age: (val: number) => val >= 25
      });

      expect(result.data).toHaveLength(2);
    });

    test('应该支持字符串匹配函数', async () => {
      const result = await db.findMany({
        name: (val: string) => val.startsWith('C')
      });

      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].name).toBe('Charlie');
    });

    test('应该支持复杂逻辑判断', async () => {
      const result = await db.findMany({
        age: (val: number) => val > 25 && val < 35
      });

      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].name).toBe('Bob');
    });
  });
});