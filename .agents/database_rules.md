# Database Rules

## Prinsip
- Gunakan MySQL dan TypeORM sesuai SRS.
- Periksa entity, migration, naming convention, dan pola repository yang sudah ada sebelum menambah tabel/kolom.
- Setiap perubahan skema harus melalui migration yang dapat ditinjau; hindari perubahan manual yang tidak tercatat.
- Tambahkan foreign key, unique constraint, index, dan nullability sesuai aturan domain.
- Simpan tanggal/waktu secara konsisten; tentukan timezone deployment bersama PM sebelum menetapkan konvensi final.
- Jangan memakai data pribadi nyata pada seed/test.

## Domain data yang diharapkan
- User dan role khusus: Mahasiswa, TU, BAUM Staff (dengan subfungsi staf/Kabag/Kabiro sesuai model yang disepakati).
- Fakultas dan program studi.
- Ruang, laboratorium, item/barang inventaris.
- Pengajuan dan detail objek/barang yang diajukan.
- Dokumen pengajuan dengan metadata dan storage reference privat.
- Keputusan/verifikasi TU dan keputusan akhir BAUM/Kabag Umum.
- Catatan serah-terima/pengeluaran dan pengembalian.
- Riwayat perubahan status/audit log.
- Riwayat pergerakan stok.

Daftar ini adalah domain konseptual dari SRS, bukan instruksi untuk membuat tabel duplikat jika repository sudah memiliki desain lain yang sesuai.

## Konsistensi stok
- Jangan hanya menyimpan satu angka tersedia yang bisa berubah tanpa histori.
- Modelkan jumlah total, jumlah dipinjam/keluar, dan jumlah tersedia secara konsisten sesuai desain yang disetujui.
- Operasi serah-terima/pengembalian dan catatan stok harus atomik/transaksional.
- Cegah over-allocation saat dua transaksi berjalan bersamaan.
- Jangan mengurangi stok fisik pada saat approval saja; approval membuat reservasi/ketersediaan jadwal jika memang dibutuhkan, sedangkan pergerakan stok fisik tercatat saat serah-terima/pengembalian.
- Jika perlu reservasi sebelum serah-terima, bedakan `reserved` dan `borrowed/out` dengan jelas serta minta persetujuan desain bisnis.

## Integritas dan privasi
- Hapus/anonimkan data uji setelah pekerjaan selesai sesuai SRS.
- Hindari cascade delete yang dapat menghapus histori audit tanpa persetujuan.
- Dokumen dan log harus tetap memiliki referensi yang tidak membuka akses publik.
