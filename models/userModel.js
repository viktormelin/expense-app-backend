const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	email: { type: String, required: true },
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
	password: { type: String, required: true },
	phone: { type: String, required: true },
	groups: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Groups',
		},
	],
});

module.exports = mongoose.model('Users', userSchema);
