import debug from "debug";
import {MigrateMongoDB} from "../db/migration/MigrateMongoDB";

export class migrate {
    public constructor() {
        debug.enable('life-cycle-manager object-view config-manager collection-manager file-manager abstract-partial-buffer collection-implementation index-file-manager index-implementation index-implementation-detail index-manager');
        try {
            new MigrateMongoDB();
        }
        catch (err:any) {
            console.log(err.message);
        }
    }
}

new migrate();
