# Security Rules

## Authentication and authorization
- Password disimpan sebagai hash bcrypt, tidak boleh disimpan plaintext atau dienkripsi reversibel.
- Gunakan JWT sesuai implementasi yang ada; jangan menaruh token/secret di source control.
- Terapkan role-based access control di backend untuk User, TU, BAUM Staff, Kabag Umum, dan Kabiro sesuai hak yang ditetapkan.
- TU hanya dapat memverifikasi pengajuan dari fakultas asal peminjam.
- User hanya boleh membaca/mengubah data miliknya sesuai status pengajuan.
- Keputusan akhir approve/reject hanya Kabag Umum.
- Kabiro menerima pemberitahuan/acknowledgement sesuai SRS; jangan memberinya approval akhir tanpa keputusan resmi.
- Jangan mengandalkan kontrol UI untuk authorization; periksa izin pada setiap endpoint/service yang sensitif.

## Berkas dan data pribadi
- Surat izin, KTM, biodata, dan dokumen pengajuan tidak boleh disimpan pada lokasi publik yang dapat diakses langsung.
- Unduh/preview dokumen harus melewati endpoint yang memeriksa identitas, role, dan cakupan fakultas.
- Terapkan allowlist MIME/type dan batas ukuran yang dikonfigurasi; verifikasi isi file bila memungkinkan.
- Gunakan nama file internal yang aman, cegah path traversal, dan jangan percaya nama file dari pengguna.
- Jangan mencatat isi dokumen, KTM, password, token, atau data pribadi sensitif ke log.
- Kumpulkan data pribadi seperlunya sesuai SRS dan kebijakan universitas.

## Web/API security
- HTTPS di lingkungan deployment.
- Validasi dan normalisasi input; gunakan parameterized query/ORM dan hindari raw SQL yang rentan injection.
- Tangani error tanpa membocorkan stack trace, query, secret, atau data internal.
- Terapkan CORS, rate limiting, secure headers, dan kebijakan cookie/token sesuai arsitektur deployment; jangan mengasumsikan konfigurasi produksi tanpa memeriksa deployment.
- Proteksi CSRF bila metode penyimpanan autentikasi dan pola browser membuatnya relevan.
- Audit log mencatat aktor, waktu, aksi, dan target tanpa menyimpan rahasia.
- Hindari IDOR/BOLA: otorisasi kepemilikan/cakupan data harus diperiksa di server.

## Testing keamanan minimum
- Unauthenticated access ditolak.
- User tidak bisa membaca pengajuan milik pengguna lain.
- TU tidak bisa memproses pengajuan fakultas lain.
- User/TU tidak bisa melakukan approval akhir.
- File pribadi tidak bisa diunduh dengan URL publik atau tanpa izin.
- Input invalid dan file yang tidak sesuai ditolak.
- Error tidak membocorkan secret/data.
