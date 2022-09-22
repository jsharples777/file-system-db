"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemDBHelper = void 0;
const FileSystemDB_1 = require("../FileSystemDB");
const SearchTypes_1 = require("../search/SearchTypes");
const SortTypes_1 = require("../sort/SortTypes");
class FileSystemDBHelper {
    static findAll(collection, search, sort) {
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        let cursor;
        if (search) {
            cursor = db.collection(collection).findBy(search);
        }
        else {
            cursor = db.collection(collection).find();
        }
        if (sort) {
            cursor = cursor.sort(sort);
        }
        const results = cursor.toArray();
        return results;
    }
    static findById(collection, key) {
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        const result = db.collection(collection).findByKey(key);
        return result;
    }
    static updateCompositeObject(collectionName, propertyName, owningObjectKey, subObject) {
        const result = { _id: owningObjectKey, completed: true, numberOfObjects: 0 };
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        if (owningObject) {
            owningObject[propertyName] = subObject;
            collection.updateObject(owningObjectKey, owningObject);
            result.numberOfObjects = 1;
        }
        return result;
    }
    static removeCompositeObject(collectionName, propertyName, owningObjectKey) {
        const result = { _id: owningObjectKey, completed: true, numberOfObjects: 0 };
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        if (owningObject) {
            delete owningObject[propertyName];
            collection.updateObject(owningObjectKey, owningObject);
            result.numberOfObjects = 1;
        }
        return result;
    }
    static updateCompositeArrayElement(collectionName, propertyName, owningObjectKey, subObjectKey, subObject) {
        const result = { _id: owningObjectKey, completed: true, numberOfObjects: 0 };
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        if (owningObject) {
            const subObjectArray = owningObject[propertyName];
            if (subObjectArray) {
                const foundIndex = subObjectArray.findIndex((subObject) => subObject._id === subObjectKey);
                if (foundIndex >= 0) {
                    subObjectArray.splice(foundIndex, 1, subObject);
                }
            }
            else {
                owningObject[propertyName] = [subObject];
            }
            collection.updateObject(owningObjectKey, owningObject);
            result.numberOfObjects = 1;
        }
        return result;
    }
    static insertElementIntoCompositeArray(collectionName, propertyName, owningObjectKey, subObject) {
        const result = { _id: owningObjectKey, completed: true, numberOfObjects: 0 };
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        if (owningObject) {
            const subObjectArray = owningObject[propertyName];
            if (subObjectArray) {
                subObjectArray.push(subObject);
            }
            else {
                owningObject[propertyName] = [subObject];
            }
            collection.updateObject(owningObjectKey, owningObject);
            result.numberOfObjects = 1;
        }
        return result;
    }
    static removeCompositeArrayElement(collectionName, propertyName, owningObjectKey, subObjectKey) {
        const result = { _id: subObjectKey, completed: true, numberOfObjects: 0 };
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        if (owningObject) {
            const subObjectArray = owningObject[propertyName];
            if (subObjectArray) {
                const foundIndex = subObjectArray.findIndex((subObject) => subObject._id === subObjectKey);
                if (foundIndex >= 0) {
                    subObjectArray.splice(foundIndex, 1);
                    collection.updateObject(owningObjectKey, owningObject);
                    result.numberOfObjects = 1;
                }
            }
        }
        else {
            result._id = owningObjectKey;
        }
        return result;
    }
    static convertFilterIntoFind(filter) {
        const fields = Object.getOwnPropertyNames(filter);
        const searchItems = [];
        fields.forEach((field) => {
            const fieldValue = filter[field];
            let comparison = SearchTypes_1.Compare.equals;
            let compareValue = null;
            if (fieldValue.$gt) {
                comparison = SearchTypes_1.Compare.greaterThan;
                compareValue = fieldValue.gt;
            }
            else if (fieldValue.$gte) {
                comparison = SearchTypes_1.Compare.greaterThanEqual;
                compareValue = fieldValue.gte;
            }
            else if (fieldValue.$lt) {
                comparison = SearchTypes_1.Compare.lessThan;
                compareValue = fieldValue.lt;
            }
            else if (fieldValue.$lte) {
                comparison = SearchTypes_1.Compare.lessThanEqual;
                compareValue = fieldValue.lte;
            }
            else if (fieldValue.eq) {
                comparison = SearchTypes_1.Compare.equals;
                compareValue = fieldValue.eq;
            }
            else if (fieldValue.$ne) {
                comparison = SearchTypes_1.Compare.notEquals;
                compareValue = fieldValue.neq;
            }
            else if (fieldValue.isnotnull) {
                comparison = SearchTypes_1.Compare.isNotNull;
            }
            else if (fieldValue.isnull) {
                comparison = SearchTypes_1.Compare.isNull;
            }
            else {
                comparison = SearchTypes_1.Compare.equals;
                compareValue = fieldValue;
            }
            const searchItem = {
                field: field,
                comparison: comparison,
                value: compareValue
            };
            searchItems.push(searchItem);
        });
        return searchItems;
    }
    static convertFilterIntoSort(filter) {
        const fields = Object.getOwnPropertyNames(filter);
        const items = [];
        fields.forEach((field) => {
            const fieldValue = filter[field];
            let order = SortTypes_1.Order.ascending;
            if (fieldValue < 0) {
                order = SortTypes_1.Order.descending;
            }
            items.push({
                field: field,
                order: order
            });
        });
        return items;
    }
}
exports.FileSystemDBHelper = FileSystemDBHelper;
//# sourceMappingURL=FileSystemDBHelper.js.map