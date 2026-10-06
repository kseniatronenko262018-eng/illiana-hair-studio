document.addEventListener('DOMContentLoaded', () => {
    // Шукаємо форму або кнопку оплати на сайті
    const payButton = document.getElementById('payButton') || document.querySelector('form');

    if (payButton) {
        payButton.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                // Відправляємо запит на створення інвойсу до server.js
                const response = await fetch('/api/create-invoice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: "Klient",
                        date: "2026-10-06",
                        time: "12:00"
                    })
                });

                const data = await response.json();

                if (data.pageUrl) {
                    // Перенаправляємо на сторінку оплати Monobank
                    window.location.href = data.pageUrl;
                } else {
                    alert('Не вдалося створити платіж.');
                }
            } catch (error) {
                console.error('Помилка:', error);
                alert('Сталася помилка при з'єднанні з сервером.');
            }
        });
    }
});
