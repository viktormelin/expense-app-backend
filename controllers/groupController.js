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

	const members = await createMembersArray(userId, users);

	console.log('Created members', members);

	const group = await prisma.groups.create({
		data: {
			title,
			members,
			owner: userId,
			expenses: [],
		},
	});

	console.log('Created group', group);

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

const createMembersArray = async (userId, users) => {
	let tempArr = [];

	if (users) {
		users.forEach(async (email) => {
			const member = await getUserFromEmail(email);
			if (member) {
				tempArr.push(member);
			}
		});

		tempArr.unshift(userId);
		return tempArr;
	} else {
		tempArr.push(userId);
		return tempArr;
	}

	// if (tempArr) {
	// 	return tempArr;
	// } else {
	// 	throw new Error('Could not create user list');
	// }
};

module.exports = {
	fetchGroups,
	fetchGroup,
	createGroup,
	deleteGroup,
};
