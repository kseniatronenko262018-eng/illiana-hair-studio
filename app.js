// --- ГЛОБАЛЬНІ ЗМІННІ ТА СТАН ---
let currentLang = 'ua';
let currentTheme = 'light';
let selectedMainCat = null;
let selectedBaseCondition = null; // 'natural' або 'colored'
let selectedSubItem = null;
let selectedServiceObj = null;
let selectedTimeSlot = null;
let selectedHaircutRefUrl = '';
let calendarMode = 'month';
let calendarCurrentDate = new Date();
let selectedCalendarDateStr = new Date().toISOString().split('T')[0];

const TELEGRAM_BOT_USERNAME = 'illianahair_bot';
let serverBlockedDays = [];
let serverBookingsList = [];
let regularClientsList = [];

// Повний словник для перекладу UA / EN
const translations = {
    ua: {
        tab_book: "Запис",
        tab_works: "Приклади робіт",
        tab_loc: "Локація",
        profile_sub: "квір хейр стиліст • перукар дніпро",
        profile_bio: "не відрощуй волосся — відрощуй індивідуальність",
        step1: "1. Оберіть категорію послуг",
        cut_title: "Стрижка",
        cut_sub: "1000 ₴ • 1.5 год",
        color_title: "Фарбування",
        color_sub: "Підбір за станом",
        complex_title: "Стрижка + Фарбування коріння",
        complex_sub: "3000 ₴ • 3 год (до 2 см)",
        haircut_ref_title: "✨ Оберіть приклад стрижки (натисніть, щоб обрати як референс):",
        choose_btn: "Обрати",
        ref_selected_notice: "✓ Обрано фото-референс із портфоліо!",
        step2: "2. Історія фарбування волосся:",
        step_len: "Довжина волосся:",
        step3: "3. Доступні послуги:",
        length_label: "Довжина волосся:",
        len_shoulders: "До плечей",
        len_blades: "Від плечей до лопаток",
        len_below: "Нижче лопаток",
        rules_title: "📌 Важливі примітки та правила майстра:",
        rule_1: "Якщо ваше коріння більше 2 см, послуга фарбування вважається первинною відповідно до довжини відрослого волосся.",
        rule_2: "Я не роблю блонд у техніці (AirTouch, балаяж і т. д.).",
        rule_3: "Я не роблю вихід із чорного або рудого.",
        rule_4: "Я не фарбую волосся після біозавивки, ботоксу, кератину.",
        rule_5: "Якщо не знайшли підходящого варіанту — напишіть мені в дірект для консультації.",
        photo_current_label: "4. Завантажте фото вашого волосся:",
        photo_ref_label: "5. Завантажте фото-референс або оберіть з портфоліо вище:",
        selected_service_label: "Обрана послуга та час",
        select_service_placeholder: "Спочатку оберіть категорію вище",
        date_label: "Дата",
        name_label: "Ім'я",
        name_placeholder: "Як звертатись",
        phone_label: "Телефон",
        email_label: "Email (обов'язково)",
        social_label: "Нік / соцмережа",
        slots_label: "Доступні слоти часу (реальний час)",
        slot_notice_init: "⚡ <b>Слот заброньовано на:</b> оберіть послугу та час.",
        deposit_notice: "⚡ <b>Умова броні:</b> Завдаток <b>500 грн</b> підтверджує запис.",
        policy_text: "⚠️ <b>Правила скасування:</b> Зміна або скасування можливі не пізніш ніж за 48 годин.<br>📄 Оформлюючи запис, ви погоджуєтесь із умовами <a href=\"javascript:void(0)\" onclick=\"openOffer()\">Публічного договору оферти</a>.",
        pay_btn: "Сплатити завдаток 500 ₴ та забронювати",
        modal_title: "Публічний договір оферти",
        modal_btn: "Зрозуміло",
        loc_info: "📍 <b>Локація:</b> м. Дніпро, вул. Володимира Вернадського, 35-Б.<br><br>Приватний простір, мінімалізм та фокус на якості.",
        map_btn: "Відкрити в Google Maps"
    },
    en: {
        tab_book: "Booking",
        tab_works: "Works",
        tab_loc: "Location",
        profile_sub: "queer hair stylist • dnipro hairdresser",
        profile_bio: "don't grow your hair — grow your individuality",
        step1: "1. Select service category",
        cut_title: "Haircut",
        cut_sub: "1000 UAH • 1.5 hrs",
        color_title: "Coloring",
        color_sub: "Consultation based",
        complex_title: "Haircut + Root Coloring",
        complex_sub: "3000 UAH • 3 hrs (up to 2 cm)",
        haircut_ref_title: "✨ Select a haircut example (click to choose as reference):",
        choose_btn: "Select",
        ref_selected_notice: "✓ Reference photo selected from portfolio!",
        step2: "2. Hair coloring history:",
        step_len: "Hair length:",
        step3: "3. Available services:",
        length_label: "Hair length:",
        len_shoulders: "Shoulder length",
        len_blades: "Shoulder to blades",
        len_below: "Below blades",
        rules_title: "📌 Important notes & master's rules:",
        rule_1: "If your roots are more than 2 cm, coloring is considered primary based on regrown length.",
        rule_2: "I do not do blonding techniques (AirTouch, balayage, etc.).",
        rule_3: "I do not transition clients out of black or red hair.",
        rule_4: "I do not dye hair after bio-perm, botox, or keratin treatments.",
        rule_5: "If you didn't find a suitable option — message me on direct for consultation.",
        photo_current_label: "4. Upload a photo of your hair:",
        photo_ref_label: "5. Upload a reference photo or pick from archive above:",
        selected_service_label: "Selected service & time",
        select_service_placeholder: "First select a category above",
        date_label: "Date",
        name_label: "Name",
        name_placeholder: "How to address you",
        phone_label: "Phone",
        email_label: "Email (required)",
        social_label: "Social / Nickname",
        slots_label: "Available time slots (real time)",
        slot_notice_init: "⚡ <b>Slot status:</b> select service and time.",
        deposit_notice: "⚡ <b>Deposit rule:</b> <b>500 UAH</b> deposit confirms booking.",
        policy_text: "⚠️ <b>Cancellation policy:</b> Changes or cancellations are allowed up to 48 hours in advance.<br>📄 By booking, you agree to the terms of the <a href=\"javascript:void(0)\" onclick=\"openOffer()\">Public Offer Agreement</a>.",
        pay_btn: "Pay deposit 500 UAH & Book",
        modal_title: "Public Offer Agreement",
        modal_btn: "Understood",
        loc_info: "📍 <b>Location:</b> Dnipro, Volodymyra Vernadskoho St, 35-Б.<br><br>Private space, minimalism and focus on quality.",
        map_btn: "Open in Google Maps"
    }
};

// Функції управління модальним вікном оферти
function openOffer() {
    const modal = document.getElementById('offerModal');
    if (modal) modal.style.display = 'flex';
}

function closeOffer() {
    const modal = document.getElementById('offerModal');
    if (modal) modal.style.display = 'none';
}

function openLightbox(url) { 
    let img = document.getElementById('lightboxImage');
    let modal = document.getElementById('imageLightboxModal');
    if(img && modal) { img.src = url; modal.style.display = 'flex'; }
}

function closeLightbox() { 
    let modal = document.getElementById('imageLightboxModal');
    if(modal) modal.style.display = 'none'; 
}

async function syncServerData() {
    try {
        let resBlocks = await fetch('/api/blocked-days');
        serverBlockedDays = await resBlocks.json() || [];
    } catch (e) { console.error("Помилка завантаження вихідних:", e); }

    try {
        let resBooks = await fetch('/api/bookings');
        serverBookingsList = await resBooks.json() || [];
    } catch (e) { console.error("Помилка завантаження записів:", e); }

    try {
        regularClientsList = JSON.parse(localStorage.getItem('illiana_regular_clients') || '[]');
    } catch (e) { regularClientsList = []; }
}

window.onload = async function() {
    await syncServerData();

    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('clientDate');
    if (dateInput) dateInput.value = today;

    const statsMonth = document.getElementById('statsMonthInput');
    if (statsMonth) {
        let now = new Date();
        let year = now.getFullYear();
        let month = String(now.getMonth() + 1).padStart(2, '0');
        statsMonth.value = `${year}-${month}`;
    }

    renderTimeSlots();
    loadExpensesFromStorage();
    updateDashboardStats();
    renderRegularClientsList();
    
    let savedBg = localStorage.getItem('illiana_custom_bg');
    const bgImgEl = document.getElementById('bgImageElement');
    if (bgImgEl && savedBg) bgImgEl.src = savedBg;
};

function toggleLang() {
    currentLang = currentLang === 'ua' ? 'en' : 'ua';
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.innerText = currentLang.toUpperCase() + ' / ' + (currentLang === 'ua' ? 'EN' : 'UA');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        let key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        let key = el.getAttribute('data-i18n-html');
        if (translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        let key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            el.setAttribute('placeholder', translations[currentLang][key]);
        }
    });

    if (selectedMainCat === 'color') {
        renderColorBaseSelection();
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.innerText = currentTheme === 'dark' ? '☀️ / 🌙' : '🌙 / ☀️';
}

function switchTab(tabName, el) {
    document.querySelectorAll('.section-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.quick-nav .nav-chip').forEach(c => c.classList.remove('active'));
    
    if (tabName === 'book') {
        let pane = document.getElementById('paneBook');
        if (pane) pane.classList.add('active');
    }
    if (tabName === 'works') {
        let pane = document.getElementById('paneWorks');
        if (pane) pane.classList.add('active');
    }
    if (tabName === 'loc') {
        let pane = document.getElementById('paneLoc');
        if (pane) pane.classList.add('active');
    }
    
    if (el) el.classList.add('active');
}

// ПРАЙС ТА СТРУКТУРА ПОСЛУГ ДЛЯ ФАРБУВАННЯ
const coloringPrices = {
    natural: {
        shoulders: [
            { id: 'nat_roots_s', title: 'Корінь (до 2 см)', price: 2500, duration: 150 },
            { id: 'nat_blond_s', title: 'Тотал блонд / яскраве (до плечей)', price: 5000, duration: 240 },
            { id: 'nat_ton_s', title: 'Однотон / тонування (до плечей)', price: 3000, duration: 120 }
        ],
        blades: [
            { id: 'nat_roots_b', title: 'Корінь (до 2 см)', price: 2500, duration: 150 },
            { id: 'nat_blond_b', title: 'Тотал блонд / яскраве (від плечей до лопаток)', price: 7000, duration: 300 },
            { id: 'nat_ton_b', title: 'Однотон / тонування (від плечей до лопаток)', price: 3500, duration: 150 }
        ],
        below: [
            { id: 'nat_roots_bl', title: 'Корінь (до 2 см)', price: 2500, duration: 150 },
            { id: 'nat_blond_bl', title: 'Тотал блонд / яскраве (нижче лопаток)', price: 9500, duration: 360 },
            { id: 'nat_ton_bl', title: 'Однотон / тонування (нижче лопаток)', price: 5000, duration: 180 }
        ]
    },
    colored: {
        shoulders: [
            { id: 'col_roots_s', title: 'Корінь (до 2 см)', price: 2500, duration: 150 },
            { id: 'col_ton_s', title: 'Однотон / тонування (до плечей)', price: 3000, duration: 120 }
        ],
        blades: [
            { id: 'col_roots_b', title: 'Корінь (до 2 см)', price: 2500, duration: 150 },
            { id: 'col_ton_b', title: 'Однотон / тонування (від плечей до лопаток)', price: 3500, duration: 150 }
        ],
        below: [
            { id: 'col_roots_bl', title: 'Корінь (до 2 см)', price: 2500, duration: 150 },
            { id: 'col_ton_bl', title: 'Однотон / тонування (нижче лопаток)', price: 5000, duration: 180 }
        ]
    }
};

function selectMainCategory(cat) {
    selectedMainCat = cat;
    selectedBaseCondition = null;
    selectedServiceObj = null;

    const cardCut = document.getElementById('mainCardCut');
    const cardColor = document.getElementById('mainCardColor');
    const cardComplex = document.getElementById('mainCardComplex');
    
    if (cardCut) cardCut.classList.remove('selected');
    if (cardColor) cardColor.classList.remove('selected');
    if (cardComplex) cardComplex.classList.remove('selected');

    const subMenu = document.getElementById('categorySubmenu');
    const colorSub = document.getElementById('coloringSubOptions');
    const photoSec = document.getElementById('photoUploadSection');
    const haircutExamples = document.getElementById('haircutExamplesSection');

    if (subMenu) subMenu.classList.remove('visible');
    if (colorSub) colorSub.classList.remove('visible');
    if (photoSec) photoSec.classList.remove('visible');
    if (haircutExamples) haircutExamples.style.display = 'none';

    if (cat === 'cut') {
        if (cardCut) cardCut.classList.add('selected');
        selectedServiceObj = { id: 'cut_main', title: 'Стрижка (будь-яка)', price: 1000, duration: 90 };
        updateServiceInputText();
        if (photoSec) photoSec.classList.add('visible');
        if (haircutExamples) haircutExamples.style.display = 'block';
    } else if (cat === 'color') {
        if (cardColor) cardColor.classList.add('selected');
        renderColorBaseSelection();
        if (subMenu) subMenu.classList.add('visible');
        if (photoSec) photoSec.classList.add('visible');
    } else if (cat === 'complex') {
        if (cardComplex) cardComplex.classList.add('selected');
        selectedServiceObj = { id: 'complex_cut_roots', title: 'Стрижка + Фарбування коріння (до 2 см)', price: 3000, duration: 180 };
        updateServiceInputText();
        if (photoSec) photoSec.classList.add('visible');
    }
    renderTimeSlots();
}

function selectHaircutReference(imgUrl, el) {
    selectedHaircutRefUrl = imgUrl;
    document.querySelectorAll('.haircut-carousel-item').forEach(i => i.classList.remove('selected'));
    if (el) el.classList.add('selected');
    const notice = document.getElementById('selectedRefNotice');
    if (notice) notice.style.display = 'block';
}

function renderColorBaseSelection() {
    const container = document.getElementById('submenuItems');
    if (!container) return;
    
    let natTitle = currentLang === 'en' ? 'Natural hair' : 'Натуральне';
    let colTitle = currentLang === 'en' ? 'Colored hair' : 'Фарбоване';

    container.innerHTML = `
        <div class="sub-service-card" onclick="selectBaseCondition('natural')">
            <div><div class="s-title">${natTitle}</div><div class="s-sub">${currentLang === 'en' ? 'Available: roots, total blond/vivid, toning' : 'Доступно: корінь, тотал блонд/яскраве, тонування'}</div></div>
            <div>➔</div>
        </div>
        <div class="sub-service-card" onclick="selectBaseCondition('colored')">
            <div><div class="s-title">${colTitle}</div><div class="s-sub">${currentLang === 'en' ? 'Available: roots, toning (no blonding/out)' : 'Доступно: корінь, тонування (без блонду/виходу)'}</div></div>
            <div>➔</div>
        </div>
    `;
}

function selectBaseCondition(baseKey) {
    selectedBaseCondition = baseKey;
    document.querySelectorAll('#submenuItems .sub-service-card').forEach(c => c.classList.remove('selected'));
    if (event && event.currentTarget) event.currentTarget.classList.add('selected');

    const colorSub = document.getElementById('coloringSubOptions');
    if (colorSub) colorSub.classList.add('visible');

    updateAvailableServicesList();
}

function updateServiceDetails() {
    updateAvailableServicesList();
}

function updateAvailableServicesList() {
    if (!selectedBaseCondition) return;

    const lengthSelect = document.getElementById('hairLengthSelect');
    let lengthKey = lengthSelect ? lengthSelect.value : 'shoulders';

    let services = coloringPrices[selectedBaseCondition][lengthKey];
    const listContainer = document.getElementById('specificServicesList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    services.forEach((srv, idx) => {
        let isSel = (selectedServiceObj && selectedServiceObj.id === srv.id) || (idx === 0 && !selectedServiceObj);
        if (idx === 0 && !selectedServiceObj) {
            selectedServiceObj = srv;
        }

        listContainer.innerHTML += `
            <div class="sub-service-card ${isSel ? 'selected' : ''}" onclick="selectSpecificServiceColor('${srv.id}')" id="srvCard_${srv.id}">
                <div><div class="s-title">${srv.title}</div><div class="s-sub">${srv.price} ₴ • ${srv.duration / 60} hrs</div></div>
                <div>${isSel ? '✓' : ''}</div>
            </div>
        `;
    });

    updateServiceInputText();
    renderTimeSlots();
}

function selectSpecificServiceColor(srvId) {
    let services = coloringPrices[selectedBaseCondition][document.getElementById('hairLengthSelect').value];
    services.forEach(s => {
        if (s.id === srvId) selectedServiceObj = s;
    });

    document.querySelectorAll('#specificServicesList .sub-service-card').forEach(c => c.classList.remove('selected'));
    const targetCard = document.getElementById(`srvCard_${srvId}`);
    if (targetCard) targetCard.classList.add('selected');

    updateServiceInputText();
    renderTimeSlots();
}

function updateServiceInputText() {
    if (!selectedServiceObj) return;
    let text = `${selectedServiceObj.title} — ${selectedServiceObj.price} ₴`;
    const srvInput = document.getElementById('selectedServiceInput');
    if (srvInput) srvInput.value = text;
}

function renderTimeSlots() {
    const grid = document.getElementById('timeSlotsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const dateInput = document.getElementById('clientDate');
    let dateVal = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    if (serverBlockedDays.includes(dateVal)) {
        grid.innerHTML = `<div style="font-size:10px; color:var(--accent); text-align:center; padding: 10px;">${currentLang === 'en' ? 'This day is blocked by the master (day off).' : 'Цей день заблоковано майстром (вихідний).'}</div>`;
        return;
    }

    let serviceDuration = 90;
    if (selectedServiceObj && selectedServiceObj.duration) {
        serviceDuration = selectedServiceObj.duration;
    }

    let workStartMinutes = 10 * 60; // 10:00
    let intervalMinutes = 30;
    let slots = [];

    // Перевіряємо, чи це звичайна стрижка (щоб дозволити початок о 19:00 із завершенням о 20:30)
    let isPureHaircut = selectedMainCat === 'cut';
    let maxStartMinutes = isPureHaircut ? (19 * 60) : (20 * 60 - serviceDuration);

    for (let m = workStartMinutes; m <= maxStartMinutes; m += intervalMinutes) {
        let hours = Math.floor(m / 60);
        let mins = m % 60;
        let timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        slots.push({ minutes: m, timeStr: timeStr, endMinutes: m + serviceDuration });
    }

    let now = new Date();
    let todayStr = now.toISOString().split('T')[0];
    let currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    let dayBookings = serverBookingsList.filter(b => b.date === dateVal);

    if (slots.length === 0) {
        slots = [{ minutes: 600, timeStr: "10:00", endMinutes: 600 + serviceDuration }];
    }

    slots.forEach(slot => {
        let isBooked = dayBookings.some(b => {
            let [bHour, bMin] = b.time.split(':').map(Number);
            let bStartMin = bHour * 60 + bMin;
            let bDuration = 90; 
            if (b.service && b.service.includes('3 год')) bDuration = 180;
            if (b.service && b.service.includes('2.5 год')) bDuration = 150;
            let bEndMin = bStartMin + bDuration;
            return (slot.minutes < bEndMin) && (slot.endMinutes > bStartMin);
        });

        let isTooSoonToday = (dateVal === todayStr) && (slot.minutes < currentTotalMinutes + 180);

        let div = document.createElement('div');
        div.className = 'time-cell';

        if (isBooked || isTooSoonToday) {
            div.className += ' booked';
            div.innerText = slot.timeStr;
        } else {
            div.innerText = slot.timeStr;
            div.onclick = () => selectTime(slot.timeStr, div);
        }
        grid.appendChild(div);
    });
}

function selectTime(time, el) {
    document.querySelectorAll('.time-cell').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedTimeSlot = time;
    
    const dateInput = document.getElementById('clientDate');
    let dateVal = dateInput ? dateInput.value : '';
    const slotNotice = document.getElementById('slotNotice');
    if (slotNotice) slotNotice.innerHTML = `⚡ <b>${currentLang === 'en' ? 'Selected time:' : 'Обрано час:'}</b> ${dateVal} о ${time}`;
}

function readFileAsBase64(fileInputId) {
    return new Promise((resolve) => {
        const fileInput = document.getElementById(fileInputId);
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) { resolve(''); return; }
        let reader = new FileReader();
        reader.onload = function(e) { resolve(e.target.result); };
        reader.onerror = function() { resolve(''); };
        reader.readAsDataURL(fileInput.files[0]);
    });
}

function checkIfRegularClient(name, phone) {
    let cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    let cleanName = name ? name.trim().toLowerCase() : '';

    return regularClientsList.some(client => {
        let cPhone = client.phone ? client.phone.replace(/[^0-9]/g, '') : '';
        let cName = client.name ? client.name.trim().toLowerCase() : '';
        
        let matchPhone = cleanPhone && cPhone && (cleanPhone === cPhone || cleanPhone.endsWith(cPhone) || cPhone.endsWith(cleanPhone));
        let matchName = cleanName && cName && cleanName === cName;

        return matchPhone || matchName;
    });
}

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
        alert(currentLang === 'en' ? "Please fill in name, phone, email, select a service and a time slot!" : "Будь ласка, заповніть ім'я, телефон, email, оберіть послугу та вільний час!");
        return;
    }

    if (serverBlockedDays.includes(date)) {
        alert(currentLang === 'en' ? "Sorry, this day is a day off for the master." : "На жаль, цей день є вихідним у майстра.");
        return;
    }

    let isRegular = checkIfRegularClient(name, phone);
    let depositPaid = false;

    if (isRegular) {
        let confirmRegular = confirm(currentLang === 'en' ? `✨ Welcome, ${name}!\n\nYou are recognized as a regular client. The 500 UAH deposit is waived!\n\nClick "OK" to complete your booking.` : `✨ Вітаємо, ${name}!\n\nМи розпізнали вас як постійного клієнта. Для вас завдаток 500 ₴ скасовано!\n\nНатисніть "OK", щоб завершити бронювання.`);
        if (!confirmRegular) { alert(currentLang === 'en' ? "Booking cancelled." : "Бронювання скасовано."); return; }
        depositPaid = true;
    } else {
        let payAction = confirm(
            currentLang === 'en' ? 
            `✨ Attention, ${name}!\n\nA 500 UAH deposit is required for new clients.\n\nClick "OK" to proceed to payment via Monobank.` :
            `✨ Увага, ${name}!\n\nДля нових клієнтів обов'язковий завдаток 500 ₴ (ФОП Явір Ілліяна Володимирівна).\n\nНатисніть "OK", щоб перейти до оплати через еквайринг Monobank.`
        );
        
        if (!payAction) { alert(currentLang === 'en' ? "Booking cancelled." : "Бронювання скасовано."); return; }

        try {
            let response = await fetch("/api/create-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, date, time: selectedTimeSlot })
            });
            let result = await response.json();
            if (result && result.pageUrl) { window.open(result.pageUrl, '_blank'); }
            else { window.open("https://send.monobank.ua/", '_blank'); }
        } catch (error) {
            window.open("https://send.monobank.ua/", '_blank');
        }

        let confirmPaid = confirm(currentLang === 'en' ? `💳 After payment, return here.\n\nDid you successfully pay the deposit?\nClick "OK" to finish booking.` : `💳 Після здійснення оплати 500 ₴ поверніться сюди.\n\nЧи успішно ви сплатили завдаток?\nНатисніть "OK", щоб завершити запис.`);
        if (!confirmPaid) { alert(currentLang === 'en' ? "Booking not saved." : "Запис не збережено."); return; }
        depositPaid = true;
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
        status: isRegular ? 'regular_client' : 'pending'
    };

    try {
        await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBooking)
        });
    } catch (e) { console.error("Помилка синхронізації запису:", e); }

    if (typeof confetti === 'function') { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); }

    let botUsername = typeof TELEGRAM_BOT_USERNAME !== 'undefined' ? TELEGRAM_BOT_USERNAME : 'illianahair_bot';
    let botLink = `https://t.me/${botUsername}?start=booking_${newBooking.id}`;
    let successMessage = currentLang === 'en' ?
        `Thank you, ${name}! Booking for ${date} at ${selectedTimeSlot} is saved!\n\n` +
        (isRegular ? `🌟 You logged in as a regular client (no deposit).\n\n` : `✅ Deposit of 500 UAH paid and confirmed.\n\n`) +
        `📱 You will now be redirected to our Telegram bot for confirmation and reminders.` :
        `Дякуємо, ${name}! Запис на ${date} о ${selectedTimeSlot} успішно збережено!\n\n` +
        (isRegular ? `🌟 Ви увійшли як постійний клієнт (без завдатку).\n\n` : `✅ Завдаток 500 ₴ сплачено та підтверджено.\n\n`) +
        `📱 Зараз ви будете перенаправлені в наш Telegram бот для фіксації та нагадувань.`;
    
    alert(successMessage);
    window.open(botLink, '_blank');
    location.reload();
}
