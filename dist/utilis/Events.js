"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENTS = exports.EventEmitter = void 0;
class EventEmitter {
    constructor() {
        this.events = {};
    }
    subscribe(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return {
            unsubscribe: () => {
                if (this.events[event]) {
                    this.events[event] = this.events[event].filter((l) => l !== listener);
                }
            },
        };
    }
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach((listener) => listener(data));
        }
    }
}
exports.EventEmitter = EventEmitter;
exports.EVENTS = {
    FILE_RENAME: "FILE_RENAME",
    FILE_MOVE: "FILE_MOVE",
    FILE_DELETED: "FILE_DELETED",
    FILE_CREATED: "FILE_CREATED",
    FOLDER_DELETED: "FOLDER_DELETED",
    FOLDER_RENAME: "FOLDER_RENAME",
    FOLDER_MOVE: "FOLDER_MOVE",
    FOLDER_CREATED: "FOLDER_CREATED",
};
