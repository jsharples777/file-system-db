"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = void 0;
const debug_1 = __importDefault(require("debug"));
const MigrateMongoDB_1 = require("../db/migration/MigrateMongoDB");
class migrate {
    constructor() {
        debug_1.default.enable('life-cycle-manager object-view config-manager collection-manager file-manager abstract-partial-buffer collection-implementation index-file-manager index-implementation index-implementation-detail index-manager');
        try {
            new MigrateMongoDB_1.MigrateMongoDB();
        }
        catch (err) {
            console.log(err.message);
        }
    }
}
exports.migrate = migrate;
new migrate();
//# sourceMappingURL=migrate.js.map