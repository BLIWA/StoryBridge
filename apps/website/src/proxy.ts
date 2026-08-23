import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Named `proxy.ts` per the Next.js 16 convention (formerly `middleware.ts`).
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
