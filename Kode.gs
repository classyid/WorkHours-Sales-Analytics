/**
 * Konfigurasi utama untuk script
 */
const CONFIG = {
  // Konfigurasi Spreadsheet
  SPREADSHEET_ID: '<ID-Spreadsheet>',
  SHEET_NAME: '<sheetname>',
  TARGET_MONTH: 9, // September
  TARGET_YEAR: 2024,
  COLUMNS: {
    TIMESTAMP: 0,  // Kolom A
    DURATION: 2,   // Kolom C
    SALES: 3,      // Kolom D
    SALES_STATUS: 5,    // Kolom F
    DURATION_STATUS: 6  // Kolom G
  },
  
  // Konfigurasi API WhatsApp 
  API_URL: "https://m-pedia/send-message",
  API_KEY: "<apikey>",
  SENDER_NUMBER: "<sender>",
  RECEIVER_NUMBER: "<noTujuan>",
};

/**
 * Fungsi utama untuk menghitung total jam dan penjualan, kemudian mengirim laporan via WhatsApp
 */
function calculateAndSendReport() {
  try {
    const results = calculateTotalHoursAndSales();
    const message = generateReportMessage(results);
    const response = sendWhatsAppMessage(message);
    
    Logger.log('Laporan berhasil dikirim via WhatsApp');
    Logger.log('Response API: ' + response.getContentText());
    
    return {
      calculationResults: results,
      whatsappResponse: response.getContentText()
    };
  } catch (error) {
    Logger.log('Error dalam calculateAndSendReport: ' + error.message);
    throw error;
  }
}

/**
 * Fungsi untuk mengirim pesan melalui WhatsApp
 * @param {string} message - Pesan yang akan dikirim
 * @returns {HTTPResponse} Response dari API WhatsApp
 */
function sendWhatsAppMessage(message) {
  const payload = {
    api_key: CONFIG.API_KEY,
    sender: CONFIG.SENDER_NUMBER,
    number: CONFIG.RECEIVER_NUMBER,
    message: message
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  return UrlFetchApp.fetch(CONFIG.API_URL, options);
}

/**
 * Fungsi untuk menggenerate pesan laporan
 * @param {Object} results - Hasil perhitungan dari calculateTotalHoursAndSales
 * @returns {string} Pesan laporan yang terformat
 */
function generateReportMessage(results) {
  const date = new Date();
  const formattedDate = Utilities.formatDate(date, 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
  
  return `*LAPORAN KINERJA - ${CONFIG.TARGET_MONTH}/${CONFIG.TARGET_YEAR}*
  
📅 Waktu Laporan: ${formattedDate}

⏱️ *Total Durasi Kerja*
• ${results.hours} Jam ${results.minutes} Menit
• Total: ${results.totalMinutes} Menit

💰 *Total Penjualan*
Rp ${formatCurrency(results.totalSales)}

📊 *Statistik Proses*
• Baris Diproses: ${results.processedRows}
• Baris Dilewati: ${results.skippedRows}

_Laporan ini dibuat otomatis oleh sistem_`;
}

/**
 * Fungsi untuk memformat angka ke format mata uang
 * @param {number} amount - Jumlah yang akan diformat
 * @returns {string} String format mata uang
 */
function formatCurrency(amount) {
  return amount.toLocaleString('id-ID');
}

/**
 * Fungsi utama untuk menghitung total jam dan penjualan
 * @returns {Object} Object berisi hasil perhitungan
 */
function calculateTotalHoursAndSales() {
  try {
    // Inisialisasi spreadsheet
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                               .getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      throw new Error('Sheet tidak ditemukan!');
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      throw new Error('Data kosong atau hanya berisi header!');
    }

    let totalMinutes = 0;
    let totalSales = 0;
    let processedRows = 0;
    let skippedRows = 0;

    // Proses setiap baris data, skip baris header
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const date = parseTimestamp(row[CONFIG.COLUMNS.TIMESTAMP]);

      // Skip jika timestamp invalid atau bukan target bulan/tahun
      if (!date || !isTargetDate(date)) {
        skippedRows++;
        continue;
      }

      // Proses durasi
      const durationResult = processDuration(row[CONFIG.COLUMNS.DURATION]);
      sheet.getRange(i + 1, CONFIG.COLUMNS.DURATION_STATUS + 1)
           .setValue(durationResult.status);
      
      if (durationResult.minutes) {
        totalMinutes += durationResult.minutes;
      }

      // Proses penjualan
      const salesResult = processSales(row[CONFIG.COLUMNS.SALES]);
      sheet.getRange(i + 1, CONFIG.COLUMNS.SALES_STATUS + 1)
           .setValue(salesResult.status);
      
      if (salesResult.value) {
        totalSales += salesResult.value;
      }

      processedRows++;
    }

    // Hitung hasil akhir
    const results = {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
      totalMinutes: totalMinutes,
      totalSales: totalSales,
      processedRows: processedRows,
      skippedRows: skippedRows
    };

    // Log hasil
    Logger.log('Hasil Perhitungan:');
    Logger.log(`Total Durasi: ${results.hours} Jam ${results.minutes} Menit`);
    Logger.log(`Total Penjualan: ${results.totalSales}`);
    Logger.log(`Baris yang diproses: ${results.processedRows}`);
    Logger.log(`Baris yang dilewati: ${results.skippedRows}`);

    return results;

  } catch (error) {
    Logger.log('Error dalam calculateTotalHoursAndSales: ' + error.message);
    throw error;
  }
}

/**
 * Parse timestamp dari format string ke Date object
 * @param {string|Date} timestamp - Timestamp yang akan diparsing
 * @returns {Date|null} Date object atau null jika invalid
 */
function parseTimestamp(timestamp) {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  try {
    if (typeof timestamp !== 'string') {
      return null;
    }

    const [date, time] = timestamp.split(' ');
    if (!date || !time) {
      return null;
    }

    const [day, month, year] = date.split('/');
    const [hour, minute, second] = time.split(':');
    
    const parsedDate = new Date(year, month - 1, day, hour, minute, second);
    
    return isNaN(parsedDate.getTime()) ? null : parsedDate;

  } catch (error) {
    Logger.log(`Error parsing timestamp: ${timestamp}`);
    return null;
  }
}

/**
 * Cek apakah tanggal sesuai dengan target bulan dan tahun
 * @param {Date} date - Tanggal yang akan dicek
 * @returns {boolean} True jika sesuai target
 */
function isTargetDate(date) {
  return date.getMonth() + 1 === CONFIG.TARGET_MONTH && 
         date.getFullYear() === CONFIG.TARGET_YEAR;
}

/**
 * Proses dan validasi string durasi
 * @param {string} durationText - Text durasi yang akan diproses
 * @returns {Object} Object berisi status dan total menit
 */
function processDuration(durationText) {
  if (typeof durationText !== 'string') {
    return {
      status: 'Invalid Duration Format',
      minutes: 0
    };
  }

  // Pattern untuk "X Jam Y Menit" atau "X Jam"
  const hourMinutePattern = /(\d+)\s*Jam\s*(\d*)\s*Menit?/i;
  // Pattern untuk "X Menit"
  const minuteOnlyPattern = /(\d+)\s*Menit/i;

  // Coba match dengan pattern jam dan menit
  let match = durationText.match(hourMinutePattern);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return {
      status: 'Valid',
      minutes: (hours * 60) + minutes
    };
  }

  // Coba match dengan pattern menit saja
  match = durationText.match(minuteOnlyPattern);
  if (match) {
    return {
      status: 'Valid',
      minutes: parseInt(match[1], 10)
    };
  }

  return {
    status: 'Invalid Duration',
    minutes: 0
  };
}

/**
 * Proses dan validasi nilai penjualan
 * @param {string} salesText - Text penjualan yang akan diproses
 * @returns {Object} Object berisi status dan nilai penjualan
 */
function processSales(salesText) {
  // Cek input kosong atau strip
  if (typeof salesText !== 'string' || !salesText || salesText === '-') {
    return {
      status: 'Missing Sales Data',
      value: 0
    };
  }

  try {
    // Bersihkan format angka
    const cleanedSales = salesText.replace(/\./g, '')  // Hapus separator ribuan
                                .replace(',', '.')      // Ganti koma desimal dengan titik
                                .trim();
    
    const salesValue = parseFloat(cleanedSales);

    if (isNaN(salesValue)) {
      return {
        status: 'Invalid Sales Value',
        value: 0
      };
    }

    return {
      status: 'Valid',
      value: salesValue
    };

  } catch (error) {
    Logger.log(`Error processing sales value: ${salesText}`);
    return {
      status: 'Error Processing Sales',
      value: 0
    };
  }
}

/**
 * Fungsi helper untuk mengubah menit ke format jam dan menit
 * @param {number} totalMinutes - Total menit yang akan dikonversi
 * @returns {string} String format "X Jam Y Menit"
 */
function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} Jam ${minutes} Menit`;
}
