import { FileHandler } from './FileHandler';
import {
  IDBConfig,
  IQueryParams,
  IDocument,
  IFindOptions,
  ICopyFileResult,
  IWriteDatabaseResult,
  IInternalFindResult,
  IFindResult,
  IUpdateResult,
  TOP_LEVEL_FIELDS
} from './types';

export class DB extends FileHandler {
  private _id: number;

  constructor(config: IDBConfig) {
    super(config);
    this._id = Date.now();
  }

  /**
   * 创建文档
   */
  public async create(data: IQueryParams): Promise<IWriteDatabaseResult> {
    return this.writeDatabase(data);
  }

  /**
   * 内部查询方法（返回未扁平化的 IDocument[]）
   */
  private async _findInternal(
    params: IQueryParams,
    options: IFindOptions = {}
  ): Promise<IInternalFindResult> {
    const { skip = 0, limit = 10000, sort = -1 } = options;

    // 过滤 undefined 值，构建查询条件
    const query = this.buildQuery(params);

    // 读取数据库
    const result = await this.readDatabase(query);
    if (result.code !== 200) {
      return { code: 500, data: [], count: 0, error: result.error };
    }

    let docs = result.data || [];

    // 如果有查询条件，进行过滤
    if (Object.keys(query).length > 0) {
      docs = docs.filter((item: IDocument) =>
        Object.keys(query).every((key) => {
          const queryValue = query[key];
          const itemValue = this.getDocumentFieldValue(item, key);

          // 支持函数查询
          if (typeof queryValue === 'function') {
            return queryValue(itemValue);
          }

          // 精确匹配
          return queryValue === itemValue;
        })
      );
    }

    // 排序
    const sortedDocs = this.sortDocuments(docs, sort);

    // 分页（不再重复排序）
    const paginatedDocs = sortedDocs.slice(skip, skip + limit);

    return {
      code: 200,
      data: paginatedDocs,
      count: docs.length
    };
  }

  /**
   * 查询文档（公开方法，保持向后兼容）
   */
  public async find(
    params: IQueryParams,
    options: IFindOptions = {}
  ): Promise<ICopyFileResult | IFindResult> {
    const result = await this._findInternal(params, options);
    return result as ICopyFileResult;
  }

  /**
   * 查询单个文档
   */
  public async findOne(
    query: IQueryParams,
    options: IFindOptions = {}
  ): Promise<IFindResult> {
    const result = await this._findInternal(query, options);
    if (result.code !== 200) return { ...result, data: [] };

    const firstDoc = result.data[0];
    const data = firstDoc ? { ...firstDoc.content, _$id: firstDoc._$id } : null;

    return {
      code: 200,
      data: data ? [data] : [],
      count: result.count
    };
  }

  /**
   * 查询所有文档
   */
  public async findMany(
    query: IQueryParams,
    options: IFindOptions = {}
  ): Promise<IFindResult> {
    const result = await this._findInternal(query, options);
    if (result.code !== 200) return { ...result, data: [] };

    const data = result.data.map((item: IDocument) => ({
      ...item.content,
      _$id: item._$id
    }));

    return {
      code: 200,
      data,
      count: result.count
    };
  }

  /**
   * 更新单个文档
   * @param target - 更新的数据
   * @param source - 查询条件（可选，默认使用 target）
   */
  public async updateOne(
    target: IQueryParams,
    source?: IQueryParams
  ): Promise<IUpdateResult> {
    // 深拷贝避免修改原对象
    const updateData = { ...target };
    let queryCondition: IQueryParams;
    
    // 确定查询条件
    if (source) {
      queryCondition = { ...source };
    } else {
      // 当 source 为空时，必须包含 _$id
      if (!target._$id) {
        return { 
          code: 500, 
          error: 'updateOne requires _$id in target when source is not provided' 
        };
      }
      queryCondition = { _$id: target._$id };
      delete updateData._$id;
    }

    // 查询文档
    let result: IInternalFindResult;
    if (queryCondition._$id) {
      const readResult = await this.readDatabase({ _$id: queryCondition._$id });
      result = {
        code: readResult.code,
        data: readResult.data || [],
        count: readResult.data?.length || 0,
        error: readResult.error
      };
    } else {
      result = await this._findInternal(queryCondition, {});
    }

    if (result.code !== 200) return { code: 500, error: result.error };

    const item = result.data[0];
    if (!item) {
      return { code: 500, error: 'Document not found' };
    }

    // 合并更新内容
    item.content = { ...item.content, ...updateData };

    return this.writeDatabase(item, { copy: true });
  }

  /**
   * 批量更新文档
   * @param target - 更新的数据
   * @param source - 查询条件（可选，默认使用 target）
   */
  public async updateMany(
    target: IQueryParams,
    source?: IQueryParams
  ): Promise<IUpdateResult> {
    // 深拷贝避免修改原对象
    const updateData = { ...target };
    const queryCondition = source || { ...target };

    // 智能过滤：只删除值相同的查询字段
    if (source) {
      Object.keys(source).forEach(key => {
        if (updateData[key] === source[key]) {
          delete updateData[key];
        }
      });
    }

    const result = await this._findInternal(queryCondition, {});
    if (result.code !== 200) return { code: 500, error: result.error };

    if (result.data.length === 0) {
      return { code: 500, error: 'No documents found' };
    }

    // 准备批量更新数据
    const updatedDocs = result.data.map((item: IDocument) => ({
      ...item,
      content: { ...item.content, ...updateData }
    }));

    // 并发批量更新
    const batchResult = await this.writeDatabaseBatch(updatedDocs, { copy: true });

    return {
      code: 200,
      status: batchResult.errorList.length === 0,
      errlist: batchResult.errorList
    };
  }

  /**
   * 删除单个文档（软删除）
   */
  public async removeOne(
    query: IQueryParams,
    options: IFindOptions = {}
  ): Promise<IUpdateResult> {
    // 深拷贝避免修改原对象
    const queryCondition = { ...query };

    // 查询文档
    let result: IInternalFindResult;
    if (queryCondition._$id) {
      const readResult = await this.readDatabase({ _$id: queryCondition._$id });
      result = {
        code: readResult.code,
        data: readResult.data || [],
        count: readResult.data?.length || 0,
        error: readResult.error
      };
    } else {
      result = await this._findInternal(queryCondition, options);
    }

    if (result.code !== 200) return { code: 500, error: result.error };

    const item = result.data[0];
    if (!item) {
      return { code: 500, error: 'Document not found' };
    }

    // 软删除：设置状态为 0
    item._$status = 0;

    return this.writeDatabase(item, { copy: true });
  }

  /**
   * 批量删除文档（软删除）
   */
  public async removeMany(query: IQueryParams): Promise<IUpdateResult> {
    const result = await this._findInternal(query);
    if (result.code !== 200) return { code: 500, error: result.error };

    if (result.data.length === 0) {
      return { code: 500, error: 'No documents found' };
    }

    // 准备批量删除数据
    const deletedDocs = result.data.map((item: IDocument) => ({
      ...item,
      _$status: 0
    }));

    // 并发批量删除
    const batchResult = await this.writeDatabaseBatch(deletedDocs, { copy: true });

    return {
      code: 200,
      status: batchResult.errorList.length === 0,
      errlist: batchResult.errorList
    };
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 获取文档字段值（兼容顶层字段和 content 字段）
   */
  private getDocumentFieldValue(doc: IDocument, key: string): any {
    // 使用常量判断顶层字段
    if (TOP_LEVEL_FIELDS.includes(key as any)) {
      return doc[key as keyof IDocument];
    }
    // 其他字段在 content 中
    return doc.content[key];
  }

  /**
   * 构建查询条件（过滤 undefined 值）
   */
  private buildQuery(params: IQueryParams): IQueryParams {
    return Object.keys(params).reduce((query: IQueryParams, key) => {
      if (params[key] !== undefined) {
        query[key] = params[key];
      }
      return query;
    }, {});
  }

  /**
   * 文档排序
   */
  private sortDocuments(docs: IDocument[], sort: number): IDocument[] {
    return [...docs].sort((a, b) =>
      sort > 0 ? a._$id - b._$id : b._$id - a._$id
    );
  }
}