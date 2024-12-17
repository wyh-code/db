interface ICopyFileProps {
  code: 200 | 500;
  data?: ITempProps[];
  error?: any;
}

interface IReadDatabaseProps {
  _$id?: number;
  [key: string]: any;
}

interface IFindResultProps {
  code: 200 | 500;
  data?: ITempProps[];
  count: number;
  error?: any;
}

interface IWriteDatabaseResultProps { 
  code: 200 | 500;
  error?: any; 
  doc?: ITempProps;
}

interface IWriteDatabaseOptionsProps {
  copy?: boolean;
}

interface ITempProps {
  _$status: number;
  _$id: number;
  content: any;
}

interface IFileHanderProps {
  base?: string;
  model: string;
  databasePath: string;
}

interface IDataProps {
  [key: string]: any;
}

interface IFindOptionsProps {
  skip?: number;
  limit?: number; 
  sort?: number;
}