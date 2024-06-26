"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("./context");
const root_1 = require("./api/root");
const ws_1 = require("@trpc/server/adapters/ws");
const http_1 = __importDefault(require("http"));
const next_1 = __importDefault(require("next"));
const url_1 = require("url");
const ws_2 = require("ws");
const env_1 = require("../env");
const dockerode_1 = __importDefault(require("dockerode"));
const dockerpuller_1 = require("./api/dockerpuller");
const port = parseInt(process.env.PORT || "3000");
console.log('Environment Variables:', {
    GOOGLE_CLIENT_SECRET: env_1.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    WS_PORT: process.env.WS_PORT,
    NEXT_PUBLIC_API_URL: process.env.APP_URL,
    NEXT_PUBLIC_WS_URL: process.env.WS_URL,
});
const dev = process.env.NODE_ENV !== "production";
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
void app.prepare().then(() => {
    const docker = new dockerode_1.default();
    (0, dockerpuller_1.pullCSharp)(docker);
    (0, dockerpuller_1.pullJava)(docker);
    (0, dockerpuller_1.pullNode)(docker);
    (0, dockerpuller_1.pullCPlus)(docker);
    (0, dockerpuller_1.pullPython)(docker);
    (0, dockerpuller_1.pullNodeTypescript)(docker);
    const server = http_1.default.createServer((req, res) => {
        var _a;
        const proto = req.headers["x-forwarded-proto"];
        if (proto && proto === "http") {
            // redirect to ssl
            res.writeHead(303, {
                location: `https://` + req.headers.host + ((_a = req.headers.url) !== null && _a !== void 0 ? _a : ""),
            });
            res.end();
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const parsedUrl = (0, url_1.parse)(req.url, true);
        void handle(req, res, parsedUrl);
    });
    const wss = new ws_2.WebSocketServer({ server, path: "/ws" });
    const handler = (0, ws_1.applyWSSHandler)({ wss, router: root_1.appRouter, createContext: context_1.createContext });
    process.on("SIGTERM", () => {
        console.log("SIGTERM");
        handler.broadcastReconnectNotification();
        wss.close();
    });
    server.listen(port);
    console.log(`> Server listening at http://localhost:${port} as ${dev ? "development" : process.env.NODE_ENV}`);
});
