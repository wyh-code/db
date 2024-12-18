/// <reference types="./index.d.ts" />，

import FileHander from './fileHandler';

class DB extends FileHander {
  _id: number;

  constructor(props: IFileHanderProps) {
    super(props);
    this._id = +new Date;
  }

  create = (data: IDataProps) => {
    return this._writeDatabase(data);
  }

  find:(query: IDataProps, options?: IFindOptionsProps) => Promise<ICopyFileProps|IFindResultProps> = async (query: IDataProps, options: IFindOptionsProps={}) => {
    const { skip=0, limit=10000, sort=-1 } = options;
    const result = await this._readDatabase(query);
    if (result.code !== 200) return result;
    // 没有查询条件时，返回所有数据
    if (query === undefined) return result;
    const list = result.data;
    if (typeof query !== 'object') return { code: 500, error: '数据不存在！' };
    const docs = list!.filter((item: ITempProps) => Object.keys(query).every((key) => {
      // 复杂筛选使用函数判断
      if(typeof query[key] === 'function') return query[key](item.content[key]);
      // 默认判断锚定字段值是否相等
      return query[key] === item.content[key]
    })).sort((a:ITempProps, b:ITempProps) => sort > 0 ? a._$id - b._$id : b._$id - a._$id);
   
    // 分页
    const resultDocs = [];
    if(skip || limit) {
      const len = docs.length >= ((+skip) + (+limit)) ? (+limit) : (docs.length % (+limit));
      for(let i = skip; i < skip + len; i++) {
        if(docs[i]){
          resultDocs.push(docs[i])
        }
      }
    }

    // console.log('resultDocs: ', resultDocs)

    return {
      code: result.code,
      data: resultDocs,
      count: docs.length
    }
  }

  findOne = async (query: IDataProps, options: IFindOptionsProps={}) => {
    const result = await this.find(query, options);
    if (result.code !== 200) return result;
    const data = result.data![0];
    return {
      code: 200,
      data: data && { ...data.content, _$id: data._$id },
      count: (result as IFindResultProps).count
    }
  }

  findAll = async (query: IDataProps, options: IFindOptionsProps={}) => {
    const result = await this.find(query, options);
    if (result.code !== 200) return result;
    
    return {
      code: 200,
      data: result.data!.map((item: ITempProps) => ({ ...item.content, _$id: item._$id })),
      count: (result as IFindResultProps).count
    }
  }

  updateOne = async (target: IDataProps, source: IDataProps) => {
    // source 没有时，依据数据本身查找
    const options = source || target;

    let result;
    if(target._$id) {
      result = await this._readDatabase(target);
      delete target._$id;
    } else {
      result = await this.find(options, {});
    }
    if (result.code !== 200) return result;

    const item = result.data![0];
    if (!item) return { code: 500, error: '数据不存在！' };
   
    item.content = { ...item.content, ...target };
    return this._writeDatabase(item, { copy: true });
  }

  updateAll = async (target: IDataProps, source: IDataProps) => {
    // source 没有时，依据数据本身查找
    const options = source || target;

    let result = await this.find(options, {});
    if (result.code !== 200) return result;

    const newList = result.data!.map((item: ITempProps) => ({ ...item, content: { ...item.content, ...target } }))
    const errlist = [];
    for (let i = 0; i < newList.length; i++) {
      const item = await this._writeDatabase(newList[i], { copy: true });
      if (item.code !== 200) {
        errlist.push(item)
      }
    }

    return {
      code: 200,
      status: !errlist.length,
      errlist
    }
  }

  removeOne = async (query: IDataProps, options:IFindOptionsProps={}) => {
    let result;
    if(query._$id) {
      result = await this._readDatabase(query);
      delete query._$id;
    } else {
      result = await this.find(query, options);
    }
    if (result.code !== 200) return result;

    const item = result.data![0];
    if (!item) return { code: 500, error: '数据不存在！' };

    item._$status = 0;
    return this._writeDatabase(item, { copy: true });
  }

  removeAll = async (query: IDataProps) => {
    const result = await this.find(query);
    if (result.code !== 200) return result;

    const newList = result.data!.map((item: ITempProps) => ({ ...item, _$status: 0 }))
    const errlist = [];
    for (let i = 0; i < newList.length; i++) {
      const item = await this._writeDatabase(newList[i], { copy: true });
      if (item.code !== 200) {
        errlist.push(item)
      }
    }

    return {
      code: 200,
      status: !errlist.length,
      errlist
    }
  }
}



module.exports = DB
