import { ResolveOptions } from "trpc/server";
declare module "*.png" {
  export default "" as string
 }
interface CustomResolveOptions<TInput, TOutput>
  extends ResolveOptions<TInput, TOutput> {
  clientId?: string; // Add clientId property
}

// Merge the original ResolveOptions interface with the custom interface
declare module "trpc/server" {
  interface ResolveOptions<TInput, TOutput>
    extends CustomResolveOptions<TInput, TOutput> {}
}
declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}
