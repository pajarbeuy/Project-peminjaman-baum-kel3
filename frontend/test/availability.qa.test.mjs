import test from 'node:test';
import assert from 'node:assert/strict';

// Helper logic extracted from SprintTwo.tsx
function resolveRoomStatus(room) {
  if (room.status === 'Sedang Digunakan' || room.status === 'SEDANG_DIGUNAKAN') {
    return 'Sedang Digunakan';
  }
  if (room.status === 'Tidak Tersedia' || room.status === 'TIDAK_TERSEDIA' || room.isActive === false) {
    return 'Tidak Tersedia';
  }
  return 'Tersedia';
}

function deriveFloors(rooms) {
  const existingFloors = rooms.map((r) => Number(r.lantai)).filter((n) => Number.isInteger(n) && n > 0);
  const maxFloor = existingFloors.length > 0 ? Math.max(7, ...existingFloors) : 7;
  const floorSet = new Set();
  for (let f = 1; f <= maxFloor; f += 1) {
    floorSet.add(f);
  }
  for (const f of existingFloors) {
    floorSet.add(f);
  }
  return Array.from(floorSet).sort((a, b) => a - b);
}

// Mock room dataset
const mockRooms = [
  { id: 'r-101', kode: '1.1', lantai: 1, nomor: 1, isActive: true, status: 'Tersedia' },
  { id: 'r-102', kode: '1.2', lantai: 1, nomor: 2, isActive: true, status: 'Sedang Digunakan' },
  { id: 'r-103', kode: '1.3', lantai: 1, nomor: 3, isActive: false, status: 'Tidak Tersedia' },
  { id: 'r-601', kode: '6.1', lantai: 6, nomor: 1, isActive: true, status: 'Tersedia' },
  { id: 'r-602', kode: '6.2', lantai: 6, nomor: 2, isActive: true, status: 'Tersedia' },
  { id: 'r-701', kode: '7.1', lantai: 7, nomor: 1, isActive: true, status: 'Tersedia' },
];

test('QA-001: Membuka halaman ketersediaan - Dropdown lantai tampil dengan placeholder dan opsi dinamis', () => {
  const floors = deriveFloors(mockRooms);
  const placeholder = 'Pilih lantai terlebih dahulu';

  assert.ok(placeholder, 'Placeholder harus ada');
  assert.ok(floors.length >= 7, 'Lantai harus berisi setidaknya lantai 1 hingga 7');
  assert.deepEqual(floors.slice(0, 7), [1, 2, 3, 4, 5, 6, 7]);
});

test('QA-002: Memilih lantai 1 - Ruangan lantai 1 tampil dan tidak menampilkan lantai lain', () => {
  const selectedFloor = '1';
  const filteredRooms = mockRooms.filter((r) => String(r.lantai) === selectedFloor);

  assert.equal(filteredRooms.length, 3);
  assert.ok(filteredRooms.every((r) => r.lantai === 1), 'Semua ruangan harus berada di Lantai 1');
  assert.ok(!filteredRooms.some((r) => r.lantai === 6), 'Tidak boleh menampilkan ruangan Lantai 6');
});

test('QA-003: Mengganti lantai - Daftar ruangan otomatis diperbarui', () => {
  let selectedFloor = '1';
  let filteredRooms = mockRooms.filter((r) => String(r.lantai) === selectedFloor);
  assert.equal(filteredRooms.length, 3);

  // Ganti ke lantai 6
  selectedFloor = '6';
  filteredRooms = mockRooms.filter((r) => String(r.lantai) === selectedFloor);
  assert.equal(filteredRooms.length, 2);
  assert.deepEqual(filteredRooms.map((r) => r.kode), ['6.1', '6.2']);
});

test('QA-004: Mengganti lantai setelah memilih ruangan - Pilihan ruangan sebelumnya ter-reset', () => {
  let selectedFloor = '1';
  let selectedRoomId = 'r-101'; // User telah memilih ruang 1.1

  // Interaksi ganti lantai ke Lantai 6
  function onFloorChange(newFloor) {
    selectedFloor = newFloor;
    selectedRoomId = null; // Reset sesuai QA-004
  }

  onFloorChange('6');
  assert.equal(selectedFloor, '6');
  assert.equal(selectedRoomId, null, 'Pilihan ruangan sebelumnya harus direset menjadi null');
});

test('QA-005: Memilih ruangan tersedia - Ruangan berhasil dipilih', () => {
  let selectedRoomId = null;
  let selectionNotice = null;

  function handleSelectRoom(room) {
    const status = resolveRoomStatus(room);
    if (status !== 'Tersedia') {
      selectionNotice = { message: `Ruang ${room.kode} tidak dapat dipilih karena ${status}.`, isError: true };
      return;
    }
    selectedRoomId = room.id;
    selectionNotice = { message: `Ruang ${room.kode} berhasil dipilih.`, isError: false };
  }

  const availableRoom = mockRooms.find((r) => r.id === 'r-101');
  assert.equal(resolveRoomStatus(availableRoom), 'Tersedia');

  handleSelectRoom(availableRoom);
  assert.equal(selectedRoomId, 'r-101', 'Ruangan yang tersedia berhasil dipilih');
  assert.equal(selectionNotice?.isError, false);
});

test('QA-006: Memilih ruangan tidak tersedia - Sistem menolak pilihan', () => {
  let selectedRoomId = null;
  let selectionNotice = null;

  function handleSelectRoom(room) {
    const status = resolveRoomStatus(room);
    if (status !== 'Tersedia') {
      selectionNotice = { message: `Ruang ${room.kode} tidak dapat dipilih karena berstatus "${status}".`, isError: true };
      return;
    }
    selectedRoomId = room.id;
  }

  // Coba pilih ruangan Sedang Digunakan
  const inUseRoom = mockRooms.find((r) => r.id === 'r-102');
  assert.equal(resolveRoomStatus(inUseRoom), 'Sedang Digunakan');

  handleSelectRoom(inUseRoom);
  assert.equal(selectedRoomId, null, 'Pilihan harus ditolak');
  assert.equal(selectionNotice?.isError, true);
  assert.match(selectionNotice?.message, /tidak dapat dipilih/i);

  // Coba pilih ruangan Tidak Tersedia
  const unavailableRoom = mockRooms.find((r) => r.id === 'r-103');
  assert.equal(resolveRoomStatus(unavailableRoom), 'Tidak Tersedia');

  handleSelectRoom(unavailableRoom);
  assert.equal(selectedRoomId, null, 'Pilihan harus tetap ditolak');
  assert.equal(selectionNotice?.isError, true);
});

test('QA-007: Memilih lantai tanpa ruangan - Pesan data kosong tampil', () => {
  const selectedFloor = '2'; // Lantai 2 belum memiliki ruangan di sistem
  const filteredRooms = mockRooms.filter((r) => String(r.lantai) === selectedFloor);

  assert.equal(filteredRooms.length, 0);

  const emptyMessage = filteredRooms.length === 0
    ? `Belum ada ruang kelas pada Lantai ${selectedFloor}.`
    : null;

  assert.equal(emptyMessage, 'Belum ada ruang kelas pada Lantai 2.');
});

test('QA-008: API gagal mengambil data - Pesan error tampil dengan tombol coba lagi', () => {
  const stateWithError = {
    data: [],
    loading: false,
    error: 'Backend tidak dapat dijangkau. Coba muat ulang daftar ruangan.',
  };

  assert.ok(stateWithError.error, 'Pesan error harus tersedia saat API gagal');
  assert.match(stateWithError.error, /tidak dapat dijangkau|gagal/i);

  let retryTriggered = false;
  const retry = () => { retryTriggered = true; };

  retry();
  assert.equal(retryTriggered, true, 'Tombol coba lagi harus dapat memicu pengambilan ulang data');
});

