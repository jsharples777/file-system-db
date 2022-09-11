import {Cursor} from "./Cursor";
import {SortOrder} from "../sort/SortTypes";
import {SortedCursor} from "./SortedCursor";

export interface SearchCursor extends Cursor {
    sort(sortOrder:SortOrder):SortedCursor;
}
