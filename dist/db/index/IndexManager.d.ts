import { Configurable } from "../config/Configurable";
import { DBConfig, IndexConfig } from "../config/Types";
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
}
