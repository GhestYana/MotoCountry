const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

module.exports.sendOrderEmail = async (orderData) => {
    const { firstName, lastName, phone, email, city, delivery, address, branch, paymentMethod, comment, totalPrice, items, status } = orderData;

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title || item.model}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">x${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"MotoCountry Store" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // The store's email
        subject: `Нове замовлення від ${firstName} ${lastName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Нове замовлення!</h2>
                
                <section style="margin-bottom: 20px;">
                    <h3 style="background: #f4f4f4; padding: 10px;">Клієнт:</h3>
                    <p><strong>ПІБ:</strong> ${firstName} ${lastName}</p>
                    <p><strong>Телефон:</strong> ${phone}</p>
                    <p><strong>Email:</strong> ${email}</p>
                </section>

                <section style="margin-bottom: 20px;">
                    <h3 style="background: #f4f4f4; padding: 10px;">Доставка та Оплата:</h3>
                    <p><strong>Місто:</strong> ${city}</p>
                    <p><strong>Служба доставки:</strong> ${delivery}</p>
                    <p><strong>Адреса/Відділення:</strong> ${address} ${branch ? `(${branch})` : ''}</p>
                    <p><strong>Метод оплати:</strong> ${paymentMethod === 'card' ? 'Картка (онлайн)' : paymentMethod === 'gpay' ? 'Google Pay' : 'При отриманні (готівка)'}</p>
                    <p><strong>Статус оплати:</strong> <span style="color: ${status === 'paid' ? '#10b981' : '#ef4444'}; font-weight: bold;">${status === 'paid' ? 'ОПЛАЧЕНО' : 'Очікує оплати / При отриманні'}</span></p>
                </section>

                <section style="margin-bottom: 20px;">
                    <h3 style="background: #f4f4f4; padding: 10px;">Замовлені товари:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="text-align: left; background: #eee;">
                                <th style="padding: 10px;">Назва</th>
                                <th style="padding: 10px;">К-сть</th>
                                <th style="padding: 10px;">Ціна</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <p style="text-align: right; font-size: 1.2rem; font-weight: bold; margin-top: 20px;">
                        Всього: <span style="color: #ef4444;">${totalPrice} грн</span>
                    </p>
                </section>

                ${comment ? `
                <section style="margin-bottom: 20px;">
                    <h3 style="background: #f4f4f4; padding: 10px;">Коментар:</h3>
                    <p>${comment}</p>
                </section>
                ` : ''}

                <footer style="margin-top: 40px; font-size: 0.8rem; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
                    Це автоматичне повідомлення від системи MotoCountry.
                </footer>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending order email:', error);
        return false;
    }
};

module.exports.sendStatusUpdateEmail = async (userEmail, orderId, status, items = [], totalPrice = 0) => {
    const statusTranslations = {
        'pending': 'Створено',
        'confirmed': 'Створено',
        'paid': 'Оплачено',
        'sent': 'Відправлено',
        'completed': 'Виконано',
        'collected': 'Зібрано',
        'returned': 'Повернено',
        'cancelled': 'Скасовано'
    };
    const statusText = statusTranslations[status] || status;

    const itemsHtml = items.length > 0 ? `
        <h3 style="color: #333; margin-top: 30px;">Склад замовлення:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="text-align: left; background: #f8f8f8;">
                    <th style="padding: 12px; border-bottom: 2px solid #eee;">Товар</th>
                    <th style="padding: 12px; border-bottom: 2px solid #eee;">К-сть</th>
                    <th style="padding: 12px; border-bottom: 2px solid #eee;">Ціна</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title || item.name}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">x${item.quantity}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price} грн</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold;">Разом:</td>
                    <td style="padding: 15px; font-size: 1.1rem; font-weight: bold; color: #ef4444; border-top: 2px solid #eee;">${totalPrice} грн</td>
                </tr>
            </tfoot>
        </table>
    ` : '';

    const mailOptions = {
        from: `"MotoCountry" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Оновлення статусу замовлення #${orderId.slice(0, 8)}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                <h2 style="color: #ef4444; text-align: center;">MotoCountry</h2>
                <p>Вітаємо!</p>
                <p>Статус вашого замовлення <strong>#${orderId.slice(0, 8)}</strong> було змінено на:</p>
                <div style="background: #f8f8f8; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 1.5rem; font-weight: bold; color: #ef4444; text-transform: uppercase;">
                        ${statusText}
                    </span>
                </div>

                ${itemsHtml}

                <p style="margin-top: 25px;">Ви можете відстежувати статус вашого замовлення в <a href="http://localhost:5173/profile" style="color: #ef4444; text-decoration: none; font-weight: bold;">особистому кабінеті</a>.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 0.9rem; color: #888; text-align: center;">
                    Дякуємо, що обираєте нас!<br>
                    Команда MotoCountry
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Status update email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending status update email:', error);
        return false;
    }
};
module.exports.sendCustomerOrderConfirmation = async (orderData, orderId) => {
    const { firstName, email, city, delivery, address, branch, paymentMethod, totalPrice, items } = orderData;

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title || item.model}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">x${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"MotoCountry" <${process.env.EMAIL_USER}>`,
        to: email, // Customer email
        subject: `Дякуємо за замовлення! #${orderId.slice(0, 8)}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; padding: 25px; border-radius: 12px; background: #fff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #ef4444; margin: 0;">MotoCountry</h1>
                    <p style="color: #888;">Вас вітає магазин мототехніки!</p>
                </div>

                <h2 style="color: #333; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Дякуємо за замовлення, ${firstName}!</h2>
                <p>Ваше замовлення <strong>#${orderId.slice(0, 8)}</strong> успішно прийняте в роботу. Наш менеджер зв'яжеться з вами найближчим часом для підтвердження деталей.</p>

                <div style="background: #fdfdfd; border: 1px solid #f0f0f0; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="margin-top: 0; color: #ef4444; font-size: 1rem; text-transform: uppercase;">Деталі доставки та оплати:</h3>
                    <p style="margin: 5px 0;"><strong>Одержувач:</strong> ${orderData.firstName} ${orderData.lastName}</p>
                    <p style="margin: 5px 0;"><strong>Місто:</strong> ${city}</p>
                    <p style="margin: 5px 0;"><strong>Служба:</strong> ${delivery}</p>
                    <p style="margin: 5px 0;"><strong>Адреса:</strong> ${address} ${branch ? `(${branch})` : ''}</p>
                    <p style="margin: 5px 0;"><strong>Оплата:</strong> ${paymentMethod === 'card' ? 'Картою онлайн' : paymentMethod === 'gpay' ? 'Google Pay' : 'При отриманні'}</p>
                </div>

                <h3 style="color: #333; margin-top: 30px;">Ваше замовлення:</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr style="text-align: left; background: #f8f8f8;">
                            <th style="padding: 12px; border-bottom: 2px solid #eee;">Товар</th>
                            <th style="padding: 12px; border-bottom: 2px solid #eee;">К-сть</th>
                            <th style="padding: 12px; border-bottom: 2px solid #eee;">Ціна</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold;">Разом:</td>
                            <td style="padding: 15px; font-size: 1.2rem; font-weight: bold; color: #ef4444; border-top: 2px solid #eee;">${totalPrice} грн</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="margin-top: 40px; text-align: center; color: #888; font-size: 0.9rem;">
                    <p>Ви завжди можете переглянути статус замовлення в <a href="https://your-domain.com/profile" style="color: #ef4444; text-decoration: none; font-weight: bold;">Особистому кабінеті</a>.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p>З повагою,<br>Команда MotoCountry</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Customer confirmation email sent');
        return true;
    } catch (error) {
        console.error('Error sending customer order email:', error);
        return false;
    }
};
