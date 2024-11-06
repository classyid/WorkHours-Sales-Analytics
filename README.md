# WorkHours-Sales-Analytics
Sistem analitik otomatis untuk monitoring durasi kerja dan penjualan dengan integrasi WhatsApp menggunakan Google Apps Script.

## 📋 About
Sistem automasi untuk menganalisis data durasi kerja dan penjualan dari Google Spreadsheet dengan fitur pelaporan otomatis via WhatsApp. Ideal untuk tim sales, freelancer, atau bisnis yang perlu monitoring kinerja secara real-time.

## 🌟 Fitur Utama
- Analisis durasi kerja otomatis
- Perhitungan total penjualan
- Validasi data input
- Pelaporan otomatis via WhatsApp
- Format waktu dan mata uang Indonesia
- Error handling komprehensif
- Logging sistem lengkap

## 🚀 Cara Penggunaan
1. Buat spreadsheet dengan format kolom:
   - Timestamp (Kolom A)
   - Durasi (Kolom C) - Format: "X Jam Y Menit"
   - Penjualan (Kolom D) - Format angka
   - Status Penjualan (Kolom F)
   - Status Durasi (Kolom G)

2. Setup Google Apps Script:
   ```javascript
   const CONFIG = {
     SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',
     SHEET_NAME: 'Sheet1',
     API_KEY: 'YOUR_WHATSAPP_API_KEY',
     SENDER_NUMBER: 'YOUR_SENDER_NUMBER',
     RECEIVER_NUMBER: 'YOUR_RECEIVER_NUMBER'
   };
   ```

3. Deploy script dan atur trigger sesuai kebutuhan

## 📊 Contoh Output WhatsApp
```
*LAPORAN KINERJA - 9/2024*
  
📅 Waktu Laporan: 04/11/2024 10:30:15

⏱️ *Total Durasi Kerja*
• 8 Jam 30 Menit
• Total: 510 Menit

💰 *Total Penjualan*
Rp 15.000.000

📊 *Statistik Proses*
• Baris Diproses: 25
• Baris Dilewati: 2

_Laporan ini dibuat otomatis oleh sistem_
```

## 🛠️ Teknologi
- Google Apps Script
- Google Spreadsheet API
- WhatsApp API (via mpedia)

## 📝 Lisensi
MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan

## 🤝 Kontribusi
Kontribusi sangat diterima! Silakan buat pull request atau laporkan issues.

## 📫 Kontak
- Email: kontak@classy.id
- Website: classy.id
