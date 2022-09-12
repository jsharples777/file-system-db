import {ObjectView} from "./ObjectView";

export interface ObjectViewListener {
    itemAdded(view:ObjectView,key:string, object:any):void;
    itemUpdated(view:ObjectView,key:string, object:any):void;
    itemRemoved(view:ObjectView,key:string):void;
}
