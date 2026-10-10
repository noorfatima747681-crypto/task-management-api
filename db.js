import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
user: process.env.DB_USER,
host: process.env.DB_HOST,
database: process.env.DB_NAME,
password: process.env.DB_PASSWORD,
port: Number(process.env.DB_PORT || 5432)
});

pool.query("SELECT NOW()")
.then(() => console.log("Database connected successfully!"))
.catch((error) => {
console.log("Database connection failed:", error.message);
});

export default pool;
