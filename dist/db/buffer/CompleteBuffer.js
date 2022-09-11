"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteBuffer = void 0;
const debug_1 = __importDefault(require("debug"));
const AbstractPartialBuffer_1 = require("./AbstractPartialBuffer");
const logger = (0, debug_1.default)('complete-buffer');
class CompleteBuffer extends AbstractPartialBuffer_1.AbstractPartialBuffer {
    constructor(config) {
        super(config);
        this.isComplete = this.isComplete.bind(this);
    }
    isComplete() {
        return true;
    }
}
exports.CompleteBuffer = CompleteBuffer;
//# sourceMappingURL=CompleteBuffer.js.map