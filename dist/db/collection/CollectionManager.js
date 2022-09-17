"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionManager = void 0;
const debug_1 = __importDefault(require("debug"));
const Types_1 = require("../config/Types");
const fs_1 = __importDefault(require("fs"));
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
            result = impl;
        }
        return result;
    }
    setupCollection(name) {
        var _a, _b;
        logger(`Setting up collection ${name}`);
        let result = {
            bufferSize: 0,
            bufferType: Types_1.BufferType.NONE,
            key: "_id",
            version: 1,
            name: name
        };
        const foundIndex = this.collectionConfigs.findIndex((config) => config.name === name);
        if (foundIndex >= 0) {
            result = this.collectionConfigs[foundIndex];
        }
        const collectionDir = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${name}`;
        if (!fs_1.default.existsSync(collectionDir)) {
            logger(`Setting up collection ${name} - making collection directory ${collectionDir}`);
            fs_1.default.mkdirSync(collectionDir);
        }
        const versionFileName = `${(_b = this.config) === null || _b === void 0 ? void 0 : _b.dbLocation}/${name}/${name}.vrs`;
        if (!fs_1.default.existsSync(versionFileName)) {
            logger(`Setting up collection ${name} - making collection version file`);
            fs_1.default.writeFileSync(versionFileName, JSON.stringify(result));
        }
        else {
            const buffer = fs_1.default.readFileSync(versionFileName);
            logger(`Setting up collection ${name} - loading existing collection version file`);
            const currentVersion = JSON.parse(buffer.toString());
            result.version = currentVersion.version;
        }
        logger(result);
        return result;
    }
}
exports.CollectionManager = CollectionManager;
//# sourceMappingURL=CollectionManager.js.map