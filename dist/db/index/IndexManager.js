"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexManager = void 0;
const debug_1 = __importDefault(require("debug"));
const IndexImplementation_1 = require("./IndexImplementation");
const CollectionManager_1 = require("../collection/CollectionManager");
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
    loadConfig(config) {
        logger(`Loading index configurations`);
        this.config = config;
        const rebuildIndexes = ((process.env.REBUILD_INDEXES_ON_STARTUP || 'N') === 'Y');
        logger(`Will rebuild indexes? ${rebuildIndexes}`);
        if (this.config) {
            const dbLocation = this.config.dbLocation;
            // check on each index file
            this.config.indexes.forEach((indexConfig) => {
                const index = new IndexImplementation_1.IndexImplementation(dbLocation, indexConfig);
                if (rebuildIndexes)
                    index.rebuild();
                CollectionManager_1.CollectionManager.getInstance().getCollection(indexConfig.collection).addListener(index);
                this.indexes.push(index);
            });
        }
    }
}
exports.IndexManager = IndexManager;
//# sourceMappingURL=IndexManager.js.map