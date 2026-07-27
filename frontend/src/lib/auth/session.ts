import "server-only";

import { auth } from "./server";

export type ServerSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export function getServerSession(
  requestHeaders: Headers,
): Promise<ServerSession> {
  return auth.api.getSession({ headers: requestHeaders });
}
