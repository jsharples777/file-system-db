"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchProcessor = void 0;
const SearchCursorImpl_1 = require("./SearchCursorImpl");
class SearchProcessor {
    static searchCollection(collection, search) {
        return new SearchCursorImpl_1.SearchCursorImpl(collection.find()); // TODO
    }
}
exports.SearchProcessor = SearchProcessor;
//# sourceMappingURL=SearchProcessor.js.map