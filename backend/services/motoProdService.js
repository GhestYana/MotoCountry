const db = require('../db');

module.exports.getMotorcycles = async (filters) => {
  let query = `
    SELECT p.*, (SELECT ROUND(AVG(rating), 1) FROM product_reviews r WHERE r.motorcycle_id = p.id) as average_rating
    FROM prod_motorcycles p 
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

  if (filters.color) {
    query += ` AND color ILIKE $${index++}`;
    values.push(`%${filters.color}%`);
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

      case 'volume_asc':
        query += ` ORDER BY engine_displacement ASC`;
        break;

      case 'volume_desc':
        query += ` ORDER BY engine_displacement DESC`;
        break;

      case 'year_asc':
        query += ` ORDER BY year ASC`;
        break;
      case 'year_desc':
        query += ` ORDER BY year DESC`;
        break;

      default:
        query += ` ORDER BY id DESC`;
    }
  } else {
    query += ` ORDER BY id DESC`;
  }

  return db.query(query, values);
};

module.exports.getMotorcycleById = async (id) => {
  const query = `
    SELECT p.*, (SELECT ROUND(AVG(rating), 1) FROM product_reviews r WHERE r.motorcycle_id = p.id) as average_rating 
    FROM prod_motorcycles p 
    WHERE p.id = $1
  `;
  return db.query(query, [id]);
};

module.exports.addMotorcycle = async (data) => {
  const { name, price, image, image_small, brand, type, color, engine_displacement, availability, year, description, power, speed, fuel_consumption, tank_capacity, weight, tire_diameter, suspension, brake_system, length, width, height, quantity, rating } = data;
  const query = `
    INSERT INTO prod_motorcycles 
    (name, price, image, image_small, brand, type, color, engine_displacement, availability, year, description, power, speed, fuel_consumption, tank_capacity, weight, tire_diameter, suspension, brake_system, length, width, height, quantity, rating)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
    RETURNING *;
  `;
  const values = [name, price, image, image_small, brand, type, color, engine_displacement, availability, year, description, power, speed, fuel_consumption, tank_capacity, weight, tire_diameter, suspension, brake_system, length, width, height, quantity, rating];
  return db.query(query, values);
};

module.exports.updateMotorcycle = async (id, data) => {
  const { name, price, image, image_small, brand, type, color, engine_displacement, availability, year, description, power, speed, fuel_consumption, tank_capacity, weight, tire_diameter, suspension, brake_system, length, width, height, quantity, rating } = data;
  const query = `
    UPDATE prod_motorcycles 
    SET name = $1, price = $2, image = $3, image_small = $4, brand = $5, type = $6, color = $7, engine_displacement = $8, availability = $9, year = $10, description = $11, power = $12, speed = $13, fuel_consumption = $14, tank_capacity = $15, weight = $16, tire_diameter = $17, suspension = $18, brake_system = $19, length = $20, width = $21, height = $22, quantity = $23, rating = $24
    WHERE id = $25
    RETURNING *;
  `;
  const values = [name, price, image, image_small, brand, type, color, engine_displacement, availability, year, description, power, speed, fuel_consumption, tank_capacity, weight, tire_diameter, suspension, brake_system, length, width, height, quantity, rating, id];
  return db.query(query, values);
};

module.exports.deleteMotorcycle = async (id) => {
  const query = `DELETE FROM prod_motorcycles WHERE id = $1`;
  return db.query(query, [id]);
};