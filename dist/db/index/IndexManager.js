"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexManager = void 0;
const debug_1 = __importDefault(require("debug"));
const IndexImplementation_1 = require("./IndexImplementation");
const logger = (0, debug_1.default)('index-manager');
class IndexManager {
    constructor() {
        this.indexes = [];
    }
    static getInstance() {
        if (!IndexManager._instance) {
            IndexManager._instance = new IndexManager();
        }
        return IndexManager._instance;
    }
    getMatchingIndex(collection, search) {
        logger(`Looking for index for collection ${collection} for search criteria`);
        logger(search);
        let result = null;
        // look for full matches first
        this.indexes.every((index) => {
            if (collection === index.getCollection()) { // matches collection
                const fullMatch = index.matchesFilter(search);
                if (fullMatch) {
                    logger(`Looking for index for collection ${collection} for search criteria, found full match index ${index.getName()}`);
                    result = index;
                    return false;
                }
            }
            return true;
        });
        if (!result) {
            // look for partial matches next
            this.indexes.every((index) => {
                if (collection === index.getCollection()) { // matches collection
                    const match = index.partiallyMatchesFilter(search);
                    if (match) {
                        logger(`Looking for index for collection ${collection} for search criteria, found partial match index ${index.getName()}`);
                        result = index;
                        return false;
                    }
                }
                return true;
            });
        }
        return result;
    }
    getIndexConfig(name) {
        let result = null;
        if (this.config) {
            const foundIndex = this.config.indexes.findIndex((index) => index.name === name);
            if (foundIndex >= 0) {
                result = this.config.indexes[foundIndex];
            }
        }
        return result;
    }
    loadConfig(config) {
        this.config = config;
        if (this.config) {
            logger(`Loading index configurations`);
            const dbLocation = this.config.dbLocation;
            // check on each index file
            this.config.indexes.forEach((indexConfig) => {
                const index = new IndexImplementation_1.IndexImplementation(dbLocation, indexConfig);
                this.indexes.push(index);
            });
        }
    }
    entryInserted(collection, keyValue, version, values) {
        if (this.config) {
            this.indexes.forEach((index) => {
                if (index.getCollection() === collection) {
                    logger(`Adding entry for index ${index.getName()} for collection ${collection} with key ${keyValue}`);
                    index.objectAdded(version, keyValue, values);
                }
            });
        }
    }
    entryUpdated(collection, keyValue, version, values) {
        if (this.config) {
            this.indexes.forEach((index) => {
                if (index.getCollection() === collection) {
                    logger(`Updating entry for index ${index.getName()} for collection ${collection} with key ${keyValue}`);
                    index.objectUpdated(version, keyValue, values);
                }
            });
        }
    }
    entryDeleted(collection, keyValue, version) {
        if (this.config) {
            this.indexes.forEach((index) => {
                if (index.getCollection() === collection) {
                    logger(`Removing entry for index ${index.getName()} for collection ${collection} with key ${keyValue}`);
                    index.objectRemoved(version, keyValue);
                }
            });
        }
    }
}
exports.IndexManager = IndexManager;
//# sourceMappingURL=IndexManager.js.map