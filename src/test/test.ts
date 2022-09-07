import {DB} from "../db/DB";
import debug from "debug";
import {v4} from "uuid";

export class test {
    public constructor() {
        debug.enable('config-manager collection-manager');


        try {
            const db = DB.getInstance().initialise();
            db.collections();
            const collection = db.getCollection('xxx');
            let key1 = v4();
            collection.insertObject(key1,{_id:key1, value:'test1'});
            let key2 = v4();
            collection.insertObject(key2,{_id:key2, value:'test2'});
            let key3 = v4();
            collection.insertObject(key3,{_id:key3, value:'test3'});
            let key4 = v4();
            collection.insertObject(key4,{_id:key4, value:'test4'});
            let key5 = v4();
            collection.insertObject(key5,{_id:key5, value:'test5'});
            let key6 = v4();
            collection.insertObject(key6,{_id:key6, value:'test6'});
            collection.updateObject(key3,{_id:key3, value:'test3.1'});
            collection.removeObject(key4);
        }
        catch (err:any) {
            console.log(err.message);
        }
    }
}

new test();
