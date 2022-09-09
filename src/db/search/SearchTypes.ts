export enum SearchItemComparison {
    notEquals = -1,
    equals = 1,
    lessThan,
    lessThanEqual,
    greaterThan,
    greaterThanEqual,
    isNull,
    isNotNull,
}

export type SearchItem = {
    field:string,
    comparison:SearchItemComparison,
    value?:any
}

export type SearchFilter = {
    items:SearchItem[]
}
