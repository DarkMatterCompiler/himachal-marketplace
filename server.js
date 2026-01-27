import express from 'express';
import { PrismaClient } from '@prisma/client';


const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

app.use(express.json());

app.get('/' , (req , res) => {
    res.send('Welcome to Himachal Marketplace API');
});

app.get('/api/status', async (req, res) => {
    try {
        // Try to count how many users are in the DB (Should be 0 right now)
        const userCount = await prisma.user.count(); 
        res.json({ 
            status: "Database Connected ✅", 
            userCount: userCount 
        });
    } catch (error) {
        res.status(500).json({ error: "Database Connection Failed ❌", details: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});