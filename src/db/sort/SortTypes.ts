export enum SortOrderType {
    ascending = -1,
    descending = 1
}

export type SortOrderItem = {
    field:string,
    order:SortOrderType,
}

// export type SortOrder = {
//     items:SortOrderItem[]
// }
