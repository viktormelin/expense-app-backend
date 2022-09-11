const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { errorHandler } = require('./middleware/errorMiddleware');

const port = process.env.PORT || 5000;

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(errorHandler);

app.use('/api/users', require('./routes/userRoutes'));

app.listen(port, () => {
	console.log(`✅ Server running on port ${port}`);
});
