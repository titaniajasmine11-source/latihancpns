/* eslint-disable @typescript-eslint/no-require-imports */
const { config } = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const { resolve } = require("node:path");

config({ path: resolve(process.cwd(), ".env.local") });

const targetPerTopic = Number(process.argv[2] ?? 30);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib tersedia");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const twkStems = [
  "sikap yang paling sesuai dengan nilai Pancasila adalah",
  "tindakan yang mencerminkan komitmen terhadap UUD 1945 adalah",
  "perilaku yang memperkuat persatuan dalam NKRI adalah",
  "sikap yang tepat dalam menjaga Bhinneka Tunggal Ika adalah",
  "contoh nasionalisme yang sehat dalam kehidupan sehari-hari adalah",
  "bentuk bela negara yang relevan bagi ASN adalah",
  "contoh integritas dalam pelayanan publik adalah",
  "cara memahami peristiwa sejarah secara bertanggung jawab adalah",
  "sikap yang mendukung wawasan kebangsaan adalah",
  "respons terbaik saat menghadapi informasi yang memecah belah adalah",
];

const tiuStems = [
  "pilih kesimpulan yang paling logis dari pernyataan yang diberikan",
  "tentukan pola angka yang paling konsisten",
  "pilih hubungan kata yang paling sepadan",
  "pilih sinonim atau makna yang paling dekat",
  "pilih antonim atau makna yang paling berlawanan",
  "selesaikan perbandingan kuantitatif dengan tepat",
  "tentukan hasil aritmetika sederhana secara efisien",
  "pilih susunan logika analitis yang paling mungkin",
  "identifikasi pola figural secara konseptual",
  "pilih jawaban yang paling konsisten dengan semua premis",
];

const tkpStems = [
  "sikap kerja yang paling tepat dalam situasi pelayanan adalah",
  "respons terbaik saat berkoordinasi dengan jejaring kerja adalah",
  "tindakan yang menunjukkan kepekaan sosial budaya adalah",
  "sikap yang paling profesional saat mendapat tekanan pekerjaan adalah",
  "respons terbaik terhadap perubahan teknologi informasi adalah",
  "tindakan paling tepat untuk menolak radikalisme di lingkungan kerja adalah",
  "cara mengambil keputusan yang paling bertanggung jawab adalah",
  "contoh integritas kerja yang paling kuat adalah",
  "sikap terbaik saat harus beradaptasi dengan prosedur baru adalah",
  "respons terbaik saat prioritas layanan berubah mendadak adalah",
];

async function main() {
  const { data: topics, error } = await supabase
    .from("topics")
    .select("id, name, slug, category_id, categories(id, code)")
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) throw error;

  for (const topic of topics ?? []) {
    const category = Array.isArray(topic.categories) ? topic.categories[0] : topic.categories;
    const { count } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", topic.id)
      .eq("status", "published");
    let stock = count ?? 0;

    for (let n = stock + 1; n <= targetPerTopic; n += 1) {
      await insertGeneratedQuestion({ category, topic, n });
      stock += 1;
    }

    console.log(`${category.code} - ${topic.name}: ${stock}/${targetPerTopic}`);
  }
}

async function insertGeneratedQuestion({ category, topic, n }) {
  const stem = pickStem(category.code, n);
  const questionText = `${category.code} ${topic.name} - Soal latihan CPNS 2026 nomor ${n}. Dalam konteks ${topic.name.toLowerCase()}, ${stem}...`;
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("questions")
    .select("id")
    .eq("question_text", questionText)
    .maybeSingle();
  if (existing) return;

  const { data: question, error: questionError } = await supabase
    .from("questions")
    .insert({
      category_id: category.id,
      topic_id: topic.id,
      question_text: questionText,
      explanation: buildExplanation(category.code, topic.name),
      difficulty: n % 5 === 0 ? "sulit" : n % 3 === 0 ? "sedang" : "mudah",
      status: "published",
      source_type: "original_seed_2026",
      generated_by_ai: false,
      reviewed_at: now,
      published_at: now,
    })
    .select("id")
    .single();

  if (questionError || !question) throw questionError ?? new Error("Gagal insert soal");

  const options = category.code === "TKP" ? tkpOptions() : standardOptions(category.code);
  const { error: optionError } = await supabase.from("question_options").insert(
    options.map((option) => ({
      question_id: question.id,
      ...option,
    })),
  );

  if (optionError) throw optionError;
}

function pickStem(categoryCode, n) {
  const source = categoryCode === "TWK" ? twkStems : categoryCode === "TIU" ? tiuStems : tkpStems;
  return source[(n - 1) % source.length];
}

function standardOptions(categoryCode) {
  const best = categoryCode === "TWK"
    ? "Mengutamakan kepentingan bangsa, taat aturan, dan menjaga persatuan."
    : "Menarik kesimpulan berdasarkan pola atau premis yang paling konsisten.";
  return [
    { label: "A", option_text: best, is_correct: true, score: 5 },
    { label: "B", option_text: "Mengambil keputusan berdasarkan dugaan tanpa memeriksa informasi.", is_correct: false, score: 0 },
    { label: "C", option_text: "Mengabaikan aturan karena hasil akhir dianggap lebih penting.", is_correct: false, score: 0 },
    { label: "D", option_text: "Mengikuti pendapat mayoritas tanpa menilai kebenarannya.", is_correct: false, score: 0 },
    { label: "E", option_text: "Menunda penyelesaian walaupun data yang diperlukan sudah cukup.", is_correct: false, score: 0 },
  ];
}

function tkpOptions() {
  return [
    { label: "A", option_text: "Bersikap proaktif, komunikatif, dan tetap sesuai aturan pelayanan.", is_correct: true, score: 5 },
    { label: "B", option_text: "Menyelesaikan masalah dengan koordinasi terbatas namun tetap sopan.", is_correct: false, score: 4 },
    { label: "C", option_text: "Menunggu arahan lebih lanjut tanpa memperburuk keadaan.", is_correct: false, score: 3 },
    { label: "D", option_text: "Menghindari tanggung jawab karena khawatir membuat kesalahan.", is_correct: false, score: 2 },
    { label: "E", option_text: "Mengabaikan masalah karena bukan prioritas pribadi.", is_correct: false, score: 1 },
  ];
}

function buildExplanation(categoryCode, topicName) {
  if (categoryCode === "TWK") {
    return `Jawaban terbaik pada topik ${topicName} adalah pilihan yang menjaga persatuan, taat pada nilai dasar negara, dan mengutamakan kepentingan umum.`;
  }
  if (categoryCode === "TIU") {
    return `Jawaban terbaik pada topik ${topicName} dipilih dengan mengikuti pola, relasi, atau premis yang paling konsisten dan tidak bertentangan.`;
  }
  return `Jawaban terbaik pada topik ${topicName} menunjukkan pelayanan, integritas, profesionalisme, adaptasi, serta komunikasi yang bertanggung jawab.`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
