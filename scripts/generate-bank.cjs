/* eslint-disable @typescript-eslint/no-require-imports */
const { config } = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const { resolve } = require("node:path");

config({ path: resolve(process.cwd(), ".env.local") });

const targetPerTopic = Number(process.argv[2] ?? 20);
const batchSize = Math.min(Number(process.argv[3] ?? 5), 5);
const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = process.env.GEMINI_API_KEY;
const allowServiceRole = process.env.ALLOW_SERVICE_ROLE_SCRIPT === "true";

if (!supabaseUrl || !serviceRoleKey || !apiKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, dan GEMINI_API_KEY wajib tersedia");
}

if (!allowServiceRole) {
  throw new Error("Set ALLOW_SERVICE_ROLE_SCRIPT=true untuk menjalankan script service-role secara eksplisit");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const validLabels = ["A", "B", "C", "D", "E"];

async function main() {
  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id, name, slug, category_id, categories(id, code, name)")
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (topicsError) {
    throw topicsError;
  }

  for (const topic of topics ?? []) {
    const category = Array.isArray(topic.categories) ? topic.categories[0] : topic.categories;
    const { count } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", topic.id)
      .eq("status", "published");
    let stock = count ?? 0;

    while (stock < targetPerTopic) {
      const requested = Math.min(batchSize, targetPerTopic - stock);
      console.log(`Generating ${requested} soal: ${category.code} - ${topic.name} (stok ${stock}/${targetPerTopic})`);
      const prompt = buildPrompt({ category: category.code, topic: topic.name, count: requested });
      const rawJson = await callGemini(prompt);
      const questions = parseQuestions(rawJson, category.code, topic.name);
      const inserted = await insertQuestions({
        categoryId: category.id,
        topicId: topic.id,
        categoryCode: category.code,
        questions,
      });
      stock += inserted;

      if (inserted === 0) {
        console.log(`Skip ${category.code} - ${topic.name}: semua hasil duplikat`);
        break;
      }
    }
  }

  console.log("Bank soal generation finished");
}

function buildPrompt({ category, topic, count }) {
  return `Buat ${count} soal latihan CPNS 2026 original kategori ${category}, topik ${topic}.

Aturan:
- Jangan mengambil, menyalin, atau meniru soal asli CAT BKN, buku komersial, PDF bajakan, website berbayar, atau bocoran.
- Buat soal original berbasis kompetensi CPNS umum.
- Bahasa Indonesia formal, jelas, dan tidak ambigu.
- Setiap soal punya 5 opsi A sampai E.
- TWK/TIU: tepat satu opsi benar, skor benar 5, salah 0.
- TKP: semua opsi punya skor 1 sampai 5, opsi terbaik skor 5.
- Pembahasan wajib menjelaskan alasan jawaban/skor.
- Output HARUS JSON valid tanpa markdown.

Format:
{"questions":[{"category":"${category}","topic":"${topic}","difficulty":"sedang","question_text":"...","options":[{"label":"A","text":"...","score":0,"is_correct":false}],"answer_label":"A","explanation":"...","source_type":"ai_generated"}]}`;
}

async function callGemini(prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini gagal: ${response.status} ${(await response.text()).slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini tidak mengembalikan JSON");
  }
  return text;
}

function parseQuestions(rawJson, category, topic) {
  const parsed = JSON.parse(rawJson);
  if (!Array.isArray(parsed.questions)) {
    throw new Error("Output AI tidak memiliki questions array");
  }

  return parsed.questions.map((question, index) => {
    if (question.category !== category || question.topic !== topic) {
      throw new Error(`Soal ${index + 1}: category/topic tidak sesuai`);
    }
    if (!question.question_text?.trim() || !question.explanation?.trim()) {
      throw new Error(`Soal ${index + 1}: pertanyaan/pembahasan kosong`);
    }
    if (!Array.isArray(question.options) || question.options.length !== 5) {
      throw new Error(`Soal ${index + 1}: opsi tidak lengkap`);
    }
    if (question.options.map((option) => option.label).sort().join("") !== validLabels.join("")) {
      throw new Error(`Soal ${index + 1}: label opsi harus A-E`);
    }
    if ((category === "TWK" || category === "TIU") && question.options.filter((option) => option.is_correct).length !== 1) {
      throw new Error(`Soal ${index + 1}: TWK/TIU harus punya satu jawaban benar`);
    }
    if (category === "TKP" && question.options.some((option) => option.score < 1 || option.score > 5)) {
      throw new Error(`Soal ${index + 1}: skor TKP harus 1 sampai 5`);
    }
    return question;
  });
}

async function insertQuestions({ categoryId, topicId, categoryCode, questions }) {
  const { data: existing } = await supabase
    .from("questions")
    .select("question_text")
    .eq("topic_id", topicId);
  const existingTexts = new Set((existing ?? []).map((item) => item.question_text.trim().toLowerCase()));
  let inserted = 0;

  for (const question of questions) {
    const key = question.question_text.trim().toLowerCase();
    if (existingTexts.has(key)) {
      continue;
    }

    const now = new Date().toISOString();
    const { data: insertedQuestion, error: questionError } = await supabase
      .from("questions")
      .insert({
        category_id: categoryId,
        topic_id: topicId,
        question_text: question.question_text.trim(),
        explanation: question.explanation.trim(),
        difficulty: question.difficulty ?? "sedang",
        status: "published",
        source_type: "ai_generated",
        generated_by_ai: true,
        ai_model: model,
        reviewed_at: now,
        published_at: now,
      })
      .select("id")
      .single();

    if (questionError || !insertedQuestion) {
      throw questionError ?? new Error("Gagal insert question");
    }

    const { error: optionsError } = await supabase.from("question_options").insert(
      question.options.map((option) => ({
        question_id: insertedQuestion.id,
        label: option.label,
        option_text: option.text.trim(),
        is_correct: categoryCode === "TKP" ? option.score === 5 : option.is_correct === true,
        score: option.score,
      })),
    );

    if (optionsError) {
      throw optionsError;
    }

    existingTexts.add(key);
    inserted += 1;
  }

  return inserted;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
