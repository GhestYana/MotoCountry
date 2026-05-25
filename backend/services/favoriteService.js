const db = require('../db.js');

const resolveFavoriteColumn = (category) => {
  const c = String(category || '').toLowerCase();
  if (c === 'motorcycles' || c === 'motorcycle' || c === 'product') return 'prod_motorcycles_id';
  if (c === 'equipment' || c === 'equipments') return 'prod_equipment_id';
  if (c === 'components' || c === 'component' || c === 'accessories') return 'prod_components_id';
  throw new Error('Невідома категорія товару');
};

module.exports.addToFavorites = async (userId, prodId, category) => {
  const column = resolveFavoriteColumn(category);

  const query = `
    INSERT INTO favorites (user_id, ${column}) 
    VALUES ($1, $2) 
    ON CONFLICT (user_id, ${column}) DO NOTHING 
    RETURNING *`;
  const result = await db.query(query, [userId, prodId]);
  return result;
}

module.exports.removeFromFavorites = async (userId, prodId, category) => {
  const column = resolveFavoriteColumn(category);

  const query = `DELETE FROM favorites WHERE user_id = $1 AND ${column} = $2 RETURNING *`;
  const result = await db.query(query, [userId, prodId]);
  return result;
}

module.exports.getFavorites = async (userId) => {
  const query = `
    SELECT 
      f.id::text as favorite_id,
      'motorcycle'::text as category,
      m.id::text as product_id,
      m.name::text as name,
      m.price::text as price,
      m.image::text as image,
      m.brand::text as brand,
      CAST(m.type AS text) as type,
      m.availability::text as availability,
      COALESCE(
        (SELECT ROUND(AVG(rating), 1)::text 
         FROM product_reviews 
         WHERE motorcycle_id = m.id),
        '0'
      )::text as average_rating
    FROM favorites f
    JOIN prod_motorcycles m 
      ON m.id = f.prod_motorcycles_id
    WHERE f.user_id = $1

    UNION ALL

    SELECT 
      f.id::text as favorite_id,
      'equipment'::text as category,
      e.id::text as product_id,
      e.name::text as name,
      e.price::text as price,
      e.image::text as image,
      e.brand::text as brand,
      CAST(e.type AS text) as type,
      e.availability::text as availability,
      COALESCE(
        (SELECT ROUND(AVG(rating), 1)::text 
         FROM product_reviews 
         WHERE equipment_id = e.id),
        '0'
      )::text as average_rating
    FROM favorites f
    JOIN prod_equipment e 
      ON e.id = f.prod_equipment_id
    WHERE f.user_id = $1

    UNION ALL

    SELECT 
      f.id::text as favorite_id,
      'component'::text as category,
      c.id::text as product_id,
      c.name::text as name,
      c.price::text as price,
      c.image::text as image,
      c.brand::text as brand,
      CAST(c.type AS text) as type,
      c.availability::text as availability,
      COALESCE(
        (SELECT ROUND(AVG(rating), 1)::text 
         FROM product_reviews 
         WHERE component_id = c.id),
        '0'
      )::text as average_rating
    FROM favorites f
    JOIN prod_components c 
      ON c.id = f.prod_components_id
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
      brand: item.brand,
      type: item.type,
      availability: item.availability,
      average_rating: item.average_rating
    }))
  };
};

module.exports.getFavoriteById = async (favoriteId) => {
  const query = `
    SELECT 
      f.id::text as favorite_id,
      'motorcycle'::text as category,
      m.id::text as product_id,
      m.name::text,
      m.price::text,
      m.image::text,
      m.brand::text,
      CAST(m.type AS text) as type,
      m.availability::text,
      COALESCE(
        (SELECT ROUND(AVG(rating), 1)::text 
         FROM product_reviews 
         WHERE motorcycle_id = m.id),
        '0'
      ) as average_rating
    FROM favorites f
    JOIN prod_motorcycles m 
      ON m.id = f.prod_motorcycles_id
    WHERE f.id = $1

    UNION ALL

    SELECT 
      f.id::text as favorite_id,
      'equipment'::text as category,
      e.id::text as product_id,
      e.name::text,
      e.price::text,
      e.image::text,
      e.brand::text,
      CAST(e.type AS text) as type,
      e.availability::text,
      COALESCE(
        (SELECT ROUND(AVG(rating), 1)::text 
         FROM product_reviews 
         WHERE equipment_id = e.id),
        '0'
      ) as average_rating
    FROM favorites f
    JOIN prod_equipment e 
      ON e.id = f.prod_equipment_id
    WHERE f.id = $1

    UNION ALL

    SELECT 
      f.id::text as favorite_id,
      'component'::text as category,
      c.id::text as product_id,
      c.name::text,
      c.price::text,
      c.image::text,
      c.brand::text,
      CAST(c.type AS text) as type,
      c.availability::text,
      COALESCE(
        (SELECT ROUND(AVG(rating), 1)::text 
         FROM product_reviews 
         WHERE component_id = c.id),
        '0'
      ) as average_rating
    FROM favorites f
    JOIN prod_components c 
      ON c.id = f.prod_components_id
    WHERE f.id = $1
  `;

  const result = await db.query(query, [favoriteId]);

  return {
    rows: result.rows.map(item => ({
      id: item.product_id,
      favoriteId: item.favorite_id,
      category: item.category,
      name: item.name,
      price: item.price,
      image: item.image,
      brand: item.brand,
      type: item.type,
      availability: item.availability,
      average_rating: item.average_rating
    }))
  };
};
module.exports.updateFavorite = async (favoriteId, updates) => {
  const query = `
    UPDATE favorites 
    SET 
        prod_motorcycles_id = COALESCE($2, prod_motorcycles_id),
        prod_equipment_id = COALESCE($3, prod_equipment_id),
        prod_components_id = COALESCE($4, prod_components_id)
    WHERE id = $1
    RETURNING *`;
  const result = await db.query(query, [favoriteId, updates.prod_motorcycles_id, updates.prod_equipment_id, updates.prod_components_id]);
  return result;
}

