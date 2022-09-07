import { Configurable } from "./Configurable";
import { DBConfig } from "./Types";
import { Collection } from "./Collection";
export declare class CollectionManager implements Configurable {
    private static _instance;
    static getInstance(): CollectionManager;
    private config;
    private collectionConfigs;
    private collectionImplementations;
    private constructor();
    private setupCollection;
    loadConfig(config: DBConfig): void;
    collections(): string[];
    getCollection(name: string): Collection;
}
