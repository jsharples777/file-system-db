"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifespanBuffer = void 0;
const AbstractPartialBuffer_1 = require("./AbstractPartialBuffer");
class LifespanBuffer extends AbstractPartialBuffer_1.AbstractPartialBuffer {
    constructor(config, lifeManager) {
        super(config, lifeManager);
    }
}
exports.LifespanBuffer = LifespanBuffer;
//# sourceMappingURL=LifespanBuffer.js.map