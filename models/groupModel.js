const mongoose = require('mongoose');

const groupSchema = mongoose.Schema(
	{
		expenses: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Expenses',
			},
		],
		members: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Users',
			},
		],
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Users',
			required: true,
		},
		title: { type: String, required: true },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Groups', groupSchema);
