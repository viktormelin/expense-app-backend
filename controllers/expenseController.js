const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fetchExpense = asyncHandler(async (req, res) => {
	const { expenseId } = req.body;

	if (!expenseId) {
		res.status(400);
		throw new Error('No expense id provided');
	}

	const expense = await prisma.expenses.findFirst({
		where: {
			id: expenseId,
		},
	});

	if (expense) {
		res.status(200).json({
			expense,
		});
	} else {
		res.status(500);
		throw new Error('Could not find expense');
	}
});

const createExpense = asyncHandler(async (req, res) => {
	const { title, description, amount, users } = req.body;
	const { userId } = req.user;

	if (!title || !description || !amount || !users) {
		res.status(400);
		throw new Error('Please provide all required fields');
	}

	const expense = await prisma.expenses.create({
		data: {
			title,
			description,
			group: groupId,
			owner: userId,
			amount,
			users,
		},
	});
});

const handleExpensePayment = asyncHandler(async (req, res) => {
	const { expenseId, amount } = req.body;
	const { userId } = req.user;

	if (!expenseId || !amount) {
		res.status(400);
		throw new Error('Please provide all required fields');
	}

	const expense = await prisma.expenses.findFirst({
		where: {
			id: expenseId,
		},
	});

	expense.users.forEach(async (user) => {
		if (user.user === userId) {
			if (amount === user.amount) {
				print('Hello World');
			} else {
				res.status(418);
				throw new Error('Amount mismatch');
			}
		} else {
			res.status(418);
			throw new Error('User mismatch');
		}
	});
});
