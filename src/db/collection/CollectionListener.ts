import {Collection} from "./Collection";

export interface CollectionListener {
    objectAdded(collection: Collection, key: string, object: any): void;

    objectRemoved(collection: Collection, key: string): void;

    objectUpdated(collection: Collection, key: string, object: any): void;
}
