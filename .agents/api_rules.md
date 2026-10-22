# REST API Rules

- REST API menggunakan JSON, berada di backend NestJS, dan didokumentasikan di Swagger.
- Ikuti prefix, naming, response envelope, error format, dan versi API yang sudah ada di repository; jangan membuat konvensi kedua.
- Gunakan DTO untuk request dan response yang jelas; validasi input di server.
- Status HTTP harus sesuai makna: 400 untuk request invalid, 401 untuk belum terautentikasi, 403 untuk tidak berwenang, 404 untuk resource yang tidak ditemukan/terlihat, 409 untuk konflik state/stock jika sesuai pola API, dan 5xx untuk kegagalan server.
- Endpoint sensitif wajib memeriksa autentikasi, role, ownership, dan cakupan fakultas.
- Approval/rejection harus memvalidasi status saat ini agar transisi ilegal ditolak.
- Rejection memerlukan alasan.
- Pengajuan yang sudah diverifikasi TU tidak boleh diedit oleh peminjam; perubahan harus melalui pengajuan baru sesuai SRS.
- File upload/download wajib melewati authorization dan tidak memakai URL publik permanen.
- Catat perubahan status dengan aktor dan waktu.
- Hindari mengembalikan field password hash, token internal, metadata file sensitif, atau informasi pribadi yang tidak diperlukan.
- Update Swagger saat kontrak endpoint berubah dan tambahkan pengujian untuk alur berhasil serta penolakan akses.
