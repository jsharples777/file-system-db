"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const FileSystemDB_1 = require("../db/FileSystemDB");
const debug_1 = __importDefault(require("debug"));
class test {
    constructor() {
        debug_1.default.enable('db collection-file-manager collection-file-manager-detail log-file-manager life-cycle-manager object-view config-manager collection-manager file-manager abstract-partial-buffer collection-implementation index-file-manager index-implementation index-implementation-detail index-manager');
        try {
            const db = FileSystemDB_1.FileSystemDB.getInstance('./cfg/migration.json').initialise();
            //const db = FileSystemDB.getInstance().initialise();
            // const replicationDB = db.addReplicationLocation('test','./replication-db/',true);
            // db.startReplication();
            const filter = { providerNo: { $ne: '' } };
            const col = FileSystemDB_1.FileSystemDB.getInstance().collection('pms-users');
            let cursor = col.find(filter);
            while (cursor.hasNext()) {
                console.log(cursor.next());
            }
            //db.logChanges('./log/logfile.ops');
            // console.log(db.collections());
            // console.time('collections');
            // let collection = db.collection('pms-patients');
            // collection.find();
            //
            // setTimeout(() => {
            //     db.collection('pms-patients').findByKey('Aaron--Coghlan-19891014');
            // }, 3000)
            //
            //
            // console.timeEnd('collections');
            //
            // const view = collection.select('name.firstname').orderBy('name.firstname',Order.ascending).execute('firstnames');
            // const cursor = view.content();
            // while (cursor.hasNext()) {
            //     console.log(cursor.next());
            // }
            //
            // const view2 = db.getView('firstnames');
            // const cursor2 = view.content();
            // while (cursor2.hasNext()) {
            //     console.log(cursor2.next());
            // }
            //
            // let collection = db.collection('pms-users');
            // const items = collection.find({
            //     username:'Dr Jim Sharples'
            // });
            // while (items.hasNext()) {
            //     console.log(items.next());
            // }
            // const user = items[0];
            // user.isCurrent = false;
            // collection.updateObject(user._id,user);
            // setTimeout(() => {
            //     db.applyChangeLog('./log/logfile.ops');
            // },3000);
            // const users = collection.find({isCurrent:false,username:'Admin'});
            // while (users.hasNext()) {
            //     console.log(users.next());
            // }
            // collection = db.collection('pms-vaccines');
            // const vaccines = collection.find({stockRemaining:{lte:3}});
            // while (vaccines.hasNext()) {
            //     console.log(vaccines.next());
            // }
            // let collection = db.collection('test');
            //
            // let key1 = '1';
            // let key2 = '2';
            // let key3 = '3';
            // let key4 = '4';
            // let key5 = '5';
            // let key6 = '6';
            //
            // collection.upsertObject(key1, {_id: key1, dates: {createdDate: 5}, test: 1})
            // collection.upsertObject(key2, {_id: key2, dates: {createdDate: 6}, test: 2})
            // collection.upsertObject(key3, {_id: key3, dates: {createdDate: 7}, test: 3})
            // collection.upsertObject(key4, {_id: key4, dates: {createdDate: 8}, test: 4})
            // collection.upsertObject(key5, {_id: key5, dates: {createdDate: 9}, test: 5})
            // collection.upsertObject(key6, {_id: key6, dates: {createdDate: 10}, test: 6})
            //
            // const findAll = collection.find();
            // while (findAll.hasNext()) {
            //     console.log(findAll.next());
            // }
            //
            //
            // const result = collection.deleteMany({"dates.createdDate": {gte: 8}});
            //
            // console.log(result);
            //
            // const find = collection.find();
            // while (find.hasNext()) {
            //     console.log(find.next());
            // }
            //
            // while (cursor.hasNext()) {
            //     console.log(cursor.next())
            // }
            //
            // const view = FileSystemDB.getInstance().addView('test','test',['_id','dates.createdDate'],[{
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
//# sourceMappingURL=test.js.map