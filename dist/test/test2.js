"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const debug_1 = __importDefault(require("debug"));
const FileSystemDB_1 = require("../db/FileSystemDB");
class test {
    constructor() {
        debug_1.default.enable('life-cycle-manager object-view config-manager collection-manager file-manager abstract-partial-buffer collection-implementation index-file-manager index-implementation index-manager');
        // debug.enable('life-cycle-manager object-view config-manager collection-manager file-manager abstract-partial-buffer collection-implementation index-file-manager index-implementation index-implementation-detail index-manager');
        try {
            const db = FileSystemDB_1.FileSystemDB.getInstance('./cfg/migration.json').initialise();
            // const cursor = db.collection('pms-appts').findBy([{
            //     field: 'start',
            //     comparison: Compare.greaterThanEqual,
            //     value: 20220801
            // }]);
            // while (cursor.hasNext()) {
            //     console.log(cursor.next());
            // }
            const collection = db.collection('pms-appts');
            const results = collection.find({
                provider: 'Dr Jim Sharples',
                start: 20220901,
                time: '092000',
                isCancelled: false
            }).toArray();
            console.log(results);
            // console.log(db.collections());
            // let collection = db.collection('test');
            //
            // let key1 = '1';
            // let key2 = '2';
            // let key3 = '3';
            // let key4 = '4';
            // let key5 = '5';
            // let key6 = '6';
            //
            // collection.upsertObject(key1,{_id:key1,dates: { createdDate:5},test:1})
            // collection.upsertObject(key2,{_id:key2,dates: { createdDate:6},test:2})
            // collection.upsertObject(key3,{_id:key3,dates: { createdDate:7},test:3})
            // collection.upsertObject(key4,{_id:key4,dates: { createdDate:8},test:4})
            // collection.upsertObject(key5,{_id:key5,dates: { createdDate:9},test:5})
            // collection.upsertObject(key6,{_id:key6,dates: { createdDate:10},test:6})
            //
            // const findAll = collection.find();
            // while (findAll.hasNext()) {
            //     console.log(findAll.next());
            // }
            //
            //
            //
            // const cursor = collection.findBy([{
            //         comparison: SearchItemComparison.greaterThan,
            //         field: "dates.createdDate",
            //         value: 7
            //     },{
            //         comparison: SearchItemComparison.greaterThan,
            //         field: "fake",
            //         value: 7
            //     }]).sort([{
            //     field: "dates.createdDate",
            //     order: SortOrderType.ascending
            // }]);
            //
            // while (cursor.hasNext()) {
            //     console.log(cursor.next())
            // }
            //
            // const view = DB.getInstance().addView('test','test',['_id','dates.createdDate'],[{
            //     comparison: SearchItemComparison.greaterThan,
            //     field: "dates.createdDate",
            //     value: 7
            // }],[{
            //     field: "dates.createdDate",
            //     order: SortOrderType.ascending
            // }]);;
            //
            // let viewCursor = view.content();
            // while (viewCursor.hasNext()) {
            //     console.log(viewCursor.next());
            // }
            //
            // collection.upsertObject(key6,{_id:key6,dates: { createdDate:11},test:6})
            // collection.upsertObject(key6,{_id:key6,dates: { createdDate:6},test:6})
            // collection.upsertObject(key6,{_id:key6,dates: { createdDate:10},test:6})
            //
            // viewCursor = view.content();
            // while (viewCursor.hasNext()) {
            //     console.log(viewCursor.next());
            // }
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
        catch (err) {
            console.log(err.message);
        }
    }
}
exports.test = test;
new test();
//# sourceMappingURL=test2.js.map