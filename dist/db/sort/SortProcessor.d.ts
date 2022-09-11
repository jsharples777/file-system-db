import { SortOrderItem, SortOrderType } from "./SortTypes";
import { SortedCursor } from "../cursor/SortedCursor";
export declare class Sorter {
    private sortOrder;
    constructor(sortOrder: SortOrderItem[]);
    sortByFieldAndOrder(item1: any, item2: any, fieldName: string, order: SortOrderType): number;
    sort(item1: any, item2: any): number;
}
export declare class SortProcessor {
    static sortItems(items: any[], sortOrder: SortOrderItem[]): SortedCursor;
}
