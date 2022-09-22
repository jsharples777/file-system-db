import { SearchItem } from "../search/SearchTypes";
import { SortOrderItem } from "../sort/SortTypes";
import { OperationResult } from "../config/Types";
export declare class FileSystemDBHelper {
    static findAll(collection: string, search?: SearchItem[], sort?: SortOrderItem[]): any[];
    static findById(collection: string, key: string): any;
    static updateCompositeObject(collectionName: string, propertyName: string, owningObjectKey: string, subObject: any): OperationResult;
    static removeCompositeObject(collectionName: string, propertyName: string, owningObjectKey: string): OperationResult;
    static updateCompositeArrayElement(collectionName: string, propertyName: string, owningObjectKey: string, subObjectKey: string, subObject: any): OperationResult;
    static insertElementIntoCompositeArray(collectionName: string, propertyName: string, owningObjectKey: string, subObject: any): OperationResult;
    static removeCompositeArrayElement(collectionName: string, propertyName: string, owningObjectKey: string, subObjectKey: string): OperationResult;
    static convertFilterIntoFind(filter: any): SearchItem[];
    static convertFilterIntoSort(filter: any): SortOrderItem[];
}
