import {ObjectView} from "./ObjectView";
import {CursorImpl} from "../cursor/CursorImpl";
import {Cursor} from "../cursor/Cursor";
import {ObjectViewListener} from "./ObjectViewListener";
import {CollectionListener} from "../collection/CollectionListener";
import {Collection} from "../collection/Collection";
import {SearchItem} from "../search/SearchTypes";
import {SortOrderItem} from "../sort/SortTypes";

export class ObjectViewImpl implements ObjectView, CollectionListener {
    private listeners:ObjectViewListener[] = [];
    private collection:string;
    private searchFilter?:SearchItem[];
    private sortOrder?:SortOrderItem[];

    constructor(collection:string, searchFilter?:SearchItem[], sortOrder?:SortOrderItem[]) {
        this.collection = collection;
        this.searchFilter = searchFilter;
        this.sortOrder = sortOrder;
    }

    addListener(listener: ObjectViewListener): void {
        this.listeners.push(listener);
    }

    content(): Cursor {
        return new CursorImpl([]);
    }

    getName(): string {
        return "";
    }

    objectAdded(collection: Collection, key: string, object: any): void {
    }

    objectRemoved(collection: Collection, key: string): void {
    }

    objectUpdated(collection: Collection, key: string, object: any): void {
    }

}
