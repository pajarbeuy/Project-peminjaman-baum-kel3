# Git Rules

## Sebelum perubahan
- Jalankan `git status` dan periksa branch aktif.
- Jangan menghapus atau menimpa perubahan lokal pengguna.
- Jangan bekerja langsung di branch utama kecuali PM meminta secara eksplisit.
- Gunakan branch sesuai konvensi repository. Jika belum ada, usulkan `feature/<ringkasan>`, `fix/<ringkasan>`, atau `docs/<ringkasan>`.

## Commit
- Buat commit kecil dan fokus; jangan mencampur refactor tak terkait dengan fitur.
- Pesan commit harus menjelaskan perubahan, misalnya `feat: add booking document validation` atau `docs: define BAUM business rules`.
- Jangan commit `.env`, credential, token, private key, data pribadi, dokumen mahasiswa nyata, file upload, database dump sensitif, atau artefak build besar.
- Pastikan `.gitignore` melindungi secret dan file lokal; jangan menghapus ignore rule tanpa alasan.
- Jangan force-push, reset hard, rebase publik, atau menjalankan perintah destruktif tanpa persetujuan eksplisit.
- Jangan melakukan commit/push otomatis kecuali diminta user.

## Pull request / handoff
- Jelaskan tujuan, perubahan utama, risiko, dan hasil test.
- Sertakan screenshot bila perubahan UI dan bila tersedia.
- Catat migration yang diperlukan dan langkah rollback bila perubahan database berisiko.
- Hubungkan perubahan dengan requirement/issue/backlog ID bila tersedia.
