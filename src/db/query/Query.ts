import {SortOrderType} from "../sort/SortTypes";
import {Compare} from "../search/SearchTypes";
import {View} from "../view/View";

export interface Query {
    select(field: string): Query;

    where(field: string, comparison: Compare, value?: any): Query;

    and(): Query;

    orderBy(field: string, order: SortOrderType): Query;

    execute(): View;
}
