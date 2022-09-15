"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectViewImpl = void 0;
const CursorImpl_1 = require("../cursor/CursorImpl");
const SortProcessor_1 = require("../sort/SortProcessor");
const SearchProcessor_1 = require("../search/SearchProcessor");
const Util_1 = require("../util/Util");
const debug_1 = __importDefault(require("debug"));
const logger = (0, debug_1.default)('object-view');
class ObjectViewImpl {
    constructor(managers, collectionName, name, fields, searchFilter, sortOrder) {
        this.listeners = [];
        this.items = [];
        this.isInitialised = false;
        this.recentlyUsed = false;
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
        if (searchFilter)
            logger(searchFilter);
        if (sortOrder)
            logger(sortOrder);
        if (collection) {
            this.managers.getLifecycleManager().addLife(this);
            collection.addListener(this);
        }
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    checkViewLoaded() {
        if (!this.isInitialised) {
            logger(`View ${this.name} not initialised, loading content from collection and filtering (if defined)`);
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
                    this.items = SortProcessor_1.SortProcessor.sortItems(this.items, this.sortOrder).toArray();
                }
            }
            this.isInitialised = true;
        }
    }
    content() {
        this.recentlyUsed = true;
        this.checkViewLoaded();
        return new CursorImpl_1.CursorImpl(this.items, false);
    }
    getName() {
        return this.name;
    }
    objectAdded(collection, key, object) {
        this.recentlyUsed = true;
        if (!this.isInitialised)
            return;
        if (this.doesEntryMatchViewCriteria(object)) {
            logger(`View ${this.name} - new item ${key} added to collection which meets criteria, adding and sorting`);
            const viewItem = this.constructViewItemFromItem(object);
            this.items.push({ key, viewItem });
            if (this.sortOrder) {
                this.items = SortProcessor_1.SortProcessor.sortItems(this.items, this.sortOrder).toArray();
            }
            this.listeners.forEach((listener) => listener.itemAdded(this, key, viewItem));
        }
    }
    objectRemoved(collection, key) {
        this.recentlyUsed = true;
        if (!this.isInitialised)
            return;
        const keyField = collection.getKeyFieldName();
        const foundIndex = this.items.findIndex((item) => item[keyField] === key);
        if (foundIndex >= 0) {
            logger(`View ${this.name} - item ${key} removed from collection in view`);
            this.items.splice(foundIndex, 1);
            this.listeners.forEach((listener) => listener.itemRemoved(this, key));
        }
    }
    objectUpdated(collection, key, object) {
        this.recentlyUsed = true;
        if (!this.isInitialised)
            return;
        const keyField = collection.getKeyFieldName();
        const foundIndex = this.items.findIndex((item) => item[keyField] === key);
        if (this.doesEntryMatchViewCriteria(object)) {
            const viewItem = this.constructViewItemFromItem(object);
            if (foundIndex >= 0) {
                logger(`View ${this.name} - item ${key} updated in collection in view`);
                this.items.splice(foundIndex, 1, viewItem);
                this.listeners.forEach((listener) => listener.itemUpdated(this, key, viewItem));
            }
            else {
                logger(`View ${this.name} - item ${key} added which now meets view criteria - adding`);
                this.items.push(viewItem);
                this.listeners.forEach((listener) => listener.itemAdded(this, key, viewItem));
            }
        }
        else {
            if (foundIndex >= 0) {
                logger(`View ${this.name} - item ${key} updated in collection and no longer meets the view criteria - removing`);
                this.items.splice(foundIndex, 1);
                this.listeners.forEach((listener) => listener.itemRemoved(this, key));
            }
        }
    }
    constructViewItemFromItem(item) {
        let result = {};
        this.fields.forEach((field) => {
            const fieldValue = Util_1.Util.getFieldValue(item, field);
            Util_1.Util.setFieldValue(result, field, fieldValue);
        });
        return result;
    }
    doesEntryMatchViewCriteria(item) {
        let result = false;
        if (this.searchFilter) {
            if (SearchProcessor_1.SearchProcessor.doesItemMatchSearchItems(item, this.searchFilter)) {
                result = true;
            }
        }
        else {
            result = true;
        }
        return result;
    }
    birth() {
    }
    die() {
    }
    getBPM() {
        return Math.round(60 / (this.defaultLifespan / 2));
    }
    heartbeat() {
        if (this.recentlyUsed) {
            this.recentlyUsed = false;
        }
        else {
            if (this.isInitialised) {
                this.isInitialised = false;
                logger(`View ${this.name} - unused for lifespan of ${this.defaultLifespan} seconds - resetting`);
                this.items = [];
            }
        }
    }
    isAlive() {
        return true;
    }
}
exports.ObjectViewImpl = ObjectViewImpl;
//# sourceMappingURL=ViewImpl.js.map
