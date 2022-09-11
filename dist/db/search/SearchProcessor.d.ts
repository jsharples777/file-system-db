import { SearchItem } from "./SearchTypes";
import { Collection } from "../collection/Collection";
import { Cursor } from "../cursor/Cursor";
export declare class SearchProcessor {
    static doesValueMatchSearchItem(fieldValue: any, searchItem: SearchItem): boolean;
    static doesItemMatchSearchItem(item: any, searchItem: SearchItem): boolean;
    private static searchItemsBruteForceForSearchItem;
    private static searchCollectionBruteForce;
    static searchCollection(collection: Collection, search: SearchItem[]): Cursor;
}
