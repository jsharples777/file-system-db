import {ObjectView} from "./ObjectView";
import {CursorImpl} from "../cursor/CursorImpl";
import {Cursor} from "../cursor/Cursor";
import {ObjectViewListener} from "./ObjectViewListener";
import {CollectionListener} from "../collection/CollectionListener";
import {Collection} from "../collection/Collection";
import {SearchItem} from "../search/SearchTypes";
import {SortOrderItem} from "../sort/SortTypes";
import {SortProcessor} from "../sort/SortProcessor";
import {SearchProcessor} from "../search/SearchProcessor";
import {CollectionManager} from "../collection/CollectionManager";

export class ObjectViewImpl implements ObjectView, CollectionListener {
    private listeners:ObjectViewListener[] = [];
    private collection:string;
    private searchFilter?:SearchItem[];
    private sortOrder?:SortOrderItem[];
    private items:any[] = [];
    private isInitialised:boolean = false;

    constructor(collection:string, searchFilter?:SearchItem[], sortOrder?:SortOrderItem[]) {
        this.collection = collection;
        this.searchFilter = searchFilter;
        this.sortOrder = sortOrder;

        this.content = this.content.bind(this);
        this.objectAdded = this.objectAdded.bind(this);
        this.objectRemoved = this.objectRemoved.bind(this);
        this.objectUpdated = this.objectUpdated.bind(this);

    }

    addListener(listener: ObjectViewListener): void {
        this.listeners.push(listener);
    }

    content(): Cursor {
        if (!this.isInitialised) {
            this.items = [];
            const collection = CollectionManager.getInstance().getCollection(this.collection).find().toArray();
            collection.forEach((item) => {
                if (this.doesEntryMatchViewCriteria(item)) {
                    const viewItem = this.constructViewItemFromItem(item);
                    this.items.push(viewItem);
                }
            });

            if (this.sortOrder) {
                this.items = SortProcessor.sortItems(this.items,this.sortOrder).toArray();
            }
            this.isInitialised = true;
        }
        return new CursorImpl(this.items,false);
    }

    getName(): string {
        return "";
    }

    objectAdded(collection: Collection, key: string, object: any): void {
        if (!this.isInitialised) return;
        if (this.doesEntryMatchViewCriteria(object)) {
            const viewItem = this.constructViewItemFromItem(object);
            this.items.push({key, viewItem});
            if (this.sortOrder) {
                this.items = SortProcessor.sortItems(this.items,this.sortOrder).toArray();
            }
            this.listeners.forEach((listener) => listener.itemAdded(this,key,viewItem));
        }
    }

    objectRemoved(collection: Collection, key: string): void {
        if (!this.isInitialised) return;
        const keyField = collection.getKeyFieldName();
        const foundIndex = this.items.findIndex((item) => item[keyField] === key);
        if (foundIndex >= 0) {
            this.items.splice(foundIndex,1);
            this.listeners.forEach((listener) => listener.itemRemoved(this,key));
        }
    }

    objectUpdated(collection: Collection, key: string, object: any): void {
        if (!this.isInitialised) return;

        const keyField = collection.getKeyFieldName();
        const foundIndex = this.items.findIndex((item) => item[keyField] === key);
        if (foundIndex >= 0) {
            const viewItem = this.constructViewItemFromItem(object);
            this.items.splice(foundIndex,1, viewItem);
            this.listeners.forEach((listener) => listener.itemUpdated(this,key,viewItem));
        }
    }

    protected constructViewItemFromItem(item:any):any {
        let result:any = {}



        return result;
    }

    protected doesEntryMatchViewCriteria(item:any):boolean {
        let result = false;
        if (this.searchFilter) {
            if (SearchProcessor.doesItemMatchSearchItems(item,this.searchFilter)) {
                result = true;
            }
        }
        else {
            result = true;
        }
        return result;
    }

}
