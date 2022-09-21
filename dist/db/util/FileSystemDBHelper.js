"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemDBHelper = void 0;
const FileSystemDB_1 = require("../FileSystemDB");
class FileSystemDBHelper {
    static findAll(collection, stateName, search, sort) {
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
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        owningObject[propertyName] = subObject;
        collection.updateObject(owningObjectKey, owningObject);
    }
    static removeCompositeObject(collectionName, stateName, owningObjectKey) {
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        delete owningObject[stateName];
        collection.updateObject(owningObjectKey, owningObject);
    }
    static updateCompositeArrayElement(collectionName, stateName, owningObjectKey, subObjectKey, subObject) {
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        const subObjectArray = owningObject[stateName];
        if (subObjectArray) {
            const foundIndex = subObjectArray.findIndex((subObject) => subObject._id === subObjectKey);
            if (foundIndex >= 0) {
                subObjectArray.splice(foundIndex, 1, subObject);
            }
        }
        else {
            owningObject[stateName] = [subObject];
        }
        collection.updateObject(owningObjectKey, owningObject);
    }
    static insertElementIntoCompositeArray(collectionName, stateName, owningObjectKey, subObject) {
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        const subObjectArray = owningObject[stateName];
        if (subObjectArray) {
            subObjectArray.push(subObject);
        }
        else {
            owningObject[stateName] = [subObject];
        }
        collection.updateObject(owningObjectKey, owningObject);
    }
    static removeCompositeArrayElement(collectionName, stateName, owningObjectKey, subObjectKey) {
        const db = FileSystemDB_1.FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        const subObjectArray = owningObject[stateName];
        if (subObjectArray) {
            const foundIndex = subObjectArray.findIndex((subObject) => subObject._id === subObjectKey);
            if (foundIndex >= 0) {
                subObjectArray.splice(foundIndex, 1);
            }
        }
        collection.updateObject(owningObjectKey, owningObject);
    }
}
exports.FileSystemDBHelper = FileSystemDBHelper;
//# sourceMappingURL=FileSystemDBHelper.js.map