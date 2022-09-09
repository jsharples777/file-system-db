import {IndexContent, IndexEntry, IndexVersion} from "../Types";
import {SearchFilter} from "../search/SearchTypes";

export interface Index {
    setVersion(version:number):void;
    getVersion():number;
    getName():string;
    getCollection():string;
    getFields():string[];
    getEntries():IndexEntry[];
    objectAdded(version:number, key:string,object:any):void;
    objectRemoved(version:number, key:string):void;
    objectUpdated(version:number, key:string,object:any):void;
    matchesFilter(searchFilter:SearchFilter):boolean;
    findMatchingKeys(searchFilter:SearchFilter):string[];
    getIndexVersion():IndexVersion;
    getIndexContent():IndexContent;
}
