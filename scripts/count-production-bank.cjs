/* eslint-disable @typescript-eslint/no-require-imports */
const { config } = require("dotenv");
const { Client } = require("pg");
const { resolve } = require("node:path");

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const result = await client.query(`
      select
        c.code,
        count(q.id)::int as questions,
        count(q.id) filter (where q.status = 'published')::int as published,
        count(q.id) filter (where q.status = 'draft')::int as draft
      from categories c
      left join questions q on q.category_id = c.id
      group by c.code
      order by c.code
    `);
    console.table(result.rows);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
