import { dirname, fromFileUrl } from "path";

export const rootDir=dirname(fromFileUrl(Deno.mainModule));