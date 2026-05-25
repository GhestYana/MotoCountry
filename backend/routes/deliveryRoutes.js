const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const router = express.Router();

const NP_API_KEY = process.env.NP_API_KEY || '';
const MEEST_LOGIN = process.env.MEEST_LOGIN || '';
const MEEST_PASSWORD = process.env.MEEST_PASSWORD || '';
// Тестовий ClientUID від Meest (публічний, для пошуку міст/відділень)
const MEEST_CLIENT_UID = process.env.MEEST_CLIENT_UID || '8458f0b0-930f-11e2-a91e-003048d2b473';
const MEEST_API_URL = 'http://api1c.meest-group.com/services/1C_Query.php';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Meest: будує XML-запит і повертає розпарсений масив
const meestRequest = async (functionName, where = '', order = '') => {
    const login = MEEST_LOGIN;
    const password = MEEST_PASSWORD;
    const sign = crypto.createHash('md5')
        .update(login + password + functionName + where + order)
        .digest('hex');

    const xml = `<?xml version="1.0" encoding="UTF-8"?><param><login>${login}</login><function>${functionName}</function><where>${where}</where><order>${order}</order><sign>${sign}</sign></param>`;

    const response = await axios.post(MEEST_API_URL, xml, {
        headers: { 'Content-Type': 'text/xml' },
        timeout: 8000
    });

    return response.data;
};

// Простий XML-парсер для Meest (без зовнішніх залежностей)
const parseMeestXml = (xml, tagName) => {
    const items = [];
    const itemRegex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`, 'gs');
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
        const block = match[1];
        const getField = (field) => {
            const m = new RegExp(`<${field}>(.*?)<\\/${field}>`, 's').exec(block);
            return m ? m[1].trim() : '';
        };
        items.push({ block, getField });
    }
    return items;
};

// ─── Cities ─────────────────────────────────────────────────────────────────

router.get('/cities', async (req, res) => {
    const { search, service } = req.query;
    if (!search || search.length < 2) return res.json([]);

    try {
        if (service === 'Нова Пошта') {
            const response = await axios.post('https://api.novaposhta.ua/v2.0/json/', {
                apiKey: NP_API_KEY,
                modelName: 'Address',
                calledMethod: 'getCities',
                methodProperties: { FindByString: search, Limit: '15' }
            });
            const data = response.data.data || [];
            return res.json(data.map(c => ({
                id: c.Ref,
                name: c.Description,
                nameRu: c.DescriptionRu
            })));
        }

        if (service === 'Укрпошта') {
            // Публічний API Укрпошти — не потребує авторизації
            const response = await axios.get(
                `https://ukrposhta.ua/api/1.0/addresses/cities?name=${encodeURIComponent(search)}&limit=15`,
                { timeout: 8000 }
            );
            const data = Array.isArray(response.data) ? response.data : (response.data?.Entries?.Entry || []);
            return res.json(data.map(c => ({
                id: String(c.ID || c.id || c.CITY_ID || ''),
                name: c.CITY_UA || c.name || c.Description || '',
                region: c.REGION_UA || ''
            })));
        }

        if (service === 'Meest') {
            if (!MEEST_LOGIN) {
                // Без логіна — повертаємо порожній список, фронт покаже ручний ввід
                return res.json([]);
            }
            const xml = await meestRequest('City', `CITY_UA LIKE '%${search}%'`, 'CITY_UA');
            const items = parseMeestXml(xml, 'City');
            return res.json(items.slice(0, 15).map(item => ({
                id: item.getField('CITY_ID'),
                name: item.getField('CITY_UA'),
                region: item.getField('REGION_UA')
            })));
        }

        // DHL, FedEx — ручний ввід, міста не шукаємо
        return res.json([]);

    } catch (error) {
        console.error(`[delivery/cities] ${service} error:`, error.message);
        res.json([]); // не ламаємо форму, просто порожній список
    }
});

// ─── Branches ───────────────────────────────────────────────────────────────

router.get('/branches', async (req, res) => {
    const { cityRef, service, search = '' } = req.query;

    try {
        if (service === 'Нова Пошта') {
            if (!cityRef) return res.json([]);
            const response = await axios.post('https://api.novaposhta.ua/v2.0/json/', {
                apiKey: NP_API_KEY,
                modelName: 'Address',
                calledMethod: 'getWarehouses',
                methodProperties: {
                    CityRef: cityRef,
                    FindByString: search,
                    Limit: '100'
                }
            });
            const data = response.data.data || [];
            return res.json(data.map(w => ({
                id: w.Ref,
                name: w.Description,
                number: w.Number,
                address: w.ShortAddress
            })));
        }

        if (service === 'Укрпошта') {
            if (!cityRef) return res.json([]);
            // Публічний API Укрпошти — відділення за ID міста
            const response = await axios.get(
                `https://ukrposhta.ua/api/1.0/addresses/postoffices?cityId=${cityRef}&limit=100`,
                { timeout: 8000 }
            );
            const data = Array.isArray(response.data) ? response.data : (response.data?.Entries?.Entry || []);
            return res.json(data.map(p => ({
                id: String(p.ID || p.id || p.POSTOFFICE_ID || ''),
                name: `Відділення №${p.POSTCODE || p.postcode || p.NUMBER || p.id} — ${p.ADDRESS || p.address || ''}`.trim(),
                number: String(p.POSTCODE || p.postcode || p.NUMBER || ''),
                address: p.ADDRESS || p.address || ''
            })));
        }

        if (service === 'Meest') {
            if (!MEEST_LOGIN || !cityRef) return res.json([]);
            const xml = await meestRequest('Branch', `CITY_ID = '${cityRef}'`, 'BRANCH_UA');
            const items = parseMeestXml(xml, 'Branch');
            return res.json(items.map(item => ({
                id: item.getField('BRANCH_ID'),
                name: item.getField('BRANCH_UA'),
                number: item.getField('BRANCH_NUMBER'),
                address: item.getField('ADDRESS_UA')
            })));
        }

        // DHL, FedEx — ручний ввід адреси, відділень немає
        return res.json([]);

    } catch (error) {
        console.error(`[delivery/branches] ${service} error:`, error.message);
        res.json([]);
    }
});

module.exports = router;
