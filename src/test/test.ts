import {DB} from "../db/DB";
import debug from "debug";
import {v4} from "uuid";

export class test {
    public constructor() {
        debug.enable('config-manager collection-manager file-manager abstract-partial-buffer collection-implementation');


        try {
            const db = DB.getInstance().initialise();
            db.collections();
            let collection = db.getCollection('xxx');
            let key1 = '1';
            collection.insertObject(key1,{_id:key1, value:'test1'});
            let key2 = '2';
            collection.insertObject(key2,{_id:key2, value:'test2'});
            let key3 = '3';
            collection.insertObject(key3,{_id:key3, value:'test3'});
            let key4 = '4';
            collection.insertObject(key4,{_id:key4, value:'test4'});
            let key5 = '5';
            collection.insertObject(key5,{_id:key5, value:'test5'});
            let key6 = '6';
            collection.insertObject(key6,{_id:key6, value:'test6'});
            collection.updateObject(key3,{_id:key3, value:'test3.1'});
            collection.removeObject(key4);

            collection = db.getCollection('yyy');
            collection.insertObject(key1,{_id:key1, value:'test1'});
            collection.insertObject(key2,{_id:key2, value:'test2'});
            collection.insertObject(key3,{_id:key3, value:'test3'});
            collection.insertObject(key4,{_id:key4, value:'test4'});
            collection.insertObject(key5,{_id:key5, value:'test5'});
            collection.insertObject(key6,{_id:key6, value:'test6'});

            console.log(collection.findByKey(key1));


            collection = db.getCollection('zzz');
            collection.insertObject(key1,{_id:key1, value:'test1'});
            collection.insertObject(key2,{_id:key2, value:'test2'});
            collection.insertObject(key3,{_id:key3, value:'test3'});
            collection.insertObject(key4,{_id:key4, value:'test4'});
            collection.insertObject(key5,{_id:key5, value:'test5'});
            collection.insertObject(key6,{_id:key6, value:'test6'});

            setTimeout(() => {
                const zzz = db.getCollection('zzz');
                console.log(zzz.findByKey(key2));
                console.log(zzz.find());
                console.log(zzz.findByKey(key3));
                const yyy = db.getCollection('yyy');
                console.log(yyy.find());
                console.log(yyy.findByKey(key3));
                const xxx = db.getCollection('yyy');
                console.log(xxx.find());
                console.log(xxx.findByKey(key3));
            },11000);
        }
        catch (err:any) {
            console.log(err.message);
        }
    }
}

new test();
