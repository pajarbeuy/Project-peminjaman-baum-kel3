# Progress Pengerjaan Backend

## Identitas

- Proyek: Sistem BAUM UKRI
- Area: Backend autentikasi, fakultas, dan program studi
- Teknologi: NestJS, TypeORM, MySQL, JWT, bcryptjs
- Status dokumentasi: 2 November 2026

## Ringkasan Progress

Fitur backend berikut sudah tersedia:

- Registrasi mahasiswa.
- Login seluruh role yang sudah dimodelkan.
- Refresh token dan logout.
- Hash password menggunakan bcrypt.
- JWT access token dan refresh token.
- Data fakultas untuk dropdown frontend.
- Data program studi berdasarkan fakultas.
- Data ruang lantai 6 dan 7.
- Data laboratorium.
- Data barang dan stok tersedia.
- Fondasi pengajuan peminjaman dengan validasi H-7, resource, dan stok.
- Alur draft, submit dokumen wajib, dan transisi status berbasis role.
- Upload dokumen privat untuk pengajuan.
- Validasi bahwa program studi sesuai dengan fakultas saat registrasi.
- Migration dan seeder untuk tabel pengguna, fakultas, dan program studi.

## Endpoint API

Global prefix API adalah `/api/v1`.

### Autentikasi

| Method | Endpoint | Keterangan | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Registrasi mahasiswa | Publik |
| POST | `/api/v1/auth/login` | Login semua role | Publik |
| POST | `/api/v1/auth/refresh` | Membuat pasangan token baru | Refresh token |
| POST | `/api/v1/auth/logout` | Menghapus hash refresh token | Access token |

Payload registrasi:

```json
{
  "email": "mahasiswa@example.com",
  "password": "Password123",
  "namaLengkap": "Nama Mahasiswa",
  "nim": "20210001001",
  "fakultasId": "UUID_FAKULTAS",
  "programId": "UUID_PROGRAM_STUDI"
}
```

Role pada endpoint registrasi selalu dibuat sebagai `MAHASISWA`; role tidak diterima dari request untuk mencegah privilege escalation.

### Pengguna

| Method | Endpoint | Keterangan | Auth |
|---|---|---|---|
| GET | `/api/v1/users/me` | Mengambil profil pengguna yang sedang login | Access token |

### Fakultas dan program studi

| Method | Endpoint | Keterangan | Auth |
|---|---|---|---|
| GET | `/api/v1/faculties` | Mengambil semua fakultas | Publik |
| GET | `/api/v1/faculties/{fakultasId}/programs` | Mengambil program studi berdasarkan fakultas | Publik |
| GET | `/api/v1/rooms` | Mengambil daftar ruang aktif | Publik |
| GET | `/api/v1/labs` | Mengambil daftar laboratorium aktif | Publik |
| GET | `/api/v1/items` | Mengambil daftar barang dan stok tersedia | Publik |
| GET | `/api/v1/items/availability?date=YYYY-MM-DD` | Ketersediaan barang pada tanggal tertentu | Publik |
| POST | `/api/v1/items` | Menambah barang | Role BAUM Staff |
| PATCH | `/api/v1/items/{id}` | Mengubah data barang | Role BAUM Staff |
| PATCH | `/api/v1/items/{id}/deactivate` | Menonaktifkan barang | Role BAUM Staff |
| GET | `/api/v1/items/movements` | Riwayat pergerakan stok | Role BAUM Staff |
| POST | `/api/v1/loan-requests` | Membuat pengajuan peminjaman | Access token |
| GET | `/api/v1/loan-requests/mine` | Mengambil pengajuan milik pengguna | Access token |
| POST | `/api/v1/loan-requests/{id}/submit` | Mengirim draft setelah dokumen wajib lengkap | Access token |
| POST | `/api/v1/loan-requests/{id}/documents` | Upload dokumen pendukung privat | Access token |
| POST | `/api/v1/loan-requests/{id}/verify-tu` | Verifikasi tahap TU | Role TU |
| POST | `/api/v1/loan-requests/{id}/process-baum` | Memproses pengajuan di BAUM | Role BAUM Staff |
| POST | `/api/v1/loan-requests/{id}/approve` | Persetujuan akhir | Role Kabag Umum |
| POST | `/api/v1/loan-requests/{id}/reject` | Menolak pengajuan dengan alasan | TU/BAUM/Kabag |
| POST | `/api/v1/loan-requests/{id}/handover` | Mencatat barang keluar | Role BAUM Staff |
| POST | `/api/v1/loan-requests/{id}/return` | Mencatat barang kembali | Role BAUM Staff |

Frontend menggunakan alur berikut:

1. Memanggil `/api/v1/faculties` untuk mengisi dropdown fakultas.
2. Memanggil `/api/v1/faculties/{fakultasId}/programs` setelah fakultas dipilih.
3. Mengirim `fakultasId` dan `programId` saat registrasi.

## Data Fakultas dan Program Studi

Fakultas yang tersedia:

- Fakultas Fiksi: Informatika, Sistem Informasi
- Fakultas FTI: Teknik Mesin, Teknik Industri, Teknik Elektro
- FASOS: Ilmu Komunikasi, Sastra Inggris
- FE: Manajemen
- PAPERTA: Agrotek, Agribisnis
- FTSP: Arsitektur, Teknik Lingkungan
- FMIPA: Matematika, Fisika
- Fakultas Hukum: Hukum

ID fakultas seed bersifat tetap untuk kebutuhan pengembangan lokal. ID program studi dibuat oleh database dan harus diambil melalui endpoint API, bukan di-hardcode oleh frontend.

## Struktur Database

### Tabel `users`

Kolom penting:

- `id`
- `email`
- `password` — hash bcrypt, tidak dikembalikan pada query biasa
- `namaLengkap`
- `role`
- `nim`
- `fakultasId`
- `programId`
- `hashedRefreshToken` — hash refresh token, tidak dikembalikan pada query biasa
- `isActive`
- `createdAt`
- `updatedAt`

### Tabel `faculties`

- `id`
- `nama`
- `createdAt`
- `updatedAt`

### Tabel `programs`

- `id`
- `nama`
- `fakultasId`

### Tabel `rooms`

- `id`
- `kode` — format `6.1` sampai `6.14` dan `7.1` sampai `7.14`
- `lantai`
- `nomor`
- `isActive`

Total data seed: 28 ruang.

### Tabel `labs`

- `id`
- `kode`
- `nama`
- `pengelola` — nullable dan masih `TBD` karena data pengelola resmi belum diberikan
- `isActive`

Total data seed: 10 laboratorium.

### Tabel `items`, `loan_requests`, dan `loan_request_items`

Migration pengajuan menyediakan data barang/stok, header pengajuan, serta detail barang yang diajukan. Pengajuan menyimpan status awal `DIAJUKAN`, resource ruang atau laboratorium, tanggal mulai, durasi, keperluan, unit kerja, penanggung jawab, dan kontak peminjam.

Validasi yang sudah tersedia saat membuat pengajuan:

- Minimal H-7; tepat tujuh hari diperbolehkan.
- Tepat satu resource harus dipilih: ruang atau laboratorium.
- Resource harus aktif dan tersedia pada rentang tanggal.
- Minimal satu barang dan item tidak boleh duplikat.
- Jumlah barang tidak boleh melebihi stok tersedia.
- Pengajuan tidak mengurangi stok fisik.
- Ketersediaan tanggal memperhitungkan pengajuan aktif.
- Serah-terima menambah `jumlahDipinjam` secara transaksional.
- Pengembalian mengurangi `jumlahDipinjam` secara transaksional.
- Pergerakan stok dicatat dengan item, pengajuan, aktor, jenis, jumlah, kondisi, dan waktu.

Relasi `programs.fakultasId` dan `users.programId` menggunakan foreign key. Saat registrasi, backend juga memeriksa bahwa program studi yang dikirim memang milik fakultas yang dipilih.

## Migration

Migration yang sudah tersedia:

1. `1729606800000-CreateUsersTable`
2. `1729606900000-CreateFacultiesTable`
3. `1729607000000-CreateProgramsTable`
4. `1729607100000-AddProgramToUsersTable`
5. `1729607200000-CreateRoomsTable`
6. `1729607300000-CreateLabsTable`
7. `1729607400000-CreateItemsAndLoanRequestsTables`
8. `1729607500000-CreateLoanDocumentsTable`
9. `1729607600000-AddDraftLoanRequestStatus`
10. `1729607700000-CreateStockMovementsTable`

Jalankan dari folder `backend`:

```powershell
npm run migration:run
```

## Seeder

Seeder fakultas:

```powershell
npm run seed:faculties
```

Seeder program studi:

```powershell
npm run seed:programs
```

Seeder ruang:

```powershell
npm run seed:rooms
```

Seeder laboratorium:

```powershell
npm run seed:labs
```

Seeder barang dummy:

```powershell
npm run seed:items
```

Seeder bersifat idempotent: data yang sudah ada akan dilewati dan tidak dibuat ulang.

Seeder akun staf tersedia melalui:

```powershell
npm run seed:staff
```

Password default dan placeholder fakultas pada seeder staf wajib disesuaikan sebelum digunakan pada lingkungan selain pengembangan lokal. Jangan commit secret atau password nyata.

## Verifikasi yang Sudah Dilakukan

Perintah yang berhasil dijalankan menggunakan Node.js v24:

```powershell
npm run build
npm run lint
npm run migration:run
npm run migration:show
npm run seed:programs
```

Smoke test endpoint program studi berhasil mengembalikan Informatika dan Sistem Informasi untuk Fakultas Fiksi.

Smoke test endpoint ruang dan laboratorium berhasil mengembalikan 28 ruang dan 10 laboratorium.

Smoke test module pengajuan berhasil dijalankan pada port alternatif; endpoint terproteksi menolak request tanpa token dengan HTTP `401`.

Pengujian Jest belum dinyatakan lulus. Konfigurasi test yang ada sebelumnya berhenti pada error kompatibilitas TypeScript 6 (`TS5011`) dan perlu diperbaiki sebagai pekerjaan terpisah.

## Catatan Integrasi Frontend

- Gunakan `POST`, bukan `POS`, untuk endpoint registrasi.
- Gunakan URL lengkap `http://localhost:3000/api/v1/...` pada pengembangan lokal.
- Endpoint fakultas dan program studi tidak membutuhkan JWT.
- Endpoint login/register mengembalikan access token dan refresh token; frontend tidak boleh menampilkan atau mencatat token ke log.
- Jika email sudah terdaftar, backend mengembalikan HTTP `409`.
- Jika `programId` tidak sesuai dengan `fakultasId`, backend mengembalikan HTTP `409`.
- Jika request DTO tidak valid, backend mengembalikan HTTP `400`.

## Pekerjaan Berikutnya

- Menambahkan test unit/integration khusus auth dan validasi fakultas-program studi.
- Menyelesaikan kompatibilitas konfigurasi Jest dengan TypeScript 6.
- Memastikan daftar nama fakultas dan program studi telah divalidasi stakeholder.
- Menghubungkan dropdown fakultas-program studi pada frontend.
- Menghubungkan form pengajuan dan daftar barang ke frontend.
- Menambahkan endpoint unduh dokumen privat dengan authorization pemilik/TU/BAUM.
- Menambahkan test unit/integration untuk pengajuan dan validasi stok.
- Menambahkan test unit/integration untuk pengajuan dan validasi stok.
- Meninjau kembali konfigurasi CORS, rate limiting, dan pengelolaan token untuk deployment produksi.
