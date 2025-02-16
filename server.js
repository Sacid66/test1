const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// Public klasörünü statik olarak servise aç
app.use(express.static(path.join(__dirname, 'public')));

// Log verilerini saklayacağımız dosya
const LOG_FILE = path.join(__dirname, 'logs.json');

// logs.json dosyası varsa içindeki verileri belleğe yükle, yoksa boş dizi
function loadLogs() {
  if (fs.existsSync(LOG_FILE)) {
    const data = fs.readFileSync(LOG_FILE, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

// Bellekteki logs dizisini dosyaya yazar
function saveLogs(logs) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
}

// Uygulama başlarken logs.json içeriğini belleğe al
let logs = loadLogs();

// Kullanıcıdan gelen veriyi al ve kaydet
app.post('/api/log', (req, res) => {
  logs.push(req.body);
  console.log('Yeni ziyaretçi kaydedildi:', req.body);

  // Her yeni kayıt geldiğinde logs.json güncellenir
  saveLogs(logs);

  res.json({ message: 'Veri alındı!' });
});

// Kaydedilen verileri döndür
app.get('/api/getLogs', (req, res) => {
  res.json(logs);
});

// Varsayılan olarak index.html göster
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sunucu başlat
app.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor... http://localhost:3000');
});
