export enum Compare {
    notEquals = '!=',
    equals = '==',
    lessThan = '<',
    lessThanEqual = '<=',
    greaterThan = '>',
    greaterThanEqual = '>=',
    isNull = 'is null',
    isNotNull = 'is not null',
}

export type SearchItem = {
    field: string,
    comparison: Compare,
    value?: any
}


