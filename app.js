// Основна логіка сайту та CRM-системи майстра
let currentLang = 'ua';
let currentTheme = 'dark';
let selectedMainCat = null;
let selectedSubItem = null;
let selectedServiceObj = null;
let selectedTimeSlot = null;
let selectedHaircutRefUrl = '';
let calendarMode = 'month';
let calendarCurrentDate = new Date();

const TELEGRAM_BOT_USERNAME = 'illianahair_bot';

const translations = {
    ua: {
        subtitle: "editorial hair studio",
        tab_book: "Запис",
        tab_works: "Архів",
        tab_loc: "Локація",
        tab_cab: "🔒 Кабінет",
        step1: "1. Оберіть категорію послуг",
        cut_title: "Стрижка",
        color_title: "Фарбування",
        color_sub: "Підбір за станом",
        step2: "2. Оберіть ваш поточний стан волосся:",
        step3: "3. Доступні послуги та довжина:",
        length_label: "Довжина волосся:",
        len_shoulders: "До плечей",
        len_blades: "Від плечей до лопаток",
        len_below: "Нижче лопаток",
        photo_current_label: "4. Завантажте фото вашого волосся:",
        photo_ref_label: "5. Завантажте фото-референс (бажаний результат):",
        selected_service_label: "Обрана послуга та час",
        date_label: "Дата",
        name_label: "Ім'я",
        phone_label: "Телефон",
        email_label: "Email (обов'язково)",
        social_label: "Нік / соцмережа",
        slots_label: "Доступні слоти часу (реальний час)",
        slot_notice_init: "⚡ <b>Слот заброньовано на:</b> оберіть послугу та час.",
        deposit_notice: "⚡ <b>Умова броні:</b> Завдаток <b>500 грн</b> підтверджує запис для нових клієнтів (ФОП Явір І.В.).[cite: 1]",
        pay_btn: "Забронювати та сплатити завдаток 500 ₴",
        modal_title: "Публічний договір оферти",
        modal_btn: "Зрозуміло",
        loc_info: "📍 <b>Локація:</b> м. Дніпро, вул. Володимира Вернадського, 356.<br><br>Приватний простір, мінімалізм та фокус на якості.<br><a href='https://maps.google.com/?q=Dnipro,+Volodymyra+Vernadskoho+356' target='_blank' class='map-btn'>Відкрити в Google Maps</a>"
    },
    en: {
        subtitle: "editorial hair studio",
        tab_book: "Book",
        tab_works: "Archive",
        tab_loc: "Location",
        tab_cab: "🔒 Cabinet",
        step1: "1. Choose service category",
        cut_title: "Haircut",
        color_title: "Coloring",
        color_sub: "Tailored by hair state",
        step2: "2. Choose your current hair condition:",
        step3: "3. Available services & length:",
        length_label: "Hair length:",
        len_shoulders: "To shoulders",
        len_blades: "Shoulder blades",
        len_below: "Below blades",
        photo_current_label: "4. Upload photo of your current hair:",
        photo_ref_label: "5. Upload reference photo:",
        selected_service_label: "Selected service & time",
        date_label: "Date",
        name_label: "Name",
        phone_label: "Phone",
        email_label: "Email (required)",
        social_label: "Social / Username",
        slots_label: "Available time slots",
        slot_notice_init: "⚡ <b>Slot booked for:</b> choose service and time.",
        deposit_notice: "⚡ <b>Deposit rule:</b> <b>500 UAH</b> deposit confirms booking for new clients.",
        pay_btn: "Book & pay 500 ₴ deposit",
        modal_title: "Public Offer Agreement",
        modal_btn: "Understood",
        loc_info: "📍 <b>Location:</b> Dnipro, Volodymyra Vernadskoho st., 356.<br><br>Private space, minimalism & quality focus.<br><a href='https://maps.google.com/?q=Dnipro,+Volodymyra+Vernadskoho+356' target='_blank' class='map-btn'>Open in Google Maps</a>"
    }
};

const subServicesData = {
    cut: [
        { id: 'cut_main', title: 'Стрижка (1.5 год)', price: 1000, duration: 90 }
    ],
    color: {
        virgin: [
            { id: 'roots_virgin', title: 'Коріння (до 2 см)', price: 1300, duration: 120 },
            { id: 'primary_color', title: 'Первинне фарбування (тон в тон / затемнення)', price: 1800, duration: 150 }
        ],
        toned: [
            { id: 'toning', title: 'Тонування (освіжити колір/довжину)', price: 1500, duration: 120 }
        ],
        grey: [
            { id: 'grey_roots', title: 'Фарбування сивого коріння (до 2 см)', price: 1500, duration: 135 }
        ]
    }
};

const lengthCoefficients = {
    shoulders: 1.0,
    shoulder_blades: 1.25,
    below_blades: 1.5
};

window.onload = function() {
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
    loadBookingsFromStorage();
    loadExpensesFromStorage();
    updateDashboardStats();
    
    let savedBg = localStorage.getItem('illiana_custom_bg');
    const bgImgEl = document.getElementById('bgImageElement');
    if (bgImgEl && savedBg) bgImgEl.src = savedBg;
};

function toggleLang() {
    currentLang = currentLang === 'ua' ? 'en' : 'ua';
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.innerText = currentLang.toUpperCase() + ' / ' + (currentLang === 'ua' ? 'EN' : 'UA');
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) el.innerText = translations[currentLang][key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (translations[currentLang][key]) el.innerHTML = translations[currentLang][key];
    });
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
    
    if (tabName === 'book') document.getElementById('paneBook').classList.add('active');
    if (tabName === 'works') document.getElementById('paneWorks').classList.add('active');
    if (tabName === 'loc') document.getElementById('paneLoc').classList.add('active');
    
    if (el) el.classList.add('active');
}

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
        <div class="sub-service-card" onclick="selectColorState('virgin')">
            <div><div class="s-title">Натуральне волосся</div><div class="s-sub">Корінь або первинне</div></div>
            <div>➔</div>
        </div>
        <div class="sub-service-card" onclick="selectColorState('toned')">
            <div><div class="s-title">Раніше фарбоване волосся</div><div class="s-sub">Тонування довжини</div></div>
            <div>➔</div>
        </div>
        <div class="sub-service-card" onclick="selectColorState('grey')">
            <div><div class="s-title">З сивиною</div><div class="s-sub">Фарбування сивого коріння</div></div>
            <div>➔</div>
        </div>
    `;
}

function selectColorState(stateKey) {
    selectedSubItem = stateKey;
    document.querySelectorAll('#submenuItems .sub-service-card').forEach(c => c.classList.remove('selected'));
    if (event && event.currentTarget) event.currentTarget.classList.add('selected');

    const colorSub = document.getElementById('coloringSubOptions');
    if (colorSub) colorSub.classList.add('visible');

    const listContainer = document.getElementById('specificServicesList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    subServicesData.color[stateKey].forEach((srv, idx) => {
        listContainer.innerHTML += `
            <div class="sub-service-card ${idx===0?'selected':''}" onclick="selectSpecificService('${srv.id}')" id="srvCard_${srv.id}">
                <div><div class="s-title">${srv.title}</div><div class="s-sub">${srv.price} ₴ • ${srv.duration} хв</div></div>
                <div>✓</div>
            </div>
        `;
    });
    
    selectedServiceObj = subServicesData.color[stateKey][0];
    updateServiceDetails();
}

function selectSpecificService(srvId) {
    for (let key in subServicesData.color) {
        subServicesData.color[key].forEach(s => {
            if (s.id === srvId) selectedServiceObj = s;
        });
    }
    document.querySelectorAll('#specificServicesList .sub-service-card').forEach(c => c.classList.remove('selected'));
    const targetCard = document.getElementById(`srvCard_${srvId}`);
    if (targetCard) targetCard.classList.add('selected');
    updateServiceDetails();
}

function updateServiceDetails() {
    if (!selectedServiceObj) return;
    updateServiceInputText();
}

function updateServiceInputText() {
    if (!selectedServiceObj) return;
    const lengthSelect = document.getElementById('hairLengthSelect');
    let lengthKey = lengthSelect ? lengthSelect.value : 'shoulders';
    let coeff = (selectedMainCat === 'color') ? lengthCoefficients[lengthKey] : 1.0;
    let finalPrice = Math.round(selectedServiceObj.price * coeff);

    let text = `${selectedServiceObj.title} —${finalPrice} ₴`;
    const srvInput = document.getElementById('selectedServiceInput');
    if (srvInput) srvInput.value = text;
}

function renderTimeSlots() {
    const grid = document.getElementById('timeSlotsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const slots = ["10:00", "12:00", "14:00", "16:00", "18:00"];
    
    const dateInput = document.getElementById('clientDate');
    let dateVal = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    let bookedData = getStoredBookings();
    let dayBookings = bookedData[dateVal] || [];

    let now = new Date();
    let todayStr = now.toISOString().split('T')[0];

    slots.forEach(time => {
        let isBooked = dayBookings.some(b => b.time === time);
        let isTooSoon = false;

        if (dateVal === todayStr) {
            let [hours, minutes] = time.split(':').map(Number);
            let slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            let diffHours = (slotDate - now) / (1000 * 60 * 60);
            
            if (diffHours < 3) {
                isTooSoon = true;
            }
        }

        let div = document.createElement('div');
        div.className = 'time-cell';

        if (isBooked) {
            div.className += ' booked';
            div.innerText = `${time}\n(Зайнято)`;
        } else if (isTooSoon) {
            div.className += ' booked';
            div.innerText = `${time}\n(< 3 год)`;
        } else {
            div.innerText = time;
            div.onclick = () => selectTime(time, div);
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
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            resolve('');
            return;
        }
        let file = fileInput.files[0];
        let reader = new FileReader();
        reader.onload = function(e) { resolve(e.target.result); };
        reader.onerror = function() { resolve(''); };
        reader.readAsDataURL(file);
    });
}

function checkIsClientNew(phoneToCheck) {
    let all = getStoredBookings();
    let cleanTargetPhone = phoneToCheck.replace(/[^0-9]/g, '');
    if (cleanTargetPhone.length < 5) return true;
    
    let bookingCount = 0;

    for (let d in all) {
        all[d].forEach(b => {
            let cleanExistingPhone = b.phone ? b.phone.replace(/[^0-9]/g, '') : '';
            if (cleanExistingPhone === cleanTargetPhone && cleanExistingPhone.length > 5) {
                bookingCount++;
            }
        });
    }
    return bookingCount === 0;
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
            
            if (result && result.pageUrl) {
                window.open(result.pageUrl, '_blank');
            } else {
                window.open("https://send.monobank.ua/", '_blank');
            }
        } catch (error) {
            console.error("Помилка еквайрингу:", error);
            window.open("https://send.monobank.ua/", '_blank');
        }

        let confirmPaid = confirm(
            `💳 Після здійснення оплати 500 ₴ поверніться сюди.\n\n` +
            `Ви успішно сплатили завдаток?\n` +
            `Натисніть "OK", щоб завершити запис.`
        );
        
        if (!confirmPaid) {
            alert("Запис не збережено, оскільки оплату не підтверджено.");
            return;
        }
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
        status: 'pending'
    };

    saveBookingToStorage(newBooking);

    if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    let botLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=booking_${newBooking.id}`;
    let successMessage = `Дякуємо, ${name}! Запис на ${date} о ${selectedTimeSlot} успішно збережено!\n\n` +
        (depositPaid ? `✅ Завдаток 500 ₴ сплачено.\n\n` : `ℹ Постійний клієнт (без завдатку).\n\n`) +
        `📱 Зараз ви будете перенаправлені в наш Telegram бот @${TELEGRAM_BOT_USERNAME} для фіксації та нагадувань.`;
    
    alert(successMessage);
    window.open(botLink, '_blank');
}

function getStoredBookings() {
    let data = localStorage.getItem('illiana_bookings');
    return data ? JSON.parse(data) : {};
}

function saveBookingToStorage(booking) {
    let all = getStoredBookings();
    if (!all[booking.date]) all[booking.date] = [];
    all[booking.date].push(booking);
    localStorage.setItem('illiana_bookings', JSON.stringify(all));
}

function openCabinetModal() {
    let cabModal = document.getElementById('cabinetModal');
    if (cabModal) {
        cabModal.style.display = 'flex';
        cabModal.style.opacity = '1';
        cabModal.style.visibility = 'visible';
    }
}

function closeCabinetModal() {
    let cabModal = document.getElementById('cabinetModal');
    if (cabModal) cabModal.style.display = 'none';
}

function forceBypassPin() {
    const loginBox = document.getElementById('masterLoginBox');
    const dashBox = document.getElementById('masterDashboard');
    if (loginBox) loginBox.style.display = 'none';
    if (dashBox) dashBox.style.display = 'flex';
    initCalendar();
    updateDashboardStats();
}

function loginMaster() {
    const pinInput = document.getElementById('masterPinInput');
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

function setCalendarMode(mode) {
    calendarMode = mode;
    initCalendar();
}

function changePeriod(dir) {
    if (calendarMode === 'month') {
        calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + dir);
        let year = calendarCurrentDate.getFullYear();
        let month = String(calendarCurrentDate.getMonth() + 1).padStart(2, '0');
        const statsMonth = document.getElementById('statsMonthInput');
        if (statsMonth) statsMonth.value = `${year}-${month}`;
        updateDashboardStats();
    } else {
        calendarCurrentDate.setDate(calendarCurrentDate.getDate() + (dir * 7));
    }
    initCalendar();
}

function onStatsMonthChange() {
    const statsMonth = document.getElementById('statsMonthInput');
    if (statsMonth && statsMonth.value) {
        let parts = statsMonth.value.split('-');
        let year = parseInt(parts[0]);
        let month = parseInt(parts[1]) - 1;
        calendarCurrentDate = new Date(year, month, 1);
        initCalendar();
        updateDashboardStats();
    }
}

let selectedCalendarDateStr = new Date().toISOString().split('T')[0];

function initCalendar() {
    const container = document.getElementById('calendarGridContainer');
    if (!container) return;
    container.innerHTML = '';

    let year = calendarCurrentDate.getFullYear();
    let month = calendarCurrentDate.getMonth();
    const monthNames = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
    
    const calTitle = document.getElementById('calendarTitle');
    if (calTitle) calTitle.innerText = `${monthNames[month]}${year}`;

    let grid = document.createElement('div');
    grid.className = 'cal-grid';

    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    daysOfWeek.forEach(d => {
        let hd = document.createElement('div');
        hd.className = 'cal-header-day';
        hd.innerText = d;
        grid.appendChild(hd);
    });

    let allBookings = getStoredBookings();
    let blockedDays = getStoredBlockedDays();

    if (calendarMode === 'month') {
        let firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
        let totalDays = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) grid.appendChild(document.createElement('div'));

        for (let day = 1; day <= totalDays; day++) {
            let dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let cell = document.createElement('div');
            cell.className = 'cal-day';
            if (dStr === selectedCalendarDateStr) cell.classList.add('active-booking');
            if (blockedDays.includes(dStr)) cell.classList.add('day-blocked');

            cell.innerHTML = `<span>${day}</span>`;
            if (allBookings[dStr] && allBookings[dStr].length > 0) cell.innerHTML += `<div class="dot"></div>`;

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
    const selDateLabel = document.getElementById('selectedDateLabel');
    if (selDateLabel) selDateLabel.innerText = `Записи на ${dateStr}:`;
    
    const container = document.getElementById('dayBookingsContainer');
    if (!container) return;
    container.innerHTML = '';

    let all = getStoredBookings();
    let dayList = all[dateStr] || [];

    if (dayList.length === 0) {
        container.innerHTML = `<div style="font-size:10px; color:var(--text-muted); padding: 4px;">Немає записів на цей день.</div>`;
        return;
    }

    dayList.forEach((b, idx) => {
        let phoneClean = b.phone ? b.phone.replace(/[^0-9]/g, '') : '';
        let tgLink = `https://t.me/${phoneClean}`;
        let isNew = checkIsClientNew(b.phone);
        
        let clientBadgeHtml = isNew 
            ? `<span style="background: rgba(76, 175, 80, 0.2); color: #4caf50; border: 1px solid #4caf50; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: 700;">✨ Новий клієнт</span>`
            : `<span style="background: rgba(33, 150, 243, 0.2); color: #2196f3; border: 1px solid #2196f3; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: 700;">👤 Постійний</span>`;

        let depositHtml = b.depositPaid 
            ? `<span style="background: rgba(255, 152, 0, 0.2); color: #ff9800; border: 1px solid #ff9800; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: 700;">💳 Завдаток 500 ₴</span>`
            : ``;

        let photosHtml = '';
        if (b.hairPhoto || b.refPhoto) {
            photosHtml = `<div style="display:flex; gap:6px; margin-top:4px;">`;
            if (b.hairPhoto) photosHtml += `<img src="${b.hairPhoto}" class="photo-thumb" onclick="openLightbox('${b.hairPhoto}')" title="Фото волосся клієнта">`;
            if (b.refPhoto) photosHtml += `<img src="${b.refPhoto}" class="photo-thumb" onclick="openLightbox('${b.refPhoto}')" title="Фото референс">`;
            photosHtml += `</div>`;
        }

        let item = document.createElement('div');
        item.className = 'booking-item';
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <b>🕒 ${b.time} — ${b.name}</b>
                <div style="display:flex; gap:4px;">${clientBadgeHtml} ${depositHtml}</div>
            </div>
            <div style="font-size:10px; color:var(--text-main);"><b>Послуга:</b> ${b.service}</div>
            <div style="font-size:10px; color:var(--text-muted);">📞 ${b.phone} | ✉️ ${b.email}</div>
            ${photosHtml}
            <div style="display:flex; gap:6px; margin-top:4px;">
                <a href="${tgLink}" target="_blank" class="social-btn">💬 Написати в Telegram</a>
                <button class="danger-btn" onclick="deleteBooking('${dateStr}', ${idx})">🗑 Видалити</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function deleteBooking(dateStr, idx) {
    if (!confirm("Видалити цей запис?")) return;
    let all = getStoredBookings();
    if (all[dateStr]) {
        all[dateStr].splice(idx, 1);
        if (all[dateStr].length === 0) delete all[dateStr];
        localStorage.setItem('illiana_bookings', JSON.stringify(all));
        initCalendar();
        updateDashboardStats();
    }
}

function getStoredBlockedDays() {
    let data = localStorage.getItem('illiana_blocked_days');
    return data ? JSON.parse(data) : [];
}

function toggleBlockSelectedDate() {
    let blocked = getStoredBlockedDays();
    let idx = blocked.indexOf(selectedCalendarDateStr);
    if (idx > -1) {
        blocked.splice(idx, 1);
        alert(`День ${selectedCalendarDateStr} розблоковано.`);
    } else {
        blocked.push(selectedCalendarDateStr);
        alert(`День ${selectedCalendarDateStr} заблоковано (вихідний).`);
    }
    localStorage.setItem('illiana_blocked_days', JSON.stringify(blocked));
    initCalendar();
}

function getStoredExpenses() {
    let data = localStorage.getItem('illiana_expenses');
    return data ? JSON.parse(data) : [];
}

function saveExpensesToStorage(expenses) {
    localStorage.setItem('illiana_expenses', JSON.stringify(expenses));
}

function loadExpensesFromStorage() {
    renderExpensesList();
}

function addExpense() {
    let nameInput = document.getElementById('expenseNameInput');
    let amountInput = document.getElementById('expenseAmountInput');
    let name = nameInput ? nameInput.value.trim() : '';
    let amount = amountInput ? parseFloat(amountInput.value) : 0;

    if (!name || isNaN(amount) || amount <= 0) {
        alert("Введіть назву витрати та коректну суму!");
        return;
    }

    let expenses = getStoredExpenses();
    expenses.push({
        id: 'exp_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        monthStr: new Date().toISOString().slice(0, 7),
        name: name,
        amount: amount
    });

    saveExpensesToStorage(expenses);
    if (nameInput) nameInput.value = '';
    if (amountInput) amountInput.value = '';
    renderExpensesList();
    updateDashboardStats();
}

function deleteExpense(expId) {
    let expenses = getStoredExpenses();
    let filtered = expenses.filter(e => e.id !== expId);
    saveExpensesToStorage(filtered);
    renderExpensesList();
    updateDashboardStats();
}

function renderExpensesList() {
    const container = document.getElementById('expensesListContainer');
    if (!container) return;
    container.innerHTML = '';

    let expenses = getStoredExpenses();
    const statsMonth = document.getElementById('statsMonthInput');
    let targetMonth = statsMonth ? statsMonth.value : new Date().toISOString().slice(0, 7);

    let monthExpenses = expenses.filter(e => e.monthStr === targetMonth);

    if (monthExpenses.length === 0) {
        container.innerHTML = `<div style="font-size:9px; color:var(--text-muted); text-align:center;">Немає витрат за цей місяць</div>`;
        return;
    }

    monthExpenses.forEach(e => {
        let row = document.createElement('div');
        row.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:var(--card-bg); padding:4px 8px; border-radius:6px; border:1px solid var(--border); font-size:10px;";
        row.innerHTML = `
            <span>${e.name} — <b>${e.amount} ₴</b></span>
            <button onclick="deleteExpense('${e.id}')" style="background:none; border:none; color:var(--accent); cursor:pointer; font-weight:700;">✕</button>
        `;
        container.appendChild(row);
    });
}

function updateDashboardStats() {
    let allBookings = getStoredBookings();
    let expenses = getStoredExpenses();
    const statsMonth = document.getElementById('statsMonthInput');
    let targetMonth = statsMonth ? statsMonth.value : new Date().toISOString().slice(0, 7);

    let totalCompletedIncome = 0;

    for (let d in allBookings) {
        if (d.startsWith(targetMonth)) {
            allBookings[d].forEach(b => {
                let match = b.service.match(/—\s*(\d+)\s*₴/);
                if (match) {
                    totalCompletedIncome += parseInt(match[1]);
                }
            });
        }
    }

    let totalMonthExpenses = expenses
        .filter(e => e.monthStr === targetMonth)
        .reduce((sum, e) => sum + e.amount, 0);

    let netProfit = totalCompletedIncome - totalMonthExpenses;

    const elInc = document.getElementById('statCompleted');
    const elExp = document.getElementById('statExpenses');
    const elNet = document.getElementById('statNetProfit');

    if (elInc) elInc.innerText = `${totalCompletedIncome} ₴`;
    if (elExp) elExp.innerText = `${totalMonthExpenses} ₴`;
    if (elNet) elNet.innerText = `${netProfit} ₴`;
}

function exportToExcel() {
    let allBookings = getStoredBookings();
    let flatData = [];

    for (let d in allBookings) {
        allBookings[d].forEach(b => {
            flatData.push({
                "Дата": b.date,
                "Час": b.time,
                "Ім'я": b.name,
                "Телефон": b.phone,
                "Email": b.email,
                "Соцмережа": b.social,
                "Послуга": b.service,
                "Завдаток": b.depositPaid ? "Сплачено 500 грн" : "Ні"
            });
        });
    }

    if (flatData.length === 0) {
        alert("Немає записів для експорту!");
        return;
    }

    let worksheet = XLSX.utils.json_to_sheet(flatData);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Записи");
    XLSX.writeFile(workbook, "illiana_hair_bookings.xlsx");
}

function importFromExcel(event) {
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

            let allBookings = getStoredBookings();
            let importedCount = 0;

            json.forEach(row => {
                let date = row["Дата"];
                if (!date) return;
                if (!allBookings[date]) allBookings[date] = [];

                allBookings[date].push({
                    id: 'imp_' + Math.random(),
                    date: date,
                    time: row["Час"] || "10:00",
                    name: row["Ім'я"] || "Клієнт",
                    phone: row["Телефон"] || "",
                    email: row["Email"] || "",
                    social: row["Соцмережа"] || "",
                    service: row["Послуга"] || "Стрижка",
                    depositPaid: row["Завдаток"] && row["Завдаток"].includes("Сплачено")
                });
                importedCount++;
            });

            localStorage.setItem('illiana_bookings', JSON.stringify(allBookings));
            initCalendar();
            updateDashboardStats();
            alert(`Успішно імпортовано записів: ${importedCount}!`);
        } catch (err) {
            alert("Помилка при читанні файлу Excel: " + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function updateStudioBackground() {
    let url = prompt("Введіть пряму силку на нове фонове зображення:");
    if (url && url.trim().length > 5) {
        localStorage.setItem('illiana_custom_bg', url.trim());
        const bgImgEl = document.getElementById('bgImageElement');
        if (bgImgEl) bgImgEl.src = url.trim();
        alert("Фон успішно оновлено!");
    }
}

function resetStudioBackground() {
    localStorage.removeItem('illiana_custom_bg');
    const bgImgEl = document.getElementById('bgImageElement');
    if (bgImgEl) bgImgEl.src = "https://i.ibb.co/M5stSykh/photo-2026-09-30-14-50-24.jpg";
    alert("Фон скинуто до стандартного.");
}

function openOffer() {
    const modal = document.getElementById('offerModal');
    if (modal) modal.style.display = 'block';
}

function closeOffer() {
    const modal = document.getElementById('offerModal');
    if (modal) modal.style.display = 'none';
}

function openLightbox(imgUrl) {
    const modal = document.getElementById('imageLightboxModal');
    const img = document.getElementById('lightboxImage');
    if (modal && img) {
        img.src = imgUrl;
        modal.style.display = 'flex';
    }
}

function closeLightbox() {
    const modal = document.getElementById('imageLightboxModal');
    if (modal) modal.style.display = 'none';
}
