import express from 'express';
import dotenv from 'dotenv';
import db from './config/db.js';

dotenv.config();
const app = express();

const PORT = process.env.PORT;

// Middleware to parse JSON requests
app.use(express.json());

async function initializeDatabase(){
    try {
        await db`CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title  VARCHAR(255) NOT NULL,
        amount  DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
      )`;
        
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      process.exit(1);
    }
}

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get("/api/transactions/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if(isNaN(parseInt(userId))) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const transactions = await db `SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get("/api/transactions/summary/:userId", async (req, res) => {
    const { userId } = req.params;
    
    if(isNaN(parseInt(userId))) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    try {

        const balanceResult = await db`
        SELECT COALESCE(SUM(amount), 0) AS balance
        FROM transactions WHERE user_id = ${userId}`
    
        const incomeResult = await db`
        SELECT COALESCE(SUM(amount), 0) AS income
        FROM transactions WHERE user_id = ${userId} AND amount > 0`

        const expenseResult = await db`
        SELECT COALESCE(SUM(amount), 0) AS expenses
        FROM transactions WHERE user_id = ${userId} AND amount < 0`

        res.status(200).json({
            balance: parseFloat(balanceResult[0].balance),
            income: parseFloat(incomeResult[0].income),
            expenses: parseFloat(expenseResult[0].expenses)
        });



    } catch (error) {
        console.error("Error fetching the summary:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.post("/api/transactions", async (req, res) => {
    try {
        // Destructuring the request body
        const { user_id, title, amount, category } = req.body;

        if (!user_id || !title || amount === undefined || !category) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = await db`INSERT INTO transactions (user_id, title, amount, category) 
        VALUES (${user_id}, ${title}, ${amount}, ${category}) 
        RETURNING *`
        console.log(result);
        res.status(201).json(result[0]);
    } catch (error) {
        console.error("Error inserting transaction:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete("/api/transactions/:id", async (req, res) => {
    try {
        const {id} = req.params;

        if(isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        const result = await db`DELETE FROM transactions WHERE id = ${id} RETURNING *`;
        if (result.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    });
});