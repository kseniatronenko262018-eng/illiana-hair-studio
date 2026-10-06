// 1. Завантаження заблокованих днів з сервера при завантаженні сторінки або виборі місяця
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

// Викликайте loadBlockedDays() одразу при завантаженні сторінки (наприклад, у window.onload або на початку скрипта)

// 2. Перевірка, чи заблокований день (щоб клієнт не міг обрати вихідний)
function isDayBlocked(dateString) {
    return blockedDaysCache.includes(dateString);
}

// У вашій функції перевірки слотів часу або вибору дати додайте перевірку:
// if (isDayBlocked(selectedDate)) { alert("Цей день є вихідним у майстра!"); return; }

// 3. Функція блокування/розблокування дня з кабінету майстра
async function toggleBlockSelectedDate() {
    // Отримуємо дату, яку майстер обрав у кабінеті
    const dateInput = document.getElementById('clientDate'); // або інший елемент вибору дати в кабінеті
    if (!dateInput || !dateInput.value) {
        alert("Будь ласка, оберіть дату у календарі!");
        return;
    }
    
    let targetDate = dateInput.value;
    let password = prompt("Введіть PIN-код майстра для зміни статусу дня:");
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
        } else {
            alert(result.error || "Помилка при зміні статусу дня.");
        }
    } catch (e) {
        console.error("Помилка:", e);
        alert("Не вдалося зв'язатися з сервером.");
    }
}
