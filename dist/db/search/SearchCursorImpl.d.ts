import { SortedCursor } from "../cursor/SortedCursor";
import { CursorImpl } from "../cursor/CursorImpl";
import { SearchCursor } from "../cursor/SearchCursor";
import { SortOrderItem } from "../sort/SortTypes";
export declare class SearchCursorImpl extends CursorImpl implements SearchCursor {
    constructor(items: any[]);
    sort(sortOrder: SortOrderItem[]): SortedCursor;
}
