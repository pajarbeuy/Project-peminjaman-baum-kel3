# Project Management Rules — Artefak Perencanaan

File ini relevan ketika agent diminta menyusun Sprint Backlog, Jadwal Proyek, Gantt Chart, WBS, atau Project Plan.

## Artefak
- Project Charter: tujuan, scope tingkat tinggi, stakeholder, batasan, dan otorisasi.
- WBS: dekomposisi scope menjadi work package/aktivitas.
- Sprint Backlog: item yang dipilih untuk sprint, sprint goal, estimasi, PIC role, dependency, acceptance criteria.
- Jadwal Proyek: aktivitas, durasi, predecessor, tanggal/relatif, PIC, milestone, status.
- Gantt Chart: visualisasi jadwal, bukan sumber tanggal yang berbeda dari jadwal.
- Project Plan: bagaimana proyek dikelola, dimonitor, dikendalikan, diuji, dikomunikasikan, dan risiko/perubahan ditangani.

## Aturan konsistensi
- Arahan PM untuk tugas perencanaan ini: tepat 11 sprint.
- SRS yang tersedia menyebut lima sprint dua mingguan/10 minggu. Catat sebagai konflik dokumentasi. Jangan ubah SRS tanpa persetujuan.
- Jangan membuat tanggal kalender tanpa tanggal mulai yang dikonfirmasi.
- Jangan mengasumsikan durasi sprint jika belum disepakati. Gunakan timeline relatif atau TBD.
- Setiap backlog item perlu ditelusuri ke SRS ID dan/atau WBS ID jika sumber menyediakan ID.
- Setiap aktivitas jadwal harus memiliki output, pemilik peran, durasi atau TBD, dan dependensi yang logis.
- Hindari backlog task yang kabur seperti “buat backend”; pecah menjadi hasil yang dapat diverifikasi.
- Jangan mengisi nama PIC individual, anggaran, kapasitas, atau hari libur tanpa sumber.
- QA/testing, UAT, dokumentasi, deployment, dan handover perlu direncanakan bila termasuk scope.

## File Excel
- Gunakan sheet ringkasan, detail, milestone/dependency, dan open issues bila relevan.
- Gunakan ID unik dan stabil.
- Gunakan validasi data untuk sprint, status, dan prioritas bila praktis.
- Gunakan satuan estimasi yang konsisten.
- Gantt dan tabel jadwal harus memiliki sumber tanggal/durasi yang sama.

## Project Plan
- Jangan hanya menyalin Charter atau WBS.
- Minimal bahas metodologi, peran, jadwal, sumber daya, kualitas/testing, komunikasi, risiko, perubahan, monitoring, kriteria selesai, asumsi, dan open issues.
- Semua keputusan yang belum dikonfirmasi harus tetap ditandai `TBD`/`Perlu validasi`.
