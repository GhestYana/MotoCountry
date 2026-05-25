const db = require('../db');
const imageURL = process.env.HOST


module.exports.getAllProductsService = async (req, res) => {
  try {
    let typeProduct
    if (req.params.typeProduct == 'motorcycles') typeProduct = 'prod_motorcycles'
    if (req.params.typeProduct == 'equipments') typeProduct = 'prod_equipments'
    if (req.params.typeProduct == 'motoComponents') typeProduct = 'prod_components'

    let sql = `SELECT id, name, price, image_small FROM ${typeProduct}`

    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports.getProductService = async (id, res) => {
  try {
    const sql = 'SELECT * FROM prod_motorcycles WHERE id = $1'
    const result = await db.query(sql, [id]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

