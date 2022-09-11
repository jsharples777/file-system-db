import {OperationResult} from "../Types";
import {SearchFilter} from "../search/SearchTypes";
import {SearchCursor} from "../cursor/SearchCursor";
import {Cursor} from "../cursor/Cursor";

export interface Collection {
    getVersion():number;
    getName():string;
    find():Cursor;
    findByKey(key:string):any|null;
    findOne(search:SearchFilter):any;
    insertObject(key:string, object:any):OperationResult;
    upsertObject(key:string, object:any):OperationResult;
    updateObject(key:string, object:any):OperationResult;
    removeObject(key:string):OperationResult;
    findBy(search:SearchFilter):SearchCursor;
}
