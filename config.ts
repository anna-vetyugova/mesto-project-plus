import dotenv from 'dotenv';

dotenv.config();
const { MONGO_URL = 'mongodb://localhost:27017/mestodb', PORT = 3000, JWT_SECRET = 'super-strong-secret' } = process.env;

export const config = {
  MONGO_URL,
  PORT,
  JWT_SECRET
}