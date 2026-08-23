# Hierarki kategori layanan

- Scope: FR-HLP-03, FR-ADM-04, TDD §3.4.1, §4.3, dan §4.12. Parent kategori menjadi label pengelompokan, child menjadi satu-satunya layanan yang dapat dipilih.
- File: utility hierarki kategori, picker verifikasi Helper, edit profil Helper, dan halaman Admin kategori.
- Database: migrasi RLS agar parent nonaktif dapat dibaca untuk label katalog tanpa membuatnya selectable.
- Testing: unit test mapping parent-child, source contract test untuk tiga surface, lint, typecheck, test, dan build.
- Risiko: parent dan child dapat memiliki tingkat risiko berbeda, sehingga parent ditampilkan pada setiap tab yang memiliki child terkait.
