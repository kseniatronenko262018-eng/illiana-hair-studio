// --- ГЛОБАЛЬНІ ЗМІННІ ТА СТАН ---
let currentLang = 'ua';
let currentTheme = 'light';
let selectedMainCat = null;
let selectedBaseCondition = null;
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

// --- ЛОГІКА ВХОДУ В КАБІНЕТ МАЙСТРА ---
function loginMaster() {
    const pinInput = document.getElementById('masterPinInput');
    const pin = pinInput ? pinInput.value.trim() : '';
    
    if (pin === '1988') {
        localStorage.setItem('illiana_master_logged', 'true');
        showMasterDashboard();
    } else {
        alert("Невірний PIN-код! Спробуйте ще раз (за замовчуванням: 1988).");
    }
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
    const loginBox = document.getElementById('masterLoginBox');
    const dashboard = document.getElementById('masterDashboard');
    if (loginBox) loginBox.style.display = 'none';
    if (dashboard) dashboard.style.display = 'flex';
    
    loadExpensesFromStorage();
    updateDashboardStats();
    renderCalendar();
    renderDayBookings(selectedCalendarDateStr);
    renderRegularClientsList();
}

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

// Функція завантаження прикладу роботи на головну сторінку з кабінету майстра
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

    alert("✨ Робота успішно додана та відображатиметься на головній сторінці сайту в розділі прикладів робіт!");
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

// Автоматичне підтягування завантажених майстром робіт на головну сторінку
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

    // Перевірка чи відкрита сторінка кабінету майстра і чи був вхід
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

// --- КАЛЕНДАР ТА УПРАВЛІННЯ ДНЯМИ В CRM ---
function setCalendarMode(mode) {
    calendarMode = mode;
    document.getElementById('btnModeMonth').style.borderColor = (mode === 'month') ? 'var(--accent)' : 'var(--border)';
    document.getElementById('btnModeWeek').style.borderColor = (mode === 'week') ? 'var(--accent)' : 'var(--border)';
    renderCalendar();
}

function changePeriod(direction) {
    if (calendarMode === 'month') {
        calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + direction);
    } else {
        calendarCurrentDate.setDate(calendarCurrentDate.getDate() + (direction * 7));
    }
    renderCalendar();
}

function renderCalendar() {
    const container = document.getElementById('calendarGridContainer');
    const titleEl = document.getElementById('calendarTitle');
    if (!container) return;
    container.innerHTML = '';

    let year = calendarCurrentDate.getFullYear();
    let month = calendarCurrentDate.getMonth();

    const monthNames = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
    if (titleEl) titleEl.innerText = `${monthNames[month]} ${year}`;

    let gridHtml = '<div class="cal-grid">';
    let daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    daysOfWeek.forEach(d => { gridHtml += `<div class="cal-header-day">${d}</div>`; });

    let firstDayIndex = new Date(year, month, 1).getDay();
    let shift = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
    let totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < shift; i++) {
        gridHtml += `<div></div>`;
    }

    for (let d = 1; d <= totalDays; d++) {
        let dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        let isBlocked = serverBlockedDays.includes(dStr);
        let hasBooking = serverBookingsList.some(b => b.date === dStr);
        let isSelected = (dStr === selectedCalendarDateStr);

        let cls = 'cal-day';
        if (isBlocked) cls += ' day-blocked';
        if (hasBooking) cls += ' active-booking';
        if (isSelected) cls += ' style="border-color: var(--accent); background: rgba(184,50,50,0.2);"';

        gridHtml += `
            <div class="${cls}" onclick="selectCalendarDate('${dStr}')">
                <span>${d}</span>
                ${hasBooking ? '<div class="dot"></div>' : ''}
            </div>
        `;
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
    if (btn) {
        if (serverBlockedDays.includes(dateStr)) {
            btn.innerText = `🔓 Розблокувати день (${dateStr})`;
        } else {
            btn.innerText = `🔒 Заблокувати день (${dateStr}) вихідний`;
        }
    }
}

async function toggleBlockSelectedDate() {
    let pin = prompt("Введіть PIN-код майстра для зміни статусу дня (за замовчуванням 1988):");
    if (pin !== '1988') { alert("Невірний PIN-код!"); return; }

    let isBlocked = serverBlockedDays.includes(selectedCalendarDateStr);
    let endpoint = isBlocked ? '/api/unblock-day' : '/api/block-day';

    try {
        let res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: selectedCalendarDateStr, password: pin })
        });
        let data = await res.json();
        if (data.success) {
            serverBlockedDays = data.blockedDays || [];
            selectCalendarDate(selectedCalendarDateStr);
        } else {
            alert(data.error || "Помилка");
        }
    } catch (e) {
        alert("Помилка з'єднання з сервером");
    }
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
                <div style="display: flex; gap: 6px; margin-top: 4px;">
                    ${b.hairPhoto ? `<img src="${b.hairPhoto}" class="photo-thumb" onclick="openLightbox('${b.hairPhoto}')" title="Фото волосся">` : ''}
                    ${b.refPhoto ? `<img src="${b.refPhoto}" class="photo-thumb" onclick="openLightbox('${b.refPhoto}')" title="Референс">` : ''}
                </div>
            </div>
        `;
    });
}

// --- УПРАВЛІННЯ ВИТРАТАМИ ТА ДАШБОРДОМ ---
function addExpense() {
    let nameInput = document.getElementById('expenseNameInput');
    let amountInput = document.getElementById('expenseAmountInput');
    let name = nameInput ? nameInput.value.trim() : '';
    let amount = amountInput ? parseFloat(amountInput.value) : 0;

    if (!name || isNaN(amount) || amount <= 0) {
        alert("Введіть коректну назву витрати та суму!");
        return;
    }

    let expenses = JSON.parse(localStorage.getItem('illiana_expenses') || '[]');
    expenses.push({ id: 'e_' + Date.now(), name, amount, date: new Date().toISOString() });
    localStorage.setItem('illiana_expenses', JSON.stringify(expenses));

    if (nameInput) nameInput.value = '';
    if (amountInput) amountInput.value = '';

    loadExpensesFromStorage();
    updateDashboardStats();
}

function loadExpensesFromStorage() {
    let container = document.getElementById('expensesListContainer');
    if (!container) return;
    container.innerHTML = '';

    let expenses = JSON.parse(localStorage.getItem('illiana_expenses') || '[]');
    if (expenses.length === 0) {
        container.innerHTML = `<div style="font-size:9px; color:var(--text-muted);">Немає доданих витрат.</div>`;
        return;
    }

    expenses.forEach((e, index) => {
        container.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--card-bg); padding: 6px 8px; border-radius: 6px; font-size: 10px;">
                <span><b>${e.name}</b>: ${e.amount} ₴</span>
                <button class="danger-btn" onclick="deleteExpense(${index})">Видалити</button>
            </div>
        `;
    });
}

function deleteExpense(index) {
    let expenses = JSON.parse(localStorage.getItem('illiana_expenses') || '[]');
    expenses.splice(index, 1);
    localStorage.setItem('illiana_expenses', JSON.stringify(expenses));
    loadExpensesFromStorage();
    updateDashboardStats();
}

function onStatsMonthChange() {
    updateDashboardStats();
}

function updateDashboardStats() {
    let periodSelect = document.getElementById('dashboardPeriodSelect');
    let period = periodSelect ? periodSelect.value : 'month';
    
    let statsMonthInput = document.getElementById('statsMonthInput');
    let selectedMonthStr = statsMonthInput ? statsMonthInput.value : '';

    let now = new Date();
    let totalCompleted = 0;

    serverBookingsList.forEach(b => {
        if (!b.date) return;
        let bDate = new Date(b.date);
        let amount = 500; 
        if (b.service && b.service.includes('₴')) {
            let parts = b.service.split('—');
            if (parts.length > 1) {
                let parsed = parseInt(parts[1].replace(/[^0-9]/g, ''));
                if (!isNaN(parsed)) amount = parsed;
            }
        }

        let include = false;
        if (period === 'month') {
            let bMonthStr = b.date.substring(0, 7);
            include = selectedMonthStr ? (bMonthStr === selectedMonthStr) : (bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear());
        } else if (period === 'week') {
            let oneJan = new Date(bDate.getFullYear(), 0, 1);
            let numberOfDays = Math.floor((bDate - oneJan) / (24 * 60 * 60 * 1000));
            let bWeek = Math.ceil((bDate.getDay() + 1 + numberOfDays) / 7);

            let nowOneJan = new Date(now.getFullYear(), 0, 1);
            let nowDays = Math.floor((now - nowOneJan) / (24 * 60 * 60 * 1000));
            let nowWeek = Math.ceil((now.getDay() + 1 + nowDays) / 7);

            include = (bWeek === nowWeek && bDate.getFullYear() === now.getFullYear());
        } else if (period === 'year') {
            include = (bDate.getFullYear() === now.getFullYear());
        }

        if (include) {
            totalCompleted += amount;
        }
    });

    let expenses = JSON.parse(localStorage.getItem('illiana_expenses') || '[]');
    let totalExpenses = 0;
    expenses.forEach(e => {
        let eDate = new Date(e.date || Date.now());
        let includeExp = false;
        if (period === 'month') {
            let eMonthStr = (e.date || '').substring(0, 7);
            includeExp = selectedMonthStr ? (eMonthStr === selectedMonthStr) : (eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear());
        } else if (period === 'year') {
            includeExp = (eDate.getFullYear() === now.getFullYear());
        } else {
            includeExp = true; 
        }

        if (includeExp) {
            totalExpenses += Number(e.amount || 0);
        }
    });

    let netProfit = totalCompleted - totalExpenses;

    let compEl = document.getElementById('statCompleted');
    let expEl = document.getElementById('statExpenses');
    let netEl = document.getElementById('statNetProfit');

    if (compEl) compEl.innerText = totalCompleted + ' ₴';
    if (expEl) expEl.innerText = totalExpenses + ' ₴';
    if (netEl) netEl.innerText = netProfit + ' ₴';
}

function exportToExcel() {
    let ws = XLSX.utils.json_to_sheet(serverBookingsList);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Записи");
    XLSX.writeFile(wb, "Illiana_Studio_Bookings.xlsx");
}

function updateStudioBackground() {
    let url = prompt("Введіть пряме посилання на нове фонове зображення:");
    if (url) {
        localStorage.setItem('illiana_custom_bg', url);
        let bgImgEl = document.getElementById('bgImageElement');
        if (bgImgEl) bgImgEl.src = url;
        alert("Фон успішно змінено!");
    }
}

function resetStudioBackground() {
    localStorage.removeItem('illiana_custom_bg');
    let bgImgEl = document.getElementById('bgImageElement');
    if (bgImgEl) bgImgEl.src = "https://i.ibb.co/M5stSykh/photo-2026-09-30-14-50-24.jpg";
    alert("Фон скинуто до стандартного!");
}

function renderRegularClientsList() {
    const container = document.getElementById('regularClientsContainer');
    if (!container) return;
    container.innerHTML = '';
    regularClientsList.forEach((c, idx) => {
        container.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--card-bg); padding: 4px 8px; border-radius: 4px; font-size: 9px;">
                <span>${c.name} (${c.phone})</span>
                <button class="danger-btn" onclick="deleteRegularClient(${idx})" style="font-size:7px; padding:2px 4px;">Видалити</button>
            </div>
        `;
    });
}

function addRegularClientManual() {
    let nameInput = document.getElementById('regClientName');
    let phoneInput = document.getElementById('regClientPhone');
    let name = nameInput ? nameInput.value.trim() : '';
    let phone = phoneInput ? phoneInput.value.trim() : '';

    if (!name || !phone) { alert("Введіть ім'я та телефон клієнта!"); return; }

    regularClientsList.push({ name, phone });
    localStorage.setItem('illiana_regular_clients', JSON.stringify(regularClientsList));
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    renderRegularClientsList();
    alert("Клієнта додано до бази постійних!");
}

function deleteRegularClient(index) {
    regularClientsList.splice(index, 1);
    localStorage.setItem('illiana_regular_clients', JSON.stringify(regularClientsList));
    renderRegularClientsList();
}

function handleExcelImport(event) {
    let file = event.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, {type: 'array'});
            let firstSheet = workbook.SheetNames[0];
            let rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
            
            rows.forEach(r => {
                let name = r.name || r.Ім'я || r.Client || '';
                let phone = r.phone || r.Телефон || r.Phone || '';
                if (name && phone) {
                    regularClientsList.push({ name: String(name), phone: String(phone) });
                }
            });
            localStorage.setItem('illiana_regular_clients', JSON.stringify(regularClientsList));
            renderRegularClientsList();
            alert("Базу постійних клієнтів успішно імпортовано з Excel!");
        } catch(err) {
            alert("Поשлка читання Excel файлу.");
        }
    };
    reader.readAsArrayBuffer(file);
}
