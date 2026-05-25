const express = require('express');
const router = express.Router();
const { upload, uploadToMinio } = require('../config/upload');
const { isClientLogged } = require('../middleware/isClientLogged');

router.post('/', isClientLogged, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не завантажено' });
    }

    const folder = req.query.folder || 'uploads';
    const imageUrl = await uploadToMinio(req.file, folder);

    res.json({ image: imageUrl });
  } catch (err) {
    console.error('[upload] error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
