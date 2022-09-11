import { Collection } from "./Collection";
import { CollectionConfig, OperationResult } from "../Types";
import { SearchFilter } from "../search/SearchTypes";
import { SearchCursor } from "../cursor/SearchCursor";
import { Cursor } from "../cursor/Cursor";
export declare class CollectionImpl implements Collection {
    private config;
    private buffer;
    constructor(config: CollectionConfig);
    findByKey(key: string): any;
    getVersion(): number;
    getName(): string;
    find(): Cursor;
    insertObject(key: string, object: any): OperationResult;
    removeObject(key: string): OperationResult;
    updateObject(key: string, object: any): OperationResult;
    findBy(search: SearchFilter): SearchCursor;
    upsertObject(key: string, object: any): OperationResult;
}
