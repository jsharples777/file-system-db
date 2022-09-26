import { Cursor } from "./Cursor";
import { SortOrderItem } from "../sort/SortTypes";
export declare class CursorImpl implements Cursor {
    protected items: any[];
    protected position: number;
    constructor(items: any[], copyObjects?: boolean);
    hasNext(): boolean;
    next(): any;
    toArray(): any[];
    sort(sortOrder: SortOrderItem[]): Cursor;
    sortByFilter(filter: any): Cursor;
}
