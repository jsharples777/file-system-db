import { Configurable } from "./Configurable";
import { DBConfig, IndexConfig, IndexVersion } from "./Types";
export declare class IndexManager implements Configurable {
    private static _instance;
    static getInstance(): IndexManager;
    private config;
    private indexVersions;
    private constructor();
    private setupIndex;
    protected getFieldValue(entry: any, field: string): any | undefined;
    protected getIndexConfig(name: string): IndexConfig | null;
    protected getIndexConfigByCollection(name: string): IndexConfig | null;
    protected rebuildIndex(version: IndexVersion): void;
    loadConfig(config: DBConfig): void;
    entryInserted(collection: string, keyValue: string, version: number, values: any): void;
    entryUpdated(collection: string, keyValue: string, version: number, values: any): void;
    entryDeleted(collection: string, keyValue: string, version: number): void;
}
