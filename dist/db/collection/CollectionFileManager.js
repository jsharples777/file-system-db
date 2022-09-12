"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionFileManager = void 0;
const debug_1 = __importDefault(require("debug"));
const Types_1 = require("../config/Types");
const fs_1 = __importDefault(require("fs"));
const Util_1 = require("../util/Util");
const logger = (0, debug_1.default)('collection-file-manager');
var CollectionFileQueueEntryOperation;
(function (CollectionFileQueueEntryOperation) {
    CollectionFileQueueEntryOperation[CollectionFileQueueEntryOperation["write"] = 0] = "write";
    CollectionFileQueueEntryOperation[CollectionFileQueueEntryOperation["delete"] = 1] = "delete";
})(CollectionFileQueueEntryOperation || (CollectionFileQueueEntryOperation = {}));
class CollectionFileManager {
    constructor() {
        this.config = null;
        this.fileWriteQueue = [];
        this.isProcessingQueue = false;
        const queueInterval = parseInt(process.env.FILE_QUEUE_INTERVAL || '500');
        if (isNaN(queueInterval)) {
            this.fileQueueInterval = 500;
        }
        else {
            this.fileQueueInterval = queueInterval;
        }
        this.processFileQueue = this.processFileQueue.bind(this);
    }
    static getInstance() {
        if (!CollectionFileManager._instance) {
            CollectionFileManager._instance = new CollectionFileManager();
        }
        return CollectionFileManager._instance;
    }
    loadConfig(config) {
        this.config = config;
        // const interval = setInterval(() => {
        //     this.processFileQueue();
        // },this.fileQueueInterval);
        logger(`Starting file manager with queue interval of ${this.fileQueueInterval}`);
    }
    isDuplicateKey(collection, key) {
        var _a;
        let result = false;
        const collectionDir = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${collection}`;
        const files = fs_1.default.readdirSync(collectionDir);
        files.every((file) => {
            if (file.startsWith(key)) {
                result = true;
                return false;
            }
            else {
                return true;
            }
        });
        logger(`Is duplicate key for collection ${collection} and key ${key} = ${result}`);
        return result;
    }
    writeDataObjectFile(config, collection, key, object, checkForDuplicateKey) {
        if (checkForDuplicateKey) {
            if (this.isDuplicateKey(collection, key)) {
                throw new Types_1.DuplicateKey(`Key ${key} is already present in collection ${collection}`);
            }
        }
        this.fileWriteQueue.push({
            config: Util_1.Util.copyObject(config),
            collection,
            key,
            object,
            operation: CollectionFileQueueEntryOperation.write
        });
    }
    removeDataObjectFile(config, collection, key) {
        this.fileWriteQueue.push({
            config: Util_1.Util.copyObject(config),
            collection,
            key,
            object: null,
            operation: CollectionFileQueueEntryOperation.delete
        });
    }
    readDataObjectFile(collection, key) {
        var _a;
        let result = null;
        const objectFileName = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${collection}/${key}.entry`;
        if (fs_1.default.existsSync(objectFileName)) {
            const content = fs_1.default.readFileSync(objectFileName);
            try {
                result = JSON.parse(content.toString());
                logger(`Loading entry for collection ${collection}, entry ${key}`);
            }
            catch (err) {
                //invalid JSON - delete the file
                fs_1.default.rmSync(objectFileName);
            }
        }
        else {
            logger(`File Not Found for collection ${collection}, entry ${key}`);
        }
        return result;
    }
    writeCollectionConfig(config) {
        var _a;
        const objectFileName = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${config.name}/${config.name}.vrs`;
        if (fs_1.default.existsSync(objectFileName)) {
            logger(`Config File Found for collection ${config.name} - overwriting`);
            fs_1.default.rmSync(objectFileName);
        }
        fs_1.default.writeFileSync(objectFileName, JSON.stringify(config));
    }
    writeDataObjectFileContent(config, collection, key, object) {
        var _a;
        const objectFileName = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${collection}/${key}.entry`;
        if (fs_1.default.existsSync(objectFileName)) {
            logger(`File Found for collection ${collection}, entry ${key} - overwriting`);
            fs_1.default.rmSync(objectFileName);
        }
        fs_1.default.writeFileSync(objectFileName, JSON.stringify(object));
        this.writeCollectionConfig(config);
    }
    removeDataObjectFileContent(config, collection, key) {
        var _a;
        let result = false;
        const objectFileName = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${collection}/${key}.entry`;
        if (fs_1.default.existsSync(objectFileName)) {
            result = true;
            fs_1.default.rmSync(objectFileName);
            logger(`Deleting entry for collection ${collection}, entry ${key}`);
            this.writeCollectionConfig(config);
        }
        else {
            logger(`Deleting entry for collection ${collection}, entry ${key} - File not found ${objectFileName}`);
        }
        return result;
    }
    processFileQueue() {
        if (!this.isProcessingQueue) {
            this.isProcessingQueue = true;
            this.fileWriteQueue.forEach((entry) => {
                if (entry.operation === CollectionFileQueueEntryOperation.write) {
                    this.writeDataObjectFileContent(entry.config, entry.collection, entry.key, entry.object);
                }
                else {
                    this.removeDataObjectFileContent(entry.config, entry.collection, entry.key);
                }
            });
            this.fileWriteQueue = [];
            this.isProcessingQueue = false;
        }
    }
    checkWriteQueueForDataObject(collection, key) {
        let result = null;
        this.fileWriteQueue.forEach((entry) => {
            if (entry.operation === CollectionFileQueueEntryOperation.write) {
                if (entry.key === key) {
                    result = entry.object;
                }
            }
        });
        return result;
    }
    readCollectionConfig(collectionConfig) {
        var _a;
        let result = Util_1.Util.copyObject(collectionConfig);
        const configFileName = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${collectionConfig.name}/${collectionConfig.name}.vrs`;
        if (!fs_1.default.existsSync(configFileName)) {
            result.version = 1;
            fs_1.default.writeFileSync(configFileName, JSON.stringify(result));
        }
        else {
            result = JSON.parse(fs_1.default.readFileSync(configFileName).toString());
        }
        return result;
    }
    readEntireCollection(collectionConfig) {
        var _a;
        logger(`Loading collection ${collectionConfig.name}`);
        let results = {
            config: {},
            content: []
        };
        const collectionDir = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${collectionConfig.name}`;
        const files = fs_1.default.readdirSync(collectionDir);
        files.forEach((file) => {
            if (file.endsWith('.entry')) {
                const key = file.split('.')[0];
                results.content.push(this.readDataObjectFile(collectionConfig.name, key));
            }
        });
        results.config = this.readCollectionConfig(collectionConfig);
        return results;
    }
    die() {
        this.processFileQueue();
    }
    getBPM() {
        return Math.round(60000 / this.fileQueueInterval);
    }
    heartbeat() {
        this.processFileQueue();
    }
    isAlive() {
        return true;
    }
    getName() {
        return 'Collection File Manager';
    }
    birth() {
    }
    objectAdded(collection, key, object) {
        this.writeDataObjectFile(collection.getConfig(), collection.getName(), key, object, true);
    }
    objectRemoved(collection, key) {
        this.removeDataObjectFile(collection.getConfig(), collection.getName(), key);
    }
    objectUpdated(collection, key, object) {
        this.writeDataObjectFile(collection.getConfig(), collection.getName(), key, object, false);
    }
}
exports.CollectionFileManager = CollectionFileManager;
//# sourceMappingURL=CollectionFileManager.js.map