import { createContext } from "./context";
import { appRouter } from "./api/root";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import http from "http";
import next from "next";
import { parse } from "url";
import { WebSocketServer } from "ws";
import { env } from "../env";

const port = parseInt(process.env.PORT || "3000");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

void app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const proto = req.headers["x-forwarded-proto"];
    if (proto && proto === "http") {
      // Redirect to SSL
      res.writeHead(303, {
        location: `https://${req.headers.host}${req.url}`,
      });
      res.end();
      return;
    }

    const parsedUrl = parse(req.url!, true);
    void handle(req, res, parsedUrl);
  });

  const wssPort = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001;
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("listening", () => {
    console.log(`✅ WebSocket Server listening on ws://localhost:${wssPort}`);
  });

  wss.on("connection", (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`);
    ws.once("close", () => {
      console.log(`➖➖ Connection (${wss.clients.size})`);
    });
  });

  const handler = applyWSSHandler({ wss, router: appRouter, createContext });

  process.on("SIGTERM", () => {
    console.log("SIGTERM");
    handler.broadcastReconnectNotification();
    wss.close();
  });

  server.listen(port, () => {
    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? "development" : process.env.NODE_ENV
      }`
    );
  });
});
