import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { apiRequest } from './services/api'
import './SprintTwo.css'

type User = { namaLengkap: string; role: string }
type Faculty = { id: string; nama: string }
type Program = { id: string; nama: string; fakultasId: string }
type RoomStatus = 'Tersedia' | 'Tidak Tersedia' | 'Sedang Digunakan'
type Room = { id: string; kode: string; lantai: number; nomor: number; isActive?: boolean; status?: string }
type Lab = { id: string; kode: string; nama: string; pengelola: string | null }
type Item = { id: string; kode: string; nama: string; kategori: string; totalStok: number; jumlahDipinjam: number; stokTersedia: number; isActive?: boolean }
type Loan = { id: string; status: string }
type Page = 'master' | 'availability' | 'booking'
type ResourceState<T> = { data: T[]; loading: boolean; error: string }
type DocumentKind = 'SURAT_BIDANG_3' | 'KTM' | 'BIODATA_ORMAWA'

function resolveRoomStatus(room: Room): RoomStatus {
  if (room.status === 'Sedang Digunakan' || room.status === 'SEDANG_DIGUNAKAN') {
    return 'Sedang Digunakan'
  }
  if (room.status === 'Tidak Tersedia' || room.status === 'TIDAK_TERSEDIA' || room.isActive === false) {
    return 'Tidak Tersedia'
  }
  return 'Tersedia'
}

const emptyState = <T,>(): ResourceState<T> => ({ data: [], loading: false, error: '' })
const documentLabels: Record<DocumentKind, string> = {
  SURAT_BIDANG_3: 'Surat izin Bidang 3',
  KTM: 'Kartu Tanda Mahasiswa (KTM)',
  BIODATA_ORMAWA: 'Biodata Ormawa',
}
const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png']
const maxUploadBytes = Number(import.meta.env.VITE_UPLOAD_MAX_BYTES ?? 10 * 1024 * 1024)

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.'
}

function useResource<T>(path: string, refreshKey = 0) {
  const [state, setState] = useState<ResourceState<T>>(emptyState<T>)
  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return undefined
      setState((current) => ({ ...current, loading: true, error: '' }))
      return apiRequest<T[]>(path, { signal: controller.signal })
    }).then((data) => {
      if (!data) return
      setState({ data, loading: false, error: '' })
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      setState({ data: [], loading: false, error: errorMessage(error) })
    })
    return () => controller.abort()
  }, [path, refreshKey])
  return state
}

function StateMessage({ state, retry }: { state: ResourceState<unknown>; retry: () => void }) {
  if (state.loading) return <div className="st-empty" role="status">Memuat data…</div>
  if (state.error) return <div className="st-alert" role="alert"><span>{state.error}</span><button type="button" className="st-button st-button-secondary" onClick={retry}>Coba lagi</button></div>
  if (state.data.length === 0) return <div className="st-empty">Belum ada data untuk ditampilkan.</div>
  return null
}

function MasterData() {
  const [category, setCategory] = useState('Fakultas')
  const [refreshKey, setRefreshKey] = useState(0)
  const [query, setQuery] = useState('')
  const faculties = useResource<Faculty>('/faculties', refreshKey)
  const rooms = useResource<Room>('/rooms', refreshKey)
  const labs = useResource<Lab>('/labs', refreshKey)
  const items = useResource<Item>('/items', refreshKey)
  const [facultyId, setFacultyId] = useState('')
  const programs = useResource<Program>(facultyId ? `/faculties/${encodeURIComponent(facultyId)}/programs` : '/faculties', refreshKey)
  const [itemForm, setItemForm] = useState<Item | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState('')
  const isBaum = sessionStorage.getItem('baum.user')?.includes('BAUM_STAFF') ?? false
  const categories = ['Fakultas', 'Program studi', 'Ruang kelas', 'Laboratorium', 'Barang dan stok']
  const selectedState = category === 'Fakultas' ? faculties : category === 'Program studi' ? programs : category === 'Ruang kelas' ? rooms : category === 'Laboratorium' ? labs : items
  const selectedData = useMemo(() => selectedState.data.filter((entry) => JSON.stringify(entry).toLocaleLowerCase().includes(query.toLocaleLowerCase())), [selectedState.data, query])
  const retry = () => setRefreshKey((key) => key + 1)

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!itemForm) return
    setSaving(true); setActionError('')
    const body = { kode: itemForm.kode, nama: itemForm.nama, kategori: itemForm.kategori, totalStok: Number(itemForm.totalStok) }
    try {
      await apiRequest(itemForm.id ? `/items/${itemForm.id}` : '/items', { method: itemForm.id ? 'PATCH' : 'POST', body: JSON.stringify(body) })
      setItemForm(null); retry()
    } catch (error) { setActionError(errorMessage(error)) } finally { setSaving(false) }
  }

  async function deactivateItem(item: Item) {
    if (!window.confirm(`Nonaktifkan barang “${item.nama}”?`)) return
    setActionError('')
    try { await apiRequest(`/items/${item.id}/deactivate`, { method: 'PATCH' }); retry() }
    catch (error) { setActionError(errorMessage(error)) }
  }

  return <section className="st-page">
    <div className="st-heading"><div><p className="st-kicker">DATA MASTER</p><h1>Data sarana &amp; prasarana</h1><p>Data ditampilkan dari layanan backend yang tersedia.</p></div></div>
    <div className="st-tabs" role="tablist" aria-label="Kategori data master">{categories.map((name) => <button key={name} role="tab" aria-selected={category === name} className={category === name ? 'is-active' : ''} onClick={() => { setCategory(name); setQuery('') }}>{name}</button>)}</div>
    <div className="st-toolbar"><label className="st-search">Cari data<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ketik kata kunci…" /></label>{category === 'Program studi' && <label className="st-search">Fakultas<select value={facultyId} onChange={(event) => setFacultyId(event.target.value)}><option value="">Pilih fakultas</option>{faculties.data.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.nama}</option>)}</select></label>}{category === 'Barang dan stok' && isBaum && <button className="st-button" onClick={() => setItemForm({ id: '', kode: '', nama: '', kategori: '', totalStok: 0, jumlahDipinjam: 0, stokTersedia: 0 })}>Tambah barang</button>}</div>
    {actionError && <div className="st-alert" role="alert">{actionError}</div>}
    {category === 'Program studi' && !facultyId ? <div className="st-empty">Pilih fakultas untuk memuat program studi.</div> : <>
      <StateMessage state={{ ...selectedState, data: selectedData }} retry={retry} />
      {selectedData.length > 0 && <div className="st-table-wrap"><table className="st-table"><thead><tr>{category === 'Fakultas' ? <><th>Nama fakultas</th><th>ID</th></> : category === 'Program studi' ? <><th>Program studi</th><th>Fakultas</th></> : category === 'Ruang kelas' ? <><th>Kode ruang</th><th>Lantai</th><th>Nomor</th></> : category === 'Laboratorium' ? <><th>Laboratorium</th><th>Kode</th><th>Pengelola</th></> : <><th>Barang</th><th>Kode</th><th>Kategori</th><th>Stok tersedia</th>{isBaum && <th>Aksi</th>}</>}</tr></thead><tbody>{selectedData.map((raw) => {
        const row = raw as Faculty & Program & Room & Lab & Item
        return <tr key={row.id}>{category === 'Fakultas' ? <><td>{row.nama}</td><td className="st-muted">{row.id}</td></> : category === 'Program studi' ? <><td>{row.nama}</td><td>{faculties.data.find((faculty) => faculty.id === row.fakultasId)?.nama ?? '—'}</td></> : category === 'Ruang kelas' ? <><td>{row.kode}</td><td>{row.lantai}</td><td>{row.nomor}</td></> : category === 'Laboratorium' ? <><td>{row.nama}</td><td>{row.kode}</td><td>{row.pengelola ?? '—'}</td></> : <><td>{row.nama}</td><td>{row.kode}</td><td>{row.kategori}</td><td>{row.stokTersedia} / {row.totalStok}</td>{isBaum && <td><div className="st-row-actions"><button className="st-button st-button-secondary" onClick={() => setItemForm(row)}>Edit</button><button className="st-button st-button-danger" onClick={() => void deactivateItem(row)}>Nonaktifkan</button></div></td>}</>}</tr>
      })}</tbody></table></div>}
    </>}
    {category !== 'Barang dan stok' && <p className="st-note">Endpoint pengelolaan untuk data ini belum tersedia; halaman ini hanya menampilkan data.</p>}
    {itemForm && <div className="st-modal-backdrop" role="presentation"><section className="st-modal" role="dialog" aria-modal="true" aria-labelledby="item-form-title"><button className="st-modal-close" onClick={() => setItemForm(null)} aria-label="Tutup">×</button><h2 id="item-form-title">{itemForm.id ? 'Edit barang' : 'Tambah barang'}</h2><form className="st-form" onSubmit={(event) => void saveItem(event)}><label>Kode barang<input required value={itemForm.kode} onChange={(event) => setItemForm({ ...itemForm, kode: event.target.value })} /></label><label>Nama barang<input required value={itemForm.nama} onChange={(event) => setItemForm({ ...itemForm, nama: event.target.value })} /></label><label>Kategori<input required value={itemForm.kategori} onChange={(event) => setItemForm({ ...itemForm, kategori: event.target.value })} /></label><label>Total stok<input type="number" min="0" step="1" required value={itemForm.totalStok} onChange={(event) => setItemForm({ ...itemForm, totalStok: Number(event.target.value) })} /></label>{actionError && <p className="st-form-error" role="alert">{actionError}</p>}<div className="st-row-actions"><button type="button" className="st-button st-button-secondary" onClick={() => setItemForm(null)}>Batal</button><button className="st-button" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</button></div></form></section></div>}
  </section>
}

function Availability({ onProceedToBooking }: { onProceedToBooking?: (roomId: string) => void }) {
  const [date, setDate] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedFloor, setSelectedFloor] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectionNotice, setSelectionNotice] = useState<{ message: string; isError: boolean } | null>(null)

  const rooms = useResource<Room>(date ? `/rooms?date=${encodeURIComponent(date)}` : '/rooms', refreshKey)
  const labs = useResource<Lab>('/labs', refreshKey)
  const items = useResource<Item>(date ? `/items/availability?date=${encodeURIComponent(date)}` : '/items', refreshKey)

  // Buat daftar lantai gedung secara dinamis berdasarkan data ruang di sistem
  const floors = useMemo(() => {
    const existingFloors = rooms.data.map((r) => Number(r.lantai)).filter((n) => Number.isInteger(n) && n > 0)
    const maxFloor = existingFloors.length > 0 ? Math.max(7, ...existingFloors) : 7
    const floorSet = new Set<number>()
    for (let f = 1; f <= maxFloor; f += 1) {
      floorSet.add(f)
    }
    for (const f of existingFloors) {
      floorSet.add(f)
    }
    return Array.from(floorSet).sort((a, b) => a - b)
  }, [rooms.data])

  function handleFloorChange(newFloor: string) {
    setSelectedFloor(newFloor)
    setSelectedRoomId(null) // QA-004: Mengganti lantai setelah memilih ruangan -> Pilihan ruangan sebelumnya ter-reset
    setSelectionNotice(null)
  }

  function handleSelectRoom(room: Room) {
    const status = resolveRoomStatus(room)
    if (status !== 'Tersedia') {
      // QA-006: Memilih ruangan tidak tersedia -> Sistem menolak pilihan
      setSelectionNotice({
        message: `Ruang ${room.kode} tidak dapat dipilih karena sedang berstatus "${status}".`,
        isError: true,
      })
      return
    }
    // QA-005: Memilih ruangan tersedia -> Ruangan berhasil dipilih
    if (selectedRoomId === room.id) {
      setSelectedRoomId(null)
      setSelectionNotice(null)
    } else {
      setSelectedRoomId(room.id)
      setSelectionNotice({
        message: `Ruang ${room.kode} (Lantai ${room.lantai}) berhasil dipilih.`,
        isError: false,
      })
    }
  }

  const floorRooms = useMemo(() => {
    if (!selectedFloor) return []
    return rooms.data.filter((r) => String(r.lantai) === selectedFloor)
  }, [rooms.data, selectedFloor])

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return null
    return rooms.data.find((r) => r.id === selectedRoomId) ?? null
  }, [rooms.data, selectedRoomId])

  return (
    <section className="st-page">
      <div className="st-heading">
        <div>
          <p className="st-kicker">KETERSEDIAAN</p>
          <h1>Cek ketersediaan sarana</h1>
          <p>Pilih tanggal peminjaman dan lantai untuk melihat ketersediaan ruang kelas terkini.</p>
        </div>
      </div>

      <label className="st-date">
        Tanggal peminjaman
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>

      <div className="st-section">
        <h2>Ruang kelas</h2>
        <p className="st-note">
          Gunakan dropdown berikut untuk memilih lantai. Hanya ruang kelas pada lantai yang dipilih yang akan ditampilkan.
        </p>

        {/* QA-001: Dropdown pemilihan lantai dengan placeholder */}
        <div className="st-floor-selector">
          <label htmlFor="floor-select">Pilih Lantai</label>
          <select
            id="floor-select"
            value={selectedFloor}
            onChange={(event) => handleFloorChange(event.target.value)}
          >
            <option value="">Pilih lantai terlebih dahulu</option>
            {floors.map((floor) => (
              <option key={floor} value={String(floor)}>
                Lantai {floor}
              </option>
            ))}
          </select>
        </div>

        {selectionNotice && (
          <div
            className={`st-notice-banner ${selectionNotice.isError ? 'is-error' : 'is-success'}`}
            role="alert"
          >
            <span>{selectionNotice.message}</span>
            <button
              type="button"
              className="st-notice-dismiss"
              onClick={() => setSelectionNotice(null)}
              aria-label="Tutup notifikasi"
            >
              ×
            </button>
          </div>
        )}

        {/* State Error atau Loading API */}
        {rooms.loading ? (
          <div className="st-empty" role="status">Memuat data ruangan…</div>
        ) : rooms.error ? (
          <div className="st-alert" role="alert">
            <span>{rooms.error}</span>
            <button
              type="button"
              className="st-button st-button-secondary"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              Coba lagi
            </button>
          </div>
        ) : !selectedFloor ? (
          /* Pengguna harus memilih lantai terlebih dahulu */
          <div className="st-empty">
            Pilih lantai terlebih dahulu untuk melihat daftar ruang kelas.
          </div>
        ) : floorRooms.length === 0 ? (
          /* QA-007: Memilih lantai tanpa ruangan -> Pesan data kosong tampil */
          <div className="st-empty">
            Belum ada ruang kelas pada Lantai {selectedFloor}.
          </div>
        ) : (
          /* QA-002, QA-003: Menampilkan ruang kelas lantai yang dipilih */
          <div className="st-room-grid">
            {floorRooms.map((room) => {
              const status = resolveRoomStatus(room)
              const isSelected = selectedRoomId === room.id
              const isAvailable = status === 'Tersedia'
              const badgeClass =
                status === 'Tersedia'
                  ? 'st-status-available'
                  : status === 'Sedang Digunakan'
                    ? 'st-status-inuse'
                    : 'st-status-unavailable'
              const icon =
                status === 'Tersedia' ? '✓' : status === 'Sedang Digunakan' ? '⏱' : '✕'

              return (
                <div
                  key={room.id}
                  className={`st-room-card ${isAvailable ? 'is-available' : 'is-disabled'} ${isSelected ? 'is-selected' : ''
                    }`}
                  onClick={() => handleSelectRoom(room)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-disabled={!isAvailable}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleSelectRoom(room)
                    }
                  }}
                >
                  <div className="st-room-card-header">
                    <span className="st-room-name">Ruang {room.kode}</span>
                    {isSelected && <span className="st-room-selected-pill">Terpilih</span>}
                  </div>
                  <p className="st-room-meta">Lantai {room.lantai} · Ruang {room.nomor}</p>
                  <div className="st-room-status-wrap">
                    <span className={`st-status-badge ${badgeClass}`}>
                      <span className="st-status-icon" aria-hidden="true">{icon}</span>
                      <span className="st-status-text">{status}</span>
                    </span>
                  </div>
                  <div className="st-room-action-text">
                    {isSelected
                      ? 'Klik untuk membatalkan pilihan'
                      : isAvailable
                        ? 'Klik untuk memilih ruangan'
                        : 'Ruangan tidak dapat dipilih'}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {selectedRoom && (
          <div className="st-selected-summary" role="region" aria-label="Ruangan terpilih">
            <div className="st-selected-info">
              <span className="st-selected-check" aria-hidden="true">✓</span>
              <div>
                <strong>Ruang {selectedRoom.kode} terpilih</strong>
                <p>
                  Lantai {selectedRoom.lantai} · Ruang {selectedRoom.nomor} · Status:{' '}
                  {resolveRoomStatus(selectedRoom)}
                </p>
              </div>
            </div>
            <div className="st-selected-actions">
              {onProceedToBooking && (
                <button
                  type="button"
                  className="st-button"
                  onClick={() => onProceedToBooking(selectedRoom.id)}
                >
                  Lanjut ajukan peminjaman
                </button>
              )}
              <button
                type="button"
                className="st-button st-button-secondary"
                onClick={() => {
                  setSelectedRoomId(null)
                  setSelectionNotice(null)
                }}
              >
                Batalkan pilihan
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="st-section">
        <h2>Laboratorium</h2>
        <p className="st-note">
          API jadwal laboratorium berdasarkan tanggal belum tersedia. Daftar berikut adalah data aktif, bukan konfirmasi ketersediaan.
        </p>
        <StateMessage state={labs} retry={() => setRefreshKey((key) => key + 1)} />
        {labs.data.length > 0 && (
          <div className="st-chip-list">
            {labs.data.map((lab) => (
              <span className="st-chip" key={lab.id}>
                {lab.nama} · {lab.kode}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="st-section">
        <h2>Stok barang {date && <small>pada {date}</small>}</h2>
        <StateMessage state={items} retry={() => setRefreshKey((key) => key + 1)} />
        {items.data.length > 0 && (
          <div className="st-table-wrap">
            <table className="st-table">
              <thead>
                <tr>
                  <th>Barang</th>
                  <th>Kategori</th>
                  <th>Stok tersedia</th>
                </tr>
              </thead>
              <tbody>
                {items.data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nama}</td>
                    <td>{item.kategori}</td>
                    <td>
                      <span className={item.stokTersedia > 0 ? 'st-stock-ok' : 'st-stock-empty'}>
                        {item.stokTersedia}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

function NewLoan({ defaultRoomId = '' }: { defaultRoomId?: string }) {
  const rooms = useResource<Room>('/rooms')
  const labs = useResource<Lab>('/labs')
  const items = useResource<Item>('/items')
  const [resourceType, setResourceType] = useState<'room' | 'lab'>('room')
  const [selectedResourceId, setSelectedResourceId] = useState(defaultRoomId)
  const [bookingFloorFilter, setBookingFloorFilter] = useState('')
  const [date, setDate] = useState('')
  const [durasi, setDurasi] = useState(1)
  const [itemLines, setItemLines] = useState([{ itemId: '', jumlah: 1 }])
  const [documents, setDocuments] = useState<Partial<Record<DocumentKind, File>>>({})
  const [requestId, setRequestId] = useState('')
  const [uploaded, setUploaded] = useState<DocumentKind[]>([])
  const [uploadingDocument, setUploadingDocument] = useState<DocumentKind | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<Loan | null>(null)
  const eligibleDate = new Date(); eligibleDate.setDate(eligibleDate.getDate() + 7)
  const minDate = `${eligibleDate.getFullYear()}-${String(eligibleDate.getMonth() + 1).padStart(2, '0')}-${String(eligibleDate.getDate()).padStart(2, '0')}`
  const isStudent = sessionStorage.getItem('baum.user')?.includes('MAHASISWA') ?? false
  const requiredKinds: DocumentKind[] = isStudent ? ['SURAT_BIDANG_3', 'KTM', 'BIODATA_ORMAWA'] : ['SURAT_BIDANG_3', 'BIODATA_ORMAWA']
  const lookup = new Map(items.data.map((item) => [item.id, item]))

  const roomFloors = useMemo(() => {
    const existing = rooms.data.map((r) => Number(r.lantai)).filter((n) => Number.isInteger(n) && n > 0)
    return Array.from(new Set(existing)).sort((a, b) => a - b)
  }, [rooms.data])

  const displayedRooms = useMemo(() => {
    if (!bookingFloorFilter) return rooms.data
    return rooms.data.filter((r) => String(r.lantai) === bookingFloorFilter)
  }, [rooms.data, bookingFloorFilter])

  const setLine = (index: number, patch: Partial<(typeof itemLines)[number]>) => setItemLines((current) => current.map((line, position) => position === index ? { ...line, ...patch } : line))
  const changeFile = (kind: DocumentKind, file?: File) => {
    if (file && !allowedMimeTypes.includes(file.type)) { setError('Format dokumen harus PDF, JPG, atau PNG.'); return }
    if (file && file.size > maxUploadBytes) { setError(`Ukuran file melebihi batas ${Math.ceil(maxUploadBytes / 1024 / 1024)} MB.`); return }
    setError(''); setDocuments((current) => ({ ...current, [kind]: file }))
  }
  const validDate = date >= minDate
  const lineError = itemLines.some((line) => !line.itemId || !Number.isInteger(line.jumlah) || line.jumlah < 1 || line.jumlah > (lookup.get(line.itemId)?.stokTersedia ?? 0))
  const docsMissing = requiredKinds.some((kind) => !documents[kind] && !uploaded.includes(kind))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess(null)
    if (!validDate) { setError('Tanggal peminjaman harus minimal tujuh hari dari hari ini (H-7).'); return }
    if (lineError) { setError('Pilih barang dan jumlah yang tidak melebihi stok tersedia.'); return }
    if (docsMissing) { setError('Lengkapi semua dokumen wajib sebelum mengirim pengajuan.'); return }
    setBusy(true)
    try {
      let currentId = requestId
      if (!currentId) {
        const form = new FormData(event.currentTarget)
        const chosenResourceId = selectedResourceId || String(form.get('resourceId') || '')
        const body = {
          tanggalMulai: date,
          durasiHari: Number(durasi),
          keperluan: form.get('keperluan'),
          unitKerja: form.get('unitKerja'),
          penanggungJawab: form.get('penanggungJawab'),
          kontakPeminjam: form.get('kontakPeminjam'),
          ...(resourceType === 'room' ? { roomId: chosenResourceId } : { labId: chosenResourceId }),
          items: itemLines.map((line) => ({ itemId: line.itemId, jumlah: Number(line.jumlah) })),
        }
        const draft = await apiRequest<Loan>('/loan-requests', { method: 'POST', body: JSON.stringify(body) })
        currentId = draft.id; setRequestId(draft.id)
      }
      for (const kind of requiredKinds) {
        const file = documents[kind]
        if (!file || uploaded.includes(kind)) continue
        const body = new FormData(); body.append('jenis', kind); body.append('file', file)
        setUploadingDocument(kind)
        await apiRequest(`/loan-requests/${currentId}/documents`, { method: 'POST', body })
        setUploaded((current) => [...current, kind])
        setUploadingDocument(null)
      }
      const submitted = await apiRequest<Loan>(`/loan-requests/${currentId}/submit`, { method: 'POST' })
      setSuccess(submitted); setRequestId(''); setUploaded([]); setDocuments({})
    } catch (caught) { setUploadingDocument(null); setError(errorMessage(caught)) } finally { setBusy(false) }
  }

  if (success) return <section className="st-page"><div className="st-success"><span className="st-success-icon">✓</span><p className="st-kicker">PENGAJUAN TERKIRIM</p><h1>Pengajuan berhasil dikirim</h1><p>Status: <strong>{success.status}</strong></p><p className="st-muted">ID pengajuan: {success.id}</p></div></section>
  return (
    <section className="st-page">
      <div className="st-heading">
        <div>
          <p className="st-kicker">PB-15–PB-18</p>
          <h1>Formulir pengajuan peminjaman</h1>
          <p>Isi data, pilih sarana, dan lampirkan dokumen wajib. Validasi backend tetap berlaku.</p>
        </div>
      </div>
      {error && (
        <div className="st-alert" role="alert">
          {error}
          {requestId && <span> Draft tersimpan dengan ID {requestId}; Anda dapat mencoba mengirim ulang.</span>}
        </div>
      )}
      <form className="st-loan-form" onSubmit={(event) => void submit(event)}>
        {/* Section 1: Jadwal & Keperluan */}
        <section className="st-form-card">
          <h2>Jadwal &amp; keperluan</h2>
          <div className="st-form-grid st-grid-2">
            <div className="st-field">
              <label htmlFor="tanggal-peminjaman">Tanggal peminjaman</label>
              <input
                id="tanggal-peminjaman"
                type="date"
                required
                min={minDate}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
              <span className="st-field-hint">Minimal H-7: {minDate}</span>
            </div>
            <div className="st-field">
              <label htmlFor="durasi-hari">Durasi (hari)</label>
              <input
                id="durasi-hari"
                type="number"
                min="1"
                step="1"
                required
                value={durasi}
                onChange={(event) => setDurasi(Number(event.target.value))}
              />
              <span className="st-field-hint">Jumlah hari pelaksanaan kegiatan</span>
            </div>
          </div>

          <div className="st-field st-field-full">
            <label htmlFor="keperluan-text">Keperluan</label>
            <textarea
              id="keperluan-text"
              name="keperluan"
              required
              maxLength={1000}
              rows={3}
              placeholder="Jelaskan tujuan dan rincian peminjaman"
            />
            <span className="st-field-hint">Maksimal 1000 karakter</span>
          </div>

          <div className="st-form-grid st-grid-3">
            <div className="st-field">
              <label htmlFor="unit-kerja-input">Unit kerja</label>
              <input
                id="unit-kerja-input"
                name="unitKerja"
                required
                placeholder="Contoh: HIMA IF / BEM"
              />
              <span className="st-field-hint">Organisasi / fakultas pemohon</span>
            </div>
            <div className="st-field">
              <label htmlFor="penanggung-jawab-input">Penanggung jawab</label>
              <input
                id="penanggung-jawab-input"
                name="penanggungJawab"
                required
                placeholder="Nama penanggung jawab"
              />
              <span className="st-field-hint">Nama lengkap penanggung jawab</span>
            </div>
            <div className="st-field">
              <label htmlFor="kontak-peminjam-input">Kontak peminjam</label>
              <input
                id="kontak-peminjam-input"
                name="kontakPeminjam"
                type="tel"
                required
                placeholder="08xxxxxxxxxx"
              />
              <span className="st-field-hint">Nomor telepon / WhatsApp aktif</span>
            </div>
          </div>
        </section>

        {/* Section 2: Ruang atau Laboratorium */}
        <section className="st-form-card">
          <h2>Ruang atau laboratorium</h2>
          <div className="st-choice-row">
            <label className={`st-choice-pill ${resourceType === 'room' ? 'is-active' : ''}`}>
              <input
                type="radio"
                checked={resourceType === 'room'}
                onChange={() => { setResourceType('room'); setSelectedResourceId(''); }}
              />
              Ruang kelas
            </label>
            <label className={`st-choice-pill ${resourceType === 'lab' ? 'is-active' : ''}`}>
              <input
                type="radio"
                checked={resourceType === 'lab'}
                onChange={() => { setResourceType('lab'); setSelectedResourceId(''); }}
              />
              Laboratorium
            </label>
          </div>

          {resourceType === 'room' ? (
            <div className="st-form-grid st-grid-2">
              <div className="st-field">
                <label htmlFor="booking-floor-select">Filter lantai</label>
                <select
                  id="booking-floor-select"
                  value={bookingFloorFilter}
                  onChange={(event) => setBookingFloorFilter(event.target.value)}
                >
                  <option value="">Semua lantai ({rooms.data.length} ruang)</option>
                  {roomFloors.map((fl) => (
                    <option key={fl} value={String(fl)}>
                      Lantai {fl} ({rooms.data.filter((r) => r.lantai === fl).length} ruang)
                    </option>
                  ))}
                </select>
                <span className="st-field-hint">Saring daftar ruangan per lantai</span>
              </div>
              <div className="st-field">
                <label htmlFor="booking-room-select">Pilih ruang kelas</label>
                <select
                  id="booking-room-select"
                  name="resourceId"
                  required
                  value={selectedResourceId}
                  onChange={(event) => setSelectedResourceId(event.target.value)}
                >
                  <option value="">Pilih ruang kelas</option>
                  {displayedRooms.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.kode} · Lantai {resource.lantai}
                    </option>
                  ))}
                </select>
                <span className="st-field-hint">
                  {selectedResourceId
                    ? `Ruang terpilih: ${rooms.data.find((r) => r.id === selectedResourceId)?.kode ?? ''}`
                    : 'Pilih ruang kelas yang tersedia'}
                </span>
              </div>
            </div>
          ) : (
            <div className="st-field st-field-full">
              <label htmlFor="booking-lab-select">Laboratorium</label>
              <select
                id="booking-lab-select"
                name="resourceId"
                required
                value={selectedResourceId}
                onChange={(event) => setSelectedResourceId(event.target.value)}
              >
                <option value="">Pilih laboratorium</option>
                {labs.data.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.nama} · {resource.kode} {resource.pengelola ? `(Pengelola: ${resource.pengelola})` : ''}
                  </option>
                ))}
              </select>
              <span className="st-field-hint">Pilih laboratorium yang akan dipinjam</span>
            </div>
          )}

          {(rooms.error || labs.error) && (
            <div className="st-form-error" role="alert">{rooms.error || labs.error}</div>
          )}
        </section>

        {/* Section 3: Barang & Jumlah */}
        <section className="st-form-card">
          <div className="st-card-heading">
            <div>
              <h2>Barang &amp; jumlah</h2>
              <p>Backend mewajibkan minimal satu barang untuk setiap pengajuan saat ini.</p>
            </div>
            <button
              type="button"
              className="st-button st-button-secondary"
              onClick={() => setItemLines((current) => [...current, { itemId: '', jumlah: 1 }])}
            >
              + Tambah barang
            </button>
          </div>

          <div className="st-item-lines-wrap">
            {itemLines.map((line, index) => {
              const item = lookup.get(line.itemId);
              return (
                <div className="st-item-line" key={index}>
                  <div className="st-field st-field-grow">
                    <label htmlFor={`barang-item-${index}`}>Barang #{index + 1}</label>
                    <select
                      id={`barang-item-${index}`}
                      required
                      value={line.itemId}
                      onChange={(event) => setLine(index, { itemId: event.target.value })}
                    >
                      <option value="">Pilih barang</option>
                      {items.data.map((option) => (
                        <option
                          key={option.id}
                          value={option.id}
                          disabled={itemLines.some((other, position) => position !== index && other.itemId === option.id)}
                        >
                          {option.nama}
                        </option>
                      ))}
                    </select>
                    <span className="st-field-hint">
                      {item ? `Kategori: ${item.kategori}` : 'Pilih barang inventaris'}
                    </span>
                  </div>

                  <div className="st-field st-field-qty">
                    <label htmlFor={`barang-qty-${index}`}>Jumlah</label>
                    <input
                      id={`barang-qty-${index}`}
                      type="number"
                      min="1"
                      max={item?.stokTersedia ?? undefined}
                      step="1"
                      required
                      value={line.jumlah}
                      onChange={(event) => setLine(index, { jumlah: Number(event.target.value) })}
                    />
                    <span className="st-field-hint">
                      Stok tersedia: <strong className={item && item.stokTersedia > 0 ? 'st-stock-ok' : 'st-stock-empty'}>{item?.stokTersedia ?? '—'}</strong>
                    </span>
                  </div>

                  {itemLines.length > 1 && (
                    <div className="st-item-action">
                      <button
                        type="button"
                        className="st-button st-button-danger st-btn-remove-line"
                        onClick={() => setItemLines((current) => current.filter((_, position) => position !== index))}
                        title="Hapus baris barang"
                        aria-label="Hapus baris barang"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {items.error && <div className="st-form-error" role="alert">{items.error}</div>}
        </section>

        {/* Section 4: Dokumen Pendukung */}
        <section className="st-form-card">
          <h2>Dokumen pendukung</h2>
          <p>Format yang diterima backend: PDF, JPG, PNG. Batas default backend 10 MB.</p>
          <div className="st-doc-grid">
            {requiredKinds.map((kind) => {
              const file = documents[kind];
              const isUploaded = uploaded.includes(kind);
              const isUploading = uploadingDocument === kind;
              return (
                <div
                  className={`st-doc-card ${isUploaded ? 'is-uploaded' : file ? 'is-ready' : ''}`}
                  key={kind}
                >
                  <div className="st-doc-card-top">
                    <span className="st-doc-card-title">{documentLabels[kind]}</span>
                    <span className="st-doc-card-badge">Wajib</span>
                  </div>

                  <div className="st-doc-card-body">
                    {file ? (
                      <div className="st-doc-file-info">
                        <span className="st-doc-icon" aria-hidden="true">📄</span>
                        <div className="st-doc-file-names">
                          <strong className="st-doc-filename" title={file.name}>{file.name}</strong>
                          <span className="st-doc-filesize">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        {!isUploaded && (
                          <button
                            type="button"
                            className="st-doc-delete-btn"
                            onClick={() => setDocuments((current) => ({ ...current, [kind]: undefined }))}
                            title="Hapus file"
                            aria-label="Hapus file"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      <label className="st-doc-picker-box">
                        <span className="st-doc-picker-icon" aria-hidden="true">📁</span>
                        <span className="st-doc-picker-text">Pilih berkas</span>
                        <input
                          type="file"
                          disabled={isUploaded}
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                          onChange={(event) => changeFile(kind, event.target.files?.[0])}
                          className="st-hidden-file-input"
                        />
                      </label>
                    )}
                  </div>

                  <div className="st-doc-card-footer">
                    {isUploading ? (
                      <span className="st-doc-state is-uploading">⏳ Sedang mengunggah…</span>
                    ) : isUploaded ? (
                      <span className="st-doc-state is-uploaded">✓ Tersimpan di draft</span>
                    ) : file ? (
                      <span className="st-doc-state is-ready">✓ Berkas siap dikirim</span>
                    ) : (
                      <span className="st-doc-state is-empty">Belum ada berkas dipilih</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Ringkasan */}
        <section className="st-form-card st-summary-section">
          <h2>Ringkasan pengajuan</h2>
          <div className="st-summary-grid">
            <div className="st-summary-col">
              <span className="st-summary-sub">Jadwal peminjaman</span>
              <strong className="st-summary-main">{date ? `${date} (${durasi} hari)` : 'Belum dipilih'}</strong>
            </div>
            <div className="st-summary-col">
              <span className="st-summary-sub">Sarana dipilih</span>
              <strong className="st-summary-main">
                {resourceType === 'room'
                  ? (rooms.data.find((r) => r.id === selectedResourceId)?.kode
                    ? `Ruang ${rooms.data.find((r) => r.id === selectedResourceId)?.kode} (Lantai ${rooms.data.find((r) => r.id === selectedResourceId)?.lantai})`
                    : 'Belum dipilih')
                  : (labs.data.find((l) => l.id === selectedResourceId)?.nama ?? 'Belum dipilih')}
              </strong>
            </div>
            <div className="st-summary-col">
              <span className="st-summary-sub">Barang inventaris</span>
              <strong className="st-summary-main">
                {itemLines.filter((l) => l.itemId).map((l) => `${lookup.get(l.itemId)?.nama ?? 'Barang'} × ${l.jumlah}`).join(', ') || 'Belum dipilih'}
              </strong>
            </div>
            <div className="st-summary-col">
              <span className="st-summary-sub">Kelengkapan dokumen</span>
              <strong className="st-summary-main">
                {requiredKinds.filter((k) => documents[k] || uploaded.includes(k)).length}/{requiredKinds.length} berkas siap
              </strong>
            </div>
          </div>
        </section>

        <div className="st-form-actions">
          <button
            type="submit"
            className="st-button st-submit"
            disabled={busy || (!rooms.data.length && !labs.data.length) || !items.data.length}
          >
            {busy ? 'Mengirim pengajuan…' : requestId ? 'Lanjutkan pengiriman draft' : 'Kirim pengajuan'}
          </button>
        </div>
      </form>
    </section>
  )
}


export default function SprintTwo({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [page, setPage] = useState<Page>('master')
  const [preselectedRoomId, setPreselectedRoomId] = useState<string>('')

  return (
    <main className="st-layout">
      <aside className="st-sidebar">
        <div className="st-brand">
          <span className="st-brand-mark">U</span>
          <div>
            <strong>UKRI</strong>
            <small>Sarana &amp; Prasarana</small>
          </div>
        </div>
        <nav className="st-nav" aria-label="Navigasi utama">
          <button
            className={page === 'master' ? 'is-active' : ''}
            onClick={() => setPage('master')}
          >
            Data master
          </button>
          <button
            className={page === 'availability' ? 'is-active' : ''}
            onClick={() => setPage('availability')}
          >
            Ketersediaan
          </button>
          <button
            className={page === 'booking' ? 'is-active' : ''}
            onClick={() => setPage('booking')}
          >
            Ajukan peminjaman
          </button>
        </nav>
        <div className="st-account">
          <span>{user.namaLengkap}</span>
          <small>{user.role}</small>
          <button className="st-signout" onClick={onLogout}>Keluar</button>
        </div>
      </aside>
      <div className="st-content">
        {page === 'master' ? (
          <MasterData />
        ) : page === 'availability' ? (
          <Availability
            onProceedToBooking={(roomId) => {
              setPreselectedRoomId(roomId)
              setPage('booking')
            }}
          />
        ) : (
          <NewLoan key={preselectedRoomId || 'new-loan'} defaultRoomId={preselectedRoomId} />
        )}
      </div>
    </main>
  )
}

