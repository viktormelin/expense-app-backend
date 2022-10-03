const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fetchGroups = asyncHandler(async (req, res) => {
	console.log(req.user);
	const myGroups =
		(await prisma.groups.findMany({
			where: {
				members: {
					has: req.user.id,
				},
			},
		})) ?? [];

	res.status(200).json({
		myGroups,
	});
});

const fetchGroup = asyncHandler(async (req, res) => {
	const { id } = req.body;
	const group = await prisma.groups.findFirst({
		where: { id },
	});

	if (group) {
		res.status(200).json({
			group,
		});
	} else {
		res.status(500);
		throw new Error('Could not find group');
	}
});

const createGroup = asyncHandler(async (req, res) => {
	const { title, users } = req.body;
	const userId = req.user.id;

	if (!title || !users) {
		res.status(400);
		throw new Error('Please provide all required fields');
	}

	let members = [userId];

	users.forEach(async (email) => {
		console.log(email);
		const member = await getUserFromEmail(email);
		console.log(member);
		if (member) {
			members.push(member);
			console.log(members);
		}
	});

	const group = await prisma.groups.create({
		data: {
			title,
			members,
			owner: userId,
			expenses: [],
		},
	});

	if (group) {
		res.status(201).json({
			group,
		});
	} else {
		res.status(500);
		throw new Error('Could not create new group');
	}
});

const deleteGroup = asyncHandler(async (req, res) => {
	const { groupId } = req.body;
	const userId = req.user.id;

	if (!groupId) {
		res.status(400);
		throw new Error('No group id provided');
	}

	const deletedGroup = await prisma.groups.delete({
		where: {
			AND: [{ id: groupId }, { owner: userId }],
		},
	});

	if (deletedGroup) {
		res.status(201);
	} else {
		res.status(500);
		throw new Error('Could not delete group');
	}
});

const getUserFromEmail = async (email) => {
	const user = await prisma.user.findFirst({
		where: {
			email,
		},
	});

	if (user) {
		return user.id;
	} else {
		throw new Error('Could not find user');
	}
};

module.exports = {
	fetchGroups,
	fetchGroup,
	createGroup,
	deleteGroup,
};
