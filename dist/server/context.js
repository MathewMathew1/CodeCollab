"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
const react_1 = require("next-auth/react");
const db_1 = require("./db");
/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
const createContext = async (opts) => {
    const session = await (0, react_1.getSession)(opts);
    //console.log("createContext for", session?.user?.name ?? "unknown user");
    return {
        prisma: db_1.db,
        session,
    };
};
exports.createContext = createContext;
