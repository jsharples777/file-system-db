"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogFileManager = void 0;
const debug_1 = __importDefault(require("debug"));
const fs_1 = __importDefault(require("fs"));
const logger = (0, debug_1.default)('log-file-manager');
class LogFileManager {
    constructor(managers) {
        this.fileWriteQueue = [];
        this.isProcessingQueue = false;
        this.bIsAlive = false;
        this.managers = managers;
        this.logLocation = process.env.LOG_FILE_LOCATION || 'log/operations.json';
        const queueInterval = parseInt(process.env.FILE_QUEUE_INTERVAL || '500');
        if (isNaN(queueInterval)) {
            this.fileQueueInterval = 500;
        }
        else {
            this.fileQueueInterval = queueInterval;
        }
        this.processFileQueue = this.processFileQueue.bind(this);
        this.setLogLocation = this.setLogLocation.bind(this);
        this.addOperation = this.addOperation.bind(this);
        this.loadLogFile = this.loadLogFile.bind(this);
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
        return this.bIsAlive;
    }
    getName() {
        return 'Log File Manager';
    }
    birth() {
        this.bIsAlive = true;
    }
    setLogLocation(logLocation) {
        this.logLocation = logLocation;
    }
    addOperation(entry) {
        if (this.managers.getDB().isLoggingChanges()) {
            this.fileWriteQueue.push(entry);
        }
    }
    loadLogFile(logFileLocation) {
        this.managers.getLifecycleManager().suspend();
        const entries = [];
        const buffer = fs_1.default.readFileSync(logFileLocation);
        const bufferLines = buffer.toString().split('\r\n');
        bufferLines.forEach((line) => {
            if (line.trim().length > 0) {
                try {
                    const entry = JSON.parse(line.trim());
                    entries.push(entry);
                }
                catch (err) {
                    console.log(err);
                }
            }
        });
        logger('Loaded ' + entries.length + ' entries from log file ' + logFileLocation);
        this.managers.getCollectionFileManager().addFileEntries(entries);
        fs_1.default.rmSync(logFileLocation);
        this.managers.getLifecycleManager().resume();
    }
    processFileQueue() {
        if (!this.isProcessingQueue) {
            this.isProcessingQueue = true;
            if (this.fileWriteQueue.length > 0) {
                let buffer = '';
                this.fileWriteQueue.forEach((entry) => {
                    buffer += JSON.stringify(entry) + '\r\n';
                });
                console.log(buffer);
                fs_1.default.appendFile(this.logLocation, buffer, 'utf8', () => {
                });
                this.fileWriteQueue = [];
            }
            this.isProcessingQueue = false;
        }
    }
}
exports.LogFileManager = LogFileManager;
//# sourceMappingURL=LogFileManager.js.map