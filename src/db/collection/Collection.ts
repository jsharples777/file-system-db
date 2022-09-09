import {OperationResult} from "../Types";
import {SearchFilter} from "../search/SearchTypes";

export interface Collection {
    getVersion():number;
    getName():string;
    find():any[];
    findByKey(key:string):any|null;
    insertObject(key:string, object:any):OperationResult;
    updateObject(key:string, object:any):OperationResult;
    removeObject(key:string):OperationResult;
    findBy(search:SearchFilter):any[];
}