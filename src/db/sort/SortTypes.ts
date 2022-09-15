export enum Order {
    ascending = 'asc',
    descending = 'dsc'
}

export type SortOrderItem = {
    field: string,
    order: Order,
}
