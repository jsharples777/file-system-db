import { Collection } from "./Collection";
import { CollectionConfig, OperationResult } from "../config/Types";
import { SearchItem } from "../search/SearchTypes";
import { Cursor } from "../cursor/Cursor";
import { CollectionListener } from "./CollectionListener";
export declare class CollectionImpl implements Collection {
    private config;
    private buffer;
    private listeners;
    constructor(config: CollectionConfig);
    getConfig(): CollectionConfig;
    findByKey(key: string): any;
    getVersion(): number;
    getName(): string;
    find(): Cursor;
    insertObject(key: string, object: any): OperationResult;
    removeObject(key: string): OperationResult;
    updateObject(key: string, object: any): OperationResult;
    findBy(search: SearchItem[]): Cursor;
    upsertObject(key: string, object: any): OperationResult;
    findOne(search: SearchItem[]): any;
    getKeyFieldName(): string;
    addListener(listener: CollectionListener): void;
}
