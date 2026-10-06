// --- СИНХРОНІЗАЦІЯ ВИХІДНИХ ТА БЛОКУВАННЯ ДНІВ ---
let blockedDaysCache = [];

async function loadBlockedDays() {
    try {
        let response = await fetch('/api/blocked-days');
        let data = await response.json();
        blockedDaysCache = data || [];
    } catch (e) {
        console.error("Не вдалося завантажити вихідні дні:", e);
    }
}

// Завантажуємо вихідні одразу при старті сторінки
loadBlockedDays();

function isDayBlocked(dateString) {
    return blockedDaysCache.includes(dateString);
}

// Функція блокування/розблокування дня з кабінету майстра
async function toggleBlockSelectedDate() {
    const dateInput = document.getElementById('clientDate'); 
    if (!dateInput || !dateInput.value) {
        alert("Будь ласка, оберіть дату у календарі!");
        return;
    }
    
    let targetDate = dateInput.value;
    let password = prompt("Введіть PIN-код майстра для зміни статусу дня (за замовчуванням 1988):");
    if (!password) return;

    let endpoint = isDayBlocked(targetDate) ? '/api/unblock-day' : '/api/block-day';

    try {
        let response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: targetDate, password: password })
        });

        let result = await response.json();
        if (response.ok && result.success) {
            blockedDaysCache = result.blockedDays;
            alert(isDayBlocked(targetDate) ? "День успішно заблоковано (вихідний)!" : "День знову зроблено робочим!");
            // Якщо відкритий календар майстра — оновлюємо відображення
            if (typeof renderCalendar === 'function') renderCalendar();
        } else {
            alert(result.error || "Помилка при зміні статусу дня.");
        }
    } catch (e) {
        console.error("Помилка:", e);
        alert("Не вдалося зв'язатися з сервером.");
    }
}


// --- ОСНОВНА ЛОГІКА БРОНЮВАННЯ ТА ОПЛАТИ ---

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

    // Перевірка, чи не обрав клієнт заблокований майстром день
    if (isDayBlocked(date)) {
        alert("На жаль, обраний день є вихідним у майстра. Будь ласка, оберіть іншу дату.");
        return;
    }

    let isNewClient = checkIsClientNew(phone);
    let depositPaid = false;

    if (isNewClient) {
        let payAction = confirm(
            `✨ Увага, ${name}!\n\n` +
            `Для нових клієнтів обов'язковий завдаток 500 ₴ (ФОП Явір Ілліяна Володимирівна).\n\n` +
            `Натисніть "OK", щоб перейти до оплати через еквайринг Monobank.`
        );
        
        if (!payAction) {
            alert("Бронювання скасовано.");
            return;
        }

        // Запит до бекенду на Render для створення рахунку
        try {
            let response = await fetch("/api/create-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, date, time: selectedTimeSlot })
            });

            let result = await response.json();
            
            if (result && result.pageUrl && result.invoiceId) {
                localStorage.setItem('currentInvoiceId', result.invoiceId);
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

        let confirmPaid = confirm(
            `💳 Після здійснення оплати 500 ₴ у новій вкладці поверніться сюди.\n\n` +
            `Чи завершили ви оплату?\n` +
            `Натисніть "OK", щоб підтвердити та зберегти запис.`
        );
        
        if (!confirmPaid) {
            alert("Запис не збережено, оскільки оплату не підтверджено.");
            return;
        }

        const invoiceId = localStorage.getItem('currentInvoiceId');
        if (invoiceId) {
            try {
                let statusRes = await fetch("/api/check-invoice", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoiceId })
                });
                let statusData = await statusRes.json();
                
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

    // Зберігаємо локально у браузері
    saveBookingToStorage(newBooking);

    // ІНТЕГРАЦІЯ: відправляємо запит на сервер, щоб майстер одразу бачив його в CRM
    try {
        await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBooking)
        });
    } catch (e) {
        console.error("Помилка синхронізації запису з сервером:", e);
    }

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
