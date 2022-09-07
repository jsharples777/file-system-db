"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferFactory = void 0;
const debug_1 = __importDefault(require("debug"));
const Types_1 = require("../Types");
const EmptyBuffer_1 = require("./EmptyBuffer");
const CompleteBuffer_1 = require("./CompleteBuffer");
const LifespanBuffer_1 = require("./LifespanBuffer");
const FIFOBuffer_1 = require("./FIFOBuffer");
const logger = (0, debug_1.default)('buffer-factory');
class BufferFactory {
    constructor() {
    }
    static getInstance() {
        if (!BufferFactory._instance) {
            BufferFactory._instance = new BufferFactory();
        }
        return BufferFactory._instance;
    }
    createBuffer(config) {
        let result;
        switch (config.bufferType) {
            case Types_1.BufferType.NONE: {
                result = new EmptyBuffer_1.EmptyBuffer();
                break;
            }
            case Types_1.BufferType.ALL: {
                result = new CompleteBuffer_1.CompleteBuffer(config);
                break;
            }
            case Types_1.BufferType.FIFO: {
                result = new FIFOBuffer_1.FIFOBuffer(config);
                break;
            }
            case Types_1.BufferType.LIFESPAN: {
                result = new LifespanBuffer_1.LifespanBuffer(config);
                break;
            }
        }
        return result;
    }
}
exports.BufferFactory = BufferFactory;
//# sourceMappingURL=BufferFactory.js.map