export interface ICopyFileProps {
  code: 200 | 500;
  data?: ITempProps[];
  error?: any;
}

export interface IReadDatabaseProps {
  _$id?: number;
  [key: string]: any;
}

export interface IFindResultProps {
  code: 200 | 500;
  data?: ITempProps[];
  count: number;
  error?: any;
}

export interface IWriteDatabaseResultProps { 
  code: 200 | 500;
  error?: any; 
  doc?: ITempProps;
}

export interface IWriteDatabaseOptionsProps {
  copy?: boolean;
}

export interface ITempProps {
  _$status: number;
  _$id: number;
  content: any;
}

export interface IFileHanderProps {
  base?: string;
  model: string;
}

export interface IDataProps {
  [key: string]: any;
}

export interface IFindOptionsProps {
  skip?: number;
  limit?: number; 
  sort?: number;
}
