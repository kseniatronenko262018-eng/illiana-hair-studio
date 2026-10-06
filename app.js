document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm'); // Замініть на ваш реальний ID форми або кнопки запису

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Отримуємо дані з форми (адаптуйте під ваші поля введення)
            const name = document.getElementById('clientName')?.value || 'Klient';
            const date = document.getElementById('bookingDate')?.value || '2026-10-06';
            const time = document.getElementById('bookingTime')?.value || '12:00';

            try {
                // 1. Створюємо інвойс на бекенді
                const response = await fetch('/api/create-invoice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, date, time })
                });

                const data = await response.json();

                if (data.pageUrl && data.invoiceId) {
                    // Зберігаємо invoiceId в пам'яті браузера для перевірки після повернення
                    localStorage.setItem('currentInvoiceId', data.invoiceId);
                    
                    // Перенаправляємо користувача на сторінку оплати Monobank
                    window.location.href = data.pageUrl;
                } else {
                    alert('Не вдалося створити платіжне посилання.');
                }
            } catch (err) {
                console.error('Помилка:', err);
                let errorMessage = 'Сталася помилка зв’язку з сервером.';
                if (err instanceof Error) {
                    errorMessage += ` Деталі: ${err.message}`;
                }
                alert(errorMessage);
            }
        });
    }

    // 2. Перевірка оплати після повернення клієнта на сайт
    async function verifyPaymentOnReturn() {
        const invoiceId = localStorage.getItem('currentInvoiceId');
        if (!invoiceId) return;

        try {
            const response = await fetch('/api/check-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId })
            });

            const paymentData = await response.json();

            // Статус "success" означає, що кошти успішно сплачено
            if (paymentData.status === 'success') {
                alert('Оплату успішно підтверджено! Ваш запис збережено.');
                localStorage.removeItem('currentInvoiceId');
                // Тут можна додати логіку очищення форми або оновлення сторінки
            } else if (paymentData.status === 'processing' || paymentData.status === 'hold') {
                // Якщо платіж ще в обробці
                console.log('Платіж обробляється...');
            } else {
                // Якщо не сплачено або скасовано
                // alert('Запис не збережено, оскільки оплату не підтверджено.');
                localStorage.removeItem('currentInvoiceId');
            }
        } catch (err) {
            console.error('Помилка перевірки статусу оплати:', err);
        }
    }

    // Викликаємо перевірку при завантаженні сторінки (якщо клієнт повернувся з оплати)
    verifyPaymentOnReturn();
});
