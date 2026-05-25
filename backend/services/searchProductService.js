const db = require('../db');

module.exports.searchProductService = async (query, filters = {}) => {
  if (!query && Object.keys(filters).length === 0) return [];

  const { brand, minPrice, maxPrice, category, sort } = filters;
  const params = [];
  let paramIdx = 1;

  const buildQuery = (tableName, catName) => {
    let whereClause = `WHERE 1=1 `;
    if (query) {
      whereClause += `AND name ILIKE $${paramIdx++} `;
      params.push(`%${query}%`);
    }
    if (brand) {
      whereClause += `AND brand = $${paramIdx++} `;
      params.push(brand);
    }
    if (minPrice) {
      whereClause += `AND price >= $${paramIdx++} `;
      params.push(minPrice);
    }
    if (maxPrice) {
      whereClause += `AND price <= $${paramIdx++} `;
      params.push(maxPrice);
    }

    return `
      SELECT id, name, price, image, brand, availability, type, '${catName}' AS category,
        (SELECT ROUND(AVG(rating), 1) FROM product_reviews WHERE 
          ${catName === 'motorcycle' ? 'motorcycle_id' : catName === 'equipment' ? 'equipment_id' : 'component_id'} = ${tableName}.id) as average_rating
      FROM ${tableName}
      ${whereClause}
    `;
  };

  let sql = "";
  const queries = [];

  if (!category || category === 'motorcycle') queries.push(buildQuery('prod_motorcycles', 'motorcycle'));
  if (!category || category === 'equipment') queries.push(buildQuery('prod_equipment', 'equipment'));
  if (!category || category === 'component') queries.push(buildQuery('prod_components', 'component'));

  sql = queries.join('\n UNION ALL \n');

  if (sort) {
    if (sort === 'price_asc') sql += ` ORDER BY price ASC`;
    else if (sort === 'price_desc') sql += ` ORDER BY price DESC`;
  }

  const result = await db.query(sql, params);
  return result.rows;
};