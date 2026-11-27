require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
require('./config/redis'); // инициализирует клиент и логирует подключение
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Сервер: http://localhost:${PORT}`));
});