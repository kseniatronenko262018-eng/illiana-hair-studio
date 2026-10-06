const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const MONO_TOKEN = 'mF4VYm_rjXjOAAAF1FJJ5yw';

// Тимчасове сховище для вихідних днів (у пам'яті сервера)
let blockedDays = [];

// API: Отримати список вихідних днів
app.get('/api/blocked-days', (req, res) => {
    res.json(blockedDays);
});

// API: Майстер додає вихідний день
app.post('/api/block-day', (req, res) => {
    const { date, password } = req.body;
    // Простий захист паролем для майстра (можете змінити 'admin123' на свій пароль)
    if (password !== 'admin123') {
        return res.status(403).json({ error: 'Невірний пароль майстра!' });
    }
    if (date && !blockedDays.includes(date)) {
        blockedDays.push(date);
    }
    res.json({ success: true, blockedDays });
});

// API: Майстер видаляє вихідний день (робить знову робочим)
app.post('/api/unblock-day', (req, res) => {
    const { date, password } = req.body;
    if (password !== 'admin123') {
        return res.status(403).json({ error: 'Невірний пароль майстра!' });
    }
    blockedDays = blockedDays.filter(d => d !== date);
    res.json({ success: true, blockedDays });
});

// Створення інвойсу на оплату (500 грн)
app.post('/api/create-invoice', async (req, res) => {
    try {
        const { name, date, time } = req.body;

        const response = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Token": MONO_TOKEN
            },
            body: JSON.stringify({
                amount: 50000, // 500 грн у копійках
                ccy: 980,
                merchantPaymInfo: {
                    destination: "Zavdatok za poslugu (FOP Yavir I.V.)",
                    comment: `Zapis klienta ${name} na ${date} o ${time}`
                },
                redirectUrl: req.headers.referer || "https://render.com",
                webHookUrl: "https://example.com/webhook"
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Pomylka pry stvorenni invoisu:", error);
        res.status(500).json({ error: "Ne vdalosya stvoryty platizh" });
    }
});

// Перевірка статусу інвойсу
app.post('/api/check-invoice', async (req, res) => {
    try {
        const { invoiceId } = req.body;
        const response = await fetch(`https://api.monobank.ua/api/merchant/invoice/status?invoiceId=${invoiceId}`, {
            method: "GET",
            headers: {
                "X-Token": MONO_TOKEN
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Pomylka pervirky statusu:", error);
        res.status(500).json({ error: "Ne vdalosya perviryty status" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server zapusheno na portu ${PORT}`);
});
