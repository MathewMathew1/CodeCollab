"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("next-auth/react");
const head_1 = __importDefault(require("next/head"));
const link_1 = __importDefault(require("next/link"));
function Home() {
    const { data: session } = (0, react_1.useSession)();
    return (<>
      <head_1.default>
        <title>Codecollab</title>
        <meta name="description" content="Generated by create-t3-app"/>
        <link rel="icon" href="/favicon.ico"/>
      </head_1.default>
      <main className="flex h-full w-full flex-col items-center justify-center bg-gray-900 text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-bold">Welcome to CodeCollab</h1>
          <p className="max-w-2xl text-center text-lg">
            This is a site where you can collaborate on programming projects in
            real-time. Supported languages include JavaScript, TypeScript,
            Python, Java, C++, and C#.
          </p>
          {session ? (<link_1.default href={session ? "/new/project" : "/auth/login"}>
              <div className="mt-6 rounded-md bg-blue-600 px-5 py-3 text-lg font-semibold text-white transition hover:bg-blue-700">
                Create New Project
              </div>
            </link_1.default>) : (<div onClick={() => void (0, react_1.signIn)()} className="mt-6 rounded-md bg-blue-600 px-5 py-3 text-lg font-semibold text-white transition hover:bg-blue-700">
              Login
            </div>)}
        </div>
      </main>
    </>);
}
exports.default = Home;
function AuthShowcase() {
    var _a;
    const { data: sessionData } = (0, react_1.useSession)();
    return (<div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {(_a = sessionData.user) === null || _a === void 0 ? void 0 : _a.name}</span>}
      </p>
      <button className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20" onClick={sessionData ? () => void (0, react_1.signOut)() : () => void (0, react_1.signIn)()}>
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>);
}