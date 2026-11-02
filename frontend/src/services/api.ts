const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = typeof body === 'object' && body !== null && 'message' in body
      ? (body as { message?: unknown }).message
      : null
    const detail = Array.isArray(message) ? message.join(' ') : typeof message === 'string' ? message : null
    const hints: Record<number, string> = {
      400: 'Periksa kembali data yang dikirim.',
      401: 'Sesi login tidak valid atau sudah berakhir. Silakan masuk kembali.',
      403: 'Akun Anda tidak memiliki izin untuk melakukan tindakan ini.',
      404: 'Data atau endpoint yang diminta tidak ditemukan.',
      409: 'Terjadi konflik data. Perbarui data lalu coba lagi.',
      500: 'Server mengalami kendala. Coba lagi beberapa saat kemudian.',
    }
    throw new ApiError(detail ?? hints[response.status] ?? `Permintaan gagal (HTTP ${response.status}).`, response.status)
  }
  return body as T
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem('baum.accessToken')
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  try {
    return await readResponse<T>(await fetch(`${API_BASE_URL}${path}`, { ...init, headers }))
  } catch (error) {
    if (error instanceof TypeError) throw new ApiError('Server tidak dapat dijangkau. Periksa koneksi dan coba lagi.')
    throw error
  }
}
