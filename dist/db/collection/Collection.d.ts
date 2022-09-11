import { OperationResult } from "../Types";
import { Cursor } from "../cursor/Cursor";
import { SearchItem } from "../search/SearchTypes";
export interface Collection {
    getVersion(): number;
    getName(): string;
    getKeyFieldName(): string;
    find(): Cursor;
    findByKey(key: string): any | null;
    findOne(search: SearchItem[]): any;
    insertObject(key: string, object: any): OperationResult;
    upsertObject(key: string, object: any): OperationResult;
    updateObject(key: string, object: any): OperationResult;
    removeObject(key: string): OperationResult;
    findBy(search: SearchItem[]): Cursor;
}
