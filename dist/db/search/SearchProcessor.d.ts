import { SearchFilter, SearchItem } from "./SearchTypes";
import { Collection } from "../collection/Collection";
import { SearchCursor } from "../cursor/SearchCursor";
export declare class SearchProcessor {
    static doesValueMatchSearchItem(fieldValue: any, searchItem: SearchItem): boolean;
    static doesItemMatchSearchItem(item: any, searchItem: SearchItem): boolean;
    private static searchItemsBruteForceForSearchItem;
    private static searchCollectionBruteForce;
    static searchCollection(collection: Collection, search: SearchFilter): SearchCursor;
}
