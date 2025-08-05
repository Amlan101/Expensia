import {neon} from '@neondatabase/serverless';
import "dotenv/config";

const db = neon(process.env.DATABASE_URL);

export default db;