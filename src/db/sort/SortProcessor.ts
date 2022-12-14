import {Order, SortOrderItem} from "./SortTypes";
import {CursorImpl} from "../cursor/CursorImpl";
import {Cursor} from "../cursor/Cursor";
import {Util} from "../util/Util";

export class Sorter {
    private sortOrder: SortOrderItem[];

    constructor(sortOrder: SortOrderItem[]) {
        this.sortOrder = sortOrder;

        this.sort = this.sort.bind(this);
    }

    public sortByFieldAndOrder(item1: any, item2: any, fieldName: string, order: Order): number {
        let result = 0;
        const fieldValue1 = Util.getFieldValue(item1, fieldName);
        const fieldValue2 = Util.getFieldValue(item2, fieldName);
        if (fieldValue1) {
            if (fieldValue2) {
                if (fieldValue1 > fieldValue2) {
                    if (order === Order.ascending) {
                        result = 1;
                    } else {
                        result = -1;
                    }
                } else if (fieldValue1 < fieldValue2) {
                    if (order === Order.ascending) {
                        result = -1;
                    } else {
                        result = 1;
                    }
                }
            } else {
                if (order === Order.ascending) {
                    result = 1;
                } else {
                    result = -1;
                }
            }
        } else if (fieldValue2) {
            if (order === Order.ascending) {
                result = -1;
            } else {
                result = 1;
            }
        }
        return result;
    }

    public sort(item1: any, item2: any): number {
        let result = 0;
        // sort by each field
        this.sortOrder.every((sortItem) => {
            const itemResult = this.sortByFieldAndOrder(item1, item2, sortItem.field, sortItem.order);
            if (itemResult != 0) {
                result = itemResult;
                return false;
            } else {
                return true;
            }
        });
        return result;
    }
}


export class SortProcessor {
    public static sortItems(items: any[], sortOrder: SortOrderItem[]): Cursor {
        const sorter = new Sorter(sortOrder);
        const sortedItems = items.sort(sorter.sort);
        return new CursorImpl(sortedItems, false);
    }
}
