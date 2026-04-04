import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

function parseStatements(sql: string) {
  const statements: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let dollarTag: string | null = null;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        current += char;
      }
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && !dollarTag && char === "-" && next === "-") {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && char === "$") {
      const rest = sql.slice(index);
      const match = rest.match(/^\$[A-Za-z0-9_]*\$/);
      if (match) {
        const tag = match[0];

        if (dollarTag === tag) {
          current += tag;
          index += tag.length - 1;
          dollarTag = null;
          continue;
        }

        if (!dollarTag) {
          current += tag;
          index += tag.length - 1;
          dollarTag = tag;
          continue;
        }
      }
    }

    if (!dollarTag && !inDoubleQuote && char === "'" && sql[index - 1] !== "\\") {
      inSingleQuote = !inSingleQuote;
      current += char;
      continue;
    }

    if (!dollarTag && !inSingleQuote && char === "\"" && sql[index - 1] !== "\\") {
      inDoubleQuote = !inDoubleQuote;
      current += char;
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && !dollarTag && char === ";") {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
      continue;
    }

    current += char;
  }

  const trailing = current.trim();
  if (trailing) statements.push(trailing);

  return statements;
}

async function main() {
  const target = process.argv[2] || "prisma/migrations/20240101000000_init/migration.sql";
  const file = join(process.cwd(), target);
  const sql = readFileSync(file, "utf8");
  const statements = parseStatements(sql);

  console.log(`Applying ${statements.length} SQL statements from ${target}...`);

  for (let index = 0; index < statements.length; index += 1) {
    const statement = statements[index];
    await prisma.$executeRawUnsafe(statement);
    console.log(`  ${index + 1}/${statements.length}`);
  }

  console.log("Migration applied.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
