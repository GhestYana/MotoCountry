const db = require('../db');

module.exports.getMotorcycles = async (filters) => {
  let query = `SELECT * FROM prod_motorcycles WHERE 1=1`;
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