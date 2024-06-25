"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useArray = (defaultValue) => {
    const [array, setArray] = (0, react_1.useState)(defaultValue);
    const push = (value) => {
        setArray(array => [...array, value]);
    };
    const update = (newValue, index) => {
        setArray(array => [
            ...array.slice(0, index), // remove value
            newValue,
            ...array.slice(index + 1, array.length)
        ]);
    };
    const includes = (value) => {
        if (array.includes(value)) {
            return true;
        }
        return false;
    };
    const removeValueByIndex = (index) => {
        setArray(array => [...array.slice(0, index), ...array.slice(index + 1, array.length)]);
    };
    //Works on array of objects
    const updateObjectByKey = (key, keyValue, updatedFields) => {
        const index = array.findIndex((obj) => obj[key] === keyValue);
        if (index === -1)
            return;
        let objectToUpdate = array[index];
        for (let i = 0; i < updatedFields.length; i++) {
            objectToUpdate[updatedFields[i]["field"]] = updatedFields[i]["fieldValue"];
        }
        setArray(array => [
            ...array.slice(0, index), // remove value
            objectToUpdate,
            ...array.slice(index + 1, array.length)
        ]);
    };
    const removeByKey = (key, keyValue) => {
        const index = array.findIndex((obj) => obj[key] === keyValue);
        if (index === -1)
            return;
        setArray(array => [...array.slice(0, index), ...array.slice(index + 1, array.length)]);
    };
    const findIndexByKey = (key, keyValue) => {
        const index = array.findIndex((obj) => obj[key] === keyValue);
        return index;
    };
    const updateObjectByIndex = (index, updatedFields) => {
        let objectToUpdate = array[index];
        if (!objectToUpdate)
            return;
        for (let i = 0; i < updatedFields.length; i++) {
            objectToUpdate = {
                ...objectToUpdate,
                [updatedFields[i]["field"]]: updatedFields[i]["fieldValue"]
            };
        }
        setArray(array => [
            ...array.slice(0, index), // remove value
            objectToUpdate, // Use type assertion here, assuming it's safe due to earlier checks
            ...array.slice(index + 1, array.length)
        ]);
    };
    const replaceObjectByIndex = (index, object) => {
        setArray(array => [
            ...array.slice(0, index), // remove value
            object,
            ...array.slice(index + 1, array.length)
        ]);
    };
    return { array, set: setArray, push, removeValueByIndex, update, includes, removeByKey,
        updateObjectByKey, updateObjectByIndex, findIndexByKey, replaceObjectByIndex };
};
exports.default = useArray;
