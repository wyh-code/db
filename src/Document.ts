import { IDocument } from './types';

export class Document implements IDocument {
  _$status: number;
  _$id: number;
  content: any;

  constructor(data: IDocument | any, isExisting: boolean = false) {
    if (isExisting) {
      // 从数据库读取的完整文档
      this._$id = data._$id;
      this._$status = data._$status;
      this.content = data.content;
    } else {
      // 新建文档
      this._$id = Number(process.hrtime.bigint() / 1000n);
      this._$status = 1;
      this.content = data;
    }
  }
}