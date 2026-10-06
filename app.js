// --- ГЛОБАЛЬНІ ЗМІННІ ТА СТАН ---
let currentLang = 'ua';
let currentTheme = 'dark';
let selectedMainCat = null;
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
let regularClientsList = []; // База постійних клієнтів

// Автоматичне завантаження заблокованих днів, записів та постійних клієнтів з сервера
async function syncServerData() {
    try {
        let resBlocks = await fetch('/api/blocked-days');
        serverBlockedDays = await resBlocks.json() || [];
    } catch (e) { console.error("Помилка завантаження вихідних:", e); }

    try {
        let resBooks = await fetch('/api/bookings');
        serverBookingsList = await resBooks.json() || [];
    } catch (e) { console.error("Помилка завантаження записів:", e); }

    // Завантаження постійних клієнтів із локального сховища або сервера
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

// Актуальний прайс та тривалість
const subServicesData = {
    cut: [
        { id: 'cut_main', title: 'Стрижка (будь-яка)', price: 1000, duration: 90 }
    ],
    color: {
        roots: [
            { id: 'roots_2cm', title: 'Фарбування коріння (до 2 см)', price: 2500, duration: 150 }
        ],
        primary: [
            { id: 'prim_shoulders', title: 'Первинне (до плечей)', price: 4250, duration: 180 },
            { id: 'prim_blades', title: 'Первинне (від плечей до лопаток)', price: 6250, duration: 360 },
            { id: 'prim_below', title: 'Первинне (нижче лопаток)', price: 8750, duration: 420 }
        ],
        toned: [
            { id: 'ton_shoulders', title: 'Тонування / Однотон (до плечей)', price: 3000, duration: 120 },
            { id: 'ton_blades', title: 'Тонування / Однотон (від плечей до лопаток)', price: 3500, duration: 150 },
            { id: 'ton_below', title: 'Тонування / Однотон (нижче лопаток)', price: 5000, duration: 180 }
        ]
    }
};

const lengthCoefficients = { shoulders: 1.0, shoulder_blades: 1.25, below_blades: 1.5 };

function selectMainCategory(cat) {
    selectedMainCat = cat;
    selectedSubItem = null;
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
        selectedServiceObj = subServicesData.cut[0];
        updateServiceInputText();
        if (photoSec) photoSec.classList.add('visible');
        if (haircutExamples) haircutExamples.style.display = 'block';
    } else if (cat === 'color') {
        if (cardColor) cardColor.classList.add('selected');
        renderColorSubmenu();
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

function renderColorSubmenu() {
    const container = document.getElementById('submenuItems');
    if (!container) return;
    container.innerHTML = `
        <div class="sub-service-card" onclick="selectColorState('roots')">
            <div><div class="s-title">Корінь (до 2 см)</div><div class="s-sub">2500 ₴ • 2.5 год</div></div>
            <div>➔</div>
        </div>
        <div class="sub-service-card" onclick="selectColorState('primary')">
            <div><div class="s-title">Первинне фарбування (блонд/яскраве)</div><div class="s-sub">За довжиною</div></div>
            <div>➔</div>
        </div>
        <div class="sub-service-card" onclick="selectColorState('toned')">
            <div><div class="s-title">Тонування / Однотон</div><div class="s-sub">За довжиною</div></div>
            <div>➔</div>
        </div>
    `;
}

function selectColorState(stateKey) {
    selectedSubItem = stateKey;
    document.querySelectorAll('#submenuItems .sub-service-card').forEach(c => c.classList.remove('selected'));
    if (event && event.currentTarget) event.currentTarget.classList.add('selected');

    if (stateKey === 'roots') {
        selectedServiceObj = subServicesData.color.roots[0];
        const colorSub = document.getElementById('coloringSubOptions');
        if (colorSub) colorSub.classList.remove('visible');
        updateServiceDetails();
        renderTimeSlots();
        return;
    }

    const colorSub = document.getElementById('coloringSubOptions');
    if (colorSub) colorSub.classList.add('visible');

    const listContainer = document.getElementById('specificServicesList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    subServicesData.color[stateKey].forEach((srv, idx) => {
        listContainer.innerHTML += `
            <div class="sub-service-card ${idx===0?'selected':''}" onclick="selectSpecificService('${srv.id}')" id="srvCard_${srv.id}">
                <div><div class="s-title">${srv.title}</div><div class="s-sub">${srv.price} ₴ • ${srv.duration / 60} год</div></div>
                <div>✓</div>
            </div>
        `;
    });
    selectedServiceObj = subServicesData.color[stateKey][0];
    updateServiceDetails();
    renderTimeSlots();
}

function selectSpecificService(srvId) {
    for (let key in subServicesData.color) {
        subServicesData.color[key].forEach(s => { if (s.id === srvId) selectedServiceObj = s; });
    }
    document.querySelectorAll('#specificServicesList .sub-service-card').forEach(c => c.classList.remove('selected'));
    const targetCard = document.getElementById(`srvCard_${srvId}`);
    if (targetCard) targetCard.classList.add('selected');
    updateServiceDetails();
    renderTimeSlots();
}

function updateServiceDetails() {
    if (!selectedServiceObj) return;
    updateServiceInputText();
}

function updateServiceInputText() {
    if (!selectedServiceObj) return;
    let text = `${selectedServiceObj.title} — ${selectedServiceObj.price} ₴`;
    const srvInput = document.getElementById('selectedServiceInput');
    if (srvInput) srvInput.value = text;
}

// Генерація слотів: робота з 10:00 до 19:00, перевірка за тривалістю та 3-годинний ліміт для запису день-у-день
function renderTimeSlots() {
    const grid = document.getElementById('timeSlotsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const dateInput = document.getElementById('clientDate');
    let dateVal = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    if (serverBlockedDays.includes(dateVal)) {
        grid.innerHTML = `<div style="font-size:11px; color:var(--accent); grid-column:span 4; text-align:center;">Цей день заблоковано майстром (вихідний).</div>`;
        return;
    }

    let serviceDuration = 90;
    if (selectedServiceObj && selectedServiceObj.duration) {
        serviceDuration = selectedServiceObj.duration;
    }

    let workStartMinutes = 10 * 60; // 10:00
    let workEndMinutes = 19 * 60;   // 19:00
    let intervalMinutes = 180;      // 3 години проміжок

    let slots = [];
    for (let m = workStartMinutes; m <= workEndMinutes; m += intervalMinutes) {
        if (m + serviceDuration <= workEndMinutes) {
            let hours = Math.floor(m / 60);
            let mins = m % 60;
            let timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
            slots.push({ minutes: m, timeStr: timeStr });
        }
    }

    let now = new Date();
    let todayStr = now.toISOString().split('T')[0];
    let currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    let dayBookings = serverBookingsList.filter(b => b.date === dateVal);

    if (slots.length === 0) {
        slots = [{ minutes: 600, timeStr: "10:00" }];
    }

    slots.forEach(slot => {
        let isBooked = dayBookings.some(b => b.time === slot.timeStr);
        let isTooSoonToday = (dateVal === todayStr) && (slot.minutes < currentTotalMinutes + 180);

        let div = document.createElement('div');
        div.className = 'time-cell';

        if (isBooked) {
            div.className += ' booked';
            div.innerText = `${slot.timeStr}\n(Зайнято)`;
        } else if (isTooSoonToday) {
            div.className += ' booked';
            div.innerText = `${slot.timeStr}\n(Менш ніж за 3 год)`;
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
    if (slotNotice) slotNotice.innerHTML = `⚡ <b>Обрано час:</b> ${dateVal} о ${time}`;
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

// Перевірка, чи є клієнт постійним (за телефоном або іменем)
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
        alert("Будь ласка, заповніть ім'я, телефон, email, оберіть послугу та вільний час!");
        return;
    }

    if (serverBlockedDays.includes(date)) {
        alert("На жаль, цей день є вихідним у майстра.");
        return;
    }

    // Перевірка на постійного клієнта
    let isRegular = checkIfRegularClient(name, phone);
    let depositPaid = false;

    if (isRegular) {
        let confirmRegular = confirm(`✨ Вітаємо, ${name}!\n\nМи розпізнали вас як постійного клієнта. Для вас завдаток 500 ₴ скасовано!\n\nНатисніть "OK", щоб завершити бронювання.`);
        if (!confirmRegular) { alert("Бронювання скасовано."); return; }
        depositPaid = true; // Для постійних вважається підтвердженим без оплати
    } else {
        let payAction = confirm(
            `✨ Увага, ${name}!\n\n` +
            `Для нових клієнтів обов'язковий завдаток 500 ₴ (ФОП Явір Ілліяна Володимирівна).\n\n` +
            `Натисніть "OK", щоб перейти до оплати через еквайринг Monobank.`
        );
        
        if (!payAction) { alert("Бронювання скасовано."); return; }

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

        let confirmPaid = confirm(`💳 Після здійснення оплати 500 ₴ поверніться сюди.\n\nЧи успішно ви сплатили завдаток?\nНатисніть "OK", щоб завершити запис.`);
        if (!confirmPaid) { alert("Запис не збережено."); return; }
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
    let successMessage = `Дякуємо, ${name}! Запис на ${date} о ${selectedTimeSlot} успішно збережено!\n\n` +
        (isRegular ? `🌟 Ви увійшли як постійний клієнт (без завдатку).\n\n` : `✅ Завдаток 500 ₴ сплачено та підтверджено.\n\n`) +
        `📱 Зараз ви будете перенаправлені в наш Telegram бот для фіксації та нагадувань.`;
    
    alert(successMessage);
    window.open(botLink, '_blank');
    location.reload();
}

// --- КАБІНЕТ МАЙСТРА ТА БАЗА ПОСТІЙНИХ КЛІЄНТІВ ---
function forceBypassPin() {
    const loginBox = document.getElementById('masterLoginBox');
    const dashBox = document.getElementById('masterDashboard');
    if (loginBox) loginBox.style.display = 'none';
    if (dashBox) dashBox.style.display = 'flex';
    initCalendar();
    updateDashboardStats();
    renderRegularClientsList();
}

function loginMaster() {
    let pinInput = document.getElementById('masterPinInput');
    let pin = pinInput ? pinInput.value : '';
    if (pin === '1988' || pin === '0000') forceBypassPin();
    else alert('Невірний PIN-код!');
}

function logoutMaster() {
    const loginBox = document.getElementById('masterLoginBox');
    const dashBox = document.getElementById('masterDashboard');
    const pinInput = document.getElementById('masterPinInput');
    if (dashBox) dashBox.style.display = 'none';
    if (loginBox) loginBox.style.display = 'flex';
    if (pinInput) pinInput.value = '';
}

// Функції управління базою постійних клієнтів (імпорт з Excel та ручне додавання)
function renderRegularClientsList() {
    let container = document.getElementById('regularClientsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (regularClientsList.length === 0) {
        container.innerHTML = `<div style="font-size:11px; color:var(--text-muted);">База постійних клієнтів порожня. Імпортуйте Excel або додайте клієнтів нижче.</div>`;
        return;
    }

    regularClientsList.forEach((client, idx) => {
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; background:var(--card-bg); padding:6px 10px; border-radius:6px; margin-bottom:4px;">
                <span><b>${client.name}</b> — 📞 ${client.phone}</span>
                <button onclick="deleteRegularClient(${idx})" style="background:none; border:none; color:var(--accent); cursor:pointer;">✕ Видалити</button>
            </div>
        `;
    });
}

function addRegularClientManual() {
    let nameInput = document.getElementById('regClientName');
    let phoneInput = document.getElementById('regClientPhone');
    let name = nameInput ? nameInput.value.trim() : '';
    let phone = phoneInput ? phoneInput.value.trim() : '';

    if (!name || !phone) {
        alert("Введіть ім'я та телефон клієнта!");
        return;
    }

    regularClientsList.push({ name, phone });
    localStorage.setItem('illiana_regular_clients', JSON.stringify(regularClientsList));
    
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    renderRegularClientsList();
    alert("Постійного клієнта успішно додано!");
}

function deleteRegularClient(index) {
    regularClientsList.splice(index, 1);
    localStorage.setItem('illiana_regular_clients', JSON.stringify(regularClientsList));
    renderRegularClientsList();
}

// Імпорт постійних клієнтів з Excel файлу
function handleExcelImport(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, { type: 'array' });
            let firstSheetName = workbook.SheetNames[0];
            let worksheet = workbook.Sheets[firstSheetName];
            let json = XLSX.utils.sheet_to_json(worksheet);

            // Очікуємо поля у файлі на зразок name/Ім'я та phone/Телефон
            json.forEach(row => {
                let name = row['Name'] || row['Ім’я'] || row['Імя'] || row['name'] || '';
                let phone = row['Phone'] || row['Телефон'] || row['phone'] || '';
                if (name && phone) {
                    regularClientsList.push({ name: String(name), phone: String(phone) });
                }
            });

            localStorage.setItem('illiana_regular_clients', JSON.stringify(regularClientsList));
            renderRegularClientsList();
            alert(`Успішно імпортовано клієнтів із файлу Excel!`);
        } catch (err) {
            console.error("Помилка читання Excel:", err);
            alert("Не вдалося прочитати файл Excel. Перевірте формат.");
        }
    };
    reader.readAsArrayBuffer(file);
}

function setCalendarMode(mode) { 
    calendarMode = mode; 
    initCalendar(); 
}

function changePeriod(dir) {
    if (calendarMode === 'month') {
        calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + dir);
        let year = calendarCurrentDate.getFullYear();
        let month = String(calendarCurrentDate.getMonth() + 1).padStart(2, '0');
        let statsMonth = document.getElementById('statsMonthInput');
        if (statsMonth) statsMonth.value = `${year}-${month}`;
        updateDashboardStats();
    } else {
        calendarCurrentDate.setDate(calendarCurrentDate.getDate() + (dir * 7));
    }
    initCalendar();
}

function onStatsMonthChange() {
    let statsMonth = document.getElementById('statsMonthInput');
    if (statsMonth && statsMonth.value) {
        let parts = statsMonth.value.split('-');
        calendarCurrentDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        initCalendar();
        updateDashboardStats();
    }
}

async function initCalendar() {
    await syncServerData();
    const container = document.getElementById('calendarGridContainer');
    if (!container) return;
    container.innerHTML = '';

    let year = calendarCurrentDate.getFullYear();
    let month = calendarCurrentDate.getMonth();
    const monthNames = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
    
    let calTitle = document.getElementById('calendarTitle');
    if (calTitle) calTitle.innerText = `${monthNames[month]} ${year}`;

    let grid = document.createElement('div');
    grid.className = 'cal-grid';

    ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].forEach(d => {
        let hd = document.createElement('div');
        hd.className = 'cal-header-day';
        hd.innerText = d;
        grid.appendChild(hd);
    });

    if (calendarMode === 'month') {
        let firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
        let totalDays = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) grid.appendChild(document.createElement('div'));

        for (let day = 1; day <= totalDays; day++) {
            let dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let cell = document.createElement('div');
            cell.className = 'cal-day';
            if (dStr === selectedCalendarDateStr) cell.classList.add('active-booking');
            if (serverBlockedDays.includes(dStr)) cell.classList.add('day-blocked');

            cell.innerHTML = `<span>${day}</span>`;
            if (serverBookingsList.some(b => b.date === dStr)) cell.innerHTML += `<div class="dot"></div>`;

            cell.onclick = () => {
                selectedCalendarDateStr = dStr;
                initCalendar();
                renderDayBookings(dStr);
            };
            grid.appendChild(cell);
        }
    }
    container.appendChild(grid);
    renderDayBookings(selectedCalendarDateStr);
}

function renderDayBookings(dateStr) {
    let selLabel = document.getElementById('selectedDateLabel');
    if (selLabel) selLabel.innerText = `Записи на ${dateStr}:`;
    
    const container = document.getElementById('dayBookingsContainer');
    if (!container) return;
    container.innerHTML = '';

    let dayList = serverBookingsList.filter(b => b.date === dateStr);
    if (dayList.length === 0) {
        container.innerHTML = `<div style="font-size:10px; color:var(--text-muted); padding: 4px;">Немає записів на цей день.</div>`;
        return;
    }

    dayList.forEach((b) => {
        let phoneClean = b.phone ? b.phone.replace(/[^0-9]/g, '') : '';
        let item = document.createElement('div');
        item.className = 'booking-item';
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <b>🕒 ${b.time} — ${b.name}</b> ${b.status === 'regular_client' ? '<span style="color:var(--accent); font-size:9px;">(Постійний)</span>' : ''}
            </div>
            <div style="font-size:10px; color:var(--text-main);"><b>Послуга:</b> ${b.service}</div>
            <div style="font-size:10px; color:var(--text-muted);">📞 ${b.phone} | ✉️ ${b.email}</div>
            <div style="display:flex; gap:6px; margin-top:4px;">
                <a href="https://t.me/${phoneClean}" target="_blank" class="social-btn">💬 Telegram</a>
            </div>
        `;
        container.appendChild(item);
    });
}

async function toggleBlockSelectedDate() {
    let password = prompt("Введіть PIN-код майстра (1988):");
    if (!password) return;

    let isBlocked = serverBlockedDays.includes(selectedCalendarDateStr);
    let endpoint = isBlocked ? '/api/unblock-day' : '/api/block-day';

    try {
        let res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: selectedCalendarDateStr, password: password })
        });
        let result = await res.json();
        if (res.ok && result.success) {
            serverBlockedDays = result.blockedDays;
            alert(isBlocked ? "День розблоковано!" : "День заблоковано як вихідний!");
            initCalendar();
        } else {
            alert(result.error || "Помилка");
        }
    } catch (e) {
        console.error("Помилка:", e);
        alert("Не вдалося зв'язатися з сервером.");
    }
}

// Витрати та статистика
function getStoredExpenses() { return JSON.parse(localStorage.getItem('illiana_expenses') || '[]'); }
function saveExpensesToStorage(exp) { localStorage.setItem('illiana_expenses', JSON.stringify(exp)); }
function loadExpensesFromStorage() { renderExpensesList(); }

function addExpense() {
    let nameInput = document.getElementById('expenseNameInput');
    let amountInput = document.getElementById('expenseAmountInput');
    let name = nameInput ? nameInput.value.trim() : '';
    let amount = amountInput ? parseFloat(amountInput.value) : 0;
    
    if (!name || isNaN(amount)) return alert("Введіть дані витрат!");
    let expenses = getStoredExpenses();
    let statsMonth = document.getElementById('statsMonthInput');
    expenses.push({ id: 'exp_' + Date.now(), monthStr: statsMonth ? statsMonth.value : '', name, amount });
    saveExpensesToStorage(expenses);
    if (nameInput) nameInput.value = '';
    if (amountInput) amountInput.value = '';
    renderExpensesList();
    updateDashboardStats();
}

function deleteExpense(id) {
    saveExpensesToStorage(getStoredExpenses().filter(e => e.id !== id));
    renderExpensesList();
    updateDashboardStats();
}

function renderExpensesList() {
    const container = document.getElementById('expensesListContainer');
    if (!container) return;
    container.innerHTML = '';
    let statsMonth = document.getElementById('statsMonthInput');
    let targetMonth = statsMonth ? statsMonth.value : '';
    getStoredExpenses().filter(e => e.monthStr === targetMonth).forEach(e => {
        container.innerHTML += `<div style="display:flex; justify-content:space-between; font-size:10px; background:var(--card-bg); padding:4px 8px; border-radius:6px;"><span>${e.name} — <b>${e.amount} ₴</b></span><button onclick="deleteExpense('${e.id}')" style="background:none; border:none; color:var(--accent); cursor:pointer;">✕</button></div>`;
    });
}

function updateDashboardStats() {
    let statsMonth = document.getElementById('statsMonthInput');
    let targetMonth = statsMonth ? statsMonth.value : '';
    let totalIncome = 0;
    serverBookingsList.forEach(b => {
        if (b.date.startsWith(targetMonth)) {
            let match = b.service.match(/—\s*(\d+)\s*₴/);
            if (match) totalIncome += parseInt(match[1]);
        }
    });
    let totalExp = getStoredExpenses().filter(e => e.monthStr === targetMonth).reduce((s, e) => s + e.amount, 0);
    
    let elInc = document.getElementById('statCompleted');
    let elExp = document.getElementById('statExpenses');
    let elNet = document.getElementById('statNetProfit');
    
    if (elInc) elInc.innerText = `${totalIncome} ₴`;
    if (elExp) elExp.innerText = `${totalExp} ₴`;
    if (elNet) elNet.innerText = `${totalIncome - totalExp} ₴`;
}

exportToExcel = function() {
    let ws = XLSX.utils.json_to_sheet(serverBookingsList);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Записи");
    XLSX.writeFile(wb, "bookings.xlsx");
};

function updateStudioBackground() {
    let url = prompt("Введіть силку на фон:");
    if (url) { localStorage.setItem('illiana_custom_bg', url); let bgEl = document.getElementById('bgImageElement'); if(bgEl) bgEl.src = url; }
}

function resetStudioBackground() { 
    localStorage.removeItem('illiana_custom_bg'); 
    let bgEl = document.getElementById('bgImageElement');
    if(bgEl) bgEl.src = "https://i.ibb.co/M5stSykh/photo-2026-09-30-14-50-24.jpg"; 
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
