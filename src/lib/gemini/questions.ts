type GeminiOption = {
  label: string;
  text: string;
  score: number;
  is_correct: boolean;
};

export type GeneratedQuestion = {
  category: string;
  topic: string;
  difficulty: string;
  question_text: string;
  options: GeminiOption[];
  answer_label: string;
  explanation: string;
  source_type: string;
};

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
};

const validDifficulties = new Set(["mudah", "sedang", "sulit"]);
const validLabels = ["A", "B", "C", "D", "E"];

export function buildQuestionPrompt({
  category,
  topic,
  difficulty,
  count,
}: {
  category: string;
  topic: string;
  difficulty: string;
  count: number;
}) {
  return `Buat ${count} soal latihan CPNS original kategori ${category}, topik ${topic}, tingkat ${difficulty}.

Aturan:
- Jangan mengambil atau menyalin soal asli CAT BKN, buku komersial, PDF bajakan, atau website berbayar.
- Gunakan bahasa Indonesia yang jelas.
- Setiap soal wajib punya 5 opsi A sampai E.
- TWK dan TIU: tepat satu opsi benar, skor benar 5, salah 0.
- TKP: semua opsi punya skor 1 sampai 5, opsi terbaik skor 5.
- Pembahasan wajib ringkas dan menjelaskan alasan jawaban/skor.
- Output HARUS JSON valid tanpa markdown.

Format output persis:
{
  "questions": [
    {
      "category": "${category}",
      "topic": "${topic}",
      "difficulty": "${difficulty}",
      "question_text": "...",
      "options": [
        { "label": "A", "text": "...", "score": 0, "is_correct": false },
        { "label": "B", "text": "...", "score": 5, "is_correct": true },
        { "label": "C", "text": "...", "score": 0, "is_correct": false },
        { "label": "D", "text": "...", "score": 0, "is_correct": false },
        { "label": "E", "text": "...", "score": 0, "is_correct": false }
      ],
      "answer_label": "B",
      "explanation": "...",
      "source_type": "ai_generated"
    }
  ]
}`;
}

export async function generateQuestionsWithGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum diatur");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini gagal: ${response.status} ${errorText.slice(0, 300)}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini tidak mengembalikan teks JSON");
  }

  return text;
}

export function parseAndValidateQuestions({
  rawJson,
  category,
  topic,
  difficulty,
}: {
  rawJson: string;
  category: string;
  topic: string;
  difficulty: string;
}) {
  const parsed = JSON.parse(rawJson) as { questions?: GeneratedQuestion[] };
  const questions = parsed.questions;

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Output AI tidak memiliki array questions");
  }

  return questions.map((question, index) => {
    if (question.category !== category) {
      throw new Error(`Soal ${index + 1}: category tidak sesuai`);
    }

    if (question.topic !== topic) {
      throw new Error(`Soal ${index + 1}: topic tidak sesuai`);
    }

    if (question.difficulty !== difficulty || !validDifficulties.has(question.difficulty)) {
      throw new Error(`Soal ${index + 1}: difficulty tidak valid`);
    }

    if (!question.question_text?.trim()) {
      throw new Error(`Soal ${index + 1}: pertanyaan kosong`);
    }

    if (!question.explanation?.trim()) {
      throw new Error(`Soal ${index + 1}: pembahasan kosong`);
    }

    if (!Array.isArray(question.options) || question.options.length !== 5) {
      throw new Error(`Soal ${index + 1}: opsi tidak lengkap`);
    }

    const labels = question.options.map((option) => option.label).sort();
    if (labels.join("") !== validLabels.join("")) {
      throw new Error(`Soal ${index + 1}: label opsi harus A-E`);
    }

    if (question.category === "TWK" || question.category === "TIU") {
      const correctOptions = question.options.filter((option) => option.is_correct);
      if (correctOptions.length !== 1) {
        throw new Error(`Soal ${index + 1}: TWK/TIU harus punya satu jawaban benar`);
      }
    }

    if (question.category === "TKP") {
      const invalidScore = question.options.some((option) => option.score < 1 || option.score > 5);
      if (invalidScore) {
        throw new Error(`Soal ${index + 1}: skor TKP harus 1 sampai 5`);
      }
    }

    return question;
  });
}
