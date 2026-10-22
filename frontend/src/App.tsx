import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import './App.css'

type IconName = 'user' | 'lock' | 'eye' | 'arrow' | 'check' | 'mail' | 'building'
type FacultyOption = { id: string; nama: string }

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    building: <><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-7h6v7M8 10h.01M16 10h.01" /></>,
  }

  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function App() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [faculties, setFaculties] = useState<FacultyOption[]>([])
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false)
  const [facultyError, setFacultyError] = useState('')
  const isLogin = mode === 'login'
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

  useEffect(() => {
    if (isLogin) return

    const controller = new AbortController()
    async function loadFaculties() {
      setIsLoadingFaculties(true)
      setFacultyError('')
      try {
        // GET /faculties mengembalikan array Faculty dengan field { id, nama }.
        const response = await fetch(`${apiBaseUrl}/faculties`, { signal: controller.signal })
        if (!response.ok) throw new Error('Daftar fakultas belum dapat dimuat.')
        const data: unknown = await response.json()
        if (!Array.isArray(data) || !data.every((item) =>
          typeof item?.id === 'string' && typeof item?.nama === 'string'
        )) {
          throw new Error('Format data fakultas dari server belum sesuai.')
        }
        setFaculties(data as FacultyOption[])
        if (data.length === 0) setFacultyError('Belum ada fakultas yang tersedia.')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFacultyError(error instanceof TypeError
          ? 'Backend tidak dapat dijangkau. Jalankan server backend, lalu coba lagi.'
          : error instanceof Error ? error.message : 'Gagal memuat daftar fakultas.')
      } finally {
        if (!controller.signal.aborted) setIsLoadingFaculties(false)
      }
    }

    void loadFaculties()
    return () => controller.abort()
  }, [apiBaseUrl, isLogin])

  function changeMode(next: 'login' | 'register') {
    setMode(next)
    setNotice('')
    setShowPassword(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')
    const formData = new FormData(event.currentTarget)
    if (!isLogin && formData.get('password') !== formData.get('confirmPassword')) {
      setNotice('Konfirmasi kata sandi belum sama.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? {
          email: formData.get('email'),
          password: formData.get('password'),
        } : {
          email: formData.get('email'),
          password: formData.get('password'),
          namaLengkap: formData.get('namaLengkap'),
          nim: formData.get('nim'),
          fakultasId: formData.get('fakultasId'),
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        const message = Array.isArray(result.message) ? result.message.join(' ') : result.message
        throw new Error(message || 'Login gagal. Periksa email dan kata sandi.')
      }

      sessionStorage.setItem('baum.accessToken', result.accessToken)
      sessionStorage.setItem('baum.refreshToken', result.refreshToken)
      sessionStorage.setItem('baum.user', JSON.stringify(result.user))
      setNotice(`${isLogin ? 'Berhasil masuk' : 'Pendaftaran berhasil'}, ${result.user?.namaLengkap ?? 'pengguna'}.`)
    } catch (error) {
      setNotice(error instanceof TypeError
        ? 'Tidak dapat terhubung ke server. Pastikan backend berjalan di localhost:3000.'
        : error instanceof Error ? error.message : 'Terjadi kesalahan saat login.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="welcome-panel" aria-label="Informasi Sistem BAUM UKRI">
        <header className="brand">
          <div className="brand-mark" aria-hidden="true">U</div>
          <div><strong>UKRI</strong><span>Sarana &amp; Prasarana</span></div>
        </header>

        <div className="welcome-copy">
          <p className="eyebrow">PORTAL LAYANAN KAMPUS</p>
          <h1>Peminjaman sarana,<br />lebih tertib dan transparan.</h1>
          <p className="welcome-description">Ajukan kebutuhan ruang dan inventaris, pantau proses verifikasi, dan kelola jadwal dalam satu sistem.</p>
        </div>

        <div className="campus-art" aria-hidden="true">
          <div className="campus-shadow" />
          <div className="campus-building">
            <div className="campus-roof" />
            <div className="campus-windows"><i /><i /><i /><i /></div>
            <div className="campus-door" />
          </div>
          <div className="tracking-card"><span className="tracking-check"><Icon name="check" /></span><span><b>Alur terpantau</b><small>Dari pengajuan hingga selesai</small></span></div>
        </div>
        <div className="panel-footer"><Icon name="building" size={16} /><span>Universitas Kebangsaan Republik Indonesia</span></div>
      </section>

      <section className="form-panel">
        <div className="auth-card">
          <p className="eyebrow form-eyebrow">{isLogin ? 'SELAMAT DATANG' : 'MULAI BERSAMA KAMI'}</p>
          <h2>{isLogin ? 'Masuk ke akun Anda' : 'Buat akun Anda'}</h2>
          <p className="form-subtitle">{isLogin ? 'Gunakan akun institusi UKRI untuk melanjutkan.' : 'Daftar sebagai Mahasiswa dengan identitas institusi UKRI Anda.'}</p>

          <form onSubmit={handleSubmit}>
            {!isLogin && <label className="field-label" htmlFor="full-name">Nama lengkap<div className="input-wrap"><span className="input-icon"><Icon name="user" /></span><input id="full-name" name="namaLengkap" autoComplete="name" placeholder="Nama lengkap" required /></div></label>}

            {!isLogin && <label className="field-label" htmlFor="nim">NIM<div className="input-wrap"><span className="input-icon"><Icon name="user" /></span><input id="nim" name="nim" autoComplete="off" placeholder="Nomor Induk Mahasiswa" required /></div></label>}

            {!isLogin && <label className="field-label" htmlFor="faculty-id">Fakultas<div className="input-wrap"><span className="input-icon"><Icon name="building" /></span><select id="faculty-id" name="fakultasId" defaultValue="" required disabled={isLoadingFaculties || faculties.length === 0}><option value="" disabled>{isLoadingFaculties ? 'Memuat fakultas…' : 'Pilih fakultas'}</option>{faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.nama}</option>)}</select></div><small className={`field-hint${facultyError ? ' field-error' : ''}`} role={facultyError ? 'status' : undefined}>{facultyError || 'Pilih fakultas sesuai data akademik Anda.'}</small></label>}

            <label className="field-label" htmlFor="email">Email institusi<div className="input-wrap"><span className="input-icon"><Icon name="mail" /></span><input id="email" name="email" type="email" autoComplete="email" placeholder="nama@ukri.ac.id" required /></div></label>

            <label className="field-label" htmlFor="password">Kata sandi<div className="input-wrap"><span className="input-icon"><Icon name="lock" /></span><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder="Masukkan kata sandi" minLength={8} pattern={isLogin ? undefined : '(?=.*[A-Za-z])(?=.*\\d).+'} title="Minimal 8 karakter dan mengandung huruf serta angka." required /><button className="icon-button password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}><Icon name="eye" /></button></div></label>

            {!isLogin && <label className="field-label" htmlFor="confirm-password">Konfirmasi kata sandi<div className="input-wrap"><span className="input-icon"><Icon name="lock" /></span><input id="confirm-password" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Ulangi kata sandi" minLength={8} required /></div></label>}

            {isLogin && <div className="form-options"><label className="remember"><input type="checkbox" name="remember" /><span>Ingat saya</span></label><button className="text-button" type="button" onClick={() => setNotice('Silakan hubungi administrator untuk bantuan pemulihan kata sandi.')}>Lupa kata sandi?</button></div>}

            {notice && <p className="notice" role="status">{notice}</p>}
            <button className="submit-button" type="submit" disabled={isSubmitting}><Icon name="arrow" /><span>{isSubmitting ? 'Memeriksa akun…' : isLogin ? 'Masuk ke sistem' : 'Daftar akun'}</span></button>
          </form>

          <p className="switch-mode">{isLogin ? 'Belum memiliki akun?' : 'Sudah memiliki akun?'} <button className="text-button" type="button" onClick={() => changeMode(isLogin ? 'register' : 'login')}>{isLogin ? 'Daftar sekarang' : 'Masuk'}</button></p>
          <div className="secure-note"><Icon name="check" size={17} /><span>Koneksi aman · Akses sesuai kewenangan pengguna</span></div>
        </div>
      </section>
    </main>
  )
}

export default App
