/* eslint-disable @typescript-eslint/no-require-imports */

const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { config } = require("dotenv");
const { Client } = require("pg");

config({ path: resolve(process.cwd(), ".env.local") });

const files = process.argv.slice(2);

if (files.length === 0) {
  throw new Error("Usage: node scripts/run-sql.cjs <sql-file> [...sql-file]");
}

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is not set in .env.local");
}

async function main() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();

  try {
    for (const file of files) {
      const filePath = resolve(process.cwd(), file);
      const sql = readFileSync(filePath, "utf8");

      console.log(`Running ${file}...`);
      await client.query(sql);
      console.log(`Finished ${file}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
