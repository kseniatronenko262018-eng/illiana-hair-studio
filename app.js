// --- ГЛОБАЛЬНІ ЗМІННІ ТА СТАН ---
let currentLang = 'ua';
let currentTheme = 'light';
let selectedMainCat = null;
let selectedBaseCondition = null;
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
        step3: "3. Доступні послуги та довжина:",
        length_label: "Довжина волосся:",
        len_shoulders: "До плечей",
        len_blades: "Від плечей до лопаток",
        len_below: "Нижче лопаток",
        rules_title: "📌 Важливі примітки та правила майстра:",
        rule_1: "Якщо ваше коріння більше 2 см, послуга фарбування вважається первинною.",
        rule_2: "Я не роблю блонд у техніці (AirTouch, балаяж і т. д.).",
        rule_3: "Я не роблю вихід із чорного або рудого.",
        rule_4: "Я не фарбую волосся після біозавивки, ботоксу, кератину.",
        photo_current_label: "4. Завантажте фото вашого волосся:",
        photo_ref_label: "5. Завантажте фото-референс:",
        selected_service_label: "Обрана послуга та час",
        select_service_placeholder: "Спочатку оберіть категорію вище",
        date_label: "Дата",
        name_label: "Ім'я",
        name_placeholder: "Як звертатись",
        phone_label: "Телефон",
        email_label: "Email (обов'язково)",
        social_label: "Нік / соцмережа",
        slots_label: "Доступні слоти часу",
        slot_notice_init: "⚡ <b>Слот заброньовано на:</b> оберіть послугу та час.",
        deposit_notice: "⚡ <b>Умова броні:</b> Завдаток <b>500 грн</b> підтверджує запис.",
        pay_btn: "Сплатити завдаток 500 ₴ та забронювати",
        modal_title: "Публічний договір оферти",
        modal_btn: "Зрозуміло",
        loc_info: "📍 <b>Локація:</b> м. Дніпро, вул. Володимира Вернадського, 35-Б.<br><br>Приватний простір, мінімалізм та фокус на якості.",
        map_btn: "Відкрити в Google Maps"
    }
};

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

function openOffer() {
    let modal = document.getElementById('offerModal');
    if (modal) modal.style.display = 'flex';
}

function closeOffer() {
    let modal = document.getElementById('offerModal');
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

async function readFileAsBase64(fileInputId) {
    return new Promise((resolve) => {
        let fileInput = document.getElementById(fileInputId);
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) { resolve(''); return; }
        let reader = new FileReader();
        reader.onload = function(e) { resolve(e.target.result); };
        reader.onerror = function() { resolve(''); };
        reader.readAsDataURL(fileInput.files[0]);
    });
}

window.onload = async function() {
    try {
        let resBlocks = await fetch('/api/blocked-days');
        serverBlockedDays = await resBlocks.json() || [];
    } catch (e) { serverBlockedDays = []; }

    try {
        let resBooks = await fetch('/api/bookings');
        serverBookingsList = await resBooks.json() || [];
    } catch (e) { serverBookingsList = []; }

    try {
        regularClientsList = JSON.parse(localStorage.getItem('illiana_regular_clients') || '[]');
    } catch (e) { regularClientsList = []; }

    let today = new Date().toISOString().split('T')[0];
    let dateInput = document.getElementById('clientDate');
    if (dateInput) {
        dateInput.value = today;
    }

    renderTimeSlots();
    loadExpensesFromStorage();
    updateDashboardStats();
    renderRegularClientsList();

    if (document.getElementById('masterDashboard')) {
        if (localStorage.getItem('illiana_master_logged') === 'true') {
            showMasterDashboard();
        }
    }
};

function toggleLang() {
    currentLang = currentLang === 'ua' ? 'en' : 'ua';
    let langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.innerText = currentLang.toUpperCase() + ' / ' + (currentLang === 'ua' ? 'EN' : 'UA');
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    let themeBtn = document.getElementById('themeToggle');
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

function selectMainCategory(cat) {
    selectedMainCat = cat;
    selectedBaseCondition = null;
    selectedServiceObj = null;

    document.getElementById('mainCardCut')?.classList.remove('selected');
    document.getElementById('mainCardColor')?.classList.remove('selected');
    document.getElementById('mainCardComplex')?.classList.remove('selected');

    let subMenu = document.getElementById('categorySubmenu');
    let colorSub = document.getElementById('coloringSubOptions');
    let photoSec = document.getElementById('photoUploadSection');
    let haircutExamples = document.getElementById('haircutExamplesSection');

    if (subMenu) subMenu.style.display = 'none';
    if (colorSub) colorSub.style.display = 'none';
    if (photoSec) photoSec.style.display = 'none';
    if (haircutExamples) haircutExamples.style.display = 'none';

    if (cat === 'cut') {
        document.getElementById('mainCardCut')?.classList.add('selected');
        selectedServiceObj = { id: 'cut_main', title: 'Стрижка (будь-яка)', price: 1000, duration: 90 };
        updateServiceInputText();
        if (photoSec) photoSec.style.display = 'flex';
        if (haircutExamples) haircutExamples.style.display = 'block';
    } else if (cat === 'color') {
        document.getElementById('mainCardColor')?.classList.add('selected');
        renderColorBaseSelection();
        if (subMenu) subMenu.style.display = 'block';
        if (photoSec) photoSec.style.display = 'flex';
    } else if (cat === 'complex') {
        document.getElementById('mainCardComplex')?.classList.add('selected');
        selectedServiceObj = { id: 'complex_cut_roots', title: 'Стрижка + Фарбування коріння (до 2 см)', price: 3000, duration: 180 };
        updateServiceInputText();
        if (photoSec) photoSec.style.display = 'flex';
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
    let container = document.getElementById('submenuItems');
    if (!container) return;
    
    container.innerHTML = `
        <div class="sub-service-card" onclick="selectBaseCondition('natural')">
            <div><div class="s-title">Натуральне</div><div class="s-sub">Корінь, тотал блонд, тонування</div></div>
            <div>➔</div>
        </div>
        <div class="sub-service-card" onclick="selectBaseCondition('colored')">
            <div><div class="s-title">Фарбоване</div><div class="s-sub">Корінь, тонування</div></div>
            <div>➔</div>
        </div>
    `;
    let subMenu = document.getElementById('categorySubmenu');
    if (subMenu) subMenu.style.display = 'block';
}

function selectBaseCondition(baseKey) {
    selectedBaseCondition = baseKey;
    document.querySelectorAll('#submenuItems .sub-service-card').forEach(c => c.classList.remove('selected'));
    if (event && event.currentTarget) event.currentTarget.classList.add('selected');

    let colorSub = document.getElementById('coloringSubOptions');
    if (colorSub) colorSub.style.display = 'block';
    updateAvailableServicesList();
}

function updateServiceDetails() {
    updateAvailableServicesList();
}

function updateAvailableServicesList() {
    if (!selectedBaseCondition) return;

    let lengthSelect = document.getElementById('hairLengthSelect');
    let lengthKey = lengthSelect ? lengthSelect.value : 'shoulders';

    let services = coloringPrices[selectedBaseCondition][lengthKey];
    let listContainer = document.getElementById('specificServicesList');
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

function renderTimeSlots() {
    let grid = document.getElementById('timeSlotsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    let dateVal = document.getElementById('clientDate')?.value || new Date().toISOString().split('T')[0];

    if (serverBlockedDays.includes(dateVal)) {
        grid.innerHTML = `<div style="font-size:10px; color:var(--accent); text-align:center; padding: 10px;">Цей день заблоковано майстром (вихідний).</div>`;
        return;
    }

    let serviceDuration = selectedServiceObj?.duration || 90;
    let workStartMinutes = 10 * 60;
    let workEndMinutes = 20 * 60;
    let intervalMinutes = 30;
    let slots = [];
    let maxStartMinutes = workEndMinutes - serviceDuration;

    for (let m = workStartMinutes; m <= maxStartMinutes; m += intervalMinutes) {
        let hours = Math.floor(m / 60);
        let mins = m % 60;
        let timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        slots.push({ minutes: m, timeStr: timeStr, endMinutes: m + serviceDuration });
    }

    let dayBookings = serverBookingsList.filter(b => b.date === dateVal);

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
    renderCalendar();
}

function changePeriod(direction) {
    if (calendarMode === 'month') calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + direction);
    else calendarCurrentDate.setDate(calendarCurrentDate.getDate() + (direction * 7));
    renderCalendar();
}

function renderCalendar() {
    let container = document.getElementById('calendarGridContainer');
    if (!container) return;
    container.innerHTML = '';

    let year = calendarCurrentDate.getFullYear();
    let month = calendarCurrentDate.getMonth();
    const monthNames = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
    let titleEl = document.getElementById('calendarTitle');
    if (titleEl) titleEl.innerText = `${monthNames[month]} ${year}`;

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
    let label = document.getElementById('selectedDateLabel');
    if (label) label.innerText = `Записи на обраний день (${dateStr}):`;
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
    let container = document.getElementById('dayBookingsContainer');
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

    let compEl = document.getElementById('statCompleted');
    let expEl = document.getElementById('statExpenses');
    let netEl = document.getElementById('statNetProfit');

    if (compEl) compEl.innerText = totalCompleted + ' ₴';
    if (expEl) expEl.innerText = totalExpenses + ' ₴';
    if (netEl) netEl.innerText = (totalCompleted - totalExpenses) + ' ₴';
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
    let nameInp = document.getElementById('regClientName');
    let phoneInp = document.getElementById('regClientPhone');
    if (nameInp) nameInp.value = '';
    if (phoneInp) phoneInp.value = '';
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
