# Project Context

## Identitas
- Nama: Sistem Informasi Peminjaman Sarana dan Prasarana Universitas Kebangsaan Republik Indonesia (UKRI), disebut Sistem BAUM.
- Produk: aplikasi web terpusat dan responsif.
- Bahasa UI: Bahasa Indonesia.
- Pengguna utama: User/peminjam, TU fakultas, dan BAUM.
- Objek pinjaman: ruang kelas yang tercakup SRS (ruang 1–10 pada lantai 5, 6, 7), laboratorium, dan barang inventaris BAUM.
- Masalah yang dijawab: proses manual/tidak terpusat, ketiadaan pencatatan stok inventaris pinjaman yang memadai, penjadwalan ruang, dan kebutuhan pengajuan paperless dengan surat persetujuan PDF.

## Stack acuan SRS
- Frontend: React + Tailwind CSS.
- Backend: NestJS.
- ORM/database: TypeORM + MySQL.
- Auth: JWT; password hash menggunakan bcrypt.
- API: REST JSON, dokumentasi Swagger.
- PDF: Puppeteer atau PDFKit di server, pilih berdasarkan repository dan kebutuhan yang disepakati.
- Packaging: Docker.
- Testing yang disebut SRS: Jest dan Playwright.

Jangan mengasumsikan versi package atau arsitektur folder tertentu. Periksa repository terlebih dahulu.

## Role dan kewenangan
- User/peminjam: mengajukan pinjaman dan melihat status miliknya.
- TU: verifikasi tahap pertama hanya untuk fakultas asal peminjam.
- BAUM Staff: pemeriksaan ketersediaan, pengelolaan stok/data master, pencatatan serah-terima/pengembalian sesuai izin.
- Kabag Umum: keputusan akhir setuju/tolak.
- Kabiro Umum dan Kepegawaian: menerima pemberitahuan/acknowledgement; bukan approver akhir menurut SRS.

## Konflik dan hal yang belum final
- Arahan PM untuk perencanaan saat ini adalah tepat 11 sprint; SRS bagian batasan implementasi masih menyebut lima sprint dua mingguan/10 minggu. Catat konflik ini di artefak perencanaan, jangan diam-diam mengubah SRS.
- Durasi resmi tiap sprint dan tanggal mulai proyek belum dikonfirmasi.
- Pemetaan kewenangan detail BAUM/TU tetap perlu mengacu SOP resmi bila ada konflik.
- Kanal notifikasi email/WhatsApp belum menjadi kebutuhan final; notifikasi dalam aplikasi disebut sebagai kebutuhan.
- Format template PDF perlu validasi stakeholder.
- Target performa yang disebut SRS adalah target awal dan harus diuji/validasi.
