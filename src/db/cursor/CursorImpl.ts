import {Cursor} from "./Cursor";
import {DB} from "../DB";
import {SortOrderItem} from "../sort/SortTypes";
import {SortProcessor} from "../sort/SortProcessor";
import {Util} from "../util/Util";

export class CursorImpl implements Cursor {
    protected items: any[];
    protected position: number;

    constructor(items:any[],copyObjects:boolean = true) {
        if (copyObjects) {
            this.items = Util.copyObject(items);
        }
        else {
            this.items = items;
        }
        this.position = 0;
    }

    hasNext(): boolean {
        return (this.position < this.items.length);
    }

    next(): any {
        let result:any = null;
        if (this.position < this.items.length) {
            result = this.items[this.position];
        }
        this.position ++;
        return result;
    }

    toArray(): any[] {
        return this.items;
    }

    sort(sortOrder: SortOrderItem[]): Cursor {
        return SortProcessor.sortItems(this.items,sortOrder);
    }


}
