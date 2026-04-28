module.exports.getEquipment = async (filters) => {
  let query = `SELECT * FROM prod_equipment WHERE 1=1`;
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