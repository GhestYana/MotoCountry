const db = require('../db');

module.exports.getComponents = async (filters) => {
  let query = `
    SELECT p.*, (SELECT ROUND(AVG(rating), 1) FROM product_reviews r WHERE r.component_id = p.id) as average_rating 
    FROM prod_components p 
    WHERE 1=1
  `;
  let values = [];
  let index = 1;

  if (filters.brand) {
    query += ` AND brand ILIKE $${index++}`;
    values.push(`%${filters.brand}%`);
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

module.exports.getComponentById = async (id) => {
  const query = `
    SELECT p.*, (SELECT ROUND(AVG(rating), 1) FROM product_reviews r WHERE r.component_id = p.id) as average_rating 
    FROM prod_components p 
    WHERE p.id = $1
  `;
  return db.query(query, [id]);
};

module.exports.addComponent = async (data) => {
  const { name, price, image, image_small, brand, type, availability, description, quantity, parameters, rating } = data;
  const query = `
    INSERT INTO prod_components (name, price, image, image_small, brand, type, availability, description, quantity, parameters, rating)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;
  return db.query(query, [name, price, image, image_small, brand, type, availability, description, quantity, parameters, rating]);
};

module.exports.updateComponent = async (id, data) => {
  const { name, price, image, image_small, brand, type, availability, description, quantity, parameters, rating } = data;
  const query = `
    UPDATE prod_components 
    SET name = $1, price = $2, image = $3, image_small = $4, brand = $5, type = $6, availability = $7, description = $8, quantity = $9, parameters = $10, rating = $11
    WHERE id = $12
    RETURNING *;
  `;
  return db.query(query, [name, price, image, image_small, brand, type, availability, description, quantity, parameters, rating, id]);
};

module.exports.deleteComponent = async (id) => {
  const query = `DELETE FROM prod_components WHERE id = $1`;
  return db.query(query, [id]);
};