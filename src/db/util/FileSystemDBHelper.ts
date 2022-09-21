import {FileSystemDB} from "../FileSystemDB";
import {SearchItem} from "../search/SearchTypes";
import {SortOrderItem} from "../sort/SortTypes";
import {Cursor} from "../cursor/Cursor";
import {OperationResult} from "../config/Types";

export class FileSystemDBHelper {

    public static findAll(collection: string, search?: SearchItem[], sort?: SortOrderItem[]):any[] {
        const db: FileSystemDB = FileSystemDB.getInstance();
        let cursor: Cursor;
        if (search) {
            cursor = db.collection(collection).findBy(search);
        } else {
            cursor = db.collection(collection).find();
        }
        if (sort) {
            cursor = cursor.sort(sort);
        }
        const results = cursor.toArray();
        return results;

    }

    public static findById(collection:string, key:string):any {
        const db: FileSystemDB = FileSystemDB.getInstance();
        const result = db.collection(collection).findByKey(key);
        return result;
    }

    public static updateCompositeObject(collectionName: string, propertyName: string, owningObjectKey:string, subObject:any):OperationResult {
        const result:OperationResult = {_id: owningObjectKey, completed: true, numberOfObjects: 0}

        const db = FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        if (owningObject) {
            owningObject[propertyName] = subObject;
            collection.updateObject(owningObjectKey, owningObject);
            result.numberOfObjects = 1;
        }

        return result;
    }

    public static removeCompositeObject(collectionName: string, propertyName: string, owningObjectKey:string):OperationResult {
        const result:OperationResult = {_id: owningObjectKey, completed: true, numberOfObjects: 0}
        const db = FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        if (owningObject) {
            delete owningObject[propertyName];
            collection.updateObject(owningObjectKey, owningObject);
            result.numberOfObjects = 1;
        }
        return result;
    }

    public static updateCompositeArrayElement(collectionName: string, propertyName:string, owningObjectKey:string, subObjectKey:string, subObject:any):OperationResult {
        const result:OperationResult = {_id: owningObjectKey, completed: true, numberOfObjects: 0}
        const db = FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        if (owningObject) {
            const subObjectArray: any[] = owningObject[propertyName];
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

    public static insertElementIntoCompositeArray(collectionName: string, propertyName:string, owningObjectKey:string, subObject:any):OperationResult {
        const result:OperationResult = {_id: owningObjectKey, completed: true, numberOfObjects: 0}
        const db = FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        if (owningObject) {
            const subObjectArray: any[] = owningObject[propertyName];
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

    public static removeCompositeArrayElement(collectionName: string, propertyName:string, owningObjectKey:string, subObjectKey:string):OperationResult {
        const result:OperationResult = {_id: subObjectKey, completed: true, numberOfObjects: 0}
        const db = FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        if (owningObject) {
            const subObjectArray: any[] = owningObject[propertyName];
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

}
