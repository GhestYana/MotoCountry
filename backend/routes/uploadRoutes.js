const express = require('express');
const router = express.Router();
const upload = require('../config/upload');

router.post('/', upload.single('image'), (req, res) => {
  try {
    const imageUrl = req.file.path;

    res.json({
      image: imageUrl
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;