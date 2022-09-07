"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractPartialBuffer = void 0;
const Types_1 = require("../Types");
const moment_1 = __importDefault(require("moment"));
class AbstractPartialBuffer {
    constructor(config) {
        this.config = config;
        this.bufferContent = [];
        const maxFifoBufferSize = parseInt(process.env.MAX_FIFO_BUFFER_SIZE || '1000');
        if (isNaN(maxFifoBufferSize)) {
            this.maxFifoBufferSize = 1000;
        }
        else {
            this.maxFifoBufferSize = maxFifoBufferSize;
        }
        const defaultBufferItemLifespan = parseInt(process.env.DEFAULT_BUFFER_ITEM_LIFESPAN || '60000');
        if (isNaN(defaultBufferItemLifespan)) {
            this.defaultBufferItemLifespan = 60000;
        }
        else {
            this.defaultBufferItemLifespan = defaultBufferItemLifespan;
        }
        if (config.bufferType === Types_1.BufferType.FIFO) {
            if (config.bufferSize && config.bufferSize > 0) {
                this.bufferSize = config.bufferSize;
            }
            else {
                this.bufferSize = this.maxFifoBufferSize;
            }
        }
        else {
            this.bufferSize = 0;
        }
        if (config.bufferType === Types_1.BufferType.LIFESPAN) {
            if (config.bufferItemLifecycleMilliseconds) {
                this.objectLifespan = config.bufferItemLifecycleMilliseconds;
            }
            else {
                this.objectLifespan = this.defaultBufferItemLifespan;
            }
        }
        else {
            this.objectLifespan = -1;
        }
        this.checkObjectLifespans = this.checkObjectLifespans.bind(this);
        // start a buffer cleaner for object lifespans if necessary
        if (this.config.bufferType === Types_1.BufferType.LIFESPAN) {
            const interval = setInterval(() => {
                this.checkObjectLifespans();
            }, (this.defaultBufferItemLifespan * 1000) / 2);
        }
    }
    isComplete() {
        return false;
    }
    _addObject(key, object) {
        let timeToDie = -1;
        const lastUsed = parseInt((0, moment_1.default)().format('YYYYMMDDHHmmss'));
        if (this.config.bufferType === Types_1.BufferType.LIFESPAN) {
            timeToDie = parseInt((0, moment_1.default)().add(this.objectLifespan, 'seconds').format('YYYYMMDDHHmmss'));
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
                this.bufferContent.pop();
            }
        }
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
            result = this.bufferContent[foundIndex].content;
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
        this.bufferContent.forEach((entry) => {
            results.push(entry.content);
        });
        return results;
    }
    removeObject(key) {
        const foundIndex = this.bufferContent.findIndex((entry) => entry.key === key);
        if (foundIndex >= 0) {
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
            }
        }
        else {
            this._addObject(key, object);
        }
    }
    checkObjectLifespans() {
        const now = parseInt((0, moment_1.default)().format('YYYYMMDDHHmmss'));
        let index = this.bufferContent.length - 1;
        while (index >= 0) {
            const entry = this.bufferContent[index];
            if (entry) {
                if (entry.timeToDie >= now) {
                    this.bufferContent.splice(index, 1);
                }
            }
            index--;
        }
    }
}
exports.AbstractPartialBuffer = AbstractPartialBuffer;
//# sourceMappingURL=AbstractPartialBuffer.js.map