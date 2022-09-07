"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionImplementation = void 0;
const BufferFactory_1 = require("./buffer/BufferFactory");
const FileManager_1 = require("./file/FileManager");
const debug_1 = __importDefault(require("debug"));
const logger = (0, debug_1.default)('collection-implementation');
class CollectionImplementation {
    constructor(config) {
        this.config = config;
        this.buffer = BufferFactory_1.BufferFactory.getInstance().createBuffer(config);
        if (this.buffer.isComplete()) {
            logger(`Collection ${this.config.name} - buffer is complete - loading all`);
            // load all content
            const collection = FileManager_1.FileManager.getInstance().readEntireCollection(this.config.name);
            this.buffer.initialise(collection);
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
            result = FileManager_1.FileManager.getInstance().checkWriteQueueForDataObject(this.config.name, key);
            if (result) {
                logger(`Collection ${this.config.name} - find by key ${key} - found in file manager write queue`);
            }
            else {
                logger(`Collection ${this.config.name} - find by key ${key} - trying to load from file`);
                result = FileManager_1.FileManager.getInstance().readDataObjectFile(this.config.name, key);
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
            const collection = FileManager_1.FileManager.getInstance().readEntireCollection(this.config.name);
            this.buffer.initialise(collection);
            result = collection;
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
        FileManager_1.FileManager.getInstance().writeDataObjectFile(this.config.name, key, object);
        this.buffer.addObject(key, object);
        return result;
    }
    removeObject(key) {
        let result = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        };
        logger(`Collection ${this.config.name} - remove ${key}`);
        FileManager_1.FileManager.getInstance().removeDataObjectFile(this.config.name, key);
        this.buffer.removeObject(key);
        return result;
    }
    updateObject(key, object) {
        let result = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        };
        logger(`Collection ${this.config.name} - update ${key}`);
        FileManager_1.FileManager.getInstance().writeDataObjectFile(this.config.name, key, object);
        this.buffer.replaceObject(key, object);
        return result;
    }
}
exports.CollectionImplementation = CollectionImplementation;
//# sourceMappingURL=CollectionImplementation.js.map