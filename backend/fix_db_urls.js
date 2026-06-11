const db = require('./db');
require('dotenv').config();

const fixUrls = async () => {
  try {
    console.log('Fixing image URLs in DB...');
    
    // 1. prod_motorcycles (text)
    await db.query(`UPDATE prod_motorcycles SET image = replace(image, 'http://localhost:9000/motostore/', '/api/images/motostore/')`);
    await db.query(`UPDATE prod_motorcycles SET image_small = replace(image_small, 'http://localhost:9000/motostore/', '/api/images/motostore/')`);
    
    // 2. prod_equipment (text)
    await db.query(`UPDATE prod_equipment SET image = replace(image, 'http://localhost:9000/motostore/', '/api/images/motostore/')`);
    
    // 3. prod_components (ARRAY)
    const { rows } = await db.query(`SELECT id, image FROM prod_components`);
    for (const row of rows) {
      if (Array.isArray(row.image)) {
        const newImages = row.image.map(img => img.replace('http://localhost:9000/motostore/', '/api/images/motostore/'));
        await db.query(`UPDATE prod_components SET image = $1 WHERE id = $2`, [newImages, row.id]);
      }
    }
    
    console.log('Successfully updated all URLs!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixUrls();
