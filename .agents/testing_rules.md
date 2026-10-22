# Testing Rules

## Prinsip
- Gunakan Jest dan Playwright sesuai SRS jika telah dikonfigurasi di repository.
- Periksa test scripts dan pola yang ada sebelum menambah framework lain.
- Setiap perubahan perilaku harus memiliki tes yang relevan.
- Jangan mengubah ekspektasi tes hanya untuk membuat implementasi lolos jika ekspektasi berasal dari requirement yang valid.
- Pisahkan unit test, integration/API test, dan end-to-end/UI test sesuai kebutuhan repository.

## Skenario minimum domain
1. Login berhasil/gagal dan role yang benar.
2. User tidak bisa mengakses pengajuan milik user lain.
3. TU hanya dapat memproses pengajuan fakultas asalnya.
4. Pengajuan ditolak jika surat Bidang 3 atau dokumen wajib tidak lengkap.
5. Pengajuan mahasiswa ditolak jika KTM wajib tidak ada.
6. H-7: tepat tujuh hari atau lebih diterima dari sisi batas waktu; kurang dari tujuh hari ditolak.
7. Jumlah barang yang diminta melebihi ketersediaan ditolak.
8. Pengajuan dapat memuat lebih dari satu item.
9. TU dapat memverifikasi hanya sesuai cakupan.
10. Rejection tanpa alasan ditolak.
11. Approval akhir hanya dapat dilakukan Kabag Umum.
12. Kabiro menerima acknowledgement/notifikasi, bukan approval akhir.
13. PDF hanya tersedia setelah persetujuan dan hanya bagi pihak berwenang.
14. Approval tidak mencatat barang fisik sebagai keluar.
15. Serah-terima mencatat pergerakan barang keluar.
16. Pengembalian mencatat barang kembali dan memperbarui stok.
17. Perubahan status tercatat dengan status lama/baru, aktor, dan waktu.
18. File pribadi tidak dapat diakses publik.
19. Status ilegal dan operasi stok bersamaan tidak merusak konsistensi.
20. Dashboard menampilkan data sesuai role dan cakupan akses.

## Definition of Done untuk perubahan kode
- Tes yang relevan lulus.
- Lint/typecheck/build yang tersedia lulus atau kegagalannya dijelaskan.
- Tidak ada secret/PII di source, log, atau fixture.
- Dokumentasi/API/diagram diperbarui bila terdampak.
- Ringkasan hasil tes jujur dan menyebut batasan yang belum diuji.
