"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidConfiguration = exports.MissingConfiguration = exports.BufferType = void 0;
var BufferType;
(function (BufferType) {
    BufferType[BufferType["NONE"] = 1] = "NONE";
    BufferType[BufferType["ALL"] = 2] = "ALL";
    BufferType[BufferType["FIFO"] = 3] = "FIFO";
    BufferType[BufferType["LIFESPAN"] = 4] = "LIFESPAN";
})(BufferType = exports.BufferType || (exports.BufferType = {}));
class MissingConfiguration extends Error {
    constructor(message) {
        super(message);
    }
}
exports.MissingConfiguration = MissingConfiguration;
class InvalidConfiguration extends Error {
    constructor(message) {
        super(message);
    }
}
exports.InvalidConfiguration = InvalidConfiguration;
//# sourceMappingURL=Types.js.map