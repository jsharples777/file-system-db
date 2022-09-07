"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionImplementation = void 0;
const BufferFactory_1 = require("./buffer/BufferFactory");
const FileManager_1 = require("./file/FileManager");
const uuid_1 = require("uuid");
class CollectionImplementation {
    constructor(config) {
        this.config = config;
        this.buffer = BufferFactory_1.BufferFactory.getInstance().createBuffer(config);
        if (this.buffer.isComplete()) {
            // load all content
            const collection = FileManager_1.FileManager.getInstance().readEntireCollection(this.config.name);
            this.buffer.initialise(collection);
        }
    }
    findByKey(key) {
        let result = null;
        if (this.buffer.hasKey(key)) {
            result = this.buffer.getObject(key);
        }
        else {
            result = FileManager_1.FileManager.getInstance().readDataObjectFile(this.config.name, key);
            if (result) {
                this.buffer.addObject(key, result);
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
        let result = [];
        if (this.buffer.isComplete()) {
            result = this.buffer.objects();
        }
        else {
            const collection = FileManager_1.FileManager.getInstance().readEntireCollection(this.config.name);
            this.buffer.initialise(collection);
        }
        return result;
    }
    insertObject(key, object) {
        let result = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        };
        if (FileManager_1.FileManager.getInstance().isDuplicateKey(this.config.name, key)) {
            key = (0, uuid_1.v4)();
            result._id = key;
            FileManager_1.FileManager.getInstance().writeDataObjectFile(this.config.name, key, object);
        }
        else {
            FileManager_1.FileManager.getInstance().writeDataObjectFile(this.config.name, key, object);
        }
        this.buffer.addObject(key, object);
        return result;
    }
    removeObject(key) {
        let result = {
            _id: key,
            completed: true,
            numberOfObjects: 0
        };
        if (FileManager_1.FileManager.getInstance().removeDataObjectFile(this.config.name, key)) {
            result.numberOfObjects = 1;
        }
        this.buffer.removeObject(key);
        return result;
    }
    updateObject(key, object) {
        let result = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        };
        FileManager_1.FileManager.getInstance().writeDataObjectFile(this.config.name, key, object);
        this.buffer.replaceObject(key, object);
        return result;
    }
}
exports.CollectionImplementation = CollectionImplementation;
//# sourceMappingURL=CollectionImplementation.js.map