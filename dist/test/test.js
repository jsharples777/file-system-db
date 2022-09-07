"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const DB_1 = require("../db/DB");
const debug_1 = __importDefault(require("debug"));
const uuid_1 = require("uuid");
class test {
    constructor() {
        debug_1.default.enable('config-manager collection-manager');
        try {
            const db = DB_1.DB.getInstance().initialise();
            db.collections();
            const collection = db.getCollection('xxx');
            let key1 = (0, uuid_1.v4)();
            collection.insertObject(key1, { _id: key1, value: 'test1' });
            let key2 = (0, uuid_1.v4)();
            collection.insertObject(key2, { _id: key2, value: 'test2' });
            let key3 = (0, uuid_1.v4)();
            collection.insertObject(key3, { _id: key3, value: 'test3' });
            let key4 = (0, uuid_1.v4)();
            collection.insertObject(key4, { _id: key4, value: 'test4' });
            let key5 = (0, uuid_1.v4)();
            collection.insertObject(key5, { _id: key5, value: 'test5' });
            let key6 = (0, uuid_1.v4)();
            collection.insertObject(key6, { _id: key6, value: 'test6' });
            collection.updateObject(key3, { _id: key3, value: 'test3.1' });
            collection.removeObject(key4);
        }
        catch (err) {
            console.log(err.message);
        }
    }
}
exports.test = test;
new test();
//# sourceMappingURL=test.js.map