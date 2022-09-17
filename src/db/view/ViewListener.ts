import {View} from "./View";

export interface ViewListener {
    itemAdded(view: View, key: string, object: any): void;

    itemUpdated(view: View, key: string, object: any): void;

    itemRemoved(view: View, key: string): void;
}
