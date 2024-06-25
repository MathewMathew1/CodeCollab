"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("./context");
const ws_1 = require("@trpc/server/adapters/ws");
const ws_2 = require("ws");
const root_1 = require("./api/root");
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001; // Use the provided PORT or default to 3001 if not set
const wss = new ws_2.WebSocketServer({
    port: PORT,
});
const handler = (0, ws_1.applyWSSHandler)({ wss, router: root_1.appRouter, createContext: context_1.createContext });
wss.on("listening", () => {
    console.log(`✅ WebSocket Server listening on ws://localhost:${PORT}`);
});
wss.on("connection", (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`);
    ws.once("close", () => {
        console.log(`➖➖ Connection (${wss.clients.size})`);
    });
});
process.on("SIGTERM", () => {
    console.log("SIGTERM");
    handler.broadcastReconnectNotification();
    wss.close();
});
