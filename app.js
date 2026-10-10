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
    },
    en: {
        tab_book: "Booking",
        tab_works: "Portfolio",
        tab_loc: "Location",
        profile_sub: "queer hair stylist • dnipro",
        profile_bio: "don't grow hair — grow individuality",
        step1: "1. Select service category",
        cut_title: "Haircut",
        cut_sub: "1000 ₴ • 1.5 hrs",
        color_title: "Coloring",
        color_sub: "Selection by condition",
        complex_title: "Haircut + Root Coloring",
        complex_sub: "3000 ₴ • 3 hrs (up to 2 cm)",
        haircut_ref_title: "✨ Choose haircut reference (click to select):",
        choose_btn: "Select",
        ref_selected_notice: "✓ Reference photo selected!",
        step2: "2. Select your current hair condition:",
        step3: "3. Available services & length:",
        length_label: "Hair length:",
        len_shoulders: "To shoulders",
        len_blades: "Shoulder to shoulder blades",
        len_below: "Below shoulder blades",
        rules_title: "📌 Important notes & master rules:",
        rule_1: "If your roots are over 2 cm, coloring is considered primary.",
        rule_2: "I do not do blonde techniques (AirTouch, balayage, etc.).",
        rule_3: "I do not do black or red color correction.",
        rule_4: "I do not dye hair after perm, botox, or keratin.",
        photo_current_label: "4. Upload your hair photo:",
        photo_ref_label: "5. Upload reference photo:",
        selected_service_label: "Selected service & time",
        select_service_placeholder: "First select a category above",
        date_label: "Date",
        name_label: "Name",
        name_placeholder: "How to address you",
        phone_label: "Phone",
        email_label: "Email (required)",
        social_label: "Nickname / social",
        slots_label: "Available time slots",
        slot_notice_init: "⚡ <b>Slot status:</b> select service and time.",
        deposit_notice: "⚡ <b>Booking term:</b> <b>500 UAH</b> deposit confirms booking.",
        pay_btn: "Pay deposit 500 ₴ & book",
        modal_title: "Public Offer Agreement",
        modal_btn: "Understood",
        loc_info: "📍 <b>Location:</b> Dnipro, 35-B Volodymyr Vernadskyi St.<br><br>Private space, minimalism and focus on quality.",
        map_btn: "Open in Google Maps"
    }
};

function toggleLang() {
    currentLang = currentLang === 'ua' ? 'en' : 'ua';
    let langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.innerText = currentLang.toUpperCase() + ' / ' + (currentLang === 'ua' ? 'EN' : 'UA');

    // Оновлюємо всі елементи з атрибутом data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        let key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key];
        }
    });

    // Оновлюємо плейсхолдери
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        let key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            el.setAttribute('placeholder', translations[currentLang][key]);
        }
    });
}
