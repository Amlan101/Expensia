import express from 'express';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import transactionsRoute from './routes/transactionsRoute.js';

dotenv.config();
const app = express();

const PORT = process.env.PORT;

// Rate Limiter Middleware
app.use(rateLimiter);
// Middleware to parse JSON requests
app.use(express.json());

app.get('/health', (req, res) => {
    res.send('API is running');
})

app.use("/api/transactions", transactionsRoute);

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    });
});