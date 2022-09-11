import {SearchFilter} from "./SearchTypes";
import {Collection} from "../collection/Collection";
import {SearchCursor} from "../cursor/SearchCursor";
import {SearchCursorImpl} from "./SearchCursorImpl";

export class SearchProcessor {
    public static searchCollection(collection:Collection, search:SearchFilter):SearchCursor {

        return new SearchCursorImpl(collection.find()); // TODO

    }
}
