const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const MONO_TOKEN = 'mF4VYm_rjXjOAAAF1FJJ5yw'; //[cite: 1, 4]

// Åíäïî³íò äëÿ ñòâîðåííÿ ïëàòåæó ÷åðåç åêâàéðèíã Monobank
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
                amount: 50000, // 500 ãðí ó êîï³éêàõ
                ccy: 980,
                merchantPaymInfo: {
                    destination: "Çàâäàòîê çà ïîñëóãó (ÔÎÏ ßâ³ð ².Â.)",
                    comment: `Çàïèñ êë³ºíòà ${name} íà ${date} î ${time}`
                },
                redirectUrl: req.headers.referer || "https://render.com",
                webHookUrl: "https://example.com/webhook"
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Ïîìèëêà ïðè ñòâîðåíí³ ³íâîéñó:", error);
        res.status(500).json({ error: "Íå âäàëîñÿ ñòâîðèòè ïëàò³æ" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Ñåðâåð çàïóùåíî íà ïîðòó ${PORT}`);
});
