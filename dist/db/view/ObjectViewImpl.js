"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectViewImpl = void 0;
const CursorImpl_1 = require("../cursor/CursorImpl");
class ObjectViewImpl {
    constructor(collection, searchFilter, sortOrder) {
        this.listeners = [];
        this.collection = collection;
        this.searchFilter = searchFilter;
        this.sortOrder = sortOrder;
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    content() {
        return new CursorImpl_1.CursorImpl([]);
    }
    getName() {
        return "";
    }
    objectAdded(collection, key, object) {
    }
    objectRemoved(collection, key) {
    }
    objectUpdated(collection, key, object) {
    }
}
exports.ObjectViewImpl = ObjectViewImpl;
//# sourceMappingURL=ObjectViewImpl.js.map