import { useState, type FormEvent, type ReactNode } from 'react'
import './App.css'

type IconName = 'user' | 'lock' | 'eye' | 'arrow' | 'check' | 'mail' | 'building'

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
  const isLogin = mode === 'login'

  function changeMode(next: 'login' | 'register') {
    setMode(next)
    setNotice('')
    setShowPassword(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('Tampilan siap. Integrasi autentikasi menunggu kontrak API tersedia.')
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
          <p className="form-subtitle">{isLogin ? 'Gunakan akun institusi UKRI untuk melanjutkan.' : 'Daftar menggunakan identitas institusi UKRI Anda.'}</p>

          <form onSubmit={handleSubmit}>
            {!isLogin && <label className="field-label" htmlFor="full-name">Nama lengkap<div className="input-wrap"><span className="input-icon"><Icon name="user" /></span><input id="full-name" name="name" autoComplete="name" placeholder="Nama lengkap" required /></div></label>}

            <label className="field-label" htmlFor="email">Email institusi<div className="input-wrap"><span className="input-icon"><Icon name="mail" /></span><input id="email" name="email" type="email" autoComplete="email" placeholder="nama@ukri.ac.id" required /></div></label>

            <label className="field-label" htmlFor="password">Kata sandi<div className="input-wrap"><span className="input-icon"><Icon name="lock" /></span><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder="Masukkan kata sandi" minLength={8} required /><button className="icon-button password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}><Icon name="eye" /></button></div></label>

            {!isLogin && <label className="field-label" htmlFor="confirm-password">Konfirmasi kata sandi<div className="input-wrap"><span className="input-icon"><Icon name="lock" /></span><input id="confirm-password" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Ulangi kata sandi" minLength={8} required /></div></label>}

            {isLogin && <div className="form-options"><label className="remember"><input type="checkbox" name="remember" /><span>Ingat saya</span></label><button className="text-button" type="button" onClick={() => setNotice('Silakan hubungi administrator untuk bantuan pemulihan kata sandi.')}>Lupa kata sandi?</button></div>}

            {notice && <p className="notice" role="status">{notice}</p>}
            <button className="submit-button" type="submit"><Icon name="arrow" /><span>{isLogin ? 'Masuk ke sistem' : 'Daftar akun'}</span></button>
          </form>

          <p className="switch-mode">{isLogin ? 'Belum memiliki akun?' : 'Sudah memiliki akun?'} <button className="text-button" type="button" onClick={() => changeMode(isLogin ? 'register' : 'login')}>{isLogin ? 'Daftar sekarang' : 'Masuk'}</button></p>
          <div className="secure-note"><Icon name="check" size={17} /><span>Koneksi aman · Akses sesuai kewenangan pengguna</span></div>
        </div>
      </section>
    </main>
  )
}

export default App
