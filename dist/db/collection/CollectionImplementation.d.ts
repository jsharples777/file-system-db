import { Collection } from "./Collection";
import { CollectionConfig, OperationResult } from "../Types";
import { SearchFilter } from "../search/SearchTypes";
export declare class CollectionImplementation implements Collection {
    private config;
    private buffer;
    constructor(config: CollectionConfig);
    findByKey(key: string): any;
    getVersion(): number;
    getName(): string;
    find(): any[];
    insertObject(key: string, object: any): OperationResult;
    removeObject(key: string): OperationResult;
    updateObject(key: string, object: any): OperationResult;
    findBy(search: SearchFilter): any[];
    upsertObject(key: string, object: any): OperationResult;
}
