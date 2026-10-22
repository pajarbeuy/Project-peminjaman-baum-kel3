# Business Rules — Sistem BAUM UKRI

Dokumen ini merangkum aturan bisnis dari SRS yang tersedia. Jika SRS diperbarui, perbarui aturan ini dengan menyebut sumber dan perubahan.

## Aturan utama
- **BR-01:** Pengajuan wajib memuat surat izin kegiatan dari Bidang 3/Kemahasiswaan dan biodata peminjam.
- **BR-02:** Pengajuan mahasiswa wajib dilengkapi KTM.
- **BR-03:** Verifikasi tahap pertama hanya dilakukan TU fakultas asal peminjam.
- **BR-04:** Keputusan akhir setuju/tolak hanya oleh Kabag Umum; Kabiro Umum dan Kepegawaian mengetahui/ menerima acknowledgement keputusan.
- **BR-05:** Jumlah barang yang diajukan tidak boleh melebihi jumlah tersedia saat pengajuan dikirim.
- **BR-06:** SRS menyebut stok tersedia dihitung dari jumlah total dikurangi jumlah yang sedang dipinjam pada pengajuan yang disetujui. Baca bersama aturan FR-31 yang menyatakan perubahan stok operasional terjadi saat barang diserahkan/dikembalikan. Jangan menyederhanakan dua konsep ini menjadi satu tanpa desain data yang jelas.
- **BR-07:** Pengajuan harus masuk maksimal H-7 sebelum pelaksanaan. Jika selisih tanggal kurang dari tujuh hari, sistem menolak pengajuan.
- **BR-08:** Surat izin Bidang 3 adalah prasyarat; sistem menerima dokumen yang telah diterbitkan, bukan menerbitkan izin itu.
- **BR-09:** Serah-terima/pengeluaran dan pengembalian wajib dicatat oleh staf BAUM.
- **BR-10:** Surat persetujuan PDF dibuat otomatis setelah persetujuan sesuai alur SRS; detail template perlu validasi.

## Alur status yang harus dijaga
Alur inti yang muncul dalam SRS:
`DIAJUKAN → DIVERIFIKASI_TU → DIPROSES_BAUM → DISETUJUI → DIKELUARKAN → SELESAI`
Jalur penolakan menuju `DITOLAK`, dengan alasan wajib dicatat untuk keputusan penolakan.
Catatan: daftar status pada beberapa bagian SRS tidak sepenuhnya seragam. Sebelum mengubah state machine, cari definisi status di seluruh sumber dan catat konflik. Jangan menghapus `DIKELUARKAN` karena status ini diperlukan untuk serah-terima/pengembalian.

## Aturan stok
- Persetujuan bukan bukti barang sudah keluar.
- Catat barang keluar ketika serah-terima benar-benar dilakukan.
- Catat barang kembali ketika pengembalian benar-benar diterima dan direkam.
- Pengembalian menambah kembali stok tersedia sesuai jumlah dan kondisi yang dicatat.
- Cegah jumlah tersedia menjadi negatif, termasuk pada dua pengajuan yang diproses bersamaan.
- Riwayat pergerakan stok perlu mencatat item, jumlah, jenis pergerakan, pengajuan terkait, pelaku, dan waktu.
- Jangan menerapkan perubahan stok pada saat approval hanya karena satu skenario UAT di SRS menyebut demikian; konflik itu perlu diselesaikan sesuai aturan FR-31 dan hasil wawancara BAUM.

## Aturan pengajuan dan dokumen
- Validasi kelengkapan dokumen wajib sebelum pengajuan dikirim.
- Validasi tipe dan ukuran file sesuai konfigurasi yang disepakati; jangan membuat limit angka tanpa sumber.
- Berkas surat izin dan KTM harus disimpan dengan akses terbatas dan tidak boleh menjadi tautan publik.
- Setelah pengajuan diverifikasi TU, peminjam tidak dapat mengubah pengajuan; perubahan harus melalui pengajuan baru, sesuai isu SRS yang ditandai selesai.
- Pengajuan dapat memuat beberapa barang pada satu permintaan.
- Ketersediaan ruang/laboratorium diperiksa terhadap tanggal dan jadwal yang diminta.
- Setiap keputusan dan perubahan status harus menyimpan aktor, waktu, status lama/baru, serta alasan bila relevan.

## Konflik dan open issues
- SRS memuat istilah/status yang tidak seragam pada beberapa bagian.
- SRS menyebut batas waktu menunggu keputusan akan ditentukan universitas, tetapi nilainya belum tersedia.
- Kanal notifikasi tambahan di luar notifikasi aplikasi belum diputuskan.
- Template surat PDF belum final.
