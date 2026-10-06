const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const MONO_TOKEN = 'mF4VYm_rjXjOAAAF1FJJ5yw';

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

// Перевірка статусу інвойсу (виправляє помилку «Запис не підтверджено»)
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
