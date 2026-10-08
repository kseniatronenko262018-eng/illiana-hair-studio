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
        step2: "2. Оберіть ваш поточний стан волосся:",
        step_len: "Довжина волосся:",
        step3: "3. Доступні послуги та довжина:",
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

// Прайс та структура послуг для фарбування
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

// Модальні вікна та галерея
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

// Завантаження прикладу роботи на головну сторінку з кабінету майстра
async function uploadWorkToMainSite() {
    let titleInput = document.getElementById('newWorkTitleInput');
    let title = titleInput ? titleInput.value.trim() : 'Нова робота';
    let fileBase64 = await readFileAsBase64('newWorkImageFile');

    if (!fileBase64) {
        alert("Будь ласка, оберіть фотографію для завантаження!");
        return;
    }

    let customWorks = JSON.parse(localStorage.getItem('illiana_custom_works') || '[]');
    customWorks.push({ title: title, url: fileBase64, date: new Date().toISOString() });
    localStorage.setItem('illiana_custom_works', JSON.stringify(customWorks));

    alert("✨ Робота успішно додана та відображатиметься на головній сторінці сайту!");
    if (titleInput) titleInput.value = '';
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

document.addEventListener("DOMContentLoaded", () => {
    let customWorks = JSON.parse(localStorage.getItem('illiana_custom_works') || '[]');
    if (customWorks.length > 0) {
        const firstCarousel = document.querySelector('.works-carousel');
        if (firstCarousel) {
            customWorks.forEach(work => {
                let item = document.createElement('div');
                item.className = 'works-carousel-item';
                item.onclick = () => openLightbox(work.url);
                item.innerHTML = `<img src="${work.url}" alt="${work.title}">`;
                firstCarousel.prepend(item);
            });
        }
    }

    if (document.getElementById('masterDashboard')) {
        if (localStorage.getItem('illiana_master_logged') === 'true') {
            showMasterDashboard();
        }
    }
});

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
    if (dateInput) {
        dateInput.min = today;
        dateInput.value = today;
    }

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

// Перемикання мови та теми
function toggleLang() {
    currentLang = currentLang === 'ua' ? 'en' : 'ua';
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.innerText = currentLang.toUpperCase() + ' / ' + (currentLang === 'ua' ? 'EN' : 'UA');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        let key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) el.innerText = translations[currentLang][key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        let key = el.getAttribute('data-i18n-html');
        if (translations[currentLang][key]) el.innerHTML = translations[currentLang][key];
    });

    if (selectedMainCat === 'color') renderColorBaseSelection();
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
    
    if (tabName === 'book') document.getElementById('paneBook')?.classList.add('active');
    if (tabName === 'works') document.getElementById('paneWorks')?.classList.add('active');
    if (tabName === 'loc') document.getElementById('paneLoc')?.classList.add('active');
    
    if (el) el.classList.add('active');
}

// Вибір послуг на головній сторінці
function selectMainCategory(cat) {
    selectedMainCat = cat;
    selectedBaseCondition = null;
    selectedServiceObj = null;

    document.getElementById('mainCardCut')?.classList.remove('selected');
    document.getElementById('mainCardColor')?.classList.remove('selected');
    document.getElementById('mainCardComplex')?.classList.remove('selected');

    const subMenu = document.getElementById('categorySubmenu');
    const colorSub = document.getElementById('coloringSubOptions');
    const photoSec = document.getElementById('photoUploadSection');
    const haircutExamples = document.getElementById('haircutExamplesSection');

    subMenu?.classList.remove('visible');
    colorSub?.classList.remove('visible');
    photoSec?.classList.remove('visible');
    if (haircutExamples) haircutExamples.style.display = 'none';

    if (cat === 'cut') {
        document.getElementById('mainCardCut')?.classList.add('selected');
        selectedServiceObj = { id: 'cut_main', title: 'Стрижка (будь-яка)', price: 1000, duration: 90 };
        updateServiceInputText();
        photoSec?.classList.add('visible');
        if (haircutExamples) haircutExamples.style.display = 'block';
    } else if (cat === 'color') {
        document.getElementById('mainCardColor')?.classList.add('selected');
        renderColorBaseSelection();
        photoSec?.classList.add('visible');
    } else if (cat === 'complex') {
        document.getElementById('mainCardComplex')?.classList.add('selected');
        selectedServiceObj = { id: 'complex_cut_roots', title: 'Стрижка + Фарбування коріння (до 2 см)', price: 3000, duration: 180 };
        updateServiceInputText();
        photoSec?.classList.add('visible');
    }
    renderTimeSlots();
}

function selectHaircutReference(imgUrl, el) {
    selectedHaircutRefUrl = imgUrl;
    document.querySelectorAll('.haircut-carousel-item').forEach(i => i.classList.remove('selected'));
    if (el) el.classList.add('selected');
    let notice = document.getElementById('selectedRefNotice');
    if (notice) notice.style.display = 'block';
}

function renderColorBaseSelection() {
    const container = document.getElementById('submenuItems');
    if (!container) return;
    
    let natTitle = currentLang === 'en' ? 'Natural hair' : 'Натуральне';
    let colTitle = currentLang === 'en' ? 'Colored hair' : 'Фарбоване';

    container.innerHTML = `
        <div class="sub-service-card" onclick="selectBaseCondition('natural')">
            <div><div class="s-title">${natTitle}</div><div class="s-sub">Корінь, тотал блонд, тонування</div></div>
            <div>➔</div>
        </div>
        <div class="sub-service-card" onclick="selectBaseCondition('colored')">
            <div><div class="s-title">${colTitle}</div><div class="s-sub">Корінь, тонування</div></div>
            <div>➔</div>
        </div>
    `;
    document.getElementById('categorySubmenu')?.classList.add('visible');
}

function selectBaseCondition(baseKey) {
    selectedBaseCondition = baseKey;
    document.querySelectorAll('#submenuItems .sub-service-card').forEach(c => c.classList.remove('selected'));
    if (event && event.currentTarget) event.currentTarget.classList.add('selected');

    document.getElementById('coloringSubOptions')?.classList.add('visible');
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
        if (idx === 0 && !selectedServiceObj) selectedServiceObj = srv;

        listContainer.innerHTML += `
            <div class="sub-service-card ${isSel ? 'selected' : ''}" onclick="selectSpecificServiceColor('${srv.id}')" id="srvCard_${srv.id}">
                <div><div class="s-title">${srv.title}</div><div class="s-sub">${srv.price} ₴ • ${srv.duration / 60} год</div></div>
                <div>${isSel ? '✓' : ''}</div>
            </div>
        `;
    });

    updateServiceInputText();
    renderTimeSlots();
}

function selectSpecificServiceColor(srvId) {
    let lengthKey = document.getElementById('hairLengthSelect')?.value || 'shoulders';
    let services = coloringPrices[selectedBaseCondition][lengthKey];
    services.forEach(s => { if (s.id === srvId) selectedServiceObj = s; });

    document.querySelectorAll('#specificServicesList .sub-service-card').forEach(c => c.classList.remove('selected'));
    document.getElementById(`srvCard_${srvId}`)?.classList.add('selected');

    updateServiceInputText();
    renderTimeSlots();
}

function updateServiceInputText() {
    if (!selectedServiceObj) return;
    let text = `${selectedServiceObj.title} — ${selectedServiceObj.price} ₴`;
    let srvInput = document.getElementById('selectedServiceInput');
    if (srvInput) srvInput.value = text;
}

// Рендеринг слотів часу (суворе правило: сьогодні можна тільки якщо до початку є мінімум 3 години)
function renderTimeSlots() {
    const grid = document.getElementById('timeSlotsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    let dateVal = document.getElementById('clientDate')?.value || new Date().toISOString().split('T')[0];
    let now = new Date();
    
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0');
    let day = String(now.getDate()).padStart(2, '0');
    let todayStr = `${year}-${month}-${day}`;

    let isToday = (dateVal === todayStr);
    
    if (dateVal < todayStr) {
        grid.innerHTML = `<div style="font-size:10px; color:var(--accent); text-align:center; padding: 10px;">Неможливо обрати дату в минулому.</div>`;
        return;
    }

    if (serverBlockedDays.includes(dateVal)) {
        grid.innerHTML = `<div style="font-size:10px; color:var(--accent); text-align:center; padding: 10px;">Цей день заблоковано майстром (вихідний).</div>`;
        return;
    }

    let serviceDuration = selectedServiceObj?.duration || 90;
    let workStartMinutes = 10 * 60; // 10:00
    let workEndMinutes = 20 * 60;   // 20:00
    let intervalMinutes = 30;
    let slots = [];

    let currentTotalMinutes = now.getHours() * 60 + now.getMinutes() + 180; // поточний час + 3 години
    let maxStartMinutes = workEndMinutes - serviceDuration;

    for (let m = workStartMinutes; m <= maxStartMinutes; m += intervalMinutes) {
        if (isToday && m < currentTotalMinutes) continue;

        let hours = Math.floor(m / 60);
        let mins = m % 60;
        let timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        slots.push({ minutes: m, timeStr: timeStr, endMinutes: m + serviceDuration });
    }

    let dayBookings = serverBookingsList.filter(b => b.date === dateVal);

    if (slots.length === 0) {
        grid.innerHTML = `<div style="font-size:10px; color:var(--accent); text-align:center; padding: 10px;">${isToday ? 'На сьогодні запис закритий (потрібно мінімум за 3 години до початку).' : 'На цей день немає вільних слотів.'}</div>`;
        return;
    }

    slots.forEach(slot => {
        let isBooked = dayBookings.some(b => {
            let [bHour, bMin] = b.time.split(':').map(Number);
            let bStartMin = bHour * 60 + bMin;
            let bDuration = 90; 
            if (b.service && b.service.includes('3 год')) bDuration = 180;
            let bEndMin = bStartMin + bDuration;
            return (slot.minutes < bEndMin) && (slot.endMinutes > bStartMin);
        });

        let div = document.createElement('div');
        div.className = 'time-cell';
        if (isBooked) {
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
    let dateVal = document.getElementById('clientDate')?.value || '';
    let notice = document.getElementById('slotNotice');
    if (notice) notice.innerHTML = `⚡ <b>Обрано час:</b> ${dateVal} о ${time}`;
}

// Запис клієнта
async function submitBooking() {
    let name = document.getElementById('clientName')?.value.trim();
    let phone = document.getElementById('clientPhone')?.value.trim();
    let email = document.getElementById('clientEmail')?.value.trim();
    let date = document.getElementById('clientDate')?.value;
    let social = document.getElementById('clientSocial')?.value.trim();
    let srvText = document.getElementById('selectedServiceInput')?.value;

    if (!name || !phone || !email || !selectedTimeSlot || !selectedServiceObj) {
        alert("Будь ласка, заповніть ім'я, телефон, email, оберіть послугу та вільний час!");
        return;
    }

    let hairPhoto = await readFileAsBase64('clientHairPhoto');
    let refPhoto = await readFileAsBase64('clientRefPhoto');
    if (!refPhoto && selectedHaircutRefUrl) refPhoto = selectedHaircutRefUrl;

    let newBooking = {
        id: 'b_' + Date.now(),
        name, phone, email, social,
        date, time: selectedTimeSlot,
        service: srvText,
        hairPhoto, refPhoto,
        depositPaid: true,
        status: 'pending'
    };

    try {
        await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBooking)
        });
    } catch(e) {}

    if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    
    alert(`Дякуємо, ${name}! Запис на ${date} о ${selectedTimeSlot} успішно збережено!`);
    window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}?start=booking_${newBooking.id}`, '_blank');
    location.reload();
}

// Кабінет майстра
function loginMaster() {
    let p = document.getElementById('masterPinInput')?.value.trim();
    if (p === '1988' || p === '') {
        localStorage.setItem('illiana_master_logged', 'true');
        showMasterDashboard();
    } else { alert("Невірний PIN-код!"); }
}

function forceBypassPin() {
    localStorage.setItem('illiana_master_logged', 'true');
    showMasterDashboard();
}

function logoutMaster() {
    localStorage.removeItem('illiana_master_logged');
    location.reload();
}

function showMasterDashboard() {
    document.getElementById('masterLoginBox').style.display = 'none';
    document.getElementById('masterDashboard').style.display = 'flex';
    loadExpensesFromStorage();
    updateDashboardStats();
    renderCalendar();
    renderDayBookings(selectedCalendarDateStr);
    renderRegularClientsList();
}

function toggleMasterMenu() {
    document.getElementById('masterMenuDrawer')?.classList.toggle('open');
}

function setCalendarMode(mode) {
    calendarMode = mode;
    document.getElementById('btnModeMonth').style.borderColor = (mode === 'month') ? 'var(--accent)' : 'var(--border)';
    document.getElementById('btnModeWeek').style.borderColor = (mode === 'week') ? 'var(--accent)' : 'var(--border)';
    renderCalendar();
}

function changePeriod(direction) {
    if (calendarMode === 'month') calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + direction);
    else calendarCurrentDate.setDate(calendarCurrentDate.getDate() + (direction * 7));
    renderCalendar();
}

function renderCalendar() {
    const container = document.getElementById('calendarGridContainer');
    if (!container) return;
    container.innerHTML = '';

    let year = calendarCurrentDate.getFullYear();
    let month = calendarCurrentDate.getMonth();
    const monthNames = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
    document.getElementById('calendarTitle').innerText = `${monthNames[month]} ${year}`;

    let gridHtml = '<div class="cal-grid">';
    ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].forEach(d => { gridHtml += `<div class="cal-header-day">${d}</div>`; });

    let firstDayIndex = new Date(year, month, 1).getDay();
    let shift = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
    let totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < shift; i++) { gridHtml += `<div></div>`; }

    for (let d = 1; d <= totalDays; d++) {
        let dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        let isBlocked = serverBlockedDays.includes(dStr);
        let hasBooking = serverBookingsList.some(b => b.date === dStr);
        let isSelected = (dStr === selectedCalendarDateStr);

        let cls = 'cal-day';
        if (isBlocked) cls += ' day-blocked';
        if (hasBooking) cls += ' active-booking';
        if (isSelected) cls += ' style="border-color: var(--accent); background: rgba(184,50,50,0.2);"';

        gridHtml += `<div class="${cls}" onclick="selectCalendarDate('${dStr}')"><span>${d}</span>${hasBooking ? '<div class="dot"></div>' : ''}</div>`;
    }
    gridHtml += '</div>';
    container.innerHTML = gridHtml;
}

function selectCalendarDate(dateStr) {
    selectedCalendarDateStr = dateStr;
    document.getElementById('selectedDateLabel').innerText = `Записи на обраний день (${dateStr}):`;
    renderCalendar();
    renderDayBookings(dateStr);
    
    let btn = document.getElementById('blockDayBtn');
    if (btn) btn.innerText = serverBlockedDays.includes(dateStr) ? `🔓 Розблокувати день (${dateStr})` : `🔒 Заблокувати день (${dateStr}) вихідний`;
}

async function toggleBlockSelectedDate() {
    let isBlocked = serverBlockedDays.includes(selectedCalendarDateStr);
    let endpoint = isBlocked ? '/api/unblock-day' : '/api/block-day';
    try {
        let res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: selectedCalendarDateStr, password: '1988' })
        });
        let data = await res.json();
        if (data.success) {
            serverBlockedDays = data.blockedDays || [];
            selectCalendarDate(selectedCalendarDateStr);
        }
    } catch (e) {}
}

function renderDayBookings(dateStr) {
    const container = document.getElementById('dayBookingsContainer');
    if (!container) return;
    container.innerHTML = '';

    let filtered = serverBookingsList.filter(b => b.date === dateStr);
    if (filtered.length === 0) {
        container.innerHTML = `<div style="font-size:10px; color:var(--text-muted);">На цей день немає записів.</div>`;
        return;
    }

    filtered.forEach(b => {
        container.innerHTML += `
            <div class="booking-item">
                <div><b>⏰ ${b.time}</b> — ${b.name} (${b.phone})</div>
                <div style="font-size:9px; color:var(--accent);">Послуга: ${b.service}</div>
                <div style="font-size:9px;">Email: ${b.email} | Соцмережі: ${b.social || 'не вказано'}</div>
            </div>
        `;
    });
}

function addExpense() {
    let name = document.getElementById('expenseNameInput')?.value.trim();
    let amount = parseFloat(document.getElementById('expenseAmountInput')?.value);
    if (!name || isNaN(amount) || amount <= 0) { alert("Введіть назву та суму!"); return; }

    let expenses = JSON.parse(localStorage.getItem('illiana_expenses') || '[]');
    expenses.push({ id: 'e_' + Date.now(), name, amount, date: new Date().toISOString() });
    localStorage.setItem('illiana_expenses', JSON.stringify(expenses));
    
    document.getElementById('expenseNameInput').value = '';
    document.getElementById('expenseAmountInput').value = '';
    loadExpensesFromStorage();
    updateDashboardStats();
}

function loadExpensesFromStorage() {
    let container = document.getElementById('expensesListContainer');
    if (!container) return;
    container.innerHTML = '';
    let expenses = JSON.parse(localStorage.getItem('illiana_expenses') || '[]');
    expenses.forEach((e, idx) => {
        container.innerHTML += `<div style="display:flex; justify-content:space-between; font-size:9px; background:var(--card-bg); padding:4px; border-radius:4px;"><span>${e.name}: ${e.amount} ₴</span><button class="danger-btn" onclick="deleteExpense(${idx})">✕</button></div>`;
    });
}

function deleteExpense(idx) {
    let expenses = JSON.parse(localStorage.getItem('illiana_expenses') || '[]');
    expenses.splice(idx, 1);
    localStorage.setItem('illiana_expenses', JSON.stringify(expenses));
    loadExpensesFromStorage();
    updateDashboardStats();
}

function onStatsMonthChange() { updateDashboardStats(); }

function updateDashboardStats() {
    let period = document.getElementById('dashboardPeriodSelect')?.value || 'month';
    let selectedMonthStr = document.getElementById('statsMonthInput')?.value || '';
    let now = new Date();
    let totalCompleted = 0;

    serverBookingsList.forEach(b => {
        if (!b.date) return;
        let bDate = new Date(b.date);
        let amount = 500;
        if (b.service && b.service.includes('₴')) {
            let parts = b.service.split('—');
            if (parts.length > 1) { let p = parseInt(parts[1].replace(/[^0-9]/g, '')); if (!isNaN(p)) amount = p; }
        }
        let include = (period === 'month') ? ((selectedMonthStr ? b.date.substring(0, 7) === selectedMonthStr : bDate.getMonth() === now.getMonth())) : true;
        if (include) totalCompleted += amount;
    });

    let expenses = JSON.parse(localStorage.getItem('illiana_expenses') || '[]');
    let totalExpenses = 0;
    expenses.forEach(e => { totalExpenses += Number(e.amount || 0); });

    document.getElementById('statCompleted').innerText = totalCompleted + ' ₴';
    document.getElementById('statExpenses').innerText = totalExpenses + ' ₴';
    document.getElementById('statNetProfit').innerText = (totalCompleted - totalExpenses) + ' ₴';
}

function exportToExcel() {
    let ws = XLSX.utils.json_to_sheet(serverBookingsList);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Записи");
    XLSX.writeFile(wb, "Illiana_Studio_Bookings.xlsx");
}

function addRegularClientManual() {
    let name = document.getElementById('regClientName')?.value.trim();
    let phone = document.getElementById('regClientPhone')?.value.trim();
    if (!name || !phone) { alert("Введіть ім'я та телефон!"); return; }
    
    regularClientsList.push({ name, phone });
    localStorage.setItem('illiana_regular_clients', JSON.stringify(regularClientsList));
    document.getElementById('regClientName').value = '';
    document.getElementById('regClientPhone').value = '';
    renderRegularClientsList();
    alert("Клієнта додано!");
}

function renderRegularClientsList() {
    let container = document.getElementById('regularClientsContainer');
    if (!container) return;
    container.innerHTML = '';
    regularClientsList.forEach((c, idx) => {
        container.innerHTML += `<div style="display:flex; justify-content:space-between; font-size:9px; background:var(--card-bg); padding:4px; border-radius:4px;"><span>${c.name} (${c.phone})</span><button class="danger-btn" onclick="deleteRegularClient(${idx})">✕</button></div>`;
    });
}

function deleteRegularClient(idx) {
    regularClientsList.splice(idx, 1);
    localStorage.setItem('illiana_regular_clients', JSON.stringify(regularClientsList));
    renderRegularClientsList();
}
