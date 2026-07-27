import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const staticDirectory = path.resolve(process.cwd(), ".next", "static");
const sensitiveEnvironmentNames = [
  "DATABASE_URL",
  "CONNECTION_STRING",
  "DATABASE_MIGRATION_URL",
  "BETTER_AUTH_SECRET",
];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(target) : [target];
    }),
  );
  return nested.flat();
}

const sensitiveValues = sensitiveEnvironmentNames
  .map((name) => [name, process.env[name]])
  .filter(([, value]) => typeof value === "string" && value.length >= 8);
const files = await listFiles(staticDirectory);
const findings = new Set();

for (const file of files) {
  const contents = await readFile(file, "utf8");
  if (/postgres(?:ql)?:\/\//iu.test(contents)) {
    findings.add("PostgreSQL connection string");
  }
  for (const [name, value] of sensitiveValues) {
    if (contents.includes(value)) {
      findings.add(name);
    }
  }
}

if (findings.size > 0) {
  throw new Error(
    `Bundle público contém valores sensíveis: ${[...findings].join(", ")}.`,
  );
}

console.log(`Bundle público auditado: ${files.length} arquivos sem secrets.`);
