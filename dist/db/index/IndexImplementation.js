"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexImplementation = void 0;
const debug_1 = __importDefault(require("debug"));
const SearchProcessor_1 = require("../search/SearchProcessor");
const CursorImpl_1 = require("../cursor/CursorImpl");
const Util_1 = require("../util/Util");
const SortProcessor_1 = require("../sort/SortProcessor");
const logger = (0, debug_1.default)('index-implementation');
const dLogger = (0, debug_1.default)('index-implementation-detail');
class IndexImplementation {
    constructor(dbLocation, config, managers) {
        this.indexLoaded = false;
        this.indexInUse = false;
        this.dbLocation = dbLocation;
        this.config = config;
        this.managers = managers;
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
        this.getIndexContent = this.getIndexContent.bind(this);
        this.getIndexVersion = this.getIndexVersion.bind(this);
        this.managers.getLifecycleManager().addLife(this);
        logger(`Constructing index ${this.config.name} for collection ${this.config.collection}`);
    }
    findMatchingKeys(searchFilter) {
        this.checkIndexLoaded();
        return [];
    }
    getCollection() {
        return this.config.collection + '';
    }
    getEntries() {
        this.checkIndexLoaded();
        return this.content.entries;
    }
    getFields() {
        return Util_1.Util.copyObject(this.config.fields);
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
        searchFilter.forEach((searchItem) => {
            const foundIndex = this.config.fields.findIndex((field) => field === searchItem.field);
            if (foundIndex < 0)
                result = false;
        });
        return result;
    }
    partiallyMatchesFilter(searchFilter) {
        let result = false;
        searchFilter.forEach((searchItem) => {
            const foundIndex = this.config.fields.findIndex((field) => field === searchItem.field);
            if (foundIndex >= 0)
                result = true;
        });
        return result;
    }
    objectAdded(collection, key, object) {
        this.checkIndexLoaded();
        const config = collection.getConfig();
        logger(`Creating new index entry for ${key}`);
        const newEntry = this.constructIndexEntry(key, object);
        this.content.entries.push(newEntry);
        this.version.version = config.version;
        this.content.version = config.version;
        this.managers.getIndexFileManager().writeIndexFile(this);
    }
    objectRemoved(collection, key) {
        this.checkIndexLoaded();
        const config = collection.getConfig();
        const foundIndex = this.content.entries.findIndex((entry) => entry.keyValue === key);
        if (foundIndex >= 0) {
            logger(`Removing index entry for ${key}`);
            this.content.entries.splice(foundIndex, 1);
        }
        this.version.version = config.version;
        this.content.version = config.version;
        this.managers.getIndexFileManager().writeIndexFile(this);
    }
    objectUpdated(collection, key, object) {
        this.checkIndexLoaded();
        const config = collection.getConfig();
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
        this.version.version = config.version;
        this.content.version = config.version;
        this.managers.getIndexFileManager().writeIndexFile(this);
    }
    setVersion(version) {
        this.checkIndexLoaded();
        this.version.version = version;
        this.content.version = version;
    }
    search(search, sort) {
        let results = [];
        logger(`Searching using index ${this.config.name} for collection ${this.config.collection} with search criteria`);
        logger(search);
        // what fields are we searching with?
        const indexSearchItems = [];
        search.forEach((searchItem) => {
            const foundIndex = this.config.fields.findIndex((field) => field === searchItem.field);
            if (foundIndex >= 0) {
                indexSearchItems.push(searchItem);
            }
        });
        logger(`Searching using index ${this.config.name} for collection ${this.config.collection} - can only use criteria`);
        logger(indexSearchItems);
        // for each entry in the index, check if the fields match
        this.checkIndexLoaded();
        this.checkVersionSync();
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
        const entriesUsingIndex = [];
        if (matchingEntries.length > 0) {
            const collection = this.managers.getCollectionManager().getCollection(this.config.collection);
            matchingEntries.forEach((matchingEntry) => {
                const item = collection.findByKey(matchingEntry.keyValue);
                if (item) {
                    entriesUsingIndex.push(item);
                }
            });
        }
        logger(`Searching using index ${this.config.name} for collection ${this.config.collection} - loaded ${entriesUsingIndex.length} matching items`);
        if (search.length > indexSearchItems.length) {
            logger('Refining index search results by the full search criteria');
            entriesUsingIndex.forEach((entry) => {
                if (SearchProcessor_1.SearchProcessor.doesItemMatchSearchItems(entry, search)) {
                    results.push(entry);
                }
            });
            logger(`Searching using index ${this.config.name} for collection ${this.config.collection} - refined to ${results.length} matching items`);
        }
        else {
            results = entriesUsingIndex;
        }
        if (sort) {
            return SortProcessor_1.SortProcessor.sortItems(results, sort);
        }
        else {
            return new CursorImpl_1.CursorImpl(results);
        }
    }
    rebuild() {
        this.rebuildIndex();
    }
    die() {
    }
    getBPM() {
        return Math.round(60 / (this.defaultLifespan / 2));
    }
    heartbeat() {
        this.checkIndexUse();
    }
    isAlive() {
        return true;
    }
    birth() {
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
    checkIndexLoaded() {
        if (!this.indexLoaded) {
            const result = this.managers.getIndexFileManager().readIndex(this.config.collection, this.config.name);
            this.version = result.version;
            this.content = result.content;
            this.indexLoaded = true;
        }
        this.indexInUse = true;
    }
    rebuildIndex() {
        if (this.config) {
            const collection = this.managers.getCollectionManager().getCollection(this.config.collection);
            const versionNumber = collection.getVersion();
            const indexContent = {
                version: versionNumber,
                entries: []
            };
            const entries = collection.find().toArray();
            const keyField = collection.getKeyFieldName();
            entries.forEach((entry) => {
                const keyValue = entry[keyField];
                if (keyValue) {
                    const indexEntry = this.constructIndexEntry(keyValue, entry);
                    indexContent.entries.push(indexEntry);
                }
            });
            this.version.version = versionNumber;
            this.content = indexContent;
            this.indexLoaded = true;
            this.indexInUse = true;
            this.managers.getIndexFileManager().writeIndexFile(this);
        }
    }
    checkVersionSync() {
        const collectionVersion = this.managers.getCollectionManager().getCollection(this.config.collection).getVersion();
        // check versions
        if ((this.version.version !== collectionVersion) || (this.content.version !== collectionVersion)) {
            logger(`Index ${this.config.name} has version ${this.version.version} which does not match collection ${this.config.collection} version ${collectionVersion} - rebuilding`);
            this.version.version = collectionVersion;
            this.rebuildIndex();
        }
    }
    constructIndexEntry(key, object) {
        const indexEntry = {
            keyValue: key,
            fieldValues: []
        };
        // find each field for index config
        this.config.fields.forEach((field => {
            const fieldValue = Util_1.Util.getFieldValue(object, field);
            if (fieldValue) {
                indexEntry.fieldValues.push({
                    field: field,
                    value: fieldValue
                });
            }
        }));
        return indexEntry;
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
    removeAll(collection) {
        this.rebuild();
    }
}
exports.IndexImplementation = IndexImplementation;
//# sourceMappingURL=IndexImplementation.js.map