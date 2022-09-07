"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyBuffer = void 0;
class EmptyBuffer {
    addObject(key, object) {
    }
    getObject(key) {
        return null;
    }
    hasKey(key) {
        return false;
    }
    objects() {
        return [];
    }
    removeObject(key) {
    }
    replaceObject(key, object) {
    }
    initialise(objects) {
    }
    isComplete() {
        return false;
    }
}
exports.EmptyBuffer = EmptyBuffer;
//# sourceMappingURL=EmptyBuffer.js.map