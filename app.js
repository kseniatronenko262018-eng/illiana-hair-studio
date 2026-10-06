async function submitBooking() {
    const nameEl = document.getElementById('clientName');
    const phoneEl = document.getElementById('clientPhone');
    const emailEl = document.getElementById('clientEmail');
    const dateEl = document.getElementById('clientDate');
    const socialEl = document.getElementById('clientSocial');
    const srvInput = document.getElementById('selectedServiceInput');

    let name = nameEl ? nameEl.value.trim() : '';
    let phone = phoneEl ? phoneEl.value.trim() : '';
    let email = emailEl ? emailEl.value.trim() : '';
    let date = dateEl ? dateEl.value : '';

    if (!name || !phone || !email || !selectedTimeSlot || !selectedServiceObj) {
        alert("Будь ласка, заповніть ім'я, телефон, email, оберіть послугу та вільний час!");
        return;
    }

    let isNewClient = checkIsClientNew(phone);
    let depositPaid = false;

    if (isNewClient) {
        let payAction = confirm(
            `✨ Увага, ${name}!\n\n` +
            `Для нових клієнтів обов'язковий завдаток 500 ₴ (ФОП Явір Ілліяна Володимирівна)[cite: 1, 5].\n\n` +
            `Натисніть "OK", щоб перейти до оплати через еквайринг Monobank.`
        );
        
        if (!payAction) {
            alert("Бронювання скасовано.");
            return;
        }

        // Запит до нашого бекенду на Render для створення рахунку через API еквайрингу
        try {
            let response = await fetch("/api/create-invoice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, date, time: selectedTimeSlot })
            });

            let result = await response.json();
            
            if (result && result.pageUrl && result.invoiceId) {
                // Зберігаємо invoiceId у пам'яті браузера для перевірки
                localStorage.setItem('currentInvoiceId', result.invoiceId);
                
                // Відкриваємо сторінку оплати Monobank у новій вкладці
                window.open(result.pageUrl, '_blank');
            } else {
                alert("Не вдалося створити платіжне посилання.");
                return;
            }
        } catch (error) {
            console.error("Помилка еквайрингу:", error);
            alert("Сталася помилка при зв'язку з платіжною системою.");
            return;
        }

        // Вікно підтвердження після оплати
        let confirmPaid = confirm(
            `💳 Після здійснення оплати 500 ₴ у новій вкладці поверніться сюди.\n\n` +
            `Чи завершили ви оплату?\n` +
            `Натисніть "OK", щоб підтвердити та зберегти запис.`
        );
        
        if (!confirmPaid) {
            alert("Запис не збережено, оскільки оплату не підтверджено.");
            return;
        }

        // Перевіряємо статус через наш сервер /api/check-invoice
        const invoiceId = localStorage.getItem('currentInvoiceId');
        if (invoiceId) {
            try {
                let statusRes = await fetch("/api/check-invoice", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoiceId })
                });
                let statusData = await statusRes.json();
                
                // Monobank повертає статус 'success' при успішній оплаті
                if (statusData.status === 'success') {
                    depositPaid = true;
                    localStorage.removeItem('currentInvoiceId');
                } else {
                    alert("⚠️ Увага: система бачить, що платіж ще не проведено або скасовано (статус: " + (statusData.status || 'невідомо') + "). Запис збережено у режимі очікування.");
                }
            } catch (err) {
                console.error("Помилка перевірки статусу:", err);
            }
        }
    }

    let hairPhotoBase64 = await readFileAsBase64('clientHairPhoto');
    let refPhotoBase64 = await readFileAsBase64('clientRefPhoto');
    if (!refPhotoBase64 && selectedHaircutRefUrl) refPhotoBase64 = selectedHaircutRefUrl;
    
    let serviceText = srvInput ? srvInput.value : 'Послуга';

    let newBooking = {
        id: 'b_' + Date.now(),
        name: name,
        phone: phone,
        email: email,
        social: socialEl ? socialEl.value : '',
        date: date,
        time: selectedTimeSlot,
        service: serviceText,
        hairPhoto: hairPhotoBase64,
        refPhoto: refPhotoBase64,
        depositPaid: depositPaid,
        status: 'pending'
    };

    saveBookingToStorage(newBooking);

    if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    let botLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=booking_${newBooking.id}`;
    let successMessage = `Дякуємо, ${name}! Запис на ${date} о ${selectedTimeSlot} успішно збережено!\n\n` +
        (depositPaid ? `✅ Завдаток 500 ₴ сплачено та підтверджено.\n\n` : `ℹ Запис зареєстровано.\n\n`) +
        `📱 Зараз ви будете перенаправлені в наш Telegram бот @${TELEGRAM_BOT_USERNAME} для фіксації та нагадувань.`;
    
    alert(successMessage);
    window.open(botLink, '_blank');
    location.reload();
}
