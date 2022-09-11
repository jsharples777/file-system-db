"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionImplementation = void 0;
const BufferFactory_1 = require("../buffer/BufferFactory");
const CollectionFileManager_1 = require("./CollectionFileManager");
const debug_1 = __importDefault(require("debug"));
const IndexManager_1 = require("../index/IndexManager");
const SearchProcessor_1 = require("../search/SearchProcessor");
const logger = (0, debug_1.default)('collection-implementation');
class CollectionImplementation {
    constructor(config) {
        this.config = config;
        this.buffer = BufferFactory_1.BufferFactory.getInstance().createBuffer(config);
        if (this.buffer.isComplete()) {
            logger(`Collection ${this.config.name} - buffer is complete - loading all`);
            // load all content
            const contentAndConfig = CollectionFileManager_1.CollectionFileManager.getInstance().readEntireCollection(this.config);
            this.buffer.initialise(contentAndConfig.content);
            this.config = contentAndConfig.config;
        }
        else {
            logger(`Collection ${this.config.name} - buffer is not complete - loading config`);
            this.config = CollectionFileManager_1.CollectionFileManager.getInstance().readCollectionConfig(this.config);
        }
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
            result = CollectionFileManager_1.CollectionFileManager.getInstance().checkWriteQueueForDataObject(this.config.name, key);
            if (result) {
                logger(`Collection ${this.config.name} - find by key ${key} - found in file manager write queue`);
            }
            else {
                logger(`Collection ${this.config.name} - find by key ${key} - trying to load from file`);
                result = CollectionFileManager_1.CollectionFileManager.getInstance().readDataObjectFile(this.config.name, key);
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
    find() {
        logger(`Collection ${this.config.name} - find all`);
        let result = [];
        if (this.buffer.isComplete()) {
            logger(`Collection ${this.config.name} - find all - buffer is complete, getting from there`);
            result = this.buffer.objects();
        }
        else {
            logger(`Collection ${this.config.name} - find all - loading all files`);
            const contentAndConfig = CollectionFileManager_1.CollectionFileManager.getInstance().readEntireCollection(this.config);
            this.buffer.initialise(contentAndConfig.content);
            this.config = contentAndConfig.config;
            result = contentAndConfig.content;
        }
        return result;
    }
    insertObject(key, object) {
        let result = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        };
        logger(`Collection ${this.config.name} - insert ${key}`);
        this.config.version++;
        CollectionFileManager_1.CollectionFileManager.getInstance().writeDataObjectFile(this.config, this.config.name, key, object, true);
        this.buffer.addObject(key, object);
        IndexManager_1.IndexManager.getInstance().entryInserted(this.config.name, key, this.config.version, object);
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
        CollectionFileManager_1.CollectionFileManager.getInstance().removeDataObjectFile(this.config, this.config.name, key);
        this.buffer.removeObject(key);
        IndexManager_1.IndexManager.getInstance().entryDeleted(this.config.name, key, this.config.version);
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
        CollectionFileManager_1.CollectionFileManager.getInstance().writeDataObjectFile(this.config, this.config.name, key, object, false);
        this.buffer.replaceObject(key, object);
        IndexManager_1.IndexManager.getInstance().entryUpdated(this.config.name, key, this.config.version, object);
        return result;
    }
    findBy(search) {
        return SearchProcessor_1.SearchProcessor.searchCollection(this, search);
    }
    upsertObject(key, object) {
        return this.updateObject(key, object);
    }
}
exports.CollectionImplementation = CollectionImplementation;
//# sourceMappingURL=CollectionImpl.js.map
