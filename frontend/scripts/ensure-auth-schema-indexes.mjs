import { readFile, writeFile } from "node:fs/promises";

const schemaPath = new URL("../src/db/schema/auth.ts", import.meta.url);
const generatedIndex =
  '  (table) => [index("account_userId_idx").on(table.userId)],';

const source = await readFile(schemaPath, "utf8");
const newline = source.includes("\r\n") ? "\r\n" : "\n";
const requiredIndexes = [
  "  (table) => [",
  '    index("account_userId_idx").on(table.userId),',
  '    index("account_providerId_accountId_idx").on(',
  "      table.providerId,",
  "      table.accountId,",
  "    ),",
  "  ],",
].join(newline);

if (source.includes(requiredIndexes)) {
  process.exit(0);
}

const matches = source.split(generatedIndex).length - 1;
if (matches !== 1) {
  throw new Error(
    "O schema gerado mudou e os índices obrigatórios de account precisam ser revisados.",
  );
}

await writeFile(
  schemaPath,
  source.replace(generatedIndex, requiredIndexes),
  "utf8",
);
