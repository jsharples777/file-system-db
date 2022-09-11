"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchCursorImpl = void 0;
const CursorImpl_1 = require("../cursor/CursorImpl");
const SortProcessor_1 = require("../sort/SortProcessor");
class SearchCursorImpl extends CursorImpl_1.CursorImpl {
    constructor(items) {
        super(items);
    }
    sort(sortOrder) {
        return SortProcessor_1.SortProcessor.sortItems(this.items, sortOrder);
    }
}
exports.SearchCursorImpl = SearchCursorImpl;
//# sourceMappingURL=SearchCursorImpl.js.map