import { spawnSync } from "node:child_process";

const npmCli = process.env.npm_execpath;
if (npmCli === undefined || npmCli === "") {
  throw new Error("Execute esta auditoria por meio de npm run.");
}
const auditEnvironment = {
  ...process.env,
  DATABASE_MIGRATION_URL:
    process.env.DATABASE_MIGRATION_URL ??
    "postgresql://audit:placeholder@ep-schema-audit.sa-east-1.aws.neon.tech/fileflow_audit?sslmode=require",
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: auditEnvironment,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} falhou.`);
  }
}

run(process.execPath, [npmCli, "run", "auth:schema"]);
run(process.execPath, [npmCli, "run", "db:generate"]);

const difference = spawnSync(
  "git",
  ["diff", "--quiet", "HEAD", "--", "src/db/schema/auth.ts", "drizzle"],
  { cwd: process.cwd() },
);
const untracked = spawnSync(
  "git",
  [
    "ls-files",
    "--others",
    "--exclude-standard",
    "--",
    "src/db/schema/auth.ts",
    "drizzle",
  ],
  { cwd: process.cwd(), encoding: "utf8" },
);
if (difference.status === null || untracked.status !== 0) {
  throw new Error("Não foi possível auditar os artefatos de schema.");
}
if (difference.status !== 0 || untracked.stdout.trim() !== "") {
  throw new Error(
    "Schema Better Auth e migrations Drizzle não estão sincronizados.",
  );
}

console.log("Schema Better Auth e migrations Drizzle estão sincronizados.");
