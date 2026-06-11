const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { minioClient, BUCKET } = require('./minio');

// Зберігаємо файл в пам'яті, потім вручну кладемо в MinIO
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Дозволені формати: jpg, jpeg, png, webp, gif'));
    }
  },
});

// Завантажує буфер у MinIO і повертає публічний URL
const uploadToMinio = async (file, folder = 'uploads') => {
  const ext = path.extname(file.originalname).toLowerCase();
  const objectName = `${folder}/${uuidv4()}${ext}`;

  await minioClient.putObject(BUCKET, objectName, file.buffer, file.size, {
    'Content-Type': file.mimetype,
  });

  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  const useSSL = process.env.MINIO_USE_SSL === 'true';
  const protocol = useSSL ? 'https' : 'http';

  const backendHost = process.env.HOST || 'localhost';
  const backendPort = process.env.PORT || '5000';

  // Якщо є публічний URL (наприклад через nginx або ngrok)
  if (process.env.MINIO_PUBLIC_URL) {
    return `${process.env.MINIO_PUBLIC_URL}/${BUCKET}/${objectName}`;
  }

  // Повертаємо URL через наш проксі в index.js
  return `${protocol}://${backendHost}:${backendPort}/api/images/${BUCKET}/${objectName}`;
};

module.exports = { upload, uploadToMinio };
