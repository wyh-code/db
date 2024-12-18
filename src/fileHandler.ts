const fs = require('fs');

import { 
  IFileHanderProps,
  ICopyFileProps,
  ITempProps,
  IReadDatabaseProps,
  IWriteDatabaseOptionsProps,
  IWriteDatabaseResultProps
} from './type';
class Temp {
  _$status: number;
  _$id: number;
  content: any;

  constructor(props: ITempProps) {
    this._$id = props._$id || +new Date;
    this._$status = props._$id ? props._$status : 1;
    this.content = props._$id ? props.content : props;
  }
}

class FileHander {
  private model: string;
  private databasePath: string;

  constructor(props: IFileHanderProps) {
    const rootPath = props.base || process.cwd();
    this.model = props.model;
    this.databasePath = `${rootPath}/data/${this.model}/`;

    if (!this.model) {
      console.error('model 不能为空！')
    }

    // 检查文件夹是否存在
    if (!fs.existsSync(this.databasePath)) {
      // 如果不存在，则创建该文件夹
      fs.mkdirSync(this.databasePath, { recursive: true });
      console.log(`${this.databasePath} 已创建`);
    } else {
      console.log(`${this.databasePath} 已存在`);
    }
  }


  _copyFile: (source: any, target: any) => Promise<ICopyFileProps> = (source, target) => {
    return new Promise((resolve, reject) => {
      // 使用回调函数的方式
      fs.copyFile(source, target, (error: any) => {
        if (error) {
          resolve({ code: 500, error })
        } else {
          resolve({ code: 200 });
        }
      });
    })
  }

  _unlinkFile = (target: string) => {
    return new Promise((resolve, reject) => {
      // 使用回调函数的方式
      fs.unlink(target, (error: any) => {
        if (error) {
          resolve({ code: 500, error })
        } else {
          resolve({ code: 200 });
        }
      });
    })
  }

  _readDatabase: (options: IReadDatabaseProps) => Promise<ICopyFileProps>= (options: IReadDatabaseProps = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const docs: ITempProps[] = [];
        if (options._$id) {
          // console.log('_readDatabase: ', `${this.databasePath}${options._$id}.json`)
          const file = await fs.readFileSync(`${this.databasePath}${options._$id}.json`);
          const json = JSON.parse(file);
          if (json._$status) {
            docs.push(json);
          }
        } else {
          // 使用 fs.readdir 方法读取文件夹内容
          const files = await fs.readdirSync(this.databasePath);
          // console.log('files: ', files)
          for (let i = 0; i < files.length; i++) {
            const docString = await fs.readFileSync(`${this.databasePath}/${files[i]}`);
            const json = JSON.parse(docString);
            if (json._$status) {
              docs.push(json);
            }
          }
        }

        resolve({ code: 200, data: docs })
      } catch (error) {
        resolve({ code: 500, error })
      }
    });
  }

  _writeDatabase: (data: any, options?: IWriteDatabaseOptionsProps) => Promise<IWriteDatabaseResultProps> = (data: any, options: IWriteDatabaseOptionsProps = {}) => {
    return new Promise(async (resolve, reject) => {
      const doc: ITempProps = new Temp(data);
      const filename = `${this.databasePath}${doc._$id}.json`;
      const filenameCopy = `${this.databasePath}${doc._$id}_copy.json`;

      try {
        if (options.copy) {
          // 先做数据备份避免文件损坏后无法恢复
          const copyResult = await this._copyFile(filename, filenameCopy);
          if (copyResult.code !== 200) return resolve(copyResult);
        }
        fs.writeFileSync(filename, JSON.stringify(doc, null, 2));
        if (options.copy) {
          // 删除备份
          this._unlinkFile(filenameCopy);
        }
        resolve({ code: 200, doc });
      } catch (error) {
        if (options.copy) {
          // 如果失败，复原文件
          await this._copyFile(filenameCopy, filename);
          await this._unlinkFile(filenameCopy);
        }
        resolve({ code: 500, error })
      }
    });
  }
}

export default FileHander;
