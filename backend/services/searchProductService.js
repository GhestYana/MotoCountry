const db = require('../db');
const { normalizeImage } = require('../utils/imageHelper');

module.exports.searchProductService = async (query, filters = {}) => {
  if (!query && Object.keys(filters).length === 0) return [];

  const { brand, minPrice, maxPrice, category, sort } = filters;

  const conditions = [];
  const values = [];

  if (query) {
    values.push(`%${query}%`);
    conditions.push(`(name ILIKE $${values.length} OR brand ILIKE $${values.length})`);
  }
  if (brand) {
    values.push(`%${brand}%`);
    conditions.push(`brand ILIKE $${values.length}`);
  }
  if (minPrice) {
    values.push(Number(minPrice));
    conditions.push(`price >= $${values.length}`);
  }
  if (maxPrice) {
    values.push(Number(maxPrice));
    conditions.push(`price <= $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const buildSub = (table, cat, reviewCol) => {
    // prod_components має image як text[] (масив), prod_equipment — text з {url1,url2}
    // В обох випадках беремо перший елемент через SQL або повертаємо як є
    const imageExpr = (table === 'prod_components')
      ? `(image)[1]`
      : `image`; // для equipment нормалізуємо в JS після запиту

    return `
      SELECT id, name, price, ${imageExpr} AS image, brand,
             availability::text AS availability,
             type::text AS type,
             '${cat}' AS category,
             (SELECT ROUND(AVG(rating), 1) FROM product_reviews
              WHERE ${reviewCol} = ${table}.id) AS average_rating
      FROM ${table}
      ${where}
    `;
  };

  const parts = [];
  if (!category || category === 'motorcycle')
    parts.push(buildSub('prod_motorcycles', 'motorcycle', 'motorcycle_id'));
  if (!category || category === 'equipment')
    parts.push(buildSub('prod_equipment', 'equipment', 'equipment_id'));
  if (!category || category === 'component')
    parts.push(buildSub('prod_components', 'component', 'component_id'));

  if (parts.length === 0) return [];

  let sql = parts.join('\nUNION ALL\n');

  if (sort === 'price_asc') sql += ' ORDER BY price ASC';
  if (sort === 'price_desc') sql += ' ORDER BY price DESC';

  const result = await db.query(sql, values);
  // Нормалізуємо image для equipment (рядок {url1,url2} → перший url)
  return result.rows.map(row => ({
    ...row,
    image: normalizeImage(row.image),
  }));
};
