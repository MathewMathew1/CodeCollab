"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("next-auth/react");
const api_1 = require("../utils/api");
require("../styles/globals.css");
const head_1 = __importDefault(require("next/head"));
const Navbar_1 = require("../components/Navbar");
const useToast_1 = __importDefault(require("../contexts/useToast"));
const ToastContainer_1 = __importDefault(require("../components/ToastContainer"));
const MyApp = ({ Component, pageProps: { session, ...pageProps }, }) => {
    return (<useToast_1.default>
      <react_1.SessionProvider session={session}>
        <head_1.default>
          <title>Codebolaration</title>
          <meta name="description" content="This is Reddit clone by me"/>
          <link rel="icon" href="/favicon.ico"/>
        </head_1.default>
        <div className="flex h-screen flex-col  bg-slate-100 bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white  ">
          <Navbar_1.Navbar />
          <Component {...pageProps}/>
          <ToastContainer_1.default />
        </div>
      </react_1.SessionProvider>
    </useToast_1.default>);
};
exports.default = api_1.trpc.withTRPC(MyApp);
