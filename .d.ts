import { ResolveOptions } from "trpc/server";

interface CustomResolveOptions<TInput, TOutput> extends ResolveOptions<TInput, TOutput> {
    clientId?: string; // Add clientId property
  }
  
  // Merge the original ResolveOptions interface with the custom interface
  declare module 'trpc/server' {
    interface ResolveOptions<TInput, TOutput> extends CustomResolveOptions<TInput, TOutput> {}
  }