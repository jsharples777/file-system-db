"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionImpl = void 0;
const BufferFactory_1 = require("../buffer/BufferFactory");
const debug_1 = __importDefault(require("debug"));
const SearchTypes_1 = require("../search/SearchTypes");
const SearchProcessor_1 = require("../search/SearchProcessor");
const CursorImpl_1 = require("../cursor/CursorImpl");
const Util_1 = require("../util/Util");
const QueryImpl_1 = require("../query/QueryImpl");
const logger = (0, debug_1.default)('collection-implementation');
class CollectionImpl {
    constructor(config, managers) {
        this.listeners = [];
        this.config = config;
        this.managers = managers;
        this.buffer = BufferFactory_1.BufferFactory.getInstance().createBuffer(config, this.managers.getLifecycleManager());
        if (this.buffer.isComplete()) {
            logger(`Collection ${this.config.name} - buffer is complete - loading all`);
            // load all content
            const contentAndConfig = this.managers.getCollectionFileManager().readEntireCollection(this.config);
            this.buffer.initialise(contentAndConfig.content);
            logger(`Collection ${this.config.name} - loaded ${contentAndConfig.content.length} entries`);
            this.config = contentAndConfig.config;
        }
        else {
            logger(`Collection ${this.config.name} - buffer is not complete - loading config`);
            this.config = this.managers.getCollectionFileManager().readCollectionConfig(this.config);
        }
    }
    getConfig() {
        return Util_1.Util.copyObject(this.config);
    }
    findByKey(key) {
        logger(`Collection ${this.config.name} - find by key ${key}`);
        let result = null;
        if (this.buffer.hasKey(key)) {
            logger(`Collection ${this.config.name} - find by key ${key} - found in buffer`);
            result = this.buffer.getObject(key);
        }
        else {
            // object could still be in write queue
            result = this.managers.getCollectionFileManager().checkWriteQueueForDataObject(this.config.name, key);
            if (result) {
                logger(`Collection ${this.config.name} - find by key ${key} - found in file manager write queue`);
            }
            else {
                logger(`Collection ${this.config.name} - find by key ${key} - trying to load from file`);
                result = this.managers.getCollectionFileManager().readDataObjectFile(this.config.name, key);
                if (result) {
                    logger(`Collection ${this.config.name} - find by key ${key} - found in file`);
                    this.buffer.addObject(key, result);
                }
            }
        }
        return result;
    }
    getVersion() {
        return this.config.version;
    }
    getName() {
        return this.config.name;
    }
    convertFilterIntoFind(filter) {
        const fields = Object.getOwnPropertyNames(filter);
        const searchItems = [];
        fields.forEach((field) => {
            const fieldValue = filter[field];
            let comparison = SearchTypes_1.Compare.equals;
            let compareValue = null;
            if (fieldValue.gt) {
                comparison = SearchTypes_1.Compare.greaterThan;
                compareValue = fieldValue.gt;
            }
            else if (fieldValue.gte) {
                comparison = SearchTypes_1.Compare.greaterThanEqual;
                compareValue = fieldValue.gte;
            }
            else if (fieldValue.lt) {
                comparison = SearchTypes_1.Compare.lessThan;
                compareValue = fieldValue.lt;
            }
            else if (fieldValue.lte) {
                comparison = SearchTypes_1.Compare.lessThanEqual;
                compareValue = fieldValue.lte;
            }
            else if (fieldValue.eq) {
                comparison = SearchTypes_1.Compare.equals;
                compareValue = fieldValue.eq;
            }
            else if (fieldValue.neq) {
                comparison = SearchTypes_1.Compare.notEquals;
                compareValue = fieldValue.neq;
            }
            else if (fieldValue.isnotnull) {
                comparison = SearchTypes_1.Compare.isNotNull;
            }
            else if (fieldValue.isnull) {
                comparison = SearchTypes_1.Compare.isNull;
            }
            else {
                comparison = SearchTypes_1.Compare.equals;
                compareValue = fieldValue;
            }
            const searchItem = {
                field: field,
                comparison: comparison,
                value: compareValue
            };
            searchItems.push(searchItem);
        });
        return this.findBy(searchItems);
    }
    find(filter) {
        if (filter) {
            return this.convertFilterIntoFind(filter);
        }
        else {
            let result = [];
            logger(`Collection ${this.config.name} - find`);
            if (filter)
                logger(filter);
            if (this.buffer.isComplete()) {
                logger(`Collection ${this.config.name} - find all - buffer is complete, getting from there`);
                result = this.buffer.objects();
            }
            else {
                logger(`Collection ${this.config.name} - find all - loading all files`);
                const contentAndConfig = this.managers.getCollectionFileManager().readEntireCollection(this.config);
                this.buffer.initialise(contentAndConfig.content);
                this.config = contentAndConfig.config;
                result = contentAndConfig.content;
            }
            return new CursorImpl_1.CursorImpl(result);
        }
    }
    insertObject(key, object) {
        let result = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        };
        logger(`Collection ${this.config.name} - insert ${key}`);
        this.config.version++;
        this.buffer.addObject(key, object);
        this.listeners.forEach((listener) => listener.objectAdded(this, key, object));
        return result;
    }
    removeObject(key) {
        let result = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        };
        logger(`Collection ${this.config.name} - remove ${key}`);
        this.config.version++;
        this.buffer.removeObject(key);
        this.listeners.forEach((listener) => listener.objectRemoved(this, key));
        return result;
    }
    updateObject(key, object) {
        let result = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        };
        logger(`Collection ${this.config.name} - update ${key}`);
        this.config.version++;
        this.buffer.replaceObject(key, object);
        this.listeners.forEach((listener) => listener.objectUpdated(this, key, object));
        return result;
    }
    findBy(search, sort) {
        return SearchProcessor_1.SearchProcessor.searchCollection(this.managers.getIndexManager(), this, search, sort);
    }
    upsertObject(key, object) {
        return this.updateObject(key, object);
    }
    findOne(search) {
        let result = undefined;
        const cursor = this.findBy(search);
        const results = cursor.toArray();
        if (results.length > 0) {
            result = results[0];
        }
        return result;
    }
    getKeyFieldName() {
        return this.config.key;
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    deleteManyByKey(keys) {
        keys.forEach((key) => {
            this.removeObject(key);
        });
    }
    deleteMany(filter) {
        let result = {
            _id: '',
            numberOfObjects: 0,
            completed: true
        };
        const keys = [];
        const cursor = this.find(filter);
        while (cursor.hasNext()) {
            const obj = cursor.next();
            if (obj[this.config.key]) {
                keys.push(obj[this.config.key]);
            }
        }
        result.numberOfObjects = keys.length;
        this.deleteManyByKey(keys);
        return result;
    }
    insertMany(keyObjPairs) {
        keyObjPairs.forEach((keyObjPair) => {
            this.upsertObject(keyObjPair.key, keyObjPair.object);
        });
    }
    // query
    select(field) {
        const query = new QueryImpl_1.QueryImpl(this.managers.getDB(), this);
        query.select(field);
        return query;
    }
    selectMany(fields) {
        const query = new QueryImpl_1.QueryImpl(this.managers.getDB(), this);
        query.selectMany(fields);
        return query;
    }
}
exports.CollectionImpl = CollectionImpl;
//# sourceMappingURL=CollectionImpl.js.map