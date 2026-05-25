const SCRIPT_URL = 'https://static.liqpay.ua/libjs/checkout.js';

let scriptPromise = null;

const loadLiqPayScript = () => {
    if (window.LiqPayCheckout) return Promise.resolve();

    if (!scriptPromise) {
        scriptPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
            if (existing) {
                if (window.LiqPayCheckout) resolve();
                else existing.addEventListener('load', () => resolve(), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = SCRIPT_URL;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Не вдалося завантажити LiqPay'));
            document.body.appendChild(script);
        });
    }

    return scriptPromise;
};

// Inject CSS that forces the LiqPay popup to be fullscreen
const injectFullscreenStyles = () => {
    const styleId = 'liqpay-fullscreen-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* LiqPay popup overlay */
        #liqpay-checkout,
        .liqpay-checkout,
        [id^="liqpay"],
        [class^="liqpay"] {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            margin: 0 !important;
            border-radius: 0 !important;
            z-index: 999999 !important;
        }
        /* LiqPay background overlay */
        #liqpay-checkout-bg,
        .liqpay-checkout-bg,
        .liqpay-overlay {
            display: none !important;
        }
        /* iframe inside popup */
        #liqpay-checkout iframe,
        .liqpay-checkout iframe,
        [id^="liqpay"] iframe {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
        }
    `;
    document.head.appendChild(style);
};

export const openLiqPayCheckout = ({ data, signature }) =>
    loadLiqPayScript().then(
        () =>
            new Promise((resolve) => {
                injectFullscreenStyles();

                window.LiqPayCheckout.init({
                    data,
                    signature,
                    language: 'uk',
                    mode: 'popup',
                })
                    .on('liqpay.callback', (response) => resolve(response))
                    .on('liqpay.close', () => resolve({ status: 'closed' }));
            })
    );