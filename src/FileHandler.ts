import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Document } from './Document';
import {
  IDBConfig,
  ICopyFileResult,
  IReadDatabaseOptions,
  IDocument,
  IWriteDatabaseOptions,
  IWriteDatabaseResult,
} from './types';

const fsReadFile = promisify(fs.readFile);
const fsWriteFile = promisify(fs.writeFile);
const fsCopyFile = promisify(fs.copyFile);
const fsUnlink = promisify(fs.unlink);
const fsReaddir = promisify(fs.readdir);

export class FileHandler {
  protected model: string;
  protected databasePath: string;

  constructor(config: IDBConfig) {
    const rootPath = config.base || process.cwd();
    this.model = config.model;
    this.databasePath = path.join(rootPath, 'data', this.model);

    if (!this.model) {
      throw new Error('Model name is required');
    }

    this.initDatabase();
  }

  /**
   * 初始化数据库目录
   */
  private initDatabase(): void {
    if (!fs.existsSync(this.databasePath)) {
      fs.mkdirSync(this.databasePath, { recursive: true });
      console.log(`Database directory created: ${this.databasePath}`);
    }
  }

  /**
   * 复制文件
   */
  protected async copyFile(source: string, target: string): Promise<ICopyFileResult> {
    try {
      await fsCopyFile(source, target);
      return { code: 200 };
    } catch (error) {
      return { code: 500, error };
    }
  }

  /**
   * 删除文件
   */
  protected async unlinkFile(target: string): Promise<ICopyFileResult> {
    try {
      await fsUnlink(target);
      return { code: 200 };
    } catch (error) {
      return { code: 500, error };
    }
  }

  /**
   * 读取数据库文档
   */
  protected async readDatabase(options: IReadDatabaseOptions = {}): Promise<ICopyFileResult> {
    try {
      const docs: IDocument[] = [];

      // 根据 _$id 读取单个文档
      if (options._$id) {
        const filePath = path.join(this.databasePath, `${options._$id}.json`);
        if (!fs.existsSync(filePath)) {
          return { code: 200, data: [] };
        }
        
        const fileContent = await fsReadFile(filePath, 'utf-8');
        const doc = JSON.parse(fileContent);
        
        // 只返回状态正常的文档
        if (doc._$status === 1) {
          docs.push(doc);
        }
      } else {
        // 读取所有文档
        const files = await fsReaddir(this.databasePath);
        
        for (const file of files) {
          if (!file.endsWith('.json') || file.endsWith('_copy.json')) continue;
          
          const filePath = path.join(this.databasePath, file);
          const fileContent = await fsReadFile(filePath, 'utf-8');
          const doc = JSON.parse(fileContent);
          
          // 只返回状态正常的文档
          if (doc._$status === 1) {
            docs.push(doc);
          }
        }
      }

      return { code: 200, data: docs };
    } catch (error) {
      return { code: 500, error };
    }
  }

  /**
   * 写入数据库文档
   */
  protected async writeDatabase(
    data: any,
    options: IWriteDatabaseOptions = {}
  ): Promise<IWriteDatabaseResult> {
    try {
      // 判断是更新还是新建
      const isExisting = data._$id !== undefined && data._$status !== undefined;
      const doc = new Document(data, isExisting);
      
      const filename = path.join(this.databasePath, `${doc._$id}.json`);
      const filenameCopy = path.join(this.databasePath, `${doc._$id}_copy.json`);

      // 如果需要备份
      if (options.copy && fs.existsSync(filename)) {
        const copyResult = await this.copyFile(filename, filenameCopy);
        if (copyResult.code !== 200) {
          return copyResult;
        }
      }

      // 写入文件
      await fsWriteFile(filename, JSON.stringify(doc, null, 2), 'utf-8');

      // 删除备份
      if (options.copy && fs.existsSync(filenameCopy)) {
        await this.unlinkFile(filenameCopy);
      }

      return { code: 200, doc };
    } catch (error) {
      // 如果失败，恢复备份
      if (options.copy) {
        const isExisting = data._$id !== undefined && data._$status !== undefined;
        const doc = new Document(data, isExisting);
        const filename = path.join(this.databasePath, `${doc._$id}.json`);
        const filenameCopy = path.join(this.databasePath, `${doc._$id}_copy.json`);
        
        if (fs.existsSync(filenameCopy)) {
          await this.copyFile(filenameCopy, filename);
          await this.unlinkFile(filenameCopy);
        }
      }
      return { code: 500, error };
    }
  }

  /**
   * 批量写入数据库（并发优化）
   */
  protected async writeDatabaseBatch(
    dataList: any[],
    options: IWriteDatabaseOptions = {}
  ): Promise<{ successCount: number; errorList: any[] }> {
    const results = await Promise.allSettled(
      dataList.map(data => this.writeDatabase(data, options))
    );

    const errorList = results
      .filter((result, index) => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && result.value.code !== 200)
      )
      .map((result, index) => ({
        index,
        error: result.status === 'rejected' ? result.reason : result.value.error
      }));

    return {
      successCount: results.length - errorList.length,
      errorList
    };
  }
}