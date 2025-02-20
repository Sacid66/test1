const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());

const ALLOWED_IP = '46.221.94.247';
let blockedIPs = new Set();

// IP kontrolü için middleware
app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (clientIP === ALLOWED_IP) {
        next();
    } else if (blockedIPs.has(clientIP)) {
        res.status(404).send('Not Found');
    } else {
        blockedIPs.add(clientIP);
        res.send(`
            <script>
                alert('Uzak dur');
                window.location.href = '/blocked';
            </script>
        `);
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

// Blocked route
app.get('/blocked', (req, res) => {
    res.status(404).send('Not Found');
});

// Varsayılan olarak index.html göster
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log('Sunucu 3000 portunda çalışıyor...'));
