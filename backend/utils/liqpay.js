const crypto = require('crypto');

const signData = (data, privateKey) => {
    const stringToSign = privateKey + data + privateKey;
    return crypto
        .createHash('sha1')
        .update(stringToSign, 'utf8') // Обязательно указываем utf8
        .digest('base64');
};

module.exports.verifyLiqPaySignature = (data, signature) => {
    const privateKey = process.env.LIQPAY_PRIVATE_KEY?.trim();
    if (!privateKey || !data || !signature) return false;
    return signData(data, privateKey) === signature;
};

module.exports.generateLiqPayData = (amount, orderId, description, paytypes = 'card,gpay,apay') => {
    const publicKey = process.env.LIQPAY_PUBLIC_KEY?.trim();
    const privateKey = process.env.LIQPAY_PRIVATE_KEY?.trim();

    if (!publicKey || !privateKey) return null;

    const parsedAmount = Number(parseFloat(amount).toFixed(2));
    if (!parsedAmount || parsedAmount <= 0) return null;

    const isSandboxKey = publicKey.startsWith('sandbox_');
    const useSandbox =
        isSandboxKey ||
        process.env.LIQPAY_SANDBOX === '1' ||
        process.env.LIQPAY_SANDBOX === 'true';

    const params = {
        version: '3',
        public_key: publicKey,
        action: 'pay',
        amount: parsedAmount,
        currency: 'UAH',
        description: String(description).slice(0, 255),
        order_id: `${String(orderId).replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`,
        sandbox: useSandbox ? '1' : '0',
        language: 'uk',
        paytypes: paytypes || 'card,gpay,apay',
    };

    const resultBase = (process.env.LIQPAY_RESULT_URL || process.env.FRONTEND_URL)?.trim();
    const isLocalhost = resultBase && /localhost|127\.0\.0\.1/i.test(resultBase);
    if (resultBase && (!isLocalhost || process.env.LIQPAY_RESULT_URL?.trim())) {
        params.result_url = `${resultBase.replace(/\/$/, '')}/cart-items`;
    }

    // server_url only when explicitly set — LiqPay rejects payments if callback URL is unreachable
    const callbackUrl = process.env.LIQPAY_CALLBACK_URL?.trim();
    if (callbackUrl) {
        params.server_url = callbackUrl;
    }

    const data = Buffer.from(JSON.stringify(params)).toString('base64');
    const signature = signData(data, privateKey);

    return { data, signature };
};
