import 'dotenv/config';
import { DataSource } from 'typeorm';

const source = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  entities: ['src/**/*.entity.ts'],
  migrationsTableName: 'migrations',
  migrations: ['src/database/migrations/*.ts'],
});

export default source;
