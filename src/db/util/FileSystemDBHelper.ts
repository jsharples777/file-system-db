import {FileSystemDB} from "../FileSystemDB";
import {SearchItem} from "../search/SearchTypes";
import {SortOrderItem} from "../sort/SortTypes";
import {Cursor} from "../cursor/Cursor";

export class FileSystemDBHelper {

    public static findAll(collection: string, stateName: string, search?: SearchItem[], sort?: SortOrderItem[]):any[] {
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

    public static updateCompositeObject(collectionName: string, propertyName: string, owningObjectKey:string, subObject:any):void {
        const db = FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        owningObject[propertyName] = subObject;
        collection.updateObject(owningObjectKey, owningObject);
    }

    public static removeCompositeObject(collectionName: string, stateName: string, owningObjectKey:string):void {
        const db = FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        delete owningObject[stateName];
        collection.updateObject(owningObjectKey, owningObject);
    }

    public static updateCompositeArrayElement(collectionName: string, stateName:string, owningObjectKey:string, subObjectKey:string, subObject:any):void {
        const db = FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        const subObjectArray: any[] = owningObject[stateName];
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

    public static insertElementIntoCompositeArray(collectionName: string, stateName:string, owningObjectKey:string, subObject:any):void {
        const db = FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        const subObjectArray: any[] = owningObject[stateName];
        if (subObjectArray) {
            subObjectArray.push(subObject);
        }
        else {
            owningObject[stateName] = [subObject];
        }
        collection.updateObject(owningObjectKey, owningObject);
    }

    public static removeCompositeArrayElement(collectionName: string, stateName:string, owningObjectKey:string, subObjectKey:string):void {
        const db = FileSystemDB.getInstance();
        const collection = db.collection(collectionName);
        const owningObject = collection.findByKey(owningObjectKey);
        const subObjectArray: any[] = owningObject[stateName];
        if (subObjectArray) {
            const foundIndex = subObjectArray.findIndex((subObject) => subObject._id === subObjectKey);
            if (foundIndex >= 0) {
                subObjectArray.splice(foundIndex, 1);
            }
        }
        collection.updateObject(owningObjectKey, owningObject);
    }

}
