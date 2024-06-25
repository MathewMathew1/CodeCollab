"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oppositeOperator = exports.OPPOSITE_OPERATORS = void 0;
exports.OPPOSITE_OPERATORS = {
    "{": "}",
    "(": ")",
    '"': '"',
    "'": "'",
    "`": "`",
};
const oppositeOperator = (operator) => {
    return exports.OPPOSITE_OPERATORS[operator];
};
exports.oppositeOperator = oppositeOperator;
