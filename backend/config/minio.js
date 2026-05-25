const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET = process.env.MINIO_BUCKET || 'motostore';

// Створює бакет якщо не існує і виставляє публічну read-only policy
const ensureBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET);
    if (!exists) {
      await minioClient.makeBucket(BUCKET, 'us-east-1');
      console.log(`[MinIO] Bucket "${BUCKET}" created`);
    }

    // Публічна read-only policy — щоб картинки відкривались за прямим URL
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET}/*`],
        },
      ],
    });
    await minioClient.setBucketPolicy(BUCKET, policy);
    console.log(`[MinIO] Bucket "${BUCKET}" is ready`);
  } catch (err) {
    console.error('[MinIO] ensureBucket error:', err.message);
  }
};

module.exports = { minioClient, BUCKET, ensureBucket };
