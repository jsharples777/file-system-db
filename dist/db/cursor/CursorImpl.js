"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorImpl = void 0;
const SortProcessor_1 = require("../sort/SortProcessor");
const Util_1 = require("../util/Util");
class CursorImpl {
    constructor(items, copyObjects = true) {
        if (copyObjects) {
            this.items = Util_1.Util.copyObject(items);
        }
        else {
            this.items = items;
        }
        this.position = 0;
    }
    hasNext() {
        return (this.position < this.items.length);
    }
    next() {
        let result = null;
        if (this.position < this.items.length) {
            result = this.items[this.position];
        }
        this.position++;
        return result;
    }
    toArray() {
        return this.items;
    }
    sort(sortOrder) {
        return SortProcessor_1.SortProcessor.sortItems(this.items, sortOrder);
    }
}
exports.CursorImpl = CursorImpl;
//# sourceMappingURL=CursorImpl.js.map