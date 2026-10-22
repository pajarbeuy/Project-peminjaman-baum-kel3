# Backend Rules — NestJS

Dokumen ini mengatur implementasi backend Sistem Informasi Peminjaman Sarana dan Prasarana UKRI. Terapkan bersama `project_context.md`, `business_rules.md`, `architecture.md`, `security.md`, `database_rules.md`, `api_rules.md`, dan `testing_rules.md`.

## 1. Sebelum Mengubah Kode
- Periksa struktur backend, versi Node.js/NestJS, `package.json`, konfigurasi TypeScript, lint, test, modul yang sudah ada, serta pola dependency injection.
- Ikuti pola repository yang berlaku. Jangan membuat ulang modul, helper, response envelope, exception filter, logger, atau mekanisme autentikasi yang sebenarnya sudah tersedia.
- Baca SRS dan aturan domain terkait sebelum mengimplementasikan fitur. Jika kebutuhan saling bertentangan atau belum jelas, catat pertanyaan/konfliknya; jangan menetapkan kebijakan bisnis sendiri.
- Batasi perubahan pada kebutuhan yang diminta. Jangan melakukan refactor luas atau menambahkan dependency tanpa alasan teknis yang jelas.

## 2. Struktur dan Tanggung Jawab NestJS
- Organisasikan kode berdasarkan domain/fitur, misalnya `auth`, `users`, `faculties`, `facilities`, `loan-requests`, `approvals`, `handover`, `returns`, `documents`, dan `audit` jika memang sesuai kebutuhan serta struktur repository.
- Controller menangani routing HTTP, parameter, guard/decorator, DTO, dan pemetaan hasil ke response. Controller tidak menjadi tempat aturan bisnis atau query database kompleks.
- Service/domain layer menjalankan aturan bisnis, pemeriksaan transisi status, otorisasi berbasis domain, dan orkestrasi transaksi.
- Gunakan module untuk mendeklarasikan controller, provider, dan dependency yang diperlukan. Gunakan dependency injection NestJS; hindari membuat instance service/repository secara manual.
- Pisahkan DTO request dari entity TypeORM. Jangan menerima entity database langsung sebagai body request.
- Gunakan custom provider/helper hanya jika mengurangi duplikasi yang nyata. Hindari abstraksi generik berlebihan untuk fitur yang masih sederhana.

## 3. Validasi dan Penanganan Request
- Aktifkan dan pertahankan validasi server melalui `ValidationPipe` sesuai konfigurasi proyek, idealnya `whitelist` dan `forbidNonWhitelisted` serta `transform` bila kompatibel dengan kontrak API.
- Deklarasikan aturan DTO secara eksplisit. Validasi tipe, format, panjang, rentang angka, enum, array, tanggal, dan field wajib.
- Jangan menganggap validasi frontend cukup. Semua input yang memengaruhi database, hak akses, status, jumlah, atau tanggal wajib divalidasi backend.
- Parsing tanggal dan zona waktu harus konsisten dengan kebijakan proyek. Jangan menambahkan konversi timezone diam-diam atau mengandalkan format tanggal yang ambigu.
- Jangan menerima `userId`, role, fakultas, status persetujuan, atau aktor audit dari request sebagai fakta tepercaya jika nilai itu harus berasal dari token/session atau ditentukan oleh server.

## 4. Otorisasi dan Role
- Autentikasi membuktikan identitas; authorization memutuskan tindakan yang boleh dilakukan. Terapkan keduanya di backend untuk setiap endpoint terlindungi.
- Gunakan guard/decorator/policy yang konsisten dengan pola repository. Hindari pemeriksaan role yang tersebar dan berbeda-beda di banyak controller.
- Terapkan cakupan kewenangan sesuai SRS: peminjam hanya mengakses pengajuan miliknya; TU hanya memverifikasi pengajuan dalam fakultas asalnya; petugas BAUM menjalankan tugas operasional yang ditetapkan; Kabag Umum melakukan persetujuan akhir; Kabiro Umum dan Kepegawaian menerima pemberitahuan/pengakuan sesuai SRS, bukan otomatis menjadi pemberi persetujuan akhir.
- Jangan mengandalkan tombol yang disembunyikan di frontend. Cegah akses langsung melalui API, termasuk akses lintas pengguna dan lintas fakultas.
- Untuk resource yang tidak boleh diketahui keberadaannya oleh pemanggil, ikuti kebijakan respons 404/403 yang sudah ditetapkan dalam `api_rules.md`.

## 5. Aturan Domain Peminjaman
- Jadikan `business_rules.md` dan SRS sebagai sumber aturan domain. Jangan menduplikasi aturan dengan versi berbeda di controller, service, dan frontend.
- Validasi persyaratan pengajuan, termasuk batas minimal H-7, dokumen yang diwajibkan, status mahasiswa/peminjam, jenis sarana, ketersediaan, serta kewenangan setiap tahap, berdasarkan ketentuan yang terverifikasi dalam SRS.
- Terapkan transisi status sebagai state machine eksplisit atau mekanisme setara. Tolak transisi ilegal, approval ganda, rejection tanpa alasan, dan aksi yang dilakukan oleh role yang salah.
- Setelah pengajuan diverifikasi TU, peminjam tidak boleh mengedit pengajuan tersebut jika SRS menyatakan perubahan harus diajukan ulang. Jangan mengizinkan bypass melalui endpoint update generik.
- Perubahan status harus mencatat aktor yang berasal dari identitas terautentikasi, waktu dari server, status sebelum/sesudah, dan alasan bila relevan.
- Jangan mengurangi atau menambah stok hanya karena pengajuan dibuat atau disetujui. Ikuti aturan SRS bahwa stok berubah saat serah-terima aktual dan pengembalian aktual. Jika ada langkah UAT atau dokumen lain yang bertentangan, tandai sebagai konflik untuk keputusan pemilik dokumen sebelum mengubah perilaku.
- Periksa ulang ketersediaan dan jumlah di server pada saat operasi kritis; nilai yang dikirim frontend bukan sumber kebenaran.

## 6. TypeORM dan Konsistensi Data
- Ikuti entity, migration, naming convention, dan pola repository yang sudah ada. Jangan menjalankan `synchronize: true` pada lingkungan produksi.
- Semua perubahan skema harus melalui migration yang dapat ditinjau dan diterapkan ulang secara terkendali.
- Gunakan transaksi untuk operasi multi-langkah yang harus atomik, terutama serah-terima, pengembalian, pencatatan detail kondisi, dan perubahan stok.
- Untuk stok atau ketersediaan yang rentan race condition, gunakan transaksi dan strategi penguncian/conditional update yang sesuai. Jangan hanya membaca stok lalu memperbaruinya tanpa perlindungan konkurensi.
- Pastikan invariant tetap benar: jumlah tidak negatif, item yang sama tidak diproses dua kali secara tidak sengaja, dan status pinjaman konsisten dengan catatan serah-terima/pengembalian.
- Jangan menelan error database. Propagasikan error melalui mekanisme exception NestJS yang konsisten dan rollback transaksi ketika operasi gagal.
- Hindari query N+1 dan pengambilan seluruh tabel tanpa batas. Gunakan pagination, filtering, sorting yang diizinkan, dan pemilihan kolom seperlunya untuk daftar data.

## 7. Keamanan Backend
- Simpan rahasia dan konfigurasi lingkungan melalui environment variables/config service. Jangan commit `.env`, secret JWT, kredensial database, atau token.
- Password harus di-hash menggunakan bcrypt sesuai desain proyek; jangan menyimpan atau mencatat password plaintext. Jangan mengembalikan hash password dalam response.
- Validasi signature, expiry, dan klaim token sesuai konfigurasi. Jangan mempercayai role atau identitas dari body request.
- Terapkan prinsip least privilege, validasi upload file, batas ukuran dan tipe file, nama penyimpanan yang aman, serta pemeriksaan hak akses saat unduh. Jangan mengekspos path lokal atau URL permanen yang melewati authorization.
- Hindari SQL injection dengan TypeORM parameterization/query builder yang aman. Jangan menyusun SQL dari input mentah.
- Jangan mencatat password, token, dokumen pribadi, isi KTM, atau data sensitif lain ke log. Sanitasi data log dan error.
- Terapkan CORS, rate limiting, dan hardening lain sesuai konfigurasi serta kebutuhan deployment yang disetujui; jangan menganggap CORS sebagai pengganti authorization.

## 8. Kontrak API dan Error
- Ikuti `api_rules.md` untuk format JSON, prefix, penamaan, status HTTP, response envelope, dan dokumentasi Swagger.
- Gunakan DTO response atau mapper agar field internal entity tidak bocor ke klien.
- Gunakan error yang dapat dipahami klien tanpa mengungkap stack trace, query SQL, secret, atau detail internal server.
- Jangan mengembalikan HTTP 200 untuk operasi gagal. Gunakan exception/status HTTP yang sesuai dengan konvensi proyek.
- Endpoint yang mengubah status atau stok harus idempotent sejauh masuk akal, atau secara eksplisit menolak pemrosesan ulang dengan konflik yang konsisten.
- Update Swagger decorator/schema/example ketika kontrak endpoint berubah. Dokumentasikan role/permission, payload, response, dan kemungkinan error yang relevan.

## 9. Logging dan Audit
- Gunakan logger terpusat yang sudah tersedia. Hindari `console.log` permanen dan jangan mencatat data rahasia.
- Catat peristiwa bisnis penting: pengajuan, verifikasi, persetujuan, penolakan, serah-terima, pengembalian, dan perubahan data yang relevan.
- Audit record harus membedakan aktor, waktu, jenis tindakan, referensi entitas, dan detail perubahan yang diperlukan. Jangan mengizinkan pengguna biasa memalsukan atau mengedit catatan audit.
- Jangan menambahkan sistem audit terpisah atau dependency baru jika fitur yang ada sudah mencukupi.

## 10. Pengujian Wajib
- Tambahkan unit test untuk service dan aturan domain, terutama permission, validasi tanggal/dokumen, transisi status, rejection reason, dan perhitungan stok.
- Tambahkan integration/e2e test untuk endpoint kritis: tanpa token, role salah, akses lintas pengguna/fakultas, input tidak valid, transisi ilegal, approval/rejection, serah-terima, pengembalian, dan konflik stok bersamaan jika relevan.
- Uji skenario gagal selain happy path. Jangan menghapus atau melemahkan test yang gagal hanya agar pipeline hijau.
- Gunakan database test atau konfigurasi terisolasi. Jangan menjalankan test yang berpotensi menghapus atau memodifikasi data nyata.
- Jalankan test, lint, type-check/build sesuai script yang tersedia. Laporkan perintah yang dijalankan, hasil, dan keterbatasan yang belum diverifikasi.

## 11. Perubahan dan Penyelesaian Tugas
- Implementasikan perubahan kecil yang sesuai dengan task dan pola kode saat ini.
- Jangan menambahkan dependency, mengubah kontrak API, mengganti pola autentikasi, atau melakukan migration destruktif tanpa menjelaskan alasan dan dampaknya.
- Jangan mengubah aturan bisnis atau data lama secara diam-diam. Jika SRS tidak cukup jelas, catat asumsi dan minta keputusan PM/pemilik kebutuhan sebelum mengunci perilaku.
- Setelah selesai, ringkas file yang diubah, keputusan penting, migration/config yang diperlukan, test yang dijalankan, serta risiko atau pertanyaan yang masih terbuka.
