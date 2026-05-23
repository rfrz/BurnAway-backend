# BurnAway Backend

Backend API untuk BurnAway, aplikasi prediksi tingkat burnout berdasarkan data profil pengguna dan metrik kerja harian. Service ini menangani autentikasi, profil pengguna, penyimpanan riwayat prediksi, validasi request, dan meneruskan payload prediksi ke service Deep Learning eksternal.

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Menjalankan Dengan Docker](#menjalankan-dengan-docker)
- [Environment Variables](#environment-variables)
- [Database dan Prisma](#database-dan-prisma)
- [API Endpoints](#api-endpoints)
- [Integrasi Service DL](#integrasi-service-dl)
- [Troubleshooting](#troubleshooting)

## Tech Stack

- Node.js dengan ES Modules
- Express.js
- Prisma ORM
- PostgreSQL
- JWT untuk autentikasi
- bcryptjs untuk hashing password
- Zod untuk validasi request body
- Axios untuk komunikasi ke service DL
- Helmet, CORS, dan rate limiting untuk middleware keamanan dasar
- Docker dan Docker Compose

## Prasyarat

Untuk menjalankan tanpa Docker:

- Node.js
- npm
- PostgreSQL
- Service DL prediction yang menyediakan endpoint prediksi burnout

Untuk menjalankan dengan Docker:

- Docker
- Docker Compose
- Service DL prediction tetap perlu berjalan terpisah, default di `http://localhost:8000`

## Menjalankan Secara Lokal

1. Install dependencies.

   ```bash
   npm install
   ```

2. Buat file `.env` dari contoh.

   ```bash
   cp .env.example .env
   ```

   Di Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Sesuaikan nilai environment variable di `.env`, terutama `DATABASE_URL`, `JWT_SECRET`, dan `DL_API_URL`.

4. Generate Prisma Client.

   ```bash
   npx prisma generate
   ```

5. Jalankan migration database.

   ```bash
   npm run prisma:migrate
   ```

6. Jalankan server development.

   ```bash
   npm run dev
   ```

Server akan berjalan di `http://localhost:3000` jika `PORT` tidak diubah.

Health check:

```bash
curl http://localhost:3000/api/health
```

## Menjalankan Dengan Docker

1. Buat file `.env.docker` dari contoh.

   ```bash
   cp .env.docker.example .env.docker
   ```

   Di Windows PowerShell:

   ```powershell
   Copy-Item .env.docker.example .env.docker
   ```

2. Sesuaikan nilai di `.env.docker`, terutama `JWT_SECRET` dan `DL_API_URL` jika service DL tidak berjalan di host pada port `8000`.

3. Build dan jalankan container.

   ```bash
   docker compose up --build
   ```

Compose akan menjalankan:

- `api`: Express API di port `3000`
- `postgres`: PostgreSQL di port `5432`

Saat container `api` start, command akan menjalankan `prisma migrate deploy`, `prisma generate`, lalu `npm run dev`.

## Environment Variables

| Variable | Contoh | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/burnaway?schema=public` | URL koneksi PostgreSQL untuk Prisma. |
| `JWT_SECRET` | `replace-with-a-long-random-secret` | Secret untuk menandatangani dan memverifikasi JWT. Wajib diisi. |
| `JWT_EXPIRES_IN` | `7d` | Masa berlaku token JWT. |
| `PORT` | `3000` | Port server Express. |
| `DL_API_URL` | `http://localhost:8000` | Base URL service Deep Learning. |
| `DL_PREDICT_PATH` | `/predict_burnout` | Path endpoint prediksi pada service DL. |
| `CORS_ORIGIN` | `*` | Origin yang diizinkan. Gunakan koma untuk beberapa origin. |
| `NODE_ENV` | `development` | Environment runtime. Ada di contoh Docker. |

Untuk Docker, `DATABASE_URL` default menggunakan host service Compose:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/burnaway?schema=public"
DL_API_URL="http://host.docker.internal:8000"
```

## Database dan Prisma

Model utama:

- `User`: data akun pengguna, profil umur, dan pengalaman kerja.
- `Prediction`: riwayat input metrik kerja harian, hasil prediksi, confidence, probabilitas, dan advice.

Command Prisma yang tersedia:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Catatan:

- `npm run prisma:generate` menjalankan `prisma generate`.
- `npm run prisma:migrate` menjalankan `prisma migrate dev`.
- Docker menggunakan `npx prisma migrate deploy`, cocok untuk menerapkan migration yang sudah ada.

## API Endpoints

Base URL lokal:

```text
http://localhost:3000
```

Format response sukses secara umum:

```json
{
  "success": true,
  "message": "Message",
  "data": {}
}
```

Format response error secara umum:

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

Endpoint yang membutuhkan autentikasi harus mengirim header:

```http
Authorization: Bearer <token>
```

### Health Check

```http
GET /api/health
```

Contoh response:

```json
{
  "success": true,
  "message": "BurnAway backend is healthy",
  "data": {
    "status": "ok"
  }
}
```

### Register

```http
POST /api/auth/register
```

Request body:

```json
{
  "username": "developer_01",
  "email": "developer@example.com",
  "password": "password123",
  "age": 24,
  "experience_years": 2
}
```

Validasi:

- `username`: 3-50 karakter, hanya huruf, angka, dan underscore.
- `email`: format email valid, maksimal 255 karakter.
- `password`: 8-128 karakter.
- `age`: integer 13-100.
- `experience_years`: angka 0-80.

Contoh response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "user-uuid",
    "token": "jwt-token"
  }
}
```

### Login

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "developer@example.com",
  "password": "password123"
}
```

Contoh response:

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user_id": "user-uuid",
    "token": "jwt-token"
  }
}
```

### Change Password

```http
PATCH /api/auth/change-password
Authorization: Bearer <token>
```

Endpoint ini mengganti password user yang sedang login. Password lama wajib dikirim sebagai re-authentication untuk aksi sensitif ini.

Request body:

```json
{
  "current_password": "password123",
  "new_password": "newpassword123"
}
```

Validasi:

- `current_password`: wajib diisi, maksimal 128 karakter.
- `new_password`: 8-128 karakter.
- `new_password` harus berbeda dari `current_password`.
- Konfirmasi password dilakukan di frontend, bukan di backend.

Contoh response:

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "user_id": "user-uuid",
    "token": "new-jwt-token"
  }
}
```

Setelah password berhasil diganti, backend akan menaikkan versi token user. Token lama otomatis tidak valid untuk endpoint yang membutuhkan autentikasi, sehingga client harus menggunakan token baru dari response ini.

### Get Profile

```http
GET /api/profile
Authorization: Bearer <token>
```

Contoh response:

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "user_id": "user-uuid",
    "username": "developer_01",
    "email": "developer@example.com",
    "age": 24,
    "experience_years": 2,
    "created_at": "2026-05-23T00:00:00.000Z"
  }
}
```

### Update Profile

```http
PATCH /api/profile
Authorization: Bearer <token>
```

Request body dapat berisi salah satu atau beberapa field berikut:

```json
{
  "username": "developer_02",
  "email": "developer2@example.com",
  "age": 25,
  "experience_years": 3
}
```

Minimal satu field harus dikirim. Validasi field sama seperti register.

### Delete Profile

```http
DELETE /api/profile
Authorization: Bearer <token>
```

Endpoint ini menghapus user yang sedang login beserta seluruh riwayat prediksinya.

Contoh response:

```json
{
  "success": true,
  "message": "Profile deleted successfully",
  "data": null
}
```

### Create Prediction

```http
POST /api/predictions
Authorization: Bearer <token>
```

Request body:

```json
{
  "daily_work_hours": 8,
  "sleep_hours": 6.5,
  "caffeine_intake": 200,
  "bugs_per_day": 5,
  "commits_per_day": 3,
  "meetings_per_day": 4,
  "screen_time": 10,
  "exercise_hours": 0.5,
  "stress_level": 70
}
```

Validasi:

| Field | Tipe | Range |
| --- | --- | --- |
| `daily_work_hours` | number | 0-24 |
| `sleep_hours` | number | 0-24 |
| `caffeine_intake` | integer | 0-2000 |
| `bugs_per_day` | integer | 0-1000 |
| `commits_per_day` | integer | 0-1000 |
| `meetings_per_day` | integer | 0-100 |
| `screen_time` | number | 0-24 |
| `exercise_hours` | number | 0-24 |
| `stress_level` | number | 0-100 |

Backend akan mengambil `age` dan `experience_years` dari profil user yang sedang login, lalu mengirim payload gabungan ke service DL.

Contoh response:

```json
{
  "success": true,
  "message": "Prediction created successfully",
  "data": {
    "prediction_id": "prediction-uuid",
    "prediction": {
      "burnout_level": "medium",
      "confidence": 0.87,
      "stress_estimate": 68.5,
      "probabilities": {
        "low": 0.1,
        "medium": 0.87,
        "high": 0.03
      }
    },
    "advice": "Kurangi meeting beruntun dan tambah waktu istirahat."
  }
}
```

### Get Prediction History

```http
GET /api/predictions
Authorization: Bearer <token>
```

Contoh response:

```json
{
  "success": true,
  "message": "Prediction history fetched successfully",
  "data": [
    {
      "prediction_id": "prediction-uuid",
      "daily_work_hours": 8,
      "sleep_hours": 6.5,
      "caffeine_intake": 200,
      "bugs_per_day": 5,
      "commits_per_day": 3,
      "meetings_per_day": 4,
      "screen_time": 10,
      "exercise_hours": 0.5,
      "stress_level": 70,
      "prediction": {
        "burnout_level": "medium",
        "confidence": 0.87,
        "stress_estimate": 68.5,
        "probabilities": {
          "low": 0.1,
          "medium": 0.87,
          "high": 0.03
        }
      },
      "advice": "Kurangi meeting beruntun dan tambah waktu istirahat.",
      "created_at": "2026-05-23T00:00:00.000Z"
    }
  ]
}
```

Riwayat dikembalikan dari prediksi terbaru ke terlama.

## Integrasi Service DL

Backend memanggil service DL melalui:

```text
<DL_API_URL>/<DL_PREDICT_PATH>
```

Dengan konfigurasi default lokal:

```text
http://localhost:8000/predict_burnout
```

Payload yang dikirim backend ke service DL:

```json
{
  "age": 24,
  "experience_years": 2,
  "daily_work_hours": 8,
  "sleep_hours": 6.5,
  "caffeine_intake": 200,
  "bugs_per_day": 5,
  "commits_per_day": 3,
  "meetings_per_day": 4,
  "screen_time": 10,
  "exercise_hours": 0.5,
  "stress_level": 70
}
```

Response yang diharapkan dari service DL:

```json
{
  "prediction": {
    "burnout_level": "medium",
    "confidence": 0.87,
    "stress_estimate": 68.5,
    "probabilities": {
      "low": 0.1,
      "medium": 0.87,
      "high": 0.03
    }
  },
  "advice": "Kurangi meeting beruntun dan tambah waktu istirahat."
}
```

Jika response tidak sesuai shape tersebut, backend akan mengembalikan error `502`.

## Troubleshooting

### Database tidak bisa terkoneksi

- Pastikan PostgreSQL berjalan.
- Pastikan `DATABASE_URL` sesuai host, port, username, password, dan nama database.
- Untuk Docker, gunakan host `postgres` pada `DATABASE_URL`, bukan `localhost`.
- Jalankan migration sebelum memakai endpoint yang mengakses database.

### `JWT secret is not configured`

- Pastikan `JWT_SECRET` sudah diisi di `.env` atau `.env.docker`.
- Gunakan secret panjang dan acak untuk environment non-development.

### Service DL tidak tersedia

- Pastikan service DL berjalan dan dapat diakses dari backend.
- Untuk lokal tanpa Docker, default `DL_API_URL` adalah `http://localhost:8000`.
- Untuk Docker, default `DL_API_URL` adalah `http://host.docker.internal:8000`.
- Jika endpoint prediksi berbeda, sesuaikan `DL_PREDICT_PATH`.

### Terkena rate limit

Backend membatasi request menjadi 100 request per 15 menit per client. Jika menerima pesan `Too many requests, please try again later`, tunggu beberapa saat sebelum mencoba lagi.
