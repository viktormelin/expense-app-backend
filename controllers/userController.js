const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registerUser = asyncHandler(async (req, res) => {
	const { firstname, lastname, email, phone, password, confirmPassword } =
		req.body;

	console.log(req.body);

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

	const userExist = await prisma.user.findFirst({
		where: { email },
	});

	if (userExist) {
		res.status(400);
		throw new Error('User already exists');
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const user = await prisma.user.create({
		data: {
			firstname,
			lastname,
			email,
			phone,
			password: hashedPassword,
			groups: [],
		},
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

const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

module.exports = {
	registerUser,
};
