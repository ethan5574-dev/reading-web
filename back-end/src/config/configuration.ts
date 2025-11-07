export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'app_db',
    // TẮT synchronize mặc định, chỉ bật khi DB_SYNC=true trong .env
    synchronize: process.env.DB_SYNC?.toLowerCase() === 'true',
  },
  aws: {
    region: process.env.AWS_REGION ?? 'ap-southeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.S3_BUCKET,
    s3Endpoint: process.env.S3_ENDPOINT,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
  },
});


