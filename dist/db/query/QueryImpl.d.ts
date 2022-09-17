import { Query } from "./Query";
import { View } from "../view/View";
import { Compare } from "../search/SearchTypes";
import { Order } from "../sort/SortTypes";
import { FileSystemDB } from "../FileSystemDB";
import { Collection } from "../collection/Collection";
export declare class QueryImpl implements Query {
    private fields;
    private searchItems;
    private sortItems;
    private db;
    private collection;
    constructor(db: FileSystemDB, collection: Collection);
    and(field: string, comparison: Compare, value?: any): Query;
    execute(name?: string): View;
    orderBy(field: string, order?: Order): Query;
    select(field: string): Query;
    selectMany(fields: string[]): Query;
    where(field: string, comparison: Compare, value?: any): Query;
}
