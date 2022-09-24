import { CollectionConfig, OperationResult } from "../config/Types";
import { Cursor } from "../cursor/Cursor";
import { Query } from "../query/Query";
import { SearchItem } from "../search/SearchTypes";
import { CollectionListener } from "./CollectionListener";
import { SortOrderItem } from "../sort/SortTypes";
export declare type KeyObjectPair = {
    key: string;
    object: any;
};
export declare class FilterItem {
    eq?: any;
    neq?: any;
    lt?: any;
    gt?: any;
    lte?: any;
    gte?: any;
    isnull?: any;
    isnotnull?: any;
}
export interface Collection {
    getVersion(): number;
    getName(): string;
    getKeyFieldName(): string;
    getConfig(): CollectionConfig;
    find(filter?: any): Cursor;
    findByKey(key: string): any | null;
    findOne(search: SearchItem[]): any;
    insertObject(key: string, object: any): OperationResult;
    upsertObject(key: string, object: any): OperationResult;
    updateObject(key: string, object: any): OperationResult;
    removeObject(key: string): OperationResult;
    findBy(search: SearchItem[], sort?: SortOrderItem[]): Cursor;
    addListener(listener: CollectionListener): void;
    insertMany(keyObjPairs: KeyObjectPair[]): void;
    deleteManyByKey(keys: string[]): void;
    deleteMany(filter: any): OperationResult;
    deleteAll(): void;
    select(field: string): Query;
    selectMany(fields: string[]): Query;
}
