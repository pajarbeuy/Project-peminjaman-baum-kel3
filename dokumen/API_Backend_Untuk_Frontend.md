# Dokumentasi API Backend untuk Frontend

## Konfigurasi

Base URL lokal:

```text
http://localhost:3000/api/v1
```

Swagger:

```text
http://localhost:3000/api/docs
```

Endpoint yang diberi label `Publik` tidak membutuhkan token. Endpoint lain menggunakan header:

```http
Authorization: Bearer ACCESS_TOKEN
```

Response API dikembalikan sebagai JSON langsung, bukan envelope `{ "data": ... }`.

## Autentikasi

### Register

```http
POST /auth/register
Content-Type: application/json
```

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

Role registrasi otomatis `MAHASISWA`.

### Login

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "mahasiswa@example.com",
  "password": "Password123"
}
```

Response login/register memiliki bentuk:

```json
{
  "accessToken": "JWT_ACCESS_TOKEN",
  "refreshToken": "JWT_REFRESH_TOKEN",
  "user": {
    "id": "UUID_USER",
    "namaLengkap": "Nama Mahasiswa",
    "email": "mahasiswa@example.com",
    "role": "MAHASISWA",
    "nim": "20210001001",
    "fakultasId": "UUID_FAKULTAS",
    "programId": "UUID_PROGRAM_STUDI",
    "isActive": true,
    "createdAt": "2026-11-03T10:00:00.000Z"
  }
}
```

Endpoint lain:

```http
POST /auth/refresh
POST /auth/logout
GET /users/me
```

`/auth/refresh` menggunakan refresh token sebagai Bearer token. `/auth/logout` dan `/users/me` menggunakan access token.

## Master data

### Fakultas

```http
GET /faculties
```

Response:

```json
[
  {
    "id": "UUID_FAKULTAS",
    "nama": "Fakultas Fiksi"
  }
]
```

### Program studi berdasarkan fakultas

```http
GET /faculties/{fakultasId}/programs
```

Response:

```json
[
  {
    "id": "UUID_PROGRAM_STUDI",
    "nama": "Informatika",
    "fakultasId": "UUID_FAKULTAS"
  }
]
```

### Ruang dan laboratorium

```http
GET /rooms
GET /labs
```

Ruang memiliki `kode`, `lantai`, `nomor`, dan `isActive`. Kode ruang seed menggunakan format `6.1` sampai `6.14` dan `7.1` sampai `7.14`.

Laboratorium memiliki `kode`, `nama`, `pengelola`, dan `isActive`.

## Barang dan stok

### Daftar stok

```http
GET /items
GET /items/{id}
GET /items/availability?date=YYYY-MM-DD
```

Contoh response daftar stok:

```json
[
  {
    "id": "UUID_ITEM",
    "kode": "BRG-PRO-001",
    "nama": "Proyektor",
    "kategori": "Elektronik",
    "totalStok": 8,
    "jumlahDipinjam": 2,
    "isActive": true,
    "stokTersedia": 6
  }
]
```

Response availability tanggal menambahkan:

```json
{
  "jumlahTerpakai": 1,
  "stokTersedia": 5
}
```

### Pengelolaan barang oleh BAUM Staff

```http
POST /items
PATCH /items/{id}
PATCH /items/{id}/deactivate
GET /items/movements
```

Contoh body tambah barang:

```json
{
  "kode": "BRG-MIC-002",
  "nama": "Mikrofon Wireless",
  "kategori": "Elektronik",
  "totalStok": 5
}
```

Hanya role `BAUM_STAFF` yang boleh mengelola barang dan melihat riwayat pergerakan stok.

## Pengajuan peminjaman

### Membuat draft pengajuan

```http
POST /loan-requests
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json
```

```json
{
  "tanggalMulai": "2026-12-01",
  "durasiHari": 2,
  "keperluan": "Kegiatan akademik",
  "unitKerja": "Fakultas Fiksi",
  "penanggungJawab": "Budi Santoso",
  "kontakPeminjam": "081234567890",
  "roomId": "UUID_RUANG",
  "items": [
    {
      "itemId": "UUID_ITEM",
      "jumlah": 1
    }
  ]
}
```

Pilih tepat satu resource: `roomId` atau `labId`.

Response dibuat dengan status `DRAFT`. Pada tahap ini stok fisik belum berkurang.

### Melihat pengajuan milik sendiri

```http
GET /loan-requests/mine
Authorization: Bearer ACCESS_TOKEN
```

### Upload dokumen

```http
POST /loan-requests/{loanRequestId}/documents
Authorization: Bearer ACCESS_TOKEN
Content-Type: multipart/form-data
```

Form-data:

```text
file: file PDF/JPG/PNG
jenis: SURAT_BIDANG_3 | KTM | BIODATA_ORMAWA
```

Dokumen disimpan privat. KTM wajib untuk mahasiswa. Batas ukuran memakai environment `UPLOAD_MAX_BYTES`, default sementara 10 MB.

### Submit draft

```http
POST /loan-requests/{loanRequestId}/submit
Authorization: Bearer ACCESS_TOKEN
```

Submit hanya berhasil jika dokumen berikut lengkap:

- `SURAT_BIDANG_3`
- `BIODATA_ORMAWA`
- `KTM` untuk role mahasiswa

Jika berhasil, status berubah menjadi `DIAJUKAN`.

## Transisi pengajuan berdasarkan role

| Endpoint | Role | Transisi |
|---|---|---|
| `POST /loan-requests/{id}/verify-tu` | `TU` | `DIAJUKAN → DIVERIFIKASI_TU` |
| `POST /loan-requests/{id}/process-baum` | `BAUM_STAFF` | `DIVERIFIKASI_TU → DIPROSES_BAUM` |
| `POST /loan-requests/{id}/approve` | `KABAG_UMUM` | `DIPROSES_BAUM → DISETUJUI` |
| `POST /loan-requests/{id}/reject` | `TU`, `BAUM_STAFF`, `KABAG_UMUM` | status aktif → `DITOLAK` |

Body penolakan:

```json
{
  "alasan": "Dokumen belum sesuai."
}
```

## Serah-terima dan pengembalian

```http
POST /loan-requests/{id}/handover
Authorization: Bearer ACCESS_TOKEN
```

Hanya `BAUM_STAFF`; status harus `DISETUJUI`. Status berubah menjadi `DIKELUARKAN` dan jumlah dipinjam bertambah secara transaksional.

```http
POST /loan-requests/{id}/return
Authorization: Bearer ACCESS_TOKEN
```

Hanya `BAUM_STAFF`; status harus `DIKELUARKAN`. Status berubah menjadi `SELESAI` dan jumlah dipinjam berkurang.

## HTTP error yang perlu ditangani frontend

| Status | Arti umum |
|---|---|
| 400 | Body tidak valid, H-7 gagal, dokumen belum lengkap, atau format file tidak didukung |
| 401 | Token tidak ada/tidak valid |
| 403 | Role tidak memiliki izin |
| 404 | Data atau pengajuan tidak ditemukan |
| 409 | Email/kode duplikat, stok tidak cukup, jadwal bentrok, atau transisi status tidak valid |

Frontend sebaiknya menampilkan `message` dari response sebagai pesan error kepada pengguna.

## Catatan integrasi

- Setelah membuat draft, simpan `loanRequestId` dari response.
- Upload dokumen menggunakan `loanRequestId` tersebut.
- Panggil endpoint `submit` setelah semua dokumen wajib selesai.
- Jangan mengirim `programId` yang merupakan ID fakultas; ambil ID program dari endpoint programs.
- Jangan mengasumsikan response memiliki properti `data`; response list adalah array langsung.
- Token tidak boleh dicatat ke console atau dikirim ke pihak lain.
