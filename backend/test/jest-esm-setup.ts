/**
 * Jest ESM Global Setup
 *
 * Di ESM mode (Jest 30 + NestJS v12 pure ESM), global `jest` tidak otomatis
 * tersedia karena setiap modul ESM punya scope sendiri.
 *
 * File ini di-load oleh Jest setelah framework siap (setupFilesAfterEnv),
 * sehingga `jest` object (dari @jest/globals) di-assign ke `globalThis`
 * agar spec file lama yang belum memakai `import { jest }` tetap berjalan.
 *
 * Referensi: https://jestjs.io/docs/ecmascript-modules
 */
import { jest as jestGlobal } from '@jest/globals';

// Assign ke globalThis agar tersedia sebagai `jest` di semua spec file
(globalThis as typeof globalThis & { jest: typeof jestGlobal }).jest =
  jestGlobal;

// Berikan timeout 30 detik untuk pengujian async / bootstrap modul NestJS + DB
jestGlobal.setTimeout(30000);
