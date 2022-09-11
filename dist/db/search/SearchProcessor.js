"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchProcessor = void 0;
const SearchTypes_1 = require("./SearchTypes");
const SearchCursorImpl_1 = require("./SearchCursorImpl");
const IndexManager_1 = require("../index/IndexManager");
const debug_1 = __importDefault(require("debug"));
const DB_1 = require("../DB");
const logger = (0, debug_1.default)('search-processor');
class SearchProcessor {
    static doesValueMatchSearchItem(fieldValue, searchItem) {
        let result = false;
        if (fieldValue !== undefined) {
            // defined field value, were we looking for not null criteria?
            if (searchItem.comparison === SearchTypes_1.SearchItemComparison.isNotNull) {
                result = true;
            }
            else {
                // ensure we have a comparison value
                if (searchItem.value) {
                    switch (searchItem.comparison) {
                        case SearchTypes_1.SearchItemComparison.equals: {
                            result = (fieldValue === searchItem.value);
                            break;
                        }
                        case SearchTypes_1.SearchItemComparison.lessThan: {
                            result = (fieldValue < searchItem.value);
                            break;
                        }
                        case SearchTypes_1.SearchItemComparison.lessThanEqual: {
                            result = (fieldValue <= searchItem.value);
                            break;
                        }
                        case SearchTypes_1.SearchItemComparison.greaterThan: {
                            result = (fieldValue > searchItem.value);
                            break;
                        }
                        case SearchTypes_1.SearchItemComparison.greaterThanEqual: {
                            result = (fieldValue >= searchItem.value);
                            break;
                        }
                        case SearchTypes_1.SearchItemComparison.notEquals: {
                            result = (fieldValue !== searchItem.value);
                            break;
                        }
                    }
                }
            }
        }
        else {
            // undefined field value, were we looking for null criteria?
            if (searchItem.comparison === SearchTypes_1.SearchItemComparison.isNull) {
                result = true;
            }
        }
        return result;
    }
    static doesItemMatchSearchItem(item, searchItem) {
        let result = false;
        const fieldValue = DB_1.DB.getFieldValue(item, searchItem.field);
        result = SearchProcessor.doesValueMatchSearchItem(fieldValue, searchItem);
        return result;
    }
    static searchItemsBruteForceForSearchItem(items, searchItem) {
        let results = [];
        items.forEach((item) => {
            SearchProcessor.doesItemMatchSearchItem(item, searchItem);
            results.push(item);
        });
        return results;
    }
    static searchCollectionBruteForce(collection, search) {
        let results = collection.find().toArray();
        // go through each search filter and match the collection items
        search.items.every((searchItem) => {
            // find the matching items for the current search item
            results = SearchProcessor.searchItemsBruteForceForSearchItem(results, searchItem);
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
    static searchCollection(collection, search) {
        logger(`Looking for relevant indexes for collection ${collection.getName()} with criteria`);
        logger(search);
        // do we have an index for this collection/search?
        const index = IndexManager_1.IndexManager.getInstance().getMatchingIndex(collection.getName(), search);
        if (index) {
            logger(`Found index ${index.getName()} - using to search`);
            return index.search(search);
        }
        else {
            // perform a manual search (not efficient!)
            logger(`No index - brute forcing`);
            const results = SearchProcessor.searchCollectionBruteForce(collection, search);
            return new SearchCursorImpl_1.SearchCursorImpl(results);
        }
    }
}
exports.SearchProcessor = SearchProcessor;
//# sourceMappingURL=SearchProcessor.js.map