import {DB} from "../db/DB";
import debug from "debug";

export class test {
    public constructor() {
        debug.enable('config-manager collection-manager');


        try {
            const db = DB.getInstance().initialise();
            db.collections();
            db.getCollection('xxx');
        }
        catch (err:any) {
            console.log(err.message);
        }
    }
}

new test();
