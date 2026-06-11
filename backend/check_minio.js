const Minio = require('minio');
require('dotenv').config({ path: '../.env' });

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET = process.env.MINIO_BUCKET || 'motostore';

const listFiles = async () => {
  try {
    console.log(`Listing files in bucket: ${BUCKET}`);
    const stream = minioClient.listObjects(BUCKET, '', true);
    stream.on('data', obj => console.log(obj.name));
    stream.on('error', err => console.error(err));
    stream.on('end', () => console.log('End of list'));
  } catch (err) {
    console.error(err);
  }
};

listFiles();
