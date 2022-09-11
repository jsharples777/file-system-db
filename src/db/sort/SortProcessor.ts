import {SortOrder, SortOrderType} from "./SortTypes";
import {SortedCursor} from "../cursor/SortedCursor";
import {SortedCursorImpl} from "./SortedCursorImpl";

export class Sorter {
    private sortOrder: SortOrder;
    constructor(sortOrder:SortOrder) {
        this.sortOrder = sortOrder;
    }

    public sortByFieldAndOrder(item1:any, item2:any, fieldName:string, order:SortOrderType):number {
        let result = 0;
        const fieldValue1 = item1[fieldName];
        const fieldValue2 = item2[fieldName];
        if (fieldValue1) {
            if (fieldValue2) {
                if (fieldValue1 > fieldValue2) {
                    if (order === SortOrderType.ascending) {
                        result = -1;
                    }
                    else {
                        result = 1;
                    }
                }
                else if (fieldValue1 < fieldValue2) {
                    if (order === SortOrderType.ascending) {
                        result = 1;
                    }
                    else {
                        result = -1;
                    }
                }
            }
            else {
                if (order === SortOrderType.ascending) {
                    result = -1;
                }
                else {
                    result = 1;
                }
            }
        }
        else if (fieldValue2) {
            if (order === SortOrderType.ascending) {
                result = 1;
            }
            else {
                result = -1;
            }
        }
        return result;
    }

    public sort(item1:any, item2:any):number {
        let result = 0;
        // sort by each field
        this.sortOrder.items.every((sortItem) => {
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


export class SortProcessor {
    public static sortItems(items:any[], sortOrder:SortOrder):SortedCursor {
        const sorter = new Sorter(sortOrder);
        const sortedItems = items.sort(sorter.sort);
        return new SortedCursorImpl(sortedItems);
    }
}
