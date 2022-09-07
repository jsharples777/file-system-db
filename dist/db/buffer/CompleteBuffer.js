"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteBuffer = void 0;
const moment_1 = __importDefault(require("moment"));
class CompleteBuffer {
    constructor(config) {
        this.config = config;
        this.bufferContent = [];
    }
    addObject(key, object) {
        if (!this.hasKey(key)) {
            const lastUsed = parseInt((0, moment_1.default)().format('YYYYMMDDHHmmss'));
            const entry = {
                key: object[this.config.key],
                lastUsed: lastUsed,
                timeToDie: -1,
                content: object
            };
            this.bufferContent.push(entry);
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
        const lastUsed = parseInt((0, moment_1.default)().format('YYYYMMDDHHmmss'));
        objects.forEach((object) => {
            const entry = {
                key: object[this.config.key],
                lastUsed: lastUsed,
                timeToDie: -1,
                content: object
            };
            this.bufferContent.push(entry);
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
        }
    }
    isComplete() {
        return true;
    }
}
exports.CompleteBuffer = CompleteBuffer;
//# sourceMappingURL=CompleteBuffer.js.map