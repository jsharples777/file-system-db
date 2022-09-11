import {DB} from "../db/DB";
import debug from "debug";
import {SearchItem, SearchItemComparison} from "../db/search/SearchTypes";
import {SortOrderItem, SortOrderType} from "../db/sort/SortTypes";

export class test {
    public constructor() {
        debug.enable('life-cycle-manager life-cycle-manager-detail config-manager collection-manager file-manager abstract-partial-buffer collection-implementation index-file-manager index-implementation index-implementation-detail index-manager');


        try {
            const db = DB.getInstance().initialise();
            console.log(db.collections());
            let collection = db.collection('test');

            let key1 = '1';
            let key2 = '2';
            let key3 = '3';
            let key4 = '4';
            let key5 = '5';
            let key6 = '6';

            collection.upsertObject(key1,{_id:key1,dates: { createdDate:5},test:1})
            collection.upsertObject(key2,{_id:key2,dates: { createdDate:6},test:2})
            collection.upsertObject(key3,{_id:key3,dates: { createdDate:7},test:3})
            collection.upsertObject(key4,{_id:key4,dates: { createdDate:8},test:4})
            collection.upsertObject(key5,{_id:key5,dates: { createdDate:9},test:5})
            collection.upsertObject(key6,{_id:key6,dates: { createdDate:10},test:6})

            const findAll = collection.find();
            while (findAll.hasNext()) {
                console.log(findAll.next());
            }



            const cursor = collection.findBy([{
                    comparison: SearchItemComparison.greaterThan,
                    field: "dates.createdDate",
                    value: 7
                },{
                    comparison: SearchItemComparison.greaterThan,
                    field: "fake",
                    value: 7
                }]).sort([{
                field: "dates.createdDate",
                order: SortOrderType.ascending
            }]);

            while (cursor.hasNext()) {
                console.log(cursor.next())
            }



            // collection = db.getCollection('xxx');
            // collection.upsertObject(key1,{_id:key1, value:'test1'});
            // collection.upsertObject(key2,{_id:key2, value:'test2'});
            // collection.upsertObject(key3,{_id:key3, value:'test3'});
            // collection.upsertObject(key4,{_id:key4, value:'test4'});
            // collection.upsertObject(key5,{_id:key5, value:'test5'});
            // collection.upsertObject(key6,{_id:key6, value:'test6'});
            // collection.updateObject(key3,{_id:key3, value:'test3.1'});
            // collection.removeObject(key4);
            //
            // collection = db.getCollection('yyy');
            // collection.upsertObject(key1,{_id:key1, value:'test1'});
            // collection.upsertObject(key2,{_id:key2, value:'test2'});
            // collection.upsertObject(key3,{_id:key3, value:'test3'});
            // collection.upsertObject(key4,{_id:key4, value:'test4'});
            // collection.upsertObject(key5,{_id:key5, value:'test5'});
            // collection.upsertObject(key6,{_id:key6, value:'test6'});
            //
            // console.log(collection.findByKey(key1));
            //
            //
            // collection = db.getCollection('zzz');
            // collection.upsertObject(key1,{_id:key1, value:'test1'});
            // collection.upsertObject(key2,{_id:key2, value:'test2'});
            // collection.upsertObject(key3,{_id:key3, value:'test3'});
            // collection.upsertObject(key4,{_id:key4, value:'test4'});
            // collection.upsertObject(key5,{_id:key5, value:'test5'});
            // collection.upsertObject(key6,{_id:key6, value:'test6'});
            //
            // setTimeout(() => {
            //     const zzz = db.getCollection('zzz');
            //     console.log(zzz.findByKey(key2));
            //     console.log(zzz.find());
            //     console.log(zzz.findByKey(key3));
            //     const yyy = db.getCollection('yyy');
            //     console.log(yyy.find());
            //     console.log(yyy.findByKey(key3));
            //     const xxx = db.getCollection('yyy');
            //     console.log(xxx.find());
            //     console.log(xxx.findByKey(key3));
            //     setTimeout(() => {
            //         process.exit(0)
            //     },11000);
            // },11000);
        }
        catch (err:any) {
            console.log(err.message);
        }
    }
}

new test();
