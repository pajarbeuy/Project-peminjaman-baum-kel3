import { Role } from '../../common/enums/role.enum';

/**
 * Payload yang disimpan di dalam JWT access token.
 * Hanya berisi data yang diperlukan untuk authorization check di guard/policy.
 * JANGAN menambahkan data sensitif (password, token, data pribadi) ke sini.
 */
export interface JwtPayload {
  /** User ID (UUID) */
  sub: string;
  email: string;
  role: Role;
  /** Scope fakultas — digunakan oleh guard TU (BR-03). Null untuk BAUM/KABAG/KABIRO. */
  fakultasId: string | null;
}
