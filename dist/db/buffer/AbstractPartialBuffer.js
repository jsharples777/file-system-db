"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractPartialBuffer = void 0;
const Types_1 = require("../config/Types");
const moment_1 = __importDefault(require("moment"));
const debug_1 = __importDefault(require("debug"));
const logger = (0, debug_1.default)('abstract-partial-buffer');
const dLogger = (0, debug_1.default)('abstract-partial-buffer-detail');
class AbstractPartialBuffer {
    constructor(config, lifeManager) {
        this.config = config;
        this.lifeManager = lifeManager;
        this.bufferContent = [];
        this.checkObjectLifespans = this.checkObjectLifespans.bind(this);
        const maxFifoBufferSize = parseInt(process.env.MAX_FIFO_BUFFER_SIZE || '1000');
        if (isNaN(maxFifoBufferSize)) {
            this.maxFifoBufferSize = 1000;
        }
        else {
            this.maxFifoBufferSize = maxFifoBufferSize;
        }
        const defaultBufferItemLifespan = parseInt(process.env.DEFAULT_BUFFER_ITEM_LIFESPAN_SEC || '600');
        if (isNaN(defaultBufferItemLifespan)) {
            this.defaultBufferItemLifespan = 600;
        }
        else {
            this.defaultBufferItemLifespan = defaultBufferItemLifespan;
        }
        this.bufferSize = 0;
        this.objectLifespan = -1;
        switch (config.bufferType) {
            case (Types_1.BufferType.FIFO): {
                if (config.bufferSize && config.bufferSize > 0) {
                    this.bufferSize = config.bufferSize;
                }
                else {
                    this.bufferSize = this.maxFifoBufferSize;
                }
                logger(`Created FIFO buffer for collection ${config.name} with buffer size ${this.bufferSize}`);
                break;
            }
            case (Types_1.BufferType.LIFESPAN): {
                if (config.bufferItemLifecycleSeconds) {
                    this.objectLifespan = config.bufferItemLifecycleSeconds;
                }
                else {
                    this.objectLifespan = this.defaultBufferItemLifespan;
                }
                if (this.lifeManager)
                    this.lifeManager.addLife(this);
                logger(`Created Lifespan buffer for collection ${config.name} with object lifespan of ${this.objectLifespan} `);
                break;
            }
            case (Types_1.BufferType.ALL): {
                break;
            }
        }
    }
    clear() {
        this.bufferContent = [];
    }
    isComplete() {
        return false;
    }
    addObject(key, object) {
        if (!this.hasKey(key)) {
            this._addObject(key, object);
        }
        else {
            this.replaceObject(key, object);
        }
    }
    getObject(key) {
        let result = null;
        const foundIndex = this.bufferContent.findIndex((entry) => entry.key === key);
        if (foundIndex >= 0) {
            const entry = this.bufferContent[foundIndex];
            result = entry.content;
            if (this.config.bufferType === Types_1.BufferType.LIFESPAN) {
                entry.timeToDie = parseInt((0, moment_1.default)().add(this.objectLifespan, 'seconds').format('YYYYMMDDHHmmss'));
            }
        }
        return result;
    }
    hasKey(key) {
        return (this.bufferContent.findIndex((entry) => entry.key === key) >= 0);
    }
    initialise(objects) {
        this.bufferContent = [];
        let timeToDie = -1;
        const lastUsed = parseInt((0, moment_1.default)().format('YYYYMMDDHHmmss'));
        if (this.config.bufferType === Types_1.BufferType.LIFESPAN) {
            timeToDie = parseInt((0, moment_1.default)().add(this.objectLifespan, 'seconds').format('YYYYMMDDHHmmss'));
        }
        objects.forEach((object, index) => {
            const entry = {
                key: object[this.config.key],
                lastUsed: lastUsed,
                timeToDie: timeToDie,
                content: object
            };
            if (this.config.bufferType === Types_1.BufferType.FIFO) {
                if (index < this.bufferSize) {
                    this.bufferContent.push(entry);
                }
            }
            else {
                this.bufferContent.push(entry);
            }
        });
    }
    objects() {
        let results = [];
        const timeToDie = parseInt((0, moment_1.default)().add(this.objectLifespan, 'seconds').format('YYYYMMDDHHmmss'));
        this.bufferContent.forEach((entry) => {
            results.push(entry.content);
            if (this.config.bufferType === Types_1.BufferType.LIFESPAN) {
                entry.timeToDie = timeToDie;
            }
        });
        return results;
    }
    removeObject(key) {
        const foundIndex = this.bufferContent.findIndex((entry) => entry.key === key);
        if (foundIndex >= 0) {
            logger(`Removing object ${key} from buffer for collection ${this.config.name}`);
            this.bufferContent.splice(foundIndex, 1);
        }
    }
    replaceObject(key, object) {
        const foundIndex = this.bufferContent.findIndex((entry) => entry.key === key);
        if (foundIndex >= 0) {
            this.bufferContent[foundIndex].content = object;
            if (this.config.bufferType === Types_1.BufferType.LIFESPAN) {
                const timeToDie = parseInt((0, moment_1.default)().add(this.objectLifespan, 'seconds').format('YYYYMMDDHHmmss'));
                this.bufferContent[foundIndex].timeToDie = timeToDie;
                logger(`Replacing object ${key} to lifespan buffer for collection ${this.config.name}, restarting lifespan of ${this.objectLifespan} seconds`);
            }
            else {
                logger(`Replacing object ${key} from buffer for collection ${this.config.name}`);
            }
        }
        else {
            this._addObject(key, object);
        }
    }
    getName() {
        return 'Lifespan Buffer';
    }
    isAlive() {
        return true;
    }
    heartbeat() {
        this.checkObjectLifespans();
    }
    birth() {
    }
    die() {
    }
    getBPM() {
        return 60 / (this.objectLifespan / 2);
    }
    checkObjectLifespans() {
        if (this.bufferContent.length > 0) {
            logger(`Lifespan buffer for collection ${this.config.name} - checking lifespans for ${this.bufferContent.length} objects`);
            const now = parseInt((0, moment_1.default)().format('YYYYMMDDHHmmss'));
            let index = this.bufferContent.length - 1;
            let removedCount = 0;
            while (index >= 0) {
                const entry = this.bufferContent[index];
                if (entry) {
                    dLogger(`Object ${entry.key} for collection ${this.config.name} time to die is ${entry.timeToDie} vs ${now}`);
                    if (entry.timeToDie <= now) {
                        dLogger(`Object ${entry.key} for collection ${this.config.name} has expired - removing`);
                        this.bufferContent.splice(index, 1);
                        removedCount++;
                    }
                }
                index--;
            }
            logger(`Lifespan buffer for collection ${this.config.name} - removed ${removedCount} objects`);
        }
    }
    _addObject(key, object) {
        let timeToDie = -1;
        const lastUsed = parseInt((0, moment_1.default)().format('YYYYMMDDHHmmss'));
        if (this.config.bufferType === Types_1.BufferType.LIFESPAN) {
            timeToDie = parseInt((0, moment_1.default)().add(this.objectLifespan, 'seconds').format('YYYYMMDDHHmmss'));
            logger(`Adding object ${key} to lifespan buffer for collection ${this.config.name} with lifespan of ${this.objectLifespan} seconds`);
        }
        else {
            logger(`Adding object ${key} to buffer for collection ${this.config.name}`);
        }
        const entry = {
            key: key,
            lastUsed: lastUsed,
            timeToDie: timeToDie,
            content: object
        };
        this.bufferContent.unshift(entry);
        if (this.config.bufferType === Types_1.BufferType.FIFO) {
            if (this.bufferContent.length > this.bufferSize) {
                logger(`FIFO buffer for collection ${this.config.name} too large, removing oldest entry`);
                this.bufferContent.pop();
            }
        }
    }
}
exports.AbstractPartialBuffer = AbstractPartialBuffer;
//# sourceMappingURL=AbstractPartialBuffer.js.map