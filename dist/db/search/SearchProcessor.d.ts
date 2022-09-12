import { SearchItem } from "./SearchTypes";
import { Collection } from "../collection/Collection";
import { Cursor } from "../cursor/Cursor";
export declare class SearchProcessor {
    static doesValueMatchSearchItem(fieldValue: any, searchItem: SearchItem): boolean;
    static doesItemMatchSearchItem(item: any, searchItem: SearchItem): boolean;
    static doesItemMatchSearchItems(item: any, search: SearchItem[]): boolean;
    private static searchItemsBruteForceForSearchItem;
    static searchItemsByBruteForce(items: any[], search: SearchItem[]): any[];
    private static searchCollectionBruteForce;
    static searchCollection(collection: Collection, search: SearchItem[]): Cursor;
}
