import { SortOrderItem, Order } from "./SortTypes";
import { Cursor } from "../cursor/Cursor";
export declare class Sorter {
    private sortOrder;
    constructor(sortOrder: SortOrderItem[]);
    sortByFieldAndOrder(item1: any, item2: any, fieldName: string, order: Order): number;
    sort(item1: any, item2: any): number;
}
export declare class SortProcessor {
    static sortItems(items: any[], sortOrder: SortOrderItem[]): Cursor;
}
