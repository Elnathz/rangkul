# Sprint 3 E2E Test Plan: Handling Race Conditions & Idempotency

Dokumen ini menjelaskan skenario pengujian E2E (End-to-End) untuk fitur yang dibangun atau diperbaiki pada Sprint 3, khususnya mengenai race condition dan idempotency.

## 1. Task Cancellation & Refund Atomicity

**Deskripsi:**
Pengguna dapat membatalkan tugas. Jika tugas sudah dalam status `dikonfirmasi` dan pembayaran berada dalam status `held_escrow`, sistem harus melakukan refund 50% via Midtrans dan memberikan kompensasi kepada Helper. Ini rentan terhadap race condition jika dua perangkat mencoba membatalkan secara bersamaan.

**Skenario:**
1. **Normal Flow**: Keluarga membatalkan tugas (status: dikonfirmasi, pembayaran: held_escrow). Sistem mencatat status `refunding`, menembak Midtrans refund, dan jika berhasil mengubah status menjadi `dibatalkan_kompensasi`.
2. **Concurrent Cancellation (Race Condition)**: Dua user dari akun keluarga yang sama mencoba menekan tombol Batal secara bersamaan (dibantu script k6 atau `Promise.all` di klien).
   - **Ekspektasi:** Permintaan pertama akan mengunci row dan memproses. Permintaan kedua akan masuk ke `prepare_task_cancel_compensation`, tetapi karena status pertama telah menjadi `dibatalkan_kompensasi` atau `refunding`, ia akan mengembalikan status yang aman atau error `409 Conflict`, sehingga gateway refund Midtrans hanya dipanggil satu kali.
3. **Midtrans Failure Recovery**: Jika Midtrans mengembalikan error (timeout/500), API route akan error, tetapi DB tetap dalam status `refunding`.
   - **Ekspektasi:** Request cancel berikutnya akan melanjutkan proses yang sama.

## 2. Payment Checkout Idempotency

**Deskripsi:**
Keluarga menekan tombol "Bayar". Sistem akan mencatat row `payments` dengan status `pending` dan token Midtrans. Jika dua klik terjadi bersamaan, Midtrans hanya boleh dipanggil sekali atau dengan `order_id` yang konsisten.

**Skenario:**
1. **Normal Flow**: Keluarga membuat pembayaran. DB mencatat intent (pending) dan mengembalikan checkout URL dari Midtrans.
2. **Concurrent Checkout (Race Condition)**: Dua tab/window menekan tombol bayar secara bersamaan.
   - **Ekspektasi:** Permintaan pertama mengunci tabel tasks dan memanggil `prepare_midtrans_payment_intent` untuk insert/update `payment` dengan token `null`. Permintaan kedua membaca `payment` yang belum memiliki token, sehingga mengembalikan state yang ada. Kedua request akhirnya menggunakan `order_id` yang sama dari DB saat memanggil Midtrans. Token disimpan dengan `save_midtrans_snap_token` tanpa tumpang tindih.

## 3. Chat Isolation by Task

**Deskripsi:**
Keluarga, Helper, atau Koordinator berkomunikasi menggunakan chat. Pesan sekarang dikunci berdasarkan `task_id` untuk memastikan ruang obrolan tertutup dan sesuai konteks.

**Skenario:**
1. **Inbox Grouping**: Pastikan Inbox UI mengelompokkan pesan berdasarkan `task_id`, bukan hanya `user_id`. (Satu keluarga bisa memiliki dua tugas dengan helper yang sama di dua chatroom yang berbeda).
2. **Realtime Updates**: Saat ada chat baru di `task_id` A, UI di `task_id` B tidak boleh salah membaca notifikasi, berkat filter RLS / channel filter pada `ChatRoomClient.tsx`.

## Kesimpulan

Karena belum ada framework E2E automation (seperti Playwright/Cypress) yang di-setup dalam proyek ini, pengujian saat ini dapat dijalankan menggunakan tes manual (klik serentak pada UI) atau skrip cURL/k6 yang di-_fire_ bersamaan ke API endpoint.
