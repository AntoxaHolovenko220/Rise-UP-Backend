import { config } from 'dotenv';
config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/mydb',
  JWT_SECRET: process.env.JWT_SECRET || 'my_secret_key',
  NOVA_POSHTA_API_KEY: process.env.NOVA_POSHTA_API_KEY,
};
