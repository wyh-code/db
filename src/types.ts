export interface ICopyFileResult {
  code: 200 | 500;
  data?: IDocument[];
  error?: any;
}

export interface IReadDatabaseOptions {
  _$id?: number;
  [key: string]: any;
}

export interface IDocumentData {
  _$id: number;
  [key: string]: any;
}

export interface IFindResult {
  code: 200 | 500;
  data?: IDocumentData[];
  count: number;
  error?: any;
}

export interface IWriteDatabaseResult {
  code: 200 | 500;
  error?: any;
  doc?: IDocument;
}

export interface IWriteDatabaseOptions {
  copy?: boolean;
}

export interface IDocument {
  _$status: number;
  _$id: number;
  content: any;
}

export interface IDBConfig {
  base?: string;
  model: string;
}

export interface IQueryParams {
  [key: string]: any;
}

export interface IFindOptions {
  skip?: number;
  limit?: number;
  sort?: number;
}

export interface IUpdateResult {
  code: 200 | 500;
  status?: boolean;
  errlist?: any[];
  doc?: IDocument;
  error?: any;
}

// 内部查询结果类型（未扁平化）
export interface IInternalFindResult {
  code: 200 | 500;
  data: IDocument[];
  count: number;
  error?: any;
}

// ==================== 常量定义 ====================

// 顶层字段（不在 content 中）
export const TOP_LEVEL_FIELDS = ['_$id', '_$status'] as const;