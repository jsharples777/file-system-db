import { SearchFilter } from "./SearchTypes";
import { Collection } from "../collection/Collection";
import { SearchCursor } from "../cursor/SearchCursor";
export declare class SearchProcessor {
    static searchCollection(collection: Collection, search: SearchFilter): SearchCursor;
}
