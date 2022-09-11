import {SearchFilter, SearchItem, SearchItemComparison} from "./SearchTypes";
import {Collection} from "../collection/Collection";
import {SearchCursor} from "../cursor/SearchCursor";
import {SearchCursorImpl} from "./SearchCursorImpl";
import {IndexManager} from "../index/IndexManager";
import debug from 'debug';
import {DB} from "../DB";

const logger = debug('search-processor');

export class SearchProcessor {
    public static doesValueMatchSearchItem(fieldValue:any,searchItem:SearchItem):boolean {
        let result = false;
        if (fieldValue !== undefined) {
            // defined field value, were we looking for not null criteria?
            if (searchItem.comparison === SearchItemComparison.isNotNull) {
                result = true;
            }
            else {
                // ensure we have a comparison value
                if (searchItem.value) {
                    switch (searchItem.comparison) {
                        case SearchItemComparison.equals: {
                            result = (fieldValue === searchItem.value);
                            break;
                        }
                        case SearchItemComparison.lessThan: {
                            result = (fieldValue < searchItem.value);
                            break;
                        }
                        case SearchItemComparison.lessThanEqual: {
                            result = (fieldValue <= searchItem.value);
                            break;
                        }
                        case SearchItemComparison.greaterThan: {
                            result = (fieldValue > searchItem.value);
                            break;
                        }
                        case SearchItemComparison.greaterThanEqual: {
                            result = (fieldValue >= searchItem.value);
                            break;
                        }
                        case SearchItemComparison.notEquals: {
                            result = (fieldValue !== searchItem.value);
                            break;
                        }
                    }

                }
            }
        }
        else {
            // undefined field value, were we looking for null criteria?
            if (searchItem.comparison === SearchItemComparison.isNull) {
                result = true;
            }
        }

        return result;
    }


    public static doesItemMatchSearchItem(item:any,searchItem:SearchItem):boolean {
        let result = false;
        const fieldValue = DB.getFieldValue(item,searchItem.field);
        result = SearchProcessor.doesValueMatchSearchItem(fieldValue,searchItem);
        return result;
    }

    private static searchItemsBruteForceForSearchItem(items:any[],searchItem:SearchItem):any[] {
        let results:any[] = [];
        items.forEach((item) => {
            SearchProcessor.doesItemMatchSearchItem(item,searchItem);
            results.push(item);
        });
        return results;
    }


    private static searchCollectionBruteForce(collection:Collection, search:SearchFilter):any[] {
        let results:any[] = collection.find().toArray();
        // go through each search filter and match the collection items
        search.items.every((searchItem) => {
           // find the matching items for the current search item
           results = SearchProcessor.searchItemsBruteForceForSearchItem(results,searchItem);
           if (results.length > 0) {
               logger(`Found ${results.length} matching items for search item - continuing if more criteria`);
               logger(searchItem);
               return true;
           }
           else {
               logger(`No matching items for search item`);
               logger(searchItem);
               return false;
           }
        });




        return results;
    }

    public static searchCollection(collection:Collection, search:SearchFilter):SearchCursor {

        logger(`Looking for relevant indexes for collection ${collection.getName()} with criteria`);
        logger(search);
        // do we have an index for this collection/search?
        const index = IndexManager.getInstance().getMatchingIndex(collection.getName(),search);
        if (index) {
            logger(`Found index ${index.getName()} - using to search`);
            return index.search(search);
        }
        else {
            // perform a manual search (not efficient!)
            logger(`No index - brute forcing`);
            const results = SearchProcessor.searchCollectionBruteForce(collection, search);
            return new SearchCursorImpl(results);
        }
    }
}
