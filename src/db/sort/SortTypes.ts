export enum SortOrder {
    ascending = 'asc',
    descending = 'dsc'
}

export type SortOrderItem = {
    field: string,
    order: SortOrder,
}
