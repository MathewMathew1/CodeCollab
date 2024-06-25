"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayLengthValidator = exports.numberRangeValidator = exports.stringLengthValidator = void 0;
const stringLengthValidator = (fieldName, value, minLength, maxLength) => {
    if (value.length < minLength || value.length > maxLength) {
        return `${fieldName} must be between ${minLength} and ${maxLength} characters.`;
    }
    return null;
};
exports.stringLengthValidator = stringLengthValidator;
const numberRangeValidator = (fieldName, value, min, max) => {
    if (value < min || value > max) {
        return `${fieldName} must be between ${min} and ${max}.`;
    }
    return null;
};
exports.numberRangeValidator = numberRangeValidator;
const arrayLengthValidator = (fieldName, value, minLength, maxLength) => {
    if (value.length < minLength || value.length > maxLength) {
        return `${fieldName} must have between ${minLength} and ${maxLength} elements.`;
    }
    return null;
};
exports.arrayLengthValidator = arrayLengthValidator;
