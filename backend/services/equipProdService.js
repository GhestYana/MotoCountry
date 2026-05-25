const db = require('../db');

module.exports.getEquipment = async (filters) => {
  let query = `
    SELECT p.*, (SELECT ROUND(AVG(rating), 1) FROM product_reviews r WHERE r.equipment_id = p.id) as average_rating 
    FROM prod_equipment p 
    WHERE 1=1
  `;
  let values = [];
  let index = 1;

  if (filters.brand) {
    query += ` AND brand ILIKE $${index++}`;
    values.push(`%${filters.brand}%`);
  }

  if (filters.color) {
    query += ` AND color = $${index++}`;
    values.push(filters.color);
  }

  if (filters.size) {
    query += ` AND size = $${index++}`;
    values.push(filters.size);
  }

  if (filters.material) {
    query += ` AND material = $${index++}`;
    values.push(filters.material);
  }

  if (filters.type) {
    query += ` AND type = $${index++}`;
    values.push(filters.type);
  }

  if (filters.minPrice) {
    query += ` AND price >= $${index++}`;
    values.push(filters.minPrice);
  }

  if (filters.maxPrice) {
    query += ` AND price <= $${index++}`;
    values.push(filters.maxPrice);
  }

  if (filters.sort) {
    switch (filters.sort) {

      case 'price_asc':
        query += ` ORDER BY price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY price DESC`;
        break;

      default:
        query += ` ORDER BY id DESC`;
    }
  } else {
    query += ` ORDER BY id DESC`;
  }

  return db.query(query, values);
};

module.exports.getEquipmentById = async (id) => {
  const query = `
    SELECT p.*, (SELECT ROUND(AVG(rating), 1) FROM product_reviews r WHERE r.equipment_id = p.id) as average_rating 
    FROM prod_equipment p 
    WHERE p.id = $1
  `;
  return db.query(query, [id]);
};

module.exports.addEquipment = async (data) => {
  const { name, price, image, image_small, brand, type, color, size, material, availability, description, quantity, rating } = data;
  const query = `
    INSERT INTO prod_equipment (name, price, image, image_small, brand, type, color, size, material, availability, description, quantity, rating)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
  `;
  return db.query(query, [name, price, image, image_small, brand, type, color, size, material, availability, description, quantity, rating]);
};

module.exports.updateEquipment = async (id, data) => {
  const { name, price, image, image_small, brand, type, color, size, material, availability, description, quantity, rating } = data;
  const query = `
    UPDATE prod_equipment 
    SET name = $1, price = $2, image = $3, image_small = $4, brand = $5, type = $6, color = $7, size = $8, material = $9, availability = $10, description = $11, quantity = $12, rating = $13
    WHERE id = $14
    RETURNING *;
  `;
  return db.query(query, [name, price, image, image_small, brand, type, color, size, material, availability, description, quantity, rating, id]);
};

module.exports.deleteEquipment = async (id) => {
  const query = `DELETE FROM prod_equipment WHERE id = $1`;
  return db.query(query, [id]);
};