const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const Users = require('../models/userModel');

const registerUser = asyncHandler(async (req, res) => {
	const { firstname, lastname, email, phone, password, confirmPassword } =
		req.body;

	if (
		!firstname ||
		!lastname ||
		!email ||
		!phone ||
		!password ||
		!confirmPassword
	) {
		res.status(400);
		throw new Error('Please provide all required fields');
	}

	if (password !== confirmPassword) {
		res.status(400);
		throw new Error('Passwords do not match');
	}

	const userExist = await Users.findOne({
		email,
	});

	if (userExist) {
		res.status(400);
		throw new Error('User already exists');
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const user = await Users.create({
		firstname,
		lastname,
		email,
		phone,
		password: hashedPassword,
		groups: [],
	});

	if (user) {
		res.status(201).json({
			id: user.id,
			firstname: user.firstname,
			lastname: user.lastname,
			email: user.email,
			groups: user.groups,
			phone: user.phone,
			token: generateToken(user.id),
		});
	} else {
		res.status(500);
		throw new Error('Something went wrong');
	}
});

const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	const user = await Users.findOne({
		email,
	});

	console.log(user);

	if (user && (await bcrypt.compare(password, user.password))) {
		res.status(200).json({
			id: user.id,
			firstname: user.firstname,
			lastname: user.lastname,
			email: user.email,
			groups: user.groups,
			phone: user.phone,
			token: generateToken(user.id),
		});
	} else {
		res.status(400);
		throw new Error('Invalid credentials');
	}
});

const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

module.exports = {
	registerUser,
	loginUser,
};
