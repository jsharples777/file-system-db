import {Query} from "./Query";
import {View} from "../view/View";
import {Compare, SearchItem} from "../search/SearchTypes";
import {Order, SortOrderItem} from "../sort/SortTypes";
import {FileSystemDB} from "../FileSystemDB";
import {v4} from "uuid";
import {Collection} from "../collection/Collection";

export class QueryImpl implements Query {
    private fields: string[] = [];
    private searchItems: SearchItem[] = [];
    private sortItems: SortOrderItem[] = [];
    private db: FileSystemDB;
    private collection: Collection;

    constructor(db: FileSystemDB, collection: Collection) {
        this.db = db;
        this.collection = collection;
        this.and = this.and.bind(this);
        this.execute = this.execute.bind(this);
        this.orderBy = this.orderBy.bind(this);
        this.where = this.where.bind(this);
        this.select = this.select.bind(this);

        this.select(collection.getKeyFieldName());
    }

    and(field: string, comparison: Compare, value?: any): Query {
        this.searchItems.push({
            field,
            comparison,
            value
        });
        return this;
    }

    execute(name?: string): View {
        let viewName = v4();
        if (name) {
            viewName = name;
        }
        const view = this.db.addView(this.collection.getName(), viewName, this.fields, this.searchItems, this.sortItems);
        return view;
    }

    orderBy(field: string, order?: Order): Query {
        if (!order) {
            order = Order.ascending;
        }
        this.sortItems.push({
            field,
            order
        })
        return this;
    }

    select(field: string): Query {
        const foundIndex = this.fields.findIndex((fieldEntry) => fieldEntry === field);
        if (foundIndex < 0) {
            this.fields.push(field);
        }
        return this;
    }

    selectMany(fields: string[]): Query {
        fields.forEach((field) => {
            this.select(field);
        })
        return this;
    }

    where(field: string, comparison: Compare, value?: any): Query {
        this.searchItems.push({
            field,
            comparison,
            value
        });
        return this;
    }

}
