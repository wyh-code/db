declare class FileHander {
    private model;
    private databasePath;
    constructor(props: IFileHanderProps);
    _copyFile: (source: any, target: any) => Promise<ICopyFileProps>;
    _unlinkFile: (target: string) => Promise<unknown>;
    _readDatabase: (options: IReadDatabaseProps) => Promise<ICopyFileProps>;
    _writeDatabase: (data: any, options?: IWriteDatabaseOptionsProps) => Promise<IWriteDatabaseResultProps>;
}
export default FileHander;
