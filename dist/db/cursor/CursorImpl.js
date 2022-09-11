"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorImpl = void 0;
const DB_1 = require("../DB");
class CursorImpl {
    constructor(items) {
        this.items = DB_1.DB.copyObject(items);
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
}
exports.CursorImpl = CursorImpl;
//# sourceMappingURL=CursorImpl.js.map