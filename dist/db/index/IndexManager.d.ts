import { Configurable } from "../Configurable";
import { DBConfig, IndexConfig } from "../Types";
import { Index } from "./Index";
import { SearchItem } from "../search/SearchTypes";
export declare class IndexManager implements Configurable {
    private static _instance;
    static getInstance(): IndexManager;
    private config;
    private indexes;
    private constructor();
    getMatchingIndex(collection: string, search: SearchItem[]): Index | null;
    protected getIndexConfig(name: string): IndexConfig | null;
    loadConfig(config: DBConfig): void;
    entryInserted(collection: string, keyValue: string, version: number, values: any): void;
    entryUpdated(collection: string, keyValue: string, version: number, values: any): void;
    entryDeleted(collection: string, keyValue: string, version: number): void;
}
