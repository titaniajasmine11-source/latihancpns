insert into categories (code, name, description) values
  ('TWK', 'Tes Wawasan Kebangsaan', 'Materi kebangsaan, ideologi, konstitusi, dan sejarah Indonesia.'),
  ('TIU', 'Tes Intelegensia Umum', 'Materi kemampuan verbal, numerik, logika, dan figural.'),
  ('TKP', 'Tes Karakteristik Pribadi', 'Materi perilaku kerja, pelayanan, integritas, dan adaptasi.')
on conflict (code) do update set name = excluded.name, description = excluded.description;

with category_map as (
  select id, code from categories
)
insert into topics (category_id, name, slug) values
  ((select id from category_map where code = 'TWK'), 'Pancasila', 'pancasila'),
  ((select id from category_map where code = 'TWK'), 'UUD 1945', 'uud-1945'),
  ((select id from category_map where code = 'TWK'), 'NKRI', 'nkri'),
  ((select id from category_map where code = 'TWK'), 'Bhinneka Tunggal Ika', 'bhinneka-tunggal-ika'),
  ((select id from category_map where code = 'TWK'), 'Nasionalisme', 'nasionalisme'),
  ((select id from category_map where code = 'TWK'), 'Bela Negara', 'bela-negara'),
  ((select id from category_map where code = 'TWK'), 'Integritas', 'integritas'),
  ((select id from category_map where code = 'TWK'), 'Sejarah Indonesia', 'sejarah-indonesia'),
  ((select id from category_map where code = 'TWK'), 'Wawasan Kebangsaan', 'wawasan-kebangsaan'),
  ((select id from category_map where code = 'TIU'), 'Analogi', 'analogi'),
  ((select id from category_map where code = 'TIU'), 'Sinonim', 'sinonim'),
  ((select id from category_map where code = 'TIU'), 'Antonim', 'antonim'),
  ((select id from category_map where code = 'TIU'), 'Silogisme', 'silogisme'),
  ((select id from category_map where code = 'TIU'), 'Deret Angka', 'deret-angka'),
  ((select id from category_map where code = 'TIU'), 'Aritmetika', 'aritmetika'),
  ((select id from category_map where code = 'TIU'), 'Perbandingan', 'perbandingan'),
  ((select id from category_map where code = 'TIU'), 'Logika Analitis', 'logika-analitis'),
  ((select id from category_map where code = 'TIU'), 'Figural', 'figural'),
  ((select id from category_map where code = 'TKP'), 'Pelayanan Publik', 'pelayanan-publik'),
  ((select id from category_map where code = 'TKP'), 'Jejaring Kerja', 'jejaring-kerja'),
  ((select id from category_map where code = 'TKP'), 'Sosial Budaya', 'sosial-budaya'),
  ((select id from category_map where code = 'TKP'), 'Profesionalisme', 'profesionalisme'),
  ((select id from category_map where code = 'TKP'), 'Teknologi Informasi', 'teknologi-informasi'),
  ((select id from category_map where code = 'TKP'), 'Anti Radikalisme', 'anti-radikalisme'),
  ((select id from category_map where code = 'TKP'), 'Pengambilan Keputusan', 'pengambilan-keputusan'),
  ((select id from category_map where code = 'TKP'), 'Integritas Kerja', 'integritas-kerja'),
  ((select id from category_map where code = 'TKP'), 'Adaptasi', 'adaptasi')
on conflict (category_id, slug) do update set name = excluded.name;

insert into app_settings (key, value) values
  ('scoring', '{"TWK":{"correct":5,"wrong":0},"TIU":{"correct":5,"wrong":0},"TKP":{"min":1,"max":5}}'),
  ('practice', '{"default_question_count":10,"allowed_question_counts":[5,10,20]}'),
  ('generation_limits', '{"max_per_click":5,"max_per_day":25,"retry":2}')
on conflict (key) do update set value = excluded.value, updated_at = now();

with seed_questions as (
  select * from (values
    ('TWK', 'pancasila', 'sedang', 'published', 'Sila keempat Pancasila menekankan prinsip utama dalam kehidupan bernegara, yaitu...', 'Musyawarah untuk mencapai mufakat dalam pengambilan keputusan.', 'Kebebasan individu tanpa batas.', 'Pemisahan masyarakat berdasarkan golongan.', 'Kepentingan pribadi di atas kepentingan umum.', 'Kekuasaan mutlak di tangan satu orang.', 'A', 'Sila keempat berbunyi Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan.'),
    ('TIU', 'silogisme', 'sedang', 'published', 'Semua pegawai disiplin datang tepat waktu. Sebagian peserta adalah pegawai. Kesimpulan yang paling tepat adalah...', 'Semua peserta datang tepat waktu.', 'Sebagian peserta mungkin datang tepat waktu.', 'Tidak ada peserta yang datang tepat waktu.', 'Semua pegawai adalah peserta.', 'Semua peserta adalah pegawai.', 'B', 'Karena hanya sebagian peserta yang merupakan pegawai, kesimpulan paling aman adalah sebagian peserta mungkin datang tepat waktu.'),
    ('TKP', 'pelayanan-publik', 'sedang', 'published', 'Seorang warga marah karena antrean pelayanan sangat lama. Sikap terbaik Anda adalah...', 'Mendengarkan keluhan, meminta maaf, menjelaskan kondisi antrean, dan membantu mencari solusi.', 'Meminta warga menunggu tanpa penjelasan karena semua orang juga antre.', 'Menyuruh warga kembali esok hari agar situasi lebih tenang.', 'Mengabaikan warga tersebut agar tidak mengganggu pelayanan.', 'Membalas dengan nada tegas karena warga bersikap marah.', 'A', 'Pelayanan publik menuntut empati, komunikasi jelas, dan orientasi solusi meskipun pengguna layanan sedang emosi.')
  ) as q(category_code, topic_slug, difficulty, status, question_text, option_a, option_b, option_c, option_d, option_e, answer_label, explanation)
), inserted_questions as (
  insert into questions (category_id, topic_id, question_text, explanation, difficulty, status, source_type, generated_by_ai, published_at)
  select c.id, t.id, sq.question_text, sq.explanation, sq.difficulty, sq.status, 'manual_seed', false, now()
  from seed_questions sq
  join categories c on c.code = sq.category_code
  join topics t on t.category_id = c.id and t.slug = sq.topic_slug
  where not exists (
    select 1 from questions existing where existing.question_text = sq.question_text
  )
  returning id, question_text
), option_rows as (
  select iq.id as question_id, sq.answer_label, option_data.label, option_data.option_text,
    case
      when sq.category_code in ('TWK', 'TIU') and option_data.label = sq.answer_label then 5
      when sq.category_code in ('TWK', 'TIU') then 0
      when sq.category_code = 'TKP' and option_data.label = 'A' then 5
      when sq.category_code = 'TKP' and option_data.label = 'B' then 4
      when sq.category_code = 'TKP' and option_data.label = 'C' then 3
      when sq.category_code = 'TKP' and option_data.label = 'D' then 2
      else 1
    end as score
  from inserted_questions iq
  join seed_questions sq on sq.question_text = iq.question_text
  cross join lateral (values
    ('A', sq.option_a),
    ('B', sq.option_b),
    ('C', sq.option_c),
    ('D', sq.option_d),
    ('E', sq.option_e)
  ) as option_data(label, option_text)
)
insert into question_options (question_id, label, option_text, is_correct, score)
select question_id, label, option_text, label = answer_label, score
from option_rows
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  is_correct = excluded.is_correct,
  score = excluded.score;
