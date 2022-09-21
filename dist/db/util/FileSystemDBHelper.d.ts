import { SearchItem } from "../search/SearchTypes";
import { SortOrderItem } from "../sort/SortTypes";
export declare class FileSystemDBHelper {
    static findAll(collection: string, stateName: string, search?: SearchItem[], sort?: SortOrderItem[]): any[];
    static findById(collection: string, key: string): any;
    static updateCompositeObject(collectionName: string, propertyName: string, owningObjectKey: string, subObject: any): void;
    static removeCompositeObject(collectionName: string, stateName: string, owningObjectKey: string): void;
    static updateCompositeArrayElement(collectionName: string, stateName: string, owningObjectKey: string, subObjectKey: string, subObject: any): void;
    static insertElementIntoCompositeArray(collectionName: string, stateName: string, owningObjectKey: string, subObject: any): void;
    static removeCompositeArrayElement(collectionName: string, stateName: string, owningObjectKey: string, subObjectKey: string): void;
}
