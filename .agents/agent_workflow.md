# Agent Workflow

## Untuk task coding
1. Ringkas tujuan dan acceptance criteria.
2. Periksa file/konvensi terkait.
3. Identifikasi risiko, requirement yang terdampak, dan kebutuhan keputusan.
4. Buat rencana perubahan.
5. Implementasikan perubahan kecil.
6. Tambahkan/perbarui tes.
7. Jalankan lint, typecheck, test, build yang tersedia.
8. Perbarui dokumentasi yang terdampak.
9. Laporkan file berubah, hasil test aktual, risiko, dan pertanyaan yang belum terjawab.

## Untuk task perencanaan
1. Inventarisasi sumber yang benar-benar tersedia.
2. Ekstrak SRS, Charter, WBS, Gantt, dan USTEK/KAK jika ada.
3. Buat peta traceability requirement → WBS → backlog → jadwal → acceptance evidence.
4. Catat konflik dan asumsi.
5. Susun Sprint Backlog 11 sprint.
6. Turunkan Jadwal Proyek dari WBS/backlog dan sinkronkan dengan Gantt.
7. Susun Project Plan berdasarkan rencana yang sama.
8. Jalankan checklist konsistensi.
9. Serahkan output yang bisa diedit dan laporan validasi.

## Stop conditions
Jangan lanjut ke implementasi yang mengubah perilaku bisnis jika:
- sumber otorisasi role bertentangan;
- aturan stok/booking belum bisa ditafsirkan dengan aman;
- ada perubahan schema destruktif;
- file yang akan diubah mengandung pekerjaan lokal pengguna yang belum disimpan;
- permintaan mengharuskan secret atau data sensitif dimasukkan ke repository.

Dalam kondisi tersebut, berikan temuan, opsi, dampak, dan minta keputusan.
