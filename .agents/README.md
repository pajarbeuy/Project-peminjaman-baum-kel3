# BAUM AI Agent Rules Pack

Paket ini berisi aturan proyek untuk membantu AI coding agent/vibe coding bekerja konsisten pada Sistem Informasi Peminjaman Sarana dan Prasarana UKRI serta artefak perencanaan proyeknya.

## Cara memasang
1. Salin folder `.agents/` ke root repository proyek.
2. Salin file `AGENTS.md` dari paket ini ke root repository juga.
3. Letakkan SRS, Project Charter, WBS, Gantt Chart, dan dokumen resmi lain di lokasi proyek yang disepakati. Jangan menyalin dokumen sensitif ke repository publik tanpa izin.
4. Minta agent membaca `AGENTS.md` terlebih dahulu, lalu file aturan yang relevan.
5. Minta agent membaca aturan umum dan file khusus yang relevan, termasuk `backend_rules.md` untuk perubahan backend NestJS.
6. Review semua perubahan agent sebelum commit.

## Catatan kompatibilitas
Tidak semua agent otomatis membaca `.agents/`. `AGENTS.md` di root repository disertakan sebagai entry point. Jika tool yang digunakan punya mekanisme aturan khusus (mis. custom instructions atau file rules), konfigurasi entry point tersebut sesuai dokumentasi tool.

## Sumber kebenaran
- SRS UKRI revisi 1.1 adalah sumber kebutuhan sistem.
- Sumber bertanda `[W]` (wawancara BAUM) mengungguli sumber `[U]`/`[A]` yang bertentangan, sesuai konvensi SRS.
- Keputusan PM untuk deliverable perencanaan saat ini: rencanakan tepat 11 sprint. SRS masih memuat batasan lama lima sprint/10 minggu. Jangan edit SRS diam-diam; tandai konflik dan minta keputusan pemilik dokumen.
- Jangan mengarang tanggal proyek, durasi sprint, anggaran, nama anggota, kapasitas, atau keputusan stakeholder yang belum disediakan.
