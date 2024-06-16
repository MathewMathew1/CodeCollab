export type EventHandler = (data: any) => void;

export class EventEmitter {
  private events: Record<string, EventHandler[]>;

  constructor() {
    this.events = {};
  }

  subscribe(event: string, listener: EventHandler) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return {
      unsubscribe: () => {
        this.events[event] = this.events[event]!.filter((l) => l !== listener);
      },
    };
  }

  emit(event: string, data: any) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(data));
    }
  }
}

export const EVENTS = {
  FILE_RENAME: "FILE_RENAME",
  FILE_MOVE: "FILE_MOVE",
  FILE_DELETED: "FILE_DELETED",
  FILE_CREATED: "FILE_CREATED",
  FOLDER_DELETED: "FOLDER_DELETED",
  FOLDER_RENAME: "FOLDER_RENAME",
  FOLDER_MOVE: "FOLDER_MOVE",
  FOLDER_CREATED: "FOLDER_CREATED",
} as const;

export type EventKeys = keyof typeof EVENTS;
