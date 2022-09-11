"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexImplementation = void 0;
const CollectionManager_1 = require("../collection/CollectionManager");
const debug_1 = __importDefault(require("debug"));
const DB_1 = require("../DB");
const IndexFileManager_1 = require("./IndexFileManager");
const SearchProcessor_1 = require("../search/SearchProcessor");
const SearchCursorImpl_1 = require("../search/SearchCursorImpl");
const logger = (0, debug_1.default)('index-implementation');
const dLogger = (0, debug_1.default)('index-implementation-detail');
class IndexImplementation {
    constructor(dbLocation, config) {
        this.indexLoaded = false;
        this.indexInUse = false;
        this.dbLocation = dbLocation;
        this.config = config;
        this.version = {
            version: 1,
            name: this.config.name,
            collection: this.config.collection
        };
        this.content = {
            version: 1,
            entries: []
        };
        this.defaultLifespan = parseInt(process.env.DEFAULT_INDEX_LIFESPAN_SEC || '600');
        if (isNaN(this.defaultLifespan)) {
            this.defaultLifespan = 600;
        }
        this.checkIndexUse = this.checkIndexUse.bind(this);
        setInterval(() => {
            this.checkIndexUse();
        }, this.defaultLifespan / 2 * 1000);
        logger(`Constructing index ${this.config.name} for collection ${this.config.collection}`);
    }
    checkIndexUse() {
        if (this.indexInUse) {
            this.indexInUse = false;
        }
        else {
            if (this.indexLoaded)
                this.removeIndexBuffer();
        }
    }
    removeIndexBuffer() {
        logger(`Index hasn't been used in ${this.defaultLifespan} seconds, removing buffer`);
        this.content.entries = [];
        this.indexLoaded = false;
        this.indexInUse = false;
    }
    findMatchingKeys(searchFilter) {
        this.checkIndexLoaded();
        return [];
    }
    getCollection() {
        return this.config.collection + '';
    }
    checkIndexLoaded() {
        if (!this.indexLoaded) {
            const result = IndexFileManager_1.IndexFileManager.getInstance().readIndex(this.config.collection, this.config.name);
            this.version = result.version;
            this.content = result.content;
            this.indexLoaded = true;
        }
        this.indexInUse = true;
    }
    getEntries() {
        this.checkIndexLoaded();
        return this.content.entries;
    }
    getFields() {
        return DB_1.DB.copyObject(this.config.fields);
    }
    getIndexContent() {
        this.checkIndexLoaded();
        return this.content;
    }
    getIndexVersion() {
        this.checkIndexLoaded();
        return this.version;
    }
    getName() {
        return this.config.name + '';
    }
    getVersion() {
        this.checkIndexLoaded();
        return this.version.version;
    }
    matchesFilter(searchFilter) {
        let result = true;
        searchFilter.items.forEach((searchItem) => {
            const foundIndex = this.config.fields.findIndex((field) => field === searchItem.field);
            if (foundIndex < 0)
                result = false;
        });
        return result;
    }
    partiallyMatchesFilter(searchFilter) {
        let result = false;
        searchFilter.items.forEach((searchItem) => {
            const foundIndex = this.config.fields.findIndex((field) => field === searchItem.field);
            if (foundIndex >= 0)
                result = true;
        });
        return result;
    }
    objectAdded(version, key, object) {
        this.checkIndexLoaded();
        logger(`Creating new index entry for ${key}`);
        this.content.entries.push(object);
        this.version.version = version;
        this.content.version = version;
        IndexFileManager_1.IndexFileManager.getInstance().writeIndexFile(this);
    }
    objectRemoved(version, key) {
        this.checkIndexLoaded();
        const foundIndex = this.content.entries.findIndex((entry) => entry.keyValue === key);
        if (foundIndex >= 0) {
            logger(`Removing index entry for ${key}`);
            this.content.entries.splice(foundIndex, 1);
        }
        this.version.version = version;
        this.content.version = version;
        IndexFileManager_1.IndexFileManager.getInstance().writeIndexFile(this);
    }
    constructIndexEntry(key, object) {
        const indexEntry = {
            keyValue: key,
            fieldValues: []
        };
        // find each field for index config
        this.config.fields.forEach((field => {
            const fieldValue = DB_1.DB.getFieldValue(object, field);
            if (fieldValue) {
                indexEntry.fieldValues.push({
                    field: field,
                    value: fieldValue
                });
            }
        }));
        return indexEntry;
    }
    objectUpdated(version, key, object) {
        this.checkIndexLoaded();
        const foundIndex = this.content.entries.findIndex((entry) => entry.keyValue === key);
        if (foundIndex >= 0) {
            logger(`Updating index entry for ${key}`);
            const newEntry = this.constructIndexEntry(key, object);
            this.content.entries.splice(foundIndex, 1, newEntry);
        }
        else {
            logger(`Adding index entry for ${key}`);
            const newEntry = this.constructIndexEntry(key, object);
            this.content.entries.push(newEntry);
        }
        this.version.version = version;
        this.content.version = version;
        IndexFileManager_1.IndexFileManager.getInstance().writeIndexFile(this);
    }
    setVersion(version) {
        this.checkIndexLoaded();
        this.version.version = version;
        this.content.version = version;
    }
    rebuildIndex(version) {
        if (this.config) {
            const collection = CollectionManager_1.CollectionManager.getInstance().getCollection(version.collection);
            const versionNumber = collection.getVersion();
            const indexContent = {
                version: versionNumber,
                entries: []
            };
            const entries = collection.find().toArray();
            entries.forEach((entry) => {
                const indexEntry = {
                    keyValue: entry._id,
                    fieldValues: []
                };
                // find each field for index config
                this.config.fields.forEach((field => {
                    const fieldValue = DB_1.DB.getFieldValue(entry, field);
                    if (fieldValue) {
                        indexEntry.fieldValues.push({
                            field: field,
                            value: fieldValue
                        });
                    }
                }));
                indexContent.entries.push(indexEntry);
            });
        }
    }
    indexEntryFieldMatchesSearchItem(entry, searchItem) {
        let result = false;
        const foundIndex = entry.fieldValues.findIndex((fieldValue) => fieldValue.field === searchItem.field);
        if (foundIndex >= 0) {
            const entryValue = entry.fieldValues[foundIndex].value;
            result = SearchProcessor_1.SearchProcessor.doesValueMatchSearchItem(entryValue, searchItem);
            dLogger(`Comparing entry value ${entryValue} with ${searchItem.value} and comparison "${searchItem.comparison}" with result ${result}`);
        }
        return result;
    }
    indexEntryMatchesSearchItems(entry, searchItems) {
        let result = true;
        // every value must match
        searchItems.every((searchItem) => {
            if (this.indexEntryFieldMatchesSearchItem(entry, searchItem)) {
                return true;
            }
            else {
                result = false;
                return false;
            }
        });
        return result;
    }
    search(search) {
        let results = [];
        logger(`Searching using index ${this.config.name} for collection ${this.config.collection} with search criteria`);
        logger(search);
        // what fields are we searching with?
        const indexSearchItems = [];
        search.items.forEach((searchItem) => {
            const foundIndex = this.config.fields.findIndex((field) => field === searchItem.field);
            if (foundIndex >= 0) {
                indexSearchItems.push(searchItem);
            }
        });
        logger(`Searching using index ${this.config.name} for collection ${this.config.collection} - can only use criteria`);
        logger(indexSearchItems);
        // for each entry in the index, check if the fields match
        this.checkIndexLoaded();
        const matchingEntries = [];
        this.content.entries.forEach((entry) => {
            dLogger(`Searching using index ${this.config.name} for collection ${this.config.collection} - checking entry`);
            dLogger(entry);
            if (this.indexEntryMatchesSearchItems(entry, indexSearchItems)) {
                matchingEntries.push(entry);
            }
        });
        logger(`Searching using index ${this.config.name} for collection ${this.config.collection} - found ${matchingEntries.length} matching index entries`);
        // for all found matches, load the items from the collection
        if (matchingEntries.length > 0) {
            const collection = CollectionManager_1.CollectionManager.getInstance().getCollection(this.config.collection);
            matchingEntries.forEach((matchingEntry) => {
                const item = collection.findByKey(matchingEntry.keyValue);
                if (item) {
                    results.push(item);
                }
            });
        }
        logger(`Searching using index ${this.config.name} for collection ${this.config.collection} - loaded ${results.length} matching items`);
        return new SearchCursorImpl_1.SearchCursorImpl(results);
    }
}
exports.IndexImplementation = IndexImplementation;
//# sourceMappingURL=IndexImplementation.js.map