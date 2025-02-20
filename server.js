const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());

// Sadece izin verilen IP
const allowedIP = '46.221.94.247';
// Bloke edilmiş IP'leri tutan obje
const blockedIPs = {};

// Tüm isteklere uygulanan IP kontrol middleware’i
app.use((req, res, next) => {
  let clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  // IPv6 formatındaki "::ffff:" önekini kaldır
  if (clientIP.startsWith("::ffff:")) {
    clientIP = clientIP.replace("::ffff:", "");
  }

  // Eğer izin verilen IP ise, devam et
  if (clientIP === allowedIP) {
    return next();
  } else {
    // Eğer bu IP daha önce uyarıldıysa, 404 Not Found döndür
    if (blockedIPs[clientIP]) {
      return res.status(404).send('Not Found');
    } else {
      // İlk erişimde uyarı mesajı göster, ip'yi bloke et
      blockedIPs[clientIP] = true;
      return res.send(`
        <html>
          <head>
            <meta charset="utf-8">
            <script>alert('uzak dur');</script>
          </head>
          <body></body>
        </html>
      `);
    }
  }
});

// Public klasörünü statik olarak servise aç
app.use(express.static(path.join(__dirname, 'public')));

let logs = [];

// Kullanıcıdan gelen veriyi al ve kaydet
app.post('/api/log', (req, res) => {
    logs.push(req.body);
    console.log('Yeni ziyaretçi kaydedildi:', req.body);
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

app.listen(3000, () => console.log('Sunucu 3000 portunda çalışıyor...'));
