import { createContext } from "./context";
import { appRouter } from "./api/root";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import http from "http";
import next from "next";
import { parse } from "url";
import { WebSocketServer } from "ws";
import { env } from "../env";

const port = parseInt(process.env.PORT || "3000");
console.log('Environment Variables:', {
  GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  WS_PORT: process.env.WS_PORT,
  NEXT_PUBLIC_API_URL: process.env.APP_URL,
  NEXT_PUBLIC_WS_URL: process.env.WS_URL,
});
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

void app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const proto = req.headers["x-forwarded-proto"];
    if (proto && proto === "http") {
      // redirect to ssl
      res.writeHead(303, {
        location: `https://` + req.headers.host + (req.headers.url ?? ""),
      });
      res.end();
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    console.log({c: req.url})
    const parsedUrl = parse(req.url!, true);

    void handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server, path: "/ws" });
  
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
  server.listen(port);

  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`,
  );
});
