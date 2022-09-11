import {Cursor} from "./Cursor";
import {SortOrderItem} from "../sort/SortTypes";
import {SortedCursor} from "./SortedCursor";

export interface SearchCursor extends Cursor {
    sort(sortOrder:SortOrderItem[]):SortedCursor;
}
