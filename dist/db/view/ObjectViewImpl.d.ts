import { ObjectView } from "./ObjectView";
import { Cursor } from "../cursor/Cursor";
import { ObjectViewListener } from "./ObjectViewListener";
import { CollectionListener } from "../collection/CollectionListener";
import { Collection } from "../collection/Collection";
import { SearchItem } from "../search/SearchTypes";
import { SortOrderItem } from "../sort/SortTypes";
export declare class ObjectViewImpl implements ObjectView, CollectionListener {
    private listeners;
    private collection;
    private searchFilter?;
    private sortOrder?;
    constructor(collection: string, searchFilter?: SearchItem[], sortOrder?: SortOrderItem[]);
    addListener(listener: ObjectViewListener): void;
    content(): Cursor;
    getName(): string;
    objectAdded(collection: Collection, key: string, object: any): void;
    objectRemoved(collection: Collection, key: string): void;
    objectUpdated(collection: Collection, key: string, object: any): void;
}
