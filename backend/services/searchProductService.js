const db = require('../db');

module.exports.searchProductService = async (query) => {
  if (!query) return [];

  const sql = `
    SELECT id, name, price, image, brand, availability, 'motorcycle' AS category,
      (SELECT ROUND(AVG(rating), 1) FROM product_reviews WHERE motorcycle_id = prod_motorcycles.id) as average_rating
    FROM prod_motorcycles
    WHERE name ILIKE $1

    UNION ALL

    SELECT id, name, price, image, brand, availability, 'equipment' AS category,
      (SELECT ROUND(AVG(rating), 1) FROM product_reviews WHERE equipment_id = prod_equipment.id) as average_rating
    FROM prod_equipment
    WHERE name ILIKE $1

    UNION ALL

    SELECT id, name, price, image, brand, availability, 'component' AS category,
      (SELECT ROUND(AVG(rating), 1) FROM product_reviews WHERE component_id = prod_components.id) as average_rating
    FROM prod_components
    WHERE name ILIKE $1
  `;

  const result = await db.query(sql, [`%${query}%`]);

  return result.rows;
};