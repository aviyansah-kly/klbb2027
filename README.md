# KLBB 2027 — Festival Playground

Static microsite untuk handoff tim frontend/IT. Repository ini terpisah dari proyek ChatGPT Sites asli.

## Jalankan & deploy

- Preview lokal: `python3 -m http.server 8080 --directory dist`, lalu buka `http://localhost:8080`.
- Cloudflare Pages: branch `main`, **tanpa build command**, output directory `dist`.
- Tidak membutuhkan framework, bundler, atau instalasi npm.

## Struktur source

| File | Kegunaan |
| --- | --- |
| `dist/index.html` | Struktur homepage |
| `dist/app.js` | Navigasi, animasi, lineup, rundown, dan 8 tenant di homepage |
| `dist/tenant-data.js` | Satu sumber data untuk 39 tenant (1 baris per tenant) |
| `dist/tenants.html` + `tenant-index.js` | Halaman semua tenant, pencarian, dan detail anchor |
| `dist/styles.css`, `lineup.css`, `rundown.css`, `sponsors.css`, `food-market.css`, `tenant-index.css` | CSS terpisah per bagian |
| `dist/assets/` | Logo, foto, dekorasi, dan media yang dipakai halaman |

## Aturan pengembangan

1. Edit data tenant hanya di `dist/tenant-data.js`; simpan logo ke `dist/assets/tenants/`.
2. Homepage sengaja menampilkan **8 tenant** (desktop 4 × 2, mobile 2 kolom); daftar lengkap ada di `tenants.html`.
3. Jangan menampilkan tautan **Order** sebelum URL resmi tersedia.
4. Rundown masih menggunakan waktu usulan; nama tenant berasal dari referensi **KLBB 2026**. Keduanya belum menjadi pengumuman resmi KLBB 2027.
5. Setelah mengubah source, cek desktop/mobile, pencarian tenant, tautan antarhalaman, tab rundown, dan interaksi menu.

Riwayat migrasi dan file sementara tetap dapat dilihat melalui **Git history**; script impor sekali pakai sudah dibersihkan dari branch aktif.
