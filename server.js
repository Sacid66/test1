const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Sadece bu IP tam erişime sahip olsun
const ALLOWED_IP = '176.233.24.66';

// Bellekte engellenen IP'leri tutacağız
// Örnek yapı:
// blockedIPs = {
//   "1.2.3.4": { warned: true, blocked: false }, // ilk uyarı verilmiş ama henüz tamamen block değil
//   "5.6.7.8": { warned: true, blocked: true }   // tamamen engellenmiş
// }
let blockedIPs = [];

// Basit bir IP alma fonksiyonu
// Proxy arkasında iseniz x-forwarded-for kontrolü yapmanız gerekebilir.
function getClientIP(req) {
  // req.socket.remoteAddress genelde "::ffff:1.2.3.4" şeklinde gelebilir, düzenleyebilirsiniz
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // "::ffff:1.2.3.4" durumunda sadece "1.2.3.4" kısmını almak için:
  if (ip.includes('::ffff:')) {
    return ip.split(':').pop();
  }
  return ip;
}

// IP kontrol middleware
app.use((req, res, next) => {
  const clientIP = getClientIP(req);

  // Eğer IP zaten engellenmişse direkt 404
  if (blockedIPs[clientIP] && blockedIPs[clientIP].blocked) {
    return res.status(404).send('404 Not Found');
  }

  // Eğer IP allowed IP değilse
  if (clientIP !== ALLOWED_IP) {
    // Daha önce uyarılmış mı?
    if (blockedIPs[clientIP] && blockedIPs[clientIP].warned) {
      // İkinci kez geldi => tamamen engelle
      blockedIPs[clientIP].blocked = true;
      return res.status(404).send('404 Not Found');
    } else {
      // İlk kez geliyorsa "uzak dur" mesajı
      blockedIPs[clientIP] = { warned: true, blocked: false };
      return res.send('uzak dur');
    }
  }

  // Eğer ALLOWED_IP ise yolumuza devam
  next();
});

// Hafızada log kaydı tutmak için
let logs = [];

// Public klasörünü statik olarak sunuyoruz (index.html, logger.html vb. burada olmalı)
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/log -> Ziyaretçi verisini kaydet
app.post('/api/log', (req, res) => {
  logs.push(req.body);
  console.log('Yeni ziyaretçi kaydedildi:', req.body);
  res.json({ message: 'Veri alındı!' });
});

// GET /api/getLogs -> Kayıtlı verileri döndür
app.get('/api/getLogs', (req, res) => {
  res.json(logs);
});

// Varsayılan olarak index.html gönder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sunucuyu başlat
app.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor...');
  console.log(`Sadece ${ALLOWED_IP} erişebiliyor, diğer IP'ler engelleniyor...`);
});
