"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionManager = void 0;
const debug_1 = __importDefault(require("debug"));
const Types_1 = require("../config/Types");
const CollectionImpl_1 = require("./CollectionImpl");
const logger = (0, debug_1.default)('collection-manager');
class CollectionManager {
    constructor(managers) {
        this.collectionConfigs = [];
        this.collectionImplementations = [];
        this.managers = managers;
    }
    loadConfig(config) {
        this.config = config;
        // check on each collection version file
        this.config.collections.forEach((collection) => {
            //const config = this.setupCollection(collection.name);
            this.collectionConfigs.push(collection);
        });
    }
    collections() {
        let results = [];
        this.collectionConfigs.forEach((collection) => {
            results.push(collection.name);
        });
        return results;
    }
    getCollection(name) {
        let result;
        const foundIndex = this.collectionImplementations.findIndex((collection) => collection.getName() === name);
        if (foundIndex >= 0) {
            result = this.collectionImplementations[foundIndex];
        }
        else {
            const foundConfigIndex = this.collectionConfigs.findIndex((config) => config.name === name);
            let config;
            if (foundConfigIndex >= 0) {
                config = this.collectionConfigs[foundConfigIndex];
            }
            else {
                config = {
                    bufferType: Types_1.BufferType.ALL,
                    key: "_id",
                    name: name,
                    version: 0
                };
            }
            const impl = new CollectionImpl_1.CollectionImpl(config, this.managers);
            this.collectionImplementations.push(impl);
            impl.addListener(this.managers.getCollectionFileManager());
            impl.addListener(this.managers.getDB());
            result = impl;
        }
        return result;
    }
}
exports.CollectionManager = CollectionManager;
//# sourceMappingURL=CollectionManager.js.map