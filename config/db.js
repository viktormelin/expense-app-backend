const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.DATABASE_URL);
		console.log(`MongoDB Connected ${conn.connection.host}`);
	} catch (err) {
		console.error(err);
	}
};

module.exports = connectDB;
