import { Compare } from "../search/SearchTypes";
import { View } from "../view/View";
import { Order } from "../sort/SortTypes";
export interface Query {
    select(field: string): Query;
    selectMany(fields: string[]): Query;
    where(field: string, comparison: Compare, value?: any): Query;
    and(field: string, comparison: Compare, value?: any): Query;
    orderBy(field: string, order: Order): Query;
    execute(name?: string): View;
}
