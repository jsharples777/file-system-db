import {SortOrderItem} from "../sort/SortTypes";

export interface Cursor {
    hasNext(): boolean;

    next(): any;

    toArray(): any[];

    sort(sortOrder: SortOrderItem[]): Cursor;
}
