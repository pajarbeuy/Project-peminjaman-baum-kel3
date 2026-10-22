# Architecture Rules

## Prinsip
- Pertahankan pemisahan frontend, backend, dan persistence layer.
- Gunakan stack acuan SRS: React + Tailwind CSS; NestJS; TypeORM; MySQL; JWT/bcrypt; REST API; Swagger; PDF generation server-side; Docker.
- Sebelum membuat arsitektur baru, periksa struktur repo, package, module, konvensi penamaan, konfigurasi lint/test, dan pola yang sudah dipakai.
- Jangan memperkenalkan microservices, message broker, Redis, state-management besar, atau layanan cloud tambahan tanpa kebutuhan terverifikasi dan persetujuan PM.

## Backend
- Gunakan modul NestJS yang terpisah menurut domain/fitur.
- Pisahkan controller, service, DTO, entity/repository, guard/policy, dan validasi sesuai pola repo.
- Controller menangani HTTP; aturan bisnis berada di service/domain layer.
- Jangan mengembalikan entity database mentah jika mengandung field internal/sensitif.
- Gunakan transaksi database untuk operasi yang harus konsisten, terutama serah-terima/pengembalian dan perubahan stok.

## Frontend
- UI responsif untuk desktop dan ponsel.
- Dashboard berbeda berdasarkan role.
- Status harus ditampilkan dengan label Bahasa Indonesia yang jelas, bukan hanya warna.
- Form pengajuan harus menginformasikan dokumen wajib, batas H-7, tanggal, objek, dan jumlah tersedia.
- Jangan menaruh kewenangan approval pada role yang tidak memiliki izin.

## Integrasi
- REST API memakai JSON dan didokumentasikan melalui Swagger.
- Kontrak request/response dan error perlu konsisten.
- Periksa role dan kepemilikan data di backend; menyembunyikan tombol frontend bukan kontrol keamanan.
- Hindari duplikasi business rule di FE dan BE; FE boleh memberi validasi UX, BE tetap sumber validasi final.
