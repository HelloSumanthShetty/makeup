import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import makeupRoutes from './routes/makeupRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.use('/api/makeup', makeupRoutes);

app.get('/', (req, res) => {
    res.send('AI Makeup Server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
