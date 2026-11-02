# Menjalankan Sistem BAUM UKRI

Panduan ini untuk menjalankan frontend dan backend dalam mode pengembangan lokal. Perintah di bawah tidak mengubah kode aplikasi.

## Prasyarat

- Node.js dan npm sudah terpasang.
- MySQL aktif dan database yang disebutkan oleh `backend/.env` sudah tersedia.
- Dependencies sudah dipasang (`npm ci`) pada folder frontend dan backend.
- File `backend/.env` sudah tersedia dan berisi konfigurasi database serta secret JWT untuk lingkungan lokal. Jangan membagikan atau mengunggah file ini.

## Siapkan backend

Jika `backend/.env` belum ada, salin `backend/.env.example` menjadi `backend/.env`, lalu isi konfigurasi lokal yang benar. Jangan menimpa `.env` yang sudah berisi konfigurasi Anda.

Contoh di PowerShell dari folder repository:

```powershell
Copy-Item backend/.env.example backend/.env
```

Sesuaikan nilai `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, dan `DB_DATABASE` agar cocok dengan MySQL lokal. Pastikan database `DB_DATABASE` sudah dibuat.

Backend tidak membuat atau menjalankan migrasi secara otomatis (`synchronize` dan `migrationsRun` nonaktif). Untuk database kosong atau yang belum diperbarui, jalankan migrasi secara eksplisit dari folder `backend`:

```powershell
cd backend
npm run migration:run
```

Jalankan migrasi hanya terhadap database lokal yang sesuai.

## Jalankan kedua server

Buka dua terminal di folder repository.

Terminal 1 — backend:

```powershell
cd backend
npm ci
npm run start:dev
```

Backend berjalan di `http://localhost:3000`. Prefix API adalah `http://localhost:3000/api/v1`, dan dokumentasi Swagger tersedia di `http://localhost:3000/api/docs` selama `NODE_ENV` bukan `production`.

Terminal 2 — frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Buka URL yang ditampilkan Vite di terminal; secara default biasanya `http://localhost:5173`. Frontend memakai API `http://localhost:3000/api/v1` secara default. Bila port frontend berubah, sesuaikan `FRONTEND_URL` pada `backend/.env` agar cocok dengan origin frontend.

Untuk menghentikan server, tekan `Ctrl+C` di terminal masing-masing.

## Jika terjadi kendala

- **Backend gagal terhubung ke MySQL:** pastikan layanan MySQL aktif, database sudah dibuat, dan nilai `DB_*` di `backend/.env` benar.
- **Tabel tidak ditemukan:** jalankan `npm run migration:run` dari folder `backend` setelah memeriksa konfigurasi database yang sedang digunakan.
- **Frontend tidak dapat menghubungi API:** pastikan backend berjalan di port 3000 dan frontend dibuka dari origin yang diizinkan oleh `FRONTEND_URL`.
- **Port sudah digunakan:** hentikan proses lain yang menggunakan port tersebut atau atur port sesuai konfigurasi aplikasi yang tersedia.

## Catatan keamanan

Gunakan hanya kredensial dan secret lokal. Jangan menyalin isi `.env` ke dokumentasi, chat, atau repository. Jangan gunakan server pengembangan ini sebagai deployment produksi.
