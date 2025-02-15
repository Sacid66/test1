const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());

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

app.listen(3000, () => console.log('Sunucu 3000 portunda çalışıyor... http://localhost:3000'));
