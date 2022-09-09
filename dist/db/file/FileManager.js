"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManager = void 0;
const debug_1 = __importDefault(require("debug"));
const fs_1 = __importDefault(require("fs"));
const logger = (0, debug_1.default)('file-manager');
var FileQueueEntryOperation;
(function (FileQueueEntryOperation) {
    FileQueueEntryOperation[FileQueueEntryOperation["write"] = 0] = "write";
    FileQueueEntryOperation[FileQueueEntryOperation["delete"] = 1] = "delete";
})(FileQueueEntryOperation || (FileQueueEntryOperation = {}));
class FileManager {
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
        if (!FileManager._instance) {
            FileManager._instance = new FileManager();
        }
        return FileManager._instance;
    }
    loadConfig(config) {
        this.config = config;
        const interval = setInterval(() => {
            this.processFileQueue();
        }, this.fileQueueInterval);
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
    writeDataObjectFile(collection, key, object) {
        this.fileWriteQueue.push({
            collection,
            key,
            object,
            operation: FileQueueEntryOperation.write
        });
    }
    removeDataObjectFile(collection, key) {
        this.fileWriteQueue.push({
            collection,
            key,
            object: null,
            operation: FileQueueEntryOperation.delete
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
    writeDataObjectFileContent(collection, key, object) {
        var _a;
        const objectFileName = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${collection}/${key}.entry`;
        if (fs_1.default.existsSync(objectFileName)) {
            logger(`File Found for collection ${collection}, entry ${key} - overwriting`);
            fs_1.default.rmSync(objectFileName);
        }
        fs_1.default.writeFileSync(objectFileName, JSON.stringify(object));
    }
    removeDataObjectFileContent(collection, key) {
        var _a;
        let result = false;
        const objectFileName = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${collection}/${key}.entry`;
        if (fs_1.default.existsSync(objectFileName)) {
            result = true;
            fs_1.default.rmSync(objectFileName);
            logger(`Deleting entry for collection ${collection}, entry ${key}`);
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
                if (entry.operation === FileQueueEntryOperation.write) {
                    this.writeDataObjectFileContent(entry.collection, entry.key, entry.object);
                }
                else {
                    this.removeDataObjectFileContent(entry.collection, entry.key);
                }
            });
            this.fileWriteQueue = [];
            this.isProcessingQueue = false;
        }
    }
    checkWriteQueueForDataObject(collection, key) {
        let result = null;
        this.fileWriteQueue.forEach((entry) => {
            if (entry.operation === FileQueueEntryOperation.write) {
                if (entry.key === key) {
                    result = entry.object;
                }
            }
        });
        return result;
    }
    readEntireCollection(collection) {
        var _a;
        logger(`Loading collection ${collection}`);
        let results = [];
        const collectionDir = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${collection}`;
        const files = fs_1.default.readdirSync(collectionDir);
        files.forEach((file) => {
            if (file.endsWith('.entry')) {
                const key = file.split('.')[0];
                results.push(this.readDataObjectFile(collection, key));
            }
        });
        return results;
    }
}
exports.FileManager = FileManager;
//# sourceMappingURL=CollectionFileManager.js.map
