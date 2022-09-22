"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorImpl = void 0;
const SortProcessor_1 = require("../sort/SortProcessor");
const Util_1 = require("../util/Util");
const FileSystemDBHelper_1 = require("../util/FileSystemDBHelper");
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
    sortByFilter(filter) {
        // assume the filter is in the format {fieldName:1|-1,fieldName2:1|-1}
        const sortItems = FileSystemDBHelper_1.FileSystemDBHelper.convertFilterIntoSort(filter);
        return this.sort(sortItems);
    }
}
exports.CursorImpl = CursorImpl;
//# sourceMappingURL=CursorImpl.js.map