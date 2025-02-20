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
    // IPv4 adresini al
    let clientIP = req.ip || req.connection.remoteAddress;
    // IPv6 prefix'ini kaldır
    clientIP = clientIP.replace(/^::ffff:/, '');
    
    console.log('Gelen IP:', clientIP); // Debug için

    if (clientIP === ALLOWED_IP) {
        next();
    } else if (blockedIPs.has(clientIP)) {
        res.sendStatus(404); // Tarayıcının kendi 404 sayfasını göster
    } else {
        blockedIPs.add(clientIP);
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <script>
                        alert('Uzak dur');
                        // Alert kapandıktan sonra blocked sayfasına yönlendir
                        window.location.href = '/blocked';
                    </script>
                </head>
                <body></body>
            </html>
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

// Blocked route - tarayıcının kendi 404 sayfasını göster
app.get('/blocked', (req, res) => {
    res.sendStatus(404);
});

// Varsayılan olarak index.html göster
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log('Sunucu 3000 portunda çalışıyor...'));
