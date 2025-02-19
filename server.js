const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());


app.use(express.static(path.join(__dirname, 'public')));

let logs = [];


app.post('/api/log', (req, res) => {
    logs.push(req.body);
    console.log('Yeni ziyaretçi kaydedildi:', req.body);
    res.json({ message: 'Veri alındı!' });
});


app.get('/api/getLogs', (req, res) => {
    res.json(logs);
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log('Sunucu 3000 portunda çalışıyor...'));
