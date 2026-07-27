import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

const handlers = toNextJsHandler(auth);

export const GET = handlers.GET;
export const POST = handlers.POST;
