"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortProcessor = exports.Sorter = void 0;
const SortTypes_1 = require("./SortTypes");
const CursorImpl_1 = require("../cursor/CursorImpl");
const Util_1 = require("../util/Util");
class Sorter {
    constructor(sortOrder) {
        this.sortOrder = sortOrder;
        this.sort = this.sort.bind(this);
    }
    sortByFieldAndOrder(item1, item2, fieldName, order) {
        let result = 0;
        const fieldValue1 = Util_1.Util.getFieldValue(item1, fieldName);
        const fieldValue2 = Util_1.Util.getFieldValue(item2, fieldName);
        if (fieldValue1) {
            if (fieldValue2) {
                if (fieldValue1 > fieldValue2) {
                    if (order === SortTypes_1.Order.ascending) {
                        result = 1;
                    }
                    else {
                        result = -1;
                    }
                }
                else if (fieldValue1 < fieldValue2) {
                    if (order === SortTypes_1.Order.ascending) {
                        result = -1;
                    }
                    else {
                        result = 1;
                    }
                }
            }
            else {
                if (order === SortTypes_1.Order.ascending) {
                    result = 1;
                }
                else {
                    result = -1;
                }
            }
        }
        else if (fieldValue2) {
            if (order === SortTypes_1.Order.ascending) {
                result = -1;
            }
            else {
                result = 1;
            }
        }
        return result;
    }
    sort(item1, item2) {
        let result = 0;
        // sort by each field
        this.sortOrder.every((sortItem) => {
            const itemResult = this.sortByFieldAndOrder(item1, item2, sortItem.field, sortItem.order);
            if (itemResult != 0) {
                result = itemResult;
                return false;
            }
            else {
                return true;
            }
        });
        return result;
    }
}
exports.Sorter = Sorter;
class SortProcessor {
    static sortItems(items, sortOrder) {
        const sorter = new Sorter(sortOrder);
        const sortedItems = items.sort(sorter.sort);
        return new CursorImpl_1.CursorImpl(sortedItems, false);
    }
}
exports.SortProcessor = SortProcessor;
//# sourceMappingURL=SortProcessor.js.map