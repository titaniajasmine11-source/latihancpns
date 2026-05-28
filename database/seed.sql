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
