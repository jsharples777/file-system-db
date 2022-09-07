"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexManager = void 0;
const debug_1 = __importDefault(require("debug"));
const fs = __importStar(require("fs"));
const CollectionManager_1 = require("./CollectionManager");
const logger = (0, debug_1.default)('index-manager');
class IndexManager {
    constructor() {
        this.indexVersions = [];
    }
    static getInstance() {
        if (!IndexManager._instance) {
            IndexManager._instance = new IndexManager();
        }
        return IndexManager._instance;
    }
    setupIndex(name, collectionName) {
        var _a, _b;
        logger(`Setting up index ${name}`);
        let result = {
            version: 1,
            name: name,
            collection: collectionName
        };
        const indexFileName = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${collectionName}/${name}.idx`;
        if (!fs.existsSync(indexFileName)) {
            logger(`Creating empty index file for index ${name} at ${indexFileName}`);
            const indexContent = {
                version: 1,
                entries: []
            };
            fs.writeFileSync(indexFileName, JSON.stringify(indexContent));
        }
        const indexVersionFileName = `${(_b = this.config) === null || _b === void 0 ? void 0 : _b.dbLocation}/${collectionName}/${name}.vrs`;
        if (!fs.existsSync(indexVersionFileName)) {
            logger(`Setting up index version file for index ${name} at ${indexVersionFileName}`);
            fs.writeFileSync(indexFileName, JSON.stringify(result));
        }
        else {
            const buffer = fs.readFileSync(indexVersionFileName);
            logger(`Setting up index ${name} - loading existing version file`);
            result = JSON.parse(buffer.toString());
        }
        logger(result);
        return result;
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
    getIndexConfigByCollection(name) {
        let result = null;
        if (this.config) {
            const foundIndex = this.config.indexes.findIndex((index) => index.name === name);
            if (foundIndex >= 0) {
                result = this.config.indexes[foundIndex];
            }
        }
        return result;
    }
    rebuildIndex(version) {
        if (this.config) {
            const collection = CollectionManager_1.CollectionManager.getInstance().getCollection(version.collection);
            const indexContent = {
                version: collection.getVersion(),
                entries: []
            };
            const entries = collection.find();
            entries.forEach((entry) => {
                const indexConfig = this.getIndexConfig(version.name);
                if (indexConfig) {
                    const indexEntry = {
                        keyValue: entry._id,
                        fieldValues: []
                    };
                    // find each field for index config
                    indexConfig.fields.forEach((field => {
                        const fieldValue = this.getFieldValue(entry, field);
                        if (fieldValue) {
                            indexEntry.fieldValues.push({
                                field: field,
                                value: fieldValue
                            });
                        }
                    }));
                    indexContent.entries.push(indexEntry);
                }
            });
        }
    }
    loadConfig(config) {
        this.config = config;
        // check on each index file
        this.config.indexes.forEach((index) => {
            const version = this.setupIndex(index.name, index.collection);
            this.indexVersions.push(version);
            // check version sync for collection
            logger(`Checking index ${index.name} sync for collection ${index.collection}`);
            const collection = CollectionManager_1.CollectionManager.getInstance().getCollection(index.collection);
            if (collection.getVersion() !== version.version) {
                // rebuild index
                logger(`index ${index.name} mismatch with collection ${index.collection} - ${collection.getVersion()} vs ${version.version}`);
                this.rebuildIndex(version);
            }
        });
    }
    entryInserted(collection, keyValue, version, values) {
    }
    entryUpdated(collection, keyValue, version, values) {
    }
    entryDeleted(collection, keyValue, version) {
    }
}
exports.IndexManager = IndexManager;
//# sourceMappingURL=IndexManager.js.map