import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator untuk menandai endpoint sebagai publik (tidak memerlukan autentikasi).
 * Digunakan pada endpoint login dan register.
 *
 * @example
 * @Public()
 * @Post('login')
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
