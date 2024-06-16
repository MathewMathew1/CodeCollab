import { createContext } from "./context";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";
import { appRouter } from "./api/root";

const PORT = process.env.PORT? parseInt(process.env.PORT) : 3001; // Use the provided PORT or default to 3001 if not set

const wss = new WebSocketServer({
  port: PORT,
});
const handler = applyWSSHandler({ wss, router: appRouter, createContext });

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
