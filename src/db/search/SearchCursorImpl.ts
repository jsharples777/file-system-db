import {SortedCursor} from "../cursor/SortedCursor";
import {CursorImpl} from "../cursor/CursorImpl";
import {SearchCursor} from "../cursor/SearchCursor";
import {SortOrder} from "../sort/SortTypes";
import {SortProcessor} from "../sort/SortProcessor";

export class SearchCursorImpl extends CursorImpl implements SearchCursor {
    constructor(items:any[]) {
        super(items);
    }

    sort(sortOrder: SortOrder): SortedCursor {
        return SortProcessor.sortItems(this.items,sortOrder);
    }
}
