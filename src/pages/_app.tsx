import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { trpc } from "../utils/api";
import "../styles/globals.css";
import Head from "next/head";
import { Navbar } from "../components/Navbar";
import ToastProvider from "../contexts/useToast";
import ToastContainer from "../components/ToastContainer";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <ToastProvider>
      <SessionProvider session={session}>
        <Head>
          <title>Codebolaration</title>
          <meta name="description" content="This is Reddit clone by me" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="flex h-screen flex-col  bg-slate-100 bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white  ">
          <Navbar />
          <Component {...pageProps} />
          <ToastContainer />
        </div>
      </SessionProvider>
    </ToastProvider>
  );
};

export default trpc.withTRPC(MyApp);
