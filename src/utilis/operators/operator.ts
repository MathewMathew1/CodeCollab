export const OPPOSITE_OPERATORS = {
    "{": "}",
    "(": ")",
    '"': '"',
    "'": "'",
    "`": "`",
}
  
export type OppositeOperators = keyof typeof OPPOSITE_OPERATORS;
  
export const oppositeOperator = (operator: OppositeOperators) => {
    return OPPOSITE_OPERATORS[operator];
}