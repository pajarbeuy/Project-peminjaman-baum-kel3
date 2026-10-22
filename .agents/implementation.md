# Implementation Rules

## Sebelum coding
1. Periksa repository, branch, status Git, README, package scripts, dan file agent rules.
2. Baca SRS dan file aturan relevan.
3. Identifikasi kebutuhan/issue yang sedang dikerjakan dan acceptance criteria.
4. Nyatakan rencana perubahan singkat sebelum mengubah banyak file.
5. Jika perubahan menyentuh aturan bisnis ambigu, berhenti pada analisis dan minta keputusan; jangan menebak.

## Saat coding
- Buat perubahan sekecil mungkin untuk memenuhi acceptance criteria.
- Ikuti gaya dan pola yang sudah ada.
- Hindari refactor besar yang tidak diminta.
- Jangan menambah dependency tanpa menjelaskan alasan, alternatif, dampak keamanan, dan ukuran perubahan.
- Validasi data di backend walaupun frontend juga melakukan validasi.
- Gunakan DTO/validation sesuai pola NestJS yang sudah terpasang.
- Jangan menaruh secret, token, password, credential, atau data pribadi nyata di kode, log, test fixture, atau commit.
- Jangan menonaktifkan lint, test, auth guard, atau security check untuk membuat build tampak berhasil.
- Jangan melakukan destructive migration atau menghapus data tanpa backup, rencana migrasi, dan persetujuan eksplisit.
- Untuk file upload, validasi jenis, ukuran, nama, akses, dan penyimpanan; jangan percaya ekstensi file saja.
- Untuk stok dan keputusan, gunakan transaksi/locking atau strategi konsistensi yang sesuai dengan desain database.

## Saat menyelesaikan task
- Jalankan lint/typecheck/test/build yang tersedia dan relevan.
- Perbaiki kegagalan yang disebabkan perubahan sendiri.
- Tulis ringkasan file yang diubah, alasan, hasil pemeriksaan, dan isu tersisa.
- Jangan mengklaim perintah sukses jika belum dijalankan.
- Jika tidak bisa menjalankan test, jelaskan penyebabnya dan test yang masih harus dilakukan.
