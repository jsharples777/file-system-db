"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexFileManager = void 0;
const debug_1 = __importDefault(require("debug"));
const fs_1 = __importDefault(require("fs"));
const logger = (0, debug_1.default)('index-file-manager');
class IndexFileManager {
    constructor() {
        this.config = null;
        this.fileWriteQueue = [];
        this.isProcessingQueue = false;
        const queueInterval = parseInt(process.env.INDEX_QUEUE_INTERVAL || '500');
        if (isNaN(queueInterval)) {
            this.fileQueueInterval = 500;
        }
        else {
            this.fileQueueInterval = queueInterval;
        }
        this.processFileQueue = this.processFileQueue.bind(this);
    }
    static getInstance() {
        if (!IndexFileManager._instance) {
            IndexFileManager._instance = new IndexFileManager();
        }
        return IndexFileManager._instance;
    }
    loadConfig(config) {
        this.config = config;
        // const interval = setInterval(() => {
        //     this.processFileQueue();
        // },this.fileQueueInterval);
        logger(`Starting index file manager with queue interval of ${this.fileQueueInterval}`);
    }
    writeIndexFile(index) {
        // add the index to the queue, if not already in the queue
        const foundIndex = this.fileWriteQueue.findIndex((indexInQueue) => indexInQueue.getName() === index.getName());
        if (foundIndex < 0) {
            this.fileWriteQueue.push(index);
        }
    }
    writeIndex(version, content) {
        var _a, _b;
        const indexVersionFileName = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${version.collection}/${version.name}.vrs`;
        if (fs_1.default.existsSync(indexVersionFileName)) {
            logger(`Removing old index version file for index ${version.name} at ${indexVersionFileName}`);
            fs_1.default.rmSync(indexVersionFileName);
        }
        fs_1.default.writeFileSync(indexVersionFileName, JSON.stringify(version));
        const indexContentFileName = `${(_b = this.config) === null || _b === void 0 ? void 0 : _b.dbLocation}/${version.collection}/${version.name}.idx`;
        if (fs_1.default.existsSync(indexContentFileName)) {
            logger(`Removing old index file for index ${version.name} at ${indexContentFileName}`);
            fs_1.default.rmSync(indexContentFileName);
        }
        fs_1.default.writeFile(indexContentFileName, JSON.stringify(content), { flag: 'w' }, () => { });
    }
    readIndex(collection, name) {
        var _a, _b;
        let result = {
            version: null,
            content: null
        };
        const indexVersionFileName = `${(_a = this.config) === null || _a === void 0 ? void 0 : _a.dbLocation}/${collection}/${name}.vrs`;
        if (!fs_1.default.existsSync(indexVersionFileName)) {
            let indexVersion = {
                version: 1,
                name: name,
                collection: collection
            };
            logger(`Setting up index version file for index ${name} at ${indexVersionFileName}`);
            fs_1.default.writeFileSync(indexVersionFileName, JSON.stringify(indexVersion));
            result.version = indexVersion;
        }
        else {
            const buffer = fs_1.default.readFileSync(indexVersionFileName);
            logger(`Setting up index ${name} - loading existing version file`);
            result.version = JSON.parse(buffer.toString());
        }
        const indexContentFileName = `${(_b = this.config) === null || _b === void 0 ? void 0 : _b.dbLocation}/${collection}/${name}.idx`;
        if (!fs_1.default.existsSync(indexContentFileName)) {
            logger(`Creating empty index file for index ${name} at ${indexContentFileName}`);
            const indexContent = {
                version: 1,
                entries: []
            };
            fs_1.default.writeFileSync(indexContentFileName, JSON.stringify(indexContent));
            result.content = indexContent;
        }
        else {
            const buffer = fs_1.default.readFileSync(indexContentFileName);
            logger(`Setting up index ${name} - loading existing version file`);
            result.content = JSON.parse(buffer.toString());
        }
        return result;
    }
    processFileQueue() {
        if (!this.isProcessingQueue) {
            this.isProcessingQueue = true;
            this.fileWriteQueue.forEach((index) => {
                this.writeIndex(index.getIndexVersion(), index.getIndexContent());
            });
            this.fileWriteQueue = [];
            this.isProcessingQueue = false;
        }
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
        return "Index File Manager";
    }
    birth() {
    }
}
exports.IndexFileManager = IndexFileManager;
//# sourceMappingURL=IndexFileManager.js.map