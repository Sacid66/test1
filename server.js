const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());


app.use(express.static(path.join(__dirname, 'public')));


const LOG_FILE = path.join(__dirname, 'logs.json');


function loadLogs() {
  if (fs.existsSync(LOG_FILE)) {
    const data = fs.readFileSync(LOG_FILE, 'utf8');
    return JSON.parse(data);
  }
  return [];
}


function saveLogs(logs) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
}


let logs = loadLogs();


app.post('/api/log', (req, res) => {
  logs.push(req.body);
  console.log('Yeni ziyaretçi kaydedildi:', req.body);

  
  saveLogs(logs);

  res.json({ message: 'Veri alındı!' });
});


app.get('/api/getLogs', (req, res) => {
  res.json(logs);
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor... http://localhost:3000');
});
