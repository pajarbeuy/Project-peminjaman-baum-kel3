# Frontend Rules

## UI/UX
- Gunakan React + Tailwind CSS sesuai stack SRS dan konvensi repository.
- UI berbahasa Indonesia, responsif untuk ponsel dan desktop.
- Dashboard dan navigasi disesuaikan dengan role; jangan menampilkan aksi terlarang.
- Status ditampilkan dengan teks dan indikator visual, tidak hanya warna.
- Gunakan komponen form yang memiliki label, pesan validasi, state loading, empty state, error state, dan feedback sukses.
- Form pengajuan harus menjelaskan dokumen wajib, H-7, ketersediaan ruang/lab, dan stok barang.
- Hindari form panjang yang tidak terstruktur; kelompokkan langkah jika sesuai desain.
- Tabel data perlu pencarian/filter/paginasi bila volume data memerlukannya.
- Tombol aksi destruktif atau keputusan harus jelas dan tidak ambigu.

## Aksesibilitas dan keamanan
- Gunakan semantic HTML, label input, fokus keyboard yang terlihat, kontras memadai, dan pesan error yang dapat dibaca screen reader.
- Jangan menyimpan secret di frontend.
- Jangan menganggap route guard frontend sebagai authorization; backend harus menegakkan akses.
- Jangan mengekspos URL dokumen privat.
- Jangan menampilkan data pengguna/fakultas lain di dashboard atau detail tanpa hak.

## Perilaku domain
- Tampilkan alur status sesuai state machine yang disepakati.
- Disable atau cegah tindakan yang tidak valid, tetapi backend tetap memvalidasi.
- Jangan menampilkan stok sebagai berkurang secara fisik pada approval bila belum terjadi serah-terima; jika sistem menerapkan reservasi, label reservasi harus dibedakan dari barang keluar.
