const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fetchGroups = asyncHandler(async (req, res) => {
	const { userId } = req.user.id;
	const myGroups =
		(await prisma.groups.findMany({
			where: {
				members: {
					has: userId,
				},
			},
		})) ?? [];

	res.status(200).json({
		myGroups,
	});
});

const createGroup = asyncHandler(async (req, res) => {
	const { name, description, users } = req.body;
	const { userId } = req.user.id;

	if (!name || !description || !users) {
		res.status(400);
		throw new Error('Please provide all required fields');
	}

	const members = [userId];

	users.forEach((email) => {
		const member = getUserFromEmail(email);
		members.push(member);
	});

	const group = await prisma.groups.create({
		data: {
			title: name,
			description,
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
	const { userId } = req.user.id;

	if (!groupId) {
		res.status(400);
		throw new Error('No group id provided');
	}

	const deleteGroup = await prisma.groups.delete({
		where: {
			AND: [{ id: groupId }, { owner: userId }],
		},
	});
});
