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
                    index.objectAdded(version, keyValue, values);
                }
            });
        }
    }
    entryUpdated(collection, keyValue, version, values) {
        if (this.config) {
            this.indexes.forEach((index) => {
                if (index.getCollection() === collection) {
                    index.objectUpdated(version, keyValue, values);
                }
            });
        }
    }
    entryDeleted(collection, keyValue, version) {
        if (this.config) {
            this.indexes.forEach((index) => {
                if (index.getCollection() === collection) {
                    index.objectRemoved(version, keyValue);
                }
            });
        }
    }
}
exports.IndexManager = IndexManager;
//# sourceMappingURL=IndexManager.js.map