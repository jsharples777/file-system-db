import { Configurable } from "../config/Configurable";
import { DBConfig } from "../config/Types";
import { Collection } from "./Collection";
import { DatabaseManagers } from "../DatabaseManagers";
export declare class CollectionManager implements Configurable {
    private config;
    private collectionConfigs;
    private collectionImplementations;
    private managers;
    constructor(managers: DatabaseManagers);
    loadConfig(config: DBConfig): void;
    collections(): string[];
    getCollection(name: string): Collection;
}
