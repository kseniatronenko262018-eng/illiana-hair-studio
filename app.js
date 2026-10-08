// Рендеринг слотів часу без зайвого нагадування про 3 години
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

    let currentTotalMinutes = now.getHours() * 60 + now.getMinutes() + 180; // поточний час + 3 години запасу
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
        grid.innerHTML = `<div style="font-size:10px; color:var(--text-muted); text-align:center; padding: 10px;">На цей день немає вільних слотів для запису.</div>`;
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
