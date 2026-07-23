import "server-only";

import { readPrivateEnv } from "@/config/private-env";
import { db } from "@/db";
import * as authSchema from "@/db/schema/auth";

import { createAuth } from "./factory";

const environment = readPrivateEnv();

export const auth = createAuth(db, authSchema, environment);
