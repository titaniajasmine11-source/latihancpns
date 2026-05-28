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
  ('scoring', '{"TWK":{"correct":5,"wrong":0,"passing_grade":65},"TIU":{"correct":5,"wrong":0,"passing_grade":80},"TKP":{"min":1,"max":5,"passing_grade":166}}'),
  ('practice', '{"default_question_count":10,"allowed_question_counts":[5,10,20],"exam_category_targets":{"TWK":5,"TIU":5,"TKP":5}}'),
  ('generation_limits', '{"max_per_click":5,"max_per_day":25,"retry":2}')
on conflict (key) do update set value = excluded.value, updated_at = now();

with seed_questions as (
  select * from (values
    ('TWK', 'pancasila', 'sedang', 'published', 'Sila keempat Pancasila menekankan prinsip utama dalam kehidupan bernegara, yaitu...', 'Musyawarah untuk mencapai mufakat dalam pengambilan keputusan.', 'Kebebasan individu tanpa batas.', 'Pemisahan masyarakat berdasarkan golongan.', 'Kepentingan pribadi di atas kepentingan umum.', 'Kekuasaan mutlak di tangan satu orang.', 'A', 'Sila keempat berbunyi Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan.'),
    ('TWK', 'uud-1945', 'sedang', 'published', 'Pembukaan UUD 1945 alinea keempat memuat tujuan negara. Salah satu tujuan tersebut adalah...', 'Melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia.', 'Membentuk negara federal berdasarkan wilayah kepulauan.', 'Menghapus seluruh hubungan diplomatik luar negeri.', 'Menyerahkan kedaulatan kepada organisasi internasional.', 'Membatasi pendidikan hanya untuk aparatur negara.', 'A', 'Alinea keempat Pembukaan UUD 1945 memuat tujuan melindungi bangsa, memajukan kesejahteraan, mencerdaskan kehidupan bangsa, dan ikut melaksanakan ketertiban dunia.'),
    ('TWK', 'nkri', 'sedang', 'published', 'Prinsip Negara Kesatuan Republik Indonesia berarti...', 'Kedaulatan negara berada dalam satu pemerintahan nasional yang utuh.', 'Setiap daerah memiliki kedaulatan penuh seperti negara sendiri.', 'Pemerintah pusat tidak memiliki kewenangan atas daerah.', 'Wilayah negara dapat dipisahkan berdasarkan suku.', 'Hukum nasional tidak berlaku di daerah otonom.', 'A', 'NKRI menegaskan bentuk negara kesatuan dengan satu kedaulatan nasional, meskipun daerah memiliki otonomi.'),
    ('TWK', 'bhinneka-tunggal-ika', 'mudah', 'published', 'Makna utama semboyan Bhinneka Tunggal Ika adalah...', 'Berbeda-beda tetapi tetap satu.', 'Bersatu karena memiliki satu suku.', 'Semua perbedaan harus dihapus.', 'Kepentingan kelompok di atas bangsa.', 'Keseragaman budaya sebagai syarat negara.', 'A', 'Bhinneka Tunggal Ika berarti berbeda-beda tetapi tetap satu, yaitu persatuan dalam keberagaman.'),
    ('TWK', 'nasionalisme', 'sedang', 'published', 'Contoh sikap nasionalisme dalam kehidupan sehari-hari adalah...', 'Mengutamakan kepentingan bangsa tanpa merendahkan bangsa lain.', 'Menolak semua produk dan budaya asing tanpa alasan.', 'Mengutamakan kelompok sendiri di atas hukum.', 'Tidak peduli pada fasilitas umum.', 'Menyebarkan informasi yang memecah belah.', 'A', 'Nasionalisme yang sehat adalah cinta tanah air, taat hukum, dan menjaga kepentingan bangsa secara konstruktif.'),
    ('TIU', 'silogisme', 'sedang', 'published', 'Semua pegawai disiplin datang tepat waktu. Sebagian peserta adalah pegawai. Kesimpulan yang paling tepat adalah...', 'Semua peserta datang tepat waktu.', 'Sebagian peserta mungkin datang tepat waktu.', 'Tidak ada peserta yang datang tepat waktu.', 'Semua pegawai adalah peserta.', 'Semua peserta adalah pegawai.', 'B', 'Karena hanya sebagian peserta yang merupakan pegawai, kesimpulan paling aman adalah sebagian peserta mungkin datang tepat waktu.'),
    ('TIU', 'deret-angka', 'sedang', 'published', 'Perhatikan deret: 3, 6, 12, 24, ... Angka berikutnya adalah...', '30', '36', '42', '48', '54', 'D', 'Pola deret dikali 2, sehingga setelah 24 adalah 48.'),
    ('TIU', 'aritmetika', 'mudah', 'published', 'Jika 8 pegawai menyelesaikan pekerjaan dalam 12 hari, berapa hari yang dibutuhkan 16 pegawai dengan produktivitas sama?', '4 hari', '6 hari', '8 hari', '10 hari', '24 hari', 'B', 'Jumlah pegawai dua kali lipat, waktu menjadi setengahnya: 12 / 2 = 6 hari.'),
    ('TIU', 'analogi', 'sedang', 'published', 'Dokter berhubungan dengan rumah sakit seperti guru berhubungan dengan...', 'Kelas', 'Sekolah', 'Buku', 'Papan tulis', 'Murid', 'B', 'Dokter bekerja di rumah sakit, guru bekerja di sekolah.'),
    ('TIU', 'sinonim', 'mudah', 'published', 'Sinonim dari kata “akurat” adalah...', 'Tepat', 'Cepat', 'Lambat', 'Kabur', 'Luas', 'A', 'Akurat berarti tepat atau teliti.'),
    ('TKP', 'pelayanan-publik', 'sedang', 'published', 'Seorang warga marah karena antrean pelayanan sangat lama. Sikap terbaik Anda adalah...', 'Mendengarkan keluhan, meminta maaf, menjelaskan kondisi antrean, dan membantu mencari solusi.', 'Meminta warga menunggu tanpa penjelasan karena semua orang juga antre.', 'Menyuruh warga kembali esok hari agar situasi lebih tenang.', 'Mengabaikan warga tersebut agar tidak mengganggu pelayanan.', 'Membalas dengan nada tegas karena warga bersikap marah.', 'A', 'Pelayanan publik menuntut empati, komunikasi jelas, dan orientasi solusi meskipun pengguna layanan sedang emosi.'),
    ('TKP', 'integritas-kerja', 'sedang', 'published', 'Anda mengetahui rekan kerja memanipulasi laporan kecil agar terlihat selesai tepat waktu. Sikap terbaik adalah...', 'Mengingatkan rekan dan melaporkan sesuai prosedur bila tidak diperbaiki.', 'Membiarkan karena nilainya kecil.', 'Ikut membantu agar tim terlihat baik.', 'Menyebarkan kabar ke seluruh kantor.', 'Menghapus bukti agar tidak ada konflik.', 'A', 'Integritas menuntut kejujuran dan penyelesaian sesuai prosedur, bukan pembiaran atau penyebaran gosip.'),
    ('TKP', 'adaptasi', 'sedang', 'published', 'Kantor menerapkan aplikasi baru yang belum Anda kuasai. Respons terbaik adalah...', 'Mempelajari panduan, bertanya saat perlu, dan mencoba memakai aplikasi secara bertahap.', 'Menolak memakai aplikasi sampai ada perintah tertulis.', 'Menunggu rekan lain mengerjakan pekerjaan Anda.', 'Mengeluh karena cara lama lebih nyaman.', 'Memakai aplikasi asal-asalan agar cepat selesai.', 'A', 'Adaptasi kerja ditunjukkan dengan kemauan belajar, bertanya, dan menyesuaikan diri terhadap perubahan.'),
    ('TKP', 'jejaring-kerja', 'sedang', 'published', 'Unit Anda membutuhkan data dari unit lain untuk menyelesaikan layanan. Langkah paling tepat adalah...', 'Menghubungi unit terkait secara sopan, menjelaskan kebutuhan, dan menyepakati tenggat.', 'Menunggu data datang sendiri.', 'Menyalahkan unit lain di depan pemohon.', 'Membuat data perkiraan tanpa konfirmasi.', 'Meminta pemohon mencari data sendiri.', 'A', 'Jejaring kerja efektif membutuhkan komunikasi jelas, koordinasi, dan kesepakatan kerja.'),
    ('TKP', 'profesionalisme', 'sedang', 'published', 'Anda mendapat kritik dari atasan atas hasil kerja. Sikap paling profesional adalah...', 'Menerima masukan, memperbaiki pekerjaan, dan meminta arahan bila diperlukan.', 'Membantah semua kritik karena sudah berusaha.', 'Menghindari atasan beberapa hari.', 'Menyalahkan rekan tim.', 'Mengulang kesalahan karena kritik membuat tidak nyaman.', 'A', 'Profesionalisme terlihat dari kemampuan menerima evaluasi dan melakukan perbaikan kerja.')
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
