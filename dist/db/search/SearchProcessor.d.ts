import { SearchItem } from "./SearchTypes";
import { Collection } from "../collection/Collection";
import { IndexManager } from "../index/IndexManager";
import { Cursor } from "../cursor/Cursor";
import { SortOrderItem } from "../sort/SortTypes";
export declare class SearchProcessor {
    static doesValueMatchSearchItem(fieldValue: any, searchItem: SearchItem): boolean;
    static doesItemMatchSearchItem(item: any, searchItem: SearchItem): boolean;
    static doesItemMatchSearchItems(item: any, search: SearchItem[]): boolean;
    static searchItemsByBruteForce(items: any[], search: SearchItem[]): any[];
    static searchCollection(indexManager: IndexManager, collection: Collection, search: SearchItem[], sort?: SortOrderItem[]): Cursor;
    private static searchItemsBruteForceForSearchItem;
    private static searchCollectionBruteForce;
}
