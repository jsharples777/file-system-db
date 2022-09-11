import {Cursor} from "./Cursor";
import {DB} from "../DB";

export class CursorImpl implements Cursor {
    protected items: any[];
    protected position: number;

    constructor(items:any[]) {
        this.items = DB.copyObject(items);
        this.position = -1;
    }

    hasNext(): boolean {
        return (this.position < this.items.length);
    }

    next(): any {
        let result:any = null;
        this.position ++;
        if (this.position < this.items.length) {
            result = this.items[this.position];
        }
        return result;
    }

    toArray(): any[] {
        return this.items;
    }
}
