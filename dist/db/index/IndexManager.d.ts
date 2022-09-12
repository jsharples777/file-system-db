import { Configurable } from "../config/Configurable";
import { DBConfig } from "../config/Types";
import { Index } from "./Index";
import { SearchItem } from "../search/SearchTypes";
import { DatabaseManagers } from "../DatabaseManagers";
export declare class IndexManager implements Configurable {
    private config;
    private indexes;
    private managers;
    constructor(managers: DatabaseManagers);
    getMatchingIndex(collection: string, search: SearchItem[]): Index | null;
    loadConfig(config: DBConfig): void;
}
