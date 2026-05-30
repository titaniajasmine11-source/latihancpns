/* eslint-disable @typescript-eslint/no-require-imports */
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { config } = require("dotenv");
const { Client } = require("pg");

config({ path: resolve(process.cwd(), ".env.local") });

const qualityReportPath = resolve(process.cwd(), "..", "Bank Soal", "_parsed_questions", "quality_report.csv");

function parseCsvLine(line) {
  const cells = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  cells.push(value);
  return cells;
}

function loadBadSourceUrls() {
  const lines = readFileSync(qualityReportPath, "utf8").trim().split(/\r?\n/).slice(1);
  return lines.map((line) => {
    const [, , sourceFile, sourceNumber] = parseCsvLine(line);
    return `${sourceFile}#soal-${sourceNumber}`;
  });
}

async function main() {
  if (!process.env.DIRECT_URL) {
    throw new Error("DIRECT_URL wajib tersedia");
  }

  const badSourceUrls = loadBadSourceUrls();
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query("begin");

    const demotedSeed = await client.query(`
      update questions
      set status = 'draft', published_at = null
      where source_type = 'original_seed_2026'
        and status = 'published'
      returning id
    `);

    const demotedNoisy = await client.query(
      `
        update questions
        set status = 'draft', published_at = null
        where source_type = 'pdf_extract'
          and source_url = any($1::text[])
        returning id
      `,
      [badSourceUrls],
    );

    const publishedClean = await client.query(
      `
        update questions
        set status = 'published', published_at = coalesce(published_at, now())
        where source_type = 'pdf_extract'
          and status <> 'published'
          and not (source_url = any($1::text[]))
          and exists (
            select 1
            from question_options qo
            where qo.question_id = questions.id
            group by qo.question_id
            having count(*) = 5
          )
        returning id
      `,
      [badSourceUrls],
    );

    await client.query("commit");

    console.table([
      { action: "demoted_original_seed", total: demotedSeed.rowCount },
      { action: "demoted_noisy_extract", total: demotedNoisy.rowCount },
      { action: "published_clean_extract", total: publishedClean.rowCount },
    ]);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
