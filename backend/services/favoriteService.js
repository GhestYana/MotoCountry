const db = require('../db.js');

module.exports.addToFavorites = async (userId, prodId, category) => {

  let column = '';

  if (category === 'motorcycle') column = 'prod_motorcycles_id';
  else if (category === 'equipment') column = 'prod_equipment_id';
  else if (category === 'component') column = 'prod_components_id';
  else throw new Error('Невідома категорія товару');

  const query = `INSERT INTO favorites (user_id, ${column}) VALUES ($1, $2) RETURNING *`;
  const result = await db.query(query, [userId, prodId]);
  return result;
}

module.exports.removeFromFavorites = async (userId, prodId, category) => {
  let column = '';
  if (category === 'motorcycle') column = 'prod_motorcycles_id';
  else if (category === 'equipment') column = 'prod_equipment_id';
  else if (category === 'component') column = 'prod_components_id';
  else throw new Error('Невідома категорія товару');

  const query = `DELETE FROM favorites WHERE user_id = $1 AND ${column} = $2 RETURNING *`;
  const result = await db.query(query, [userId, prodId]);
  return result;
}

module.exports.getFavorites = async (userId) => {
  const query = `
    SELECT 
      f.id as favorite_id,
      'motorcycle' as category,
      m.id as product_id,
      m.name,
      m.price,
      m.image,
      m.brand
    FROM favorites f
    JOIN prod_motorcycles m ON m.id = f.prod_motorcycles_id
    WHERE f.user_id = $1

    UNION ALL

    SELECT 
      f.id as favorite_id,
      'equipment' as category,
      e.id as product_id,
      e.name,
      e.price,
      e.image,
      e.brand
    FROM favorites f
    JOIN prod_equipment e ON e.id = f.prod_equipment_id
    WHERE f.user_id = $1

    UNION ALL

    SELECT 
      f.id as favorite_id,
      'component' as category,
      c.id as product_id,
      c.name,
      c.price,
      c.image,
      c.brand
    FROM favorites f
    JOIN prod_components c ON c.id = f.prod_components_id
    WHERE f.user_id = $1
  `;

  const result = await db.query(query, [userId]);

  return {
    rows: result.rows.map(item => ({
      id: item.product_id,
      favoriteId: item.favorite_id,
      category: item.category,
      name: item.name,
      price: item.price,
      image: item.image,
      brand: item.brand
    }))
  };
};
