import {SortedCursor} from "../cursor/SortedCursor";
import {CursorImpl} from "../cursor/CursorImpl";

export class SortedCursorImpl extends CursorImpl implements SortedCursor {
    constructor(items:any[]) {
        super(items);
    }
}
