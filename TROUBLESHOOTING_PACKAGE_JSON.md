# Troubleshooting: Error Parsing package.json di Vercel

## Masalah
```
Build Failed
Can't parse json file /vercel/path0/backend/package.json: Expected property name or '}' in JSON at position 1 while parsing '{\n \"name\": \"spbu-rbac-api\",\n \"v'
```

## Penyebab Umum
1. **Karakter tersembunyi**: Karakter BOM (Byte Order Mark) atau karakter non-printable lainnya
2. **Encoding yang salah**: File disimpan dengan encoding yang tidak kompatibel
3. **Escape karakter yang salah**: Karakter kutip atau backslash yang tidak di-escape dengan benar
4. **Format JSON yang tidak valid**: Koma tambahan, kurung kurawal yang tidak seimbang, dll.

## Solusi yang Telah Dilakukan

### 1. Regenerasi package.json
File `package.json` telah dibuat ulang dengan format yang bersih dan valid.

### 2. Verifikasi Lokal
File telah diverifikasi secara lokal dengan perintah:
```bash
npm install --dry-run
```
Perintah ini berhasil dijalankan tanpa error, menunjukkan bahwa file valid secara lokal.

### 3. Simplifikasi vercel.json
File `vercel.json` telah disederhanakan untuk menghindari konflik konfigurasi.

## Langkah-langkah Troubleshooting Tambahan

### 1. Periksa Encoding File
- Pastikan file disimpan dengan encoding UTF-8 tanpa BOM
- Gunakan editor teks seperti VS Code dan pilih "Save with Encoding" → "UTF-8"

### 2. Validasi JSON
- Gunakan validator JSON online seperti jsonlint.com
- Atau jalankan perintah di terminal:
  ```bash
  cat package.json | python -m json.tool
  ```

### 3. Periksa Karakter Tersembunyi
- Gunakan perintah berikut untuk melihat karakter tersembunyi:
  ```bash
  cat -A package.json
  ```
- Cari karakter aneh seperti `^M`, `M-`, atau karakter non-ASCII di awal file

### 4. Bandingkan dengan File yang Berhasil
- Bandingkan file package.json dengan file yang berhasil dideploy sebelumnya
- Gunakan tool diff untuk melihat perbedaan

## Pencegahan untuk Deployment Mendatang

### 1. Gunakan Template yang Terbukti
Gunakan template package.json yang telah terbukti berhasil di deployment sebelumnya.

### 2. Validasi Sebelum Push
Selalu validasi file package.json sebelum push ke repository:
```bash
# Di direktori backend
node -e "console.log(JSON.parse(require('fs').readFileSync('package.json')))"
```

### 3. Gunakan Pre-commit Hook
Tambahkan pre-commit hook untuk memvalidasi file JSON sebelum commit.

## Jika Masalah Berlanjut

### 1. Deploy dengan Konfigurasi Minimal
Coba deploy dengan package.json yang sangat minimal:
```json
{
  "name": "spbu-rbac-api",
  "version": "1.0.0",
  "main": "api.js",
  "scripts": {
    "build": "echo \"Building backend...\""
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

### 2. Gunakan Vercel CLI
Deploy menggunakan Vercel CLI untuk debugging lebih lanjut:
```bash
npm install -g vercel
vercel deploy
```

### 3. Periksa Logs Vercel
Periksa build logs secara detail di Vercel Dashboard untuk melihat error yang lebih spesifik.

## Catatan Penting
Jika masalah terus berlanjut, kemungkinan ada masalah dengan cara file diunggah ke Vercel atau ada konfigurasi khusus di akun Vercel Anda yang perlu diperiksa.