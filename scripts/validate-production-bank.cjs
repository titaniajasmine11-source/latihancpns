/* eslint-disable @typescript-eslint/no-require-imports */
const { config } = require("dotenv");
const { Client } = require("pg");
const { resolve } = require("node:path");

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const missingOptions = await client.query(`
      select count(*)::int as questions_without_5_options
      from questions q
      where not exists (
        select 1
        from question_options qo
        where qo.question_id = q.id
        group by qo.question_id
        having count(*) = 5
      )
    `);
    const extracted = await client.query(`
      select status, count(*)::int as total
      from questions
      where source_type = 'pdf_extract'
      group by status
      order by status
    `);
    console.table(missingOptions.rows);
    console.table(extracted.rows);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
