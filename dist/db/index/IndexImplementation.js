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
const logger = (0, debug_1.default)('index-implementation');
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
        return false;
    }
    objectAdded(version, key, object) {
        this.checkIndexLoaded();
        logger(`Creating new index entry for ${key}`);
        this.content.entries.push(object);
        this.version.version = version;
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
        IndexFileManager_1.IndexFileManager.getInstance().writeIndexFile(this);
    }
    constructIndexEntry(key, object) {
        const indexEntry = {
            keyValue: key,
            fieldValues: []
        };
        // find each field for index config
        this.config.fields.forEach((field => {
            const fieldValue = this.getFieldValue(object, field);
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
        IndexFileManager_1.IndexFileManager.getInstance().writeIndexFile(this);
    }
    setVersion(version) {
        this.checkIndexLoaded();
        this.version.version = version;
    }
    rebuildIndex(version) {
        if (this.config) {
            const collection = CollectionManager_1.CollectionManager.getInstance().getCollection(version.collection);
            const versionNumber = collection.getVersion();
            const indexContent = {
                version: versionNumber,
                entries: []
            };
            const entries = collection.find();
            entries.forEach((entry) => {
                const indexEntry = {
                    keyValue: entry._id,
                    fieldValues: []
                };
                // find each field for index config
                this.config.fields.forEach((field => {
                    const fieldValue = this.getFieldValue(entry, field);
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
    getFieldValue(entry, field) {
        let result = undefined;
        // any dot notation?
        const fieldParts = field.split('.');
        if (fieldParts.length > 1) {
            let previousValue = entry;
            fieldParts.forEach((fieldPart, index) => {
                if (previousValue) {
                    previousValue = previousValue[fieldPart];
                    if (index === (fieldParts.length - 1)) {
                        if (previousValue) {
                            result = previousValue;
                        }
                    }
                }
            });
        }
        else {
            result = entry[field];
        }
        return result;
    }
}
exports.IndexImplementation = IndexImplementation;
//# sourceMappingURL=IndexImplementation.js.map