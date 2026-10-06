const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const MONO_TOKEN = 'mF4VYm_rjXjOAAAF1FJJ5yw';

// Тимчасове сховище для вихідних днів
let blockedDays = [];

// Головна сторінка для клієнтів
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Окрема сторінка кабінету майстра
app.get('/master', (req, res) => {
    res.sendFile(path.join(__dirname, 'master.html'));
});

// API: Отримати список вихідних днів
app.get('/api/blocked-days', (req, res) => {
    res.json(blockedDays);
});

// API: Майстер додає вихідний день
app.post('/api/block-day', (req, res) => {
    const { date, password } = req.body;
    if (password !== '1988') { // Ваш PIN-код
        return res.status(403).json({ error: 'Невірний PIN-код майстра!' });
    }
    if (date && !blockedDays.includes(date)) {
        blockedDays.push(date);
    }
    res.json({ success: true, blockedDays });
});

// API: Майстер знімає вихідний день
app.post('/api/unblock-day', (req, res) => {
    const { date, password } = req.body;
    if (password !== '1988') {
        return res.status(403).json({ error: 'Невірний PIN-код майстра!' });
    }
    blockedDays = blockedDays.filter(d => d !== date);
    res.json({ success: true, blockedDays });
});

// ... (далі ваші маршрути /api/create-invoice та /api/check-invoice залишаються без змін)
