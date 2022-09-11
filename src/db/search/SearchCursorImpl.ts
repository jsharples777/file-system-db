import {SortedCursor} from "../cursor/SortedCursor";
import {CursorImpl} from "../cursor/CursorImpl";
import {SearchCursor} from "../cursor/SearchCursor";
import {SortProcessor} from "../sort/SortProcessor";
import {SortOrderItem} from "../sort/SortTypes";

export class SearchCursorImpl extends CursorImpl implements SearchCursor {
    constructor(items:any[]) {
        super(items);
    }

    sort(sortOrder: SortOrderItem[]): SortedCursor {
        return SortProcessor.sortItems(this.items,sortOrder);
    }


}
