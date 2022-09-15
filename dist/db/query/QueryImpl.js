"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryImpl = void 0;
const SortTypes_1 = require("../sort/SortTypes");
const uuid_1 = require("uuid");
class QueryImpl {
    constructor(db, collection) {
        this.fields = [];
        this.searchItems = [];
        this.sortItems = [];
        this.db = db;
        this.collection = collection;
        this.and = this.and.bind(this);
        this.execute = this.execute.bind(this);
        this.orderBy = this.orderBy.bind(this);
        this.where = this.where.bind(this);
        this.select = this.select.bind(this);
        this.select(collection.getKeyFieldName());
    }
    and(field, comparison, value) {
        this.searchItems.push({
            field,
            comparison,
            value
        });
        return this;
    }
    execute(name) {
        let viewName = (0, uuid_1.v4)();
        if (name) {
            viewName = name;
        }
        const view = this.db.addView(this.collection.getName(), viewName, this.fields, this.searchItems, this.sortItems);
        return view;
    }
    orderBy(field, order) {
        if (!order) {
            order = SortTypes_1.Order.ascending;
        }
        this.sortItems.push({
            field,
            order
        });
        return this;
    }
    select(field) {
        const foundIndex = this.fields.findIndex((fieldEntry) => fieldEntry === field);
        if (foundIndex < 0) {
            this.fields.push(field);
        }
        return this;
    }
    selectMany(fields) {
        fields.forEach((field) => {
            this.select(field);
        });
        return this;
    }
    where(field, comparison, value) {
        this.searchItems.push({
            field,
            comparison,
            value
        });
        return this;
    }
}
exports.QueryImpl = QueryImpl;
//# sourceMappingURL=QueryImpl.js.map