import {View} from "./View";
import {CursorImpl} from "../cursor/CursorImpl";
import {Cursor} from "../cursor/Cursor";
import {ViewListener} from "./ViewListener";
import {CollectionListener} from "../collection/CollectionListener";
import {Collection} from "../collection/Collection";
import {SearchItem} from "../search/SearchTypes";
import {SortOrderItem} from "../sort/SortTypes";
import {SortProcessor} from "../sort/SortProcessor";
import {SearchProcessor} from "../search/SearchProcessor";
import {Util} from "../util/Util";
import {Life} from "../life/Life";
import debug from 'debug';
import {DatabaseManagers} from "../DatabaseManagers";

const logger = debug('object-view');

export class ObjectViewImpl implements View, CollectionListener, Life {
    private listeners: ViewListener[] = [];
    private collection: string;
    private searchFilter?: SearchItem[];
    private sortOrder?: SortOrderItem[];
    private items: any[] = [];
    private isInitialised: boolean = false;
    private recentlyUsed: boolean = false;
    private fields: string[];
    private name: string;
    private defaultLifespan: number;
    private managers: DatabaseManagers;

    constructor(managers: DatabaseManagers, collectionName: string, name: string, fields: string[], searchFilter?: SearchItem[], sortOrder?: SortOrderItem[]) {
        this.managers = managers;
        const collection = this.managers.getCollectionManager().getCollection(collectionName);
        this.collection = collectionName;
        this.name = name;
        this.fields = fields;
        this.searchFilter = searchFilter;
        this.sortOrder = sortOrder;

        this.content = this.content.bind(this);
        this.objectAdded = this.objectAdded.bind(this);
        this.objectRemoved = this.objectRemoved.bind(this);
        this.objectUpdated = this.objectUpdated.bind(this);

        this.defaultLifespan = parseInt(process.env.DEFAULT_VIEW_LIFESPAN_SEC || '600');
        if (isNaN(this.defaultLifespan)) {
            this.defaultLifespan = 600;
        }
        logger(`Adding new view ${name} for collection ${collectionName} with fields ${fields}`);
        if (searchFilter) logger(searchFilter);
        if (sortOrder) logger(sortOrder);

        if (collection) {
            this.managers.getLifecycleManager().addLife(this);
            collection.addListener(this);
        }
    }

    addListener(listener: ViewListener): void {
        this.listeners.push(listener);
    }

    content(): Cursor {
        this.recentlyUsed = true;
        this.checkViewLoaded();

        return new CursorImpl(this.items, false);
    }

    getName(): string {
        return this.name;
    }

    objectAdded(collection: Collection, key: string, object: any): void {
        this.recentlyUsed = true;
        if (!this.isInitialised) return;
        if (this.doesEntryMatchViewCriteria(object)) {
            logger(`View ${this.name} - new item ${key} added to collection which meets criteria, adding and sorting`)
            const viewItem = this.constructViewItemFromItem(object);
            this.items.push({key, viewItem});
            if (this.sortOrder) {
                this.items = SortProcessor.sortItems(this.items, this.sortOrder).toArray();
            }
            this.listeners.forEach((listener) => listener.itemAdded(this, key, viewItem));
        }
    }

    objectRemoved(collection: Collection, key: string): void {
        this.recentlyUsed = true;
        if (!this.isInitialised) return;
        const keyField = collection.getKeyFieldName();
        const foundIndex = this.items.findIndex((item) => item[keyField] === key);
        if (foundIndex >= 0) {
            logger(`View ${this.name} - item ${key} removed from collection in view`)
            this.items.splice(foundIndex, 1);
            this.listeners.forEach((listener) => listener.itemRemoved(this, key));
        }
    }

    objectUpdated(collection: Collection, key: string, object: any): void {
        this.recentlyUsed = true;
        if (!this.isInitialised) return;
        const keyField = collection.getKeyFieldName();
        const foundIndex = this.items.findIndex((item) => item[keyField] === key);
        if (this.doesEntryMatchViewCriteria(object)) {
            const viewItem = this.constructViewItemFromItem(object);
            if (foundIndex >= 0) {
                logger(`View ${this.name} - item ${key} updated in collection in view`)
                this.items.splice(foundIndex, 1, viewItem);
                this.listeners.forEach((listener) => listener.itemUpdated(this, key, viewItem));
            } else {
                logger(`View ${this.name} - item ${key} added which now meets view criteria - adding`)
                this.items.push(viewItem);
                this.listeners.forEach((listener) => listener.itemAdded(this, key, viewItem));
            }
        } else {
            if (foundIndex >= 0) {
                logger(`View ${this.name} - item ${key} updated in collection and no longer meets the view criteria - removing`)
                this.items.splice(foundIndex, 1);
                this.listeners.forEach((listener) => listener.itemRemoved(this, key));
            }
        }
    }

    birth(): void {
    }

    die(): void {
    }

    getBPM(): number {
        return Math.round(60 / (this.defaultLifespan / 2));
    }

    heartbeat(): void {
        if (this.recentlyUsed) {
            this.recentlyUsed = false;
        } else {
            if (this.isInitialised) {
                this.isInitialised = false;
                logger(`View ${this.name} - unused for lifespan of ${this.defaultLifespan} seconds - resetting`);
                this.items = [];
            }
        }
    }

    isAlive(): boolean {
        return true;
    }

    protected checkViewLoaded(): void {
        if (!this.isInitialised) {
            logger(`View ${this.name} not initialised, loading content from collection and filtering (if defined)`)
            this.items = [];
            const collection = this.managers.getCollectionManager().getCollection(this.collection);
            if (collection) {
                const collectionContent = collection.find().toArray();
                collectionContent.forEach((item) => {
                    if (this.doesEntryMatchViewCriteria(item)) {
                        const viewItem = this.constructViewItemFromItem(item);
                        this.items.push(viewItem);
                    }
                });

                if (this.sortOrder) {
                    this.items = SortProcessor.sortItems(this.items, this.sortOrder).toArray();
                }

            }
            this.isInitialised = true;
        }
    }

    protected constructViewItemFromItem(item: any): any {
        let result: any = {}
        this.fields.forEach((field) => {
            const fieldValue = Util.getFieldValue(item, field);
            Util.setFieldValue(result, field, fieldValue);
        });
        return result;
    }

    protected doesEntryMatchViewCriteria(item: any): boolean {
        let result = false;
        if (this.searchFilter) {
            if (SearchProcessor.doesItemMatchSearchItems(item, this.searchFilter)) {
                result = true;
            }
        } else {
            result = true;
        }
        return result;
    }

}
