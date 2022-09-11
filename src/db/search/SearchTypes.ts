export enum SearchItemComparison {
    notEquals = 'ne',
    equals = 'eq',
    lessThan = 'lt',
    lessThanEqual = 'lte',
    greaterThan = 'gt',
    greaterThanEqual = 'gte',
    isNull = 'null',
    isNotNull = 'notnull',
}

export type SearchItem = {
    field:string,
    comparison:SearchItemComparison,
    value?:any
}


