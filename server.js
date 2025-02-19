const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());


const ALLOWED_IP = '176.233.24.66';



let blockedIPs = [];

function getClientIP(req) {

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (ip.includes('::ffff:')) {
    return ip.split(':').pop();
  }
  return ip;
}


app.use((req, res, next) => {
  const clientIP = getClientIP(req);


  if (blockedIPs[clientIP] && blockedIPs[clientIP].blocked) {
    return res.status(404).send('404 nf');
  }


  if (clientIP !== ALLOWED_IP) {

    if (blockedIPs[clientIP] && blockedIPs[clientIP].warned) {

      blockedIPs[clientIP].blocked = true;
      return res.status(404).send('404 Not Found');
    } else {

      blockedIPs[clientIP] = { warned: true, blocked: false };
      return res.send('uzak dur');
    }
  }


  next();
});


let logs = [];


app.use(express.static(path.join(__dirname, 'public')));


app.post('/api/log', (req, res) => {
  logs.push(req.body);
  console.log('new visitor:', req.body);
  res.json({ message: 'Veri alındı!' });
});


app.get('/api/getLogs', (req, res) => {
  res.json(logs);
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(3000, () => {
  console.log('working on port 3000');
  console.log(`Sadece ${ALLOWED_IP} can access, other IPs are blocking.`);
});
