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

// Оновлена логіка дашборду фінансів (Тиждень, Місяць, Рік)
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
