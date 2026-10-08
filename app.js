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

// Оновлена логіка дашборду фінансів (Тиждень, Місяць, Рік)
function updateDashboardStats() {
    let periodSelect = document.getElementById('dashboardPeriodSelect');
    let period = periodSelect ? periodSelect.value : 'month';
    
    let statsMonthInput = document.getElementById('statsMonthInput');
    let selectedMonthStr = statsMonthInput ? statsMonthInput.value : ''; // формат YYYY-MM

    let now = new Date();
    let totalCompleted = 0;

    serverBookingsList.forEach(b => {
        if (!b.date) return;
        let bDate = new Date(b.date);
        let amount = 500; // завдаток або повна вартість послуги
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
            includeExp = true; // за замовчуванням для тижня
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
