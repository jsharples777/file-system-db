import { Cursor } from "./Cursor";
export declare class CursorImpl implements Cursor {
    protected items: any[];
    protected position: number;
    constructor(items: any[]);
    hasNext(): boolean;
    next(): any;
    toArray(): any[];
}
