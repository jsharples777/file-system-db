import {Compare, SearchItem} from "./SearchTypes";
import {Collection} from "../collection/Collection";
import {IndexManager} from "../index/IndexManager";
import debug from 'debug';
import {Cursor} from "../cursor/Cursor";
import {CursorImpl} from "../cursor/CursorImpl";
import {Util} from "../util/Util";
import {SortOrderItem} from "../sort/SortTypes";
import {SortProcessor} from "../sort/SortProcessor";

const logger = debug('search-processor');

export class SearchProcessor {
    public static doesValueMatchSearchItem(fieldValue: any, searchItem: SearchItem): boolean {
        let result = false;
        if (fieldValue !== undefined) {
            // defined field value, were we looking for not null criteria?
            if (searchItem.comparison === Compare.isNotNull) {
                result = true;
            } else {
                // ensure we have a comparison value
                if (searchItem.value) {
                    switch (searchItem.comparison) {
                        case Compare.equals: {
                            result = (fieldValue === searchItem.value);
                            break;
                        }
                        case Compare.lessThan: {
                            result = (fieldValue < searchItem.value);
                            break;
                        }
                        case Compare.lessThanEqual: {
                            result = (fieldValue <= searchItem.value);
                            break;
                        }
                        case Compare.greaterThan: {
                            result = (fieldValue > searchItem.value);
                            break;
                        }
                        case Compare.greaterThanEqual: {
                            result = (fieldValue >= searchItem.value);
                            break;
                        }
                        case Compare.notEquals: {
                            result = (fieldValue !== searchItem.value);
                            break;
                        }
                    }

                }
            }
        } else {
            // undefined field value, were we looking for null criteria?
            if (searchItem.comparison === Compare.isNull) {
                result = true;
            }
        }

        return result;
    }


    public static doesItemMatchSearchItem(item: any, searchItem: SearchItem): boolean {
        let result = false;
        const fieldValue = Util.getFieldValue(item, searchItem.field);
        result = SearchProcessor.doesValueMatchSearchItem(fieldValue, searchItem);
        return result;
    }

    public static doesItemMatchSearchItems(item: any, search: SearchItem[]): boolean {
        let result = false;
        search.every((searchItem, index) => {
            // find the matching items for the current search item
            if (SearchProcessor.doesItemMatchSearchItem(item, searchItem)) {
                logger(`Item matches for search item - continuing if more criteria`);
                logger(searchItem);
                if (index === (search.length - 1)) result = true;
                return true;
            } else {
                logger(`No match for item for search item`);
                logger(searchItem);
                return false;
            }
        });
        return result;
    }

    public static searchItemsByBruteForce(items: any[], search: SearchItem[]): any[] {
        // go through each search filter and match the collection items
        search.every((searchItem) => {
            // find the matching items for the current search item
            items = SearchProcessor.searchItemsBruteForceForSearchItem(items, searchItem);
            if (items.length > 0) {
                logger(`Found ${items.length} matching items for search item - continuing if more criteria`);
                logger(searchItem);
                return true;
            } else {
                logger(`No matching items for search item`);
                logger(searchItem);
                return false;
            }
        });
        return items;
    }

    public static searchCollection(indexManager: IndexManager, collection: Collection, search: SearchItem[],sort?:SortOrderItem[]): Cursor {

        logger(`Looking for relevant indexes for collection ${collection.getName()} with criteria`);
        logger(search);
        // do we have an index for this collection/search?
        const index = indexManager.getMatchingIndex(collection.getName(), search);
        if (index) {
            logger(`Found index ${index.getName()} - using to search`);
            return index.search(search,sort);
        } else {
            // perform a manual search (not efficient!)
            logger(`No index - brute forcing`);
            const results = SearchProcessor.searchCollectionBruteForce(collection, search);
            if (sort) {
                return SortProcessor.sortItems(results,sort);
            }
            else {
                return new CursorImpl(results, false);
            }
        }
    }

    private static searchItemsBruteForceForSearchItem(items: any[], searchItem: SearchItem): any[] {
        let results: any[] = [];
        items.forEach((item) => {
            if (SearchProcessor.doesItemMatchSearchItem(item, searchItem)) {
                results.push(item);
            }
        });
        return results;
    }

    private static searchCollectionBruteForce(collection: Collection, search: SearchItem[]): any[] {
        let results: any[] = collection.find().toArray();
        results = SearchProcessor.searchItemsByBruteForce(results, search);
        return results;
    }
}
